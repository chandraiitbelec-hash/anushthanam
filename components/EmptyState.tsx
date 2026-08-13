'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

export type EmptyStateType = 'gods' | 'festivals' | 'vrathams' | 'pujas' | 'shlokas' | 'occasions' | 'occasion-pujas' | 'live-streams' | 'temples';

const ICON: Record<EmptyStateType, string> = {
  gods: '🕉',
  festivals: '🪔',
  vrathams: '🙏',
  pujas: '🪷',
  shlokas: '📖',
  occasions: '🏠',
  'occasion-pujas': '🪷',
  'live-streams': '📺',
  temples: '🛕',
};

export default function EmptyState({ type }: { type: EmptyStateType }) {
  const { lang } = useLang();
  const c = UI[lang].emptyState[type];

  return (
    <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
      <p style={{ fontSize: 'var(--icon-empty-state)', margin: '0 0 16px' }} aria-hidden="true">{ICON[type]}</p>
      <p style={{ fontSize: 'var(--text-card-title)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{c.title}</p>
      <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{c.body}</p>
    </div>
  );
}
