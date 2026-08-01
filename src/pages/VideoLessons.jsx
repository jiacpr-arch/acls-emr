import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Circle, ChevronRight, Lock, Wind, Activity, Zap, Turtle,
  Rabbit, HeartPulse, Syringe, Heart, LifeBuoy, Link2, Users, Hospital,
  Baby, BookOpen,
} from 'lucide-react';
import { useVideoLessons } from '../hooks/useVideoLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useAuth } from '../hooks/useAuth';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import { buildProgressSets, clipDone, clipWatched, clipUnlocked } from '../utils/videoProgress';
import { VIDEO_TOPIC_MAP } from '../data/videoTopics';
import PageHero from '../components/PageHero';

// หัวข้อวิดีโอมี emoji ติดมากับข้อมูล (videoTopics.js) — map เป็น lucide ที่
// ระดับ component แทน ไม่แก้ data file เพราะใช้ร่วมกันหลายจุด
const TOPIC_ICONS = {
  airway: Wind, ekg: Activity, defib: Zap, brady: Turtle, tachy: Rabbit,
  arrest: HeartPulse, iv: Syringe, postarrest: Heart, bls: LifeBuoy,
  chain: Link2, 'cpr-adult': Heart, aed: Zap, team: Users, inhospital: Hospital,
  pediatric: Baby, choking: Wind, special: Activity, assess: Wind,
  'opa-npa': Wind, bvm: Wind, advanced: Activity, fbao: LifeBuoy,
  principles: Zap, 'aed-manual': Zap, ccf: Activity, cardioversion: Zap,
  pacing: HeartPulse, peripheral: Syringe, io: Syringe, 'drugs-cpr': Syringe,
};

export default function VideoLessons() {
  const navigate = useNavigate();
  const { byTopic, topics, lessons, loading, error } = useVideoLessons();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const { isAuthenticated: isAdmin } = useAuth();
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
    <div className="page-container flex flex-col gap-4 pb-24">
      <PageHero
        title="วิดีโอบทเรียน"
        desc="คลิปสอนเชิงลึกทุกหัวข้อ · ดูครบ + ผ่านควิซ = นับเข้าใบประกาศนียบัตร"
      />

      {requiredTotal > 0 && (
        <div className="dash-card text-center">
          <div className={`text-numeric text-4xl ${pct === 100 ? 'text-success' : 'text-info'}`}>{pct}%</div>
          <div className="text-caption text-text-muted mt-1">ดูครบ + ผ่านควิซแล้ว {requiredDone}/{requiredTotal} คลิป (บังคับ)</div>
          <div className="progress-track !h-2 mt-3">
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : 'var(--color-info)' }} />
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
        const TopicIcon = TOPIC_ICONS[tpc.id] || BookOpen;
        return (
          <div key={tpc.id} className="space-y-2">
            <div className="text-overline text-text-muted px-1 inline-flex items-center gap-1.5">
              <TopicIcon size={13} strokeWidth={2.4} aria-hidden="true" />{meta.label}
            </div>
            <div className="space-y-2">
              {clips.map((clip, idx) => {
                const done = clipDone(clip, progressLessonIds, passedLessonIds);
                const watched = clipWatched(clip, progressLessonIds);
                const unlocked = isAdmin || !activeStudent
                  || clipUnlocked(clip, clips, progressLessonIds, passedLessonIds);
                return (
                  <button key={clip.id}
                    onClick={() => unlocked && navigate(`/video-lessons/${clip.id}`)}
                    disabled={!unlocked}
                    className={`dash-card !p-3 w-full flex items-center gap-3 border transition-colors ${
                      unlocked ? 'hover:border-info/40' : 'opacity-60 cursor-not-allowed'
                    } ${done ? 'border-success/40' : 'border-border'}`}>
                    <div className={`w-9 h-9 inline-flex items-center justify-center shrink-0 ${
                      !unlocked ? 'bg-bg-tertiary text-text-muted'
                        : done ? 'bg-success/15 text-success'
                        : 'bg-info/10 text-info'
                    }`}
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      {!unlocked ? <Lock size={15} strokeWidth={2.2} />
                        : done ? <Check size={16} strokeWidth={2.6} />
                        : <Circle size={15} strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-caption font-bold text-text-primary truncate">
                        <span className="text-text-muted font-mono mr-1.5">{idx + 1}.</span>{clip.title}
                      </div>
                      <div className="text-2xs text-text-muted mt-0.5">
                        {!unlocked ? 'ปลดล็อกเมื่อเรียนคลิปก่อนหน้าจบ'
                          : watched && !done ? 'ดูแล้ว · ยังไม่ผ่านควิซ'
                          : done ? 'ผ่านแล้ว'
                          : 'ยังไม่ดู'}
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
          <span>ลงทะเบียนเข้าเรียน (ที่หน้า Pre-course) เพื่อบันทึกความคืบหน้าและนับเข้าเงื่อนไขใบประกาศนียบัตร</span>
        </div>
      )}
    </div>
  );
}
