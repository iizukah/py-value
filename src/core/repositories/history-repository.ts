/**
 * HistoryRepository インターフェース（ARC-01, DATA-01 §2.3）
 * 履歴の保存・一覧・詳細。ワークブック単位の件数上限を守る。
 */

import type { History } from "@/lib/types";

export interface HistoryRepository {
  save(history: History): Promise<void>;
  listByWorkbookAndClient(workbookId: string, clientId: string): Promise<History[]>;
  getById(workbookId: string, historyId: string, clientId: string): Promise<History | null>;
  /** ワークブック内の clientId 別の履歴件数が limit を超えた場合、古いものを削除する。 */
  enforceLimit(workbookId: string, clientId: string, limit: number): Promise<void>;
}
