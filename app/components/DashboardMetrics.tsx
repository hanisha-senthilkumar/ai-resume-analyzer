import React from "react";

interface DashboardMetricsProps {
  resumes: Resume[];
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ resumes }) => {
  if (!resumes || resumes.length === 0) return null;

  const total = resumes.length;
  const avgAts = Math.round(
    resumes.reduce((acc, r) => acc + (r.feedback?.overallScore || 0), 0) / total
  );
  const highestAts = Math.max(
    ...resumes.map((r) => r.feedback?.overallScore || 0)
  );

  // Find most frequent job title
  const jobTitleCounts: Record<string, number> = {};
  resumes.forEach((r) => {
    if (r.jobTitle) {
      jobTitleCounts[r.jobTitle] = (jobTitleCounts[r.jobTitle] || 0) + 1;
    }
  });
  const topJobTitle =
    Object.keys(jobTitleCounts).sort(
      (a, b) => jobTitleCounts[b] - jobTitleCounts[a]
    )[0] || "Multiple Roles";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1850px] mb-8 animate-in fade-in duration-700">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Resume Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{avgAts}/100</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${avgAts >= 75 ? 'bg-green-100 text-green-700' : avgAts >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {avgAts >= 75 ? 'Strong' : avgAts >= 50 ? 'Moderate' : 'Needs Focus'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resumes Analyzed</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Target Role</p>
          <p className="text-lg font-bold text-gray-900 truncate" title={topJobTitle}>{topJobTitle}</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Peak Match Score</p>
          <p className="text-2xl font-bold text-emerald-600">{highestAts}/100</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
