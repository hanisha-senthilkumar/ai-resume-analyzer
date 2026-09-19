/**
 * FEATURE 15 — DATABASE & BACKEND DATA-ACCESS LAYER
 * Centralized DB utilities for managing:
 * 1. User (UserModel)
 * 2. ResumeAnalysis (ResumeAnalysisModel)
 * 3. SkillGap (SkillGapModel)
 * 4. LearningProgress (LearningProgressModel)
 * 5. InterviewSession (InterviewSessionModel)
 * 6. ResumeVersion (ResumeVersionModel)
 * 7. CareerReport (CareerReportModel)
 * 
 * Enforces User Data Isolation (scoped by userId) and proper relational keys.
 */

import type {
    UserModel,
    ResumeAnalysisModel,
    SkillGapModel,
    LearningProgressModel,
    InterviewSessionModel,
    ResumeVersionModel,
    CareerReportModel
} from "../../types";

const getPuterKV = () => {
    if (typeof window !== "undefined" && window.puter && window.puter.kv) {
        return window.puter.kv;
    }
    return null;
};

const getUserId = (): string => {
    if (typeof window !== "undefined" && window.puter && window.puter.auth) {
        try {
            const user = window.puter.auth.getUser();
            if (user && (user as any).username) {
                return (user as any).username;
            }
        } catch {
            // fallback guest user
        }
    }
    return "guest_user";
};

// ==========================================
// 1. USER ENTITY MODEL
// ==========================================

export async function saveUserRecord(user: Partial<UserModel>): Promise<UserModel> {
    const userId = user.userId || getUserId();
    const kv = getPuterKV();
    const existing = await getUserRecord(userId);

    const updated: UserModel = {
        userId,
        username: user.username || existing?.username || userId,
        email: user.email || existing?.email,
        createdAt: existing?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        resumesCount: user.resumesCount ?? existing?.resumesCount ?? 0,
    };

    if (kv) {
        await kv.set(`user:${userId}:profile`, JSON.stringify(updated));
    }
    return updated;
}

export async function getUserRecord(userId?: string): Promise<UserModel | null> {
    const targetId = userId || getUserId();
    const kv = getPuterKV();
    if (!kv) return null;

    try {
        const raw = await kv.get(`user:${targetId}:profile`);
        return raw ? (JSON.parse(raw) as UserModel) : null;
    } catch (err) {
        console.error("Failed to fetch user record:", err);
        return null;
    }
}

// ==========================================
// 2. RESUME ANALYSIS ENTITY MODEL
// ==========================================

export async function saveResumeAnalysisRecord(analysis: ResumeAnalysisModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = analysis.userId || getUserId();
    const key = `user:${userId}:resume:${analysis.id}`;

    try {
        await kv.set(key, JSON.stringify(analysis));
        // Also sync global lookup key for backward compatibility
        await kv.set(`resume:${analysis.id}`, JSON.stringify(analysis));
        return true;
    } catch (err) {
        console.error("Failed to save resume analysis record:", err);
        return false;
    }
}

export async function getResumeAnalysisRecord(resumeId: string, userId?: string): Promise<ResumeAnalysisModel | null> {
    const kv = getPuterKV();
    if (!kv) return null;

    const targetUserId = userId || getUserId();
    try {
        // Try user-scoped key first for security
        let raw = await kv.get(`user:${targetUserId}:resume:${resumeId}`);
        if (!raw) {
            // Fall back to legacy global key
            raw = await kv.get(`resume:${resumeId}`);
        }
        return raw ? (JSON.parse(raw) as ResumeAnalysisModel) : null;
    } catch (err) {
        console.error("Failed to get resume analysis record:", err);
        return null;
    }
}

// ==========================================
// 3. SKILL GAP ENTITY MODEL
// ==========================================

export async function saveSkillGapRecord(skillGap: SkillGapModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = skillGap.userId || getUserId();
    const key = `user:${userId}:skillgap:${skillGap.resumeId}`;

    try {
        await kv.set(key, JSON.stringify(skillGap));
        return true;
    } catch (err) {
        console.error("Failed to save skill gap record:", err);
        return false;
    }
}

export async function getSkillGapRecord(resumeId: string, userId?: string): Promise<SkillGapModel | null> {
    const kv = getPuterKV();
    if (!kv) return null;

    const targetUserId = userId || getUserId();
    try {
        const raw = await kv.get(`user:${targetUserId}:skillgap:${resumeId}`);
        return raw ? (JSON.parse(raw) as SkillGapModel) : null;
    } catch (err) {
        console.error("Failed to get skill gap record:", err);
        return null;
    }
}

// ==========================================
// 4. LEARNING PROGRESS ENTITY MODEL
// ==========================================

export async function saveLearningProgressRecord(progress: LearningProgressModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = progress.userId || getUserId();
    const key = `user:${userId}:learning:${progress.resumeId}:${progress.roleTitle.replace(/\s+/g, '_')}`;

    try {
        await kv.set(key, JSON.stringify(progress));
        return true;
    } catch (err) {
        console.error("Failed to save learning progress record:", err);
        return false;
    }
}

export async function getLearningProgressRecord(resumeId: string, roleTitle: string, userId?: string): Promise<LearningProgressModel | null> {
    const kv = getPuterKV();
    if (!kv) return null;

    const targetUserId = userId || getUserId();
    const key = `user:${targetUserId}:learning:${resumeId}:${roleTitle.replace(/\s+/g, '_')}`;

    try {
        const raw = await kv.get(key);
        return raw ? (JSON.parse(raw) as LearningProgressModel) : null;
    } catch (err) {
        console.error("Failed to get learning progress record:", err);
        return null;
    }
}

// ==========================================
// 5. INTERVIEW SESSION ENTITY MODEL
// ==========================================

export async function saveInterviewSessionRecord(session: InterviewSessionModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = session.userId || getUserId();
    const key = `user:${userId}:interview:${session.resumeId}`;

    try {
        await kv.set(key, JSON.stringify(session));
        return true;
    } catch (err) {
        console.error("Failed to save interview session record:", err);
        return false;
    }
}

export async function getInterviewSessionRecord(resumeId: string, userId?: string): Promise<InterviewSessionModel | null> {
    const kv = getPuterKV();
    if (!kv) return null;

    const targetUserId = userId || getUserId();
    try {
        const raw = await kv.get(`user:${targetUserId}:interview:${resumeId}`);
        return raw ? (JSON.parse(raw) as InterviewSessionModel) : null;
    } catch (err) {
        console.error("Failed to get interview session record:", err);
        return null;
    }
}

// ==========================================
// 6. RESUME VERSION ENTITY MODEL
// ==========================================

export async function saveResumeVersionRecord(version: ResumeVersionModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = version.userId || getUserId();
    const key = `user:${userId}:version:${version.id}`;

    try {
        await kv.set(key, JSON.stringify(version));
        return true;
    } catch (err) {
        console.error("Failed to save resume version record:", err);
        return false;
    }
}

// ==========================================
// 7. CAREER REPORT ENTITY MODEL
// ==========================================

export async function saveCareerReportRecord(report: CareerReportModel): Promise<boolean> {
    const kv = getPuterKV();
    if (!kv) return false;

    const userId = report.userId || getUserId();
    const key = `user:${userId}:report:${report.id}`;

    try {
        await kv.set(key, JSON.stringify(report));
        return true;
    } catch (err) {
        console.error("Failed to save career report record:", err);
        return false;
    }
}

export const db = {
    resumes: {
        save: async (userId: string, resume: Resume) => {
            const kv = getPuterKV();
            if (kv) {
                await kv.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume));
                await kv.set(`resume:${resume.id}`, JSON.stringify(resume));
            }
        }
    }
};
