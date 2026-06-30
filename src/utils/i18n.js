// Simple i18n — EN/TH toggle
// Stored in settingsStore.language

const translations = {
  // ===== Common =====
  'scene_safety': { en: 'Scene Safety', th: 'ความปลอดภัยของที่เกิดเหตุ' },
  'scene_safe': { en: 'Scene is SAFE', th: 'ที่เกิดเหตุปลอดภัย' },
  'check_response': { en: 'Check Responsiveness', th: 'ตรวจสอบการตอบสนอง' },
  'unresponsive': { en: 'Unresponsive', th: 'ไม่ตอบสนอง' },
  'responsive': { en: 'Responsive', th: 'ตอบสนอง' },
  'call_help': { en: 'Call for Help', th: 'เรียกคนช่วย' },
  'check_pulse': { en: 'Check Pulse', th: 'คลำชีพจร' },
  'no_pulse': { en: 'No Pulse', th: 'ไม่มีชีพจร' },
  'pulse_present': { en: 'Pulse Present', th: 'มีชีพจร' },
  'start_cpr': { en: 'START CPR', th: 'เริ่ม CPR' },
  'attach_monitor': { en: 'Attach Monitor', th: 'ติด Monitor' },

  // ===== Rhythms =====
  'shockable': { en: 'Shockable', th: 'Shock ได้' },
  'non_shockable': { en: 'Non-shockable', th: 'Shock ไม่ได้' },
  'rhythm_check': { en: 'Check Rhythm', th: 'ตรวจ Rhythm' },

  // ===== CPR Dashboard =====
  'compressions': { en: 'Compressions', th: 'การกดหน้าอก' },
  'epinephrine': { en: 'Epinephrine', th: 'Epinephrine' },
  'total_duration': { en: 'Total Duration', th: 'ระยะเวลาทั้งหมด' },
  'shocks': { en: 'Shocks', th: 'Shock' },
  'cycles': { en: 'Cycles', th: 'รอบ' },
  'hand_only': { en: 'Hand-only', th: 'กดอย่างเดียว' },
  'bvm_30_2': { en: 'BVM 30:2', th: 'BVM 30:2' },
  'advanced': { en: 'Advanced', th: 'Advanced Airway' },
  'check_rhythm': { en: 'Check Rhythm', th: 'ตรวจ Rhythm' },
  'rosc': { en: 'ROSC', th: 'ROSC (ชีพจรกลับ)' },
  'drug': { en: 'Drug', th: 'ยา' },
  'airway': { en: 'Airway', th: 'ทางเดินหายใจ' },
  'breaths_now': { en: '2 BREATHS NOW!', th: '🫁 ช่วยหายใจ 2 ครั้ง!' },
  'give_breath': { en: 'GIVE 1 BREATH', th: '🫁 ช่วยหายใจ 1 ครั้ง' },

  // ===== Pathways =====
  'bradycardia': { en: 'Bradycardia', th: 'หัวใจเต้นช้า' },
  'tachycardia': { en: 'Tachycardia', th: 'หัวใจเต้นเร็ว' },
  'mi_acs': { en: 'ACS / MI', th: 'กล้ามเนื้อหัวใจขาดเลือด' },
  'stroke': { en: 'Stroke', th: 'โรคหลอดเลือดสมอง' },
  'stable': { en: 'Stable', th: 'คงที่' },
  'unstable': { en: 'Unstable', th: 'ไม่คงที่' },
  'symptomatic': { en: 'Symptomatic', th: 'มีอาการ' },
  'asymptomatic': { en: 'Asymptomatic', th: 'ไม่มีอาการ' },

  // ===== Actions =====
  'patient': { en: 'Patient', th: 'ผู้ป่วย' },
  'team': { en: 'Team', th: 'ทีม' },
  'vitals': { en: 'Vitals', th: 'สัญญาณชีพ' },
  'labs': { en: 'Labs', th: 'ผลแลป' },
  'ekg': { en: 'EKG', th: 'EKG' },
  'vent': { en: 'Vent', th: 'เครื่องช่วยหายใจ' },
  'ref': { en: 'Ref', th: 'อ้างอิง' },
  'sbar': { en: 'SBAR', th: 'SBAR' },
  'debrief': { en: 'Debrief', th: 'สรุป' },
  'report': { en: 'Report', th: 'รายงาน' },
  'comm': { en: 'Comm', th: 'สื่อสาร' },
  'end': { en: 'End', th: 'จบ' },
  'note': { en: 'Note', th: 'โน้ต' },

  // ===== Outcomes =====
  'rosc_achieved': { en: 'ROSC Achieved!', th: 'ROSC! ชีพจรกลับมา!' },
  'terminated': { en: 'Case Terminated', th: 'ยุติการช่วยชีวิต' },
  'post_rosc': { en: 'Post-ROSC Care', th: 'ดูแลหลัง ROSC' },

  // ===== Settings =====
  'clinical': { en: 'Clinical', th: 'ใช้งานจริง' },
  'training': { en: 'Training', th: 'ฝึกซ้อม' },
  'dark_mode': { en: 'Dark Mode', th: 'โหมดมืด' },
  'sound': { en: 'Sound Effects', th: 'เสียงเตือน' },
  'metronome': { en: 'Metronome', th: 'จังหวะ CPR' },
  'settings': { en: 'Settings', th: 'ตั้งค่า' },
  'language': { en: 'Language', th: 'ภาษา' },

  // ===== Navigation =====
  'history': { en: 'History', th: 'ประวัติ' },
  'scenarios': { en: 'Scenarios', th: 'โจทย์' },
  'statistics': { en: 'Statistics', th: 'สถิติ' },
  'drill': { en: 'Drill', th: 'ฝึก' },
  'drugs': { en: 'Drugs', th: 'ยา' },
  'cert': { en: 'Cert', th: 'ใบรับรอง' },
  'algorithms': { en: 'Algorithms', th: 'แนวทาง' },
  'als_knowledge': { en: 'ALS Book', th: 'ความรู้ ALS' },
  'qa_deep': { en: 'Q&A Deep', th: 'Q&A เชิงลึก' },
  'guide': { en: 'Guide', th: 'คู่มือ' },
  'feedback': { en: 'Feedback', th: 'แจ้งปัญหา' },
  'pre_course': { en: 'Pre-course', th: 'เตรียมเข้าเรียน' },
  'pre_test': { en: 'Pre-test', th: 'Pre-test' },
  'post_test': { en: 'Post-test', th: 'Post-test' },
  'learn': { en: 'Learn', th: 'เรียนรู้' },
  'learn_prepare': { en: 'Prepare', th: 'เตรียมตัว' },
  'learn_reference': { en: 'Knowledge', th: 'อ้างอิงความรู้' },
  'learn_practice': { en: 'Practice', th: 'ฝึกซ้อม' },
  'learn_progress': { en: 'Progress', th: 'ความก้าวหน้า' },
  'learn_subtitle': { en: 'Study, practice, and track your ACLS progress', th: 'เรียนรู้ ฝึกซ้อม และติดตามความก้าวหน้า ACLS' },
  'code_sim': { en: 'Code Blue Sim', th: 'จำลองเหตุ Code Blue' },

  // ===== Learn tile descriptions =====
  'pre_course_desc': { en: 'Lessons + drills', th: 'อ่านบทเรียน + แบบฝึกหัด' },
  'pre_test_desc': { en: 'Knowledge baseline', th: 'วัดความรู้ก่อนเริ่ม' },
  'post_test_desc': { en: 'Final assessment', th: 'วัดผลหลังเรียนจบ' },
  'als_knowledge_desc': { en: 'Full ACLS content', th: 'เนื้อหา ACLS ครบทุกบท' },
  'qa_deep_desc': { en: 'In-depth Q&A bank', th: 'คลังคำถาม-คำตอบเชิงลึก' },
  'algorithms_desc': { en: 'Treatment flowcharts', th: 'Flow ขั้นตอนการรักษา' },
  'guide_desc': { en: 'Quick field guide', th: 'คู่มือใช้งานหน้างาน' },
  'scenarios_desc': { en: 'Practice cases', th: 'ฝึกแก้สถานการณ์' },
  'code_sim_desc': { en: 'Live event simulation', th: 'จำลองเหตุการณ์สด' },
  'drill_desc': { en: 'Role-based skill drill', th: 'ฝึกทักษะรายบทบาท' },
  'cert_desc': { en: 'My learning records', th: 'ผลการเรียนของฉัน' },
  'cpr_drill': { en: 'CPR Drill', th: 'ฝึก CPR' },
  'cpr_drill_desc': { en: 'Compression rhythm', th: 'ฝึกกดหน้าอกตามจังหวะ' },
  'learn_video': { en: 'Video Lessons', th: 'วิดีโอบทเรียน' },
  'video_lessons': { en: 'Video Lessons', th: 'วิดีโอบทเรียน' },
  'video_lessons_desc': { en: 'In-depth clips, all topics', th: 'คลิปสอนเชิงลึกทุกหัวข้อ' },
};

// Get translation
export function t(key, lang = 'en') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

// Get all translations for a language
export function getTranslations(lang = 'en') {
  const result = {};
  for (const [key, val] of Object.entries(translations)) {
    result[key] = val[lang] || val.en || key;
  }
  return result;
}
