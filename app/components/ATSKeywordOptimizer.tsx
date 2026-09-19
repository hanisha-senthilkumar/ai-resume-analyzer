import React, { useState } from 'react';
import { Tag, Check, AlertTriangle } from 'lucide-react';

interface KeywordEntry {
  keyword: string;
  status: "found" | "missing";
  recommendedSection?: string;
}

interface SkillRecommendation {
  skill: string;
  recommendedSection: string;
  rationale?: string;
}

interface ATSKeywordOptimizerData {
  mustHaveKeywords?: KeywordEntry[];
  recommendedKeywords?: KeywordEntry[];
  missingTechnicalSkills?: SkillRecommendation[];
  missingSoftSkills?: SkillRecommendation[];
  industryKeywords?: KeywordEntry[];
}

interface ATSKeywordOptimizerProps {
  data?: ATSKeywordOptimizerData;
  jobTitle?: string;
}

const ATSKeywordOptimizer: React.FC<ATSKeywordOptimizerProps> = ({ data, jobTitle = "Target Position" }) => {
  const [activeCategory, setActiveCategory] = useState<"mustHave" | "recommended" | "techSkills" | "softSkills" | "industry">("mustHave");

  const defaultData: ATSKeywordOptimizerData = {
    mustHaveKeywords: [
      { keyword: "Java", status: "found" },
      { keyword: "React", status: "found" },
      { keyword: "SQL", status: "found" },
      { keyword: "Docker", status: "missing", recommendedSection: "Technical Skills" },
      { keyword: "AWS", status: "missing", recommendedSection: "Technical Skills" },
      { keyword: "Kubernetes", status: "missing", recommendedSection: "Technical Skills" },
      { keyword: "REST API", status: "missing", recommendedSection: "Projects" },
    ],
    recommendedKeywords: [
      { keyword: "TypeScript", status: "found" },
      { keyword: "Git / GitHub", status: "found" },
      { keyword: "CI/CD Pipelines", status: "missing", recommendedSection: "Work Experience" },
      { keyword: "Jest / Unit Testing", status: "missing", recommendedSection: "Projects" },
    ],
    missingTechnicalSkills: [
      { skill: "Docker", recommendedSection: "Technical Skills", rationale: "List under core development tools." },
      { skill: "AWS (S3 / EC2)", recommendedSection: "Technical Skills", rationale: "Include cloud infrastructure proficiency." },
      { skill: "Kubernetes", recommendedSection: "Technical Skills", rationale: "Highlight container orchestration if applicable." },
      { skill: "REST API Architecture", recommendedSection: "Projects", rationale: "Incorporate when detailing API integration accomplishments." },
    ],
    missingSoftSkills: [
      { skill: "Agile Leadership", recommendedSection: "Work Experience", rationale: "Mention leading sprint planning or standups." },
      { skill: "Stakeholder Communication", recommendedSection: "Professional Summary", rationale: "Add to executive summary highlight." },
    ],
    industryKeywords: [
      { keyword: "Microservices Architecture", status: "found" },
      { keyword: "Test-Driven Development (TDD)", status: "missing", recommendedSection: "Work Experience" },
      { keyword: "System Design", status: "missing", recommendedSection: "Summary" },
    ],
  };

  const payload = data || defaultData;

  const mustHave = payload.mustHaveKeywords || defaultData.mustHaveKeywords!;
  const recommended = payload.recommendedKeywords || defaultData.recommendedKeywords!;
  const techSkills = payload.missingTechnicalSkills || defaultData.missingTechnicalSkills!;
  const softSkills = payload.missingSoftSkills || defaultData.missingSoftSkills!;
  const industry = payload.industryKeywords || defaultData.industryKeywords!;

  const foundMustHave = mustHave.filter(k => k.status === "found").length;
  const totalMustHave = mustHave.length;
  const coveragePercent = Math.round((foundMustHave / Math.max(totalMustHave, 1)) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-indigo-600" />
              <span>ATS Keyword Optimizer</span>
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Comprehensive keyword comparison between your resume and target job requirements for <strong>{jobTitle}</strong>.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">Must-Have Match</span>
            <span className="text-xl font-extrabold text-indigo-900">{foundMustHave}/{totalMustHave} ({coveragePercent}%)</span>
          </div>
        </div>
      </div>

      {/* 5-Category Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-gray-50 p-1.5 rounded-xl border border-gray-200">
        <button
          onClick={() => setActiveCategory("mustHave")}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeCategory === "mustHave"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200/60"
          }`}
        >
          Must-Have ({mustHave.length})
        </button>
        <button
          onClick={() => setActiveCategory("recommended")}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeCategory === "recommended"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200/60"
          }`}
        >
          Recommended ({recommended.length})
        </button>
        <button
          onClick={() => setActiveCategory("techSkills")}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeCategory === "techSkills"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200/60"
          }`}
        >
          Missing Tech Skills ({techSkills.length})
        </button>
        <button
          onClick={() => setActiveCategory("softSkills")}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeCategory === "softSkills"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200/60"
          }`}
        >
          Missing Soft Skills ({softSkills.length})
        </button>
        <button
          onClick={() => setActiveCategory("industry")}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeCategory === "industry"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200/60"
          }`}
        >
          Industry Keywords ({industry.length})
        </button>
      </div>

      {/* Category Content Panels */}

      {/* 1. Must-Have Keywords */}
      {activeCategory === "mustHave" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Must-Have Keywords Parsed from Job Description
            </h4>
            <span className="text-xs text-gray-500 font-medium">Critical ATS filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mustHave.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  item.status === "found"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    {item.status === "found" ? (
                      <span className="text-emerald-600 font-black">✓</span>
                    ) : (
                      <span className="text-amber-600 font-black">⚠</span>
                    )}
                    {item.keyword}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    item.status === "found" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.status === "found" ? "Found in Resume" : "Missing"}
                  </span>
                </div>

                {item.status === "missing" && item.recommendedSection && (
                  <div className="mt-1 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 text-xs text-amber-900 font-medium">
                    <span>→ <strong>Recommended Section:</strong></span>
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[11px] font-bold text-amber-950">
                      {item.recommendedSection}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Recommended Keywords */}
      {activeCategory === "recommended" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Recommended High-Value Keywords
            </h4>
            <span className="text-xs text-gray-500 font-medium">Boosts relevance score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommended.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  item.status === "found"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    {item.status === "found" ? (
                      <span className="text-emerald-600 font-black">✓</span>
                    ) : (
                      <span className="text-amber-600 font-black">⚠</span>
                    )}
                    {item.keyword}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    item.status === "found" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.status === "found" ? "Found" : "Missing"}
                  </span>
                </div>

                {item.status === "missing" && item.recommendedSection && (
                  <div className="mt-1 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 text-xs text-amber-900 font-medium">
                    <span>→ <strong>Recommended Section:</strong></span>
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[11px] font-bold text-amber-950">
                      {item.recommendedSection}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Missing Technical Skills */}
      {activeCategory === "techSkills" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Missing Technical Skills & Section Recommendations
            </h4>
            <span className="text-xs text-indigo-600 font-semibold">Strict background relevance check applied</span>
          </div>

          <div className="space-y-3">
            {techSkills.map((item, idx) => (
              <div key={idx} className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                    <span className="text-amber-600 font-black text-lg">⚠</span>
                    {item.skill}
                  </span>
                  <span className="text-xs font-bold bg-amber-200 text-amber-950 px-3 py-1 rounded-full border border-amber-300">
                    Recommended Section: <strong>{item.recommendedSection}</strong>
                  </span>
                </div>
                {item.rationale && (
                  <p className="text-xs text-amber-900 italic bg-white/60 p-2.5 rounded-lg border border-amber-100">
                    💡 <strong>Where to add:</strong> {item.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Missing Soft Skills */}
      {activeCategory === "softSkills" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Missing Soft Skills & Placement Tips
            </h4>
          </div>

          <div className="space-y-3">
            {softSkills.map((item, idx) => (
              <div key={idx} className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                    <span className="text-purple-600 font-black text-lg">💬</span>
                    {item.skill}
                  </span>
                  <span className="text-xs font-bold bg-purple-200 text-purple-950 px-3 py-1 rounded-full border border-purple-300">
                    Recommended Section: <strong>{item.recommendedSection}</strong>
                  </span>
                </div>
                {item.rationale && (
                  <p className="text-xs text-purple-900 italic bg-white/60 p-2.5 rounded-lg border border-purple-100">
                    💡 <strong>Where to add:</strong> {item.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Industry Keywords */}
      {activeCategory === "industry" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Industry Terminology & Methodology Keywords
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {industry.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  item.status === "found"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    {item.status === "found" ? (
                      <span className="text-emerald-600 font-black">✓</span>
                    ) : (
                      <span className="text-amber-600 font-black">⚠</span>
                    )}
                    {item.keyword}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    item.status === "found" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.status === "found" ? "Found" : "Missing"}
                  </span>
                </div>

                {item.status === "missing" && item.recommendedSection && (
                  <div className="mt-1 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 text-xs text-amber-900 font-medium">
                    <span>→ <strong>Recommended Section:</strong></span>
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[11px] font-bold text-amber-950">
                      {item.recommendedSection}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSKeywordOptimizer;
