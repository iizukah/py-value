/**
 * API-015 POST 問題 JSON インポート（管理）
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import { importQuestions } from "@/core/services/admin-question-service";

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

export async function POST(
  request: Request,
  { params }: { params: { workbookId: string } }
) {
  const { workbookId } = params;
  const { searchParams } = new URL(request.url);
  const err = requireAdminKey(searchParams);
  if (err) return err;
  if (!workbookId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId required" },
      { status: 400 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid JSON" },
      { status: 400 }
    );
  }
  const questions = Array.isArray(body) ? body : (body as { questions?: unknown[] }).questions;
  if (!Array.isArray(questions)) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Body must be an array or { questions: array }" },
      { status: 400 }
    );
  }
  try {
    const result = await importQuestions(workbookId, questions);
    if (!result.ok) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Import validation failed", errors: result.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, imported: questions.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to import" },
      { status: 500 }
    );
  }
}
