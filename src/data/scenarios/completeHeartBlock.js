// เคส: Complete (3rd degree) AV block → unstable VT ที่ยังมีชีพจร (megacode peri-arrest)
// จุดสอน: แยก unstable bradycardia (atropine → transcutaneous pacing) ออกจาก
//         unstable tachycardia ที่ยังมีชีพจร (synchronized cardioversion — ต้องกด SYNC!)
//         · pacing ต้องยืนยัน mechanical capture จริง ไม่ใช่แค่ spike บนจอ
//         · ผู้ป่วยรู้ตัว/เจ็บ ต้อง sedation · ผู้ป่วยมีชีพจรตลอด ห้ามเริ่ม CPR
export const completeHeartBlock = {
  id: 'chb-vt-01',
  title: 'หัวใจบล็อกสมบูรณ์ — ชีพจรช้าจนวูบ',
  subtitle: 'หญิงอายุ 30 ปี ใจสั่น หน้ามืด เกือบเป็นลม ชีพจรเต้นช้ามากแต่ยังคลำได้',
  level: 'megacode',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้หญิงเตียง 3 หน้ามืดจะเป็นลมค่ะ! <span class="cbs-em">ชีพจรช้ามาก HR 30</span> ความดัน 70/40!' }, t: 5 },
    { inter: 'PERI-ARREST!', drama: 'red', t: 0, fx: { alarm: true } },
    { say: { who: 'att_dech', pose: 'stern', text: 'ตั้งสติ — <span class="cbs-em">ยังคลำชีพจรได้ ไม่ใช่ cardiac arrest</span> แต่ช้าจนช็อก คุณคือ Team Leader เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด monitor + เปิด IV + ให้ O₂ + 12-lead', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">P wave กับ QRS เดินคนละจังหวะ ไม่สัมพันธ์กันเลย</span>' }, t: 8 },
              { inter: 'COMPLETE AV BLOCK!', drama: 'red', t: 4, fx: { rhythm: 'brady' } },
              { say: { who: 'att_dech', pose: 'stern', text: '3rd degree AV block — HR 30, ความดันตก, หน้ามืด นี่คือ <span class="cbs-em">unstable bradycardia</span> ที่มีอาการ' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ผู้ป่วยยังมีชีพจร! การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้เกิด arrest', worsen: true },
          { tgt: 'DRUG', label: 'ฉีด Atropine เลยไม่ต้องประเมิน', ok: false, why: 'ต้องยืนยัน rhythm และความไม่เสถียรก่อน จึงจะเลือกการรักษาได้ถูก' },
        ],
      },
    },
    {
      choice: {
        q: 'Unstable bradycardia — ยาตัวแรก',
        options: [
          {
            tgt: 'DRUG', label: 'Atropine 1 mg IV (first-line ของ symptomatic bradycardia)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Atropine 1 mg in!"</span> ยาเข้าแล้วค่ะ' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'รอแล้ว… <span class="cbs-em">HR ยังนิ่งอยู่ที่ 30 ค่ะ ไม่ตอบสนอง</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push เร็ว', ok: false, why: 'Adenosine ใช้กับ tachycardia (SVT) — ที่นี่หัวใจช้า ยิ่งให้ยิ่งหยุด', worsen: true },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion 100 J', ok: false, why: 'Cardioversion ใช้กับ tachyarrhythmia ไม่ใช่ bradycardia' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Atropine มักไม่ได้ผลใน <span class="cbs-em">high-degree AV block</span> เพราะบล็อกอยู่ใต้ AV node — อย่ารอ ไปขั้นถัดไป' }, t: 4 },
    {
      choice: {
        q: 'Atropine ไม่ได้ผล — ขั้นต่อไป',
        options: [
          {
            tgt: 'DEFIB', label: 'เริ่ม Transcutaneous pacing (TCP): เปิด pacer mode ตั้ง rate 70/min', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'แปะ pads หน้า-หลังแล้ว เปิด pacer… <span class="cbs-em">ตั้ง rate 70 เริ่มปล่อยกระแส</span>' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Atropine ซ้ำเรื่อยๆ จนกว่าจะขึ้น', ok: false, why: 'ใน complete AV block atropine มักไม่ได้ผล — เสียเวลา ควรไป pacing (dopamine/epi infusion เป็นทางเลือกถ้า pacing ไม่พร้อม)', worsen: true },
          { tgt: 'CPR', label: 'เริ่ม CPR เพราะ HR ต่ำมาก', ok: false, why: 'ยังคลำชีพจรได้ — การกดหน้าอกไม่มีข้อบ่งชี้และอาจทำให้แย่ลง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'กำลัง pace — จะรู้ได้ยังไงว่า "capture" จริง',
        options: [
          {
            tgt: 'DEFIB', label: 'ค่อยๆ เพิ่ม output (mA) จนเห็น electrical capture แล้วคลำชีพจรยืนยัน mechanical capture', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'เพิ่ม mA ขึ้นเรื่อยๆ… 80… 90… <span class="cbs-em">ที่ 100 mA! ทุก spike ตามด้วย QRS กว้าง และคลำชีพจรได้ตรงจังหวะ!</span>' }, t: 8, fx: { rhythm: 'pacing' } },
              { say: { who: 'att_dech', pose: 'stern', text: 'นั่นคือ capture จริง — <span class="cbs-em">electrical + mechanical</span> ความดันเริ่มขึ้นแล้ว' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ตั้ง output ต่ำสุดพอเห็น pacing spike บนจอก็พอ', ok: false, why: 'spike อย่างเดียวคือ electrical เท่านั้น — ถ้าไม่มี QRS ตามและคลำชีพจรไม่ได้ = ไม่ capture หัวใจไม่บีบจริง', worsen: true },
          { tgt: 'YOU', label: 'เห็น spike บนจอแล้ว ถือว่าใช้ได้ ไม่ต้องคลำชีพจร', ok: false, why: 'ต้องยืนยัน mechanical capture ด้วยการคลำชีพจร/ดูความดันเสมอ ไม่ใช่ดูแค่หน้าจอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยยังรู้ตัวและร้องว่าเจ็บมากจากการ pace',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ analgesia + sedation (เช่น fentanyl + midazolam) แล้ว pace ต่อ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ยาแล้วค่ะ ผู้ป่วยสงบลง <span class="cbs-em">ยังคง capture รักษาความดันได้</span>' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุด pacing เพราะผู้ป่วยเจ็บทนไม่ไหว', ok: false, why: 'หยุด pace = เสีย capture ความดันตกซ้ำ — ต้องให้ยาแก้เจ็บ ไม่ใช่หยุดเครื่อง', worsen: true },
          { tgt: 'DEFIB', label: 'เร่ง output ให้สูงขึ้นอีกโดยไม่ให้ยา', ok: false, why: 'TCP เจ็บมาก การเพิ่ม mA ยิ่งเจ็บ — ต้อง sedation เสมอเมื่อผู้ป่วยรู้ตัว', worsen: true },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'panic', text: 'อาจารย์! จอเปลี่ยนกะทันหัน! <span class="cbs-em">QRS กว้างเร็วสม่ำเสมอ HR 180</span> — ยังคลำชีพจรได้แต่ความดัน 50/30 ค่ะ!' }, t: 6 },
    { inter: 'UNSTABLE VT — มีชีพจร!', drama: 'red', t: 4, fx: { rhythm: 'tachy' } },
    { say: { who: 'att_dech', pose: 'stern', text: 'เปลี่ยนเกมแล้ว — คราวนี้ <span class="cbs-em">unstable tachycardia ที่ยังมีชีพจร</span> คนละอย่างกับตอนช้า อย่าสับสน' }, t: 5 },
    {
      choice: {
        q: 'VT มีชีพจรแต่ช็อก — เตรียมอะไรก่อนช็อกไฟ',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ sedation ก่อน (ผู้ป่วยยังรู้ตัว) แล้วเตรียม synchronized cardioversion', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Sedation เข้าแล้วค่ะ ผู้ป่วยหลับ <span class="cbs-em">พร้อม cardiovert</span>' }, t: 6 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่ม CPR ทันทีเพราะ VT', ok: false, why: 'VT นี้ยังมีชีพจร! CPR ใช้เฉพาะ pulseless VT/VF — ที่นี่ต้อง cardiovert', worsen: true },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push', ok: false, why: 'ผู้ป่วยไม่เสถียร (BP 50/30) ต้องใช้ไฟฟ้าทันที ไม่ใช่ลองยา', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ปล่อยไฟให้ VT ที่มีชีพจร — ตั้งเครื่องยังไง',
        options: [
          {
            tgt: 'DEFIB', label: 'กดปุ่ม SYNC ให้ขึ้น → Synchronized cardioversion 100 J', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'SYNC ติดแล้ว เครื่องจับ R wave… <span class="cbs-em">"CLEAR!" — ปล่อยไฟ 100 J!</span>' }, t: 8 },
              { inter: 'CONVERTED!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'Defibrillation แบบ unsynchronized 200 J เลย', ok: false, why: 'ไม่กด SYNC = ไฟอาจตกช่วง T wave (R-on-T) เหนี่ยวนำ VF จาก VT ที่ยังมีชีพจร', worsen: true },
          { tgt: 'DEFIB', label: 'Unsynchronized 360 J ให้แรงสุด', ok: false, why: 'ทั้งพลังงานเกินและไม่ sync — VT ที่มีชีพจรต้อง synchronized เริ่ม ~100 J', worsen: true },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'happy', text: 'จอกลับมาแล้วค่ะ! <span class="cbs-em">Normal sinus rhythm</span> — P นำ QRS สัมพันธ์กันดี HR 100 ความดัน 110/70!' }, t: 6, fx: { rhythm: 'nsr' } },
    {
      choice: {
        q: 'จังหวะกลับมาปกติแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินซ้ำ + 12-lead + หาสาเหตุ + admit monitor/CCU ปรึกษาใส่ pacemaker', ok: true,
            then: [
              { inter: 'STABLE!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! คุณ<span class="cbs-em">แยก unstable brady (atropine→pacing) ออกจาก unstable VT มีชีพจร (synchronized cardioversion) ได้ถูก</span> ทั้งยืนยัน capture และไม่ลืม sedation — เคสนี้เป็นของคุณ' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำอีกทีให้ชัวร์', ok: false, why: 'จังหวะปกติมีชีพจรแล้ว — การช็อกซ้ำอาจเหนี่ยวนำ arrhythmia ใหม่', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Atropine อีก 1 dose กันช้าซ้ำ', ok: false, why: 'HR 100 ปกติแล้ว ไม่มีข้อบ่งชี้ — ให้หาและแก้สาเหตุแทน' },
        ],
      },
    },
    { end: true },
  ],
};
