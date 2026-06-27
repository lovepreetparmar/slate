"use client";

import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncOfflineQueue } from "@/lib/offline/sync";
import { getSyncQueueCount } from "@/lib/offline/db";
import { toDateString } from "@/lib/dates";
import { useUIStore } from "@/stores/uiStore";

async function refreshSyncCount() {
  const count = await getSyncQueueCount();
  useUIStore.getState().setSyncQueueCount(count);
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const setOnline = useUIStore((s) => s.setOnline);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      await refreshSyncCount();

      const { synced, failed } = await syncOfflineQueue();
      await refreshSyncCount();

      queryClient.invalidateQueries({
        queryKey: ["tasks", toDateString(new Date())],
      });

      if (synced > 0) {
        showToast(
          synced === 1 ? "1 change synced" : `${synced} changes synced`,
          "success"
        );
      }
      if (failed > 0) {
        showToast(
          failed === 1
            ? "1 change could not sync"
            : `${failed} changes could not sync`,
          "error"
        );
      }
    };

    const handleOffline = () => {
      setOnline(false);
      void refreshSyncCount();
    };

    setOnline(navigator.onLine);
    void refreshSyncCount();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      void handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient, setOnline, showToast]);

  return <>{children}</>;
}
