/**
 * GET /api/workbooks/[workbookId]/histories — 履歴一覧（API-005）
 * X-Client-Id 必須。
 */

import { NextResponse } from "next/server";
import { listHistories } from "@/core/services/history-service";

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
    const list = await listHistories(workbookId, clientId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list histories" },
      { status: 500 }
    );
  }
}
