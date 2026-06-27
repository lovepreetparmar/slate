import { NextResponse } from "next/server";
import { requireUserId, parseJsonBody, apiError } from "@/lib/api";
import { createTaskSchema } from "@/lib/validations";
import { getTasksForToday, createTask } from "@/server/tasks";

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const data = await getTasksForToday(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = await parseJsonBody(request, createTaskSchema);
  if (parsed instanceof NextResponse) return parsed;

  try {
    const task = await createTask(userId, parsed.data);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Task already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return apiError(error);
  }
}
