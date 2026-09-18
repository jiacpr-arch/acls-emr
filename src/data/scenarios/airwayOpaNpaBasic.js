// เคส Airway Management (สำหรับ airway.morroo.com): เปิดทางเดินหายใจ + เลือก/ใส่ OPA
// ขอบเขต: head-tilt–chin-lift → เลือก OPA vs NPA ตาม gag reflex → วัดขนาด → เทคนิคใส่ → ติดตามผล
export const airwayOpaNpaBasic = {
  id: 'aw-opa-npa-01',
  title: 'หลังชักในวอร์ด',
  subtitle: 'ชายวัย 60 ปี ชักเกร็งแล้วหยุด ตอนนี้หมดสติ หายใจมีเสียงคราง (snoring)',
  level: 'basic',
  track: 'basicAirway',
  course: 'airway',
  bg: 'ward_night',
  hiddenCause: null,
  story: [
    { say: { who: 'att_dech', pose: 'stern', text: 'หมดสติหลังชัก หายใจมีเสียงคราง — สงสัยลิ้นตกอุดทางเดินหายใจ คุณจะทำอะไรก่อน?' }, t: 4 },
    { say: { who: 'krit_airway', pose: 'talk', text: 'หมอกฤต วิสัญญีครับ… ผมยืนหัวเตียงให้ เสียง snoring แบบนี้คือ<span class="cbs-em">ลิ้นตก</span> — ใจเย็น ๆ ทำทีละขั้นครับ' }, t: 4 },
    {
      choice: {
        q: 'หายใจมีเสียงคราง (snoring) จากลิ้นตกอุดทางเดินหายใจ จะทำอะไรก่อน?',
        options: [
          {
            tgt: 'AIRWAY', label: 'เปิดทางเดินหายใจด้วย head-tilt–chin-lift', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'เสียงครางเบาลงครับ... แต่ยังไม่หายสนิท' }, t: 4 }],
          },
          { tgt: 'YOU', label: 'ใส่ OPA ทันทีโดยไม่เปิดทางเดินหายใจก่อน', ok: false, why: 'ต้องเปิดทางเดินหายใจด้วยมือก่อนเสมอ ก่อนพิจารณาใส่อุปกรณ์ช่วย' },
          { tgt: 'YOU', label: 'พลิกคว่ำเอาน้ำลายออกทันทีโดยไม่ประเมินก่อน', ok: false, why: 'ยังไม่มีข้อบ่งชี้พลิกคว่ำ — เปิดทางเดินหายใจก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'เปิดทางเดินหายใจแล้วเสียงครางยังไม่หายสนิท จะเลือกอุปกรณ์ช่วยพยุงทางเดินหายใจอะไร (ประเมินแล้วไม่มี gag reflex)',
        options: [
          {
            tgt: 'AIRWAY', label: 'ใส่ Oropharyngeal Airway (OPA)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ไม่มี gag reflex เลยค่ะ — OPA เหมาะกับเคสนี้' }, t: 4 },
              { say: { who: 'krit_airway', pose: 'stern', text: 'ถูกครับ… แต่จำไว้ — ถ้า gag reflex กลับมาเมื่อไหร่ OPA จะกระตุ้นอาเจียน <span class="cbs-em">ตอนนั้นค่อยสลับเป็น NPA</span>' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ Nasopharyngeal Airway (NPA) แทน', ok: false, why: 'ไม่มี gag reflex ใส่ OPA ได้ปลอดภัยและมีประสิทธิภาพกว่า — NPA เก็บไว้ใช้เมื่อมี gag reflex หรือขากรรไกรค้าง' },
          { tgt: 'AIRWAY', label: 'ใส่ท่อช่วยหายใจ (ET tube) เลย', ok: false, why: 'ยังไม่จำเป็นต้องใส่ทางเดินหายใจขั้นสูง — ลองอุปกรณ์พื้นฐานก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'จะวัดขนาด OPA ที่เหมาะสมอย่างไร?',
        options: [
          {
            tgt: 'AIRWAY', label: 'วัดจากมุมปากถึงติ่งหู (หรือมุมกราม)', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'talk', text: 'ทาบข้างแก้มครับ… <span class="cbs-em">มุมปากถึงติ่งหู</span> — ยาวไปปลายจะกดฝาปิดกล่องเสียง สั้นไปจะดันลิ้นแทน' }, t: 4 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ขนาดพอดีครับ ใส่ได้เลย' }, t: 3 },
            ],
          },
          { tgt: 'AIRWAY', label: 'เลือกไซซ์กลาง ๆ เดา ๆ ไปก่อน', ok: false, why: 'ขนาดผิดอาจดันลิ้นลึกลงไปอุดกั้นมากขึ้น หรือสั้นเกินไม่ช่วยอะไร — ต้องวัดให้พอดีทุกครั้ง' },
          { tgt: 'AIRWAY', label: 'วัดจากปลายจมูกถึงติ่งหู', ok: false, why: 'นั่นคือวิธีวัดขนาด NPA ไม่ใช่ OPA' },
        ],
      },
    },
    {
      choice: {
        q: 'จะใส่ OPA อย่างไรให้ถูกวิธี?',
        options: [
          {
            tgt: 'AIRWAY', label: 'สอดปลายชี้ขึ้นเพดานปาก แล้วหมุน 180° ขณะเลื่อนลง', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'talk', text: 'หมุนนุ่ม ๆ… เข้าที่พอดีครับ ฟังตรงปาก — ลมผ่านเรียบ ไม่มีเสียงคราง <span class="cbs-em">ลมเข้าดี</span>' }, t: 4 },
              { say: { who: 'att_dech', pose: 'happy', text: 'ดีมาก — เสียงครางหายสนิทแล้ว หายใจโล่งขึ้นเยอะ' }, t: 5 },
            ],
          },
          { tgt: 'AIRWAY', label: 'สอดโค้งลงตามลิ้นตั้งแต่แรกโดยไม่หมุน', ok: false, why: 'วิธีนี้จะดันลิ้นลงไปอุดกั้นมากกว่าเดิม — สอดปลายชี้เพดานก่อนค่อยหมุน', worsen: true },
          { tgt: 'AIRWAY', label: 'ดันแรง ๆ ให้สุดเร็วที่สุด', ok: false, why: 'ต้องใส่นุ่มนวลตามแนวโค้งธรรมชาติ ใส่แรงอาจบาดเจ็บเพดานปาก' },
        ],
      },
    },
    {
      choice: {
        q: 'ใส่ OPA แล้วหายใจดีขึ้น จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'จัดท่า recovery position + เฝ้าดูการหายใจต่อเนื่อง + เตรียม suction ถ้ามีสิ่งคัดหลั่ง', ok: true,
            then: [
              { inter: 'ทางเดินหายใจโล่ง!', green: true, t: 4 },
              { say: { who: 'nurse_mint', pose: 'happy', text: 'SpO2 ขึ้นมา 98% แล้วค่ะ หายใจสม่ำเสมอดี' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ปล่อยนอนหงายทิ้งไว้เฉย ๆ', ok: false, why: 'เสี่ยงสำลักถ้ามีสิ่งคัดหลั่ง — ควรจัดท่า recovery หรือเฝ้าดูใกล้ชิด' },
          { tgt: 'AIRWAY', label: 'ถอด OPA ออกทันทีเพราะคิดว่าหายดีแล้ว', ok: false, why: 'ยังหมดสติอยู่ — ทิ้ง OPA ไว้จนกว่าจะรู้สึกตัวดีหรือมี gag reflex กลับมา (ตอนนั้นค่อยถอด)' },
        ],
      },
    },
    { end: true },
  ],
};
