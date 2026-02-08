/**
 * 匿名識別子（X-Client-Id）の取得。localStorage に保存。
 */

const CLIENT_ID_KEY = "exer-client-id";

export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = "client-" + Math.random().toString(36).slice(2) + "-" + Date.now();
    window.localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
