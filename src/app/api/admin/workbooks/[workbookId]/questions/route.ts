/**
 * API-010 GET 問題一覧（管理・下書き含む） / API-011 POST 問題作成（管理）
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import {
  listAllQuestions,
  createQuestion,
} from "@/core/services/admin-question-service";
import type { Question } from "@/lib/types";

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
    const questions = await listAllQuestions(workbookId);
    return NextResponse.json(questions);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list questions" },
      { status: 500 }
    );
  }
}

export async function POST(
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
  const question = { ...(body as Record<string, unknown>), workbookId } as Question;
  try {
    const created = await createQuestion(question);
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create question" },
      { status: 500 }
    );
  }
}
