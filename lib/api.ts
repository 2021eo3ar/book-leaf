import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { session, response: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function forbidden(message = "You do not have permission to perform this action") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function serverError(error: unknown, message = "Something went wrong") {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
