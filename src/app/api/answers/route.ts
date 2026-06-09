import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { questions, userAnswers } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getAuthUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body as {
      answers: { questionId: string; answer: string }[];
    };

    if (!answers?.length) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 },
      );
    }

    const questionIds = answers.map((a) => a.questionId);

    const questionRows = await db
      .select({ id: questions.id, answer: questions.answer })
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const answerMap = new Map(questionRows.map((q) => [q.id, q]));

    let correctCount = 0;
    const results = answers.map((a) => {
      const question = answerMap.get(a.questionId);
      const isCorrect =
        question?.answer.trim().toLowerCase() ===
        a.answer.trim().toLowerCase();
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        userId: user.id,
        answer: a.answer,
        isCorrect,
      };
    });

    await db.insert(userAnswers).values(results);

    return NextResponse.json({
      total: answers.length,
      correct: correctCount,
      incorrect: answers.length - correctCount,
      results: results.map((r) => ({
        questionId: r.questionId,
        answer: r.answer,
        isCorrect: r.isCorrect,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 },
    );
  }
}
