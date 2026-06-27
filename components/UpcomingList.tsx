'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

const LOCALE_MAP: Record<string, string> = { en: 'en-IN', te: 'te-IN', ta: 'ta-IN', hi: 'hi-IN' };

export type UpcomingItem = {
  type: 'festival' | 'vratham';
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  next_occurrence: string;
  next_occurrence_note_en: string;
};

const EMPTY_LABELS = {
  en: { heading: 'No upcoming dates set', sub: 'Festival dates are updated before each season. Check back soon.' },
  te: { heading: 'రాబోయే తేదీలు నిర్ణయించబడలేదు', sub: 'పండుగ తేదీలు ప్రతి సీజన్ ముందు నవీకరించబడతాయి. త్వరలో తనిఖీ చేయండి.' },
  ta: { heading: 'வரவிருக்கும் நாட்கள் நிர்ணயிக்கப்படவில்லை', sub: 'திருவிழா நாட்கள் ஒவ்வொரு பருவத்திற்கும் முன் புதுப்பிக்கப்படும். விரைவில் சரிபாருங்கள்.' },
  hi: { heading: 'आगामी तिथियाँ अभी निर्धारित नहीं', sub: 'त्योहार की तारीखें हर मौसम से पहले अपडेट की जाती हैं। जल्द वापस देखें।' },
};

const TYPE_LABELS = {
  en: { festival: 'Festival', vratham: 'Vratham' },
  te: { festival: 'పండుగ', vratham: 'వ్రతం' },
  ta: { festival: 'திருவிழா', vratham: 'விரதம்' },
  hi: { festival: 'त्योहार', vratham: 'व्रत' },
};

const TODAY_LABELS = {
  en: 'Today', te: 'నేడు', ta: 'இன்று', hi: 'आज',
};

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function groupByMonth(items: UpcomingItem[], locale: string) {
  const groups: { monthKey: string; label: string; items: UpcomingItem[] }[] = [];
  for (const item of items) {
    const d = new Date(item.next_occurrence + 'T00:00:00');
    const monthKey = item.next_occurrence.slice(0, 7);
    const label = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    let g = groups.find(g => g.monthKey === monthKey);
    if (!g) { g = { monthKey, label, items: [] }; groups.push(g); }
    g.items.push(item);
  }
  return groups;
}

export default function UpcomingList({ items }: { items: UpcomingItem[] }) {
  const { lang } = useLang();

  const getTitle = (item: UpcomingItem) =>
    (item as Record<string, string>)[`title_${lang}`] || item.title_en;

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  if (items.length === 0) {
    const labels = EMPTY_LABELS[lang as keyof typeof EMPTY_LABELS] ?? EMPTY_LABELS.en;
    return (
      <div style={{
        padding: '48px 32px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
      }}>
        <p style={{ fontSize: '36px', margin: '0 0 16px', lineHeight: 1 }}>🪔</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          {labels.heading}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
          {labels.sub}
        </p>
      </div>
    );
  }

  const locale = LOCALE_MAP[lang] ?? 'en-IN';
  const groups = groupByMonth(items, locale);
  const typeLabels = TYPE_LABELS[lang as keyof typeof TYPE_LABELS] ?? TYPE_LABELS.en;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {groups.map(group => (
        <section key={group.monthKey}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-gold)',
            margin: '0 0 10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {group.label}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.items.map(item => {
              const days = getDaysUntil(item.next_occurrence);
              const d = new Date(item.next_occurrence + 'T00:00:00');
              const href = `/${item.type === 'festival' ? 'festivals' : 'vrathams'}/${item.slug}`;
              const title = getTitle(item);
              const isToday = days === 0;
              const isSoon = days > 0 && days <= 7;
              const isFestival = item.type === 'festival';

              return (
                <Link
                  key={`${item.type}-${item.slug}`}
                  href={href}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '14px 16px',
                    background: isToday ? 'rgba(184,134,11,0.06)' : 'var(--color-surface)',
                    border: `1px solid ${isToday ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    borderRadius: '10px',
                    textDecoration: 'none',
                    alignItems: 'flex-start',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseOver={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                  onMouseOut={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  {/* Date block */}
                  <div style={{
                    width: '48px',
                    flexShrink: 0,
                    textAlign: 'center',
                    paddingTop: '2px',
                  }}>
                    <p style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 1px',
                    }}>
                      {d.toLocaleDateString(LOCALE_MAP[lang] ?? 'en-IN', { weekday: 'short' })}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '30px',
                      fontWeight: 700,
                      color: isToday ? 'var(--color-gold)' : 'var(--color-text-primary)',
                      margin: 0,
                      lineHeight: 1,
                    }}>
                      {d.getDate()}
                    </p>
                    <p style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                      margin: '1px 0 0',
                    }}>
                      {d.toLocaleDateString(LOCALE_MAP[lang] ?? 'en-IN', { month: 'short' })}
                    </p>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={lang !== 'en' ? scriptClass : undefined} style={{
                      fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
                      fontSize: lang === 'en' ? '18px' : '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 2px',
                      lineHeight: 1.3,
                    }}>
                      {title}
                    </p>
                    {lang !== 'en' && item.title_en !== title && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                        {item.title_en}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: isFestival ? 'rgba(212,98,42,0.1)' : 'rgba(61,107,79,0.1)',
                        color: isFestival ? 'var(--color-saffron)' : 'var(--color-green)',
                        fontWeight: 600,
                      }}>
                        {isFestival ? typeLabels.festival : typeLabels.vratham}
                      </span>
                      {item.next_occurrence_note_en && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          · {item.next_occurrence_note_en}
                        </span>
                      )}
                      {isToday && (
                        <span style={{
                          fontSize: '11px', fontWeight: 700,
                          color: 'var(--color-gold)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: 'rgba(184,134,11,0.14)',
                        }}>
                          {TODAY_LABELS[lang as keyof typeof TODAY_LABELS] ?? TODAY_LABELS.en}
                        </span>
                      )}
                      {isSoon && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {UI[lang as keyof typeof UI]?.daysAway(days)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '16px', paddingTop: '6px', flexShrink: 0 }}>→</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
