import { google } from 'googleapis';
import { getSheetRows } from './sheets';
import { unstable_cache } from 'next/cache';

// Cache the entire stories_content tab for the build; revalidate every hour
const getStoriesContent = unstable_cache(
  () => getSheetRows('stories_content'),
  ['stories_content'],
  { revalidate: 3600 }
);

// Policy: Docs API failures (403/404) must never fail the build or a page render —
// availability of the rest of the site takes priority over one story's prose. Instead
// we track every failing doc ID here and surface a loud, greppable summary so a blank
// story gets noticed rather than silently shipped.
const failedDocIds = new Set<string>();

function reportFailedDoc(docId: string, status: number) {
  failedDocIds.add(docId);
  const prefix = process.env.CI || process.env.VERCEL ? 'CONTENT ERROR' : '[docs]';
  console.error(
    `${prefix}: Cannot read doc ${docId} (${status}) — story body will be empty. ` +
      `${failedDocIds.size} doc(s) failing so far: ${[...failedDocIds].join(', ')}`
  );
}

function getDocsAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });
}

export async function getStoryBody(docId: string): Promise<string[]> {
  if (!docId) return [];
  try {
    const auth = await getDocsAuth().getClient();
    const docs = google.docs({ version: 'v1', auth: auth as never });
    const res = await docs.documents.get({ documentId: docId });
    return (res.data.body?.content ?? [])
      .filter(el => el.paragraph)
      .map(el =>
        el.paragraph!.elements?.map(e => e.textRun?.content ?? '').join('') ?? ''
      )
      .filter(text => text.trim().length > 0);
  } catch (err: unknown) {
    const status = (err as { status?: number; code?: number }).status ?? (err as { status?: number; code?: number }).code;
    if (status === 403 || status === 404) {
      reportFailedDoc(docId, status);
      return [];
    }
    throw err;
  }
}

// Throttled batch fetcher — spaces requests 200ms apart to avoid Docs API HTTP 429
export async function getStoryBodiesBatched(
  docIds: string[]
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  for (const docId of docIds) {
    if (!docId) continue;
    results[docId] = await getStoryBody(docId);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return results;
}

// Read story paragraphs from the stories_content Sheets tab.
// Used when gdoc_id is empty (content stored in Sheet instead of a Doc).
export async function getStoryBodyFromSheet(
  storySlug: string,
  lang: string
): Promise<string[]> {
  const rows = await getStoriesContent();
  return rows
    .filter(r => r.story_slug === storySlug && r.lang === lang)
    .sort((a, b) => parseInt(a.paragraph_num) - parseInt(b.paragraph_num))
    .map(r => r.text)
    .filter(Boolean);
}
