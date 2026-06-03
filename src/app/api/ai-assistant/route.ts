import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AIAssistantRequestBody {
  conversationId?: string;
  history?: Array<{
    content: string;
    role: "assistant" | "user";
  }>;
  message?: string;
}

function extractReply(payload: unknown): string | null {
  if (typeof payload === "string") {
    const normalized = payload.trim();
    return normalized.length ? normalized : null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const reply = extractReply(item);

      if (reply) {
        return reply;
      }
    }

    return null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const directKeys = ["reply", "response", "message", "output", "text", "answer", "content"];

  for (const key of directKeys) {
    const value = record[key];
    const reply = extractReply(value);

    if (reply) {
      return reply;
    }
  }

  if (Array.isArray(record.choices)) {
    for (const choice of record.choices) {
      const reply = extractReply(choice);

      if (reply) {
        return reply;
      }
    }
  }

  const nestedKeys = ["data", "result", "results", "body"];

  for (const key of nestedKeys) {
    const value = record[key];
    const reply = extractReply(value);

    if (reply) {
      return reply;
    }
  }

  return null;
}

function formatWebhookError(error: unknown, webhookUrl: string) {
  if (error instanceof Error) {
    const cause =
      error.cause && typeof error.cause === "object" && "message" in error.cause
        ? String(error.cause.message)
        : null;

    if (cause?.includes("ECONNREFUSED") || error.message === "fetch failed") {
      return `Could not reach the AI assistant webhook at ${webhookUrl}. Make sure n8n is running and the workflow is active.`;
    }

    return cause ?? error.message;
  }

  return "The AI assistant webhook could not be reached.";
}

export async function POST(request: Request) {
  const webhookUrl = process.env.AI_ASSISTANT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        error: "AI assistant webhook is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  let body: AIAssistantRequestBody;

  try {
    body = (await request.json()) as AIAssistantRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      {
        error: "A message is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: body.conversationId,
        history: body.history ?? [],
        message,
      }),
      cache: "no-store",
    });

    const contentType = webhookResponse.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await webhookResponse.json()) as unknown)
      : await webhookResponse.text();

    if (!webhookResponse.ok) {
      const errorMessage = extractReply(payload) ?? "The AI assistant webhook returned an error.";

      return NextResponse.json(
        {
          error: errorMessage,
        },
        {
          status: 502,
        },
      );
    }

    const reply = extractReply(payload);

    if (!reply) {
      return NextResponse.json(
        {
          error: "The AI assistant webhook did not return a usable reply.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        error: formatWebhookError(error, webhookUrl),
      },
      {
        status: 502,
      },
    );
  }
}