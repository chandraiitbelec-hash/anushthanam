/**
 * Parses daily_devotional_30_days.md → lib/data/daily-devotional.json
 * Run once: node scripts/parse-daily-devotional.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = '/Users/ChandraKanth/.gemini/antigravity/scratch/devotional-ashtothram/docs/daily_devotional_30_days.md';
const OUT = resolve(__dirname, '../lib/data/daily-devotional.json');

const content = readFileSync(SRC, 'utf8');
const lines = content.split('\n');

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractCodeBlock(lines, startIdx) {
  let i = startIdx;
  while (i < lines.length && !lines[i].startsWith('```')) i++;
  i++; // skip opening ```
  const buf = [];
  while (i < lines.length && !lines[i].startsWith('```')) {
    buf.push(lines[i]);
    i++;
  }
  return buf.filter(l => l.trim()).join('\n').trim();
}

function parseLangBullets(lines, startIdx, endIdx) {
  const result = { en: '', te: '', hi: '', ta: '' };
  let currentLang = null;
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (line.startsWith('- **English**:')) {
      currentLang = 'en';
      result.en = line.replace(/^- \*\*English\*\*:\s*/, '').trim();
    } else if (line.startsWith('- **తెలుగు**:')) {
      currentLang = 'te';
      result.te = line.replace(/^- \*\*తెలుగు\*\*:\s*/, '').trim();
    } else if (line.startsWith('- **हिन्दी**:')) {
      currentLang = 'hi';
      result.hi = line.replace(/^- \*\*हिन्दी\*\*:\s*/, '').trim();
    } else if (line.startsWith('- **தமிழ்**:')) {
      currentLang = 'ta';
      result.ta = line.replace(/^- \*\*தமிழ்\*\*:\s*/, '').trim();
    } else if (currentLang && line.trim() && !line.startsWith('- **') && !line.startsWith('#')) {
      result[currentLang] += ' ' + line.trim();
    }
  }
  return result;
}

// Collect paragraph text lines between two section boundaries
function collectBody(lines, startIdx, endIdx) {
  const paragraphs = [];
  let buf = [];
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ') || line === '---') break;
    if (line.trim() === '' || line === '—') {
      if (buf.length > 0) { paragraphs.push(buf.join(' ')); buf = []; }
    } else {
      buf.push(line.trim());
    }
  }
  if (buf.length > 0) paragraphs.push(buf.join(' '));
  return paragraphs.filter(p => p.length > 0).join('\n\n');
}

// ── Main parse ────────────────────────────────────────────────────────────────

const entries = [];
let i = 0;

while (i < lines.length) {
  // Find day header: # Day N: Deity - Story Title
  const dayMatch = lines[i].match(/^# Day (\d+): ([^-]+) - (.+)$/);
  if (!dayMatch) { i++; continue; }

  const dayNum = parseInt(dayMatch[1]);
  const deity = dayMatch[2].trim();
  const storyTitleEn = dayMatch[3].trim();

  const entry = {
    day: dayNum,
    deity,
    shloka: { sanskrit: '', iast: '', meaning_en: '', meaning_te: '', meaning_hi: '', meaning_ta: '', reflection_en: '', reflection_te: '', reflection_hi: '', reflection_ta: '' },
    story: { title_en: storyTitleEn, title_te: '', title_hi: '', title_ta: '', source: '', body_en: '', body_te: '', body_hi: '', body_ta: '' },
  };

  // Find where the next day starts (or EOF)
  let nextDayIdx = lines.length;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j].match(/^# Day \d+:/)) { nextDayIdx = j; break; }
  }

  const dayLines = lines.slice(i + 1, nextDayIdx);

  // Find section boundaries within this day
  let shlokaStart = -1, storyStart = -1;
  for (let j = 0; j < dayLines.length; j++) {
    if (dayLines[j].includes('Shloka of the Day')) shlokaStart = j;
    if (dayLines[j].includes('Story of the Day')) storyStart = j;
  }

  // ── Parse Shloka ──────────────────────────────────────────────────────────
  if (shlokaStart >= 0) {
    const shEnd = storyStart >= 0 ? storyStart : dayLines.length;

    for (let j = shlokaStart; j < shEnd; j++) {
      const line = dayLines[j];

      if (line.includes('Sanskrit / Devanagari')) {
        entry.shloka.sanskrit = extractCodeBlock(dayLines, j + 1);
      }
      if (line.includes('Roman Transliteration')) {
        entry.shloka.iast = extractCodeBlock(dayLines, j + 1);
      }
      if (line.includes('Meanings & Translations')) {
        // find end of this subsection (next ### or —)
        let end = shEnd;
        for (let k = j + 1; k < shEnd; k++) {
          if (dayLines[k].startsWith('### ') || dayLines[k] === '—') { end = k; break; }
        }
        const meanings = parseLangBullets(dayLines, j + 1, end);
        entry.shloka.meaning_en = meanings.en;
        entry.shloka.meaning_te = meanings.te;
        entry.shloka.meaning_hi = meanings.hi;
        entry.shloka.meaning_ta = meanings.ta;
      }
      if (line.includes('Daily Reflection')) {
        const reflections = parseLangBullets(dayLines, j + 1, shEnd);
        entry.shloka.reflection_en = reflections.en;
        entry.shloka.reflection_te = reflections.te;
        entry.shloka.reflection_hi = reflections.hi;
        entry.shloka.reflection_ta = reflections.ta;
      }
    }
  }

  // ── Parse Story ───────────────────────────────────────────────────────────
  if (storyStart >= 0) {
    const stLines = dayLines.slice(storyStart);

    // Source line
    const sourceLine = stLines.find(l => l.startsWith('**Source**:'));
    if (sourceLine) {
      entry.story.source = sourceLine.replace(/^\*\*Source\*\*:\s*/, '').split('|')[0].trim();
    }

    // Language subsections
    const langSections = [
      { flag: '🇬🇧', lang: 'en', titleKey: 'title_en', bodyKey: 'body_en' },
      { flag: '🇮🇳', script: 'తెలుగు', lang: 'te', titleKey: 'title_te', bodyKey: 'body_te' },
      { flag: '🇮🇳', script: 'हिन्दी', lang: 'hi', titleKey: 'title_hi', bodyKey: 'body_hi' },
      { flag: '🇮🇳', script: 'தமிழ்', lang: 'ta', titleKey: 'title_ta', bodyKey: 'body_ta' },
    ];

    for (const sec of langSections) {
      for (let j = 0; j < stLines.length; j++) {
        const line = stLines[j];
        const matchesSec = sec.lang === 'en'
          ? line.startsWith('### 🇬🇧') || line.includes('English:')
          : line.includes(sec.script);
        if (line.startsWith('### ') && matchesSec) {
          // Extract title after the colon
          const titleMatch = line.match(/###[^:]+:\s*(.+)$/);
          if (titleMatch) entry.story[sec.titleKey] = titleMatch[1].trim();
          entry.story[sec.bodyKey] = collectBody(stLines, j + 1, stLines.length);
          break;
        }
      }
    }
  }

  entries.push(entry);
  i = nextDayIdx;
}

writeFileSync(OUT, JSON.stringify(entries, null, 2), 'utf8');
console.log(`✓ ${entries.length} daily devotional entries written to lib/data/daily-devotional.json`);

// Quick QA
let issues = 0;
for (const e of entries) {
  const missing = [];
  if (!e.shloka.sanskrit) missing.push('sanskrit');
  if (!e.shloka.meaning_en) missing.push('meaning_en');
  if (!e.shloka.reflection_en) missing.push('reflection_en');
  if (!e.story.body_en) missing.push('story_en');
  if (!e.story.body_te) missing.push('story_te');
  if (missing.length) { console.log(`  Day ${e.day} (${e.deity}): missing ${missing.join(', ')}`); issues++; }
  else console.log(`  Day ${e.day}: ✓  ${e.deity} — ${e.story.title_en}`);
}
if (!issues) console.log('\nAll entries complete.');
