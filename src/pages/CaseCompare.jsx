import { useState, useEffect } from 'react';
import { getAllCases, getFullCase } from '../db/database';
import { Layers } from 'lucide-react';

export default function CaseCompare() {
  const [cases, setCases] = useState([]);
  const [caseA, setCaseA] = useState(null);
  const [caseB, setCaseB] = useState(null);
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  useEffect(() => { getAllCases().then(setCases); }, []);

  useEffect(() => { if (caseA) getFullCase(caseA).then(setDataA); }, [caseA]);
  useEffect(() => { if (caseB) getFullCase(caseB).then(setDataB); }, [caseB]);

  const Stat = ({ label, a, b, better = 'higher' }) => {
    const aVal = parseFloat(a) || 0;
    const bVal = parseFloat(b) || 0;
    const aWin = better === 'higher' ? aVal >= bVal : aVal <= bVal;
    const bWin = !aWin;
    return (
      <div className="grid grid-cols-3 gap-2 items-center py-2 border-b border-border last:border-b-0">
        <div className={`text-right text-numeric text-base ${aWin && caseB ? 'text-success' : 'text-text-primary'}`}>{a || '—'}</div>
        <div className="text-center text-[11px] text-text-muted font-semibold uppercase tracking-wide">{label}</div>
        <div className={`text-left text-numeric text-base ${bWin && caseA ? 'text-success' : 'text-text-primary'}`}>{b || '—'}</div>
      </div>
    );
  };

  const getEpiCount = (data) => data?.events?.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')).length || 0;
  const getShockCount = (data) => data?.events?.filter(e => e.category === 'shock').length || 0;
  const getDuration = (data) => {
    if (!data?.startTime || !data?.endTime) return '—';
    const s = Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Layers size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">Compare Cases</h1>
          <p className="text-caption text-text-muted">Side-by-side performance comparison</p>
        </div>
      </div>

      {/* Case selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-overline mb-1.5">Case A</div>
          <select onChange={e => setCaseA(e.target.value)} value={caseA || ''}
            className="w-full text-caption">
            <option value="">Select…</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>#{c.id} ({c.outcome})</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-overline mb-1.5">Case B</div>
          <select onChange={e => setCaseB(e.target.value)} value={caseB || ''}
            className="w-full text-caption">
            <option value="">Select…</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>#{c.id} ({c.outcome})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison */}
      {(dataA || dataB) && (
        <div className="dash-card !p-4">
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border mb-1">
            <div className="text-right text-headline text-info">#{dataA?.id || '—'}</div>
            <div className="text-center text-overline">vs</div>
            <div className="text-left text-headline text-purple">#{dataB?.id || '—'}</div>
          </div>

          <Stat label="Outcome" a={dataA?.outcome?.toUpperCase()} b={dataB?.outcome?.toUpperCase()} />
          <Stat label="Duration" a={getDuration(dataA)} b={getDuration(dataB)} better="lower" />
          <Stat label="CCF %" a={dataA?.ccf ? `${dataA.ccf}%` : '—'} b={dataB?.ccf ? `${dataB.ccf}%` : '—'} better="higher" />
          <Stat label="CPR Cycles" a={dataA?.cycleNumber} b={dataB?.cycleNumber} />
          <Stat label="Shocks" a={getShockCount(dataA)} b={getShockCount(dataB)} />
          <Stat label="Epi Doses" a={getEpiCount(dataA)} b={getEpiCount(dataB)} />
          <Stat label="Events" a={dataA?.events?.length} b={dataB?.events?.length} />
          <Stat label="EtCO₂ readings" a={dataA?.etco2Readings?.length} b={dataB?.etco2Readings?.length} />
          <Stat label="Initial Rhythm" a={dataA?.patient?.initialRhythm} b={dataB?.patient?.initialRhythm} />
          <Stat label="Mode" a={dataA?.mode?.toUpperCase()} b={dataB?.mode?.toUpperCase()} />
        </div>
      )}

      {!dataA && !dataB && (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-3 inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 99 }}>
            <Layers size={26} strokeWidth={1.6} />
          </div>
          <div className="text-body text-text-muted">Select 2 cases to compare performance</div>
        </div>
      )}
    </div>
  );
}
