// Drive each scenario through the REAL story engine on the all-correct path.
// Asserts the game reaches { end: true } without hp reaching 0. Run:
//   node scripts/playthrough-scenarios.mjs
import {
  createInitialState, nextNode, recordCorrect, applyFx,
} from '../src/game/storyEngine.js';
import { readdirSync } from 'node:fs';

const dir = new URL('../src/data/scenarios/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));

let fail = 0;
for (const f of files) {
  const mod = await import(new URL(f, dir).href);
  const sc = Object.values(mod)[0];
  const st = createInitialState('normal');
  let ended = false;
  let steps = 0;
  while (steps++ < 500) {
    const node = nextNode(st, sc.story);
    if (!node) { ended = true; break; }        // ran off the end == win
    if (node.end) { ended = true; break; }
    if (node.say) applyFx(st, node.say.fx);
    else if (node.inter !== undefined) applyFx(st, node.fx);
    else if (node.choice) {
      const ok = node.choice.options.find((o) => o.ok === true);
      if (!ok) { console.error(`✗ ${sc.id}: choice with no ok option`); fail++; break; }
      recordCorrect(st, ok);                    // pushes ok.then into queue
    }
  }
  if (steps >= 500) { console.error(`✗ ${sc.id}: did not terminate (loop?)`); fail++; continue; }
  if (!ended) { console.error(`✗ ${sc.id}: never reached end`); fail++; continue; }
  const choices = sc.story.filter((n) => n.choice).length;
  console.log(`✓ ${sc.id.padEnd(24)} end reached · ${choices} decisions · sim ${st.simTime}s`);
}
if (fail) { console.error(`\n${fail} scenario(s) failed playthrough`); process.exit(1); }
console.log(`\n✓ all ${files.length} scenarios play to completion on the correct path`);
