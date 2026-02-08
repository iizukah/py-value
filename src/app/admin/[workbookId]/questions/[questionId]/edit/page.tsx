/**
 * SC-008 問題登録エディタ（編集）
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionAdmin } from "@/core/services/admin-question-service";
import { QuestionEditorClient } from "../../../QuestionEditorClient";

export default async function AdminEditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ workbookId: string; questionId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { workbookId, questionId } = await params;
  const { key } = await searchParams;
  if (!key || key.trim() === "") {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-amber-700" role="alert">キーを指定してください。</p>
        <Link href="/admin" className="mt-4 inline-block text-blue-600 hover:underline">管理へ戻る</Link>
      </div>
    );
  }
  const question = await getQuestionAdmin(workbookId, questionId);
  if (!question) notFound();
  return (
    <div className="mx-auto max-w-4xl p-6" data-sc="SC-008">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href={`/admin/${workbookId}?key=${encodeURIComponent(key)}`} className="hover:underline">管理</Link>
        <span> / 問題編集</span>
      </div>
      <h1 className="text-xl font-bold">問題を編集</h1>
      <QuestionEditorClient
        workbookId={workbookId}
        keyParam={key.trim()}
        question={question as import("@/lib/types").Question}
      />
    </div>
  );
}
