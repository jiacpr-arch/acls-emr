// In-person training courses at the JIA Trainer Center (jiacpr).
// Surfaced as a rotating ad banner on key student-facing ACLS pages.
// The banner lands on LINE OA + phone — not the course web page.

export const jiacprCourse = {
  orgName: 'JIA Trainer Center',
  lineUrl: 'https://line.me/R/ti/p/@jiacpr',
  phone: '0909791212',
  phoneDisplay: '090-979-1212',
  // หน้า product จริง — แนบ UTM เพื่อให้รู้ว่า traffic มาจากแอป
  courseUrl: 'https://www.jiacpr.com/newcourse?utm_source=morroo_app&utm_medium=referral&utm_campaign=course_banner',
};

// Full catalogue advertised on the ACLS build, one course shown per render.
export const jiaCourses = [
  // ACLS — หลักสูตรขั้นสูง
  {
    id: 'acls-full',
    group: 'ACLS',
    name: 'ACLS Full Course',
    titleTh: 'การช่วยฟื้นคืนชีวิตขั้นสูง',
    desc: 'หลักสูตร ACLS ครบวงจร — BLS, Airway, ECG, Drug, Defib, Megacode พร้อมสอบปฏิบัติ',
    meta: '2 วัน (16 ชม.) · 6-8 คน/รอบ · 9,900 บาท',
  },
  {
    id: 'acls-drug',
    group: 'ACLS',
    name: 'ACLS Drug Management',
    titleTh: 'การบริหารยาฉุกเฉิน',
    desc: 'เจาะลึกยาฉุกเฉิน ACLS ทุกตัว พร้อมฝึกเตรียมยาจริง',
    meta: '3 ชม. · 6-15 คน/รอบ',
  },
  {
    id: 'acls-osce',
    group: 'ACLS',
    name: 'ACLS for OSCE',
    titleTh: 'เตรียมสอบ OSCE',
    desc: 'ออกแบบตามแนวข้อสอบ OSCE สภาการแพทย์ + Mock OSCE',
    meta: '1 วัน (8 ชม.) · 6-8 คน/รอบ',
  },
  {
    id: 'acls-osce-day2',
    group: 'ACLS',
    name: 'ACLS for OSCE — Day 2',
    titleTh: 'ฝึก Scenario เข้มข้น',
    desc: 'Mock OSCE 2 รอบ + Feedback รายบุคคล',
    meta: '1 วัน (8 ชม.) · 6-8 คน/รอบ',
  },
  {
    id: 'acls-team',
    group: 'ACLS',
    name: 'ACLS Team Member',
    titleTh: 'สมาชิกทีมช่วยชีวิต',
    desc: 'ฝึกบทบาท Team Member — CPR, Airway, IV, Drug, Monitor',
    meta: '1 วัน (8 ชม.) · 8-16 คน/รอบ',
  },

  // Workshop เฉพาะทาง
  {
    id: 'airway',
    group: 'Workshop',
    name: 'Emergency Airway Workshop',
    titleTh: 'จัดการทางเดินหายใจ',
    desc: 'OPA, NPA, Bag-Mask, Intubation, LMA — ฝึกจริงทุกเทคนิค',
    meta: '4 ชม. · 6-12 คน/รอบ · 2,900 บาท',
  },
  {
    id: 'defib',
    group: 'Workshop',
    name: 'Emergency Defib & AED',
    titleTh: 'ใช้เครื่องกระตุกหัวใจ',
    desc: 'AED + Manual Defib + Sync Cardioversion + Pacing',
    meta: '4 ชม. · 6-12 คน/รอบ · 3,500 บาท',
  },
  {
    id: 'vascular',
    group: 'Workshop',
    name: 'Emergency Vascular Access',
    titleTh: 'เปิดเส้นเลือดฉุกเฉิน',
    desc: 'ฝึกเปิดเส้น IV + IO Access + เตรียมยา',
    meta: '3 ชม. · 6-12 คน/รอบ · 2,500 บาท',
  },

  // BLS / CPR & AED
  {
    id: 'bls-workplace',
    group: 'BLS / CPR & AED',
    name: 'BLS Adult Workplace',
    titleTh: 'BLS สำหรับสถานที่ทำงาน',
    desc: 'Parallel Method — ทุกคนฝึก CPR จริง หุ่น 1:1',
    meta: '3-4 ชม. · 20-120 คน/รอบ',
  },
  {
    id: 'bls-hcp',
    group: 'BLS / CPR & AED',
    name: 'BLS Healthcare Provider',
    titleTh: 'BLS สำหรับบุคลากรการแพทย์',
    desc: 'High Quality CPR + 2-Rescuer + Bag-Mask',
    meta: '4 ชม. · 8-20 คน/รอบ',
  },
  {
    id: 'bls-lay',
    group: 'BLS / CPR & AED',
    name: 'BLS Layrescuer',
    titleTh: 'BLS สำหรับประชาชน',
    desc: 'CPR + AED + Choking — ทุกคนเรียนได้',
    meta: '3 ชม. · 10-40 คน/รอบ',
  },
  {
    id: 'cpr-aed-lay',
    group: 'BLS / CPR & AED',
    name: 'CPR & AED Layrescuer',
    titleTh: 'CPR & AED กระชับ',
    desc: 'เน้น CPR + AED อย่างเดียว กระชับ',
    meta: '2 ชม. · 10-60 คน/รอบ',
  },

  // หลักสูตรอื่นๆ
  {
    id: 'aed-corporate',
    group: 'หลักสูตรอื่นๆ',
    name: 'AED Class Corporate',
    titleTh: 'AED สำหรับองค์กร',
    desc: 'สอนพนักงานใช้ AED + Emergency Action Plan',
    meta: '2-3 ชม. · 10-60 คน/รอบ',
  },
  {
    id: 'iv-therapy',
    group: 'หลักสูตรอื่นๆ',
    name: 'Basic IV Therapy',
    titleTh: 'ให้สารน้ำ IV',
    desc: 'ฝึกเปิดเส้น + ต่อสาร + คำนวณ Drip Rate',
    meta: '4 ชม. · 6-15 คน/รอบ',
  },
  {
    id: 'rrt',
    group: 'หลักสูตรอื่นๆ',
    name: 'RRT Prevent Cardiac Arrest',
    titleTh: 'ทีมตอบสนองเร็ว',
    desc: 'Early Warning Score + ABCDE + SBAR',
    meta: '4 ชม. · 10-30 คน/รอบ',
  },
  {
    id: 'specimen',
    group: 'หลักสูตรอื่นๆ',
    name: 'Collecting Tube & Specimen',
    titleTh: 'เก็บสิ่งส่งตรวจ',
    desc: 'หลอดเก็บเลือดครบทุกสี + Order of Draw',
    meta: '3 ชม. · 10-30 คน/รอบ',
  },
];

export function pickRandomJiaCourse() {
  return jiaCourses[Math.floor(Math.random() * jiaCourses.length)];
}

// เลือกคอร์สตามบริบทหน้า: ระบุ courseId ตรงๆ หรือกรองตาม group แล้วสุ่ม
export function pickJiaCourse({ courseId, group } = {}) {
  if (courseId) {
    const found = jiaCourses.find(c => c.id === courseId);
    if (found) return found;
  }
  const pool = group ? jiaCourses.filter(c => c.group === group) : jiaCourses;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : pickRandomJiaCourse();
}
