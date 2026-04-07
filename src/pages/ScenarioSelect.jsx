import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarios, getScenariosByLevel } from '../data/scenarios';
import { useCaseStore } from '../stores/caseStore';

// Scenario Selection Page — choose scenario + mode (learning/exam)
export default function ScenarioSelect() {
  const navigate = useNavigate();
  const { createCase } = useCaseStore();
  const [filterLevel, setFilterLevel] = useState('all');
  const [mode, setMode] = useState('learning');
  const [loading, setLoading] = useState(false);

  const filtered = filterLevel === 'all' ? scenarios : getScenariosByLevel(filterLevel);

  const levelColors = {
    basic: 'bg-success/15 text-success',
    intermediate: 'bg-warning/15 text-warning',
    megacode: 'bg-danger/15 text-danger',
  };

  const categoryIcons = {
    cardiac_arrest: '🫀',
    bradycardia: '🐢',
    tachycardia: '🐇',
    mi: '💔',
    stroke: '🧠',
  };

  const startScenario = async (scenarioId) => {
    if (loading) return;
    setLoading(true);
    await createCase('training');
    navigate(`/recording?start=bls&scenario=${scenarioId}&mode=${mode}`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-text-primary">Training Scenarios</h1>

      {/* Mode selection */}
      <div className="flex gap-2">
        <button onClick={() => setMode('learning')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
            mode === 'learning' ? 'bg-info text-white' : 'bg-bg-secondary text-text-muted'
          }`}>
          📚 Learning
          <div className="text-[9px] font-normal opacity-70">Hints + instant feedback</div>
        </button>
        <button onClick={() => setMode('exam')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
            mode === 'exam' ? 'bg-purple text-white' : 'bg-bg-secondary text-text-muted'
          }`}>
          📝 Exam
          <div className="text-[9px] font-normal opacity-70">No hints + score at end</div>
        </button>
      </div>

      {/* Level filter */}
      <div className="flex gap-2">
        {['all', 'basic', 'intermediate', 'megacode'].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterLevel === l ? 'bg-bg-tertiary text-text-primary' : 'bg-bg-secondary text-text-muted'
            }`}>
            {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {/* Scenario list */}
      <div className="space-y-2">
        {filtered.map(s => (
          <button key={s.id} onClick={() => startScenario(s.id)}
            className="w-full glass-card !p-3 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{categoryIcons[s.category] || '📋'}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-primary">{s.title_th}</div>
                <div className="text-[10px] text-text-muted">{s.description_th}</div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${levelColors[s.level]}`}>
                {s.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-text-muted">
              <span>{s.steps.length} steps</span>
              <span>·</span>
              <span>{s.category}</span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-text-muted text-sm">No scenarios found</div>
      )}
    </div>
  );
}
