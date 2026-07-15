// เคส: หญิงตั้งครรภ์สำลักสิ่งแปลกปลอม → arrest (megacode) — PEA → VF → ROSC
// จุดสอน: foreign body obstruction คือสาเหตุ arrest ที่ต้องเอาออก ·
//         CPR ในหญิงตั้งครรภ์ = manual left uterine displacement ลด aortocaval compression
//         + เตรียม resuscitative hysterotomy (perimortem C-section) ถ้าไม่ ROSC ~4 นาที ·
//         PEA เป็น non-shockable → พอเปลี่ยนเป็น VF จึง shock + Amiodarone
export const pregChoking = {
  id: 'preg-fb-arrest-01',
  title: 'สำลักจนหัวใจหยุด — คุณแม่ตั้งครรภ์ 32 สัปดาห์',
  subtitle: 'หญิงตั้งครรภ์ GA 32 สัปดาห์ กำลังกินข้าวแล้วสำลัก ไอไม่ออก เขียว แล้วหมดสติล้มลง',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'foreign-body',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คุณแม่ท้อง 32 สัปดาห์สำลักข้าวค่ะ! เมื่อกี้ยังไออยู่ ตอนนี้<span class="cbs-em">เงียบ ตัวเขียว หมดสติแล้ว!</span>' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'สองชีวิตอยู่ในมือคุณ… <span class="cbs-em">แม่ท้องแก่ + สำลัก</span> คุณคือ Team Leader — เริ่มได้เลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม/สูติ', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ! <span class="cbs-em">Cardiac arrest!</span> ท้องโตมากด้วยนะคะ' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'รีบล้วงคอเอาข้าวออกทันทีก่อนอย่างอื่น', ok: false, why: 'ผู้ป่วยหมดสติแล้ว — ยืนยัน arrest + เริ่ม CPR ก่อน blind finger sweep เสี่ยงดันสิ่งแปลกปลอมลึกลง', worsen: true },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่รู้ rhythm และยังไม่ยืนยัน arrest — ประเมินก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่มีชีพจร — ทำอะไรก่อน (และอย่าลืมว่าเธอท้องแก่)',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูง + สั่งคนดัน "manual left uterine displacement" + แปะ pads', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! ตำแหน่งมือกลางอกเหมือนผู้ใหญ่ทั่วไป <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'หนูดันมดลูกไปทางซ้ายให้แล้วค่ะ — <span class="cbs-em">left uterine displacement</span> ลด aortocaval compression' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">มี QRS เป็นจังหวะ แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'YOU', label: 'ให้นอนตะแคงซ้าย 30° เต็มตัวเพื่อลด compression', ok: false, why: 'ตะแคงเต็มตัวทำให้กดหน้าอกไม่ได้ผล — ในหญิงตั้งครรภ์ให้นอนหงายแล้วใช้มือดันมดลูกไปซ้ายแทน', worsen: true },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำไว้ — <span class="cbs-em">PEA มีสาเหตุเสมอ</span> H\'s &amp; T\'s และเคสนี้เธอสำลักต่อหน้า สิ่งแปลกปลอมยังอุดอยู่' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เส้นใหญ่เหนือกะบังลมเปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง + คงดันมดลูกไปซ้าย — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง PEA ค่ะ ตัวยังเขียวอยู่เลย' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… <span class="cbs-em">ทางเดินหายใจยังตันจากข้าว</span> ถ้าไม่เอาออก ออกซิเจนก็ลงปอดไม่ได้' }, t: 4 },
    {
      choice: {
        q: 'จัดการทางเดินหายใจที่อุดตัน — คุณจะทำอะไร',
        options: [
          {
            tgt: 'AIRWAY', label: 'Direct laryngoscopy — ใช้ Magill forceps คีบสิ่งแปลกปลอมออก แล้วใส่ ET tube', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'เห็นแล้วค่ะ! <span class="cbs-em">ก้อนข้าวอุดที่ glottis</span> — คีบออกได้! ทางเดินหายใจโล่งแล้ว!' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ใส่ท่อสำเร็จ ยืนยันตำแหน่งด้วย ETCO₂ — <span class="cbs-em">ปอดขยายทั้งสองข้างแล้วค่ะ</span>' }, t: 6 },
              { inter: 'AIRWAY CLEARED!', green: true, t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'อัด abdominal thrust (Heimlich) แรงๆ ที่ท้อง', ok: false, why: 'ห้ามใน arrest + ห้ามในหญิงตั้งครรภ์ท้องแก่ — การกดหน้าอกคุณภาพสูงคือ thrust ที่ดีที่สุดแล้ว ส่วน FB ต้องเอาออกโดยตรงใต้การมองเห็น', worsen: true },
          { tgt: 'AIRWAY', label: 'ล้วงนิ้วกวาดในปากแบบมองไม่เห็น (blind finger sweep)', ok: false, why: 'Blind sweep เสี่ยงดันสิ่งแปลกปลอมลึกลง — ต้องเอาออกภายใต้การมองเห็นด้วย laryngoscope + Magill', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทางเดินหายใจโล่งแล้วแต่ยังไม่ ROSC… <span class="cbs-em">ถ้าไม่กลับใน ~4 นาที ต้องเตรียม resuscitative hysterotomy</span> เรียกสูติ-กุมารเตรียมไว้เลย' }, t: 5 },
    {
      choice: {
        q: 'Rhythm check ครั้งถัดไป — จอเปลี่ยนไป',
        options: [
          {
            tgt: 'MONITOR', label: 'ดูจอให้ชัด หยุดกดให้สั้นที่สุด', ok: true,
            then: [
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 8, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เปลี่ยนเป็น <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้ว shockable แล้วค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดกดนานๆ เพื่อวิเคราะห์จอให้ชัวร์', ok: false, why: 'หยุดกดให้สั้นที่สุด — hands-off time นานทำ perfusion ตก', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi ซ้ำก่อนดูจอ', ok: false, why: 'ต้องอ่าน rhythm ก่อน — shockable หรือไม่ เปลี่ยนแผนทั้งหมด' },
        ],
      },
    },
    {
      choice: {
        q: 'VF ในหญิงตั้งครรภ์ — จัดการยังไง',
        options: [
          {
            tgt: 'DEFIB', label: 'Shock 200 J (พลังงานเท่าคนทั่วไป) + กดต่อทันที — pads วางปกติได้', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อเลยครับ! ยังดันมดลูกไปซ้ายอยู่ <span class="cbs-em">คุณภาพการกดต้องไม่ตก</span>', fx: { cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลดพลังงานลงเหลือ 50 J เพราะกลัวอันตรายต่อทารก', ok: false, why: 'ไม่ต้องลดขนาด — VF ในหญิงตั้งครรภ์ใช้พลังงาน defib เท่าผู้ใหญ่ทั่วไป (120-200 J) การ shock ปลอดภัยต่อทารก', worsen: true },
          { tgt: 'YOU', label: 'ถอด fetal monitor ให้เสร็จก่อนค่อย shock', ok: false, why: 'อย่ารีรอ — ถอด fetal/tocometry ได้เร็วๆ แต่ห้ามชะลอการ shock ที่ช่วยชีวิตแม่' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock — VF ยังอยู่ ยาตัวถัดไป',
        options: [
          {
            tgt: 'DRUG', label: 'Shock ซ้ำ + Amiodarone 300 mg IV bolus', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in!"</span> สลับคนกด — ทั้งห้องจับตาที่จอ', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง + left uterine displacement — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… จอเปลี่ยน… <span class="cbs-em">คลื่นสม่ำเสมอ… คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้น', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + คง left uterine displacement + ประเมินทารกร่วมกับสูติ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! <span class="cbs-em">T 36.5°C, P 110, BP 120/70</span> — คุณเอาสิ่งแปลกปลอมออก ดันมดลูกไปซ้าย และ shock ถูกจังหวะ ทั้งแม่และลูกปลอดภัย' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำอีกครั้งให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock จะทำให้ arrest ซ้ำ', worsen: true },
          { tgt: 'DRUG', label: 'Epi อีก 1 dose', ok: false, why: 'ROSC แล้ว ไม่ต้อง bolus Epi ต่อ' },
        ],
      },
    },
    { end: true },
  ],
};
