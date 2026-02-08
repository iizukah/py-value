// UX-01 SC-004: 完了画面（UC-F09）
import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { notFound } from "next/navigation";

export default async function CompletePage({
  params,
}: {
  params: Promise<{ workbookId: string }>;
}) {
  const { workbookId } = await params;
  const workbook = await getWorkbookById(workbookId);
  if (!workbook) notFound();

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-6 py-12"
      data-sc="SC-004"
      role="region"
      aria-label="完了画面"
    >
      <h1 className="text-xl font-bold text-[var(--color-text)]">お疲れさまです</h1>
      <p className="text-center text-[var(--color-text-muted)]">
        このワークブックの全問題に正解しました。
      </p>
      <Link
        href={`/${workbookId}`}
        className="rounded-full px-6 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-main)] hover:opacity-90"
        style={{
          backgroundColor: "var(--color-accent-emerald)",
          boxShadow: "var(--shadow-btn-primary)",
        }}
      >
        一覧へ戻る
      </Link>
    </div>
  );
}
