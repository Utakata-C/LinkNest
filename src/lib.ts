import type { Bookmark, LanguagePreference, Locale } from './types';

export function resolveLocale(preference: LanguagePreference, languages: readonly string[]): Locale {
  if (preference !== 'auto') return preference;
  for (const language of languages) {
    if (/^zh(?:-|$)/i.test(language)) return 'zh';
    if (/^en(?:-|$)/i.test(language)) return 'en';
  }
  return 'en';
}
export function readPreference<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(`linknest:${key}`);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    return validate(value) ? value : fallback;
  } catch { return fallback; }
}
export function writePreference(key: string, value: unknown): boolean {
  try { localStorage.setItem(`linknest:${key}`, JSON.stringify(value)); return true; }
  catch { return false; }
}
export function matchesQuery(bookmark: Bookmark, query: string): boolean {
  const text = [bookmark.name.zh, bookmark.name.en, bookmark.description.zh, bookmark.description.en, bookmark.url].join(' ').toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every(term => text.includes(term));
}
export function domain(url: string) { return new URL(url).hostname.replace(/^www\./, ''); }
export function decodeHash(hash: string) {
  try { return decodeURIComponent(hash.replace(/^#/, '')); } catch { return ''; }
}
