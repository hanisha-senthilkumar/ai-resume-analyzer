import React from "react";
import { Link } from "react-router";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "Get started by uploading your resume or choosing an action.",
  actionText = "Upload Resume",
  actionLink = "/upload",
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto text-center my-8 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-4 shadow-inner">
        {icon ? (
          <div>{icon}</div>
        ) : (
          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed mb-6">
        {description}
      </p>
      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
