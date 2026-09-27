import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Books, CaretDown, Cloud,
  Code, Compass, DownloadSimple, FilmSlate, GameController, Globe, GridFour,
  Heart, Info, List, MagnifyingGlass, Monitor, Moon, Palette, PuzzlePiece,
  SlidersHorizontal, Sparkle, Star, Sun, Translate, Wrench, X,
} from '@phosphor-icons/react';
import catalog from './data/catalog.json';
import type { Bookmark, Category, LanguagePreference, Locale, Theme } from './types';
import { messages } from './i18n';
import { decodeHash, matchesQuery, readPreference, resolveLocale, writePreference } from './lib';
import { BookmarkCard, SiteIcon } from './components/BookmarkCard';

const Toast = lazy(() => import('./components/Toast'));
const sites: Bookmark[] = catalog.links;
const categories: Category[] = catalog.categories;
const groups = ['daily', 'entertainment', 'tools', 'it', 'design'] as const;
const categoryIcons = [MagnifyingGlass, Cloud, Globe, FilmSlate, GameController, DownloadSimple, Wrench, PuzzlePiece, Globe, Code, SlidersHorizontal, DownloadSimple, Globe, Palette, Books, Palette, Books, Books];
const getCategory = () => {
  const hash = decodeHash(location.hash);
  if (['favorites', 'about'].includes(hash)) return hash;
  return categories.find(item => item.anchor === hash || item.legacyAnchor === hash || item.id === hash)?.id ?? 'all';
};
const enumValue = <T extends string>(values: readonly T[]) => (value: unknown): value is T => typeof value === 'string' && values.includes(value as T);
const arrayValue = (value: unknown): value is string[] => Array.isArray(value) && value.every(id => typeof id === 'string' && sites.some(site => site.id === id));

export default function App() {
  const [language, setLanguage] = useState<LanguagePreference>(() => readPreference('language', 'auto', enumValue(['auto', 'zh', 'en'])));
  const [languages, setLanguages] = useState(() => navigator.languages);
  const locale: Locale = resolveLocale(language, languages);
  const t = messages[locale];
  const [theme, setTheme] = useState<Theme>(() => readPreference('theme', 'auto', enumValue(['auto', 'light', 'dark'])));
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const dark = theme === 'dark' || (theme === 'auto' && systemDark);
  const [saved, setSaved] = useState<string[]>(() => readPreference('favorites', [], arrayValue));
  const [view, setView] = useState<'grid' | 'list'>(() => readPreference('view', 'grid', enumValue(['grid', 'list'])));
  const [active, setActive] = useState(getCategory);
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeCategory = categories.find(category => category.id === active);
  const hasFilter = active !== 'all' || query.trim().length > 0;
  const isAbout = active === 'about';
  const filtered = useMemo(() => sites.filter(site => (active === 'all' || (active === 'favorites' ? saved.includes(site.id) : site.category === active)) && matchesQuery(site, query)), [active, saved, query]);
  const quickSites = useMemo(() => {
    const defaults = ['Google', 'ChatGPT', '糖酥Cloud', 'Youtube', '少数派', 'Cloudflare'];
    const favorites = saved.map(id => sites.find(site => site.id === id)!).filter(Boolean);
    return [...favorites, ...defaults.map(name => sites.find(site => site.name.zh === name)!).filter(site => !saved.includes(site.id))].slice(0, 6);
  }, [saved]);

  useEffect(() => {
    const changed = () => setLanguages(navigator.languages);
    window.addEventListener('languagechange', changed);
    return () => window.removeEventListener('languagechange', changed);
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const changed = () => setSystemDark(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171c1b' : '#f6f7f8');
  }, [dark]);
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = `Tangsu.house - ${isAbout ? t.about : t.directory}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro);
  }, [locale, t, isAbout]);
  useEffect(() => {
    const update = () => { if (location.hash === '#main-content') return; setActive(getCategory()); setMobileMenu(false); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const editable = event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable);
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !editable)) {
        event.preventDefault();
        if (active === 'about') { location.hash = ''; setActive('all'); requestAnimationFrame(() => searchRef.current?.focus()); }
        else searchRef.current?.focus();
      }
      if (event.key === 'Escape') { setSettings(false); setMobileMenu(false); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [active]);
  useEffect(() => {
    if (!settings) return;
    const outside = (event: PointerEvent) => { if (!settingsRef.current?.contains(event.target as Node)) setSettings(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [settings]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const dialog = mobileRef.current;
    if (mobileMenu && !dialog?.open) dialog?.showModal();
    if (!mobileMenu && dialog?.open) { dialog.close(); menuRef.current?.focus(); }
    if (!mobileMenu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileMenu]);

  function persist(key: string, value: unknown) { if (!writePreference(key, value)) setNotice(t.storageError); }
  function toggleFavorite(id: string) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    const success = writePreference('favorites', next);
    setNotice(success ? (saved.includes(id) ? t.removed : t.saved) : t.storageError);
    setSaved(next);
  }
  function navigate(id: string) {
    const hash = categories.find(category => category.id === id)?.anchor ?? (id === 'all' ? '' : id);
    location.hash = hash;
    setActive(id); setQuery(''); setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  function reset() { navigate('all'); searchRef.current?.focus(); }
  const brand = <a href="#" className="brand" aria-label="Tangsu.house" onClick={event => { event.preventDefault(); navigate('all'); }}><img src={`${import.meta.env.BASE_URL}assets/images/${dark ? 'logo@2x.png' : 'logo_dark@2x.png'}`} width="180" height="40" alt="Tangsu.house" /></a>;
  function navigation(mobile = false) {
    return <>
      <div className="sidebar-brand">{brand}{mobile && <button className="icon-button" aria-label={t.close} onClick={() => setMobileMenu(false)}><X size={20} /></button>}</div>
      <nav aria-label={t.navigation} className="sidebar-nav">
        <button className={`nav-item ${active === 'all' ? 'active' : ''}`} onClick={() => navigate('all')} aria-current={active === 'all' ? 'page' : undefined}><GridFour size={19} /><span>{t.home}</span><span className="nav-count">{sites.length}</span></button>
        <button className={`nav-item ${active === 'favorites' ? 'active' : ''}`} onClick={() => navigate('favorites')} aria-current={active === 'favorites' ? 'page' : undefined}><Star size={19} /><span>{t.favorites}</span><span className="nav-count">{saved.length}</span></button>
        <p className="nav-label">{t.navigation}</p>
        {groups.map(group => <div className="nav-group" key={group}>
          {group === 'daily' ? categories.filter(category => category.group === group).map(navCategory) : <details open={categories.some(category => category.group === group && category.id === active) || undefined}>
            <summary>{group === 'entertainment' ? <FilmSlate size={19} /> : group === 'tools' ? <Wrench size={19} /> : group === 'it' ? <Code size={19} /> : <Palette size={19} />}<span>{t[group]}</span><CaretDown size={13} /></summary>
            <div className="nav-subitems">{categories.filter(category => category.group === group).map(navCategory)}</div>
          </details>}
        </div>)}
      </nav>
      <div className="sidebar-bottom"><div className="collection-note"><Heart size={21} /><p>{t.footer}<span>{t.curated}</span></p></div><button className={`nav-item ${isAbout ? 'active' : ''}`} onClick={() => navigate('about')}><Info size={19} /><span>{t.about}</span><ArrowUpRight size={14} /></button></div>
    </>;
  }
  function navCategory(category: Category) {
    const Icon = categoryIcons[categories.indexOf(category)];
    return <a href={`#${category.anchor}`} key={category.id} className={`nav-item ${active === category.id ? 'active' : ''}`} aria-current={active === category.id ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(category.id); }}><Icon size={18} /><span>{category.name[locale]}</span></a>;
  }
  function section(category: Category) {
    const bookmarks = filtered.filter(site => site.category === category.id);
    if (!bookmarks.length) return null;
    const Icon = categoryIcons[categories.indexOf(category)];
    return <section className="bookmark-section" key={category.id} aria-labelledby={`heading-${category.id}`}>
      <div className="section-heading"><h2 id={`heading-${category.id}`}><Icon size={21} />{category.name[locale]}<span className="count">{bookmarks.length.toString().padStart(2, '0')}</span></h2>{active === 'all' && !query && <a className="category-action" href={`#${category.anchor}`} onClick={event => { event.preventDefault(); navigate(category.id); }} aria-label={`${t.visit}: ${category.name[locale]}`}><ArrowUpRight size={18} /></a>}</div>
      <div className={`bookmark-grid ${view === 'list' ? 'list-view' : ''}`}>{bookmarks.map(site => <BookmarkCard key={site.id} site={site} locale={locale} saved={saved.includes(site.id)} onSave={toggleFavorite} t={t} />)}</div>
    </section>;
  }

  return <>
    <a className="skip-link" href="#main-content">{t.skip}</a>
    <aside className="sidebar">{navigation()}</aside>
    <dialog ref={mobileRef} className="mobile-drawer" aria-label={t.navigation} onCancel={() => setMobileMenu(false)} onClick={event => { if (event.target === event.currentTarget) setMobileMenu(false); }}>{navigation(true)}</dialog>
    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumb"><button className="icon-button menu-trigger" ref={menuRef} aria-label={t.menu} aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}><List size={23} /></button><Compass size={19} /><span>{t.directory}</span><span className="breadcrumb-divider">/</span><strong>{isAbout ? t.about : activeCategory?.name[locale] ?? (active === 'favorites' ? t.favorites : t.home)}</strong></div>
        <div className="topbar-actions"><span className="topbar-note">{t.curated}</span><div ref={settingsRef} className="settings-wrap">
          <button className="language-button" onClick={() => setSettings(!settings)} aria-label={`${t.settings}: ${locale === 'zh' ? '简体中文' : 'English'}`} aria-expanded={settings} aria-controls="preferences"><Translate size={19} /><span>{locale === 'zh' ? '简体中文' : 'English'}</span><CaretDown size={12} /></button>
          {settings && <div className="settings-panel" id="preferences"><label htmlFor="language">{t.language}</label><select id="language" value={language} onChange={event => { const next = event.target.value as LanguagePreference; setLanguage(next); persist('language', next); }}><option value="auto">{t.auto}</option><option value="zh">简体中文</option><option value="en">English</option></select><label htmlFor="theme">{t.theme}</label><select id="theme" value={theme} onChange={event => { const next = event.target.value as Theme; setTheme(next); persist('theme', next); }}><option value="auto">{t.auto}</option><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select><p><Monitor size={14} />{t.local}</p></div>}
        </div><button className="icon-button theme-button" aria-label={`${t.theme}: ${dark ? t.light : t.dark}`} title={`${t.theme}: ${dark ? t.light : t.dark}`} onClick={() => { const next = dark ? 'light' : 'dark'; setTheme(next); persist('theme', next); }}>{dark ? <Sun size={20} /> : <Moon size={20} />}</button></div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {isAbout ? <section className="about-page"><button className="text-button" onClick={() => navigate('all')}><ArrowLeft size={17} />{t.back}</button><div className="about-mark"><Heart size={42} weight="duotone" /></div><h1>{t.aboutTitle}</h1><p>{t.aboutBody}</p><p>{t.aboutNote}</p><a className="primary-button" href="https://blog.tangsu.house" target="_blank" rel="noopener noreferrer">{t.blog}<ArrowUpRight size={18} /></a></section> : <>
          <section className="hero">
            <div className="hero-heading"><div><span className="eyebrow"><Compass size={15} />{locale === 'zh' ? '你的互联网私人收藏夹' : 'YOUR PERSONAL CORNER OF THE WEB'}</span><h1>{t.greeting}</h1><p>{t.intro}</p></div><div className="hero-tally" aria-label={`${sites.length} ${t.sites}, ${categories.length} ${t.categories}`}><strong>{sites.length}<span>↗</span></strong><span>{t.sites}<i />{categories.length} {t.categories}</span></div></div>
            <div className="search-box"><MagnifyingGlass size={23} /><input ref={searchRef} type="search" aria-label={t.searchLabel} placeholder={t.search} value={query} onChange={event => setQuery(event.target.value)} />{query ? <button className="icon-button" aria-label={t.clear} onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={18} /></button> : <kbd>/</kbd>}</div>
            <div className="search-suggestions"><span>{t.searchHint}</span>{['ChatGPT', 'Cloudflare', 'Unsplash'].map(term => <button key={term} onClick={() => { navigate('all'); setQuery(term); searchRef.current?.focus(); }}>{term}<ArrowUpRight size={12} /></button>)}</div>
          </section>
          {!hasFilter && <section className="quick-section" aria-label={t.quick}><div className="quick-label"><Sparkle size={20} /><div><h2>{t.quick}</h2><p>{t.quickHint}</p></div></div><div className="quick-links">{quickSites.map(site => <a href={site.url} target="_blank" rel="noopener noreferrer" className="quick-link" key={site.id}><SiteIcon site={site} /><span>{site.name[locale]}</span><ArrowUpRight size={13} /></a>)}</div></section>}
          <div className="directory-toolbar"><div><h2>{query.trim() ? t.results : active === 'favorites' ? t.favorites : activeCategory?.name[locale] ?? t.browse}</h2><p aria-live="polite">{hasFilter ? `${t.found} ${filtered.length} ${t.sites}${query.trim() ? ` · ${t.resultsFor} “${query.trim()}”` : ''}` : t.browseHint}</p></div><div className="view-toggle" role="group" aria-label={t.settings}><button aria-label={t.grid} aria-pressed={view === 'grid'} onClick={() => { setView('grid'); persist('view', 'grid'); }}><GridFour size={18} /></button><button aria-label={t.list} aria-pressed={view === 'list'} onClick={() => { setView('list'); persist('view', 'list'); }}><List size={19} /></button></div></div>
          <div className="filter-bar" aria-label={t.navigation}><button className={active === 'all' ? 'selected' : ''} aria-pressed={active === 'all'} onClick={() => navigate('all')}>{t.all}<span>{sites.length}</span></button>{categories.filter(category => ['search', 'cloud', 'news', 'online-tools', 'graphics', 'photos'].includes(category.id)).map(category => <button key={category.id} className={active === category.id ? 'selected' : ''} aria-pressed={active === category.id} onClick={() => navigate(category.id)}>{category.name[locale]}</button>)}</div>
          <div className="directory-content" key={`${active}-${view}`}>
            {filtered.length ? categories.map(section) : <div className="empty-state">{active === 'favorites' && !query ? <Star size={40} weight="duotone" /> : <MagnifyingGlass size={40} />}<h2>{query ? t.noResults : active === 'favorites' ? t.emptyFavorites : t.emptyCategory}</h2><p>{query ? t.noResultsHint : active === 'favorites' ? t.emptyFavoritesHint : t.emptyCategoryHint}</p><button className="primary-button" onClick={reset}>{t.reset}<ArrowRight size={17} /></button></div>}
          </div>
        </>}
        <footer className="footer"><p>© {new Date().getFullYear()} <a href="https://blog.tangsu.house" target="_blank" rel="noopener noreferrer">Tangsu</a><span>{t.footer}</span></p><div><a href="#about" onClick={event => { event.preventDefault(); navigate('about'); }}>{t.original}</a><button className="icon-button" aria-label={t.backTop} onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })}><ArrowUp size={17} /></button></div></footer>
      </main>
    </div>
    <Suspense fallback={notice ? <div className="toast" role="status">{notice}</div> : null}>{notice && <Toast notice={notice} />}</Suspense>
  </>;
}
