import React from "react";
import ScoreCircle from "~/components/ScoreCircle";
import { RefreshCw, Check, AlertTriangle, Tag, Briefcase } from "lucide-react";

interface JobMatcherDashboardProps {
  result: JobMatchResult;
  onReset?: () => void;
}

const JobMatcherDashboard: React.FC<JobMatcherDashboardProps> = ({ result, onReset }) => {
  const matchScore = result.matchScore ?? 82;
  const scoreColor = matchScore >= 75 ? "text-emerald-600" : matchScore >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = matchScore >= 75 ? "bg-emerald-50 border-emerald-200" : matchScore >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Header Match Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-2 z-10 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
            <span className="text-xs font-black tracking-widest uppercase bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/30">
              Resume ↔ Job Description Match
            </span>
            {result.companyName && (
              <span className="text-xs font-bold bg-white/10 text-gray-200 px-3 py-1 rounded-full">
                {result.companyName}
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            {result.jobTitle || "Target Role Analysis"}
          </h2>
          <p className="text-sm text-gray-300 max-w-xl">
            Detailed breakdown of how well your resume matches the job requirements, key skills, and role expectations.
          </p>
        </div>

        <div className="flex items-center gap-6 z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
          <ScoreCircle score={matchScore} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Overall Match</span>
            <span className="text-3xl font-black text-white">{matchScore}%</span>
            <span className="text-xs text-indigo-300 font-medium">
              {matchScore >= 75 ? "Excellent Alignment" : matchScore >= 50 ? "Moderate Alignment" : "Needs Optimization"}
            </span>
          </div>
        </div>
      </div>

      {/* Top Action Controls */}
      {onReset && (
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Another Job Match</span>
          </button>
        </div>
      )}

      {/* Skills Match vs Missing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col gap-4 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <Check className="w-4 h-4 text-emerald-700" />
              </span>
              Matching Skills ({result.matchingSkills?.length || 0})
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Found in Resume
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {result.matchingSkills && result.matchingSkills.length > 0 ? (
              result.matchingSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{skill}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No matching skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 flex flex-col gap-4 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </span>
              Missing Skills ({result.missingSkills?.length || 0})
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Action Required
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {result.missingSkills && result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{skill}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-emerald-600 font-semibold">Great job! All critical skills matched.</p>
            )}
          </div>
        </div>
      </div>

      {/* Keywords Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Tag className="w-5 h-5 text-indigo-600" /> Keyword Density Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Matching Keywords Found</span>
            <div className="flex flex-wrap gap-2">
              {result.matchingKeywords?.map((kw, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-100">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Missing Job Keywords</span>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords?.map((kw, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-lg border border-amber-100">
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Experience & Gap Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relevant Experience Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Relevant Experience Matched
          </h3>

          <div className="flex flex-col gap-3">
            {result.relevantExperience && result.relevantExperience.length > 0 ? (
              result.relevantExperience.map((item, idx) => (
                <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-1.5">
                  <p className="text-sm font-bold text-indigo-950">"{item.highlight}"</p>
                  <p className="text-xs text-indigo-700 font-medium">
                    <strong>Match Impact:</strong> {item.impact}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No specific experience matches identified.</p>
            )}
          </div>
        </div>

        {/* Experience Gaps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span>⚠️ Identified Experience Gaps</span>
          </h3>

          <div className="flex flex-col gap-3">
            {result.experienceGaps && result.experienceGaps.length > 0 ? (
              result.experienceGaps.map((item, idx) => (
                <div key={idx} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col gap-1.5">
                  <p className="text-sm font-bold text-rose-950">"{item.gap}"</p>
                  <p className="text-xs text-rose-700 font-medium">
                    <strong>Recommendation:</strong> {item.recommendation}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-emerald-600 font-semibold">No experience gaps identified for this position!</p>
            )}
          </div>
        </div>
      </div>

      {/* Education Match & Recommendations Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Education Match */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            🎓 Education Match
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              result.educationMatch?.status === "Match" ? "bg-emerald-100 text-emerald-800" :
              result.educationMatch?.status === "Partial" ? "bg-amber-100 text-amber-800" :
              "bg-rose-100 text-rose-800"
            }`}>
              {result.educationMatch?.status || "Match"}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {result.educationMatch?.details || "Educational history meets minimum requirements."}
          </p>
        </div>

        {/* Recommended Improvements */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span>🚀 Recommended Optimization Steps</span>
          </h3>
          <ul className="space-y-2">
            {result.recommendedImprovements?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobMatcherDashboard;
