import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, ChevronLeft, ChevronRight, Images, Eye, SlidersHorizontal,
} from 'lucide-react';
import { signOut } from '../services/auth';
import { blsChapters } from '../data/blsKnowledgeContent';
import {
  fetchBlsKnowledgeMedia, addBlsKnowledgeVideo, knowledgeMediaKey, BLS_KNOWLEDGE_SECTION_PARENT_TYPE,
} from '../services/blsKnowledgeMediaService';
import ImageManager from '../components/admin/ImageManager';
import VideoManager from '../components/admin/VideoManager';
import LessonImages from '../components/precourse/LessonImages';
import LessonVideos from '../components/precourse/LessonVideos';

// label ของ section ไว้โชว์ในหน้า Admin — หัวข้อ QA-only ไม่มี heading จึงใช้คำถามแรกแทน
function sectionLabel(s, i) {
  if (s.heading) return s.heading;
  if (s.qa?.[0]?.q) return s.qa[0].q.length > 44 ? `${s.qa[0].q.slice(0, 44)}…` : s.qa[0].q;
  return `หัวข้อที่ ${i + 1}`;
}

// หน้าแอดมินจัดการสื่อของคลังความรู้ BLS (9 บท) — เดิน 2 ระดับ: เลือกบท → เดินทีละหัวข้อในบทนั้น
export default function AdminBlsKnowledgeMedia() {
  const navigate = useNavigate();
  const [chapterIdx, setChapterIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [imagesByKey, setImagesByKey] = useState({});
  const [videosByKey, setVideosByKey] = useState({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { imagesByKey, videosByKey } = await fetchBlsKnowledgeMedia({ force: true });
      setImagesByKey(imagesByKey);
      setVideosByKey(videosByKey);
    } catch (err) {
      alert('โหลดสื่อไม่สำเร็จ: ' + (err?.message || err));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { imagesByKey, videosByKey } = await fetchBlsKnowledgeMedia({ force: true });
        if (!alive) return;
        setImagesByKey(imagesByKey);
        setVideosByKey(videosByKey);
      } catch (err) {
        if (alive) alert('โหลดสื่อไม่สำเร็จ: ' + (err?.message || err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const chapter = blsChapters[chapterIdx];
  const sections = chapter.sections;
  const totalSections = sections.length;
  const safeIdx = Math.min(sectionIdx, Math.max(0, totalSections - 1));
  const section = sections[safeIdx] ?? null;
  const key = section ? knowledgeMediaKey(chapter.id, safeIdx) : null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const changeChapter = (idx) => { setChapterIdx(idx); setSectionIdx(0); };
  const progressPct = totalSections ? Math.round(((safeIdx + 1) / totalSections) * 100) : 0;

  // นับสื่อทั้งบทเพื่อโชว์ใน dropdown
  const chapterMediaCount = (ch) => {
    let imgs = 0, vids = 0;
    ch.sections.forEach((s, i) => {
      const k = knowledgeMediaKey(ch.id, i);
      imgs += imagesByKey[k]?.length || 0;
      vids += videosByKey[k]?.length || 0;
    });
    return { imgs, vids };
  };

  const currentImages = useMemo(() => (key ? imagesByKey[key] || [] : []), [imagesByKey, key]);
  const currentVideos = useMemo(() => (key ? videosByKey[key] || [] : []), [videosByKey, key]);
  const label = section ? sectionLabel(section, safeIdx) : '';

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
            <h1 className="text-body-strong text-text-primary">Admin — สื่อประกอบคลังความรู้ BLS</h1>
            <p className="text-2xs text-text-muted">เลือกบท แล้วเดินทีละหัวข้อ จัดการรูป/วิดีโอของแต่ละหัวข้อ</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
          <LogOut size={14} strokeWidth={2.2} /> ออก
        </button>
      </div>

      {/* เลือกบท */}
      <div className="dash-card !p-3 space-y-2">
        <label className="text-overline text-text-muted">เลือกบท</label>
        <select
          value={chapterIdx}
          onChange={(e) => changeChapter(Number(e.target.value))}
          className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          {blsChapters.map((ch, i) => {
            const { imgs, vids } = chapterMediaCount(ch);
            return (
              <option key={ch.id} value={i}>
                {ch.title} — {imgs} รูป · {vids} วิดีโอ
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : !section ? (
        <div className="text-center text-caption text-text-muted py-8">ไม่พบหัวข้อ</div>
      ) : (
        <>
          {/* แถบความคืบหน้า */}
          <div className="dash-card !p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1.5 bg-info text-white text-xs font-extrabold px-2.5 py-1 shrink-0"
                style={{ borderRadius: 99 }}
              >
                หัวข้อที่ <span className="tabular-nums">{safeIdx + 1}</span>
                <span className="opacity-70">/</span>
                <span className="tabular-nums opacity-90">{totalSections}</span>
              </span>
              <span className="text-2xs font-bold text-text-secondary truncate">{label}</span>
            </div>
            <div className="progress-track !h-2">
              <div className="progress-fill bg-info" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* preview + แผงจัดการสื่อ */}
          <section className="dash-card space-y-3 !p-5">
            <div className="inline-flex items-center gap-1.5 text-2xs font-bold text-text-muted">
              <Eye size={12} strokeWidth={2.2} /> มุมมองนักเรียน
            </div>
            <div className="text-headline text-info">{label}</div>
            {section.body && <p className="text-caption text-text-secondary">{section.body}</p>}
            {currentImages.length > 0 && (
              <LessonImages images={currentImages} fallbackAlt={label} />
            )}
            {currentVideos.length > 0 && (
              <div className="pt-1">
                <LessonVideos videos={currentVideos} title="วิดีโอประกอบหัวข้อนี้" />
              </div>
            )}
            {currentImages.length === 0 && currentVideos.length === 0 && (
              <div className="text-caption text-text-muted">ยังไม่มีรูป/วิดีโอสำหรับหัวข้อนี้</div>
            )}
          </section>

          <section className="dash-card space-y-4 !p-4 border border-info/30">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-info">
              <SlidersHorizontal size={13} strokeWidth={2.4} /> จัดการสื่อของหัวข้อนี้
            </div>
            <ImageManager
              parentType={BLS_KNOWLEDGE_SECTION_PARENT_TYPE}
              parentId={key}
              images={currentImages}
              onChange={reload}
            />
            <div className="h-px bg-border" />
            <VideoManager
              videos={currentVideos}
              onAdd={(url, opts) => addBlsKnowledgeVideo(key, url, opts)}
              onChange={reload}
            />
          </section>

          {/* ปุ่มเดินหัวข้อ */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setSectionIdx(Math.max(0, safeIdx - 1))}
              disabled={safeIdx === 0}
              className="btn btn-ghost btn-sm disabled:opacity-40">
              <ChevronLeft size={14} strokeWidth={2.2} /> ก่อนหน้า
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setSectionIdx(Math.min(totalSections - 1, safeIdx + 1))}
              disabled={safeIdx >= totalSections - 1}
              className="btn btn-primary btn-sm disabled:opacity-40">
              ถัดไป <ChevronRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        </>
      )}

      <p className="text-2xs text-text-muted text-center pt-2 inline-flex items-center justify-center gap-1 w-full">
        <Images size={11} strokeWidth={2.2} /> สื่อจะ refresh ในแอปนักเรียนภายใน 6 ชั่วโมง (cache TTL)
      </p>
      <div className="text-center">
        <Link to="/admin" className="btn btn-ghost btn-sm">← กลับหน้า Dashboard</Link>
      </div>
    </div>
  );
}
