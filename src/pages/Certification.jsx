import { useState, useEffect } from 'react';
import { getAllCases } from '../db/database';
import { scenarios } from '../data/scenarios';

// Certification Tracker — complete scenarios + pass exam → get certificate
const CERT_KEY = 'acls_certification';

function getCertData() {
  try { return JSON.parse(localStorage.getItem(CERT_KEY) || '{}'); }
  catch { return {}; }
}

function saveCertData(data) {
  localStorage.setItem(CERT_KEY, JSON.stringify(data));
}

export default function Certification() {
  const [cases, setCases] = useState([]);
  const [certData, setCertData] = useState(getCertData());
  const [studentName, setStudentName] = useState(certData.studentName || '');

  useEffect(() => { getAllCases().then(setCases); }, []);

  const trainingCases = cases.filter(c => c.mode === 'training' && c.outcome !== 'ongoing');
  const totalScenarios = scenarios.length;

  // Track completed scenarios (simplified — checks if training cases exist)
  const basicDone = trainingCases.filter(c => c.events?.length >= 3).length >= 3;
  const interDone = trainingCases.filter(c => c.events?.length >= 5).length >= 1;
  const megaDone = trainingCases.filter(c => c.events?.length >= 7).length >= 1;
  const avgScore = trainingCases.length > 0
    ? Math.round(trainingCases.reduce((a, c) => a + (c.ccf || 50), 0) / trainingCases.length)
    : 0;
  const passExam = avgScore >= 80;

  const requirements = [
    { label: 'Complete 3+ Basic scenarios', done: basicDone, icon: '📗' },
    { label: 'Complete 1+ Intermediate scenario', done: interDone, icon: '📙' },
    { label: 'Complete 1+ Megacode scenario', done: megaDone, icon: '📕' },
    { label: 'Average score ≥ 80%', done: passExam, icon: '📊' },
  ];

  const allDone = requirements.every(r => r.done);
  const progress = Math.round((requirements.filter(r => r.done).length / requirements.length) * 100);

  const generateCertificate = () => {
    const data = {
      studentName,
      completedAt: new Date().toISOString(),
      scenariosDone: trainingCases.length,
      avgScore,
      certId: `JIA-ACLS-${Date.now().toString(36).toUpperCase()}`,
    };
    saveCertData({ ...certData, ...data, studentName });
    setCertData({ ...certData, ...data, studentName });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-text-primary">🏆 Certification</h1>

      {/* Progress */}
      <div className="glass-card !p-4 text-center">
        <div className={`text-4xl font-black ${allDone ? 'text-success' : 'text-warning'}`}>{progress}%</div>
        <div className="text-xs text-text-muted mt-1">
          {allDone ? '🎉 All requirements met!' : 'Complete requirements to earn certificate'}
        </div>
        <div className="progress-track !h-2 mt-3">
          <div className={`progress-fill ${allDone ? 'bg-success' : 'bg-info'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        {requirements.map((r, i) => (
          <div key={i} className={`glass-card !p-3 flex items-center gap-3 ${r.done ? 'border-success/30' : ''} border`}>
            <span className="text-xl">{r.icon}</span>
            <span className="flex-1 text-xs font-semibold text-text-primary">{r.label}</span>
            <span className={`text-sm font-bold ${r.done ? 'text-success' : 'text-text-muted'}`}>
              {r.done ? '✅' : '○'}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-box">
          <div className="stat-value text-lg text-text-primary">{trainingCases.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box">
          <div className={`stat-value text-lg ${avgScore >= 80 ? 'text-success' : 'text-warning'}`}>{avgScore}%</div>
          <div className="stat-label">Avg Score</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-lg text-text-primary">{totalScenarios}</div>
          <div className="stat-label">Total Scenarios</div>
        </div>
      </div>

      {/* Student name + Generate */}
      {allDone && (
        <div className="glass-card !p-4 space-y-3">
          <div className="text-sm font-bold text-success text-center">🎉 Congratulations!</div>
          <input type="text" value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Enter your name for certificate"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info text-center" />
          <button onClick={generateCertificate} disabled={!studentName.trim()}
            className="w-full btn-action btn-success py-4 text-sm font-bold disabled:opacity-40">
            🏆 Generate Certificate
          </button>
        </div>
      )}

      {/* Certificate */}
      {certData.certId && (
        <div className="glass-card !p-6 text-center border-2 border-success/30 space-y-2">
          <div className="text-3xl">🏆</div>
          <div className="text-lg font-black text-text-primary">ACLS Certification</div>
          <div className="text-sm text-text-secondary">{certData.studentName}</div>
          <div className="text-xs text-text-muted">
            Completed {certData.scenariosDone} scenarios · Score: {certData.avgScore}%
          </div>
          <div className="text-xs text-text-muted">
            {new Date(certData.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="font-mono text-[10px] text-info">ID: {certData.certId}</div>
          <div className="text-[10px] text-text-muted">JIA Trainer Center · jia1669.com</div>
        </div>
      )}
    </div>
  );
}
