/**
 * GET /api/workbooks/[workbookId]/favorites — お気に入り一覧（API-018）
 * X-Client-Id 必須。
 */

import { NextResponse } from "next/server";
import { listFavorites } from "@/core/services/favorite-service";

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
    const list = await listFavorites(workbookId, clientId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list favorites" },
      { status: 500 }
    );
  }
}
