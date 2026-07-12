import EcgMonitor from '../sim/EcgMonitor';
import TeamMember from '../sim/TeamMember';
import Patient from '../sim/Patient';
import Instructor from '../sim/Instructor';

// ==========================================
// Recorder Hero — ฉากเหตุการณ์ (Mode A)
// EcgMonitor + Patient + ทีม + narration bubble — รับ scene/narration จาก engine
// ==========================================
export default function GameStage({ scene = {}, narration, showTeam = true }) {
  return (
    <div className="space-y-2">
      <EcgMonitor
        rhythm={scene.rhythm || 'flat'}
        hr={scene.hr}
        bp={scene.bp}
        spo2={scene.spo2}
        etco2={scene.etco2}
      />

      {/* Resus scene — เฉพาะเคส arrest (มีทีมกู้ชีพ) */}
      {showTeam && (
      <div className="bg-gradient-to-b from-blue-50 to-bg-secondary border-2 border-text-primary p-2">
        <div className="flex justify-center mb-1">
          <TeamMember role="airway" active={!!scene.airwayActive} label="Airway"
            status={scene.airwayActive ? 'BAGGING' : ''} />
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-1 items-center">
          <TeamMember role="drug" active={!!scene.ivAccess} label="Drug"
            status={scene.ivAccess ? 'IV ready' : ''} />
          <Patient state={scene} />
          <TeamMember role="defib" active={!!scene.defibCharged} label="Defib"
            status={scene.defibCharged ? '⚡ CHARGED' : ''} />
        </div>
        <div className="flex justify-center gap-6 mt-1">
          <TeamMember role="compressor" active={!!scene.compressorActive} label="Compressor"
            status={scene.compressorActive ? 'CPR ON' : ''} />
          <TeamMember role="leader" active={false} label="Leader" />
        </div>
      </div>
      )}

      {/* Narration bubble */}
      <div className="bg-bg-secondary border-2 border-text-primary p-2 flex items-start gap-2 min-h-[64px]">
        <Instructor mood={narration ? 'idle' : 'happy'} />
        <div className="flex-1">
          <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-snug text-slate-900">
            <span className="font-black text-info">หัวหน้าทีม: </span>
            {narration || 'เฝ้าดู monitor — พร้อมบันทึกเหตุการณ์ถัดไป'}
          </div>
        </div>
      </div>
    </div>
  );
}
