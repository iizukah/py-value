import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { notFound } from "next/navigation";
import { HistoryDetailClient } from "./HistoryDetailClient";
import { ArrowLeft } from "lucide-react";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ workbookId: string; historyId: string }>;
}) {
  const { workbookId, historyId } = await params;
  const workbook = await getWorkbookById(workbookId);
  if (!workbook) notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="typography-page-title text-[var(--color-text)]">履歴詳細</h1>
      <HistoryDetailClient workbookId={workbookId} historyId={historyId} />
      <div className="mt-6">
        <Link
          href={`/${workbookId}/history`}
          className="btn btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] hover:opacity-90"
          style={{
            background: "var(--color-accent-blue)",
            boxShadow: "var(--shadow-btn-secondary)",
          }}
        >
          <ArrowLeft size={16} aria-hidden />
          一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
