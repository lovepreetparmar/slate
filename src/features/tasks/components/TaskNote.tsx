"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { triggerSelectionHaptic } from "@/lib/haptics";
import { parseNoteCard } from "@/lib/noteCard";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 450;
const TAP_MOVE_PX = 8;
const NOTE_SAVE_DELAY_MS = 500;

interface TaskNoteProps {
  note: string | null;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  focusWeight?: number;
  onActivate: () => void;
  onSelect: () => void;
  onEndEdit: () => void;
  onSave: (value: string) => void;
}

export function TaskNote({
  note,
  isActive,
  isSelected,
  isEditing,
  focusWeight = 0,
  onActivate,
  onSelect,
  onEndEdit,
  onSave,
}: TaskNoteProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reducedMotion = useReducedMotion();
  const [draft, setDraft] = useState(note ?? "");
  const hasNote = !!note?.trim();

  const { debounced: debouncedSave, flush, cancel } = useDebouncedCallback(
    (value: string) => onSave(value),
    NOTE_SAVE_DELAY_MS
  );

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const parsed = useMemo(
    () => (hasNote && note ? parseNoteCard(note) : null),
    [hasNote, note]
  );

  useEffect(() => {
    if (isEditing) {
      setDraft(note ?? "");
    }
  }, [isEditing, note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      cancel();
    }
  }, [cancel, isEditing]);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    debouncedSave(value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleBlur = () => {
    const trimmed = draft.trim();
    const saved = note?.trim() ?? "";
    if (trimmed !== saved) {
      flush(trimmed);
    } else {
      cancel();
    }
    onEndEdit();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditing || isSelected) return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    longPressFiredRef.current = false;

    if (!hasNote) return;

    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      triggerSelectionHaptic();
      onSelect();
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isEditing || isSelected) return;

    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > TAP_MOVE_PX || dy > TAP_MOVE_PX) {
      clearLongPress();
    }
  };

  const handlePointerUp = () => {
    if (isEditing || isSelected) return;
    clearLongPress();
  };

  const handlePointerCancel = () => {
    clearLongPress();
  };

  const handleClick = () => {
    if (isEditing || isSelected) return;
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onActivate();
  };

  const previewText = hasNote && parsed ? parsed.preview : "Add note";
  const previewOpacity = isActive
    ? 0.88
    : hasNote
      ? 0.5 + focusWeight * 0.3
      : 0.35 + focusWeight * 0.2;

  return (
    <div
      className={cn(
        "slate-entry-note",
        isActive && "is-active",
        isSelected && "is-selected",
        isEditing && "is-editing"
      )}
    >
      <div className="slate-entry-note-inner">
        {isEditing ? (
          <div
            className="slate-entry-note-edit"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="slate-entry-note-arrow" aria-hidden="true">
              ↳
            </span>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleInput}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDraft(note ?? "");
                  cancel();
                  onEndEdit();
                }
              }}
              rows={hasNote && parsed?.canExpand ? 5 : 2}
              placeholder={"Due tomorrow\n• Review homepage\n• Update pricing"}
              className="slate-entry-note-input"
              aria-label="Edit note"
            />
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "slate-entry-note-trigger",
              !hasNote && "is-placeholder"
            )}
            aria-label={hasNote ? "Edit note" : "Add note"}
            onClick={isSelected ? onActivate : handleClick}
            onPointerDown={isSelected ? undefined : handlePointerDown}
            onPointerMove={isSelected ? undefined : handlePointerMove}
            onPointerUp={isSelected ? undefined : handlePointerUp}
            onPointerCancel={isSelected ? undefined : handlePointerCancel}
          >
            <span
              className="slate-entry-note-arrow"
              aria-hidden="true"
              style={
                isActive ? undefined : { opacity: 0.25 + focusWeight * 0.15 }
              }
            >
              ↳
            </span>
            <span
              className="slate-entry-note-preview"
              style={{
                opacity: previewOpacity,
                transition: reducedMotion ? "none" : "opacity 0.22s ease",
              }}
            >
              {previewText}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
