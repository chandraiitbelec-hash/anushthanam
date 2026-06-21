import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getShlokaStanzas } from '@/lib/relations';
import type { Shloka } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ShlokaHeader from '@/components/ShlokaHeader';
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
  return { title: shloka ? `${shloka.title_en} | Anuṣṭhāna` : 'Anuṣṭhāna' };
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
      <ShlokaHeader shloka={shloka} />
      {stanzas.length > 0 && <ShlokaViewer stanzas={stanzas} />}
    </div>
  );
}
