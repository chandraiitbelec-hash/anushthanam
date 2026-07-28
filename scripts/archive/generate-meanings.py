"""
Generate meanings (en/hi/te/ta) for all sahasranamam sourcing JSONs.
One API call per deity — no agents, no tool round-trips.
Run from project root: python3 scripts/generate-meanings.py

Requires: pip install anthropic
API key must be set: export ANTHROPIC_API_KEY=...
"""

import anthropic, json, os, sys, re, time

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(PROJECT, 'research')

client = anthropic.Anthropic()

DEITIES = [
    ('shiva-sahasranamam',       'Shiva (Maheshvara)'),
    ('ganesha-sahasranamam',     'Ganesha (Ganapati)'),
    ('lakshmi-sahasranamam',     'Lakshmi (Mahalakshmi)'),
    ('durga-sahasranamam',       'Durga (Mahishasura Mardini)'),
    ('subrahmanya-sahasranamam', 'Subrahmanya (Murugan / Kartikeya)'),
    ('narasimha-sahasranamam',   'Narasimha (Ugra Narasimha)'),
    ('surya-sahasranamam',       'Surya (Aditya / Sun God)'),
    ('hanuman-sahasranamam',     'Hanuman (Anjaneya)'),
    ('rama-sahasranamam',        'Rama (Maryada Purushottama)'),
    ('saraswati-sahasranamam',   'Saraswati (Vagdevi)'),
    ('ayyappa-sahasranamam',     'Ayyappa (Harihara Putra)'),
]

SYSTEM = """You are a Sanskrit scholar producing devotional meanings for a Hindu reference platform.
For each shloka of a sahasranamam, the shloka lists divine epithets/names of the deity.
Produce concise devotional meanings (15-25 words each) that explain what those names mean.
Always respond with valid JSON only — no markdown, no commentary."""

def make_prompt(deity_name, verses):
    verse_lines = '\n'.join(
        f'{v["stanza_number"]}: {v["script_devanagari"]}'
        for v in verses
        if not (v.get('meaning_en') and v.get('meaning_hi') and v.get('meaning_te') and v.get('meaning_ta'))
    )
    return f"""Generate meanings for these {deity_name} Sahasranamam shlokas.

Each shloka lists divine epithets. Translate/explain them devotionally in all 4 languages.

SHLOKAS (number: devanagari_text):
{verse_lines}

Respond with JSON array (one object per shloka):
[
  {{
    "n": <stanza_number>,
    "meaning_en": "<English 15-25 words>",
    "meaning_hi": "<Hindi in Devanagari script, 15-25 words>",
    "meaning_te": "<Telugu in Telugu script, 15-25 words>",
    "meaning_ta": "<Tamil in Tamil script, 15-25 words>"
  }},
  ...
]

Include ALL {len(verses)} shlokas. No truncation."""

def process(slug, deity_name):
    sf = os.path.join(RESEARCH, slug + '-sourcing.json')
    mf = os.path.join(RESEARCH, slug + '-meanings.json')

    sourcing = json.load(open(sf, encoding='utf-8'))
    verses = sourcing['verses']

    # Skip verses that already have all 4 meanings
    todo = [v for v in verses if not (v.get('meaning_en') and v.get('meaning_hi') and v.get('meaning_te') and v.get('meaning_ta'))]
    if not todo:
        print(f'  [SKIP] {slug} — all meanings already present')
        return

    print(f'\n=== {slug} ({len(todo)} verses need meanings) ===')

    prompt = make_prompt(deity_name, todo)
    print(f'  Calling API... ({len(todo)} verses, ~{len(prompt)//4} tokens prompt)')

    response = client.messages.create(
        model='claude-opus-4-8',
        max_tokens=16000,
        system=SYSTEM,
        messages=[{'role': 'user', 'content': prompt}],
    )

    raw = response.content[0].text.strip()

    # Strip markdown code fences if present
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    meanings_list = json.loads(raw)
    meanings = {m['n']: m for m in meanings_list}

    print(f'  Got {len(meanings_list)} meanings back')

    # Merge into sourcing
    for v in verses:
        n = v['stanza_number']
        if n in meanings:
            m = meanings[n]
            for field in ('meaning_en', 'meaning_hi', 'meaning_te', 'meaning_ta'):
                if m.get(field) and not v.get(field):
                    v[field] = m[field]

    # Write updated sourcing JSON in place
    with open(sf, 'w', encoding='utf-8') as f:
        json.dump(sourcing, f, ensure_ascii=False, indent=2)

    # Write meanings sidecar for reference
    with open(mf, 'w', encoding='utf-8') as f:
        json.dump({'slug': slug, 'verses': meanings_list}, f, ensure_ascii=False, indent=2)

    en = sum(1 for v in verses if v.get('meaning_en'))
    hi = sum(1 for v in verses if v.get('meaning_hi'))
    te = sum(1 for v in verses if v.get('meaning_te'))
    ta = sum(1 for v in verses if v.get('meaning_ta'))
    print(f'  Done: {len(verses)} verses — en={en} hi={hi} te={te} ta={ta}')

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else None

    for slug, deity_name in DEITIES:
        if target and slug != target:
            continue
        try:
            process(slug, deity_name)
            time.sleep(1)
        except Exception as e:
            print(f'  [ERROR] {slug}: {e}', file=sys.stderr)

    print('\nDone.')
