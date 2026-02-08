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
      <h1 className="text-xl font-bold">お疲れさまです</h1>
      <p className="text-center text-gray-600">
        このワークブックの全問題に正解しました。
      </p>
      <Link
        href={`/${workbookId}`}
        className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        一覧へ戻る
      </Link>
    </div>
  );
}
