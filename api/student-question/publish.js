import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 30 };

/**
 * Publishes a draft student question into the live Q&A:
 *   1. Insert a row in acls_qa_deep_items (next sort_order)
 *   2. Insert a cover image row in acls_qa_deep_images if we have an image
 *   3. Update the student-question row → status='published', link to item id
 *
 * Body: { id, question?, answer?, chapterId? }
 * Allows the admin to override the AI-generated fields right before publishing.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'id required' });

  const supabase = getSupabaseAdmin();

  const { data: row, error: loadErr } = await supabase
    .from('acls_student_questions')
    .select('id, question, deepseek_answer, suggested_chapter_id, generated_image_url, status, published_item_id')
    .eq('id', id)
    .maybeSingle();
  if (loadErr) return res.status(500).json({ error: loadErr.message });
  if (!row) return res.status(404).json({ error: 'not found' });
  if (row.status === 'published' && row.published_item_id) {
    return res.status(409).json({ error: 'already published', publishedItemId: row.published_item_id });
  }
  if (!row.deepseek_answer) {
    return res.status(400).json({ error: 'no answer to publish — run reprocess first' });
  }

  const question = String(body.question ?? row.question).trim();
  const answer = String(body.answer ?? row.deepseek_answer).trim();
  const chapterId = body.chapterId === undefined ? row.suggested_chapter_id : (body.chapterId || null);

  // Compute next sort_order
  const { data: tail, error: tailErr } = await supabase
    .from('acls_qa_deep_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (tailErr) return res.status(500).json({ error: tailErr.message });
  const nextOrder = (tail?.[0]?.sort_order ?? 0) + 1;

  const { data: created, error: insErr } = await supabase
    .from('acls_qa_deep_items')
    .insert({
      question,
      answer,
      chapter_id: chapterId || null,
      sort_order: nextOrder,
    })
    .select('id')
    .single();
  if (insErr) return res.status(500).json({ error: `create item failed: ${insErr.message}` });

  if (row.generated_image_url) {
    const { error: imgErr } = await supabase
      .from('acls_qa_deep_images')
      .insert({
        item_id: created.id,
        image_type: 'cover',
        src: row.generated_image_url,
        alt: question.slice(0, 200),
        caption: '',
        sort_order: 1,
      });
    if (imgErr) {
      // Don't roll back the item — admin can re-upload manually.
      console.warn('attach image failed:', imgErr.message);
    }
  }

  const { error: updErr } = await supabase
    .from('acls_student_questions')
    .update({
      status: 'published',
      published_item_id: created.id,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updErr) return res.status(500).json({ error: `mark published failed: ${updErr.message}` });

  return res.status(200).json({ ok: true, itemId: created.id });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
