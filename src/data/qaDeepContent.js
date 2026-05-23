// Static fallback content for Q&A ACLS เชิงลึก page
// Schema:
//   page = { title, intro, coverImage }
//   items = Array<{
//     question: string,
//     answer:   string,    // Markdown supported via QASection
//     cover?:   Image,     // optional single cover image for the Q&A
//     infographics?: Array<Image>,
//   }>
// Image = { src: string, alt?: string, caption?: string }
//   - put files in public/images/qa-deep/

export const qaDeepPage = {
  title: 'Q&A ACLS เชิงลึก',
  intro: 'รวมคำถาม-คำตอบเชิงลึกประกอบ infographic สำหรับทบทวน ACLS',
  coverImage: null,
};

export const qaDeepItems = [
  {
    question: 'ทำไมต้องกด CPR ต่อเนื่องโดยรบกวนให้น้อยที่สุด?',
    answer:
      'การหยุดกดแต่ละครั้งทำให้ **coronary perfusion pressure (CPP) ตกลงทันที** และต้องใช้เวลา 15–30 วินาทีของการกดต่อเนื่องเพื่อให้ CPP กลับมาสูงพอที่จะ perfuse หัวใจ\n\n- **Chest Compression Fraction (CCF) ≥ 60%** (AHA 2020) ยิ่งสูงยิ่งดี ตั้งเป้า 80%\n- หยุดกดเฉพาะตอน rhythm check, shock delivery, pulse check (รวมไม่เกิน 10 วินาที)\n- ใส่ advanced airway เพื่อกดต่อเนื่องโดยไม่ต้องหยุดหายใจ',
    infographics: [],
  },
  {
    question: 'Epinephrine ให้เมื่อไหร่ ใน shockable vs non-shockable rhythm?',
    answer:
      '### Non-shockable (Asystole / PEA)\nให้ **Epinephrine 1 mg IV/IO ทันทีที่ตั้ง IV ได้** แล้วซ้ำทุก 3–5 นาที\n\n### Shockable (VF / pVT)\nให้ **Epinephrine หลัง shock ครั้งที่ 2** (หลัง CPR + shock 2 ครั้งแล้วยังไม่ตอบสนอง)\nซ้ำทุก 3–5 นาที',
    infographics: [],
  },
];
