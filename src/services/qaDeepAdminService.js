import { supabase } from './supabase';
import { invalidateQaDeepCache } from './qaDeepService';

const IMAGES_BUCKET = 'acls-images';
const PAGE_COVER_DIR = 'qa-deep-page';
const ITEM_DIR = 'qa-deep';

// ────── Page settings (single row) ──────

export async function getPageSettings() {
  const { data, error } = await supabase
    .from('acls_qa_deep_page')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insErr } = await supabase
    .from('acls_qa_deep_page')
    .insert({ title: 'Q&A ACLS เชิงลึก', intro: '' })
    .select()
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function updatePageSettings(id, patch) {
  const { error } = await supabase
    .from('acls_qa_deep_page')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  invalidateQaDeepCache();
}

export async function uploadPageCover(file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${PAGE_COVER_DIR}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ────── Q&A items ──────

export async function listQaItemsFull() {
  const { data: items, error } = await supabase
    .from('acls_qa_deep_items')
    .select('id, question, answer, sort_order, updated_at')
    .order('sort_order');
  if (error) throw error;
  if (!items.length) return [];

  const ids = items.map(i => i.id);
  const { data: images, error: imgErr } = await supabase
    .from('acls_qa_deep_images')
    .select('*')
    .in('item_id', ids)
    .order('sort_order');
  if (imgErr) throw imgErr;

  const byItem = new Map();
  for (const img of images) {
    const arr = byItem.get(img.item_id) ?? [];
    arr.push(img);
    byItem.set(img.item_id, arr);
  }
  return items.map(it => ({
    ...it,
    images: byItem.get(it.id) ?? [],
  }));
}

export async function createQaItem() {
  const { data: existing, error: countErr } = await supabase
    .from('acls_qa_deep_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('acls_qa_deep_items')
    .insert({ sort_order: nextOrder, question: '', answer: '' })
    .select()
    .single();
  if (error) throw error;
  invalidateQaDeepCache();
  return data;
}

export async function updateQaItem(id, patch) {
  const { error } = await supabase
    .from('acls_qa_deep_items')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  invalidateQaDeepCache();
}

export async function deleteQaItem(id) {
  const { data: imgs } = await supabase
    .from('acls_qa_deep_images')
    .select('src')
    .eq('item_id', id);
  if (imgs?.length) {
    const paths = imgs
      .map(i => extractStoragePath(i.src))
      .filter(Boolean);
    if (paths.length) {
      await supabase.storage.from(IMAGES_BUCKET).remove(paths);
    }
  }
  const { error } = await supabase.from('acls_qa_deep_items').delete().eq('id', id);
  if (error) throw error;
  invalidateQaDeepCache();
}

export async function moveQaItem(itemId, direction, items) {
  const idx = items.findIndex(s => s.id === itemId);
  if (idx < 0) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;
  const a = items[idx];
  const b = items[swapIdx];
  const { error: e1 } = await supabase.from('acls_qa_deep_items').update({ sort_order: -1 - idx }).eq('id', a.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('acls_qa_deep_items').update({ sort_order: a.sort_order }).eq('id', b.id);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from('acls_qa_deep_items').update({ sort_order: b.sort_order }).eq('id', a.id);
  if (e3) throw e3;
  invalidateQaDeepCache();
}

// ────── Images per Q&A item ──────

export async function uploadItemImage(file, itemId, imageType /* 'cover' | 'infographic' */) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${ITEM_DIR}/${itemId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;

  const { data: publicUrlData } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  const { data: existing, error: countErr } = await supabase
    .from('acls_qa_deep_images')
    .select('sort_order')
    .eq('item_id', itemId)
    .eq('image_type', imageType)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error: insErr } = await supabase
    .from('acls_qa_deep_images')
    .insert({
      item_id: itemId,
      image_type: imageType,
      src: publicUrl,
      alt: '',
      caption: '',
      sort_order: nextOrder,
    })
    .select()
    .single();
  if (insErr) throw insErr;
  invalidateQaDeepCache();
  return data;
}

export async function updateItemImage(id, patch) {
  const { error } = await supabase.from('acls_qa_deep_images').update(patch).eq('id', id);
  if (error) throw error;
  invalidateQaDeepCache();
}

export async function deleteItemImage(id, src) {
  const path = extractStoragePath(src);
  if (path) {
    await supabase.storage.from(IMAGES_BUCKET).remove([path]);
  }
  const { error } = await supabase.from('acls_qa_deep_images').delete().eq('id', id);
  if (error) throw error;
  invalidateQaDeepCache();
}

function extractStoragePath(src) {
  if (!src) return null;
  const marker = `/${IMAGES_BUCKET}/`;
  const idx = src.indexOf(marker);
  if (idx < 0) return null;
  return src.slice(idx + marker.length);
}
