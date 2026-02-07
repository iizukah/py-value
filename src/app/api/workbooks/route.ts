/**
 * GET /api/workbooks — ワークブック一覧（API-001）
 */

import { NextResponse } from "next/server";
import { listWorkbooks } from "@/core/services/workbook-service";

export async function GET() {
  try {
    const workbooks = await listWorkbooks();
    return NextResponse.json(workbooks);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list workbooks" },
      { status: 500 }
    );
  }
}
