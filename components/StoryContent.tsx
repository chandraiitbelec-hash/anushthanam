'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import StoryPartPicker from './StoryPartPicker';
import type { Story } from '@/lib/types';

type Part = { slug: string; title_en: string; title_te?: string; title_ta?: string; title_hi?: string };

type Props = {
  story: Story;
  bodies: Record<string, string[]>;
  parent: { title_en: string; title_te?: string; title_ta?: string; title_hi?: string; href: string } | null;
  parts: Part[];
};

export default function StoryContent({ story, bodies, parent, parts }: Props) {
  const { lang } = useLang();

  const r = story as unknown as Record<string, string>;

  const title = r[`title_${lang}`] || story.title_en;

  // Pick body in selected language; track if we fell back to English
  const bodyLang  = bodies[lang]?.length ? lang : 'en';
  const paras     = bodies[bodyLang] ?? [];
  const isFallback = lang !== 'en' && bodyLang === 'en' && paras.length > 0;

  const nameClass = scriptClass(lang);

  return (
    <>
      {/* Back link — only for orphaned stories; stories with a parent use the breadcrumb */}
      {!parent && (
        <Link href="/stories" style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '13px', color: 'var(--color-gold)', fontWeight: 500,
          textDecoration: 'none', marginBottom: '12px',
        }}>
          ← {UI[lang].storiesLabel}
        </Link>
      )}

      {/* Title */}
      <h1 className={nameClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
        fontSize: 'clamp(26px, 4vw, 44px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 12px',
        lineHeight: 1.2,
        // Tallest script variant sets a floor so switching scripts doesn't shift the page start.
        minHeight: 'calc(clamp(26px, 4vw, 44px) * 1.4)',
      }}>
        {title}
      </h1>

      {/* Subtitle: English title — permanent slot, hidden (not removed) in English */}
      {story.title_en && (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 12px', visibility: lang === 'en' ? 'hidden' : 'visible' }}>
          {story.title_en}
        </p>
      )}

      {/* Meta row: story type + part picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {story.story_type && (
          <span style={{
            padding: '3px 10px',
            background: 'rgba(212,98,42,0.1)',
            border: '1px solid var(--color-saffron)',
            borderRadius: '20px',
            fontSize: '12px', color: 'var(--color-saffron)', fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {story.story_type.replace(/-/g, ' ')}
          </span>
        )}
        <StoryPartPicker parts={parts} currentSlug={story.slug} />
      </div>

      {/* Reading instruction */}
      {story.reading_instruction_en && (
        <p style={{
          fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic',
          margin: '0 0 24px', padding: '12px 16px',
          background: 'var(--color-surface)', borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}>
          {story.reading_instruction_en}
        </p>
      )}

      {/* Summary + expandable body */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {paras.length > 0 && (
          <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Fallback note — permanent slot, hidden (not removed) when not falling back,
                so it never appears/disappears mid-scroll as the language toggles. */}
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              margin: 0,
              padding: '6px 10px',
              background: 'rgba(184,134,11,0.06)',
              border: '1px solid rgba(184,134,11,0.2)',
              borderRadius: '6px',
              visibility: isFallback ? 'visible' : 'hidden',
            }}>
              {UI[lang].storyFallbackNote}
            </p>
            {paras.map((para, i) => (
              <p key={i} className={isFallback ? '' : nameClass} style={{
                fontSize: '15px',
                lineHeight: isFallback ? 1.9 : lang === 'te' ? 2.1 : lang === 'ta' ? 1.9 : lang === 'hi' ? 1.8 : 1.9,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
