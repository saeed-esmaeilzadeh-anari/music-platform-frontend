import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Module from 'node:module';
import ts from 'typescript';

// Load the real TypeScript store through TypeScript's transpiler. This exercises
// the actual Zustand actions without requiring a browser, Next.js, or a test runner.
const projectRoot = process.cwd();
const storePath = path.join(projectRoot, 'src/stores/player.store.ts');
const source = await readFile(storePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
  fileName: storePath,
  reportDiagnostics: true,
});

const errors = (compiled.diagnostics ?? []).filter(
  diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, 'player store should transpile without TypeScript errors');

const storeModule = new Module(storePath, module);
storeModule.filename = storePath;
storeModule.paths = Module._nodeModulePaths(path.dirname(storePath));
storeModule._compile(compiled.outputText, storePath);

const { usePlayerStore } = storeModule.exports;

const track = id => ({ id, title: `Track ${id}` });
const tracks = (...ids) => ids.map(track);

function seed(queue, queueIndex) {
  const currentTrack = queue[queueIndex] ?? null;
  usePlayerStore.setState({
    currentTrack,
    queue,
    queueIndex,
    recentlyPlayed: [],
    shuffledIndices: [],
    isPlaying: true,
    isLoading: false,
    volume: 0.8,
    isMuted: false,
    progressSec: 42,
    durationSec: 210,
    repeatMode: 'none',
    isShuffled: false,
  });
}

beforeEach(() => {
  usePlayerStore.getState().clearQueue();
  usePlayerStore.setState({ recentlyPlayed: [], isShuffled: false, repeatMode: 'none' });
});

test('removing the currently playing item selects the next item at the same index', () => {
  const queue = tracks('a', 'b', 'c');
  seed(queue, 1);

  usePlayerStore.getState().removeFromQueue(1);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue.map(item => item.id), ['a', 'c']);
  assert.equal(state.queueIndex, 1);
  assert.equal(state.currentTrack.id, 'c');
  assert.equal(state.isPlaying, true);
  assert.equal(state.isLoading, true);
  assert.equal(state.progressSec, 0);
  assert.equal(state.durationSec, 0);
});

test('removing the final queue item clears the current track and playback state', () => {
  seed(tracks('only'), 0);

  usePlayerStore.getState().removeFromQueue(0);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue, []);
  assert.equal(state.queueIndex, -1);
  assert.equal(state.currentTrack, null);
  assert.equal(state.isPlaying, false);
  assert.equal(state.isLoading, false);
  assert.equal(state.progressSec, 0);
  assert.equal(state.durationSec, 0);
  assert.deepEqual(state.shuffledIndices, []);
});

test('removing an item before the current track preserves the track and shifts its index', () => {
  const queue = tracks('a', 'b', 'c', 'd');
  seed(queue, 2);

  usePlayerStore.getState().removeFromQueue(0);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue.map(item => item.id), ['b', 'c', 'd']);
  assert.equal(state.queueIndex, 1);
  assert.equal(state.currentTrack.id, 'c');
  assert.equal(state.progressSec, 42);
  assert.equal(state.isPlaying, true);
});

test('removing an item after the current track preserves its index and playback', () => {
  const queue = tracks('a', 'b', 'c', 'd');
  seed(queue, 1);

  usePlayerStore.getState().removeFromQueue(3);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue.map(item => item.id), ['a', 'b', 'c']);
  assert.equal(state.queueIndex, 1);
  assert.equal(state.currentTrack.id, 'b');
  assert.equal(state.progressSec, 42);
});

test('invalid queue-removal indexes are ignored without mutating state', () => {
  seed(tracks('a', 'b'), 0);
  const before = usePlayerStore.getState();
  const originalQueue = before.queue;

  before.removeFromQueue(-1);
  before.removeFromQueue(2);

  const after = usePlayerStore.getState();
  assert.equal(after.queue, originalQueue);
  assert.equal(after.queueIndex, 0);
  assert.equal(after.currentTrack.id, 'a');
});

test('moving the current track preserves its identity and recalculates its index', () => {
  seed(tracks('a', 'b', 'c', 'd'), 1);

  usePlayerStore.getState().moveQueueItem(1, 3);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue.map(item => item.id), ['a', 'c', 'd', 'b']);
  assert.equal(state.queueIndex, 3);
  assert.equal(state.currentTrack.id, 'b');
  assert.equal(state.progressSec, 42);
  assert.equal(state.isPlaying, true);
});

test('moving another item across the current position keeps the current track selected', () => {
  seed(tracks('a', 'b', 'c', 'd'), 2);

  usePlayerStore.getState().moveQueueItem(0, 3);

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue.map(item => item.id), ['b', 'c', 'd', 'a']);
  assert.equal(state.queueIndex, 1);
  assert.equal(state.currentTrack.id, 'c');
});

test('invalid and no-op queue moves do not mutate the queue', () => {
  seed(tracks('a', 'b', 'c'), 1);
  const before = usePlayerStore.getState();
  const originalQueue = before.queue;

  before.moveQueueItem(-1, 1);
  before.moveQueueItem(0, 3);
  before.moveQueueItem(1, 1);

  assert.equal(usePlayerStore.getState().queue, originalQueue);
  assert.equal(usePlayerStore.getState().currentTrack.id, 'b');
});

test('clearQueue resets queue and all transient playback state', () => {
  seed(tracks('a', 'b', 'c'), 1);
  usePlayerStore.setState({ shuffledIndices: [1, 2, 0] });

  usePlayerStore.getState().clearQueue();

  const state = usePlayerStore.getState();
  assert.deepEqual(state.queue, []);
  assert.equal(state.queueIndex, -1);
  assert.equal(state.currentTrack, null);
  assert.equal(state.isPlaying, false);
  assert.equal(state.isLoading, false);
  assert.equal(state.progressSec, 0);
  assert.equal(state.durationSec, 0);
  assert.deepEqual(state.shuffledIndices, []);
});
