// Throwaway spike server: serves the client, mints LiveKit tokens, and exposes
// teacher controls that act through LiveKit's server API so mute/permission
// changes are enforced at the SFU (PRD NFR-6), never client-side.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
import esbuild from 'esbuild';
import { AccessToken, RoomServiceClient, TrackType } from 'livekit-server-sdk';

const dir = path.dirname(fileURLToPath(import.meta.url));

for (const f of ['.env.local', '.env']) {
  const p = path.join(dir, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET — see README.md, copy .env.example to .env.local');
  process.exit(1);
}

const PORT = Number(process.env.PORT || 3111);
// Unguessable room slug; set SPIKE_ROOM in .env.local to keep the link stable across restarts.
const ROOM = process.env.SPIKE_ROOM || `satsang-${randomBytes(6).toString('hex')}`;
const ADMIN_KEY = randomBytes(16).toString('hex'); // issued only to teachers, per boot

const svc = new RoomServiceClient(
  LIVEKIT_URL.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:'),
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
);

await esbuild.build({
  entryPoints: [path.join(dir, 'client/main.ts')],
  bundle: true,
  outfile: path.join(dir, 'public/app.js'),
  sourcemap: 'inline',
  logLevel: 'warning',
});

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });

// Same permission set, two spellings: the JWT grant calls the self-metadata
// right `canUpdateOwnMetadata`, the server ParticipantPermission calls it
// `canUpdateMetadata`. Both are needed for the raise-hand attribute.
const grantFor = (onStage) => ({
  canSubscribe: true,
  canPublish: onStage,
  canPublishData: true,
  canUpdateOwnMetadata: true,
});
const permissionsFor = (onStage) => ({
  canSubscribe: true,
  canPublish: onStage,
  canPublishData: true,
  canUpdateMetadata: true,
});

async function audioTrackSids(identity) {
  const p = await svc.getParticipant(ROOM, identity);
  return p.tracks.filter((t) => t.type === TrackType.AUDIO).map((t) => t.sid);
}

const routes = {
  'POST /api/token': async (body) => {
    const { name, role, room } = body;
    if (room !== ROOM) return [403, { error: 'wrong room slug' }];
    if (!name || !['teacher', 'listener'].includes(role)) return [400, { error: 'name and role required' }];
    const identity = `${name.replace(/[^\w-]/g, '_')}-${randomBytes(3).toString('hex')}`;
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
      metadata: JSON.stringify({ role }),
      ttl: '3h',
    });
    // Listeners join as audience: no publish grant in the token, so the SFU
    // itself refuses their audio until the teacher brings them to stage.
    at.addGrant({ roomJoin: true, room: ROOM, ...grantFor(role === 'teacher') });
    return [200, {
      token: await at.toJwt(),
      url: LIVEKIT_URL,
      identity,
      ...(role === 'teacher' ? { adminKey: ADMIN_KEY } : {}),
    }];
  },

  // Hard mute at the SFU. muted:false is accepted too so we can test whether
  // LiveKit permits server-initiated remote unmute (expected: it refuses).
  'POST /api/teacher/mute': async ({ identity, muted = true }) => {
    const sids = await audioTrackSids(identity);
    if (!sids.length) return [404, { error: 'no audio track published' }];
    const results = [];
    for (const sid of sids) {
      try {
        await svc.mutePublishedTrack(ROOM, identity, sid, muted);
        results.push({ sid, ok: true });
      } catch (e) {
        results.push({ sid, ok: false, error: String(e.message || e) });
      }
    }
    return [200, { results }];
  },

  'POST /api/teacher/mute-all': async (_body, teacherIdentity) => {
    const participants = await svc.listParticipants(ROOM);
    const muted = [];
    for (const p of participants) {
      if (p.identity === teacherIdentity) continue;
      for (const t of p.tracks) {
        if (t.type !== TrackType.AUDIO || t.muted) continue;
        await svc.mutePublishedTrack(ROOM, p.identity, t.sid, true);
        muted.push(p.identity);
      }
    }
    return [200, { muted }];
  },

  // Stage/audience = the publish permission itself, updated live at the SFU.
  'POST /api/teacher/stage': async ({ identity, onStage }) => {
    const info = await svc.updateParticipant(ROOM, identity, undefined, permissionsFor(!!onStage));
    return [200, { identity: info.identity, canPublish: info.permission?.canPublish }];
  },
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET') {
      if (url.pathname === '/') {
        res.writeHead(302, { location: `/r/${ROOM}` });
        return res.end();
      }
      if (url.pathname === `/r/${ROOM}`) {
        res.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'no-store' });
        return res.end(readFileSync(path.join(dir, 'public/index.html')));
      }
      if (url.pathname === '/app.js') {
        res.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' });
        return res.end(readFileSync(path.join(dir, 'public/app.js')));
      }
      return json(res, 404, { error: 'not found' });
    }

    const handler = routes[`${req.method} ${url.pathname}`];
    if (!handler) return json(res, 404, { error: 'not found' });

    const body = await readBody(req);
    if (url.pathname.startsWith('/api/teacher/')) {
      if (req.headers['x-admin-key'] !== ADMIN_KEY) return json(res, 403, { error: 'bad admin key' });
    }
    const [code, out] = await handler(body, body.teacherIdentity);
    return json(res, code, out);
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces())
    .flat()
    .find((i) => i && i.family === 'IPv4' && !i.internal)?.address;
  console.log(`room slug: ${ROOM}`);
  console.log(`local:  http://localhost:${PORT}/r/${ROOM}`);
  if (lan) console.log(`phone (same wifi): http://${lan}:${PORT}/r/${ROOM}  (listen-only works over http; mic needs chrome flag, see README)`);
});
