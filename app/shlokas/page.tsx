import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { Shloka } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import ShlokaTypeTabs from '@/components/ShlokaTypeTabs';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Shlokas & Stotras | Anushthanam',
  description: 'Hindu shlokas, stotras, and prayers — Ashtothram, Sahasranamam, Chalisa, Kavacham with meanings in Telugu, Tamil, Hindi, and English.',
};

const TYPE_ORDER = ['ashtothram', 'sahasranamam', 'chalisa', 'stotra', 'kavacham', 'suprabhatam', 'namavali'];

export default async function ShlokasPage() {
  const rows = await getPublished('shlokas');
  const shlokas = rows as unknown as Shloka[];

  const byType = shlokas.reduce<Record<string, Shloka[]>>((acc, s) => {
    const key = s.type || 'other';
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  // Stable order: known types first, then any extras
  const orderedTypes = [
    ...TYPE_ORDER.filter(t => byType[t]),
    ...Object.keys(byType).filter(t => !TYPE_ORDER.includes(t)),
  ];

  const groups = orderedTypes.map(type => ({ type, shlokas: byType[type] }));

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Shlokas' }]} />
      <ListPageHeader
        titles={{ en: 'Shlokas & Stotras', te: 'శ్లోకాలు & స్తోత్రాలు', ta: 'ஸ்லோகங்கள் & ஸ்தோத்திரங்கள்', hi: 'श्लोक & स्तोत्र' }}
        count={shlokas.length}
        countLabels={{ en: 'texts', te: 'రచనలు', ta: 'நூல்కள்', hi: 'ग्रंथ' }}
      />

      {shlokas.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 16px' }}>📖</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>No shlokas published yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Shlokas and stotras will appear here once published from the content management system.</p>
        </div>
      ) : (
        <ShlokaTypeTabs groups={groups} />
      )}
    </div>
  );
}
