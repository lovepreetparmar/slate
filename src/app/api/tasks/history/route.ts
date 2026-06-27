import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api";
import { historyQuerySchema } from "@/lib/validations";
import { getArchivedSlates } from "@/server/tasks";

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { searchParams } = new URL(request.url);
  const parsed = historyQuerySchema.safeParse({
    search: searchParams.get("search") || undefined,
    cursor: searchParams.get("cursor") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    );
  }

  const data = await getArchivedSlates(userId, parsed.data);
  return NextResponse.json(data);
}
