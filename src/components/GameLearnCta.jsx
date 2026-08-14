import { useNavigate } from 'react-router-dom';
import { jiacprCourse } from '../data/jiacprCourse';
import { courseMeta } from '../config/courseMode';
import { track } from '../services/analytics';

// ปุ่มทองชวน "เรียนต่อฟรี" ท้ายเกม — แนวเดียวกับจอ debrief ของ /sim:
// soft CTA พาเข้า /pre-course แล้วปล่อยให้แบนเนอร์คอร์สในหน้าบทเรียนปิดการขายต่อ
// เหลือลิงก์ LINE บรรทัดเล็กไว้รับคนที่พร้อมสมัครทันที
// source: จุดที่วาง (ใส่ใน tracking เพื่อวัดว่า lead มาจากเกมไหน)
// won: ผลเกมถ้ามี — ปรับข้อความชวน (ไม่ส่ง = ข้อความกลาง)
export default function GameLearnCta({ source, won }) {
  const navigate = useNavigate();
  return (
    <div className="game-learn-cta">
      <div className="text-overline text-text-muted">NEXT LEVEL — ต่อยอดจากเกมสู่ของจริง</div>
      <p className="text-caption text-text-secondary" style={{ margin: '4px 0 10px' }}>
        {won === false
          ? 'ในเกมพลาดได้ แต่ชีวิตจริงพลาดไม่ได้ — เก็บบทเรียนให้แน่น แล้วกลับมาแก้มือ'
          : 'เก็บความรู้ให้แน่นด้วยบทเรียนฟรี แล้วไปให้สุดกับการฝึกมือจริง'}
      </p>
      <button
        type="button"
        className="game-learn-btn"
        onClick={() => {
          track('learn_cta_click', {
            metaCustom: 'GameLearnCTA',
            props: { source, ...(won !== undefined && { won }) },
          });
          navigate('/pre-course');
        }}
      >
        📖 เรียน {courseMeta.shortName} ต่อฟรี — จบแล้วสอบรับใบเซอร์
      </button>
      <div className="text-caption text-text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
        สนใจคอร์สอบรมกับอาจารย์ตัวจริง?{' '}
        <a
          href={jiacprCourse.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success font-bold"
          onClick={() => track('contact_click', {
            meta: 'Contact',
            props: { channel: 'line', source, value: 2500, currency: 'THB' },
          })}
        >
          แชท LINE
        </a>
      </div>
    </div>
  );
}
