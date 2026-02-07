import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">EXER</h1>
      <p className="mt-2 text-gray-600">Exercise the Mind, Master the Skill.</p>
      <div className="mt-8">
        <Link
          href="/py-value"
          className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Pythonデータ分析 — 問題一覧へ
        </Link>
      </div>
    </div>
  );
}
