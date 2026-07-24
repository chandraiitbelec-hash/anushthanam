'use client';

import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';

type Part = { slug: string; title_en: string; title_te?: string; title_ta?: string; title_hi?: string };

export default function StoryPartPicker({
  parts,
  currentSlug,
}: {
  parts: Part[];
  currentSlug: string;
}) {
  const router = useRouter();
  const { lang } = useLang();
  const ui = UI[lang];
  if (parts.length < 2) return null;

  const currentIndex = parts.findIndex(p => p.slug === currentSlug);

  function partTitle(p: Part) {
    return localize(p, 'title', lang);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
        {ui.partOf(currentIndex + 1, parts.length)}
      </span>
      <select
        value={currentSlug}
        onChange={e => router.push(`/stories/${e.target.value}`)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '5px 32px 5px 12px',
          background: `var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23B8860B'/%3E%3C/svg%3E") no-repeat right 10px center`,
          border: '1px solid var(--color-gold)',
          borderRadius: '20px',
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          maxWidth: '260px',
        }}
      >
        {parts.map((p, idx) => (
          <option key={p.slug} value={p.slug}>
            {idx + 1}. {partTitle(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
