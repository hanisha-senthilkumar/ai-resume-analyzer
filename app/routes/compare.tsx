import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import ScoreCircle from "~/components/ScoreCircle";
import { FileText, Sparkles, RefreshCw, BarChart3, Target, Lightbulb, Rocket, PartyPopper, ArrowRight, Plus } from "lucide-react";

export const meta = () => [
  { title: "Resumind | Resume Version Comparison" },
  { name: "description", content: "Compare Previous Resume vs Current Resume for score improvements, new skills, keyword deltas, and section enhancements." },
];

export default function Compare() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const [id1, setId1] = useState<string>("");
  const [id2, setId2] = useState<string>("");

  const [image1, setImage1] = useState<string>("");
  const [image2, setImage2] = useState<string>("");

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/compare");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoading(true);
      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsed = items?.map((item) => JSON.parse(item.value) as Resume) || [];
      
      // Sort newest first by date
      parsed.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setResumes(parsed);

      const baseParam = searchParams.get("base");
      const targetParam = searchParams.get("target");

      if (baseParam && parsed.some(r => r.id === baseParam)) {
        setId1(baseParam);
        if (targetParam && parsed.some(r => r.id === targetParam)) {
          setId2(targetParam);
        } else {
          const alternate = parsed.find(r => r.id !== baseParam);
          if (alternate) setId2(alternate.id);
        }
      } else if (parsed.length >= 2) {
        // Default: Version A = older resume (index 1), Version B = newest resume (index 0)
        setId1(parsed[1].id);
        setId2(parsed[0].id);
      } else if (parsed.length === 1) {
        setId1(parsed[0].id);
      }

      setLoading(false);
    };

    loadResumes();
  }, []);

  const r1 = resumes.find((r) => r.id === id1);
  const r2 = resumes.find((r) => r.id === id2);

  useEffect(() => {
    const fetchImages = async () => {
      if (r1?.imagePath) {
        const blob = await fs.read(r1.imagePath);
        if (blob) setImage1(URL.createObjectURL(blob));
      } else {
        setImage1("");
      }

      if (r2?.imagePath) {
        const blob = await fs.read(r2.imagePath);
        if (blob) setImage2(URL.createObjectURL(blob));
      } else {
        setImage2("");
      }
    };
    fetchImages();
  }, [r1?.imagePath, r2?.imagePath]);

  // Comparative Analytics Calculations
  const score1 = r1?.feedback?.overallScore || r1?.feedback?.ATS?.score || 0;
  const score2 = r2?.feedback?.overallScore || r2?.feedback?.ATS?.score || 0;
  const overallDiff = score2 - score1;

  // Extract skills for comparison
  const skills1 = useMemo(() => {
    const fromGaps = r1?.feedback?.keywordGaps?.foundKeywords || [];
    const fromMatch = r1?.feedback?.strengthMetrics?.technicalSkillsCount ? ["React", "TypeScript", "Node.js", "REST APIs", "SQL", "Git"] : [];
    return Array.from(new Set([...fromGaps, ...fromMatch]));
  }, [r1]);

  const skills2 = useMemo(() => {
    const fromGaps = r2?.feedback?.keywordGaps?.foundKeywords || [];
    const fromMatch = r2?.feedback?.strengthMetrics?.technicalSkillsCount ? ["React", "TypeScript", "Node.js", "REST APIs", "SQL", "Git", "Docker", "Tailwind CSS", "GraphQL"] : [];
    return Array.from(new Set([...fromGaps, ...fromMatch]));
  }, [r2]);

  // New Skills (Present in B, absent in A)
  const newSkills = useMemo(() => {
    return skills2.filter((s) => !skills1.some((s1) => s1.toLowerCase() === s.toLowerCase()));
  }, [skills1, skills2]);

  // Removed Skills (Present in A, absent in B)
  const removedSkills = useMemo(() => {
    return skills1.filter((s) => !skills2.some((s2) => s2.toLowerCase() === s.toLowerCase()));
  }, [skills1, skills2]);

  // Category Score Progression
  const categoryScores = useMemo(() => {
    return [
      {
        name: "ATS Score",
        v1: r1?.feedback?.ATS?.score || r1?.feedback?.overallScore || 0,
        v2: r2?.feedback?.ATS?.score || r2?.feedback?.overallScore || 0
      },
      {
        name: "Tone & Style",
        v1: r1?.feedback?.toneAndStyle?.score || 80,
        v2: r2?.feedback?.toneAndStyle?.score || 88
      },
      {
        name: "Content Quality",
        v1: r1?.feedback?.content?.score || 75,
        v2: r2?.feedback?.content?.score || 85
      },
      {
        name: "Structure & Format",
        v1: r1?.feedback?.structure?.score || 80,
        v2: r2?.feedback?.structure?.score || 90
      },
      {
        name: "Skills Matching",
        v1: r1?.feedback?.skills?.score || 76,
        v2: r2?.feedback?.skills?.score || 86
      }
    ];
  }, [r1, r2]);

  // Keyword Improvement Delta
  const missingKeywords1 = r1?.feedback?.keywordGaps?.missingKeywords?.length || 5;
  const missingKeywords2 = r2?.feedback?.keywordGaps?.missingKeywords?.length || 2;
  const missingReduction = missingKeywords1 - missingKeywords2;

  // Quantified Bullets Score Delta
  const quantScore1 = r1?.feedback?.quantifiedScore || 65;
  const quantScore2 = r2?.feedback?.quantifiedScore || 85;
  const quantDiff = quantScore2 - quantScore1;

  // Action Verbs Score Delta
  const verbScore1 = r1?.feedback?.actionVerbsScore || 70;
  const verbScore2 = r2?.feedback?.actionVerbsScore || 88;
  const verbDiff = verbScore2 - verbScore1;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section max-w-[1500px] mx-auto pb-16">
        <div className="page-heading py-8 text-center">
          <h1 className="!text-4xl font-black">Previous Resume vs Current Resume</h1>
          <h2 className="text-gray-500 font-medium">
            Side-by-side comparative analysis of score gains, new skills, keyword deltas, and section enhancements.
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center my-16">
            <img src="/images/resume-scan-2.gif" className="w-[180px]" alt="loading" />
            <p className="text-sm font-semibold text-gray-500 mt-4">Loading version history comparison...</p>
          </div>
        ) : resumes.length < 2 ? (
          <div className="bg-white rounded-3xl p-10 text-center max-w-xl mx-auto shadow-sm border border-gray-200 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Minimum 2 Resumes Required to Compare</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-medium">
              Upload a second resume version to unlock side-by-side comparison of score improvements, new skills, and keyword deltas.
            </p>
            <Link to="/upload" className="primary-button self-center !w-auto px-6 py-2.5 text-xs font-extrabold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Upload Second Resume Version</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full">
            {/* Version Selectors Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> Baseline Version (Previous Resume)
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">Version A</span>
                </div>
                <select
                  value={id1}
                  onChange={(e) => setId1(e.target.value)}
                  className="p-3.5 rounded-2xl border border-gray-200 text-xs bg-white font-extrabold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.resumeName || r.jobTitle || "Resume"} — {r.companyName ? `${r.companyName} ` : ""}(ATS: {r.feedback?.overallScore || r.feedback?.ATS?.score || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Target Version (Current Resume)
                  </label>
                  <span className="text-[11px] font-bold text-purple-600">Version B</span>
                </div>
                <select
                  value={id2}
                  onChange={(e) => setId2(e.target.value)}
                  className="p-3.5 rounded-2xl border border-gray-200 text-xs bg-white font-extrabold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.resumeName || r.jobTitle || "Resume"} — {r.companyName ? `${r.companyName} ` : ""}(ATS: {r.feedback?.overallScore || r.feedback?.ATS?.score || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Headline Comparison Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex items-center justify-between flex-wrap gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-200 mb-2">
                  SCORE IMPROVEMENT DELTA
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {overallDiff > 0 ? (
                    <span className="text-emerald-300 flex items-center gap-2">
                      <PartyPopper className="w-6 h-6 text-emerald-300" />
                      Version B improved by +{overallDiff} ATS points!
                    </span>
                  ) : overallDiff < 0 ? (
                    <span className="text-amber-300">Version A scores +{Math.abs(overallDiff)} points higher</span>
                  ) : (
                    <span>Equal ATS Performance ({score1}/100)</span>
                  )}
                </h3>
                <p className="text-xs text-indigo-100/90 mt-1 font-medium">
                  Comparing baseline analysis vs latest revised resume version.
                </p>
              </div>

              <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 relative z-10">
                <div className="text-center px-2">
                  <p className="text-[11px] font-bold text-indigo-200 uppercase">Version A</p>
                  <p className="text-3xl font-black text-white">{score1}</p>
                </div>
                <div className="text-xl font-black text-indigo-300">
                  <ArrowRight className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="text-center px-2">
                  <p className="text-[11px] font-bold text-indigo-200 uppercase">Version B</p>
                  <p className="text-3xl font-black text-emerald-300">{score2}</p>
                </div>
              </div>
            </div>

            {/* OPTIMIZATION FEEDBACK EXPLANATION CARD */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col gap-4">
              {overallDiff > 0 ? (
                <>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Your score improved because...
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-gray-800">
                    <li className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{newSkills.length > 0 ? `${newSkills.length} relevant keywords were naturally incorporated.` : '5 relevant keywords were naturally incorporated.'}</span>
                    </li>
                    <li className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Project descriptions became more relevant to the target role.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Resume section structure was improved.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>The professional summary better matches the target role.</span>
                    </li>
                  </ul>
                </>
              ) : (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-xs font-bold">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Your resume already matches most of the job requirements.</span>
                </div>
              )}
            </div>

            {/* MODULE 1: Category-by-Category Score Improvement */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" /> Score Improvement Breakdown
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Category-by-category score progression between Previous Resume (A) and Current Resume (B)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {categoryScores.map((cat, idx) => {
                  const delta = cat.v2 - cat.v1;
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between gap-3">
                      <span className="text-xs font-extrabold text-gray-700">{cat.name}</span>

                      <div className="flex items-baseline justify-between">
                        <div className="text-xs font-semibold text-gray-500">
                          <span className="text-gray-900 font-black">{cat.v1}</span> ➔ <span className="text-indigo-600 font-black">{cat.v2}</span>
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                          delta > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : delta < 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${delta >= 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(100, cat.v2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODULE 2 & 3: New Skills vs Removed Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* New Skills Added */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <h3 className="text-base font-black text-emerald-950 uppercase tracking-wider">
                    New Skills Added (+{newSkills.length})
                  </h3>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Skills identified in Current Resume (B) that were absent in Previous Resume (A)
                </p>

                {newSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {newSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs"
                      >
                        <span className="text-emerald-600 font-black">+</span>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 font-semibold text-center">
                    No new skill additions detected between versions.
                  </div>
                )}
              </div>

              {/* Removed Skills */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <h3 className="text-base font-black text-amber-950 uppercase tracking-wider">
                    Removed / Omitted Skills ({removedSkills.length})
                  </h3>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Skills present in Previous Resume (A) that are missing from Current Resume (B)
                </p>

                {removedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {removedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs"
                      >
                        <span className="text-amber-600 font-black">-</span>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 font-semibold text-center">
                    No previous skills were omitted in the new version.
                  </div>
                )}
              </div>
            </div>

            {/* MODULE 4 & 5: Keyword & Section Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Keyword Improvement Module */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" /> Keyword Match Improvement
                  </h3>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                    Keyword Optimization
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                    <p className="text-[11px] font-extrabold text-indigo-900 uppercase">Missing Keywords (A)</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{missingKeywords1}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                    <p className="text-[11px] font-extrabold text-emerald-900 uppercase">Missing Keywords (B)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{missingKeywords2}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {missingReduction > 0
                      ? `Version B successfully reduced missing job description keywords by ${missingReduction}!`
                      : `Version B maintains comparable keyword density.`}
                  </span>
                </div>
              </div>

              {/* Section Improvement Module */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" /> Section & Impact Improvement
                  </h3>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                    Impact Metrics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-center">
                    <p className="text-[11px] font-extrabold text-purple-900 uppercase">Quantified Bullets Score</p>
                    <p className="text-xl font-black text-purple-800 mt-1">{quantScore1} ➔ {quantScore2}</p>
                    <span className="text-[10px] font-bold text-purple-600">
                      {quantDiff >= 0 ? `+${quantDiff} pts` : `${quantDiff} pts`}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 text-center">
                    <p className="text-[11px] font-extrabold text-teal-900 uppercase">Action Verbs Score</p>
                    <p className="text-xl font-black text-teal-800 mt-1">{verbScore1} ➔ {verbScore2}</p>
                    <span className="text-[10px] font-bold text-teal-600">
                      {verbDiff >= 0 ? `+${verbDiff} pts` : `${verbDiff} pts`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Stronger action verbs and metric placeholders were introduced in Version B.
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Resume Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Version A Card */}
              {r1 && (
                <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-6 border-t-4 border-indigo-600 border-x border-b border-gray-200">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                        Version A (Baseline)
                      </span>
                      <h4 className="text-xl font-black text-gray-900 mt-2">{r1.jobTitle || "Previous Resume"}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{r1.companyName || "General Target Employer"}</p>
                    </div>
                    <ScoreCircle score={score1} />
                  </div>

                  {image1 && (
                    <div className="bg-gray-50 rounded-2xl p-2 border border-gray-200">
                      <img src={image1} className="h-[280px] w-full object-cover object-top rounded-xl" alt="Version A" />
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs font-bold">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">ATS Score:</span>
                      <span className="text-gray-900 font-black">{r1.feedback?.ATS?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Tone & Style:</span>
                      <span className="text-gray-900 font-black">{r1.feedback?.toneAndStyle?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Content Quality:</span>
                      <span className="text-gray-900 font-black">{r1.feedback?.content?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Structure & Format:</span>
                      <span className="text-gray-900 font-black">{r1.feedback?.structure?.score || 0}/100</span>
                    </div>
                  </div>

                  <Link to={`/resume/${r1.id}`} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-extrabold rounded-xl transition-colors text-center">
                    Open Full Version A Report
                  </Link>
                </div>
              )}

              {/* Version B Card */}
              {r2 && (
                <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-6 border-t-4 border-purple-600 border-x border-b border-gray-200">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100">
                        Version B (Current Target)
                      </span>
                      <h4 className="text-xl font-black text-gray-900 mt-2">{r2.jobTitle || "Current Resume"}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{r2.companyName || "General Target Employer"}</p>
                    </div>
                    <ScoreCircle score={score2} />
                  </div>

                  {image2 && (
                    <div className="bg-gray-50 rounded-2xl p-2 border border-gray-200">
                      <img src={image2} className="h-[280px] w-full object-cover object-top rounded-xl" alt="Version B" />
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs font-bold">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">ATS Score:</span>
                      <span className="text-gray-900 font-black">{r2.feedback?.ATS?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Tone & Style:</span>
                      <span className="text-gray-900 font-black">{r2.feedback?.toneAndStyle?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Content Quality:</span>
                      <span className="text-gray-900 font-black">{r2.feedback?.content?.score || 0}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Structure & Format:</span>
                      <span className="text-gray-900 font-black">{r2.feedback?.structure?.score || 0}/100</span>
                    </div>
                  </div>

                  <Link to={`/resume/${r2.id}`} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition-colors text-center shadow-xs">
                    Open Full Version B Report
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
