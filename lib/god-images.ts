import fs from 'fs';
import path from 'path';

const GODS_IMAGE_DIR = path.join(process.cwd(), 'public', 'gods');

// Populated once per server process; static assets don't change at runtime.
const existingSlugs = new Set(
  fs.existsSync(GODS_IMAGE_DIR)
    ? fs
        .readdirSync(GODS_IMAGE_DIR)
        .filter(file => file.endsWith('.png'))
        .map(file => file.slice(0, -'.png'.length))
    : []
);

// Server-only: returns the public URL path for a god's image if one exists, else null.
export function godImagePath(slug: string): string | null {
  return existingSlugs.has(slug) ? `/gods/${slug}.png` : null;
}
