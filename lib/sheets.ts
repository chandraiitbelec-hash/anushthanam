import { google } from 'googleapis';
import { unstable_cache } from 'next/cache';
import { TABS, type Tab } from './tabs';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
}

// Coalesce concurrent calls for the same tab into one in-flight request.
// unstable_cache deduplicates after the first resolve; this deduplicates before.
const inflight = new Map<string, Promise<Record<string, string>[]>>();

async function fetchWithRetry(tabName: Tab): Promise<Record<string, string>[]> {
  const MAX_RETRIES = 5;
  let delay = 2000;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const auth = await getAuth().getClient();
      const sheets = google.sheets({ version: 'v4', auth: auth as never });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
        range: `${tabName}!A:ZZ`,
      });
      const values = res.data.values ?? [];
      if (values.length < 1) return [];
      const [headers, ...rows] = values;
      return rows.map(row =>
        Object.fromEntries((headers as string[]).map((h: string, i: number) => [h, (row[i] ?? '') as string]))
      );
    } catch (err: unknown) {
      const status = (err as { status?: number; code?: number }).status ?? (err as { code?: number }).code;
      if (status === 429 && attempt < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay * 2, 30000);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to fetch sheet tab "${tabName}" after ${MAX_RETRIES} retries`);
}

function fetchSheetRows(tabName: Tab): Promise<Record<string, string>[]> {
  const existing = inflight.get(tabName);
  if (existing) return existing;
  const promise = fetchWithRetry(tabName).finally(() => inflight.delete(tabName));
  inflight.set(tabName, promise);
  return promise;
}

// Cache each tab separately for 1 hour — shared across all pages in the same build
export const getSheetRows = unstable_cache(
  fetchSheetRows,
  ['sheet-rows'],
  { revalidate: 3600 }
);

// Some tabs (notably shloka_stanzas, ~4MB) exceed unstable_cache's 2MB payload
// limit. When that happens Next throws "Failed to set Next.js data cache" and
// silently re-fetches the entire tab from Sheets on every request. Cache those
// tabs in-process with a TTL matching `revalidate` instead: fetched once per
// server process / build per hour, sliced per-slug by callers.
const LARGE_TAB_TTL_MS = 3600 * 1000;
const largeTabMemo = new Map<string, { rows: Record<string, string>[]; expires: number }>();

export async function getSheetRowsLarge(tabName: Tab): Promise<Record<string, string>[]> {
  const cached = largeTabMemo.get(tabName);
  if (cached && cached.expires > Date.now()) return cached.rows;
  const rows = await fetchSheetRows(tabName);
  largeTabMemo.set(tabName, { rows, expires: Date.now() + LARGE_TAB_TTL_MS });
  return rows;
}

export async function getPublished(tabName: Tab): Promise<Record<string, string>[]> {
  const rows = await getSheetRows(tabName);
  return rows.filter(row => row.status === 'published');
}

export async function getConfig(): Promise<Record<string, string>> {
  const rows = await getSheetRows(TABS.config);
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

// Availability policy: a Sheets fetch failure must never blank a page — pages
// degrade to EmptyState instead. That silently hides a renamed tab/column,
// so this logs a greppable line before returning the same empty fallback.
export function emptyOnError<T>(tab: string, page: string, fallback: T) {
  return (err: unknown): T => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`CONTENT ERROR [${page}]: fetch failed for tab ${tab}: ${message}`);
    return fallback;
  };
}
