// เคส IV/IO Access & Drug Delivery: ให้ยาระหว่าง megacode — bolus + flush, ยกแขน, รอบเวลาให้ยา,
// จัดการเส้น IV ที่ infiltrate ระหว่าง CPR
export const ivDrugDelivery = {
  id: 'iv-drug-01',
  title: 'ให้ยาระหว่าง Megacode',
  subtitle: 'ชายวัย 58 ปี VF arrest กำลัง CPR ช็อกไปแล้ว 1 ครั้ง ทีมสั่งให้ epinephrine',
  level: 'megacode',
  track: 'drugs',
  course: 'iv',
  hiddenCause: null,
  story: [
    {
      say: { who: 'att_dech', pose: 'stern', text: 'ช็อกรอบแรกไปแล้ว ทีมสั่ง epinephrine — เส้น IV เปิดอยู่ที่แขน จะให้ยาอย่างไรให้ถูกต้อง?' },
      t: 5,
      fx: { rhythm: 'vf', cpr: true, firstCPR: true },
    },
    {
      choice: {
        q: 'จะให้ epinephrine ทางเส้นที่มีอยู่อย่างไร?',
        options: [
          {
            tgt: 'IV', label: 'ให้ epinephrine 1 mg IV bolus แล้ว flush ด้วยน้ำเกลือ 20 mL ทันที', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ยาและ flush แล้วค่ะ' }, t: 3, fx: { epi: true } }],
          },
          { tgt: 'IV', label: 'ให้ epinephrine แล้วไม่ flush ตาม', ok: false, why: 'ต้อง flush ด้วยน้ำเกลือ 20 mL ทุกครั้งหลังให้ยา ไม่งั้นยาค้างอยู่ในสายไม่เข้ากระแสเลือดเต็มที่', worsen: true },
          { tgt: 'IV', label: 'ผสม epinephrine เจือจางในถุงน้ำเกลือแล้วปล่อยหยดช้า ๆ', ok: false, why: 'ระหว่าง CPR arrest ให้เป็น bolus เร็วทางเส้นตรง ไม่ใช่หยดช้าแบบ infusion' },
        ],
      },
    },
    {
      choice: {
        q: 'ให้ยาแล้ว ต้องยกแขนข้างที่ให้ยาไหม เพื่อช่วยยาเข้ากระแสเลือดเร็วขึ้น?',
        options: [
          {
            tgt: 'IV', label: 'ยกแขนขึ้นสูงชั่วครู่หลัง flush', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'ยกแขนแล้วครับ ช่วยให้ยาไหลเข้าเร็วขึ้น' }, t: 3 }],
          },
          { tgt: 'IV', label: 'ปล่อยแขนห้อยลงตามปกติ', ok: false, why: 'การยกแขนช่วง flush ช่วยให้ยาไหลเข้าสู่ระบบไหลเวียนกลางได้เร็วขึ้น ควรทำถ้าทำได้' },
          { tgt: 'IV', label: 'กดรัดแขนไว้แน่น ๆ ไม่ให้ยาไหล', ok: false, why: 'ไม่ควรรัด/กดแขนขวางทางยา ควรปล่อยให้ไหลสะดวกและยกขึ้นช่วย', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ทีมถามว่าจะให้ epinephrine ซ้ำได้เมื่อไหร่ระหว่าง CPR?',
        options: [
          {
            tgt: 'YOU', label: 'ให้ซ้ำทุก 3-5 นาทีตลอดการ CPR', ok: true,
            then: [{ say: { who: 'att_dech', pose: 'talk', text: 'ถูกต้อง — ตั้งเวลาจับรอบให้ยาไว้เลย' }, t: 4 }],
          },
          { tgt: 'YOU', label: 'ให้ทุก 1 นาทีให้ถี่ที่สุด', ok: false, why: 'ถี่เกินไป มาตรฐานคือทุก 3-5 นาที ไม่ใช่ทุกนาที' },
          { tgt: 'YOU', label: 'ให้ครั้งเดียวพอตลอดทั้งเคส', ok: false, why: 'ต้องให้ซ้ำทุก 3-5 นาทีตราบเท่าที่ยัง CPR อยู่ ไม่ใช่ให้ครั้งเดียว', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'เส้น IV ที่แขนเริ่มบวม สงสัยเข็มหลุดออกนอกเส้น (infiltration) ระหว่าง CPR ต้องทำอะไร?',
        options: [
          {
            tgt: 'IV', label: 'หยุดใช้เส้นนั้นทันที เปลี่ยนไปเปิดเส้นใหม่หรือ IO แทน', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'เปิด IO สำรองแล้วค่ะ ให้ยาต่อได้' }, t: 4 }],
          },
          { tgt: 'IV', label: 'ฝืนให้ยาทางเส้นเดิมต่อไปเพราะไม่อยากเสียเวลาเปิดใหม่', ok: false, why: 'เส้นบวม/หลุดแล้ว ยาจะไม่เข้ากระแสเลือด ต้องเปลี่ยนเส้นทันทีไม่ฝืนใช้ต่อ', worsen: true },
          { tgt: 'IV', label: 'หยุดให้ยาไปเลยรอเปิดเส้นใหม่เสร็จก่อนค่อยทำอย่างอื่น', ok: false, why: 'ระหว่างเปิดเส้นใหม่ CPR/ช็อกต้องดำเนินต่อไปตามรอบ ไม่ใช่หยุดทุกอย่างรอ' },
        ],
      },
    },
    {
      choice: {
        q: 'เปิดเส้นใหม่ให้ยาต่อเนื่องตามรอบ — ช็อกรอบ 2 แล้วจังหวะกลับมามีชีพจร จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'ยืนยัน ROSC + บันทึกเวลาให้ยาแต่ละครั้งไว้ในบันทึก', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 4 },
              { say: { who: 'att_dech', pose: 'happy', text: 'ชีพจรกลับมาแล้ว! บันทึกยาที่ให้ไว้ครบ ส่งต่อ ICU ได้เลย' }, t: 5, fx: { rosc: true } },
            ],
          },
          { tgt: 'IV', label: 'ให้ epinephrine ซ้ำทันทีทั้งที่ ROSC แล้ว', ok: false, why: 'มีชีพจรแล้ว หยุดให้ epinephrine ตามรอบ arrest ไม่ใช่ให้ต่อเรื่อย ๆ' },
          { tgt: 'YOU', label: 'ไม่บันทึกเวลาให้ยา เดี๋ยวค่อยจำเอา', ok: false, why: 'ต้องบันทึกเวลาให้ยาทุกครั้งแบบ real-time เพื่อความปลอดภัยและส่งต่อข้อมูลถูกต้อง' },
        ],
      },
    },
    { end: true },
  ],
};
