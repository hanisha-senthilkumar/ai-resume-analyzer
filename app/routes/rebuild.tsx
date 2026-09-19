import React, { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import ATSResumeRebuilder from "~/components/ATSResumeRebuilder";
import { usePuterStore } from "~/lib/puter";
import { useNavigate, useParams } from "react-router";
import { Sparkles, FileText, Plus } from "lucide-react";

export const meta = () => [
  { title: "Resumind | Build My ATS Resume" },
  { name: "description", content: "Rebuild your existing resume into a targeted, ATS-optimized document for any Job Description" },
];

export default function RebuildRoute() {
  const { auth, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const params = useParams();

  const [storedResumes, setStoredResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(params.id || "");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/rebuild");
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const items1 = ((await kv.list("resume:*", true)) || []) as KVItem[];
        const userId = auth.user?.username || "guest_user";
        const items2 = ((await kv.list(`user:${userId}:resume:*`, true)) || []) as KVItem[];

        const combined = [...items1, ...items2];
        const map = new Map<string, Resume>();

        for (const item of combined) {
          try {
            const parsed = JSON.parse(item.value) as Resume;
            if (parsed && parsed.id) map.set(parsed.id, parsed);
          } catch {
            // ignore invalid JSON
          }
        }

        const parsedResumes = Array.from(map.values());
        setStoredResumes(parsedResumes);

        if (params.id) {
          const match = parsedResumes.find(r => r.id === params.id);
          if (match) {
            setSelectedResume(match);
            setSelectedResumeId(match.id);
          }
        } else if (parsedResumes.length > 0 && !selectedResumeId) {
          setSelectedResume(parsedResumes[0]);
          setSelectedResumeId(parsedResumes[0].id);
        }
      } catch (err) {
        console.error("Failed to load stored resumes:", err);
      }
    };

    if (auth.isAuthenticated) fetchResumes();
  }, [auth.isAuthenticated, params.id]);

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    const match = storedResumes.find(r => r.id === id);
    setSelectedResume(match || null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 pt-6">
        
        {/* Saved Resume Selection Bar */}
        {storedResumes.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-wider">
                Select Source Resume to Rebuild:
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <select
                value={selectedResumeId}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {storedResumes.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.resumeName || res.jobTitle || `Resume #${res.id.slice(0, 6)}`} (ATS: {res.feedback?.overallScore || 75}%)
                  </option>
                ))}
              </select>

              <button
                onClick={() => navigate("/upload")}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Resume Rebuilder Main Component */}
        <ATSResumeRebuilder resumeData={selectedResume} />
      </main>
    </div>
  );
}
