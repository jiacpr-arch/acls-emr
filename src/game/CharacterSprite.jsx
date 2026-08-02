import { useEffect, useRef, useState } from 'react';
import { getCharacter, characterImageUrl } from './characters';

// จำผลโหลดรูปต่อ URL ไว้ทั้ง session — กัน request ซ้ำๆ ไปหาไฟล์ที่ไม่มี
const imageCache = new Map(); // url -> true | false

function probeImage(url) {
  if (!url) return Promise.resolve(false); // ไม่มี URL (เช่น custom char ที่ยังไม่อัปรูปท่านี้)
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache.set(url, true); resolve(true); };
    img.onerror = () => { imageCache.set(url, false); resolve(false); };
    img.src = url;
  });
}

// เรียกล่วงหน้าตอนโหลดเคส (ก่อนบทพูดจริงจะขึ้นจอ) เพื่ออุ่น imageCache —
// กัน SVG placeholder โผล่วาบตอนรอ probe รูปจริงรอบแรกของแต่ละ (charId, pose)
export function preloadCharacterImages(charId, pose) {
  probeImage(characterImageUrl(charId, pose));
  probeImage(characterImageUrl(charId, pose, true));
}

/**
 * ตัวละครบนเวที — image-first + SVG placeholder fallback
 *
 * ตัวละคร built-in (char.custom ไม่ true) รู้แน่ล่วงหน้าว่ามีรูปจริงครบทุก pose
 * แล้ว (commit เข้า repo พร้อมกันทีเดียว) — เรนเดอร์ <img> ตรงๆ ไม่ต้อง probe
 * เลย กัน SVG โผล่วาบได้เด็ดขาดแม้เน็ตช้า/จังหวะบีบสุดขั้ว
 *
 * ยกเว้น built-in ที่ติดธง probeArt (รูปจริงยังไม่ถูก generate) กับตัวละคร
 * custom ที่แอดมินสร้างผ่าน Supabase ซึ่งอาจยังอัปรูปไม่ครบทุก pose —
 * ต้อง probe ก่อนเสมอ ไม่งั้นจะพังถ้ารูปยังไม่มี:
 *   1. probe /images/characters/{charId}/{pose}.webp (หรือ URL จาก DB)
 *      + ถ้ามี {pose}_talk.webp จะสลับ 2 เฟรมตอน talking
 *   2. ไม่มีรูป → SVG placeholder จาก registry (ปากขยับด้วย data-mouth groups)
 */
export default function CharacterSprite({ charId, pose = 'idle', talking = false }) {
  const char = getCharacter(charId);
  const needsProbe = !!char?.custom || !!char?.probeArt;
  const probeKey = `${charId}/${pose}`;
  // เก็บผล probe คู่กับ key — key ไม่ตรง = ยัง probing (แทนการ reset ด้วย setState ใน effect)
  const [probe, setProbe] = useState({ key: null, result: null });
  const [frame, setFrame] = useState(0);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!char || !needsProbe) return undefined; // built-in ที่มีรูปครบ ไม่ต้อง probe เลย
    let alive = true;
    const baseUrl = characterImageUrl(charId, pose);
    const talkUrl = characterImageUrl(charId, pose, true);
    Promise.all([probeImage(baseUrl), probeImage(talkUrl)]).then(([hasBase, hasTalk]) => {
      if (!alive) return;
      setProbe({
        key: `${charId}/${pose}`,
        result: hasBase ? { base: baseUrl, talk: hasTalk ? talkUrl : null } : false,
      });
    });
    return () => { alive = false; };
  }, [charId, pose, char, needsProbe]);

  const imgState = probe.key === probeKey ? probe.result : null; // null=probing | {base,talk} | false

  // ปากขยับ: รูปจริง = สลับเฟรม, SVG = toggle data-mouth groups
  useEffect(() => {
    if (!talking) return undefined;
    const iv = setInterval(() => setFrame((f) => (f + 1) % 2), 130);
    return () => clearInterval(iv);
  }, [talking]);

  useEffect(() => {
    const host = svgRef.current;
    if (!host) return;
    const idle = host.querySelector('[data-mouth="idle"]');
    const talk = host.querySelector('[data-mouth="talk"]');
    if (!idle || !talk) return;
    const showTalk = talking && frame === 1;
    talk.style.display = showTalk ? '' : 'none';
    idle.style.display = showTalk ? 'none' : '';
  });

  if (!char) return null;

  // built-in ที่มีรูปครบ — ไม่มีสถานะ "กำลัง probe" ให้ race เลย
  if (!needsProbe) {
    return (
      <img
        src={characterImageUrl(charId, pose)}
        alt={char.name}
        className="cbs-sprite-img"
        draggable="false"
      />
    );
  }

  if (imgState && imgState !== false) {
    const src = talking && frame === 1 && imgState.talk ? imgState.talk : imgState.base;
    return <img src={src} alt={char.name} className="cbs-sprite-img" draggable="false" />;
  }

  // probing (สั้นมาก) หรือไม่มีรูปจริง → SVG placeholder
  return (
    <div
      ref={svgRef}
      className="cbs-sprite-svg"
      // SVG มาจาก registry ในโค้ดเราเอง ไม่ใช่ input ผู้ใช้
      dangerouslySetInnerHTML={{ __html: char.placeholder(pose) }}
    />
  );
}
