"use client";

import { motion } from "framer-motion";
import type { CarryOverTask } from "@/types";

interface CarryOverSectionProps {
  tasks: CarryOverTask[];
  onKeep: (id: string) => void;
  onDelete: (id: string) => void;
  onKeepAll: () => void;
  onDeleteAll: () => void;
}

export function CarryOverSection({
  tasks,
  onKeep,
  onDelete,
  onKeepAll,
  onDeleteAll,
}: CarryOverSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="slate-carryover"
      aria-label="Tasks from yesterday"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="slate-carryover-label">From yesterday</p>
        <div className="flex gap-3">
          <button
            onClick={onKeepAll}
            className="slate-btn-ghost"
            aria-label="Keep all tasks from yesterday"
          >
            Keep all
          </button>
          <button
            onClick={onDeleteAll}
            className="slate-btn-ghost"
            aria-label="Delete all tasks from yesterday"
          >
            Delete all
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between gap-4"
          >
            <span className="slate-carryover-item truncate flex-1">
              {task.title}
            </span>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => onKeep(task.id)}
                className="slate-btn-ghost"
                aria-label={`Keep "${task.title}"`}
              >
                Keep
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="slate-btn-ghost"
                aria-label={`Delete "${task.title}"`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
