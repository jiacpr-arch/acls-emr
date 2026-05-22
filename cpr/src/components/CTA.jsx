import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-red-600 to-red-800 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-6xl mb-6 animate-pulse-heart">♥</div>
        <h2 className="text-3xl sm:text-4xl font-black leading-tight">
          พร้อมเป็นคนที่ช่วยชีวิตได้แล้วหรือยัง?
        </h2>
        <p className="mt-4 text-lg text-red-100">
          ใช้เวลาแค่ 15 นาที ที่อาจช่วยชีวิตคนที่คุณรักได้
        </p>
        <Link
          to="/learn"
          className="mt-8 inline-flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-red-50 text-lg font-bold px-8 py-4 rounded-full shadow-xl transition-colors"
        >
          เริ่มเรียนเลย — ฟรี
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-4 text-sm text-red-200">ไม่ต้องสมัคร · ไม่มีบัตรเครดิต · 15 นาที</p>
      </div>
    </section>
  );
}
