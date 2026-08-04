import { useState } from 'react';
import { ChevronDown, Package, Wrench, ArrowDown, Info } from 'lucide-react';
import { MANIKIN_BASE_KIT, MANIKIN_HOWTO, resolveManikinSetup } from '../../data/checklists/manikinSetups';

// เนื้อหาคู่มือ "เตรียมหุ่น + ลำดับจังหวะ" สำหรับผู้คุมหุ่นที่ฐาน Megacode
// เดิมเป็นแผงพับซ้อนอยู่ในใบประเมินหน้าเดียว ทำให้หน้ายาวมาก — ตอนนี้ย้ายมาเป็น
// "หน้าเตรียมหุ่น" (step แรกของ wizard ใน ChecklistGrader) จึง render เนื้อหาเต็ม
// ไม่มี header พับ/กางของตัวเองแล้ว
//
// รับ `target` เป็นตัวเคส/ใบประเมินแล้ว resolve เอง เพื่อให้ไฟล์ข้อมูลคู่มือ
// (ยาวหลายหมื่นตัวอักษร) ถูกโหลดพร้อมคอมโพเนนต์นี้แบบ lazy — ไม่ไปพองอยู่ใน
// bundle หลักที่ชนเพดาน precache ของ PWA (4 MB) อยู่แล้ว
export default function ManikinSetupPanel({ target }) {
  const [howtoOpen, setHowtoOpen] = useState(false);
  const [kitOpen, setKitOpen] = useState(false);
  // index ของขั้นจังหวะที่กางดูรายละเอียด (vitals + บทผู้คุมหุ่น) อยู่
  const [expanded, setExpanded] = useState(() => new Set());
  const setup = resolveManikinSetup(target);

  if (!setup || !setup.steps?.length) return null;

  // ขั้นที่ "กางได้" = มีค่า vitals หรือบทพูดให้ดูเพิ่ม (เคสจากเกม derive มามี
  // แต่ชื่อจังหวะ + เปลี่ยนเมื่อ ไม่มีรายละเอียด จึงไม่ต้องโชว์ affordance กด)
  const expandableIdx = setup.steps
    .map((st, i) => ((st.vitals || st.cue) ? i : -1))
    .filter((i) => i >= 0);
  const allOpen = expandableIdx.length > 0 && expandableIdx.every((i) => expanded.has(i));

  const toggleStep = (i) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(expandableIdx));

  return (
    <div className="space-y-2.5">
      {/* กติกาการคุมหุ่น — ใช้ได้ทุกเคส เก็บพับไว้ default ไม่ให้บังลำดับจังหวะ */}
      <div>
        <button
          type="button"
          onClick={() => setHowtoOpen((v) => !v)}
          className="btn btn-ghost btn-sm btn-block"
        >
          <Info size={13} strokeWidth={2.2} />
          กติกาการคุมหุ่น (อ่านครั้งแรก)
          <ChevronDown size={13} strokeWidth={2.4} className={howtoOpen ? 'rotate-180' : ''} />
        </button>
        {howtoOpen && (
          <ul className="space-y-1 pt-1.5">
            {MANIKIN_HOWTO.map((line) => (
              <li key={line} className="flex gap-1.5 text-2xs text-text-secondary">
                <Info size={11} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ตั้งหุ่นเฉพาะเคส — สิ่งแรกที่ต้องทำ โชว์เต็มไม่พับ */}
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

      {/* ลำดับจังหวะ — การ์ดย่อ: โชว์ชื่อจังหวะ + "เปลี่ยนเมื่อ" แตะดูค่า/บทเพิ่ม */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-overline text-text-muted">ลำดับจังหวะบนจอ (เปลี่ยนตามที่ทีมทำ)</div>
          {expandableIdx.length > 0 && (
            <button type="button" onClick={toggleAll}
              className="text-2xs font-bold text-info">
              {allOpen ? 'ยุบทั้งหมด' : 'กางทั้งหมด'}
            </button>
          )}
        </div>
        {setup.steps.map((st, i) => {
          const expandable = !!(st.vitals || st.cue);
          const isOpen = expanded.has(i);
          const Card = expandable ? 'button' : 'div';
          return (
            <div key={i}>
              <Card
                {...(expandable ? { type: 'button', onClick: () => toggleStep(i) } : {})}
                className="w-full text-left bg-bg-secondary border border-border p-2.5"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="shrink-0 w-5 h-5 flex items-center justify-center bg-info text-white text-2xs font-bold"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-caption font-bold text-text-primary flex-1">{st.rhythm}</span>
                      {expandable && (
                        <ChevronDown size={14} strokeWidth={2.4}
                          className={`text-text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                    {isOpen && st.vitals && (
                      <div className="text-2xs font-mono text-text-secondary">{st.vitals}</div>
                    )}
                    {isOpen && st.cue && (
                      <div className="text-2xs text-text-secondary leading-relaxed">
                        <span className="text-text-muted">บทผู้คุมหุ่น: </span>{st.cue}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              {st.next && (
                <div className="flex items-start gap-1.5 px-1 pt-1.5 pb-0.5">
                  <ArrowDown size={12} strokeWidth={2.6} className="text-warning shrink-0 mt-0.5" />
                  <span className="text-2xs font-bold text-warning leading-relaxed">
                    เปลี่ยนเมื่อ: {st.next}
                  </span>
                </div>
              )}
            </div>
          );
        })}
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
  );
}
