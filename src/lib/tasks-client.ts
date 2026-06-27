import { toDateString } from "@/lib/dates";
import type { Task, CreateTaskInput } from "@/types";

export function buildOptimisticTask(
  input: CreateTaskInput & { id: string }
): Task {
  const taskDate = input.taskDate ?? toDateString(new Date());
  return {
    id: input.id,
    userId: "local",
    title: input.title.trim(),
    note: input.note?.trim() ?? null,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    taskDate,
    updatedAt: new Date().toISOString(),
  };
}
