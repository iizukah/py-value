/**
 * WorkbookRepository インターフェース（ARC-01）
 * 参照: docs/01_specs/02_architecture/ARC-01_system_design.md
 */

import type { Workbook } from "@/lib/types";

export interface WorkbookRepository {
  list(): Promise<Workbook[]>;
  getById(id: string): Promise<Workbook | null>;
}
