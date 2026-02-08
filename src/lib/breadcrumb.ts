/**
 * パンくず生成ユーティリティ（FR-F001, TC-001）
 * URL パスから階層表示用の配列を生成する。
 */

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function buildBreadcrumbs(pathname: string, workbookTitle?: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "ホーム", href: "/" }];
  let href = "";
  for (let i = 0; i < segments.length; i++) {
    href += "/" + segments[i];
    const seg = segments[i];
    if (i === 0 && workbookTitle) {
      items.push({ label: workbookTitle, href });
    } else if (seg === "questions" && segments[i + 1]) {
      i++;
      href += "/" + segments[i];
      items.push({ label: segments[i], href });
    } else if (seg === "favorites") {
      items.push({ label: "お気に入り", href });
    } else if (seg === "history") {
      items.push({ label: "履歴", href });
    } else if (seg !== "questions") {
      items.push({ label: seg, href });
    }
  }
  return items;
}
