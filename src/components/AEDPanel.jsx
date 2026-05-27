import { useState, useEffect, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playShockSound, playBeep } from '../utils/sound';
import { StepCard, BigButton, TrainingHint } from './StepUI';
import { Zap, Monitor, Activity, HeartPulse, AlertCircle } from 'lucide-react';

// AED workflow for BLS:
//   attach (optional) → analyzing → verdict (shock advised / no shock advised) → deliver / resume CPR
// verdict source: scenario-driven (`scenarioVerdict` prop) or random (50/50 by default)
const ANALYZE_MS = 6000;

export default function AEDPanel({
  mode = 'initial',          // 'initial' (with attach step) | 'recheck' (skip attach)
  scenarioVerdict = null,    // 'shock' | 'no_shock' | null (random)
  onShockDelivered,
  onNoShock,
  onROSC,
  isTraining = false,
}) {
  const addEvent = useCaseStore(s => s.addEvent);
  const addShock = useCaseStore(s => s.addShock);
  const shockCount = useCaseStore(s => s.shockCount);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const getElapsed = () => useTimerStore.getState().elapsed;

  const [phase, setPhase] = useState(mode === 'initial' ? 'attach' : 'analyzing');
  const [verdict, setVerdict] = useState(null);   // 'shock' | 'no_shock'
  const [analyzeMs, setAnalyzeMs] = useState(0);
  const timerRef = useRef(null);

  // Analyzing animation + verdict resolution
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const startedAt = Date.now();
    if (soundEnabled) playBeep(880, 0.15, 0.2);
    timerRef.current = setInterval(() => {
      const ms = Date.now() - startedAt;
      setAnalyzeMs(ms);
      if (ms >= ANALYZE_MS) {
        clearInterval(timerRef.current);
        const v = scenarioVerdict ?? (Math.random() < 0.5 ? 'shock' : 'no_shock');
        setVerdict(v);
        addEvent({
          elapsed: getElapsed(),
          category: 'rhythm',
          type: v === 'shock' ? '⚡ AED: Shock Advised' : '⊘ AED: No Shock Advised',
          details: { aedVerdict: v },
        });
        if (soundEnabled) playBeep(v === 'shock' ? 1200 : 440, 0.3, 0.35);
        setPhase('verdict');
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase, scenarioVerdict, soundEnabled, addEvent]);

  const handleAttached = () => {
    addEvent({ elapsed: getElapsed(), category: 'other', type: '🔌 AED pads attached' });
    setPhase('analyzing');
  };

  const handleDeliverShock = () => {
    if (soundEnabled) playShockSound();
    addShock();
    addEvent({
      elapsed: getElapsed(),
      category: 'shock',
      type: `⚡ AED Shock #${shockCount + 1}`,
      details: { source: 'AED' },
    });
    useTimerStore.getState().resetCycle();
    setPhase('delivered');
    setTimeout(() => onShockDelivered && onShockDelivered(), 800);
  };

  const handleResumeCPR = () => {
    addEvent({ elapsed: getElapsed(), category: 'cpr', type: '▶️ Resume CPR (No shock advised)' });
    onNoShock && onNoShock();
  };

  // ---------- Render ----------
  if (phase === 'attach') {
    return (
      <StepCard
        phase="BLS — AED"
        phaseColor="text-info"
        icon={Monitor}
        title="ติด AED Pads"
        subtitle="ติดแผ่นโดยไม่หยุด CPR"
        instructions={[
          'เปิดเครื่อง AED → ฟังคำสั่งเสียง',
          'ติด pad ที่ใต้กระดูกไหปลาร้าขวา + ใต้รักแร้ซ้าย',
          'ห้ามหยุดกดหน้าอกระหว่างติดแผ่น',
          'เมื่อพร้อม → กดปุ่มเพื่อให้ AED วิเคราะห์',
        ]}
      >
        <TrainingHint show={isTraining}>
          <p>Hairy chest → โกน/ดึงขน · Wet → เช็ดให้แห้ง · Patch ยา → ดึงออก · ห่างจาก pacemaker ≥ 2.5 ซม.</p>
        </TrainingHint>
        <BigButton color="bg-info" onClick={handleAttached}>
          ✅ Pads ติดแล้ว → ให้ AED วิเคราะห์
        </BigButton>
      </StepCard>
    );
  }

  if (phase === 'analyzing') {
    const pct = Math.min(100, (analyzeMs / ANALYZE_MS) * 100);
    return (
      <StepCard
        phase="BLS — AED"
        phaseColor="text-warning"
        icon={Activity}
        title="AED กำลังวิเคราะห์"
        subtitle="ห้ามแตะผู้ป่วย · หยุด CPR ชั่วคราว"
        instructions={[
          '"Analyzing rhythm — do not touch the patient"',
          'ดูแลให้ทุกคนถอยห่างจากผู้ป่วย',
          'พร้อมที่จะ shock หรือ resume CPR ทันทีตามคำสั่ง',
        ]}
      >
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="w-32 h-32 rounded-full border-4 border-warning/30 border-t-warning animate-spin" />
          <div className="text-sm font-bold text-warning">Analyzing…</div>
          <div className="w-full max-w-xs h-1.5 bg-bg-tertiary overflow-hidden rounded-full">
            <div className="h-full bg-warning transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </StepCard>
    );
  }

  if (phase === 'verdict' && verdict === 'shock') {
    return (
      <StepCard
        phase="BLS — AED"
        phaseColor="text-shock"
        icon={Zap}
        title="SHOCK ADVISED"
        subtitle={`AED แนะนำให้ shock — Shock #${shockCount + 1}`}
        instructions={[
          '"Shock advised — stand clear"',
          'ตะโกน "CLEAR!" และมองรอบ ๆ ให้แน่ใจไม่มีใครแตะผู้ป่วย',
          'กดปุ่ม Shock ตามคำสั่ง AED',
          'หลัง shock → เริ่ม CPR ต่อทันที 2 นาที',
        ]}
      >
        <TrainingHint show={isTraining}>
          <p>AED จัดการพลังงานเองอัตโนมัติ — ไม่ต้องเลือก Joule manual ใน BLS</p>
        </TrainingHint>
        <BigButton color="bg-shock text-white animate-pulse" size="huge" onClick={handleDeliverShock}>
          ⚡ กด SHOCK
        </BigButton>
        {onROSC && (
          <button onClick={onROSC} className="btn btn-ghost btn-sm mt-2">
            🟢 พบ ROSC (มีชีพจร) → สิ้นสุด arrest
          </button>
        )}
      </StepCard>
    );
  }

  if (phase === 'verdict' && verdict === 'no_shock') {
    return (
      <StepCard
        phase="BLS — AED"
        phaseColor="text-warning"
        icon={AlertCircle}
        title="NO SHOCK ADVISED"
        subtitle="AED ไม่แนะนำให้ shock — กลับไปทำ CPR ต่อทันที"
        instructions={[
          '"No shock advised — resume CPR"',
          'เริ่มกดหน้าอกต่อทันที 2 นาที',
          'AED จะวิเคราะห์ซ้ำในรอบถัดไปอัตโนมัติ',
          'ห้ามตรวจชีพจรเสียเวลา — กลับไป CPR เลย',
        ]}
      >
        <TrainingHint show={isTraining}>
          <p>No shock = อาจเป็น PEA / Asystole หรือ ROSC — BLS ไม่ต้องแยก เพียงทำ CPR ต่อ ทีม Advanced จะมาประเมิน</p>
        </TrainingHint>
        <BigButton color="bg-warning text-black" size="huge" onClick={handleResumeCPR}>
          ▶️ Resume CPR
        </BigButton>
        {onROSC && (
          <button onClick={onROSC} className="btn btn-ghost btn-sm mt-2">
            🟢 พบสัญญาณ ROSC ชัดเจน (หายใจ/ขยับ) → สิ้นสุด arrest
          </button>
        )}
      </StepCard>
    );
  }

  if (phase === 'delivered') {
    return (
      <StepCard
        phase="BLS — AED"
        phaseColor="text-shock"
        icon={HeartPulse}
        title="Shock Delivered"
        subtitle="กำลังกลับสู่ CPR..."
        instructions={['เริ่ม CPR ต่อทันที 2 นาที — ห้ามตรวจชีพจร']}
      >
        <div className="flex items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
            <HeartPulse size={32} className="text-success" />
          </div>
        </div>
      </StepCard>
    );
  }

  return null;
}
