import { supabase, isSupabaseConfigured } from './supabase';
import { alsChapters as staticChapters } from '../data/alsContent';

const CACHE_KEY = 'acls_content_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // storage full or disabled — non-fatal
  }
}

function assembleChapters(chapters, sections, qaItems, images) {
  const imagesBySection = new Map();
  const imagesByQa = new Map();
  for (const img of images) {
    const target = img.parent_type === 'section' ? imagesBySection : imagesByQa;
    const arr = target.get(img.parent_id) ?? [];
    arr.push({ src: img.src, alt: img.alt ?? undefined, caption: img.caption ?? undefined });
    target.set(img.parent_id, arr);
  }

  const qaBySection = new Map();
  for (const qa of qaItems) {
    const arr = qaBySection.get(qa.section_id) ?? [];
    arr.push({
      q: qa.q,
      a: qa.a ?? '',
      images: imagesByQa.get(qa.id),
    });
    qaBySection.set(qa.section_id, arr);
  }

  const sectionsByChapter = new Map();
  for (const s of sections) {
    const arr = sectionsByChapter.get(s.chapter_id) ?? [];
    const section = {};
    if (s.heading) section.heading = s.heading;
    if (s.body) section.body = s.body;
    const imgs = imagesBySection.get(s.id);
    if (imgs?.length) section.images = imgs;
    const qa = qaBySection.get(s.id);
    if (qa?.length) section.qa = qa;
    arr.push(section);
    sectionsByChapter.set(s.chapter_id, arr);
  }

  return chapters.map(c => ({
    id: c.id,
    title: c.title,
    icon: c.icon ?? undefined,
    sections: sectionsByChapter.get(c.id) ?? [],
  }));
}

export async function fetchAlsChaptersFromSupabase() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const [cRes, sRes, qRes, iRes] = await Promise.all([
    supabase.from('acls_chapters').select('id, title, icon, sort_order').order('sort_order'),
    supabase.from('acls_sections').select('id, chapter_id, heading, body, sort_order').order('sort_order'),
    supabase.from('acls_qa_items').select('id, section_id, q, a, sort_order').order('sort_order'),
    supabase.from('acls_images').select('id, parent_type, parent_id, src, alt, caption, sort_order').order('sort_order'),
  ]);

  const err = cRes.error || sRes.error || qRes.error || iRes.error;
  if (err) throw err;

  return assembleChapters(cRes.data, sRes.data, qRes.data, iRes.data);
}

export async function loadAlsChapters() {
  const cached = readCache();
  if (cached) {
    refreshInBackground();
    return { source: 'cache', chapters: cached };
  }
  try {
    const chapters = await fetchAlsChaptersFromSupabase();
    writeCache(chapters);
    return { source: 'supabase', chapters };
  } catch {
    return { source: 'static', chapters: staticChapters };
  }
}

async function refreshInBackground() {
  try {
    const chapters = await fetchAlsChaptersFromSupabase();
    writeCache(chapters);
  } catch {
    // keep cache on failure
  }
}
