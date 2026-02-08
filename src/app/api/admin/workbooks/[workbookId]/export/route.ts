/**
 * API-016 GET 問題 JSON エクスポート（管理）
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import { exportQuestions } from "@/core/services/admin-question-service";

function requireAdminKey(searchParams: URLSearchParams): NextResponse | null {
  const key = searchParams.get("key");
  if (!validateAdminKey(key)) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Invalid or missing key" },
      { status: 401 }
    );
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workbookId: string }> }
) {
  const { workbookId } = await params;
  const { searchParams } = new URL(request.url);
  const err = requireAdminKey(searchParams);
  if (err) return err;
  if (!workbookId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId required" },
      { status: 400 }
    );
  }
  try {
    const questions = await exportQuestions(workbookId);
    return NextResponse.json(questions);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to export" },
      { status: 500 }
    );
  }
}
