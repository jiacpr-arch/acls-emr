import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCases, deleteCase, getFullCase } from '../db/database';
import { formatTimeLong, formatElapsed } from '../utils/formatTime';
import { exportCasePDF } from '../utils/exportPDF';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import TeachingAnnotation, { AnnotationBadge } from '../components/TeachingAnnotation';
import ShareExport from '../components/ShareExport';
import {
  FileText, HeartPulse, BarChart3, AlertCircle, Plus, Layers,
  Download, Share, Edit, Trash, Play, HelpCircle, Activity, Pill,
  Syringe, Wind, Stethoscope, Zap, ChevronRight,
} from '../components/ui/Icon';

const eventIcons = {
  cpr: HeartPulse,
  rhythm: Activity,
  shock: Zap,
  drug: Syringe,
  airway: Wind,
  access: Syringe,
  etco2: Stethoscope,
  other: FileText,
};

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [annotatingCase, setAnnotatingCase] = useState(null);
  const [sharingCase, setSharingCase] = useState(null);

  const loadCases = useCallback(async () => {
    const data = await getAllCases();
    setCases(data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCases(); }, [loadCases]);

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
    <div className="page-container space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title text-text-primary">Dashboard</h1>
          <p className="text-caption text-text-muted mt-0.5">Recorded cases & analytics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/compare"
            className="btn btn-ghost btn-sm">
            <Layers size={14} strokeWidth={2} /> Compare
          </Link>
          <Link to="/" className="btn btn-danger btn-sm">
            <Plus size={14} strokeWidth={2.4} /> New Case
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Cases" value={stats.total} Icon={FileText} tone="info" />
        <StatCard label="ROSC" value={stats.rosc} Icon={HeartPulse} tone="success" />
        <StatCard label="ROSC Rate" value={`${stats.roscRate}%`} Icon={BarChart3} tone="warning" />
        <StatCard label="Ongoing" value={stats.ongoing} Icon={AlertCircle} tone="danger" pulse={stats.ongoing > 0} />
      </div>

      {/* Mode Filter — segmented control */}
      <div className="tab-group">
        {[
          { key: 'all', label: 'All' },
          { key: 'clinical', label: 'Clinical' },
          { key: 'training', label: 'Training' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterMode(f.key)}
            className={`tab-item ${filterMode === f.key ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="dash-card">
        <h2 className="text-headline text-text-primary mb-3">Recent Cases</h2>

        {loading ? (
          <div className="text-center py-10 text-text-muted text-caption">Loading…</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-3 inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
              style={{ borderRadius: 'var(--radius-full)' }}>
              <FileText size={26} strokeWidth={1.6} />
            </div>
            <div className="text-body text-text-muted">No cases recorded yet</div>
            <Link to="/" className="inline-flex items-center gap-1 text-info text-caption mt-2 font-semibold hover:underline">
              Start your first case <ChevronRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredCases.map(c => (
              <div key={c.id}>
                <div onClick={() => handleSelect(c.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    selectedCase === c.id
                      ? 'bg-info/8 border border-info/30'
                      : 'bg-bg-primary hover:bg-bg-tertiary border border-transparent'
                  }`}
                  style={{ borderRadius: 'var(--radius-md)' }}>
                  <OutcomeDot outcome={c.outcome} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-body-strong text-text-primary">#{c.id}</span>
                      <span className={`badge ${
                        c.mode === 'training' ? 'bg-info/15 text-info' : 'bg-danger/15 text-danger'
                      }`}>{c.mode === 'training' ? 'TRN' : 'CLN'}</span>
                    </div>
                    <div className="text-caption text-text-muted truncate">
                      {c.patient?.name || 'No patient info'} · {c.patient?.initialRhythm || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`badge ${
                      c.outcome === 'ROSC' ? 'bg-success/15 text-success' :
                      c.outcome === 'terminated' ? 'bg-danger/15 text-danger' :
                      c.outcome === 'ongoing' ? 'bg-warning/15 text-warning' :
                      'bg-bg-tertiary text-text-muted'
                    }`}>
                      {c.outcome?.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-text-muted mt-1 font-mono">
                      {new Date(c.startTime).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {c.outcome === 'ongoing' && (
                      <Link to="/recording" className="btn btn-danger btn-sm">
                        <Play size={12} strokeWidth={2.4} /> Resume
                      </Link>
                    )}
                    {c.outcome !== 'ongoing' && (
                      <>
                        <IconBtn onClick={() => handleExport(c.id)} tone="info" Icon={Download} title="Export PDF" />
                        <IconBtn onClick={async () => { const d = await getFullCase(c.id); setSharingCase(d); }} tone="success" Icon={Share} title="Share" />
                      </>
                    )}
                    <IconBtn onClick={() => setAnnotatingCase(c.id)} tone="purple" Icon={Edit} title="Note" />
                    <AnnotationBadge caseId={c.id} />
                    <IconBtn onClick={() => handleDelete(c.id)} tone="danger" Icon={Trash} title="Delete" />
                  </div>
                </div>

                {selectedCase === c.id && detailData && (
                  <CaseDetail data={detailData} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {annotatingCase && (
        <TeachingAnnotation caseId={annotatingCase} onClose={() => setAnnotatingCase(null)} />
      )}
      {sharingCase && (
        <ShareExport caseData={sharingCase} onClose={() => setSharingCase(null)} />
      )}
    </div>
  );
}

function OutcomeDot({ outcome }) {
  const cls =
    outcome === 'ROSC' ? 'bg-success' :
    outcome === 'terminated' ? 'bg-danger' :
    outcome === 'ongoing' ? 'bg-warning animate-pulse' :
    'bg-text-muted';
  return (
    <div className="relative shrink-0">
      <div className={`w-2.5 h-2.5 ${cls}`} style={{ borderRadius: 99 }} />
      {outcome === 'ongoing' && (
        <div className="absolute inset-0 bg-warning animate-ping" style={{ borderRadius: 99 }} />
      )}
    </div>
  );
}

function IconBtn({ onClick, tone, Icon, title }) {
  const tones = {
    info: 'bg-info/10 text-info hover:bg-info/15',
    success: 'bg-success/10 text-success hover:bg-success/15',
    purple: 'bg-purple/10 text-purple hover:bg-purple/15',
    danger: 'bg-danger/10 text-danger hover:bg-danger/15',
  };
  return (
    <button onClick={onClick} title={title}
      className={`w-8 h-8 inline-flex items-center justify-center transition-colors ${tones[tone]}`}
      style={{ borderRadius: 'var(--radius-sm)' }}>
      <Icon size={14} strokeWidth={2.2} />
    </button>
  );
}

function CaseDetail({ data }) {
  const [tab, setTab] = useState('summary');
  const events = data.events || [];

  const duration = data.endTime && data.startTime
    ? Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000)
    : null;

  const epiEvents = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion'));
  const shockEvents = events.filter(e => e.category === 'shock');
  const firstEpi = epiEvents.length > 0 ? epiEvents[epiEvents.length - 1] : null;
  const lastRhythm = events.find(e => e.category === 'rhythm');

  const drugEvents = events.filter(e => e.category === 'drug');
  const drugGroups = {};
  drugEvents.forEach(e => {
    const name = e.type?.replace('💉 ', '').replace('💊 ', '').split(' – ')[0]?.trim() || 'Unknown';
    if (!drugGroups[name]) drugGroups[name] = [];
    drugGroups[name].push(e);
  });

  const suspectedCauses = events.filter(e => e.type?.includes('🔍 Suspected cause'));
  const correctedCauses = events.filter(e => e.type?.includes('✅ Corrected'));
  const labEvents = events.filter(e => e.type?.includes('🔬 Labs'));

  return (
    <div className="mt-2 mx-1 space-y-2 animate-slide-up">
      <div className="tab-group">
        <button onClick={() => setTab('summary')} className={`tab-item ${tab === 'summary' ? 'active' : ''}`}>Summary</button>
        <button onClick={() => setTab('ht')} className={`tab-item ${tab === 'ht' ? 'active' : ''}`}>
          H&T/Labs
          {(suspectedCauses.length > 0 || labEvents.length > 0) && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-warning/20 text-warning text-[9px] font-bold"
              style={{ borderRadius: 99 }}>
              {suspectedCauses.length + labEvents.length}
            </span>
          )}
        </button>
        <button onClick={() => setTab('timeline')} className={`tab-item ${tab === 'timeline' ? 'active' : ''}`}>Timeline</button>
      </div>

      {tab === 'summary' && (
        <div className="space-y-2">
          {/* Code summary card */}
          <div className="dash-card !p-3">
            <div className="text-overline">Code Summary</div>
            <div className="text-numeric text-2xl text-text-primary mt-0.5">{duration ? formatTimeLong(duration) : '—'}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted mt-1.5 font-mono">
              <span>Start: {data.startTime ? new Date(data.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span>End: {data.endTime ? new Date(data.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span className={`font-bold ${data.outcome === 'ROSC' ? 'text-success' : 'text-danger'}`}>{data.outcome?.toUpperCase()}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <DetailStat label="Compressions" value={data.cycleNumber || '—'} unit="cycles" extra={
              <span className={`text-[11px] font-mono font-bold ${
                (data.ccf || 0) >= 80 ? 'text-success' : (data.ccf || 0) >= 60 ? 'text-warning' : 'text-danger'
              }`}>{data.ccf || 0}% CCF</span>
            } />
            <DetailStat label="Epinephrine" value={epiEvents.length} unit="doses" extra={
              firstEpi ? <span className="text-[10px] text-text-muted">First: {formatElapsed(firstEpi.elapsed)}</span> : null
            } />
            <DetailStat label="Rhythm" value={
              <span className="text-sm">{lastRhythm?.type?.replace('Rhythm: ', '') || data.patient?.initialRhythm || '—'}</span>
            } unit={`Initial: ${data.patient?.initialRhythm || '—'}`} extra={
              <span className="text-[10px] text-text-muted">Shocks: {shockEvents.length}</span>
            } />
            <DetailStat label="Patient" value={
              data.patient?.name ? <span className="text-sm truncate block">{data.patient.name}</span> : '—'
            } unit={data.patient ? `${data.patient.age ? data.patient.age + 'y' : ''} ${data.patient.gender || ''} ${data.patient.hn ? '#' + data.patient.hn : ''}` : 'No info'} />
          </div>

          {/* All Drugs */}
          {Object.keys(drugGroups).length > 0 && (
            <div className="dash-card !p-3">
              <div className="text-overline mb-2 flex items-center gap-1.5"><Pill size={12} strokeWidth={2} /> Drugs Given</div>
              <div className="space-y-1.5">
                {Object.entries(drugGroups).map(([name, evts]) => (
                  <div key={name} className="flex items-start gap-2">
                    <span className="text-[11px] font-bold text-text-primary min-w-[80px] shrink-0">{name}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1">
                        {evts.slice().reverse().map((e, i) => (
                          <span key={i} className="text-[10px] font-mono bg-bg-tertiary px-1.5 py-0.5 text-text-secondary"
                            style={{ borderRadius: 'var(--radius-sm)' }}>
                            {formatElapsed(e.elapsed)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-info shrink-0">x{evts.length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.team && data.team.leader && (
            <div className="dash-card !p-3">
              <div className="text-overline mb-1">Team</div>
              <div className="text-[11px] text-text-secondary space-y-0.5">
                {data.team.leader && <div>Leader: <span className="text-text-primary font-semibold">{data.team.leader}</span></div>}
                {data.team.airway && <div>Airway: <span className="text-text-primary font-semibold">{data.team.airway}</span></div>}
                {data.team.drugAdmin && <div>Drug: <span className="text-text-primary font-semibold">{data.team.drugAdmin}</span></div>}
              </div>
            </div>
          )}

          {data.etco2Readings && data.etco2Readings.length > 0 && (
            <div className="dash-card !p-3">
              <div className="text-overline mb-2 flex items-center gap-1.5"><Wind size={12} strokeWidth={2} /> EtCO2</div>
              <div className="flex flex-wrap gap-1">
                {data.etco2Readings.map((r, i) => (
                  <span key={i} className={`text-[11px] font-mono px-1.5 py-0.5 ${
                    r.value < 10 ? 'bg-danger/10 text-danger' :
                    r.value > 20 ? 'bg-success/10 text-success' :
                    'bg-bg-tertiary text-text-primary'
                  }`} style={{ borderRadius: 'var(--radius-sm)' }}>{r.value}</span>
                ))}
              </div>
              {data.etco2Readings.length >= 2 && (
                <div className="mt-2">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={data.etco2Readings.map(r => ({ time: r.elapsed, value: r.value }))} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 8 }} tickFormatter={v => `${Math.floor(v / 60)}m`} />
                      <YAxis domain={[0, 60]} tick={{ fontSize: 8 }} />
                      <ReferenceLine y={20} stroke="#059669" strokeDasharray="3 3" />
                      <ReferenceLine y={10} stroke="#DC2626" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="value" stroke="#2563EB" dot={{ r: 2 }} strokeWidth={1.6} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'ht' && (
        <div className="space-y-2">
          <div className="dash-card !p-3">
            <div className="text-overline mb-2 flex items-center gap-1.5"><HelpCircle size={12} strokeWidth={2} /> Reversible Causes Investigated</div>
            {suspectedCauses.length === 0 ? (
              <div className="text-caption text-text-muted py-2 text-center">No causes investigated</div>
            ) : (
              <div className="space-y-1.5">
                {suspectedCauses.slice().reverse().map((ev, i) => {
                  const causeName = ev.details?.cause || ev.type?.replace('🔍 Suspected cause: ', '') || '';
                  const correction = correctedCauses.find(c => c.details?.cause === causeName);
                  return (
                    <div key={i} className={`p-2 ${correction ? 'bg-success/8 border border-success/30' : 'bg-warning/8 border border-warning/30'}`}
                      style={{ borderRadius: 'var(--radius)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-body-strong text-text-primary">{causeName}</span>
                        <span className={`badge ${correction ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                          {correction ? 'CORRECTED' : 'SUSPECTED'}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1 font-mono">
                        Investigated: {formatElapsed(ev.elapsed)}
                        {ev.details?.category && <span className="ml-2">({ev.details.category})</span>}
                      </div>
                      {correction && (
                        <div className="text-[10px] text-success mt-0.5">
                          Corrected: {formatElapsed(correction.elapsed)} → {correction.details?.treatment || ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-card !p-3">
            <div className="text-overline mb-2">Lab Results</div>
            {labEvents.length === 0 ? (
              <div className="text-caption text-text-muted py-2 text-center">No labs recorded</div>
            ) : (
              <div className="space-y-1.5">
                {labEvents.slice().reverse().map((ev, i) => {
                  const d = ev.details || {};
                  return (
                    <div key={i} className="bg-bg-primary p-2" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="text-[10px] font-mono text-text-muted mb-1">{formatElapsed(ev.elapsed)}</div>
                      <div className="grid grid-cols-5 gap-1 text-center">
                        <LabValue label="DTX" value={d.dtx} unit="mg/dL" low={60} high={250} />
                        <LabValue label="Hb" value={d.hb} unit="g/dL" low={7} />
                        <LabValue label="Hct" value={d.hct} unit="%" low={21} />
                        <LabValue label="K+" value={d.k} unit="mEq/L" low={3.5} high={5.5} />
                        <LabValue label="Lac" value={d.lactate} unit="mmol/L" high={4} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div>
          {events.length === 0 ? (
            <div className="text-center text-text-muted text-caption py-4">No events</div>
          ) : (
            <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
              {events.slice().reverse().map((ev, i) => {
                const I = eventIcons[ev.category] || FileText;
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-2 bg-bg-primary border border-border-strong/40"
                    style={{ borderRadius: 'var(--radius)' }}>
                    <div className="flex flex-col items-center shrink-0 w-12">
                      <span className="text-[10px] font-mono font-bold text-text-primary">{formatElapsed(ev.elapsed)}</span>
                      <span className="text-[9px] text-text-muted">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="w-7 h-7 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      <I size={14} strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-caption text-text-primary">{ev.type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailStat({ label, value, unit, extra }) {
  return (
    <div className="dash-card !p-3">
      <div className="text-overline">{label}</div>
      <div className="text-numeric text-lg text-text-primary mt-0.5">{value}</div>
      <div className="text-[10px] text-text-muted">{unit}</div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}

function LabValue({ label, value, unit, low, high }) {
  if (value == null) return <div className="text-[9px] text-text-muted">—</div>;
  const isLow = low != null && value < low;
  const isHigh = high != null && value > high;
  const colorClass = isLow || isHigh ? 'text-danger font-bold' : 'text-text-primary';
  return (
    <div>
      <div className="text-[8px] text-text-muted uppercase font-bold tracking-wider">{label}</div>
      <div className={`text-[12px] font-mono font-bold ${colorClass}`}>{value}</div>
      <div className="text-[7px] text-text-muted">{unit}</div>
    </div>
  );
}

function StatCard({ label, value, Icon, tone, pulse }) {
  const tones = {
    info: 'bg-info/12 text-info',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
  };
  return (
    <div className="stat-box">
      <div className={`w-10 h-10 mx-auto mb-2 inline-flex items-center justify-center ${tones[tone]} ${pulse ? 'animate-pulse' : ''}`}
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className={`stat-value text-2xl ${
        tone === 'info' ? 'text-info' :
        tone === 'success' ? 'text-success' :
        tone === 'warning' ? 'text-warning' :
        tone === 'danger' ? 'text-danger' : 'text-text-primary'
      }`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
