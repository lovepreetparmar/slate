"use client";

import { useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks, type TasksResponse } from "@/hooks/useTasks";
import { useUIStore } from "@/stores/uiStore";
import { toDateString } from "@/lib/dates";
import { TodayHeader } from "./TodayHeader";
import { QuickAdd } from "./QuickAdd";
import { TaskList } from "./TaskList";
import { CarryOverSection } from "./CarryOverSection";
import { UndoToast } from "./UndoToast";
import { EmptyState } from "./EmptyState";

interface TodayScreenProps {
  displayDate: string;
  initialTasks?: TasksResponse;
}

export function TodayScreen({ displayDate, initialTasks }: TodayScreenProps) {
  const {
    tasks,
    carryOverTasks,
    createTask,
    updateTask,
    processCarryOver,
    deleteTask,
    showSwipeHint,
  } = useTasks(initialTasks);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showUndo, activeTaskId, clearActiveTask } = useUIStore();

  const activeTasks = tasks.filter((t) => !t.completed);
  const isEmpty =
    activeTasks.length === 0 && carryOverTasks.length === 0;

  const handleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.completed) return;

      updateTask({ id, completed: true });
      clearActiveTask();

      showUndo(id, task.title, () => {
        updateTask({
          id,
          completed: false,
          title: task.title,
          note: task.note ?? undefined,
        });
      });
    },
    [tasks, updateTask, showUndo, clearActiveTask]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTask(id);
      clearActiveTask();
    },
    [clearActiveTask, deleteTask]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeTaskId) return;
      const task = tasks.find((t) => t.id === activeTaskId);
      if (!task || task.completed) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleComplete(activeTaskId);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          handleDeleteTask(activeTaskId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTaskId, tasks, handleComplete, handleDeleteTask]);

  const handleUpdateTitle = (id: string, title: string) => {
    updateTask({ id, title });
  };

  const handleUpdateNote = (id: string, note: string) => {
    updateTask({ id, note: note || null });
  };

  const handleKeep = (id: string) => {
    processCarryOver({ action: "keep", taskIds: [id] });
  };

  const handleDeleteCarryOver = (id: string) => {
    processCarryOver({ action: "delete", taskIds: [id] });
  };

  return (
    <>
      <div className="slate-root slate-today">
        <div className="slate-container slate-today-shell">
          <header className="slate-today-header">
            <TodayHeader displayDate={displayDate} />
          </header>

          <div
            id="main-content"
            ref={scrollRef}
            className={`slate-today-scroll slate-scroll-hidden ${
              isEmpty ? "is-empty" : ""
            }`}
          >
            <CarryOverSection
              tasks={carryOverTasks}
              onKeep={handleKeep}
              onDelete={handleDeleteCarryOver}
              onKeepAll={() => processCarryOver({ action: "keep_all" })}
              onDeleteAll={() => processCarryOver({ action: "delete_all" })}
            />

            <AnimatePresence mode="popLayout">
              {isEmpty ? (
                <EmptyState key="empty" />
              ) : (
                <TaskList
                  key="tasks"
                  tasks={activeTasks}
                  onComplete={handleComplete}
                  onDelete={handleDeleteTask}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateNote={handleUpdateNote}
                  showSwipeHint={showSwipeHint}
                  scrollRef={scrollRef}
                />
              )}
            </AnimatePresence>
          </div>

          <footer className="slate-composer-fixed">
            <QuickAdd
              onAdd={(title) =>
                createTask({ title, taskDate: toDateString(new Date()) })
              }
            />
          </footer>
        </div>
      </div>

      <UndoToast />
    </>
  );
}
