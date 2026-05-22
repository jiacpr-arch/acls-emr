export const ekgQuestions = [
  {
    id: 'q1', rhythmId: 'asystole', answer: 'asystole',
    options: ['asystole', 'vf', 'pea', 'tdp'],
    hint: 'เส้นตรง ไม่มี complex ใดๆ — ต้องยืนยัน 2 leads',
  },
  {
    id: 'q2', rhythmId: 'vf', answer: 'vf',
    options: ['vf', 'tdp', 'asystole', 'af'],
    hint: 'หยักวุ่นวาย ไม่มี P/QRS/T ที่ระบุได้ → Defibrillate',
  },
  {
    id: 'q3', rhythmId: 'pvt', answer: 'pvt',
    options: ['pvt', 'svt', 'af', 'sb'],
    hint: 'QRS กว้าง (>0.12s) เร็ว สม่ำเสมอ ไม่มีชีพจร → Shock',
  },
  {
    id: 'q4', rhythmId: 'sb', answer: 'sb',
    options: ['sb', 'nsr', 'avb3', 'pea'],
    hint: 'P-QRS-T ปกติ แต่ rate < 60/min',
  },
  {
    id: 'q5', rhythmId: 'svt', answer: 'svt',
    options: ['svt', 'vt', 'nsr', 'af'],
    hint: 'QRS แคบ สม่ำเสมอ 150-250/min — มักไม่เห็น P wave',
  },
  {
    id: 'q6', rhythmId: 'af', answer: 'af',
    options: ['af', 'nsr', 'svt', 'avb2'],
    hint: 'Irregularly irregular ไม่มี P wave QRS แคบ',
  },
  {
    id: 'q7', rhythmId: 'vt', answer: 'vt',
    options: ['vt', 'svt', 'tdp', 'af'],
    hint: 'QRS กว้าง สม่ำเสมอ > 100/min — มีชีพจร = stable/unstable VT',
  },
  {
    id: 'q8', rhythmId: 'avb3', answer: 'avb3',
    options: ['avb3', 'avb2', 'sb', 'pea'],
    hint: 'P wave และ QRS เดินคนละจังหวะ (AV dissociation) → TCP ทันที',
  },
  {
    id: 'q9', rhythmId: 'tdp', answer: 'tdp',
    options: ['tdp', 'vf', 'vt', 'pvt'],
    hint: 'Polymorphic VT แอมพลิจูดบิดเป็นเกลียว → MgSO4 / defib ถ้าไม่มีชีพจร',
  },
  {
    id: 'q10', rhythmId: 'nsr', answer: 'nsr',
    options: ['nsr', 'sb', 'svt', 'af'],
    hint: 'P นำทุก QRS, PR สม่ำเสมอ, rate 60-100 — ปกติ',
  },
];

export const rhythmLabels = {
  nsr: 'Normal Sinus Rhythm',
  sb: 'Sinus Bradycardia',
  svt: 'SVT',
  vt: 'VT (with pulse)',
  pvt: 'Pulseless VT',
  vf: 'Ventricular Fibrillation',
  af: 'Atrial Fibrillation',
  avb2: '2nd Degree AV Block Type II',
  avb3: '3rd Degree AV Block',
  tdp: 'Torsades de Pointes',
  asystole: 'Asystole',
  pea: 'PEA',
};

export function shuffleOptions(options, seed) {
  const arr = [...options];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
