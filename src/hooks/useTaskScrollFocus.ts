"use client";

import { useEffect, useState, type RefObject } from "react";

export function useTaskScrollFocus(
  scrollRef: RefObject<HTMLElement | null>,
  taskIds: string[],
  enabled: boolean
) {
  const [focusWeights, setFocusWeights] = useState<Record<string, number>>({});
  const taskIdsKey = taskIds.join(",");

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !enabled || taskIds.length === 0) {
      setFocusWeights({});
      return;
    }

    let raf = 0;

    const update = () => {
      const containerRect = scrollEl.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      const spread = Math.max(containerRect.height * 0.38, 120);

      const rows = scrollEl.querySelectorAll<HTMLElement>("[data-task-id]");
      const weights: Record<string, number> = {};

      if (rows.length === 1) {
        const id = rows[0]?.dataset.taskId;
        if (id) {
          weights[id] = 1;
          setFocusWeights(weights);
          return;
        }
      }

      rows.forEach((row) => {
        const id = row.dataset.taskId;
        if (!id) return;

        const rect = row.getBoundingClientRect();
        const taskCenter = rect.top + rect.height / 2;
        const dist = Math.abs(taskCenter - centerY);
        const weight = Math.max(0, 1 - dist / spread);

        weights[id] = weight;
      });

      setFocusWeights(weights);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(() => onScroll());

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    resizeObserver.observe(scrollEl);
    raf = requestAnimationFrame(update);

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scrollRef, taskIdsKey, enabled]);

  return focusWeights;
}
