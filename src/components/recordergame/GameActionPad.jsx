import { CATEGORY_ACTIONS } from '../../data/activeRecorderCases';

// ==========================================
// Recorder Hero — แผงปุ่มบันทึกสำหรับเคส non-arrest (peri-arrest/stroke/MI/special)
// ปุ่มมาจาก CATEGORY_ACTIONS[category] — ป้ายกำกับตรงกับ pathway จริงในแอป
// ยิง onPress(buttonId, actionDescriptor) เพื่อให้หน้า play เปิด modal ที่ถูกต้อง
// ==========================================
const TONE_CLASS = {
  ghost: 'btn-ghost',
  info: 'btn-primary',
  success: 'btn-success',
  warning: 'btn-warning',
  danger: 'btn-danger',
  purple: 'btn-purple',
  shock: 'btn-shock',
};

export default function GameActionPad({ category, onPress, highlightId, scene = {}, cycleLabel }) {
  const actions = CATEGORY_ACTIONS[category] || [];
  const ring = (id) => (highlightId === id ? 'ring-4 ring-info ring-offset-2 animate-pulse rounded-lg' : '');

  return (
    <div className="space-y-3">
      {/* Header — สรุปสถานะสั้นๆ */}
      <div className="dash-card !py-2.5 !px-4 flex items-center justify-between">
        <div className="text-left">
          <div className="text-3xs text-text-muted font-bold uppercase tracking-wider">เวลา</div>
          <div className="text-numeric text-xl text-text-primary tracking-tight">{cycleLabel || '--:--'}</div>
        </div>
        <div className="flex gap-2 text-right">
          <div className="stat-box !p-2 min-w-[52px]">
            <div className="stat-value text-sm text-info">{scene.hr ?? '--'}</div>
            <div className="stat-label">HR</div>
          </div>
          <div className="stat-box !p-2 min-w-[62px]">
            <div className="stat-value text-sm text-warning">{scene.bp || '--/--'}</div>
            <div className="stat-label">BP</div>
          </div>
          <div className="stat-box !p-2 min-w-[52px]">
            <div className="stat-value text-sm text-cyan-500">{scene.spo2 ?? '--'}</div>
            <div className="stat-label">SpO₂</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map(a => (
          <button key={a.id} onClick={() => onPress(a.id, a)}
            className={`btn btn-lg btn-block ${TONE_CLASS[a.tone] || 'btn-ghost'} ${ring(a.id)}`}>
            {a.label_th}
          </button>
        ))}
      </div>
    </div>
  );
}
