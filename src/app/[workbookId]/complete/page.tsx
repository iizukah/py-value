// UX-01 SC-004, CD-021: center-block, card, おめでとうございます。全問正解です。, 一覧へ戻るボタン＋アイコン
import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
      className="center-block mx-auto max-w-[var(--center-block-max-width)] py-6 text-center"
      data-sc="SC-004"
      role="region"
      aria-label="完了画面"
    >
      <div
        className="card rounded-[var(--radius-md)] border p-3 text-left"
        style={{
          backgroundColor: "var(--glass-bg)",
          borderColor: "var(--glass-border)",
        }}
      >
        <span className="label mb-2 block text-[11px] uppercase text-[var(--color-text-muted)]">
          完了
        </span>
        <p className="typography-heading m-0 text-lg font-semibold text-[var(--color-text)]">
          おめでとうございます。全問正解です。
        </p>
        <Link
          href={`/${workbookId}`}
          className="btn btn-primary mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)] focus:ring-offset-2 hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--color-accent-emerald) 0%, #0d9488 100%)",
            boxShadow: "var(--shadow-btn-primary)",
          }}
        >
          <ArrowLeft size={16} aria-hidden />
          一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
