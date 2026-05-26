import { supabase } from "./supabase";
import { staticChapters } from "./static-content";
import type {
  AclsChapter,
  AclsImage,
  AclsQA,
  AclsSection,
} from "./content-types";

export type { AclsChapter, AclsSection, AclsQA, AclsImage };

interface ChapterRow { id: string; title: string; icon: string | null; sort_order: number | null }
interface SectionRow { id: string; chapter_id: string; heading: string | null; body: string | null; sort_order: number | null }
interface QaRow { id: string; section_id: string; q: string; a: string | null; sort_order: number | null }
interface ImageRow { id: string; parent_type: string; parent_id: string; src: string; alt: string | null; caption: string | null; sort_order: number | null }

// Ported from acls-emr/src/services/alsContentService.js (assembleChapters).
function assembleChapters(
  chapters: ChapterRow[],
  sections: SectionRow[],
  qaItems: QaRow[],
  images: ImageRow[]
): AclsChapter[] {
  const imagesBySection = new Map<string, AclsImage[]>();
  const imagesByQa = new Map<string, AclsImage[]>();
  for (const img of images) {
    const target = img.parent_type === "section" ? imagesBySection : imagesByQa;
    const arr = target.get(img.parent_id) ?? [];
    arr.push({ src: img.src, alt: img.alt ?? undefined, caption: img.caption ?? undefined });
    target.set(img.parent_id, arr);
  }

  const qaBySection = new Map<string, AclsQA[]>();
  for (const qa of qaItems) {
    const arr = qaBySection.get(qa.section_id) ?? [];
    arr.push({ q: qa.q, a: qa.a ?? "", images: imagesByQa.get(qa.id) });
    qaBySection.set(qa.section_id, arr);
  }

  const sectionsByChapter = new Map<string, AclsSection[]>();
  for (const s of sections) {
    const arr = sectionsByChapter.get(s.chapter_id) ?? [];
    const section: AclsSection = {};
    if (s.heading) section.heading = s.heading;
    if (s.body) section.body = s.body;
    const imgs = imagesBySection.get(s.id);
    if (imgs?.length) section.images = imgs;
    const qa = qaBySection.get(s.id);
    if (qa?.length) section.qa = qa;
    arr.push(section);
    sectionsByChapter.set(s.chapter_id, arr);
  }

  return chapters.map((c) => ({
    id: c.id,
    title: c.title,
    icon: c.icon ?? undefined,
    sections: sectionsByChapter.get(c.id) ?? [],
  }));
}

async function fetchChaptersFromSupabase(): Promise<AclsChapter[]> {
  const [cRes, sRes, qRes, iRes] = await Promise.all([
    supabase.from("acls_chapters").select("id, title, icon, sort_order").order("sort_order"),
    supabase.from("acls_sections").select("id, chapter_id, heading, body, sort_order").order("sort_order"),
    supabase.from("acls_qa_items").select("id, section_id, q, a, sort_order").order("sort_order"),
    supabase.from("acls_images").select("id, parent_type, parent_id, src, alt, caption, sort_order").order("sort_order"),
  ]);

  const err = cRes.error || sRes.error || qRes.error || iRes.error;
  if (err) throw err;

  return assembleChapters(
    (cRes.data ?? []) as ChapterRow[],
    (sRes.data ?? []) as SectionRow[],
    (qRes.data ?? []) as QaRow[],
    (iRes.data ?? []) as ImageRow[]
  );
}

// Live DB content if reachable; static fallback otherwise (mirrors the
// original app's loadAlsChapters behavior). Never throws.
export async function getChapters(): Promise<AclsChapter[]> {
  try {
    const chapters = await fetchChaptersFromSupabase();
    return chapters.length ? chapters : staticChapters;
  } catch {
    return staticChapters;
  }
}

export async function getChapter(id: string): Promise<AclsChapter | null> {
  const chapters = await getChapters();
  return chapters.find((c) => c.id === id) ?? null;
}
