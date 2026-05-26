import Link from "next/link";
import { getQaDeep, getQaDeepChapters } from "@/lib/qa-deep";
import Markdown from "@/components/Markdown";
import Figure from "@/components/Figure";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const revalidate = 600;

export default async function QaDeepIndex() {
  const [data, chapters] = await Promise.all([getQaDeep(), getQaDeepChapters()]);

  const countByChapter = new Map<string, number>();
  for (const it of data.items) {
    if (it.chapterId) {
      countByChapter.set(it.chapterId, (countByChapter.get(it.chapterId) ?? 0) + 1);
    }
  }
  const groupedChapters = chapters.filter((c) => countByChapter.has(c.id));
  const ungrouped = data.items.filter((it) => !it.chapterId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{data.page.title}</h1>
        {data.page.intro && (
          <p className="mt-3 text-lg text-muted-foreground">{data.page.intro}</p>
        )}
      </header>

      {groupedChapters.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groupedChapters.map((c) => (
            <Link key={c.id} href={`/qa-deep/${c.id}`} className="block">
              <Card className="h-full transition-shadow hover:shadow-md hover:ring-brand/30">
                <CardHeader>
                  <span className="text-2xl">{c.icon ?? "❓"}</span>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>
                    {countByChapter.get(c.id)} คำถาม
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Items without a chapter (or no chapters available) render inline */}
      {ungrouped.length > 0 && (
        <div className="mt-10 space-y-12">
          {ungrouped.map((it) => (
            <article key={it.id} className="scroll-mt-20">
              <h2 className="mb-4 text-2xl font-semibold">{it.question}</h2>
              {it.cover && (
                <Figure
                  src={it.cover.src}
                  alt={it.cover.alt}
                  caption={it.cover.caption}
                />
              )}
              <Markdown>{it.answer}</Markdown>
              {it.infographics.map((img, i) => (
                <Figure key={i} src={img.src} alt={img.alt} caption={img.caption} />
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
