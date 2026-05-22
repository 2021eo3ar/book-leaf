import { NextRequest, NextResponse } from "next/server";
import { badRequest, requireSession } from "@/lib/api";
import { classifyTicket } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const body = (await request.json().catch(() => null)) as {
    subject?: string;
    description?: string;
  } | null;
  const subject = body?.subject?.trim() ?? "";
  const description = body?.description?.trim() ?? "";
  if (!subject || !description) {
    return badRequest("Subject and description are required");
  }

  const classification = await classifyTicket(subject, description);
  return NextResponse.json({
    category: classification?.category ?? null,
    priority: classification?.priority ?? null,
  });
}
