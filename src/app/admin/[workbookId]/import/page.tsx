/**
 * SC-009 インポート/エクスポート / CD-029 リンクをボタン風＋アイコン
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportExportClient } from "../ImportExportClient";

export default async function AdminImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ workbookId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { workbookId } = await params;
  const { key } = await searchParams;
  if (!key || key.trim() === "") {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-amber-400" role="alert">キーを指定してください。</p>
        <Link
          href="/admin"
          className="btn btn-secondary mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
          style={{ background: "var(--color-accent-blue)", boxShadow: "var(--shadow-btn-secondary)" }}
        >
          <ArrowLeft size={16} aria-hidden />
          管理へ戻る
        </Link>
      </div>
    );
  }
  const backUrl = `/admin/${workbookId}?key=${encodeURIComponent(key)}`;
  return (
    <div className="mx-auto max-w-4xl p-6" data-sc="SC-009">
      <div className="mb-4">
        <Link
          href={backUrl}
          className="btn btn-ghost inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--color-text)] no-underline hover:bg-[rgba(255,255,255,0.06)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <ArrowLeft size={16} aria-hidden />
          一覧へ戻る
        </Link>
      </div>
      <h1 className="text-xl font-bold text-[var(--color-text)]">インポート/エクスポート</h1>
      <ImportExportClient workbookId={workbookId} keyParam={key.trim()} />
    </div>
  );
}
