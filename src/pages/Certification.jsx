import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLessonProgress, getAttemptsForStudent, upsertStudent } from '../db/database';
import { scheduleFlush } from '../services/syncEngine';
import { preCourseLessons } from '../data/activeLessons';
import { POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT } from '../data/activePreTest';
import { EKG_TEST_PASS_PERCENT, EKG_TEST_PASSED_KEY } from '../data/ekgQuiz';
import { getScenarioGameStatus as getBlsScenarioGameStatus } from '../data/blsScenarios';
import { getScenarioGameStatus as getSkillScenarioGameStatus } from '../data/activeSkillContent';
import { simGameStatus } from '../data/codeBlueScenarios';
import { certConfig } from '../data/activeCert';
import { IS_BLS, IS_SKILL_COURSE, COURSE_MODE, courseMeta } from '../config/courseMode';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useClassStore } from '../stores/classStore';
import { rpcJoinClass, rpcGetMyPracticalStatus } from '../services/cohortSync';
import { exportCertificatePDF } from '../utils/exportCertificate';
import { simCertHighlights } from '../game/achievements';
import { notifyCertIssued } from '../services/certNotify';
import { track } from '../services/analytics';
import { jiacprCourse } from '../data/jiacprCourse';
import {
  Trophy, BookOpen, Sparkles, Activity, Video,
  Check, Circle, ClipboardCheck, Download, MapPin, ChevronRight, Shield, MessageCircle, AlertCircle,
  Medal, PartyPopper, Siren,
} from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { useAsyncData } from '../hooks/useAsyncData';
import { computeVideoCompletion } from '../utils/videoProgress';
import MorrooAdCard from '../components/MorrooAdCard';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import PageHero from '../components/PageHero';
import LoadingCard from '../components/ui/LoadingCard';
import ErrorCard from '../components/ui/ErrorCard';

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
  const setActiveStudent = usePreCourseStore(s => s.setActiveStudent);
  // Default the certificate name to the name the student already entered at
  // registration; an existing generated cert takes precedence.
  const [studentName, setStudentName] = useState(certData.studentName || activeStudent?.name || '');
  // Phone/email are collected here at the certificate step — a high-intent
  // moment, so we require the full contact set even though registration made
  // them optional. Prefill from whatever the student already gave.
  const [studentPhone, setStudentPhone] = useState(certData.studentPhone || activeStudent?.phone || '');
  const [studentEmail, setStudentEmail] = useState(certData.studentEmail || activeStudent?.email || '');
  const [formError, setFormError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  // Soft gate: ปลดล็อกปุ่มดาวน์โหลดเมื่อกดเพิ่มเพื่อน LINE OA (หรือกดข้าม) — จำค่าไว้ข้าม refresh
  const [lineUnlocked, setLineUnlocked] = useState(!!certData.lineFollowed);
  const ekgTestDone = localStorage.getItem(EKG_TEST_PASSED_KEY) === 'true';
  const classCode = useClassStore(s => s.classCode);

  // สถานะภาคปฏิบัติจากระบบเช็คชื่อ QR (วันเรียนจริง) — เข้าครบทุกฐาน + สอบ
  // ปฏิบัติผ่านครบ = ใบประกาศอัปเกรดเป็นฉบับสมบูรณ์อัตโนมัติ (best-effort:
  // ออฟไลน์/ไม่มีคลาส = null → แสดงใบทฤษฎีตามเดิม ไม่บล็อกอะไร)
  const [practical, setPractical] = useState(null); // { stations, complete } | null
  useEffect(() => {
    if (!classCode || !activeStudent?.id) { setPractical(null); return undefined; }
    let cancelled = false;
    const load = async () => {
      // canonicalize student_pk กับ server ก่อน (idempotent) — กัน pk ค้างจาก
      // เครื่อง/เบราว์เซอร์เก่า แพทเทิร์นเดียวกับ StudentQrCard
      let pk = activeStudent.id;
      const { data: joined } = await rpcJoinClass({
        code: classCode,
        studentUuid: activeStudent.id,
        studentId: activeStudent.studentId,
        name: activeStudent.name,
        phone: activeStudent.phone ?? null,
      });
      if (joined?.studentPk) pk = joined.studentPk;
      const { data, error } = await rpcGetMyPracticalStatus({ studentPk: pk });
      if (cancelled || error || !Array.isArray(data?.stations)) return;
      const stations = data.stations;
      const exams = stations.filter(s => s.kind === 'exam');
      const complete = stations.length > 0
        && stations.every(s => !!s.checkedInAt)
        && exams.every(s => s.examPassed === true);
      setPractical({ stations, complete });
    };
    load();
    return () => { cancelled = true; };
  }, [classCode, activeStudent?.id, activeStudent?.studentId, activeStudent?.name, activeStudent?.phone]);
  const practicalComplete = !!practical?.complete;

  const {
    data: preCourseData,
    loading: progressLoading,
    error: progressError,
    reload: reloadProgress,
  } = useAsyncData(
    () => (activeStudent
      ? Promise.all([getLessonProgress(activeStudent.id), getAttemptsForStudent(activeStudent.id)])
      : [[], []]),
    [activeStudent?.id],
  );
  const preCourseProgress = preCourseData?.[0] ?? [];
  const preCourseAttempts = preCourseData?.[1] ?? [];

  // วัด funnel ของ soft gate: ยิงครั้งเดียวตอนผู้ใช้เห็นด่านเพิ่มเพื่อน LINE
  useEffect(() => {
    if (certData.certId && !lineUnlocked) {
      track('cert_line_gate_view', {
        props: { source: 'cert_gate', course: COURSE_MODE },
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

  // เงื่อนไขบทเรียนวิดีโอ — ดูครบ + ผ่านควิซ ทุกหัวข้อ required (ทั้ง ACLS/BLS แยกชุดกันด้วย course_mode)
  // ถ้ายังไม่มีวิดีโอ (total = 0) จะไม่เพิ่มเป็นเงื่อนไข เพื่อไม่บล็อกใบประกาศนียบัตรช่วงเปลี่ยนผ่าน
  const { lessons: videoLessons, loading: videoLoading, error: videoError } = useVideoLessons();
  const videoComp = computeVideoCompletion(videoLessons, preCourseProgress, preCourseAttempts);
  const videoGateActive = videoComp.total > 0;

  // BLS ขั้นที่ 2 (ฝึก CPR): วัดผลจากเกมลำดับขั้นตัดสินใจ 8 ด่าน + ข้อสอบรวม
  // ที่ฝังอยู่ในหน้า skill-practice — อ่านสดจาก localStorage ทุก render
  // เหมือน EKG test ของ ACLS
  const scenarioGame = IS_BLS ? getBlsScenarioGameStatus() : null;
  // BLS: เกม BLS Rescue (/sim) ก็เป็นเงื่อนไขบังคับ — ต้องผ่านครบทุกเคส built-in
  // (ฝั่ง ACLS เกม sim ยังเป็นโบนัสไม่บังคับเหมือนเดิม)
  const simGame = IS_BLS ? simGameStatus() : null;
  // Airway/Defib/IV skill courses: เกมลำดับขั้นของคอร์สนั้น ๆ (ดูส่วนที่ 3 ของแผน)
  // เป็นเงื่อนไขบังคับเหมือน BLS แต่ไม่มีเกม BLS Rescue/Code Blue Sim ผูกด้วย
  const skillScenarioGame = IS_SKILL_COURSE ? getSkillScenarioGameStatus() : null;

  // BLS: 4 requirements mirroring the landing journey (บทเรียน → ฝึก CPR →
  // เกม BLS Rescue → Post-test). Skill courses (airway/defib/iv): pre-test →
  // pre-course → เกมลำดับขั้น → post-test (ไม่มี EKG test — เป็นแนวคิดเฉพาะ
  // ACLS). ACLS: online theory certification — the four knowledge gates only
  // (pre-test, pre-course, post-test, EKG test). Hands-on skills are completed
  // separately at a training center.
  // Once a student has an attempt on record, tapping the requirement should
  // show that result again rather than always forcing a retake — this is the
  // only way back to a past pre-test/post-test result in the app.
  const preTestTo = preTestBest ? `/pre-course/results/${preTestBest.autoId}` : '/pre-course/pre-test';
  const postTestTo = postTestBest ? `/pre-course/results/${postTestBest.autoId}` : '/pre-course/post-test';

  const requirements = IS_BLS
    ? [
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen, to: '/pre-course' },
        ...(videoGateActive
          ? [{ label: `ผ่านบทเรียนวิดีโอ (${videoComp.done}/${videoComp.total})`, done: videoComp.allDone, Icon: Video, to: '/video-lessons' }]
          : []),
        { label: `ผ่านฝึก CPR — เกมลำดับขั้น 8 ด่าน + ข้อสอบรวม (${scenarioGame.done}/${scenarioGame.total})`, done: scenarioGame.allPassed, Icon: Activity, to: '/skill-practice' },
        { label: `ผ่านเกม BLS Rescue ครบทุกเคส (${simGame.done}/${simGame.total})`, done: simGame.allPassed, Icon: Sparkles, to: '/sim' },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck, to: postTestTo },
      ]
    : IS_SKILL_COURSE
    ? [
        { label: `ผ่าน Pre-test ≥ ${PRE_TEST_PASS_PERCENT}%`, done: preTestDone, Icon: Sparkles, to: preTestTo },
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen, to: '/pre-course' },
        { label: `ผ่านเกมลำดับขั้น ${skillScenarioGame.total - 1} ด่าน + ข้อสอบรวม (${skillScenarioGame.done}/${skillScenarioGame.total})`, done: skillScenarioGame.allPassed, Icon: Activity, to: '/scenario' },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck, to: postTestTo },
        ...(videoGateActive
          ? [{ label: `ผ่านบทเรียนวิดีโอ (${videoComp.done}/${videoComp.total})`, done: videoComp.allDone, Icon: Video, to: '/video-lessons' }]
          : []),
      ]
    : [
        { label: `ผ่าน Pre-test ≥ ${PRE_TEST_PASS_PERCENT}%`, done: preTestDone, Icon: Sparkles, to: preTestTo },
        { label: 'ผ่าน Pre-course (อ่าน + ทำแบบทดสอบผ่านทุกบท)', done: preCourseDone, Icon: BookOpen, to: '/pre-course' },
        { label: `ผ่าน Post-test exam ≥ ${POST_TEST_PASS_PERCENT}%`, done: postTestDone, Icon: ClipboardCheck, to: postTestTo },
        { label: `ผ่าน EKG test ≥ ${EKG_TEST_PASS_PERCENT}%`, done: ekgTestDone, Icon: Activity, to: '/als?tab=ekg' },
        ...(videoGateActive
          ? [{ label: `ผ่านบทเรียนวิดีโอ (${videoComp.done}/${videoComp.total})`, done: videoComp.allDone, Icon: Video, to: '/video-lessons' }]
          : []),
      ];

  // While the video list or the local progress records are still loading, the
  // requirements list is incomplete — computing allDone from it would briefly
  // drop the video gate and expose the generate-cert form.
  // On a load error, keep the gate locked (fail closed).
  const requirementsLoading = progressLoading || videoLoading;
  const requirementsError = progressError || videoError;
  const allDone = !requirementsLoading && !requirementsError && requirements.every(r => r.done);
  const progress = Math.round((requirements.filter(r => r.done).length / requirements.length) * 100);

  const generateCertificate = async () => {
    const name = studentName.trim();
    const tel = studentPhone.trim();
    const mail = studentEmail.trim().toLowerCase();
    if (!name) { setFormError('กรุณากรอกชื่อ'); return; }
    if (tel.replace(/\D/g, '').length < 9) { setFormError('เบอร์โทรไม่ถูกต้อง'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setFormError('อีเมลไม่ถูกต้อง'); return; }
    setFormError('');

    // Persist the completed contact set back to the student record so it syncs
    // to the server (roster) and prefills on future visits.
    if (activeStudent) {
      const updated = { ...activeStudent, name, phone: tel, email: mail, syncedAt: null };
      try {
        await upsertStudent(updated);
        setActiveStudent(updated);
        scheduleFlush();
      } catch { /* non-blocking — cert must still issue */ }
    }

    const data = {
      studentName: name,
      studentPhone: tel,
      studentEmail: mail,
      completedAt: new Date().toISOString(),
      preTestScore: IS_BLS ? null : (preTestBest?.score ?? null),
      postTestScore: postTestBest?.score ?? null,
      ekgPassed: (IS_BLS || IS_SKILL_COURSE) ? null : ekgTestDone,
      videoCompleted: videoGateActive ? videoComp.allDone : null,
      theoryOnly: !!certConfig.theoryOnly,
      // eslint-disable-next-line react-hooks/purity -- รันใน event handler (กดปุ่มออกใบ) ไม่ใช่ตอน render
      certId: `${certConfig.certIdPrefix}-${Date.now().toString(36).toUpperCase()}`,
    };
    saveCertData({ ...certData, ...data });
    setCertData({ ...certData, ...data });
    // Best-effort admin LINE alert + certificates-table record — fire and forget.
    notifyCertIssued({
      studentName: name,
      studentPhone: tel,
      studentEmail: mail,
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
        props: { source: 'cert_gate', course: COURSE_MODE },
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
        course: COURSE_MODE, value: 2500, currency: 'THB',
      },
    });
    unlockDownload('line');
  };

  const downloadPDF = async () => {
    track('cert_download', {
      props: { source: 'cert_card', course: COURSE_MODE },
    });
    setDownloadError('');
    try {
      await exportCertificatePDF({
        cert: certData, certConfig, sim: simHighlights,
        practical: { complete: practicalComplete },
      });
    } catch (err) {
      console.error('cert PDF export failed:', err);
      setDownloadError('ดาวน์โหลดใบประกาศนียบัตรไม่สำเร็จ ลองใหม่อีกครั้ง หรือเปิดผ่านเบราว์เซอร์ปกติ (ไม่ใช่ในแอป LINE)');
    }
  };

  // ผลงาน Code Blue Sim สำหรับใบ cert (ACLS เท่านั้น) — null = ไม่เคยผ่านเคส
  // อ่านสดจาก localStorage ทุก render เพื่อให้เก็บเหรียญเพิ่มแล้วกลับมาหน้านี้เห็นทันที
  const simHighlights = !IS_BLS ? simCertHighlights() : null;

  const issuedDate = certData.completedAt ? new Date(certData.completedAt) : null;
  const expiresDate = issuedDate ? new Date(issuedDate) : null;
  if (expiresDate) expiresDate.setMonth(expiresDate.getMonth() + (certConfig.validityMonths || 24));

  return (
    <div className="page-container flex flex-col gap-4">
      <PageHero
        title={certConfig.title}
        desc={`Track your ${courseMeta.shortName} training progress`}
      />

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

      {/* Progress + Requirements — gated on the data they're computed from */}
      {requirementsLoading && <LoadingCard label="กำลังตรวจสอบความคืบหน้า..." />}
      {!requirementsLoading && requirementsError && (
        <ErrorCard
          title="โหลดข้อมูลความคืบหน้าไม่สำเร็จ"
          detail="ตรวจสอบการเชื่อมต่อแล้วลองใหม่"
          onRetry={progressError ? reloadProgress : () => window.location.reload()}
        />
      )}
      {!requirementsLoading && !requirementsError && (
      <>
      {/* Progress */}
      <div className="dash-card text-center">
        <div className={`text-numeric text-5xl ${allDone ? 'text-success' : 'text-warning'}`}>{progress}%</div>
        <div className="text-caption text-text-muted mt-1 inline-flex items-center gap-1">
          {allDone && <PartyPopper size={13} strokeWidth={2.4} />} {allDone ? 'All requirements met!' : 'Complete requirements to earn certificate'}
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
      </>
      )}

      {/* Pre-course breakdown (only when a student is active) */}
      {activeStudent && (
        <div className="dash-card !p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-overline text-text-muted">Pre-course — {activeStudent.name}</div>
            <span className="text-2xs text-text-muted font-mono">{activeStudent.studentId || activeStudent.phone}</span>
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
              <span className={`text-2xs font-bold ${
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
            <div className={`stat-value text-lg ${scenarioGame.allPassed ? 'text-success' : 'text-warning'}`}>
              {scenarioGame.done}/{scenarioGame.total}
            </div>
            <div className="stat-label">ฝึก CPR (เกม)</div>
          </div>
          <div className="stat-box">
            <div className={`stat-value text-lg ${postTestBest.score >= POST_TEST_PASS_PERCENT ? 'text-success' : 'text-warning'}`}>
              {postTestBest.score}%
            </div>
            <div className="stat-label">Post-test best</div>
          </div>
          <div className="stat-box">
            <div className={`stat-value text-lg ${simGame.allPassed ? 'text-success' : 'text-warning'}`}>
              {simGame.done}/{simGame.total}
            </div>
            <div className="stat-label">BLS Rescue</div>
          </div>
        </div>
      )}

      {/* ภาคปฏิบัติ (วันเรียนจริง) — จากระบบเช็คชื่อ QR: ครบทุกฐาน + สอบผ่านครบ
          = ใบประกาศเป็นฉบับสมบูรณ์ (แสดงเฉพาะเมื่อเชื่อมต่อคลาส + โหลดสถานะได้) */}
      {practical && practical.stations.length > 0 && (
        <div className={`dash-card !p-3 space-y-2 border ${practicalComplete ? 'border-success/40' : 'border-border'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-overline text-text-muted">ภาคปฏิบัติ (วันเรียนจริง)</div>
            {practicalComplete ? (
              <span className="text-2xs font-bold text-success inline-flex items-center gap-1">
                <Check size={12} strokeWidth={2.6} /> ครบ — ใบประกาศฉบับสมบูรณ์
              </span>
            ) : (
              <span className="text-2xs text-text-muted">ยังไม่ครบทุกฐาน</span>
            )}
          </div>
          {practical.stations.map(s => {
            const attended = !!s.checkedInAt;
            const isExam = s.kind === 'exam';
            return (
              <div key={s.id} className="flex items-center gap-2 text-caption">
                <span className={`w-5 h-5 inline-flex items-center justify-center shrink-0 ${
                  attended ? 'bg-success/15 text-success' : 'bg-bg-tertiary text-text-muted'
                }`} style={{ borderRadius: 'var(--radius-sm)' }}>
                  {attended ? <Check size={12} strokeWidth={2.6} /> : <Circle size={10} strokeWidth={2} />}
                </span>
                <span className="flex-1 text-text-secondary truncate">{s.name}</span>
                <span className={`text-2xs font-bold ${
                  isExam
                    ? (s.examPassed === true ? 'text-success' : s.examPassed === false ? 'text-danger' : 'text-text-muted')
                    : (attended ? 'text-success' : 'text-text-muted')
                }`}>
                  {isExam
                    ? (s.examPassed === true ? 'สอบผ่าน' : s.examPassed === false ? 'ไม่ผ่าน' : 'ยังไม่สอบ')
                    : (attended ? 'เข้าแล้ว' : 'ยังไม่เข้า')}
                </span>
              </div>
            );
          })}
          {!practicalComplete && (
            <div className="text-2xs text-text-muted">
              เข้าครบทุกฐาน + สอบปฏิบัติผ่านครบ ใบประกาศจะเปลี่ยนเป็นฉบับสมบูรณ์ให้อัตโนมัติ
            </div>
          )}
        </div>
      )}

      {/* Code Blue Sim bonus teaser (ACLS เท่านั้น) — ชวนเล่นแบบไม่บังคับ ก่อนออกใบ
          หรือหลังออกใบแต่ยังไม่เคยเล่น (การ์ด cert ด้านล่างโชว์ผลงานจริงอยู่แล้วถ้าเคยเล่น) */}
      {!IS_BLS && !(certData.certId && simHighlights) && (
        <div className="dash-card !p-3 bg-warning/10 border border-warning/30 flex items-start gap-2">
          <Sparkles size={16} strokeWidth={2.4} className="text-warning shrink-0 mt-0.5" />
          <div className="text-caption text-text-secondary flex-1">
            <span className="font-bold text-warning">โบนัสพิเศษบนใบประกาศ (ไม่บังคับ)</span>
            <div className="mt-0.5">
              เล่น Code Blue Sim แล้วเคสที่ผ่าน + เกรด S จะโชว์บนใบประกาศ —
              ผ่านเคส megacode ครบทุกเคส รับตราทอง MEGACODE MASTER บนใบด้วย
              ไม่เล่นก็รับใบประกาศได้ตามปกติ
            </div>
            {simHighlights && (
              <div className="mt-1 font-semibold text-text-primary">
                ตอนนี้: ผ่าน {simHighlights.clearedCount} เคส
                {simHighlights.gradeS > 0 && ` · เกรด S ×${simHighlights.gradeS}`}
              </div>
            )}
            {simHighlights?.megacodeMaster ? (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 text-2xs font-extrabold bg-warning/12 text-warning"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <Medal size={14} strokeWidth={2.4} /> MEGACODE MASTER — จะแสดงบนใบประกาศ
              </div>
            ) : (
              <Link to="/sim" className="inline-flex items-center gap-1 mt-1.5 text-caption font-bold text-warning">
                <Siren size={14} strokeWidth={2.4} /> ไปเล่น Code Blue Sim <ChevronRight size={14} strokeWidth={2.4} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Student details + Generate — full contact set required at this step */}
      {allDone && !certData.certId && (
        <div className="dash-card space-y-3">
          <div className="text-headline text-success text-center inline-flex items-center justify-center gap-2 w-full">
            <Trophy size={18} strokeWidth={2.4} /> ยินดีด้วย! กรอกข้อมูลเพื่อรับใบประกาศ
          </div>
          <p className="text-2xs text-text-muted text-center -mt-1">
            ใช้ชื่อบนใบประกาศ และไว้ส่งใบประกาศ/แจ้งเตือนก่อนหมดอายุ
          </p>
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">ชื่อ–นามสกุล (บนใบประกาศ)</span>
            <input type="text" value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="เช่น อนันต์ ใจดี"
              className="w-full text-body mt-1" />
          </label>
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">เบอร์โทร</span>
            <input type="tel" inputMode="tel" autoComplete="tel" value={studentPhone}
              onChange={e => setStudentPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="w-full text-body tabular mt-1" />
          </label>
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">อีเมล</span>
            <input type="email" inputMode="email" autoComplete="email" value={studentEmail}
              onChange={e => setStudentEmail(e.target.value)}
              placeholder="เช่น name@email.com"
              className="w-full text-body mt-1" />
          </label>
          {formError && (
            <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={14} strokeWidth={2.2} /> {formError}
            </div>
          )}
          <button onClick={generateCertificate}
            disabled={!studentName.trim() || !studentPhone.trim() || !studentEmail.trim()}
            className="btn btn-success btn-lg btn-block disabled:opacity-40">
            <Trophy size={16} strokeWidth={2.4} /> ออกใบประกาศนียบัตร
          </button>
        </div>
      )}

      {/* Certificate */}
      {certData.certId && (
        <div className="dash-card !p-6 text-center space-y-3"
          style={{ borderColor: 'rgba(5, 150, 105, 0.4)', borderWidth: 2 }}>
          <div
            className="w-16 h-16 mx-auto inline-flex items-center justify-center bg-warning/12 text-warning"
            style={{ borderRadius: 'var(--radius-2xl)' }}
          >
            <Trophy size={28} strokeWidth={2.4} />
          </div>
          <img
            src={certConfig.logoUrl || '/images/logo-morroo.png'}
            alt=""
            className="mx-auto h-20 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="text-title text-text-primary">
              {(practicalComplete && certConfig.fullTitle) || certConfig.title}
            </div>
            <div className="text-caption text-text-muted mt-1">{certConfig.subtitle}</div>
            <div className="text-body text-text-secondary mt-2 font-bold">{certData.studentName}</div>
          </div>
          {practicalComplete && certConfig.fullStatement ? (
            <div className="text-caption font-semibold text-success">{certConfig.fullStatement}</div>
          ) : (certConfig.theoryOnly && certConfig.theoryStatement && (
            <div className="text-caption font-semibold text-success">{certConfig.theoryStatement}</div>
          ))}
          {!IS_BLS && (
            <div className="text-caption text-text-muted">
              Pre-test: {certData.preTestScore != null ? `${certData.preTestScore}%` : '—'}
              {' · '}Post-test: {certData.postTestScore != null ? `${certData.postTestScore}%` : '—'}
              {' · '}EKG: {certData.ekgPassed ? 'ผ่าน' : '—'}
            </div>
          )}
          {simHighlights && (
            <div className="text-caption text-text-muted">
              Code Blue Sim: ผ่าน {simHighlights.clearedCount} เคส
              {simHighlights.gradeS > 0 && ` · เกรด S ×${simHighlights.gradeS}`}
            </div>
          )}
          {simHighlights?.megacodeMaster && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-2xs font-extrabold bg-warning/12 text-warning"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Medal size={14} strokeWidth={2.4} /> MEGACODE MASTER
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
          <div className="font-mono text-2xs text-info">ID: {certData.certId}</div>
          <div className="text-2xs text-text-muted">{certConfig.centerName} · {certConfig.centerUrl}</div>
          {!practicalComplete && certConfig.theoryOnly && certConfig.practicalRecommendation && (
            <div className="dash-card !p-3 !bg-info/10 border border-info/30 text-caption text-info flex items-start gap-2 text-left">
              <MapPin size={15} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
              <span>{certConfig.practicalRecommendation}</span>
            </div>
          )}
          {lineUnlocked ? (
            <>
              <button onClick={downloadPDF} className="btn btn-info btn-block mt-3">
                <Download size={16} strokeWidth={2.4} /> Download PDF Certificate
              </button>
              {downloadError && (
                <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
                  style={{ borderRadius: 'var(--radius-md)' }}>
                  <AlertCircle size={14} strokeWidth={2.2} /> {downloadError}
                </div>
              )}
            </>
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
