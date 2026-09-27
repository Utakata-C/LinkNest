import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import catalog from '../src/data/catalog.json';
import { decodeHash, matchesQuery, readFavorites, resolveLocale } from '../src/lib';

describe('catalog', () => {
  it('contains 63 entries and 15 categories with complete translations', () => {
    expect(catalog.links).toHaveLength(63);
    expect(catalog.categories).toHaveLength(15);
    expect(new Set(catalog.links.map(site => site.id)).size).toBe(63);
    for (const site of catalog.links) {
      expect(catalog.categories.some(category => category.id === site.category)).toBe(true);
      expect(['http:', 'https:']).toContain(new URL(site.url).protocol);
      if (site.icon !== null) {
        expect(site.icon).toMatch(/^assets\/images\/logos\/[a-z0-9-]+\.(png|jpg|jpeg|webp|svg|ico)$/);
        expect(existsSync(`public/${site.icon}`), site.icon).toBe(true);
      }
      expect(site.name.zh.trim()).not.toBe('');
      expect(site.name.en.trim()).not.toBe('');
      expect(site.description.zh.trim()).not.toBe('');
      expect(site.description.en.trim()).not.toBe('');
      expect(site.description.en).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });
  it('decodes category anchors and handles malformed hashes', () => {
    expect(decodeHash('#%E4%B8%AA%E4%BA%BA%E4%BA%91')).toBe('个人云');
    expect(decodeHash('#%bad')).toBe('');
  });
});
describe('saved bookmarks after catalog changes', () => {
  it('keeps remaining favorites in their saved order when a bookmark is removed', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(['second', 'removed', 'first']) });
    try {
      expect(readFavorites([{ id: 'first' }, { id: 'second' }])).toEqual(['second', 'first']);
    } finally { vi.unstubAllGlobals(); }
  });
  it('safely ignores invalid saved data', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(['first', null]) });
    try {
      expect(readFavorites([{ id: 'first' }])).toEqual([]);
    } finally { vi.unstubAllGlobals(); }
  });
});
describe('automatic language selection', () => {
  it('follows the first supported browser language', () => {
    expect(resolveLocale('auto', ['zh-TW', 'en-US'])).toBe('zh');
    expect(resolveLocale('auto', ['en-GB', 'zh-CN'])).toBe('en');
    expect(resolveLocale('auto', ['fr', 'zh-CN'])).toBe('zh');
    expect(resolveLocale('auto', ['de-DE'])).toBe('en');
    expect(resolveLocale('auto', [])).toBe('en');
  });
  it('respects a saved preference', () => {
    expect(resolveLocale('en', ['zh-CN'])).toBe('en');
    expect(resolveLocale('zh', ['en-US'])).toBe('zh');
  });
});
describe('search', () => {
  const site = catalog.links.find(item => item.name.zh === '糖酥Cloud')!;
  it('searches both languages and domain names', () => {
    for (const query of ['糖酥', 'TANGSU', 'personal file', 'nas.tangsu.house', '  ']) expect(matchesQuery(site, query)).toBe(true);
    expect(matchesQuery(site, 'nonexistent')).toBe(false);
    expect(matchesQuery(site, 'personal nonexistent')).toBe(false);
  });
});
