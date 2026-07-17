// เคส BLS (MorRoo): หมดสติข้างสระว่ายน้ำ ตัวเปียก — AED ในสถานการณ์พิเศษ
// จุดสอน: ย้ายพ้นแอ่งน้ำ, เช็ดอกให้แห้งก่อนแปะแผ่น, แผ่นยา/pacemaker, ปลอดภัยก่อน shock
export const blsAedWet = {
  id: 'bls-aed-wet-01',
  title: 'หมดสติข้างสระว่ายน้ำ',
  subtitle: 'ชายวัย 55 ปี เดินขึ้นจากสระแล้วทรุดลงข้างสระ ตัวเปียกโชก นอนอยู่ในแอ่งน้ำ',
  level: 'intermediate',
  track: 'adult',
  course: 'bls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'คุณลุงเพิ่งขึ้นจากสระแล้วล้มเลยค่ะ! <span class="cbs-em">นอนแช่อยู่ในแอ่งน้ำ!</span>' }, t: 4 },
    { inter: 'มีคนหมดสติ!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ผู้ป่วยเปียกทั้งตัว นอนในแอ่งน้ำข้างสระ — <span class="cbs-em">คิดให้ดีก่อนแตะตัว</span>' }, t: 3 },
    {
      choice: {
        q: 'ผู้ป่วยนอนในแอ่งน้ำ',
        options: [
          {
            tgt: 'YOU', label: 'ดึงตัวพ้นแอ่งน้ำ ไปพื้นแห้ง แล้วเช็คการตอบสนอง', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ช่วยกันลากขึ้นมาบนพื้นแห้งแล้วครับ! เขย่าเรียก… <span class="cbs-em">ไม่ตอบสนอง!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'รีบเอา AED มาแปะทั้งที่นอนในแอ่งน้ำ', ok: false, why: 'อันตราย — น้ำนำไฟฟ้า ต้องย้ายผู้ป่วยพ้นแอ่งน้ำก่อนใช้ AED', worsen: true },
          { tgt: 'CPR', label: 'กดหน้าอกตรงนั้นเลยทั้งที่แช่น้ำ', ok: false, why: 'ย้ายพ้นแอ่งน้ำก่อน — ทั้งเพื่อความปลอดภัยตอนใช้ AED และพื้นแข็งกดได้คุณภาพกว่า' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่ตอบสนอง — รอบตัวมีพนักงานสระ 2 คน',
        options: [
          {
            tgt: 'YOU', label: 'ชี้ตัว "คุณโทร 1669! คุณวิ่งไปเอา AED หน้าสระ!" แล้วเช็คหายใจ+ชีพจร', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ไม่หายใจ… <span class="cbs-em">คลำชีพจรไม่ได้ค่ะ!</span>' }, t: 5 },
              { inter: 'หัวใจหยุดเต้น!', drama: 'red', t: 3, fx: { alarm: true } },
            ],
          },
          { tgt: 'YOU', label: 'ตะโกนลอย ๆ "ใครก็ได้ช่วยที!" แล้วรอ', ok: false, why: 'ตะโกนลอย ๆ ไม่มีใครขยับ — ชี้เจาะจงตัวคน มอบหน้าที่ชัดเจน' },
          { tgt: 'YOU', label: 'วิ่งไปเอา AED เองทิ้งผู้ป่วยไว้', ok: false, why: 'มีคนอื่นอยู่ — สั่งเขาไปเอา คุณอยู่ประเมินและเริ่ม CPR', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยัน arrest — AED กำลังมา',
        options: [
          {
            tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที ลึก 5-6 ซม. 100-120/นาที', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดเลยครับ! <span class="cbs-em">ไม่ต้องรอ AED</span> — กดไปจนเครื่องมาถึง!', fx: { cpr: true, firstCPR: true } }, t: 7 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'AED มาแล้วค่ะ! แต่… <span class="cbs-em">อกเขาเปียกน้ำเต็มไปหมดเลย</span>' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'ยืนรอ AED มาก่อนค่อยเริ่มทุกอย่าง', ok: false, why: 'ห้ามรอ — กดหน้าอกทันที ทุกนาทีที่ไม่กด โอกาสรอดลดลง 7-10%', worsen: true },
          { tgt: 'AIRWAY', label: 'จับแขวนหัวต่ำเอาน้ำออกจากปอดก่อน', ok: false, why: 'เสียเวลาและไม่ช่วย — น้ำในทางเดินหายใจจัดการด้วย CPR ตามปกติ' },
        ],
      },
    },
    {
      choice: {
        q: 'หน้าอกเปียกโชก — จะแปะแผ่น AED',
        options: [
          {
            tgt: 'DEFIB', label: 'เช็ดอกให้แห้งเร็ว ๆ ด้วยผ้าเช็ดตัว แล้วค่อยแปะแผ่น', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูก — <span class="cbs-em">อกเปียก ไฟจะวิ่งตามผิวน้ำ</span> ไม่ผ่านหัวใจ เช็ดแห้งก่อนแปะเสมอ' }, t: 4 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'เช็ดแห้งแล้ว… เดี๋ยว! <span class="cbs-em">มีก้อนนูนใต้ไหปลาร้าขวา — เครื่องกระตุ้นหัวใจ!</span>' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะทับไปเลยทั้งเปียก ๆ เครื่องคงทำงานเอง', ok: false, why: 'แผ่นติดไม่แน่น + ไฟวิ่งตามผิวน้ำ = shock ไม่ได้ผล ต้องเช็ดแห้งก่อน', worsen: true },
          { tgt: 'CPR', label: 'ไม่ต้องใช้ AED แล้ว กดอย่างเดียวพอ', ok: false, why: 'จังหวะ shockable ต้องการไฟฟ้า — CPR อย่างเดียวไม่ทำให้ VF หยุด' },
        ],
      },
    },
    {
      choice: {
        q: 'เจอเครื่องกระตุ้นหัวใจฝังใต้ไหปลาร้าขวา',
        options: [
          {
            tgt: 'DEFIB', label: 'เลื่อนแผ่นให้ห่างก้อนอย่างน้อย 1 นิ้ว (8 ซม.) แล้วแปะตามรูป', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'แปะเลี่ยงก้อนแล้วค่ะ เครื่องวิเคราะห์… <span class="cbs-em">"Shock advised!"</span>', fx: { rhythm: 'vf' } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะทับก้อนตรง ๆ ตามรูปเป๊ะ ๆ', ok: false, why: 'ห้ามแปะทับเครื่องกระตุ้นหัวใจ — บังกระแสไฟและอาจทำเครื่องเสีย เลื่อนห่างอย่างน้อย 1 นิ้ว' },
          { tgt: 'YOU', label: 'ไม่กล้า shock คนมีเครื่องฝัง หยุดทุกอย่าง', ok: false, why: 'ใช้ AED กับคนมีเครื่องฝังได้ — แค่เลื่อนแผ่นเลี่ยงตำแหน่งก้อน', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: '"Shock advised" — รอบตัวพื้นยังชื้น ๆ',
        options: [
          {
            tgt: 'DEFIB', label: 'เช็คไม่มีใครแตะตัว/ไม่มีใครยืนแช่แอ่งเดียวกัน แล้วกด shock', ok: true,
            then: [
              { inter: 'SHOCK!', t: 5, fx: { shock: true } },
              { say: { who: 'att_dech', pose: 'stern', text: 'ปล่อยไฟแล้ว — <span class="cbs-em">กดต่อทันที 2 นาที</span> อย่ารอดูจอ!' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'กดปุ่มเลยตอนพนักงานยังจับขาผู้ป่วยอยู่', ok: false, why: 'อันตรายมาก! ทุกคนต้องไม่แตะตัวผู้ป่วยก่อนปล่อยไฟ', worsen: true },
          { tgt: 'CPR', label: 'ไม่ shock กลัวไฟดูด กดต่ออย่างเดียว', ok: false, why: 'ย้ายพ้นแอ่งน้ำ+เช็ดแห้งแล้ว shock ได้ปลอดภัย — นี่คือจังหวะช่วยชีวิต' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock',
        options: [
          {
            tgt: 'CPR', label: 'กดหน้าอกต่อทันที 2 นาที รอเครื่องวิเคราะห์รอบใหม่', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อครับ!', fx: { cpr: true } }, t: 5 },
              { skip: 'CPR ต่อเนื่อง — EMS กำลังเดินทางมา', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เขาขยับ! ไอ… <span class="cbs-em">หายใจเองแล้วค่ะ คลำชีพจรได้!</span>' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดคลำชีพจรดูก่อนว่า shock ได้ผลไหม', ok: false, why: 'หลัง shock กดต่อทันที — เครื่องจะวิเคราะห์ให้เองตอนครบ 2 นาที' },
          { tgt: 'DEFIB', label: 'กด shock ซ้ำอีกทีต่อเนื่องกันเลย', ok: false, why: 'Shock ครั้งเดียวแล้วกดต่อ — ไฟซ้ำติด ๆ กันไม่ช่วยและเสียเวลากด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยหายใจเอง มีชีพจร — EMS มาถึง',
        options: [
          {
            tgt: 'YOU', label: 'จัดท่า recovery position เฝ้าการหายใจ ส่งต่อ EMS', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! จำไว้: <span class="cbs-em">พ้นน้ำ → เช็ดแห้ง → เลี่ยงเครื่องฝัง → เคลียร์คนก่อน shock</span> — AED ใช้ได้แทบทุกสถานการณ์ ถ้ารู้วิธีปรับ' }, t: 6 },
            ],
          },
          { tgt: 'CPR', label: 'กดหน้าอกต่อเผื่อไว้ให้ชัวร์', ok: false, why: 'มีชีพจรและหายใจแล้ว — กดต่อเป็นอันตราย จัดท่า recovery แทน' },
          { tgt: 'YOU', label: 'ปล่อยนอนหงายเฉย ๆ แล้วไปเก็บของ', ok: false, why: 'คนหมดสติที่นอนหงายเสี่ยงลิ้นตก/สำลัก — จัดท่าตะแคง (recovery) และเฝ้าจนส่งต่อ' },
        ],
      },
    },
    { end: true },
  ],
};
