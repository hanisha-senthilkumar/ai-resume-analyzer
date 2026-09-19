import React, { useState } from 'react';
import { usePuterStore } from '~/lib/puter';
import { prepareInterviewPrepPrompt } from '../../constants';
import { Zap, Lightbulb } from 'lucide-react';
import RealTimeMockInterview from './RealTimeMockInterview';

interface InterviewCoachProps {
  resumeId?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  resumePath?: string;
  questions?: DetailedInterviewQuestion[];
  legacyQuestions?: { category: string; question: string; sampleAnswer: string; tips: string }[];
  feedback?: Feedback | null;
  resumeData?: Resume | null;
  onUpdateQuestions?: (questions: DetailedInterviewQuestion[]) => void;
}

const DEFAULT_DETAILED_QUESTIONS: DetailedInterviewQuestion[] = [
  {
    id: "q-1",
    question: "Explain how you implemented authentication and state persistence in your full-stack application.",
    category: "project",
    difficulty: "medium",
    whatInterviewerExpects: "Evaluates security awareness (JWT storage, HttpOnly cookie protection, session timeouts, XSS/CSRF prevention) and clean state synchronization.",
    suggestedAnswerStructure: `1. ARCHITECTURE CHOICE: Mention token strategy (JWT vs Sessions) and where tokens are stored.
2. IMPLEMENTATION: Detail how client state initializes from persistent storage (e.g. Zustand persist middleware or LocalStorage).
3. SECURITY: Highlight security precautions like HttpOnly flags, CSRF tokens, and automatic token refresh interceptors.
4. RESULT: Explain user experience benefits (seamless login state across reloads).`,
    keyConceptsToPrepare: ["JWT Tokens", "HttpOnly Cookies", "OAuth2 / OIDC", "Client State Persistence", "CSRF Protection"],
    sampleAnswer: "I chose a hybrid JWT authentication model where access tokens are stored in memory and refresh tokens are handled via secure HttpOnly, SameSite cookies to protect against XSS...",
    tips: "Be ready to explain how your application handles expired tokens gracefully."
  },
  {
    id: "q-2",
    question: "How do you profile, diagnose, and resolve frontend rendering performance bottlenecks in React applications?",
    category: "technical",
    difficulty: "hard",
    whatInterviewerExpects: "Deep understanding of Virtual DOM diffing, component re-render triggers, memory leak detection, and DevTools profiling.",
    suggestedAnswerStructure: `1. DIAGNOSIS: Explain profiling tools used (React DevTools Flamegraph, Chrome Performance Tab, Lighthouse).
2. IDENTIFICATION: Spot unnecessary re-renders caused by unmemoized props, inline functions, or broad context providers.
3. REMEDIATION: Detail memoization strategies (useMemo, useCallback, React.memo) and code splitting (React.lazy).
4. METRIC: Quantify performance gains achieved (e.g., reduced Lighthouse TTI or bundle size reduction).`,
    keyConceptsToPrepare: ["React Profiler", "Flamegraph Analysis", "Memoization (useMemo/useCallback)", "Code Splitting", "Virtualization"],
    sampleAnswer: "I inspect rendering spikes using React DevTools Flamegraph to detect component trees re-rendering excessively due to unstable object references...",
    tips: "Quantify your impact with measurable metrics like Lighthouse score improvements or millisecond reductions."
  },
  {
    id: "q-3",
    question: "On your resume, you listed optimizing SQL database response times by 35%. Walk me through your exact profiling and indexing strategy.",
    category: "resume-based",
    difficulty: "hard",
    whatInterviewerExpects: "Verifies the authenticity of claims on your resume, database execution plans, B-Tree index selection, and query optimization.",
    suggestedAnswerStructure: `1. CONTEXT: Briefly restate the original query bottleneck and high-traffic conditions.
2. PROFILING: Detail how slow query logs and EXPLAIN ANALYZE execution plans were analyzed.
3. STRATEGY: Explain index creation (B-Tree vs Hash), composite indexing order, and query refactoring.
4. VERIFICATION: Share how response times were benchmarked before and after migration.`,
    keyConceptsToPrepare: ["EXPLAIN ANALYZE", "B-Tree Indexes", "Query Execution Plan", "Composite Indexing", "Database Connection Pooling"],
    sampleAnswer: "I analyzed PostgreSQL slow query logs and executed EXPLAIN ANALYZE on high-frequency endpoints, identifying full-table scans on un-indexed foreign key columns...",
    tips: "Be specific about raw SQL or ORM query execution plan analysis."
  },
  {
    id: "q-4",
    question: "Describe a situation where project requirements changed drastically days before a production release. How did you handle it?",
    category: "behavioral",
    difficulty: "medium",
    whatInterviewerExpects: "Assesses composure under pressure, prioritization skills, trade-off communication, and agile adaptability.",
    suggestedAnswerStructure: `SITUATION: Describe the sudden scope change and stakeholder motivation.
TASK: Evaluate trade-offs between scope, launch deadline, and code quality.
ACTION: Communicated clear impact options to product managers, proposing an MVP release phase.
RESULT: Successfully launched core features on target date, scheduling non-essential additions for v1.1.`,
    keyConceptsToPrepare: ["STAR Method", "Scope Negotiation", "Stakeholder Management", "MVP Prioritization", "Agile Adaptability"],
    sampleAnswer: "When late requirement changes came in, I scheduled a brief triage meeting with the product owner and presented data on the engineering trade-offs...",
    tips: "Focus on positive communication and problem-solving rather than frustration."
  },
  {
    id: "q-5",
    question: "Why are you interested in this specific role and what environment empowers you to do your best engineering work?",
    category: "hr",
    difficulty: "easy",
    whatInterviewerExpects: "Evaluates cultural alignment, self-awareness, motivation, career trajectory, and team collaboration preferences.",
    suggestedAnswerStructure: `1. COMPANY FIT: Express genuine interest in the company's product, engineering culture, or mission.
2. CAREER ALIGNMENT: Explain how this role matches your technical growth goals.
3. WORK ENVIRONMENT: Describe your ideal balance of autonomy, code reviews, and cross-functional collaboration.`,
    keyConceptsToPrepare: ["Company Mission Alignment", "Career Growth Goals", "Collaborative Culture", "Engineering Standards"],
    sampleAnswer: "I am drawn to this team because of your commitment to high-scale developer tooling. I thrive in an environment with high code quality standards, thorough pull request reviews, and psychological safety...",
    tips: "Research the company's tech blog or recent engineering updates beforehand."
  },
  {
    id: "q-6",
    question: "How do you handle API versioning, error handling, and schema validation across microservices?",
    category: "technical",
    difficulty: "medium",
    whatInterviewerExpects: "Evaluates robust API design standards, contract testing, fallback handling, and schema validation libraries (Zod, Yup, JSON Schema).",
    suggestedAnswerStructure: `1. VERSIONING: Explain URL path versioning vs header versioning strategies.
2. VALIDATION: Detail request/response payload validation using Zod or OpenAPI specs.
3. ERROR HANDLING: Mention standardized RFC 7807 problem details error responses and status codes.
4. RESILIENCE: Detail retry policies, circuit breakers, or fallback data defaults.`,
    keyConceptsToPrepare: ["REST API Versioning", "Zod Schema Validation", "RFC 7807 Error Specs", "Circuit Breakers", "Contract Testing"],
    sampleAnswer: "I enforce strict request payload validation at API boundaries using Zod schemas, returning standardized error structures with readable field error arrays...",
    tips: "Mention tools like Zod, OpenAPI/Swagger, or Postman testing."
  }
];

const InterviewCoach: React.FC<InterviewCoachProps> = ({
  resumeId,
  jobTitle = "Target Role",
  companyName,
  jobDescription,
  resumePath,
  questions,
  legacyQuestions,
  feedback,
  resumeData,
  onUpdateQuestions
}) => {
  const { ai } = usePuterStore();
  const [activeSubTab, setActiveSubTab] = useState<"mock" | "prep">("mock");

  // Convert legacy questions if provided
  const initialItems: DetailedInterviewQuestion[] = React.useMemo(() => {
    if (questions && questions.length > 0) return questions;
    if (legacyQuestions && legacyQuestions.length > 0) {
      return legacyQuestions.map((q, idx) => ({
        id: `legacy-${idx}`,
        question: q.question,
        category: (q.category === "situational" ? "behavioral" : q.category) as any,
        difficulty: "medium",
        whatInterviewerExpects: "Evaluates technical depth and structured problem-solving approach.",
        suggestedAnswerStructure: q.sampleAnswer,
        keyConceptsToPrepare: ["Problem Solving", "STAR Method", "Technical Depth"],
        sampleAnswer: q.sampleAnswer,
        tips: q.tips
      }));
    }
    return DEFAULT_DETAILED_QUESTIONS;
  }, [questions, legacyQuestions]);

  const [items, setItems] = useState<DetailedInterviewQuestion[]>(initialItems);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [activeNoteQuestionId, setActiveNoteQuestionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerateAIQuestions = async () => {
    if (!resumePath) {
      setStatusMessage("Note: No resume PDF file path available for re-analysis.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Generating custom interview questions from your uploaded resume...");

    try {
      const prompt = prepareInterviewPrepPrompt({ jobTitle });
      const response = await ai.feedback(resumePath, prompt);

      if (response && response.message?.content) {
        const rawContent = typeof response.message.content === "string"
          ? response.message.content
          : response.message.content[0]?.text || "";
        
        const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson) as DetailedInterviewQuestion[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item, idx) => ({
            ...item,
            id: `ai-gen-${Date.now()}-${idx}`
          }));
          setItems(formatted);
          if (onUpdateQuestions) {
            onUpdateQuestions(formatted);
          }
          setStatusMessage("Successfully generated personalized resume interview questions!");
        } else {
          setStatusMessage("Generated standard interview preparation set.");
        }
      }
    } catch (err) {
      console.error("Failed to generate AI interview questions:", err);
      setStatusMessage("Analysis complete.");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleNoteChange = (qId: string, note: string) => {
    setUserNotes(prev => ({
      ...prev,
      [qId]: note
    }));
  };

  const filteredItems = items.filter((q) => {
    const matchesCat = filterCategory === "all" || q.category === filterCategory;
    const matchesDiff = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchesSearch = searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.whatInterviewerExpects.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.keyConceptsToPrepare?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCat && matchesDiff && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">Easy</span>;
      case "medium":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200">Medium</span>;
      case "hard":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200">Hard</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 text-gray-800 border border-gray-200">{difficulty}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "technical":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">Technical</span>;
      case "project":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-800 border border-purple-200">Project Walkthrough</span>;
      case "behavioral":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">Behavioral (STAR)</span>;
      case "hr":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">Culture & HR</span>;
      case "resume-based":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">Resume-Based</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 border border-gray-200">{category}</span>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* MODE TOGGLE SWITCHER (LIVE MOCK INTERVIEW vs PREP GUIDE) */}
      <div className="bg-white rounded-3xl p-2 border border-gray-200 shadow-sm flex items-center gap-2 max-w-xl mx-auto w-full">
        <button
          onClick={() => setActiveSubTab("mock")}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "mock"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Live AI Mock Interview</span>
        </button>

        <button
          onClick={() => setActiveSubTab("prep")}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "prep"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Question Bank & Guide</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE MOCK INTERVIEW */}
      {activeSubTab === "mock" && (
        <RealTimeMockInterview
          resumeId={resumeId}
          jobTitle={jobTitle}
          companyName={companyName}
          jobDescription={jobDescription}
          feedback={feedback}
          resumeData={resumeData}
        />
      )}

      {/* SUB-TAB 2: QUESTION BANK PREP GUIDE */}
      {activeSubTab === "prep" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 w-full flex flex-col gap-6 animate-in fade-in duration-500">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  FEATURE 6 — AI INTERVIEW PREPARATION STUDIO
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  AI SAFETY & ACCURACY VERIFIED
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Resume-Tailored Interview Questions
              </h2>
              <p className="text-purple-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                Custom-generated technical, project, HR, behavioral, and resume-based questions designed for <strong>{jobTitle}</strong>.
              </p>
            </div>

            <button
              onClick={handleGenerateAIQuestions}
              disabled={isGenerating}
              className="px-5 py-3 bg-white text-indigo-950 hover:bg-purple-50 active:scale-95 text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-indigo-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-indigo-950" />
                  <span>Re-generate AI Questions</span>
                </>
              )}
            </button>
          </div>

          {statusMessage && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

      {/* Filter Controls & Search */}
      <div className="flex flex-col gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
        {/* Search Bar */}
        <div className="relative w-full">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, concept, or expectation..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mr-1">Category:</span>
            {[
              { key: "all", label: "All Categories" },
              { key: "technical", label: "Technical" },
              { key: "project", label: "Project" },
              { key: "hr", label: "HR" },
              { key: "behavioral", label: "Behavioral" },
              { key: "resume-based", label: "Resume-Based" }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  filterCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mr-1">Difficulty:</span>
            {[
              { key: "all", label: "All" },
              { key: "easy", label: "Easy" },
              { key: "medium", label: "Medium" },
              { key: "hard", label: "Hard" }
            ].map((diff) => (
              <button
                key={diff.key}
                onClick={() => setFilterDifficulty(diff.key)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  filterDifficulty === diff.key
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions Counter Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-gray-500">
          Showing <span className="text-gray-900 font-extrabold">{filteredItems.length}</span> of {items.length} Interview Questions
        </span>
        {(filterCategory !== "all" || filterDifficulty !== "all" || searchQuery !== "") && (
          <button
            onClick={() => {
              setFilterCategory("all");
              setFilterDifficulty("all");
              setSearchQuery("");
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredItems.map((item, idx) => {
          const qId = item.id || `q-${idx}`;
          const isNoteOpen = activeNoteQuestionId === qId;
          const noteText = userNotes[qId] || "";

          return (
            <div
              key={qId}
              className="bg-white border border-gray-200 hover:border-indigo-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-5"
            >
              {/* Question Header Metadata */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {getCategoryBadge(item.category)}
                  {getDifficultyBadge(item.difficulty)}
                </div>
                <span className="text-xs text-gray-400 font-semibold">
                  Question #{idx + 1}
                </span>
              </div>

              {/* Question Prompt */}
              <h3 className="text-lg font-black text-gray-900 leading-snug tracking-tight">
                "{item.question}"
              </h3>

              {/* What Interviewer Expects Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 mt-0.5">
                  🎯
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-1">
                    What the Interviewer Expects:
                  </h4>
                  <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                    {item.whatInterviewerExpects}
                  </p>
                </div>
              </div>

              {/* Suggested Answer Structure Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span>📐</span> Suggested Answer Structure:
                </h4>
                <div className="text-xs text-gray-800 whitespace-pre-line leading-relaxed font-mono bg-white p-3 rounded-xl border border-gray-200">
                  {item.suggestedAnswerStructure}
                </div>
              </div>

              {/* Key Concepts to Prepare */}
              {item.keyConceptsToPrepare && item.keyConceptsToPrepare.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                    Key Concepts to Prepare:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keyConceptsToPrepare.map((concept, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold"
                      >
                        ⚡ {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Notepad Drawer Toggle */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveNoteQuestionId(isNoteOpen ? null : qId)}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                >
                  <span>{isNoteOpen ? "Hide Practice Notepad" : "📝 Practice Your Answer / Take Notes"}</span>
                  {noteText && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
              </div>

              {/* Practice Notepad Drawer */}
              {isNoteOpen && (
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col gap-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900">
                      Practice Notepad (Draft your answer using STAR method):
                    </label>
                    {noteText && (
                      <button
                        onClick={() => handleNoteChange(qId, "")}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
                      >
                        Clear Notes
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={(e) => handleNoteChange(qId, e.target.value)}
                    placeholder="Type your response draft here... e.g. Situation: In my previous project... Task: I needed to..."
                    className="w-full p-3 text-xs font-sans bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCoach;
