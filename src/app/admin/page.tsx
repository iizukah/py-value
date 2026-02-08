/**
 * SC-007 管理ダッシュボード入口（FR-F011）
 * ?key=xxx 必須。未指定時はメッセージ表示。
 */
import { AdminDashboardClient } from "./AdminDashboardClient";

const DEFAULT_WORKBOOK_ID = "py-value";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!key || key.trim() === "") {
    return (
      <div className="mx-auto max-w-4xl p-6" data-sc="SC-007">
        <h1 className="text-xl font-bold">管理</h1>
        <p className="mt-4 text-amber-700" role="alert">
          キーを指定してください。URL に ?key=xxx を付与してアクセスしてください。
        </p>
      </div>
    );
  }
  return (
    <AdminDashboardClient keyParam={key.trim()} workbookId={DEFAULT_WORKBOOK_ID} />
  );
}
