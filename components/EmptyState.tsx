'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

export type EmptyStateType = 'gods' | 'festivals' | 'vrathams' | 'pujas' | 'shlokas' | 'occasions' | 'occasion-pujas';

const ICON: Record<EmptyStateType, string> = {
  gods: '🕉',
  festivals: '🪔',
  vrathams: '🙏',
  pujas: '🪷',
  shlokas: '📖',
  occasions: '🏠',
  'occasion-pujas': '🪷',
};

export default function EmptyState({ type }: { type: EmptyStateType }) {
  const { lang } = useLang();
  const c = UI[lang].emptyState[type];

  return (
    <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
      <p style={{ fontSize: '36px', margin: '0 0 16px' }} aria-hidden="true">{ICON[type]}</p>
      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{c.title}</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>{c.body}</p>
    </div>
  );
}
