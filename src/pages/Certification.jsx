import { useState, useEffect } from 'react';
import { getAllCases, getLessonProgress, getAttemptsForStudent } from '../db/database';
import { scenarios } from '../data/scenarios';
import { preCourseLessons } from '../data/activeLessons';
import { POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT } from '../data/activePostTest';
import { certConfig } from '../data/activeCert';
import { IS_BLS, courseMeta } from '../config/courseMode';
import { usePreCourseStore } from '../stores/preCourseStore';
import { exportCertificatePDF } from '../utils/exportCertificate';
import {
  Trophy, BookOpen, GraduationCap, Award, BarChart3,
  Check, Circle, ClipboardCheck, Download,
} from 'lucide-react';
import MorrooAdCard from '../components/MorrooAdCard';
import JiacprCourseBanner from '../components/JiacprCourseBanner';

const CERT_KEY = `${courseMeta.id}_certification`;

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
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [preCourseProgress, setPreCourseProgress] = useState([]);
  const [preCourseAttempts, setPreCourseAttempts] = useState([]);

  // ACLS-only: scenarios-based metrics. BLS mode skips loading cases.
  useEffect(() => {
    if (IS_BLS) return;
    getAllCases().then(setCases);
  }, []);

  useEffect(() => {
    if (!activeStudent) {
      setPreCourseProgress([]);
      setPreCourseAttempts([]);
      return;
    }
    Promise.all([
      getLessonProgress(activeStudent.id),
      getAttemptsForStudent(activeStudent.id),
    ]).then(([p, a]) => {
      setPreCourseProgress(p);
      setPreCourseAttempts(a);
    });
  }, [activeStudent?.id]);

  const trainingCases = cases.filter(c => c.mode === 'training' && c.outcome !== 'ongoing');
  const totalScenarios = scenarios.length;

  const basicDone = trainingCases.filter(c => c.events?.length >= 3).length >= 3;
  const interDone = trainingCases.filter(c => c.events?.length >= 5).length >= 1;
  const megaDone = trainingCases.filter(c => c.events?.length >= 7).length >= 1;
  const avgScore = trainingCases.length > 0
    ? Math.round(trainingCases.reduce((a, c) => a + (c.ccf || 50), 0) / trainingCases.length)
    : 0;
  const passExam = avgScore >= 80;

  const preCourseStatus = preCourseLessons.map(l => {
    const read = preCourseProgress.some(p => p.lessonId === l.id);
    const lessonAttempts = preCourseAttempts.filter(a => a.lessonId === l.id);
    const best = lessonAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
    return { lesson: l, read, bestScore: best?.score ?? null, passed: best?.passed ?? false };
  });
  const preCourseDone = !!activeStudent && preCourseStatus.length > 0 && preCourseStatus.every(s => s.passed);

  const postTestAttempts = preCourseAttempts.filter(a => a.lessonId === POST_TEST_LESSON_ID);
  const postTestBest = postTestAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
  const postTestDone = !!postTestBest?.passed;

  // BLS: 2 requirements (knowledge-only course); ACLS: 6 (knowledge + recorded simulations)
  const requirements = IS_BLS
    ? [
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck },
      ]
    : [
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่าน)', done: preCourseDone, Icon: BookOpen },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck },
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
      avgScore: IS_BLS ? null : avgScore,
      postTestScore: postTestBest?.score ?? null,
      certId: `${certConfig.certIdPrefix}-${Date.now().toString(36).toUpperCase()}`,
    };
    saveCertData({ ...certData, ...data, studentName });
    setCertData({ ...certData, ...data, studentName });
  };

  const downloadPDF = () => {
    exportCertificatePDF({ cert: certData, certConfig });
  };

  const issuedDate = certData.completedAt ? new Date(certData.completedAt) : null;
  const expiresDate = issuedDate ? new Date(issuedDate) : null;
  if (expiresDate) expiresDate.setMonth(expiresDate.getMonth() + (certConfig.validityMonths || 24));

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-warning/15 text-warning"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Trophy size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">{certConfig.title}</h1>
          <p className="text-caption text-text-muted">Track your {courseMeta.shortName} training progress</p>
        </div>
      </div>

      {!IS_BLS && <JiacprCourseBanner />}

      <MorrooAdCard />

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

      {/* Pre-course breakdown (only when a student is active) */}
      {activeStudent && (
        <div className="dash-card !p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-overline text-text-muted">Pre-course — {activeStudent.name}</div>
            <span className="text-[11px] text-text-muted font-mono">{activeStudent.studentId}</span>
          </div>
          {preCourseStatus.map(({ lesson, read, bestScore, passed }) => (
            <div key={lesson.id} className="flex items-center gap-2 text-caption">
              <span className={`w-5 h-5 inline-flex items-center justify-center shrink-0 ${
                passed ? 'bg-success/15 text-success' : 'bg-bg-tertiary text-text-muted'
              }`} style={{ borderRadius: 'var(--radius-sm)' }}>
                {passed ? <Check size={12} strokeWidth={2.6} /> : <Circle size={10} strokeWidth={2} />}
              </span>
              <span className="flex-1 text-text-secondary truncate">{lesson.title}</span>
              <span className={`text-[11px] font-bold ${
                passed ? 'text-success' : bestScore != null ? 'text-warning' : 'text-text-muted'
              }`}>
                {bestScore != null ? `${bestScore}%` : (read ? 'อ่านแล้ว' : 'ยังไม่อ่าน')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats — ACLS only (BLS has no scenarios) */}
      {!IS_BLS && (
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
      )}

      {/* BLS stat — post-test best */}
      {IS_BLS && postTestBest && (
        <div className="grid grid-cols-2 gap-2">
          <div className="stat-box">
            <div className="stat-value text-lg text-text-primary">
              {preCourseStatus.filter(s => s.passed).length}/{preCourseStatus.length}
            </div>
            <div className="stat-label">Lessons passed</div>
          </div>
          <div className="stat-box">
            <div className={`stat-value text-lg ${postTestBest.score >= POST_TEST_PASS_PERCENT ? 'text-success' : 'text-warning'}`}>
              {postTestBest.score}%
            </div>
            <div className="stat-label">Post-test best</div>
          </div>
        </div>
      )}

      {/* Student name + Generate */}
      {allDone && !certData.certId && (
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
            <div className="text-title text-text-primary">{certConfig.title}</div>
            <div className="text-caption text-text-muted mt-1">{certConfig.subtitle}</div>
            <div className="text-body text-text-secondary mt-2 font-bold">{certData.studentName}</div>
          </div>
          {!IS_BLS && (
            <div className="text-caption text-text-muted">
              Completed {certData.scenariosDone} scenarios · Score: {certData.avgScore}%
            </div>
          )}
          {IS_BLS && certData.postTestScore != null && (
            <div className="text-caption text-text-muted">
              Post-test score: {certData.postTestScore}%
            </div>
          )}
          <div className="text-caption text-text-muted">
            Issued: {issuedDate?.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}
            {expiresDate && ` · Valid through: ${expiresDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}`}
          </div>
          <div className="font-mono text-[11px] text-info">ID: {certData.certId}</div>
          <div className="text-[11px] text-text-muted">{certConfig.centerName} · {certConfig.centerUrl}</div>
          <button onClick={downloadPDF} className="btn btn-info btn-block mt-3">
            <Download size={16} strokeWidth={2.4} /> Download PDF Certificate
          </button>
        </div>
      )}
    </div>
  );
}
