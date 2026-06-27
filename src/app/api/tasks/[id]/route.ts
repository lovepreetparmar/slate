import { NextResponse } from "next/server";
import { requireUserId, parseJsonBody, apiError } from "@/lib/api";
import { updateTaskSchema, taskIdParamSchema } from "@/lib/validations";
import { updateTask, deleteTask } from "@/server/tasks";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await context.params;
  const idParsed = taskIdParamSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const parsed = await parseJsonBody(request, updateTaskSchema);
  if (parsed instanceof NextResponse) return parsed;

  try {
    const task = await updateTask(userId, idParsed.data, parsed.data);
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await context.params;
  const idParsed = taskIdParamSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    await deleteTask(userId, idParsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
