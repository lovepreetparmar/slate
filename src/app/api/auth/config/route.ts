import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth-providers";

export async function GET() {
  return NextResponse.json(getAuthConfig());
}
