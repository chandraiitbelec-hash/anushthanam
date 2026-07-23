'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { searchFuseOptions } from '@/lib/search-config';
import type { SearchRecord } from '@/lib/types';

export default function SearchBar({ autoFocus = false, onSelect, maxWidth = 480 }: { autoFocus?: boolean; onSelect?: () => void; maxWidth?: number } = {}) {
  const { lang } = useLang();
  const ui = UI[lang];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [fuseReady, setFuseReady] = useState(false);
  const fuseRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [{ default: Fuse }, res] = await Promise.all([
        import('fuse.js'),
        fetch('/search-index.json'),
      ]);
      if (cancelled) return;
      const index: SearchRecord[] = await res.json();
      fuseRef.current = new Fuse(index, searchFuseOptions);
      setFuseReady(true);
    }
    init().catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!fuseRef.current || !query.trim()) {
      setResults([]);
      return;
    }
    const hits: any[] = fuseRef.current.search(query.trim(), { limit: 8 });
    setResults(hits.map((h: { item: SearchRecord }) => h.item));
    setOpen(hits.length > 0);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const TYPE_ICON: Record<string, string> = {
    god: '🕉', shloka: '📖', festival: '🪔', vratham: '🙏',
  };

  const TYPE_LABEL: Record<string, string> = {
    god: ui.deityLabel, shloka: ui.shlokaLabel, festival: ui.festivalWord, vratham: ui.vrathamWord,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth }}>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={ui.searchPlaceholder}
        aria-label={ui.searchPlaceholder}
        style={{
          width: '100%',
          padding: '10px 16px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-popover)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {results.map(r => (
            <Link
              key={r.url}
              href={r.url}
              onClick={() => { setOpen(false); setQuery(''); onSelect?.(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                textDecoration: 'none',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{TYPE_ICON[r.type] ?? '•'}</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
                {r[`name_${lang}` as keyof SearchRecord] as string || r.name_en}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
