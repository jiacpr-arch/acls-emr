// เคส: Trauma Arrest (megacode) — PEA → VF → ROSC
// จุดสอน: reversible causes ของ trauma arrest (Tension pneumothorax + Hypovolemia)
//         ต้องแก้ควบคู่ CPR ไม่งั้นไม่ ROSC · PEA เป็น non-shockable (ห้าม shock)
//         พอกลายเป็น VF จึง shock + Amiodarone · ระวัง hypothermia
export const traumaArrest = {
  id: 'trauma-pea-vf-01',
  title: 'Trauma Arrest — รถชนความดันตก',
  subtitle: 'ชายอายุ 30 ปี อุบัติเหตุรถชน หมดสติ ความดันตก มาถึง ER แล้วหัวใจหยุดเต้น',
  level: 'megacode',
  track: 'special',
  course: 'acls',
  hiddenCause: 'tension-pneumothorax',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้อุบัติเหตุรถชนคันนี้ <span class="cbs-em">คลำชีพจรไม่ได้แล้วค่ะ!</span> ความดันตกมาตลอดทาง!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'Trauma arrest เคสนี้ยาก… <span class="cbs-em">ต้องกู้ชีพไปพร้อมกับหยุดเลือด</span> คุณคือ Team Leader — เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + C-spine precaution เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ! <span class="cbs-em">Cardiac arrest!</span> คอประคองไว้แล้วนะคะ' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่ยืนยัน arrest และยังไม่รู้ rhythm — ประเมินก่อน' },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ทันทีก่อนอย่างอื่น', ok: false, why: 'ต้องยืนยัน arrest + เริ่ม CPR ก่อน advanced airway เสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่มีชีพจร — ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + แปะ pads ดู rhythm', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">Sinus tachycardia rate 140 แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'หยุดทุกอย่างเพื่อใส่ท่อช่วยหายใจก่อน', ok: false, why: 'CPR มาก่อน advanced airway เสมอ — ใส่ท่อก่อนกดทำให้ perfusion หายไป', worsen: true },
          { tgt: 'YOU', label: 'รอ x-ray + lab ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'มี QRS เป็นจังหวะแต่หัวใจไม่บีบ = <span class="cbs-em">PEA</span> ในเคส trauma มันมี "สาเหตุ" เสมอ — H\'s &amp; T\'s' }, t: 4 },
    {
      choice: {
        q: 'PEA — ยาและการจัดการต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เปิดเส้นใหญ่สองข้างแล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… <span class="cbs-em">ทำไมเขาถึง arrest?</span> กดทั้งวันไม่แก้ต้นเหตุก็ไม่กลับมา' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    {
      choice: {
        q: 'ตรวจร่างกายเร็ว — เจออะไรก่อนใน trauma PEA',
        options: [
          {
            tgt: 'YOU', label: 'ฟังปอด/ดูหลอดเลือดคอ — สงสัย tension pneumothorax', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'ปอดขวาเงียบ! <span class="cbs-em">Trachea เบี่ยงซ้าย หลอดเลือดคอโป่ง</span> — Tension pneumothorax ค่ะ!' }, t: 8 },
              { inter: 'TENSION PNEUMOTHORAX!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'PEA ยัง non-shockable — และยังไม่ได้หาสาเหตุ', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi 5 mg เพิ่มขนาดให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่แก้ต้นเหตุ' },
        ],
      },
    },
    {
      choice: {
        q: 'Tension pneumothorax — แก้ทันทีอย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'Needle thoracentesis ทันที (แล้วตามด้วย chest tube)', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'แทงเข็มระบายลม… <span class="cbs-em">ลมพุ่งออก "ฟู่~"</span> อกขยับดีขึ้นแล้วครับ!', fx: { cpr: true } }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี! แต่ความดันยังตก — <span class="cbs-em">เขาเสียเลือดอยู่</span> pelvis กับ femur หักด้วย' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg ก่อน', ok: false, why: 'ไม่แก้ tension pneumothorax — ลมยังกดหัวใจอยู่ กดต่อก็ไม่ ROSC', worsen: true },
          { tgt: 'DEFIB', label: 'Shock 200 J เดี๋ยวนี้', ok: false, why: 'ยัง non-shockable และไม่แก้ต้นเหตุ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Hypovolemia จากเลือดออก — จัดการอย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'Massive transfusion protocol + pelvic binder + splint femur + ห้ามเลือดภายนอก', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'เลือดชุดแรกเข้าแล้วค่ะ! <span class="cbs-em">รัด pelvic binder + ดาม femur</span> เลือดออกภายนอกกดห้ามแล้ว', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR + resuscitation ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">จอเปลี่ยนเป็น VF ค่ะ!</span> สั่นพลิ้วแล้ว!' }, t: 6 },
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'หยุดกดไปใส่ ET tube ให้เสร็จก่อนค่อยให้เลือด', ok: false, why: 'ใส่ท่อได้ระหว่างกด แต่ห้ามหยุด CPR/ชะลอการให้เลือด — เลือดคือชีวิตในเคสนี้', worsen: true },
          { tgt: 'DRUG', label: 'ให้ crystalloid 3 ลิตร rapid แทนเลือด', ok: false, why: 'เลือดออกต้องให้เลือด (MTP) — สารน้ำมากทำให้ coagulopathy/เจือจางแย่ลง' },
        ],
      },
    },
    {
      choice: {
        q: 'VF — เครื่อง defib พร้อม',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!!" Shock 200 J แล้วกดต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อเลยครับ! <span class="cbs-em">ไม่เช็คชีพจร กดก่อน 2 นาที</span>', fx: { cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อน', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
          { tgt: 'DRUG', label: 'ให้ Amiodarone ก่อนค่อย shock', ok: false, why: 'ไฟฟ้ามาก่อนยาเสมอใน shockable rhythm' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock — ยาต่อไปของ VF',
        options: [
          {
            tgt: 'DRUG', label: 'ใส่ ET tube ระหว่างกด + Amiodarone 300 mg IV', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in!"</span> ท่อช่วยหายใจเข้าที่แล้ว เลือดยังเดินต่อเนื่องค่ะ', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">คลื่นเป็นจังหวะ… คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้นไปเลย', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — post-arrest care',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! รักษาอุณหภูมิ (T 35.5°C) + คุมเลือดออกต่อ + ส่ง OR/CT ด่วน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! P 120 BP 90/50 กลับมาแล้ว — คุณ<span class="cbs-em">แก้ tension pneumothorax &amp; เลือดออกควบคู่ CPR</span> trauma arrest ถึงรอด อย่าลืมอุ่นตัว กัน hypothermia!' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — shock = ทำให้ arrest ซ้ำ', worsen: true },
          { tgt: 'YOU', label: 'ปล่อยให้ตัวเย็นไว้เพื่อ neuroprotection', ok: false, why: 'ผู้ป่วยเลือดออก hypothermia ทำให้ coagulopathy แย่ลง — ต้องอุ่นตัวเชิงรุก' },
        ],
      },
    },
    { end: true },
  ],
};
