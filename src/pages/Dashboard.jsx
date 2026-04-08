import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCases, deleteCase, getFullCase } from '../db/database';
import { formatTimeLong, formatElapsed } from '../utils/formatTime';
import { exportCasePDF } from '../utils/exportPDF';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import TeachingAnnotation, { AnnotationBadge } from '../components/TeachingAnnotation';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [annotatingCase, setAnnotatingCase] = useState(null); // 'all' | 'clinical' | 'training'

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    const data = await getAllCases();
    setCases(data);
    setLoading(false);
  };

  const handleExport = async (caseId) => {
    const data = await getFullCase(caseId);
    if (data) exportCasePDF(data);
  };

  const handleDelete = async (caseId) => {
    if (confirm(`Delete case ${caseId}?`)) {
      await deleteCase(caseId);
      if (selectedCase === caseId) { setSelectedCase(null); setDetailData(null); }
      loadCases();
    }
  };

  const handleSelect = async (caseId) => {
    if (selectedCase === caseId) {
      setSelectedCase(null);
      setDetailData(null);
      return;
    }
    setSelectedCase(caseId);
    const data = await getFullCase(caseId);
    setDetailData(data);
  };

  const filteredCases = filterMode === 'all' ? cases : cases.filter(c => c.mode === filterMode);

  const stats = {
    total: filteredCases.length,
    rosc: filteredCases.filter(c => c.outcome === 'ROSC').length,
    roscRate: filteredCases.length > 0 ? Math.round((filteredCases.filter(c => c.outcome === 'ROSC').length / filteredCases.length) * 100) : 0,
    ongoing: filteredCases.filter(c => c.outcome === 'ongoing').length,
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/compare"
            className="px-3 py-2 bg-info/10 text-info rounded-xl font-semibold text-xs">
            📊 Compare
          </Link>
          <Link to="/"
            className="px-4 py-2 bg-danger text-white rounded-xl font-semibold hover:bg-danger-dark transition-colors">
          + New Case
        </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Cases" value={stats.total} icon="📋" color="text-info" />
        <StatCard label="ROSC" value={stats.rosc} icon="💚" color="text-success" />
        <StatCard label="ROSC Rate" value={`${stats.roscRate}%`} icon="📊" color="text-warning" />
        <StatCard label="Ongoing" value={stats.ongoing} icon="🔴" color="text-danger" />
      </div>

      {/* Mode Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'clinical', label: 'Clinical' },
          { key: 'training', label: 'Training' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterMode(f.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filterMode === f.key
                ? (f.key === 'training' ? 'bg-info text-white' : f.key === 'clinical' ? 'bg-danger text-white' : 'bg-bg-tertiary text-text-primary')
                : 'bg-bg-secondary text-text-muted'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="bg-bg-secondary rounded-xl p-4">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Recent Cases</h2>

        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-text-muted">No cases recorded yet</div>
            <Link to="/" className="text-info hover:underline text-sm mt-1 inline-block">
              Start your first case →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCases.map(c => (
              <div key={c.id}>
                <div onClick={() => handleSelect(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedCase === c.id ? 'bg-info/5 border border-info/20' : 'bg-bg-primary hover:bg-bg-tertiary/30'
                  }`}>
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    c.outcome === 'ROSC' ? 'bg-success' :
                    c.outcome === 'terminated' ? 'bg-danger' :
                    c.outcome === 'ongoing' ? 'bg-warning animate-pulse' :
                    'bg-text-muted'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary">#{c.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        c.mode === 'training' ? 'bg-info/15 text-info' : 'bg-danger/15 text-danger'
                      }`}>{c.mode === 'training' ? 'TRN' : 'CLN'}</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      {c.patient?.name || 'No patient info'} · {c.patient?.initialRhythm || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.outcome === 'ROSC' ? 'bg-success/20 text-success' :
                      c.outcome === 'terminated' ? 'bg-danger/20 text-danger' :
                      c.outcome === 'ongoing' ? 'bg-warning/20 text-warning' :
                      'bg-bg-tertiary text-text-muted'
                    }`}>
                      {c.outcome?.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {new Date(c.startTime).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {c.outcome === 'ongoing' && (
                      <Link to="/recording" className="text-xs px-2 py-1.5 bg-danger text-white rounded-lg font-medium">
                        Resume
                      </Link>
                    )}
                    {c.outcome !== 'ongoing' && (
                      <button onClick={() => handleExport(c.id)}
                        className="text-xs px-2 py-1.5 bg-info/10 text-info rounded-lg font-medium">
                        PDF
                      </button>
                    )}
                    <button onClick={() => setAnnotatingCase(c.id)}
                      className="text-xs px-2 py-1.5 bg-purple/10 text-purple rounded-lg font-medium">
                      📝
                    </button>
                    <AnnotationBadge caseId={c.id} />
                    <button onClick={() => handleDelete(c.id)}
                      className="text-xs px-2 py-1.5 bg-danger/10 text-danger rounded-lg font-medium">
                      ✕
                    </button>
                  </div>
                </div>

                {/* Case Detail Expansion */}
                {selectedCase === c.id && detailData && (
                  <CaseDetail data={detailData} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teaching Annotation overlay */}
      {annotatingCase && (
        <TeachingAnnotation caseId={annotatingCase} onClose={() => setAnnotatingCase(null)} />
      )}
    </div>
  );
}

function CaseDetail({ data }) {
  const [tab, setTab] = useState('summary');
  const events = data.events || [];
  const icons = { cpr: '🫀', rhythm: '📈', shock: '⚡', drug: '💉', airway: '🫁', access: '💉', etco2: '🌬️', other: '📝' };

  const duration = data.endTime && data.startTime
    ? Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000)
    : null;

  // Computed stats
  const epiEvents = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion'));
  const shockEvents = events.filter(e => e.category === 'shock');
  const firstEpi = epiEvents.length > 0 ? epiEvents[epiEvents.length - 1] : null;
  const lastEpi = epiEvents.length > 0 ? epiEvents[0] : null;
  const lastRhythm = events.find(e => e.category === 'rhythm');

  return (
    <div className="mt-1 ml-2 mr-2 space-y-2 animate-slide-up">
      {/* Tab navigation */}
      <div className="tab-group">
        <button onClick={() => setTab('summary')} className={`tab-item ${tab === 'summary' ? 'active' : ''}`}>Summary</button>
        <button onClick={() => setTab('timeline')} className={`tab-item ${tab === 'timeline' ? 'active' : ''}`}>Timeline</button>
      </div>

      {tab === 'summary' && (
        <div className="space-y-2">
          {/* Code card */}
          <div className="bg-bg-tertiary/20 rounded-lg p-3">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Code Summary</div>
            <div className="text-xl font-mono font-black text-text-primary">{duration ? formatTimeLong(duration) : '—'}</div>
            <div className="flex gap-4 text-[10px] text-text-muted mt-1">
              <span>Start: {data.startTime ? new Date(data.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span>End: {data.endTime ? new Date(data.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span className={`font-bold ${data.outcome === 'ROSC' ? 'text-success' : 'text-danger'}`}>{data.outcome?.toUpperCase()}</span>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Compressions */}
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] text-text-muted uppercase font-semibold">Compressions</div>
              <div className="text-lg font-mono font-black text-text-primary">{data.cycleNumber || '—'}</div>
              <div className="text-[9px] text-text-muted">cycles</div>
              <div className={`text-xs font-mono font-bold mt-0.5 ${
                (data.ccf || 0) >= 80 ? 'text-success' : (data.ccf || 0) >= 60 ? 'text-warning' : 'text-danger'
              }`}>{data.ccf || 0}% CCF</div>
            </div>
            {/* Epinephrine */}
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] text-text-muted uppercase font-semibold">Epinephrine</div>
              <div className="text-lg font-mono font-black text-text-primary">{epiEvents.length}</div>
              <div className="text-[9px] text-text-muted">doses</div>
              {firstEpi && <div className="text-[9px] text-text-muted mt-0.5">First: {formatElapsed(firstEpi.elapsed)}</div>}
            </div>
            {/* Rhythm */}
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] text-text-muted uppercase font-semibold">Rhythm</div>
              <div className="text-sm font-bold text-text-primary">{lastRhythm?.type?.replace('Rhythm: ', '') || data.patient?.initialRhythm || '—'}</div>
              <div className="text-[9px] text-text-muted">Initial: {data.patient?.initialRhythm || '—'}</div>
              <div className="text-[9px] text-text-muted">Shocks: {shockEvents.length}</div>
            </div>
            {/* Patient */}
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] text-text-muted uppercase font-semibold">Patient</div>
              {data.patient?.name ? (
                <>
                  <div className="text-sm font-bold text-text-primary truncate">{data.patient.name}</div>
                  <div className="text-[9px] text-text-muted">{data.patient.age ? `${data.patient.age}y` : ''} {data.patient.gender || ''} {data.patient.hn ? `#${data.patient.hn}` : ''}</div>
                </>
              ) : (
                <div className="text-xs text-text-muted">No info</div>
              )}
            </div>
          </div>

          {/* Team */}
          {data.team && data.team.leader && (
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-text-muted uppercase mb-1">Team</div>
              <div className="text-[10px] text-text-primary space-y-0.5">
                {data.team.leader && <span>👑 {data.team.leader} </span>}
                {data.team.airway && <span>🫁 {data.team.airway} </span>}
                {data.team.drugAdmin && <span>💉 {data.team.drugAdmin} </span>}
              </div>
            </div>
          )}

          {/* EtCO₂ readings */}
          {data.etco2Readings && data.etco2Readings.length > 0 && (
            <div className="bg-bg-tertiary/20 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-text-muted uppercase mb-1">EtCO₂</div>
              <div className="flex flex-wrap gap-1">
                {data.etco2Readings.map((r, i) => (
                  <span key={i} className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    r.value < 10 ? 'bg-danger/10 text-danger' :
                    r.value > 20 ? 'bg-success/10 text-success' :
                    'bg-bg-tertiary/50 text-text-primary'
                  }`}>{r.value}</span>
                ))}
              </div>
              {data.etco2Readings.length >= 2 && (
                <div className="mt-1.5">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={data.etco2Readings.map(r => ({ time: r.elapsed, value: r.value }))} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 7 }} tickFormatter={v => `${Math.floor(v / 60)}m`} />
                      <YAxis domain={[0, 60]} tick={{ fontSize: 7 }} />
                      <ReferenceLine y={20} stroke="#16A34A" strokeDasharray="3 3" />
                      <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="value" stroke="#2563EB" dot={{ r: 2 }} strokeWidth={1.5} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timeline tab */}
      {tab === 'timeline' && (
        <div>
          {events.length === 0 ? (
            <div className="text-center text-text-muted text-xs py-4">No events</div>
          ) : (
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {events.slice().reverse().map((ev, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-2 bg-bg-tertiary/15 rounded-lg">
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <span className="text-[10px] font-mono font-bold text-text-primary">{formatElapsed(ev.elapsed)}</span>
                    <span className="text-[8px] text-text-muted">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span className="text-sm shrink-0">{icons[ev.category] || '📝'}</span>
                  <span className="flex-1 text-xs text-text-primary">{ev.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
