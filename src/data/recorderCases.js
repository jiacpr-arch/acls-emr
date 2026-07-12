// ==========================================
// Recorder Hero — คลังเคส (Case pool) หลายรูปแบบ
// ใช้โดยโหมด Endless Shuffle + Case Pack และเป็น fallback ของเคสจาก DB
// Case = แกน playable ของเคสเดียว (subset ของ live level) — engine กินได้ตรงๆ
// DATA ล้วน ไม่ import store/React
// ==========================================

// ---- หมวดเคส ----
export const CASE_CATEGORY_META = {
  cardiac_arrest: { label_th: 'หัวใจหยุดเต้น', icon: '💔', color: 'text-danger' },
  bradycardia:    { label_th: 'หัวใจเต้นช้า', icon: '🐢', color: 'text-warning' },
  tachycardia:    { label_th: 'หัวใจเต้นเร็ว', icon: '⚡', color: 'text-shock' },
  mi:             { label_th: 'STEMI / ACS', icon: '🫀', color: 'text-danger' },
  stroke:         { label_th: 'Stroke', icon: '🧠', color: 'text-purple' },
  special:        { label_th: 'ภาวะพิเศษ', icon: '🧪', color: 'text-info' },
};

export const CASE_CATEGORIES = Object.keys(CASE_CATEGORY_META);

// ---- ปุ่ม action pad ต่อหมวด (เคส non-arrest) ----
// descriptor: { id, label_th, tone, needsData?, options? (สำหรับ choice), energyChoices? }
// cardiac_arrest ใช้ GameCprDashboard เดิม จึงไม่ต้องมี action pad
export const CATEGORY_ACTIONS = {
  bradycardia: [
    { id: 'assess', label_th: 'ประเมิน', tone: 'ghost' },
    { id: 'drug_choice', label_th: 'ให้ยา', tone: 'purple', needsData: 'choice', options: [
      { id: 'atropine_1mg', label: 'Atropine 1mg', detail: 'IV push q3-5min (max 3mg)' },
      { id: 'adrenaline_infusion', label: 'Adrenaline drip', detail: '2-10 mcg/min' },
      { id: 'dopamine', label: 'Dopamine', detail: '5-20 mcg/kg/min' },
      { id: 'amiodarone_first', label: 'Amiodarone', detail: 'ไม่ใช้ใน brady' },
    ] },
    { id: 'pacing', label_th: 'Transcutaneous Pacing', tone: 'warning' },
    { id: 'twelve_lead', label_th: '12-Lead ECG', tone: 'ghost' },
    { id: 'monitor', label_th: 'Monitor + หาสาเหตุ', tone: 'success' },
  ],
  tachycardia: [
    { id: 'assess', label_th: 'ประเมิน Stable/Unstable', tone: 'ghost' },
    { id: 'vagal', label_th: 'Vagal maneuver', tone: 'info' },
    { id: 'drug_choice', label_th: 'ให้ยา', tone: 'purple', needsData: 'choice', options: [
      { id: 'adenosine_6mg', label: 'Adenosine 6mg', detail: 'rapid IV push + flush' },
      { id: 'adenosine_12mg', label: 'Adenosine 12mg', detail: 'ถ้า 6mg ไม่ได้ผล' },
      { id: 'amiodarone_150', label: 'Amiodarone 150mg', detail: 'wide/stable VT' },
      { id: 'diltiazem', label: 'Diltiazem', detail: 'AF rate control' },
    ] },
    { id: 'cardiovert', label_th: 'Synchronized Cardioversion', tone: 'shock', needsData: 'energy', energyChoices: [50, 100, 120, 150, 200] },
    { id: 'monitor', label_th: 'Monitor + 12-Lead', tone: 'success' },
  ],
  mi: [
    { id: 'assess', label_th: 'ประเมิน ACS', tone: 'ghost' },
    { id: 'mona', label_th: 'ASA 325mg + NTG', tone: 'info' },
    { id: 'twelve_lead', label_th: '12-Lead ECG', tone: 'purple' },
    { id: 'drug_choice', label_th: 'ให้ยา', tone: 'ghost', needsData: 'choice', options: [
      { id: 'heparin', label: 'Heparin', detail: 'anticoagulation' },
      { id: 'antiplatelet', label: 'Clopidogrel/Ticagrelor', detail: 'loading' },
      { id: 'thrombolytic', label: 'Thrombolytic', detail: 'ถ้า PCI ไม่ได้ในเวลา' },
    ] },
    { id: 'cath', label_th: 'Activate Cath lab', tone: 'danger' },
    { id: 'monitor', label_th: 'Monitor', tone: 'success' },
  ],
  stroke: [
    { id: 'fast', label_th: 'FAST assessment', tone: 'info' },
    { id: 'drug_choice', label_th: 'ตรวจ / ยา', tone: 'ghost', needsData: 'choice', options: [
      { id: 'dtx', label: 'ตรวจ DTX', detail: 'exclude hypoglycemia' },
      { id: 'nihss', label: 'NIHSS', detail: 'ประเมินความรุนแรง' },
    ] },
    { id: 'ct_brain', label_th: 'CT Brain', tone: 'purple' },
    { id: 'tpa', label_th: 'ให้ tPA (Alteplase)', tone: 'danger' },
    { id: 'monitor', label_th: 'Monitor BP + Neuro', tone: 'success' },
  ],
  special: [
    { id: 'assess', label_th: 'ประเมิน', tone: 'ghost' },
    { id: 'drug_choice', label_th: 'ให้ยา / รักษา', tone: 'purple', needsData: 'choice', options: [
      { id: 'adrenaline_im', label: 'Adrenaline IM 0.5mg', detail: 'anaphylaxis first-line' },
      { id: 'calcium_gluconate', label: 'Calcium gluconate', detail: 'hyperK membrane' },
      { id: 'insulin_glucose', label: 'Insulin + Glucose', detail: 'shift K+' },
      { id: 'naloxone', label: 'Naloxone', detail: 'opioid reversal' },
      { id: 'salbutamol_neb', label: 'Salbutamol NB', detail: 'bronchospasm / K+' },
      { id: 'back_blows', label: 'Back blows / Abd thrust', detail: 'choking relief' },
    ] },
    { id: 'airway', label_th: 'Airway / O₂', tone: 'ghost' },
    { id: 'monitor', label_th: 'Monitor + หาสาเหตุ', tone: 'success' },
  ],
};

// ==========================================
// CASE POOL (built-in)
// ==========================================
const W_STD = { perfect: 3, good: 6, late: 11 };
const W_FAST = { perfect: 2, good: 5, late: 9 };

export const CASES = [
  // ---------------- CARDIAC ARREST ----------------
  {
    id: 'case_vf_01', category: 'cardiac_arrest', difficulty: 'basic', source: 'builtin',
    title_th: 'VF Arrest — ชาย 55 ปี', intro_th: 'ชาย 55 ปีหมดสติขณะออกกำลังกาย ทีมเริ่ม CPR แล้ว',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, etco2: 12, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      { t: 6, narration_th: 'ติด monitor — Check rhythm!', scene: { rhythm: 'vf', etco2: 14 }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } }, window: W_STD, points: 100, missFeedback_th: 'ลืมบันทึก check rhythm', wrongDataFeedback_th: 'จังหวะนี้คือ VF' },
      { t: 15, narration_th: 'VF = shockable → Shock', scene: { rhythm: 'vf', defibCharged: true }, expect: { buttonId: 'shock', data: { energy: 120 } }, window: W_STD, points: 120, missFeedback_th: 'VF ต้อง shock เร็ว', wrongDataFeedback_th: 'Shock แรก 120J' },
      { t: 27, narration_th: 'CPR ต่อ + เปิด IV ให้ Epi', scene: { rhythm: 'vf', defibCharged: false, compressorActive: true, ivAccess: true, etco2: 18 }, expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } }, window: { perfect: 4, good: 8, late: 14 }, points: 100, missFeedback_th: 'ลืม Epinephrine', wrongDataFeedback_th: 'Epinephrine 1mg' },
      { t: 42, narration_th: 'ครบ 2 นาที — check rhythm: ยัง VF', scene: { rhythm: 'vf', compressorActive: false }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } }, window: W_STD, points: 100, missFeedback_th: 'ลืม rhythm check', wrongDataFeedback_th: 'ยังเป็น VF' },
      { t: 52, narration_th: 'Shock ครั้งที่ 2', scene: { rhythm: 'vf', defibCharged: true }, expect: { buttonId: 'shock', data: { energy: 200 } }, window: W_STD, points: 120, missFeedback_th: 'ลืม shock', wrongDataFeedback_th: 'Shock ถัดไป 200J' },
      { t: 64, narration_th: 'ให้ Amiodarone', scene: { rhythm: 'vf', compressorActive: true, etco2: 22 }, expect: { buttonId: 'drug', data: { drug: 'amiodarone_first' } }, window: { perfect: 4, good: 8, late: 14 }, points: 110, missFeedback_th: 'ลืม Amiodarone', wrongDataFeedback_th: 'Amiodarone 300mg' },
      { t: 80, narration_th: 'EtCO₂ พุ่ง 42 มี pulse — ROSC!', scene: { rhythm: 'nsr', hr: 88, bp: '110/70', spo2: 96, etco2: 42, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: { perfect: 4, good: 8, late: 14 }, points: 150, missFeedback_th: 'ลืมบันทึก ROSC' },
    ],
  },
  {
    id: 'case_asystole_01', category: 'cardiac_arrest', difficulty: 'basic', source: 'builtin',
    title_th: 'Asystole — หญิง 72 ปี CKD', intro_th: 'หญิง 72 ปี CKD พบนอนนิ่ง ไม่หายใจ ไม่มี pulse',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, etco2: 10, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      { t: 6, narration_th: 'ติด monitor — Check rhythm (flat line, ยืนยัน 2 leads)', scene: { rhythm: 'flat' }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'asystole' } }, window: W_STD, points: 100, missFeedback_th: 'ลืม check rhythm', wrongDataFeedback_th: 'เส้นแบน = Asystole (non-shockable)' },
      { t: 16, narration_th: 'Asystole → ให้ Epi ทันที (ห้าม shock)', scene: { compressorActive: true, ivAccess: true }, expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } }, window: W_STD, points: 110, missFeedback_th: 'Asystole ต้อง Epi ทันที', wrongDataFeedback_th: 'Epinephrine 1mg (ไม่ใช่ยาอื่น/ห้าม shock)' },
      { t: 30, narration_th: 'CKD → นึกถึง hyperkalemia บันทึกการหาสาเหตุ', scene: { compressorActive: true }, expect: { buttonId: 'ht' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึกการหา H&T' },
      { t: 46, narration_th: 'ครบ 2 นาที — check rhythm: ยัง Asystole', scene: { rhythm: 'flat', compressorActive: false }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'asystole' } }, window: W_STD, points: 100, missFeedback_th: 'ลืม rhythm check', wrongDataFeedback_th: 'ยังเป็น Asystole' },
      { t: 56, narration_th: 'ให้ Epi ซ้ำ (q3-5 นาที)', scene: { compressorActive: true }, expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } }, window: W_STD, points: 100, missFeedback_th: 'ลืม Epi dose ถัดไป', wrongDataFeedback_th: 'Epinephrine 1mg' },
      { t: 72, narration_th: 'แก้ K+ แล้ว rhythm กลับมา มี pulse — ROSC', scene: { rhythm: 'nsr', hr: 84, bp: '100/64', spo2: 95, etco2: 34, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: { perfect: 4, good: 8, late: 14 }, points: 150, missFeedback_th: 'ลืมบันทึก ROSC' },
    ],
  },
  {
    id: 'case_pea_01', category: 'cardiac_arrest', difficulty: 'intermediate', source: 'builtin',
    title_th: 'VF → PEA — ชาย 62 ปี', intro_th: 'ชาย 62 ปี โรคหัวใจ arrest เป็น VF แล้วเปลี่ยนเป็น PEA',
    wrongPressPenalty: 20,
    initialScene: { rhythm: 'vf', hr: 0, bp: '0/0', spo2: 0, etco2: 15, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      { t: 5, narration_th: 'Check rhythm: VF', scene: { rhythm: 'vf' }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } }, window: W_FAST, points: 100, missFeedback_th: 'ช้า', wrongDataFeedback_th: 'VF' },
      { t: 13, narration_th: 'Shock', scene: { rhythm: 'vf', defibCharged: true }, expect: { buttonId: 'shock', data: { energy: 120 } }, window: W_FAST, points: 120, missFeedback_th: 'ลืม shock', wrongDataFeedback_th: 'Shock แรก 120J' },
      { t: 24, narration_th: 'CPR 2 นาที — เปลี่ยนเป็น PEA', scene: { rhythm: 'pea', hr: 40, compressorActive: false }, expect: { buttonId: 'check_rhythm', data: { rhythm: 'pea' } }, window: W_FAST, points: 130, missFeedback_th: 'ลืมจังหวะที่เปลี่ยน', wrongDataFeedback_th: 'เป็น PEA (organized ไม่มี pulse)' },
      { t: 34, narration_th: 'PEA → Epi ทันที (ห้าม shock)', scene: { rhythm: 'pea', compressorActive: true, ivAccess: true }, expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } }, window: W_STD, points: 110, missFeedback_th: 'PEA ต้อง Epi ทันที', wrongDataFeedback_th: 'Epinephrine 1mg (ห้าม shock)' },
      { t: 48, narration_th: 'หา H&T (MI → thrombosis)', scene: { rhythm: 'pea', compressorActive: true }, expect: { buttonId: 'ht' }, window: { perfect: 3, good: 7, late: 12 }, points: 90, missFeedback_th: 'ลืมบันทึกการหา H&T' },
      { t: 62, narration_th: 'มี pulse — ROSC', scene: { rhythm: 'nsr', hr: 92, bp: '105/68', spo2: 95, etco2: 38, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: W_STD, points: 150, missFeedback_th: 'ลืม ROSC' },
    ],
  },

  // ---------------- BRADYCARDIA ----------------
  {
    id: 'case_brady_01', category: 'bradycardia', difficulty: 'basic', source: 'builtin',
    title_th: 'Symptomatic Bradycardia — ชาย 68 ปี', intro_th: 'ชาย 68 ปี กิน Atenolol หน้ามืด BP 80/50 HR 38 ซึมลง',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'brady', hr: 38, bp: '80/50', spo2: 95, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'HR 38 + BP ตก + ซึม — ประเมิน', scene: {}, expect: { buttonId: 'assess' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมิน stable/unstable' },
      { t: 15, narration_th: 'Symptomatic → ให้ยาตัวแรก', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'atropine_1mg' } }, window: W_STD, points: 120, missFeedback_th: 'ลืมบันทึกยา', wrongDataFeedback_th: 'Sinus brady → Atropine 1mg (ไม่ใช่ยาอื่น)' },
      { t: 28, narration_th: 'Atropine ไม่ตอบสนอง HR ยัง 40', scene: { hr: 40 }, expect: { buttonId: 'pacing' }, window: W_STD, points: 120, missFeedback_th: 'ไม่ตอบ Atropine → ต้อง pacing' },
      { t: 42, narration_th: 'Pacing ได้ HR 70 BP ดีขึ้น — บันทึกและหาสาเหตุ', scene: { rhythm: 'nsr', hr: 70, bp: '108/66' }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 110, missFeedback_th: 'ลืมบันทึก monitor/หาสาเหตุ' },
    ],
  },

  // ---------------- TACHYCARDIA ----------------
  {
    id: 'case_svt_01', category: 'tachycardia', difficulty: 'basic', source: 'builtin',
    title_th: 'SVT (stable) — หญิง 28 ปี', intro_th: 'หญิง 28 ปี ใจสั่น HR 188 BP 110/70 รู้สึกตัวดี',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'svt', hr: 188, bp: '110/70', spo2: 99, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'HR 188 แต่ยัง stable — ประเมิน', scene: {}, expect: { buttonId: 'assess' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมิน stable/unstable' },
      { t: 15, narration_th: 'SVT stable → ทำอะไรก่อน?', scene: {}, expect: { buttonId: 'vagal' }, window: W_STD, points: 110, missFeedback_th: 'SVT stable ทำ Vagal ก่อน' },
      { t: 27, narration_th: 'Vagal ไม่ได้ผล → ให้ยา', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'adenosine_6mg' } }, window: W_STD, points: 120, missFeedback_th: 'ลืมบันทึกยา', wrongDataFeedback_th: 'SVT → Adenosine 6mg ก่อน (ไม่ใช่ 12mg/ยาอื่น)' },
      { t: 40, narration_th: '6mg ไม่ได้ผล → dose ถัดไป', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'adenosine_12mg' } }, window: W_STD, points: 110, missFeedback_th: 'ลืม dose ถัดไป', wrongDataFeedback_th: 'ถัดไปคือ Adenosine 12mg' },
      { t: 53, narration_th: 'Converted เป็น NSR HR 82 — บันทึก', scene: { rhythm: 'nsr', hr: 82, bp: '120/75' }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 110, missFeedback_th: 'ลืมบันทึก monitor + 12-Lead' },
    ],
  },
  {
    id: 'case_vt_unstable_01', category: 'tachycardia', difficulty: 'intermediate', source: 'builtin',
    title_th: 'Unstable VT — ชาย 60 ปี', intro_th: 'ชาย 60 ปี VT HR 180 BP 78/40 ซึม เจ็บอก — unstable',
    wrongPressPenalty: 18,
    initialScene: { rhythm: 'vt', hr: 180, bp: '78/40', spo2: 92, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'HR 180 + BP ตก + ซึม — ประเมิน', scene: {}, expect: { buttonId: 'assess' }, window: W_FAST, points: 100, missFeedback_th: 'ลืมประเมิน (นี่คือ unstable)' },
      { t: 14, narration_th: 'Unstable VT → ทำอะไร?', scene: { defibCharged: true }, expect: { buttonId: 'cardiovert', data: { energy: 100 } }, window: W_FAST, points: 140, missFeedback_th: 'Unstable → Synchronized cardioversion ทันที', wrongDataFeedback_th: 'VT cardioversion เริ่ม ~100J (ไม่ใช่ vagal/adenosine)' },
      { t: 26, narration_th: 'Converted เป็น NSR — บันทึก + หาสาเหตุ', scene: { rhythm: 'nsr', hr: 88, bp: '110/70', defibCharged: false }, expect: { buttonId: 'monitor' }, window: W_STD, points: 110, missFeedback_th: 'ลืมบันทึก monitor' },
    ],
  },

  // ---------------- MI / ACS ----------------
  {
    id: 'case_stemi_01', category: 'mi', difficulty: 'basic', source: 'builtin',
    title_th: 'STEMI — ชาย 60 ปี', intro_th: 'ชาย 60 ปี เจ็บแน่นหน้าอก 30 นาที ร้าวไปคาง เหงื่อแตก',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'nsr', hr: 78, bp: '135/85', spo2: 97, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'เจ็บอก + risk — ประเมิน ACS', scene: {}, expect: { buttonId: 'assess' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมิน ACS' },
      { t: 14, narration_th: 'ให้ยาชุดแรก', scene: {}, expect: { buttonId: 'mona' }, window: W_STD, points: 110, missFeedback_th: 'ลืม ASA + NTG' },
      { t: 25, narration_th: 'ทำอะไรเพื่อวินิจฉัยภายใน 10 นาที?', scene: {}, expect: { buttonId: 'twelve_lead' }, window: W_STD, points: 120, missFeedback_th: 'ลืม 12-Lead ECG (ต้องได้ใน 10 นาที)' },
      { t: 37, narration_th: 'ST elevation → Inferior STEMI!', scene: { rhythm: 'stemi' }, expect: { buttonId: 'cath' }, window: W_STD, points: 130, missFeedback_th: 'STEMI → ต้อง activate Cath lab' },
      { t: 50, narration_th: 'ส่ง Cath lab — บันทึก monitor', scene: {}, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึก monitor' },
    ],
  },

  // ---------------- STROKE ----------------
  {
    id: 'case_stroke_01', category: 'stroke', difficulty: 'basic', source: 'builtin',
    title_th: 'Acute Ischemic Stroke — ชาย 65 ปี', intro_th: 'ชาย 65 ปี AF พูดไม่ชัด แขนขวาอ่อนแรง 1 ชม.ก่อน',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'af', hr: 88, bp: '175/95', spo2: 97, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'สงสัย stroke — ประเมินอะไรก่อน?', scene: {}, expect: { buttonId: 'fast' }, window: W_STD, points: 100, missFeedback_th: 'ลืม FAST assessment' },
      { t: 15, narration_th: 'FAST +ve — ต้อง exclude อะไร?', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'dtx' } }, window: W_STD, points: 100, missFeedback_th: 'ลืมตรวจ DTX', wrongDataFeedback_th: 'ต้องตรวจ DTX exclude hypoglycemia ก่อน' },
      { t: 26, narration_th: 'DTX ปกติ → ทำอะไรต่อ?', scene: {}, expect: { buttonId: 'ct_brain' }, window: W_STD, points: 120, missFeedback_th: 'ลืม CT Brain' },
      { t: 38, narration_th: 'CT ไม่มีเลือดออก + within window', scene: {}, expect: { buttonId: 'tpa' }, window: W_STD, points: 130, missFeedback_th: 'ลืมให้ tPA (within window, no contraindication)' },
      { t: 50, narration_th: 'tPA ให้แล้ว — monitor BP + neuro q15min', scene: {}, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึก monitor' },
    ],
  },

  // ---------------- SPECIAL ----------------
  {
    id: 'case_anaphylaxis_01', category: 'special', difficulty: 'basic', source: 'builtin',
    title_th: 'Anaphylaxis — หญิง 30 ปี', intro_th: 'หญิง 30 ปี หลังฉีดยา หน้าบวม หายใจเสียงวี้ด BP 85/50',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'svt', hr: 120, bp: '85/50', spo2: 90, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'หน้าบวม + wheeze + BP ตก — ประเมิน', scene: {}, expect: { buttonId: 'assess' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมิน' },
      { t: 14, narration_th: 'Anaphylaxis → ยา first-line?', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'adrenaline_im' } }, window: W_STD, points: 130, missFeedback_th: 'ลืม Adrenaline IM', wrongDataFeedback_th: 'first-line = Adrenaline IM 0.5mg (ไม่ใช่ยาอื่น)' },
      { t: 26, narration_th: 'ให้ O₂ + จัดการ airway', scene: { airwayActive: true }, expect: { buttonId: 'airway' }, window: W_STD, points: 100, missFeedback_th: 'ลืมบันทึก airway/O₂' },
      { t: 38, narration_th: 'ดีขึ้น — monitor', scene: { rhythm: 'nsr', hr: 96, bp: '110/70', spo2: 97 }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึก monitor' },
    ],
  },
  {
    id: 'case_opioid_01', category: 'special', difficulty: 'basic', source: 'builtin',
    title_th: 'Opioid Overdose — ชาย 25 ปี', intro_th: 'ชาย 25 ปี ซึมมาก RR 6 pinpoint pupils พบ syringe',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'brady', hr: 52, bp: '100/60', spo2: 84, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'RR 6 + pinpoint + SpO₂ 84 — จัดการ airway/O₂', scene: { airwayActive: true }, expect: { buttonId: 'airway' }, window: W_STD, points: 100, missFeedback_th: 'ลืมบันทึก airway/O₂ ก่อน' },
      { t: 15, narration_th: 'สงสัย opioid → ยา antidote?', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'naloxone' } }, window: W_STD, points: 130, missFeedback_th: 'ลืม Naloxone', wrongDataFeedback_th: 'opioid OD → Naloxone (ไม่ใช่ยาอื่น)' },
      { t: 27, narration_th: 'ตื่นขึ้น RR ดีขึ้น — monitor', scene: { spo2: 96, consciousness: 'awake' }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึก monitor' },
    ],
  },
  {
    id: 'case_hyperk_01', category: 'special', difficulty: 'intermediate', source: 'builtin',
    title_th: 'Hyperkalemia — ชาย 58 ปี CKD', intro_th: 'ชาย 58 ปี CKD ขาด HD EKG peaked T, K+ 7.2',
    wrongPressPenalty: 18,
    initialScene: { rhythm: 'brady', hr: 45, bp: '110/70', spo2: 96, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'K+ 7.2 + EKG เปลี่ยน — ยา stabilize หัวใจตัวแรก?', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'calcium_gluconate' } }, window: W_STD, points: 130, missFeedback_th: 'ลืม Calcium', wrongDataFeedback_th: 'ตัวแรก = Calcium gluconate (stabilize membrane)' },
      { t: 16, narration_th: 'ต่อด้วยยา shift K+ เข้าเซลล์', scene: {}, expect: { buttonId: 'drug_choice', data: { choice: 'insulin_glucose' } }, window: W_STD, points: 120, missFeedback_th: 'ลืม shift K+', wrongDataFeedback_th: 'shift K+ = Insulin + Glucose (± Salbutamol)' },
      { t: 28, narration_th: 'บันทึกและวางแผน HD ด่วน', scene: { rhythm: 'nsr', hr: 72 }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 13 }, points: 100, missFeedback_th: 'ลืมบันทึก monitor/หาสาเหตุ' },
    ],
  },
];

// ==========================================
// CASE PACKS — 1 ชุด = หลายเคสต่อกัน (cumulative score)
// ==========================================
export const CASE_PACKS = [
  { id: 'pack_arrest', title_th: 'ชุดหัวใจหยุดเต้น', subtitle_th: 'VF · Asystole · PEA', color: 'text-danger',
    caseIds: ['case_vf_01', 'case_asystole_01', 'case_pea_01'] },
  { id: 'pack_periarrest', title_th: 'ชุด Peri-arrest', subtitle_th: 'Brady · SVT · VT', color: 'text-shock',
    caseIds: ['case_brady_01', 'case_svt_01', 'case_vt_unstable_01'] },
  { id: 'pack_nonarrest', title_th: 'ชุดเคสฉุกเฉินอื่น', subtitle_th: 'STEMI · Stroke · Anaphylaxis', color: 'text-purple',
    caseIds: ['case_stemi_01', 'case_stroke_01', 'case_anaphylaxis_01'] },
];

export function getPackById(id) {
  return CASE_PACKS.find(p => p.id === id);
}

// ---- เทมเพลตเปล่าสำหรับ editor (admin) ----
export function blankEvent(t = 6) {
  return {
    t, narration_th: '', scene: {},
    expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } },
    window: { perfect: 3, good: 6, late: 11 }, points: 100,
    missFeedback_th: '', wrongDataFeedback_th: '',
  };
}

export function blankCase() {
  return {
    id: null, status: 'draft', source: 'manual',
    titleTh: '', category: 'cardiac_arrest', difficulty: 'basic',
    payload: {
      title_th: '', category: 'cardiac_arrest', difficulty: 'basic', intro_th: '',
      wrongPressPenalty: 15,
      initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, etco2: 12, consciousness: 'unresponsive' },
      events: [blankEvent(6)],
    },
    warnings: [],
  };
}

// ==========================================
// Helpers
// ==========================================
export function getCaseById(id) {
  return CASES.find(c => c.id === id);
}

export function getCasesByCategory(category) {
  if (!category || category === 'all') return CASES;
  return CASES.filter(c => c.category === category);
}

// สุ่มเคส (หลีกเลี่ยง id ที่เพิ่งเล่น) — index-based เพื่อไม่ใช้ Math.random ตรงๆ ที่ห้ามในบางที่
export function pickRandomCase(pool, seed, excludeId) {
  const list = excludeId ? pool.filter(c => c.id !== excludeId) : pool;
  const arr = list.length ? list : pool;
  if (!arr.length) return null;
  const idx = Math.abs(Math.floor(seed)) % arr.length;
  return arr[idx];
}

// แปลง Case → รูปที่ useLiveLevelEngine กิน (level-like)
export function caseToLevel(c) {
  if (!c) return null;
  const lastT = c.events.length ? c.events[c.events.length - 1].t : 0;
  return {
    id: c.id,
    type: 'live',
    title_th: c.title_th,
    intro_th: c.intro_th,
    category: c.category,
    initialScene: c.initialScene,
    events: c.events,
    wrongPressPenalty: c.wrongPressPenalty || 15,
    durationSec: lastT + 14,
  };
}
