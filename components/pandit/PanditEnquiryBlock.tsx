'use client';

import { useId, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';
import { scriptClass } from '@/lib/utils';
import {
  CEREMONY_OTHER,
  ENQUIRY_DAKSHINA_BANDS,
  ENQUIRY_DURATION_BANDS,
  ENQUIRY_LIMITS,
  ENQUIRY_TIMING_WINDOWS,
  ENQUIRY_UNSET,
  HONEYPOT_FIELD,
  looksLikeContact,
  type EnquiryDakshinaBand,
  type EnquiryDurationBand,
  type EnquiryLanguage,
  type EnquiryTimingWindow,
} from '@/lib/pandit-enquiry-fields';
import type { CeremonyOption, EnquiryPlacement } from '@/lib/pandit-enquiry-placement';

/**
 * The pandit demand test (PRD §9.1): a quiet enquiry card at the foot of a
 * booking-intent puja page. Which pages carry it is decided server-side — see
 * lib/pandit-enquiry-placement.ts.
 *
 * This measures whether booking demand exists. It is not the first screen of a
 * marketplace and must not read like one. The PRD's banned-patterns list (§7.1)
 * binds every choice here:
 *
 *   - One bordered card in the page flow. No modal, no sticky bar, no
 *     interstitial. It sits *below* the procedure content, which stays
 *     complete and ungated — a devotee who came to read the vidhi gets the
 *     vidhi, and never has to dismiss anything to keep reading.
 *   - Collapsed to a heading and one button until asked for. The form is a
 *     dozen fields; showing them unbidden on a reference page is a demand, not
 *     an offer.
 *   - No urgency, no countdown, no "limited", no count of pandits, no claim
 *     that anyone is available. There is no list yet, and the confirmation
 *     says so in as many words.
 *
 * Signing in is deliberately not required — see the route handler. A signed-in
 * visitor gets their email prefilled as a convenience and nothing more.
 */
export default function PanditEnquiryBlock({
  placement,
  sourcePujaSlug,
}: {
  placement: EnquiryPlacement;
  sourcePujaSlug: string;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const { data: session } = useSession();
  const ids = useId();
  const scripted = scriptClass(lang);

  const [open, setOpen] = useState(false);
  const [ceremony, setCeremony] = useState(placement.defaultSlug);
  const [ceremonyOther, setCeremonyOther] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [enquiryLang, setEnquiryLang] = useState<EnquiryLanguage>(
    lang as EnquiryLanguage,
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [durationBand, setDurationBand] = useState<EnquiryDurationBand | ''>(ENQUIRY_UNSET);
  const [timingWindow, setTimingWindow] = useState<EnquiryTimingWindow | ''>(ENQUIRY_UNSET);
  const [dakshinaBand, setDakshinaBand] = useState<EnquiryDakshinaBand | ''>(ENQUIRY_UNSET);
  const [contact, setContact] = useState(session?.user?.email ?? '');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSubmit =
    (ceremony !== CEREMONY_OTHER || ceremonyOther.trim().length > 0) &&
    city.trim().length > 0 &&
    contact.trim().length > 0 &&
    !sending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Checked here as well as on the server so the commonest mistake — a name
    // typed into the contact box — is caught without a round trip.
    if (!looksLikeContact(contact)) {
      setError(t.panditEnquiryErrorContact);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/pandit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePujaSlug,
          ceremonySlug: ceremony,
          ceremonyOther: ceremony === CEREMONY_OTHER ? ceremonyOther.trim() : null,
          city: city.trim(),
          area: area.trim() || null,
          lang: enquiryLang,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          durationBand: durationBand || null,
          timingWindow: timingWindow || null,
          dakshinaBand: dakshinaBand || null,
          contact: contact.trim(),
          note: note.trim() || null,
          [HONEYPOT_FIELD]: honeypot,
        }),
      });
      if (res.ok) {
        setSent(true);
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(
        data?.error === 'rate_limited' ? t.panditEnquiryErrorRateLimited
        : data?.error === 'invalid_contact' ? t.panditEnquiryErrorContact
        : t.panditEnquiryErrorGeneric,
      );
    } catch {
      setError(t.panditEnquiryErrorGeneric);
    }
    setSending(false);
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
    margin: '0 0 6px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 'var(--text-body)',
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    boxSizing: 'border-box',
  };

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

      {sent ? (
        <div role="status">
          <p className={scripted} style={{
            fontSize: 'var(--text-body-sm)', lineHeight: 1.7,
            color: 'var(--color-text-primary)', margin: '0 0 6px', fontWeight: 500,
          }}>
            {t.panditEnquiryThanksTitle}
          </p>
          <p className={scripted} style={{
            fontSize: 'var(--text-body-sm)', lineHeight: 1.7,
            color: 'var(--color-text-secondary)', margin: 0,
          }}>
            {t.panditEnquiryThanksBody}
          </p>
        </div>
      ) : (
        <>
          <p className={scripted} style={{
            fontSize: 'var(--text-body-sm)', lineHeight: 1.7,
            color: 'var(--color-text-secondary)', margin: 0,
          }}>
            {t.panditEnquiryBody}
          </p>

          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={false}
              className={scripted}
              style={{
                marginTop: '14px',
                padding: '9px 20px',
                background: 'transparent',
                color: 'var(--color-gold-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--text-button)',
                fontFamily: 'inherit',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.panditEnquiryCta}
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                marginTop: '18px',
                display: 'flex', flexDirection: 'column', gap: '16px',
                maxWidth: '440px',
              }}
            >
              <div>
                <label htmlFor={`${ids}-ceremony`} style={labelStyle}>
                  {t.panditEnquiryCeremonyLabel}
                </label>
                <select
                  id={`${ids}-ceremony`}
                  value={ceremony}
                  onChange={e => setCeremony(e.target.value)}
                  className={scripted}
                  style={inputStyle}
                >
                  {placement.options.map((o: CeremonyOption) => (
                    <option key={o.slug} value={o.slug}>{localize(o, 'title', lang)}</option>
                  ))}
                  <option value={CEREMONY_OTHER}>{t.panditEnquiryCeremonyOther}</option>
                </select>
              </div>

              {ceremony === CEREMONY_OTHER && (
                <div>
                  <label htmlFor={`${ids}-ceremony-other`} style={labelStyle}>
                    {t.panditEnquiryCeremonyOtherLabel}
                  </label>
                  <input
                    id={`${ids}-ceremony-other`}
                    type="text"
                    value={ceremonyOther}
                    onChange={e => setCeremonyOther(e.target.value)}
                    maxLength={ENQUIRY_LIMITS.ceremonyOther}
                    required
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                {/* Free text, no list, no default. The platform is not scoped to
                    any city and must not prime one — where enquiries come from
                    is part of what this test is measuring. */}
                <label htmlFor={`${ids}-city`} style={labelStyle}>
                  {t.panditEnquiryCityLabel}
                </label>
                <input
                  id={`${ids}-city`}
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  maxLength={ENQUIRY_LIMITS.city}
                  autoComplete="address-level2"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor={`${ids}-area`} style={labelStyle}>
                  {t.panditEnquiryAreaLabel} · {t.optional}
                </label>
                <input
                  id={`${ids}-area`}
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  maxLength={ENQUIRY_LIMITS.area}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor={`${ids}-lang`} style={labelStyle}>
                  {t.panditEnquiryLanguageLabel}
                </label>
                <select
                  id={`${ids}-lang`}
                  value={enquiryLang}
                  onChange={e => setEnquiryLang(e.target.value as EnquiryLanguage)}
                  style={inputStyle}
                >
                  {/* Language names stay in their own script whatever the UI
                      language is — the same reasoning as the nav switcher. */}
                  <option value="te">తెలుగు</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                  <option value="en">English</option>
                  <option value="other">{t.panditEnquiryLanguageOther}</option>
                </select>
              </div>

              {/* Bottom-aligned so the two inputs stay on one line even when a
                  translated label wraps to two. */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label htmlFor={`${ids}-date`} style={labelStyle}>
                    {t.panditEnquiryDateLabel} · {t.optional}
                  </label>
                  <input
                    id={`${ids}-date`}
                    type="date"
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 110px' }}>
                  {/* Wall-clock in the city named above, not the reader's zone:
                      a muhurtham time belongs to the place the ceremony
                      happens. Stored as a bare time for that reason. */}
                  <label htmlFor={`${ids}-time`} style={labelStyle}>
                    {t.panditEnquiryTimeLabel} · {t.optional}
                  </label>
                  <input
                    id={`${ids}-time`}
                    type="time"
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                {/* The field a plain date cannot express: the family knows the
                    ceremony is happening but the muhurtham is not fixed. Also
                    where "only looking into it" is separable from real intent,
                    which is what the §9.1 threshold turns on. */}
                <label htmlFor={`${ids}-timing`} style={labelStyle}>
                  {t.panditEnquiryTimingLabel} · {t.optional}
                </label>
                <select
                  id={`${ids}-timing`}
                  value={timingWindow}
                  onChange={e => setTimingWindow(e.target.value as EnquiryTimingWindow | '')}
                  className={scripted}
                  style={inputStyle}
                >
                  <option value={ENQUIRY_UNSET}>{t.panditEnquiryNotSure}</option>
                  {ENQUIRY_TIMING_WINDOWS.map(w => (
                    <option key={w} value={w}>{t.panditEnquiryTimingWindows[w]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${ids}-duration`} style={labelStyle}>
                  {t.panditEnquiryDurationLabel} · {t.optional}
                </label>
                <select
                  id={`${ids}-duration`}
                  value={durationBand}
                  onChange={e => setDurationBand(e.target.value as EnquiryDurationBand | '')}
                  className={scripted}
                  style={inputStyle}
                >
                  <option value={ENQUIRY_UNSET}>{t.panditEnquiryNotSure}</option>
                  {ENQUIRY_DURATION_BANDS.map(d => (
                    <option key={d} value={d}>{t.panditEnquiryDurationBands[d]}</option>
                  ))}
                </select>
              </div>

              <div>
                {/* Dakshina, on the family's own terms — PRD §7.2. They pick a
                    band; the platform never quotes, caps, discounts, sorts or
                    compares on it, and "I would rather discuss it" is a real
                    answer sitting among the others rather than an escape. */}
                <label htmlFor={`${ids}-dakshina`} style={labelStyle}>
                  {t.panditEnquiryDakshinaLabel} · {t.optional}
                </label>
                <select
                  id={`${ids}-dakshina`}
                  value={dakshinaBand}
                  onChange={e => setDakshinaBand(e.target.value as EnquiryDakshinaBand | '')}
                  className={scripted}
                  style={inputStyle}
                >
                  <option value={ENQUIRY_UNSET}>{t.panditEnquiryNotSure}</option>
                  {ENQUIRY_DAKSHINA_BANDS.map(d => (
                    <option key={d} value={d}>{t.panditEnquiryDakshinaBands[d]}</option>
                  ))}
                </select>
                <p className={scripted} style={{
                  fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)',
                  margin: '6px 0 0', lineHeight: 1.6,
                }}>
                  {t.panditEnquiryDakshinaHint}
                </p>
              </div>

              <div>
                <label htmlFor={`${ids}-contact`} style={labelStyle}>
                  {t.panditEnquiryContactLabel}
                </label>
                <input
                  id={`${ids}-contact`}
                  type="text"
                  inputMode="email"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  maxLength={ENQUIRY_LIMITS.contact}
                  aria-describedby={`${ids}-contact-hint`}
                  required
                  style={inputStyle}
                />
                <p id={`${ids}-contact-hint`} className={scripted} style={{
                  fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)',
                  margin: '6px 0 0', lineHeight: 1.6,
                }}>
                  {t.panditEnquiryContactHint}
                </p>
              </div>

              <div>
                <label htmlFor={`${ids}-note`} style={labelStyle}>
                  {t.panditEnquiryNoteLabel} · {t.optional}
                </label>
                <textarea
                  id={`${ids}-note`}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={ENQUIRY_LIMITS.note}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {/* Honeypot. Hidden from sight, from assistive technology and from
                  the tab order, so no person can reach it; anything that fills
                  every input on the page will. Not display:none, which some
                  bots skip. */}
              <div aria-hidden="true" style={{
                position: 'absolute', width: '1px', height: '1px',
                overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
              }}>
                <label htmlFor={`${ids}-${HONEYPOT_FIELD}`}>Leave this field empty</label>
                <input
                  id={`${ids}-${HONEYPOT_FIELD}`}
                  name={HONEYPOT_FIELD}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className={scripted} style={{
                  fontSize: 'var(--text-body-sm)', color: 'var(--color-red-muted)',
                  margin: 0, lineHeight: 1.6,
                }}>
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={scripted}
                  style={{
                    padding: '11px 26px',
                    background: 'var(--color-gold)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: 'var(--text-button)',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit ? 1 : 0.6,
                  }}
                >
                  {sending ? t.panditEnquirySending : t.panditEnquirySubmit}
                </button>
                <p className={scripted} style={{
                  fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)',
                  margin: '12px 0 0', lineHeight: 1.6,
                }}>
                  {t.panditEnquiryPrivacy}
                </p>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
