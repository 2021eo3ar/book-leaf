import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { registerSseClient } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const clientId = crypto.randomUUID();
  let cleanup: () => void = () => undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      cleanup = registerSseClient({
        role: session.user.role,
        authorId: session.user.authorId,
        client: { id: clientId, send },
      });
      send({ type: "connected" });

      const heartbeat = setInterval(() => send({ type: "heartbeat" }), 30000);
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        cleanup();
        controller.close();
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
