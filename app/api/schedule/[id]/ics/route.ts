import { getEvent } from '@/lib/schedule';
import { buildEventIcs } from '@/lib/ics';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * GET /api/schedule/[id]/ics — the "Add to Calendar" download. Public, like
 * event reads everywhere else in v1. A cancelled event still exports (with
 * STATUS:CANCELLED) so someone who already imported it can refresh.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const event = await getEvent(id);
    if (!event) return Response.json({ error: 'not_found' }, { status: 404 });

    const ics = buildEventIcs(event, Date.now());
    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="event-${event.id}.ics"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('SCHEDULE ERROR: ics export failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
