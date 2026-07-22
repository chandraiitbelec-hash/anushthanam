"""
Sequential extraction pipeline for 9 remaining Sahasranamams.
Fetches Devanagari text, derives Telugu/Tamil/IAST via Node.js, writes JSON.
Run from project root: python3 scripts/extract-all-sahasranamams.py
"""

import subprocess, re, json, os, sys, time
from html.parser import HTMLParser

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(PROJECT, 'research')

# --- source map ---
DEITIES = [
    dict(slug='lakshmi-sahasranamam',     deity_slug='lakshmi',   declared=125,
         url='https://www.drikpanchang.com/deities-namavali/goddesses/lakshmi/stotram/lakshmi-sahasranama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='drikpanchang.com, Lakshmi Sahasranama (Skanda Purana version)'),

    dict(slug='durga-sahasranamam',        deity_slug='durga',     declared=135,
         url='https://www.drikpanchang.com/deities-namavali/goddesses/durga/stotram/durga-sahasranama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='drikpanchang.com, Durga Sahasranama (Skanda Purana version)'),

    dict(slug='subrahmanya-sahasranamam', deity_slug='kartikeya', declared=140,
         url='https://blog.shlokmantra.com/sri-subrahmanya-sahasranama-stotram-in-sanskrit/',
         fetch_flags=['-sL','--compressed'], source_note='shlokmantra.com, Subrahmanya Sahasranama (Skanda Purana / Ishwara-prokta version)'),

    dict(slug='narasimha-sahasranamam',   deity_slug='narasimha', declared=130,
         url='https://karmkandvidhi.in/narasimha-sahasranama-stotram/',
         fetch_flags=['-sL','--compressed'], source_note='karmkandvidhi.in, Narasimha Sahasranama (Narasimha Purana)'),

    dict(slug='surya-sahasranamam',       deity_slug='surya',     declared=128,
         url='https://vignanam.org/hindi/surya-sahasra-nama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='vignanam.org, Surya Sahasranama stotram'),

    dict(slug='hanuman-sahasranamam',     deity_slug='hanuman',   declared=132,
         url='https://vignanam.org/hindi/sri-hanuman-anjaneya-sahasra-nama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='vignanam.org, Hanuman/Anjaneya Sahasranama stotram'),

    dict(slug='rama-sahasranamam',        deity_slug='rama',      declared=130,
         url='https://www.drikpanchang.com/deities-namavali/gods/lord-rama/stotram/rama-sahasranama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='drikpanchang.com, Rama Sahasranama (Ananda Ramayana version)'),

    dict(slug='saraswati-sahasranamam',   deity_slug='saraswati', declared=125,
         url='https://www.drikpanchang.com/deities-namavali/goddesses/saraswati/stotram/saraswati-sahasranama-stotram.html',
         fetch_flags=['-sL','--compressed'], source_note='drikpanchang.com, Saraswati Sahasranama (Skanda Purana version)'),

    dict(slug='ayyappa-sahasranamam',     deity_slug='ayyappa',   declared=130,
         url='https://hindunidhi.com/sri-harihara-putra-ayyappa-sahasranama-stotram-sanskrit/',
         fetch_flags=['-sL'],               source_note='hindunidhi.com, Harihara Putra (Ayyappa) Sahasranama'),
]

# --- HTML text extractor ---
class TextExtract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
    def handle_data(self, data):
        s = data.strip()
        if s:
            self.texts.append(s)

def fetch_deva_blocks(url, fetch_flags):
    """Fetch URL, return Devanagari text blocks (len>5)."""
    cmd = ['curl'] + fetch_flags + ['-A', UA, url]
    out = subprocess.run(cmd, capture_output=True)
    html = out.stdout.decode('utf-8', errors='replace')
    p = TextExtract()
    p.feed(html)
    deva_re = re.compile(r'[ऀ-ॿ]')
    return [t for t in p.texts if deva_re.search(t) and len(t) > 5]

# verse-end: ॥N॥ or ॥ N ॥ with Arabic or Devanagari numerals
VERSE_END_RE = re.compile(r'॥\s*[\d०-९]+\s*॥')

def pair_verses(blocks):
    """Pair alternating half-verses into complete verses.
    Returns list of {n, pada1, pada2} dicts.
    """
    verses = []
    i = 0
    while i < len(blocks):
        b = blocks[i]
        m = VERSE_END_RE.search(b)
        if m:
            n_str = re.search(r'[\d०-९]+', m.group()).group()
            # Convert Devanagari digits to Arabic
            n = int(n_str.translate(str.maketrans('०१२३४५६७८९', '0123456789')))
            pada1 = blocks[i-1].rstrip('।').strip() if i > 0 and not VERSE_END_RE.search(blocks[i-1]) else ''
            pada2 = b
            verses.append({'n': n, 'pada1': pada1, 'pada2': pada2})
        i += 1
    return verses

def to_deva_num(n):
    """Convert integer to Devanagari digit string."""
    return ''.join(chr(0x0966 + int(d)) for d in str(n))

DERIVE_TEMPLATE = (
    "import Sanscript from '@indic-transliteration/sanscript';\n"
    "import { devanagariToTamilSuperscript } from '<<<PROJECT>>>/scripts/lib-tamil-superscript.mjs';\n"
    "const raw = <<<RAW_JSON>>>;\n"
    "const toDevanagariNum = n => String(n).split('').map(d => String.fromCharCode(0x0966+parseInt(d))).join('');\n"
    "const toIast = s => Sanscript.t(s,'devanagari','iast').replace(/[eoEO]/g,c=>({e:'\\u0113',o:'\\u014D',E:'\\u0112',O:'\\u014C'}[c]));\n"
    "const output = raw.map(v => {\n"
    "  const n = v.n;\n"
    "  const pada1 = v.pada1.replace(/\\u0964\\s*$/, '').trim();\n"
    "  const pada2_clean = v.pada2.replace(/\\u0965[\\s\\d\\u0966-\\u096F]+\\u0965\\s*$/, '').replace(/\\u0965[^\\u0965]*$/, '').trim();\n"
    "  const marker = '\\u0965' + toDevanagariNum(n) + '\\u0965';\n"
    "  const deva = pada1 + '|' + pada2_clean + ' ' + marker;\n"
    "  const tel  = Sanscript.t(pada1,'devanagari','telugu') + '|' + Sanscript.t(pada2_clean,'devanagari','telugu');\n"
    "  const tam  = devanagariToTamilSuperscript(pada1) + '|' + devanagariToTamilSuperscript(pada2_clean);\n"
    "  const iast = toIast(pada1) + '|' + toIast(pada2_clean);\n"
    "  return {stanza_number:n,stanza_label:'\\u015Al\\u014Dka '+n,script_devanagari:deva,script_telugu:tel,script_tamil:tam,roman_iast:iast,\n"
    "          meaning_en:null,meaning_hi:null,meaning_te:null,meaning_ta:null,\n"
    "          meaning_sources:{en:null,hi:null,te:null,ta:null},\n"
    "          verification_note:'sourced from single source; cross-check pending'};\n"
    "});\n"
    "process.stdout.write(JSON.stringify(output));\n"
)

def derive_scripts(verses_raw, slug):
    """Write a temp .mjs, run it, return derived array."""
    raw_json = json.dumps(verses_raw, ensure_ascii=False)
    script = DERIVE_TEMPLATE.replace('<<<PROJECT>>>', PROJECT).replace('<<<RAW_JSON>>>', raw_json)
    tmp = os.path.join(PROJECT, 'scripts', f'_derive_{slug}.mjs')
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(script)
    result = subprocess.run(['node', tmp], capture_output=True, cwd=PROJECT)
    os.unlink(tmp)
    if result.returncode != 0:
        raise RuntimeError(f"Node derivation failed: {result.stderr.decode()}")
    return json.loads(result.stdout.decode('utf-8'))

def process_deity(d):
    slug = d['slug']
    out_path = os.path.join(RESEARCH, f'{slug}-sourcing.json')
    if os.path.exists(out_path):
        print(f'  [SKIP] {slug} — already exists')
        return

    print(f'\n=== {slug} ===')
    print(f'  Fetching {d["url"]} ...')
    blocks = fetch_deva_blocks(d['url'], d['fetch_flags'])
    print(f'  Devanagari blocks: {len(blocks)}')

    verses_raw = pair_verses(blocks)
    # Filter: only first contiguous numbered sequence (avoid phalashruti re-numbering)
    # Keep verses where n > 0 and Devanagari in pada1
    deva_re = re.compile(r'[ऀ-ॿ]')
    verses_clean = [v for v in verses_raw if v['n'] > 0 and deva_re.search(v.get('pada1','')) and deva_re.search(v['pada2'])]
    # Deduplicate by stanza number (keep first occurrence)
    seen = set(); deduped = []
    for v in verses_clean:
        if v['n'] not in seen:
            seen.add(v['n'])
            deduped.append(v)
    deduped.sort(key=lambda x: x['n'])
    print(f'  Verse pairs: {len(deduped)}')

    print(f'  Deriving scripts ...')
    derived = derive_scripts(deduped, slug)

    flags = []
    if len(derived) != d['declared']:
        flags.append(f"Declared count {d['declared']} vs actual {len(derived)}; transcribed what was sourced.")
    flags.append('Only one source consulted; cross-check pending.')
    flags.append('All meaning fields null; meanings deferred to separate pass.')

    out = {
        'slug': slug,
        'deity_slug': d['deity_slug'],
        'declared_stanza_count': d['declared'],
        'actual_stanza_count': len(derived),
        'count_reconciliation_note': f'Sourced {len(derived)} verses. Declared estimate was {d["declared"]}.',
        'sources_consulted': [
            {'url': d['url'], 'role': 'primary', 'notes': d['source_note']}
        ],
        'verses': derived,
        'unresolved_flags': flags
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f'  Written: {out_path} ({len(derived)} verses)')
    # Quick sanity check
    v1 = derived[0]
    print(f'  v1 deva:   {v1["script_devanagari"][:70]}')
    print(f'  v1 telugu: {v1["script_telugu"][:70]}')
    print(f'  v1 iast:   {v1["roman_iast"][:70]}')

if __name__ == '__main__':
    os.makedirs(RESEARCH, exist_ok=True)
    for d in DEITIES:
        try:
            process_deity(d)
            time.sleep(1)  # polite pause between fetches
        except Exception as e:
            print(f'  [ERROR] {d["slug"]}: {e}', file=sys.stderr)
    print('\nDone.')
