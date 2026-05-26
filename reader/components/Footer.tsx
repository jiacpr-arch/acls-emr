import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-brand-dark text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold">ACLS Reader</p>
            <p className="mt-1 max-w-md text-sm text-white/70">
              คู่มือทบทวนเนื้อหา ACLS และ Q&A เชิงลึก สำหรับบุคลากรทางการแพทย์
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-white/80 hover:text-white">
              เนื้อหา ACLS
            </Link>
            <Link href="/qa-deep" className="text-white/80 hover:text-white">
              Q&A เชิงลึก
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-white/50">
          เนื้อหาเพื่อการศึกษาและทบทวนเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์
        </p>
      </div>
    </footer>
  );
}
