"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";

export function AppStatus() {
  const { toast, clearToast, isOnline, syncQueueCount } = useUIStore();

  const showSyncPending = isOnline && syncQueueCount > 0;

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="slate-status-banner slate-status-banner--offline"
            role="status"
          >
            You&apos;re offline — changes save locally and sync when back online
          </motion.div>
        )}
        {showSyncPending && (
          <motion.div
            key="sync"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="slate-status-banner slate-status-banner--sync"
            role="status"
          >
            {syncQueueCount === 1
              ? "1 change waiting to sync"
              : `${syncQueueCount} changes waiting to sync`}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="slate-status-toast-wrap"
            role="alert"
          >
            <div
              className={`slate-toast slate-toast--${toast.type}`}
            >
              <span className="slate-toast-text">{toast.message}</span>
              <button
                type="button"
                onClick={clearToast}
                className="slate-toast-action"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
