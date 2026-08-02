// เคส: Refractory VF จาก Hypoxia (megacode) — shockable ที่ดื้อไฟเพราะสาเหตุแก้ได้
// จุดสอน: VF ดื้อไฟให้มองหา reversible cause (H's &amp; T's) — hypoxia เป็นตัวสำคัญ
//         ต้องจัดการ airway/suction ให้ oxygenation ดีจึงจะ ROSC ·
//         amiodarone โดสซ้ำ = 150 mg (ไม่ใช่ 300 mg) · keep warm กัน hypothermia
export const hypoxiaVf = {
  id: 'hypoxia-vf-01',
  title: 'Refractory VF — ยิงไฟเท่าไรก็ไม่กลับ',
  subtitle: 'หญิงอายุ 30 ปี VF cardiac arrest ที่ยิงไฟหลายรอบก็ยังดื้อ ระหว่าง CPR มีอาการชักเกร็ง',
  level: 'megacode',
  track: 'arrest',
  course: 'acls',
  hiddenCause: 'hypoxia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้หญิงเตียง 3 หมดสติเฉียบพลันค่ะ! คลำชีพจรไม่ได้!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทีมหันมาที่คุณ… <span class="cbs-em">คุณคือ Team Leader</span> — เคสนี้ท้าทาย เริ่มได้เลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + แปะ pads ดู rhythm', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">ลึก 5-6 ซม. 100-120/นาที</span>', fx: { cpr: true, firstCPR: true, alarm: true } }, t: 8 },
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้วไม่บีบเลือดค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ก่อนเลย', ok: false, why: 'ยังไม่รู้ rhythm และยังไม่เริ่มกด — CPR + ดูจอมาก่อน' },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube เป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ยืนยันแล้ว — ทำอะไรก่อน',
        options: [
          {
            tgt: 'DEFIB', label: 'Charge 200 J แล้ว "CLEAR!" — SHOCK แล้วกดต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'กดต่อเลยค่ะ! <span class="cbs-em">IV เปิดได้แล้ว</span> พร้อมให้ยา', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ครบ 2 นาที! <span class="cbs-em">ขอสลับคนกด</span> — เปลี่ยนไวๆ หยุดกดไม่เกิน 10 วิครับ!' }, t: 4 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… <span class="cbs-em">ยัง VF ค่ะ!</span> ดื้อไฟ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Amiodarone ก่อนค่อย shock', ok: false, why: 'ไฟฟ้ามาก่อนยาเสมอใน shockable rhythm — shock ให้เร็วที่สุด' },
          { tgt: 'YOU', label: 'หยุดกดนานๆ เพื่อดูจอชัดๆ', ok: false, why: 'hands-off time คือศัตรู — หยุดกดให้สั้นที่สุด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ดื้อไฟรอบแรก — ทำครบชุด',
        options: [
          {
            tgt: 'DRUG', label: 'Shock 200 J + Epinephrine 1 mg IV ตามทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> ขานยาดังทั่วห้อง', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">ยัง VF!</span> ไม่ยอมกลับเลยค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้น', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
        ],
      },
    },
    {
      choice: {
        q: 'VF ยังดื้อ — ยา antiarrhythmic ตัวแรก',
        options: [
          {
            tgt: 'DRUG', label: 'Shock 200 J + Amiodarone 300 mg IV bolus (โดสแรก)', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in!"</span> สลับคนกด คุณภาพต้องไม่ตก', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'อาจารย์! คนไข้<span class="cbs-em">ชักเกร็งทั้งตัว</span>ระหว่างผมกดอยู่เลยครับ!' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Lidocaine 300 mg ทันที', ok: false, why: 'Amiodarone เป็น first-line antiarrhythmic — lidocaine เป็นตัวเลือกสำรอง และขนาดนี้ผิด' },
          { tgt: 'DEFIB', label: 'เพิ่มพลังงานเป็น 360 J รัวๆ อย่างเดียว', ok: false, why: 'เพิ่ม J อย่างเดียวไม่แก้เหตุ — VF ดื้อไฟต้องมองหา reversible cause', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ชักระหว่าง arrest… <span class="cbs-em">ทำไม VF ถึงดื้อไฟขนาดนี้?</span> ยิงไฟกี่ทีก็ไม่พอ ถ้าไม่แก้ต้นเหตุ — คิดถึง H\'s &amp; T\'s' }, t: 5 },
    {
      choice: {
        q: 'VF ดื้อไฟ + ชัก — สืบหาสาเหตุที่แก้ได้',
        options: [
          {
            tgt: 'MONITOR', label: 'เช็ค oxygenation/airway: ดู SpO₂ + คลำ/ฟังการระบายอากาศ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: '<span class="cbs-em">SpO₂ วัดไม่ขึ้น</span> ริมฝีปากเขียว! ในปากมี<span class="cbs-em">เสมหะ/สารคัดหลั่งอุดอยู่เต็มเลยค่ะ!</span>' }, t: 8 },
              { say: { who: 'krit_airway', pose: 'stern', text: 'นี่ไงครับ… <span class="cbs-em">ทางเดินหายใจอุดตัน — หัวใจที่ขาดออกซิเจน ยิงไฟกี่ครั้งก็ไม่กลับ</span> ขอ suction กับ laryngoscope ผมจัดการเอง' }, t: 5 },
              { inter: 'HYPOXIA!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Amiodarone อีก 300 mg ซ้ำเลย', ok: false, why: 'โดสซ้ำผิด! โดสที่สองของ amiodarone = 150 mg และยาไม่แก้เหตุที่ดื้อไฟ' },
          { tgt: 'DEFIB', label: 'ดันพลังงานสูงสุดยิงรัวๆ ต่อไป', ok: false, why: 'shock ซ้ำโดยไม่แก้ hypoxia — หัวใจขาดออกซิเจนจะไม่มีทางกลับ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'พบ Hypoxia จากทางเดินหายใจอุดกั้น — จัดการอย่างไร',
        options: [
          {
            tgt: 'AIRWAY', label: 'Suction ทางเดินหายใจ + ใส่ ET tube ให้ oxygenation — กดต่อเนื่อง ไม่หยุดนาน', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Suction ออกเยอะเลยค่ะ! ใส่ท่อสำเร็จ <span class="cbs-em">SpO₂ เริ่มขึ้น ตัวเริ่มชมพู</span>', fx: { cpr: true } }, t: 8 },
              { say: { who: 'krit_airway', pose: 'talk', text: 'เห็น cords แล้ว… <span class="cbs-em">tube ผ่าน</span> — ฟังปอดเข้าเท่ากันสองข้าง EtCO₂ ขึ้นสวยครับ ทีนี้หัวใจได้ออกซิเจนแล้ว' }, t: 5 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — และ<span class="cbs-em">ห่มผ้าให้อุ่น keep warm ไว้</span> กัน hypothermia ซ้ำเติม' }, t: 5 },
            ],
          },
          { tgt: 'AIRWAY', label: 'หยุด CPR นานๆ เพื่อใส่ท่อให้เรียบร้อยก่อน', ok: false, why: 'ห้ามหยุดกดนานเพื่อใส่ท่อ — pause ให้สั้นที่สุด CPR คุณภาพต้องต่อเนื่อง', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Amiodarone 300 mg ซ้ำแทนการแก้ทางเดินหายใจ', ok: false, why: 'โดสซ้ำผิด (ต้อง 150 mg) และไม่แก้ hypoxia ที่เป็นต้นเหตุจริง' },
        ],
      },
    },
    {
      choice: {
        q: 'แก้ oxygenation แล้ว — รอบยาถัดไปให้อะไร',
        options: [
          {
            tgt: 'DRUG', label: 'Shock 200 J + Amiodarone โดสที่สอง 150 mg IV', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 150 in!"</span> โดสซ้ำ 150 มิลลิกรัมค่ะ', fx: { cpr: true } }, t: 6 },
              { say: { who: 'boy_compressor', pose: 'stern', text: 'ตัวเริ่มชมพูแล้ว — รอบนี้แหละครับ! <span class="cbs-em">recoil สุดทุกครั้ง</span> กลับมาเถอะ!' }, t: 4 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… จอเปลี่ยน! <span class="cbs-em">คลื่นเป็นระเบียบสม่ำเสมอ — organized rhythm… คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg ซ้ำอีกโดส', ok: false, why: 'ผิด — โดสซ้ำของ amiodarone คือ 150 mg (โดสแรก 300 mg ให้ไปแล้ว)' },
          { tgt: 'DEFIB', label: 'shock อย่างเดียวไม่ต้องให้ยาต่อ', ok: false, why: 'VF ดื้อไฟที่ตอบต่อ antiarrhythmic ควรให้ครบชุด — shock + amio 150 mg' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ขั้นต่อไป',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care — คุม airway/oxygenation, keep warm, หาสาเหตุต่อ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'สัญญาณชีพกลับมาแล้วค่ะ… <span class="cbs-em">T 36.5°C · P 110 · BP 120/70</span> อุ่นและมีชีพจรชัดเจน' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! VF ที่<span class="cbs-em">ดื้อไฟให้มองหา reversible cause</span> — hypoxia คือตัวสำคัญ แก้ airway/suction ให้ oxygenation ดี หัวใจจึงกลับ · จำไว้ amiodarone โดสซ้ำ = 150 mg และ keep warm เสมอ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำอีกทีให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — shock = ทำให้ arrest ซ้ำ อันตรายที่สุด', worsen: true },
          { tgt: 'DRUG', label: 'Epinephrine อีก 1 dose', ok: false, why: 'ROSC แล้ว ไม่ต้อง bolus Epi ต่อ — เข้าสู่ post-arrest care' },
        ],
      },
    },
    { end: true },
  ],
};
