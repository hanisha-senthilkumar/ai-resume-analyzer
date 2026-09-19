import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';
import { validatePdfFile } from '../lib/security';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setValidationError(null);
        const selectedFile = acceptedFiles[0] || null;

        if (selectedFile) {
            const validation = await validatePdfFile(selectedFile);
            if (!validation.isValid) {
                setValidationError(validation.error || "Invalid file format.");
                onFileSelect?.(null);
                setUploadProgress(0);
                return;
            }

            // Simulate smooth upload progress ring
            setUploadProgress(10);
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 25;
                });
            }, 80);
        } else {
            setUploadProgress(0);
        }
        onFileSelect?.(selectedFile);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;
    const hasError = fileRejections.length > 0;

    return (
        <div className={`w-full rounded-3xl transition-all duration-300 p-1 ${
            isDragActive
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 p-1 shadow-lg ring-4 ring-indigo-500/20"
                : hasError
                ? "bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800"
                : "gradient-border"
        }`}>
            <div
                {...getRootProps()}
                className={`w-full p-6 md:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isDragActive
                        ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/80 scale-[0.99]"
                        : file
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 hover:border-indigo-400 dark:hover:border-indigo-600"
                }`}
            >
                <input {...getInputProps()} />

                <div className="w-full max-w-md flex flex-col items-center gap-3">
                    {file ? (
                        <div className="w-full flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-xs">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg shrink-0">
                                        📄
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                                            {formatSize(file.size)} • PDF Verified
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                    onClick={() => {
                                        setUploadProgress(0);
                                        onFileSelect?.(null);
                                    }}
                                    title="Remove file"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Upload Progress Bar */}
                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl mb-1 shadow-inner">
                                {isDragActive ? "📥" : "📄"}
                            </div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {isDragActive ? "Drop your resume PDF here..." : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                                Supports PDF files up to {formatSize(maxFileSize)}
                            </p>

                            {(hasError || validationError) && (
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                                    ⚠️ {validationError || "Please upload a valid PDF file under 20MB."}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FileUploader
