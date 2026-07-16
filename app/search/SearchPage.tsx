'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { SearchRecord } from '@/lib/types';

const LOADING_LABEL: Record<string, string> = {
  en: 'Loading search…',
  te: 'సెర్చ్ లోడవుతోంది…',
  ta: 'தேடல் ஏற்றப்படுகிறது…',
  hi: 'खोज लोड हो रहा है…',
};

const PLACEHOLDER: Record<string, string> = {
  en: 'Search gods, shlokas, festivals, vrathams…',
  te: 'దేవతలు, శ్లోకాలు, పండుగలు వెతకండి…',
  ta: 'தேவர்கள், ஸ்லோகங்கள், திருவிழாக்கள் தேடு…',
  hi: 'देवता, श्लोक, त्योहार खोजें…',
};

const TYPE_ICON: Record<string, string> = {
  god: '🕉', shloka: '📖', festival: '🪔', vratham: '🙏',
};

const TYPE_LABEL: Record<string, Record<string, string>> = {
  god:     { en: 'God', te: 'దేవత', ta: 'தெய்வம்', hi: 'देवता' },
  shloka:  { en: 'Shloka', te: 'శ్లోకం', ta: 'ஸ்லோகம்', hi: 'श्लोक' },
  festival:{ en: 'Festival', te: 'పండుగ', ta: 'திருவிழா', hi: 'त्योहार' },
  vratham: { en: 'Vratham', te: 'వ్రతం', ta: 'விரதம்', hi: 'व्रत' },
};

export default function SearchPage() {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [empty, setEmpty] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fuseRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [{ default: Fuse }, res] = await Promise.all([
        import('fuse.js'),
        fetch('/search-index.json'),
      ]);
      if (cancelled) return;
      const index: SearchRecord[] = await res.json();
      setEmpty(index.length === 0);
      fuseRef.current = new Fuse(index, {
        threshold: 0.35,
        minMatchCharLength: 2,
        keys: [
          { name: 'name_en', weight: 0.4 },
          { name: 'name_te', weight: 0.2 },
          { name: 'name_ta', weight: 0.2 },
          { name: 'name_hi', weight: 0.1 },
          { name: 'name_sa', weight: 0.05 },
          { name: 'alternate_names', weight: 0.05 },
        ],
      });
      setReady(true);
    }
    init().catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!fuseRef.current || !query.trim()) { setResults([]); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits: any[] = fuseRef.current.search(query.trim(), { limit: 20 });
    setResults(hits.map(h => h.item));
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [ready]);

  const ui = UI[lang];
  const nameForLang = (r: SearchRecord) =>
    (r[`name_${lang}` as keyof SearchRecord] as string) || r.name_en;

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={PLACEHOLDER[lang] ?? PLACEHOLDER.en}
          aria-label={PLACEHOLDER[lang] ?? PLACEHOLDER.en}
          disabled={!ready}
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
        />
        {!ready && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            {LOADING_LABEL[lang] ?? LOADING_LABEL.en}
          </p>
        )}
        <span style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="5" />
            <line x1="11.5" y1="11.5" x2="16" y2="16" />
          </svg>
        </span>
      </div>

      {empty && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          {ui.searchBuilding}
        </p>
      )}

      {!empty && ready && query && results.length === 0 && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          {ui.searchNoResults(query)}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {results.map(r => (
            <Link key={r.url} href={r.url} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{TYPE_ICON[r.type] ?? '•'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {nameForLang(r)}
                </div>
                {nameForLang(r) !== r.name_en && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {r.name_en}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '2px 8px',
                flexShrink: 0,
              }}>
                {TYPE_LABEL[r.type]?.[lang] ?? r.type}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!query && ready && !empty && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {([
            { href: '/gods',     label: ui.gods },
            { href: '/festivals',label: ui.festivals },
            { href: '/shlokas',  label: ui.shlokas },
            { href: '/vrathams', label: ui.vrathams },
          ] as { href: string; label: string }[]).map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '8px 16px',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              background: 'var(--color-surface)',
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
