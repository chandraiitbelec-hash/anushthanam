import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import type { Festival } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('festivals');
  return (rows as unknown as Festival[]).map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('festivals');
  const festival = (rows as unknown as Festival[]).find(f => f.slug === slug);
  return { title: festival ? `${festival.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('festivals');
  const festival = (rows as unknown as Festival[]).find(f => f.slug === slug);
  if (!festival) notFound();

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals', href: '/festivals' }, { label: festival.title_en }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {festival.title_en}
        </h1>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {festival.title_te && (
            <span className="script-telugu" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{festival.title_te}</span>
          )}
          {festival.title_ta && (
            <span className="script-tamil" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{festival.title_ta}</span>
          )}
          {festival.title_hi && (
            <span className="script-devanagari" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{festival.title_hi}</span>
          )}
        </div>

        {festival.next_occurrence && (
          <p style={{
            fontSize: '14px',
            color: 'var(--color-saffron)',
            fontWeight: 500,
            margin: 0,
          }}>
            Next: {new Date(festival.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      {festival.significance_en && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            Significance
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            {festival.significance_en}
          </p>
        </section>
      )}
    </div>
  );
}
