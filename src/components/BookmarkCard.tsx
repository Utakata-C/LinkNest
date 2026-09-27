import { useState } from 'react';
import { ArrowUpRight, Star, Globe } from '@phosphor-icons/react';
import type { Bookmark, Locale } from '../types';
import type { Messages } from '../i18n';
import { domain } from '../lib';

export function SiteIcon({ site }: { site: Bookmark }) {
  const [failed, setFailed] = useState(false);
  return <span className="site-icon">{failed ? <Globe size={24} /> : <img src={`${import.meta.env.BASE_URL}${site.icon}`} alt="" width="36" height="36" loading="lazy" onError={() => setFailed(true)} />}</span>;
}
export function BookmarkCard({ site, locale, saved, onSave, t }: { site: Bookmark; locale: Locale; saved: boolean; onSave: (id: string) => void; t: Messages }) {
  return <article className={`bookmark-card ${saved ? 'is-saved' : ''}`}>
    <a className="bookmark-link" href={site.url} target="_blank" rel="noopener noreferrer">
      <div className="card-top"><SiteIcon site={site} /><ArrowUpRight className="outbound" size={17} /></div>
      <h3>{site.name[locale]}</h3>
      <p title={site.description[locale]}>{site.description[locale]}</p>
      <span className="site-domain">{domain(site.url)}</span>
    </a>
    <button type="button" className="star-button" aria-label={`${saved ? t.removeFavorite : t.addFavorite} ${site.name[locale]}`} aria-pressed={saved} title={saved ? t.removeFavorite : t.addFavorite} onClick={() => onSave(site.id)}><Star size={17} weight={saved ? 'fill' : 'regular'} /></button>
  </article>;
}
