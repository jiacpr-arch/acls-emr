import { useEffect, useState } from 'react';
import { getAllCases } from '../db/database';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, FileText, HeartPulse, Activity, Hospital, GraduationCap } from '../components/ui/Icon';

export default function Statistics() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCases().then(data => { setCases(data); setLoading(false); });
  }, []);

  if (loading) return <div className="page-container text-center text-text-muted text-caption py-10">Loading…</div>;

  const completed = cases.filter(c => c.outcome !== 'ongoing');
  const roscCases = completed.filter(c => c.outcome === 'ROSC');
  const roscRate = completed.length > 0 ? Math.round((roscCases.length / completed.length) * 100) : 0;
  const avgCCF = completed.filter(c => c.ccf).length > 0
    ? Math.round(completed.filter(c => c.ccf).reduce((a, b) => a + (b.ccf || 0), 0) / completed.filter(c => c.ccf).length) : 0;
  const clinical = cases.filter(c => c.mode === 'clinical').length;
  const training = cases.filter(c => c.mode === 'training').length;

  const byDate = {};
  completed.forEach(c => {
    const date = new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!byDate[date]) byDate[date] = { date, total: 0, rosc: 0 };
    byDate[date].total++;
    if (c.outcome === 'ROSC') byDate[date].rosc++;
  });
  const trendData = Object.values(byDate).map(d => ({ ...d, rate: d.total > 0 ? Math.round((d.rosc / d.total) * 100) : 0 }));

  const outcomeData = [
    { name: 'ROSC', value: roscCases.length, color: '#059669' },
    { name: 'Terminated', value: completed.filter(c => c.outcome === 'terminated').length, color: '#DC2626' },
    { name: 'Other', value: completed.filter(c => c.outcome !== 'ROSC' && c.outcome !== 'terminated').length, color: '#7A8699' },
  ].filter(d => d.value > 0);

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BarChart3 size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">Statistics</h1>
          <p className="text-caption text-text-muted">Outcomes & training analytics</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <BigStat Icon={FileText} tone="info" value={cases.length} label="Total Cases" />
        <BigStat Icon={HeartPulse} tone={roscRate >= 50 ? 'success' : 'warning'} value={`${roscRate}%`} label="ROSC Rate" />
        <BigStat Icon={Activity} tone={avgCCF >= 60 ? 'success' : 'danger'} value={`${avgCCF}%`} label="Avg CCF" />
        <div className="dash-card text-center">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="w-8 h-8 mx-auto inline-flex items-center justify-center bg-danger/12 text-danger mb-1"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <Hospital size={15} strokeWidth={2.2} />
              </div>
              <div className="text-numeric text-xl text-info">{clinical}</div>
              <div className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Clinical</div>
            </div>
            <div>
              <div className="w-8 h-8 mx-auto inline-flex items-center justify-center bg-purple/12 text-purple mb-1"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <GraduationCap size={15} strokeWidth={2.2} />
              </div>
              <div className="text-numeric text-xl text-purple">{training}</div>
              <div className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Training</div>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome pie chart */}
      {outcomeData.length > 0 && (
        <div className="dash-card">
          <div className="section-header">Outcomes</div>
          <div className="flex items-center justify-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={42} outerRadius={66} dataKey="value" stroke="none">
                  {outcomeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {outcomeData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" style={{ background: d.color, borderRadius: 99 }} />
                  <span className="text-caption text-text-primary">{d.name}</span>
                  <span className="text-caption font-mono font-bold text-text-muted">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROSC trend */}
      {trendData.length >= 2 && (
        <div className="dash-card">
          <div className="section-header">ROSC Rate Trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2.2} dot={{ r: 3, fill: '#059669' }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No data */}
      {cases.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-3 inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 99 }}>
            <BarChart3 size={26} strokeWidth={1.6} />
          </div>
          <div className="text-body text-text-muted">No cases recorded yet</div>
        </div>
      )}
    </div>
  );
}

function BigStat({ Icon, tone, value, label }) {
  const tones = {
    info: 'bg-info/12 text-info',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
  };
  const valueColor = {
    info: 'text-info', success: 'text-success', warning: 'text-warning', danger: 'text-danger',
  };
  return (
    <div className="dash-card text-center">
      <div className={`w-10 h-10 mx-auto mb-2 inline-flex items-center justify-center ${tones[tone]}`}
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className={`text-numeric text-3xl ${valueColor[tone]}`}>{value}</div>
      <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
