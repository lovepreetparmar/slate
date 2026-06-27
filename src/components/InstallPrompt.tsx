"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (dismissed || (!deferredPrompt && !isIOS)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-[720px]"
      >
        <div className="slate-toast justify-between">
          <p className="slate-toast-text">
            {isIOS
              ? "Tap Share → Add to Home Screen"
              : "Install Slate for quick access"}
          </p>
          <div className="flex gap-3 shrink-0">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="slate-toast-action"
                aria-label="Install Slate app"
              >
                Install
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="slate-toast-action opacity-60"
              aria-label="Dismiss install prompt"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
