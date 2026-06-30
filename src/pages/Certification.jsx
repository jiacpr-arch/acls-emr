import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import { preCourseLessons } from '../data/activeLessons';
import { POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT } from '../data/assessment';
import { EKG_TEST_PASS_PERCENT, EKG_TEST_PASSED_KEY } from '../data/ekgQuiz';
import { certConfig } from '../data/activeCert';
import { IS_BLS, courseMeta } from '../config/courseMode';
import { usePreCourseStore } from '../stores/preCourseStore';
import { exportCertificatePDF } from '../utils/exportCertificate';
import { notifyCertIssued } from '../services/certNotify';
import { track } from '../services/analytics';
import { jiacprCourse } from '../data/jiacprCourse';
import {
  Trophy, BookOpen, Sparkles, Activity, Video,
  Check, Circle, ClipboardCheck, Download, MapPin, ChevronRight, Shield, MessageCircle,
} from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { computeVideoCompletion } from '../utils/videoProgress';
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
  const [certData, setCertData] = useState(getCertData());
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  // Default the certificate name to the name the student already entered at
  // registration; an existing generated cert takes precedence.
  const [studentName, setStudentName] = useState(certData.studentName || activeStudent?.name || '');
  const [preCourseProgress, setPreCourseProgress] = useState([]);
  const [preCourseAttempts, setPreCourseAttempts] = useState([]);
  // Soft gate: ปลดล็อกปุ่มดาวน์โหลดเมื่อกดเพิ่มเพื่อน LINE OA (หรือกดข้าม) — จำค่าไว้ข้าม refresh
  const [lineUnlocked, setLineUnlocked] = useState(!!certData.lineFollowed);
  const ekgTestDone = localStorage.getItem(EKG_TEST_PASSED_KEY) === 'true';

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

  // วัด funnel ของ soft gate: ยิงครั้งเดียวตอนผู้ใช้เห็นด่านเพิ่มเพื่อน LINE
  useEffect(() => {
    if (certData.certId && !lineUnlocked) {
      track('cert_line_gate_view', {
        props: { source: 'cert_gate', course: IS_BLS ? 'bls' : 'acls' },
      });
    }
  }, [certData.certId, lineUnlocked]);

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

  const preTestAttempts = preCourseAttempts.filter(a => a.lessonId === PRE_TEST_LESSON_ID);
  const preTestBest = preTestAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
  const preTestDone = !!preTestBest?.passed;

  // เงื่อนไขบทเรียนวิดีโอ — ดูครบ + ผ่านควิซ ทุกหัวข้อ required (ACLS เท่านั้น)
  // ถ้ายังไม่มีวิดีโอ (total = 0) จะไม่เพิ่มเป็นเงื่อนไข เพื่อไม่บล็อกใบประกาศนียบัตรช่วงเปลี่ยนผ่าน
  const { lessons: videoLessons } = useVideoLessons();
  const videoComp = computeVideoCompletion(videoLessons, preCourseProgress, preCourseAttempts);
  const videoGateActive = !IS_BLS && videoComp.total > 0;

  // BLS: 2 knowledge requirements. ACLS: online theory certification — the four
  // knowledge gates only (pre-test, pre-course, post-test, EKG test). Hands-on
  // skills are completed separately at a training center.
  const requirements = IS_BLS
    ? [
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen, to: '/pre-course' },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck, to: '/pre-course/post-test' },
      ]
    : [
        { label: `ผ่าน Pre-test ≥ ${PRE_TEST_PASS_PERCENT}%`, done: preTestDone, Icon: Sparkles, to: '/pre-course/pre-test' },
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen, to: '/pre-course' },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck, to: '/pre-course/post-test' },
        { label: `ผ่าน EKG test ≥ ${EKG_TEST_PASS_PERCENT}%`, done: ekgTestDone, Icon: Activity, to: '/als?tab=ekg' },
        ...(videoGateActive
          ? [{ label: `ผ่านบทเรียนวิดีโอ (${videoComp.done}/${videoComp.total})`, done: videoComp.allDone, Icon: Video, to: '/video-lessons' }]
          : []),
      ];

  const allDone = requirements.every(r => r.done);
  const progress = Math.round((requirements.filter(r => r.done).length / requirements.length) * 100);

  const generateCertificate = () => {
    const data = {
      studentName,
      completedAt: new Date().toISOString(),
      preTestScore: IS_BLS ? null : (preTestBest?.score ?? null),
      postTestScore: postTestBest?.score ?? null,
      ekgPassed: IS_BLS ? null : ekgTestDone,
      videoCompleted: videoGateActive ? videoComp.allDone : null,
      theoryOnly: !!certConfig.theoryOnly,
      certId: `${certConfig.certIdPrefix}-${Date.now().toString(36).toUpperCase()}`,
    };
    saveCertData({ ...certData, ...data, studentName });
    setCertData({ ...certData, ...data, studentName });
    // Best-effort admin LINE alert — fire and forget, never blocks the UI.
    notifyCertIssued({
      studentName,
      studentPhone: activeStudent?.phone || null,
      studentEmail: activeStudent?.email || null,
      courseTitle: certConfig.title,
      certId: data.certId,
      completedAt: data.completedAt,
      preTestScore: data.preTestScore,
      postTestScore: data.postTestScore,
      ekgPassed: data.ekgPassed,
    });
  };

  // ปลดล็อกปุ่มดาวน์โหลด + จำค่าไว้ใน cert data เพื่อให้รอด refresh
  const unlockDownload = (via) => {
    const next = { ...certData, lineFollowed: true };
    saveCertData(next);
    setCertData(next);
    setLineUnlocked(true);
    if (via === 'skip') {
      track('cert_line_skip', {
        props: { source: 'cert_gate', course: IS_BLS ? 'bls' : 'acls' },
      });
    }
  };

  // กดเพิ่มเพื่อน LINE OA = เปิด LINE (ผ่าน href) + นับเป็น Contact/Lead + ปลดล็อกดาวน์โหลด
  // หมายเหตุ: เว็บยืนยันการ add จริงไม่ได้ จึงเป็น honor-system — วัดผลจริงเทียบกับ LINE OA dashboard
  const handleAddLine = () => {
    track('cert_line_add', {
      meta: ['Contact', 'Lead'],
      props: {
        channel: 'line', source: 'cert_gate',
        course: IS_BLS ? 'bls' : 'acls', value: 2500, currency: 'THB',
      },
    });
    unlockDownload('line');
  };

  const downloadPDF = async () => {
    track('cert_download', {
      props: { source: 'cert_card', course: IS_BLS ? 'bls' : 'acls' },
    });
    await exportCertificatePDF({ cert: certData, certConfig });
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

      <JiacprCourseBanner />

      {IS_BLS && (
        <div className="dash-card !p-3 bg-info/10 border border-info/30 flex items-start gap-2">
          <Shield size={16} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
          <div className="text-caption text-text-secondary">
            <span className="font-bold text-info">{courseMeta.standard}</span>
            {' · '}อายุใบประกาศนียบัตร {certConfig.validityMonths} เดือน — ต้องต่ออายุก่อนหมดอายุ
          </div>
        </div>
      )}

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
      <div className="space-y-3">
        {requirements.map((r, i) => {
          const RIcon = r.Icon;
          return (
            <Link key={i} to={r.to}
              className={`dash-card !p-3 flex items-center gap-3 border transition-colors hover:border-info/40 ${r.done ? 'border-success/40' : 'border-border'}`}>
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
              <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Pre-course breakdown (only when a student is active) */}
      {activeStudent && (
        <div className="dash-card !p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-overline text-text-muted">Pre-course — {activeStudent.name}</div>
            <span className="text-[11px] text-text-muted font-mono">{activeStudent.studentId || activeStudent.phone}</span>
          </div>
          {preCourseStatus.map(({ lesson, read, bestScore, passed }) => (
            <Link key={lesson.id} to={`/pre-course/${lesson.id}`}
              className="flex items-center gap-2 text-caption rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-bg-tertiary">
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
              <ChevronRight size={14} strokeWidth={2.2} className="text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Stats — ACLS only (BLS has no scenarios) */}
      {!IS_BLS && (
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-box">
            <div className={`stat-value text-lg ${preTestDone ? 'text-success' : 'text-warning'}`}>
              {preTestBest ? `${preTestBest.score}%` : '—'}
            </div>
            <div className="stat-label">Pre-test</div>
          </div>
          <div className="stat-box">
            <div className={`stat-value text-lg ${postTestDone ? 'text-success' : 'text-warning'}`}>
              {postTestBest ? `${postTestBest.score}%` : '—'}
            </div>
            <div className="stat-label">Post-test</div>
          </div>
          <div className="stat-box">
            <div className={`stat-value text-lg ${ekgTestDone ? 'text-success' : 'text-warning'}`}>
              {ekgTestDone ? 'ผ่าน' : '—'}
            </div>
            <div className="stat-label">EKG test</div>
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
          <img
            src={certConfig.logoUrl || '/images/logo-morroo.png'}
            alt=""
            className="mx-auto h-20 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="text-title text-text-primary">{certConfig.title}</div>
            <div className="text-caption text-text-muted mt-1">{certConfig.subtitle}</div>
            <div className="text-body text-text-secondary mt-2 font-bold">{certData.studentName}</div>
          </div>
          {certConfig.theoryOnly && certConfig.theoryStatement && (
            <div className="text-caption font-semibold text-success">{certConfig.theoryStatement}</div>
          )}
          {!IS_BLS && (
            <div className="text-caption text-text-muted">
              Pre-test: {certData.preTestScore != null ? `${certData.preTestScore}%` : '—'}
              {' · '}Post-test: {certData.postTestScore != null ? `${certData.postTestScore}%` : '—'}
              {' · '}EKG: {certData.ekgPassed ? 'ผ่าน' : '—'}
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
          {certConfig.theoryOnly && certConfig.practicalRecommendation && (
            <div className="dash-card !p-3 !bg-info/10 border border-info/30 text-caption text-info flex items-start gap-2 text-left">
              <MapPin size={15} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
              <span>{certConfig.practicalRecommendation}</span>
            </div>
          )}
          {lineUnlocked ? (
            <button onClick={downloadPDF} className="btn btn-info btn-block mt-3">
              <Download size={16} strokeWidth={2.4} /> Download PDF Certificate
            </button>
          ) : (
            <div className="dash-card !p-4 mt-3 !bg-success/5 border border-success/30 space-y-3 text-left">
              <div className="flex items-start gap-2">
                <MessageCircle size={18} strokeWidth={2.4} className="shrink-0 mt-0.5" style={{ color: '#06C755' }} />
                <div className="text-caption text-text-secondary">
                  <span className="font-bold text-text-primary">เพิ่มเพื่อน LINE OA เพื่อรับใบประกาศนียบัตร</span>
                  <div className="mt-0.5">
                    รับสิทธิพิเศษส่วนลดคอร์สภาคปฏิบัติ + แจ้งเตือนก่อนใบประกาศนียบัตรหมดอายุ
                  </div>
                </div>
              </div>
              <a
                href={jiacprCourse.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleAddLine}
                className="btn btn-block no-underline"
                style={{ background: '#06C755', color: '#fff', textDecoration: 'none' }}
              >
                <MessageCircle size={16} strokeWidth={2.4} /> เพิ่มเพื่อน LINE แล้วรับใบประกาศนียบัตร
              </a>
              <button
                onClick={() => unlockDownload('skip')}
                className="block w-full text-center text-caption text-text-muted underline bg-transparent"
              >
                ข้ามไปก่อน — ดาวน์โหลดเลย
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
