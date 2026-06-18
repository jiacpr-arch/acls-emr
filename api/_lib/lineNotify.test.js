import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCertMessage, sendCertNotification } from './lineNotify.js';

test('buildCertMessage — ACLS includes pre/post/EKG, name, id, date', () => {
  const msg = buildCertMessage({
    studentName: 'สมชาย แซ่เจี่ย',
    course: 'acls',
    courseTitle: 'ACLS Certification (Online · Theory)',
    certId: 'JIA-ACLS-ABC',
    completedAt: '2026-06-18T03:00:00.000Z',
    preTestScore: 90,
    postTestScore: 92,
    ekgPassed: true,
  });
  assert.match(msg, /สมชาย แซ่เจี่ย/);
  assert.match(msg, /Pre-test 90%/);
  assert.match(msg, /Post-test 92%/);
  assert.match(msg, /EKG ผ่าน/);
  assert.match(msg, /JIA-ACLS-ABC/);
  assert.match(msg, /18\/06\/2026/);
});

test('buildCertMessage — BLS omits pre-test and EKG', () => {
  const msg = buildCertMessage({
    studentName: 'Jane',
    course: 'bls',
    courseTitle: 'BLS Provider Certification',
    certId: 'JIA-BLS-XYZ',
    postTestScore: 88,
  });
  assert.doesNotMatch(msg, /Pre-test/);
  assert.doesNotMatch(msg, /EKG/);
  assert.match(msg, /Post-test 88%/);
});

test('buildCertMessage — missing name falls back', () => {
  const msg = buildCertMessage({ course: 'acls', certId: 'X' });
  assert.match(msg, /\(ไม่ระบุชื่อ\)/);
});

test('sendCertNotification — skips when env not configured', async () => {
  const prevToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const prevTarget = process.env.LINE_ADMIN_USER_ID;
  delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
  delete process.env.LINE_ADMIN_USER_ID;
  try {
    const r = await sendCertNotification({ studentName: 'A', certId: 'B' });
    assert.equal(r.ok, false);
    assert.equal(r.skipped, 'LINE not configured');
  } finally {
    if (prevToken !== undefined) process.env.LINE_CHANNEL_ACCESS_TOKEN = prevToken;
    if (prevTarget !== undefined) process.env.LINE_ADMIN_USER_ID = prevTarget;
  }
});

test('sendCertNotification — posts to LINE push API when configured', async () => {
  process.env.LINE_CHANNEL_ACCESS_TOKEN = 'tok';
  process.env.LINE_ADMIN_USER_ID = 'U123';
  const calls = [];
  const fakeFetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, status: 200, text: async () => '' };
  };
  try {
    const r = await sendCertNotification(
      { studentName: 'A', certId: 'B', course: 'acls' },
      { fetch: fakeFetch },
    );
    assert.equal(r.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.line.me/v2/bot/message/push');
    const sentBody = JSON.parse(calls[0].opts.body);
    assert.equal(sentBody.to, 'U123');
    assert.equal(sentBody.messages[0].type, 'text');
    assert.match(calls[0].opts.headers.Authorization, /^Bearer tok$/);
  } finally {
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
    delete process.env.LINE_ADMIN_USER_ID;
  }
});

test('sendCertNotification — returns error detail on non-ok response', async () => {
  process.env.LINE_CHANNEL_ACCESS_TOKEN = 'tok';
  process.env.LINE_ADMIN_USER_ID = 'U123';
  const fakeFetch = async () => ({ ok: false, status: 401, text: async () => 'invalid token' });
  try {
    const r = await sendCertNotification(
      { studentName: 'A', certId: 'B' },
      { fetch: fakeFetch },
    );
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
    assert.match(r.error, /invalid token/);
  } finally {
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
    delete process.env.LINE_ADMIN_USER_ID;
  }
});
