"use client";

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toDateString } from "@/lib/dates";
import type { SlateArchive } from "@/lib/history";
import type { Task } from "@/types";

interface ArchivesResponse {
  slates: SlateArchive[];
  nextCursor: string | null;
}

async function fetchArchives(
  search: string,
  cursor?: string
): Promise<ArchivesResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "15");

  const res = await fetch(`/api/tasks/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch archives");
  return res.json();
}

async function fetchSlateDetail(date: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks/history/${date}`);
  if (!res.ok) throw new Error("Failed to fetch slate");
  const data = await res.json();
  return data.tasks;
}

export function useHistoryArchives(search: string, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ["tasks", "history", "archives", search],
    queryFn: ({ pageParam }) => fetchArchives(search, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
    staleTime: 60_000,
  });

  const slates = query.data?.pages.flatMap((p) => p.slates) ?? [];

  return {
    slates,
    isLoading: query.isLoading,
    isEmpty: !query.isLoading && slates.length === 0,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

export function useSlateDetail(date: string | null) {
  return useQuery({
    queryKey: ["tasks", "history", "slate", date],
    queryFn: () => fetchSlateDetail(date!),
    enabled: !!date,
    staleTime: 60_000,
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to restore task");
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "history"] });
      queryClient.invalidateQueries({
        queryKey: ["tasks", toDateString(new Date())],
      });
    },
  });
}

export function useCopyToToday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/copy-to-today`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to copy task");
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", toDateString(new Date())],
      });
    },
  });
}
