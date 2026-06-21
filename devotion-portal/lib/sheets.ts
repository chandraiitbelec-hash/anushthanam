import { google } from 'googleapis';

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

export async function getSheetRows(tabName: string): Promise<Record<string, string>[]> {
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
}

export async function getPublished(tabName: string): Promise<Record<string, string>[]> {
  const rows = await getSheetRows(tabName);
  return rows.filter(row => row.status === 'published');
}

export async function getConfig(): Promise<Record<string, string>> {
  const rows = await getSheetRows('config');
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}
