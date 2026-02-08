/**
 * GET /api/workbooks/[workbookId]/questions/[questionId]/draft — 下書き取得（API-007）
 * PUT — 下書き保存（API-008）。X-Client-Id 必須。1 問題 1 件で上書き。
 */

import { NextResponse } from "next/server";
import { getDraft, saveDraft } from "@/core/services/draft-service";

export async function GET(
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

  try {
    const draft = await getDraft(workbookId, questionId, clientId);
    if (!draft) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Draft not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(draft);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get draft" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const draft = await saveDraft(workbookId, questionId, clientId, userAnswer as Record<string, unknown>);
    return NextResponse.json(draft);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to save draft" },
      { status: 500 }
    );
  }
}
