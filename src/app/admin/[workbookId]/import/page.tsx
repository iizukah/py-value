/**
 * SC-009 インポート/エクスポート
 */
import Link from "next/link";
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
        <p className="text-amber-700" role="alert">キーを指定してください。</p>
        <Link href="/admin" className="mt-4 inline-block text-blue-600 hover:underline">管理へ戻る</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl p-6" data-sc="SC-009">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href={`/admin/${workbookId}?key=${encodeURIComponent(key)}`} className="hover:underline">管理</Link>
        <span> / インポート・エクスポート</span>
      </div>
      <h1 className="text-xl font-bold">インポート/エクスポート</h1>
      <ImportExportClient workbookId={workbookId} keyParam={key.trim()} />
    </div>
  );
}
