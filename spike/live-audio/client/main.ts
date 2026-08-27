// UI wiring only. Talks exclusively to the AudioRoom interface — if this file
// needs a vendor import, the abstraction has failed.
import type { AudioRoom, ParticipantInfo, Role } from './audio-room';
import { LiveKitAudioRoom } from './livekit-room';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const roomSlug = location.pathname.split('/').pop() || '';
let audioRoom: AudioRoom;
let myRole: Role = 'listener';
let me: ParticipantInfo | undefined;

function logLine(line: string) {
  const el = $('log');
  el.textContent += line + '\n';
  el.scrollTop = el.scrollHeight;
}

function render(list: ParticipantInfo[]) {
  me = list.find((p) => p.isLocal);
  const order = (p: ParticipantInfo) =>
    p.role === 'teacher' ? 0 : p.onStage ? 1 : p.handRaised ? 2 : 3;
  const sorted = [...list].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));

  const ul = $('participants');
  ul.innerHTML = '';
  for (const p of sorted) {
    const li = document.createElement('li');
    li.className = p.speaking ? 'speaking' : '';
    const badges = [
      p.role === 'teacher' ? '[teacher]' : '',
      p.onStage ? '[stage]' : '[audience]',
      p.micEnabled ? '🎙 live' : '🔇 muted',
      p.handRaised ? '✋' : '',
      p.isLocal ? '(you)' : '',
    ]
      .filter(Boolean)
      .join(' ');
    li.append(`${p.name} ${badges} `);

    if (myRole === 'teacher' && !p.isLocal) {
      const btn = (label: string, fn: () => Promise<void>) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.onclick = () => fn().catch((e) => logLine(`ERROR ${label}: ${e.message}`));
        li.append(b);
      };
      if (p.micEnabled) btn('mute', () => audioRoom.muteParticipant(p.id));
      else if (p.onStage) btn('ask to unmute', () => audioRoom.requestUnmute(p.id));
      if (p.onStage) btn('to audience', () => audioRoom.sendToAudience(p.id));
      else btn('to stage', () => audioRoom.bringToStage(p.id));
    }
    ul.append(li);
  }

  // My controls reflect current state.
  $('mic-toggle').textContent = me?.micEnabled ? 'Mute myself' : 'Unmute myself';
  ($('mic-toggle') as HTMLButtonElement).disabled = !me?.onStage;
  $('mic-hint').textContent = me?.onStage ? '' : '(in audience — no publish permission)';
  $('hand-toggle').textContent = me?.handRaised ? 'Lower hand' : 'Raise hand';
}

async function join() {
  const name = ($('name') as HTMLInputElement).value.trim();
  if (!name) return alert('enter a name');
  myRole = ($('role') as HTMLSelectElement).value as Role;

  audioRoom = new LiveKitAudioRoom();
  audioRoom.on('log', logLine);
  audioRoom.on('participants', render);
  audioRoom.on('connection', (s) => ($('conn').textContent = s));

  ($('join') as HTMLButtonElement).disabled = true;
  try {
    const { joinMs, tokenMs } = await audioRoom.join({ room: roomSlug, name, role: myRole });
    $('join-time').textContent = `join: ${joinMs.toFixed(0)}ms (token ${tokenMs.toFixed(0)}ms)`;
    $('entry').style.display = 'none';
    $('session').style.display = 'block';
    $('teacher-bar').style.display = myRole === 'teacher' ? 'block' : 'none';
  } catch (e) {
    logLine(`JOIN FAILED: ${(e as Error).message}`);
    ($('join') as HTMLButtonElement).disabled = false;
  }
}

function wire(id: string, fn: () => Promise<void>) {
  $(id).onclick = () => fn().catch((e) => logLine(`ERROR ${id}: ${e.message}`));
}

$('join').onclick = join;
wire('mic-toggle', () => audioRoom.setMicEnabled(!me?.micEnabled));
wire('hand-toggle', () => audioRoom.setHandRaised(!me?.handRaised));
wire('mute-all', () => audioRoom.muteAll());
wire('unmute-all', () => audioRoom.requestUnmuteAll());
wire('leave', async () => {
  await audioRoom.leave();
  location.reload();
});
wire('enable-audio', async () => {
  await (audioRoom as LiveKitAudioRoom).startAudio();
  $('enable-audio').style.display = 'none';
});
