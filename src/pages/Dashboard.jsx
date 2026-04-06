import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCases, deleteCase, getFullCase } from '../db/database';
import { formatTimeLong, formatElapsed } from '../utils/formatTime';
import { exportCasePDF } from '../utils/exportPDF';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'clinical' | 'training'

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
        <Link to="/"
          className="px-4 py-2 bg-danger text-white rounded-xl font-semibold hover:bg-danger-dark transition-colors">
          + New Case
        </Link>
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
    </div>
  );
}

function CaseDetail({ data }) {
  const events = data.events || [];
  const icons = { cpr: '🫀', rhythm: '📈', shock: '⚡', drug: '💉', airway: '🫁', etco2: '🌬️', other: '📝' };

  const duration = data.endTime && data.startTime
    ? Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000)
    : null;

  return (
    <div className="mt-1 ml-6 mr-2 space-y-3 animate-slide-up">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Duration</div>
          <div className="text-sm font-bold font-mono text-text-primary">
            {duration ? formatTimeLong(duration) : '—'}
          </div>
        </div>
        <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Mode</div>
          <div className="text-sm font-bold text-text-primary">{data.mode || '—'}</div>
        </div>
        <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Initial Rhythm</div>
          <div className="text-sm font-bold text-text-primary">{data.patient?.initialRhythm || '—'}</div>
        </div>
      </div>

      {/* Patient info */}
      {data.patient && (data.patient.name || data.patient.age) && (
        <div className="bg-bg-tertiary/20 rounded-lg p-3">
          <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Patient</div>
          <div className="text-xs text-text-primary space-y-0.5">
            {data.patient.name && <div>Name: {data.patient.name}</div>}
            {data.patient.hn && <div>HN: {data.patient.hn}</div>}
            {data.patient.age && <div>Age: {data.patient.age} · {data.patient.gender || ''} · {data.patient.weight ? `${data.patient.weight}kg` : ''}</div>}
            {data.patient.chiefComplaint && <div>CC: {data.patient.chiefComplaint}</div>}
            {data.patient.location && <div>Location: {data.patient.location}</div>}
          </div>
        </div>
      )}

      {/* Team */}
      {data.team && data.team.leader && (
        <div className="bg-bg-tertiary/20 rounded-lg p-3">
          <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Team</div>
          <div className="text-xs text-text-primary space-y-0.5">
            {data.team.leader && <div>👑 Leader: {data.team.leader}</div>}
            {data.team.airway && <div>🫁 Airway: {data.team.airway}</div>}
            {data.team.drugAdmin && <div>💉 Drug: {data.team.drugAdmin}</div>}
            {data.team.recorder && <div>📝 Recorder: {data.team.recorder}</div>}
          </div>
        </div>
      )}

      {/* Event Timeline */}
      {events.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">Timeline ({events.length} events)</div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {events.slice().reverse().map((ev, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-tertiary/20 rounded-lg">
                <span className="text-xs">{icons[ev.category] || '📝'}</span>
                <span className="flex-1 text-xs text-text-primary truncate">{ev.type}</span>
                <span className="text-[10px] text-text-muted font-mono shrink-0">{formatElapsed(ev.elapsed)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EtCO₂ readings */}
      {data.etco2Readings && data.etco2Readings.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">EtCO₂ Readings</div>
          <div className="flex flex-wrap gap-1.5">
            {data.etco2Readings.map((r, i) => (
              <span key={i} className={`text-xs font-mono px-2 py-1 rounded-lg ${
                r.value < 10 ? 'bg-danger/10 text-danger' :
                r.value > 20 ? 'bg-success/10 text-success' :
                'bg-bg-tertiary/50 text-text-primary'
              }`}>
                {r.value} mmHg
              </span>
            ))}
          </div>
          {data.etco2Readings.length >= 2 && (
            <div className="mt-2 bg-bg-tertiary/20 rounded-lg p-2">
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={data.etco2Readings.map(r => ({ time: r.elapsed, value: r.value }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} tickFormatter={v => `${Math.floor(v / 60)}m`} />
                  <YAxis domain={[0, 60]} tick={{ fontSize: 8 }} />
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
