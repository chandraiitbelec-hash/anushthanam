import { getPublished } from '@/lib/sheets';
import type { Shloka } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

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
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Shlokas &amp; Stotras
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {shlokas.length} texts
      </p>

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
                title={s.title_en}
                subtitle={s.brief_intro_en?.slice(0, 60) || undefined}
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
