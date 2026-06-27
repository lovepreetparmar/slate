import {
  getSyncQueue,
  removeSyncQueueItem,
  setLastSynced,
  cacheTask,
  removeCachedTask,
} from "./db";
import type { SyncAction } from "@/types";

async function executeSyncAction(action: SyncAction): Promise<boolean> {
  try {
    switch (action.type) {
      case "create": {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: action.payload.id,
            title: action.payload.title,
            note: action.payload.note,
            taskDate: action.payload.taskDate,
          }),
        });
        if (!res.ok) return false;
        const serverTask = await res.json();
        await removeCachedTask(action.payload.id);
        await cacheTask(serverTask);
        return true;
      }
      case "update": {
        const res = await fetch(`/api/tasks/${action.payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
        });
        if (!res.ok) return false;
        const serverTask = await res.json();
        await cacheTask(serverTask);
        return true;
      }
      case "delete": {
        const res = await fetch(`/api/tasks/${action.payload.id}`, {
          method: "DELETE",
        });
        if (!res.ok) return false;
        await removeCachedTask(action.payload.id);
        return true;
      }
      case "carryOver": {
        const res = await fetch("/api/tasks/carry-over", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
        });
        return res.ok;
      }
    }
  } catch {
    return false;
  }
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    const success = await executeSyncAction(item);
    if (success) {
      await removeSyncQueueItem(item.timestamp);
      synced++;
    } else {
      failed++;
    }
  }

  if (synced > 0) {
    await setLastSynced(new Date().toISOString());
  }

  return { synced, failed };
}
