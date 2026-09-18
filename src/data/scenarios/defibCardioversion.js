// เคส Defibrillation & Electrical Therapy: Synchronized cardioversion สำหรับ unstable tachycardia
// ขอบเขต: แยก unstable tachy จาก VF (ต้องใช้ sync ไม่ใช่ defib ธรรมดา), กด Sync + เช็ค marker บน QRS,
// sedation สั้น ๆ ถ้าเวลาเอื้อ, สั่งช็อกแบบกดค้าง (sync delay), ติดตามหลังจังหวะกลับปกติ
export const defibCardioversion = {
  id: 'df-electrical-01',
  title: 'ใจสั่นรุนแรง ความดันตก',
  subtitle: 'หญิงวัย 40 ปี ใจสั่นเฉียบพลัน ความดัน 78/50 ซึมลง — monitor ขึ้นจังหวะเร็วสม่ำเสมอ QRS แคบ',
  level: 'megacode',
  track: 'electrical',
  course: 'defib',
  hiddenCause: null,
  story: [
    { say: { who: 'att_dech', pose: 'stern', text: 'ความดันตก ซึมลง จังหวะเร็ว — นี่คือ unstable tachycardia ต้องรีบแก้ไข ทำอะไรก่อน?' }, t: 5, fx: { rhythm: 'tachy' } },
    {
      choice: {
        q: 'อาการไม่คงที่ (unstable) จาก tachycardia ต้องรักษาด้วยวิธีใดเร่งด่วนที่สุด?',
        options: [
          {
            tgt: 'DEFIB', label: 'เตรียม Synchronized Cardioversion ทันที', ok: true,
            then: [{ say: { who: 'fon_defib', pose: 'talk', text: 'เตรียมเครื่อง sync cardioversion แล้วค่ะ' }, t: 3 }],
          },
          { tgt: 'YOU', label: 'ให้ยาลดจังหวะหัวใจก่อน รอดูอาการ', ok: false, why: 'อาการไม่คงที่ (unstable) ต้องรีบแก้ด้วยไฟฟ้าทันที ไม่รอยาออกฤทธิ์', worsen: true },
          { tgt: 'DEFIB', label: 'ช็อกแบบ unsynchronized (defibrillation) เหมือน VF', ok: false, why: 'มีชีพจรและจังหวะ organized ต้องใช้ synchronized cardioversion ไม่ใช่ defibrillation ธรรมดา' },
        ],
      },
    },
    {
      choice: {
        q: 'เตรียมเครื่องแล้ว จะกดปุ่ม "Sync" อย่างไร?',
        options: [
          {
            tgt: 'DEFIB', label: 'กดปุ่ม Sync เปิดโหมด แล้วเช็คให้เห็นเครื่องหมาย sync ตรงยอด QRS ก่อนช็อก', ok: true,
            then: [{ say: { who: 'att_dech', pose: 'talk', text: 'ตั้ง sync ถูกต้อง เห็นจุด sync บน QRS ทุกลูกแล้ว' }, t: 4 }],
          },
          { tgt: 'DEFIB', label: 'ข้ามขั้นตอนกด Sync ช็อกแบบปกติเลย', ok: false, why: 'ถ้าไม่กด sync เครื่องจะช็อกแบบสุ่มจังหวะ เสี่ยงช็อกโดน T wave กระตุ้นให้เป็น VF ได้', worsen: true },
          { tgt: 'DEFIB', label: 'กด sync แต่ไม่เช็คว่าเครื่องหมายขึ้นตรง QRS จริงไหม', ok: false, why: 'ต้องเช็คให้แน่ใจว่าเครื่องหมาย sync ขึ้นตรงยอด QRS ทุกลูกก่อนช็อกเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยยังรู้สึกตัวอยู่บ้าง จะทำอะไรก่อนช็อก (ถ้าเวลาเอื้ออำนวย)?',
        options: [
          {
            tgt: 'YOU', label: 'ให้ยาระงับปวด/sedation สั้น ๆ ก่อนถ้าเวลาเอื้ออำนวยและไม่ทำให้ล่าช้า', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ sedation แล้วค่ะ พร้อมช็อก' }, t: 3 }],
          },
          { tgt: 'YOU', label: 'ช็อกทันทีโดยไม่พิจารณา sedation เลยทั้งที่ผู้ป่วยยังรู้สึกตัว', ok: false, why: 'ถ้าเวลาเอื้ออำนวยและผู้ป่วยยังรู้สึกตัว ควรพิจารณา sedation สั้น ๆ ก่อน เพื่อลดความเจ็บปวด/ตกใจ' },
          { tgt: 'YOU', label: 'รอ sedation ออกฤทธิ์เต็มที่นานหลายนาทีทั้งที่อาการทรุดลง', ok: false, why: 'ถ้าอาการทรุดเร็วเกินไป ห้ามรอ sedation นาน ต้อง cardiovert ทันทีตามความจำเป็น', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'พร้อมช็อกแล้ว จะสั่งช็อกอย่างไรให้ปลอดภัย?',
        options: [
          {
            tgt: 'DEFIB', label: 'ตะโกน "ถอยห่าง" เช็คไม่มีใครสัมผัสตัว แล้วกดปุ่มช็อกค้างไว้จนเครื่องยิง', ok: true,
            then: [{ inter: 'Cardiovert!', drama: 'red', t: 3, fx: { shock: true } }],
          },
          { tgt: 'YOU', label: 'กดปุ่มช็อกแป๊บเดียวแล้วปล่อยทันที', ok: false, why: 'โหมด sync ต้องกดปุ่มค้างไว้จนเครื่องยิงจริงตรง QRS ปล่อยเร็วเกินอาจไม่ยิง', worsen: true },
          { tgt: 'DEFIB', label: 'ไม่เตือนทีมให้ถอยห่างก่อนช็อก', ok: false, why: 'ต้องเตือนและเช็คความปลอดภัยทุกครั้งก่อนช็อก ป้องกันไฟดูดทีม' },
        ],
      },
    },
    {
      choice: {
        q: 'ช็อกแล้วจังหวะกลับเป็น sinus ปกติ ความดันเริ่มขึ้น จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'เช็คชีพจร/ความดันซ้ำ + monitor ต่อเนื่อง + บันทึกผล', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 4, fx: { rhythm: 'nsr' } },
              { say: { who: 'att_dech', pose: 'happy', text: 'ความดันขึ้นมา 100/70 แล้ว จังหวะกลับปกติ เก่งมาก' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'ช็อกซ้ำทันทีอีกรอบทั้งที่จังหวะกลับปกติแล้ว', ok: false, why: 'จังหวะกลับปกติมีชีพจรและความดันขึ้นแล้ว ไม่มีข้อบ่งชี้ช็อกซ้ำ' },
          { tgt: 'YOU', label: 'ปล่อยผู้ป่วยไว้เฉย ๆ ไม่ต้อง monitor ต่อ', ok: false, why: 'ต้องเฝ้า monitor ต่อเนื่องหลัง cardioversion เสมอ เผื่อจังหวะกลับมาไม่คงที่' },
        ],
      },
    },
    { end: true },
  ],
};
