import { getSheetRows } from './sheets';
import { TABS } from './tabs';
import { todayIST } from './utils';
import type { PanchangamDay } from './types';

export async function getAllPanchangam(): Promise<PanchangamDay[]> {
  const rows = await getSheetRows(TABS.panchangam);
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
    gulika_kalam: r.gulika_kalam,
    yamaganda_kalam: r.yamaganda_kalam,
    choghadiya_day: r.choghadiya_day,
    choghadiya_night: r.choghadiya_night,
    special_event_en: r.special_event_en,
    special_event_te: r.special_event_te,
    special_event_ta: r.special_event_ta,
    special_event_hi: r.special_event_hi,
  }));
}


export async function getTodayPanchangam(): Promise<PanchangamDay | null> {
  const today = todayIST();
  const all = await getAllPanchangam();
  return all.find(d => d.date === today) ?? null;
}

export async function getPanchangamForDate(date: string): Promise<PanchangamDay | null> {
  const all = await getAllPanchangam();
  return all.find(d => d.date === date) ?? null;
}

export async function getNextPanchangam(): Promise<PanchangamDay | null> {
  const today = todayIST();
  const all = await getAllPanchangam();
  return all.find(d => d.date > today) ?? null;
}
