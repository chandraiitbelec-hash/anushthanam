"""
Merge [slug]-meanings.json into [slug]-sourcing.json for all 11 sahasranamams.
Only fills null meaning fields; never overwrites existing values.
Run from project root: python3 scripts/merge-meanings.py
"""
import json, os

RESEARCH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'research')

SLUGS = [
    'shiva-sahasranamam', 'ganesha-sahasranamam', 'lakshmi-sahasranamam',
    'durga-sahasranamam', 'subrahmanya-sahasranamam', 'narasimha-sahasranamam',
    'surya-sahasranamam', 'hanuman-sahasranamam', 'rama-sahasranamam',
    'saraswati-sahasranamam', 'ayyappa-sahasranamam',
]

for slug in SLUGS:
    mf = os.path.join(RESEARCH, slug + '-meanings.json')
    sf = os.path.join(RESEARCH, slug + '-sourcing.json')
    if not os.path.exists(mf):
        print(f'SKIP (no meanings file): {slug}')
        continue
    if not os.path.exists(sf):
        print(f'SKIP (no sourcing file): {slug}')
        continue

    meanings_data = json.load(open(mf, encoding='utf-8'))
    meanings = {v['n']: v for v in meanings_data['verses']}
    sourcing = json.load(open(sf, encoding='utf-8'))

    updated = 0
    for v in sourcing['verses']:
        n = v['stanza_number']
        if n in meanings:
            m = meanings[n]
            for field in ('meaning_en', 'meaning_hi', 'meaning_te', 'meaning_ta'):
                if m.get(field) and not v.get(field):
                    v[field] = m[field]
                    updated += 1

    with open(sf, 'w', encoding='utf-8') as f:
        json.dump(sourcing, f, ensure_ascii=False, indent=2)

    total = len(sourcing['verses'])
    en = sum(1 for v in sourcing['verses'] if v.get('meaning_en'))
    hi = sum(1 for v in sourcing['verses'] if v.get('meaning_hi'))
    te = sum(1 for v in sourcing['verses'] if v.get('meaning_te'))
    ta = sum(1 for v in sourcing['verses'] if v.get('meaning_ta'))
    print(f'{slug}: {total} verses — en={en} hi={hi} te={te} ta={ta}  (+{updated} fields filled)')

print('\nMerge complete.')
