import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems } from '@/lib/relations';
import type { Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ProcedureSteps from '@/components/ProcedureSteps';
import MaterialsList from '@/components/MaterialsList';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('vrathams');
  return (rows as unknown as Vratham[]).map(v => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  return { title: vratham ? `${vratham.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function VrathamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  if (!vratham) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug),
    getMaterialItems(slug),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Vrathams', href: '/vrathams' }, { label: vratham.title_en }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {vratham.title_en}
        </h1>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {vratham.title_te && (
            <span className="script-telugu" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{vratham.title_te}</span>
          )}
          {vratham.title_ta && (
            <span className="script-tamil" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{vratham.title_ta}</span>
          )}
          {vratham.title_hi && (
            <span className="script-devanagari" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{vratham.title_hi}</span>
          )}
          {(vratham.duration || vratham.observance_day) && (
            <span style={{
              padding: '4px 12px',
              background: 'rgba(61,107,79,0.1)',
              border: '1px solid var(--color-green)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-green)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>{vratham.duration || vratham.observance_day}</span>
          )}
        </div>

        {vratham.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: 0 }}>
            Next: {new Date(vratham.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      {vratham.fasting_rules_en && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            Fasting Rules
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            {vratham.fasting_rules_en}
          </p>
        </section>
      )}

      {vratham.benefits_en && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            Benefits
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {vratham.benefits_en}
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
