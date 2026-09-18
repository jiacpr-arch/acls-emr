import { useState } from 'react';

const KIND_ICON = { lab: '🧪', xray: '🩻' };
const FALLBACK_ICON = '📎';

/** รูปย่อของหลักฐานหนึ่งชิ้น — มีรูปจริงก็ใช้ /images/docs/{docKey}.webp
 * ไม่มี/โหลดพลาด → fallback เป็น emoji icon (ไม่ probe ล่วงหน้าเหมือน DocReveal
 * เพราะเป็นรูปเล็กในลิสต์ ไม่มีปัญหาเรื่องรูปวาบตอนโหลด) */
export function EvidenceThumb({ docKey, kind, icon }) {
  const [failed, setFailed] = useState(false);
  if (docKey && !failed) {
    return (
      <img
        src={`/images/docs/${docKey}.webp`}
        alt=""
        className="cbs-evid-thumb-img"
        draggable="false"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className="cbs-evid-thumb-icon">{icon || KIND_ICON[kind] || FALLBACK_ICON}</span>;
}

/** แฟ้มหลักฐานเต็มจอ (Court Record) — เปิดดูหลักฐานที่เก็บมาได้ทุกเมื่อระหว่างเล่น
 * (ยกเว้นตอนกำลังมีคำถามค้างอยู่ — ปิดปุ่มไว้จากฝั่ง CodeBlueSim.jsx แล้ว) */
export default function EvidenceFile({ items, onClose }) {
  return (
    <div
      className="cbs-evid-overlay"
      role="dialog"
      aria-label="แฟ้มหลักฐาน"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cbs-evid-panel">
        <div className="cbs-evid-title">📁 แฟ้มหลักฐาน ({items.length})</div>
        <div className="cbs-evid-list">
          {items.map((ev) => (
            <div key={ev.id} className="cbs-evid-card">
              <EvidenceThumb docKey={ev.docKey} kind={ev.kind} icon={ev.icon} />
              <div className="cbs-evid-info">
                <div className="cbs-evid-name">{ev.name}</div>
                {ev.desc && <div className="cbs-evid-desc">{ev.desc}</div>}
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="cbs-btn-ghost" onClick={onClose}>
          ปิดแฟ้ม
        </button>
      </div>
    </div>
  );
}
