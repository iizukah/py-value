/**
 * SC-007 管理ダッシュボード（ワークブック指定）
 */
import { AdminDashboardClient } from "../AdminDashboardClient";

export default async function AdminWorkbookPage({
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
        <h1 className="text-xl font-bold">管理</h1>
        <p className="mt-4 text-amber-700" role="alert">
          キーを指定してください。
        </p>
      </div>
    );
  }
  return (
    <AdminDashboardClient keyParam={key.trim()} workbookId={workbookId} />
  );
}
