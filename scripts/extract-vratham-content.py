#!/usr/bin/env python3
"""
Extract katha content from English markdown and Telugu/Tamil/Hindi DOCX files.
Outputs scripts/vratham-content.json for use by populate-vratham-kathas.mjs.

Run: python3 scripts/extract-vratham-content.py
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS  = os.path.expanduser('~/Downloads')

EN_MD   = os.path.join(DOWNLOADS, 'hindu_vratams_exhaustive_guide.md')
TE_DOCX = os.path.join(DOWNLOADS, 'hindu_vratams_exhaustive_guide_telugu.docx')
TA_DOCX = os.path.join(DOWNLOADS, 'hindu_vratams_exhaustive_guide_tamil.docx')
HI_DOCX = os.path.join(DOWNLOADS, 'hindu_vratams_exhaustive_guide_hindi.docx')

# 15 vrathams in order — must match the order in the docs
VRATHAMS = [
    {'slug': 'satyanarayana-vratham',     'story_slug': 'satyanarayana-katha',      'deity_slug': 'vishnu',    'parent_type': 'vratham'},
    {'slug': 'varalakshmi-vratham',       'story_slug': 'varalakshmi-katha',        'deity_slug': 'lakshmi',   'parent_type': 'vratham'},
    {'slug': 'karwa-chauth',              'story_slug': 'karwa-chauth-katha',        'deity_slug': 'shiva',     'parent_type': 'vratham'},
    {'slug': 'maha-shivaratri',           'story_slug': 'maha-shivaratri-katha',     'deity_slug': 'shiva',     'parent_type': 'vratham'},
    {'slug': 'ekadashi-vratham',          'story_slug': 'ekadashi-katha',            'deity_slug': 'vishnu',    'parent_type': 'vratham'},
    {'slug': 'santoshi-mata',             'story_slug': 'santoshi-mata-katha',       'deity_slug': 'ganesha',   'parent_type': 'vratham'},
    {'slug': 'kedareswara-vratham',       'story_slug': 'kedareswara-katha',         'deity_slug': 'shiva',     'parent_type': 'vratham'},
    {'slug': 'mangala-gauri-vratham',     'story_slug': 'mangala-gauri-katha',       'deity_slug': 'parvati',   'parent_type': 'vratham'},
    {'slug': 'pradosha-vratham',          'story_slug': 'pradosha-katha',            'deity_slug': 'shiva',     'parent_type': 'vratham'},
    {'slug': 'hartalika-teej',            'story_slug': 'hartalika-teej-katha',      'deity_slug': 'parvati',   'parent_type': 'vratham'},
    {'slug': 'vaibhav-lakshmi-vrat',      'story_slug': 'vaibhav-lakshmi-katha',     'deity_slug': 'lakshmi',   'parent_type': 'vratham'},
    {'slug': 'skanda-sashti-vratham',     'story_slug': 'skanda-sashti-katha',       'deity_slug': 'murugan',   'parent_type': 'vratham'},
    {'slug': 'chhath-puja',               'story_slug': 'chhath-puja-katha',         'deity_slug': 'surya',     'parent_type': 'vratham'},
    {'slug': 'sankashti-chaturthi-vratham','story_slug': 'sankashti-chaturthi-katha','deity_slug': 'ganesha',   'parent_type': 'vratham'},
    {'slug': 'savitri-vratham',           'story_slug': 'savitri-katha',             'deity_slug': 'vishnu',    'parent_type': 'vratham'},
]


# ─── English markdown parser ─────────────────────────────────────────────────

def parse_english_md(path):
    """Parse the English markdown into a list of 15 dicts, each with:
       title, katha_title, katha_paras (list of str).
    """
    with open(path, encoding='utf-8') as f:
        text = f.read()

    # Split on top-level `## N. Title` headings
    sections = re.split(r'\n## \d+\.', text)
    # sections[0] is preamble; sections[1..15] are the 15 vrathams

    results = []
    for sec in sections[1:]:  # skip preamble
        lines = sec.split('\n')
        # First line = rest of the heading (title)
        title_en = lines[0].strip()

        # Find `### IV.` and the `####` katha sub-heading after it
        katha_title_en = ''
        katha_paras = []

        in_katha = False
        for line in lines[1:]:
            if re.match(r'^### IV\.', line):
                in_katha = True
                continue
            if re.match(r'^## \d+\.', line) or (in_katha and re.match(r'^## ', line)):
                break
            if not in_katha:
                continue
            # katha sub-heading (only capture the first one)
            if line.startswith('#### '):
                if not katha_title_en:
                    katha_title_en = line[5:].strip()
                continue
            # Skip structural markers
            if line.startswith('#') or line.strip() == '---':
                continue
            stripped = line.strip()
            if stripped:
                # Remove leading list markers (*, -, N.) if present
                cleaned = re.sub(r'^\*\s+|^-\s+|^\d+\.\s+', '', stripped)
                katha_paras.append(cleaned)

        results.append({
            'title_en': title_en,
            'katha_title_en': katha_title_en,
            'katha_paras_en': katha_paras,
        })

    assert len(results) == 15, f'Expected 15 English sections, got {len(results)}'
    return results


# ─── DOCX parser ─────────────────────────────────────────────────────────────

def extract_docx_lines(path):
    with zipfile.ZipFile(path) as z:
        with z.open('word/document.xml') as f:
            tree = ET.parse(f)
    root = tree.getroot()
    lines = []
    for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [r.text or '' for r in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')]
        lines.append(''.join(texts).strip())
    return lines


def is_main_heading(line):
    """Return (number, title) if this is a top-level vratham heading like '1. Title', else None."""
    m = re.match(r'^(\d{1,2})\.\s+(.+)$', line)
    if m:
        n = int(m.group(1))
        if 1 <= n <= 15:
            return n, m.group(2).strip()
    return None


def is_section_iv(line):
    """True if this line marks the start of katha section IV."""
    return bool(re.match(r'^IV[\.\s]', line.strip()))


def parse_docx_kathas(path, lang_code):
    """Parse a DOCX file and return list of 15 dicts with title and katha data."""
    lines = extract_docx_lines(path)

    # Split into 15 sections by main headings
    section_starts = []  # (index, number, title)
    for i, line in enumerate(lines):
        result = is_main_heading(line)
        if result:
            section_starts.append((i, result[0], result[1]))

    if len(section_starts) < 15:
        print(f'  WARNING: {lang_code}: only {len(section_starts)} main sections found')
        # Pad with empty entries if needed
        while len(section_starts) < 15:
            section_starts.append((len(lines), len(section_starts)+1, ''))

    results = []
    for idx in range(15):
        start_i, num, title = section_starts[idx]
        end_i = section_starts[idx+1][0] if idx+1 < len(section_starts) else len(lines)

        section_lines = lines[start_i:end_i]

        # Find Section IV within this section
        iv_start = None
        for j, l in enumerate(section_lines):
            if is_section_iv(l):
                iv_start = j
                break

        katha_title = ''
        katha_paras = []

        if iv_start is not None:
            katha_lines = section_lines[iv_start+1:]
            first_content = True
            for line in katha_lines:
                if not line:
                    continue
                # Skip if it's another section marker
                if re.match(r'^(I|II|III|IV|V)[\.\s]', line):
                    break
                if first_content:
                    katha_title = line
                    first_content = False
                    continue
                katha_paras.append(line)

        results.append({
            f'title_{lang_code}': title,
            f'katha_title_{lang_code}': katha_title,
            f'katha_paras_{lang_code}': katha_paras,
        })

    return results


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print('Parsing English markdown...')
    en_data = parse_english_md(EN_MD)

    print('Parsing Telugu DOCX...')
    te_data = parse_docx_kathas(TE_DOCX, 'te')

    print('Parsing Tamil DOCX...')
    ta_data = parse_docx_kathas(TA_DOCX, 'ta')

    print('Parsing Hindi DOCX...')
    hi_data = parse_docx_kathas(HI_DOCX, 'hi')

    # Merge into final structure
    final = []
    for i, v in enumerate(VRATHAMS):
        entry = {
            'vratham_slug':  v['slug'],
            'story_slug':    v['story_slug'],
            'deity_slug':    v['deity_slug'],
            'parent_type':   v['parent_type'],
            # English
            'title_en':         en_data[i]['title_en'],
            'katha_title_en':   en_data[i]['katha_title_en'],
            'katha_paras_en':   en_data[i]['katha_paras_en'],
            # Telugu
            'title_te':         te_data[i]['title_te'],
            'katha_title_te':   te_data[i]['katha_title_te'],
            'katha_paras_te':   te_data[i]['katha_paras_te'],
            # Tamil
            'title_ta':         ta_data[i]['title_ta'],
            'katha_title_ta':   ta_data[i]['katha_title_ta'],
            'katha_paras_ta':   ta_data[i]['katha_paras_ta'],
            # Hindi
            'title_hi':         hi_data[i]['title_hi'],
            'katha_title_hi':   hi_data[i]['katha_title_hi'],
            'katha_paras_hi':   hi_data[i]['katha_paras_hi'],
        }
        final.append(entry)

        # Summary
        print(f'  {i+1}. {v["slug"]}')
        print(f'     en: {len(entry["katha_paras_en"])} paras | '
              f'te: {len(entry["katha_paras_te"])} | '
              f'ta: {len(entry["katha_paras_ta"])} | '
              f'hi: {len(entry["katha_paras_hi"])}')

    out_path = os.path.join(SCRIPT_DIR, 'vratham-content.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    print(f'\nWrote {out_path}')
    total = sum(
        len(e['katha_paras_en']) + len(e['katha_paras_te']) +
        len(e['katha_paras_ta']) + len(e['katha_paras_hi'])
        for e in final
    )
    print(f'Total paragraphs across all languages: {total}')


if __name__ == '__main__':
    main()
