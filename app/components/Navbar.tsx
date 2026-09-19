import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useTheme } from "~/lib/useTheme";
import Sidebar from "~/components/Sidebar";
import { 
    ChevronDown, 
    LogOut, 
    Mail,
    ShieldCheck
} from "lucide-react";

const Navbar = () => {
    const { auth } = usePuterStore();
    const location = useLocation();
    const { toggleTheme, isDark } = useTheme();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const userInitial = auth.user?.username ? auth.user.username.charAt(0).toUpperCase() : "U";
    const userEmail = auth.user?.email || (auth.user?.username ? `${auth.user.username}@puter.com` : "user@puter.com");

    return (
        <>
            <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

            <nav className="navbar shadow-sm border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
                <div className="flex items-center gap-4">
                    {/* Mobile Drawer Trigger */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 rounded-xl text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
                        title="Open Menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <Link to="/" className="flex items-center gap-2">
                        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">RESUMIND</p>
                        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                            SaaS
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-4 text-xs font-black text-gray-600 dark:text-slate-400">
                        <Link
                            to="/"
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/match"
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${location.pathname === '/match' ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}
                        >
                            Job Matcher
                        </Link>
                        <Link
                            to="/compare"
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${location.pathname === '/compare' ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}
                        >
                            Compare Resumes
                        </Link>
                        <Link
                            to="/rebuild"
                            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${location.pathname.startsWith('/rebuild') ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}
                        >
                            Build ATS Resume
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {auth.isAuthenticated && auth.user ? (
                        <div className="relative" ref={dropdownRef}>
                            {/* Profile Avatar Pill Button */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-gray-100/90 dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs group focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                title="User Account Menu"
                            >
                                <div className="relative flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                                        {userInitial}
                                    </div>
                                    <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full absolute -bottom-0.5 -right-0.5 shadow-2xs animate-pulse"></span>
                                </div>
                                <span className="text-xs font-black text-gray-800 dark:text-slate-100 max-w-[110px] truncate">
                                    {auth.user.username}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                            </button>

                            {/* Floating Profile Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 backdrop-blur-xl border border-gray-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3">
                                    {/* User Details & Signed In Email Card */}
                                    <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50 dark:from-indigo-950/70 dark:via-purple-950/40 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                                                {userInitial}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                                                    {auth.user.username}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                                        Active Session
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Signed In Email ID */}
                                        <div className="flex items-center gap-2 p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 text-xs font-bold text-gray-700 dark:text-slate-300">
                                            <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                            <span className="truncate text-[11px]">{userEmail}</span>
                                        </div>
                                    </div>

                                    {/* Sign Out Button Only */}
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            auth.signOut();
                                        }}
                                        className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span>Sign Out Account</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth" className="text-xs font-bold text-gray-700 dark:text-slate-300 hover:text-indigo-600 px-2 py-1">
                            Sign In
                        </Link>
                    )}

                    <Link to="/upload" className="primary-button !w-auto text-xs font-bold px-4 py-2">
                        + Upload Resume
                    </Link>
                </div>
            </nav>
        </>
    );
};
export default Navbar;

