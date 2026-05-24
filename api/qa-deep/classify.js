import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/requireAdmin.js';
import { classifyChapter } from '../_lib/classifyChapter.js';

export const config = { maxDuration: 60 };

const MAX_BATCH = 20;

/**
 * Suggest chapter_id for one or more Q&A items.
 *
 * Body (single):  { question, answer }
 *   → { chapterId, reason }
 *
 * Body (batch):   { items: [{ id, question, answer }, ...] }   (max 20)
 *   → { results: [{ id, chapterId, reason, error? }, ...] }
 *
 * Does NOT write to the DB — the client decides whether to apply.
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

  const supabase = getSupabaseAdmin();
  const { data: chapters, error: chErr } = await supabase
    .from('acls_chapters')
    .select('id, title')
    .order('sort_order');
  if (chErr) return res.status(500).json({ error: chErr.message });
  if (!chapters?.length) {
    return res.status(400).json({ error: 'ยังไม่มีหมวด — เพิ่มหมวดก่อน' });
  }

  // Batch mode
  if (Array.isArray(body.items)) {
    const items = body.items.slice(0, MAX_BATCH);
    const results = [];
    for (const it of items) {
      const id = String(it?.id || '').trim();
      const question = String(it?.question || '').trim();
      const answer = String(it?.answer || '').trim();
      if (!id || !question) {
        results.push({ id, chapterId: null, reason: '', error: 'missing id or question' });
        continue;
      }
      try {
        const r = await classifyChapter({ question, answer, chapters });
        results.push({ id, chapterId: r.chapterId, reason: r.reason });
      } catch (err) {
        results.push({ id, chapterId: null, reason: '', error: err?.message || String(err) });
      }
    }
    return res.status(200).json({ results });
  }

  // Single mode
  const question = String(body.question || '').trim();
  const answer = String(body.answer || '').trim();
  if (!question) return res.status(400).json({ error: 'question required' });

  try {
    const r = await classifyChapter({ question, answer, chapters });
    return res.status(200).json(r);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
