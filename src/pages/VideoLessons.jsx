import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Check, Circle, ChevronRight, Lock } from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import { buildProgressSets, clipDone, clipWatched } from '../utils/videoProgress';
import { VIDEO_TOPIC_MAP } from '../data/videoTopics';

export default function VideoLessons() {
  const navigate = useNavigate();
  const { byTopic, topics, lessons, loading, error } = useVideoLessons();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (!activeStudent) { setProgress([]); setAttempts([]); return; }
    Promise.all([
      getLessonProgress(activeStudent.id),
      getAttemptsForStudent(activeStudent.id),
    ]).then(([p, a]) => { setProgress(p); setAttempts(a); });
  }, [activeStudent?.id]);

  const { progressLessonIds, passedLessonIds } = buildProgressSets(progress, attempts);

  const requiredTotal = lessons.filter(l => l.required).length;
  const requiredDone = lessons.filter(l => l.required && clipDone(l, progressLessonIds, passedLessonIds)).length;
  const pct = requiredTotal ? Math.round((requiredDone / requiredTotal) * 100) : 0;

  return (
    <div className="page-container space-y-5 pb-24">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.28)',
          }}>
          <Video size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">วิดีโอบทเรียน</h1>
        <p className="text-caption text-text-muted">คลิปสอนเชิงลึกทุกหัวข้อ · ดูครบ + ผ่านควิซ = นับเข้าใบประกาศ</p>
      </div>

      {requiredTotal > 0 && (
        <div className="dash-card text-center">
          <div className={`text-numeric text-4xl ${pct === 100 ? 'text-success' : 'text-purple'}`}>{pct}%</div>
          <div className="text-caption text-text-muted mt-1">ดูครบ + ผ่านควิซแล้ว {requiredDone}/{requiredTotal} คลิป (บังคับ)</div>
          <div className="progress-track !h-2 mt-3">
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : '#7C3AED' }} />
          </div>
        </div>
      )}

      {loading && <div className="text-center text-caption text-text-muted py-10">กำลังโหลด…</div>}

      {!loading && error && (
        <div className="dash-card text-center text-caption text-text-muted py-8">
          ยังไม่พร้อมใช้งานวิดีโอ — โปรดลองใหม่ภายหลัง
        </div>
      )}

      {!loading && !error && topics.length === 0 && (
        <div className="dash-card text-center text-caption text-text-muted py-10">
          ยังไม่มีวิดีโอบทเรียน — แอดมินกำลังเพิ่มเนื้อหา
        </div>
      )}

      {!loading && topics.map(tpc => {
        const clips = byTopic[tpc.id] || [];
        const meta = VIDEO_TOPIC_MAP[tpc.id] || tpc;
        return (
          <div key={tpc.id} className="space-y-2">
            <div className="text-overline text-text-muted px-1">
              <span className="mr-1.5" aria-hidden="true">{meta.emoji}</span>{meta.label}
            </div>
            <div className="space-y-2">
              {clips.map((clip, idx) => {
                const done = clipDone(clip, progressLessonIds, passedLessonIds);
                const watched = clipWatched(clip, progressLessonIds);
                return (
                  <button key={clip.id} onClick={() => navigate(`/video-lessons/${clip.id}`)}
                    className={`dash-card !p-3 w-full flex items-center gap-3 border transition-colors hover:border-purple/40 ${done ? 'border-success/40' : 'border-border'}`}>
                    <div className={`w-9 h-9 inline-flex items-center justify-center shrink-0 ${done ? 'bg-success/15 text-success' : 'bg-purple/10 text-purple'}`}
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      {done ? <Check size={16} strokeWidth={2.6} /> : <Circle size={15} strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-caption font-bold text-text-primary truncate">
                        <span className="text-text-muted font-mono mr-1.5">{idx + 1}.</span>{clip.title}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {watched && !done ? 'ดูแล้ว · ยังไม่ผ่านควิซ' : done ? 'ผ่านแล้ว' : 'ยังไม่ดู'}
                        {clip.quiz?.length > 0 && <span className="ml-1.5">· มีควิซ</span>}
                        {!clip.required && <span className="ml-1.5 text-text-muted">· เสริม</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!activeStudent && topics.length > 0 && (
        <div className="dash-card !p-3 bg-info/8 border border-info/30 flex items-start gap-2 text-caption text-text-secondary">
          <Lock size={15} strokeWidth={2.2} className="text-info shrink-0 mt-0.5" />
          <span>ลงทะเบียนเข้าเรียน (ที่หน้า Pre-course) เพื่อบันทึกความคืบหน้าและนับเข้าเงื่อนไขใบประกาศ</span>
        </div>
      )}
    </div>
  );
}
