export type Locale = 'zh' | 'en';
export type Localized = Record<Locale, string>;
export type LanguagePreference = Locale | 'auto';
export type Theme = 'auto' | 'light' | 'dark';
export interface Bookmark { id: string; category: string; url: string; icon: string; name: Localized; description: Localized }
export interface Category { id: string; name: Localized; anchor: string; group: string }
