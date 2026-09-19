import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { ShieldCheck, ArrowRight, LogOut, Sparkles, CheckCircle2, Lock, Loader2, FileText, Target, Zap } from "lucide-react";

export const meta = () => ([
    { title: 'Resumind | Sign In & Authentication' },
    { name: 'description', content: 'Sign in to your Resumind AI Resume Analyzer account' },
]);

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1] || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next);
        }
    }, [auth.isAuthenticated, next, navigate]);

    const userInitial = auth.user?.username ? auth.user.username.charAt(0).toUpperCase() : "U";

    return (
        <main className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-12">
            {/* Ambient Background Glowing Orbs */}
            <div className="w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl absolute top-10 left-10 pointer-events-none"></div>
            <div className="w-96 h-96 bg-purple-600/20 rounded-full blur-3xl absolute bottom-10 right-10 pointer-events-none"></div>

            {/* Main Auth Split Card Container */}
            <div className="max-w-5xl w-full flex flex-col md:flex-row bg-white dark:bg-slate-900 backdrop-blur-2xl border border-gray-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10">
                
                {/* Column 1: Left Showcase Side */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-8">
                        {/* Brand Logo Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                                R
                            </div>
                            <div>
                                <p className="text-xl font-black text-white tracking-tight leading-none">
                                    RESUMIND
                                </p>
                                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-200">
                                    AI CAREER SAAS
                                </span>
                            </div>
                        </div>

                        {/* Hero Text */}
                        <div className="flex flex-col gap-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30 text-xs font-black uppercase tracking-wider text-white w-fit shadow-xs">
                                <Sparkles className="w-4 h-4 text-indigo-300" />
                                <span>NEXT-GEN AI RESUME SUITE</span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                                Transform Your Resume Into Interview Callbacks
                            </h1>
                            <p className="text-white text-xs sm:text-sm leading-relaxed font-semibold opacity-95">
                                Instant ATS compatibility audits, job matcher analysis, executive bullet rewriter, and interview coaching—backed by secure Puter Cloud AI.
                            </p>
                        </div>

                        {/* Value Props List */}
                        <div className="flex flex-col gap-3">
                            {[
                                { icon: FileText, label: "ATS Compatibility Scoring & Breakdown" },
                                { icon: Target, label: "Job Description Skill Gap Matching" },
                                { icon: Zap, label: "Bullet Point Metric Rewriter & Cover Letters" },
                                { icon: Lock, label: "100% Private Puter Cloud Storage" }
                            ].map((item, idx) => {
                                const IconComp = item.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3 text-xs font-black text-white bg-white/10 border border-white/20 p-3 rounded-xl backdrop-blur-sm shadow-xs">
                                        <div className="p-1.5 rounded-lg bg-indigo-500/30 text-white shrink-0">
                                            <IconComp className="w-4 h-4" />
                                        </div>
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Testimonial Footer Quote */}
                    <div className="mt-8 pt-6 border-t border-white/20 relative z-10 flex flex-col gap-1.5">
                        <p className="text-xs text-white italic font-semibold leading-relaxed">
                            "Resumind helped me pinpoint missing ATS keywords and optimize my bullet points. I landed 3 callbacks in 2 weeks!"
                        </p>
                        <span className="text-[11px] font-black text-indigo-200 uppercase tracking-wider">
                            — Verified Candidate Testimonial
                        </span>
                    </div>
                </div>

                {/* Column 2: Right Sign In Form Side */}
                <div className="md:w-1/2 p-8 lg:p-12 bg-white dark:bg-slate-900 flex flex-col justify-between gap-8">
                    <div className="flex flex-col gap-6">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-black border border-emerald-300 dark:border-emerald-800 w-fit shadow-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Puter Cloud OS Authentication</span>
                        </div>

                        {/* Card Header Text */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Welcome to Resumind
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-900 dark:text-slate-100 font-bold leading-relaxed">
                                Sign in to access your saved resume reports, score history, job matcher, and executive career tools.
                            </p>
                        </div>

                        {/* Interactive Sign In Action Area */}
                        <div className="flex flex-col gap-4 pt-2">
                            {isLoading ? (
                                <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center gap-3 text-indigo-950 dark:text-white font-black animate-pulse text-sm">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                                    <span>Connecting to Puter Cloud OS...</span>
                                </div>
                            ) : (
                                <>
                                    {auth.isAuthenticated && auth.user ? (
                                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                                                    {userInitial}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-emerald-950 dark:text-emerald-300 font-extrabold uppercase tracking-wider">Signed In Account</span>
                                                    <span className="text-lg font-black text-gray-900 dark:text-white">{auth.user.username}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-emerald-300/80 dark:border-emerald-800/80">
                                                <button
                                                    onClick={() => navigate(next)}
                                                    className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <span>Go to Dashboard</span>
                                                    <ArrowRight className="w-4 h-4 text-white" />
                                                </button>
                                                <button
                                                    onClick={auth.signOut}
                                                    className="w-full sm:w-auto py-3 px-4 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 border border-rose-300 dark:border-rose-800 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={auth.signIn}
                                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-base shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 group active:scale-[0.99] cursor-pointer"
                                            >
                                                <ShieldCheck className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                                <span className="text-white font-black">Sign In with Puter Cloud</span>
                                                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <div className="flex items-center gap-2 justify-center text-xs text-gray-900 dark:text-white font-bold bg-gray-100 dark:bg-slate-800 p-3 rounded-xl border border-gray-300 dark:border-slate-700">
                                                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                <span>1-Click Passwordless Authentication • Free Puter Account</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Security & Privacy Guarantee Footer */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-xs font-black text-gray-900 dark:text-white flex-wrap justify-between">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Private Cloud Storage
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> No Password Needed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Free Tier Included
                            </span>
                        </div>

                        <div className="text-xs text-center text-gray-900 dark:text-slate-100 font-bold">
                            Need help? Return to <Link to="/" className="text-indigo-600 dark:text-indigo-300 font-black underline hover:text-indigo-700">Home Dashboard</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Auth;
