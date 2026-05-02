import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarios, getScenariosByLevel } from '../data/scenarios';
import { useCaseStore } from '../stores/caseStore';
import {
  Heart, TrendingDown, TrendingUp, Brain, FileText, GraduationCap, Edit,
  Sparkles, ChevronRight, X,
} from '../components/ui/Icon';

export default function ScenarioSelect() {
  const navigate = useNavigate();
  const { createCase } = useCaseStore();
  const [filterLevel, setFilterLevel] = useState('all');
  const [mode, setMode] = useState('learning');
  const [loading, setLoading] = useState(false);
  const [briefScenario, setBriefScenario] = useState(null);

  const filtered = filterLevel === 'all' ? scenarios : getScenariosByLevel(filterLevel);

  const levelTone = {
    basic: 'bg-success/15 text-success',
    intermediate: 'bg-warning/15 text-warning',
    megacode: 'bg-danger/15 text-danger',
  };

  const categoryIcon = {
    cardiac_arrest: Heart,
    bradycardia: TrendingDown,
    tachycardia: TrendingUp,
    mi: Heart,
    stroke: Brain,
  };

  const startScenario = async (scenarioId) => {
    if (loading) return;
    setLoading(true);
    await createCase('training');
    navigate(`/recording?start=bls&scenario=${scenarioId}&mode=${mode}`);
  };

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-title text-text-primary">Training Scenarios</h1>
        <p className="text-caption text-text-muted mt-0.5">Practice ACLS in simulated cases</p>
      </div>

      {/* Mode selection */}
      <div>
        <div className="section-header">Mode</div>
        <div className="grid grid-cols-2 gap-2">
          <ModeChoice
            active={mode === 'learning'}
            onClick={() => setMode('learning')}
            tone="info"
            Icon={GraduationCap}
            title="Learning"
            sub="Hints + instant feedback"
          />
          <ModeChoice
            active={mode === 'exam'}
            onClick={() => setMode('exam')}
            tone="purple"
            Icon={Edit}
            title="Exam"
            sub="No hints + score at end"
          />
        </div>
      </div>

      {/* Level filter */}
      <div className="tab-group">
        {['all', 'basic', 'intermediate', 'megacode'].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            className={`tab-item ${filterLevel === l ? 'active' : ''}`}>
            {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {/* Scenario list */}
      <div className="space-y-2">
        {filtered.map(s => {
          const CatIcon = categoryIcon[s.category] || FileText;
          return (
            <button key={s.id} onClick={() => setBriefScenario(s)}
              className="w-full dash-card !p-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3">
              <div className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                style={{ borderRadius: 'var(--radius-md)' }}>
                <CatIcon size={20} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-strong text-text-primary truncate">{s.title_th}</div>
                <div className="text-caption text-text-muted truncate">{s.description_th}</div>
                <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5 font-mono">
                  <span>{s.steps.length} steps</span>
                  <span>·</span>
                  <span>{s.category}</span>
                </div>
              </div>
              <span className={`badge ${levelTone[s.level]}`}>{s.level}</span>
              <ChevronRight size={16} strokeWidth={2} className="text-text-muted shrink-0" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-text-muted text-caption">No scenarios found</div>
      )}

      {/* Brief modal */}
      {briefScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setBriefScenario(null)}>
          <div className="w-full max-w-sm bg-bg-secondary p-5 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
                  style={{ borderRadius: 'var(--radius-lg)' }}>
                  {(() => {
                    const I = categoryIcon[briefScenario.category] || FileText;
                    return <I size={24} strokeWidth={2} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-headline text-text-primary">{briefScenario.title_th}</h2>
                  <span className={`badge mt-1 inline-flex ${levelTone[briefScenario.level]}`}>
                    {briefScenario.level}
                  </span>
                </div>
              </div>
              <button onClick={() => setBriefScenario(null)}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 99 }}>
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="bg-bg-primary p-3 border border-border" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-caption text-text-secondary">{briefScenario.description_th}</div>
              <div className="text-[11px] text-text-muted mt-2 font-mono">Steps: {briefScenario.steps.length} · Mode: {mode}</div>
            </div>

            <div className="bg-bg-primary p-3 border border-border" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="section-header">You will practice</div>
              <div className="space-y-1">
                {briefScenario.steps.slice(0, 4).map((s, i) => (
                  <div key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-info shrink-0 mt-1">•</span>
                    <span>{s.correctActions?.join(', ')}</span>
                  </div>
                ))}
                {briefScenario.steps.length > 4 && (
                  <div className="text-[10px] text-text-muted">+ {briefScenario.steps.length - 4} more…</div>
                )}
              </div>
            </div>

            <button onClick={() => startScenario(briefScenario.id)} disabled={loading}
              className="btn btn-success btn-lg btn-block disabled:opacity-50">
              <Sparkles size={16} strokeWidth={2.4} /> {loading ? 'Loading…' : 'Start Scenario'}
            </button>
            <button onClick={() => setBriefScenario(null)} className="w-full text-text-muted text-caption">Cancel</button>
          </div>
        </div>
      )}
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
