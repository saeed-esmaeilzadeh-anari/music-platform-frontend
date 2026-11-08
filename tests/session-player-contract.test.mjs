import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const [service, hooks, settings, player] = await Promise.all([
  readFile(path.join(root, 'src/services/auth.service.ts'), 'utf8'),
  readFile(path.join(root, 'src/hooks/use-auth.ts'), 'utf8'),
  readFile(path.join(root, 'src/app/(app)/settings/settings-client.tsx'), 'utf8'),
  readFile(path.join(root, 'src/stores/player.store.ts'), 'utf8'),
]);

test('session API client uses the protected list and revoke endpoints', () => {
  assert.match(service, /listSessions:\s*\(\): Promise<ActiveSession\[\]>[\s\S]*?apiGet<ActiveSession\[]>\("\/auth\/sessions"\)/);
  assert.match(service, /revokeSession:\s*\(sessionId: string\)[\s\S]*?apiDelete<void>\(\`\/auth\/sessions\/\$\{encodeURIComponent\(sessionId\)\}\`\)/);
});

test('session hooks invalidate cached sessions after a successful revoke', () => {
  assert.match(hooks, /useActiveSessions\(\)[\s\S]*?queryFn:\s*\(\)\s*=>\s*authService\.listSessions\(\)/);
  assert.match(hooks, /useRevokeSession\(\)[\s\S]*?authService\.revokeSession\(sessionId\)/);
  assert.match(hooks, /invalidateQueries\(\{\s*queryKey:\s*\['auth', 'sessions'\]\s*\}\)/);
});

test('account settings renders server-backed session metadata and per-session revoke', () => {
  assert.match(settings, /useActiveSessions/);
  assert.match(settings, /session\.userAgent/);
  assert.match(settings, /session\.ipAddress/);
  assert.match(settings, /revokeSession\.mutate\(session\.id\)/);
  assert.match(settings, /logoutAll\.mutate\(\)/);
});

test('queue removal handles invalid indices and empty queues safely', () => {
  assert.match(player, /if \(index < 0 \|\| index >= state\.queue\.length\) return/);
  assert.match(player, /queue: \[\],[\s\S]*?queueIndex: -1,[\s\S]*?currentTrack: null,[\s\S]*?isPlaying: false/);
});

test('queue reordering preserves the current track and recalculates its index', () => {
  assert.match(player, /const nextIndex = state\.currentTrack[\s\S]*?next\.findIndex\(track => track\.id === state\.currentTrack\?\.id\)/);
  assert.match(player, /queue: next,[\s\S]*?queueIndex: nextIndex/);
});
