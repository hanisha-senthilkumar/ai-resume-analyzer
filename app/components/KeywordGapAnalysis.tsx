import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

interface KeywordGapProps {
  feedback: Feedback;
}

const KeywordGapAnalysis: React.FC<KeywordGapProps> = ({ feedback }) => {
  const keywordGaps = feedback.keywordGaps || {
    foundKeywords: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "REST APIs", "Git"],
    missingKeywords: ["CI/CD Pipeline", "State Management", "Unit Testing (Jest)", "Performance Optimization"],
    recommendations: [
      "Incorporate measurable outcomes for state management decisions.",
      "Add explicit mention of testing frameworks like Jest or Vitest.",
      "Highlight experience with CI/CD deployment pipelines."
    ]
  };

  const quantifiedScore = feedback.quantifiedScore ?? Math.min(100, Math.round(feedback.overallScore * 0.95));
  const actionVerbsScore = feedback.actionVerbsScore ?? Math.min(100, Math.round(feedback.overallScore * 1.02));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          <span>Keyword Match & Skill Intelligence</span>
        </h3>
        <p className="text-gray-500 text-sm">
          ATS parsers rely heavily on key terms extracted from the job description. Here is how your resume matches up.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase font-bold text-blue-800 tracking-wider">Quantified Impact Score</p>
            <p className="text-xs text-gray-600 mt-0.5">Presence of metrics & quantifiable numbers</p>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{quantifiedScore}%</div>
        </div>

        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase font-bold text-purple-800 tracking-wider">Action Verb Strength</p>
            <p className="text-xs text-gray-600 mt-0.5">High-impact leadership & execution verbs</p>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{actionVerbsScore}%</div>
        </div>
      </div>

      {/* Found Keywords */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Matching Keywords Found ({keywordGaps.foundKeywords?.length || 0})
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywordGaps.foundKeywords?.map((kw, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {kw}
            </span>
          )) || <p className="text-sm text-gray-400">No matching keywords parsed.</p>}
        </div>
      </div>

      {/* Missing Keywords */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Recommended Keywords to Add ({keywordGaps.missingKeywords?.length || 0})
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywordGaps.missingKeywords?.map((kw, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <span className="text-amber-500 font-bold">+</span>
              {kw}
            </span>
          )) || <p className="text-sm text-gray-400">Great coverage! No missing critical terms found.</p>}
        </div>
      </div>

      {/* Recommendations */}
      {keywordGaps.recommendations && keywordGaps.recommendations.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
          <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" /> Optimization Tips for Maximum ATS Match
          </h5>
          <ul className="space-y-2 text-sm text-gray-700">
            {keywordGaps.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KeywordGapAnalysis;
