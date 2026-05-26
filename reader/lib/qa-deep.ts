import { supabase } from "./supabase";
import { staticQaDeep } from "./static-content";
import type { QaDeepData, QaDeepItem, QaDeepImage } from "./content-types";

export type { QaDeepData, QaDeepItem, QaDeepImage };

export interface QaDeepChapter { id: string; title: string; icon: string | null }

interface PageRow { title: string | null; intro: string | null; cover_image_url: string | null }
interface ItemRow { id: string; chapter_id: string | null; question: string; answer: string | null; sort_order: number | null }
interface ImageRow { id: string; item_id: string; image_type: string | null; src: string; alt: string | null; caption: string | null; sort_order: number | null }

// Ported from acls-emr/src/services/qaDeepService.js (assemble).
function assemble(pageRow: PageRow | null, items: ItemRow[], images: ImageRow[]): QaDeepData {
  const imgByItem = new Map<string, { cover: QaDeepImage | null; infographics: QaDeepImage[] }>();
  for (const img of images) {
    const bucket = imgByItem.get(img.item_id) ?? { cover: null, infographics: [] };
    const entry: QaDeepImage = {
      src: img.src,
      alt: img.alt ?? undefined,
      caption: img.caption ?? undefined,
    };
    if (img.image_type === "cover") {
      if (!bucket.cover) bucket.cover = entry;
    } else {
      bucket.infographics.push(entry);
    }
    imgByItem.set(img.item_id, bucket);
  }

  return {
    page: {
      title: pageRow?.title || staticQaDeep.page.title,
      intro: pageRow?.intro ?? staticQaDeep.page.intro,
      coverImage: pageRow?.cover_image_url || null,
    },
    items: items.map((it) => {
      const bucket = imgByItem.get(it.id) ?? { cover: null, infographics: [] };
      return {
        id: it.id,
        chapterId: it.chapter_id || null,
        question: it.question,
        answer: it.answer ?? "",
        cover: bucket.cover,
        infographics: bucket.infographics,
      };
    }),
  };
}

async function fetchQaDeepFromSupabase(): Promise<QaDeepData> {
  const [pageRes, itemRes] = await Promise.all([
    supabase.from("acls_qa_deep_page").select("*").limit(1).maybeSingle(),
    supabase
      .from("acls_qa_deep_items")
      .select("id, chapter_id, question, answer, sort_order")
      .order("sort_order"),
  ]);
  if (pageRes.error) throw pageRes.error;
  if (itemRes.error) throw itemRes.error;

  const items = (itemRes.data ?? []) as ItemRow[];
  let images: ImageRow[] = [];
  if (items.length) {
    const ids = items.map((i) => i.id);
    const imgRes = await supabase
      .from("acls_qa_deep_images")
      .select("id, item_id, image_type, src, alt, caption, sort_order, created_at")
      .in("item_id", ids)
      .order("sort_order");
    if (imgRes.error) throw imgRes.error;
    images = (imgRes.data ?? []) as ImageRow[];
  }

  return assemble(pageRes.data as PageRow | null, items, images);
}

export async function getQaDeep(): Promise<QaDeepData> {
  try {
    const data = await fetchQaDeepFromSupabase();
    return data.items.length ? data : staticQaDeep;
  } catch {
    return staticQaDeep;
  }
}

export async function getQaDeepChapters(): Promise<QaDeepChapter[]> {
  try {
    const { data, error } = await supabase
      .from("acls_chapters")
      .select("id, title, icon, sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as QaDeepChapter[];
  } catch {
    return [];
  }
}

export async function getQaDeepByChapter(chapterId: string): Promise<QaDeepData> {
  const data = await getQaDeep();
  return { page: data.page, items: data.items.filter((i) => i.chapterId === chapterId) };
}
