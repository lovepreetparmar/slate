"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonLineProps {
  width?: string;
  className?: string;
}

export function SkeletonLine({ width = "100%", className }: SkeletonLineProps) {
  return (
    <div
      className={cn("slate-skeleton-line", className)}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

export function ArchiveListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="slate-skeleton-group" aria-label="Loading archives">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="slate-skeleton-archive-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
        >
          <SkeletonLine width={`${55 + (i % 3) * 12}%`} />
          <SkeletonLine width="1.5rem" className="slate-skeleton-count" />
        </motion.div>
      ))}
    </div>
  );
}

export function SlateDetailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="slate-skeleton-group" aria-label="Loading slate">
      <SkeletonLine width="45%" className="slate-skeleton-title" />
      <div className="slate-skeleton-tasks">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="slate-skeleton-task-row"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
          >
            <SkeletonLine width={`${70 - (i % 2) * 15}%`} />
            {i % 2 === 0 && (
              <SkeletonLine width="55%" className="slate-skeleton-note" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
