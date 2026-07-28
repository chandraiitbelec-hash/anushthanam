"""
Generate meaning_te / meaning_ta / meaning_hi for Group B shloka stanzas.
Source of truth: research/<slug>-stanzas.json (fetched from Google Sheets).
Output:          research/<slug>-meanings.json

Usage:
    python3 scripts/generate-stanza-translations-groupB.py --slug soundarya-lahari
    python3 scripts/generate-stanza-translations-groupB.py          # all 4 slugs

Calls Claude API in batches of 10 stanzas. Only generates rows where at least
one of meaning_te/meaning_ta/meaning_hi is empty. Saves after every batch so
progress is not lost on interrupt.
"""
import anthropic
import json
import os
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
RESEARCH_DIR = SCRIPT_DIR.parent / "research"

GROUP_B_SLUGS = [
    "soundarya-lahari",
    "shiv-chalisa",
    "rama-raksha-stotram",
    "mahishasura-mardini-stotram",
]

BATCH_SIZE = 8  # stanzas per API call

SYSTEM_PROMPT = """You are a scholar of Sanskrit devotional literature with mastery of Telugu, Tamil, and Hindi.
Your task is to translate stanza meanings from English into three Indian languages.

Rules:
- Translate FAITHFULLY from the provided English meaning (meaning_en).
- Maintain the same devotional register and approximately the same length.
- Use correct native scripts: Telugu for meaning_te, Tamil for meaning_ta, Devanagari for meaning_hi.
- NEVER romanize; NEVER leave English words in the translated fields.
- Deity names and epithets should use conventional forms in each language.
- Use consistent terminology throughout the entire text.
- Do NOT add extra commentary or explanations not present in the English meaning.
- For Telugu and Tamil, use classical/literary register appropriate for devotional texts.
- For Hindi, use clear, dignified Devanagari appropriate for devotional usage."""


def build_user_prompt(slug: str, batch: list[dict]) -> str:
    lines = [
        f"Shloka: {slug}",
        f"Translate the following {len(batch)} stanza meanings from English to Telugu (meaning_te), Tamil (meaning_ta), and Hindi (meaning_hi).",
        "",
        "Return ONLY a JSON array with this exact structure (no markdown, no extra text):",
        '[{"n": <stanza_number>, "meaning_te": "...", "meaning_ta": "...", "meaning_hi": "..."}, ...]',
        "",
        "Stanzas to translate:",
    ]
    for s in batch:
        lines.append(f"\nStanza {s['stanza_number']}:")
        if s.get("script_devanagari"):
            lines.append(f"  Sanskrit: {s['script_devanagari'][:200]}")
        lines.append(f"  English:  {s['meaning_en']}")
    return "\n".join(lines)


def translate_batch(client: anthropic.Anthropic, slug: str, batch: list[dict]) -> list[dict]:
    prompt = build_user_prompt(slug, batch)
    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0].strip()
    return json.loads(raw)


def process_slug(client: anthropic.Anthropic, slug: str) -> None:
    stanzas_path = RESEARCH_DIR / f"{slug}-stanzas.json"
    if not stanzas_path.exists():
        print(f"  ERROR: {stanzas_path} not found — run fetch-stanzas-groupB.mjs first")
        return

    stanzas = json.loads(stanzas_path.read_text())
    meanings_path = RESEARCH_DIR / f"{slug}-meanings.json"

    # Load existing meanings if any (resume support)
    existing: dict[int, dict] = {}
    if meanings_path.exists():
        for entry in json.loads(meanings_path.read_text()):
            existing[entry["n"]] = entry

    # Only process stanzas missing at least one translation
    to_do = [
        s for s in stanzas
        if not (existing.get(s["stanza_number"], {}).get("meaning_te") and
                existing.get(s["stanza_number"], {}).get("meaning_ta") and
                existing.get(s["stanza_number"], {}).get("meaning_hi"))
    ]
    print(f"\n{slug}: {len(stanzas)} total, {len(to_do)} need translation")

    if not to_do:
        print("  Nothing to do.")
        return

    batches = [to_do[i:i + BATCH_SIZE] for i in range(0, len(to_do), BATCH_SIZE)]
    done = 0

    for b_idx, batch in enumerate(batches):
        ns = [s["stanza_number"] for s in batch]
        print(f"  Batch {b_idx+1}/{len(batches)}: stanzas {ns} ...", end=" ", flush=True)
        try:
            results = translate_batch(client, slug, batch)
        except Exception as exc:
            print(f"ERROR: {exc}")
            time.sleep(5)
            # retry once
            try:
                results = translate_batch(client, slug, batch)
            except Exception as exc2:
                print(f"RETRY FAILED: {exc2}. Skipping batch.")
                continue

        for r in results:
            existing[r["n"]] = r
        done += len(results)
        print(f"ok ({done}/{len(to_do)} done)")

        # Save after every batch
        out = sorted(existing.values(), key=lambda x: x["n"])
        meanings_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
        time.sleep(0.5)  # gentle pacing

    print(f"  Saved {len(existing)} entries → {meanings_path}")


def main():
    slug_arg = None
    if "--slug" in sys.argv:
        idx = sys.argv.index("--slug")
        slug_arg = sys.argv[idx + 1]

    slugs = [slug_arg] if slug_arg else GROUP_B_SLUGS

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    for slug in slugs:
        process_slug(client, slug)

    print("\nDone.")


if __name__ == "__main__":
    main()
