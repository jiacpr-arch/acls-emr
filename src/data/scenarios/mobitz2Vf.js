// เคส: High-grade AV block → VF arrest → post-ROSC Mobitz II (megacode)
// จุดสอน: ACS ทำให้เกิดทั้ง bradyarrhythmia (AV block) และ VF ในผู้ป่วยเดียว ·
//         AV block ที่ยังมีชีพจร "ห้าม shock" · หลัง ROSC เจอ Mobitz II →
//         เตรียม transcutaneous pacing (ไม่พึ่ง atropine) · หา 12-lead + ปรึกษา cardiology หาต้นเหตุ ACS
export const mobitz2Vf = {
  id: 'mobitz2-vf-01',
  title: 'AV Block ที่ทรุดเป็น VF — ลุงหลัง CABG',
  subtitle: 'ชายอายุ 60 ปี เบาหวาน เคยผ่าตัด CABG มาด้วยเจ็บแน่นหน้าอก หน้ามืด ชีพจรช้า',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'acs',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 บ่นแน่นหน้าอกแล้วหน้ามืดค่ะ! <span class="cbs-em">ชีพจรช้ามาก 38 ครั้ง/นาที</span>!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ลุงเคย<span class="cbs-em">ผ่าตัด CABG</span> มาก่อน — เส้นเลือดหัวใจมีปัญหาแน่ คุณคือ Team Leader เริ่มได้เลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก — คนไข้ยังรู้สึกตัวแต่ซึม',
        options: [
          {
            tgt: 'MONITOR', label: 'ติด monitor + คลำชีพจร + วัดความดัน ประเมิน ABC', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">P wave เยอะกว่า QRS ชัดเจน — high-grade AV block</span> อัตราหัวใจ 38 BP 70/40' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'Bradycardia ที่มี<span class="cbs-em">อาการไม่คงที่</span> — ความดันตก ซึม แน่นหน้าอก นี่คือของจริง' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลยเพราะชีพจรผิดปกติ', ok: false, why: 'คนไข้ยังมีชีพจร! การ shock จังหวะที่มีชีพจร = ทำให้ arrest', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epinephrine 1 mg IV push ทันที', ok: false, why: 'ยังไม่ arrest — Epi 1 mg push ใช้ใน cardiac arrest เท่านั้น ประเมินก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'High-grade AV block + อาการไม่คงที่ — จัดการยังไง',
        options: [
          {
            tgt: 'DRUG', label: 'Atropine 1 mg IV + เตรียม transcutaneous pacing ควบคู่', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Atropine 1 mg in!"</span> แปะแผ่น pacing ที่หน้าอก-หลังเตรียมไว้แล้วค่ะ' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'อัตราไม่ขึ้นเลยค่ะ… <span class="cbs-em">block อยู่ใต้ AV node — atropine ไม่ค่อยได้ผลกับ block ระดับนี้</span>!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion 100 J', ok: false, why: 'Cardioversion ใช้กับ tachyarrhythmia — นี่ bradycardia คนละเรื่อง', worsen: true },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกเลยเพราะชีพจรช้า', ok: false, why: 'ยังมีชีพจรและรู้สึกตัว — การกดหน้าอกบนหัวใจที่ยังเต้นทำอันตราย', worsen: true },
        ],
      },
    },
    { inter: 'VF!', drama: 'red', t: 4, fx: { rhythm: 'vf', alarm: true } },
    { say: { who: 'fon_defib', pose: 'panic', text: 'ลุงเกร็งแล้วหมดสติ! จอเปลี่ยนเป็น <span class="cbs-em">Ventricular Fibrillation</span> — คลำชีพจรไม่ได้แล้วค่ะ!' }, t: 5 },
    {
      choice: {
        q: 'VF — cardiac arrest แล้ว ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + charge เครื่อง defib', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! ลึก 5-6 ซม. <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Charging 200 จูล… พร้อม shock แล้วค่ะ!' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Atropine เพิ่มเพราะยังคิดว่าเป็น brady', ok: false, why: 'จังหวะเปลี่ยนเป็น VF แล้ว — Atropine ไม่มีที่ใน VF ต้อง CPR + defib', worsen: true },
          { tgt: 'AIRWAY', label: 'หยุดทุกอย่างเพื่อใส่ ET tube ก่อน', ok: false, why: 'CPR + defib มาก่อน advanced airway เสมอ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF + เครื่องพร้อม — จังหวะชี้ชะตา',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!!" กวาดตารอบเตียง — SHOCK 200 J', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'ตัวลุงกระตุกขึ้น… <span class="cbs-em">กดต่อเลยไหมครับ?!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อน', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
          { tgt: 'DRUG', label: 'ให้ Amiodarone ก่อนค่อย shock', ok: false, why: 'ไฟฟ้ามาก่อนยาเสมอใน shockable rhythm' },
        ],
      },
    },
    {
      choice: {
        q: 'ทันทีหลัง shock ครั้งแรก',
        options: [
          {
            tgt: 'CPR', label: 'กดต่อทันที 2 นาที — ไม่หยุดเช็คชีพจร', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'IV เปิดได้แล้วค่ะ! <span class="cbs-em">เส้นพร้อมให้ยา</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">ยัง VF ค่ะ!</span> ดื้อไฟ' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดคลำชีพจรทันทีหลัง shock', ok: false, why: 'หัวใจหลัง shock ยังอ่อนแรง — กดต่อทันที 2 นาทีก่อนเช็ค' },
          { tgt: 'DEFIB', label: 'Shock ซ้ำรัวๆ ทันทีอีกครั้ง', ok: false, why: 'stacked shocks ไม่แนะนำแล้ว — กด 2 นาทีระหว่างรอบ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ดื้อไฟ — รอบนี้ให้ครบชุด',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (ทุก 3-5 นาที) + เตรียม Amiodarone', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> Amiodarone 300 mg เตรียมพร้อมรอบหน้าค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… เดี๋ยวนะ… จอเริ่มมี QRS… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้นไปเลย', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DRUG', label: 'Atropine 1 mg เพราะจังหวะเดิมเคยช้า', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia ที่มีชีพจร' },
        ],
      },
    },
    { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
    { say: { who: 'fon_defib', pose: 'stern', text: 'ชีพจรกลับมาแล้ว T 36.5 P 80 BP 120/70 ค่ะ… แต่จอยัง<span class="cbs-em">แปลกๆ — QRS หลุดหายเป็นช่วง</span>' }, t: 6 },
    {
      choice: {
        q: 'หลัง ROSC — จอขึ้น P wave ปกติแต่ QRS หายเป็นระยะ (PR คงที่แล้วจู่ๆ drop) นี่คือจังหวะอะไร และทำอะไรต่อ',
        options: [
          {
            tgt: 'MONITOR', label: '2nd degree AV block Mobitz II — เตรียม transcutaneous pacing ไว้พร้อมทันที', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูก! <span class="cbs-em">Mobitz II เสี่ยงทรุดเป็น complete block</span> ได้ทุกเมื่อ — แผ่น pacing ต้องแปะรอ ตั้ง standby ไว้เลย' }, t: 6 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'แปะแผ่น pacing เชื่อมเครื่องพร้อม standby แล้วค่ะ' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 0.5 mg รักษา Mobitz II ให้จบ', ok: false, why: 'Mobitz II/complete block block อยู่ใต้ AV node — atropine มักไม่ได้ผลและอาจทำ block แย่ลง เตรียม pacing ดีกว่า', worsen: true },
          { tgt: 'DEFIB', label: 'Shock 200 J ซ้ำเผื่อ VF กลับมา', ok: false, why: 'มีชีพจร nsr แล้ว — การ shock จังหวะที่มีชีพจร = ทำให้ arrest ซ้ำ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Pacing standby แล้ว — post-ROSC care ขั้นต่อไปที่สำคัญที่สุด',
        options: [
          {
            tgt: 'YOU', label: 'ทำ 12-lead ECG หาต้นเหตุ + ปรึกษา cardiology ด่วน + ให้ sedation คุมทางเดินหายใจ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: '12-lead ออกแล้วค่ะ! <span class="cbs-em">ST elevation ผนังล่าง — acute coronary syndrome!</span>' }, t: 8 },
              { inter: 'ACS!', drama: 'red', t: 4 },
              { say: { who: 'att_dech', pose: 'stern', text: 'นี่แหละต้นเหตุ — <span class="cbs-em">กล้ามเนื้อหัวใจขาดเลือดในลุง CAD/CABG ทำให้เกิดทั้ง AV block และ VF</span> ในคนเดียว' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ย้ายเข้า ICU สังเกตอาการเฉยๆ ไม่ต้องรีบหาสาเหตุ', ok: false, why: 'พลาดหัวใจของเคส — Mobitz II + VF ในผู้ป่วย CAD ต้องหา 12-lead หาต้นเหตุ ACS ทันที', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Amiodarone drip ต่อโดยไม่หา ischemia', ok: false, why: 'รักษาปลายเหตุ — ถ้าไม่แก้ ACS ที่เป็นต้นเหตุ ทั้ง arrhythmia จะกลับมา' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณจับได้ว่า<span class="cbs-em">ACS ก่อได้ทั้ง bradyarrhythmia และ VF</span> · AV block ที่มีชีพจรห้าม shock · Mobitz II เตรียม pacing ไม่พึ่ง atropine · และหา 12-lead หลัง ROSC เสมอ ลุงได้ไป Cath lab แล้ว' }, t: 6 },
    { end: true },
  ],
};
