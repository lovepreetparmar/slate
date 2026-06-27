"use client";

import { motion } from "framer-motion";
import { useSlateDetail, useRestoreTask, useCopyToToday } from "@/hooks/useHistory";
import { PageShell } from "@/components/motion/PageShell";
import { SlateDetailSkeleton } from "@/components/motion/Skeleton";
import { isToday } from "@/lib/dates";
import {
  formatSlateDateFull,
  formatCompletedTime,
} from "@/lib/history";
import { SLATE_TRANSITION } from "@/lib/motion";

interface SlateDetailScreenProps {
  date: string;
}

export function SlateDetailScreen({ date }: SlateDetailScreenProps) {
  const { data: tasks, isLoading } = useSlateDetail(date);
  const restoreMutation = useRestoreTask();
  const copyMutation = useCopyToToday();
  const isTodayArchive = isToday(date);

  const handleRestore = (taskId: string) => {
    restoreMutation.mutate(taskId);
  };

  const handleCopy = (taskId: string) => {
    copyMutation.mutate(taskId);
  };

  const isPending = restoreMutation.isPending || copyMutation.isPending;

  return (
    <PageShell backHref="/history">
      <div className="slate-archive-detail">
        <motion.h1
          layoutId={`archive-date-${date}`}
          className="slate-archive-detail-title"
          transition={SLATE_TRANSITION.layout}
        >
          {formatSlateDateFull(date)}
        </motion.h1>

        {isLoading && <SlateDetailSkeleton />}

        {!isLoading && (!tasks || tasks.length === 0) && (
          <p className="slate-page-empty">
            This slate has no cleared tasks.
          </p>
        )}

        {!isLoading && tasks && tasks.length > 0 && (
          <ul className="slate-detail-list">
            {tasks.map((task, index) => {
              const clearedAt = formatCompletedTime(task.completedAt);
              return (
                <motion.li
                  key={task.id}
                  className="slate-detail-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...SLATE_TRANSITION.enter,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                >
                  <div className="slate-detail-task">
                    <p className="slate-detail-task-title">
                      <span className="slate-detail-check" aria-hidden="true">
                        ✓
                      </span>
                      {task.title}
                    </p>
                    {task.note && (
                      <p className="slate-detail-task-note">
                        <span className="slate-note-mark">↳</span> {task.note}
                      </p>
                    )}
                    {clearedAt && (
                      <p className="slate-detail-task-time">
                        Cleared {clearedAt}
                      </p>
                    )}
                  </div>
                  {isTodayArchive ? (
                    <button
                      onClick={() => handleRestore(task.id)}
                      disabled={isPending}
                      className="slate-detail-action"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCopy(task.id)}
                      disabled={isPending}
                      className="slate-detail-action"
                    >
                      Copy to Today
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
