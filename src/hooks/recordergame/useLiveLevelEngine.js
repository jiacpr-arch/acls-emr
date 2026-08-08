import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useGameClock } from './useGameClock';
import {
  RATINGS, ratingForDelay, pointsForRating, isDataCorrect, RATING_META,
} from '../../utils/recorderGameScore';
import { ERROR_TYPES, getLiveMaxScore } from '../../data/activeRecorderLevels';

// ==========================================
// Recorder Hero — สมองของโหมด Live Recorder (Mode A)
// - เดินเหตุการณ์ตามเวลา (clock.onTick)
// - derive scene / narration / pendingEvent สำหรับ render
// - handlePress ตัดเกรด Perfect/Good/Late/Miss + combo + penalty
// - แยกขาดจาก caseStore/timerStore/Dexie ทั้งหมด
// ==========================================
const NARRATION_LEAD = 3; // โชว์ narration ก่อนถึงเวลา event 3 วิ
const END_BUFFER = 2;     // เผื่อเวลาปิดเกมหลัง event สุดท้าย

export function useLiveLevelEngine(level, { onFinish } = {}) {
  const events = useMemo(() => level?.events || [], [level]);
  const maxScore = useMemo(() => getLiveMaxScore(level), [level]);

  // resolvedRef = แหล่งข้อมูลจริง (อ่าน/เขียนใน callback) ; resolved = state ไว้ render
  const resolvedRef = useRef(new Set());
  const [resolved, setResolved] = useState(() => new Set());
  const resultsRef = useRef([]);   // { index, buttonId, expected, rating, errorType, points }
  const playerLogRef = useRef([]); // { t, buttonId, data, rating }
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // ---- render state ----
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [popup, setPopup] = useState(null); // { rating, text, id }
  const popupIdRef = useRef(0);

  const syncResolved = () => setResolved(new Set(resolvedRef.current));

  const bumpScore = useCallback((delta) => {
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
  }, []);

  const resetStreak = useCallback(() => {
    streakRef.current = 0;
    setStreak(0);
  }, []);

  const incStreak = useCallback(() => {
    streakRef.current += 1;
    setStreak(streakRef.current);
    if (streakRef.current > bestStreakRef.current) {
      bestStreakRef.current = streakRef.current;
      setBestStreak(bestStreakRef.current);
    }
  }, []);

  const flashPopup = useCallback((rating, text) => {
    const id = ++popupIdRef.current;
    setPopup({ rating, text, id });
    setTimeout(() => {
      setPopup(p => (p && p.id === id ? null : p));
    }, 1400);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    // เติม event ที่ยังไม่มีผลเป็น MISS
    const done = new Set(resultsRef.current.map(r => r.index));
    events.forEach((e, i) => {
      if (!done.has(i)) {
        resultsRef.current.push({
          index: i, buttonId: null, expected: e.expect.buttonId,
          rating: RATINGS.MISS, errorType: ERROR_TYPES.MISSED, points: 0,
          narration_th: e.narration_th, missFeedback_th: e.missFeedback_th,
        });
      }
    });
    const missCount = resultsRef.current.filter(r => r.rating === RATINGS.MISS).length;
    onFinishRef.current?.({
      levelId: level.id,
      score: scoreRef.current,
      maxScore,
      bestStreak: bestStreakRef.current,
      results: resultsRef.current.slice().sort((a, b) => a.index - b.index),
      playerLog: playerLogRef.current.slice(),
      missCount,
    });
  }, [events, level, maxScore]);

  // ---- tick: ตรวจ MISS ตามเวลา + ปิดเกม (ทำงานใน callback ของ clock) ----
  const handleTick = useCallback((elapsed) => {
    if (finishedRef.current) return;
    let changed = false;
    let lastMiss = null;
    events.forEach((e, i) => {
      if (resolvedRef.current.has(i)) return;
      if (elapsed > e.t + (e.window?.late ?? 11)) {
        resolvedRef.current.add(i);
        resultsRef.current.push({
          index: i, buttonId: null, expected: e.expect.buttonId,
          rating: RATINGS.MISS, errorType: ERROR_TYPES.MISSED, points: 0,
          narration_th: e.narration_th, missFeedback_th: e.missFeedback_th,
        });
        lastMiss = e;
        changed = true;
      }
    });
    if (changed) {
      resetStreak();
      flashPopup(RATINGS.MISS, lastMiss?.missFeedback_th || 'พลาด!');
      syncResolved();
    }
    const lastT = events.length ? events[events.length - 1].t : 0;
    const lastLate = events.length ? (events[events.length - 1].window?.late ?? 11) : 0;
    if (resolvedRef.current.size >= events.length || elapsed > lastT + lastLate + END_BUFFER) {
      clock.stop();
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, flashPopup, finish, resetStreak]);

  const clock = useGameClock(handleTick);
  const { elapsed } = clock;

  // ---- derived (render): scene ปัจจุบัน ----
  let currentScene = { ...(level?.initialScene || {}) };
  events.forEach(e => {
    if (elapsed >= e.t && e.scene) currentScene = { ...currentScene, ...e.scene };
  });

  // ---- derived (render): pendingEvent ----
  const pendingIndex = events.findIndex((e, i) =>
    !resolved.has(i) && elapsed >= e.t - NARRATION_LEAD
  );
  const pendingEvent = pendingIndex >= 0 ? events[pendingIndex] : null;
  const narration = pendingEvent ? pendingEvent.narration_th : null;

  // ---- handlePress ----
  const handlePress = useCallback((buttonId, data) => {
    if (finishedRef.current) return;
    const now = clock.elapsed;
    const idx = events.findIndex((e, i) =>
      !resolvedRef.current.has(i) && now >= e.t - NARRATION_LEAD
    );
    playerLogRef.current.push({ t: now, buttonId, data });

    if (idx < 0) {
      // ไม่มีเหตุการณ์ให้บันทึก → กดเกิน (wrong press)
      const pen = level.wrongPressPenalty || 15;
      bumpScore(-pen);
      resetStreak();
      flashPopup(RATINGS.MISS, `กดเกินจังหวะ −${pen}`);
      return;
    }

    const e = events[idx];
    const dt = now - e.t;
    resolvedRef.current.add(idx);

    // ผิดปุ่ม / ผิดลำดับ
    if (buttonId !== e.expect.buttonId) {
      bumpScore(-(level.wrongPressPenalty || 15));
      resetStreak();
      resultsRef.current.push({
        index: idx, buttonId, expected: e.expect.buttonId,
        rating: RATINGS.MISS, errorType: ERROR_TYPES.WRONG_BUTTON, points: 0,
        narration_th: e.narration_th,
      });
      flashPopup(RATINGS.MISS, 'ผิดปุ่ม / ผิดลำดับ!');
      syncResolved();
      return;
    }

    // ถูกปุ่มแต่ข้อมูลผิด (dose/energy/rhythm)
    if (!isDataCorrect(e.expect.data, data)) {
      bumpScore(-Math.round((level.wrongPressPenalty || 15) / 2));
      resetStreak();
      resultsRef.current.push({
        index: idx, buttonId, expected: e.expect.buttonId, data,
        rating: RATINGS.MISS, errorType: ERROR_TYPES.WRONG_DATA, points: 0,
        narration_th: e.narration_th, wrongDataFeedback_th: e.wrongDataFeedback_th,
      });
      flashPopup(RATINGS.MISS, e.wrongDataFeedback_th || 'ข้อมูลผิด!');
      syncResolved();
      return;
    }

    // ถูกทุกอย่าง → ตัดเกรดตามเวลา
    const rating = ratingForDelay(dt, e.window);
    const gained = pointsForRating(rating, e.points || 100, streakRef.current);
    bumpScore(gained);
    if (rating !== RATINGS.MISS) incStreak();
    else resetStreak();
    resultsRef.current.push({
      index: idx, buttonId, expected: e.expect.buttonId, data,
      rating, errorType: rating === RATINGS.LATE ? ERROR_TYPES.MISSED : null,
      points: gained, narration_th: e.narration_th, dt,
    });
    playerLogRef.current[playerLogRef.current.length - 1].rating = rating;
    const label = RATING_META[rating]?.label_th || '';
    flashPopup(rating, `${label} +${gained}`);
    syncResolved();
  }, [clock, events, level, flashPopup, bumpScore, resetStreak, incStreak]);

  const start = useCallback(() => {
    resolvedRef.current = new Set();
    resultsRef.current = [];
    playerLogRef.current = [];
    streakRef.current = 0;
    bestStreakRef.current = 0;
    scoreRef.current = 0;
    finishedRef.current = false;
    setResolved(new Set());
    setScore(0); setStreak(0); setBestStreak(0); setPopup(null);
    clock.start();
  }, [clock]);

  return {
    elapsed, score, streak, bestStreak, popup,
    currentScene, narration, pendingEvent,
    expectedButtonId: pendingEvent?.expect?.buttonId || null,
    handlePress, start, maxScore,
    pause: clock.pause, resume: clock.resume,
  };
}
