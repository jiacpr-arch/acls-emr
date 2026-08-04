import { useState } from 'react';
import { ChevronDown, HeartPulse, Package, Wrench, ArrowDown, Info } from 'lucide-react';
import { MANIKIN_BASE_KIT, MANIKIN_HOWTO, resolveManikinSetup } from '../../data/checklists/manikinSetups';

// แผงคู่มือ "เตรียมหุ่น + ลำดับจังหวะ" สำหรับอาจารย์/ผู้คุมหุ่นที่ฐาน Megacode
// เดิมใบประเมินบอกแค่โจทย์ผู้ป่วยกับ algorithm สั้นๆ (เช่น "PEA → VF → ROSC")
// อาจารย์ที่เพิ่งมาคุมฐานจึงไม่รู้ว่าต้องตั้งหุ่นยังไงและเปลี่ยนจังหวะตอนไหน
// ข้อมูลมาจาก manikinSetups.js (เคสมือเขียน) หรือ derive จากบทเกม (เคสจากเกม)
//
// เปิดค้างไว้เป็นค่าเริ่มต้น — อาจารย์ต้องเห็นทันทีที่สุ่มโจทย์ได้ ก่อนเรียก
// นักเรียนเข้าฐาน (พับเก็บได้เมื่อเริ่มติ๊กให้คะแนน)
//
// รับ `target` เป็นตัวเคส/ใบประเมินแล้ว resolve เอง เพื่อให้ไฟล์ข้อมูลคู่มือ
// (ยาวหลายหมื่นตัวอักษร) ถูกโหลดพร้อมคอมโพเนนต์นี้แบบ lazy — ไม่ไปพองอยู่ใน
// bundle หลักที่ชนเพดาน precache ของ PWA (4 MB) อยู่แล้ว
export default function ManikinSetupPanel({ target, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const [kitOpen, setKitOpen] = useState(false);
  const setup = resolveManikinSetup(target);

  if (!setup || !setup.steps?.length) return null;

  return (
    <div className="border border-info/40 bg-info/8 overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        <HeartPulse size={15} strokeWidth={2.4} className="text-info shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-caption font-bold text-text-primary">
            เตรียมหุ่น &amp; ลำดับจังหวะ (สำหรับผู้คุมหุ่น)
          </span>
          <span className="block text-2xs text-text-muted">
            {setup.steps.length} จังหวะ · {setup.steps.map((s) => s.rhythm.split(' —')[0].split(' (')[0]).join(' → ')}
          </span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className={`text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2.5">
          {/* วิธีใช้ — กติกากลางที่ใช้ได้ทุกเคส */}
          <ul className="space-y-1">
            {MANIKIN_HOWTO.map((line) => (
              <li key={line} className="flex gap-1.5 text-2xs text-text-secondary">
                <Info size={11} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {/* ตั้งหุ่นเฉพาะเคส */}
          {setup.manikin && (
            <div className="bg-bg-tertiary p-2.5" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-overline text-text-muted mb-1 flex items-center gap-1">
                <Wrench size={11} strokeWidth={2.4} /> ตั้ง/แต่งหุ่นก่อนเริ่ม
              </div>
              <div className="text-2xs text-text-secondary leading-relaxed">{setup.manikin}</div>
            </div>
          )}

          {/* อุปกรณ์เฉพาะเคส */}
          {setup.props?.length > 0 && (
            <div className="bg-bg-tertiary p-2.5" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-overline text-text-muted mb-1 flex items-center gap-1">
                <Package size={11} strokeWidth={2.4} /> อุปกรณ์เฉพาะเคสที่ต้องวางรอไว้
              </div>
              <ul className="space-y-0.5">
                {setup.props.map((p) => (
                  <li key={p} className="text-2xs text-text-secondary">• {p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ลำดับจังหวะ — ส่วนที่อาจารย์ถามหามากที่สุด */}
          <div className="space-y-1.5">
            <div className="text-overline text-text-muted">ลำดับจังหวะบนจอ (เปลี่ยนตามที่ทีมทำ)</div>
            {setup.steps.map((st, i) => (
              <div key={i}>
                <div className="bg-bg-secondary border border-border p-2.5" style={{ borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-start gap-2">
                    <span
                      className="shrink-0 w-5 h-5 flex items-center justify-center bg-info text-white text-2xs font-bold"
                      style={{ borderRadius: 'var(--radius-full)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="text-caption font-bold text-text-primary">{st.rhythm}</div>
                      {st.vitals && (
                        <div className="text-2xs font-mono text-text-secondary">{st.vitals}</div>
                      )}
                      {st.cue && (
                        <div className="text-2xs text-text-secondary leading-relaxed">
                          <span className="text-text-muted">บทผู้คุมหุ่น: </span>{st.cue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {st.next && (
                  <div className="flex items-start gap-1.5 px-1 pt-1.5 pb-0.5">
                    <ArrowDown size={12} strokeWidth={2.6} className="text-warning shrink-0 mt-0.5" />
                    <span className="text-2xs font-bold text-warning leading-relaxed">
                      เปลี่ยนเมื่อ: {st.next}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ชุดอุปกรณ์มาตรฐาน — เหมือนกันทุกเคส เก็บพับไว้ไม่ให้บังลำดับจังหวะ */}
          <div>
            <button
              type="button"
              onClick={() => setKitOpen((v) => !v)}
              className="btn btn-ghost btn-sm btn-block"
            >
              <Package size={13} strokeWidth={2.2} />
              ชุดอุปกรณ์มาตรฐาน (ทุกเคส)
              <ChevronDown size={13} strokeWidth={2.4} className={kitOpen ? 'rotate-180' : ''} />
            </button>
            {kitOpen && (
              <ul className="space-y-0.5 pt-1.5">
                {MANIKIN_BASE_KIT.map((k) => (
                  <li key={k} className="text-2xs text-text-secondary">• {k}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
