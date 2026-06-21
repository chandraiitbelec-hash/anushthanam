import Breadcrumb from '@/components/Breadcrumb';
import SearchPage from './SearchPage';

export const metadata = { title: 'Search | Anuṣṭhāna' };

export default function Page() {
  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Search' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        Search
      </h1>
      <SearchPage />
    </div>
  );
}
