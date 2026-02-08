/**
 * GET /api/workbooks/[workbookId]/questions — 問題一覧（API-003）
 * 初回は sort=order のみ。
 */

import { NextResponse } from "next/server";
import { listQuestions } from "@/core/services/question-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workbookId: string }> }
) {
  const { workbookId } = await params;
  if (!workbookId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId required" },
      { status: 400 }
    );
  }
  const { searchParams } = new URL(request.url);
  const sort = (searchParams.get("sort") as "order" | "difficulty" | "title" | "favorites") ?? "order";
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  try {
    const questions = await listQuestions(workbookId, sort, tags);
    return NextResponse.json(questions);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to list questions" },
      { status: 500 }
    );
  }
}
