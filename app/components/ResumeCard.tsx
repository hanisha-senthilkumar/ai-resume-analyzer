import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface ResumeCardProps {
    resume: Resume;
    onDelete?: (id: string) => void;
}

const ResumeCard = ({ resume, onDelete }: ResumeCardProps) => {
    const { id, companyName, jobTitle, resumeName, feedback, imagePath, resumePath, createdAt, summarySnippet, jobMatchScore } = resume;
    const { fs, kv } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            if (!imagePath) return;
            const blob = await fs.read(imagePath);
            if (!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        };

        loadResume();
    }, [imagePath]);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this resume version history?")) return;

        setIsDeleting(true);
        try {
            await kv.delete(`resume:${id}`);
            if (imagePath) await fs.delete(imagePath);
            if (resumePath) await fs.delete(resumePath);
            if (onDelete) onDelete(id);
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : "Recently added";

    const atsScore = feedback?.ATS?.score || feedback?.overallScore || 80;
    const matchScore = jobMatchScore || feedback?.strengthMetrics?.jobMatchScore || Math.min(100, Math.round(atsScore * 1.05));
    const summary = summarySnippet || feedback?.ATS?.tips?.[0]?.tip || feedback?.content?.tips?.[0]?.tip || "Clean layout with strong technical skills alignment.";
    const versionLabel = resume.versionName || resumeName || (jobTitle ? `Resume — ${jobTitle}` : "Resume V1 — Original");

    const handleDownloadPdf = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.print();
    };

    return (
        <div className="resume-card group relative bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between overflow-hidden">
            <Link to={`/resume/${id}`} className="flex flex-col gap-4">
                {/* Header & Badges */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[11px] font-black rounded-lg uppercase tracking-wider shadow-2xs">
                                {versionLabel}
                            </span>
                            {companyName && (
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-extrabold rounded-lg uppercase tracking-wider truncate max-w-[130px]">
                                    {companyName}
                                </span>
                            )}
                            <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formattedDate}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-md" title="Job Match Score">
                                {matchScore}% Match
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start justify-between gap-3 mt-1">
                        <div>
                            <h2 className="text-base font-black text-gray-900 leading-snug line-clamp-1">
                                {versionLabel}
                            </h2>
                            <p className="text-xs font-bold text-gray-500 line-clamp-1 mt-0.5">
                                Target Role: <span className="text-gray-900 font-extrabold">{jobTitle || "General Technology Role"}</span>
                            </p>
                        </div>
                        <ScoreCircle score={atsScore} />
                    </div>
                </div>

                {/* Resume Image Preview */}
                {resumeUrl ? (
                    <div className="gradient-border group-hover:scale-[1.01] transition-transform duration-300 overflow-hidden rounded-2xl">
                        <div className="w-full h-full bg-gray-50">
                            <img
                                src={resumeUrl}
                                alt="resume preview"
                                className="w-full h-[240px] max-sm:h-[180px] object-cover object-top rounded-xl"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[240px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-semibold">
                        Preview Loading...
                    </div>
                )}

                {/* Analysis Summary Snippet */}
                <div className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl">
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-0.5">
                        ATS Summary Snippet:
                    </p>
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed">
                        "{summary}"
                    </p>
                </div>
            </Link>

            {/* Action Bar: 5 Core Allowed Actions (View, Edit, Download, Compare, Delete) */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2 gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* 1. VIEW */}
                    <Link
                        to={`/resume/${id}`}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold rounded-xl transition-colors flex items-center gap-1"
                        title="View Resume Audit & Preview"
                    >
                        <span>View</span>
                    </Link>

                    {/* 2. EDIT */}
                    <Link
                        to={`/rebuild/${id}`}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-extrabold rounded-xl transition-colors flex items-center gap-1"
                        title="Edit & Rebuild this Version"
                    >
                        <span>Edit</span>
                    </Link>

                    {/* 3. DOWNLOAD */}
                    <button
                        onClick={handleDownloadPdf}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download Clean PDF Resume"
                    >
                        <span>Download</span>
                    </button>

                    {/* 4. COMPARE */}
                    <Link
                        to={`/compare?base=${id}`}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-extrabold rounded-xl transition-colors flex items-center gap-1"
                        title="Compare against another version"
                    >
                        <span>Compare</span>
                    </Link>
                </div>

                {/* 5. DELETE */}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Version"
                >
                    {isDeleting ? (
                        <span className="text-[10px] font-bold text-red-600">...</span>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};
export default ResumeCard

