const lessons = [
  {
    no: 1,
    title: 'รู้จัก Cardiac Arrest',
    desc: 'สังเกตอาการ — หมดสติ ไม่หายใจ หรือหายใจเฮือก',
    time: '2 นาที',
    icon: '👁️',
  },
  {
    no: 2,
    title: 'เรียก 1669 ขอความช่วยเหลือ',
    desc: 'ให้คนรอบข้างช่วย โทร 1669 และหา AED',
    time: '1 นาที',
    icon: '📞',
  },
  {
    no: 3,
    title: 'ปั๊มหัวใจอย่างถูกวิธี',
    desc: 'ลึก 5–6 ซม. เร็ว 100–120 ครั้ง/นาที — ฝึกตามจังหวะ',
    time: '5 นาที',
    icon: '♥',
  },
  {
    no: 4,
    title: 'ใช้เครื่อง AED',
    desc: 'เปิดเครื่อง ติด pad ฟังคำสั่ง — ฝึกกับเครื่องจำลอง',
    time: '4 นาที',
    icon: '⚡',
  },
  {
    no: 5,
    title: 'ทดสอบ + รับใบรับรอง',
    desc: 'แบบทดสอบ 10 ข้อ ได้ใบรับรองดิจิทัลทันที',
    time: '3 นาที',
    icon: '🏆',
  },
];

export default function Curriculum() {
  return (
    <section id="curriculum" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
            หลักสูตรย่อ 15 นาที
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            เรียน 5 บท เข้าใจได้จริง
          </h2>
          <p className="mt-3 text-slate-600">
            ออกแบบมาให้คนทั่วไป ไม่ต้องมีพื้นฐานแพทย์
          </p>
        </div>

        <div className="space-y-3">
          {lessons.map((l) => (
            <div
              key={l.no}
              className="group flex items-center gap-4 p-5 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/30 rounded-2xl transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform">
                {l.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>บทที่ {l.no}</span>
                  <span>·</span>
                  <span>{l.time}</span>
                </div>
                <div className="font-bold text-slate-900 mt-0.5">{l.title}</div>
                <div className="text-sm text-slate-600 mt-1">{l.desc}</div>
              </div>
              <div className="hidden sm:block text-slate-300 group-hover:text-red-500 transition-colors text-2xl">
                →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
