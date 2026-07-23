import devotionalData from '@/lib/data/daily-devotional.json';

export type DailyDevotionalEntry = typeof devotionalData[0];

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getTodayDevotional(): DailyDevotionalEntry {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const start = Date.UTC(istNow.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((istNow.getTime() - start) / 86400000);
  return devotionalData[dayOfYear % devotionalData.length] as DailyDevotionalEntry;
}
