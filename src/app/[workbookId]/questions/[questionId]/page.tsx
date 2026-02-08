import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mt-4">
        <PluginComponent
          question={question}
          workbookId={workbookId}
          questionId={questionId}
        />
      </div>
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
