import type { Metadata } from 'next';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { rowToShloka } from '@/lib/relations';
import type { Shloka } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import ShlokaTypeTabs from '@/components/ShlokaTypeTabs';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Shlokas & Stotras',
  description: 'Hindu shlokas, stotras, and prayers — Ashtothram, Sahasranamam, Chalisa, Kavacham with meanings in Telugu, Tamil, Hindi, and English.',
};

const TYPE_ORDER = ['ashtothram', 'sahasranamam', 'chalisa', 'stotra', 'kavacham', 'suprabhatam', 'namavali'];

export default async function ShlokasPage() {
  const rows = await getPublished(TABS.shlokas).catch(emptyOnError(TABS.shlokas, 'shlokas', []));
  const shlokas = rows.map(rowToShloka);

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
      <Breadcrumb crumbs={[{ label: 'Shlokas', labels: { te: 'శ్లోకాలు', ta: 'ஸ்லோகங்கள்', hi: 'श्लोक' } }]} />
      <ListPageHeader
        titles={{ en: 'Shlokas & Stotras', te: 'శ్లోకాలు & స్తోత్రాలు', ta: 'ஸ்லோகங்கள் & ஸ்தோத்திரங்கள்', hi: 'श्लोक & स्तोत्र' }}
        count={shlokas.length}
        countLabels={{ en: 'texts', te: 'రచనలు', ta: 'நூல்కள்', hi: 'ग्रंथ' }}
      />

      {shlokas.length === 0 ? (
        <EmptyState type="shlokas" />
      ) : (
        <ShlokaTypeTabs groups={groups} />
      )}
    </div>
  );
}
