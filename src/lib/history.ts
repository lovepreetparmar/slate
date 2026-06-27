import { format, parseISO } from "date-fns";
import type { Task } from "@/types";

export interface SlateArchive {
  date: string;
  label: string;
  taskCount: number;
}

export function formatSlateDate(dateStr: string): string {
  return format(parseISO(dateStr + "T12:00:00"), "MMMM d");
}

export function formatSlateDateFull(dateStr: string): string {
  return format(parseISO(dateStr + "T12:00:00"), "MMMM d, yyyy");
}

export function formatCompletedTime(iso: string | null): string | null {
  if (!iso) return null;
  return format(parseISO(iso), "h:mm a");
}

export function groupTasksBySlateDate(tasks: Task[]): SlateArchive[] {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (!task.completed) continue;
    counts.set(task.taskDate, (counts.get(task.taskDate) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, taskCount]) => ({
      date,
      label: formatSlateDate(date),
      taskCount,
    }));
}
