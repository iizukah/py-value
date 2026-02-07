/**
 * GET /api/workbooks/[workbookId]/questions/[questionId] — 問題 1 件（API-004）
 */

import { NextResponse } from "next/server";
import { getQuestionById } from "@/core/services/question-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const { workbookId, questionId } = await params;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }
  try {
    const question = await getQuestionById(workbookId, questionId);
    if (!question) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Question not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(question);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get question" },
      { status: 500 }
    );
  }
}
