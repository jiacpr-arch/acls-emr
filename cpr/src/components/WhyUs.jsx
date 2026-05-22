const features = [
  {
    icon: '💯',
    title: 'ฟรี 100%',
    desc: 'ไม่มีค่าใช้จ่ายแอบแฝง ไม่ต้องบัตรเครดิต',
  },
  {
    icon: '🚫',
    title: 'ไม่ต้องสมัครสมาชิก',
    desc: 'เปิดเรียนได้ทันที ไม่ต้องกรอกอีเมล',
  },
  {
    icon: '📱',
    title: 'เรียนบนมือถือ',
    desc: 'ออกแบบมาสำหรับมือถือโดยเฉพาะ ใช้งานง่าย',
  },
  {
    icon: '🎯',
    title: 'ฝึกแบบ interactive',
    desc: 'มี metronome จังหวะปั๊ม + เครื่อง AED จำลอง',
  },
  {
    icon: '🏆',
    title: 'ใบรับรองดิจิทัล',
    desc: 'จบหลักสูตรได้ใบรับรอง แชร์ได้ทันที',
  },
  {
    icon: '🇹🇭',
    title: 'อ้างอิงมาตรฐานสากล',
    desc: 'เนื้อหาตามแนวทาง AHA และสภากาชาด',
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">ทำไมต้องเรียนที่นี่</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="font-bold text-slate-900">{f.title}</div>
              <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
