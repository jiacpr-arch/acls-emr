import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tallyPushResults, FAILURE_DISABLE_THRESHOLD } from './pushBroadcast.js';

const ok = () => ({ status: 'fulfilled', value: {} });
const fail = (statusCode) => ({ status: 'rejected', reason: { statusCode } });
const sub = (id, failure_count = 0) => ({ id, failure_count });

test('successes are collected for last_sent_at/reset', () => {
  const r = tallyPushResults([ok(), ok()], [sub(1), sub(2)]);
  assert.deepEqual(r.successIds, [1, 2]);
  assert.deepEqual(r.toDisable, []);
  assert.deepEqual(r.toIncrement, []);
});

test('404/410 disable immediately without touching failure_count', () => {
  const r = tallyPushResults([fail(404), fail(410)], [sub(1), sub(2)]);
  assert.deepEqual(r.toDisable, [1, 2]);
  assert.deepEqual(r.toIncrement, []);
});

test('transient failures increment failure_count', () => {
  const r = tallyPushResults([fail(500), fail(429)], [sub(1), sub(2, 2)]);
  assert.deepEqual(r.toDisable, []);
  assert.deepEqual(r.toIncrement, [
    { id: 1, failure_count: 1 },
    { id: 2, failure_count: 3 },
  ]);
});

test('a transient-failure streak reaching the threshold disables the subscription', () => {
  const r = tallyPushResults(
    [fail(500)],
    [sub(9, FAILURE_DISABLE_THRESHOLD - 1)]
  );
  assert.deepEqual(r.toDisable, [9]);
  assert.deepEqual(r.toIncrement, []);
});

test('missing failure_count is treated as zero', () => {
  const r = tallyPushResults([fail(500)], [{ id: 3 }]);
  assert.deepEqual(r.toIncrement, [{ id: 3, failure_count: 1 }]);
});

test('mixed batch partitions correctly', () => {
  const results = [ok(), fail(410), fail(500), ok()];
  const subs = [sub(1), sub(2), sub(3), sub(4)];
  const r = tallyPushResults(results, subs);
  assert.deepEqual(r.successIds, [1, 4]);
  assert.deepEqual(r.toDisable, [2]);
  assert.deepEqual(r.toIncrement, [{ id: 3, failure_count: 1 }]);
});
