import type { Bookmark, ReadingProgress } from "../types/quran";

const BOOKMARKS_KEY = "noor:bookmarks";
const PROGRESS_KEY = "noor:reading-progress";

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function getBookmarks(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? "[]") as Bookmark[];
  } catch {
    return [];
  }
}

export function addBookmark(bookmark: Omit<Bookmark, "createdAt">): void {
  const bookmarks = getBookmarks();
  const exists = bookmarks.find(
    (b) => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
  );
  if (exists) return;
  bookmarks.unshift({ ...bookmark, createdAt: new Date().toISOString() });
  // Keep max 50 bookmarks
  if (bookmarks.length > 50) bookmarks.pop();
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch { /* storage full */ }
}

export function removeBookmark(surahNumber: number, ayahNumber: number): void {
  const bookmarks = getBookmarks().filter(
    (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
  );
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch { /* storage full */ }
}

export function isBookmarked(surahNumber: number, ayahNumber: number): boolean {
  return getBookmarks().some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}

// ─── Reading Progress ────────────────────────────────────────────────────────

export function saveProgress(progress: Omit<ReadingProgress, "updatedAt">): void {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ ...progress, updatedAt: new Date().toISOString() })
    );
  } catch { /* storage full */ }
}

export function getProgress(): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgress) : null;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch { /* ignore */ }
}
