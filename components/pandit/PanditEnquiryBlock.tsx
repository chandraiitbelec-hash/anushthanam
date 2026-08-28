'use client';

import { useId } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import PanditEnquiryForm from './PanditEnquiryForm';
import type { EnquiryPlacement } from '@/lib/pandit-enquiry-placement';

/**
 * The pandit demand test (PRD §9.1) as it appears on a booking-intent puja
 * detail page: one quiet card at the foot of the page. Which pages carry it is
 * decided server-side — see lib/pandit-enquiry-placement.ts. The form inside
 * is shared with /find-a-pandit; only the `source` differs, and that
 * difference is the measurement.
 *
 * The tone rules are absolute and unchanged (§7.1): one bordered card in the
 * page flow, no modal, no sticky bar, no interstitial. It sits *below* the
 * procedure content, which stays complete and ungated — a devotee who came to
 * read the vidhi gets the vidhi and never has to dismiss anything to keep
 * reading. No urgency, no scarcity, nothing implying a pandit is waiting.
 *
 * What changed on the second pass is only how much of it is visible. The card
 * used to be a heading and a button, which was quiet to the point of being
 * unmeasurable; the form's four load-bearing fields are now open on arrival
 * and the rest sit behind one disclosure. See PanditEnquiryForm for why those
 * four.
 */
export default function PanditEnquiryBlock({
  placement,
  source,
}: {
  placement: EnquiryPlacement;
  /** Serialized EnquirySource — `puja:<slug>` for this entry point. */
  source: string;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const ids = useId();
  const scripted = scriptClass(lang);

  return (
    <section
      aria-labelledby={`${ids}-heading`}
      style={{
        marginTop: '48px',
        padding: '20px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
      }}
    >
      <h2
        id={`${ids}-heading`}
        className={scripted}
        style={{
          fontSize: 'var(--text-body)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
          lineHeight: 1.5,
        }}
      >
        {t.panditEnquiryTitle}
      </h2>

      <PanditEnquiryForm
        placement={placement}
        source={source}
        intro={
          <p className={scripted} style={{
            fontSize: 'var(--text-body-sm)', lineHeight: 1.7,
            color: 'var(--color-text-secondary)', margin: 0,
          }}>
            {t.panditEnquiryBody}
          </p>
        }
      />
    </section>
  );
}
