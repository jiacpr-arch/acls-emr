import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickCaptionTrack, json3ToText, extractCaptionTracks } from './youtubeTranscript.js';

test('pickCaptionTrack: ไทย (คนพิมพ์) ชนะ auto ไทย และชนะอังกฤษ', () => {
  const tracks = [
    { languageCode: 'en', kind: 'asr' },
    { languageCode: 'th', kind: 'asr' },
    { languageCode: 'th' },
  ];
  assert.equal(pickCaptionTrack(tracks), tracks[2]);
});

test('pickCaptionTrack: ไม่มีไทย → เลือกอังกฤษ (auto ก็ได้)', () => {
  const tracks = [{ languageCode: 'ja' }, { languageCode: 'en', kind: 'asr' }];
  assert.equal(pickCaptionTrack(tracks), tracks[1]);
});

test('pickCaptionTrack: ไม่มีไทย/อังกฤษ → track แรกที่ไม่ใช่ asr', () => {
  const tracks = [{ languageCode: 'ja', kind: 'asr' }, { languageCode: 'ko' }];
  assert.equal(pickCaptionTrack(tracks), tracks[1]);
});

test('pickCaptionTrack: ว่าง → null', () => {
  assert.equal(pickCaptionTrack([]), null);
  assert.equal(pickCaptionTrack(undefined), null);
});

test('json3ToText: รวม segs และตัดช่วงตาม startSec/endSec (เผื่อ ±3 วิ)', () => {
  const data = {
    events: [
      { tStartMs: 0, segs: [{ utf8: 'ก่อนช่วง' }] },
      { tStartMs: 10000, segs: [{ utf8: 'ใน ' }, { utf8: 'ช่วง' }] },
      { tStartMs: 20000, segs: [{ utf8: 'ท้ายช่วง' }] },
      { tStartMs: 60000, segs: [{ utf8: 'หลังช่วง' }] },
      { tStartMs: 15000 }, // ไม่มี segs (เช่น event ของ window) → ข้าม
    ],
  };
  assert.equal(json3ToText(data, { startSec: 8, endSec: 21 }), 'ใน ช่วง\nท้ายช่วง');
  assert.equal(json3ToText(data), 'ก่อนช่วง\nใน ช่วง\nท้ายช่วง\nหลังช่วง');
});

test('extractCaptionTracks: แกะจาก HTML และคืน null เมื่อไม่มี', () => {
  const html = 'xxx"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://x/api/timedtext?v=abc\\u0026lang=th","languageCode":"th","kind":"asr"}],"audioTracks":[]}}yyy';
  const tracks = extractCaptionTracks(html);
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].languageCode, 'th');
  assert.ok(tracks[0].baseUrl.includes('&lang=th'));
  assert.equal(extractCaptionTracks('<html>no captions</html>'), null);
});
