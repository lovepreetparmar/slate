import { format, parseISO } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getToday, getYesterday, toDateString, parseTaskDate } from "@/lib/dates";
import type { CreateTaskInput, UpdateTaskInput } from "@/types";
import { Prisma } from "@prisma/client";

function serializeTask(task: {
  id: string;
  userId: string;
  title: string;
  note: string | null;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
  taskDate: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    note: task.note,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    taskDate: toDateString(task.taskDate),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function getTasksForToday(userId: string) {
  const today = getToday();
  const yesterday = getYesterday();

  const [todayTasks, carryOverTasks, user] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        taskDate: today,
        completed: false,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: {
        userId,
        taskDate: yesterday,
        completed: false,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { hasCompletedTask: true },
    }),
  ]);

  return {
    tasks: todayTasks.map(serializeTask),
    carryOver: carryOverTasks.map((t) => ({
      ...serializeTask(t),
      isCarryOver: true as const,
    })),
    showSwipeHint: !user?.hasCompletedTask,
  };
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const taskDate = input.taskDate
    ? parseTaskDate(input.taskDate)
    : getToday();

  try {
    const task = await prisma.task.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        userId,
        title: input.title.trim(),
        note: input.note?.trim() || null,
        taskDate,
      },
    });

    return serializeTask(task);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Task already exists");
    }
    throw error;
  }
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.completed !== undefined && {
        completed: input.completed,
        completedAt: input.completed ? new Date() : null,
      }),
      ...(input.taskDate !== undefined && {
        taskDate: parseTaskDate(input.taskDate),
      }),
    },
  });

  if (input.completed === true && !existing.completed) {
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedTask: true },
    });
  }

  return serializeTask(task);
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({ where: { id: taskId } });
  return { success: true };
}

export async function handleCarryOver(
  userId: string,
  action: "keep" | "delete" | "keep_all" | "delete_all",
  taskIds?: string[]
) {
  const yesterday = getYesterday();
  const today = getToday();

  const unfinished = await prisma.task.findMany({
    where: {
      userId,
      taskDate: yesterday,
      completed: false,
      ...(taskIds?.length ? { id: { in: taskIds } } : {}),
    },
  });

  if (unfinished.length === 0) {
    return { tasks: [] };
  }

  const ids = unfinished.map((t) => t.id);

  if (action === "delete" || action === "delete_all") {
    await prisma.task.deleteMany({
      where: { id: { in: ids } },
    });
    return { tasks: [] };
  }

  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { taskDate: today },
  });

  const moved = await prisma.task.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "asc" },
  });

  return { tasks: moved.map(serializeTask) };
}

export async function getArchivedSlates(
  userId: string,
  options: { search?: string; cursor?: string; limit?: number } = {}
) {
  const limit = options.limit ?? 15;

  const where: {
    userId: string;
    completed: boolean;
    taskDate?: { lt: Date };
    OR?: Array<{ title: { contains: string } } | { note: { contains: string } }>;
  } = {
    userId,
    completed: true,
  };

  if (options.cursor) {
    where.taskDate = { lt: parseTaskDate(options.cursor) };
  }

  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [{ title: { contains: q } }, { note: { contains: q } }];
  }

  const grouped = await prisma.task.groupBy({
    by: ["taskDate"],
    where,
    _count: { _all: true },
    orderBy: { taskDate: "desc" },
    take: limit + 1,
  });

  const hasMore = grouped.length > limit;
  const page = hasMore ? grouped.slice(0, limit) : grouped;

  const slates = page.map((g) => ({
    date: toDateString(g.taskDate),
    label: format(parseISO(toDateString(g.taskDate) + "T12:00:00"), "MMMM d"),
    taskCount: g._count._all,
  }));

  const nextCursor = hasMore ? slates[slates.length - 1]?.date : null;

  return { slates, nextCursor };
}

export async function getSlateArchiveByDate(userId: string, dateStr: string) {
  const taskDate = parseTaskDate(dateStr);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      taskDate,
      completed: true,
    },
    orderBy: { completedAt: "asc" },
  });

  return tasks.map(serializeTask);
}

export async function restoreTaskToToday(userId: string, taskId: string) {
  const today = getToday();

  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      completed: true,
      taskDate: today,
    },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      completed: false,
      completedAt: null,
    },
  });

  return serializeTask(task);
}

export async function copyTaskToToday(userId: string, taskId: string) {
  const today = getToday();

  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId, completed: true },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  if (existing.taskDate.getTime() === today.getTime()) {
    throw new Error("Use restore for today's tasks");
  }

  const task = await prisma.task.create({
    data: {
      userId,
      title: existing.title,
      note: existing.note,
      taskDate: today,
      completed: false,
    },
  });

  return serializeTask(task);
}
