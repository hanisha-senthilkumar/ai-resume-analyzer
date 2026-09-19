import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import KeywordGapAnalysis from "~/components/KeywordGapAnalysis";
import AIRewriter from "~/components/AIRewriter";
import CoverLetterGenerator from "~/components/CoverLetterGenerator";
import InterviewCoach from "~/components/InterviewCoach";
import SectionImprover from "~/components/SectionImprover";
import ATSKeywordOptimizer from "~/components/ATSKeywordOptimizer";
import JobRoleRecommender from "~/components/JobRoleRecommender";
import ResumeStrengthDashboard from "~/components/ResumeStrengthDashboard";
import PdfReportModal from "~/components/PdfReportModal";
import ATSResumeRebuilder from "~/components/ATSResumeRebuilder";
import { FileText, Plus, Lightbulb, BarChart3, TrendingUp, Target, Briefcase, Sparkles, Mail, Mic, Zap } from "lucide-react";

export const meta = () => ([
    { title: 'Resumind | Career Intelligence Workspace' },
    { name: 'description', content: 'Comprehensive AI ATS analysis, keyword matching, rewriter studio, and interview prep' },
]);

type WorkspaceTab = "audit" | "dashboard" | "keywords" | "roles" | "rewriter" | "coverletter" | "interview" | "rebuilder";

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [activeTab, setActiveTab] = useState<WorkspaceTab>("audit");
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resumeStr = await kv.get(`resume:${id}`);
            if (!resumeStr) return;

            const data = JSON.parse(resumeStr) as Resume;
            setResumeData(data);

            if (data.resumePath) {
                const resumeBlob = await fs.read(data.resumePath);
                if (resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    setResumeUrl(URL.createObjectURL(pdfBlob));
                }
            }

            if (data.imagePath) {
                const imageBlob = await fs.read(data.imagePath);
                if (imageBlob) {
                    setImageUrl(URL.createObjectURL(imageBlob));
                }
            }

            setFeedback(data.feedback);
        };

        loadResume();
    }, [id]);

    const handlePrintReport = () => {
        setIsPdfModalOpen(true);
    };

    return (
        <main className="!pt-0 min-h-screen bg-gray-50/50">
            {/* Top Navigation Bar */}
            <nav className="resume-nav bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/" className="back-button hover:bg-gray-100 transition-colors">
                        <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
                        <span className="text-gray-800 text-sm font-semibold">Dashboard</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-gray-300 hidden sm:block"></div>
                    <div>
                        <h1 className="!text-xl font-extrabold text-gray-900 leading-tight">
                            {resumeData?.jobTitle || "Resume Review"}
                        </h1>
                        {resumeData?.companyName && (
                            <p className="text-xs font-semibold text-indigo-600">
                                Target Company: {resumeData.companyName}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrintReport}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Export PDF Report</span>
                    </button>
                    <Link
                        to="/upload"
                        className="primary-button !w-auto text-xs font-bold px-4 py-2 flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Another</span>
                    </Link>
                </div>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left Column: Sticky PDF Resume Preview */}
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[calc(100vh-65px)] sticky top-[65px] items-center justify-center max-lg:h-auto max-lg:relative">
                    {imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-700 gradient-border max-sm:m-0 h-[92%] max-w-xl w-full flex flex-col items-center justify-center">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-xl shadow-lg border border-gray-100 hover:scale-[1.01] transition-transform"
                                    title="Click to view original PDF"
                                />
                            </a>
                            <p className="text-[11px] text-gray-500 font-medium mt-2 flex items-center gap-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <span>Click document preview to open full PDF</span>
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12">
                            <img src="/images/resume-scan.gif" className="w-64 rounded-2xl" alt="Loading" />
                            <p className="text-xs text-gray-500 mt-2">Loading Document Preview...</p>
                        </div>
                    )}
                </section>

                {/* Right Column: Interactive Career Intelligence Workspace */}
                <section className="feedback-section !w-1/2 max-lg:!w-full py-6 px-6 lg:px-8 flex flex-col gap-6">
                    {/* Workspace Mode Tabs */}
                    <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("audit")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "audit"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>ATS Audit</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "dashboard"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>Analytics</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("keywords")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "keywords"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Target className="w-4 h-4" />
                            <span>Skill Gaps</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("roles")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "roles"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Job Roles</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("rewriter")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "rewriter"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>AI Rewriter</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("coverletter")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "coverletter"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Mail className="w-4 h-4" />
                            <span>Cover Letter</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("interview")}
                            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "interview"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Mic className="w-4 h-4" />
                            <span>Interview Coach</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("rebuilder")}
                            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === "rebuilder"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span>Build ATS Resume</span>
                        </button>
                    </div>

                    {/* Active Tab View */}
                    {feedback ? (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                            {activeTab === "audit" && (
                                <>
                                    <Summary feedback={feedback} />
                                    <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                                    <Details feedback={feedback} />
                                </>
                            )}

                            {activeTab === "dashboard" && (
                                <ResumeStrengthDashboard
                                    feedback={feedback}
                                    jobTitle={resumeData?.jobTitle}
                                    companyName={resumeData?.companyName}
                                />
                            )}

                            {activeTab === "keywords" && (
                                <div className="flex flex-col gap-6">
                                    <ATSKeywordOptimizer
                                        data={feedback.atsKeywordOptimizer}
                                        jobTitle={resumeData?.jobTitle}
                                    />
                                    <KeywordGapAnalysis feedback={feedback} />
                                </div>
                            )}

                            {activeTab === "roles" && (
                                <JobRoleRecommender
                                    jobTitle={resumeData?.jobTitle}
                                    resumePath={resumeData?.resumePath}
                                    initialRecommendations={feedback.jobRoleRecommendations}
                                    onUpdateRecommendations={async (updated) => {
                                        if (resumeData && id) {
                                            const updatedData = {
                                                ...resumeData,
                                                feedback: {
                                                    ...feedback,
                                                    jobRoleRecommendations: updated
                                                }
                                            };
                                            setResumeData(updatedData);
                                            setFeedback(updatedData.feedback);
                                            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
                                        }
                                    }}
                                />
                            )}

                            {activeTab === "rewriter" && (
                                <div className="flex flex-col gap-6">
                                    <SectionImprover
                                        jobTitle={resumeData?.jobTitle}
                                        sectionImprovements={feedback.sectionImprovements}
                                    />
                                    <AIRewriter
                                        jobTitle={resumeData?.jobTitle}
                                        bulletImprovements={feedback.bulletImprovements}
                                    />
                                </div>
                            )}

                            {activeTab === "coverletter" && (
                                <CoverLetterGenerator
                                    companyName={resumeData?.companyName}
                                    jobTitle={resumeData?.jobTitle}
                                    jobDescription={resumeData?.jobDescription}
                                    resumePath={resumeData?.resumePath}
                                    initialCoverLetter={feedback.coverLetter}
                                    onSaveCoverLetter={async (updatedLetter) => {
                                        if (resumeData && id) {
                                            const updatedData = {
                                                ...resumeData,
                                                feedback: {
                                                    ...feedback,
                                                    coverLetter: updatedLetter
                                                }
                                            };
                                            setResumeData(updatedData);
                                            setFeedback(updatedData.feedback);
                                            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
                                        }
                                    }}
                                />
                            )}

                            {activeTab === "interview" && (
                                <InterviewCoach
                                    resumeId={id}
                                    jobTitle={resumeData?.jobTitle}
                                    companyName={resumeData?.companyName}
                                    jobDescription={resumeData?.jobDescription}
                                    resumePath={resumeData?.resumePath}
                                    feedback={feedback}
                                    resumeData={resumeData}
                                    questions={feedback.detailedInterviewQuestions}
                                    legacyQuestions={feedback.interviewQuestions}
                                    onUpdateQuestions={async (updated) => {
                                        if (resumeData && id) {
                                            const updatedData = {
                                                ...resumeData,
                                                feedback: {
                                                    ...feedback,
                                                    detailedInterviewQuestions: updated
                                                }
                                            };
                                            setResumeData(updatedData);
                                            setFeedback(updatedData.feedback);
                                            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
                                        }
                                    }}
                                />
                            )}
                            {activeTab === "rebuilder" && (
                                <ATSResumeRebuilder
                                    resumeData={resumeData}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-sm rounded-2xl" alt="Scanning" />
                            <p className="text-sm font-semibold text-gray-500 mt-4">Generating AI Intelligence Report...</p>
                        </div>
                    )}
                </section>
            </div>

            <PdfReportModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                resumeData={resumeData}
                feedback={feedback}
            />
        </main>
    );
};

export default Resume;

