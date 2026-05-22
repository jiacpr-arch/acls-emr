import { supabase } from './supabase';

const IMAGES_BUCKET = 'acls-images';
const CONTENT_CACHE_KEY = 'acls_content_cache_v1';

function invalidateContentCache() {
  try { localStorage.removeItem(CONTENT_CACHE_KEY); } catch { /* ignore */ }
}

export async function listChaptersWithCounts() {
  const { data, error } = await supabase
    .from('acls_chapters')
    .select('id, title, icon, sort_order, updated_at, acls_sections(count)')
    .order('sort_order');
  if (error) throw error;
  return data.map(c => ({
    id: c.id,
    title: c.title,
    icon: c.icon,
    sort_order: c.sort_order,
    updated_at: c.updated_at,
    sectionCount: c.acls_sections?.[0]?.count ?? 0,
  }));
}

export async function getChapterFull(chapterId) {
  const [cRes, sRes] = await Promise.all([
    supabase.from('acls_chapters').select('*').eq('id', chapterId).single(),
    supabase.from('acls_sections').select('*').eq('chapter_id', chapterId).order('sort_order'),
  ]);
  if (cRes.error) throw cRes.error;
  if (sRes.error) throw sRes.error;

  const sectionIds = sRes.data.map(s => s.id);
  let qaItems = [];
  let images = [];
  if (sectionIds.length) {
    const qRes = await supabase.from('acls_qa_items').select('*').in('section_id', sectionIds).order('sort_order');
    if (qRes.error) throw qRes.error;
    qaItems = qRes.data;
    const qaIds = qaItems.map(q => q.id);
    const parentIds = [...sectionIds, ...qaIds];
    if (parentIds.length) {
      const iRes = await supabase.from('acls_images').select('*').in('parent_id', parentIds).order('sort_order');
      if (iRes.error) throw iRes.error;
      images = iRes.data;
    }
  }

  const qaBySection = new Map();
  for (const q of qaItems) {
    const arr = qaBySection.get(q.section_id) ?? [];
    arr.push({ ...q, images: images.filter(i => i.parent_type === 'qa' && i.parent_id === q.id) });
    qaBySection.set(q.section_id, arr);
  }

  return {
    ...cRes.data,
    sections: sRes.data.map(s => ({
      ...s,
      images: images.filter(i => i.parent_type === 'section' && i.parent_id === s.id),
      qa: qaBySection.get(s.id) ?? [],
    })),
  };
}

export async function updateChapter(id, patch) {
  const { error } = await supabase.from('acls_chapters').update(patch).eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function createSection(chapterId) {
  const { data: existing, error: countErr } = await supabase
    .from('acls_sections')
    .select('sort_order')
    .eq('chapter_id', chapterId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('acls_sections')
    .insert({ chapter_id: chapterId, sort_order: nextOrder, heading: '', body: '' })
    .select()
    .single();
  if (error) throw error;
  invalidateContentCache();
  return data;
}

export async function updateSection(id, patch) {
  const { error } = await supabase.from('acls_sections').update(patch).eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function deleteSection(id) {
  const { error } = await supabase.from('acls_sections').delete().eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function moveSection(sectionId, direction, sections) {
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx < 0) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sections.length) return;
  const a = sections[idx];
  const b = sections[swapIdx];
  // Two-step swap using a temporary value to satisfy potential unique constraints
  const { error: e1 } = await supabase.from('acls_sections').update({ sort_order: -1 - idx }).eq('id', a.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('acls_sections').update({ sort_order: a.sort_order }).eq('id', b.id);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from('acls_sections').update({ sort_order: b.sort_order }).eq('id', a.id);
  if (e3) throw e3;
  invalidateContentCache();
}

export async function createQa(sectionId) {
  const { data: existing, error: countErr } = await supabase
    .from('acls_qa_items')
    .select('sort_order')
    .eq('section_id', sectionId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('acls_qa_items')
    .insert({ section_id: sectionId, sort_order: nextOrder, q: '', a: '' })
    .select()
    .single();
  if (error) throw error;
  invalidateContentCache();
  return data;
}

export async function updateQa(id, patch) {
  const { error } = await supabase.from('acls_qa_items').update(patch).eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function deleteQa(id) {
  const { error } = await supabase.from('acls_qa_items').delete().eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function uploadImage(file, parentType, parentId) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${parentType}/${parentId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;

  const { data: publicUrlData } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  const { data: existing, error: countErr } = await supabase
    .from('acls_images')
    .select('sort_order')
    .eq('parent_type', parentType)
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error: insErr } = await supabase
    .from('acls_images')
    .insert({
      parent_type: parentType,
      parent_id: parentId,
      src: publicUrl,
      alt: '',
      caption: '',
      sort_order: nextOrder,
    })
    .select()
    .single();
  if (insErr) throw insErr;
  invalidateContentCache();
  return data;
}

export async function updateImage(id, patch) {
  const { error } = await supabase.from('acls_images').update(patch).eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}

export async function deleteImage(id, src) {
  if (src && src.includes(`/${IMAGES_BUCKET}/`)) {
    const path = src.split(`/${IMAGES_BUCKET}/`)[1];
    if (path) {
      await supabase.storage.from(IMAGES_BUCKET).remove([path]);
    }
  }
  const { error } = await supabase.from('acls_images').delete().eq('id', id);
  if (error) throw error;
  invalidateContentCache();
}
