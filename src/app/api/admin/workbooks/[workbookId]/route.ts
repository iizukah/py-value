/**
 * FR-F008: GET ワークブック取得（管理） / PUT ワークブック更新（履歴件数 N 等）
 * ?key=xxx 必須。
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import { getWorkbookById, updateWorkbook } from "@/core/services/workbook-service";

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

export async function PUT(
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
  let body: { historyLimit?: number };
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
  const data: { historyLimit?: number } = {};
  if (typeof body.historyLimit === "number" && body.historyLimit >= 0) {
    data.historyLimit = body.historyLimit;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "historyLimit (number >= 0) required" },
      { status: 400 }
    );
  }
  try {
    await updateWorkbook(workbookId, data);
    const workbook = await getWorkbookById(workbookId);
    return NextResponse.json(workbook ?? { id: workbookId, ...data });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update workbook" },
      { status: 500 }
    );
  }
}
