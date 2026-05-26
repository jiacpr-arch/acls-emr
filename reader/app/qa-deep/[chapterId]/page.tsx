import { notFound } from "next/navigation";
import Link from "next/link";
import { getQaDeepByChapter, getQaDeepChapters } from "@/lib/qa-deep";
import Markdown from "@/components/Markdown";
import Figure from "@/components/Figure";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const chapters = await getQaDeepChapters();
    return chapters.map((c) => ({ chapterId: c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapters = await getQaDeepChapters();
  const title = chapters.find((c) => c.id === chapterId)?.title ?? "Q&A เชิงลึก";
  return { title };
}

export default async function QaDeepChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const [{ items }, chapters] = await Promise.all([
    getQaDeepByChapter(chapterId),
    getQaDeepChapters(),
  ]);
  if (!items.length) notFound();

  const chapterTitle = chapters.find((c) => c.id === chapterId)?.title;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          หน้าแรก
        </Link>
        {" / "}
        <Link href="/qa-deep" className="hover:text-foreground">
          Q&A เชิงลึก
        </Link>
        {chapterTitle && (
          <>
            {" / "}
            <span className="text-foreground">{chapterTitle}</span>
          </>
        )}
      </nav>

      <div className="space-y-12">
        {items.map((it) => (
          <article key={it.id} className="scroll-mt-20">
            <h2 className="mb-4 text-2xl font-semibold">{it.question}</h2>
            {it.cover && (
              <Figure src={it.cover.src} alt={it.cover.alt} caption={it.cover.caption} />
            )}
            <Markdown>{it.answer}</Markdown>
            {it.infographics.map((img, i) => (
              <Figure key={i} src={img.src} alt={img.alt} caption={img.caption} />
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
