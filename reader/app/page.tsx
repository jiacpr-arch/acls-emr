import Link from "next/link";
import { getChapters } from "@/lib/acls-content";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const revalidate = 600;

export default async function HomePage() {
  const chapters = await getChapters();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">คู่มือทบทวน ACLS</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          เลือกบทเรียนเพื่อเริ่มอ่าน
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <Link key={c.id} href={`/chapter/${c.id}`} className="block">
            <Card className="h-full transition-shadow hover:shadow-md hover:ring-brand/30">
              <CardHeader>
                <span className="text-3xl">{c.icon ?? "📘"}</span>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription>{c.sections.length} หัวข้อ</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-brand/20 bg-brand/10 p-6 text-center">
        <h2 className="text-lg font-semibold">Q&A ACLS เชิงลึก</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          คำถาม-คำตอบเชิงลึกประกอบ infographic สำหรับทบทวน
        </p>
        <Link
          href="/qa-deep"
          className="mt-4 inline-block rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          ดูคำถาม-คำตอบเชิงลึก
        </Link>
      </div>
    </div>
  );
}
