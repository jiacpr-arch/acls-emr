import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown, MapPin, FileText, CheckCircle2,
  BookOpen, Check, Lock, PlayCircle, Clock,
} from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useAuth } from '../hooks/useAuth';
import {
  markLessonRead, saveQuizAttempt, getLessonProgress, getAttemptsForStudent,
} from '../db/database';
import { videoLessonKey, VIDEO_TOPIC_MAP } from '../data/videoTopics';
import { buildProgressSets, clipUnlocked } from '../utils/videoProgress';
import { courseMeta } from '../config/courseMode';
import { formatClipTime } from '../utils/youtube';
import { track } from '../services/analytics';
import YouTubeLessonPlayer from '../components/YouTubeLessonPlayer';
import DriveLessonPlayer from '../components/DriveLessonPlayer';
import { parseStoredVideoId } from '../utils/videoSource';
import ReadBody from '../components/precourse/ReadBody';
import QuizQuestion from '../components/precourse/QuizQuestion';

const RETRY_COOLDOWN_SEC = 20; // หน่วงก่อนลองควิซใหม่ — กันการสุ่มตอบรัว ๆ

// สลับลำดับตัวเลือกแบบ Fisher–Yates (correctId อิงจาก id ไม่อิงตำแหน่ง จึงสลับได้ปลอดภัย)
function shuffle(arr) {
  const a = [...(arr || [])];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildShuffled(quizArr) {
  const map = {};
  for (const q of quizArr || []) map[q.id] = shuffle(q.choices);
  return map;
}

// หน้าเรียนแบ่งเป็นสเต็ป (ดูวิดีโอ → สรุปประเด็น → แบบทดสอบ → สรุปผล) แทนการกางทุกอย่างซ้อนกัน
// สเต็ปสร้างตามของที่คลิปนั้นมีจริง — คลิปที่ไม่มีสรุป/ไม่มีควิซจะข้ามสเต็ปนั้นไป
function buildStepKeys(clip) {
  if (!clip) return ['video'];
  const keys = ['video'];
  if (clip.keyPoints?.trim()) keys.push('summary');
  if (clip.quiz?.length) keys.push('quiz');
  keys.push('result');
  return keys;
}
const STEP_LABELS = {
  video: 'ดูวิดีโอ',
  summary: 'สรุปประเด็น',
  quiz: 'แบบทดสอบ',
  result: 'สรุปผล',
};

export default function VideoLessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { byTopic, loading } = useVideoLessons();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const { isAuthenticated: isAdmin } = useAuth();
  const playerRef = useRef(null);

  const clip = useMemo(() => {
    for (const list of Object.values(byTopic)) {
      const found = list.find(c => c.id === id);
      if (found) return found;
    }
    return null;
  }, [byTopic, id]);

  const topicClips = clip ? (byTopic[clip.topic] || []) : [];
  const clipIndex = clip ? topicClips.findIndex(c => c.id === clip.id) : -1;
  const nextClip = clipIndex >= 0 ? topicClips[clipIndex + 1] : null;
  const topicMeta = clip ? VIDEO_TOPIC_MAP[clip.topic] : null;
  // youtube_id เก็บได้ทั้ง id YouTube 11 ตัว และ "drive:<file_id>" — Drive เล่นผ่าน iframe /preview
  // ซึ่งไม่มี API จับความคืบหน้า/seek จึงใช้ปุ่มยืนยันดูจบแทน และสารบัญกดกระโดดเวลาไม่ได้
  const videoSource = clip ? parseStoredVideoId(clip.youtubeId) : null;
  const canSeek = videoSource?.type !== 'drive';
  const stepKeys = useMemo(() => buildStepKeys(clip), [clip]);

  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [watched, setWatched] = useState(false);
  const [answers, setAnswers] = useState({});       // { [questionId]: choiceId }
  const [shuffledChoices, setShuffledChoices] = useState({}); // { [questionId]: choices[] }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [dwellSec, setDwellSec] = useState(0); // วินาทีที่อยู่บนสเต็ปวิดีโอจริง ๆ (ประตูเวลาคลิป Drive)
  const [stepIdx, setStepIdx] = useState(0);   // ตำแหน่งใน stepKeys
  const [qIndex, setQIndex] = useState(0);     // ข้อที่กำลังทำในสเต็ปแบบทดสอบ
  const [showReview, setShowReview] = useState(false); // กาง "ทบทวนเฉลย" ในสเต็ปสรุปผล
  const startedAtRef = useRef(new Date().toISOString());
  const watchTrackedRef = useRef(false);
  const lockTrackedRef = useRef(false);

  // โหลด progress/attempts ทั้งชุดของนักเรียน เพื่อคำนวณ "ปลดล็อก" ตามลำดับคลิป
  useEffect(() => {
    if (!activeStudent) { setProgress([]); setAttempts([]); return; }
    Promise.all([
      getLessonProgress(activeStudent.id),
      getAttemptsForStudent(activeStudent.id),
    ]).then(([p, a]) => { setProgress(p); setAttempts(a); });
  }, [activeStudent?.id]);

  const { progressLessonIds, passedLessonIds } = buildProgressSets(progress, attempts);
  // บังคับลำดับเฉพาะนักเรียนที่ลงทะเบียน (มี activeStudent) — guest ยังเปิดชมได้อิสระ
  // เพราะไม่มีที่บันทึก progress; แอดมินข้ามล็อกได้เสมอเพื่อพรีวิว
  const unlocked = isAdmin || !activeStudent || !clip
    || clipUnlocked(clip, topicClips, progressLessonIds, passedLessonIds);

  // init/reset state ต่อคลิป (และเมื่อ progress/attempts โหลดเสร็จ)
  useEffect(() => {
    setAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
    setQuizScore(0); setQuizCorrect(0); setRetryCooldown(0);
    setStepIdx(0); setQIndex(0); setShowReview(false); setDwellSec(0);
    startedAtRef.current = new Date().toISOString();
    watchTrackedRef.current = false;
    lockTrackedRef.current = false;
    if (!clip) return;
    setShuffledChoices(buildShuffled(clip.quiz));
    const key = videoLessonKey(clip.id);
    setWatched(progressLessonIds.has(key));
    if (clip.quiz?.length) {
      const forLesson = attempts.filter(a => a.lessonId === key);
      const best = forLesson.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
      if (best?.passed) {
        setQuizSubmitted(true); setQuizPassed(true);
        setQuizScore(best.score ?? 0); setQuizCorrect(best.correctCount ?? 0);
        // เคยทำผ่านแล้ว — เปิดมาที่สเต็ปสรุปผลเลย ไม่ต้องไล่ดูใหม่ทั้งคลิป
        setStepIdx(buildStepKeys(clip).length - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip?.id, progress, attempts]);

  // เปลี่ยนสเต็ป/เปลี่ยนข้อ = เนื้อหาใหม่ทั้งจอ — เด้งขึ้นบนสุด ไม่งั้นบนมือถือจะโผล่กลางหน้า
  useEffect(() => { window.scrollTo(0, 0); }, [stepIdx, qIndex]);

  // ประตูเวลาของสเต็ปดูวิดีโอ — คลิป Drive จับความคืบหน้าไม่ได้ (ต่างจาก YouTube ที่ player
  // ยิง onWatched เองเมื่อดูถึง 90%) เดิมจึงกด "ถัดไป" ข้ามได้ทันที ตอนนี้ถ้าคลิปมี durationSec
  // ปุ่มจะซ่อนไว้จนกว่าจะอยู่บนสเต็ปนี้ครบ 90% ของความยาวคลิป — นับเฉพาะตอนแท็บเปิดอยู่
  // ไม่ตั้ง durationSec = ไม่มีประตู (พฤติกรรมเดิม); แอดมินข้ามได้เสมอเพื่อพรีวิว
  const gateSec = !canSeek && clip?.durationSec ? Math.max(5, Math.round(clip.durationSec * 0.9)) : 0;
  const gateLocked = gateSec > 0 && !isAdmin && !watched && dwellSec < gateSec;
  const onVideoStep = stepKeys[Math.min(stepIdx, stepKeys.length - 1)] === 'video';

  useEffect(() => {
    if (!onVideoStep || !gateLocked) return;
    const t = setInterval(() => {
      // สลับแท็บ/ปิดจอ = ไม่นับ กันการเปิดค้างไว้เฉย ๆ แล้วไปทำอย่างอื่น
      if (document.visibilityState === 'visible') setDwellSec(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [onVideoStep, gateLocked]);

  // นับถอยหลัง cooldown สำหรับปุ่ม "ลองใหม่"
  useEffect(() => {
    if (retryCooldown <= 0) return;
    const t = setTimeout(() => setRetryCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [retryCooldown]);

  // ยิง analytics เมื่อเปิดคลิปที่ยังล็อก (ครั้งเดียวต่อคลิป)
  useEffect(() => {
    if (clip && !unlocked && !lockTrackedRef.current) {
      lockTrackedRef.current = true;
      track('lesson_locked_view', { props: { clip_id: clip.id, topic: clip.topic } });
    }
  }, [clip, unlocked]);

  const handleWatched = () => {
    setWatched(true);
    if (activeStudent && clip) markLessonRead(activeStudent.id, videoLessonKey(clip.id));
    if (clip && !watchTrackedRef.current) {
      watchTrackedRef.current = true;
      track('lesson_video_watched', { props: { clip_id: clip.id, topic: clip.topic, title: clip.title } });
    }
  };

  const passingScore = courseMeta.passingScore.lesson;
  const quiz = clip?.quiz || [];
  const allAnswered = quiz.length > 0 && quiz.every(q => answers[q.id] != null);
  const quizUnlocked = watched || isAdmin;

  const submitQuiz = () => {
    if (!allAnswered) return;
    const correctCount = quiz.filter(q => answers[q.id] === q.correctId).length;
    const score = Math.round((correctCount / quiz.length) * 100);
    const passed = score >= passingScore;
    setQuizSubmitted(true);
    setQuizPassed(passed);
    setQuizScore(score);
    setQuizCorrect(correctCount);
    if (!passed) setRetryCooldown(RETRY_COOLDOWN_SEC);
    if (activeStudent && clip) {
      saveQuizAttempt({
        studentId: activeStudent.id,
        lessonId: videoLessonKey(clip.id),
        score,
        totalQuestions: quiz.length,
        correctCount,
        answers,
        startedAt: startedAtRef.current,
        finishedAt: new Date().toISOString(),
        passed,
      });
    }
    if (clip) {
      track('lesson_quiz_submitted', {
        props: { clip_id: clip.id, topic: clip.topic, score, passed, correct_count: correctCount, total: quiz.length },
      });
    }
  };

  const retryQuiz = () => {
    if (retryCooldown > 0) return;
    setQuizSubmitted(false);
    setAnswers({});
    setShuffledChoices(buildShuffled(quiz));
    startedAtRef.current = new Date().toISOString();
    // กลับไปเริ่มข้อแรกของสเต็ปแบบทดสอบ
    setShowReview(false);
    setQIndex(0);
    const quizStep = stepKeys.indexOf('quiz');
    if (quizStep >= 0) setStepIdx(quizStep);
  };

  if (loading) return <div className="page-container py-12 text-center text-caption text-text-muted">กำลังโหลด…</div>;
  if (!clip) {
    return (
      <div className="page-container py-12 text-center space-y-3">
        <div className="text-caption text-text-muted">ไม่พบวิดีโอนี้</div>
        <button onClick={() => navigate('/video-lessons')} className="btn btn-ghost btn-sm">กลับไปไลบรารีวิดีโอ</button>
      </div>
    );
  }

  // คลิปยังล็อก (และไม่ใช่แอดมิน) — กันการเข้าตรง URL
  if (!unlocked) {
    const prevRequired = topicClips.slice(0, clipIndex).filter(c => c.required);
    const prevClip = prevRequired[prevRequired.length - 1];
    return (
      <div className="page-container space-y-4 pb-24">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/video-lessons')} className="inline-flex items-center text-caption text-text-muted hover:text-text-primary">
            <ChevronLeft size={18} strokeWidth={2.2} /> {topicMeta?.emoji} {topicMeta?.label}
          </button>
        </div>
        <div className="dash-card text-center space-y-3 py-8">
          <div className="w-14 h-14 mx-auto inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 'var(--radius-xl)' }}>
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <div className="text-headline text-text-primary">คลิปนี้ยังไม่ปลดล็อก</div>
          <div className="text-caption text-text-muted">
            ต้องเรียนคลิปก่อนหน้าให้จบ (ดูวิดีโอ + ทำควิซให้ผ่าน) ก่อนจึงจะเข้าคลิปนี้ได้
          </div>
          {prevClip && (
            <button onClick={() => navigate(`/video-lessons/${prevClip.id}`)} className="btn btn-primary btn-sm">
              ไปเรียนคลิปก่อนหน้า: {prevClip.title}
            </button>
          )}
          <div>
            <button onClick={() => navigate('/video-lessons')} className="btn btn-ghost btn-sm">กลับไปไลบรารีวิดีโอ</button>
          </div>
        </div>
      </div>
    );
  }

  const done = watched && (quiz.length === 0 || quizPassed);
  const canAdvance = isAdmin || !activeStudent || done;

  const safeStep = Math.min(stepIdx, stepKeys.length - 1);
  const currentStep = stepKeys[safeStep];
  const safeQIndex = Math.min(qIndex, Math.max(0, quiz.length - 1));
  const currentQ = quiz[safeQIndex];
  const isLastQuestion = safeQIndex >= quiz.length - 1;
  // "กำลังทำข้อสอบอยู่จริง" — สเต็ปแบบทดสอบที่ปลดล็อกแล้วและยังไม่ส่งคำตอบ
  const onQuizStep = currentStep === 'quiz' && quizUnlocked && !quizSubmitted;
  const showActionBar = currentStep !== 'result';
  const progressPct = Math.round(((safeStep + 1) / stepKeys.length) * 100);

  const goNext = () => {
    // ยังไม่ครบเวลาประตู = ปุ่มยังไม่โผล่ กันเผื่อถูกเรียกจากทางอื่น
    if (currentStep === 'video' && gateLocked) return;
    // คลิป Drive จับความคืบหน้าไม่ได้ ต้องให้ผู้เรียนรับรองเอง — ให้ปุ่ม "ถัดไป"
    // นับเป็นการรับรองไปในตัว จะได้ไม่ต้องกดสองที แล้วไปตันที่การ์ดแบบทดสอบที่ล็อก
    if (currentStep === 'video' && !canSeek && !watched) handleWatched();
    if (onQuizStep) {
      if (!isLastQuestion) { setQIndex(safeQIndex + 1); return; }
      if (!allAnswered) return;
      submitQuiz();
    }
    setStepIdx(Math.min(stepKeys.length - 1, safeStep + 1));
  };

  const goPrev = () => {
    if (onQuizStep && safeQIndex > 0) { setQIndex(safeQIndex - 1); return; }
    let target = safeStep - 1;
    // ส่งคำตอบไปแล้วคำตอบล็อกถาวร ย้อนกลับไปแก้ไม่ได้ — ถอยข้ามสเต็ปแบบทดสอบไปเลย
    if (stepKeys[target] === 'quiz' && quizSubmitted) target -= 1;
    if (target < 0) return;
    setStepIdx(target);
  };

  return (
    <div className={`page-container space-y-4 ${showActionBar ? 'page-with-action-bar' : 'pb-24'}`}>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/video-lessons')} className="inline-flex items-center text-caption text-text-muted hover:text-text-primary">
          <ChevronLeft size={18} strokeWidth={2.2} /> {topicMeta?.emoji} {topicMeta?.label}
        </button>
      </div>

      {/* แถบบอกสเต็ป — ดูวิดีโอ → สรุปประเด็น → แบบทดสอบ → สรุปผล */}
      <div className="dash-card !py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* padding/margin ต้องใส่แบบ !important — reset ที่ index.css:64 ไม่อยู่ใน layer
              จึงชนะ utility เว้นระยะของ Tailwind เสมอ (เหมือนที่โค้ดเดิมใช้ !p-3) */}
          <span className="inline-flex items-center gap-1.5 bg-info text-white text-xs font-extrabold !px-2.5 !py-1 shrink-0"
            style={{ borderRadius: 99 }}>
            <span className="tabular-nums">{safeStep + 1}</span>
            <span className="opacity-70">/</span>
            <span className="tabular-nums opacity-90">{stepKeys.length}</span>
            <span>{STEP_LABELS[currentStep]}</span>
          </span>
          <span className="text-2xs text-text-muted text-right">
            {currentStep === 'quiz' && quizUnlocked && !quizSubmitted
              ? <>ข้อ <strong className="text-text-primary">{safeQIndex + 1}</strong>/{quiz.length}</>
              : <>คลิป {clipIndex + 1}/{topicClips.length}</>}
          </span>
        </div>
        <div className="progress-track !h-1.5 !mt-2">
          <div className="progress-fill bg-info" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ชื่อคลิป — สเต็ปแรกแสดงเต็ม สเต็ปอื่นย่อเป็นบรรทัดเดียวไว้กันหลง */}
      {currentStep !== 'video' && (
        <div className="flex items-start justify-between gap-2">
          <div className="text-body-strong text-text-secondary">{clip.title}</div>
          {done && <span className="inline-flex items-center gap-1 text-2xs font-bold text-success shrink-0 mt-0.5"><CheckCircle2 size={14} strokeWidth={2.4} /> ผ่านแล้ว</span>}
        </div>
      )}

      {/* สเต็ป 1 — ดูวิดีโอ (+ สารบัญช่วงเวลา ใช้กระโดดระหว่างดู) */}
      {currentStep === 'video' && (
        <>
          {videoSource?.type === 'drive' ? (
            <DriveLessonPlayer
              fileId={videoSource.id}
              orientation={clip.orientation}
              label={clip.title}
            />
          ) : (
            <YouTubeLessonPlayer
              ref={playerRef}
              videoId={clip.youtubeId}
              startSec={clip.startSec}
              endSec={clip.endSec}
              orientation={clip.orientation}
              onWatched={handleWatched}
            />
          )}

          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-headline text-text-primary">{clip.title}</h1>
              {done && <span className="inline-flex items-center gap-1 text-2xs font-bold text-success shrink-0 mt-1"><CheckCircle2 size={14} strokeWidth={2.4} /> ผ่านแล้ว</span>}
            </div>
            <div className="text-caption text-text-muted mt-0.5">
              คลิป {clipIndex + 1}/{topicClips.length}
              {watched ? ' · ดูจบแล้ว ✓'
                : canSeek ? ' · ดูจนเกือบจบเพื่อนับว่า "ดูครบ"'
                : gateSec > 0 ? ' · ดูให้จบ ปุ่ม "ถัดไป" จะขึ้นเองเมื่อครบเวลา'
                : ' · ดูจบแล้วกด "ถัดไป"'}
            </div>
          </div>

          {clip.chapters?.length > 0 && (
            <div className="dash-card !p-3">
              <div className="text-overline text-purple mb-2 inline-flex items-center gap-1.5"><MapPin size={12} strokeWidth={2.4} /> สารบัญช่วงเวลา</div>
              <div className="space-y-1">
                {clip.chapters.map((ch, i) => (
                  <button key={i} onClick={() => canSeek && playerRef.current?.seekTo(ch.t)}
                    disabled={!canSeek}
                    className={`w-full flex items-center gap-2.5 py-1.5 text-left rounded-md px-1 -mx-1 transition-colors ${canSeek ? 'hover:bg-bg-tertiary' : 'cursor-default'}`}>
                    <span className="text-xs font-bold text-purple bg-purple/10 px-2 py-0.5 shrink-0" style={{ borderRadius: 7, fontVariantNumeric: 'tabular-nums' }}>
                      {formatClipTime(ch.t)}
                    </span>
                    <span className="text-caption text-text-secondary flex-1">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* สเต็ป 2 — สรุปประเด็นสำคัญ */}
      {currentStep === 'summary' && (
        <div className="dash-card">
          <div className="text-overline text-purple mb-2 inline-flex items-center gap-1.5"><FileText size={12} strokeWidth={2.4} /> สรุปประเด็นสำคัญ</div>
          <ReadBody body={clip.keyPoints} />
        </div>
      )}

      {/* สเต็ป 3 — แบบทดสอบทีละข้อ */}
      {currentStep === 'quiz' && !quizUnlocked && (
        <div className="dash-card text-center space-y-2 py-6">
          <div className="w-12 h-12 mx-auto inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 'var(--radius-lg)' }}>
            <PlayCircle size={22} strokeWidth={2.2} />
          </div>
          <div className="text-caption font-bold text-text-secondary">ดูวิดีโอให้จบก่อนเพื่อปลดล็อกแบบทดสอบ</div>
          <div className="text-2xs text-text-muted">แบบทดสอบ {quiz.length} ข้อ · ผ่าน ≥ {passingScore}%</div>
          {/* ทางออกจากหน้านี้ต้องอยู่บนหน้านี้ — ไม่งั้นผู้เรียนตันเพราะปุ่มปลดล็อกอยู่สเต็ปก่อนหน้า */}
          <button onClick={() => setStepIdx(stepKeys.indexOf('video'))}
            className="btn btn-primary btn-sm !mt-3">
            <PlayCircle size={14} strokeWidth={2.4} /> กลับไปดูวิดีโอ
          </button>
        </div>
      )}

      {currentStep === 'quiz' && quizUnlocked && currentQ && (
        <div className="dash-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-overline text-success inline-flex items-center gap-1.5"><CheckCircle2 size={12} strokeWidth={2.4} /> เช็คความเข้าใจ (ผ่าน ≥ {passingScore}%)</div>
            <span className="text-2xs text-text-muted">ข้อ {safeQIndex + 1}/{quiz.length}</span>
          </div>
          <QuizQuestion
            question={currentQ}
            choices={shuffledChoices[currentQ.id]}
            chosenId={answers[currentQ.id]}
            onChoose={(cid) => !quizSubmitted && setAnswers(a => ({ ...a, [currentQ.id]: cid }))}
            locked={quizSubmitted}
            showCorrect={quizSubmitted}
          />
        </div>
      )}

      {/* สเต็ป 4 — สรุปผล + เฉลย (พับไว้) + ไปต่อ */}
      {currentStep === 'result' && (
        <>
          {quiz.length > 0 && quizSubmitted && (
            <div className="dash-card text-center space-y-2">
              <div className="text-caption text-text-muted">
                ได้ {quizCorrect}/{quiz.length} ข้อ ({quizScore}%)
              </div>
              <div className={`text-headline font-bold ${quizPassed ? 'text-success' : 'text-warning'}`}>
                {quizPassed ? '🎉 ผ่านควิซแล้ว!' : 'ยังไม่ผ่าน — ทบทวนคลิปแล้วลองใหม่'}
              </div>
              {!quizPassed && (
                <button onClick={retryQuiz} disabled={retryCooldown > 0}
                  className="block mx-auto btn btn-ghost btn-sm disabled:opacity-40">
                  {retryCooldown > 0 ? `ทบทวนวิดีโอแล้วลองใหม่ได้ใน ${retryCooldown} วิ` : 'ลองใหม่'}
                </button>
              )}
            </div>
          )}

          {quiz.length > 0 && !quizSubmitted && (
            <div className="dash-card text-center space-y-2 py-5">
              <div className="text-caption font-bold text-text-secondary">ยังไม่ได้ทำแบบทดสอบ</div>
              <div className="text-2xs text-text-muted">แบบทดสอบ {quiz.length} ข้อ · ผ่าน ≥ {passingScore}%</div>
              <button onClick={() => { setQIndex(0); setStepIdx(stepKeys.indexOf('quiz')); }}
                className="btn btn-success btn-sm">
                ไปทำแบบทดสอบ
              </button>
            </div>
          )}

          {/* เฉลยครบทุกข้อ — พับไว้ ไม่ให้หน้ายาวโดยไม่จำเป็น */}
          {quiz.length > 0 && quizSubmitted && (
            <div className="dash-card !p-3 space-y-3">
              <button onClick={() => setShowReview(v => !v)}
                className="w-full flex items-center justify-between gap-2 text-left">
                <span className="text-caption font-bold text-text-primary">ทบทวนเฉลย ({quiz.length} ข้อ)</span>
                <ChevronDown size={16} strokeWidth={2.4}
                  className={`text-text-muted shrink-0 transition-transform ${showReview ? 'rotate-180' : ''}`} />
              </button>
              {showReview && quiz.map((q, i) => {
                const correctChoice = q.choices.find(c => c.id === q.correctId);
                return (
                  <div key={q.id || i}
                    className={`space-y-2 ${i > 0 ? 'border-t border-border !pt-3 !mt-3' : '!mt-2'}`}>
                    <div className="text-2xs font-bold text-text-muted">ข้อ {i + 1}/{quiz.length}</div>
                    <QuizQuestion
                      question={q}
                      choices={shuffledChoices[q.id]}
                      chosenId={answers[q.id]}
                      onChoose={() => {}}
                      locked
                      showCorrect
                    />
                    <div className="text-caption text-text-secondary bg-bg-tertiary/50 p-2.5 space-y-1" style={{ borderRadius: 'var(--radius-sm)' }}>
                      {correctChoice && (
                        <div><span className="font-bold text-success">เฉลย:</span> {correctChoice.text}</div>
                      )}
                      {q.explanation && <div>{q.explanation}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* อ่านต่อในบทเรียน */}
          {clip.relatedPath && (
            <Link to={clip.relatedPath}
              className="dash-card !p-3 flex items-center gap-3 border-l-4 border-l-info hover:bg-bg-tertiary/50 transition-colors">
              <BookOpen size={18} strokeWidth={2.2} className="text-info shrink-0" />
              <span className="flex-1 text-caption font-bold text-info">{clip.relatedLabel || 'อ่านต่อในบทเรียน'}</span>
              <ChevronRight size={16} strokeWidth={2.2} className="text-info shrink-0" />
            </Link>
          )}

          {/* next */}
          {nextClip && (
            canAdvance ? (
              <button onClick={() => navigate(`/video-lessons/${nextClip.id}`)} className="btn btn-primary btn-block">
                คลิปถัดไป: {nextClip.title} <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            ) : (
              <div className="dash-card !p-3 text-center space-y-1">
                <button disabled className="btn btn-primary btn-block opacity-40 cursor-not-allowed">
                  <Lock size={14} strokeWidth={2.4} /> คลิปถัดไป: {nextClip.title}
                </button>
                <div className="text-2xs text-text-muted">
                  {quiz.length > 0 && !quizPassed ? 'ทำควิซให้ผ่านก่อนเพื่อไปคลิปถัดไป' : 'ดูวิดีโอให้จบก่อนเพื่อไปคลิปถัดไป'}
                </div>
              </div>
            )
          )}
          {!nextClip && done && (
            <div className="dash-card !p-3 text-center text-caption text-success font-bold inline-flex items-center justify-center gap-1.5 w-full">
              <Check size={15} strokeWidth={2.6} /> จบหัวข้อนี้แล้ว
            </div>
          )}

          <button onClick={goPrev} className="btn btn-ghost btn-sm !mt-2">
            <ChevronLeft size={14} strokeWidth={2.4} /> ย้อนกลับ
          </button>
        </>
      )}

      {/* แถบปุ่มติดขอบล่าง — เห็นตลอด ไม่ต้องสกรอลล์หา (สเต็ปสรุปผลใช้ปุ่มในเนื้อหาแทน) */}
      {showActionBar && (
        <div className="above-tab-bar bg-bg-primary/95 backdrop-blur border-y border-border !px-4 !py-3">
          <div className="max-w-[820px] !mx-auto flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={safeStep === 0 && !(onQuizStep && safeQIndex > 0)}
              className="btn btn-ghost btn-sm inline-flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft size={14} strokeWidth={2.4} /> ก่อนหน้า
            </button>
            <div className="flex-1" />
            {currentStep === 'video' && gateLocked ? (
              // ยังไม่ครบเวลา — ไม่โชว์ปุ่มเลย (ไม่ใช่ปุ่มจาง ๆ) จะได้ไม่มีอะไรให้กดรัว
              <span className="inline-flex items-center gap-1.5 text-caption font-bold text-text-muted">
                <Clock size={14} strokeWidth={2.4} />
                ดูต่ออีก <span className="tabular-nums text-text-secondary">{formatClipTime(gateSec - dwellSec)}</span>
              </span>
            ) : onQuizStep && isLastQuestion ? (
              <button
                onClick={goNext}
                disabled={!allAnswered}
                className="btn btn-success btn-sm inline-flex items-center gap-1 disabled:opacity-40">
                <Check size={14} strokeWidth={2.4} /> ส่งคำตอบ
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={onQuizStep && answers[currentQ?.id] == null}
                className="btn btn-primary btn-sm inline-flex items-center gap-1 disabled:opacity-40">
                ถัดไป <ChevronRight size={14} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
