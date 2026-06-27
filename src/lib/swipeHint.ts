const STORAGE_KEY = "slate-swipe-hint-dismissed";

export function isSwipeHintDismissedLocally(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function dismissSwipeHintLocally() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "1");
}
