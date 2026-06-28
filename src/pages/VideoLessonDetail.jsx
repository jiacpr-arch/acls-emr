import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, FileText, CheckCircle2, BookOpen, Check } from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { markLessonRead, saveQuizAttempt, getLessonProgress, getBestAttempt } from '../db/database';
import { videoLessonKey, VIDEO_TOPIC_MAP } from '../data/videoTopics';
import { courseMeta } from '../config/courseMode';
import { formatClipTime } from '../utils/youtube';
import YouTubeLessonPlayer from '../components/YouTubeLessonPlayer';
import ReadBody from '../components/precourse/ReadBody';
import QuizQuestion from '../components/precourse/QuizQuestion';

export default function VideoLessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { byTopic, loading } = useVideoLessons();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
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

  const [watched, setWatched] = useState(false);
  const [answers, setAnswers] = useState({});       // { [questionId]: choiceId }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());

  // init watched/passed state จาก progress เดิม
  useEffect(() => {
    setWatched(false); setAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
    startedAtRef.current = new Date().toISOString();
    if (!clip || !activeStudent) return;
    const key = videoLessonKey(clip.id);
    getLessonProgress(activeStudent.id).then(rows => {
      if (rows.some(r => r.lessonId === key)) setWatched(true);
    });
    if (clip.quiz?.length) {
      getBestAttempt(activeStudent.id, key).then(best => {
        if (best?.passed) { setQuizSubmitted(true); setQuizPassed(true); }
      });
    }
  }, [clip?.id, activeStudent?.id]);

  const handleWatched = () => {
    setWatched(true);
    if (activeStudent && clip) markLessonRead(activeStudent.id, videoLessonKey(clip.id));
  };

  const passingScore = courseMeta.passingScore.lesson;
  const quiz = clip?.quiz || [];
  const allAnswered = quiz.length > 0 && quiz.every(q => answers[q.id] != null);

  const submitQuiz = () => {
    if (!allAnswered) return;
    const correctCount = quiz.filter(q => answers[q.id] === q.correctId).length;
    const score = Math.round((correctCount / quiz.length) * 100);
    const passed = score >= passingScore;
    setQuizSubmitted(true);
    setQuizPassed(passed);
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

  const done = watched && (quiz.length === 0 || quizPassed);

  return (
    <div className="page-container space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/video-lessons')} className="inline-flex items-center text-caption text-text-muted hover:text-text-primary">
          <ChevronLeft size={18} strokeWidth={2.2} /> {topicMeta?.emoji} {topicMeta?.label}
        </button>
      </div>

      <YouTubeLessonPlayer
        ref={playerRef}
        videoId={clip.youtubeId}
        startSec={clip.startSec}
        endSec={clip.endSec}
        orientation={clip.orientation}
        onWatched={handleWatched}
      />

      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-headline text-text-primary">{clip.title}</h1>
          {done && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success shrink-0 mt-1"><CheckCircle2 size={14} strokeWidth={2.4} /> ผ่านแล้ว</span>}
        </div>
        <div className="text-caption text-text-muted mt-0.5">
          คลิป {clipIndex + 1}/{topicClips.length}
          {watched ? ' · ดูจบแล้ว ✓' : ' · ดูจนเกือบจบเพื่อนับว่า "ดูครบ"'}
        </div>
      </div>

      {/* A — สารบัญช่วงเวลา */}
      {clip.chapters?.length > 0 && (
        <div className="dash-card !p-3">
          <div className="text-overline text-purple mb-2 inline-flex items-center gap-1.5"><MapPin size={12} strokeWidth={2.4} /> สารบัญช่วงเวลา</div>
          <div className="space-y-1">
            {clip.chapters.map((ch, i) => (
              <button key={i} onClick={() => playerRef.current?.seekTo(ch.t)}
                className="w-full flex items-center gap-2.5 py-1.5 text-left rounded-md px-1 -mx-1 transition-colors hover:bg-bg-tertiary">
                <span className="text-[12px] font-bold text-purple bg-purple/10 px-2 py-0.5 shrink-0" style={{ borderRadius: 7, fontVariantNumeric: 'tabular-nums' }}>
                  {formatClipTime(ch.t)}
                </span>
                <span className="text-caption text-text-secondary flex-1">{ch.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* B — สรุปประเด็นสำคัญ */}
      {clip.keyPoints?.trim() && (
        <div className="dash-card">
          <div className="text-overline text-purple mb-2 inline-flex items-center gap-1.5"><FileText size={12} strokeWidth={2.4} /> สรุปประเด็นสำคัญ</div>
          <ReadBody body={clip.keyPoints} />
        </div>
      )}

      {/* C — เช็คความเข้าใจ (ควิซ) */}
      {quiz.length > 0 && (
        <div className="dash-card space-y-4">
          <div className="text-overline text-success inline-flex items-center gap-1.5"><CheckCircle2 size={12} strokeWidth={2.4} /> เช็คความเข้าใจ (ผ่าน ≥ {passingScore}%)</div>
          {quiz.map((q, i) => (
            <div key={q.id || i} className="space-y-2">
              <QuizQuestion
                question={q}
                chosenId={answers[q.id]}
                onChoose={(cid) => !quizSubmitted && setAnswers(a => ({ ...a, [q.id]: cid }))}
                locked={quizSubmitted}
                showCorrect={quizSubmitted}
              />
              {quizSubmitted && q.explanation && (
                <div className="text-caption text-text-secondary bg-bg-tertiary/50 p-2.5" style={{ borderRadius: 'var(--radius-sm)' }}>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
          {!quizSubmitted ? (
            <button onClick={submitQuiz} disabled={!allAnswered}
              className="btn btn-success btn-block disabled:opacity-40">
              ส่งคำตอบ
            </button>
          ) : (
            <div className={`text-center text-caption font-bold ${quizPassed ? 'text-success' : 'text-warning'}`}>
              {quizPassed ? '🎉 ผ่านควิซแล้ว!' : 'ยังไม่ผ่าน — ทบทวนคลิปแล้วลองใหม่'}
              {!quizPassed && (
                <button onClick={() => { setQuizSubmitted(false); setAnswers({}); }} className="block mx-auto mt-2 btn btn-ghost btn-sm">ลองใหม่</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* D — อ่านต่อในบทเรียน */}
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
        <button onClick={() => navigate(`/video-lessons/${nextClip.id}`)} className="btn btn-primary btn-block">
          คลิปถัดไป: {nextClip.title} <ChevronRight size={16} strokeWidth={2.4} />
        </button>
      )}
      {!nextClip && done && (
        <div className="dash-card !p-3 text-center text-caption text-success font-bold inline-flex items-center justify-center gap-1.5 w-full">
          <Check size={15} strokeWidth={2.6} /> จบหัวข้อนี้แล้ว
        </div>
      )}
    </div>
  );
}
