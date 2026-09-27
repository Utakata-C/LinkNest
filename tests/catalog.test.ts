import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import catalog from '../src/data/catalog.json';
import { decodeHash, matchesQuery, resolveLocale } from '../src/lib';

describe('catalog', () => {
  it('preserves all 76 entries and 18 categories with complete translations', () => {
    expect(catalog.links).toHaveLength(76);
    expect(catalog.categories).toHaveLength(18);
    expect(new Set(catalog.links.map(site => site.id)).size).toBe(76);
    for (const site of catalog.links) {
      expect(catalog.categories.some(category => category.id === site.category)).toBe(true);
      expect(['http:', 'https:']).toContain(new URL(site.url).protocol);
      expect(existsSync(`public/${site.icon}`), site.icon).toBe(true);
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
