/**
 * WorkbookService（ARC-01）
 */

import { getWorkbookRepository } from "@/core/repositories";
import type { Workbook } from "@/lib/types";

export async function listWorkbooks(): Promise<Workbook[]> {
  const repo = getWorkbookRepository();
  return repo.list();
}

export async function getWorkbookById(id: string): Promise<Workbook | null> {
  const repo = getWorkbookRepository();
  return repo.getById(id);
}
