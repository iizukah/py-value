/**
 * POST /api/workbooks/[workbookId]/questions/[questionId]/favorite — お気に入り追加（API-019）
 * DELETE — お気に入り解除（API-020）。X-Client-Id 必須。
 */

import { NextResponse } from "next/server";
import { addFavorite, removeFavorite } from "@/core/services/favorite-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const clientId = request.headers.get("X-Client-Id")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "X-Client-Id required" },
      { status: 400 }
    );
  }

  const { workbookId, questionId } = await params;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }

  try {
    const favorite = await addFavorite(workbookId, questionId, clientId);
    return NextResponse.json(favorite);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workbookId: string; questionId: string }> }
) {
  const clientId = request.headers.get("X-Client-Id")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "X-Client-Id required" },
      { status: 400 }
    );
  }

  const { workbookId, questionId } = await params;
  if (!workbookId || !questionId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "workbookId and questionId required" },
      { status: 400 }
    );
  }

  try {
    const favorite = await removeFavorite(workbookId, questionId, clientId);
    return NextResponse.json(favorite ?? { removed: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
