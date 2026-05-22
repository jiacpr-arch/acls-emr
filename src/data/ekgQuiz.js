// EKG quiz bank.
// Each question may render either:
//   - rhythmId: built-in SVG waveform (matches IDs in EKGWaveform.jsx)
//   - imageUrl: real EKG image hosted under /public (e.g. /ekg/vf-01.png)
// imageUrl takes precedence if both are set.

export const quizCategories = [
  { id: 'all', label: 'ทั้งหมด', color: 'info' },
  { id: 'arrest', label: 'Cardiac Arrest', color: 'danger' },
  { id: 'brady', label: 'Bradycardia / AV Block', color: 'warning' },
  { id: 'narrow', label: 'Narrow Tachycardia', color: 'info' },
  { id: 'wide', label: 'Wide Tachycardia', color: 'danger' },
  { id: 'ectopy', label: 'Ectopy / Pacing', color: 'info' },
  { id: 'ischemia', label: 'Ischemia / STEMI', color: 'danger' },
  { id: 'electrolyte', label: 'Electrolyte', color: 'warning' },
];

export const ekgQuestions = [
  // ---- Cardiac arrest ----
  {
    id: 'q1', category: 'arrest', rhythmId: 'asystole', answer: 'asystole',
    options: ['asystole', 'vf_fine', 'pea', 'tdp'],
    hint: 'เส้นแทบเรียบ ไม่มี complex — ต้องยืนยัน 2 leads และเช็ค lead off',
  },
  {
    id: 'q2', category: 'arrest', rhythmId: 'vf_coarse', answer: 'vf_coarse',
    options: ['vf_coarse', 'tdp', 'vf_fine', 'af'],
    hint: 'หยักวุ่นวาย แอมพลิจูดสูง ไม่มี P/QRS/T → Defibrillate ทันที',
  },
  {
    id: 'q3', category: 'arrest', rhythmId: 'vf_fine', answer: 'vf_fine',
    options: ['vf_fine', 'asystole', 'pea', 'vf_coarse'],
    hint: 'VF แอมพลิจูดต่ำ — ระวังสับสนกับ asystole ต้องเพิ่ม gain ดู',
  },
  {
    id: 'q4', category: 'arrest', rhythmId: 'pvt', answer: 'pvt',
    options: ['pvt', 'svt', 'af', 'sb'],
    pulse: 'none',
    hint: 'QRS กว้าง (>0.12s) เร็ว สม่ำเสมอ ไม่มีชีพจร → Shock',
  },
  {
    id: 'q5', category: 'arrest', rhythmId: 'pea', answer: 'pea',
    options: ['pea', 'nsr', 'sb', 'junctional'],
    pulse: 'none',
    hint: 'EKG ดูปกติแต่คลำชีพจรไม่ได้ = PEA → CPR + หา H/T',
  },

  // ---- Bradycardia ----
  {
    id: 'q6', category: 'brady', rhythmId: 'sb', answer: 'sb',
    options: ['sb', 'nsr', 'avb3', 'junctional'],
    hint: 'P-QRS-T ปกติ แต่ rate < 60/min',
  },
  {
    id: 'q7', category: 'brady', rhythmId: 'avb1', answer: 'avb1',
    options: ['avb1', 'nsr', 'wenckebach', 'avb2'],
    hint: 'PR interval ยาว > 200 ms แต่ทุก P นำ QRS — มักไม่ต้องรักษา',
  },
  {
    id: 'q8', category: 'brady', rhythmId: 'wenckebach', answer: 'wenckebach',
    options: ['wenckebach', 'avb2', 'avb3', 'avb1'],
    hint: 'Mobitz I: PR ยาวขึ้นทีละ beat จนกระทั่ง dropped QRS',
  },
  {
    id: 'q9', category: 'brady', rhythmId: 'avb2', answer: 'avb2',
    options: ['avb2', 'wenckebach', 'avb1', 'avb3'],
    hint: 'Mobitz II: PR คงที่ แต่มี QRS หาย — เสี่ยงพัฒนาเป็น CHB → TCP',
  },
  {
    id: 'q10', category: 'brady', rhythmId: 'avb3', answer: 'avb3',
    options: ['avb3', 'avb2', 'sb', 'pea'],
    hint: 'P กับ QRS เดินคนละจังหวะ (AV dissociation) → TCP / atropine แล้ว pace',
  },
  {
    id: 'q11', category: 'brady', rhythmId: 'junctional', answer: 'junctional',
    options: ['junctional', 'sb', 'pea', 'avb3'],
    hint: 'ไม่เห็น P หรือ P retrograde, QRS แคบ rate 40-60 → จุดกำเนิด AV junction',
  },

  // ---- Tachycardia narrow ----
  {
    id: 'q12', category: 'narrow', rhythmId: 'nsr', answer: 'nsr',
    options: ['nsr', 'sb', 'svt', 'af'],
    hint: 'P นำทุก QRS, PR สม่ำเสมอ, rate 60-100 — ปกติ',
  },
  {
    id: 'q13', category: 'narrow', rhythmId: 'sinus_tach', answer: 'sinus_tach',
    options: ['sinus_tach', 'svt', 'af', 'aflutter'],
    hint: 'P นำทุก QRS แต่ rate 100-150 — หาสาเหตุ (ไข้, ขาดน้ำ, ปวด)',
  },
  {
    id: 'q14', category: 'narrow', rhythmId: 'svt', answer: 'svt',
    options: ['svt', 'sinus_tach', 'nsr', 'vt'],
    hint: 'QRS แคบ สม่ำเสมอ 150-250/min ไม่เห็น P → vagal / adenosine',
  },
  {
    id: 'q15', category: 'narrow', rhythmId: 'af', answer: 'af',
    options: ['af', 'aflutter', 'svt', 'nsr'],
    hint: 'Irregularly irregular ไม่มี P wave QRS แคบ — rate control + anticoag',
  },
  {
    id: 'q16', category: 'narrow', rhythmId: 'aflutter', answer: 'aflutter',
    options: ['aflutter', 'af', 'svt', 'sinus_tach'],
    hint: 'Sawtooth F wave ~300/min, ventricular rate ~150 ที่ 2:1 conduction',
  },

  // ---- Tachycardia wide ----
  {
    id: 'q17', category: 'wide', rhythmId: 'vt', answer: 'vt',
    options: ['vt', 'svt', 'tdp', 'wpw'],
    pulse: 'present',
    hint: 'QRS กว้าง สม่ำเสมอ > 100/min มีชีพจร — stable: amiodarone, unstable: cardiovert',
  },
  {
    id: 'q18', category: 'wide', rhythmId: 'tdp', answer: 'tdp',
    options: ['tdp', 'vf_coarse', 'vt', 'pvt'],
    pulse: 'none',
    hint: 'Polymorphic VT แอมพลิจูดบิดเกลียว → MgSO4 / defib ถ้าไม่มีชีพจร',
  },
  {
    id: 'q19', category: 'wide', rhythmId: 'wpw', answer: 'wpw',
    options: ['wpw', 'avb1', 'nsr', 'pvc'],
    hint: 'PR สั้น < 120 ms + delta wave (slurred upstroke) — เสี่ยง preexcited AF',
  },
  {
    id: 'q20', category: 'wide', rhythmId: 'paced', answer: 'paced',
    options: ['paced', 'vt', 'wpw', 'avb3'],
    hint: 'มี pacer spike นำหน้า QRS กว้าง — ดู capture ครบทุก spike',
  },

  // ---- Ectopy ----
  {
    id: 'q21', category: 'ectopy', rhythmId: 'pvc', answer: 'pvc',
    options: ['pvc', 'pac', 'bigeminy', 'wpw'],
    hint: 'beat แทรกที่ QRS กว้างผิดรูป ไม่มี P นำ — มักไม่ต้องรักษา ถ้าไม่ถี่',
  },
  {
    id: 'q22', category: 'ectopy', rhythmId: 'pac', answer: 'pac',
    options: ['pac', 'pvc', 'wenckebach', 'nsr'],
    hint: 'P มาเร็วผิดจังหวะ แต่ QRS ตามมาแคบปกติ',
  },
  {
    id: 'q23', category: 'ectopy', rhythmId: 'bigeminy', answer: 'bigeminy',
    options: ['bigeminy', 'pvc', 'aflutter', 'paced'],
    hint: 'normal beat สลับ PVC ทุกครั้ง = ventricular bigeminy',
  },

  // ---- Ischemia ----
  {
    id: 'q24', category: 'ischemia', rhythmId: 'stemi_anterior', answer: 'stemi_anterior',
    options: ['stemi_anterior', 'nstemi', 'ischemic_t', 'hyperk'],
    hint: 'ST elevation ≥ 1mm ใน 2 contiguous leads → activate cath lab',
  },
  {
    id: 'q25', category: 'ischemia', rhythmId: 'stemi_inferior', answer: 'stemi_inferior',
    options: ['stemi_inferior', 'stemi_anterior', 'nstemi', 'nsr'],
    hint: 'ST elevation ที่ II, III, aVF — ระวัง RV infarction ไม่ให้ nitrate',
  },
  {
    id: 'q26', category: 'ischemia', rhythmId: 'nstemi', answer: 'nstemi',
    options: ['nstemi', 'stemi_anterior', 'ischemic_t', 'hypok'],
    hint: 'ST depression — NSTE-ACS, troponin บอกว่า NSTEMI หรือ UA',
  },
  {
    id: 'q27', category: 'ischemia', rhythmId: 'ischemic_t', answer: 'ischemic_t',
    options: ['ischemic_t', 'hyperk', 'long_qt', 'nstemi'],
    hint: 'T inversion สมมาตร ลึก — bookend ของ ischemia / Wellens',
  },

  // ---- Electrolytes ----
  {
    id: 'q28', category: 'electrolyte', rhythmId: 'hyperk', answer: 'hyperk',
    options: ['hyperk', 'stemi_anterior', 'long_qt', 'ischemic_t'],
    hint: 'Peaked tall T (tented) — K+ สูง → Ca gluconate, insulin/D, NaHCO3',
  },
  {
    id: 'q29', category: 'electrolyte', rhythmId: 'hypok', answer: 'hypok',
    options: ['hypok', 'long_qt', 'nsr', 'ischemic_t'],
    hint: 'T แบน + U wave โดดเด่น — เสริม K (และ Mg)',
  },
  {
    id: 'q30', category: 'electrolyte', rhythmId: 'long_qt', answer: 'long_qt',
    options: ['long_qt', 'hypok', 'hyperk', 'wpw'],
    hint: 'QT ยาว — เสี่ยง Torsades หยุดยาที่เป็นสาเหตุ + แก้ Mg/K',
  },
];

export const rhythmLabels = {
  nsr: 'Normal Sinus Rhythm',
  sinus_tach: 'Sinus Tachycardia',
  sb: 'Sinus Bradycardia',
  svt: 'SVT',
  vt: 'VT (with pulse)',
  pvt: 'Pulseless VT',
  vf: 'Ventricular Fibrillation',
  vf_coarse: 'Coarse VF',
  vf_fine: 'Fine VF',
  af: 'Atrial Fibrillation',
  aflutter: 'Atrial Flutter',
  avb1: '1st Degree AV Block',
  wenckebach: 'Mobitz I (Wenckebach)',
  avb2: 'Mobitz II AV Block',
  avb3: '3rd Degree AV Block',
  junctional: 'Junctional Rhythm',
  tdp: 'Torsades de Pointes',
  asystole: 'Asystole',
  pea: 'PEA',
  pvc: 'PVC',
  pac: 'PAC',
  bigeminy: 'Ventricular Bigeminy',
  paced: 'Paced Rhythm',
  wpw: 'WPW Pattern',
  stemi_anterior: 'STEMI (Anterior)',
  stemi_inferior: 'STEMI (Inferior)',
  nstemi: 'NSTE-ACS / ST Depression',
  ischemic_t: 'Ischemic T Inversion',
  hyperk: 'Hyperkalemia',
  hypok: 'Hypokalemia',
  long_qt: 'Long QT',
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
