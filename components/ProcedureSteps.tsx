'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { ProcedureStep } from '@/lib/types';

export default function ProcedureSteps({ steps }: { steps: ProcedureStep[] }) {
  const { lang } = useLang();
  const ui = UI[lang];
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  function toggle(n: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

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
              <button onClick={() => toggle(step.step_number)} style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--color-gold)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'inline-block',
                fontWeight: 500,
              }}>
                {expanded.has(step.step_number) ? ui.hideShloka : ui.showShloka}
              </button>
            )}

            {expanded.has(step.step_number) && step.recite_shloka_slug && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}>
                {ui.shlokaLabel}: {step.recite_shloka_slug}
                {step.recite_stanza_range && ` (${step.recite_stanza_range})`}
              </div>
            )}

            {step.notes_en && (
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                margin: '8px 0 0',
                fontStyle: 'italic',
              }}>
                {step.notes_en}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
