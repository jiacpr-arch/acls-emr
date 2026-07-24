import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Volume2, VolumeX } from 'lucide-react';
import {
  scenarios as builtInScenarios, LEVEL_META, TRACK_META, trackOf, loadPlayableScenarios,
} from '../data/codeBlueScenarios';
import { getCharacter, registerCustomCharacters } from '../game/characters';
import { fetchCustomCharacters } from '../services/codeBlueCharacterService';
import { usePreCourseStore } from '../stores/preCourseStore';
import { IS_BLS } from '../config/courseMode';
import { isOpenLeague } from '../config/openLeague';
import { getClassContext } from '../stores/classStore';
import { rpcSubmitCodeBlueResult } from '../services/cohortSync';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import ClassGateModal from '../components/precourse/ClassGateModal';
import CharacterSprite from '../game/CharacterSprite';
import EcgStrip from '../game/EcgStrip';
import {
  createInitialState, applyFx, nextNode, recordCorrect, recordWrong,
  gradeFor, fmtTime, shuffled, getDifficulty, pushEtco2, wasArrest, correctCount,
  scoreFor, speedBonus, avgSpeed, FAST_FRACTION, comboMultiplier,
  DIFFICULTY, DEFAULT_DIFFICULTY,
} from '../game/storyEngine';
import {
  initAudio, playShockSound, playROSCSound, playWarningBeep,
  playMetronomeClick, playBeep, playTapSound, playTypeBlip,
  playChoiceAppear, playTickSound, playCorrectSound, playComboBreakSound,
  playWinJingle, playLoseSound, playAchievementSound, playImpactSound,
  playHeartbeatThump,
} from '../utils/sound';
import { track } from '../services/analytics';
import {
  recordGrade, syncAwards, listWithEarned, readGrades, ACHIEVEMENTS,
} from '../game/achievements';
import './codeBlueSim.css';

// ป้ายชื่อเกมตามโหมด — engine เดียวกัน แต่ bls.morroo.com เห็นแบรนด์/คำโปรยแบบ BLS
const GAME_NAME = IS_BLS ? 'BLS RESCUE' : 'CODE BLUE';
const GAME_EYEBROW = IS_BLS ? 'BLS Rescue' : 'Code Blue';

const HISCORE_PREFIX = 'acls_codeblue_hiscore';
const MUTE_KEY = 'acls_codeblue_muted';
const DIFF_KEY = 'acls_codeblue_difficulty';
const hiscoreKey = (diff) => `${HISCORE_PREFIX}_${diff}`;

// สำเนาสถานะ engine สำหรับ render (render ห้ามอ่าน ref ตรงๆ)
function snapshot(st) {
  return { ...st, timeline: [...st.timeline], etco2Trace: [...st.etco2Trace] };
}

const RHYTHM_NAMES = {
  flat: 'ASYSTOLE',
  pea: 'PEA ⚠',
  vf: 'V-FIB ⚠',
  nsr: 'SINUS — ROSC',
  afib: 'ATRIAL FIB',
  brady: 'BRADYCARDIA ⚠',
  pacing: 'PACED RHYTHM — CAPTURED',
  tachy: 'UNSTABLE TACHY ⚠',
};
// rhythm ที่ "มีชีพจรแต่ไม่เสถียร" — เตือนสีทอง ไม่ blink (ต่างจาก shockable/arrest ที่ blink แดง)
const WARN_RHYTHMS = new Set(['brady', 'pacing', 'tachy']);
// rhythm ของ cardiac arrest (ไม่มีชีพจร) — blink แดง: shockable (vf), asystole (flat), PEA (pea)
const ARREST_RHYTHMS = new Set(['vf', 'flat', 'pea']);

// ป้ายชื่อจังหวะบนจอ — nsr แยกตามบริบท: หลัง arrest = ROSC, ไม่งั้น = sinus ปกติ
// (เคส stroke/ACS/หลัง cardiovert ไม่เคย arrest ป้าย "ROSC" จะไม่ตรงสถานการณ์)
function rhythmLabel(st) {
  if (st.rhythm === 'nsr') return st.rosc ? 'SINUS — ROSC' : 'SINUS RHYTHM';
  return RHYTHM_NAMES[st.rhythm];
}

const CLEARED_KEY = 'acls_codeblue_cleared'; // เก็บ id เคสที่เคยผ่าน (ROSC)
const readCleared = () => {
  try { return new Set(JSON.parse(localStorage.getItem(CLEARED_KEY)) || []); }
  catch { return new Set(); }
};

// โหมด preview (หน้า admin กด "ทดลองเล่น") — อ่านโจทย์ที่กำลังแก้จาก localStorage
function readPreviewScenario() {
  if (typeof window === 'undefined') return null;
  if (new URLSearchParams(window.location.search).get('preview') !== '1') return null;
  try {
    const previewSc = JSON.parse(localStorage.getItem('code_blue_preview'));
    return previewSc?.story?.length ? previewSc : null;
  } catch { return null; }
}

// ปลดล็อกราย "หมวด" (track): เคสยากของหมวดปลดเมื่อผ่าน basic ของหมวดนั้นก่อน
// — บังคับลำดับการเรียนให้ไต่ทีละ algorithm แทนปลดทั้งคลังพร้อมกัน
const TRACK_BASIC_TO_UNLOCK = 2; // ต้องผ่าน basic ของหมวดอย่างน้อยเท่านี้ (หรือเท่าที่หมวดมี)
// หมวดที่ไม่มีเคส basic เลย (เช่น สืบหาสาเหตุ) ใช้เกณฑ์รวม: ผ่าน basic หมวดไหนก็ได้
const BASIC_TO_UNLOCK = 3;

const isBasic = (s) => (LEVEL_META[s.level]?.order || 0) === 0;

// จำนวนเคส basic (ในคลังปัจจุบัน) ที่ผู้เล่นผ่านแล้ว
function clearedBasicCount(cleared, pool) {
  return pool.filter((s) => isBasic(s) && cleared.has(s.id)).length;
}

// เคสนี้ล็อกอยู่ไหม: left = ต้องผ่าน basic อีกกี่เคส (0 = ปลดแล้ว),
// inTrack = เกณฑ์นับเฉพาะ basic ของหมวดนี้ (ไว้เลือกข้อความบนป้ายล็อก)
function lockInfo(sc, cleared, pool) {
  if (isBasic(sc)) return { left: 0, inTrack: false };
  const basics = pool.filter((s) => isBasic(s) && trackOf(s) === trackOf(sc));
  if (basics.length > 0) {
    const need = Math.min(TRACK_BASIC_TO_UNLOCK, basics.length);
    const done = basics.filter((s) => cleared.has(s.id)).length;
    return { left: Math.max(0, need - done), inTrack: true };
  }
  return { left: Math.max(0, BASIC_TO_UNLOCK - clearedBasicCount(cleared, pool)), inTrack: false };
}

const isUnlocked = (sc, cleared, pool) => lockInfo(sc, cleared, pool).left === 0;

// สุ่มเคสให้ปุ่ม 🎲 — แยกไว้นอก component (react-hooks/purity ไม่ให้เรียก Math.random ใน render)
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

export default function CodeBlueSim() {
  const navigate = useNavigate();
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const [difficulty, setDifficulty] = useState(
    () => localStorage.getItem(DIFF_KEY) || DEFAULT_DIFFICULTY,
  );
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');
  const mutedRef = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // นักเรียนที่อยู่ในคลาส (ถ้ามี) — ใช้บันทึกผลเกมขึ้น cloud ให้อาจารย์เห็น
  // ไม่มีก็เล่นได้ปกติ แค่ไม่มีใครเห็นผลนอกจากตัวเอง (เหมือนเดิม)
  const activeStudent = usePreCourseStore((s) => s.activeStudent);
  // อยู่ในคลาสไหม — ใช้โชว์ปุ่มอันดับเหรียญ + ชิปลงทะเบียน
  // (เป็น state เพราะตอนนี้เข้าคลาสได้จากในเกมเอง ผ่าน ClassGateModal ด้านล่าง)
  const [inClass, setInClass] = useState(() => !!getClassContext().classCode);
  // ในคลาส: ก่อนรับเคสครั้งแรกต้องรู้ว่าใครเล่น ไม่งั้นผลจะไม่ถูกบันทึกให้ครูเห็น
  // (rpcSubmitCodeBlueResult ต้องมี studentPk เสมอ) — startAfterIdentityRef จำไว้ว่า
  // เปิด modal มาเพื่อ "รับเคส" ต่อ ไม่ใช่แค่แก้ชื่อจากชิปสถานะ
  const [showIdentity, setShowIdentity] = useState(false);
  // ยังไม่มีคลาส: ให้เข้าคลาสจากหน้าเกมได้เลย (เดิมต้องอ้อมไป /pre-course ก่อน
  // นักเรียนเลยไม่รู้ว่าจะกรอกชื่อ/รหัสจากตรงไหน)
  const [showClassGate, setShowClassGate] = useState(false);
  const startAfterIdentityRef = useRef(false);

  // ---- engine state: mutable ใน ref (logic) + snapshot state (render) ----
  const S = useRef(createInitialState(DEFAULT_DIFFICULTY));
  const [view, setView] = useState(() => snapshot(createInitialState(DEFAULT_DIFFICULTY)));

  const [preview] = useState(readPreviewScenario);
  const initialPool = preview ? [preview] : builtInScenarios;
  // คลังโจทย์ = built-in ก่อน แล้ว merge โจทย์ published จาก Supabase เมื่อโหลดเสร็จ
  const [pool, setPool] = useState(initialPool);
  // เลือกเคส: ถ้ามีเคสเดียวข้ามหน้าเลือกไปหน้า title เลย
  const [sc, setSc] = useState(initialPool[0]);
  const [cleared, setCleared] = useState(readCleared);
  const [screen, setScreen] = useState(initialPool.length > 1 ? 'select' : 'title'); // select | title | game | debrief
  const [selectFilter, setSelectFilter] = useState('all'); // all | <level id>
  const [quitMenu, setQuitMenu] = useState(false); // เมนูออก/เล่นใหม่ ระหว่างเล่น
  const [freshAwards, setFreshAwards] = useState([]); // เหรียญที่เพิ่งปลดล็อก (โชว์ใน debrief)
  const [awardsTick, setAwardsTick] = useState(0); // บังคับ re-read เหรียญหลังจบเคส

  const [charsReady, setCharsReady] = useState(false);
  useEffect(() => {
    // โหลดตัวละคร custom ก่อนเสมอ (ทั้งโหมด preview และปกติ) เพื่อให้ sprite แสดงถูก
    let alive = true;
    fetchCustomCharacters()
      .then((map) => { if (alive) registerCustomCharacters(map); })
      .finally(() => { if (alive) setCharsReady(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (preview) return undefined; // โหมดทดลองเล่น — ไม่โหลดคลังจาก DB
    let alive = true;
    loadPlayableScenarios().then((list) => {
      if (!alive || !list || list.length <= builtInScenarios.length) return;
      setPool(list);
      // ถ้าเดิมมีเคสเดียว (อยู่หน้า title) แต่ตอนนี้มีหลายเคส → กลับไปหน้าเลือก
      setScreen((cur) => (cur === 'title' && list.length > 1 ? 'select' : cur));
    });
    return () => { alive = false; };
  }, [preview]);
  const [speaker, setSpeaker] = useState(null); // { who, pose, popN }
  const [plate, setPlate] = useState(null); // { name } override (time-skip)
  const [dlgHtml, setDlgHtml] = useState('');
  const [typing, setTyping] = useState(false);
  const [choice, setChoice] = useState(null); // { q, options, hintTgt }
  const [decisionLeft, setDecisionLeft] = useState(getDifficulty(difficulty).decisionTime);
  const [drama, setDrama] = useState(null); // null | 'red' | 'white'
  const [inter, setInter] = useState(null); // { text, green }
  const [flashN, setFlashN] = useState(0);
  const [redN, setRedN] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [comboBreak, setComboBreak] = useState(null); // { n, k } โชว์ตอนคอมโบขาด
  const [result, setResult] = useState(null); // { won, grade, score, isHiscore }
  const [hiscore, setHiscore] = useState(() => Number(localStorage.getItem(hiscoreKey(difficulty)) || 0));

  const timers = useRef({ type: null, dec: null, misc: [], metronome: null });
  const busyRef = useRef(false);
  const [awaitTap, setAwaitTap] = useState(false);
  const currentChoiceRef = useRef(null);
  const retryChoiceRef = useRef(null);
  const decisionLeftRef = useRef(0); // เวลาที่เหลือ ณ วินาทีที่กดเลือก (คำนวณโบนัสความไว)
  const comboBreakN = useRef(0);     // key ให้อนิเมชัน COMBO BREAK เล่นซ้ำได้
  const hintUsedRef = useRef(false); // โหมดง่าย: ใบ้ target หลังตอบผิดครั้งแรกของแต่ละจุด
  const typeDoneRef = useRef(null);
  const fullHtmlRef = useRef('');
  const popCounter = useRef(0);

  const stopMetronome = useCallback(() => {
    if (timers.current.metronome) {
      clearInterval(timers.current.metronome);
      timers.current.metronome = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    const t = timers.current;
    if (t.type) clearTimeout(t.type);
    if (t.dec) clearInterval(t.dec);
    if (t.metronome) clearInterval(t.metronome);
    t.misc.forEach(clearTimeout);
    t.type = null; t.dec = null; t.metronome = null; t.misc = [];
  }, []);
  useEffect(() => clearAllTimers, [clearAllTimers]);

  // เลเยอร์ความกดดัน: เสียงหัวใจเต้น "ตุบ-ตุบ" พื้นหลังระหว่างเล่น
  // คำนวณ "ความตึงเครียด" ใหม่ทุกจังหวะเต้น จาก HP + ภาวะผู้ป่วย + นาทีบีบคั้นตอนตัดสินใจ
  // ยิ่งแย่/ยิ่งลุ้น ยิ่งเต้นเร็วและดังขึ้นพร้อมกัน (~55→130 ครั้ง/นาที)
  // — ระหว่าง CPR เว้นจังหวะให้ metronome นำแทน (110/นาทีคือสาระของบทเรียน)
  useEffect(() => {
    if (screen !== 'game' || muted) return undefined;
    let t = null;
    const tick = () => {
      const st = S.current;
      let period = 800; // ช่วงที่งดตุบ (CPR/หมด HP) — เช็คซ้ำถี่พอให้กลับมาทันเมื่อสถานะเปลี่ยน
      if (st.hp > 0 && !(st.cpr && !st.rosc)) {
        if (st.rosc) {
          // ROSC แล้ว — จังหวะสงบ เบาๆ ให้รู้สึกโล่ง
          if (!mutedRef.current) playHeartbeatThump(0.09);
          period = Math.round(60000 / 64);
        } else {
          const maxHp = st.maxHp || getDifficulty(st.difficulty).hp;
          const frac = Math.max(0, Math.min(1, st.hp / maxHp));
          let tension = (1 - frac) * 0.7; // ฐาน: อาการผู้ป่วยยิ่งแย่ยิ่งเครียด
          if (st.alarm) tension += 0.15; // หมดสติ/ไม่หายใจ
          if (currentChoiceRef.current) { // กำลังลุ้นตัดสินใจ = ช่วงตื่นเต้นสุด
            tension += 0.15;
            const dt = getDifficulty(st.difficulty).decisionTime;
            const leftFrac = dt > 0 ? Math.max(0, decisionLeftRef.current / dt) : 1;
            tension += (1 - leftFrac) * 0.3; // เวลายิ่งงวด ยิ่งระทึก
          }
          tension = Math.min(1, tension);
          // ดัง (0.10→0.36) และเร็ว (55→130 bpm) ไปด้วยกันตามระดับความตึงเครียด
          if (!mutedRef.current) playHeartbeatThump(0.1 + tension * 0.26);
          period = Math.round(60000 / (55 + tension * 75));
        }
      }
      t = setTimeout(tick, period);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [screen, muted]);

  // ---- flow ทั้งหมดเป็น plain functions: เรียกไขว้/เรียกซ้ำกันได้อิสระ
  //      ปลอดภัยจาก stale closure เพราะแตะเฉพาะ ref + state setter (stable) ----

  function syncView() {
    setView(snapshot(S.current));
  }

  function later(fn, ms) {
    timers.current.misc.push(setTimeout(fn, ms));
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function sfx(fn) {
    if (!mutedRef.current) fn();
  }

  // metronome ~110/นาที ระหว่าง CPR (หยุดเมื่อ shock/ROSC/ผิด/จบเคส)
  function startMetronome() {
    stopMetronome();
    if (mutedRef.current) return;
    timers.current.metronome = setInterval(() => {
      if (!mutedRef.current) playMetronomeClick();
    }, 545);
  }

  // ผูกเสียงกับ fx ที่ node ทำ (เรียกก่อน applyFx เพื่ออ่านสถานะ cpr เดิม)
  function soundForFx(fx) {
    if (!fx) return;
    if (fx.shock) { sfx(playShockSound); stopMetronome(); }
    if (fx.rosc) { sfx(playROSCSound); stopMetronome(); }
    if (fx.alarm) sfx(playWarningBeep);
    if (fx.cpr && !S.current.cpr) startMetronome();
  }

  function finishTyping() {
    if (timers.current.type) clearTimeout(timers.current.type);
    timers.current.type = null;
    setDlgHtml(fullHtmlRef.current);
    setTyping(false);
    const done = typeDoneRef.current;
    typeDoneRef.current = null;
    if (done) done();
  }

  function typeText(html, onDone) {
    if (timers.current.type) clearTimeout(timers.current.type);
    fullHtmlRef.current = html;
    typeDoneRef.current = onDone || null;
    setTyping(true);
    setDlgHtml('');
    let i = 0;
    let out = '';
    let blipN = 0;
    const step = () => {
      if (i >= html.length) { finishTyping(); return; }
      const ch = html[i];
      if (ch === '<') {
        const close = html.indexOf('>', i);
        out += html.slice(i, close + 1);
        i = close + 1;
      } else {
        out += ch;
        i += 1;
        // เสียงพิมพ์ทีละตัว (สไตล์ visual novel) — เว้นทุก 3 ตัวอักษรกันถี่เกิน
        if (!reducedMotion && ch !== ' ' && blipN++ % 3 === 0) sfx(playTypeBlip);
      }
      setDlgHtml(out);
      timers.current.type = setTimeout(step, reducedMotion ? 0 : 16);
    };
    step();
  }

  function doShake() {
    setShaking(true);
    later(() => setShaking(false), 450);
  }

  function doBigMoment() {
    vibrate([90, 50, 160]);
    if (!reducedMotion) {
      setFlashN((n) => n + 1);
      doShake();
    }
  }

  function endCase(won) {
    clearAllTimers();
    const st = S.current;
    const grade = gradeFor(st, won);
    const score = scoreFor(st, won);
    const bonus = speedBonus(st, won);
    const speed = avgSpeed(st);
    // เคลียร์แบบ "ไว": ชนะ ไม่ผิดเลย และเฉลี่ยตอบถูกในครึ่งแรกของเวลา → เหรียญสายฟ้า
    const fastClear = won && st.wrong === 0 && speed >= FAST_FRACTION;
    const key = hiscoreKey(st.difficulty);
    let isHiscore = false;
    if (score > Number(localStorage.getItem(key) || 0)) {
      localStorage.setItem(key, String(score));
      setHiscore(score);
      isHiscore = score > 0;
    }
    let fresh = [];
    if (won) {
      const nextCleared = new Set(cleared);
      nextCleared.add(sc.id);
      setCleared(nextCleared);
      localStorage.setItem(CLEARED_KEY, JSON.stringify([...nextCleared]));
      // บันทึกเกรด + ปลดล็อกเหรียญ (client-side ล้วน) — โชว์เหรียญใหม่ในหน้า debrief
      const grades = recordGrade(sc.id, grade, st.difficulty, fastClear);
      const { fresh: freshIds } = syncAwards(pool, nextCleared, grades);
      fresh = ACHIEVEMENTS.filter((a) => freshIds.includes(a.id));
      setAwardsTick((n) => n + 1);
    }
    setFreshAwards(fresh);
    // บันทึกผลขึ้น cloud ให้อาจารย์เห็น — เฉพาะตอนอยู่ในคลาส (มี activeStudent)
    // และไม่ใช่โหมด preview ของแอดมิน best-effort ล้วน: ไม่มีคลาส/ออฟไลน์/error
    // ก็แค่ไม่ถูกบันทึก ไม่กระทบการเล่นเกม (เหมือน assessmentService mirror-write)
    if (!preview && activeStudent?.id) {
      rpcSubmitCodeBlueResult({
        attemptUuid: crypto.randomUUID(),
        studentPk: activeStudent.id,
        scenarioId: sc.id,
        payload: {
          level: sc.level,
          difficulty: st.difficulty,
          won,
          grade,
          score,
          wrongCount: st.wrong,
          durationSeconds: Math.round(st.simTime),
          finishedAt: new Date().toISOString(),
          fastClear, // ให้ restore ข้ามเครื่องกู้เหรียญ "สายฟ้า" ได้ด้วย
        },
      }).catch(() => {});
    }
    track('game_completed', {
      props: {
        scenario_id: sc.id,
        difficulty: st.difficulty,
        won,
        grade,
        wrong: st.wrong,
        time_to_cpr: st.firstCPRAt,
        time_to_shock: st.firstShockAt,
        duration: st.simTime,
      },
    });
    syncView();
    setResult({ won, grade, score, isHiscore, bonus, speed });
    setChoice(null);
    setInter(null);
    setScreen('debrief');
    window.scrollTo(0, 0);
    // เสียงปิดเคส: ชนะ = แตรสั้น, แพ้ = โน้ตลง — ถ้ามีเหรียญใหม่ตามด้วยเสียงประกาย
    sfx(won ? playWinJingle : playLoseSound);
    if (fresh.length > 0) later(() => sfx(playAchievementSound), 1100);
  }

  function showChoice(c) {
    currentChoiceRef.current = c;
    setDrama('white');
    const diff = getDifficulty(S.current.difficulty);
    // โหมดง่าย: หลังพลาดจุดนี้ไปแล้วครั้งนึง ใบ้หมวด target ที่ถูก + dim ตัวที่ผิด
    const hintTgt = diff.hints && hintUsedRef.current
      ? (c.options.find((o) => o.ok)?.tgt || null)
      : null;
    setChoice({ q: c.q, options: shuffled(c.options), hintTgt });
    sfx(playChoiceAppear); // มีคำถามเด้งขึ้น — เรียกสมาธิ
    setDecisionLeft(diff.decisionTime);
    decisionLeftRef.current = diff.decisionTime;
    if (timers.current.dec) clearInterval(timers.current.dec);
    let left = diff.decisionTime;
    timers.current.dec = setInterval(() => {
      left -= 0.25;
      decisionLeftRef.current = left;
      setDecisionLeft(left);
      // 5 วิสุดท้ายติ๊กเตือนรายวินาที (2 วิสุดท้ายโทนสูงขึ้น) — เร่งจังหวะหัวใจ
      if (left > 0 && left <= 5 && Number.isInteger(left)) {
        sfx(() => playTickSound(left <= 2));
      }
      if (left <= 0) {
        clearInterval(timers.current.dec);
        timers.current.dec = null;
        pick({
          ok: false,
          timeout: true,
          why: 'หมดเวลา — ใน arrest ความลังเลก็คือการตัดสินใจแบบหนึ่ง',
          worsen: true,
        });
      }
    }, 250);
  }

  function runNode(node) {
    const st = S.current;
    if (node.t) st.simTime += node.t;
    syncView();

    if (node.say) {
      const { who, pose, text } = node.say;
      // fx รองรับทั้งใน say ({say:{fx}}) และระดับ node ({say:{}, fx}) — บางเคสวางไว้ระดับ node
      // ถ้าไม่รวม node.fx จังหวะที่ตั้งบน say node แบบนั้นจะถูกมองข้าม จอค้าง STANDBY ไม่ตรงบท
      const fx = node.say.fx || node.fx;
      soundForFx(fx);
      applyFx(st, fx);
      pushEtco2(st);
      setDrama(pose === 'panic' ? 'red' : null);
      popCounter.current += 1;
      setSpeaker({ who, pose, popN: popCounter.current });
      setPlate(null);
      setAwaitTap(true);
      typeText(text);
      syncView();
      return;
    }

    if (node.inter) {
      busyRef.current = true;
      soundForFx(node.fx);
      applyFx(st, node.fx);
      pushEtco2(st);
      if (node.drama) setDrama(node.drama);
      syncView();
      doBigMoment();
      // ป้ายเด้ง: เหตุดี = โน้ตชื่นชม, เหตุวิกฤต = เสียงตุบกระแทก
      sfx(node.green ? playCorrectSound : playImpactSound);
      setInter({ text: node.inter, green: !!node.green });
      later(() => {
        setInter(null);
        busyRef.current = false;
        advance();
      }, reducedMotion ? 350 : 1050);
      return;
    }

    if (node.skip) {
      busyRef.current = true;
      setDrama(null);
      popCounter.current += 1;
      setSpeaker({ who: 'att_dech', pose: 'idle', popN: popCounter.current });
      setPlate({ name: '— เวลาเดินต่อ —' });
      setAwaitTap(false);
      typeText(`⏩ ${node.skip}…`, () => {
        later(() => {
          busyRef.current = false;
          advance();
        }, reducedMotion ? 200 : 700);
      });
      return;
    }

    if (node.choice) {
      showChoice(node.choice);
      return;
    }

    if (node.end) {
      endCase(true);
      return;
    }

    advance();
  }

  function advance() {
    const node = nextNode(S.current, sc.story);
    if (!node) { endCase(true); return; }
    runNode(node);
  }

  function pick(option) {
    if (timers.current.dec) { clearInterval(timers.current.dec); timers.current.dec = null; }
    setChoice(null);
    const st = S.current;

    if (option.ok) {
      // สัดส่วนเวลาที่เหลือ = ความไว (ตอบทันที ≈ 1, ตอบตอนจวนหมดเวลา ≈ 0)
      const dt = getDifficulty(st.difficulty).decisionTime;
      const speedFrac = dt > 0 ? decisionLeftRef.current / dt : 0;
      recordCorrect(st, option, speedFrac);
      currentChoiceRef.current = null;
      hintUsedRef.current = false; // จุดถัดไปเริ่มใหม่ ไม่ใบ้
      // เสียงตอบถูก — คอมโบยิ่งยาวโทนยิ่งสูงขึ้น (juice), ตอบถูกธรรมดาก็มีเสียงชม
      if (st.combo >= 2) sfx(() => playBeep(360 + Math.min(st.combo, 8) * 70, 0.1, 0.22));
      else sfx(playCorrectSound);
      syncView();
      advance();
      return;
    }

    // คอมโบขาด — ถ้าสตรีคเคยยาวพอ โชว์ "BREAK" ให้รู้สึกถึงการเสีย streak
    const broke = st.combo >= 3;
    if (broke) {
      setComboBreak({ n: st.combo, k: comboBreakN.current++ });
      later(() => setComboBreak(null), reducedMotion ? 300 : 900);
    }
    recordWrong(st, option);
    pushEtco2(st);
    hintUsedRef.current = true; // จุดนี้เคยพลาด — โหมดง่ายจะใบ้ตอนเล่นซ้ำ
    vibrate([60, 40, 60]);
    // เสียงผิดต่ำ / ถ้าสตรีคขาดใช้เสียงไล่โน้ตลงแทน ให้เจ็บกว่า
    sfx(broke ? playComboBreakSound : () => playBeep(160, 0.28, 0.35));
    if (!reducedMotion) {
      setRedN((n) => n + 1);
      doShake();
    }
    stopMetronome();
    syncView();

    popCounter.current += 1;
    setSpeaker({ who: 'att_dech', pose: 'stern', popN: popCounter.current });
    setPlate(null);
    setDrama('red');

    // โหมดยาก: ไม่เฉลยเหตุผลตอนพลาด (เก็บไว้ debrief) — เพิ่มความกดดัน
    const showWhy = getDifficulty(st.difficulty).showWhyOnWrong;
    const whyText = showWhy ? ` ${option.why}` : '';

    if (st.hp <= 0) {
      setAwaitTap(false);
      typeText(`<span class="cbs-em">ผู้ป่วยไปแล้ว…</span>${whyText}`, () => {
        later(() => endCase(false), reducedMotion ? 400 : 1400);
      });
      return;
    }

    // ดุแล้วให้ตัดสินใจข้อเดิมซ้ำ (สภาพแย่ลงแล้ว)
    retryChoiceRef.current = currentChoiceRef.current;
    setAwaitTap(true);
    typeText(
      `<span class="cbs-em">ช้าก่อน!</span>${whyText}${option.worsen ? ' — ผู้ป่วยแย่ลง สีผิวคล้ำขึ้น!' : ''}`,
    );
  }

  function onDialogTap() {
    if (busyRef.current) return;
    if (timers.current.type) { sfx(playTapSound); finishTyping(); return; }
    if (!awaitTap) return;
    sfx(playTapSound);
    setAwaitTap(false);
    if (retryChoiceRef.current) {
      const c = retryChoiceRef.current;
      retryChoiceRef.current = null;
      showChoice(c);
      return;
    }
    advance();
  }

  function startGame() {
    clearAllTimers();
    setQuitMenu(false);
    if (!mutedRef.current) initAudio(); // ปลดล็อก AudioContext ตอนผู้ใช้แตะปุ่ม
    S.current = createInitialState(difficulty);
    syncView();
    busyRef.current = false;
    setAwaitTap(false);
    currentChoiceRef.current = null;
    retryChoiceRef.current = null;
    hintUsedRef.current = false;
    setResult(null);
    setFreshAwards([]);
    setComboBreak(null);
    setChoice(null);
    setInter(null);
    setDrama(null);
    setSpeaker(null);
    setPlate(null);
    setDlgHtml('');
    setScreen('game');
    track('game_started', { props: { scenario_id: sc.id, difficulty } });
    later(() => advance(), reducedMotion ? 100 : 400);
  }

  // ปุ่ม "รับเคส" เรียกอันนี้แทน startGame ตรงๆ: ในคลาสแต่ยังไม่รู้ว่าใครเล่น
  // ให้ขอชื่อก่อน แล้วค่อยเริ่มเกมต่อให้อัตโนมัติหลังยืนยัน
  function requestStart() {
    if (inClass && !activeStudent?.id) {
      startAfterIdentityRef.current = true;
      setShowIdentity(true);
      return;
    }
    startGame();
  }

  // ลงทะเบียนเสร็จ modal อาจเพิ่งกู้ความคืบหน้าจาก cloud ลง localStorage
  // (restoreCodeBlueProgress) — อ่านกลับมาอัพเดต state เกม: เคสที่ปลดแล้ว,
  // hi-score และคำนวณเหรียญใหม่จากคลังปัจจุบัน
  function refreshLocalProgress() {
    const nextCleared = readCleared();
    setCleared(nextCleared);
    setHiscore(Number(localStorage.getItem(hiscoreKey(difficulty)) || 0));
    syncAwards(pool, nextCleared, readGrades());
    setAwardsTick((n) => n + 1);
  }

  function handleIdentityConfirm() {
    setShowIdentity(false);
    refreshLocalProgress();
    if (startAfterIdentityRef.current) {
      startAfterIdentityRef.current = false;
      startGame();
    }
  }

  // ปิดหน้ากรอกรหัสคลาส: ถ้าเพิ่งเข้าคลาสสำเร็จและยังไม่รู้ว่าใครเล่น
  // เปิดฟอร์มชื่อ+รหัสนักเรียนต่อทันที — จบใน flow เดียว ไม่ต้องหาปุ่มอีกรอบ
  function handleClassGateClose() {
    setShowClassGate(false);
    const joined = !!getClassContext().classCode;
    setInClass(joined);
    if (joined && !activeStudent?.id) setShowIdentity(true);
  }

  // ชิปลงทะเบียน (หน้าเลือกเคส + หน้าเริ่มเคส) — โชว์เสมอ ไม่ใช่เฉพาะในคลาส
  // เพื่อให้นักเรียนเห็นตั้งแต่แรกว่ากรอกชื่อ/รหัสได้จากตรงไหน และได้อะไรกลับมา
  function renderIdentityChip() {
    if (!inClass) {
      return (
        <div className="cbs-identity-chip">
          <span>
            👥 <b>บันทึกผล · ขึ้นอันดับเหรียญ · เล่นต่อเครื่องอื่นได้</b> —
            เข้าคลาสด้วยรหัสจากอาจารย์ หรือเข้าลีกออนไลน์ (บุคคลทั่วไป)
          </span>
          <button type="button" className="cbs-identity-chip-btn" onClick={() => setShowClassGate(true)}>
            เข้าร่วม
          </button>
        </div>
      );
    }
    const openLeague = isOpenLeague(getClassContext().classCode);
    if (!activeStudent?.id) {
      return (
        <div className="cbs-identity-chip cbs-identity-chip-warn">
          <span>
            {openLeague
              ? '⚠ ยังไม่ได้ลงชื่อ — ลงชื่อเพื่อรับรหัสผู้เล่น ใช้บันทึกผล ขึ้นอันดับเหรียญ และเล่นต่อเครื่องอื่น'
              : '⚠ ยังไม่ได้ลงทะเบียน — กรอกชื่อ + รหัสนักเรียน เพื่อให้ผลบันทึกถึงอาจารย์ และมีชื่อบนอันดับเหรียญของคลาส'}
          </span>
          <button type="button" className="cbs-identity-chip-btn" onClick={() => setShowIdentity(true)}>
            {openLeague ? 'ลงชื่อ' : 'กรอกชื่อ+รหัส'}
          </button>
        </div>
      );
    }
    return (
      <div className="cbs-identity-chip cbs-identity-chip-ok">
        <span>
          👤 บันทึกผลในชื่อ <b>{activeStudent.name}</b>
          {openLeague && activeStudent.studentId && (
            <> · รหัสผู้เล่น <b className="cbs-player-code">{activeStudent.studentId}</b> — จดไว้ใช้เล่นต่อบนเครื่องอื่น</>
          )}
        </span>
        <button type="button" className="cbs-identity-chip-btn" onClick={() => setShowIdentity(true)}>
          เปลี่ยน
        </button>
      </div>
    );
  }

  function pickScenario(chosen) {
    setSc(chosen);
    setScreen('title');
    window.scrollTo(0, 0);
  }

  function backToSelect() {
    clearAllTimers();
    stopMetronome();
    setQuitMenu(false);
    if (pool.length > 1) setScreen('select');
    else navigate('/');
  }

  function chooseDifficulty(id) {
    setDifficulty(id);
    localStorage.setItem(DIFF_KEY, id);
    setHiscore(Number(localStorage.getItem(hiscoreKey(id)) || 0));
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      // เก็บสถิติว่าคนเปิด/ปิดเสียงจากหน้าไหน — ใช้ตัดสินใจเรื่อง backing track/จูนความดัง
      track('game_mute_toggle', { props: { muted: next, screen } });
      mutedRef.current = next; // อัพเดตทันที ไม่รอ effect — ให้ startMetronome ด้านล่างไม่โดนเบรก
      if (next) {
        stopMetronome();
      } else {
        initAudio();
        // เปิดเสียงกลางเคสที่กำลังปั๊มหัวใจอยู่ — จังหวะ metronome ต้องกลับมาเอง
        if (S.current.cpr && !S.current.rosc) startMetronome();
      }
      return next;
    });
  }

  // ============ AWARDS (รางวัล/เหรียญ) ============
  if (screen === 'awards') {
    // awardsTick อ้างในนี้เพื่อให้ re-read localStorage หลังจบเคส (ค่าเหรียญ sticky)
    void awardsTick;
    const badges = listWithEarned(pool, cleared, readGrades());
    const earnedN = badges.filter((b) => b.earned).length;
    return (
      <div className="cbs-app">
        <section className="cbs-select">
          <div className="cbs-eyebrow">{GAME_EYEBROW} · รางวัลของฉัน</div>
          <h1 className="cbs-select-title"><span className="cbs-gold-text">เหรียญ</span> ที่ปลดล็อกได้</h1>
          <p className="cbs-select-sub">ปลดล็อกแล้ว {earnedN}/{badges.length} — เก็บครบทุกเหรียญเพื่อพิสูจน์ฝีมือกู้ชีพ</p>
          <div className="cbs-award-grid">
            {badges.map((b) => (
              <div key={b.id} className={`cbs-badge ${b.earned ? 'cbs-badge-on' : 'cbs-badge-off'}`}>
                <span className="cbs-badge-icon">{b.earned ? b.icon : '🔒'}</span>
                <span className="cbs-badge-title">{b.title}</span>
                <span className="cbs-badge-desc">{b.desc}</span>
              </div>
            ))}
          </div>
          <button type="button" className="cbs-btn-ghost" onClick={() => { setScreen('select'); window.scrollTo(0, 0); }}>
            ← กลับไปเลือกเคส
          </button>
        </section>
      </div>
    );
  }

  // ============ CASE SELECT ============
  if (screen === 'select') {
    // awardsTick บังคับให้คำนวณเหรียญใหม่หลังจบเคส (ค่าอยู่ใน localStorage)
    void awardsTick;
    const badgeList = listWithEarned(pool, cleared, readGrades());
    // จัดกลุ่มตาม "หมวด" (algorithm/ธีมแบบหลักสูตร ACLS) — level เหลือเป็นป้ายความยากบนการ์ด
    const tracksInPool = [...new Set(pool.map(trackOf))]
      .sort((a, b) => (TRACK_META[a]?.order ?? 9) - (TRACK_META[b]?.order ?? 9));
    const shownTracks = selectFilter === 'all' ? tracksInPool : tracksInPool.filter((t) => t === selectFilter);
    // เคสในหมวดเรียงง่าย→ยาก ให้แต่ละหมวดเป็นบันไดของตัวเอง
    const casesInTrack = (tk) => pool
      .filter((c) => trackOf(c) === tk)
      .sort((a, b) => (LEVEL_META[a.level]?.order ?? 0) - (LEVEL_META[b.level]?.order ?? 0));
    const orderedAll = tracksInPool.flatMap(casesInTrack);
    // เคสแนะนำถัดไป: เคสแรก (ตามลำดับหมวด+ความยาก) ที่ปลดแล้วแต่ยังไม่ผ่าน — กดปุ่มเดียวเล่นต่อได้เลย
    const nextCase = orderedAll.find((c) => !cleared.has(c.id) && isUnlocked(c, cleared, pool));

    // สุ่มเคสจากที่ปลดล็อกแล้ว (เอาเคสที่ยังไม่ผ่านก่อน) — โหมดทบทวนไม่ต้องเลือกเอง
    const randomCase = () => {
      const unlockedAll = orderedAll.filter((c) => isUnlocked(c, cleared, pool));
      const fresh = unlockedAll.filter((c) => !cleared.has(c.id));
      const src = fresh.length ? fresh : unlockedAll;
      if (src.length) pickScenario(pickRandom(src));
    };

    const renderCase = (c) => {
      const { left, inTrack } = lockInfo(c, cleared, pool);
      const unlocked = left === 0;
      const done = cleared.has(c.id);
      return (
        <button
          key={c.id}
          type="button"
          className={`cbs-case ${unlocked ? '' : 'cbs-case-locked'}`}
          onClick={() => unlocked && pickScenario(c)}
          disabled={!unlocked}
        >
          <div className="cbs-case-top">
            <span className={`cbs-case-level cbs-lvl-${c.level}`}>{LEVEL_META[c.level]?.label || c.level}</span>
            {done && <span className="cbs-case-done">✓ ผ่านแล้ว</span>}
            {!unlocked && (
              <span className="cbs-case-lock">🔒 ผ่านพื้นฐาน{inTrack ? 'หมวดนี้' : ''}อีก {left} เคส</span>
            )}
          </div>
          <div className="cbs-case-name">{c.title}</div>
          <div className="cbs-case-desc">{c.subtitle}</div>
        </button>
      );
    };

    return (
      <div className="cbs-app">
        <section className="cbs-select">
          <div className="cbs-eyebrow">{GAME_EYEBROW} · เลือกเคส</div>
          <h1 className="cbs-select-title"><span className="cbs-gold-text">{GAME_NAME}</span> ภารกิจกู้ชีพ</h1>
          <p className="cbs-select-sub">
            {IS_BLS
              ? 'ฝึกช่วยชีวิตขั้นพื้นฐานทีละสถานการณ์ — ผ่านเคสพื้นฐานของหมวด เพื่อปลดเคสที่ยากขึ้นในหมวดนั้น'
              : 'ฝึกทีละหมวดจนครบทุก algorithm — ผ่านเคสพื้นฐานของหมวด เพื่อปลดเคสที่ยากขึ้นในหมวดนั้น'}
          </p>
          {renderIdentityChip()}
          {(nextCase || pool.length > 1) && (
            <div className="cbs-quick-row">
              {nextCase && (
                <button type="button" className="cbs-next" onClick={() => pickScenario(nextCase)}>
                  <span className="cbs-next-eyebrow">▶ เคสแนะนำถัดไป</span>
                  <span className="cbs-next-name">{nextCase.title}</span>
                  <span className="cbs-next-meta">
                    {TRACK_META[trackOf(nextCase)].icon} {TRACK_META[trackOf(nextCase)].label}
                    {' · '}
                    {LEVEL_META[nextCase.level]?.label || nextCase.level}
                  </span>
                </button>
              )}
              {pool.length > 1 && (
                <button type="button" className="cbs-dice" onClick={randomCase} aria-label="สุ่มเคส">
                  🎲
                  <span className="cbs-dice-label">สุ่มเคส</span>
                </button>
              )}
            </div>
          )}
          {tracksInPool.length > 1 && (
            <div className="cbs-select-tabs" role="group" aria-label="กรองตามหมวด">
              <button
                type="button"
                className={`cbs-tab ${selectFilter === 'all' ? 'cbs-tab-on' : ''}`}
                onClick={() => setSelectFilter('all')}
                aria-pressed={selectFilter === 'all'}
              >
                ทั้งหมด
              </button>
              {tracksInPool.map((tk) => (
                <button
                  key={tk}
                  type="button"
                  className={`cbs-tab ${selectFilter === tk ? 'cbs-tab-on' : ''}`}
                  onClick={() => setSelectFilter(tk)}
                  aria-pressed={selectFilter === tk}
                >
                  {TRACK_META[tk]?.icon} {TRACK_META[tk]?.label || tk}
                </button>
              ))}
            </div>
          )}
          <div className="cbs-case-groups">
            {shownTracks.map((tk) => {
              const cases = casesInTrack(tk);
              const doneCount = cases.filter((c) => cleared.has(c.id)).length;
              const meta = TRACK_META[tk] || TRACK_META.other;
              return (
                <div key={tk} className="cbs-case-group">
                  <div className="cbs-group-head">
                    <span className="cbs-track-name">{meta.icon} {meta.label}</span>
                    <span className="cbs-group-prog">ผ่าน {doneCount}/{cases.length}</span>
                  </div>
                  {meta.desc && <div className="cbs-track-desc">{meta.desc}</div>}
                  <div className="cbs-case-list">
                    {cases.map(renderCase)}
                  </div>
                </div>
              );
            })}
          </div>
          {!IS_BLS && (
            <div className="cbs-cert-note">
              🏅 โบนัสพิเศษ: เคสที่ผ่านและเหรียญจะโชว์บนใบประกาศ ACLS ของคุณ —
              ผ่านเคส megacode ครบทุกเคส รับตราทอง MEGACODE MASTER (ไม่บังคับ ไม่มีผลต่อการออกใบ)
            </div>
          )}
          <button type="button" className="cbs-btn-ghost" onClick={() => { setScreen('awards'); window.scrollTo(0, 0); }}>
            🏅 รางวัลของฉัน ({badgeList.filter((b) => b.earned).length}/{badgeList.length})
          </button>
          {/* บอร์ดรวมทั้งเว็บเปิดดูได้แม้ไม่มีคลาส — ป้ายเปลี่ยนตามบริบท */}
          <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/sim-board')}>
            {!inClass
              ? '🏆 อันดับรวมทั้งเว็บ'
              : isOpenLeague(getClassContext().classCode) ? '🏆 อันดับลีกออนไลน์' : '🏆 อันดับเหรียญในคลาส'}
          </button>
          <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/')}>
            <Home size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            กลับหน้าแรก
          </button>
        </section>
        <StudentIdentityModal
          open={showIdentity}
          onClose={() => { setShowIdentity(false); startAfterIdentityRef.current = false; }}
          onConfirm={handleIdentityConfirm}
        />
        <ClassGateModal open={showClassGate} onClose={handleClassGateClose} initialMode="join" openLeague />
      </div>
    );
  }

  // ============ TITLE ============
  if (screen === 'title') {
    return (
      <div className="cbs-app">
        <section className="cbs-title">
          <div className="cbs-eyebrow">{GAME_EYEBROW} · {LEVEL_META[sc.level]?.label || 'เคส'}</div>
          <h1><span className="cbs-gold-text">{sc.title}</span></h1>
          <p className="cbs-title-sub">
            {sc.subtitle}<br />
            {IS_BLS
              ? <>คุณคือ <b>ผู้ช่วยเหลือคนแรก</b> — ทุกคนรอบตัวรอการตัดสินใจของคุณ</>
              : <>คุณคือ <b>Team Leader</b> — ทีมทั้งห้องรอฟังคำสั่งของคุณ</>}<br />
            ตัดสินใจผิด ผู้ป่วยแย่ลงจริง เวลาไม่เคยรอใคร
          </p>
          <div className="cbs-diff-group" role="group" aria-label="เลือกระดับความยาก">
            <span className="cbs-diff-label">ระดับความยาก</span>
            <div className="cbs-diff-btns">
              {Object.values(DIFFICULTY).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`cbs-diff-btn ${difficulty === d.id ? 'cbs-diff-on' : ''}`}
                  onClick={() => chooseDifficulty(d.id)}
                  aria-pressed={difficulty === d.id}
                >
                  <span className="cbs-diff-name">{d.label}</span>
                  <span className="cbs-diff-meta">{d.decisionTime}s · ♥{d.hp}</span>
                </button>
              ))}
            </div>
            <div className="cbs-diff-hint">⚡ ตอบถูกเร็ว = ได้โบนัสคะแนน</div>
          </div>
          <div className="cbs-title-row">
            {hiscore > 0 && <div className="cbs-hiscore-chip">HI-SCORE {hiscore}</div>}
            <button
              type="button"
              className="cbs-icon-btn"
              onClick={toggleMute}
              aria-label={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {muted ? <VolumeX size={16} strokeWidth={2.4} /> : <Volume2 size={16} strokeWidth={2.4} />}
            </button>
          </div>
          {renderIdentityChip()}
          <button type="button" className="cbs-btn-main" onClick={requestStart}>
            <AlertTriangle size={18} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 8 }} />
            รับเคส
          </button>
          <button type="button" className="cbs-btn-ghost" onClick={backToSelect}>
            {pool.length > 1
              ? <>← เลือกเคสอื่น</>
              : <><Home size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />กลับหน้าแรก</>}
          </button>
          <div className="cbs-note">DECISION GAME · MORROO</div>
        </section>
        <StudentIdentityModal
          open={showIdentity}
          onClose={() => { setShowIdentity(false); startAfterIdentityRef.current = false; }}
          onConfirm={handleIdentityConfirm}
        />
        <ClassGateModal open={showClassGate} onClose={handleClassGateClose} initialMode="join" openLeague />
      </div>
    );
  }

  // ============ DEBRIEF ============
  if (screen === 'debrief' && result) {
    const st = view;
    const arrest = wasArrest(st);
    // ป้าย/ข้อความผลลัพธ์: เคส arrest → ROSC (เดิม), เคสไม่ arrest → พ้นวิกฤต
    // scenario ตั้ง sc.outcome:{stamp,win} มา override ได้ (เช่น เคสส่งเวร/ACS)
    const winStamp = result.won ? (sc.outcome?.stamp || (arrest ? 'ROSC!' : 'พ้นวิกฤต!')) : 'CODE ENDED';
    const winSub = result.won
      ? (sc.outcome?.win || (arrest
        ? 'ผู้ป่วยกลับมามีชีพจร — เคสนี้เป็นของคุณ'
        : 'ผู้ป่วยพ้นภาวะวิกฤต — อ่าน debrief ด้านล่างเพื่อฝึกให้แม่นขึ้น'))
      : 'ผู้ป่วยเสียชีวิต — อ่าน debrief ด้านล่าง แล้วกลับมาแก้มือ';
    return (
      <div className="cbs-app">
        <section className={`cbs-debrief ${result.won ? 'cbs-winbg' : 'cbs-losebg'}`}>
          <div className={`cbs-stamp ${result.won ? 'cbs-win' : 'cbs-lose'}`}>
            {winStamp}
          </div>
          <div className="cbs-diff-badge">โหมด {getDifficulty(st.difficulty).label}</div>
          <p className="cbs-verdict-sub">
            {winSub}
            {result.won && result.bonus > 0 && (
              <><br />⚡ โบนัสความไว +{result.bonus} คะแนน (ตอบถูกเร็ว)</>
            )}
            {result.won && comboMultiplier(st) > 1 && (
              <><br />🔥 สตรีคสูงสุด ×{st.maxCombo} — ตัวคูณคะแนน ×{comboMultiplier(st).toFixed(2)}</>
            )}
            {result.isHiscore && <><br />🏆 New Hi-Score: {result.score}</>}
            {result.won && !IS_BLS && (
              <><br /><span style={{ opacity: 0.7 }}>🏅 ผลงานสะสมแสดงเป็นโบนัสบนใบประกาศ ACLS</span></>
            )}
          </p>
          {freshAwards.length > 0 && (
            <div className="cbs-award-reveal">
              <div className="cbs-award-reveal-head">🎖 ปลดล็อกรางวัลใหม่!</div>
              <div className="cbs-award-reveal-row">
                {freshAwards.map((a) => (
                  <div key={a.id} className="cbs-badge cbs-badge-new">
                    <span className="cbs-badge-icon">{a.icon}</span>
                    <span className="cbs-badge-title">{a.title}</span>
                  </div>
                ))}
              </div>
              {!IS_BLS && freshAwards.some((a) => a.id === 'megacode_all') && (
                <div className="cbs-cert-note" style={{ marginTop: 10 }}>
                  🏅 ตราทอง MEGACODE MASTER จะปรากฏบนใบประกาศ ACLS ของคุณ!
                </div>
              )}
            </div>
          )}
          <div className="cbs-grade-row">
            <div className="cbs-grade-box">
              <span className={`cbs-grade cbs-g-${result.grade.toLowerCase()}`}>{result.grade}</span>
              <span className="cbs-grade-label">GRADE</span>
            </div>
            <div className="cbs-metric-grid">
              <Metric label="ตัดสินใจถูก" value={String(correctCount(st))} tone="good" />
              <Metric label="ตัดสินใจพลาด" value={String(st.wrong)}
                tone={st.wrong === 0 ? 'good' : st.wrong <= 2 ? 'warn' : 'badv'} />
              {result.won && st.speedCount > 0 && (
                <Metric label="ความไวเฉลี่ย" value={`${Math.round(result.speed * 100)}%`}
                  tone={result.speed >= FAST_FRACTION ? 'good' : 'warn'} />
              )}
              {result.won && st.maxCombo >= 2 && (
                <Metric label="สตรีคสูงสุด" value={`×${st.maxCombo}`} tone="good" />
              )}
              {/* เมตริกเฉพาะเคส arrest — โชว์เฉพาะเมื่อเกิดจริง ไม่ขึ้น "—" ในเคสที่ไม่เกี่ยวข้อง */}
              {st.firstCPRAt >= 0 && (
                <Metric label="เริ่ม CPR ภายใน" value={fmtTime(st.firstCPRAt)}
                  tone={st.firstCPRAt <= 90 ? 'good' : 'warn'} />
              )}
              {st.firstShockAt >= 0 && (
                <Metric label="Shock แรกภายใน" value={fmtTime(st.firstShockAt)}
                  tone={st.firstShockAt <= 300 ? 'good' : 'warn'} />
              )}
              <Metric label="เวลาทั้งเคส" value={fmtTime(st.simTime)} tone="" />
            </div>
          </div>
          {arrest && st.etco2Trace.length > 1 && (
            <div className="cbs-etco2">
              <div className="cbs-tl-title">EtCO₂ — คุณภาพ CPR ตลอดเคส</div>
              <Etco2Sparkline trace={st.etco2Trace} />
              <div className="cbs-etco2-cap">ยิ่งสูง = เลือดไปเลี้ยงดีระหว่างกด · พุ่งเกิน 35 = สัญญาณ ROSC</div>
            </div>
          )}
          <div className="cbs-tl-title">TIMELINE การตัดสินใจของคุณ</div>
          <div className="cbs-timeline">
            {st.timeline.map((it, i) => (
              <div key={i} className={`cbs-tl-item ${it.ok ? 'cbs-ok' : 'cbs-err'}`}>
                <span className="cbs-tl-time">{fmtTime(it.t)}</span>
                <span className="cbs-tl-dot" />
                <span>
                  {it.text}
                  {it.note && <span className="cbs-tl-note">{it.note}</span>}
                </span>
              </div>
            ))}
          </div>
          <div className="cbs-debrief-actions">
            <button type="button" className="cbs-btn-main" onClick={startGame}>
              <RefreshCw size={16} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />
              เล่นเคสนี้อีกครั้ง
            </button>
            <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/sim-board')}>
              {!inClass
                ? '🏆 ดูอันดับรวมทั้งเว็บ'
                : isOpenLeague(getClassContext().classCode) ? '🏆 ดูอันดับลีกออนไลน์' : '🏆 ดูอันดับในคลาส'}
            </button>
            {pool.length > 1 && (
              <button type="button" className="cbs-btn-ghost" onClick={() => { setScreen('select'); window.scrollTo(0, 0); }}>
                ← เลือกเคสอื่น
              </button>
            )}
            <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/')}>
              กลับหน้าแรก
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ============ GAME ============
  const st = view;
  const char = speaker ? getCharacter(speaker.who) : null;
  const plateName = plate?.name || char?.name || ' ';
  const plateColors = plate ? null : char?.plate || null;
  const gameDiff = getDifficulty(st.difficulty);
  const maxHp = st.maxHp || gameDiff.hp;
  const timerPct = Math.max(0, (decisionLeft / gameDiff.decisionTime) * 100);
  // ก่อนทีมติดเครื่อง monitor/defib (fx.rhythm แรก) จอต้องว่าง — ห้ามโชว์ rhythm ใดๆ
  const monitorOn = st.monitorOn;
  const rhythmBad = monitorOn && ARREST_RHYTHMS.has(st.rhythm);
  const rhythmWarn = monitorOn && WARN_RHYTHMS.has(st.rhythm);

  return (
    <div className={`cbs-app ${shaking ? 'cbs-shake' : ''}`}>
      <section className="cbs-game">
        <div className={`cbs-stage ${drama === 'red' ? 'cbs-drama-red' : drama === 'white' ? 'cbs-drama' : ''}`}>
          <div className="cbs-hud">
            <div className="cbs-hud-monitor">
              <span className={`cbs-rhythm-name ${rhythmBad ? 'cbs-bad' : rhythmWarn ? 'cbs-warn' : !monitorOn ? 'cbs-dim' : ''}`}>
                {monitorOn ? rhythmLabel(st) : 'ยังไม่ติดเครื่อง monitor'}
              </span>
              <EcgStrip rhythm={st.rhythm} cpr={st.cpr} on={monitorOn} />
            </div>
            <div className="cbs-hud-right">
              <div className="cbs-gauge">
                <span className="cbs-gauge-label">PATIENT</span>
                <div className="cbs-gauge-cells">
                  {Array.from({ length: maxHp }).map((_, i) => (
                    <span
                      key={i}
                      className={`cbs-cell ${i >= st.hp ? 'cbs-off' : (st.hp === 1 && i === 0 ? 'cbs-last' : '')}`}
                    />
                  ))}
                </div>
              </div>
              <div className="cbs-timechip">{fmtTime(st.simTime)}</div>
            </div>
          </div>

          {/* คอมโบสด — ยิ่งสตรีคยาว ป้ายยิ่งใหญ่/ร้อน (juice), รีปั๊มทุกครั้งที่เพิ่ม */}
          {st.combo >= 2 && (
            <div className={`cbs-combo cbs-combo-t${Math.min(st.combo, 6)}`} key={`combo-${st.combo}`}>
              <span className="cbs-combo-label">COMBO</span>
              <span className="cbs-combo-n">×{st.combo}</span>
            </div>
          )}
          {comboBreak && (
            <div className="cbs-combo-break" key={`brk-${comboBreak.k}`}>
              COMBO ×{comboBreak.n} BREAK!
            </div>
          )}

          {/* ปุ่มเมนูระหว่างเล่น — ซ่อนตอนกำลังเลือก (choices overlay) กันกดพลาด */}
          {!choice && (
            <button
              type="button"
              className="cbs-menu-btn"
              onClick={() => setQuitMenu(true)}
              aria-label="เมนู"
            >
              ☰
            </button>
          )}

          {speaker && (
            <div className={`cbs-sprite ${reducedMotion ? '' : 'cbs-pop'}`} key={`sp-${speaker.popN}-${charsReady}`}>
              <CharacterSprite charId={speaker.who} pose={speaker.pose} talking={typing} />
            </div>
          )}

          {choice && (
            <div className="cbs-choices">
              <div className="cbs-qbanner">⚖ {choice.q}</div>
              {choice.hintTgt && (
                <div className="cbs-hint">💡 ลองสั่งหมวด <b>{choice.hintTgt}</b> ดูสิ</div>
              )}
              {choice.options.map((o, i) => {
                const dim = choice.hintTgt && o.tgt !== choice.hintTgt;
                const glow = choice.hintTgt && o.tgt === choice.hintTgt;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`cbs-choice ${dim ? 'cbs-choice-dim' : ''} ${glow ? 'cbs-choice-hint' : ''}`}
                    onClick={() => pick(o)}
                  >
                    <span className="cbs-choice-tgt">▸ สั่ง {o.tgt}</span>
                    {o.label}
                  </button>
                );
              })}
              <div className="cbs-choice-timer">
                <div
                  className={`cbs-choice-timer-fill ${timerPct < 30 ? 'cbs-low' : ''}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="cbs-dlg-area">
          {/* กล่องบทพูดแบบ AA: แตะเพื่อข้าม/ไปต่อ */}
          <div
            className="cbs-dlg"
            onClick={onDialogTap}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDialogTap(); }
            }}
          >
            <div
              className="cbs-nameplate"
              style={plateColors ? { background: `linear-gradient(180deg, ${plateColors[0]}, ${plateColors[1]})` } : undefined}
            >
              {plateName}
            </div>
            {/* บทพูดมาจาก scenario data ในโค้ดเรา (จำกัด <span class="cbs-em"> เท่านั้น) */}
            <div className="cbs-dlg-text" dangerouslySetInnerHTML={{ __html: dlgHtml }} />
            {!typing && awaitTap && <div className="cbs-adv">▼</div>}
          </div>
        </div>
      </section>

      {quitMenu && (
        <div className="cbs-quit" role="dialog" aria-label="เมนูระหว่างเล่น">
          <div className="cbs-quit-card">
            <div className="cbs-quit-title">หยุดพักเคสนี้</div>
            <button type="button" className="cbs-btn-main cbs-quit-resume" onClick={() => setQuitMenu(false)}>
              เล่นต่อ
            </button>
            <button type="button" className="cbs-btn-ghost" onClick={startGame}>
              <RefreshCw size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              เริ่มเคสนี้ใหม่
            </button>
            <button type="button" className="cbs-btn-ghost" onClick={toggleMute}>
              {muted
                ? <><VolumeX size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />เปิดเสียง</>
                : <><Volume2 size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />ปิดเสียง</>}
            </button>
            {inClass && !activeStudent?.id && (
              <button
                type="button"
                className="cbs-btn-ghost"
                onClick={() => { setQuitMenu(false); setShowIdentity(true); }}
              >
                👤 กรอกชื่อ+รหัสนักเรียน — ให้ผลบันทึกถึงอาจารย์
              </button>
            )}
            <button type="button" className="cbs-btn-ghost" onClick={backToSelect}>
              {pool.length > 1 ? 'ออกไปเลือกเคสอื่น' : 'ออกไปหน้าแรก'}
            </button>
            <div className="cbs-quit-note">ออกกลางเคส = เคสนี้ไม่ถูกบันทึกผล</div>
          </div>
        </div>
      )}

      {inter && (
        <div className="cbs-inter">
          <div className="cbs-inter-burst" />
          <div className={`cbs-inter-bubble ${inter.green ? 'cbs-green-bubble' : ''}`}>
            <span className="cbs-inter-text">{inter.text}</span>
          </div>
        </div>
      )}
      {flashN > 0 && <div key={`fl-${flashN}`} className="cbs-flash cbs-go" />}
      {redN > 0 && <div key={`rf-${redN}`} className="cbs-redflash cbs-go" />}
      {/* ลงทะเบียนกลางเกมได้จากเมนู ☰ — เคสที่จบหลังจากนี้จะถูกบันทึกถึงอาจารย์ */}
      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => { setShowIdentity(false); refreshLocalProgress(); }}
      />
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="cbs-metric">
      <span className="cbs-metric-label">{label}</span>
      <span className={`cbs-metric-val ${tone ? `cbs-${tone}` : ''}`}>{value}</span>
    </div>
  );
}

// กราฟ EtCO2 แบบ area sparkline — เน้นจุดปลาย (ROSC) และเส้นเป้า 35
function Etco2Sparkline({ trace }) {
  const W = 300;
  const H = 60;
  const maxV = 45;
  const tMax = trace[trace.length - 1].t || 1;
  const x = (t) => (t / tMax) * W;
  const y = (v) => H - (Math.min(v, maxV) / maxV) * (H - 6) - 3;
  const pts = trace.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`);
  const line = `M ${pts.join(' L ')}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  const last = trace[trace.length - 1];
  const targetY = y(35);
  return (
    <svg className="cbs-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="กราฟ EtCO2">
      <line x1="0" y1={targetY} x2={W} y2={targetY} className="cbs-spark-target" strokeDasharray="4 4" />
      <path d={area} className="cbs-spark-area" />
      <path d={line} className="cbs-spark-line" />
      <circle cx={x(last.t)} cy={y(last.v)} r="3.5" className="cbs-spark-dot" />
    </svg>
  );
}
