import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface TranslateRequestBody {
  targetLanguage?: "en" | "zh-TW";
  text?: string;
}

function extractTranslatedText(payload: unknown) {
  if (!Array.isArray(payload) || payload.length === 0 || !Array.isArray(payload[0])) {
    return "";
  }

  return payload[0]
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
    .join("")
    .trim();
}

export async function POST(request: Request) {
  let body: TranslateRequestBody;

  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (text.length > 4000) {
    return NextResponse.json({ error: "Text is too long to translate." }, { status: 400 });
  }

  const targetLanguage = body.targetLanguage === "en" ? "en" : "zh-TW";
  const endpoint =
    "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto" +
    `&tl=${encodeURIComponent(targetLanguage)}` +
    `&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "To-Link/1.0",
      },
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Translation service is currently unavailable." },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as unknown;
    const translatedText = extractTranslatedText(payload);

    if (!translatedText) {
      return NextResponse.json(
        { error: "Translation service returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ translatedText });
  } catch {
    return NextResponse.json({ error: "Failed to reach translation service." }, { status: 502 });
  }
}
