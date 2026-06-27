"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { triggerCreateHaptic } from "@/lib/haptics";

interface QuickAddProps {
  onAdd: (title: string) => void;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    triggerCreateHaptic();
    onAdd(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="slate-input-bar">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's next?"
        autoComplete="off"
        spellCheck={false}
        className="slate-input"
        aria-label="Add a new task"
      />
    </div>
  );
}
