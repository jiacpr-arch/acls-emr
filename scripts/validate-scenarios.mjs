// Ad-hoc validator: walk every built-in scenario and assert structural invariants
// against what the story engine / UI actually support. Run: node scripts/validate-scenarios.mjs
import { readFileSync, readdirSync } from 'node:fs';

const VALID_WHO = new Set(['nurse_mint', 'boy_compressor', 'fon_defib', 'att_dech']);
const VALID_POSE = new Set(['idle', 'talk', 'panic', 'stern', 'happy']);
const VALID_TGT = new Set(['YOU', 'CPR', 'DRUG', 'DEFIB', 'AIRWAY', 'MONITOR']);
const VALID_RHYTHM = new Set(['flat', 'vf', 'nsr']);
const VALID_FX = new Set(['alarm', 'cpr', 'rhythm', 'firstCPR', 'epi', 'shock', 'rosc']);

const dir = new URL('../src/data/scenarios/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));

let errors = 0;
const err = (id, msg) => { errors++; console.error(`  ✗ [${id}] ${msg}`); };

function checkFx(id, where, fx) {
  if (!fx) return;
  for (const k of Object.keys(fx)) {
    if (!VALID_FX.has(k)) err(id, `${where}: unknown fx key "${k}"`);
  }
  if (fx.rhythm && !VALID_RHYTHM.has(fx.rhythm)) err(id, `${where}: bad rhythm "${fx.rhythm}"`);
}

function checkSay(id, where, say) {
  if (!VALID_WHO.has(say.who)) err(id, `${where}: bad who "${say.who}"`);
  if (say.pose && !VALID_POSE.has(say.pose)) err(id, `${where}: bad pose "${say.pose}"`);
  if (typeof say.text !== 'string' || !say.text) err(id, `${where}: missing text`);
  if (/&(?!amp;|lt;|gt;|quot;|#)/.test(say.text || '')) err(id, `${where}: unescaped & in text`);
  checkFx(id, where, say.fx);
}

function checkNodes(id, where, nodes) {
  if (!Array.isArray(nodes)) { err(id, `${where}: not an array`); return; }
  nodes.forEach((n, i) => {
    const w = `${where}[${i}]`;
    if (n.say) checkSay(id, w, n.say);
    else if (n.inter !== undefined) checkFx(id, w, n.fx);
    else if (n.skip !== undefined) { if (typeof n.t !== 'number') err(id, `${w}: skip needs numeric t`); }
    else if (n.choice) checkChoice(id, w, n.choice);
    else if (n.end) { /* ok */ }
    else err(id, `${w}: unknown node shape ${JSON.stringify(Object.keys(n))}`);
  });
}

function checkChoice(id, where, c) {
  if (!c.q) err(id, `${where}: choice missing q`);
  if (!Array.isArray(c.options) || c.options.length < 2) err(id, `${where}: choice needs >=2 options`);
  const oks = (c.options || []).filter((o) => o.ok === true);
  if (oks.length !== 1) err(id, `${where}: choice must have exactly 1 ok:true (found ${oks.length})`);
  (c.options || []).forEach((o, i) => {
    const w = `${where}.opt[${i}]`;
    if (!VALID_TGT.has(o.tgt)) err(id, `${w}: bad tgt "${o.tgt}"`);
    if (!o.label) err(id, `${w}: missing label`);
    if (o.ok !== true && !o.why) err(id, `${w}: wrong option missing why`);
    if (o.then) checkNodes(id, `${w}.then`, o.then);
  });
}

console.log(`Validating ${files.length} scenario files...`);
for (const f of files) {
  const mod = await import(new URL(f, dir).href);
  const exp = Object.values(mod)[0];
  if (!exp || !exp.id) { err(f, 'no export with .id'); continue; }
  const id = exp.id;
  for (const field of ['title', 'subtitle', 'level', 'story']) {
    if (exp[field] === undefined) err(id, `missing field "${field}"`);
  }
  if (!['basic', 'intermediate', 'megacode'].includes(exp.level)) err(id, `bad level "${exp.level}"`);
  checkNodes(id, 'story', exp.story);
  const last = exp.story[exp.story.length - 1];
  if (!last || !last.end) err(id, 'story must end with { end: true }');
}

// duplicate id check
const src = files.map((f) => readFileSync(new URL(f, dir), 'utf8'));
const ids = src.flatMap((s) => [...s.matchAll(/^\s*id:\s*'([^']+)'/gm)].map((m) => m[1]));
const seen = new Set(); const dups = new Set();
for (const i of ids) { if (seen.has(i)) dups.add(i); seen.add(i); }
if (dups.size) err('GLOBAL', `duplicate ids: ${[...dups].join(', ')}`);

if (errors) { console.error(`\n${errors} problem(s) found.`); process.exit(1); }
console.log(`\n✓ all ${files.length} scenarios valid (${ids.length} ids, no dups)`);
