/**
 * POST /api/workbooks/[workbookId]/questions/[questionId]/submit — 解答送信（API-009）
 * X-Client-Id 必須。body: { userAnswer }。JudgeResult を返す。
 */

import { NextResponse } from "next/server";
import { submitAnswer } from "@/core/services/submit-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const clientId = request.headers.get("X-Client-Id")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "X-Client-Id required" },
      { status: 400 }
    );
  }

  const { workbookId, questionId } = await params;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }

  let body: { userAnswer?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const userAnswer = body?.userAnswer;
  if (userAnswer === undefined || typeof userAnswer !== "object") {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "userAnswer required" },
      { status: 400 }
    );
  }

  try {
    const result = await submitAnswer(workbookId, questionId, clientId, userAnswer as Record<string, unknown>);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to submit" },
      { status: 500 }
    );
  }
}
