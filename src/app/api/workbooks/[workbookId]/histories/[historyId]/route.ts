/**
 * GET /api/workbooks/[workbookId]/histories/[historyId] — 履歴詳細（API-006）
 * X-Client-Id 必須。自分の履歴のみ。
 */

import { NextResponse } from "next/server";
import { getHistoryById } from "@/core/services/history-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; historyId: string }> }
) {
  const clientId = request.headers.get("X-Client-Id")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "X-Client-Id required" },
      { status: 400 }
    );
  }

  const { workbookId, historyId } = await params;
  if (!workbookId || !historyId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and historyId required" },
      { status: 400 }
    );
  }

  try {
    const history = await getHistoryById(workbookId, historyId, clientId);
    if (!history) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "History not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(history);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get history" },
      { status: 500 }
    );
  }
}
