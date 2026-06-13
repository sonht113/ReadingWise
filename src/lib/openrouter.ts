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

export interface ParsedArticleInput {
  title: string;
  content: string;
  questions: {
    type: string;
    question: string;
    options: string[] | null;
    answer: string;
  }[];
}

export async function parseArticleFromRawInput(
  rawText: string,
): Promise<ParsedArticleInput> {
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
          content: `You parse unstructured IELTS Reading passages into a strict JSON format.

The user will paste raw text that contains: a title, an English passage, and some IELTS Reading questions with answers. The input may be in ANY layout or format — you must intelligently extract and restructure it.

Output a single JSON object with this schema:
{
  "title": "the article/passage title (string, max 255 chars)",
  "content": "the full passage text, cleaned of question text — keep paragraph structure, use \\n\\n between paragraphs",
  "questions": [
    {
      "type": "one of: multiple_choice, true_false_not_given, yes_no_not_given, matching_heading, matching_info, fill_in_blank, summary_completion, short_answer",
      "question": "the question text (without number prefix)",
      "options": ["A) choice text", "B) ..."] or null for types that don't need options (true_false_not_given, yes_no_not_given, short_answer, fill_in_blank),
      "answer": "the correct answer (just the letter for multiple_choice, the word/phrase for fill_in_blank/short_answer, TRUE/FALSE/NOT GIVEN for true_false_not_given, YES/NO/NOT GIVEN for yes_no_not_given, the Roman numeral or letter for matching)"
    }
  ]
}

Rules:
- Detect the question type from the format: ABCD options → multiple_choice; TRUE/FALSE/NOT GIVEN → true_false_not_given; YES/NO/NOT GIVEN → yes_no_not_given; i-ix headings → matching_heading; paragraph letters with info → matching_info; blanks (e.g. "... is a ___") → fill_in_blank; word limit (e.g. "NO MORE THAN TWO WORDS") → short_answer; summary with blanks → summary_completion
- Separate the passage content from questions carefully — content goes in "content", questions go in "questions"
- Preserve the passage text exactly as written
- Respond ONLY with valid JSON, no markdown, no commentary`,
        },
        {
          role: "user",
          content: `Parse this IELTS reading material into structured JSON:\n\n${rawText}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse article from AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.title || !parsed.content || !Array.isArray(parsed.questions)) {
    throw new Error("AI response missing required fields (title, content, questions)");
  }

  return parsed as ParsedArticleInput;
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
