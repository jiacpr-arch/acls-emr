// ==========================================
// Recorder Hero — เกมฝึกผู้บันทึก Code Blue
// ข้อมูลด่านทั้งหมด (ภาษาไทย) + schema
// ==========================================
// เป้าหมาย: ฝึกให้ผู้บันทึก (recorder) กดบันทึกเหตุการณ์ในหน้า Recording
// ได้ "ถูกปุ่ม-ถูกลำดับ-ถูกเวลา-ถูกข้อมูล" ลดข้อผิดพลาด 4 กลุ่มหลัก
// ไฟล์นี้เป็น DATA ล้วน — ไม่ import store/Dexie ใดๆ

// ---- 4 กลุ่มข้อผิดพลาดหลัก ----
export const ERROR_TYPES = {
  MISSED: 'missed',            // ลืมกด / กดช้า
  WRONG_BUTTON: 'wrong_button', // กดผิดปุ่ม / ผิดลำดับ
  UI_LOST: 'ui_lost',          // หาปุ่มไม่เจอ / ไม่คุ้น UI
  WRONG_DATA: 'wrong_data',    // บันทึกข้อมูลผิด (dose / energy / rhythm)
};

export const ERROR_TYPE_META = {
  [ERROR_TYPES.MISSED]: {
    label_th: 'ลืมกด / กดช้า',
    icon: '⏰',
    color: 'text-warning',
    tip_th: 'บันทึกทันทีที่เหตุการณ์เกิด — อย่ารอจนจบรอบ CPR เวลาจะคลาดเคลื่อน',
  },
  [ERROR_TYPES.WRONG_BUTTON]: {
    label_th: 'กดผิดปุ่ม / ผิดลำดับ',
    icon: '🔀',
    color: 'text-danger',
    tip_th: 'ทบทวน algorithm: shockable → shock ก่อน | non-shockable → Epi ก่อน',
  },
  [ERROR_TYPES.UI_LOST]: {
    label_th: 'หาปุ่มไม่เจอ / ไม่คุ้น UI',
    icon: '🧭',
    color: 'text-info',
    tip_th: 'จำตำแหน่งปุ่มหลัก: Check Rhythm/Drug อยู่หน้า dashboard, สถานะพิเศษอยู่ใน More',
  },
  [ERROR_TYPES.WRONG_DATA]: {
    label_th: 'บันทึกข้อมูลผิด',
    icon: '💊',
    color: 'text-purple',
    tip_th: 'ตรวจซ้ำก่อนกดยืนยัน: Epi 1mg, Amio 300mg, Shock แรก 120J → ต่อไป 200J',
  },
};

// ---- ปุ่มในเกม: id ตรงกับความหมายปุ่มจริง + ตำแหน่งบนหน้า Recording ----
// where: dashboard | quickbar | more_sheet | rhythm_step | drug_step | shock_modal
export const GAME_BUTTONS = {
  check_rhythm: { label_th: 'Check Rhythm', where: 'dashboard', needsData: 'rhythm' },
  shock:        { label_th: 'Shock', where: 'shock_modal', needsData: 'energy' },
  drug:         { label_th: 'Drug (ให้ยา)', where: 'dashboard', needsData: 'drug' },
  airway:       { label_th: 'Airway', where: 'dashboard' },
  ht:           { label_th: 'H&T (หาสาเหตุ)', where: 'dashboard' },
  rosc:         { label_th: 'ROSC', where: 'more_sheet' },
  no_pulse:     { label_th: 'No Pulse → CPR', where: 'more_sheet' },
  ekg_changed:  { label_th: 'EKG Changed', where: 'more_sheet' },
  end_case:     { label_th: 'End (จบเคส)', where: 'quickbar' },
  labs:         { label_th: 'Labs', where: 'quickbar' },
  vitals:       { label_th: 'Vitals', where: 'quickbar' },
  // ---- peri-arrest / non-arrest actions (โหมดเคสหลายรูปแบบ) ----
  assess:       { label_th: 'ประเมิน Stable/Unstable', where: 'action_pad' },
  vagal:        { label_th: 'Vagal maneuver', where: 'action_pad' },
  cardiovert:   { label_th: 'Synchronized Cardioversion', where: 'action_pad', needsData: 'energy' },
  pacing:       { label_th: 'Transcutaneous Pacing', where: 'action_pad' },
  drug_choice:  { label_th: 'ให้ยา', where: 'action_pad', needsData: 'choice' },
  fast:         { label_th: 'FAST assessment', where: 'action_pad' },
  ct_brain:     { label_th: 'CT Brain', where: 'action_pad' },
  tpa:          { label_th: 'ให้ tPA', where: 'action_pad' },
  mona:         { label_th: 'MONA / ASA+NTG', where: 'action_pad' },
  twelve_lead:  { label_th: '12-Lead ECG', where: 'action_pad' },
  cath:         { label_th: 'Activate Cath lab', where: 'action_pad' },
  monitor:      { label_th: 'Monitor + หาสาเหตุ', where: 'action_pad' },
};

// พลังงาน default ต่อ shock (มิเรอร์ getShockEnergy: VF/pVT แรก 120J, ถัดไป 200J)
export const ENERGY_CHOICES = [50, 120, 150, 200, 360];

// ==========================================
// LEVELS
// ==========================================
export const LEVELS = [
  // ---------- ด่าน 1: รู้จักหน้าจอ (button hunt) ----------
  {
    id: 'lv1_hunt',
    type: 'hunt',
    order: 1,
    title_th: 'ด่าน 1 · รู้จักหน้าจอ Recorder',
    subtitle_th: 'หาปุ่มให้เจอเร็วที่สุด — สร้างความคุ้นเคยกับ UI',
    targetError: ERROR_TYPES.UI_LOST,
    tasks: [
      { prompt_th: 'หาปุ่ม "Check Rhythm" (ตรวจจังหวะหัวใจ)', buttonId: 'check_rhythm', screen: 'dashboard', timeLimit: 8, hint_th: 'อยู่แถวปุ่มหลักของ dashboard คู่กับ ROSC' },
      { prompt_th: 'หาปุ่ม "Drug" (ให้ยา)', buttonId: 'drug', screen: 'dashboard', timeLimit: 8, hint_th: 'อยู่แถวปุ่มรอง Drug / Airway / H&T' },
      { prompt_th: 'หาปุ่ม "Airway"', buttonId: 'airway', screen: 'dashboard', timeLimit: 8, hint_th: 'แถวปุ่มรอง หรือใน QuickBar ด้านล่าง' },
      { prompt_th: 'หาปุ่ม "H&T" (หาสาเหตุที่แก้ได้)', buttonId: 'ht', screen: 'dashboard', timeLimit: 8, hint_th: 'ปุ่มรูปแว่นขยาย' },
      { prompt_th: 'เปิดเมนู "More" แล้วหา "No Pulse → CPR"', buttonId: 'no_pulse', screen: 'more_sheet', timeLimit: 10, hint_th: 'กด More ก่อน แล้วดูหมวด Status Change' },
      { prompt_th: 'ในเมนู More หา "ROSC"', buttonId: 'rosc', screen: 'more_sheet', timeLimit: 10, hint_th: 'หมวด Status Change สีเขียว' },
      { prompt_th: 'ในเมนู More หา "EKG Changed"', buttonId: 'ekg_changed', screen: 'more_sheet', timeLimit: 10, hint_th: 'หมวด Status Change' },
      { prompt_th: 'หาปุ่ม "End" (จบเคส) ใน QuickBar', buttonId: 'end_case', screen: 'quickbar', timeLimit: 8, hint_th: 'ปุ่มสีแดงขวาสุดของแถบล่าง' },
    ],
  },

  // ---------- ด่าน 2: VF Arrest (live recorder) ----------
  {
    id: 'lv2_live_vf',
    type: 'live',
    order: 2,
    title_th: 'ด่าน 2 · บันทึก VF Arrest',
    subtitle_th: 'เหตุการณ์เล่นจริง — กดบันทึกให้ทันและถูกต้อง',
    targetError: ERROR_TYPES.MISSED,
    intro_th: 'ชาย 55 ปี หมดสติขณะออกกำลังกาย ทีมเริ่ม CPR แล้ว คุณคือ "ผู้บันทึก" กดปุ่มบันทึกเหตุการณ์ให้ทันเวลา',
    speed: 1,
    wrongPressPenalty: 15,
    initialScene: { rhythm: 'flat', hr: 0, bp: '0/0', spo2: 0, etco2: 12, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      {
        t: 6, narration_th: 'ติด monitor แล้ว — หัวหน้าสั่ง "Check rhythm!"',
        scene: { rhythm: 'vf', etco2: 14 },
        expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } },
        window: { perfect: 3, good: 6, late: 11 }, points: 100,
        missFeedback_th: 'ลืมบันทึกการ check rhythm — เวลาการวินิจฉัยจะหาย',
        wrongDataFeedback_th: 'จังหวะนี้คือ VF (คลื่นสับสนไม่มี QRS) เลือกให้ถูก',
      },
      {
        t: 16, narration_th: 'VF = shockable! เตรียม defibrillate',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 120 } },
        window: { perfect: 3, good: 6, late: 11 }, points: 120,
        missFeedback_th: 'ช้าไป! VF ต้อง shock ทันที — ทุกวินาทีมีผลต่อรอด',
        wrongDataFeedback_th: 'Shock แรกของ biphasic = 120J (ไม่ใช่ 50/360)',
      },
      {
        t: 28, narration_th: 'Shock แล้ว กด CPR ต่อ 2 นาที — เปิด IV ให้ยา',
        scene: { rhythm: 'vf', defibCharged: false, compressorActive: true, ivAccess: true, etco2: 18 },
        expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } },
        window: { perfect: 4, good: 8, late: 14 }, points: 100,
        missFeedback_th: 'ลืมบันทึก Epinephrine — ยา q3-5 นาทีต้องมีเวลาให้ชัด',
        wrongDataFeedback_th: 'ตัวแรกใน arrest คือ Epinephrine 1mg (ไม่ใช่ Atropine/ยาอื่น)',
      },
      {
        t: 44, narration_th: 'ครบ 2 นาที — check rhythm อีกครั้ง: ยังเป็น VF',
        scene: { rhythm: 'vf', compressorActive: false },
        expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } },
        window: { perfect: 3, good: 6, late: 11 }, points: 100,
        missFeedback_th: 'ลืมบันทึก rhythm check รอบที่ 2',
        wrongDataFeedback_th: 'ยังเป็น VF อยู่ เลือกให้ตรง',
      },
      {
        t: 54, narration_th: 'ยัง VF → Shock ครั้งที่ 2',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 200 } },
        window: { perfect: 3, good: 6, late: 11 }, points: 120,
        missFeedback_th: 'ลืม shock ครั้งที่ 2',
        wrongDataFeedback_th: 'Shock ครั้งถัดไป biphasic = 200J',
      },
      {
        t: 66, narration_th: 'หลัง shock 2 → ให้ยาต้านเต้นผิดจังหวะ',
        scene: { rhythm: 'vf', defibCharged: false, compressorActive: true, etco2: 22 },
        expect: { buttonId: 'drug', data: { drug: 'amiodarone_first' } },
        window: { perfect: 4, good: 8, late: 14 }, points: 110,
        missFeedback_th: 'ลืมบันทึก Amiodarone',
        wrongDataFeedback_th: 'Antiarrhythmic ตัวแรกของ VF/pVT คือ Amiodarone 300mg',
      },
      {
        t: 82, narration_th: 'ครบ 2 นาที — check rhythm: EtCO₂ พุ่ง 42! ผู้ป่วยขยับ',
        scene: { rhythm: 'nsr', hr: 88, bp: '110/70', spo2: 96, etco2: 42, compressorActive: false, consciousness: 'rosc' },
        expect: { buttonId: 'rosc' },
        window: { perfect: 4, good: 8, late: 14 }, points: 150,
        missFeedback_th: 'ลืมบันทึก ROSC — post-arrest care จะเริ่มช้า',
      },
    ],
  },

  // ---------- ด่าน 3: ตรวจ Log (audit) ----------
  {
    id: 'lv3_audit_basic',
    type: 'audit',
    order: 3,
    title_th: 'ด่าน 3 · ตรวจ Log หาข้อผิดพลาด',
    subtitle_th: 'พบข้อผิดพลาดที่ผู้บันทึกมือใหม่ทำไว้ให้ครบ',
    targetError: ERROR_TYPES.WRONG_DATA,
    brief_th: 'เคส Asystole หญิง 72 ปี CKD stage 4 — นี่คือ log ที่ผู้บันทึกมือใหม่ทำไว้ แตะบรรทัดที่ผิดแล้วระบุประเภทข้อผิดพลาด',
    maxWrongPicks: 4,
    log: [
      { id: 'a1', time: '00:00', category: 'cpr', text_th: '🫀 เริ่ม CPR', error: null },
      { id: 'a2', time: '00:20', category: 'rhythm', text_th: '📈 Rhythm Check: Asystole (ยืนยัน 2 leads)', error: null },
      { id: 'a3', time: '00:35', category: 'shock', text_th: '⚡ Shock #1 · 200J',
        error: { type: ERROR_TYPES.WRONG_BUTTON, explain_th: 'Asystole = non-shockable → ห้าม shock! ต้อง CPR + Epi เท่านั้น' } },
      { id: 'a4', time: '00:50', category: 'drug', text_th: '💉 Epinephrine 10mg IV',
        error: { type: ERROR_TYPES.WRONG_DATA, explain_th: 'ขนาด Epi ใน arrest = 1mg (1:10,000) ไม่ใช่ 10mg' } },
      { id: 'a5', time: '02:55', category: 'drug', text_th: '💉 Epinephrine 1mg IV (dose 2)',
        error: { type: ERROR_TYPES.MISSED, explain_th: 'Epi ควรให้ q3-5 นาที แต่ dose นี้ห่างจาก dose แรกเกือบ 2 นาทีเศษเท่านั้น — และไม่มี rhythm check คั่นก่อนหน้า (เวลาบันทึกคลาดเคลื่อน)' } },
      { id: 'a6', time: '01:30', category: 'lab', text_th: '🧪 ส่ง K+ (สงสัย hyperkalemia จาก CKD)', error: null },
      { id: 'a7', time: '03:10', category: 'drug', text_th: '💊 Amiodarone 300mg IV',
        error: { type: ERROR_TYPES.WRONG_BUTTON, explain_th: 'Amiodarone ใช้เฉพาะ VF/pVT — ไม่ใช้ใน Asystole' } },
      { id: 'a8', time: '04:00', category: 'rhythm', text_th: '📈 Rhythm Check: organized rhythm → คลำ pulse ได้', error: null },
      { id: 'a9', time: '04:05', category: 'outcome', text_th: '🟢 ROSC', error: null },
    ],
    missing: [
      { betweenIds: ['a6', 'a7'], text_th: '(น่าจะมีการให้ Calcium gluconate สำหรับ hyperkalemia แต่ไม่ถูกบันทึก)',
        type: ERROR_TYPES.MISSED, explain_th: 'CKD + Asystole → คิดถึง hyperkalemia → ต้องให้ Ca gluconate และบันทึกไว้ แต่ log ไม่มี' },
    ],
  },

  // ---------- ด่าน 4: VF → PEA (live intermediate) ----------
  {
    id: 'lv4_live_pea',
    type: 'live',
    order: 4,
    title_th: 'ด่าน 4 · VF เปลี่ยนเป็น PEA',
    subtitle_th: 'เร็วขึ้น ไม่มี hint — จังหวะเปลี่ยน ต้องปรับการบันทึก',
    targetError: ERROR_TYPES.WRONG_BUTTON,
    intro_th: 'ชาย 62 ปี โรคหัวใจ เจ็บหน้าอกแล้วหมดสติ monitor เป็น VF — ระวังจังหวะเปลี่ยนเป็น PEA ระหว่างทาง',
    speed: 1,
    wrongPressPenalty: 20,
    initialScene: { rhythm: 'vf', hr: 0, bp: '0/0', spo2: 0, etco2: 15, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      {
        t: 5, narration_th: 'Witnessed VF — check rhythm',
        scene: { rhythm: 'vf' },
        expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } },
        window: { perfect: 2, good: 5, late: 9 }, points: 100,
        missFeedback_th: 'ช้า — witnessed arrest ต้องเร็ว',
        wrongDataFeedback_th: 'จังหวะแรกคือ VF',
      },
      {
        t: 13, narration_th: 'Shock ทันที',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 120 } },
        window: { perfect: 2, good: 5, late: 9 }, points: 120,
        missFeedback_th: 'VF ต้อง shock เร็ว',
        wrongDataFeedback_th: 'Shock แรก = 120J',
      },
      {
        t: 24, narration_th: 'CPR 2 นาที — check rhythm: เปลี่ยนเป็น PEA (มี complex แต่ไม่มี pulse)',
        scene: { rhythm: 'pea', hr: 40, compressorActive: false },
        expect: { buttonId: 'check_rhythm', data: { rhythm: 'pea' } },
        window: { perfect: 2, good: 5, late: 9 }, points: 130,
        missFeedback_th: 'ลืมบันทึกจังหวะที่เปลี่ยน',
        wrongDataFeedback_th: 'ตอนนี้เป็น PEA — organized แต่ไม่มี pulse (ไม่ใช่ VF/NSR)',
      },
      {
        t: 34, narration_th: 'PEA = non-shockable → ให้ Epi ทันที + หา H&T',
        scene: { rhythm: 'pea', compressorActive: true, ivAccess: true },
        expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } },
        window: { perfect: 3, good: 6, late: 11 }, points: 110,
        missFeedback_th: 'PEA ต้อง Epi ทันที — ลืมบันทึก',
        wrongDataFeedback_th: 'ให้ Epinephrine 1mg (ห้าม shock ใน PEA!)',
      },
      {
        t: 48, narration_th: 'ประวัติ MI → สงสัย thrombosis หัวใจ บันทึกการหาสาเหตุ',
        scene: { rhythm: 'pea', compressorActive: true, etco2: 20 },
        expect: { buttonId: 'ht' },
        window: { perfect: 3, good: 7, late: 12 }, points: 90,
        missFeedback_th: 'ลืมบันทึกการค้นหา H&T',
      },
      {
        t: 62, narration_th: 'ครบ 2 นาที — check rhythm: มี pulse กลับมา!',
        scene: { rhythm: 'nsr', hr: 92, bp: '105/68', spo2: 95, etco2: 38, compressorActive: false, consciousness: 'rosc' },
        expect: { buttonId: 'rosc' },
        window: { perfect: 3, good: 6, late: 11 }, points: 150,
        missFeedback_th: 'ลืมบันทึก ROSC',
      },
    ],
  },

  // ---------- ด่าน 5: Log audit ขั้นสูง (megacode) ----------
  {
    id: 'lv5_audit_advanced',
    type: 'audit',
    order: 5,
    title_th: 'ด่าน 5 · ตรวจ Log Megacode',
    subtitle_th: 'ข้อผิดพลาดซับซ้อน: ลำดับผิด + เหตุการณ์หาย + ข้อมูลผิด',
    targetError: ERROR_TYPES.MISSED,
    brief_th: 'เคส Refractory VF ชาย 58 ปี CKD ขาด HD — log นี้มีทั้งลำดับผิด ข้อมูลผิด และเหตุการณ์ที่หายไป หาให้ครบ',
    maxWrongPicks: 5,
    log: [
      { id: 'm1', time: '00:00', category: 'cpr', text_th: '🫀 เริ่ม CPR', error: null },
      { id: 'm2', time: '00:15', category: 'rhythm', text_th: '📈 Rhythm: VF', error: null },
      { id: 'm3', time: '00:20', category: 'shock', text_th: '⚡ Shock #1 · 120J', error: null },
      { id: 'm4', time: '00:25', category: 'drug', text_th: '💉 Epinephrine 1mg IV',
        error: { type: ERROR_TYPES.WRONG_BUTTON, explain_th: 'Epi ครั้งแรกใน shockable ให้ "หลัง shock ครั้งที่ 2" — ที่นี่บันทึกให้เร็วเกินไป (หลัง shock แรกทันที)' } },
      { id: 'm5', time: '02:20', category: 'rhythm', text_th: '📈 Rhythm: ยังเป็น VF', error: null },
      { id: 'm6', time: '02:25', category: 'shock', text_th: '⚡ Shock #2 · 120J',
        error: { type: ERROR_TYPES.WRONG_DATA, explain_th: 'Shock ครั้งที่ 2 ควรเพิ่มเป็น 200J (biphasic subsequent) ไม่ใช่ 120J ซ้ำ' } },
      { id: 'm7', time: '04:30', category: 'shock', text_th: '⚡ Shock #3 · 200J',
        error: { type: ERROR_TYPES.MISSED, explain_th: 'ระหว่าง shock #2 (02:25) กับ #3 (04:30) ห่างกว่า 2 นาที และไม่มี rhythm check คั่น — เหตุการณ์ตรวจจังหวะหายไป' } },
      { id: 'm8', time: '04:35', category: 'drug', text_th: '💊 Amiodarone 150mg IV',
        error: { type: ERROR_TYPES.WRONG_DATA, explain_th: 'Amiodarone ครั้งแรกใน arrest = 300mg (ครั้งที่สองจึง 150mg)' } },
      { id: 'm9', time: '05:00', category: 'lab', text_th: '🧪 K+ = 7.2 (Hyperkalemia จาก CKD ขาด HD)', error: null },
      { id: 'm10', time: '05:10', category: 'drug', text_th: '💉 Calcium gluconate 10% 20ml IV', error: null },
      { id: 'm11', time: '06:40', category: 'outcome', text_th: '🟢 ROSC หลังแก้ hyperkalemia + shock', error: null },
    ],
    missing: [
      { betweenIds: ['m4', 'm5'], text_th: '(ควรมี "CPR resumed 2 นาที" หลัง shock แต่ไม่ถูกบันทึก)',
        type: ERROR_TYPES.MISSED, explain_th: 'หลัง shock ทุกครั้งต้อง resume CPR ทันที 2 นาที — เหตุการณ์นี้หายไปจาก log' },
    ],
  },

  // ---------- ด่าน 6: Final Megacode (live) ----------
  {
    id: 'lv6_live_megacode',
    type: 'live',
    order: 6,
    title_th: 'ด่าน 6 · Megacode: VF + Hyperkalemia',
    subtitle_th: 'ด่านสุดท้าย — เร็ว ซับซ้อน มีตัวหลอก บันทึกให้ครบถูกต้อง',
    targetError: ERROR_TYPES.WRONG_DATA,
    intro_th: 'ชาย 58 ปี CKD stage 5 ขาด HD 1 สัปดาห์ หมดสติที่บ้าน — refractory VF ที่ต้องแก้ hyperkalemia จึงจะ ROSC',
    speed: 1,
    wrongPressPenalty: 25,
    initialScene: { rhythm: 'vf', hr: 0, bp: '0/0', spo2: 0, etco2: 12, compressorActive: true, consciousness: 'unresponsive' },
    events: [
      {
        t: 5, narration_th: 'Monitor: VF — check rhythm',
        scene: { rhythm: 'vf' },
        expect: { buttonId: 'check_rhythm', data: { rhythm: 'vf' } },
        window: { perfect: 2, good: 5, late: 9 }, points: 100,
        missFeedback_th: 'ช้าไป', wrongDataFeedback_th: 'VF',
      },
      {
        t: 12, narration_th: 'Shock #1',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 120 } },
        window: { perfect: 2, good: 5, late: 9 }, points: 110,
        missFeedback_th: 'ลืม shock', wrongDataFeedback_th: 'Shock แรก 120J',
      },
      {
        t: 24, narration_th: 'ยัง VF → Shock #2 แล้วให้ Epi',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 200 } },
        window: { perfect: 2, good: 5, late: 9 }, points: 120,
        missFeedback_th: 'ลืม shock ครั้งที่ 2', wrongDataFeedback_th: 'Shock ถัดไป 200J',
      },
      {
        t: 34, narration_th: 'หลัง shock 2 → Epinephrine',
        scene: { rhythm: 'vf', compressorActive: true, ivAccess: true, etco2: 18 },
        expect: { buttonId: 'drug', data: { drug: 'epinephrine_arrest' } },
        window: { perfect: 3, good: 6, late: 11 }, points: 100,
        missFeedback_th: 'ลืม Epi', wrongDataFeedback_th: 'Epi 1mg',
      },
      {
        t: 48, narration_th: 'Shock #3 + Amiodarone',
        scene: { rhythm: 'vf', defibCharged: true },
        expect: { buttonId: 'shock', data: { energy: 200 } },
        window: { perfect: 2, good: 5, late: 9 }, points: 120,
        missFeedback_th: 'ลืม shock ครั้งที่ 3', wrongDataFeedback_th: 'ยังใช้ 200J',
      },
      {
        t: 58, narration_th: 'ให้ Amiodarone ตัวแรก',
        scene: { rhythm: 'vf', compressorActive: true, etco2: 20 },
        expect: { buttonId: 'drug', data: { drug: 'amiodarone_first' } },
        window: { perfect: 3, good: 6, late: 11 }, points: 110,
        missFeedback_th: 'ลืม Amiodarone', wrongDataFeedback_th: 'Amiodarone 300mg (ตัวแรก)',
      },
      {
        t: 72, narration_th: 'Refractory VF + CKD ขาด HD → นึกถึง hyperkalemia บันทึกการหาสาเหตุ',
        scene: { rhythm: 'vf', compressorActive: true },
        expect: { buttonId: 'ht' },
        window: { perfect: 3, good: 7, late: 12 }, points: 100,
        missFeedback_th: 'ลืมบันทึกการค้นหา H&T (hyperkalemia)',
      },
      {
        t: 88, narration_th: 'K+ = 7.2! ให้ Ca gluconate แก้ hyperkalemia',
        scene: { rhythm: 'vf', compressorActive: true },
        expect: { buttonId: 'drug', data: { drug: 'calcium_chloride' } },
        window: { perfect: 3, good: 7, late: 12 }, points: 120,
        missFeedback_th: 'ลืมบันทึก Calcium — หัวใจสำคัญของเคสนี้',
        wrongDataFeedback_th: 'Hyperkalemia → Calcium gluconate/chloride (ไม่ใช่ยาอื่น)',
      },
      {
        t: 104, narration_th: 'Shock อีกครั้ง → sinus + มี pulse! ROSC',
        scene: { rhythm: 'nsr', hr: 96, bp: '100/62', spo2: 94, etco2: 40, compressorActive: false, consciousness: 'rosc' },
        expect: { buttonId: 'rosc' },
        window: { perfect: 3, good: 6, late: 11 }, points: 160,
        missFeedback_th: 'ลืมบันทึก ROSC',
      },
    ],
  },
];

export function getLevelById(id) {
  return LEVELS.find(l => l.id === id);
}

// คะแนนเต็มของด่าน live = ผลรวม points ทุก event
export function getLiveMaxScore(level) {
  if (level.type !== 'live') return 0;
  return level.events.reduce((sum, e) => sum + (e.points || 0), 0);
}

// จำนวนข้อผิดพลาดทั้งหมดในด่าน audit (log errors + missing)
export function getAuditErrorCount(level) {
  if (level.type !== 'audit') return 0;
  const logErrors = level.log.filter(l => l.error).length;
  const missing = (level.missing || []).length;
  return logErrors + missing;
}
