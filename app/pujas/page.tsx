import type { Metadata } from 'next';
import { getFrequentPujas, getOccasions, getAllOccasionPujas } from '@/lib/relations';
import { emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import Breadcrumb from '@/components/Breadcrumb';
import PujasBrowser from '@/components/PujasBrowser';
import ScriptH1 from '@/components/ScriptH1';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pujas',
  description: 'Hindu puja guides — step-by-step procedures, materials required, and shlokas for home worship rituals.',
};

export default async function PujasPage() {
  // Tabs `occasions` and `puja_occasions` may not exist in Sheets until the
  // setup script runs — catch those errors so the page still renders.
  const [frequentPujas, occasions, occasionPujas] = await Promise.all([
    getFrequentPujas().catch(emptyOnError(TABS.pujas, 'pujas', [])),
    getOccasions().catch(emptyOnError(TABS.occasions, 'pujas', [])),
    getAllOccasionPujas().catch(emptyOnError(TABS.puja_occasions, 'pujas', {})),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Pujas', labels: { te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजा' } }]} />

      <ScriptH1
        labels={{ en: 'Pujas', te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजा' }}
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 32px',
        }}
      />

      <PujasBrowser
        frequentPujas={frequentPujas}
        occasions={occasions}
        occasionPujas={occasionPujas}
      />
    </div>
  );
}
