// แหล่งข้อมูลกลาง (single source of truth) ของวิดีโอประกอบคอร์ส ACLS
// ใช้ร่วมกันระหว่างแอป (pre-course lessons) และเว็บ public (Next.js, อนาคต)
//
// วิธีเติมวิดีโอ: ใส่ youtubeId (11 ตัวอักษร) ของแต่ละบท
//   - ลิงก์ปกติ: https://youtu.be/<youtubeId> หรือ youtube.com/watch?v=<youtubeId>
//   - YouTube Shorts: https://youtube.com/shorts/<youtubeId>  (id เดียวกัน)
//   ปล่อย youtubeId เป็น '' ไว้ได้ — บทที่ยังไม่มีวิดีโอจะไม่แสดงการ์ด
//
// orientation: 'portrait' (แนวตั้ง 9:16 / Shorts) หรือ 'landscape' (แนวนอน 16:9)

export const courseVideos = [
  { lessonId: 'pc01', slug: 'overview-chain-of-survival',     title: 'บทที่ 1: ภาพรวม ACLS และห่วงโซ่การรอดชีวิตสากล', youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc02', slug: 'systematic-assessment',          title: 'บทที่ 2: การประเมินผู้ป่วยอย่างเป็นระบบ',        youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc03', slug: 'prevent-arrest-rrt-met-sbar',    title: 'บทที่ 3: ป้องกัน Arrest · RRT/MET + SBAR',       youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc04', slug: 'acute-coronary-syndrome',        title: 'บทที่ 4: กลุ่มอาการหลอดเลือดหัวใจเฉียบพลัน (ACS)', youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc05', slug: 'acute-stroke',                   title: 'บทที่ 5: โรคหลอดเลือดสมองเฉียบพลัน (Acute Stroke)', youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc06', slug: 'bradycardia',                    title: 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร',            youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc07', slug: 'tachycardia',                    title: 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร',           youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc08', slug: 'high-performance-team-cpr-coach', title: 'บทที่ 8: ทีมช่วยชีวิตสมรรถนะสูง + CPR Coach',   youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc09', slug: 'airway-management',              title: 'บทที่ 9: การจัดการทางเดินหายใจ',                youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc10', slug: 'vf-pvt-shockable',               title: 'บทที่ 10: ภาวะหัวใจหยุดเต้น VF/pVT (Shockable)',  youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc11', slug: 'pea-asystole',                   title: 'บทที่ 11: ภาวะหัวใจหยุดเต้น PEA/Asystole',       youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc12', slug: 'post-rosc-care',                 title: 'บทที่ 12: การดูแลหลังภาวะหัวใจหยุดเต้น (Post-ROSC)', youtubeId: '', orientation: 'portrait', summary: '' },
  { lessonId: 'pc13', slug: 'pharmacology',                   title: 'บทที่ 13: เภสัชวิทยาใน ACLS (Pharmacology)',     youtubeId: '', orientation: 'portrait', summary: '' },
];

// แปลง courseVideos → map { lessonId: [{ platform, label, url, orientation }] }
// สำหรับ deriveLesson ใน preCourseContent.js (รูปแบบเดียวกับ BLS lessonVideos)
// บทที่ยัง youtubeId ว่าง จะได้ array ว่าง (ไม่แสดงการ์ดวิดีโอ)
export const lessonVideoMap = courseVideos.reduce((acc, v) => {
  acc[v.lessonId] = v.youtubeId
    ? [{ platform: 'youtube', label: 'ดูคลิป', url: `https://youtu.be/${v.youtubeId}`, orientation: v.orientation }]
    : [];
  return acc;
}, {});
