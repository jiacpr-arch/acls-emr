import { useState, useEffect } from 'react';
import { getAllCases } from '../db/database';
import { scenarios } from '../data/scenarios';
import {
  Trophy, BookOpen, GraduationCap, Award, BarChart3,
  Check, Circle,
} from 'lucide-react';

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

  const basicDone = trainingCases.filter(c => c.events?.length >= 3).length >= 3;
  const interDone = trainingCases.filter(c => c.events?.length >= 5).length >= 1;
  const megaDone = trainingCases.filter(c => c.events?.length >= 7).length >= 1;
  const avgScore = trainingCases.length > 0
    ? Math.round(trainingCases.reduce((a, c) => a + (c.ccf || 50), 0) / trainingCases.length)
    : 0;
  const passExam = avgScore >= 80;

  const requirements = [
    { label: 'Complete 3+ Basic scenarios', done: basicDone, Icon: BookOpen },
    { label: 'Complete 1+ Intermediate scenario', done: interDone, Icon: GraduationCap },
    { label: 'Complete 1+ Megacode scenario', done: megaDone, Icon: Award },
    { label: 'Average score ≥ 80%', done: passExam, Icon: BarChart3 },
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
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-warning/15 text-warning"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Trophy size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">Certification</h1>
          <p className="text-caption text-text-muted">Track your ACLS training progress</p>
        </div>
      </div>

      {/* Progress */}
      <div className="dash-card text-center">
        <div className={`text-numeric text-5xl ${allDone ? 'text-success' : 'text-warning'}`}>{progress}%</div>
        <div className="text-caption text-text-muted mt-1">
          {allDone ? '🎉 All requirements met!' : 'Complete requirements to earn certificate'}
        </div>
        <div className="progress-track !h-2 mt-3">
          <div className={`progress-fill ${allDone ? 'bg-success' : 'bg-info'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        {requirements.map((r, i) => {
          const RIcon = r.Icon;
          return (
            <div key={i} className={`dash-card !p-3 flex items-center gap-3 border ${r.done ? 'border-success/40' : 'border-border'}`}>
              <div className={`w-9 h-9 inline-flex items-center justify-center shrink-0 ${
                r.done ? 'bg-success/15 text-success' : 'bg-bg-tertiary text-text-muted'
              }`} style={{ borderRadius: 'var(--radius-sm)' }}>
                <RIcon size={16} strokeWidth={2.2} />
              </div>
              <span className="flex-1 text-caption font-semibold text-text-primary">{r.label}</span>
              {r.done ? (
                <Check size={18} strokeWidth={2.4} className="text-success" />
              ) : (
                <Circle size={16} strokeWidth={2} className="text-text-muted" />
              )}
            </div>
          );
        })}
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
        <div className="dash-card space-y-3">
          <div className="text-headline text-success text-center inline-flex items-center justify-center gap-2 w-full">
            <Trophy size={18} strokeWidth={2.4} /> Congratulations!
          </div>
          <input type="text" value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Enter your name for certificate"
            className="w-full text-body text-center" />
          <button onClick={generateCertificate} disabled={!studentName.trim()}
            className="btn btn-success btn-lg btn-block disabled:opacity-40">
            <Trophy size={16} strokeWidth={2.4} /> Generate Certificate
          </button>
        </div>
      )}

      {/* Certificate */}
      {certData.certId && (
        <div className="dash-card !p-6 text-center space-y-3"
          style={{ borderColor: 'rgba(5, 150, 105, 0.4)', borderWidth: 2 }}>
          <div
            className="w-16 h-16 mx-auto inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 8px 20px rgba(217, 119, 6, 0.28)',
            }}
          >
            <Trophy size={28} strokeWidth={2.4} className="text-white" />
          </div>
          <div>
            <div className="text-title text-text-primary">ACLS Certification</div>
            <div className="text-body text-text-secondary mt-1">{certData.studentName}</div>
          </div>
          <div className="text-caption text-text-muted">
            Completed {certData.scenariosDone} scenarios · Score: {certData.avgScore}%
          </div>
          <div className="text-caption text-text-muted">
            {new Date(certData.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="font-mono text-[11px] text-info">ID: {certData.certId}</div>
          <div className="text-[11px] text-text-muted">JIA Trainer Center · jia1669.com</div>
        </div>
      )}
    </div>
  );
}
