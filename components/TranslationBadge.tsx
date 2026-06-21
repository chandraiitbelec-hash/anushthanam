import type { TranslationResult } from '@/lib/types';

export function TranslationBadge({ result, fieldName }: { result: TranslationResult; fieldName: string }) {
  if (!result.isFallback) return null;
  if (process.env.NEXT_PUBLIC_SHOW_TRANSLATION_BADGES !== 'true') return null;
  return (
    <span style={{
      fontSize: '11px',
      background: 'rgba(234,179,8,0.15)',
      color: '#92400e',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '6px',
      verticalAlign: 'middle',
    }}>
      {fieldName}: EN fallback
    </span>
  );
}
