import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api";
import { getSlateArchiveByDate } from "@/server/tasks";

type RouteContext = { params: Promise<{ date: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { date } = await context.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const tasks = await getSlateArchiveByDate(userId, date);
  return NextResponse.json({ tasks });
}
