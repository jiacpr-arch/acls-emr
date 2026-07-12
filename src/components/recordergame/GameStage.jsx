import CharacterSprite from '../../game/CharacterSprite';
import EcgStrip from '../../game/EcgStrip';
import Patient from '../sim/Patient';
import { CHARACTERS } from '../../game/characters';
import './gameStage.css';

// ==========================================
// Recorder Hero — ฉากเหตุการณ์ (Mode A) สไตล์ "อนิเมะ + จอมอนิเตอร์"
// - จอมอนิเตอร์: EcgStrip (sweep จริง) + vitals digits
// - ทีมกู้ชีพ: CharacterSprite (รูปจริง .webp ถ้ามี / SVG อนิเมะ fallback)
// - กล่องบทพูดสไตล์ VN + อ.เดช เป็นผู้บรรยาย
// รับ scene/narration จาก engine — ไม่มี store ใดๆ
// ==========================================

// map จังหวะเกม → คลื่นที่ EcgStrip วาดได้ (flat|vf|nsr)
function ecgRhythm(r) {
  if (!r) return 'flat';
  if (['vf', 'pvt', 'vt', 'vt_pulse', 'torsades'].includes(r)) return 'vf';
  if (['asystole', 'flat'].includes(r)) return 'flat';
  return 'nsr'; // nsr, pea, svt, sinus_brady, stemi, rosc, ...
}

// ทีมกู้ชีพ 3 บทบาท → charId + เงื่อนไข active จาก scene
const TEAM = [
  { role: 'compressor', charId: 'boy_compressor', activeKey: 'compressorActive', onStatus: 'CPR' },
  { role: 'defib', charId: 'fon_defib', activeKey: 'defibCharged', onStatus: '⚡ CHARGED' },
  { role: 'drug', charId: 'nurse_mint', activeKey: 'ivAccess', onStatus: 'IV' },
];

function Vital({ label, value, unit, tone }) {
  return (
    <div className="rg-vital">
      <span className="rg-vital-label">{label}</span>
      <span className={`rg-vital-value ${tone}`}>{value ?? '--'}<i>{unit}</i></span>
    </div>
  );
}

export default function GameStage({ scene = {}, narration, showTeam = true }) {
  const rosc = scene.consciousness === 'rosc';
  const teamPose = rosc ? 'happy' : 'stern';
  const speakerPose = rosc ? 'happy' : (narration ? 'talk' : 'stern');
  const speaker = CHARACTERS.att_dech;
  const rhythm = scene.rhythm || 'flat';

  return (
    <div className="rg-stage">
      {/* ===== Monitor ===== */}
      <div className="rg-monitor">
        <div className="rg-monitor-top">
          <span className="rg-monitor-lead">◉ ECG · {String(rhythm).toUpperCase()}</span>
          <span className="rg-monitor-tag">PT MONITOR</span>
        </div>
        <div className="rg-monitor-screen">
          <EcgStrip rhythm={ecgRhythm(rhythm)} cpr={!!scene.compressorActive} width={520} height={92} />
        </div>
        <div className="rg-vitals">
          <Vital label="HR" value={scene.hr || 0} unit="" tone="t-green" />
          <Vital label="BP" value={scene.bp || '--/--'} unit="" tone="t-amber" />
          <Vital label="SpO₂" value={scene.spo2 || 0} unit="%" tone="t-cyan" />
          <Vital label="EtCO₂" value={scene.etco2 || 0} unit="" tone="t-orange" />
        </div>
      </div>

      {/* ===== Resus scene (เฉพาะเคส arrest) ===== */}
      {showTeam && (
        <div className="rg-scene">
          <div className="rg-team">
            {TEAM.map(m => {
              const active = !!scene[m.activeKey];
              return (
                <div key={m.role} className={`rg-actor ${active ? 'is-active' : ''}`}>
                  <div className="rg-actor-sprite">
                    <CharacterSprite charId={m.charId} pose={active && !rosc ? 'panic' : teamPose} />
                  </div>
                  <div className="rg-actor-name">{CHARACTERS[m.charId].name}</div>
                  {active && <div className="rg-actor-status">{m.onStatus}</div>}
                </div>
              );
            })}
          </div>
          <div className="rg-patient">
            <Patient state={scene} />
          </div>
        </div>
      )}

      {/* ===== กล่องบทพูด (VN) ===== */}
      <div className="rg-dialog">
        <div className="rg-speaker">
          <CharacterSprite charId="att_dech" pose={speakerPose} talking={!!narration} />
        </div>
        <div className="rg-bubble">
          <div className="rg-bubble-name">{speaker.name}</div>
          <div className="rg-bubble-text">
            {narration || 'เฝ้าดู monitor — พร้อมบันทึกเหตุการณ์ถัดไป'}
          </div>
        </div>
      </div>
    </div>
  );
}
