import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { listQuestions } from "@/core/services/question-service";
import { notFound } from "next/navigation";

export default async function WorkbookPage({
  params,
}: {
  params: Promise<{ workbookId: string }>;
}) {
  const { workbookId } = await params;
  const [workbook, questions] = await Promise.all([
    getWorkbookById(workbookId),
    listQuestions(workbookId),
  ]);
  if (!workbook) notFound();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-bold">{workbook.title}</h1>
      <p className="mt-1 text-sm text-gray-500">問題一覧</p>
      {questions.length === 0 ? (
        <p className="mt-6 text-gray-500">問題がありません。</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                href={`/${workbookId}/questions/${q.id}`}
                className="block rounded border border-gray-200 p-4 hover:bg-gray-50"
              >
                <span className="font-medium">{q.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
