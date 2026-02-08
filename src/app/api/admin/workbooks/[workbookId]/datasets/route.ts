/**
 * API-017 POST データセット（CSV）アップロード（管理）
 * FR-F013: 開発時は data/ 等へ保存またはモック。本番は Firebase Storage 等を別フェーズで想定。
 */

import { NextResponse } from "next/server";
import { validateAdminKey } from "@/core/lib/admin-key";
import path from "path";
import fs from "fs/promises";

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
  const contentType = request.headers.get("content-type") ?? "";
  let file: File;
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const f = formData.get("file");
    if (!f || !(f instanceof File)) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "file required in multipart form" },
        { status: 400 }
      );
    }
    file = f;
  } else {
    const buffer = await request.arrayBuffer();
    const name = request.headers.get("x-file-name") ?? "dataset.csv";
    file = new File([buffer], name);
  }
  const dataDir = process.env.LOWDB_PATH ?? "./data";
  const datasetsDir = path.join(dataDir, "datasets");
  try {
    await fs.mkdir(datasetsDir, { recursive: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create datasets dir" },
      { status: 500 }
    );
  }
  const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const destPath = path.join(datasetsDir, `${workbookId}_${safeName}`);
  try {
    const buf = await file.arrayBuffer();
    await fs.writeFile(destPath, new Uint8Array(buf));
    return NextResponse.json({
      ok: true,
      message: "Uploaded",
      path: destPath,
      filename: safeName,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to save file" },
      { status: 500 }
    );
  }
}
