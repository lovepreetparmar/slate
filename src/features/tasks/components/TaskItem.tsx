"use client";

import { motion, animate, type HTMLMotionProps } from "framer-motion";
import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { useTaskFocusWeight } from "@/contexts/TaskFocusContext";
import { useUIStore } from "@/stores/uiStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsNewTask } from "@/hooks/useIsNewTask";
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe";
import {
  TASK_CREATE_TRANSITION,
  taskEnterReducedVariants,
  taskEnterVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TaskNote } from "./TaskNote";
import type { Task } from "@/types";

const COMPLETE_RATIO = 0.42;
const CLEAR_DURATION = 0.28;
const EASE = [0.25, 0.1, 0.25, 1] as const;
const HINT_OFFSET = 10;
const HINT_DELAY_MS = 2000;
const HINT_HOLD_MS = 1000;

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  enableSwipeHint?: boolean;
}

export function TaskItem({
  task,
  onComplete,
  onDelete,
  onUpdateTitle,
  onUpdateNote,
  enableSwipeHint = false,
}: TaskItemProps) {
  return (
    <ActiveTaskItem
      task={task}
      onComplete={onComplete}
      onDelete={onDelete}
      onUpdateTitle={onUpdateTitle}
      onUpdateNote={onUpdateNote}
      enableSwipeHint={enableSwipeHint}
    />
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function TaskEntryWrap({
  taskId,
  className,
  children,
  ...props
}: {
  taskId: string;
  className?: string;
  children: ReactNode;
} & HTMLMotionProps<"div">) {
  const reducedMotion = useReducedMotion();
  const { isNew, staggerDelay } = useIsNewTask(taskId);

  return (
    <motion.div
      variants={reducedMotion ? taskEnterReducedVariants : taskEnterVariants}
      initial={isNew ? "initial" : false}
      animate="animate"
      exit="exit"
      transition={{
        opacity: { ...TASK_CREATE_TRANSITION, delay: staggerDelay },
        y: { ...TASK_CREATE_TRANSITION, delay: staggerDelay },
        scale: { ...TASK_CREATE_TRANSITION, delay: staggerDelay },
        filter: {
          duration: 0.28,
          ease: TASK_CREATE_TRANSITION.ease,
          delay: staggerDelay,
        },
      }}
      className={cn("slate-entry-wrap", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function ActiveTaskItem({
  task,
  onComplete,
  onDelete,
  onUpdateTitle,
  onUpdateNote,
  enableSwipeHint = false,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  enableSwipeHint?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeWrapRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const dismissedRef = useRef(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [showClearLabel, setShowClearLabel] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const hintAbortRef = useRef(false);
  const hintPlayedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const focusWeight = useTaskFocusWeight(task.id);
  const { isNew } = useIsNewTask(task.id);

  const { activeTaskId, editingField, activateTask, selectNote, clearEditing, clearActiveTask } =
    useUIStore();

  const isActive = activeTaskId === task.id;
  const isEditingTitle = isActive && editingField === "title";
  const isEditingNote = isActive && editingField === "note";
  const isEditing = isEditingTitle || isEditingNote;
  const isNoteSelected =
    isActive && editingField === null && !!task.note?.trim();
  const hasNote = !!task.note?.trim();

  const handleSwipeLeft = useCallback(() => {
    clearEditing();
    if (hasNote) {
      onUpdateNote(task.id, "");
      return false;
    }
    dismissedRef.current = true;
    setIsClearing(true);
    clearActiveTask();
    onDelete(task.id);
    return true;
  }, [clearActiveTask, clearEditing, hasNote, onDelete, onUpdateNote, task.id]);

  const handleClearComplete = useCallback(() => {
    dismissedRef.current = true;
    setIsClearing(true);
    onComplete(task.id);
    return true;
  }, [onComplete, task.id]);

  const dragEnabled = !isEditing && !isClearing && !isHinting;

  const swipe = useHorizontalSwipe({
    enabled: dragEnabled,
    containerRef: swipeWrapRef,
    onSwipeRight: handleClearComplete,
    onSwipeLeft: handleSwipeLeft,
    allowSwipeLeft: true,
    allowSwipeRight: true,
    reducedMotion,
    thresholdRatio: COMPLETE_RATIO,
    completeDuration: CLEAR_DURATION,
    useClearHaptic: true,
  });

  const isDismissed = isClearing || dismissedRef.current;
  const focusOpacity = isDismissed ? 0 : 0.72 + focusWeight * 0.28;
  const focusBrightness = 1 + focusWeight * 0.04;
  const focusShadow = `inset 0 1px 0 var(--entry-inset-highlight), 0 1px ${3 + focusWeight * 3}px ${5 + focusWeight * 5}px var(--entry-shadow)`;

  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      const len = titleInputRef.current.value.length;
      titleInputRef.current.setSelectionRange(len, len);
      titleInputRef.current.style.height = "auto";
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
    }
  }, [isEditingTitle]);

  const cancelHint = useCallback(() => {
    hintAbortRef.current = true;
    setIsHinting(false);
    setShowClearLabel(false);
    void animate(swipe.x, 0, { duration: 0.3, ease: EASE });
  }, [swipe.x]);

  useEffect(() => {
    if (swipe.isDragging && isHinting) {
      cancelHint();
    }
  }, [cancelHint, swipe.isDragging, isHinting]);

  useEffect(() => {
    if (
      !enableSwipeHint ||
      reducedMotion ||
      isEditing ||
      hintPlayedRef.current
    ) {
      return;
    }

    hintPlayedRef.current = true;
    hintAbortRef.current = false;
    let cancelled = false;

    const runHint = async () => {
      await delay(HINT_DELAY_MS);
      if (cancelled || hintAbortRef.current) return;

      setIsHinting(true);
      setShowClearLabel(true);

      await animate(swipe.x, HINT_OFFSET, { duration: 0.45, ease: EASE });
      if (cancelled || hintAbortRef.current) return;

      await delay(HINT_HOLD_MS);
      if (cancelled || hintAbortRef.current) return;

      await animate(swipe.x, 0, { duration: 0.45, ease: EASE });
      if (cancelled || hintAbortRef.current) return;

      setShowClearLabel(false);
      setIsHinting(false);
    };

    runHint();

    return () => {
      cancelled = true;
      hintAbortRef.current = true;
      setIsHinting(false);
      setShowClearLabel(false);
    };
  }, [enableSwipeHint, isEditing, reducedMotion, swipe.x]);

  const handleTitleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    activateTask(task.id, "title");
  };

  const handleTitleBlur = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    } else {
      setTitleDraft(task.title);
    }
    clearEditing();
  };

  const handleTitleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitleDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleNoteActivate = () => {
    activateTask(task.id, "note");
  };

  const handleNoteSelect = () => {
    selectNote(task.id);
  };

  const handleNoteEndEdit = () => {
    clearEditing();
  };

  const allowSwipe = dragEnabled;

  const entryContent = (
    <>
      {isEditingTitle ? (
        <textarea
          ref={titleInputRef}
          className="slate-entry-title-input is-editing"
          value={titleDraft}
          onChange={handleTitleInput}
          onBlur={handleTitleBlur}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setTitleDraft(task.title);
              clearEditing();
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              titleInputRef.current?.blur();
            }
          }}
          rows={1}
          aria-label="Edit task title"
        />
      ) : (
        <button
          type="button"
          className={cn(
            "slate-entry-title-trigger",
            isNew && "is-inscribing"
          )}
          onClick={handleTitleActivate}
          onPointerDown={
            allowSwipe ? undefined : (e) => e.stopPropagation()
          }
        >
          {task.title}
        </button>
      )}
      <TaskNote
        note={task.note}
        isActive={isActive}
        isSelected={isNoteSelected}
        isEditing={isEditingNote}
        focusWeight={focusWeight}
        onActivate={handleNoteActivate}
        onSelect={handleNoteSelect}
        onEndEdit={handleNoteEndEdit}
        onSave={(value) => onUpdateNote(task.id, value)}
      />
    </>
  );

  const entryShell = (isDragging: boolean, isCompleting: boolean) => (
    <article
      className={cn(
        "slate-entry",
        isActive && "is-active",
        isDismissed && "is-clearing",
        isDragging && "is-dragging"
      )}
      style={{
        filter: reducedMotion ? undefined : `brightness(${focusBrightness})`,
        boxShadow: focusShadow,
        opacity: isCompleting || isDismissed ? 0 : focusOpacity,
      }}
    >
      <motion.div
        className="slate-entry-swipe-tint slate-entry-swipe-tint--archive"
        style={{ opacity: swipe.archiveTintOpacity }}
        aria-hidden="true"
      />
      <motion.div
        className="slate-entry-swipe-tint slate-entry-swipe-tint--delete"
        style={{ opacity: swipe.deleteTintOpacity }}
        aria-hidden="true"
      />
      <motion.div
        className="slate-entry-swipe-border slate-entry-swipe-border--archive"
        style={{ opacity: swipe.archiveBorderOpacity }}
        aria-hidden="true"
      />
      <motion.div
        className="slate-entry-swipe-border slate-entry-swipe-border--delete"
        style={{ opacity: swipe.deleteBorderOpacity }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "slate-entry-content",
          allowSwipe && "slate-entry-content--swipe"
        )}
      >
        {entryContent}
        {isActive && !isEditing && (
          <div className="sr-only">
            <button type="button" onClick={() => onComplete(task.id)}>
              Complete task
            </button>
            <button type="button" onClick={() => onDelete(task.id)}>
              Delete task
            </button>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <TaskEntryWrap
      ref={containerRef}
      taskId={task.id}
      data-task-id={task.id}
      className={
        isDismissed || swipe.isCompleting ? "pointer-events-none" : undefined
      }
    >
      <div
        ref={swipeWrapRef}
        className={cn(
          "slate-entry-swipe-wrap",
          swipe.isDragging && "is-dragging",
          swipe.isCompleting && "is-collapsing"
        )}
      >
        <motion.div
          className="slate-entry-reveal slate-entry-reveal--archive"
          style={{ opacity: swipe.revealOpacityRight }}
          aria-hidden="true"
        >
          <span className="slate-entry-reveal-label">Archive Note</span>
        </motion.div>

        <motion.div
          className="slate-entry-reveal slate-entry-reveal--right slate-entry-reveal--delete"
          style={{ opacity: swipe.revealOpacityLeft }}
          aria-hidden="true"
        >
          <span className="slate-entry-reveal-label">
            {hasNote ? "Delete Note" : "Delete"}
          </span>
        </motion.div>

        <motion.div
          style={{ x: swipe.x }}
          className={cn(
            "slate-entry-drag-shell",
            swipe.isDragging && "is-dragging"
          )}
        >
          {entryShell(swipe.isDragging, swipe.isCompleting)}
        </motion.div>
      </div>

      <motion.p
        className="slate-swipe-hint-label"
        initial={false}
        animate={{ opacity: showClearLabel ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        aria-hidden="true"
      >
        → Archive
      </motion.p>
    </TaskEntryWrap>
  );
}
