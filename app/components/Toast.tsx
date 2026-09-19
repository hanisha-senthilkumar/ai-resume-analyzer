import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Lightbulb, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, description?: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start justify-between gap-3 animate-in slide-in-from-bottom duration-300 ${
              toast.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-700/50 backdrop-blur-md"
                : toast.type === "error"
                ? "bg-rose-900/90 text-white border-rose-700/50 backdrop-blur-md"
                : toast.type === "warning"
                ? "bg-amber-900/90 text-white border-amber-700/50 backdrop-blur-md"
                : "bg-indigo-900/90 text-white border-indigo-700/50 backdrop-blur-md"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">
                {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {toast.type === "info" && <Lightbulb className="w-4 h-4 text-indigo-400" />}
              </span>
              <div>
                <h4 className="text-xs font-black tracking-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] text-gray-200 mt-0.5 font-medium leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white text-xs font-bold p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe fallback if used outside provider
    return {
      addToast: (title: string) => console.log("Toast:", title),
      removeToast: () => {},
      toasts: []
    };
  }
  return ctx;
};
