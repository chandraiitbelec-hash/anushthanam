import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems } from '@/lib/relations';
import type { Puja } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ProcedureSteps from '@/components/ProcedureSteps';
import MaterialsList from '@/components/MaterialsList';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('pujas');
  return (rows as unknown as Puja[]).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('pujas');
  const puja = (rows as unknown as Puja[]).find(p => p.slug === slug);
  return { title: puja ? `${puja.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function PujaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('pujas');
  const puja = (rows as unknown as Puja[]).find(p => p.slug === slug);
  if (!puja) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug),
    getMaterialItems(slug),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Pujas', href: '/pujas' }, { label: puja.title_en }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {puja.title_en}
        </h1>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {puja.title_te && (
            <span className="script-telugu" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{puja.title_te}</span>
          )}
          {puja.title_ta && (
            <span className="script-tamil" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{puja.title_ta}</span>
          )}
          {puja.title_hi && (
            <span className="script-devanagari" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{puja.title_hi}</span>
          )}
          {puja.duration_minutes && (
            <span style={{
              padding: '4px 12px',
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-gold)',
              fontWeight: 600,
            }}>{puja.duration_minutes} min</span>
          )}
        </div>
      </div>

      {puja.brief_description_en && (
        <section style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            {puja.brief_description_en}
          </p>
        </section>
      )}

      {materials.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
          }}>
            Materials Required
          </h2>
          <MaterialsList items={materials} />
        </section>
      )}

      {steps.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
          }}>
            Procedure
          </h2>
          <ProcedureSteps steps={steps} />
        </section>
      )}
    </div>
  );
}
