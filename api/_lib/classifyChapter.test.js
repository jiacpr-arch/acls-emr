import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyChapter } from './classifyChapter.js';

const CHAPTERS = [
  { id: 'ch1', title: 'Cardiac arrest' },
  { id: 'ch2', title: 'Bradycardia' },
  { id: 'ch3', title: 'Tachycardia' },
];

function mockFetch(body) {
  return async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(body) } }],
    }),
  });
}

function mockFetchError(status) {
  return async () => ({
    ok: false,
    status,
    text: async () => 'boom',
    json: async () => ({}),
  });
}

function withEnv(fn) {
  const prev = process.env.DEEPSEEK_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.DEEPSEEK_API_KEY = 'test-key';
  return async (mock) => {
    globalThis.fetch = mock;
    try {
      await fn();
    } finally {
      globalThis.fetch = prevFetch;
      if (prev === undefined) delete process.env.DEEPSEEK_API_KEY;
      else process.env.DEEPSEEK_API_KEY = prev;
    }
  };
}

test('returns matched chapterId when AI picks a valid id', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({
      question: 'CPR ทำกี่ครั้ง',
      answer: '30:2 cycles',
      chapters: CHAPTERS,
    });
    assert.equal(r.chapterId, 'ch1');
    assert.equal(r.reason, 'cardiac arrest topic');
    assert.equal(r.suggestedNewChapter, '');
  })(mockFetch({ chapterId: 'ch1', reason: 'cardiac arrest topic' }));
});

test('returns null chapterId when AI returns an unknown id', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({
      question: 'q',
      answer: 'a',
      chapters: CHAPTERS,
    });
    assert.equal(r.chapterId, null);
  })(mockFetch({ chapterId: 'ch999', reason: 'made up' }));
});

test('returns suggestedNewChapter when no fit and AI proposes one', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({
      question: 'pediatric dose',
      answer: 'kid stuff',
      chapters: CHAPTERS,
    });
    assert.equal(r.chapterId, null);
    assert.equal(r.suggestedNewChapter, 'Pediatric ALS');
  })(mockFetch({ chapterId: '', reason: 'no fit', suggestedNewChapter: 'Pediatric ALS' }));
});

test('ignores suggestedNewChapter when chapterId is valid', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({ question: 'q', answer: 'a', chapters: CHAPTERS });
    assert.equal(r.chapterId, 'ch2');
    assert.equal(r.suggestedNewChapter, '');
  })(mockFetch({ chapterId: 'ch2', suggestedNewChapter: 'Should be ignored' }));
});

test('truncates overly long suggestedNewChapter', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({ question: 'q', answer: 'a', chapters: CHAPTERS });
    assert.equal(r.suggestedNewChapter.length, 40);
  })(mockFetch({ chapterId: '', suggestedNewChapter: 'x'.repeat(200) }));
});

test('returns null on non-2xx response without throwing', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({ question: 'q', answer: 'a', chapters: CHAPTERS });
    assert.equal(r.chapterId, null);
    assert.match(r.reason, /classify failed: 500/);
  })(mockFetchError(500));
});

test('returns null on malformed JSON without throwing', async () => {
  await withEnv(async () => {
    const r = await classifyChapter({ question: 'q', answer: 'a', chapters: CHAPTERS });
    assert.equal(r.chapterId, null);
    assert.match(r.reason, /parse failed/);
  })(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: 'not json' } }] }),
  }));
});

test('returns null chapterId when chapter list is empty (no API call)', async () => {
  await withEnv(async () => {
    let called = false;
    globalThis.fetch = async () => { called = true; return { ok: true, json: async () => ({}) }; };
    const r = await classifyChapter({ question: 'q', answer: 'a', chapters: [] });
    assert.equal(r.chapterId, null);
    assert.equal(called, false, 'should short-circuit before fetch');
  })(async () => ({ ok: true, json: async () => ({}) }));
});

test('throws when DEEPSEEK_API_KEY is missing', async () => {
  const prev = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  try {
    await assert.rejects(
      () => classifyChapter({ question: 'q', answer: 'a', chapters: CHAPTERS }),
      /DEEPSEEK_API_KEY/,
    );
  } finally {
    if (prev !== undefined) process.env.DEEPSEEK_API_KEY = prev;
  }
});
