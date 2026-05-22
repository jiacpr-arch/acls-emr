import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-10 right-10 w-72 h-72 bg-red-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              สำหรับประชาชนทั่วไป — ฟรี 100%
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
              เรียน <span className="text-red-600">CPR + AED</span><br />
              ฟรี ใน <span className="underline decoration-red-400 decoration-4 underline-offset-4">15 นาที</span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed">
              ทักษะที่ช่วยชีวิตคนที่คุณรักได้<br className="hidden sm:block" />
              เรียนบนมือถือ ไม่ต้องสมัครสมาชิก รับใบรับรองทันที
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/learn"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-base font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
              >
                เริ่มเรียนเลย
                <span aria-hidden>→</span>
              </Link>
              <a
                href="#curriculum"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold px-6 py-3.5 rounded-full border border-slate-200 transition-colors"
              >
                ดูเนื้อหา 5 บท
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-red-200 border-2 border-white" />
                <div className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white" />
                <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white" />
              </div>
              <span>มีคนเรียนแล้วทั่วประเทศ</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-[2.5rem] rotate-3 shadow-2xl shadow-red-600/30" />
              <div className="absolute inset-0 bg-white rounded-[2.5rem] -rotate-1 border border-slate-200 shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-9xl text-red-600 animate-pulse-heart">♥</div>
                  <div className="mt-4 font-bold text-slate-700 text-lg">100–120 ครั้ง/นาที</div>
                  <div className="text-sm text-slate-500 mt-1">จังหวะปั๊มหัวใจที่ถูกต้อง</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
