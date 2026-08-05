'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';
import { scriptClass } from '@/lib/utils';
import type { LiveStream } from '@/lib/types';
import YouTubeEmbed from '@/components/YouTubeEmbed';

const VISIBLE_SCHEDULE_ITEMS = 3;

export default function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const templeName = localize(stream, 'temple_name', lang);
  const location = localize(stream, 'location', lang);
  const schedule = localize(stream, 'arathi_schedule', lang);
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
      <YouTubeEmbed videoId={stream.youtube_video_id} title={templeName} watchLiveLabel={UI[lang].watchLive} />
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
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            {location}
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
