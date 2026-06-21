import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getLinksForGod } from '@/lib/relations';
import type { God, GodLink } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import RelatedContent from '@/components/RelatedContent';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('gods');
  return (rows as unknown as God[]).map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('gods');
  const god = (rows as unknown as God[]).find(g => g.slug === slug);
  return { title: god ? `${god.name_en} | Anushthanam` : 'Anushthanam' };
}

export default async function GodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('gods');
  const god = (rows as unknown as God[]).find(g => g.slug === slug);
  if (!god) notFound();

  const rawLinks = await getLinksForGod(slug);
  const links = {
    shlokas: rawLinks.filter((l: GodLink) => l.entity_type === 'shloka'),
    pujas: rawLinks.filter((l: GodLink) => l.entity_type === 'puja'),
    festivals: rawLinks.filter((l: GodLink) => l.entity_type === 'festival'),
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Gods', href: '/gods' }, { label: god.name_en }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
        }}>
          {god.name_en}
        </h1>

        {god.name_sa && (
          <p className="script-devanagari" style={{
            fontSize: '22px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 4px',
          }}>
            {god.name_sa}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {god.name_te && (
            <span className="script-telugu" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{god.name_te}</span>
          )}
          {god.name_ta && (
            <span className="script-tamil" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{god.name_ta}</span>
          )}
          {god.name_hi && (
            <span className="script-devanagari" style={{
              padding: '4px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '14px',
            }}>{god.name_hi}</span>
          )}
          {god.tradition && (
            <span style={{
              padding: '4px 12px',
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-gold)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>{god.tradition}</span>
          )}
        </div>
      </div>

      {god.description_en && (
        <section style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            {god.description_en}
          </p>
        </section>
      )}

      {god.iconography_en && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            Iconography
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {god.iconography_en}
          </p>
        </section>
      )}

      {links.shlokas.length > 0 && (
        <RelatedContent
          heading="Shlokas & Stotras"
          items={links.shlokas.map((l: GodLink) => ({
            slug: l.entity_slug,
            name: l.entity_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            href: `/shlokas/${l.entity_slug}`,
            type: 'shloka',
          }))}
        />
      )}

      {links.pujas.length > 0 && (
        <RelatedContent
          heading="Pujas"
          items={links.pujas.map((l: GodLink) => ({
            slug: l.entity_slug,
            name: l.entity_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            href: `/pujas/${l.entity_slug}`,
            type: 'puja',
          }))}
        />
      )}

      {links.festivals.length > 0 && (
        <RelatedContent
          heading="Festivals"
          items={links.festivals.map((l: GodLink) => ({
            slug: l.entity_slug,
            name: l.entity_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            href: `/festivals/${l.entity_slug}`,
            type: 'festival',
          }))}
        />
      )}
    </div>
  );
}
