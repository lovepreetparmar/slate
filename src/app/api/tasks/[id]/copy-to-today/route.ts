import { NextResponse } from "next/server";
import { requireUserId, apiError } from "@/lib/api";
import { taskIdParamSchema } from "@/lib/validations";
import { copyTaskToToday } from "@/server/tasks";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await context.params;
  const idParsed = taskIdParamSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const task = await copyTaskToToday(userId, idParsed.data);
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error, { badRequest: "Use restore for today's tasks" });
  }
}
