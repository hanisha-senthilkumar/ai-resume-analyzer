import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import DashboardMetrics from "~/components/DashboardMetrics";
import EmptyState from "~/components/EmptyState";
import { SkeletonCard, SkeletonMetrics } from "~/components/SkeletonLoader";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { Rocket, RefreshCw, Plus } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Career Intelligence Dashboard" },
    { name: "description", content: "AI-powered ATS feedback, resume analytics, and career intelligence dashboard" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "company">("date");

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  const loadResumes = async () => {
    setLoadingResumes(true);
    const rawResumes = (await kv.list('resume:*', true)) as KVItem[];
    const parsedResumes = rawResumes?.map((item) => JSON.parse(item.value) as Resume);
    setResumes(parsedResumes || []);
    setLoadingResumes(false);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDeleteResume = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResumes = useMemo(() => {
    let result = resumes.filter((r) => {
      const q = searchQuery.toLowerCase();
      const company = (r.companyName || "").toLowerCase();
      const title = (r.jobTitle || "").toLowerCase();
      return company.includes(q) || title.includes(q);
    });

    return result.sort((a, b) => {
      if (sortBy === "score") {
        return (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0);
      }
      if (sortBy === "company") {
        return (a.companyName || "").localeCompare(b.companyName || "");
      }
      // default: date newest first
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [resumes, searchQuery, sortBy]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen dark:bg-slate-950 transition-colors">
      <Navbar />

      <section className="main-section max-w-[1850px] mx-auto pb-16">
        <div className="page-heading py-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>SAAS CAREER INTELLIGENCE PLATFORM</span>
          </div>
          <h1 className="!text-5xl font-black text-gray-900 dark:text-white">
            Resume Intelligence Dashboard
          </h1>
          <h2 className="text-gray-500 dark:text-slate-400 font-medium text-base md:text-lg max-w-3xl mx-auto mt-2">
            Monitor application performance, review ATS feedback, optimize bullet points with AI, and track version history.
          </h2>
        </div>

        {/* Loading Skeletons */}
        {loadingResumes ? (
          <div className="w-full max-w-[1850px] mx-auto">
            <SkeletonMetrics />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Metrics Header */}
            {resumes.length > 0 && (
              <DashboardMetrics resumes={resumes} />
            )}

            {/* Search & Filter Toolbar */}
            {resumes.length > 0 && (
              <div className="w-full max-w-[1850px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative w-full md:w-96">
                  <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by company or role..."
                    className="pl-10 pr-4 py-2.5 text-xs font-semibold !rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="date">Date Added</option>
                      <option value="score">Highest ATS Score</option>
                      <option value="company">Company Name</option>
                    </select>
                  </div>

                  {resumes.length >= 2 && (
                    <Link
                      to="/compare"
                      className="px-4 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Compare Versions</span>
                    </Link>
                  )}

                  <Link
                    to="/upload"
                    className="primary-button !w-auto text-xs px-4 py-2 font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Resume</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Resumes Grid */}
            {filteredResumes.length > 0 && (
              <div className="resumes-section">
                {filteredResumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} onDelete={handleDeleteResume} />
                ))}
              </div>
            )}

            {/* Empty State Component */}
            {resumes.length === 0 && (
              <EmptyState
                title="No Resumes Uploaded Yet"
                description="Upload your resume PDF to unlock instant ATS scores, job matching metrics, AI rewriters, cover letter generation, and interview preparation."
                actionText="Upload Your First Resume"
                actionLink="/upload"
                icon={<Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

