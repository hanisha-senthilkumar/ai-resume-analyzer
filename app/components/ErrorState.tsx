import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred while processing your request.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-10 bg-rose-50/70 dark:bg-rose-950/40 backdrop-blur-md rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm max-w-xl mx-auto text-center my-8 animate-in fade-in duration-500">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-rose-950 dark:text-rose-200 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-rose-800 dark:text-rose-300 text-xs font-medium leading-relaxed mb-5">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
