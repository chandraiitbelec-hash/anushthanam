export type ChoghadiyaSlot = { start: string; end: string; name: string };

/** Parses the "HH:MM-HH:MM:Name|..." serialization written by scripts/compute-panchangam.py */
export function parseChoghadiya(value: string): ChoghadiyaSlot[] {
  if (!value) return [];
  return value.split('|').map(slot => {
    const sep = slot.lastIndexOf(':');
    const range = slot.slice(0, sep);
    const name = slot.slice(sep + 1);
    const [start, end] = range.split('-');
    return { start, end, name };
  });
}
