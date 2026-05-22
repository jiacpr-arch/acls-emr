import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">
            ♥
          </div>
          <div className="font-bold text-slate-900">
            <span className="text-red-600">CPR</span>
            <span className="text-slate-400 font-normal mx-1">·</span>
            <span>morroo</span>
          </div>
        </Link>
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm transition-colors"
        >
          เริ่มเรียน
          <span aria-hidden>→</span>
        </Link>
      </div>
    </header>
  );
}
