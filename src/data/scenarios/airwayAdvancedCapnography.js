// เคส Airway Management: ทางเดินหายใจขั้นสูงระหว่าง CPR — SGA แทน BVM ที่ล้มเหลว,
// ยืนยันตำแหน่งด้วย waveform capnography, กด CPR ต่อเนื่องไม่หยุดเพื่อช่วยหายใจ, จับสัญญาณ ROSC จาก EtCO2
export const airwayAdvancedCapnography = {
  id: 'aw-advanced-01',
  title: 'Bag-mask ไม่พอ ต้องอุปกรณ์ขั้นสูง',
  subtitle: 'หญิงวัย 55 ปี arrest ในโรงพยาบาล กำลัง CPR อยู่ — bag-mask ช่วยหายใจได้ยาก ท้องเริ่มป่อง',
  level: 'megacode',
  track: 'advanced',
  course: 'airway',
  hiddenCause: null,
  story: [
    {
      say: { who: 'att_dech', pose: 'stern', text: 'Bag-mask ยาก ท้องเริ่มป่อง (อากาศเข้ากระเพาะ) — CPR กำลังดำเนินอยู่ ต้องจัดการทางเดินหายใจอย่างไรต่อ' },
      t: 5,
      fx: { rhythm: 'pea', cpr: true, firstCPR: true },
    },
    { say: { who: 'krit_airway', pose: 'talk', text: 'หมอกฤต วิสัญญีครับ ผมรับหัวเตียงเอง… ท้องป่องคือ<span class="cbs-em">ลมลงกระเพาะ</span> ไม่ใช่ลงปอด — ใจเย็นครับ เราแก้ได้' }, t: 4 },
    {
      choice: {
        q: 'Bag-mask seal ยาก ท้องเริ่มป่อง จะเลือกอุปกรณ์ทางเดินหายใจขั้นสูงอะไรระหว่าง CPR?',
        options: [
          {
            tgt: 'AIRWAY', label: 'ใส่ Supraglottic Airway (SGA/i-gel) โดยไม่หยุดกดหน้าอก', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'ใส่เข้าแล้วครับ ไม่ต้องหยุดกดเลย' }, t: 4 }],
          },
          { tgt: 'AIRWAY', label: 'หยุดกดหน้าอกเพื่อใส่ ET tube ให้เรียบร้อยก่อน', ok: false, why: 'ไม่จำเป็นต้องหยุดกดนานเพื่อใส่ ET tube ตั้งแต่แรก — SGA ใส่ได้เร็วโดยไม่ต้องหยุดกด' },
          { tgt: 'AIRWAY', label: 'บีบ bag แรงขึ้นแทนไม่ต้องเปลี่ยนอุปกรณ์', ok: false, why: 'ท้องป่องคืออากาศเข้ากระเพาะจากแรงดันสูง บีบแรงขึ้นยิ่งแย่ ต้องเปลี่ยนอุปกรณ์ที่ seal ดีกว่า', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ใส่ SGA แล้ว จะยืนยันตำแหน่งถูกต้องด้วยอะไร?',
        options: [
          {
            tgt: 'AIRWAY', label: 'ต่อ waveform capnography ดูรูปคลื่นและตัวเลข EtCO2', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'EtCO2 ขึ้นคลื่นสวย ตัวเลข 30 mmHg ตำแหน่งถูกต้องค่ะ' }, t: 5 },
              { say: { who: 'krit_airway', pose: 'talk', text: 'ดูจอครับ… คลื่น<span class="cbs-em">รูปสี่เหลี่ยมสม่ำเสมอทุกลมหายใจ</span> — ยืนยันตำแหน่งได้แม่นกว่าหูฟังทุกตัวครับ' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ฟัง breath sound ข้างเดียวก็พอ', ok: false, why: 'ฟัง breath sound ช่วยได้ แต่มาตรฐานยืนยันที่แม่นยำที่สุดคือ waveform capnography ต่อเนื่อง' },
          { tgt: 'AIRWAY', label: 'ดูอกขยับเฉย ๆ ไม่ต้องต่อเครื่องอะไร', ok: false, why: 'อกขยับอาจลวงตาได้ ต้องมี waveform capnography ยืนยันและ monitor ต่อเนื่อง' },
        ],
      },
    },
    {
      choice: {
        q: 'ใส่ SGA แล้ว ทีมควรกดหน้าอก + ช่วยหายใจอย่างไร?',
        options: [
          {
            tgt: 'YOU', label: 'กดหน้าอกต่อเนื่องไม่หยุด + ช่วยหายใจ 1 ครั้งทุก 6 วินาทีแบบไม่ประสาน (asynchronous)', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'ถูกต้อง — มีทางเดินหายใจขั้นสูงแล้วไม่ต้องหยุดกดเพื่อช่วยหายใจอีก' }, t: 5 },
              { say: { who: 'krit_airway', pose: 'stern', text: 'ผมเฝ้าตัวเลขให้… EtCO2 ระหว่างกดต้อง<span class="cbs-em">อย่างน้อย 10 mmHg</span> — ถ้าต่ำกว่านั้น คุณภาพการกดยังไม่พอครับ' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'กลับไปสลับ 30:2 เหมือนเดิม', ok: false, why: 'มีทางเดินหายใจขั้นสูงแล้ว เปลี่ยนเป็นกดต่อเนื่อง + ช่วยหายใจ asynchronous ไม่ต้องสลับหยุด' },
          { tgt: 'AIRWAY', label: 'หยุดกดทุกครั้งที่ช่วยหายใจเหมือน BVM ปกติ', ok: false, why: 'ข้อดีของทางเดินหายใจขั้นสูงคือไม่ต้องหยุดกดเพื่อช่วยหายใจอีกต่อไป', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'EtCO2 พุ่งขึ้นกะทันหันเป็น 45 ระหว่าง CPR หมายถึงอะไร ควรทำอะไร?',
        options: [
          {
            tgt: 'YOU', label: 'อาจเป็นสัญญาณ ROSC — คลำชีพจร/ดู rhythm ทันที', ok: true,
            then: [
              { inter: 'EtCO2 พุ่ง!', drama: 'red', t: 3 },
              { say: { who: 'krit_airway', pose: 'happy', text: 'EtCO2 กระโดดจาก 30 เป็น 45 ในพริบตา… <span class="cbs-em">เลือดกลับมาไหลจริง</span> — สัญญาณ ROSC ที่สวยที่สุดครับ คลำชีพจรเลย' }, t: 4 },
              { say: { who: 'fon_defib', pose: 'happy', text: 'ชีพจรกลับมาแล้วค่ะ! ROSC!' }, t: 4, fx: { rosc: true } },
            ],
          },
          { tgt: 'YOU', label: 'เพิกเฉยเพราะคิดว่าเป็นความผิดพลาดของเครื่อง', ok: false, why: 'EtCO2 พุ่งกะทันหันระหว่าง CPR เป็นสัญญาณสำคัญของ ROSC ต้องเช็คชีพจรทันที', worsen: true },
          { tgt: 'YOU', label: 'หยุดกดทันทีโดยไม่เช็คอะไร', ok: false, why: 'ต้องคลำชีพจร/ดู rhythm ยืนยันก่อนหยุดกด ไม่ใช่หยุดตามความรู้สึก' },
        ],
      },
    },
    {
      choice: {
        q: 'ROSC แล้ว จะดูแลทางเดินหายใจต่ออย่างไร?',
        options: [
          {
            tgt: 'YOU', label: 'คง SGA ไว้ ต่อ capnography เฝ้า EtCO2 + ปรับให้ normoxia/normocapnia', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 4 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก จำไว้: SGA ไม่ต้องหยุดกด, capnography ยืนยันตำแหน่ง + จับสัญญาณ ROSC' }, t: 5 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ถอด SGA ออกทันทีเพราะ ROSC แล้ว', ok: false, why: 'ยังไม่รู้สึกตัวดี ทางเดินหายใจขั้นสูงยังจำเป็นอยู่ ถอดเมื่อรู้สึกตัวดีและมี gag reflex กลับมา' },
          { tgt: 'YOU', label: 'เร่งออกซิเจน 100% ต่อเนื่องไปเรื่อย ๆ ไม่ต้องปรับ', ok: false, why: 'หลัง ROSC ควรปรับออกซิเจนให้ได้ SpO2 94-99% ไม่ใช่ให้ 100% ต่อเนื่องเสี่ยง hyperoxia' },
        ],
      },
    },
    { end: true },
  ],
};
