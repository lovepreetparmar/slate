"use client";

import { motion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { SLATE_EASE, SLATE_TRANSITION } from "@/lib/motion";

export function EmptyState() {
  const hydrated = useHydrated();
  const content = (
    <>
      <p className="slate-empty-title">Slate cleared.</p>
      <p className="slate-empty-subtitle">Enjoy the rest of your day.</p>
    </>
  );

  if (!hydrated) {
    return <div className="slate-empty">{content}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: SLATE_TRANSITION.enter.duration,
        ease: SLATE_EASE,
      }}
      className="slate-empty"
    >
      {content}
    </motion.div>
  );
}
