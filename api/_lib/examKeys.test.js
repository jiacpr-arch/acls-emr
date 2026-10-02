import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCAL_EXAMS } from './examKeys.js';

// examKeys.js restates each bundled course's lessonId / pass mark because the courses'
// index.js files can't be imported outside Vite. Read them as text and fail on any drift, so a
// changed pass mark in the app can never be graded against a stale one here.
const read = (dir, kind) => readFileSync(new URL(`../../src/courses/${dir}/${kind}Test/index.js`, import.meta.url), 'utf8');
const constant = (src, name) => {
  const m = new RegExp(`export const ${name} = ('([^']+)'|(\\d+))`).exec(src);
  return m ? (m[2] ?? Number(m[3])) : undefined;
};

for (const [course, exams] of Object.entries(LOCAL_EXAMS)) {
  test(`${course}: lessonId + pass mark match the app's index.js`, () => {
    const pre = read(exams.dir, 'pre');
    const post = read(exams.dir, 'post');
    assert.equal(exams.pre.lessonId, constant(pre, 'PRE_TEST_LESSON_ID'));
    assert.equal(exams.pre.passPercent, constant(pre, 'PRE_TEST_PASS_PERCENT'));
    assert.equal(exams.post.lessonId, constant(post, 'POST_TEST_LESSON_ID'));
    assert.equal(exams.post.passPercent, constant(post, 'POST_TEST_PASS_PERCENT'));
  });

  test(`${course}: every set the app can serve is registered here`, () => {
    for (const kind of ['pre', 'post']) {
      const src = read(exams.dir, kind);
      const listed = /Sets = \[([^\]]+)\]/.exec(src)[1].split(',').map((s) => s.trim()).filter(Boolean);
      assert.equal(exams[kind].sets.length, listed.length, `${course} ${kind}: ${listed}`);
      for (const set of exams[kind].sets) {
        for (const q of set.questions) assert.ok(q.choices.some((c) => c.id === q.correctId), `${set.id}/${q.id} key`);
      }
    }
  });
}

test('set ids are unique across every bundled course (a set id alone identifies the key)', () => {
  const ids = Object.values(LOCAL_EXAMS).flatMap((e) => [...e.pre.sets, ...e.post.sets].map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length);
});
