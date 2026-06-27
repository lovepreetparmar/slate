"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHydrated } from "@/hooks/useHydrated";
import { toDateString, getYesterdayString } from "@/lib/dates";
import { generateId } from "@/lib/utils";
import { buildOptimisticTask } from "@/lib/tasks-client";
import {
  cacheTasks,
  cacheTask,
  removeCachedTask,
  addToSyncQueue,
  getCachedTasks,
  getSyncQueueCount,
} from "@/lib/offline/db";
import { syncOfflineQueue } from "@/lib/offline/sync";
import {
  dismissSwipeHintLocally,
  isSwipeHintDismissedLocally,
} from "@/lib/swipeHint";
import { useUIStore } from "@/stores/uiStore";
import type { Task, CreateTaskInput, UpdateTaskInput, CarryOverTask } from "@/types";

export interface TasksResponse {
  tasks: Task[];
  carryOver: CarryOverTask[];
  showSwipeHint: boolean;
}

type CarryOverParams = {
  action: "keep" | "delete" | "keep_all" | "delete_all";
  taskIds?: string[];
};

async function refreshSyncQueueCount() {
  const count = await getSyncQueueCount();
  useUIStore.getState().setSyncQueueCount(count);
}

function showError(message: string) {
  useUIStore.getState().showToast(message, "error");
}

async function buildOfflineTasksResponse(): Promise<TasksResponse> {
  const today = toDateString(new Date());
  const yesterday = getYesterdayString();
  const [todayCached, yesterdayCached] = await Promise.all([
    getCachedTasks(today),
    getCachedTasks(yesterday),
  ]);

  await refreshSyncQueueCount();

  return {
    tasks: todayCached.filter((t) => !t.completed),
    carryOver: yesterdayCached
      .filter((t) => !t.completed)
      .map((t) => ({ ...t, isCarryOver: true as const })),
    showSwipeHint: !isSwipeHintDismissedLocally(),
  };
}

async function applyCarryOverToCache(params: CarryOverParams) {
  const yesterday = getYesterdayString();
  const today = toDateString(new Date());
  const yesterdayTasks = await getCachedTasks(yesterday);
  const { action, taskIds } = params;

  if (action === "delete" || action === "delete_all") {
    const idsToRemove =
      action === "delete_all"
        ? yesterdayTasks.map((t) => t.id)
        : (taskIds ?? []);
    await Promise.all(idsToRemove.map((id) => removeCachedTask(id)));
    return;
  }

  const toKeep =
    action === "keep_all"
      ? yesterdayTasks
      : yesterdayTasks.filter((t) => (taskIds ?? []).includes(t.id));

  await Promise.all(
    toKeep.map((task) =>
      cacheTask({
        ...task,
        taskDate: today,
        updatedAt: new Date().toISOString(),
      })
    )
  );
}

async function fetchTasks(): Promise<TasksResponse> {
  if (!navigator.onLine) {
    return buildOfflineTasksResponse();
  }

  const res = await fetch("/api/tasks");
  if (res.status === 401) {
    showError("Session expired. Please sign in again.");
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    return buildOfflineTasksResponse();
  }

  const data: TasksResponse = await res.json();
  const activeTasks = data.tasks.filter((t) => !t.completed);
  await cacheTasks([...activeTasks, ...data.carryOver]);

  if (!data.showSwipeHint) {
    dismissSwipeHintLocally();
  }

  return {
    ...data,
    tasks: activeTasks,
    showSwipeHint: data.showSwipeHint && !isSwipeHintDismissedLocally(),
  };
}

export function useTasks(initialData?: TasksResponse) {
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const queryKey = ["tasks", toDateString(new Date())];

  const query = useQuery({
    queryKey,
    queryFn: fetchTasks,
    initialData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateTaskInput & { id: string }) => {
      const optimisticTask = buildOptimisticTask(input);

      if (!navigator.onLine) {
        await cacheTask(optimisticTask);
        await addToSyncQueue({
          type: "create",
          payload: {
            id: optimisticTask.id,
            title: optimisticTask.title,
            note: optimisticTask.note ?? undefined,
            taskDate: optimisticTask.taskDate,
          },
        });
        await refreshSyncQueueCount();
        return optimisticTask;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      await cacheTask(task);
      return task;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);
      const optimisticTask = buildOptimisticTask(input);

      queryClient.setQueryData<TasksResponse>(queryKey, (old) => ({
        tasks: [...(old?.tasks ?? []), optimisticTask],
        carryOver: old?.carryOver ?? [],
        showSwipeHint: old?.showSwipeHint ?? false,
      }));

      useUIStore.getState().registerNewTask(input.id);

      return { previous };
    },
    onSuccess: (serverTask) => {
      queryClient.setQueryData<TasksResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === serverTask.id ? serverTask : t
          ),
        };
      });
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Could not add task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      if (!navigator.onLine) {
        const data = queryClient.getQueryData<TasksResponse>(queryKey);
        const task = data?.tasks.find((t) => t.id === id);
        if (task) {
          const updated = {
            ...task,
            ...input,
            completedAt: input.completed ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          };
          await cacheTask(updated);
          await addToSyncQueue({ type: "update", payload: { id, ...input } });
          await refreshSyncQueueCount();
          return updated;
        }
      }

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error("Failed to update task");
      const task = await res.json();
      await cacheTask(task);
      return task;
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      queryClient.setQueryData<TasksResponse>(queryKey, (old) => {
        if (!old) return old;

        if (input.completed === true) {
          dismissSwipeHintLocally();
          return {
            ...old,
            tasks: old.tasks.filter((t) => t.id !== id),
            showSwipeHint: false,
          };
        }

        if (input.completed === false) {
          const exists = old.tasks.some((t) => t.id === id);
          const restored = previous?.tasks.find((t) => t.id === id);
          if (!exists && restored) {
            return {
              ...old,
              tasks: [
                ...old.tasks,
                { ...restored, completed: false, completedAt: null },
              ],
            };
          }
          if (!exists && input.title) {
            return {
              ...old,
              tasks: [
                ...old.tasks,
                {
                  id,
                  userId: "local",
                  title: input.title,
                  note: input.note ?? null,
                  completed: false,
                  completedAt: null,
                  taskDate: toDateString(new Date()),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            };
          }
        }

        const tasks = old.tasks.map((t) =>
          t.id === id
            ? { ...t, ...input, updatedAt: new Date().toISOString() }
            : t
        );
        return { ...old, tasks };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Could not save changes");
    },
    onSettled: (_data, _err, variables) => {
      if (variables.completed !== undefined) {
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ["tasks", "history"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        await removeCachedTask(id);
        await addToSyncQueue({ type: "delete", payload: { id } });
        await refreshSyncQueueCount();
        return;
      }

      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      await removeCachedTask(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      queryClient.setQueryData<TasksResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t) => t.id !== id),
          carryOver: old.carryOver.filter((t) => t.id !== id),
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Could not delete task");
    },
  });

  const carryOverMutation = useMutation({
    mutationFn: async (params: CarryOverParams) => {
      if (!navigator.onLine) {
        await applyCarryOverToCache(params);
        await addToSyncQueue({ type: "carryOver", payload: params });
        await refreshSyncQueueCount();
        return { tasks: [] };
      }

      const res = await fetch("/api/tasks/carry-over", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to process carry over");
      return res.json();
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);
      const today = toDateString(new Date());

      queryClient.setQueryData<TasksResponse>(queryKey, (old) => {
        if (!old) return old;

        const { action, taskIds } = params;

        if (action === "delete" || action === "delete_all") {
          const idsToRemove =
            action === "delete_all"
              ? old.carryOver.map((t) => t.id)
              : (taskIds ?? []);
          const removeSet = new Set(idsToRemove);
          return {
            ...old,
            carryOver: old.carryOver.filter((t) => !removeSet.has(t.id)),
          };
        }

        const toKeep =
          action === "keep_all"
            ? old.carryOver
            : old.carryOver.filter((t) => (taskIds ?? []).includes(t.id));

        const keptIds = new Set(toKeep.map((t) => t.id));
        const movedTasks: Task[] = toKeep.map((carryTask) => {
          const { isCarryOver: _carryOver, ...task } = carryTask;
          void _carryOver;
          return {
            ...task,
            taskDate: today,
            updatedAt: new Date().toISOString(),
          };
        });

        return {
          ...old,
          tasks: [...old.tasks, ...movedTasks],
          carryOver: old.carryOver.filter((t) => !keptIds.has(t.id)),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      showError("Could not process carry-over");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const sync = async () => {
    await syncOfflineQueue();
    queryClient.invalidateQueries({ queryKey });
  };

  const showSwipeHint = hydrated
    ? (query.data?.showSwipeHint ?? false) && !isSwipeHintDismissedLocally()
    : (query.data?.showSwipeHint ?? false);

  const createTask = useCallback(
    (input: CreateTaskInput) => {
      createMutation.mutate({ ...input, id: input.id ?? generateId() });
    },
    [createMutation]
  );

  return {
    tasks: query.data?.tasks ?? [],
    carryOverTasks: query.data?.carryOver ?? [],
    showSwipeHint,
    isLoading: query.isLoading,
    createTask,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    processCarryOver: carryOverMutation.mutate,
    sync,
  };
}
