'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import StoryPartPicker from './StoryPartPicker';
import type { Story } from '@/lib/types';

type Part = { slug: string; title_en: string };

type Props = {
  story: Story;
  bodies: Record<string, string[]>;   // keyed by lang code, value = paragraphs
  summaries: Record<string, string>;  // keyed by lang code
  parent: { title_en: string; href: string } | null;
  parts: Part[];
};

const READ_LABEL: Record<string, string> = {
  en: 'Read full story', te: 'పూర్తి కథ చదవండి', ta: 'முழு கதை படிக்க', hi: 'पूरी कथा पढ़ें',
};
const CLOSE_LABEL: Record<string, string> = {
  en: 'Close', te: 'మూయండి', ta: 'மூடு', hi: 'बंद करें',
};

export default function StoryContent({ story, bodies, summaries, parent, parts }: Props) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const r = story as unknown as Record<string, string>;

  const title   = r[`title_${lang}`]         || story.title_en;
  const summary = summaries[lang]             || summaries.en || '';
  const paras   = (bodies[lang]?.length ? bodies[lang] : bodies.en) ?? [];

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil'  :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <>
      {/* Back link */}
      {parent && (
        <Link href={parent.href} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '13px', color: 'var(--color-gold)', fontWeight: 500,
          textDecoration: 'none', marginBottom: '12px',
        }}>
          ← {parent.title_en}
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
      }}>
        {title}
      </h1>

      {/* Subtitle: English title when viewing in another language */}
      {lang !== 'en' && story.title_en && (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
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
        {summary && (
          <div style={{ padding: '20px 24px' }}>
            <p className={nameClass} style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.8,
            }}>
              {summary}
            </p>
          </div>
        )}

        {paras.length > 0 && (
          <>
            <div style={{ padding: summary ? '0 24px 20px' : '20px 24px' }}>
              <button onClick={() => setExpanded(e => !e)} style={{
                fontSize: '13px', fontWeight: 500,
                color: 'var(--color-gold)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                {expanded ? CLOSE_LABEL[lang] : READ_LABEL[lang]} {expanded ? '▲' : '▼'}
              </button>
            </div>

            {expanded && (
              <div style={{
                padding: '20px 24px 24px',
                borderTop: '1px solid var(--color-border)',
              }}>
                {paras.map((para, i) => (
                  <p key={i} className={nameClass} style={{
                    fontSize: '15px',
                    lineHeight: lang === 'te' ? 2.1 : lang === 'ta' ? 1.9 : lang === 'hi' ? 1.8 : 1.9,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 16px',
                  }}>
                    {para}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
