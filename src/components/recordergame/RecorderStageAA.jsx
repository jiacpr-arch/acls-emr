import { useState, useEffect, useMemo } from 'react';
import CharacterSprite from '../../game/CharacterSprite';
import EcgStrip from '../../game/EcgStrip';
import { CHARACTERS } from '../../game/characters';
import { useTypewriter } from '../../hooks/recordergame/useTypewriter';
import { RATINGS } from '../../utils/recorderGameScore';
import './recorderAA.css';

// ==========================================
// Recorder Hero — โหมด Live สไตล์ Ace Attorney
// รับ output จาก useLiveLevelEngine (ไม่มี logic เกม/ไม่มี store)
// - นาฬิกาเดินต่อเนื่อง (elapsed) — ไม่ข้ามเวลา
// - ปุ่มบันทึกโชว์ตลอด (persistent) — กดได้ทุกวินาที
// ==========================================
const RHYTHM_LABEL = {
  flat: 'ASYSTOLE', vf: 'V-FIB ⚠', pvt: 'pVT ⚠', vt: 'VT ⚠', torsades: 'TdP ⚠',
  pea: 'PEA', asystole: 'ASYSTOLE', nsr: 'SINUS', svt: 'SVT', sinus_brady: 'BRADY',
  afib: 'AF', stemi: 'STEMI', rosc: 'ROSC',
};
function ecgRhythm(r) {
  if (!r) return 'flat';
  if (['vf', 'pvt', 'vt', 'vt_pulse', 'torsades'].includes(r)) return 'vf';
  if (['asystole', 'flat'].includes(r)) return 'flat';
  return 'nsr';
}
// เดาผู้พูดจากปุ่มที่คาดหวัง ถ้า event ไม่ได้ระบุ speaker เอง
function autoSpeaker(buttonId) {
  if (buttonId === 'shock' || buttonId === 'check_rhythm' || buttonId === 'cardiovert') return 'fon_defib';
  if (buttonId === 'drug' || buttonId === 'drug_choice') return 'nurse_mint';
  if (buttonId === 'airway') return 'boy_compressor';
  return 'att_dech';
}
function fmtClock(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
const GAUGE_CELLS = 5;

export default function RecorderStageAA({
  scene = {}, narration, pendingEvent, expectedButtonId, popup,
  elapsed = 0, score = 0, streak = 0,
  buttons = [], onPress, showHint = false,
  hudLabel, coachText,
}) {
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const rosc = scene.consciousness === 'rosc';
  const rhythm = scene.rhythm || 'flat';
  const critical = ['vf', 'pvt', 'vt', 'torsades', 'flat', 'asystole', 'pea'].includes(rhythm) && !rosc;

  const speaker = pendingEvent?.speaker || autoSpeaker(pendingEvent?.expect?.buttonId);
  const pose = pendingEvent?.pose || (rosc ? 'happy' : (critical ? 'panic' : 'stern'));
  const spriteKey = pendingEvent ? `ev-${pendingEvent.t}` : 'idle';
  const char = CHARACTERS[speaker] || CHARACTERS.att_dech;
  const plate = char.plate;

  const { html, typing } = useTypewriter(narration || '', { reducedMotion });

  // เอฟเฟกต์ flash/shake ตาม popup — defer ผ่าน setTimeout(0) (ไม่ setState ใน effect body)
  const [flashN, setFlashN] = useState(0);
  const [redN, setRedN] = useState(0);
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (!popup || reducedMotion) return undefined;
    const bad = popup.rating === RATINGS.MISS;
    const id = setTimeout(() => {
      if (bad) {
        setRedN(n => n + 1);
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
      } else if (popup.rating === RATINGS.PERFECT) {
        setFlashN(n => n + 1);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [popup, reducedMotion]);

  const comboFilled = Math.min(streak, GAUGE_CELLS);

  return (
    <div className={`cbs-app rgaa-app ${shaking ? 'cbs-shake' : ''}`}>
      <div className={`cbs-stage rgaa-stage ${critical ? 'cbs-drama-red' : ''}`}>
        {/* HUD */}
        <div className="cbs-hud">
          <div className="cbs-hud-monitor">
            <span className={`cbs-rhythm-name ${critical ? 'cbs-bad' : ''}`}>
              {RHYTHM_LABEL[rhythm] || String(rhythm).toUpperCase()}
            </span>
            <EcgStrip rhythm={ecgRhythm(rhythm)} cpr={!!scene.compressorActive} width={140} height={26} />
          </div>
          <div className="cbs-hud-right">
            {hudLabel && <span className="cbs-timechip">{hudLabel}</span>}
            <span className="rgaa-scorechip">★ {score}</span>
            <div className="cbs-gauge">
              <span className="cbs-gauge-label">COMBO ×{streak}</span>
              <div className="cbs-gauge-cells">
                {Array.from({ length: GAUGE_CELLS }).map((_, i) => (
                  <span key={i} className={`cbs-cell ${i >= comboFilled ? 'cbs-off' : ''}`} />
                ))}
              </div>
            </div>
            <div className="cbs-timechip">{fmtClock(elapsed)}</div>
          </div>
        </div>

        {/* ตัวละครโผล่พูด */}
        <div className="cbs-sprite cbs-pop" key={spriteKey}>
          <CharacterSprite charId={speaker} pose={pose} talking={typing} />
        </div>

        {/* popup คะแนน (ไม่บล็อกจอ) */}
        {popup && (
          <div key={popup.id}
            className={`rgaa-popup ${popup.rating === RATINGS.MISS ? 't-bad' : 't-good'}`}>
            {popup.text}
          </div>
        )}
      </div>

      {/* กล่องบทพูด */}
      <div className="cbs-dlg-area">
        <div className="cbs-dlg rgaa-dlg">
          <div className="cbs-nameplate"
            style={plate ? { background: `linear-gradient(180deg, ${plate[0]}, ${plate[1]})` } : undefined}>
            {char.name}
          </div>
          <div className="cbs-dlg-text" dangerouslySetInnerHTML={{ __html: html || '…' }} />
        </div>
      </div>

      {/* แถบปุ่มบันทึก (persistent) */}
      <div className="rgaa-bararea">
        {coachText
          ? <div className="rgaa-bar-coach">{coachText}</div>
          : <div className="rgaa-bar-label">แตะเพื่อบันทึกเหตุการณ์</div>}
        <div className="rgaa-bar">
          {buttons.map(b => {
            const hint = showHint && expectedButtonId === b.id;
            return (
              <button key={b.id} type="button"
                className={`rgaa-btn t-${b.tone || 'info'} ${hint ? 'is-hint' : ''}`}
                onClick={() => onPress?.(b.id, b.action)}>
                {b.sub && <small>{b.sub}</small>}
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* เอฟเฟกต์เต็มจอ */}
      {flashN > 0 && <div key={`fl-${flashN}`} className="cbs-flash cbs-go" />}
      {redN > 0 && <div key={`rf-${redN}`} className="cbs-redflash cbs-go" />}
    </div>
  );
}
