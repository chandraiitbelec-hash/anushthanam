#!/usr/bin/env node
/**
 * Fetch ~10 sample dates from the panchangam Sheet tab for verification.
 * Read-only — does NOT modify the Sheet.
 *
 * Usage: node scripts/verify-panchangam.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
dotenv.config({ path: '.env.local' });

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'panchangam!A:ZZ',
  });

  const [headers, ...rows] = res.data.values;
  const data = rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] || ''; });
    return obj;
  });

  console.log(`Total rows: ${data.length}`);
  console.log(`Date range: ${data[0]?.date} → ${data[data.length - 1]?.date}\n`);

  // Pick ~10 spread dates: first, last, every ~9th row, plus find new/full moon
  const indices = new Set();
  indices.add(0);
  indices.add(data.length - 1);
  const step = Math.floor(data.length / 9);
  for (let i = step; i < data.length; i += step) indices.add(i);

  // Also find an Amavasya and a Purnima
  const amavasya = data.findIndex(r => r.tithi_en === 'Amavasya');
  const purnima = data.findIndex(r => r.tithi_en === 'Purnima');
  if (amavasya >= 0) indices.add(amavasya);
  if (purnima >= 0) indices.add(purnima);

  const sorted = [...indices].sort((a, b) => a - b);

  console.log('SAMPLE DATES FOR VERIFICATION');
  console.log('=' .repeat(100));
  console.log(
    'Date'.padEnd(12),
    'Paksha'.padEnd(9),
    'Tithi'.padEnd(16),
    'T#'.padEnd(4),
    'Nakshatra'.padEnd(22),
    'Yoga'.padEnd(16),
    'Karana'.padEnd(14),
    'Lunar Month'.padEnd(14),
    'Sunrise',
    'Sunset',
  );
  console.log('-'.repeat(100));

  for (const idx of sorted) {
    const r = data[idx];
    console.log(
      r.date.padEnd(12),
      r.paksha.padEnd(9),
      r.tithi_en.padEnd(16),
      String(r.tithi_number).padEnd(4),
      r.nakshatra_en.padEnd(22),
      r.yoga_en.padEnd(16),
      r.karana_en.padEnd(14),
      r.lunar_month_en.padEnd(14),
      r.sunrise.padEnd(7),
      r.sunset,
    );
  }

  // Also dump as JSON for easy reference
  const samples = sorted.map(i => data[i]);
  console.log('\n\nJSON for reference:');
  console.log(JSON.stringify(samples, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
