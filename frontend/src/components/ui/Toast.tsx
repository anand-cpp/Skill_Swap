import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white font-['Manrope'] text-[13px] border ${
              toast.type === "success"
                ? "bg-[#006c4a] border-[#82f5c1]/30"
                : toast.type === "error"
                  ? "bg-[#ba1a1a] border-[#ffb4ab]/30"
                  : "bg-[#1b1b1e] border-[#c7c4d7]/20"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-white">
              {toast.type === "success"
                ? "check_circle"
                : toast.type === "error"
                  ? "error"
                  : "info"}
            </span>
            <span className="font-medium pr-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Close notification"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
