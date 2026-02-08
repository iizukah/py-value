/**
 * FavoriteRepository インターフェース（ARC-01, DATA-01 §2.5）
 * 追加で count+1、解除で count-1、0 で削除。一覧は clientId で絞る。
 */

import type { Favorite } from "@/lib/types";

export interface FavoriteRepository {
  get(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null>;
  /** 追加: 既存なら count+1、なければ新規 count=1 */
  add(workbookId: string, questionId: string, clientId: string): Promise<Favorite>;
  /** 解除: count-1。0 以下なら削除。 */
  remove(workbookId: string, questionId: string, clientId: string): Promise<Favorite | null>;
  listByWorkbookAndClient(workbookId: string, clientId: string): Promise<Favorite[]>;
  /** 問題ごとのお気に入り数（全 client の count 合計） */
  countByQuestion(workbookId: string, questionId: string): Promise<number>;
}
