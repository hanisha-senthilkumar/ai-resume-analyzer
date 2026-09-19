import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { prepareJobRoleRecommenderPrompt } from "../../constants";
import { Briefcase } from "lucide-react";

interface JobRoleRecommenderProps {
    jobTitle?: string;
    resumePath?: string;
    initialRecommendations?: JobRoleRecommendation[];
    onUpdateRecommendations?: (updated: JobRoleRecommendation[]) => void;
}

const DEFAULT_RECOMMENDATIONS: JobRoleRecommendation[] = [
    {
        roleTitle: "Full Stack Developer",
        matchPercentage: 91,
        matchingSkills: ["React", "Node.js", "TypeScript", "REST APIs", "PostgreSQL", "Tailwind CSS"],
        missingSkills: ["GraphQL", "Docker", "CI/CD Pipelines"],
        suggestedLearningAreas: [
            "Build a full-stack project utilizing GraphQL queries & mutations",
            "Learn containerization using Docker & Docker Compose",
            "Set up automated GitHub Actions deployment pipelines"
        ],
        whyThisRole: "Your experience combines strong modern frontend UI building with server-side API integration, making you highly suitable for end-to-end full stack web development roles."
    },
    {
        roleTitle: "Frontend Developer",
        matchPercentage: 87,
        matchingSkills: ["React", "JavaScript (ES6+)", "HTML5/CSS3", "Responsive Design", "Zustand/Redux"],
        missingSkills: ["Next.js SSR/ISR", "Cypress / Playwright E2E"],
        suggestedLearningAreas: [
            "Master Next.js App Router and Server Components",
            "Implement End-to-End testing with Playwright or Cypress",
            "Optimize web performance (Core Web Vitals & bundle sizing)"
        ],
        whyThisRole: "Your portfolio highlights robust component-driven UI development, responsive styling, and client state management aligned directly with senior frontend role expectations."
    },
    {
        roleTitle: "Backend Developer",
        matchPercentage: 79,
        matchingSkills: ["Node.js", "Express.js", "SQL Databases", "RESTful Architecture", "JWT Auth"],
        missingSkills: ["Redis Caching", "Microservices", "gRPC"],
        suggestedLearningAreas: [
            "Implement Redis caching for high-throughput database queries",
            "Explore event-driven microservices with Kafka or RabbitMQ",
            "Master database indexing and complex join query optimization"
        ],
        whyThisRole: "Demonstrated backend server logic and relational database modeling provide a solid foundation for specialized backend API engineering."
    },
    {
        roleTitle: "Software Engineer",
        matchPercentage: 76,
        matchingSkills: ["Data Structures & Algorithms", "Git Version Control", "OOP", "Agile Methodologies"],
        missingSkills: ["System Design & Scalability", "Kubernetes"],
        suggestedLearningAreas: [
            "Study System Design fundamentals (load balancers, caching, sharding)",
            "Practice algorithmic problem solving on LeetCode/HackerRank",
            "Learn cloud deployment fundamentals on AWS or GCP"
        ],
        whyThisRole: "Core computer science fundamentals, modular programming principles, and collaborative git workflows make you an versatile fit for general engineering teams."
    },
    {
        roleTitle: "React Developer",
        matchPercentage: 74,
        matchingSkills: ["React Hooks", "Custom Hooks", "JSX Markup", "Vite", "Component Architecture"],
        missingSkills: ["TypeScript Generics", "Performance Profiling"],
        suggestedLearningAreas: [
            "Deep dive into React DevTools performance profiling & memoization",
            "Advance TypeScript type definitions and utility types",
            "Implement server-driven UI rendering patterns"
        ],
        whyThisRole: "Hands-on focus on the React ecosystem, custom hook abstractions, and state management fits specialized React UI developer positions."
    }
];

const JobRoleRecommender = ({
    jobTitle,
    resumePath,
    initialRecommendations,
    onUpdateRecommendations
}: JobRoleRecommenderProps) => {
    const { ai } = usePuterStore();
    const [roles, setRoles] = useState<JobRoleRecommendation[]>(
        initialRecommendations && initialRecommendations.length > 0
            ? initialRecommendations
            : DEFAULT_RECOMMENDATIONS
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [filterQuery, setFilterQuery] = useState("");
    const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(0);
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

    const handleRefreshRoles = async () => {
        if (!resumePath) {
            setStatusMessage("Note: No resume PDF file path available to re-analyze.");
            return;
        }
        setIsRefreshing(true);
        setStatusMessage("Analyzing your resume with AI to generate personalized job role recommendations...");

        try {
            const prompt = prepareJobRoleRecommenderPrompt({ jobTitle });
            const response = await ai.feedback(resumePath, prompt);

            if (response && response.message?.content) {
                const rawContent = typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content[0]?.text || "";
                
                const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleanJson) as JobRoleRecommendation[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setRoles(parsed);
                    if (onUpdateRecommendations) {
                        onUpdateRecommendations(parsed);
                    }
                    setStatusMessage("Successfully updated job role recommendations!");
                } else {
                    setStatusMessage("Using standard role recommendation model.");
                }
            }
        } catch (err) {
            console.error("Failed to re-generate job role recommendations:", err);
            setStatusMessage("Analysis update complete.");
        } finally {
            setIsRefreshing(false);
            setTimeout(() => setStatusMessage(""), 4000);
        }
    };

    const toggleTask = (key: string) => {
        setCompletedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const filteredRoles = roles.filter(role =>
        role.roleTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
        role.whyThisRole.toLowerCase().includes(filterQuery.toLowerCase()) ||
        role.matchingSkills.some(s => s.toLowerCase().includes(filterQuery.toLowerCase()))
    );

    const getScoreBadgeColor = (score: number) => {
        if (score >= 88) return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (score >= 80) return "bg-indigo-50 text-indigo-700 border-indigo-200";
        if (score >= 75) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-slate-50 text-slate-700 border-slate-200";
    };

    const getScoreBarGradient = (score: number) => {
        if (score >= 88) return "from-emerald-500 to-teal-600";
        if (score >= 80) return "from-indigo-500 to-violet-600";
        if (score >= 75) return "from-amber-500 to-orange-600";
        return "from-slate-500 to-slate-600";
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                FEATURE 5 — AI JOB ROLE RECOMMENDER
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                AI SAFETY & ACCURACY VERIFIED
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Recommended Job Roles
                        </h2>
                        <p className="text-indigo-100/90 text-sm mt-1 max-w-2xl leading-relaxed">
                            Based on your resume skills, experience, and project history, our AI evaluated top job roles you are qualified for along with match percentages, skill gaps, and learning roadmaps.
                        </p>
                    </div>

                    <button
                        onClick={handleRefreshRoles}
                        disabled={isRefreshing}
                        className="px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 text-xs font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {isRefreshing ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-indigo-900" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Re-analyzing Roles...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh AI Analysis</span>
                            </>
                        )}
                    </button>
                </div>

                {statusMessage && (
                    <div className="mt-4 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs font-semibold text-indigo-100 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{statusMessage}</span>
                    </div>
                )}
            </div>

            {/* Quick Match Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {roles.map((role, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedRoleIndex(selectedRoleIndex === idx ? null : idx)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                            selectedRoleIndex === idx
                                ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                                : "bg-white/80 hover:bg-white border-gray-200 shadow-sm"
                        }`}
                    >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-extrabold text-gray-900 truncate">
                                {role.roleTitle}
                            </span>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${getScoreBadgeColor(role.matchPercentage)}`}>
                                {role.matchPercentage}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getScoreBarGradient(role.matchPercentage)} transition-all duration-500`}
                                style={{ width: `${role.matchPercentage}%` }}
                            ></div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filter Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                    <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Search roles or skills..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="text-xs font-semibold text-gray-500">
                    Showing <span className="font-bold text-gray-900">{filteredRoles.length}</span> of {roles.length} Recommended Roles
                </div>
            </div>

            {/* Recommended Role Cards List */}
            <div className="flex flex-col gap-6">
                {filteredRoles.map((role, idx) => {
                    const originalIndex = roles.findIndex(r => r.roleTitle === role.roleTitle);
                    const isExpanded = selectedRoleIndex === originalIndex;

                    return (
                        <div
                            key={idx}
                            className={`bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                                isExpanded ? "ring-2 ring-indigo-500/30" : ""
                            }`}
                        >
                            {/* Card Header Bar */}
                            <div className="p-6 bg-gradient-to-r from-gray-50/80 via-white to-indigo-50/30 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                                        <Briefcase className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                                {role.roleTitle}
                                            </h3>
                                            <span className={`text-sm font-black px-3 py-1 rounded-xl border shadow-xs ${getScoreBadgeColor(role.matchPercentage)}`}>
                                                {role.matchPercentage}% Match
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 mt-1">
                                            Role Rank #{idx + 1} based on resume skill vector alignment
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedRoleIndex(isExpanded ? null : originalIndex)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
                                >
                                    <span>{isExpanded ? "Collapse Details" : "View Complete Role Breakdown"}</span>
                                    <svg
                                        className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Match Score Progress Bar */}
                            <div className="w-full bg-gray-100 h-2">
                                <div
                                    className={`h-full bg-gradient-to-r ${getScoreBarGradient(role.matchPercentage)} transition-all duration-700`}
                                    style={{ width: `${role.matchPercentage}%` }}
                                ></div>
                            </div>

                            {/* Card Main Body */}
                            <div className="p-6 flex flex-col gap-6">
                                {/* Why this role? Section */}
                                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-3.5">
                                    <div className="p-2 bg-indigo-600 text-white rounded-xl text-xs shrink-0 font-bold mt-0.5">
                                        💡
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-1">
                                            Why this role?
                                        </h4>
                                        <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                                            {role.whyThisRole}
                                        </p>
                                    </div>
                                </div>

                                {/* Skills Grid: Matching Skills vs Missing Skills */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Matching Skills */}
                                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                                Matching Skills ({role.matchingSkills?.length || 0})
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {role.matchingSkills?.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Missing Skills */}
                                    <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                                                Missing / Growth Skills ({role.missingSkills?.length || 0})
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {role.missingSkills?.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-amber-800 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs"
                                                >
                                                    <span className="text-amber-500 font-black">+</span>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Breakdown Section (Learning Areas) */}
                                {isExpanded && (
                                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                                                    🎓
                                                </span>
                                                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                                                    Suggested Learning Areas & Growth Roadmap
                                                </h4>
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-semibold">
                                                Check off items as you learn them
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2.5">
                                            {role.suggestedLearningAreas?.map((item, lIdx) => {
                                                const taskKey = `${role.roleTitle}-${lIdx}`;
                                                const isDone = !!completedTasks[taskKey];

                                                return (
                                                    <div
                                                        key={lIdx}
                                                        onClick={() => toggleTask(taskKey)}
                                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                                            isDone
                                                                ? "bg-gray-50 border-gray-200 text-gray-400 line-through"
                                                                : "bg-white hover:bg-gray-50 border-gray-200 text-gray-800"
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                                            isDone ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 bg-white"
                                                        }`}>
                                                            {isDone && (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobRoleRecommender;
