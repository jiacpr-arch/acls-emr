import { getSupabaseAdmin } from './supabaseAdmin.js';
import { enforceRateLimit } from './rateLimit.js';

// POST /api/cert/lookup { number, name } — lets the JIA Hub's verify page (class.jiacpr.com)
// find a certificate this app issued before the Hub existed. Those certificates were minted in the
// learner's browser (src/pages/Certification.jsx) and recorded through the unauthenticated
// /api/cert/notify, and their numbers are a base36 timestamp — easy to walk. So a lookup needs the
// number AND the name printed on it; a wrong name gets exactly the same answer as a missing number,
// and the reply carries only what is already printed on the certificate (never phone or email).
// The Hub labels these "old record, not verified" unless the exam was graded by the server.

export const CERT_ID_RE = /^JIA-(ACLS|BLS|AW|DF|IV)-[0-9A-Z]{6,16}$/;
const MAX_NAME_LEN = 80;

// Thai and English honorifics people add or leave out when they type a name. Longest first so
// "นางสาว" wins over "นาง". Thai titles attach straight to the name ("นายสมชาย"); a Latin title must
// end in "." or be followed by a space, so "Missy" stays "missy".
const TITLES = [
  'เด็กหญิง', 'เด็กชาย', 'นางสาว', 'ทพญ.', 'น.ส.', 'ด.ญ.', 'ด.ช.', 'นพ.', 'พญ.', 'ทพ.', 'ภก.', 'ภญ.', 'ดร.', 'นาย', 'นาง',
  'miss', 'mrs.', 'mrs', 'mr.', 'mr', 'ms.', 'ms', 'dr.', 'dr',
];
const THAI = /[\u0E00-\u0E7F]/;

export function normalizeName(value) {
  let s = String(value ?? '').normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  for (const title of TITLES) {
    if (!s.startsWith(title)) continue;
    const rest = s.slice(title.length);
    if (THAI.test(title) || title.endsWith('.') || rest.startsWith(' ')) { s = rest.trim(); break; }
  }
  return s.replace(/[\s.]/g, '');
}

export function namesMatch(a, b) {
  const x = normalizeName(a);
  return x.length >= 2 && x === normalizeName(b);
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

export function createLegacyLookupHandler({ getAdmin = getSupabaseAdmin } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!enforceRateLimit(req, res, { key: 'cert-lookup', limit: 20, windowMs: 60_000 })) return;

    const body = parseBody(req);
    const number = String(body.number ?? '').trim().toUpperCase();
    const name = String(body.name ?? '').trim();
    if (!CERT_ID_RE.test(number) || name.length > MAX_NAME_LEN || normalizeName(name).length < 2) {
      return res.status(400).json({ error: 'invalid' });
    }

    let admin;
    try { admin = getAdmin(); } catch { return res.status(503).json({ error: 'unavailable' }); }
    const { data, error } = await admin
      .from('certificates')
      .select('cert_id, student_name, course_mode, issued_at, exam_verified')
      .eq('cert_id', number)
      .maybeSingle();
    if (error) return res.status(503).json({ error: 'unavailable' });
    if (!data || !namesMatch(name, data.student_name)) return res.status(404).json({ found: false });

    return res.status(200).json({
      found: true,
      certificate: {
        number: data.cert_id,
        course: data.course_mode,
        name: String(data.student_name || '').trim(),
        issuedAt: data.issued_at,
        examVerified: data.exam_verified === true,
      },
    });
  };
}
