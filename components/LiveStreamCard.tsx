'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';
import { scriptClass } from '@/lib/utils';
import type { LiveStream, Temple } from '@/lib/types';
import YouTubeEmbed from '@/components/YouTubeEmbed';

const VISIBLE_SCHEDULE_ITEMS = 3;

// Lightweight deity reference for the tag chip — callers resolve this from
// `gods` via god_links (entity_type 'temple') rather than LiveStreamCard doing its own fetch.
type DeityTag = { name_en: string; name_te: string; name_ta: string; name_hi: string };

function Badge({ children, tone }: { children: React.ReactNode; tone: 'saffron' | 'gold' }) {
  const colors = {
    saffron: { bg: 'rgba(212,98,42,0.9)', color: '#fff' },
    gold: { bg: 'rgba(184,134,11,0.9)', color: '#fff' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 'var(--text-badge)', fontWeight: 600,
      padding: '3px 9px', borderRadius: '20px',
      background: colors.bg, color: colors.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export default function LiveStreamCard({ stream, temple, deity }: { stream: LiveStream; temple?: Temple; deity?: DeityTag }) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const templeName = temple ? localize(temple, 'name', lang) : '';
  const location = temple ? localize(temple, 'location', lang) : '';
  const schedule = localize(stream, 'arathi_schedule', lang);
  const description = localize(stream, 'description', lang);
  const deityName = deity ? localize(deity, 'name', lang) : undefined;
  const titleClass = scriptClass(lang);

  // Free-text schedule fields are comma-separated entries (e.g. "Suprabhatam
  // 5:00 AM, Maha Deeparadhana 6:00 PM"). Split into scannable lines instead
  // of one dense paragraph; a plain one-sentence note (no commas) still
  // renders as a single line.
  const scheduleItems = schedule ? schedule.split(',').map(s => s.trim()).filter(Boolean) : [];
  const hasMoreItems = scheduleItems.length > VISIBLE_SCHEDULE_ITEMS;
  const visibleItems = expanded ? scheduleItems : scheduleItems.slice(0, VISIBLE_SCHEDULE_ITEMS);

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <YouTubeEmbed
        videoId={stream.youtube_video_id}
        title={templeName}
        watchLiveLabel={UI[lang].watchLive}
        posterUrl={stream.hero_image_url || undefined}
        overlay={
          (stream.featured || deityName) && (
            <>
              {stream.featured && <Badge tone="saffron">{UI[lang].featuredLabel}</Badge>}
              {deityName && <Badge tone="gold">{deityName}</Badge>}
            </>
          )
        }
      />
      <div style={{ padding: '16px' }}>
        <p className={titleClass} style={{
          fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
          fontSize: 'var(--text-card-title)',
          fontWeight: 600,
          margin: '0 0 4px',
          color: 'var(--color-text-primary)',
        }}>
          {templeName}
        </p>
        {location && (
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
            {location}
          </p>
        )}
        {stream.established_note_en && (
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 10px', fontStyle: 'italic' }}>
            {UI[lang].establishedLabel} {stream.established_note_en}
          </p>
        )}
        {description && (
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: '0 0 12px', lineHeight: 1.6 }}>
            {description}
          </p>
        )}
        {scheduleItems.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{
              fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--color-gold-text)', margin: '0 0 6px',
            }}>
              {UI[lang].arathiSchedule}
            </p>
            {scheduleItems.length === 1 ? (
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.6 }}>
                {scheduleItems[0]}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0, padding: 0 }}>
                {visibleItems.map((item, i) => (
                  <li key={i} style={{
                    fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)',
                    lineHeight: 1.5, paddingLeft: '14px', position: 'relative',
                  }}>
                    <span aria-hidden="true" style={{ position: 'absolute', left: 0, color: 'var(--color-gold-text)' }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {hasMoreItems && (
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                style={{
                  fontSize: 'var(--text-meta)', color: 'var(--color-gold-text)',
                  background: 'none', border: 'none', padding: '6px 0 0', margin: 0,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                {expanded ? UI[lang].showLessSchedule : UI[lang].showMoreSchedule(scheduleItems.length - VISIBLE_SCHEDULE_ITEMS)}
              </button>
            )}
          </div>
        )}
        {stream.channel_url && (
          <a
            href={stream.channel_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-meta)', color: 'var(--color-gold-text)', textDecoration: 'none' }}
          >
            {UI[lang].visitChannel} ↗
          </a>
        )}
      </div>
    </div>
  );
}
