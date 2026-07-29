// เคส BLS (สำหรับ MorRoo): ผู้ใหญ่หมดสติในที่สาธารณะ — CPR + AED เท่านั้น
// ขอบเขต BLS: ประเมิน → เรียกช่วย/โทร 1669 → CPR คุณภาพสูง → AED → ทำต่อจน EMS มา
// ไม่มียา ไม่มีการอ่าน rhythm เอง (AED เป็นคนวิเคราะห์)
export const blsCollapse = {
  id: 'bls-collapse-01',
  title: 'ล้มหมดสติในห้าง',
  subtitle: 'ชายวัยกลางคนล้มลงกับพื้นในห้างสรรพสินค้า คุณเป็นคนแรกที่วิ่งเข้าไป',
  level: 'basic',
  track: 'adult',
  course: 'bls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'มีคนล้ม!! ตรงนี้ค่ะ! ช่วยด้วย!' }, t: 4 },
    { inter: 'มีคนหมดสติ!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'คุณเป็นคนแรกที่ถึงตัว — <span class="cbs-em">ทุกวินาทีมีค่า</span> เริ่มจากอะไรก่อน?' }, t: 3 },
    {
      choice: {
        q: 'สิ่งแรกที่ต้องทำ',
        options: [
          {
            tgt: 'YOU', label: 'ดูความปลอดภัยรอบตัวก่อนเข้าไปช่วย', ok: true,
            then: [{ say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — <span class="cbs-em">Scene safety ก่อนเสมอ</span> ถ้าที่เกิดเหตุอันตราย คุณจะเป็นเหยื่อรายต่อไป' }, t: 4 }],
          },
          { tgt: 'CPR', label: 'กระโดดเข้าไปกดหน้าอกทันที', ok: false, why: 'ต้องเช็คความปลอดภัยของที่เกิดเหตุก่อน — เข้าไปมั่วอาจเจออันตราย' },
          { tgt: 'AIRWAY', label: 'เป่าปากช่วยหายใจเลย', ok: false, why: 'ยังไม่ถึงขั้นนั้น และยังไม่ได้ประเมินด้วยซ้ำ' },
        ],
      },
    },
    {
      choice: {
        q: 'ที่เกิดเหตุปลอดภัย — ต่อไป',
        options: [
          {
            tgt: 'YOU', label: 'เขย่าไหล่ + ตะโกนเรียก "คุณ ๆ ได้ยินไหม!"', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'panic', text: 'เขย่าเรียกแล้ว… <span class="cbs-em">ไม่ตอบสนองเลยค่ะ!</span>' }, t: 6 }],
          },
          { tgt: 'AIRWAY', label: 'ก้มฟังเสียงหายใจนาน ๆ ให้แน่ใจ', ok: false, why: 'ยังไม่ถึงขั้นตอนนั้น — ตรวจการตอบสนองก่อน' },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกเลยไม่ต้องเรียก', ok: false, why: 'ต้องยืนยันว่าไม่ตอบสนองก่อนจึงเริ่ม' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่ตอบสนอง — สั่งการคนรอบข้าง',
        options: [
          {
            tgt: 'YOU', label: 'ชี้คนเจาะจง "คุณโทร 1669! คุณไปเอา AED!"', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'เยี่ยม — <span class="cbs-em">ชี้เจาะจงตัวคน</span> ถ้าตะโกนลอย ๆ จะไม่มีใครขยับ' }, t: 4 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'โทรแล้วค่ะ! คนไปเอา AED แล้ว!' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'ทิ้งผู้ป่วยวิ่งไปโทรเองแล้วค่อยกลับมา', ok: false, why: 'อย่าทิ้งผู้ป่วย — สั่งคนอื่นโทรและเอา AED แทน', worsen: true },
          { tgt: 'CPR', label: 'ยังไม่ต้องเรียกใคร กดไปเงียบ ๆ ก่อน', ok: false, why: 'ต้องเรียกช่วยเหลือ + ขอ AED ตั้งแต่แรก ยิ่งเร็วยิ่งรอด' },
        ],
      },
    },
    {
      choice: {
        q: 'เช็คการหายใจ/ชีพจร (ผู้ปฏิบัติมืออาชีพ) — ไม่เกิน 10 วินาที',
        options: [
          {
            tgt: 'YOU', label: 'ดูอกขยับ + คลำชีพจร carotid พร้อมกัน ≤10 วินาที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ไม่หายใจ หายใจเฮือกเป็นพัก ๆ <span class="cbs-em">คลำชีพจรไม่ได้ค่ะ!</span>' }, t: 6 },
              { inter: 'หัวใจหยุดเต้น!', drama: 'red', t: 4, fx: { alarm: true } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ฟังเสียงหายใจอย่างเดียว 30 วินาที', ok: false, why: 'ใช้เวลานานเกินไป — เช็คไม่เกิน 10 วินาที การหายใจเฮือก (gasping) = ไม่ปกติ' },
          { tgt: 'CPR', label: 'เริ่มกดโดยไม่เช็คอะไรเลย', ok: false, why: 'เช็คการหายใจ+ชีพจรเร็ว ๆ ก่อน (≤10 วิ) เพื่อยืนยัน' },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยันหัวใจหยุดเต้น — ลงมือ',
        options: [
          {
            tgt: 'CPR', label: 'กดหน้าอกกลางอก ลึก 5-6 ซม. เร็ว 100-120/นาที ปล่อยสุด', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดแล้ว! <span class="cbs-em">หนึ่ง-สอง-สาม-สี่…</span> ปล่อยให้อกคืนตัวสุดทุกครั้ง', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'อัตราส่วน <span class="cbs-em">30 กด : 2 เป่า</span> — ถ้าไม่ชำนาญเป่า กดอย่างเดียว (hands-only) ก็ยังดีกว่าไม่ทำ' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'เป่าปาก 5 ครั้งก่อนค่อยกด', ok: false, why: 'ผู้ใหญ่เริ่มด้วยการกดหน้าอกก่อน (C-A-B) ไม่ใช่เป่าก่อน', worsen: true },
          { tgt: 'CPR', label: 'กดเบา ๆ ตื้น ๆ กลัวซี่โครงหัก', ok: false, why: 'ต้องกดลึก 5-6 ซม. จริง — กดตื้นเลือดไม่ไปเลี้ยงสมอง' },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'talk', text: 'AED มาแล้วค่ะ! เปิดเครื่องแล้ว!' }, t: 12 },
    {
      choice: {
        q: 'AED มาถึงระหว่างกด CPR',
        options: [
          {
            tgt: 'DEFIB', label: 'แปะแผ่นตามรูป กดต่อจนเครื่องสั่ง "หยุดแตะตัว"', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'แปะแผ่นแล้ว เครื่องกำลังวิเคราะห์… <span class="cbs-em">"Shock advised — ถอยห่างจากผู้ป่วย"</span>' }, t: 8 },
            ],
          },
          { tgt: 'CPR', label: 'หยุดกดยาว ๆ รอ AED เสร็จค่อยกดใหม่', ok: false, why: 'กดต่อระหว่างแปะแผ่น หยุดให้สั้นที่สุดตอนเครื่องวิเคราะห์เท่านั้น', worsen: true },
          { tgt: 'DEFIB', label: 'รออ่าน rhythm บนจอเองก่อนตัดสินใจ', ok: false, why: 'AED วิเคราะห์ให้เอง — หน้าที่คุณคือทำตามที่เครื่องสั่ง' },
        ],
      },
    },
    {
      choice: {
        q: 'เครื่องบอก "Shock advised"',
        options: [
          {
            tgt: 'DEFIB', label: 'ตะโกน "ถอยห่าง!" กวาดตาให้ทุกคนถอย แล้วกดปุ่ม shock', ok: true,
            then: [
              { inter: 'SHOCK!', t: 5, fx: { shock: true } },
              { say: { who: 'att_dech', pose: 'stern', text: 'ปล่อยไฟแล้ว — <span class="cbs-em">กดหน้าอกต่อทันที!</span> อย่าเสียเวลาคลำชีพจร' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'กดปุ่ม shock เลยโดยไม่ต้องให้ใครถอย', ok: false, why: 'อันตราย! ต้องให้ทุกคนถอยห่างก่อนปล่อยไฟ ไม่งั้นคนช่วยโดนไฟด้วย', worsen: true },
          { tgt: 'CPR', label: 'ไม่ต้อง shock กดหน้าอกอย่างเดียวพอ', ok: false, why: 'เครื่องบอก shock advised = จังหวะที่ไฟช่วยได้ ต้อง shock' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock',
        options: [
          {
            tgt: 'CPR', label: 'กดหน้าอกต่อทันที 2 นาที แล้วให้ AED วิเคราะห์ใหม่', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อครับ! สลับคนกันทุก 2 นาทีกันเหนื่อย', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR + AED ต่อเนื่อง จน EMS มาถึง', t: 100 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'ผู้ป่วยเริ่มขยับ… <span class="cbs-em">ไอ แล้วหายใจเองแล้วค่ะ!</span> คลำชีพจรได้!' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดคลำชีพจรนาน ๆ ให้แน่ใจก่อน', ok: false, why: 'หลัง shock กดต่อทันที — อย่าเสียเวลาหยุดคลำ' },
          { tgt: 'AIRWAY', label: 'หยุด CPR ไปจัดท่าทางเดินหายใจก่อน', ok: false, why: 'กดหน้าอกต่อสำคัญกว่า หยุดกดยิ่งนานยิ่งแย่', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยหายใจเองแล้ว + EMS มาถึง',
        options: [
          {
            tgt: 'YOU', label: 'จัดท่า recovery position + ส่งต่อ EMS พร้อมเล่าสิ่งที่ทำ', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! <span class="cbs-em">CPR เร็ว + AED เร็ว = ชีวิต</span> คุณคือคนที่ต่อลมหายใจให้เขาจนหมอมาถึง' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'กดหน้าอกต่อไปเรื่อย ๆ แม้หายใจเองแล้ว', ok: false, why: 'มีชีพจร+หายใจเองแล้ว การกดต่อเป็นอันตราย — จัดท่า recovery แทน' },
          { tgt: 'DEFIB', label: 'กด shock ซ้ำอีกทีให้ชัวร์', ok: false, why: 'ผู้ป่วยฟื้นแล้ว ห้าม shock เด็ดขาด', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
