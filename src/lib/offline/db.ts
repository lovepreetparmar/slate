import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Task, SyncAction } from "@/types";

interface SlateDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { "by-date": string };
  };
  syncQueue: {
    key: number;
    value: SyncAction & { timestamp: number };
  };
  meta: {
    key: string;
    value: { lastSynced: string | null };
  };
}

const DB_NAME = "slate-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SlateDB>> | null = null;

export function getOfflineDB() {
  if (!dbPromise) {
    dbPromise = openDB<SlateDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
        taskStore.createIndex("by-date", "taskDate");

        db.createObjectStore("syncQueue", {
          keyPath: "timestamp",
          autoIncrement: true,
        });

        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

export function getSyncActionTaskId(action: SyncAction): string | null {
  switch (action.type) {
    case "create":
    case "update":
    case "delete":
      return action.payload.id;
    case "carryOver":
      return null;
  }
}

export function mergeSyncQueue(
  queue: (SyncAction & { timestamp: number })[],
  action: SyncAction
): (SyncAction & { timestamp: number })[] {
  if (action.type === "delete") {
    const id = action.payload.id;
    const hadCreate = queue.some(
      (item) => item.type === "create" && item.payload.id === id
    );
    const withoutTask = queue.filter(
      (item) =>
        !(
          (item.type === "create" ||
            item.type === "update" ||
            item.type === "delete") &&
          item.payload.id === id
        )
    );
    if (hadCreate) return withoutTask;
    return [...withoutTask, { ...action, timestamp: Date.now() }];
  }

  if (action.type === "update") {
    const id = action.payload.id;
    const createIdx = queue.findIndex(
      (item) => item.type === "create" && item.payload.id === id
    );
    if (createIdx !== -1) {
      const next = [...queue];
      const createItem = next[createIdx];
      if (createItem.type === "create") {
        next[createIdx] = {
          ...createItem,
          payload: {
            ...createItem.payload,
            title: action.payload.title ?? createItem.payload.title,
            note:
              action.payload.note !== undefined
                ? (action.payload.note ?? undefined)
                : createItem.payload.note,
            taskDate: action.payload.taskDate ?? createItem.payload.taskDate,
          },
        };
        return next;
      }
    }

    const updateIdx = queue.findIndex(
      (item) => item.type === "update" && item.payload.id === id
    );
    if (updateIdx !== -1) {
      const next = [...queue];
      const updateItem = next[updateIdx];
      if (updateItem.type === "update") {
        next[updateIdx] = {
          ...updateItem,
          payload: { ...updateItem.payload, ...action.payload },
        };
        return next;
      }
    }
  }

  return [...queue, { ...action, timestamp: Date.now() }];
}

export async function cacheTasks(tasks: Task[]) {
  const db = await getOfflineDB();
  const tx = db.transaction("tasks", "readwrite");
  await Promise.all([
    ...tasks.map((task) => tx.store.put(task)),
    tx.done,
  ]);
}

export async function getCachedTasks(taskDate: string): Promise<Task[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex("tasks", "by-date", taskDate);
}

export async function cacheTask(task: Task) {
  const db = await getOfflineDB();
  await db.put("tasks", task);
}

export async function removeCachedTask(id: string) {
  const db = await getOfflineDB();
  await db.delete("tasks", id);
}

export async function addToSyncQueue(action: SyncAction) {
  const db = await getOfflineDB();
  const queue = await db.getAll("syncQueue");
  const merged = mergeSyncQueue(queue, action);

  const tx = db.transaction("syncQueue", "readwrite");
  await tx.store.clear();

  for (const item of merged) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getOfflineDB();
  return db.count("syncQueue");
}

export async function getSyncQueue(): Promise<(SyncAction & { timestamp: number })[]> {
  const db = await getOfflineDB();
  return db.getAll("syncQueue");
}

export async function clearSyncQueue() {
  const db = await getOfflineDB();
  await db.clear("syncQueue");
}

export async function removeSyncQueueItem(timestamp: number) {
  const db = await getOfflineDB();
  await db.delete("syncQueue", timestamp);
}

export async function setLastSynced(iso: string) {
  const db = await getOfflineDB();
  await db.put("meta", { lastSynced: iso }, "lastSynced");
}

export async function getLastSynced(): Promise<string | null> {
  const db = await getOfflineDB();
  const meta = await db.get("meta", "lastSynced");
  return meta?.lastSynced ?? null;
}
