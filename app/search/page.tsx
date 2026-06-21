import Breadcrumb from '@/components/Breadcrumb';
import SearchBar from '@/components/SearchBar';

export default function SearchPage() {
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
      <SearchBar />
      <p style={{
        marginTop: '24px',
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
      }}>
        Search across gods, shlokas, festivals, and vrathams in all four languages.
      </p>
    </div>
  );
}
