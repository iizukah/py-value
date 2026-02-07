/**
 * GET /api/workbooks/[workbookId] — ワークブック 1 件（API-002）
 */

import { NextResponse } from "next/server";
import { getWorkbookById } from "@/core/services/workbook-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workbookId: string }> }
) {
  const { workbookId } = await params;
  if (!workbookId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId required" },
      { status: 400 }
    );
  }
  try {
    const workbook = await getWorkbookById(workbookId);
    if (!workbook) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Workbook not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(workbook);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get workbook" },
      { status: 500 }
    );
  }
}
