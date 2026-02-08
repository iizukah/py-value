import { getWorkbookById } from "@/core/services/workbook-service";
import { listQuestions } from "@/core/services/question-service";
import { notFound } from "next/navigation";
import { QuestionListClient } from "./QuestionListClient";

type SortOption = "order" | "difficulty" | "title" | "favorites";

export default async function WorkbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ workbookId: string }>;
  searchParams: Promise<{ sort?: string; tags?: string }>;
}) {
  const { workbookId } = await params;
  const { sort, tags } = await searchParams;
  const sortOption = (sort as SortOption) || "order";
  const tagsArray = tags ? tags.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  const [workbook, questions] = await Promise.all([
    getWorkbookById(workbookId),
    listQuestions(workbookId, sortOption, tagsArray),
  ]);
  if (!workbook) notFound();

  const baseUrl = `/${workbookId}`;
  const tagsParam = tagsArray?.length ? `&tags=${tagsArray.join(",")}` : "";
  const sortLinks: { label: string; value: SortOption }[] = [
    { label: "登録順", value: "order" },
    { label: "難易度", value: "difficulty" },
    { label: "タイトル", value: "title" },
    { label: "お気に入り数", value: "favorites" },
  ];

  const uniqueTags = Array.from(new Set(questions.flatMap((q) => q.tags ?? []))).sort();

  return (
    <QuestionListClient
      workbookId={workbookId}
      workbookTitle={workbook.title}
      questions={questions.map((q, i) => ({
        id: q.id,
        title: q.title,
        tags: q.tags,
        favoriteCount: q.favoriteCount,
        order: q.order ?? i + 1,
        difficulty: q.difficulty ?? "初級",
        excerpt: q.problem_statement?.slice(0, 150) ?? q.title,
      }))}
      baseUrl={baseUrl}
      sortLinks={sortLinks}
      sortOption={sortOption}
      tagsParam={tagsParam}
      uniqueTags={uniqueTags}
    />
  );
}
