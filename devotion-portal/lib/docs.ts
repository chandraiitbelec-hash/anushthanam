import { google } from 'googleapis';

function getAuth() {
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
  const auth = await getAuth().getClient();
  const docs = google.docs({ version: 'v1', auth: auth as never });
  const res = await docs.documents.get({ documentId: docId });
  return (res.data.body?.content ?? [])
    .filter(el => el.paragraph)
    .map(el =>
      el.paragraph!.elements?.map(e => e.textRun?.content ?? '').join('') ?? ''
    )
    .filter(text => text.trim().length > 0);
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
