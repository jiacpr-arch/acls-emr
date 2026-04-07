import { useEffect, useState } from 'react';
import { getAllCases } from '../db/database';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Statistics Dashboard — overview of all cases
export default function Statistics() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCases().then(data => { setCases(data); setLoading(false); });
  }, []);

  if (loading) return <div className="p-4 text-center text-text-muted">Loading...</div>;

  const completed = cases.filter(c => c.outcome !== 'ongoing');
  const roscCases = completed.filter(c => c.outcome === 'ROSC');
  const roscRate = completed.length > 0 ? Math.round((roscCases.length / completed.length) * 100) : 0;
  const avgCCF = completed.filter(c => c.ccf).length > 0
    ? Math.round(completed.filter(c => c.ccf).reduce((a, b) => a + (b.ccf || 0), 0) / completed.filter(c => c.ccf).length) : 0;
  const clinical = cases.filter(c => c.mode === 'clinical').length;
  const training = cases.filter(c => c.mode === 'training').length;

  // ROSC trend by date
  const byDate = {};
  completed.forEach(c => {
    const date = new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!byDate[date]) byDate[date] = { date, total: 0, rosc: 0 };
    byDate[date].total++;
    if (c.outcome === 'ROSC') byDate[date].rosc++;
  });
  const trendData = Object.values(byDate).map(d => ({ ...d, rate: d.total > 0 ? Math.round((d.rosc / d.total) * 100) : 0 }));

  // Outcome pie
  const outcomeData = [
    { name: 'ROSC', value: roscCases.length, color: '#38A169' },
    { name: 'Terminated', value: completed.filter(c => c.outcome === 'terminated').length, color: '#E53E3E' },
    { name: 'Other', value: completed.filter(c => c.outcome !== 'ROSC' && c.outcome !== 'terminated').length, color: '#8896A6' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-text-primary">📊 Statistics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card !p-4 text-center">
          <div className="text-3xl font-mono font-black text-text-primary">{cases.length}</div>
          <div className="text-xs text-text-muted">Total Cases</div>
        </div>
        <div className="glass-card !p-4 text-center">
          <div className={`text-3xl font-mono font-black ${roscRate >= 50 ? 'text-success' : 'text-warning'}`}>{roscRate}%</div>
          <div className="text-xs text-text-muted">ROSC Rate</div>
        </div>
        <div className="glass-card !p-4 text-center">
          <div className={`text-3xl font-mono font-black ${avgCCF >= 60 ? 'text-success' : 'text-danger'}`}>{avgCCF}%</div>
          <div className="text-xs text-text-muted">Avg CCF</div>
        </div>
        <div className="glass-card !p-4 text-center">
          <div className="text-xl font-mono font-black text-info">{clinical}</div>
          <div className="text-xs text-text-muted">Clinical</div>
          <div className="text-xl font-mono font-black text-purple mt-1">{training}</div>
          <div className="text-xs text-text-muted">Training</div>
        </div>
      </div>

      {/* Outcome pie chart */}
      {outcomeData.length > 0 && (
        <div className="glass-card !p-4">
          <div className="text-xs font-bold text-text-muted uppercase mb-2">Outcomes</div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {outcomeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 ml-4">
              {outcomeData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-text-primary">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROSC trend */}
      {trendData.length >= 2 && (
        <div className="glass-card !p-4">
          <div className="text-xs font-bold text-text-muted uppercase mb-2">ROSC Rate Trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Line type="monotone" dataKey="rate" stroke="#38A169" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No data */}
      {cases.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <div className="text-4xl mb-2">📊</div>
          <div>No cases recorded yet</div>
        </div>
      )}
    </div>
  );
}
