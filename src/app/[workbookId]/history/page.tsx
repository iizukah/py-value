import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { notFound } from "next/navigation";
import { HistoryListClient } from "./HistoryListClient";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ workbookId: string }>;
}) {
  const { workbookId } = await params;
  const workbook = await getWorkbookById(workbookId);
  if (!workbook) notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="typography-page-title text-[var(--color-text)]">履歴</h1>
      <HistoryListClient workbookId={workbookId} />
    </div>
  );
}
