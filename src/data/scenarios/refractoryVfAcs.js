// เคส: VF Arrest → ROSC → ACS/STEMI (megacode) — shockable + สาเหตุต้นทางที่ต้องส่ง cath lab
// จุดสอน: หลัง ROSC ทำ 12-lead ECG เสมอ · ST elevation = STEMI สาเหตุที่แก้ได้ (coronary ischemia)
//         → aspirin + activate cath lab เพื่อ primary PCI · post-ROSC ห้าม shock/CPR ทับหัวใจที่กลับมา
export const refractoryVfAcs = {
  id: 'refractory-vf-acs-01',
  title: 'VF → ROSC → STEMI — ลุงเจ็บหน้าอกที่หัวใจวูบ',
  subtitle: 'ชายอายุ 70 ปี admit ด้วยเจ็บหน้าอก อยู่ๆ หมดสติ จอ monitor ขึ้น VF',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'acs',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 8 ที่ admit เจ็บหน้าอก… <span class="cbs-em">เรียกไม่รู้สึกตัวแล้วค่ะ!</span>' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ลุงเจ็บหน้าอกมาก่อน… ระวังหัวใจ <span class="cbs-em">คุณคือ Team Leader</span> — เริ่มได้เลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำ carotid ≤10 วินาที + เรียกทีม/crash cart', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ หายใจเฮือก! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลยไม่ต้องดูอะไร', ok: false, why: 'ยังไม่ยืนยัน arrest และยังไม่รู้ rhythm — ประเมินก่อนเสมอ' },
          { tgt: 'DRUG', label: 'ฉีด Epinephrine ทันที', ok: false, why: 'ต้องยืนยัน arrest + เริ่ม CPR ก่อนให้ยา' },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยัน arrest แล้ว — ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + แปะ pads ดู rhythm', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! ลึก 5-6 ซม. <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้ว ไม่บีบเลือดเลยค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก', worsen: true },
          { tgt: 'MONITOR', label: 'ติด 12-lead ECG ก่อนค่อยเริ่มกด', ok: false, why: '12-lead รอได้ ชีพจรรอไม่ได้ — CPR ก่อน', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF — เครื่อง defib พร้อมในมือ',
        options: [
          {
            tgt: 'DEFIB', label: 'Charge 200 J — กดหน้าอกต่อระหว่างรอไฟ แล้ว "CLEAR!" — SHOCK', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'ตัวลุงกระตุกขึ้นจากเตียง… <span class="cbs-em">กดต่อเลยไหมครับ?!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Amiodarone ก่อนค่อย shock', ok: false, why: 'ไฟฟ้ามาก่อนยาเสมอใน shockable rhythm' },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อน', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
        ],
      },
    },
    {
      choice: {
        q: 'ทันทีหลัง shock',
        options: [
          {
            tgt: 'CPR', label: 'กดต่อทันที 2 นาที — ไม่เช็คชีพจร', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'IV เปิดได้แล้วค่ะ! <span class="cbs-em">เส้นพร้อมให้ยา!</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">ยัง VF ค่ะ!</span> ดื้อไฟ!' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดคลำชีพจรทันทีหลัง shock', ok: false, why: 'หัวใจหลัง shock ยังอ่อนแรง — CPR ต่อทันที 2 นาทีก่อนเช็ค' },
          { tgt: 'DRUG', label: 'หยุดรอดูผลของไฟก่อน', ok: false, why: 'ไม่มีจังหวะไหนที่ "หยุดรอ" ใน cardiac arrest', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ดื้อไฟ — รอบนี้ครบชุด',
        options: [
          {
            tgt: 'DEFIB', label: 'Shock 200 J + Epinephrine 1 mg IV ตามทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เสียงขานยาดังทั่วห้อง', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง VF! พี่บอยเหงื่อหยดลงพื้นแล้วค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้นไปเลย', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'VF ดื้อไฟ — <span class="cbs-em">ถึงคิว antiarrhythmic แล้ว</span> ยาตัวไหนคือมาตรฐาน' }, t: 4 },
    {
      choice: {
        q: 'Shock ครั้งที่ 3 — ยา antiarrhythmic',
        options: [
          {
            tgt: 'DRUG', label: 'Shock 200 J + Amiodarone 300 mg IV bolus', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '"Amio 300 in!" — สลับคนกด <span class="cbs-em">คุณภาพการกดต้องไม่ตก</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… เดี๋ยวนะ… จอเปลี่ยน… <span class="cbs-em">คลื่นเรียบสม่ำเสมอ… คลำชีพจรได้ค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Calcium gluconate IV', ok: false, why: 'ไม่มีข้อบ่งชี้ hyperK/hypoCa ในเคสนี้ — VF ดื้อไฟใช้ Amiodarone' },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push เร็วๆ', ok: false, why: 'Adenosine ใช้ใน SVT ที่มีชีพจร — ไม่ใช่ที่นี่' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — จังหวะนี้ต้องทำอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! หยุด CPR — ประเมิน airway/BP + post-arrest care', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'talk', text: 'สัญญาณชีพกลับมาค่ะ — <span class="cbs-em">T 36.5°C, P 100, BP 120/70</span> จอเป็น sinus แต่… ST ยกสูงนะคะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ซ้ำอีกทีให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — shock จังหวะที่มีชีพจร = ทำให้ arrest ซ้ำ อันตรายที่สุด', worsen: true },
          { tgt: 'DRUG', label: 'Epinephrine 1 mg bolus ต่ออีก dose', ok: false, why: 'ROSC แล้ว — ห้าม bolus Epi ต่อ ถ้าความดันตกใช้ infusion แบบ titrate' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ROSC แล้วงานยังไม่จบ… <span class="cbs-em">ทำไมลุงถึง arrest?</span> ลุงเจ็บหน้าอกมาก่อน แล้วจอมี ST ยก — ขั้นต่อไปสำคัญมาก' }, t: 5 },
    {
      choice: {
        q: 'Post-ROSC — สเต็ปวินิจฉัยที่ห้ามลืม',
        options: [
          {
            tgt: 'MONITOR', label: 'ทำ 12-lead ECG ทันที', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: '12-lead ออกแล้วค่ะ — <span class="cbs-em">ST elevation V1-V4 ชัดเจน!</span>' }, t: 6 },
              { inter: 'STEMI!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ป้องกัน VF กลับมา', ok: false, why: 'มีชีพจรอยู่ — ห้าม shock หัวใจที่กลับมาเต้นแล้ว', worsen: true },
          { tgt: 'YOU', label: 'ยังไม่ต้องทำ 12-lead รอ ICU ก่อน', ok: false, why: 'post-ROSC ต้องทำ 12-lead ทันที — STEMI เป็นสาเหตุที่แก้ได้และเวลาคือกล้ามเนื้อหัวใจ' },
        ],
      },
    },
    {
      choice: {
        q: 'STEMI หลัง ROSC — การรักษาต้นเหตุ',
        options: [
          {
            tgt: 'DRUG', label: 'Aspirin + ปรึกษา cardiology ด่วน — activate cath lab เพื่อ primary PCI', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Aspirin เคี้ยวแล้ว!"</span> โทร cardiology แล้วค่ะ — cath lab กำลัง activate!' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'เตรียมส่ง cath lab — คุมทางเดินหายใจ, ประคอง BP, พิจารณา targeted temperature management ค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 200 J รักษา STEMI', ok: false, why: 'STEMI แก้ด้วยการเปิดหลอดเลือด (PCI) ไม่ใช่ไฟฟ้า — และลุงมีชีพจรแล้ว ห้าม shock', worsen: true },
          { tgt: 'DRUG', label: 'ให้ยาแล้วสังเกตอาการที่ ward ไม่ต้องส่ง cath', ok: false, why: 'STEMI ต้อง reperfusion เร็วที่สุด — ไม่ส่ง cath lab = กล้ามเนื้อหัวใจตายเพิ่มทุกนาที', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">ทำ 12-lead หลัง ROSC และเจอ STEMI</span> — coronary ischemia คือสาเหตุที่แก้ได้ ส่ง cath lab เปิดเส้นเลือด และรู้ว่า post-ROSC ห้าม shock/CPR ทับหัวใจที่กลับมา ลุงได้ไป PCI แล้ว' }, t: 6 },
    { end: true },
  ],
};
