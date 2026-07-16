'use client';

import { useLang } from '@/context/LanguageContext';
import type { Language } from '@/lib/types';

export type EmptyStateType = 'gods' | 'festivals' | 'vrathams' | 'pujas' | 'shlokas';

type Copy = { icon: string; title: Record<Language, string>; body: Record<Language, string> };

const COPY: Record<EmptyStateType, Copy> = {
  gods: {
    icon: '🕉',
    title: { en: 'No deities published yet', te: 'ఇంకా దేవతలు ప్రచురించబడలేదు', ta: 'இன்னும் தெய்வங்கள் வெளியிடப்படவில்லை', hi: 'अभी तक कोई देवता प्रकाशित नहीं' },
    body: { en: 'Gods and goddesses will appear here once published.', te: 'ప్రచురించిన తర్వాత దేవతలు ఇక్కడ కనిపిస్తారు.', ta: 'வெளியிடப்பட்டவுடன் தெய்வங்கள் இங்கே தோன்றும்.', hi: 'प्रकाशित होने पर देवी-देवता यहाँ दिखाई देंगे।' },
  },
  festivals: {
    icon: '🪔',
    title: { en: 'No festivals published yet', te: 'ఇంకా పండుగలు ప్రచురించబడలేదు', ta: 'இன்னும் திருவிழாக்கள் வெளியிடப்படவில்லை', hi: 'अभी तक कोई त्योहार प्रकाशित नहीं' },
    body: { en: 'Festival listings will appear here once published.', te: 'ప్రచురించిన తర్వాత పండుగలు ఇక్కడ కనిపిస్తాయి.', ta: 'வெளியிடப்பட்டவுடன் திருவிழாக்கள் இங்கே தோன்றும்.', hi: 'प्रकाशित होने पर त्योहार यहाँ दिखाई देंगे।' },
  },
  vrathams: {
    icon: '🙏',
    title: { en: 'No vrathams published yet', te: 'ఇంకా వ్రతాలు ప్రచురించబడలేదు', ta: 'இன்னும் விரதங்கள் வெளியிடப்படவில்லை', hi: 'अभी तक कोई व्रत प्रकाशित नहीं' },
    body: { en: 'Vow and fasting guides will appear here once published.', te: 'ప్రచురించిన తర్వాత వ్రత మార్గదర్శకాలు ఇక్కడ కనిపిస్తాయి.', ta: 'வெளியிடப்பட்டவுடன் விரத வழிகாட்டிகள் இங்கே தோன்றும்.', hi: 'प्रकाशित होने पर व्रत मार्गदर्शिकाएँ यहाँ दिखाई देंगी।' },
  },
  pujas: {
    icon: '🪷',
    title: { en: 'No pujas published yet', te: 'ఇంకా పూజలు ప్రచురించబడలేదు', ta: 'இன்னும் பூஜைகள் வெளியிடப்படவில்லை', hi: 'अभी तक कोई पूजा प्रकाशित नहीं' },
    body: { en: 'Puja guides will appear here once published.', te: 'ప్రచురించిన తర్వాత పూజా మార్గదర్శకాలు ఇక్కడ కనిపిస్తాయి.', ta: 'வெளியிடப்பட்டவுடன் பூஜை வழிகாட்டிகள் இங்கே தோன்றும்.', hi: 'प्रकाशित होने पर पूजा मार्गदर्शिकाएँ यहाँ दिखाई देंगी।' },
  },
  shlokas: {
    icon: '📖',
    title: { en: 'No shlokas published yet', te: 'ఇంకా శ్లోకాలు ప్రచురించబడలేదు', ta: 'இன்னும் ஸ்லோகங்கள் வெளியிடப்படவில்லை', hi: 'अभी तक कोई श्लोक प्रकाशित नहीं' },
    body: { en: 'Shlokas and stotras will appear here once published.', te: 'ప్రచురించిన తర్వాత శ్లోకాలు, స్తోత్రాలు ఇక్కడ కనిపిస్తాయి.', ta: 'வெளியிடப்பட்டவுடன் ஸ்லோகங்கள் இங்கே தோன்றும்.', hi: 'प्रकाशित होने पर श्लोक और स्तोत्र यहाँ दिखाई देंगे।' },
  },
};

export default function EmptyState({ type }: { type: EmptyStateType }) {
  const { lang } = useLang();
  const c = COPY[type];

  return (
    <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
      <p style={{ fontSize: '36px', margin: '0 0 16px' }} aria-hidden="true">{c.icon}</p>
      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{c.title[lang]}</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>{c.body[lang]}</p>
    </div>
  );
}
