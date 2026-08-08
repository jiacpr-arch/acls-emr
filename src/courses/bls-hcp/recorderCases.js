// ==========================================
// Recorder Hero — คลังเคส BLS (Case pool)
// โครงเดียวกับ src/data/recorderCases.js (ฝั่ง ACLS) แต่ category/ปุ่มเป็นของ BLS
// ล้วน — ไม่มีเคส cardiac_arrest ของ ACLS (ที่ใช้ GameCprDashboard เดิม) เลย
// เพื่อไม่ต้องแตะ engine: ทุกเคส BLS เดินผ่าน GameActionPad (ดู
// RecorderGamePlay.jsx: isArrest = level.category === 'cardiac_arrest' เท่านั้น)
// DATA ล้วน ไม่ import store/React
// ==========================================

// ---- หมวดเคส ----
export const CASE_CATEGORY_META = {
  bls_arrest:  { label_th: 'หัวใจหยุดเต้น (BLS)', icon: '💙', color: 'text-danger' },
  choking:     { label_th: 'สำลัก / FBAO', icon: '🫁', color: 'text-warning' },
  respiratory: { label_th: 'หยุดหายใจ', icon: '🌬️', color: 'text-info' },
};

export const CASE_CATEGORIES = Object.keys(CASE_CATEGORY_META);

// ---- ปุ่ม action pad ต่อหมวด ----
export const CATEGORY_ACTIONS = {
  bls_arrest: [
    { id: 'check_response', label_th: 'ประเมินการตอบสนอง', tone: 'ghost' },
    { id: 'call_help', label_th: 'ขอความช่วยเหลือ / โทร 1669', tone: 'info' },
    { id: 'check_pulse', label_th: 'คลำชีพจร (≤10 วิ)', tone: 'ghost' },
    { id: 'start_cpr', label_th: 'เริ่ม CPR', tone: 'danger' },
    { id: 'switch_comp', label_th: 'สลับคนกดหน้าอก', tone: 'ghost' },
    { id: 'aed_attach', label_th: 'ติดแผ่น AED', tone: 'info' },
    { id: 'aed_analyze', label_th: 'AED วิเคราะห์จังหวะ', tone: 'purple', needsData: 'choice', options: [
      { id: 'shock_advised', label: 'Shock Advised', detail: 'จังหวะ shockable' },
      { id: 'no_shock_advised', label: 'No Shock Advised', detail: 'จังหวะไม่ shockable' },
    ] },
    { id: 'aed_shock', label_th: 'กด SHOCK', tone: 'shock' },
    { id: 'resume_cpr', label_th: 'กลับไป CPR ต่อทันที', tone: 'danger' },
    { id: 'rosc', label_th: 'ROSC', tone: 'success' },
  ],
  choking: [
    { id: 'assess', label_th: 'ประเมินความรุนแรง', tone: 'ghost', needsData: 'choice', options: [
      { id: 'mild', label: 'Mild (ไอได้/หายใจได้)', detail: 'กระตุ้นให้ไอต่อ อย่าตี/ดันท้อง' },
      { id: 'severe', label: 'Severe (ไอไม่ออก/พูดไม่ได้)', detail: 'ต้องช่วยทันที' },
    ] },
    { id: 'back_blows', label_th: 'ตบหลัง 5 ครั้ง', tone: 'warning' },
    { id: 'abd_thrust', label_th: 'ดันท้อง (Heimlich) 5 ครั้ง', tone: 'warning' },
    { id: 'chest_thrust', label_th: 'ดันอก 5 ครั้ง (ทารก/ท้อง/อ้วนมาก)', tone: 'warning' },
    { id: 'call_help', label_th: 'โทร 1669', tone: 'info' },
    { id: 'start_cpr', label_th: 'เริ่ม CPR (หมดสติ)', tone: 'danger' },
  ],
  respiratory: [
    { id: 'assess', label_th: 'ประเมินการหายใจ', tone: 'ghost' },
    { id: 'call_help', label_th: 'โทร 1669', tone: 'info' },
    { id: 'airway_open', label_th: 'เปิดทางเดินหายใจ (Head-tilt/Chin-lift)', tone: 'info' },
    { id: 'rescue_breath', label_th: 'ช่วยหายใจ', tone: 'purple' },
    { id: 'naloxone', label_th: 'แจ้ง/ช่วยให้ Naloxone', tone: 'purple' },
    { id: 'start_cpr', label_th: 'เริ่ม CPR (ไม่มีชีพจร)', tone: 'danger' },
    { id: 'monitor', label_th: 'Monitor + ประเมินซ้ำ', tone: 'success' },
  ],
};

// ==========================================
// CASE POOL (built-in)
// ==========================================
const W_STD = { perfect: 3, good: 6, late: 11 };

export const CASES = [
  // ---------------- BLS ARREST ----------------
  {
    id: 'rcase_bls_vf_01', category: 'bls_arrest', difficulty: 'basic', source: 'builtin',
    title_th: 'VF Arrest (AED) — ชาย 52 ปี', intro_th: 'ชาย 52 ปี ล้มหมดสติในฟิตเนส เพื่อนเริ่มโทรขอความช่วยเหลือ',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, consciousness: 'unresponsive' },
    events: [
      { t: 5, narration_th: 'ล้มหมดสติ ไม่ตอบสนอง — ประเมิน', scene: {}, expect: { buttonId: 'check_response' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมินการตอบสนอง' },
      { t: 12, narration_th: 'ไม่ตอบสนอง ไม่หายใจ — ขอความช่วยเหลือ', scene: {}, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมโทร 1669 / ขอ AED' },
      { t: 20, narration_th: 'คลำชีพจรที่คอ', scene: {}, expect: { buttonId: 'check_pulse' }, window: W_STD, points: 90, missFeedback_th: 'ลืมคลำชีพจร' },
      { t: 28, narration_th: 'ไม่มีชีพจร — เริ่ม CPR ทันที', scene: { compressorActive: true }, expect: { buttonId: 'start_cpr' }, window: W_STD, points: 100, missFeedback_th: 'ลืมเริ่ม CPR' },
      { t: 40, narration_th: 'AED มาถึง — ติดแผ่นโดยไม่หยุด CPR', scene: {}, expect: { buttonId: 'aed_attach' }, window: W_STD, points: 100, missFeedback_th: 'ลืมติดแผ่น AED' },
      { t: 48, narration_th: 'AED วิเคราะห์จังหวะ — VF', scene: { rhythm: 'vf' }, expect: { buttonId: 'aed_analyze', data: { choice: 'shock_advised' } }, window: W_STD, points: 120, missFeedback_th: 'ลืมบันทึกผลวิเคราะห์', wrongDataFeedback_th: 'จังหวะนี้คือ VF → Shock Advised' },
      { t: 56, narration_th: 'CLEAR! กด SHOCK', scene: { defibCharged: true }, expect: { buttonId: 'aed_shock' }, window: W_STD, points: 120, missFeedback_th: 'ลืมกด shock' },
      { t: 75, narration_th: 'CPR ต่อ 2 นาที — EtCO₂ พุ่งขึ้น ขยับแขน มีชีพจร', scene: { rhythm: 'nsr', hr: 90, bp: '112/70', spo2: 96, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: { perfect: 4, good: 8, late: 14 }, points: 150, missFeedback_th: 'ลืมบันทึก ROSC' },
    ],
  },
  {
    id: 'rcase_bls_noshock_01', category: 'bls_arrest', difficulty: 'basic', source: 'builtin',
    title_th: 'No-Shock Arrest — หญิง 68 ปี Ward', intro_th: 'หญิง 68 ปี พบนอนนิ่งบนเตียงใน ward หลังผ่าตัด',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, consciousness: 'unresponsive' },
    events: [
      { t: 5, narration_th: 'นอนนิ่ง ไม่ขยับ — ประเมิน', scene: {}, expect: { buttonId: 'check_response' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมินการตอบสนอง' },
      { t: 12, narration_th: 'ไม่ตอบสนอง ไม่หายใจ — กด Code Blue', scene: {}, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมกด Code Blue' },
      { t: 20, narration_th: 'คลำชีพจร', scene: {}, expect: { buttonId: 'check_pulse' }, window: W_STD, points: 90, missFeedback_th: 'ลืมคลำชีพจร' },
      { t: 28, narration_th: 'ไม่มีชีพจร — เริ่ม CPR', scene: { compressorActive: true }, expect: { buttonId: 'start_cpr' }, window: W_STD, points: 100, missFeedback_th: 'ลืมเริ่ม CPR' },
      { t: 40, narration_th: 'ทีมมาถึงพร้อม AED — ติดแผ่น', scene: {}, expect: { buttonId: 'aed_attach' }, window: W_STD, points: 100, missFeedback_th: 'ลืมติดแผ่น AED' },
      { t: 48, narration_th: 'AED วิเคราะห์ — เส้นแบน (Asystole)', scene: { rhythm: 'flat' }, expect: { buttonId: 'aed_analyze', data: { choice: 'no_shock_advised' } }, window: W_STD, points: 120, missFeedback_th: 'ลืมบันทึกผลวิเคราะห์', wrongDataFeedback_th: 'เส้นแบน = ไม่ shockable → No Shock Advised' },
      { t: 55, narration_th: 'No shock advised — กลับไป CPR ต่อทันที', scene: {}, expect: { buttonId: 'resume_cpr' }, window: W_STD, points: 100, missFeedback_th: 'ลืมกลับไป CPR ต่อ ห้ามเสียเวลา' },
      { t: 90, narration_th: 'CPR ต่อเนื่อง — เริ่มไอ ขยับตัว มีชีพจร', scene: { rhythm: 'nsr', hr: 84, bp: '100/64', spo2: 94, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: { perfect: 4, good: 8, late: 14 }, points: 150, missFeedback_th: 'ลืมบันทึก ROSC' },
    ],
  },
  {
    id: 'rcase_bls_team_switch_01', category: 'bls_arrest', difficulty: 'intermediate', source: 'builtin',
    title_th: 'Two-Rescuer VF — ชาย 47 ปี ที่ทำงาน', intro_th: 'ชาย 47 ปี ล้มหมดสติในห้อง fitness บริษัท เพื่อนร่วมงาน 2 คนช่วยกัน',
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, consciousness: 'unresponsive' },
    events: [
      { t: 5, narration_th: 'ล้มหมดสติ — ประเมิน', scene: {}, expect: { buttonId: 'check_response' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมินการตอบสนอง' },
      { t: 12, narration_th: 'ไม่ตอบสนอง ไม่หายใจ — คนที่ 2 โทร 1669 + เอา AED', scene: {}, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมแบ่งงาน โทร 1669 + เอา AED' },
      { t: 20, narration_th: 'คลำชีพจร', scene: {}, expect: { buttonId: 'check_pulse' }, window: W_STD, points: 90, missFeedback_th: 'ลืมคลำชีพจร' },
      { t: 28, narration_th: 'ไม่มีชีพจร — คนแรกเริ่มกดหน้าอก', scene: { compressorActive: true }, expect: { buttonId: 'start_cpr' }, window: W_STD, points: 100, missFeedback_th: 'ลืมเริ่ม CPR' },
      { t: 42, narration_th: 'กดมาเกือบ 2 นาทีแล้ว เริ่มล้า — สลับคนกด', scene: {}, expect: { buttonId: 'switch_comp' }, window: W_STD, points: 90, missFeedback_th: 'ลืมสลับคนกดหน้าอกเมื่อเริ่มล้า' },
      { t: 54, narration_th: 'AED มาถึง — ติดแผ่นโดยไม่หยุด CPR', scene: {}, expect: { buttonId: 'aed_attach' }, window: W_STD, points: 100, missFeedback_th: 'ลืมติดแผ่น AED' },
      { t: 62, narration_th: 'AED วิเคราะห์ — VF', scene: { rhythm: 'vf' }, expect: { buttonId: 'aed_analyze', data: { choice: 'shock_advised' } }, window: W_STD, points: 120, missFeedback_th: 'ลืมบันทึกผลวิเคราะห์', wrongDataFeedback_th: 'จังหวะนี้คือ VF → Shock Advised' },
      { t: 70, narration_th: 'CLEAR! กด SHOCK', scene: { defibCharged: true }, expect: { buttonId: 'aed_shock' }, window: W_STD, points: 120, missFeedback_th: 'ลืมกด shock' },
      { t: 82, narration_th: 'หลัง shock — สลับคนกดอีกครั้งก่อนเริ่ม CPR ต่อ', scene: {}, expect: { buttonId: 'switch_comp' }, window: W_STD, points: 90, missFeedback_th: 'ลืมสลับคนกดหน้าอกหลัง shock' },
      { t: 105, narration_th: 'CPR ต่อ — ขยับตัว มีชีพจร', scene: { rhythm: 'nsr', hr: 88, bp: '110/72', spo2: 97, compressorActive: false, consciousness: 'rosc' }, expect: { buttonId: 'rosc' }, window: { perfect: 4, good: 8, late: 14 }, points: 150, missFeedback_th: 'ลืมบันทึก ROSC' },
    ],
  },

  // ---------------- CHOKING ----------------
  {
    id: 'rcase_bls_choking_adult_01', category: 'choking', difficulty: 'basic', source: 'builtin',
    title_th: 'ผู้ใหญ่สำลักในร้านอาหาร', intro_th: 'ชาย 40 ปี สำลักอาหารกลางร้าน เริ่มไอแรง',
    wrongPressPenalty: 15,
    initialScene: { hr: 110, bp: '128/82', spo2: 90, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'ไอแรง พูดได้ — ประเมินความรุนแรง', scene: {}, expect: { buttonId: 'assess', data: { choice: 'mild' } }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมินความรุนแรงก่อน', wrongDataFeedback_th: 'ยังไอได้/พูดได้ = Mild — กระตุ้นให้ไอต่อ' },
      { t: 16, narration_th: 'เริ่มไอไม่ออก พูดไม่ได้ หน้าเขียว — ประเมินซ้ำ', scene: { spo2: 84 }, expect: { buttonId: 'assess', data: { choice: 'severe' } }, window: W_STD, points: 100, missFeedback_th: 'ลืมประเมินซ้ำเมื่ออาการแย่ลง', wrongDataFeedback_th: 'ไอไม่ออก พูดไม่ได้ = Severe — ต้องช่วยทันที' },
      { t: 24, narration_th: 'Severe choking — ตบหลัง', scene: {}, expect: { buttonId: 'back_blows' }, window: W_STD, points: 100, missFeedback_th: 'ลืมตบหลัง 5 ครั้ง' },
      { t: 33, narration_th: 'ตบหลังไม่หลุด — ดันท้อง (Heimlich)', scene: {}, expect: { buttonId: 'abd_thrust' }, window: W_STD, points: 100, missFeedback_th: 'ลืมดันท้องต่อ' },
      { t: 44, narration_th: 'ยังไม่หลุด สลับตบหลัง-ดันท้องต่อเนื่อง — ดันท้องอีกรอบ', scene: {}, expect: { buttonId: 'abd_thrust' }, window: W_STD, points: 100, missFeedback_th: 'ลืมทำต่อเนื่องจนหลุดหรือหมดสติ' },
      { t: 56, narration_th: 'ผู้ป่วยหมดสติล้มลง — โทร 1669', scene: { consciousness: 'unresponsive' }, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมโทร 1669 เมื่อหมดสติ' },
      { t: 65, narration_th: 'วางนอนหงาย เริ่ม CPR ทันที (เปิดปากเช็คทุกรอบ)', scene: { compressorActive: true }, expect: { buttonId: 'start_cpr' }, window: W_STD, points: 110, missFeedback_th: 'ลืมเริ่ม CPR ทันทีเมื่อหมดสติ' },
    ],
  },
  {
    id: 'rcase_bls_infant_choking_01', category: 'choking', difficulty: 'intermediate', source: 'builtin',
    title_th: 'ทารกสำลักนมผง', intro_th: 'ทารกหญิง 4 เดือน สำลักขณะดื่มนม เริ่มไอ ตัวเขียว',
    wrongPressPenalty: 15,
    initialScene: { hr: 130, bp: '—', spo2: 86, consciousness: 'awake' },
    events: [
      { t: 5, narration_th: 'ไออ่อนแรง ไม่มีเสียงร้อง หน้าเขียว — ประเมิน', scene: {}, expect: { buttonId: 'assess', data: { choice: 'severe' } }, window: W_STD, points: 100, missFeedback_th: 'ลืมประเมิน — ทารกไอไม่มีแรง = Severe ต้องช่วยทันที', wrongDataFeedback_th: 'ไอไม่มีแรง ไม่มีเสียงร้อง = Severe' },
      { t: 15, narration_th: 'อุ้มคว่ำบนแขน หัวต่ำ — ตบหลัง 5 ครั้ง', scene: {}, expect: { buttonId: 'back_blows' }, window: W_STD, points: 100, missFeedback_th: 'ลืมตบหลัง 5 ครั้ง (ห้ามดันท้องในทารก)' },
      { t: 26, narration_th: 'ไม่หลุด — พลิกหงาย ดันอก (chest thrust) 5 ครั้ง', scene: {}, expect: { buttonId: 'chest_thrust' }, window: W_STD, points: 100, missFeedback_th: 'ลืมดันอก 5 ครั้ง (ทารกใช้ chest thrust ไม่ใช่ abdominal)' },
      { t: 37, narration_th: 'ยังไม่หลุด สลับตบหลัง-ดันอกต่อเนื่อง — ตบหลังอีกรอบ', scene: {}, expect: { buttonId: 'back_blows' }, window: W_STD, points: 100, missFeedback_th: 'ลืมทำต่อเนื่องสลับตบหลัง-ดันอก' },
      { t: 48, narration_th: 'ดันอกอีกรอบ', scene: {}, expect: { buttonId: 'chest_thrust' }, window: W_STD, points: 100, missFeedback_th: 'ลืมดันอกต่อ' },
      { t: 60, narration_th: 'ทารกหมดสติ — โทร 1669', scene: { consciousness: 'unresponsive' }, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมโทร 1669 เมื่อหมดสติ' },
      { t: 69, narration_th: 'วางนอนหงายบนพื้นแข็ง เริ่ม CPR ทันที (two-thumb)', scene: { compressorActive: true }, expect: { buttonId: 'start_cpr' }, window: W_STD, points: 110, missFeedback_th: 'ลืมเริ่ม CPR ทันทีเมื่อหมดสติ' },
    ],
  },

  // ---------------- RESPIRATORY ----------------
  {
    id: 'rcase_bls_opioid_01', category: 'respiratory', difficulty: 'intermediate', source: 'builtin',
    title_th: 'Opioid Overdose — ชาย 24 ปี', intro_th: 'ชาย 24 ปี พบหมดสติในห้องน้ำ รูม่านตาเล็กมาก หายใจเฮือก',
    wrongPressPenalty: 15,
    initialScene: { hr: 60, bp: '96/60', spo2: 82, consciousness: 'unresponsive' },
    events: [
      { t: 5, narration_th: 'ไม่ตอบสนอง หายใจเฮือก รูม่านตาเล็กมาก — ประเมิน', scene: {}, expect: { buttonId: 'assess' }, window: W_STD, points: 90, missFeedback_th: 'ลืมประเมินการหายใจ' },
      { t: 13, narration_th: 'สงสัย opioid overdose — โทร 1669', scene: {}, expect: { buttonId: 'call_help' }, window: W_STD, points: 100, missFeedback_th: 'ลืมโทร 1669 แจ้งสงสัย opioid OD' },
      { t: 24, narration_th: 'เปิดทางเดินหายใจ', scene: {}, expect: { buttonId: 'airway_open' }, window: W_STD, points: 90, missFeedback_th: 'ลืมเปิดทางเดินหายใจ' },
      { t: 33, narration_th: 'หายใจเฮือกไม่พอ — ช่วยหายใจ', scene: { spo2: 78 }, expect: { buttonId: 'rescue_breath' }, window: W_STD, points: 100, missFeedback_th: 'ลืมช่วยหายใจ' },
      { t: 46, narration_th: 'ทีม EMS มาถึง — ให้ naloxone', scene: {}, expect: { buttonId: 'naloxone' }, window: W_STD, points: 100, missFeedback_th: 'ลืมให้/แจ้ง naloxone' },
      { t: 60, narration_th: 'หลัง naloxone หายใจดีขึ้น — Monitor ต่อเนื่อง (เฝ้าระวัง re-sedation)', scene: { spo2: 95, consciousness: 'rosc' }, expect: { buttonId: 'monitor' }, window: { perfect: 4, good: 8, late: 14 }, points: 110, missFeedback_th: 'ลืม monitor ต่อเนื่องหลังให้ naloxone' },
    ],
  },
];

// ==========================================
// Case packs
// ==========================================
export const CASE_PACKS = [
  { id: 'pack_bls_arrest', title_th: 'ชุดหัวใจหยุดเต้น BLS', subtitle_th: 'AED · Shock · No-Shock · Team CPR', color: 'text-danger',
    caseIds: ['rcase_bls_vf_01', 'rcase_bls_noshock_01', 'rcase_bls_team_switch_01'] },
  { id: 'pack_bls_airway', title_th: 'ชุดสำลัก / หยุดหายใจ', subtitle_th: 'FBAO ผู้ใหญ่ · ทารก · Opioid', color: 'text-info',
    caseIds: ['rcase_bls_choking_adult_01', 'rcase_bls_infant_choking_01', 'rcase_bls_opioid_01'] },
];

export function getPackById(id) {
  return CASE_PACKS.find(p => p.id === id);
}

// ---- เทมเพลตเปล่าสำหรับ editor (admin) ----
export function blankEvent(t = 6) {
  return {
    t, narration_th: '', scene: {},
    expect: { buttonId: 'check_response' },
    window: { perfect: 3, good: 6, late: 11 }, points: 100,
    missFeedback_th: '', wrongDataFeedback_th: '',
  };
}

export function blankCase() {
  return {
    id: null, status: 'draft', source: 'manual',
    titleTh: '', category: 'bls_arrest', difficulty: 'basic',
    payload: {
      title_th: '', category: 'bls_arrest', difficulty: 'basic', intro_th: '',
      wrongPressPenalty: 15,
      initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, consciousness: 'unresponsive' },
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
    wrongPressPenalty: c.wrongPressPenalty,
    durationSec: lastT + 15,
  };
}
