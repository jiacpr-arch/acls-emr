import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { scenario } from '../data/codeBlueScenarios';
import { getCharacter } from '../game/characters';
import CharacterSprite from '../game/CharacterSprite';
import EcgStrip from '../game/EcgStrip';
import {
  createInitialState, applyFx, nextNode, recordCorrect, recordWrong,
  gradeFor, fmtTime, shuffled, DECISION_TIME, MAX_HP,
} from '../game/storyEngine';
import { track } from '../services/analytics';
import './codeBlueSim.css';

const HISCORE_KEY = 'acls_codeblue_hiscore';

// สำเนาสถานะ engine สำหรับ render (render ห้ามอ่าน ref ตรงๆ)
function snapshot(st) {
  return { ...st, timeline: [...st.timeline] };
}

const RHYTHM_NAMES = {
  flat: 'ASYSTOLE',
  vf: 'V-FIB ⚠',
  nsr: 'SINUS — ROSC',
};

export default function CodeBlueSim() {
  const navigate = useNavigate();
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // ---- engine state: mutable ใน ref (logic) + snapshot state (render) ----
  const S = useRef(createInitialState());
  const [view, setView] = useState(() => snapshot(createInitialState()));

  const [screen, setScreen] = useState('title'); // title | game | debrief
  const [speaker, setSpeaker] = useState(null); // { who, pose, popN }
  const [plate, setPlate] = useState(null); // { name } override (time-skip)
  const [dlgHtml, setDlgHtml] = useState('');
  const [typing, setTyping] = useState(false);
  const [choice, setChoice] = useState(null); // { q, options }
  const [decisionLeft, setDecisionLeft] = useState(DECISION_TIME);
  const [drama, setDrama] = useState(null); // null | 'red' | 'white'
  const [inter, setInter] = useState(null); // { text, green }
  const [flashN, setFlashN] = useState(0);
  const [redN, setRedN] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState(null); // { won, grade, score, isHiscore }
  const [hiscore, setHiscore] = useState(() => Number(localStorage.getItem(HISCORE_KEY) || 0));

  const timers = useRef({ type: null, dec: null, misc: [] });
  const busyRef = useRef(false);
  const [awaitTap, setAwaitTap] = useState(false);
  const currentChoiceRef = useRef(null);
  const retryChoiceRef = useRef(null);
  const typeDoneRef = useRef(null);
  const fullHtmlRef = useRef('');
  const popCounter = useRef(0);

  const clearAllTimers = useCallback(() => {
    const t = timers.current;
    if (t.type) clearTimeout(t.type);
    if (t.dec) clearInterval(t.dec);
    t.misc.forEach(clearTimeout);
    t.type = null; t.dec = null; t.misc = [];
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
    let isHiscore = false;
    if (score > Number(localStorage.getItem(HISCORE_KEY) || 0)) {
      localStorage.setItem(HISCORE_KEY, String(score));
      setHiscore(score);
      isHiscore = score > 0;
    }
    track('game_completed', {
      props: {
        scenario_id: scenario.id,
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
    setChoice({ q: c.q, options: shuffled(c.options) });
    setDecisionLeft(DECISION_TIME);
    if (timers.current.dec) clearInterval(timers.current.dec);
    let left = DECISION_TIME;
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
      applyFx(st, fx);
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
      applyFx(st, node.fx);
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
    const node = nextNode(S.current, scenario.story);
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
      syncView();
      advance();
      return;
    }

    recordWrong(st, option);
    vibrate([60, 40, 60]);
    if (!reducedMotion) {
      setRedN((n) => n + 1);
      doShake();
    }
    syncView();

    popCounter.current += 1;
    setSpeaker({ who: 'att_dech', pose: 'stern', popN: popCounter.current });
    setPlate(null);
    setDrama('red');

    if (st.hp <= 0) {
      setAwaitTap(false);
      typeText(`<span class="cbs-em">ผู้ป่วยไปแล้ว…</span> ${option.why}`, () => {
        later(() => endCase(false), reducedMotion ? 400 : 1400);
      });
      return;
    }

    // ดุแล้วให้ตัดสินใจข้อเดิมซ้ำ (สภาพแย่ลงแล้ว)
    retryChoiceRef.current = currentChoiceRef.current;
    setAwaitTap(true);
    typeText(
      `<span class="cbs-em">ช้าก่อน!</span> ${option.why}${option.worsen ? ' — ผู้ป่วยแย่ลง สีผิวคล้ำขึ้น!' : ''}`,
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
    S.current = createInitialState();
    syncView();
    busyRef.current = false;
    setAwaitTap(false);
    currentChoiceRef.current = null;
    retryChoiceRef.current = null;
    setResult(null);
    setChoice(null);
    setInter(null);
    setDrama(null);
    setSpeaker(null);
    setPlate(null);
    setDlgHtml('');
    setScreen('game');
    track('game_started', { props: { scenario_id: scenario.id } });
    later(() => advance(), reducedMotion ? 100 : 400);
  }

  // ============ TITLE ============
  if (screen === 'title') {
    return (
      <div className="cbs-app">
        <section className="cbs-title">
          <div className="cbs-eyebrow">Code Blue · ER Night Shift</div>
          <h1>หมอเฮีย<br /><span className="cbs-gold-text">CODE BLUE</span><br />ภารกิจกู้ชีพ</h1>
          <p className="cbs-title-sub">
            {scenario.subtitle}<br />
            คุณคือ <b>Team Leader</b> — ทีมทั้งห้องรอฟังคำสั่งของคุณ<br />
            ตัดสินใจผิด ผู้ป่วยแย่ลงจริง เวลาไม่เคยรอใคร
          </p>
          {hiscore > 0 && <div className="cbs-hiscore-chip">HI-SCORE {hiscore}</div>}
          <button type="button" className="cbs-btn-main" onClick={startGame}>
            <AlertTriangle size={18} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 8 }} />
            รับเคส
          </button>
          <button type="button" className="cbs-btn-ghost" onClick={() => navigate('/')}>
            <Home size={15} strokeWidth={2.4} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            กลับหน้าแรก
          </button>
          <div className="cbs-note">DECISION GAME · ACLS TRAINING · MORROO</div>
        </section>
      </div>
    );
  }

  // ============ DEBRIEF ============
  if (screen === 'debrief' && result) {
    const st = view;
    return (
      <div className="cbs-app">
        <section className={`cbs-debrief ${result.won ? 'cbs-winbg' : 'cbs-losebg'}`}>
          <div className={`cbs-stamp ${result.won ? 'cbs-win' : 'cbs-lose'}`}>
            {result.won ? 'ROSC!' : 'CODE ENDED'}
          </div>
          <p className="cbs-verdict-sub">
            {result.won
              ? 'ผู้ป่วยกลับมามีชีพจร — ส่งต่อ Cath lab เคสนี้เป็นของคุณ'
              : 'ผู้ป่วยเสียชีวิต — อ่าน debrief ด้านล่าง แล้วกลับมาแก้มือ'}
            {result.isHiscore && <><br />🏆 New Hi-Score: {result.score}</>}
          </p>
          <div className="cbs-grade-row">
            <div className="cbs-grade-box">
              <span className={`cbs-grade cbs-g-${result.grade.toLowerCase()}`}>{result.grade}</span>
              <span className="cbs-grade-label">GRADE</span>
            </div>
            <div className="cbs-metric-grid">
              <Metric label="เริ่ม CPR ภายใน" value={st.firstCPRAt >= 0 ? fmtTime(st.firstCPRAt) : '—'}
                tone={st.firstCPRAt >= 0 && st.firstCPRAt <= 90 ? 'good' : 'warn'} />
              <Metric label="Shock แรกภายใน" value={st.firstShockAt >= 0 ? fmtTime(st.firstShockAt) : '—'}
                tone={st.firstShockAt >= 0 && st.firstShockAt <= 300 ? 'good' : 'warn'} />
              <Metric label="ตัดสินใจพลาด" value={String(st.wrong)}
                tone={st.wrong === 0 ? 'good' : st.wrong <= 2 ? 'warn' : 'badv'} />
              <Metric label="เวลาทั้งเคส" value={fmtTime(st.simTime)} tone="" />
            </div>
          </div>
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
  const timerPct = Math.max(0, (decisionLeft / DECISION_TIME) * 100);
  const rhythmBad = st.rhythm === 'vf' || st.rhythm === 'flat';

  return (
    <div className={`cbs-app ${shaking ? 'cbs-shake' : ''}`}>
      <section className="cbs-game">
        <div className={`cbs-stage ${drama === 'red' ? 'cbs-drama-red' : drama === 'white' ? 'cbs-drama' : ''}`}>
          <div className="cbs-hud">
            <div className="cbs-hud-monitor">
              <span className={`cbs-rhythm-name ${rhythmBad ? 'cbs-bad' : ''}`}>
                {st.alarm || st.rhythm !== 'flat' ? RHYTHM_NAMES[st.rhythm] : 'MONITOR — STANDBY'}
              </span>
              <EcgStrip rhythm={st.rhythm} cpr={st.cpr} />
            </div>
            <div className="cbs-hud-right">
              <div className="cbs-gauge">
                <span className="cbs-gauge-label">PATIENT</span>
                <div className="cbs-gauge-cells">
                  {Array.from({ length: MAX_HP }).map((_, i) => (
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

          {speaker && (
            <div className={`cbs-sprite ${reducedMotion ? '' : 'cbs-pop'}`} key={`sp-${speaker.popN}`}>
              <CharacterSprite charId={speaker.who} pose={speaker.pose} talking={typing} />
            </div>
          )}

          {choice && (
            <div className="cbs-choices">
              <div className="cbs-qbanner">⚖ {choice.q}</div>
              {choice.options.map((o, i) => (
                <button key={i} type="button" className="cbs-choice" onClick={() => pick(o)}>
                  <span className="cbs-choice-tgt">▸ สั่ง {o.tgt}</span>
                  {o.label}
                </button>
              ))}
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
