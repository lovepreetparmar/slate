"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function useIsNewTask(taskId: string) {
  const reducedMotion = useReducedMotion();
  const meta = useUIStore((s) => s.newTaskMeta[taskId]);
  const clearNewTask = useUIStore((s) => s.clearNewTask);

  useEffect(() => {
    if (!meta) return;
    const timer = setTimeout(() => clearNewTask(taskId), 480);
    return () => clearTimeout(timer);
  }, [clearNewTask, meta, taskId]);

  return {
    isNew: Boolean(meta) && !reducedMotion,
    staggerDelay: meta?.stagger ?? 0,
  };
}
