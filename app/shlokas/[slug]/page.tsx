import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getShlokaStanzas } from '@/lib/relations';
import type { Shloka } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ShlokaViewer from '@/components/ShlokaViewer';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('shlokas');
  return (rows as unknown as Shloka[]).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('shlokas');
  const shloka = (rows as unknown as Shloka[]).find(s => s.slug === slug);
  return { title: shloka ? `${shloka.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function ShlokaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('shlokas');
  const shloka = (rows as unknown as Shloka[]).find(s => s.slug === slug);
  if (!shloka) notFound();

  const stanzas = await getShlokaStanzas(slug);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Shlokas', href: '/shlokas' }, { label: shloka.title_en }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {shloka.title_en}
        </h1>
        {shloka.title_te && (
          <p className="script-telugu" style={{
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            {shloka.title_te}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {shloka.type && (
            <span style={{
              padding: '3px 10px',
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-gold)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>{shloka.type}</span>
          )}
          {shloka.language_of_composition && (
            <span style={{
              padding: '3px 10px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              textTransform: 'capitalize',
            }}>{shloka.language_of_composition}</span>
          )}
        </div>
      </div>

      {shloka.brief_intro_en && (
        <p style={{
          fontSize: '15px',
          lineHeight: 1.8,
          color: 'var(--color-text-secondary)',
          margin: '0 0 32px',
        }}>
          {shloka.brief_intro_en}
        </p>
      )}

      {stanzas.length > 0 && <ShlokaViewer stanzas={stanzas} />}
    </div>
  );
}
