/**
 * Parses bhagavad_gita_complete.md into lib/data/bhagavad-gita.json
 * Run once: node scripts/parse-bhagavad-gita.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = '/Users/ChandraKanth/.gemini/antigravity/scratch/bhagavad-gita-document/bhagavad_gita_complete.md';
const OUT = resolve(__dirname, '../lib/data/bhagavad-gita.json');

const content = readFileSync(SRC, 'utf8');
const lines = content.split('\n');

// Strip trailing verse-number markers like ||1-1|| or ||१-१||
function stripVerseMarker(text) {
  return text.replace(/\s*\|\|\s*[\d१-९०\-\.]+\s*\|\|\s*$/, '').trim();
}

// Join multi-line Sanskrit blocks with " | " separator
function joinSanskritLines(arr) {
  return arr
    .filter(l => l.trim().length > 0)
    .join(' | ')
    .trim();
}

const chapters = [];
const verses = [];

let currentChapter = null;
let currentVerse = null;
let state = 'idle';
// in_verse | in_sanskrit_pre | in_sanskrit | in_transliteration | in_meaning
let sanskritBuf = [];
let lastMeaningField = null;

function finalizeVerse() {
  if (currentVerse) {
    verses.push(currentVerse);
    currentVerse = null;
  }
}

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const line = raw.trimEnd();

  // ── Chapter header ───────────────────────────────────────────────────────
  if (line.startsWith('## Chapter ')) {
    finalizeVerse();
    state = 'idle';

    // ## Chapter 1: Name En (name_te / name_ta)
    const m = line.match(/## Chapter (\d+):\s+([^(]+)\(([^/]+)\/([^)]+)\)/);
    if (!m) continue;

    const nextLine = (lines[i + 1] || '').trimEnd();
    // **Hindi**: name_hi | **Verses**: N
    const hm = nextLine.match(/\*\*Hindi\*\*:\s*([^|]+)\|\s*\*\*Verses\*\*:\s*(\d+)/);

    currentChapter = {
      number: parseInt(m[1]),
      name_en: m[2].trim(),
      name_te: m[3].trim(),
      name_ta: m[4].trim(),
      name_hi: hm ? hm[1].trim() : '',
      verse_count: hm ? parseInt(hm[2]) : 0,
    };
    chapters.push(currentChapter);
    i++; // skip the Hindi/Verses line
    continue;
  }

  // ── Verse header ─────────────────────────────────────────────────────────
  if (line.startsWith('### Sloka ')) {
    finalizeVerse();
    const m = line.match(/### Sloka (\d+)\.(\d+)/);
    if (!m) continue;
    currentVerse = {
      chapter: parseInt(m[1]),
      verse: parseInt(m[2]),
      sanskrit: '',
      script_te: '',
      script_hi: '',
      script_ta: '',
      iast: '',
      meaning_en: '',
      meaning_te: '',
      meaning_ta: '',
      meaning_hi: '',
    };
    state = 'in_verse';
    lastMeaningField = null;
    continue;
  }

  if (!currentVerse) continue;

  // ── Section markers ───────────────────────────────────────────────────────
  if (line === '**Sanskrit Sloka:**') {
    state = 'in_sanskrit_pre';
    sanskritBuf = [];
    continue;
  }
  if (line === '**Transliteration:**') {
    state = 'in_transliteration';
    lastMeaningField = null;
    continue;
  }
  if (line === '**Meaning of Sloka:**') {
    state = 'in_meaning';
    lastMeaningField = null;
    continue;
  }

  // ── Sanskrit code block ───────────────────────────────────────────────────
  if (state === 'in_sanskrit_pre' && line === '```') {
    state = 'in_sanskrit';
    continue;
  }
  if (state === 'in_sanskrit') {
    if (line === '```') {
      currentVerse.sanskrit = joinSanskritLines(sanskritBuf);
      state = 'in_verse';
    } else {
      sanskritBuf.push(line);
    }
    continue;
  }

  // ── Transliteration lines ─────────────────────────────────────────────────
  if (state === 'in_transliteration') {
    if (line.startsWith('- **Telugu:**')) {
      currentVerse.script_te = stripVerseMarker(line.replace(/^- \*\*Telugu:\*\*\s*/, ''));
    } else if (line.startsWith('- **English:**')) {
      currentVerse.iast = stripVerseMarker(line.replace(/^- \*\*English:\*\*\s*/, ''));
    } else if (line.startsWith('- **Hindi (Sanskrit):**') || line.startsWith('- **Hindi:**')) {
      currentVerse.script_hi = stripVerseMarker(line.replace(/^- \*\*Hindi(?: \(Sanskrit\))?:\*\*\s*/, ''));
    } else if (line.startsWith('- **Tamil:**')) {
      currentVerse.script_ta = stripVerseMarker(line.replace(/^- \*\*Tamil:\*\*\s*/, ''));
    }
    continue;
  }

  // ── Meaning lines (may be multi-line) ────────────────────────────────────
  if (state === 'in_meaning') {
    if (line.startsWith('- **Telugu:**')) {
      lastMeaningField = 'meaning_te';
      currentVerse.meaning_te = line.replace(/^- \*\*Telugu:\*\*\s*/, '').trim();
    } else if (line.startsWith('- **English:**')) {
      lastMeaningField = 'meaning_en';
      currentVerse.meaning_en = line.replace(/^- \*\*English:\*\*\s*/, '').trim();
    } else if (line.startsWith('- **Hindi:**')) {
      lastMeaningField = 'meaning_hi';
      currentVerse.meaning_hi = line.replace(/^- \*\*Hindi:\*\*\s*/, '').trim();
    } else if (line.startsWith('- **Tamil:**')) {
      lastMeaningField = 'meaning_ta';
      currentVerse.meaning_ta = line.replace(/^- \*\*Tamil:\*\*\s*/, '').trim();
    } else if (line === '---' || line.startsWith('## ') || line.startsWith('### ')) {
      // section boundary — handled by outer loop
      lastMeaningField = null;
    } else if (lastMeaningField && line.trim().length > 0 && !line.startsWith('- **')) {
      // continuation of the previous meaning field
      currentVerse[lastMeaningField] = currentVerse[lastMeaningField] + ' ' + line.trim();
    }
    continue;
  }
}

finalizeVerse();

const output = { chapters, verses };

mkdirSync(resolve(__dirname, '../lib/data'), { recursive: true });
writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');

console.log(`✓ ${chapters.length} chapters, ${verses.length} verses written to lib/data/bhagavad-gita.json`);

// Quick sanity check
const byChapter = {};
for (const v of verses) {
  byChapter[v.chapter] = (byChapter[v.chapter] || 0) + 1;
}
for (const ch of chapters) {
  const got = byChapter[ch.number] || 0;
  const ok = got === ch.verse_count ? '✓' : `✗ expected ${ch.verse_count}`;
  console.log(`  Ch ${String(ch.number).padStart(2)}: ${got} verses ${ok}  ${ch.name_en}`);
}
