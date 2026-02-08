import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWorkbookById } from "@/core/services/workbook-service";
import { notFound } from "next/navigation";
import { FavoritesListClient } from "./FavoritesListClient";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ workbookId: string }>;
}) {
  const { workbookId } = await params;
  const workbook = await getWorkbookById(workbookId);
  if (!workbook) notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="typography-page-title text-[var(--color-text)]">お気に入り</h1>
      <FavoritesListClient workbookId={workbookId} />
      <div className="mt-6">
        <Link
          href={`/${workbookId}`}
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
