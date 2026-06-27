import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session.user.id;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  return { data: parsed.data };
}

export function apiError(
  error: unknown,
  options: { notFound?: string; badRequest?: string } = {}
): NextResponse {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  if (message === options.notFound || message === "Task not found") {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  if (message === options.badRequest) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (message.startsWith("Invalid")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.error("[api]", error);
  return NextResponse.json({ error: message }, { status: 500 });
}
