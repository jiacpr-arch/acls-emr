import { useState, useEffect, useMemo } from 'react';
import CharacterSprite from '../../game/CharacterSprite';
import EcgStrip from '../../game/EcgStrip';
import { getCharacter } from '../../game/characters';
import { useTypewriter } from '../../hooks/recordergame/useTypewriter';
import './scenarioStage.css';

// ==========================================
// Training Scenario — ฉากจำลองสไตล์ Code Blue Sim ครอบหน้า Recording จริง
// Presentational ล้วนๆ: render จาก `stage` (plain JSON จาก deriveStageState)
// เท่านั้น ไม่แตะ store — เพื่อให้จอครูในโหมดสองจอ (อนาคต) ใช้ component
// เดียวกัน render จาก snapshot ที่ broadcast มาได้เลย
// ==========================================

function VitalChip({ label, value, tone }) {
  return (
    <span className={`scn-vital ${tone || ''}`}>
      <small>{label}</small>{value}
    </span>
  );
}

function vitalsChips(vitals) {
  if (!vitals) return null;
  const chips = [];
  if (vitals.hr !== undefined) {
    chips.push(<VitalChip key="hr" label="HR" value={vitals.hr ?? '--'}
      tone={vitals.hr === 0 || vitals.hr > 150 ? 't-bad' : vitals.hr < 50 ? 't-warn' : 't-good'} />);
  }
  if (vitals.bp) {
    chips.push(<VitalChip key="bp" label="BP" value={vitals.bp}
      tone={parseInt(vitals.bp) < 90 ? 't-bad' : ''} />);
  }
  if (vitals.spo2 !== undefined) {
    chips.push(<VitalChip key="spo2" label="SpO₂" value={`${vitals.spo2 ?? '--'}%`}
      tone={vitals.spo2 < 94 ? 't-bad' : 't-good'} />);
  }
  if (vitals.etco2 !== undefined) {
    chips.push(<VitalChip key="etco2" label="EtCO₂" value={vitals.etco2 ?? '--'}
      tone={vitals.etco2 > 40 ? 't-good' : vitals.etco2 < 10 ? 't-bad' : ''} />);
  }
  return chips;
}

export default function ScenarioStage({
  stage, mode = 'learning',
  collapsed = false, onToggleCollapse,
  soundEnabled = true, onToggleSound,
}) {
  const isLearning = mode === 'learning';
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const char = getCharacter(stage.speaker) || getCharacter('att_dech');
  const plate = char?.plate;

  // exam mode = ข้อความขึ้นทันที (ไม่มี typewriter) เหมือนพฤติกรรม exam เดิม
  const narrationHtml = (stage.narration || '').replace(/\n/g, '<br/>');
  const { html, typing } = useTypewriter(narrationHtml, { reducedMotion: reducedMotion || !isLearning });

  // เอฟเฟกต์ flash/shake — pattern เดียวกับ RecorderStageAA:
  // defer ผ่าน setTimeout(0) + counter เป็น key (ไม่ setState ตรงใน effect body)
  const [flashN, setFlashN] = useState(0);   // ขาว (shock)
  const [goodN, setGoodN] = useState(0);     // เขียว (ถูก)
  const [redN, setRedN] = useState(0);       // แดง (ผิด)
  const [shaking, setShaking] = useState(false);
  const resultAt = stage.lastResult?.at || 0;
  const resultKind = stage.lastResult?.kind;
  const resultFx = stage.lastResult?.fx;

  useEffect(() => {
    if (!resultAt || reducedMotion) return undefined;
    const id = setTimeout(() => {
      if (resultKind === 'wrong') {
        setRedN(n => n + 1);
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
      } else if (resultFx === 'shock') {
        setFlashN(n => n + 1);
      } else if (resultKind === 'correct') {
        setGoodN(n => n + 1);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [resultAt, resultKind, resultFx, reducedMotion]);

  const stepChip = `${Math.min(stage.stepIndex + 1, stage.totalSteps)}/${stage.totalSteps}`;

  if (collapsed) {
    return (
      <div className="scn-stage scn-collapsed" data-mode={mode}>
        <EcgStrip rhythm={stage.monitorOn ? stage.rhythm : 'flat'} width={100} height={22} />
        <span className={`scn-mini-rhythm ${stage.critical ? 'cbs-bad' : ''}`}>{stage.rhythmLabel}</span>
        <span className="scn-mini-vitals">
          HR {stage.vitals?.hr ?? '--'} · BP {stage.vitals?.bp ?? '--/--'}
        </span>
        <span className="scn-chip">{stepChip}</span>
        <button type="button" className="scn-icon-btn" onClick={onToggleCollapse}
          aria-label="ขยายฉากจำลอง">▾</button>
      </div>
    );
  }

  return (
    <div className={`scn-stage ${shaking ? 'cbs-shake' : ''}`} data-mode={mode}>
      <div className={`scn-scene ${stage.critical ? 'scn-critical' : ''}`}>
        {/* HUD: จอ monitor + chips + ปุ่ม */}
        <div className="scn-hud">
          <div className="scn-monitor">
            <span className={`cbs-rhythm-name ${stage.critical ? 'cbs-bad' : ''}`}>
              {stage.rhythmLabel}
            </span>
            <EcgStrip rhythm={stage.monitorOn ? stage.rhythm : 'flat'} width={140} height={26} />
          </div>
          <div className="scn-hud-right">
            {stage.patientLabel && <span className="scn-chip scn-patient">{stage.patientLabel}</span>}
            <span className="scn-chip">{isLearning ? '📚' : '📝'} {stepChip}</span>
            <button type="button" className="scn-icon-btn" onClick={onToggleSound}
              aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button type="button" className="scn-icon-btn" onClick={onToggleCollapse}
              aria-label="ย่อฉากจำลอง">▴</button>
          </div>
        </div>

        {/* ตัวละคร + กล่องบทพูด */}
        <div className="scn-body">
          <div className="scn-sprite cbs-pop" key={stage.speakerKey}>
            <CharacterSprite charId={stage.speaker} pose={stage.pose} talking={typing} />
          </div>
          {/* key={stage.narration} รีเมาต์กล่องบทพูดทุกครั้งที่ข้อความเปลี่ยน — CSS animation
              บน .scn-dlg เลยเล่นซ้ำเป็น pulse สั้นๆ ดึงสายตาให้อ่านก่อนไปกดปุ่มด้านล่าง */}
          <div className="cbs-dlg scn-dlg" key={stage.narration}>
            <div className="scn-eyebrow">สถานการณ์ล่าสุด</div>
            <div className="cbs-nameplate scn-nameplate"
              style={plate ? { background: `linear-gradient(180deg, ${plate[0]}, ${plate[1]})` } : undefined}>
              {char?.name || '—'}
            </div>
            {/* narration มาจาก data ในโค้ดเราเอง (scenarios.js) ไม่ใช่ input ผู้ใช้ */}
            <div className="cbs-dlg-text scn-dlg-text" dangerouslySetInnerHTML={{ __html: html || '…' }} />
          </div>
        </div>

        {/* popup ✓/✗ แบบอาร์เคด (ไม่บล็อกจอ) — เฉพาะผลจริง ไม่ใช่ปุ่มที่ระบบแค่เมิน (ignored) */}
        {resultAt > 0 && (resultKind === 'correct' || resultKind === 'wrong') && (
          <div key={`pop-${resultAt}`}
            className={`scn-popup ${resultKind === 'wrong' ? 't-bad' : 't-good'}`}>
            {resultKind === 'wrong' ? '✗' : '✓'}
          </div>
        )}

        {/* vitals ย่อ */}
        {stage.vitals && <div className="scn-vitals">{vitalsChips(stage.vitals)}</div>}

        {/* progress bar */}
        <div className="scn-prog">
          {Array.from({ length: stage.totalSteps }).map((_, i) => (
            <span key={i} className={
              i < stage.stepIndex ? 'scn-done' : i === stage.stepIndex ? 'scn-now' : ''
            } />
          ))}
        </div>
      </div>

      {/* hint (learning เท่านั้น) */}
      {isLearning && stage.hint && (
        <div className="scn-hint">💡 {stage.hint}</div>
      )}

      {/* เอฟเฟกต์เต็มจอ */}
      {flashN > 0 && <div key={`fl-${flashN}`} className="cbs-flash cbs-go" />}
      {goodN > 0 && <div key={`gf-${goodN}`} className="scn-goodflash cbs-go" />}
      {redN > 0 && <div key={`rf-${redN}`} className="cbs-redflash cbs-go" />}
    </div>
  );
}
