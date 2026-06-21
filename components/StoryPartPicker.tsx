'use client';

import { useRouter } from 'next/navigation';

type Part = { slug: string; title_en: string };

export default function StoryPartPicker({
  parts,
  currentSlug,
}: {
  parts: Part[];
  currentSlug: string;
}) {
  const router = useRouter();
  if (parts.length < 2) return null;

  const currentIndex = parts.findIndex(p => p.slug === currentSlug);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
        Part {currentIndex + 1} of {parts.length}
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
            {idx + 1}. {p.title_en}
          </option>
        ))}
      </select>
    </div>
  );
}
