import { useState } from 'react';

const faqs = [
  {
    q: 'ต้องมีพื้นฐานทางการแพทย์ไหม?',
    a: 'ไม่ต้องเลย หลักสูตรนี้ออกแบบมาเพื่อประชาชนทั่วไป ใช้ภาษาง่ายและมีภาพประกอบทุกขั้นตอน',
  },
  {
    q: 'ใบรับรองมีคุณค่าจริงไหม?',
    a: 'เป็นใบรับรองการเรียนรู้ออนไลน์ ใช้แสดงว่าผ่านหลักสูตร — ไม่ใช่ใบรับรองเชิงวิชาชีพ หากต้องการใบรับรองทางการ ต้องอบรมกับสภากาชาดหรือสถาบันที่รับรอง',
  },
  {
    q: 'ถ้าฉันทำ CPR ผิด จะรับผิดทางกฎหมายไหม?',
    a: 'ในประเทศไทยมีกฎหมาย Good Samaritan ปกป้องผู้ช่วยเหลือโดยสุจริต — การพยายามช่วยดีกว่าไม่ทำอะไรเลย เพราะถ้าไม่ทำอะไรผู้ป่วยจะเสียชีวิตแน่นอน',
  },
  {
    q: 'เป่าปากด้วยหรือเปล่า?',
    a: 'สำหรับประชาชนทั่วไป ใช้ Hands-only CPR ก็เพียงพอแล้ว — กดหน้าอกอย่างเดียวมีประสิทธิภาพและปลอดภัยกว่าสำหรับผู้ที่ไม่ได้ฝึกฝน',
  },
  {
    q: 'ใช้ AED แล้วช็อตคนผิดได้ไหม?',
    a: 'ไม่ได้ — เครื่อง AED จะวิเคราะห์จังหวะหัวใจอัตโนมัติ และจะปล่อยไฟฟ้าเฉพาะเมื่อจำเป็นเท่านั้น ปลอดภัยที่จะใช้',
  },
  {
    q: 'ใช้ได้กับเด็กไหม?',
    a: 'หลักสูตรนี้เน้นผู้ใหญ่และเด็กโต สำหรับเด็กเล็กและทารก เทคนิคจะต่างเล็กน้อย แนะนำให้เรียนเพิ่มเติมจากสถาบันทางการ',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">คำถามที่พบบ่อย</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">{f.q}</span>
                <span className={`text-2xl text-slate-400 transition-transform flex-shrink-0 ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
