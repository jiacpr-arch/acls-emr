import { Link } from 'react-router-dom';

export default function Learn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-3xl font-bold text-slate-900">กำลังเตรียมเนื้อหา</h1>
        <p className="mt-3 text-slate-600">
          หลักสูตรเรียน CPR + AED 5 บท กำลังจัดทำอยู่<br />
          จะเปิดให้เรียนเร็วๆ นี้
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          ← กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
