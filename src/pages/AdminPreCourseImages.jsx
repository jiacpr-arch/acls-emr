import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, ChevronLeft, ChevronRight, BookOpen, Eye, SlidersHorizontal,
} from 'lucide-react';
import { signOut } from '../services/auth';
import { preCourseLessons } from '../data/activeLessons';
import { fetchPreCourseMedia } from '../services/precourseImageService';
import ImageManager from '../components/admin/ImageManager';
import VideoManager from '../components/admin/VideoManager';
import ReadBody from '../components/precourse/ReadBody';
import LessonImages from '../components/precourse/LessonImages';
import LessonVideos from '../components/precourse/LessonVideos';
import QuizQuestion from '../components/precourse/QuizQuestion';

// หน้าแอดมินจัดการสื่อบทเรียน pre-course — เดินทีละสเต็ปเหมือนหน้านักเรียน
// เห็นเนื้อหา/รูป/วิดีโอจริง แล้วจัดการสื่อของหัวข้อนั้นในแผงด้านล่าง
export default function AdminPreCourseImages() {
  const navigate = useNavigate();
  const [lessonId, setLessonId] = useState(preCourseLessons[0]?.id ?? '');
  const [stepIdx, setStepIdx] = useState(0);
  const [imagesByStep, setImagesByStep] = useState({});
  const [videosByStep, setVideosByStep] = useState({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { imagesByStep, videosByStep } = await fetchPreCourseMedia({ force: true });
      setImagesByStep(imagesByStep);
      setVideosByStep(videosByStep);
    } catch (err) {
      alert('โหลดสื่อไม่สำเร็จ: ' + (err?.message || err));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { imagesByStep, videosByStep } = await fetchPreCourseMedia({ force: true });
        if (!alive) return;
        setImagesByStep(imagesByStep);
        setVideosByStep(videosByStep);
      } catch (err) {
        if (alive) alert('โหลดสื่อไม่สำเร็จ: ' + (err?.message || err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const lesson = useMemo(() => preCourseLessons.find(l => l.id === lessonId) ?? null, [lessonId]);
  const steps = lesson?.steps ?? [];
  const totalSteps = steps.length;
  const safeIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));
  const step = steps[safeIdx] ?? null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const changeLesson = (id) => { setLessonId(id); setStepIdx(0); };
  const progressPct = totalSteps ? Math.round(((safeIdx + 1) / totalSteps) * 100) : 0;

  // นับสื่อทั้งบทเพื่อโชว์ใน dropdown
  const lessonMediaCount = (l) => {
    let imgs = 0, vids = 0;
    for (const s of l.steps) {
      if (s.type !== 'read') continue;
      imgs += imagesByStep[s.id]?.length || 0;
      vids += videosByStep[s.id]?.length || 0;
    }
    return { imgs, vids };
  };

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Admin
      </button>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <div
            className="w-10 h-10 inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Shield size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h1 className="text-body-strong text-text-primary">Admin — สื่อประกอบบทเรียน</h1>
            <p className="text-[11px] text-text-muted">เดินทีละหัวข้อเหมือนหน้านักเรียน แล้วจัดการรูป/วิดีโอของหัวข้อนั้น</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
          <LogOut size={14} strokeWidth={2.2} /> ออก
        </button>
      </div>

      {/* เลือกบทเรียน */}
      <div className="dash-card !p-3 space-y-2">
        <label className="text-overline text-text-muted">เลือกบทเรียน</label>
        <select
          value={lessonId}
          onChange={(e) => changeLesson(e.target.value)}
          className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          {preCourseLessons.map(l => {
            const { imgs, vids } = lessonMediaCount(l);
            return (
              <option key={l.id} value={l.id}>
                {l.title} — {imgs} รูป · {vids} วิดีโอ
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : !lesson ? (
        <div className="text-center text-caption text-text-muted py-8">ไม่พบบทเรียน</div>
      ) : (
        <>
          {/* แถบความคืบหน้า (เลียนแบบหน้านักเรียน) */}
          <div className="dash-card !p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1.5 bg-info text-white text-[12px] font-extrabold px-2.5 py-1 shrink-0"
                style={{ borderRadius: 99 }}
              >
                ขั้นที่ <span className="tabular-nums">{safeIdx + 1}</span>
                <span className="opacity-70">/</span>
                <span className="tabular-nums opacity-90">{totalSteps}</span>
              </span>
              <span className="text-[11px] font-bold text-text-secondary">
                {step?.type === 'read' ? 'หัวข้อเนื้อหา (มีสื่อ)' : 'คำถาม (ไม่มีสื่อ)'}
              </span>
            </div>
            <div className="progress-track !h-2">
              <div className="progress-fill bg-info" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* read step — preview เหมือนนักเรียน + แผงจัดการสื่อ */}
          {step?.type === 'read' && (
            <>
              <section className="dash-card space-y-3 !p-5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
                  <Eye size={12} strokeWidth={2.2} /> มุมมองนักเรียน
                </div>
                <div className="text-headline text-info">{step.heading}</div>
                <ReadBody body={step.body} />
                {imagesByStep[step.id]?.length > 0 && (
                  <LessonImages images={imagesByStep[step.id]} fallbackAlt={step.heading} />
                )}
                {videosByStep[step.id]?.length > 0 && (
                  <div className="pt-1">
                    <LessonVideos videos={videosByStep[step.id]} />
                  </div>
                )}
              </section>

              <section className="dash-card space-y-4 !p-4 border border-info/30">
                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-info">
                  <SlidersHorizontal size={13} strokeWidth={2.4} /> จัดการสื่อของหัวข้อนี้
                </div>
                <ImageManager
                  parentType="precourse-step"
                  parentId={step.id}
                  images={imagesByStep[step.id] || []}
                  onChange={reload}
                />
                <div className="h-px bg-border" />
                <VideoManager
                  stepId={step.id}
                  videos={videosByStep[step.id] || []}
                  onChange={reload}
                />
              </section>
            </>
          )}

          {/* quiz step — โชว์คำถามให้เห็นบริบท (อ่านอย่างเดียว ไม่มีสื่อ) */}
          {step?.type === 'quiz' && (
            <section className="dash-card space-y-3 !p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
                <Eye size={12} strokeWidth={2.2} /> มุมมองนักเรียน · คำถาม (สเต็ปนี้ไม่ใส่สื่อ)
              </div>
              <QuizQuestion
                question={step}
                chosenId={step.correctId}
                onChoose={() => {}}
                locked
                showCorrect
              />
              {step.explanation && (
                <div className="dash-card !p-3 border border-success/40 bg-success/8">
                  <div className="text-caption font-bold mb-1 text-success">เฉลย</div>
                  <div className="text-caption text-text-secondary leading-relaxed">{step.explanation}</div>
                </div>
              )}
            </section>
          )}

          {/* ปุ่มเดินสเต็ป */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setStepIdx(Math.max(0, safeIdx - 1))}
              disabled={safeIdx === 0}
              className="btn btn-ghost btn-sm disabled:opacity-40">
              <ChevronLeft size={14} strokeWidth={2.2} /> ก่อนหน้า
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setStepIdx(Math.min(totalSteps - 1, safeIdx + 1))}
              disabled={safeIdx >= totalSteps - 1}
              className="btn btn-primary btn-sm disabled:opacity-40">
              ถัดไป <ChevronRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        </>
      )}

      <p className="text-[11px] text-text-muted text-center pt-2 inline-flex items-center justify-center gap-1 w-full">
        <BookOpen size={11} strokeWidth={2.2} /> สื่อจะ refresh ในแอปนักเรียนภายใน 6 ชั่วโมง (cache TTL)
      </p>
      <div className="text-center">
        <Link to="/admin" className="btn btn-ghost btn-sm">← กลับหน้า Dashboard</Link>
      </div>
    </div>
  );
}
