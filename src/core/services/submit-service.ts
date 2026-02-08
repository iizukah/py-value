/**
 * 解答送信フロー（TC-008, FR-F006, FR-F007, FR-F019）
 * プラグインの runJudge を呼び出し、JudgeResult を履歴保存・返却する。
 */

import { getPlugin } from "@/core/plugins/registry";
import { getQuestionById } from "@/core/services/question-service";
import { saveHistory } from "@/core/services/history-service";
import type { JudgeResult } from "@/lib/types";
import type { History } from "@/lib/types";

export async function submitAnswer(
  workbookId: string,
  questionId: string,
  clientId: string,
  userAnswer: Record<string, unknown>,
  clientJudgeResult?: JudgeResult
): Promise<JudgeResult> {
  const question = await getQuestionById(workbookId, questionId);
  if (!question) {
    return {
      isCorrect: false,
      message: "問題が見つかりません。",
      details: { kind: "judge_error" },
    };
  }

  let judgeResult: JudgeResult;
  if (clientJudgeResult != null && typeof clientJudgeResult === "object" && typeof clientJudgeResult.isCorrect === "boolean") {
    judgeResult = clientJudgeResult;
  } else {
    const plugin = getPlugin(question.type ?? "python-analysis");
    if (!plugin?.judgeAdapter?.runJudge) {
      return {
        isCorrect: false,
        message: "この問題タイプには採点機能がありません。",
        details: { kind: "judge_error" },
      };
    }
    judgeResult = await plugin.judgeAdapter.runJudge(question, userAnswer);
  }

  const history: History = {
    id: `hist-${workbookId}-${questionId}-${clientId}-${Date.now()}`,
    workbookId,
    questionId,
    clientId,
    status: "submitted",
    userAnswer,
    isCorrect: judgeResult.isCorrect,
    judgedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveHistory(history);

  return judgeResult;
}
