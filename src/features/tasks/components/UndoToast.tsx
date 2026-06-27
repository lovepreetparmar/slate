"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";

export function UndoToast() {
  const { undoTask, undoCallback, clearUndo } = useUIStore();

  const handleUndo = () => {
    undoCallback?.();
    clearUndo();
  };

  return (
    <AnimatePresence>
      {undoTask && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50"
        >
          <div className="slate-toast">
            <span className="slate-toast-text">Cleared</span>
            <button
              onClick={handleUndo}
              className="slate-toast-action"
              aria-label={`Undo clearing "${undoTask.title}"`}
            >
              Undo
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
