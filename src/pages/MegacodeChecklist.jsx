import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, ClipboardCheck } from 'lucide-react';
import { getMegacodeChecklist } from '../data/megacodeChecklists';
import MegacodeChecklistGame from '../components/megacode/MegacodeChecklistGame';
import MegacodeChecklistForm from '../components/megacode/MegacodeChecklistForm';
import ErrorCard from '../components/ui/ErrorCard';

export default function MegacodeChecklist() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('game'); // 'game' = self-check, 'form' = evaluator
  const checklist = getMegacodeChecklist(caseId);

  if (!checklist) {
    return (
      <div className="page-container">
        <ErrorCard title="ไม่พบเช็คลิสต์นี้" onRetry={() => navigate('/megacode')} />
      </div>
    );
  }

  return (
    <div className="page-container space-y-4">
      <div>
        <h1 className="text-title text-text-primary">{checklist.title}</h1>
        <p className="text-caption text-text-muted mt-0.5">{checklist.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ModeChoice active={mode === 'game'} onClick={() => setMode('game')}
          tone="info" Icon={GraduationCap} title="ฝึกด้วยตนเอง" sub="Self-check ทีละขั้นตอน" />
        <ModeChoice active={mode === 'form'} onClick={() => setMode('form')}
          tone="purple" Icon={ClipboardCheck} title="อาจารย์ประเมิน" sub="กรอกฟอร์ม + Export PDF" />
      </div>

      {mode === 'game'
        ? <MegacodeChecklistGame key={`game-${checklist.id}`} checklist={checklist} onExit={() => navigate('/megacode')} />
        : <MegacodeChecklistForm key={`form-${checklist.id}`} checklist={checklist} />}
    </div>
  );
}

function ModeChoice({ active, onClick, tone, Icon, title, sub }) {
  const tones = {
    info: active ? 'bg-info/10 text-info border-info/40' : 'bg-bg-secondary text-text-primary border-border',
    purple: active ? 'bg-purple/10 text-purple border-purple/40' : 'bg-bg-secondary text-text-primary border-border',
  };
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start gap-1 p-3 border transition-colors text-left ${tones[tone]}`}
      style={{ borderRadius: 'var(--radius-md)' }}>
      <Icon size={20} strokeWidth={2.2} />
      <div className="text-body-strong mt-1">{title}</div>
      <div className="text-caption opacity-70">{sub}</div>
    </button>
  );
}
