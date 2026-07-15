// เคส: Pulseless VT → Mobitz II → ส่งต่อ senior (megacode)
// จุดสอน: แยก shockable (pVT → shock + Amiodarone) ออกจาก Mobitz II ที่ตามมา
//         (เตรียม transcutaneous pacing ไม่พึ่ง atropine) และทักษะสำคัญ =
//         รู้ขอบเขตตัวเอง ขอความช่วยเหลือ/ส่งต่อ staff อาวุโสเมื่อเคสเกินกำลัง พร้อมส่งมอบข้อมูลชัดเจน (SBAR)
// หมายเหตุ: เคสนี้จบด้วย "การรับช่วงต่อโดย staff" (professional handover) — ไม่ใช่ผู้ป่วยเสีย ไม่ใช่ ROSC เกินจริง
export const pvtHandover = {
  id: 'pvt-handover-01',
  title: 'Pulseless VT — เมื่อต้องรู้จักขอความช่วยเหลือ',
  subtitle: 'หญิงอายุ 75 ปี หมดสติกลางหอผู้ป่วย คลำชีพจรไม่ได้ จอขึ้นจังหวะเร็วผิดปกติ',
  level: 'megacode',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คุณป้าเตียง 8 เรียกไม่รู้สึกตัวแล้วค่ะ! เมื่อกี้ยังกดออดเรียกอยู่เลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทั้งทีมหันมาที่คุณ… <span class="cbs-em">คุณคือ Team Leader</span> — เริ่มได้เลย ผมจะดูอยู่ห่างๆ' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำ carotid ≤10 วินาที + เรียกทีมขอ crash cart', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'เขย่าเรียกไม่ตอบ คลำไม่ได้เลยค่ะ! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock ทันที', ok: false, why: 'ยังไม่ยืนยัน arrest และยังไม่เห็น rhythm — ประเมินก่อนเสมอ' },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ทันที', ok: false, why: 'ต้องยืนยัน arrest + เริ่ม CPR ก่อน ยาไม่ใช่ขั้นแรก' },
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
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">QRS กว้าง เร็วสม่ำเสมอ แต่คลำชีพจรไม่ได้</span>!' }, t: 6 },
              { inter: 'PULSELESS VT — SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'หยุดทุกอย่างเพื่อใส่ ET tube ก่อน', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก', worsen: true },
          { tgt: 'MONITOR', label: 'ติด 12-lead ECG ให้ครบก่อนค่อยเริ่ม', ok: false, why: '12-lead รอได้ ชีพจรรอไม่ได้ — เริ่ม CPR ทันที', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Pulseless VT ก็คือ <span class="cbs-em">shockable</span> เหมือน VF — ไฟฟ้าต้องมาก่อน จำหลักนี้ให้แม่น' }, t: 4 },
    {
      choice: {
        q: 'Pulseless VT — จังหวะ shockable',
        options: [
          {
            tgt: 'DEFIB', label: 'Charge 200 J — กดหน้าอกต่อระหว่างรอไฟ แล้ว "CLEAR!" — SHOCK', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'Charging… <span class="cbs-em">200 จูลพร้อมค่ะ!</span> เคลียร์รอบเตียงแล้ว!' }, t: 6 },
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อทันทีครับ! <span class="cbs-em">ไม่หยุดเช็คชีพจร!</span>', fx: { cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ก่อน ค่อย shock', ok: false, why: 'ใน shockable rhythm ไฟฟ้ามาก่อนยาเสมอ — shock ให้เร็วที่สุด' },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อนเผื่อพอ', ok: false, why: 'ต่ำเกินไป — ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock ครั้งแรก — ยัง pulseless VT อยู่',
        options: [
          {
            tgt: 'DRUG', label: 'Shock ซ้ำ + Amiodarone 300 mg IV bolus + Epi 1 mg', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in! Epi 1 mg in!"</span> ขานยาดังทั่วห้องค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… เดี๋ยวนะ… <span class="cbs-em">จอเปลี่ยนแล้ว! ไม่ใช่ VT แล้วค่ะ</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน pulseless VT — ใช้ใน bradycardia ที่มีชีพจร' },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg แต่ข้าม shock รอบนี้ไป', ok: false, why: 'ยัง shockable — ห้ามข้าม shock ไฟฟ้ายังเป็นตัวหลัก', worsen: true },
        ],
      },
    },
    { inter: 'จังหวะเปลี่ยน — MONITOR!', drama: 'red', t: 4, fx: { rhythm: 'nsr' } },
    {
      choice: {
        q: 'จอเปลี่ยนเป็นจังหวะเป็นระเบียบ — ทำอะไรก่อน',
        options: [
          {
            tgt: 'YOU', label: 'หยุด CPR สั้นๆ คลำชีพจร + อ่าน rhythm strip ให้ชัด', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอเป็น <span class="cbs-em">2nd degree AV block, Mobitz II</span> — PR คงที่แล้วมี P บางตัวตกหายค่ะ' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำชีพจรได้… แต่ <span class="cbs-em">เบามาก จับได้บ้างไม่ได้บ้าง</span> HR ~40 ค่ะ!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ซ้ำอีกครั้งให้ชัวร์', ok: false, why: 'จังหวะเป็นระเบียบและเริ่มมีชีพจร — การ shock ตอนนี้จะเหนี่ยวนำ arrest ซ้ำ อันตรายที่สุด', worsen: true },
          { tgt: 'CPR', label: 'กดต่ออีก 2 นาทีโดยไม่เช็ค', ok: false, why: 'จอเปลี่ยนชัดเจน ต้อง pause สั้นๆ เช็คชีพจรเพื่อปรับแผน' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Mobitz II นี่อันตราย — <span class="cbs-em">block อยู่ใต้ AV node</span> มักไม่ตอบ atropine และเสี่ยงกลายเป็น complete block เตรียมทางไฟฟ้าไว้' }, t: 5 },
    {
      choice: {
        q: 'Mobitz II + ชีพจรเบาไม่คงที่ HR ~40 — จัดการอย่างไร',
        options: [
          {
            tgt: 'DEFIB', label: 'เตรียม/เริ่ม transcutaneous pacing (ตั้ง rate 70-80, เพิ่ม output จน capture) + sedation', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ตั้ง pacer แล้วค่ะ เพิ่ม mA ขึ้นเรื่อยๆ… <span class="cbs-em">threshold 80 mA จับ capture ได้!</span>' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ยา sedation คุมความเจ็บจาก pacing แล้วค่ะ ผู้ป่วยนิ่งลง' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg IV รักษา Mobitz II', ok: false, why: 'Mobitz II เป็น block ใต้ AV node — atropine มักไม่ได้ผลและอาจเพิ่มอัตรา atrial ทำให้ block แย่ลง เตรียม pacing ดีกว่า', worsen: true },
          { tgt: 'DEFIB', label: 'Unsynchronized shock กระตุกให้หัวใจเต้นเอง', ok: false, why: 'มีชีพจรและ QRS เป็นระเบียบแล้ว — การ shock ไม่ sync เสี่ยงเหนี่ยวนำ VF', worsen: true },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'stern', text: 'Pacing capture คงที่ แต่ผู้ป่วยยังไม่นิ่ง <span class="cbs-em">ความดันก้ำกึ่ง ต้องหาสาเหตุ block และวางแผน transvenous pacing ต่อ</span>' }, t: 6 },
    {
      choice: {
        q: 'เคสซับซ้อนเกินขอบเขตที่คุณจะดูแลลำพัง — ก้าวต่อไปที่เป็นมืออาชีพที่สุดคือ',
        options: [
          {
            tgt: 'YOU', label: 'ขอความช่วยเหลือ — เรียก staff อาวุโสรับช่วง แล้วสรุปสถานการณ์ส่งมอบแบบ SBAR', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'ดีมาก — <span class="cbs-em">การรู้ว่าเมื่อไหร่ต้องขอความช่วยเหลือ คือทักษะของผู้นำที่แท้จริง</span> ผมรับเคสต่อเอง เล่าให้ฟังสั้นๆ' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ผู้เรียนสรุป: <span class="cbs-em">"ป้า 75 ปี arrest จาก pulseless VT — shock + amio กลับมาเป็น Mobitz II กำลัง pace ที่ 80 mA capture ดี sedation แล้ว"</span>' }, t: 8 },
              { inter: 'STAFF เข้ารับเคส', green: true, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ฝืนดูแลต่อเองทั้งหมด ไม่รบกวนใคร', ok: false, why: 'เคสเกินขอบเขต resident คนเดียว — การฝืนทำเองทั้งที่ควรขอความช่วยเหลือทำให้ผู้ป่วยเสี่ยง การรู้ขอบเขตตัวเองสำคัญกว่าอีโก้', worsen: true },
          { tgt: 'DRUG', label: 'ให้ atropine เพิ่มระหว่างรอ เผื่อดีขึ้นเอง', ok: false, why: 'Mobitz II ไม่ตอบ atropine และไม่ควรถ่วงเวลา — สิ่งที่ต้องทำคือส่งต่อ senior' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'สรุปบทเรียน: <span class="cbs-em">แยก shockable (pVT → shock + Amiodarone) ออกจาก Mobitz II ที่ตามมา</span> — Mobitz II เตรียม pacing ไม่พึ่ง atropine' }, t: 6 },
    { say: { who: 'att_dech', pose: 'stern', text: 'และที่สำคัญที่สุดวันนี้ — <span class="cbs-em">คุณรู้ขอบเขตของตัวเอง ขอความช่วยเหลือและส่งมอบข้อมูลชัดเจนตอนเคสเกินกำลัง</span> นั่นคือความปลอดภัยของผู้ป่วยตัวจริง' }, t: 6 },
    { end: true },
  ],
};
