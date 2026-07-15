// เคส: Unstable SVT → VF → PEA → ROSC (megacode) — ต่อเนื่องหลายจังหวะ
// จุดสอน: tachycardia "มีชีพจร" ที่ไม่เสถียร → synchronized cardioversion (ไม่ใช่ defibrillation) ·
//         adenosine สำหรับ narrow-complex regular SVT · แยก sync vs unsync ให้ชัด ·
//         พอทรุดเป็น VF (ไม่มีชีพจร) = arrest → CPR + defib · PEA non-shockable → Epi + fluid หา H's & T's
export const svtCascade = {
  id: 'svt-vf-pea-01',
  title: 'ใจสั่นจนหัวใจล้ม — SVT ที่ลามเป็น arrest',
  subtitle: 'ชายอายุ 30 ปี ใจสั่น เจ็บหน้าอก อัตราหัวใจเร็วมาก ECG ไม่มี ischemic change',
  level: 'megacode',
  track: 'tachy',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้ชายเตียง 3 ใจสั่น เจ็บหน้าอกมากค่ะ! <span class="cbs-em">Monitor ขึ้นอัตราหัวใจ ~190</span> ตัวซีดเหงื่อแตก!' }, t: 5 },
    { inter: 'HR 190 — ไม่ไหวแล้ว!!', drama: 'red', t: 0, fx: { alarm: true } },
    { say: { who: 'att_dech', pose: 'stern', text: 'เร็วมากผิดปกติ… <span class="cbs-em">คุณคือ Team Leader</span> — จับให้ได้ก่อนว่านี่คือจังหวะแบบไหน แล้วผู้ป่วยยังมีชีพจรหรือไม่' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + คลำชีพจร + ติด monitor/12-lead + เปิด IV', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">narrow-complex สม่ำเสมอ ~190/นาที</span> — คลำชีพจรได้ชัดค่ะ แต่เบาและเร็วมาก' }, t: 8, fx: { rhythm: 'tachy' } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'BP 84/50 เจ็บหน้าอกไม่หาย… <span class="cbs-em">unstable แล้วค่ะ!</span> แต่ 12-lead ไม่มี ischemic change' }, t: 6 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ผู้ป่วยยัง "มีชีพจร" — การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้ arrest', worsen: true },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) 200 J เลย', ok: false, why: 'มีชีพจร + ยังไม่ประเมิน — unsync shock บนจังหวะที่มี R wave เสี่ยง R-on-T กลายเป็น VF', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Narrow + regular + มีชีพจร = <span class="cbs-em">SVT</span> ที่กำลังไม่เสถียร — ยังพอมีจังหวะลองก่อน แต่ต้องเร็ว' }, t: 4 },
    {
      choice: {
        q: 'SVT มีชีพจร — ก้าวแรกของการรักษา',
        options: [
          {
            tgt: 'YOU', label: 'Vagal maneuver (Valsalva) + เตรียม adenosine และเครื่อง cardioversion ไว้พร้อม', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ให้เป่าไซริงค์ต้านแรง… <span class="cbs-em">ไม่เปลี่ยนเลยครับ</span> ยังเร็วเท่าเดิม' }, t: 8 },
            ],
          },
          { tgt: 'DEFIB', label: 'Unsynchronized shock 200 J', ok: false, why: 'ผู้ป่วยมีชีพจร — ถ้าจะช็อกต้องเป็น synchronized เท่านั้น unsync เสี่ยงกระตุ้น VF', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg IV push', ok: false, why: 'ไม่ใช่ยา first-line ของ narrow regular SVT และ push เร็วทำ BP ตก — ลอง vagal/adenosine ก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'Vagal ไม่ได้ผล — ทำต่ออย่างไร',
        options: [
          {
            tgt: 'DRUG', label: 'Adenosine 6 mg IV push เร็ว + flush ตาม (ซ้ำ 12 mg ถ้ายังไม่กลับ)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Adenosine 6 in — flush!"</span> …หยุดวูบแล้วเด้งกลับมาเร็วเหมือนเดิมค่ะ' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ให้ซ้ำ <span class="cbs-em">12 mg</span> แล้ว… ยังเป็น SVT เหมือนเดิม! BP ตกเหลือ 78/44 เจ็บหน้าอกมากขึ้น' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine 6 mg หยดช้าๆ ทางน้ำเกลือ', ok: false, why: 'Adenosine ครึ่งชีวิตสั้นมาก ต้อง push เร็ว + flush ทันที ไม่งั้นสลายก่อนถึงหัวใจ' },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) เลย ไม่รอยา', ok: false, why: 'มีชีพจร — ต้อง sync ถ้าจะช็อก และควรลอง adenosine ในจังหวะ narrow regular ก่อน', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ยาไม่กลับ + BP ตก + เจ็บหน้าอก = <span class="cbs-em">unstable tachycardia มีชีพจร</span> ถึงคิวไฟฟ้าแล้ว — แต่โหมดไหน?' }, t: 4 },
    {
      choice: {
        q: 'Unstable SVT มีชีพจร — ใช้ไฟฟ้าอย่างไร',
        options: [
          {
            tgt: 'DEFIB', label: 'Synchronized cardioversion (โหมด SYNC) เริ่ม 100 J', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'เปิดโหมด <span class="cbs-em">SYNC</span> ให้เครื่องจับ R wave… Clear! ปล่อยพลังงานตรงจังหวะ — cardiovert ครั้งที่ 1 ค่ะ' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'ช้าลงแวบเดียว… <span class="cbs-em">แล้วกลับมาเร็วอีก</span> ยังไม่กลับเป็น sinus ค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Unsynchronized shock 200 J (defibrillation)', ok: false, why: 'ยังมีชีพจร! unsync ที่ตกบน T wave (R-on-T) เปลี่ยน SVT ให้กลายเป็น VF ได้จริง', worsen: true },
          { tgt: 'DRUG', label: 'Adenosine เข็มที่สาม', ok: false, why: 'ให้ครบ 6 + 12 แล้วไม่ได้ผลและผู้ป่วยไม่เสถียร — ต้องเปลี่ยนเป็น synchronized cardioversion' },
        ],
      },
    },
    {
      choice: {
        q: 'ยังเป็น SVT หลัง cardioversion ครั้งแรก',
        options: [
          {
            tgt: 'DEFIB', label: 'Synchronized cardioversion ซ้ำ (SYNC) เพิ่มพลังงาน 200 J', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'SYNC 200 J… Clear! — cardiovert ครั้งที่ 2 ค่ะ' }, t: 6 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'จอเสียจังหวะ… <span class="cbs-em">ผู้ป่วยเกร็งแล้วเงียบ — คลำชีพจรไม่ได้!</span>' }, t: 6 },
              { inter: 'VF — CARDIAC ARREST!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
            ],
          },
          { tgt: 'DEFIB', label: 'สลับไป unsynchronized shock ให้แรงกว่า', ok: false, why: 'ตราบใดที่ยังมีชีพจรต้องคง SYNC — unsync คือทางที่ทำให้เกิด VF', worsen: true },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกเลยระหว่าง SVT', ok: false, why: 'ยังมีชีพจรอยู่ — ห้ามกด การกดจะไปรบกวนหัวใจที่ยังบีบเอง', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทรุดเป็น <span class="cbs-em">VF ไม่มีชีพจร</span> แล้ว — เกมเปลี่ยนทันที นี่คือ cardiac arrest แบบ shockable' }, t: 4 },
    {
      choice: {
        q: 'VF ไม่มีชีพจร — คำสั่งเดี๋ยวนี้',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + charge defib (unsync)', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">ลึก 5-6 ซม. 100-120/นาที</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'Charging 200 J… พร้อมค่ะ!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion บน VF', ok: false, why: 'VF ไม่มี R wave ให้ sync — เครื่องจะไม่ยอมปล่อยไฟ ต้องใช้ defibrillation (unsync)', worsen: true },
          { tgt: 'DRUG', label: 'Adenosine 12 mg push', ok: false, why: 'Adenosine ใช้กับ SVT ที่มีชีพจรเท่านั้น — ไม่มีที่ใน VF/arrest' },
        ],
      },
    },
    {
      choice: {
        q: 'CHARGED — VF ต่อหน้าคุณ',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!" กวาดตารอบเตียง — Defibrillate 200 J แล้ว CPR ต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'กดต่อทันทีค่ะ! เปิด IV พร้อมให้ยา', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… <span class="cbs-em">VF หายไป มี QRS เป็นจังหวะ แต่คลำชีพจรไม่ได้ค่ะ</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion 100 J', ok: false, why: 'VF ต้อง defibrillation (unsync) — sync จะจับ R wave ไม่ได้และหน่วงการช็อก', worsen: true },
          { tgt: 'DEFIB', label: 'ลดพลังงานเหลือ 50 J', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จาก VF กลายเป็น <span class="cbs-em">PEA — non-shockable</span> มีไฟฟ้าแต่หัวใจไม่บีบ ห้าม shock แล้ว ต้องหา "สาเหตุ"' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV + เปิด IV crystalloid bolus + ไล่ H\'s &amp; T\'s', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เปิด normal saline bolus แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ไล่ H\'s &amp; T\'s — ไม่มีเลือดออก ไม่มี tension pneumothorax gas ปกติ <span class="cbs-em">น่าจะเป็น arrest ต่อเนื่องจากจังหวะที่ผ่านมา</span>' }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">QRS ชัดขึ้น — คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 200 J อีกครั้งเผื่อได้ผล', ok: false, why: 'PEA เป็น non-shockable — การช็อกไม่ช่วยและเสียเวลากดที่มีค่า', worsen: true },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push', ok: false, why: 'Adenosine ไม่มีที่ใน PEA/arrest — ใช้เฉพาะ SVT ที่มีชีพจร' },
        ],
      },
    },
    {
      choice: {
        q: 'คลำชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! หยุด CPR — ประเมิน ABC ซ้ำ + post-arrest care + 12-lead ด่วน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'สัญญาณชีพกลับมาแล้ว — <span class="cbs-em">T 37°C, P 70, BP 100/60</span> จอขึ้น sinus rhythm ค่ะ' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">แยก sync กับ unsync ได้ขาด</span> — SVT มีชีพจรใช้ synchronized cardioversion + adenosine พอทรุดเป็น VF/PEA ค่อยเข้าโหมด arrest ส่ง ICU เฝ้าต่อได้เลย' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำอีกทีให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะ sinus แล้ว — การช็อกซ้ำจะเหนี่ยวนำให้ arrest ใหม่' },
          { tgt: 'DRUG', label: 'Epinephrine bolus อีก 1 dose', ok: false, why: 'ROSC แล้ว — ห้าม bolus Epi ต่อ ถ้าต้องพยุงความดันให้ใช้เป็น infusion' },
        ],
      },
    },
    { end: true },
  ],
};
