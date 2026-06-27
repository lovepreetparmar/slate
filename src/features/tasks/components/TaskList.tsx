"use client";

import { type RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import { TaskFocusProvider } from "@/contexts/TaskFocusContext";
import { useTaskScrollFocus } from "@/hooks/useTaskScrollFocus";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  showSwipeHint?: boolean;
  scrollRef?: RefObject<HTMLElement | null>;
}

export function TaskList({
  tasks,
  onComplete,
  onDelete,
  onUpdateTitle,
  onUpdateNote,
  showSwipeHint = false,
  scrollRef,
}: TaskListProps) {
  const taskIds = tasks.map((t) => t.id);
  const focusWeights = useTaskScrollFocus(
    scrollRef ?? { current: null },
    taskIds,
    Boolean(scrollRef) && tasks.length > 0
  );

  if (tasks.length === 0) return null;

  return (
    <TaskFocusProvider weights={focusWeights}>
      <section className="slate-task-list">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onUpdateTitle={onUpdateTitle}
              onUpdateNote={onUpdateNote}
              enableSwipeHint={showSwipeHint && index === 0}
            />
          ))}
        </AnimatePresence>
      </section>
    </TaskFocusProvider>
  );
}
