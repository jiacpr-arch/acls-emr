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
  const [briefScenario, setBriefScenario] = useState(null); // show brief before start

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
    <div className="page-container space-y-4">
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
          <button key={s.id} onClick={() => setBriefScenario(s)}
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

      {/* Scenario Brief Modal */}
      {briefScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setBriefScenario(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-2">{categoryIcons[briefScenario.category] || '📋'}</div>
              <h2 className="text-lg font-black text-text-primary">{briefScenario.title_th}</h2>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[briefScenario.level]}`}>
                {briefScenario.level}
              </span>
            </div>

            <div className="glass-card !p-3 text-left">
              <div className="text-xs text-text-secondary">{briefScenario.description_th}</div>
              <div className="text-[10px] text-text-muted mt-2">Steps: {briefScenario.steps.length} · Mode: {mode}</div>
            </div>

            <div className="glass-card !p-3 text-left">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-1">You will practice:</div>
              <div className="space-y-0.5">
                {briefScenario.steps.slice(0, 4).map((s, i) => (
                  <div key={i} className="text-[10px] text-text-secondary">• {s.correctActions?.join(', ')}</div>
                ))}
                {briefScenario.steps.length > 4 && <div className="text-[10px] text-text-muted">+ {briefScenario.steps.length - 4} more...</div>}
              </div>
            </div>

            <button onClick={() => startScenario(briefScenario.id)} disabled={loading}
              className="w-full btn-action btn-success py-4 text-sm font-bold disabled:opacity-50">
              {loading ? 'Loading...' : '🎮 Start Scenario'}
            </button>
            <button onClick={() => setBriefScenario(null)} className="w-full text-text-muted text-xs underline text-center">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
