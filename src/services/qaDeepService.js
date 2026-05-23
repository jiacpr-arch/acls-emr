import { supabase, isSupabaseConfigured } from './supabase';
import { qaDeepPage as staticPage, qaDeepItems as staticItems } from '../data/qaDeepContent';

const CACHE_KEY = 'acls_qa_deep_cache_v2';
const CHAPTERS_CACHE_KEY = 'acls_qa_deep_chapters_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // non-fatal
  }
}

export function invalidateQaDeepCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CHAPTERS_CACHE_KEY);
  } catch { /* ignore */ }
}

function assemble(pageRow, items, images) {
  const imgByItem = new Map();
  for (const img of images) {
    const bucket = imgByItem.get(img.item_id) ?? { cover: null, infographics: [] };
    const entry = {
      src: img.src,
      alt: img.alt ?? undefined,
      caption: img.caption ?? undefined,
    };
    if (img.image_type === 'cover') {
      if (!bucket.cover) bucket.cover = entry;
    } else {
      bucket.infographics.push(entry);
    }
    imgByItem.set(img.item_id, bucket);
  }

  return {
    page: {
      title: pageRow?.title || staticPage.title,
      intro: pageRow?.intro ?? staticPage.intro,
      coverImage: pageRow?.cover_image_url || null,
    },
    items: items.map(it => {
      const bucket = imgByItem.get(it.id) ?? { cover: null, infographics: [] };
      return {
        id: it.id,
        chapterId: it.chapter_id || null,
        question: it.question,
        answer: it.answer ?? '',
        cover: bucket.cover,
        infographics: bucket.infographics,
      };
    }),
  };
}

export async function fetchQaDeepFromSupabase() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const [pageRes, itemRes] = await Promise.all([
    supabase.from('acls_qa_deep_page').select('*').limit(1).maybeSingle(),
    supabase
      .from('acls_qa_deep_items')
      .select('id, chapter_id, question, answer, sort_order')
      .order('sort_order'),
  ]);
  if (pageRes.error) throw pageRes.error;
  if (itemRes.error) throw itemRes.error;

  const items = itemRes.data ?? [];
  let images = [];
  if (items.length) {
    const ids = items.map(i => i.id);
    const imgRes = await supabase
      .from('acls_qa_deep_images')
      .select('id, item_id, image_type, src, alt, caption, sort_order, created_at')
      .in('item_id', ids)
      .order('sort_order');
    if (imgRes.error) throw imgRes.error;
    images = imgRes.data ?? [];
  }

  return assemble(pageRes.data, items, images);
}

export async function fetchQaDeepChapters() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('acls_chapters')
    .select('id, title, icon, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function loadQaDeep() {
  const cached = readCache(CACHE_KEY);
  if (cached) {
    refreshInBackground();
    return { source: 'cache', ...cached };
  }
  try {
    const data = await fetchQaDeepFromSupabase();
    writeCache(CACHE_KEY, data);
    return { source: 'supabase', ...data };
  } catch {
    return { source: 'static', page: staticPage, items: staticItems };
  }
}

export async function loadQaDeepChapters() {
  const cached = readCache(CHAPTERS_CACHE_KEY);
  if (cached) {
    refreshChaptersInBackground();
    return cached;
  }
  try {
    const data = await fetchQaDeepChapters();
    writeCache(CHAPTERS_CACHE_KEY, data);
    return data;
  } catch {
    return [];
  }
}

async function refreshInBackground() {
  try {
    const data = await fetchQaDeepFromSupabase();
    writeCache(CACHE_KEY, data);
  } catch { /* keep cache */ }
}

async function refreshChaptersInBackground() {
  try {
    const data = await fetchQaDeepChapters();
    writeCache(CHAPTERS_CACHE_KEY, data);
  } catch { /* keep cache */ }
}
