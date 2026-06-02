import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { broadcastNewsItem } from '../_lib/pushBroadcast.js';

export const config = { maxDuration: 300 };

const MODEL = 'claude-sonnet-4-6';
const MAX_ITEMS_PER_RUN = 6;
// A fresh news item must be published within this many days. Anything older is
// treated as "evergreen" reference material (guidelines, landmark research).
const FRESH_MAX_DAYS = 21;
// Evergreen reference is valuable but must never dominate the feed, otherwise the
// top of the (published_at-sorted) feed stops advancing and looks stale. Allow at
// most this many evergreen items per run; the rest of each run must be fresh news.
const MAX_EVERGREEN_PER_RUN = 1;

const SYSTEM_PROMPT = `You curate a daily medical news feed for two Thai e-learning sites:
- acls.morroo.com (ACLS — Advanced Cardiac Life Support, ILCOR 2025)
- bls.morroo.com (BLS — Basic Life Support, CPR, AED)

Use the web_search tool to find RECENT news (prefer past 7 days, and for fresh news
NEVER older than ${FRESH_MAX_DAYS} days) that is clinically or educationally relevant
to ACLS / BLS / CPR / cardiac arrest / post-resuscitation care / AED / public access
defibrillation / Thai EMS / 1669 / out-of-hospital cardiac arrest / resuscitation
guidelines / hypothermia / ROSC.

The feed is sorted by publication date, so this run's value is the FRESH news it adds.
The overwhelming majority of items you return MUST be genuine news published within the
last ${FRESH_MAX_DAYS} days. Re-running the same evergreen guideline/research explainers
every day makes the feed look frozen — do not do it.

Search strategy:
1. First search Thai-language sources (เช่น hfocus.org, thairath.co.th, hospital sites,
   ราชวิทยาลัยอายุรแพทย์, สมาคมโรคหัวใจ, สพฉ./1669, hfocus, mgronline สุขภาพ).
   Use Thai queries: "CPR ข่าว", "หัวใจหยุดเต้น", "AED", "ช่วยชีวิต ข่าว 2026",
   "ACLS ประเทศไทย", "ผู้ป่วยวิกฤต ข่าว", "1669 ข่าว".
2. IMPORTANT — actively search for ACLS / advanced-care topics too, not just basic CPR/AED.
   The ACLS feed tends to be starved because most rescue stories get tagged 'bls'.
   Run extra queries: "หัวใจวายเฉียบพลัน ข่าว", "STEMI", "กล้ามเนื้อหัวใจตายเฉียบพลัน",
   "ภาวะหัวใจเต้นผิดจังหวะ", "ICU วิกฤต ข่าว", "post cardiac arrest", "ROSC",
   "resuscitation guideline 2026", "antiarrhythmic amiodarone", "vasopressor sepsis",
   "สมาคมแพทย์โรคหัวใจ แนวทาง", "targeted temperature management".
3. If you find fewer than ${MAX_ITEMS_PER_RUN} good Thai items, supplement with English
   sources (AHA, ERC, Resuscitation journal, NEJM, JAMA, BMJ, Reuters Health).

Balance: every run MUST include at least 2 FRESH (non-evergreen, within ${FRESH_MAX_DAYS}
days) items that are visible to ACLS learners (course 'acls' or 'both'). Run the ACLS /
advanced-care searches in step 2 BEFORE you finalize the list, so clinical items are not
crowded out by the item budget. The ACLS feed only shows 'acls' + 'both' items, so if a run
returns only 'bls' items the ACLS site looks frozen — that is the failure mode to avoid.
Prefer the freshest items; do not pad the list with months-old guideline explainers when
recent news exists.

Evergreen reference material (major guideline updates like AHA/ERC/ILCOR, landmark
trials such as TTM) is allowed but limited: include AT MOST 1 evergreen item, and only
if it is genuinely important and not already a tired re-run. Mark such an item with
"is_evergreen": true. Every other item must be fresh news (is_evergreen false). If you
cannot find fresh news, return fewer items rather than padding with old reference pieces.

Quality bar:
- Skip ads, press releases with no news value, opinion pieces, listicles.
- Each item must have a real, verifiable URL and a real news date.
- The summary must be CONCRETE — what happened, when, where, why it matters
  to an ACLS/BLS learner. No filler.

For EACH item produce:
- title: 60-100 chars, in the article's original language
- summary: 2-3 sentences in THAI (even if source is English — translate),
  written for a Thai clinician/nurse/EMT learner
- source_url: the article URL (must be the actual article, not the homepage)
- source_name: short publisher name e.g. "Hfocus", "AHA", "Reuters"
- language: 'th' if source is Thai, 'en' otherwise
- course: choose carefully — this decides which site(s) the item appears on.
    'bls'  = ONLY purely LOCAL lay-rescuer / community basics with no clinical or
             professional-body angle: a specific school / workplace / police / single-hospital
             CPR drill or staff training session, a local "how to do CPR" explainer for the
             general public.
    'acls' = clearly advanced/clinical only: algorithms, drugs, arrhythmia management, ACS/STEMI,
             post-arrest/ICU/critical care, defibrillation strategy aimed at clinicians.
    'both' = DEFAULT for any real clinical resuscitation event or news — a cardiac-arrest
             rescue/CPR save (in hospital or out), OHCA, ROSC, AED used on a real patient,
             resuscitation research, or guideline updates. ALSO use 'both' for any CPR / AED
             awareness campaign, survey, statement, or guidance from a medical authority or
             professional body (AHA, ERC, ILCOR, Red Cross, สพฉ./1669 national programs,
             สมาคมแพทย์ / ราชวิทยาลัย) — these matter to ACLS learners too, not just lay rescuers.
             When unsure between bls and acls, choose 'both'. Most "หัวใจหยุดเต้น / ช่วยชีวิต"
             news stories are 'both', not 'bls'.
- topics: 1-4 short Thai tags e.g. ["AED", "CPR", "หัวใจหยุดเต้น"]
- published_at: ISO 8601 date of publication (from the article)
- is_evergreen: true ONLY for a major guideline/landmark-research reference that is
  intentionally older than ${FRESH_MAX_DAYS} days; false for genuine fresh news

Return strictly this JSON shape, no prose:
{"items": [ { "title":"...", "summary":"...", "source_url":"...", "source_name":"...",
  "language":"th|en", "course":"acls|bls|both", "topics":["..."], "published_at":"YYYY-MM-DD",
  "is_evergreen": false } ]}

Aim for ${MAX_ITEMS_PER_RUN} items. If you genuinely cannot find that many recent
relevant items, return fewer — never invent.`;

const USER_PROMPT = `วันนี้คือ ${new Date().toISOString().slice(0, 10)}. ค้นหาและสรุปข่าวล่าสุด ${MAX_ITEMS_PER_RUN} ชิ้นตามเงื่อนไขใน system prompt แล้วตอบเป็น JSON เท่านั้น`;

export default async function handler(req, res) {
  // Vercel cron sends GET with Authorization: Bearer <CRON_SECRET>
  // Also allow manual POST with same header (for testing / re-run).
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  // Idempotent: if we already inserted >=3 items in the past 20h, skip.
  // (Two Vercel projects share one DB, so both crons would otherwise double-insert.)
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('news')
    .select('id', { count: 'exact', head: true })
    .gte('fetched_at', since);
  if ((recentCount || 0) >= 3 && req.method === 'GET') {
    return res.status(200).json({ skipped: true, recentCount });
  }

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
      messages: [{ role: 'user', content: USER_PROMPT }],
    });
  } catch (err) {
    return res.status(502).json({ error: 'anthropic call failed', detail: String(err?.message || err) });
  }

  // Final assistant turn = last text block
  const textBlocks = response.content.filter(b => b.type === 'text');
  const lastText = textBlocks[textBlocks.length - 1]?.text || '';
  const items = extractItems(lastText);
  if (!items.length) {
    return res.status(502).json({ error: 'no items parsed', raw: lastText.slice(0, 500) });
  }

  const normalized = items.map(normalizeItem).filter(Boolean);

  // Keep all fresh items, but cap evergreen reference so a run can never be mostly
  // old-dated material (which would leave the feed looking stale). Fresh items keep
  // their natural order (already published_at-desc-ish from the model).
  const freshItems = normalized.filter(r => !r.is_evergreen);
  const evergreenItems = normalized.filter(r => r.is_evergreen).slice(0, MAX_EVERGREEN_PER_RUN);
  const rows = [...freshItems, ...evergreenItems].slice(0, MAX_ITEMS_PER_RUN);

  if (!rows.length) {
    return res.status(200).json({ inserted: 0, parsed: items.length });
  }

  // De-dupe against existing source_url
  const urls = rows.map(r => r.source_url).filter(Boolean);
  const { data: existing } = await supabase
    .from('news')
    .select('source_url')
    .in('source_url', urls);
  const existingSet = new Set((existing || []).map(e => e.source_url));
  const toInsert = rows.filter(r => !r.source_url || !existingSet.has(r.source_url));

  if (!toInsert.length) {
    return res.status(200).json({ inserted: 0, skipped: rows.length, reason: 'all duplicates' });
  }

  const { data: inserted, error } = await supabase
    .from('news')
    .insert(toInsert)
    .select('id, title, summary, source_url, course, language');
  if (error) {
    return res.status(500).json({ error: error.message, attempted: toInsert.length });
  }

  // Broadcast push notification for the first (most relevant) item.
  // Don't spam — pushing more than one per day will fatigue users.
  let pushResult = null;
  if (inserted.length > 0) {
    try {
      pushResult = await broadcastNewsItem(inserted[0]);
    } catch (e) {
      pushResult = { error: String(e?.message || e) };
    }
  }

  // How many inserted items are visible to the ACLS feed ('acls' or 'both'). The ACLS
  // site looks stale when this is 0, so surface it for monitoring the balance requirement.
  const aclsVisible = inserted.filter(r => r.course === 'acls' || r.course === 'both').length;

  return res.status(200).json({
    inserted: inserted.length,
    deduped: rows.length - toInsert.length,
    evergreen: evergreenItems.length,
    aclsVisible,
    items: inserted.map(({ summary, source_url, ...rest }) => rest),
    push: pushResult,
  });
}

function extractItems(text) {
  if (!text) return [];
  // Try fenced JSON block first
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  // Find the first { and last }
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1) return [];
  const slice = candidate.slice(first, last + 1);
  try {
    const parsed = JSON.parse(slice);
    if (Array.isArray(parsed.items)) return parsed.items;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function normalizeItem(it) {
  if (!it || typeof it !== 'object') return null;
  const title = String(it.title || '').trim().slice(0, 300);
  const summary = String(it.summary || '').trim().slice(0, 2000);
  if (!title || !summary) return null;

  const url = String(it.source_url || '').trim();
  const source_url = /^https?:\/\//.test(url) ? url.slice(0, 800) : null;

  const language = it.language === 'en' ? 'en' : 'th';
  const course = ['acls', 'bls', 'both'].includes(it.course) ? it.course : 'both';

  const topics = Array.isArray(it.topics)
    ? it.topics.map(t => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 6)
    : [];

  let published_at = null;
  if (it.published_at) {
    const d = new Date(it.published_at);
    if (!Number.isNaN(d.getTime())) published_at = d.toISOString();
  }
  const publishedIso = published_at || new Date().toISOString();

  // An item is evergreen if the model flagged it, OR if its publication date is
  // already older than the fresh window — this stops old-dated reference pieces
  // from sneaking in disguised as fresh news.
  const ageMs = Date.now() - new Date(publishedIso).getTime();
  const tooOldToBeFresh = ageMs > FRESH_MAX_DAYS * 24 * 60 * 60 * 1000;
  const is_evergreen = it.is_evergreen === true || tooOldToBeFresh;

  return {
    title,
    summary,
    source_url,
    source_name: String(it.source_name || '').trim().slice(0, 120) || null,
    language,
    course,
    topics,
    published_at: publishedIso,
    is_evergreen,
  };
}
