// ACLS Training Scenarios — Thai language
// Levels: basic (1 scenario), intermediate (1-2 changes), megacode (complex + cause correction)

export const scenarios = [
  // =============== BASIC ===============
  {
    id: 'basic_vf_01',
    title: 'VF — Basic',
    title_th: 'VF — พื้นฐาน',
    level: 'basic',
    category: 'cardiac_arrest',
    description_th: 'ชาย 55 ปี หมดสติขณะออกกำลังกาย',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 55 ปี หมดสติขณะออกกำลังกายที่สวนสาธารณะ พบนอนหงายไม่เคลื่อนไหว',
        vitals: { hr: 0, bp: '0/0', spo2: 0 },
        correctActions: ['scene_safety'],
        hint_th: 'ตรวจสอบความปลอดภัยของที่เกิดเหตุก่อนเสมอ',
      },
      {
        trigger: 'after_scene_safety',
        scenario_th: 'เข้าถึงผู้ป่วยแล้ว',
        correctActions: ['check_response'],
        hint_th: 'ตบไหล่ + ตะโกนเรียก "คุณเป็นอะไรไหม"',
      },
      {
        trigger: 'after_check_response',
        scenario_th: 'ไม่ตอบสนอง ไม่หายใจ',
        correctActions: ['call_for_help'],
        hint_th: 'เรียกคนช่วย + โทร 1669 + ขอ AED',
      },
      {
        trigger: 'after_call_help',
        scenario_th: 'ไม่มีชีพจร (carotid pulse ≤10 วินาที)',
        correctActions: ['start_cpr'],
        hint_th: 'เริ่ม CPR ทันที — กดลึก 5-6 cm, 100-120/min',
      },
      {
        trigger: 'after_cpr_start',
        scenario_th: 'ติด monitor แล้ว — EKG แสดง:',
        ekg: 'vf',
        correctActions: ['defib_200j'],
        wrongActions: { 'epi': 'VF = Shockable → Defib ก่อน!', 'amiodarone': 'Shock ก่อน, Amio หลัง shock ครั้งที่ 3' },
        hint_th: 'VF เป็น shockable rhythm → Defibrillation 200J ทันที',
      },
      {
        trigger: 'after_shock',
        scenario_th: 'Shock แล้ว — กด CPR ต่อทันที 2 นาที',
        correctActions: ['resume_cpr'],
        hint_th: 'กด CPR ทันทีหลัง shock ไม่ต้องรอ check rhythm',
      },
      {
        trigger: 'after_2min',
        scenario_th: 'ครบ 2 นาที — check rhythm: ยังเป็น VF\nEtCO₂ พุ่งขึ้น 42 mmHg! ผู้ป่วยขยับแขน',
        correctActions: ['check_pulse'],
        hint_th: 'EtCO₂ >40 + ผู้ป่วยขยับ = สงสัย ROSC → check pulse ทันที',
      },
      {
        trigger: 'after_pulse_check',
        scenario_th: 'คลำได้ชีพจร! ROSC!',
        correctActions: ['rosc'],
        hint_th: 'เริ่ม Post-ROSC care ทันที',
      },
    ],
  },

  {
    id: 'basic_asystole_01',
    title: 'Asystole — Basic',
    title_th: 'Asystole — พื้นฐาน',
    level: 'basic',
    category: 'cardiac_arrest',
    description_th: 'หญิง 72 ปี พบนอนนิ่งบนเตียงใน ward',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'หญิง 72 ปี โรคประจำตัว DM, HT, CKD stage 4\nเจ้าหน้าที่พบนอนนิ่งบนเตียง ไม่หายใจ',
        correctActions: ['scene_safety'],
        hint_th: 'Scene safety — ตรวจสอบสิ่งแวดล้อม',
      },
      {
        trigger: 'after_scene_safety',
        scenario_th: 'เรียกไม่ตอบ ไม่หายใจ คลำชีพจรไม่ได้',
        correctActions: ['start_cpr'],
        hint_th: 'ไม่มีชีพจร → เริ่ม CPR ทันที',
      },
      {
        trigger: 'after_cpr_start',
        scenario_th: 'ติด monitor — EKG แสดง Asystole (flat line)\nตรวจสอบ leads แล้ว — ยืนยัน Asystole',
        ekg: 'asystole',
        correctActions: ['epi_1mg'],
        wrongActions: { 'defib': 'Asystole = Non-shockable → ห้าม Defib!', 'amiodarone': 'Amiodarone ใช้เฉพาะ VF/pVT' },
        hint_th: 'Asystole = Non-shockable → Epi 1mg IV ทันที (ไม่ shock)',
      },
      {
        trigger: 'after_epi',
        scenario_th: 'ให้ Epi แล้ว — CPR ต่อ 2 นาที\nCheck rhythm: ยังเป็น Asystole\nต้องหาสาเหตุ — CKD stage 4 → K+ อาจสูง',
        correctActions: ['find_cause', 'epi_repeat'],
        hint_th: 'CKD → นึกถึง Hyperkalemia → ตรวจ K+ + ให้ Ca Gluconate',
      },
      {
        trigger: 'after_cause_found',
        scenario_th: 'K+ = 7.2 mEq/L → Hyperkalemia!\nให้ Ca Gluconate + NaHCO₃ + Glucose+RI แล้ว\nCheck rhythm: มี organized rhythm → check pulse',
        correctActions: ['check_pulse'],
        hint_th: 'แก้สาเหตุแล้ว rhythm เปลี่ยน → check pulse',
      },
      {
        trigger: 'after_pulse_check',
        scenario_th: 'คลำได้ชีพจร! ROSC!',
        correctActions: ['rosc'],
        hint_th: 'เริ่ม Post-ROSC care',
      },
    ],
  },

  {
    id: 'basic_svt_01',
    title: 'SVT — Basic',
    title_th: 'SVT — พื้นฐาน',
    level: 'basic',
    category: 'tachycardia',
    description_th: 'หญิง 28 ปี ใจสั่น หน้ามืด',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'หญิง 28 ปี ไม่มีโรคประจำตัว\nมาด้วยอาการใจสั่น หน้ามืด 30 นาที\nBP 110/70 HR 188 SpO₂ 99% รู้สึกตัวดี',
        vitals: { hr: 188, bp: '110/70', spo2: 99 },
        ekg: 'svt',
        correctActions: ['assess_stable'],
        hint_th: 'HR >150 + ยังรู้สึกตัวดี BP ปกติ → Stable Tachycardia',
      },
      {
        trigger: 'after_assess',
        scenario_th: 'Stable — Narrow Regular Tachycardia (SVT)\nเริ่มรักษาตาม guideline',
        correctActions: ['vagal_maneuver'],
        hint_th: 'SVT stable → Vagal maneuver ก่อน (Modified Valsalva)',
      },
      {
        trigger: 'after_vagal',
        scenario_th: 'Vagal maneuver ไม่ได้ผล — ยังเป็น SVT HR 185',
        correctActions: ['adenosine_6mg'],
        hint_th: 'Vagal ไม่ได้ผล → Adenosine 6mg rapid IV push + flush 20ml (3-way)',
      },
      {
        trigger: 'after_adenosine',
        scenario_th: 'Adenosine 6mg — มี brief pause แต่กลับเป็น SVT อีก',
        correctActions: ['adenosine_12mg'],
        hint_th: 'Adenosine 6mg ไม่ได้ผล → Adenosine 12mg (same technique)',
      },
      {
        trigger: 'after_adenosine_12',
        scenario_th: 'Adenosine 12mg — converted! NSR HR 82\nBP 120/75 SpO₂ 99% รู้สึกตัวดี',
        correctActions: ['monitor'],
        hint_th: 'SVT converted → Monitor + 12-Lead ECG + หาสาเหตุ',
      },
    ],
  },

  {
    id: 'basic_brady_01',
    title: 'Bradycardia — Basic',
    title_th: 'Bradycardia — พื้นฐาน',
    level: 'basic',
    category: 'bradycardia',
    description_th: 'ชาย 68 ปี หน้ามืด เป็นลม',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 68 ปี โรคประจำตัว HT กิน Atenolol\nมาด้วย หน้ามืด เกือบเป็นลม 1 ชั่วโมง\nBP 80/50 HR 38 SpO₂ 95% ซึมลง',
        vitals: { hr: 38, bp: '80/50', spo2: 95 },
        correctActions: ['assess_symptomatic'],
        hint_th: 'HR <50 + BP ตก + ซึม = Symptomatic Bradycardia → รักษาทันที',
      },
      {
        trigger: 'after_assess',
        scenario_th: 'Symptomatic Bradycardia — EKG: Sinus Bradycardia\nเริ่มรักษา',
        correctActions: ['atropine_1mg'],
        hint_th: 'Sinus Brady → Atropine 1mg IV push เร็ว <1 นาที → flush 20ml',
      },
      {
        trigger: 'after_atropine',
        scenario_th: 'Atropine 1mg — HR เพิ่มเป็น 62 BP 105/65\nผู้ป่วยรู้สึกตัวดีขึ้น',
        correctActions: ['monitor'],
        hint_th: 'ตอบสนองดี → Monitor + หาสาเหตุ (Beta-blocker overdose?)',
      },
    ],
  },

  // =============== INTERMEDIATE ===============
  {
    id: 'inter_vf_pea_01',
    title: 'VF → PEA',
    title_th: 'VF เปลี่ยนเป็น PEA',
    level: 'intermediate',
    category: 'cardiac_arrest',
    description_th: 'ชาย 62 ปี Cardiac arrest ที่ ER',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 62 ปี โรคหัวใจ มาด้วยเจ็บหน้าอก\nกำลังทำ ECG อยู่ หมดสติทันที monitor แสดง VF',
        ekg: 'vf',
        correctActions: ['start_cpr', 'defib_200j'],
        hint_th: 'Witnessed VF → CPR + Defib ทันที',
      },
      {
        trigger: 'after_shock',
        scenario_th: 'Shock 200J + CPR 2 นาที\nCheck rhythm: เปลี่ยนเป็น PEA (organized rhythm แต่ไม่มี pulse)',
        ekg: 'pea',
        correctActions: ['epi_1mg', 'resume_cpr'],
        wrongActions: { 'defib': 'PEA = Non-shockable → ห้าม Defib!' },
        hint_th: 'PEA = Non-shockable → Epi ทันที + CPR ต่อ + หาสาเหตุ H&T',
      },
      {
        trigger: 'after_epi',
        scenario_th: 'Epi 1mg + CPR 2 นาที\nCheck rhythm: ยังเป็น PEA\nผู้ป่วยมีประวัติ MI → สงสัย Thrombosis (cardiac)',
        correctActions: ['find_cause', 'epi_repeat'],
        hint_th: 'PEA ไม่ตอบ → หา H&T → MI = Thrombosis cardiac',
      },
      {
        trigger: 'after_cause',
        scenario_th: 'ให้ Heparin + Epi ซ้ำ + CPR ต่อ\nCheck rhythm: มี pulse กลับมา! ROSC!',
        correctActions: ['rosc'],
        hint_th: 'ROSC → Post-ROSC care + 12-Lead ECG → STEMI? → Cath lab',
      },
    ],
  },

  // =============== MEGACODE ===============
  {
    id: 'mega_multi_01',
    title: 'Megacode — VF + Hyperkalemia',
    title_th: 'Megacode — VF + Hyperkalemia',
    level: 'megacode',
    category: 'cardiac_arrest',
    description_th: 'ชาย 58 ปี CKD หมดสติที่บ้าน',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 58 ปี CKD stage 5 on HD (ขาด HD 1 สัปดาห์)\nภรรยาพบนอนหมดสติที่พื้นบ้าน ไม่หายใจ',
        correctActions: ['scene_safety'],
        hint_th: 'Scene safety ก่อนเสมอ',
      },
      {
        trigger: 'after_safety',
        scenario_th: 'ไม่ตอบสนอง ไม่หายใจ ไม่มี pulse',
        correctActions: ['call_help', 'start_cpr'],
        hint_th: 'Call for help + Start CPR',
      },
      {
        trigger: 'after_cpr',
        scenario_th: 'Monitor: VF',
        ekg: 'vf',
        correctActions: ['defib_200j'],
        hint_th: 'VF → Defibrillation 200J',
      },
      {
        trigger: 'after_shock1',
        scenario_th: 'Shock + CPR 2 min → ยังเป็น VF\nShock ครั้งที่ 2 → CPR + Epi 1mg',
        correctActions: ['defib', 'epi_1mg'],
        hint_th: 'VF ยังอยู่ → Shock ซ้ำ + Epi หลัง shock ครั้งที่ 2',
      },
      {
        trigger: 'after_shock2',
        scenario_th: 'Shock ครั้งที่ 3 + Amiodarone 300mg → CPR 2 min\nยังเป็น VF (refractory)\nCKD ขาด HD 1 สัปดาห์ → สงสัย Hyperkalemia',
        correctActions: ['defib', 'amiodarone', 'find_cause_hyperk'],
        hint_th: 'Refractory VF + CKD → คิดถึง Hyperkalemia → Ca Gluconate + NaHCO₃',
      },
      {
        trigger: 'after_cause_correction',
        scenario_th: 'ให้ Ca Gluconate 10% 20ml + NaHCO₃ + Glucose+RI\nShock อีกครั้ง → rhythm เปลี่ยนเป็น sinus\nCheck pulse → มี pulse! ROSC!',
        correctActions: ['rosc'],
        hint_th: 'แก้ Hyperkalemia + Defib → ROSC! เริ่ม Post-ROSC care',
      },
      {
        trigger: 'after_rosc',
        scenario_th: 'ROSC แล้ว\nBP 85/55 HR 110 SpO₂ 94%\nไม่รู้สึกตัว GCS 3\nPost-ROSC care: ต้องทำอะไรบ้าง?',
        correctActions: ['post_rosc_checklist'],
        hint_th: 'Post-ROSC: Airway + O₂ 92-98% + MAP≥65 + 12-Lead ECG + TTM + Labs',
      },
    ],
  },

  {
    id: 'mega_stemi_arrest_01',
    title: 'Megacode — STEMI → VF → ROSC',
    title_th: 'Megacode — STEMI กลายเป็น VF',
    level: 'megacode',
    category: 'mi',
    description_th: 'ชาย 50 ปี เจ็บหน้าอก กลายเป็น cardiac arrest',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 50 ปี สูบบุหรี่ DM HT\nมาด้วยเจ็บแน่นหน้าอกรุนแรง 1 ชั่วโมง ร้าวไปแขนซ้าย เหงื่อออก\nBP 100/65 HR 95 SpO₂ 96%',
        vitals: { hr: 95, bp: '100/65', spo2: 96 },
        correctActions: ['assess_acs'],
        hint_th: 'Chest pain + risk factors → คิดถึง ACS → MONA + 12-Lead ECG',
      },
      {
        trigger: 'after_acs',
        scenario_th: 'ให้ Aspirin 325mg + NTG SL + IV access\n12-Lead ECG: ST elevation V1-V4 → Anterior STEMI!',
        ekg: 'stemi',
        correctActions: ['activate_cath', 'heparin', 'antiplatelet'],
        hint_th: 'STEMI → Activate Cath lab + Heparin + Antiplatelet loading',
      },
      {
        trigger: 'after_stemi_tx',
        scenario_th: 'กำลังรอ Cath lab...\nทันใดนั้นผู้ป่วยหมดสติ! Monitor: VF!',
        ekg: 'vf',
        correctActions: ['start_cpr', 'defib_200j'],
        hint_th: 'STEMI → VF arrest! → CPR + Defib ทันที',
      },
      {
        trigger: 'after_defib',
        scenario_th: 'Shock 200J + CPR 2 min + Epi 1mg\nCheck rhythm: Sinus → Check pulse → มี pulse! ROSC!',
        correctActions: ['rosc', 'continue_stemi'],
        hint_th: 'ROSC → ต้องทำ Post-ROSC + ส่ง Cath lab ต่อ (STEMI ยังอยู่)',
      },
    ],
  },

  {
    id: 'basic_stroke_01',
    title: 'Stroke — Basic',
    title_th: 'Stroke — พื้นฐาน',
    level: 'basic',
    category: 'stroke',
    description_th: 'ชาย 65 ปี แขนขาอ่อนแรงซีกขวา พูดไม่ชัด',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 65 ปี AF ไม่ได้กินยา anticoagulant\nเมียพบพูดไม่ชัด แขนขวาอ่อนแรง เมื่อ 1 ชั่วโมงก่อน\nBP 175/95 HR 88 (irregular) SpO₂ 97%',
        vitals: { hr: 88, bp: '175/95', spo2: 97 },
        correctActions: ['fast_assessment'],
        hint_th: 'FAST: Face droop? Arm drift? Speech? Time of onset?',
      },
      {
        trigger: 'after_fast',
        scenario_th: 'FAST: หน้าเบี้ยวขวา + แขนขวาตก + พูดไม่ชัด\nOnset 1 ชั่วโมงก่อน (within 3hr window)\nDTX 135 mg/dL (ไม่ใช่ hypoglycemia)',
        correctActions: ['nihss', 'ct_brain'],
        hint_th: 'DTX ปกติ (ไม่ใช่ hypoglycemia) → NIHSS + CT Brain',
      },
      {
        trigger: 'after_ct',
        scenario_th: 'NIHSS = 12 (Moderate)\nCT Brain: ไม่มี hemorrhage → Ischemic stroke\nOnset <3hr → tPA eligible',
        correctActions: ['tpa_criteria', 'give_tpa'],
        hint_th: 'Ischemic + within window + no contraindication → tPA (Alteplase 0.9mg/kg)',
      },
      {
        trigger: 'after_tpa',
        scenario_th: 'tPA given (10% bolus + 90% drip 60 min)\nD2N = 45 min (target <60)\nMonitor BP q15min',
        correctActions: ['monitor'],
        hint_th: 'tPA ให้แล้ว → Monitor BP + Neuro check ทุก 15 นาที',
      },
    ],
  },

  {
    id: 'basic_mi_01',
    title: 'STEMI — Basic',
    title_th: 'STEMI — พื้นฐาน',
    level: 'basic',
    category: 'mi',
    description_th: 'ชาย 60 ปี เจ็บแน่นหน้าอกรุนแรง',
    steps: [
      {
        trigger: 'initial',
        scenario_th: 'ชาย 60 ปี DM HT สูบบุหรี่ 30 ปี\nเจ็บแน่นหน้าอกรุนแรง 30 นาที ร้าวไปคาง เหงื่อแตก คลื่นไส้\nBP 135/85 HR 78 SpO₂ 97%',
        vitals: { hr: 78, bp: '135/85', spo2: 97 },
        correctActions: ['mona_protocol'],
        hint_th: 'ACS → MONA: Aspirin 325mg เคี้ยว + NTG SL + 12-Lead ECG ใน 10 นาที',
      },
      {
        trigger: 'after_mona',
        scenario_th: 'Aspirin 325mg เคี้ยวแล้ว + NTG 0.4mg SL\n12-Lead ECG: ST elevation II, III, aVF → Inferior STEMI!',
        ekg: 'stemi',
        correctActions: ['activate_cath', 'antiplatelet', 'heparin'],
        hint_th: 'Inferior STEMI → Activate Cath lab (D2B <90min) + Antiplatelet + Heparin',
      },
      {
        trigger: 'after_treatment',
        scenario_th: 'Clopidogrel 600mg + Heparin bolus+drip\nD2B timer started\nผู้ป่วย stable → ส่ง Cath lab',
        correctActions: ['monitor'],
        hint_th: 'STEMI managed → Monitor + ส่ง Cath lab',
      },
    ],
  },
];

// Get scenarios by level
export function getScenariosByLevel(level) {
  return scenarios.filter(s => s.level === level);
}

// Get scenarios by category
export function getScenariosByCategory(category) {
  return scenarios.filter(s => s.category === category);
}

// Get scenario by id
export function getScenarioById(id) {
  return scenarios.find(s => s.id === id);
}
