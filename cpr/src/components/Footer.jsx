export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="text-red-500 text-xl">♥</span>
              <span>CPR · morroo</span>
            </div>
            <p className="text-sm mt-2 max-w-md">
              เรียน CPR และ AED ฟรี สำหรับประชาชนทั่วไป — เพราะทุกชีวิตมีค่า
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 text-sm">
            <a href="https://morroo.com" className="hover:text-white transition-colors">
              สำหรับบุคลากรการแพทย์ (ACLS) →
            </a>
            <div className="text-slate-500 text-xs">
              © {new Date().getFullYear()} morroo · เพื่อการศึกษาเท่านั้น
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">หมายเหตุ:</strong> เนื้อหานี้เพื่อการศึกษาเท่านั้น
          ไม่สามารถใช้แทนการอบรมเชิงปฏิบัติการกับผู้สอนที่ได้รับการรับรอง
          ในสถานการณ์ฉุกเฉินจริง กรุณาโทร 1669 ทันที
        </div>
      </div>
    </footer>
  );
}
