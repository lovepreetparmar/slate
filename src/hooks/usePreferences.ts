"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  normalizeThemePreference,
  type ThemePreference,
} from "@/types/theme";

interface Preferences {
  themePreference: ThemePreference;
}

async function fetchPreferences(): Promise<Preferences> {
  const res = await fetch("/api/user/preferences");
  if (!res.ok) throw new Error("Failed to fetch preferences");
  const data = await res.json();
  return {
    themePreference: normalizeThemePreference(data.themePreference),
  };
}

async function updatePreferences(
  themePreference: ThemePreference
): Promise<Preferences> {
  const res = await fetch("/api/user/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ themePreference }),
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}

export function usePreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user", "preferences"],
    queryFn: fetchPreferences,
    staleTime: 300_000,
  });

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (themePreference) => {
      await queryClient.cancelQueries({ queryKey: ["user", "preferences"] });
      const previous = queryClient.getQueryData<Preferences>([
        "user",
        "preferences",
      ]);
      queryClient.setQueryData(["user", "preferences"], { themePreference });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user", "preferences"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });

  return {
    themePreference: query.data?.themePreference ?? "dark",
    isLoading: query.isLoading,
    setThemePreference: mutation.mutate,
  };
}
