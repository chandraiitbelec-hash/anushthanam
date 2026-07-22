'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { ProcedureStep } from '@/lib/types';

export default function ProcedureSteps({ steps, hasPasurams, onViewPasurams }: { steps: ProcedureStep[]; hasPasurams?: boolean; onViewPasurams?: () => void }) {
  const { lang } = useLang();
  const ui = UI[lang];

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  function title(step: ProcedureStep) {
    return step[`step_title_${lang}` as keyof ProcedureStep] as string || step.step_title_en;
  }

  function instruction(step: ProcedureStep) {
    return step[`instruction_${lang}` as keyof ProcedureStep] as string || step.instruction_en;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {steps.map(step => (
        <div key={step.step_number} style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}>
          {/* Step number */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--color-saffron)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {step.step_number}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className={scriptClass} style={{
              fontWeight: 500,
              fontSize: '15px',
              margin: '0 0 6px',
              color: 'var(--color-text-primary)',
            }}>
              {title(step)}
            </p>

            {instruction(step) && (
              <p className={scriptClass} style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                margin: '0',
                lineHeight: 1.7,
              }}>
                {instruction(step)}
              </p>
            )}

            {step.recite_shloka_slug && (
              hasPasurams && onViewPasurams ? (
                <button
                  onClick={onViewPasurams}
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--color-gold)',
                    background: 'none',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '4px 0',
                    display: 'inline-block',
                  }}
                >
                  {ui.viewPasurams}
                </button>
              ) : (
                <a
                  href={`/shlokas/${step.recite_shloka_slug}`}
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--color-gold)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-block',
                    padding: '4px 0',
                  }}
                >
                  {ui.viewPasurams}
                </a>
              )
            )}

            {(step[`notes_${lang}` as keyof ProcedureStep] as string || step.notes_en) && (
              <p className={scriptClass} style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                margin: '8px 0 0',
                fontStyle: 'italic',
              }}>
                {step[`notes_${lang}` as keyof ProcedureStep] as string || step.notes_en}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
