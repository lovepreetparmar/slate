"use client";

import { createContext, useContext, type ReactNode } from "react";

const TaskFocusContext = createContext<Record<string, number>>({});

export function TaskFocusProvider({
  weights,
  children,
}: {
  weights: Record<string, number>;
  children: ReactNode;
}) {
  return (
    <TaskFocusContext.Provider value={weights}>
      {children}
    </TaskFocusContext.Provider>
  );
}

export function useTaskFocusWeight(taskId: string) {
  const weights = useContext(TaskFocusContext);
  return weights[taskId] ?? 0;
}
