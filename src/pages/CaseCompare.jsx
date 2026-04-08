import { useState, useEffect } from 'react';
import { getAllCases, getFullCase } from '../db/database';

// Case Comparison — compare 2 cases side by side
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
      <div className="grid grid-cols-3 gap-2 items-center py-1.5">
        <div className={`text-right text-sm font-mono font-bold ${aWin && caseB ? 'text-success' : 'text-text-primary'}`}>{a || '-'}</div>
        <div className="text-center text-[10px] text-text-muted">{label}</div>
        <div className={`text-left text-sm font-mono font-bold ${bWin && caseA ? 'text-success' : 'text-text-primary'}`}>{b || '-'}</div>
      </div>
    );
  };

  const getEpiCount = (data) => data?.events?.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')).length || 0;
  const getShockCount = (data) => data?.events?.filter(e => e.category === 'shock').length || 0;
  const getDuration = (data) => {
    if (!data?.startTime || !data?.endTime) return '-';
    const s = Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-text-primary">📊 Compare Cases</h1>

      {/* Case selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Case A</div>
          <select onChange={e => setCaseA(e.target.value)} value={caseA || ''}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary text-xs text-text-primary">
            <option value="">Select...</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>#{c.id} ({c.outcome})</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Case B</div>
          <select onChange={e => setCaseB(e.target.value)} value={caseB || ''}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-bg-tertiary text-xs text-text-primary">
            <option value="">Select...</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>#{c.id} ({c.outcome})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison */}
      {(dataA || dataB) && (
        <div className="glass-card !p-4 space-y-1">
          {/* Headers */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-bg-tertiary">
            <div className="text-right text-xs font-bold text-info">#{dataA?.id || '-'}</div>
            <div className="text-center text-[9px] text-text-muted font-bold">vs</div>
            <div className="text-left text-xs font-bold text-purple">#{dataB?.id || '-'}</div>
          </div>

          <Stat label="Outcome" a={dataA?.outcome?.toUpperCase()} b={dataB?.outcome?.toUpperCase()} />
          <Stat label="Duration" a={getDuration(dataA)} b={getDuration(dataB)} better="lower" />
          <Stat label="CCF %" a={dataA?.ccf ? `${dataA.ccf}%` : '-'} b={dataB?.ccf ? `${dataB.ccf}%` : '-'} better="higher" />
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
        <div className="text-center py-8 text-text-muted text-xs">
          Select 2 cases to compare performance
        </div>
      )}
    </div>
  );
}
