import Link from "next/link";
import { getWorkbookById } from "@/core/services/workbook-service";
import { getQuestionById } from "@/core/services/question-service";
import { getPlugin } from "@/core/plugins/registry";
import { notFound } from "next/navigation";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ workbookId: string; questionId: string }>;
}) {
  const { workbookId, questionId } = await params;
  const [workbook, question] = await Promise.all([
    getWorkbookById(workbookId),
    getQuestionById(workbookId, questionId),
  ]);
  if (!workbook || !question) notFound();

  const plugin = getPlugin(question.type);
  if (!plugin) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p>未対応の問題タイプ: {question.type}</p>
        <Link href={`/${workbookId}`} className="text-blue-600 hover:underline">
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const PluginComponent = plugin.Component;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span>/</span>
        <Link href={`/${workbookId}`} className="hover:underline">{workbook.title}</Link>
        <span>/</span>
        <span>{question.title}</span>
      </div>
      <h1 className="text-xl font-bold">{question.title}</h1>
      <div className="mt-6">
        <PluginComponent question={question} />
      </div>
      <div className="mt-6 flex gap-2">
        <Link
          href={`/${workbookId}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
