import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import StudentQuestionForm from './StudentQuestionForm';

// ปุ่มลอย "ถามคำถาม" ระหว่างเรียน — สงสัยตรงไหนกดถามได้ทันทีโดยไม่ต้องออกไปหน้า Q&A
// วางมุมซ้ายล่างเหนือแถบเมนู (มุมขวาเป็นที่ของปุ่ม LINE) ใช้ --tab-bar-h ที่ BottomTabBar วัดให้
// `raised` = หน้าที่มีแถบปุ่มติดขอบล่าง (.above-tab-bar เช่นหน้าเรียนวิดีโอ) ยกปุ่มขึ้นให้พ้น
export default function AskQuestionFab({ raised = false }) {
  const [open, setOpen] = useState(false);
  const tabBar = 'var(--tab-bar-h, calc(68px + env(safe-area-inset-bottom, 0px)))';
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ถามคำถาม"
        className="fixed z-40 inline-flex items-center gap-1.5 px-3.5 py-2.5 text-white font-extrabold text-[13px]"
        style={{
          left: 'calc(env(safe-area-inset-left, 0px) + 14px)',
          bottom: `calc(${tabBar} + ${raised ? 84 : 12}px)`,
          background: 'var(--color-info)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4), 0 2px 4px rgba(15, 26, 46, 0.15)',
        }}
      >
        <MessageCircleQuestion size={17} strokeWidth={2.6} />
        ถามคำถาม
      </button>
      {open && <StudentQuestionForm onClose={() => setOpen(false)} />}
    </>
  );
}
