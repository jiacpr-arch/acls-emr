import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapter, getChapters } from "@/lib/acls-content";
import Markdown from "@/components/Markdown";
import Figure from "@/components/Figure";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const chapters = await getChapters();
    return chapters.map((c) => ({ id: c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await getChapter(id);
  return { title: chapter?.title ?? "ไม่พบบทเรียน" };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await getChapter(id);
  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          หน้าแรก
        </Link>
        {" / "}
        <span className="text-foreground">{chapter.title}</span>
      </nav>

      <header className="mb-8 flex items-center gap-3">
        <span className="text-4xl">{chapter.icon ?? "📘"}</span>
        <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
          {chapter.title}
        </h1>
      </header>

      <div className="space-y-10">
        {chapter.sections.map((s, i) => (
          <section key={i} className="scroll-mt-20">
            {s.heading && (
              <h2 className="mb-3 text-2xl font-semibold">{s.heading}</h2>
            )}
            {s.body && <Markdown>{s.body}</Markdown>}
            {s.images?.map((img, j) => (
              <Figure key={j} src={img.src} alt={img.alt} caption={img.caption} />
            ))}
            {s.qa && s.qa.length > 0 && (
              <div className="mt-4 space-y-3">
                {s.qa.map((qa, k) => (
                  <details key={k} className="group rounded-lg border border-border p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                      {qa.q}
                      <span className="text-muted-foreground transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3">
                      {qa.images?.map((img, m) => (
                        <Figure
                          key={m}
                          src={img.src}
                          alt={img.alt}
                          caption={img.caption}
                        />
                      ))}
                      <Markdown>{qa.a}</Markdown>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
