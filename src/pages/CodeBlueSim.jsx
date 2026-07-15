import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Volume2, VolumeX } from 'lucide-react';
import { scenarios as builtInScenarios, LEVEL_META, loadPlayableScenarios } from '../data/codeBlueScenarios';
import { getCharacter, registerCustomCharacters } from '../game/characters';
import { fetchCustomCharacters } from '../services/codeBlueCharacterService';
import { usePreCourseStore } from '../stores/preCourseStore';
import { rpcSubmitCodeBlueResult } from '../services/cohortSync';
import CharacterSprite from '../game/CharacterSprite';
import EcgStrip from '../game/EcgStrip';
import {
  createInitialState, applyFx, nextNode, recordCorrect, recordWrong,
  gradeFor, fmtTime, shuffled, getDifficulty, pushEtco2, wasArrest, correctCount,
  DIFFICULTY, DEFAULT_DIFFICULTY,
} from '../game/storyEngine';
import {
  initAudio, playShockSound, playROSCSound, playWarningBeep,
  playMetronomeClick, playBeep,
} from '../utils/sound';
import { track } from '../services/analytics';
import {
  recordGrade, syncAwards, listWithEarned, readGrades, ACHIEVEMENTS,
} from '../game/achievements';
import './codeBlueSim.css';

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
  vf: 'V-FIB ⚠',
  nsr: 'SINUS — ROSC',
  brady: 'BRADYCARDIA ⚠',
  pacing: 'PACED RHYTHM — CAPTURED',
  tachy: 'UNSTABLE TACHY ⚠',
};
// rhythm ที่ "มีชีพจรแต่ไม่เสถียร" — เตือนสีทอง ไม่ blink (ต่างจาก shockable/arrest ที่ blink แดง)
const WARN_RHYTHMS = new Set(['brady', 'pacing', 'tachy']);

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

// จำนวนเคส basic ที่ต้องผ่านก่อนปลดล็อกเคส tier ที่สูงกว่า (megacode)
const BASIC_TO_UNLOCK = 3;

const isBasic = (s) => (LEVEL_META[s.level]?.order || 0) === 0;

// จำนวนเคส basic (ในคลังปัจจุบัน) ที่ผู้เล่นผ่านแล้ว
function clearedBasicCount(cleared, pool) {
  return pool.filter((s) => isBasic(s) && cleared.has(s.id)).length;
}

// ปลดล็อกเคส: basic เล่นได้เสมอ; tier ที่สูงกว่าต้องผ่าน basic ครบเกณฑ์ก่อน (ค่อยๆ ไต่ระดับ)
function isUnlocked(sc, cleared, pool) {
  if (isBasic(sc)) return true;
  return clearedBasicCount(cleared, pool) >= BASIC_TO_UNLOCK;
}

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
  const [result, setResult] = useState(null); // { won, grade, score, isHiscore }
  const [hiscore, setHiscore] = useState(() => Number(localStorage.getItem(hiscoreKey(difficulty)) || 0));

  const timers = useRef({ type: null, dec: null, misc: [], metronome: null });
  const busyRef = useRef(false);
  const [awaitTap, setAwaitTap] = useState(false);
  const currentChoiceRef = useRef(null);
  const retryChoiceRef = useRef(null);
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
    const score = won ? Math.max(10, 100 - st.wrong * 15) : 0;
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
      const grades = recordGrade(sc.id, grade, st.difficulty);
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
    setResult({ won, grade, score, isHiscore });
    setChoice(null);
    setInter(null);
    setScreen('debrief');
    window.scrollTo(0, 0);
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
    setDecisionLeft(diff.decisionTime);
    if (timers.current.dec) clearInterval(timers.current.dec);
    let left = diff.decisionTime;
    timers.current.dec = setInterval(() => {
      left -= 0.25;
      setDecisionLeft(left);
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
      const { who, pose, text, fx } = node.say;
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
      recordCorrect(st, option);
      currentChoiceRef.current = null;
      hintUsedRef.current = false; // จุดถัดไปเริ่มใหม่ ไม่ใบ้
      syncView();
      advance();
      return;
    }

    recordWrong(st, option);
    pushEtco2(st);
    hintUsedRef.current = true; // จุดนี้เคยพลาด — โหมดง่ายจะใบ้ตอนเล่นซ้ำ
    vibrate([60, 40, 60]);
    sfx(() => playBeep(160, 0.28, 0.35)); // เสียงผิดต่ำ
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
    if (timers.current.type) { finishTyping(); return; }
    if (!awaitTap) return;
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
      if (next) stopMetronome();
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
          <div className="cbs-eyebrow">Code Blue · รางวัลของฉัน</div>
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
    // จัดกลุ่มตาม level (เรียงตาม order) เพื่อไม่ให้ 20+ เคสเป็น list ยาวเส้นเดียว
    const levelsInPool = [...new Set(pool.map((c) => c.level))]
      .sort((a, b) => (LEVEL_META[a]?.order || 0) - (LEVEL_META[b]?.order || 0));
    const shownLevels = selectFilter === 'all' ? levelsInPool : levelsInPool.filter((l) => l === selectFilter);
    const basicNeeded = Math.max(0, BASIC_TO_UNLOCK - clearedBasicCount(cleared, pool));

    const renderCase = (c) => {
      const unlocked = isUnlocked(c, cleared, pool);
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
            {!unlocked && <span className="cbs-case-lock">🔒 ผ่านพื้นฐานอีก {basicNeeded} เคส</span>}
          </div>
          <div className="cbs-case-name">{c.title}</div>
          <div className="cbs-case-desc">{c.subtitle}</div>
        </button>
      );
    };

    return (
      <div className="cbs-app">
        <section className="cbs-select">
          <div className="cbs-eyebrow">Code Blue · เลือกเคส</div>
          <h1 className="cbs-select-title"><span className="cbs-gold-text">CODE BLUE</span> ภารกิจกู้ชีพ</h1>
          <p className="cbs-select-sub">เลือกสถานการณ์ที่จะฝึก — เคสที่ยากกว่าปลดล็อกเมื่อผ่านเคสพื้นฐาน</p>
          {levelsInPool.length > 1 && (
            <div className="cbs-select-tabs" role="group" aria-label="กรองตามระดับ">
              <button
                type="button"
                className={`cbs-tab ${selectFilter === 'all' ? 'cbs-tab-on' : ''}`}
                onClick={() => setSelectFilter('all')}
                aria-pressed={selectFilter === 'all'}
              >
                ทั้งหมด
              </button>
              {levelsInPool.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  className={`cbs-tab ${selectFilter === lv ? 'cbs-tab-on' : ''}`}
                  onClick={() => setSelectFilter(lv)}
                  aria-pressed={selectFilter === lv}
                >
                  {LEVEL_META[lv]?.label || lv}
                </button>
              ))}
            </div>
          )}
          <div className="cbs-case-groups">
            {shownLevels.map((lv) => {
              const cases = pool.filter((c) => c.level === lv);
              const doneCount = cases.filter((c) => cleared.has(c.id)).length;
              return (
                <div key={lv} className="cbs-case-group">
                  <div className="cbs-group-head">
                    <span className={`cbs-case-level cbs-lvl-${lv}`}>{LEVEL_META[lv]?.label || lv}</span>
                    <span className="cbs-group-prog">ผ่าน {doneCount}/{cases.length}</span>
                  </div>
                  <div className="cbs-case-list">
                    {cases.map(renderCase)}
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" className="cbs-btn-ghost" onClick={() => { void awardsTick; setScreen('awards'); window.scrollTo(0, 0); }}>
            🏅 รางวัลของฉัน ({listWithEarned(pool, cleared, readGrades()).filter((b) => b.earned).length}/{ACHIEVEMENTS.length})
          </button>
          <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/')}>
            <Home size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            กลับหน้าแรก
          </button>
        </section>
      </div>
    );
  }

  // ============ TITLE ============
  if (screen === 'title') {
    return (
      <div className="cbs-app">
        <section className="cbs-title">
          <div className="cbs-eyebrow">Code Blue · {LEVEL_META[sc.level]?.label || 'เคส'}</div>
          <h1><span className="cbs-gold-text">{sc.title}</span></h1>
          <p className="cbs-title-sub">
            {sc.subtitle}<br />
            คุณคือ <b>Team Leader</b> — ทีมทั้งห้องรอฟังคำสั่งของคุณ<br />
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
          <button type="button" className="cbs-btn-main" onClick={startGame}>
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
            {result.isHiscore && <><br />🏆 New Hi-Score: {result.score}</>}
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
  const rhythmBad = st.rhythm === 'vf' || st.rhythm === 'flat';
  const rhythmWarn = WARN_RHYTHMS.has(st.rhythm);

  return (
    <div className={`cbs-app ${shaking ? 'cbs-shake' : ''}`}>
      <section className="cbs-game">
        <div className={`cbs-stage ${drama === 'red' ? 'cbs-drama-red' : drama === 'white' ? 'cbs-drama' : ''}`}>
          <div className="cbs-hud">
            <div className="cbs-hud-monitor">
              <span className={`cbs-rhythm-name ${rhythmBad ? 'cbs-bad' : rhythmWarn ? 'cbs-warn' : ''}`}>
                {st.alarm || st.rhythm !== 'flat' ? RHYTHM_NAMES[st.rhythm] : 'MONITOR — STANDBY'}
              </span>
              <EcgStrip rhythm={st.rhythm} cpr={st.cpr} />
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
