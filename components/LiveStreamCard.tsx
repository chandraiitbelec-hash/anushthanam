'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';
import { scriptClass } from '@/lib/utils';
import type { LiveStream } from '@/lib/types';
import YouTubeEmbed from '@/components/YouTubeEmbed';

export default function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const { lang } = useLang();
  const templeName = localize(stream, 'temple_name', lang);
  const location = localize(stream, 'location', lang);
  const schedule = localize(stream, 'arathi_schedule', lang);
  const titleClass = scriptClass(lang);

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
        {schedule && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{
              fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--color-gold-text)', margin: '0 0 4px',
            }}>
              {UI[lang].arathiSchedule}
            </p>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
              {schedule}
            </p>
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
