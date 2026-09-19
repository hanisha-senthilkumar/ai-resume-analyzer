import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800"></div>
      </div>
      <div className="w-full h-48 bg-gray-100 dark:bg-slate-800/60 rounded-2xl"></div>
      <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded-xl w-full"></div>
    </div>
  );
};

export const SkeletonMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0"></div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-20"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonWorkspace: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    </div>
  );
};
