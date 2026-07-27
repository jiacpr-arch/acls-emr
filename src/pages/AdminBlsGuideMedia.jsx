import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, ChevronLeft, ChevronRight, Images, Eye, SlidersHorizontal,
} from 'lucide-react';
import { signOut } from '../services/auth';
import {
  fetchBlsGuideMedia, addBlsGuideVideo, guideMediaKey, BLS_GUIDE_STEP_PARENT_TYPE,
} from '../services/blsGuideMediaService';
import ImageManager from '../components/admin/ImageManager';
import VideoManager from '../components/admin/VideoManager';
import LessonImages from '../components/precourse/LessonImages';
import LessonVideos from '../components/precourse/LessonVideos';

// สื่อของ 3 หน้า Guide BLS ผูกกับ slot สังเคราะห์ page:key — ต้องตรงกับ key จริงใน
// BLSAedGuide.jsx (steps[].n), BLSAlgorithm.jsx (variants[].id), BLSChokingRelief.jsx (sections[].id)
const GUIDE_PAGES = [
  {
    page: 'aed', label: 'AED',
    items: [
      { key: '1', title: 'ขั้นที่ 1 — เปิดเครื่อง AED' },
      { key: '2', title: 'ขั้นที่ 2 — ติดแผ่น Pads' },
      { key: '3', title: 'ขั้นที่ 3 — เคลียร์ ห้ามแตะผู้ป่วย' },
      { key: '4', title: 'ขั้นที่ 4 — กดปุ่ม Shock' },
      { key: '5', title: 'ขั้นที่ 5 — CPR ต่อ วิเคราะห์ซ้ำ' },
    ],
  },
  {
    page: 'algorithm', label: 'Algorithm',
    items: [
      { key: 'adult', title: 'Adult BLS' },
      { key: 'pediatric', title: 'Pediatric BLS' },
      { key: 'infant', title: 'Infant BLS' },
    ],
  },
  {
    page: 'choking', label: 'Choking Relief',
    items: [
      { key: 'adult', title: 'ผู้ใหญ่ / เด็กโต — รู้ตัว' },
      { key: 'infant', title: 'ทารก < 1 ปี — รู้ตัว' },
      { key: 'unconscious', title: 'หมดสติ' },
    ],
  },
];

// หน้าแอดมินจัดการสื่อของ 3 หน้า Guide BLS — เดินทีละ slot เหมือน AdminPreCourseImages
export default function AdminBlsGuideMedia() {
  const navigate = useNavigate();
  const [pageIdx, setPageIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [imagesByKey, setImagesByKey] = useState({});
  const [videosByKey, setVideosByKey] = useState({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { imagesByKey, videosByKey } = await fetchBlsGuideMedia({ force: true });
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
        const { imagesByKey, videosByKey } = await fetchBlsGuideMedia({ force: true });
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

  const guidePage = GUIDE_PAGES[pageIdx];
  const items = guidePage.items;
  const totalItems = items.length;
  const safeIdx = Math.min(itemIdx, Math.max(0, totalItems - 1));
  const item = items[safeIdx] ?? null;
  const key = item ? guideMediaKey(guidePage.page, item.key) : null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const changePage = (idx) => { setPageIdx(idx); setItemIdx(0); };
  const progressPct = totalItems ? Math.round(((safeIdx + 1) / totalItems) * 100) : 0;

  // นับสื่อทั้งหน้าเพื่อโชว์ใน dropdown
  const pageMediaCount = (gp) => {
    let imgs = 0, vids = 0;
    for (const it of gp.items) {
      const k = guideMediaKey(gp.page, it.key);
      imgs += imagesByKey[k]?.length || 0;
      vids += videosByKey[k]?.length || 0;
    }
    return { imgs, vids };
  };

  const currentImages = useMemo(() => (key ? imagesByKey[key] || [] : []), [imagesByKey, key]);
  const currentVideos = useMemo(() => (key ? videosByKey[key] || [] : []), [videosByKey, key]);

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
            <h1 className="text-body-strong text-text-primary">Admin — สื่อประกอบหน้า Guide BLS</h1>
            <p className="text-2xs text-text-muted">เดินทีละขั้น/ตัวแปร แล้วจัดการรูป/วิดีโอของแต่ละจุด</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
          <LogOut size={14} strokeWidth={2.2} /> ออก
        </button>
      </div>

      {/* เลือกหน้า Guide */}
      <div className="dash-card !p-3 space-y-2">
        <label className="text-overline text-text-muted">เลือกหน้า</label>
        <select
          value={pageIdx}
          onChange={(e) => changePage(Number(e.target.value))}
          className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          {GUIDE_PAGES.map((gp, i) => {
            const { imgs, vids } = pageMediaCount(gp);
            return (
              <option key={gp.page} value={i}>
                {gp.label} — {imgs} รูป · {vids} วิดีโอ
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : !item ? (
        <div className="text-center text-caption text-text-muted py-8">ไม่พบขั้นตอน</div>
      ) : (
        <>
          {/* แถบความคืบหน้า */}
          <div className="dash-card !p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1.5 bg-info text-white text-xs font-extrabold px-2.5 py-1 shrink-0"
                style={{ borderRadius: 99 }}
              >
                ขั้นที่ <span className="tabular-nums">{safeIdx + 1}</span>
                <span className="opacity-70">/</span>
                <span className="tabular-nums opacity-90">{totalItems}</span>
              </span>
              <span className="text-2xs font-bold text-text-secondary">{item.title}</span>
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
            <div className="text-headline text-info">{item.title}</div>
            {currentImages.length > 0 && (
              <LessonImages images={currentImages} fallbackAlt={item.title} />
            )}
            {currentVideos.length > 0 && (
              <div className="pt-1">
                <LessonVideos videos={currentVideos} title="วิดีโอสาธิตขั้นนี้" />
              </div>
            )}
            {currentImages.length === 0 && currentVideos.length === 0 && (
              <div className="text-caption text-text-muted">ยังไม่มีรูป/วิดีโอสำหรับขั้นนี้</div>
            )}
          </section>

          <section className="dash-card space-y-4 !p-4 border border-info/30">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-info">
              <SlidersHorizontal size={13} strokeWidth={2.4} /> จัดการสื่อของขั้นนี้
            </div>
            <ImageManager
              parentType={BLS_GUIDE_STEP_PARENT_TYPE}
              parentId={key}
              images={currentImages}
              onChange={reload}
            />
            <div className="h-px bg-border" />
            <VideoManager
              videos={currentVideos}
              onAdd={(url, opts) => addBlsGuideVideo(key, url, opts)}
              onChange={reload}
            />
          </section>

          {/* ปุ่มเดินสเต็ป */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setItemIdx(Math.max(0, safeIdx - 1))}
              disabled={safeIdx === 0}
              className="btn btn-ghost btn-sm disabled:opacity-40">
              <ChevronLeft size={14} strokeWidth={2.2} /> ก่อนหน้า
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setItemIdx(Math.min(totalItems - 1, safeIdx + 1))}
              disabled={safeIdx >= totalItems - 1}
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
