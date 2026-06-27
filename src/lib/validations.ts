import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

const taskIdSchema = z.string().min(1).max(64);

export const createTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(500),
  note: z.string().max(2000).optional(),
  taskDate: dateStringSchema.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  note: z.string().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  taskDate: dateStringSchema.optional(),
});

export const carryOverSchema = z.object({
  action: z.enum(["keep", "delete", "keep_all", "delete_all"]),
  taskIds: z.array(taskIdSchema).max(100).optional(),
});

export const taskIdParamSchema = taskIdSchema;

export const themePreferenceSchema = z.enum(["dark", "light"]);

export const historyQuerySchema = z.object({
  search: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type ThemePreferenceSchema = z.infer<typeof themePreferenceSchema>;
