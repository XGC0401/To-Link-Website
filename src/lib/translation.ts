export type AutoDetectedLanguage = "en" | "zh";

interface AutoTranslationResult {
  originalText: string;
  sourceLanguage: AutoDetectedLanguage;
  targetLanguage: "en" | "zh-TW";
  translatedText: string;
}

function hasCjkCharacters(value: string) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(value);
}

export function detectInputLanguage(value: string): AutoDetectedLanguage {
  return hasCjkCharacters(value) ? "zh" : "en";
}

export function formatDualLanguageText(
  originalText: string,
  translatedText: string,
  sourceLanguage: AutoDetectedLanguage,
) {
  const source = originalText.trim();
  const translated = translatedText.trim();

  if (!translated || source.toLowerCase() === translated.toLowerCase()) {
    return source;
  }

  if (sourceLanguage === "zh") {
    return `中文: ${source}\nEnglish: ${translated}`;
  }

  return `English: ${source}\n中文: ${translated}`;
}

export async function autoTranslateText(input: string): Promise<AutoTranslationResult> {
  const originalText = input.trim();

  if (!originalText) {
    return {
      originalText: "",
      sourceLanguage: "en",
      targetLanguage: "zh-TW",
      translatedText: "",
    };
  }

  const sourceLanguage = detectInputLanguage(originalText);
  const targetLanguage = sourceLanguage === "zh" ? "en" : "zh-TW";

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: originalText,
      targetLanguage,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Could not auto-translate text.");
  }

  const payload = (await response.json()) as { translatedText: string };

  return {
    originalText,
    sourceLanguage,
    targetLanguage,
    translatedText: payload.translatedText,
  };
}
