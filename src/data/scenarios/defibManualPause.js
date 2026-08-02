// เคส Defibrillation & Electrical Therapy: Manual defibrillator ใน ER — ตั้งพลังงาน,
// ลด peri-shock pause, กดต่อทันทีหลังช็อก, ช็อกซ้ำตามรอบพร้อมยา, ยืนยัน ROSC
export const defibManualPause = {
  id: 'df-manual-01',
  title: 'VF ในห้องฉุกเฉิน',
  subtitle: 'หญิงวัย 62 ปี arrest ในห้อง ER กำลัง CPR ทีมมี manual defibrillator พร้อม',
  level: 'intermediate',
  track: 'manual',
  course: 'defib',
  hiddenCause: null,
  story: [
    {
      say: { who: 'att_dech', pose: 'stern', text: 'จอ monitor ขึ้น VF — ทีมกำลังกด CPR อยู่ ต้องตั้งพลังงานช็อกเท่าไหร่?' },
      t: 5,
      fx: { rhythm: 'vf', cpr: true, firstCPR: true },
    },
    {
      choice: {
        q: 'จะตั้งพลังงานช็อกสำหรับเครื่อง biphasic เท่าไหร่?',
        options: [
          {
            tgt: 'DEFIB', label: 'ตั้งตามคำแนะนำผู้ผลิตเครื่อง (หรือใช้ค่าสูงสุดถ้าไม่ทราบ)', ok: true,
            then: [{ say: { who: 'fon_defib', pose: 'talk', text: 'ตั้งพลังงานแล้วค่ะ ชาร์จเครื่อง!' }, t: 3 }],
          },
          { tgt: 'DEFIB', label: 'ตั้งพลังงานต่ำสุดของเครื่องเพื่อความปลอดภัย', ok: false, why: 'พลังงานต่ำเกินไปอาจช็อกไม่สำเร็จ (unsuccessful shock) — ใช้ตามคำแนะนำเครื่อง' },
          { tgt: 'DEFIB', label: 'ไม่ต้องตั้งพลังงาน ใช้โหมด auto อย่างเดียว', ok: false, why: 'เครื่อง manual ต้องตั้งพลังงานเอง ไม่ใช่ auto แบบ AED' },
        ],
      },
    },
    {
      choice: {
        q: 'ชาร์จเครื่องเสร็จแล้ว จะสั่งช็อกอย่างไรให้ปลอดภัยและเสียเวลาน้อยที่สุด (ลด peri-shock pause)?',
        options: [
          {
            tgt: 'DEFIB', label: 'สั่ง "หยุดกด ถอยห่าง" สั้น ๆ เช็คปลอดภัยแล้วช็อกทันที', ok: true,
            then: [
              { inter: 'ช็อก!', drama: 'red', t: 3, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ช็อกแล้ว! กดต่อทันทีครับ' }, t: 3, fx: { cpr: true } },
            ],
          },
          { tgt: 'YOU', label: 'หยุดกดนานเพื่อเช็คจังหวะซ้ำหลายรอบก่อนช็อก', ok: false, why: 'หยุดกดนานเกินไปก่อนช็อก (peri-shock pause) ลดโอกาสรอด — เช็คให้ปลอดภัยแล้วช็อกให้เร็วที่สุด', worsen: true },
          { tgt: 'DEFIB', label: 'ให้คนกดหน้าอกต่อระหว่างช็อกเพื่อไม่ให้เสียจังหวะ', ok: false, why: 'ห้ามสัมผัสตัวผู้ป่วยขณะช็อกเด็ดขาด อันตรายไฟดูด ต้องถอยห่างทุกคน' },
        ],
      },
    },
    {
      choice: {
        q: 'ช็อกไปแล้ว จะทำอะไรต่อทันทีโดยเสียเวลาให้น้อยที่สุด?',
        options: [
          {
            tgt: 'YOU', label: 'กลับไปกดหน้าอกต่อทันทีไม่หยุดเช็คชีพจร', ok: true,
            then: [{ say: { who: 'att_dech', pose: 'talk', text: 'ดี — กดต่อเนื่อง 2 นาทีแล้วค่อยเช็คจังหวะใหม่' }, t: 4 }],
          },
          { tgt: 'YOU', label: 'หยุดเช็คชีพจรทันทีหลังช็อก', ok: false, why: 'เสียเวลาเปล่า — จังหวะหลังช็อกอาจยังไม่กลับมาทันที กดหน้าอกต่อทันทีดีกว่า', worsen: true },
          { tgt: 'DEFIB', label: 'ชาร์จเครื่องรอช็อกซ้ำทันทีโดยไม่กดหน้าอกคั่น', ok: false, why: 'ต้องกดหน้าอกต่อเนื่อง 2 นาทีก่อนวิเคราะห์/ช็อกรอบถัดไป ไม่ช็อกรัว ๆ ติดกัน' },
        ],
      },
    },
    {
      choice: {
        q: 'ครบ 2 นาที เช็คจังหวะยังเป็น VF อยู่ จะทำอย่างไรต่อ?',
        options: [
          {
            tgt: 'DEFIB', label: 'ช็อกซ้ำรอบ 2 ด้วยพลังงานเท่าเดิมหรือสูงขึ้นตามเครื่องแนะนำ + ให้ epinephrine ตามรอบ', ok: true,
            then: [{ inter: 'ช็อกรอบ 2!', drama: 'red', t: 3, fx: { shock: true, epi: true } }],
          },
          { tgt: 'YOU', label: 'หยุดช็อกเพราะคิดว่าไม่ได้ผลแล้ว', ok: false, why: 'VF refractory (ช็อกไม่หาย) ยังต้องช็อกซ้ำต่อตามรอบพร้อมให้ยา ไม่หยุดกลางคัน', worsen: true },
          { tgt: 'DEFIB', label: 'ลดพลังงานลงเผื่อว่าตั้งสูงไปตั้งแต่แรก', ok: false, why: 'รอบถัดไปพลังงานเท่าเดิมหรือสูงขึ้นตามเครื่องแนะนำ ไม่ลดลง' },
        ],
      },
    },
    {
      choice: {
        q: 'ช็อกรอบ 2 + ให้ยาแล้ว เช็คจังหวะใหม่กลายเป็น organized rhythm มีชีพจร จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'ยืนยัน ROSC ด้วยคลำชีพจร + หยุดกด + ดูแลหลัง ROSC', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 4 },
              { say: { who: 'fon_defib', pose: 'happy', text: 'ชีพจรแรงดีค่ะ! ROSC แล้ว' }, t: 4, fx: { rosc: true } },
            ],
          },
          { tgt: 'YOU', label: 'กดหน้าอกต่อทั้งที่มีชีพจรแล้ว', ok: false, why: 'มีชีพจรแล้วต้องหยุดกด ไม่กดทับจังหวะหัวใจที่กลับมาเอง' },
          { tgt: 'DEFIB', label: 'ชาร์จช็อกซ้ำอีกรอบทั้งที่จังหวะกลับปกติแล้ว', ok: false, why: 'จังหวะกลับปกติมีชีพจรแล้ว ไม่มีข้อบ่งชี้ช็อกซ้ำ' },
        ],
      },
    },
    { end: true },
  ],
};
