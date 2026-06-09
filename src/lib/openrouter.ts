const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface TranslateResponse {
  translation: string;
  explanation: string;
  example: string;
}

export async function translatePhrase(
  phrase: string,
  context?: string,
): Promise<TranslateResponse> {
  const contextPrompt = context
    ? `\nContext (the sentence containing the phrase): "${context}"`
    : "";

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a Vietnamese-English translation assistant. Given an English phrase, provide: 1) Vietnamese translation, 2) a concise explanation in Vietnamese, 3) an example sentence in English. Respond ONLY with valid JSON: {\"translation\": \"...\", \"explanation\": \"...\", \"example\": \"...\"}",
        },
        {
          role: "user",
          content: `Translate this phrase: "${phrase}"${contextPrompt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse translation response");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function translateFullArticle(
  text: string,
  title?: string,
): Promise<string> {
  const titleHint = title ? `Title: "${title}"\n\n` : "";

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a Vietnamese-English translation assistant. Translate the given English passage to natural Vietnamese. Keep the paragraph structure and line breaks. Do NOT add any commentary, notes, or explanations. Output ONLY the Vietnamese translation text.",
        },
        {
          role: "user",
          content: `${titleHint}Translate this passage to Vietnamese:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}
