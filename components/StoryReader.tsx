'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';

type StoryReaderProps = {
  summary: string;
  paragraphs: string[];
  readLabel?: string;
};

export default function StoryReader({ summary, paragraphs, readLabel }: StoryReaderProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const READ_LABEL: Record<string, string> = {
    en: 'Read full story', te: 'పూర్తి కథ చదవండి', ta: 'முழு கதை படிக்க', hi: 'पूरी कथा पढ़ें',
  };
  const CLOSE_LABEL: Record<string, string> = {
    en: 'Close', te: 'మూయండి', ta: 'மூடு', hi: 'बंद करें',
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 24px' }}>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          margin: 0,
          lineHeight: 1.8,
        }}>
          {summary}
        </p>
      </div>

      {paragraphs.length > 0 && (
        <>
          <div style={{ padding: '0 24px 20px' }}>
            <button onClick={() => setExpanded(e => !e)} style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-gold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}>
              {expanded ? CLOSE_LABEL[lang] : (readLabel || READ_LABEL[lang])} {expanded ? '▲' : '▼'}
            </button>
          </div>

          {expanded && (
            <div style={{
              padding: '0 24px 24px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '20px',
            }}>
              {paragraphs.map((para, i) => (
                <p key={i} style={{
                  fontSize: '15px',
                  lineHeight: 1.9,
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
  );
}
