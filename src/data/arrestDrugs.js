// Administration technique notes shown in the DrugStep "how?" popover.
export const DRUG_TECHNIQUES = {
  epinephrine_arrest: 'Epi 1:1000 1ml + NSS 9ml = 1:10,000 → IV push fast → flush NSS 20ml → elevate arm',
  amiodarone_first: '300mg undiluted or +D5W 4ml → push 1-3min → flush NSS 20ml. ⚠️ Do NOT mix with NSS!',
  atropine: '1mg IV push fast (<1min) → flush 20ml. ⚠️ Slow push = paradoxical bradycardia!',
  sodium_bicarb: '1mEq/kg IV push slow. ⚠️ Flush before/after Ca (precipitates).',
  calcium_chloride: '10% 10-20ml IV push slow 2-5min + ECG monitoring. ⚠️ CI: Digoxin.',
  magnesium: 'Arrest: 2g push 1-2min. Stable: drip 5-20min.',
  naloxone: '0.4-2mg IV/IM/IN. Titrate to breathing.',
  lidocaine_first: '1-1.5 mg/kg IV push → may repeat 0.5-0.75 mg/kg q5-10min (max 3 mg/kg). Use if Amiodarone unavailable.',
  amiodarone_second: '150mg+D5W 4ml → push over 2min → flush NSS 20ml.',
};

// Second-line quick-give grid in the DrugStep.
export const QUICK_DRUGS = [
  { label: 'Amio 150', id: 'amiodarone_second', detail: '150mg+D5W, push/2min' },
  { label: 'Lidocaine', id: 'lidocaine_first', detail: '1-1.5 mg/kg IV' },
  { label: 'Atropine', id: 'atropine', detail: '1mg IV push fast' },
  { label: 'NaHCO₃', id: 'sodium_bicarb', detail: '1mEq/kg IV slow' },
  { label: 'Ca Gluc', id: 'calcium_chloride', detail: '10% 10-20ml slow' },
  { label: 'MgSO₄', id: 'magnesium', detail: '2g IV' },
  { label: 'Naloxone', id: 'naloxone', detail: '0.4-2mg IV' },
];
