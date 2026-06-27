import { NextResponse } from "next/server";
import { requireUserId, parseJsonBody, apiError } from "@/lib/api";
import { carryOverSchema } from "@/lib/validations";
import { handleCarryOver } from "@/server/tasks";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = await parseJsonBody(request, carryOverSchema);
  if (parsed instanceof NextResponse) return parsed;

  try {
    const result = await handleCarryOver(
      userId,
      parsed.data.action,
      parsed.data.taskIds
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
