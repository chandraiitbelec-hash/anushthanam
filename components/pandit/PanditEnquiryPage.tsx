'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import PanditEnquiryForm from './PanditEnquiryForm';
import type { EnquiryPlacement } from '@/lib/pandit-enquiry-placement';

/**
 * The body of /find-a-pandit: the localized intro and the shared enquiry form,
 * full-width rather than in a card. Client-side only because the copy and the
 * script class follow the visitor's language.
 *
 * `placement` is null when the ceremony catalogue could not be read, in which
 * case this says so plainly instead of rendering a select with nothing in it.
 */
export default function PanditEnquiryPage({
  placement,
  source,
}: {
  placement: EnquiryPlacement | null;
  source: string;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const scripted = scriptClass(lang);

  const introStyle: React.CSSProperties = {
    fontSize: 'var(--text-body)',
    lineHeight: 1.8,
    color: 'var(--color-text-secondary)',
    margin: 0,
    maxWidth: '62ch',
  };

  if (!placement) {
    return <p className={scripted} style={introStyle}>{t.panditPageUnavailable}</p>;
  }

  return (
    <PanditEnquiryForm
      placement={placement}
      source={source}
      maxWidth="560px"
      intro={
        <p className={scripted} style={introStyle}>
          {t.panditPageIntro}
        </p>
      }
    />
  );
}
