import GameRhythmSelect from './GameRhythmSelect';
import GameDrugMenu from './GameDrugMenu';
import GameShockModal from './GameShockModal';
import GameChoiceModal from './GameChoiceModal';

// ==========================================
// Recorder Hero — เลือก modal กรอกข้อมูลตามปุ่มที่กด
// kind: 'rhythm' → เลือก rhythm | 'drug' → เลือกยา arrest | 'energy' → พลังงาน shock/cardiovert
//       'choice' → ตัวเลือกยา/หัตถการทั่วไป (ต้องส่ง options)
// onSubmit(dataObject) เช่น { rhythm } / { drug } / { energy } / { choice }
// ==========================================
export default function DataEntryModal({ kind, onSubmit, onClose, options, energyChoices, title_th }) {
  if (kind === 'rhythm') {
    return <GameRhythmSelect onSelect={(rhythm) => onSubmit({ rhythm })} onClose={onClose} />;
  }
  if (kind === 'drug') {
    return <GameDrugMenu onSelect={(drug) => onSubmit({ drug })} onClose={onClose} />;
  }
  if (kind === 'energy') {
    return <GameShockModal energyChoices={energyChoices} onDeliver={(energy) => onSubmit({ energy })} onClose={onClose} />;
  }
  if (kind === 'choice') {
    return <GameChoiceModal title_th={title_th} options={options || []}
      onSelect={(choice) => onSubmit({ choice })} onClose={onClose} />;
  }
  return null;
}
