/**
 * GET /api/workbooks/[workbookId]/drafts — 下書きがある questionId 一覧（API-021, DD-009）
 * X-Client-Id 必須。
 */

import { NextResponse } from "next/server";
import { listDraftQuestionIds } from "@/core/services/draft-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workbookId: string }> }
) {
  const clientId = request.headers.get("X-Client-Id")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "X-Client-Id required" },
      { status: 400 }
    );
  }

  const { workbookId } = await params;
  if (!workbookId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId required" },
      { status: 400 }
    );
  }

  try {
    const questionIds = await listDraftQuestionIds(workbookId, clientId);
    return NextResponse.json({ questionIds });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list drafts" },
      { status: 500 }
    );
  }
}
