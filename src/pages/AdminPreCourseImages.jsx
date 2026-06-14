import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ChevronDown, Shield, Images, BookOpen } from 'lucide-react';
import { signOut } from '../services/auth';
import { preCourseLessons } from '../data/activeLessons';
import { fetchPreCourseImages } from '../services/precourseImageService';
import ImageManager from '../components/admin/ImageManager';

export default function AdminPreCourseImages() {
  const navigate = useNavigate();
  const [imagesByStep, setImagesByStep] = useState({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  // refetch แบบเงียบ ๆ (ไม่ toggle หน้า loading) — ใช้หลังอัปโหลด/แก้/ลบรูป
  const reload = useCallback(async () => {
    try {
      const map = await fetchPreCourseImages({ force: true });
      setImagesByStep(map);
    } catch (err) {
      alert('โหลดรูปไม่สำเร็จ: ' + (err?.message || err));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const map = await fetchPreCourseImages({ force: true });
        if (alive) setImagesByStep(map);
      } catch (err) {
        if (alive) alert('โหลดรูปไม่สำเร็จ: ' + (err?.message || err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="page-container space-y-5">
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
            <h1 className="text-body-strong text-text-primary">Admin — รูปประกอบบทเรียน</h1>
            <p className="text-[11px] text-text-muted">อัปโหลดรูปเข้าแต่ละหัวข้อของบทเรียน pre-course</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
          <LogOut size={14} strokeWidth={2.2} /> ออก
        </button>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : (
        <div className="space-y-3">
          {preCourseLessons.map(lesson => {
            const isOpen = openId === lesson.id;
            const sections = lesson.sections || [];
            const imgCount = sections.reduce((n, s) => n + (imagesByStep[s.id]?.length || 0), 0);
            return (
              <div key={lesson.id} className="dash-card !p-0 overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : lesson.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors"
                >
                  <div className="w-9 h-9 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <BookOpen size={16} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-strong text-text-primary block truncate">{lesson.title}</span>
                    <span className="text-[11px] text-text-muted inline-flex items-center gap-1">
                      <Images size={11} strokeWidth={2.2} /> {sections.length} หัวข้อ · {imgCount} รูป
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    strokeWidth={2.2}
                    className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 animate-slide-up space-y-4">
                    <div className="h-px bg-border" />
                    {sections.map((s, i) => (
                      <div key={s.id} className="space-y-2">
                        <div className="text-caption font-bold text-text-primary">
                          {i + 1}. {s.heading}
                        </div>
                        <ImageManager
                          parentType="precourse-step"
                          parentId={s.id}
                          images={imagesByStep[s.id] || []}
                          onChange={reload}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-text-muted text-center pt-2">
        รูปจะ refresh ในแอป end-user ภายใน 6 ชั่วโมง (cache TTL) — กด refresh เพื่อดูทันที
      </p>
      <div className="text-center">
        <Link to="/admin" className="btn btn-ghost btn-sm">← กลับหน้า Dashboard</Link>
      </div>
    </div>
  );
}
