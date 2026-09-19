import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { AlertTriangle, FileText, Lightbulb } from "lucide-react";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [confirmText, setConfirmText] = useState("");
    const [isWiping, setIsWiping] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const loadFiles = async () => {
        if (!auth.isAuthenticated) return;
        const result = (await fs.readDir("./")) as FSItem[];
        setFiles(result || []);
    };

    const [isWipeSuccess, setIsWipeSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        } else if (auth.isAuthenticated) {
            loadFiles();
        }
    }, [isLoading, auth.isAuthenticated]);

    const handleDelete = async () => {
        if (!auth.isAuthenticated) {
            alert("Unauthorized action. Please sign in.");
            return;
        }

        if (confirmText.trim().toUpperCase() !== "WIPE") {
            alert("Confirmation code mismatch. Please type WIPE to confirm.");
            return;
        }

        setIsWiping(true);
        setStatusMsg("Wiping storage assets and clearing application database...");

        try {
            if (files && files.length > 0) {
                for (const file of files) {
                    await fs.delete(file.path);
                }
            }
            await kv.flush();
            setStatusMsg("App storage and KV database wiped successfully!");
            setIsWipeSuccess(true);
            setConfirmText("");
            await loadFiles();

            // Auto-redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err) {
            console.error("Wipe failed", err);
            setStatusMsg("Failed to complete full wipe operation.");
        } finally {
            setIsWiping(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-500 text-xs font-bold">
                Verifying system authorization...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 md:p-12 font-sans text-gray-900 dark:text-slate-100 flex flex-col items-center justify-center gap-6">
            
            {/* Top Back Navigation Button */}
            <div className="max-w-xl w-full flex items-center justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 text-gray-700 dark:text-slate-200 text-xs font-black rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Return to Dashboard</span>
                </button>
            </div>

            <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">System Storage Wipe</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Authorized Account: {auth.user?.username || "Authenticated User"}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-wider">
                        Storage Inventory ({files.length} items)
                    </label>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-3 space-y-1 text-xs font-mono">
                        {files.length > 0 ? (
                            files.map((file) => (
                                <div key={file.id || file.path} className="text-gray-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>{file.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 font-sans italic text-center py-2">Storage is empty.</div>
                        )}
                    </div>
                </div>

                {statusMsg && (
                    <div className={`p-4 rounded-2xl border text-xs font-bold flex flex-col gap-3 ${
                        isWipeSuccess
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200"
                            : "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300"
                    }`}>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{statusMsg}</span>
                        </div>

                        {isWipeSuccess && (
                            <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Redirecting to Dashboard in 3 seconds...</span>
                                <button
                                    onClick={() => navigate("/")}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                    Return to Dashboard Now →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!isWipeSuccess && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                            Type <span className="font-black text-rose-600">WIPE</span> to confirm data destruction:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type WIPE here"
                            className="p-3.5 text-xs font-black"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                        onClick={() => navigate("/")}
                        className="px-5 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-slate-200 text-xs font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <span>← Return to Dashboard</span>
                    </button>

                    {!isWipeSuccess && (
                        <button
                            onClick={handleDelete}
                            disabled={isWiping || confirmText.trim().toUpperCase() !== "WIPE"}
                            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl transition-all shadow-md cursor-pointer"
                        >
                            {isWiping ? "Wiping Data..." : "Confirm Data Wipe"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WipeApp;
