import { prisma } from "@/lib/prisma";
import { normalizeThemePreference, type ThemePreference } from "@/types/theme";

export async function getUserPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { themePreference: true },
  });

  return {
    themePreference: normalizeThemePreference(user?.themePreference),
  };
}

export async function updateUserPreferences(
  userId: string,
  themePreference: ThemePreference
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { themePreference },
    select: { themePreference: true },
  });

  return {
    themePreference: normalizeThemePreference(user.themePreference),
  };
}
