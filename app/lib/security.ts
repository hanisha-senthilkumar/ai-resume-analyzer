/**
 * Security Hardening Utilities — Resumind AI
 * Handles input sanitization, file path safety, PDF magic byte validation, rate limiting, and safe error formatting.
 */

// 1. Input Sanitization (XSS & HTML Injection Prevention)
export function sanitizeInput(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove <iframe> tags
    .replace(/on\w+="[^"]*"/gi, "") // Remove inline event handlers like onclick=""
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "") // Remove javascript: pseudo-protocol
    .trim();
}

// 2. File Path & File Name Sanitization (Path Traversal Prevention)
export function sanitizeFileName(fileName?: string | null): string {
  if (!fileName) return "document.pdf";
  return fileName
    .replace(/[\/\\]/g, "_") // Replace slashes with underscores
    .replace(/\.\.+/g, ".") // Replace path traversal '..'
    .replace(/[^\w\.\-\s]/g, "") // Strip non-alphanumeric special characters
    .trim();
}

// 3. PDF File & Magic Byte Validation
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validatePdfFile(file: File | null): Promise<FileValidationResult> {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  // 1. File Size Check (Max 20MB)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size <= 0) {
    return { isValid: false, error: "File is empty (0 bytes)." };
  }
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: "File size exceeds the 20MB maximum limit." };
  }

  // 2. Extension Check
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { isValid: false, error: "Invalid file extension. Only .pdf files are accepted." };
  }

  // 3. MIME Type Check
  if (file.type && file.type !== "application/pdf") {
    return { isValid: false, error: "Invalid MIME type. File must be application/pdf." };
  }

  // 4. Magic Byte Validation (Read first 5 bytes for %PDF-)
  try {
    const buffer = await file.slice(0, 5).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const headerStr = String.fromCharCode.apply(null, Array.from(bytes));
    if (!headerStr.startsWith("%PDF-")) {
      return { isValid: false, error: "Corrupted or invalid PDF header signature." };
    }
  } catch (err) {
    return { isValid: false, error: "Failed to read PDF file header." };
  }

  return { isValid: true };
}

// 4. Rate Limiter (Token Bucket for AI Calls)
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(actionKey: string, limit = 5, windowMs = 60000): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(actionKey) || [];

  // Filter out timestamps outside the sliding window
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  validTimestamps.push(now);
  rateLimitMap.set(actionKey, validTimestamps);
  return { allowed: true };
}

// 5. Safe Error Formatter (Prevents leaking stack traces or sensitive credentials)
export function sanitizeErrorMessage(err: unknown): string {
  if (typeof err === "string") return sanitizeInput(err);
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    const msg = err.message;
    // Strip raw key patterns if any
    return sanitizeInput(msg.replace(/sk-[a-zA-Z0-9_-]{20,}/g, "[REDACTED]"));
  }
  return "An unexpected error occurred. Please try again.";
}

// 6. Authentication & Authorization Helpers
export function requireAuth(user: { username?: string } | null): boolean {
  return Boolean(user && user.username);
}

export function checkResourceOwnership(resourceUserId: string | undefined, currentUserId: string | undefined): boolean {
  if (!resourceUserId || resourceUserId === "guest_user") return true;
  if (!currentUserId) return false;
  return resourceUserId === currentUserId;
}

// 7. Recursive Payload Sanitization
export function sanitizePayload<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeInput(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(data as Record<string, unknown>)) {
      sanitized[sanitizeInput(key)] = sanitizePayload((data as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }
  return data;
}

// 8. Secret & Key Exposure Guard
export function assertNoExposedSecrets(str?: string): boolean {
  if (!str) return true;
  const secretPattern = /(sk-[a-zA-Z0-9_-]{20,}|bearer\s+[a-zA-Z0-9_\-\.]{20,})/i;
  return !secretPattern.test(str);
}

// 9. Structured Domain Error Catalog & Formatter
export type AppErrorType =
  | "INVALID_PDF"
  | "UNSUPPORTED_FILE"
  | "LARGE_FILE"
  | "AI_API_FAILURE"
  | "DATABASE_FAILURE"
  | "NETWORK_FAILURE"
  | "EMPTY_RESUME"
  | "INVALID_JOB_DESCRIPTION"
  | "UNAUTHORIZED";

const ERROR_MESSAGES: Record<AppErrorType, { title: string; message: string }> = {
  INVALID_PDF: {
    title: "Invalid PDF Document",
    message: "The uploaded file is not a valid PDF or has a corrupted binary header. Please upload an authentic PDF document."
  },
  UNSUPPORTED_FILE: {
    title: "Unsupported File Type",
    message: "Unsupported file format. Resumind only accepts PDF (.pdf) resume files."
  },
  LARGE_FILE: {
    title: "File Size Exceeded",
    message: "File size exceeds the maximum limit of 20MB. Please compress your PDF and try again."
  },
  AI_API_FAILURE: {
    title: "AI Service Unresponsive",
    message: "Our AI Analysis Service is currently busy or unresponsive. Please try submitting again in a moment."
  },
  DATABASE_FAILURE: {
    title: "Storage Error",
    message: "Unable to retrieve or save your resume record. Storage service error."
  },
  NETWORK_FAILURE: {
    title: "Network Connection Error",
    message: "Network connection lost. Please check your internet connection and retry."
  },
  EMPTY_RESUME: {
    title: "Empty Resume Document",
    message: "The uploaded PDF appears to be empty or unreadable (0 bytes). Please select a valid resume document."
  },
  INVALID_JOB_DESCRIPTION: {
    title: "Invalid Job Description",
    message: "The target job description text is too short or contains invalid characters. Please provide at least 20 words for accurate keyword matching."
  },
  UNAUTHORIZED: {
    title: "Authentication Required",
    message: "You must be signed in to perform this action or access this saved analysis."
  }
};

export function formatUserError(type: AppErrorType, customMsg?: string): { title: string; message: string } {
  const config = ERROR_MESSAGES[type] || {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again."
  };

  return {
    title: config.title,
    message: customMsg ? sanitizeInput(customMsg) : config.message
  };
}
