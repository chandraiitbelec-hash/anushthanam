import { getSheetRows } from './sheets';
import type { PanchangamDay } from './types';

export async function getAllPanchangam(): Promise<PanchangamDay[]> {
  const rows = await getSheetRows('panchangam');
  return rows.map(r => ({
    date: r.date,
    tithi_en: r.tithi_en,
    tithi_number: parseInt(r.tithi_number) || 0,
    paksha: r.paksha,
    nakshatra_en: r.nakshatra_en,
    yoga_en: r.yoga_en,
    karana_en: r.karana_en,
    lunar_month_en: r.lunar_month_en,
    sunrise: r.sunrise,
    sunset: r.sunset,
    rahu_kalam: r.rahu_kalam,
    special_event_en: r.special_event_en,
    special_event_te: r.special_event_te,
    special_event_ta: r.special_event_ta,
    special_event_hi: r.special_event_hi,
  }));
}

export async function getTodayPanchangam(): Promise<PanchangamDay | null> {
  const today = new Date().toISOString().split('T')[0];
  const all = await getAllPanchangam();
  return all.find(d => d.date === today) ?? null;
}

export async function getPanchangamForDate(date: string): Promise<PanchangamDay | null> {
  const all = await getAllPanchangam();
  return all.find(d => d.date === date) ?? null;
}
