'use client';

import { useState } from 'react';
import Image from 'next/image';

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  watchLiveLabel: string;
};

// Renders a thumbnail poster by default; the iframe (and its cookies/tracking)
// only loads after a click. Cheaper than mounting N youtube-nocookie iframes
// up front when several temples are on one page.
export default function YouTubeEmbed({ videoId, title, watchLiveLabel }: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 9',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#000',
    }}>
      {loaded ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <button
          onClick={() => setLoaded(true)}
          aria-label={watchLiveLabel}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            padding: 0,
            border: 'none',
            cursor: 'pointer',
            background: 'none',
          }}
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
          <span aria-hidden="true" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
