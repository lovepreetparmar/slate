import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUserId, parseJsonBody, apiError } from "@/lib/api";
import { themePreferenceSchema } from "@/lib/validations";
import { getUserPreferences, updateUserPreferences } from "@/server/user";
import type { ThemePreference } from "@/types/theme";

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const preferences = await getUserPreferences(userId);
  return NextResponse.json(preferences);
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await parseJsonBody(
    request,
    z.object({ themePreference: themePreferenceSchema })
  );
  if (body instanceof NextResponse) return body;

  try {
    const preferences = await updateUserPreferences(
      userId,
      body.data.themePreference as ThemePreference
    );
    return NextResponse.json(preferences);
  } catch (error) {
    return apiError(error);
  }
}
