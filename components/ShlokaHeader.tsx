'use client';

import { useLang } from '@/context/LanguageContext';
import type { Shloka } from '@/lib/types';

export default function ShlokaHeader({ shloka }: { shloka: Shloka }) {
  const { lang } = useLang();

  const title = (shloka as unknown as Record<string, string>)[`title_${lang}`] || shloka.title_en;
  const intro = (shloka as unknown as Record<string, string>)[`brief_intro_${lang}`] || shloka.brief_intro_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 className={nameClass} style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {title}
        </h1>

        {lang !== 'en' && shloka.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            {shloka.title_en}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {shloka.type && (
            <span style={{
              padding: '3px 10px',
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-gold)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {shloka.type}
            </span>
          )}
          {shloka.language_of_composition && (
            <span style={{
              padding: '3px 10px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              textTransform: 'capitalize',
            }}>
              {shloka.language_of_composition}
            </span>
          )}
        </div>
      </div>

      {intro && (
        <p style={{
          fontSize: '15px',
          lineHeight: 1.8,
          color: 'var(--color-text-secondary)',
          margin: '0 0 32px',
        }}>
          {intro}
        </p>
      )}
    </>
  );
}
