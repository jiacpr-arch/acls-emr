// เคส IV/IO Access & Drug Delivery: เปลี่ยนไป Intraosseous (IO) เมื่อหาเส้น IV ไม่ได้ระหว่าง CPR เด็ก
// ขอบเขต: เปลี่ยนไป IO หลัง IV ล้มเหลว 2 ครั้ง, ตำแหน่ง proximal tibia, ยืนยันตำแหน่งก่อนให้ยา, ให้ยา+flush ทาง IO
export const ivIoAccess = {
  id: 'iv-io-01',
  title: 'หาเส้นไม่ได้ระหว่าง CPR',
  subtitle: 'เด็กชายวัย 4 ปี arrest จากภาวะขาดออกซิเจนรุนแรง กำลัง CPR — พยายามเปิดเส้น IV 2 ครั้งไม่สำเร็จ',
  level: 'intermediate',
  track: 'io',
  course: 'iv',
  bg: 'pediatric',
  hiddenCause: null,
  story: [
    {
      say: { who: 'nurse_mint', pose: 'panic', text: 'แทง IV ไป 2 ครั้งแล้วไม่ได้เลยค่ะ เส้นเด็กเล็กมาก ต้องให้ยาด่วน ทำอย่างไรต่อ?' },
      t: 5,
      fx: { rhythm: 'flat', cpr: true, firstCPR: true },
    },
    {
      choice: {
        q: 'พยายามเปิด IV ไม่สำเร็จ 2 ครั้งระหว่าง CPR ควรทำอะไรต่อ?',
        options: [
          {
            tgt: 'IV', label: 'เปลี่ยนไปเปิดเส้น Intraosseous (IO) ทันที', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'เตรียมเข็ม IO แล้วครับ' }, t: 3 }],
          },
          { tgt: 'IV', label: 'พยายามแทง IV ต่อไปเรื่อย ๆ จนกว่าจะได้', ok: false, why: 'ไม่ควรเสียเวลาแทง IV ซ้ำหลายครั้งระหว่าง arrest — หลังพยายาม IV ไม่สำเร็จให้เปลี่ยนไป IO ทันที', worsen: true },
          { tgt: 'IV', label: 'รอส่งต่อ ICU ค่อยเปิดเส้นให้', ok: false, why: 'ต้องให้ยาด่วนระหว่าง CPR ห้ามรอ ต้องหาทางเข้าเส้นเลือดทันทีด้วย IO' },
        ],
      },
    },
    {
      choice: {
        q: 'จะเลือกตำแหน่งใส่เข็ม IO ที่ไหนในเด็ก?',
        options: [
          {
            tgt: 'IV', label: 'กระดูกหน้าแข้งส่วนบน (proximal tibia)', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'ตำแหน่งมาตรฐานค่ะ คลำจุดสังเกตแล้ว' }, t: 3 }],
          },
          { tgt: 'IV', label: 'กระดูกซี่โครง', ok: false, why: 'ไม่ใช่ตำแหน่งมาตรฐาน IO เสี่ยงอันตรายรุนแรง ตำแหน่งหลักคือ proximal tibia', worsen: true },
          { tgt: 'IV', label: 'กะโหลกศีรษะ', ok: false, why: 'ไม่ใช่ตำแหน่งที่ใช้ใส่ IO เลย อันตรายมาก ใช้ proximal tibia' },
        ],
      },
    },
    {
      choice: {
        q: 'ใส่เข็ม IO เข้าไปแล้ว จะยืนยันตำแหน่งถูกต้องอย่างไร?',
        options: [
          {
            tgt: 'IV', label: 'เข็มตั้งมั่นคงไม่โยก + ดูดได้ไขกระดูก/เลือด + ดันน้ำเกลือทดสอบไหลลื่นไม่บวม', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'ทดสอบผ่านหมดครับ ไหลลื่นดี ให้ยาได้เลย' }, t: 4 }],
          },
          { tgt: 'IV', label: 'เห็นเข็มเข้าไปก็ให้ยาทันทีไม่ทดสอบอะไร', ok: false, why: 'ต้องยืนยันตำแหน่งก่อนให้ยาเสมอ ไม่งั้นยาอาจรั่วออกนอกกระดูก' },
          { tgt: 'IV', label: 'ดันแรง ๆ ให้เข็มทะลุกระดูกอีกด้านให้แน่ใจ', ok: false, why: 'ดันแรงเกินไปอาจทะลุกระดูกอีกด้าน อันตราย ใส่พอลึกตามมาตรฐานแล้วทดสอบ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยันตำแหน่งถูกต้องแล้ว จะให้ยา CPR (เช่น epinephrine) ทางเส้น IO อย่างไร?',
        options: [
          {
            tgt: 'IV', label: 'ให้ยาโด้สปกติเหมือนทาง IV + flush ตามด้วยน้ำเกลือ 5-10 mL ทุกครั้ง', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'flush ตามแล้วค่ะ ยาเข้ากระแสเลือดดี' }, t: 4, fx: { epi: true } }],
          },
          { tgt: 'IV', label: 'ให้ยาโด้สสูงกว่าปกติเพราะกลัวยาไม่เข้า', ok: false, why: 'ให้โด้สเท่าทาง IV ปกติ ไม่ต้องเพิ่ม — ที่สำคัญคือ flush ตามให้ยาไหลเข้ากระแสเลือด' },
          { tgt: 'IV', label: 'ไม่ flush ตามหลังให้ยา', ok: false, why: 'ถ้าไม่ flush ยาจะค้างอยู่ในเข็ม/โพรงกระดูก ไม่เข้ากระแสเลือดเต็มที่', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ให้ยาผ่าน IO ต่อเนื่องตามรอบ CPR — จังหวะหัวใจเริ่มกลับมา จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'ยืนยัน ROSC (คลำชีพจร) + คง IO ไว้ให้ยา/สารน้ำต่อระหว่างส่งต่อ', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 4 },
              { say: { who: 'att_dech', pose: 'happy', text: 'ชีพจรกลับมาแล้ว! เก่งมาก IO ช่วยได้ทันเวลา' }, t: 5, fx: { rosc: true } },
            ],
          },
          { tgt: 'IV', label: 'ถอดเข็ม IO ออกทันทีที่ ROSC', ok: false, why: 'คงเส้น IO ไว้ก่อน เผื่อต้องให้ยา/สารน้ำต่อระหว่างส่งต่อ ถอดเมื่อเปิด IV ถาวรได้แล้ว' },
          { tgt: 'YOU', label: 'หยุดกด CPR ไปก่อนโดยยังไม่เช็คชีพจรแน่ชัด', ok: false, why: 'ต้องคลำชีพจรยืนยัน ROSC ให้แน่ใจก่อนหยุดกด' },
        ],
      },
    },
    { end: true },
  ],
};
