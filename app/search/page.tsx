import Breadcrumb from '@/components/Breadcrumb';
import ScriptH1 from '@/components/ScriptH1';
import SearchPage from './SearchPage';

export const metadata = { title: 'Search' };

export default function Page() {
  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Search', labels: { en: 'Search', te: 'శోధన', ta: 'தேடல்', hi: 'खोज' } }]} />
      <ScriptH1
        labels={{ en: 'Search', te: 'శోధన', ta: 'தேடல்', hi: 'खोज' }}
        style={{ fontSize: 'var(--text-h1-page)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 24px' }}
      />
      <SearchPage />
    </div>
  );
}
