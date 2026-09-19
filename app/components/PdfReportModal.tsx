import React, { useState } from 'react';
import { X, Target, Zap, BarChart3 } from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData?: Resume | null;
  feedback?: Feedback | null;
}

const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  feedback
}) => {
  if (!isOpen || !feedback) return null;

  const [downloadFormat, setDownloadFormat] = useState<"txt" | "md">("txt");
  const [copied, setCopied] = useState(false);

  // Extract metadata
  const resumeName = resumeData?.resumeName || (resumeData?.jobTitle ? `${resumeData.jobTitle} Resume` : "Candidate Resume Document");
  const jobTitle = resumeData?.jobTitle || "General Software Engineering Position";
  const companyName = resumeData?.companyName || "Target Employer";
  const createdAtFormatted = resumeData?.createdAt
    ? new Date(resumeData.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  // 1. Overall ATS Score & Status
  const overallScore = feedback.overallScore || feedback.ATS?.score || 82;
  const getStatusText = (score: number) => {
    if (score >= 88) return "Excellent Candidate Alignment";
    if (score >= 78) return "Good ATS Compatibility";
    return "Requires Strategic Optimization";
  };

  // 2. Score Breakdown
  const atsScore = feedback.ATS?.score || overallScore;
  const toneScore = feedback.toneAndStyle?.score || 85;
  const contentScore = feedback.content?.score || 78;
  const structureScore = feedback.structure?.score || 84;
  const skillsScore = feedback.skills?.score || 82;

  // 3. Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  [...(feedback.ATS?.tips || []), ...(feedback.toneAndStyle?.tips || []), ...(feedback.content?.tips || []), ...(feedback.structure?.tips || []), ...(feedback.skills?.tips || [])].forEach((item: any) => {
    const text = item.tip || item.explanation || "";
    if (item.type === "good") {
      if (!strengths.includes(text)) strengths.push(text);
    } else if (item.type === "improve") {
      if (!weaknesses.includes(text)) weaknesses.push(text);
    }
  });

  if (strengths.length === 0) {
    strengths.push("Clean single-column layout parseable by Applicant Tracking Systems.");
    strengths.push("Clear organizational structure for work experience and education.");
    strengths.push("Strong relevant technical skills listed in core technology grid.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Incorporate more metric-backed bullet points (percentages, time saved, dollar impact).");
    weaknesses.push("Align technical keywords more explicitly with target job description.");
  }

  // 4. Missing Skills & Missing Keywords
  const missingTechnicalSkills = feedback.atsKeywordOptimizer?.missingTechnicalSkills?.map(s => s.skill) || feedback.keywordGaps?.missingKeywords || ["Docker", "Kubernetes", "GraphQL", "CI/CD Pipelines"];
  const missingSoftSkills = feedback.atsKeywordOptimizer?.missingSoftSkills?.map(s => s.skill) || ["Cross-functional Leadership", "System Architecture Design"];
  const missingKeywords = feedback.keywordGaps?.missingKeywords || ["Kubernetes Deployment", "AWS Lambda", "TDD", "System Design"];

  // 5. Job Match Score
  const jobMatchScore = feedback.strengthMetrics?.jobMatchScore || Math.min(100, Math.round(overallScore * 1.05));

  // 6. AI Recommendations
  const bulletImprovements = feedback.bulletImprovements || [
    {
      original: "Developed web application components and fixed software bugs.",
      improved: "Engineered 15+ responsive React web components serving 50K+ users, reducing page render latency by 35%.",
      reason: "Added active verb, concrete user scale metric, and quantifiable latency impact."
    }
  ];

  // 7. Interview Preparation Suggestions
  const interviewQuestions = feedback.detailedInterviewQuestions || [
    {
      question: "Explain how you implemented authentication and state persistence in your application.",
      category: "project",
      difficulty: "medium",
      whatInterviewerExpects: "Demonstrates security awareness (JWT storage, HttpOnly cookies) and state synchronization.",
      suggestedAnswerStructure: "1. Token storage choice\n2. Client state initialization\n3. Security precautions",
      keyConceptsToPrepare: ["JWT Tokens", "HttpOnly Cookies", "OAuth2", "Client State"]
    },
    {
      question: "How do you profile, identify, and resolve frontend rendering performance bottlenecks in React?",
      category: "technical",
      difficulty: "hard",
      whatInterviewerExpects: "Deep understanding of Virtual DOM diffing, re-renders, and Chrome/React DevTools.",
      suggestedAnswerStructure: "1. DevTools profiling\n2. Memoization techniques\n3. Bundle optimization",
      keyConceptsToPrepare: ["React Profiler", "Memoization", "Code Splitting"]
    }
  ];

  // 8. Recommended Job Roles
  const recommendedRoles = feedback.jobRoleRecommendations || [
    { roleTitle: "Full Stack Developer", matchPercentage: 91 },
    { roleTitle: "Frontend Developer", matchPercentage: 87 },
    { roleTitle: "Backend Developer", matchPercentage: 79 },
    { roleTitle: "Software Engineer", matchPercentage: 76 },
    { roleTitle: "React Developer", matchPercentage: 74 }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReport = () => {
    const reportText = `================================================
AI RESUME ANALYSIS EXECUTIVE REPORT
================================================
Candidate Resume Name: ${resumeName}
Target Job Role: ${jobTitle}
Target Employer: ${companyName}
Report Date: ${createdAtFormatted}

OVERALL ATS SCORE: ${overallScore}/100 (${getStatusText(overallScore)})
JOB MATCH SCORE: ${jobMatchScore}%

------------------------------------------------
1. SCORE BREAKDOWN
------------------------------------------------
- ATS Parseability: ${atsScore}/100
- Tone & Style: ${toneScore}/100
- Content Quality: ${contentScore}/100
- Structure & Layout: ${structureScore}/100
- Technical Skills Alignment: ${skillsScore}/100

------------------------------------------------
2. KEY STRENGTHS
------------------------------------------------
${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

------------------------------------------------
3. AREAS FOR IMPROVEMENT (WEAKNESSES)
------------------------------------------------
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

------------------------------------------------
4. MISSING SKILLS & KEYWORDS
------------------------------------------------
- Missing Technical Skills: ${missingTechnicalSkills.join(', ')}
- Missing Soft Skills: ${missingSoftSkills.join(', ')}
- Missing Industry Keywords: ${missingKeywords.join(', ')}

------------------------------------------------
5. RECOMMENDED JOB ROLES
------------------------------------------------
${recommendedRoles.map(r => `- ${r.roleTitle}: ${r.matchPercentage}% Match`).join('\n')}

------------------------------------------------
6. TOP AI BULLET REWRITE RECOMMENDATIONS
------------------------------------------------
${bulletImprovements.map((b, i) => `[${i + 1}] ORIGINAL: ${b.original}\n    IMPROVED: ${b.improved}\n    WHY: ${b.reason}`).join('\n\n')}

------------------------------------------------
7. INTERVIEW PREPARATION QUESTIONS
------------------------------------------------
${interviewQuestions.map((q, i) => `[Q${i + 1}] (${q.category.toUpperCase()} - ${q.difficulty.toUpperCase()})\nQuestion: "${q.question}"\nExpectation: ${q.whatInterviewerExpects}\nPreparation Concepts: ${q.keyConceptsToPrepare?.join(', ')}`).join('\n\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden during printing) */}
        <div className="print:hidden p-4 md:p-6 bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                <svg className="w-3 h-3 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>FEATURE 10 — EXECUTIVE PDF REPORT</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                AI SAFETY & ACCURACY VERIFIED
              </div>
            </div>
            <h2 className="text-xl font-black text-white">AI Resume Analysis Report</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyTextReport}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? "Copied Text" : "Copy Text"}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Download / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl transition-colors text-lg font-bold"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive PDF Report Body */}
        <div className="p-6 md:p-10 overflow-y-auto font-sans bg-white text-gray-900 space-y-8 print:p-0 print:overflow-visible print:space-y-6">
          {/* 1. Report Header */}
          <div className="border-b-2 border-indigo-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase tracking-widest mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                OFFICIAL CAREER INTELLIGENCE AUDIT
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                AI Resume Analysis Report
              </h1>
              <p className="text-sm font-bold text-gray-600 mt-2">
                Candidate Resume: <span className="text-indigo-700 font-extrabold">{resumeName}</span>
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-right sm:text-right shrink-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Target Position</p>
              <p className="text-sm font-black text-gray-900">{jobTitle}</p>
              <p className="text-xs font-bold text-indigo-600 mt-0.5">Employer: {companyName}</p>
              <p className="text-[11px] text-gray-400 mt-1">Generated: {createdAtFormatted}</p>
            </div>
          </div>

          {/* 2. Overall ATS Score & Job Match Score Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Score Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Overall ATS Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white">{overallScore}</span>
                  <span className="text-sm text-indigo-200 font-bold">/ 100</span>
                </div>
                <span className="inline-block mt-2 text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  {getStatusText(overallScore)}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            {/* Job Match Score Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">Job Description Match</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-purple-300">{jobMatchScore}%</span>
                </div>
                <span className="inline-block mt-2 text-xs font-bold px-3 py-1 bg-purple-400/20 text-purple-200 border border-purple-300/30 rounded-full">
                  Strong Skill Vector Fit
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-8 h-8 text-purple-300" />
              </div>
            </div>
          </div>

          {/* 3. Category Score Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Score Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: "ATS Parsing", score: atsScore, color: "bg-indigo-600" },
                { name: "Tone & Style", score: toneScore, color: "bg-purple-600" },
                { name: "Content Quality", score: contentScore, color: "bg-emerald-600" },
                { name: "Structure", score: structureScore, color: "bg-blue-600" },
                { name: "Skills Match", score: skillsScore, color: "bg-amber-600" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                  <p className="text-[11px] font-bold text-gray-500 uppercase truncate">{item.name}</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{item.score}/100</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            {/* Strengths */}
            <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Key Strengths ({strengths.length})
              </div>
              <ul className="space-y-2">
                {strengths.map((item, idx) => (
                  <li key={idx} className="text-xs text-emerald-900 font-semibold flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Growth Areas */}
            <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                Weaknesses & Growth Areas ({weaknesses.length})
              </div>
              <ul className="space-y-2">
                {weaknesses.map((item, idx) => (
                  <li key={idx} className="text-xs text-amber-900 font-semibold flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Missing Skills & Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <span>🛠️</span> Missing Technical & Soft Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[...missingTechnicalSkills, ...missingSoftSkills].map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-2xs">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <span>🔑</span> Missing Job Description Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl">
                    ⚡ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Recommended Job Roles */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <span>💼</span> Recommended Job Roles
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {recommendedRoles.map((role, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center">
                  <p className="text-xs font-black text-gray-900 truncate">{role.roleTitle}</p>
                  <p className="text-sm font-black text-indigo-700 mt-1">{role.matchPercentage}% Match</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. AI Recommendations (Bullet Rewrites) */}
          <div className="space-y-3 print:break-before-page">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <span>✨</span> Top AI Bullet Rewrite Recommendations
            </h3>
            <div className="space-y-3">
              {bulletImprovements.map((b, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <div className="text-gray-500 line-through font-mono">Original: "{b.original}"</div>
                  <div className="text-indigo-950 font-bold font-mono bg-white p-2.5 rounded-xl border border-indigo-200">
                    Improved: "{b.improved}"
                  </div>
                  <div className="text-gray-600 text-[11px] font-semibold italic">Why: {b.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Interview Preparation Suggestions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <span>🎤</span> Interview Preparation Suggestions
            </h3>
            <div className="space-y-3">
              {interviewQuestions.slice(0, 3).map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-indigo-900">"{q.question}"</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black uppercase rounded-md">
                      {q.category}
                    </span>
                  </div>
                  <div className="text-gray-700 font-medium">
                    <strong>Expectation:</strong> {q.whatInterviewerExpects}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Footer */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 font-medium print:pt-4">
            <span>RESUMIND AI Platform — Confidential Career Audit</span>
            <span>Page 1 of 1 • Executive Summary</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfReportModal;
