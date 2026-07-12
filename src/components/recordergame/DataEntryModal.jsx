import GameRhythmSelect from './GameRhythmSelect';
import GameDrugMenu from './GameDrugMenu';
import GameShockModal from './GameShockModal';

// ==========================================
// Recorder Hero — เลือก modal กรอกข้อมูลตามปุ่มที่กด
// kind: 'rhythm' → เลือก rhythm | 'drug' → เลือกยา | 'energy' → เลือกพลังงาน shock
// onSubmit(dataObject) เช่น { rhythm: 'vf' } / { drug: 'epinephrine_arrest' } / { energy: 120 }
// ==========================================
export default function DataEntryModal({ kind, onSubmit, onClose }) {
  if (kind === 'rhythm') {
    return <GameRhythmSelect onSelect={(rhythm) => onSubmit({ rhythm })} onClose={onClose} />;
  }
  if (kind === 'drug') {
    return <GameDrugMenu onSelect={(drug) => onSubmit({ drug })} onClose={onClose} />;
  }
  if (kind === 'energy') {
    return <GameShockModal onDeliver={(energy) => onSubmit({ energy })} onClose={onClose} />;
  }
  return null;
}
