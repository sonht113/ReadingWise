import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://ielts-up.com/reading/academic-reading-sample";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "ielts-up");

interface IeltsQuestion {
  type: string;
  question: string;
  options: string[] | null;
  answer: string;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

function cleanHtml(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&e[ac]ute;/gi, "é")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<span[^>]*>.*?<\/span>/gi, "")
    .replace(/<ol[^>]*>/gi, "")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, " [???] ")
    .replace(/<input[^>]*>/gi, " [???] ")
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<ins[\s\S]*?<\/ins>/gi, "")
    .replace(/<strong>/gi, "**")
    .replace(/<\/strong>/gi, "**")
    .replace(/<[^>]+>/g, "")
    .replace(/&emsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractPassageContent(html: string): { title: string; content: string } {
  const examMatch = html.match(/<div class="exam-text">([\s\S]*?)<\/div>/i);
  if (!examMatch) return { title: "", content: "" };

  let text = examMatch[1];
  text = text.replace(/<noindex>/g, "").replace(/<\/noindex>/g, "");
  text = cleanHtml(text);

  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && l !== "[???]");
  const title = lines[0] || "";
  const content = lines.join("\n\n");

  return { title, content };
}

function extractAllQuestionsFromForm(html: string): { text: string; startNum: number }[] {
  const formMatch = html.match(/<form>([\s\S]*?)<\/form>/i);
  if (!formMatch) return [];

  const formHtml = formMatch[1];
  const blocks: { text: string; startNum: number }[] = [];

  const headerRegex = /<p>\s*<strong>Questions\s+(\d+)[–-]\d+<\/strong>\s*<\/p>/gi;
  let hMatch;
  let lastIndex = 0;

  while ((hMatch = headerRegex.exec(formHtml)) !== null) {
    if (blocks.length > 0) {
      blocks[blocks.length - 1].text += formHtml.substring(lastIndex, hMatch.index);
    }
    blocks.push({ text: "", startNum: parseInt(hMatch[1], 10) });
    lastIndex = hMatch.index + hMatch[0].length;
  }

  if (blocks.length > 0) {
    blocks[blocks.length - 1].text += formHtml.substring(lastIndex);
  }

  return blocks;
}

function detectQuestionType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("true if the statement agrees")) return "true_false_not_given";
  if (lower.includes("yes if the statement agrees")) return "yes_no_not_given";
  if (lower.includes("choose the correct letter")) return "multiple_choice";
  if (lower.includes("match the headings below")) return "matching_heading";
  if (lower.includes("which paragraph contains")) return "matching_info";
  if (lower.includes("complete the sentences") || lower.includes("write no more than") ||
      lower.includes("write only one word") || lower.includes("complete the summary") ||
      lower.includes("complete the notes") || lower.includes("complete each sentence")) {
    return "fill_in_blank";
  }
  return "fill_in_blank";
}

function extractMcOptions(text: string): string[] | null {
  const optionRegex = /\*\*[A-D][\.:]\*\*\s*(.*?)(?=\n|$)/gi;
  const matches = [...text.matchAll(optionRegex)];
  if (matches.length >= 2) {
    return matches.map((m) => m[1].trim());
  }

  const looseRegex = /[A-D][\.:]\s+(.*?)(?=\n[A-D]|\n\n|$)/gi;
  const looseMatches = [...text.matchAll(looseRegex)];
  if (looseMatches.length >= 2) {
    return looseMatches.map((m) => m[1].trim());
  }

  return null;
}

function extractQuestionsFromBlock(
  blockHtml: string,
  type: string,
  startNum: number
): IeltsQuestion[] {
  const result: IeltsQuestion[] = [];
  const cleaned = cleanHtml(blockHtml);

  if (type === "multiple_choice") {
    const mcOptions = extractMcOptions(cleaned);
    const qRegex = /\*\*(\d+)[\.\s]*\*\*\s*([^\n]+)/g;
    let qMatch;
    while ((qMatch = qRegex.exec(cleaned)) !== null) {
      const num = parseInt(qMatch[1], 10);
      if (num >= startNum) {
        result.push({
          type: "multiple_choice",
          question: qMatch[2].trim(),
          options: mcOptions,
          answer: "",
        });
      }
    }
    return result;
  }

  const lines = cleaned.split("\n");
  const qRegex = /\*\*(\d+)[\.\s]*\*\*\s*(.+)/;

  for (const line of lines) {
    const m = line.trim().match(qRegex);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num >= startNum) {
        let question = m[2].trim();
        question = question.includes("[???]") ? question.replaceAll("[???]", "___") : question;
        result.push({
          type,
          question,
          options: null,
          answer: "",
        });
      }
    }
  }

  return result;
}

function extractAnswers(html: string, sectionNum: string): string[] {
  const answersDiv = html.match(/<div id="answers"[\s\S]*?<\/div>/i);
  if (!answersDiv) return [];

  const sectionPattern = new RegExp(
    `<p>\\s*<strong>Section ${sectionNum}<\\/strong>\\s*<\\/p>\\s*<ol>([\\s\\S]*?)<\\/ol>`,
    "i"
  );
  const listMatch = answersDiv[0].match(sectionPattern);
  if (!listMatch) return [];

  const items = listMatch[1].match(/<li>(.*?)<\/li>/gi);
  if (!items) return [];

  return items.map((item) =>
    item
      .replace(/<li>/i, "")
      .replace(/<\/li>/i, "")
      .replace(/<strong>/g, "")
      .replace(/<\/strong>/g, "")
      .replace(/<[^>]+>/g, "")
      .trim()
  );
}

async function processSection(
  testNum: number,
  sectionNum: number
): Promise<{ title: string; content: string; questions: IeltsQuestion[] } | null> {
  const url = `${BASE_URL}-${testNum}.${sectionNum}.html`;
  console.log(`Fetching ${url}...`);
  let html: string;
  try {
    html = await fetchHtml(url);
  } catch (err) {
    console.error(`  Failed to fetch`);
    return null;
  }

  const { title, content } = extractPassageContent(html);
  if (!content) {
    console.error(`  No content found`);
    return null;
  }

  const blocks = extractAllQuestionsFromForm(html);
  const allQuestions: IeltsQuestion[] = [];

  for (const block of blocks) {
    const type = detectQuestionType(block.text);
    const questions = extractQuestionsFromBlock(block.text, type, block.startNum);
    allQuestions.push(...questions);
  }

  const answers = extractAnswers(html, sectionNum.toString());

  for (let i = 0; i < allQuestions.length && i < answers.length; i++) {
    let answer = answers[i];
    if (
      allQuestions[i].type === "true_false_not_given" ||
      allQuestions[i].type === "yes_no_not_given"
    ) {
      answer = answer.toUpperCase();
    }
    allQuestions[i].answer = answer;
  }

  console.log(
    `  "${title.substring(0, 45)}..." | ${allQuestions.length}q, ${answers.length}a`
  );

  return { title, content, questions: allQuestions };
}

async function processTest(testNum: number) {
  console.log(`\n--- Test ${testNum} ---`);
  const articles: {
    title: string;
    content: string;
    questions: IeltsQuestion[];
  }[] = [];

  for (let s = 1; s <= 3; s++) {
    const article = await processSection(testNum, s);
    if (article) articles.push(article);
  }

  if (articles.length > 0) {
    const dir = path.join(OUTPUT_DIR, `test${testNum}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dir, `passages.json`),
      JSON.stringify(articles, null, 2),
      "utf-8"
    );
    console.log(`Saved test ${testNum} (${articles.length} passages)\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testNumbers = args.length > 0
    ? args.map(Number).filter((n) => !isNaN(n) && n >= 2 && n <= 11)
    : Array.from({ length: 10 }, (_, i) => i + 2);

  console.log(`Processing tests: ${testNumbers.join(", ")}`);

  for (const testNum of testNumbers) {
    await processTest(testNum);
  }

  console.log("Done.");
}

main().catch(console.error);
