const stats = [
  {
    value: '70%',
    label: 'ของภาวะหัวใจหยุดเต้น',
    detail: 'เกิดขึ้นที่บ้าน ไม่ใช่ในโรงพยาบาล',
  },
  {
    value: '2–3 เท่า',
    label: 'โอกาสรอดเพิ่มขึ้น',
    detail: 'เมื่อมีคนทำ CPR ก่อนทีมแพทย์มาถึง',
  },
  {
    value: '10%',
    label: 'โอกาสรอดลดลงต่อนาที',
    detail: 'ที่ล่าช้าในการช่วยเหลือ — เวลาคือชีวิต',
  },
];

export default function StatsRow() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">ทำไมทุกคนควรเรียน CPR</h2>
          <p className="mt-2 text-slate-400">เพราะมันอาจเกิดกับคนที่คุณรัก</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-red-500/50 transition-colors"
            >
              <div className="text-4xl sm:text-5xl font-black text-red-400 mb-2">{s.value}</div>
              <div className="font-semibold text-white">{s.label}</div>
              <div className="text-sm text-slate-400 mt-1">{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
