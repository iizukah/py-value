/**
 * API-012 GET 問題取得（管理） / API-013 PUT 問題更新 / API-014 DELETE 問題削除
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import {
  getQuestionAdmin,
  updateQuestion,
  deleteQuestion,
} from "@/core/services/admin-question-service";

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
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const { workbookId, questionId } = await params;
  const { searchParams } = new URL(request.url);
  const err = requireAdminKey(searchParams);
  if (err) return err;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }
  try {
    const question = await getQuestionAdmin(workbookId, questionId);
    if (!question) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Question not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(question);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const { workbookId, questionId } = await params;
  const { searchParams } = new URL(request.url);
  const err = requireAdminKey(searchParams);
  if (err) return err;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
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
  if (body == null || typeof body !== "object") {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Body must be an object" },
      { status: 400 }
    );
  }
  try {
    const updated = await updateQuestion(workbookId, questionId, body as Record<string, unknown>);
    if (!updated) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Question not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const { workbookId, questionId } = await params;
  const { searchParams } = new URL(request.url);
  const err = requireAdminKey(searchParams);
  if (err) return err;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }
  try {
    const deleted = await deleteQuestion(workbookId, questionId);
    if (!deleted) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Question not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to delete question" },
      { status: 500 }
    );
  }
}
