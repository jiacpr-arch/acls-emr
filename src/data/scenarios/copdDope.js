// เคส: COPD หลังใส่ท่อแล้ว arrest (megacode) — non-shockable ก่อน แล้วเปลี่ยนเป็น shockable
// จุดสอน: ผู้ป่วยใส่ท่อแล้ว deteriorate/arrest ให้ท่อง DOPE ทันที
//         (Displacement · Obstruction · Pneumothorax · Equipment)
//         Asystole = non-shockable (ห้าม shock, ให้ Epi + หาสาเหตุ, ไม่มี atropine)
//         พอเป็น VF จึง shock + Amiodarone 300 mg → แก้ต้นเหตุที่ท่อ → ROSC
export const copdDope = {
  id: 'copd-dope-01',
  title: 'ท่อมรณะ — COPD ที่เพิ่งใส่ท่อ',
  subtitle: 'ชายอายุ 50 ปี COPD เพิ่งใส่ ET tube หลังจับท่อขยับ มีหายใจลำบากแล้วหมดสติ',
  level: 'megacode',
  track: 'causes',
  course: 'acls',
  hiddenCause: 'dope-tube',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 ที่เพิ่งใส่ท่อ… <span class="cbs-em">พอขยับท่อปุ๊บก็ดิ้น เขียว แล้วนิ่งไปเลยค่ะ!</span>' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'คนไข้ <span class="cbs-em">ใส่ท่อไปแล้ว</span> แล้วเพิ่งทรุด — จำจุดนี้ไว้ให้ดี คุณคือ Team Leader เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้เลยค่ะ! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่รู้ rhythm และยังไม่ยืนยัน arrest — ประเมินก่อน' },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ทันที', ok: false, why: 'ต้องยืนยัน arrest + เริ่ม CPR ก่อน' },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">เส้นแบนราบ ไม่มีคลื่นไฟฟ้าเลย</span>' }, t: 6 },
              { inter: 'ASYSTOLE!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ถอดท่อออกแล้วใส่ใหม่ก่อนเริ่มกด', ok: false, why: 'CPR มาก่อน — จัดการท่อทำระหว่างกดได้ ไม่หยุดกดเพื่อรื้อท่อ', worsen: true },
          { tgt: 'DRUG', label: 'Atropine 1 mg ทันที', ok: false, why: 'Asystole ไม่ใช้ atropine (ตัดออกจาก ACLS แล้ว) — เริ่ม CPR ก่อน', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Asystole — non-shockable. แต่คนไข้ <span class="cbs-em">เพิ่งใส่ท่อแล้วทรุดทันที</span> ท่องให้ผมฟัง: <span class="cbs-em">DOPE</span>' }, t: 5 },
    {
      choice: {
        q: 'Asystole + เพิ่งใส่ท่อ — ยา/ไฟฟ้าตอนนี้',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — asystole ให้ Epi ทุก 3-5 นาที ไม่มี shock… ทีนี้ <span class="cbs-em">ไปหาว่าทำไมท่อทำให้เขาทรุด</span>' }, t: 5 },
              { say: { who: 'krit_airway', pose: 'talk', text: 'ใจเย็นๆ ครับ… คนใส่ท่อที่ทรุดเฉียบพลัน ไล่ทีละตัว <span class="cbs-em">D-O-P-E</span> — ท่อนี่ผมดูเองครับ' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'Asystole เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ asystole' },
        ],
      },
    },
    {
      choice: {
        q: 'ท่อง DOPE — ตรวจท่อยังไงให้ครบ',
        options: [
          {
            tgt: 'AIRWAY', label: 'เช็ค DOPE: ตำแหน่งท่อ/EtCO₂/ฟังปอด 2 ข้าง + ดูดเสมหะ + ประเมิน pneumothorax + เช็คสายเครื่อง', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'talk', text: 'ความลึกท่อเท่าเดิม… ดูดเสมหะแล้ว ไม่มีอะไรอุด — <span class="cbs-em">Displacement กับ Obstruction ตัดออก</span> ฟังปอดต่อครับ' }, t: 5 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'ฟังปอด… <span class="cbs-em">ข้างขวาไม่มีลมเข้าเลยค่ะ!</span> เคาะโปร่ง หลอดลมเบนไปซ้าย!' }, t: 8 },
              { inter: 'TENSION PNEUMOTHORAX!', drama: 'red', t: 4 },
              { say: { who: 'att_dech', pose: 'stern', text: 'นี่แหละตัว P ใน DOPE — <span class="cbs-em">Pneumothorax จาก positive pressure ในปอด COPD</span>' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'ยัง non-shockable — และยังไม่ได้เช็คท่อตามหลัก DOPE', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi 3 mg รวดเดียวให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และข้ามการหาสาเหตุที่ท่อ' },
        ],
      },
    },
    {
      choice: {
        q: 'ปอดขวาแฟบ + หลอดลมเบน — แก้ทันทีตอนนี้ยังไง',
        options: [
          {
            tgt: 'YOU', label: 'Needle thoracocentesis ปอดขวาทันที + จัดท่อให้ถูกตำแหน่ง', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'แทงเข็มแล้วค่ะ… <span class="cbs-em">ลมพุ่งออก "ฟู่ๆ"!</span> ปอดขวามีลมเข้าแล้ว EtCO₂ ขึ้น!', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ถอดท่อออกทั้งหมดแล้ว bag-mask แทน', ok: false, why: 'ปัญหาคือลมในเยื่อหุ้มปอด ไม่ใช่ท่อผิดตำแหน่ง — ถอดท่อไม่ได้ระบายลม', worsen: true },
          { tgt: 'DEFIB', label: 'Shock 200 J แก้ปอดแฟบ', ok: false, why: 'Tension pneumothorax แก้ด้วยเข็มระบายลม ไม่ใช่ไฟฟ้า', worsen: true },
        ],
      },
    },
    { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
    { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check! จอเปลี่ยนแล้วค่ะ — <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้ว' }, t: 6 },
    {
      choice: {
        q: 'เปลี่ยนเป็น VF — จังหวะนี้ทำอะไร',
        options: [
          {
            tgt: 'DEFIB', label: 'Charge 200 J → "CLEAR!" → SHOCK แล้วกดต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อเลยครับ! <span class="cbs-em">ไม่เช็คชีพจร กด 2 นาทีก่อน</span>', fx: { cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epi 1 mg แต่งด shock ไปก่อน', ok: false, why: 'VF เป็น shockable — ไฟฟ้ามาก่อนเสมอ อย่ารีรอ shock', worsen: true },
          { tgt: 'CPR', label: 'หยุดกดยาวๆ รอดูจอให้ชัวร์ว่า VF จริง', ok: false, why: 'ยืนยัน VF แล้ว — hands-off time นานยิ่งลดโอกาส shock สำเร็จ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ยังอยู่หลัง shock แรก — ยาต้าน arrhythmia',
        options: [
          {
            tgt: 'DRUG', label: 'Shock ซ้ำ + Amiodarone 300 mg IV bolus', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in!"</span> ให้ยาแล้วค่ะ สลับคนกดด้วย', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… จอเปลี่ยน… <span class="cbs-em">คลื่นเป็นระเบียบ… คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
          { tgt: 'DRUG', label: 'Amiodarone 900 mg push รวดเดียว', ok: false, why: 'ขนาดผิด — VF/pVT ให้ 300 mg โดสแรก (โดสสอง 150 mg)' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ตรวจตำแหน่งท่อ/CXR + ใส่ ICD ระบายลมทรวงอก', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'T 36.5°C · P 110 · BP 120/70 — กลับมาแล้ว! คุณ<span class="cbs-em">ท่อง DOPE ทันทีที่คนใส่ท่อทรุด</span> เจอ pneumothorax แล้วแทงเข็มถูกจังหวะ นี่คือหัวใจของเคสท่อ' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'DRUG', label: 'Epi อีก 1 dose', ok: false, why: 'ROSC แล้ว ไม่ต้อง bolus Epi ต่อ' },
        ],
      },
    },
    { end: true },
  ],
};
