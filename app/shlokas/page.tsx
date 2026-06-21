import { getPublished } from '@/lib/sheets';
import type { Shloka } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export default async function ShlokasPage() {
  const rows = await getPublished('shlokas');
  const shlokas = rows as unknown as Shloka[];

  const byType = shlokas.reduce<Record<string, Shloka[]>>((acc, s) => {
    const key = s.type || 'other';
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Shlokas' }]} />
      <ListPageHeader
        titles={{ en: 'Shlokas & Stotras', te: 'శ్లోకాలు & స్తోత్రాలు', ta: 'ஸ்லோகங்கள் & ஸ்தோத்திரங்கள்', hi: 'श्लोक & स्तोत्र' }}
        count={shlokas.length}
        countLabels={{ en: 'texts', te: 'రచనలు', ta: 'நூல்கள்', hi: 'ग्रंथ' }}
      />

      {Object.entries(byType).map(([type, list]) => (
        <section key={type} style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
          }}>
            {type}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {list.map(s => (
              <EntityCard
                key={s.slug}
                href={`/shlokas/${s.slug}`}
                names={{ en: s.title_en, te: s.title_te, ta: s.title_ta, hi: s.title_hi }}
                badge={s.type || undefined}
                badgeColor="gold"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
