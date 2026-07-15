// เคส: สำลักสิ่งแปลกปลอม (Foreign Body Airway Obstruction) → PEA → pulse VT → ROSC (megacode)
// จุดสอน: FB obstruction ทำให้ hypoxia → arrest — ต้องเอาสิ่งแปลกปลอมออก (H's & T's: Hypoxia)
//         PEA เป็น non-shockable (Epi + CPR ห้าม shock) · เอา FB ออกด้วย laryngoscope + Magill forceps
//         พอชีพจรกลับแต่เป็น VT ไม่เสถียร → synchronized cardioversion (ไม่ใช่ defibrillation)
export const fbObstruction = {
  id: 'fb-obstruction-01',
  title: 'สำลัก — ลุงที่กลืนไม่ลง',
  subtitle: 'ชายอายุ 60 ปี กำลังกินข้าว จู่ๆ กุมคอ หายใจไม่ออก แล้วหมดสติล้มลงต่อหน้าคุณ',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'foreign-body',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 สำลักข้าวค่ะ! กุมคอหน้าเขียว… <span class="cbs-em">ล้มไปแล้ว เรียกไม่รู้สึกตัว!</span>' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เมื่อกี้ยังกินข้าวอยู่ดีๆ… <span class="cbs-em">นี่คือสำลักสิ่งแปลกปลอม</span> คุณคือ Team Leader — เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ล้วงคอด้วยนิ้ว (blind finger sweep) หาเศษอาหาร', ok: false, why: 'ห้าม blind finger sweep — ดันสิ่งแปลกปลอมลึกลงและทำให้ทางเดินหายใจบวมช้ำ', worsen: true },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่ยืนยัน arrest และยังไม่รู้ rhythm — ประเมินก่อน' },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">มี QRS เป็นจังหวะ แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ — และยังไม่ได้เคลียร์สิ่งแปลกปลอม', worsen: true },
          { tgt: 'YOU', label: 'รอผล film คอก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: '<span class="cbs-em">PEA คือ non-shockable</span> — และมันมี "สาเหตุ" เสมอ H\'s &amp; T\'s… ลุงสำลัก คิดถึงตัว H ตัวไหน?' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'แต่ถ้าอากาศยังเข้าปอดไม่ได้ Epi กี่โดสก็ไม่พอ — <span class="cbs-em">Hypoxia จากสิ่งแปลกปลอมคือต้นเหตุ</span>' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    {
      choice: {
        q: 'แก้ต้นเหตุ — เอาสิ่งแปลกปลอมออกอย่างไร',
        options: [
          {
            tgt: 'AIRWAY', label: 'ส่อง laryngoscope + คีบด้วย Magill forceps ภายใต้การมองเห็น', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'ส่องเห็นแล้วค่ะ! เศษอาหารก้อนใหญ่อุดกล่องเสียง… <span class="cbs-em">คีบออกได้แล้ว!</span>' }, t: 8 },
              { inter: 'AIRWAY โล่ง!', green: true, t: 4 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'อากาศเข้าปอดสองข้างเท่ากันแล้วครับ! กดต่อ…', fx: { cpr: true } }, t: 5 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ล้วงคอด้วยนิ้ว (blind finger sweep)', ok: false, why: 'ห้าม blind sweep — มองไม่เห็น เสี่ยงดันของลึกลงและทำให้บาดเจ็บ ต้องส่องเห็นแล้วคีบ', worsen: true },
          { tgt: 'AIRWAY', label: 'ดันใส่ ET tube ทะลุลงไปเลย', ok: false, why: 'ดันท่อทับสิ่งแปลกปลอมยิ่งอุดสนิท — ต้องเอาของออกก่อนด้วย Magill forceps' },
        ],
      },
    },
    {
      choice: {
        q: 'เคลียร์ทางเดินหายใจแล้ว — รอบยานี้ให้อะไร',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine โดสที่ 2 (1 mg ทุก 3-5 นาที)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi dose 2 in!"</span> ครบ cycle พอดีค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… จอเปลี่ยนเป็นคลื่นกว้างเร็ว และ<span class="cbs-em">คลำชีพจรได้แล้ว — แต่เป็น VT!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้น', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'DEFIB', label: 'Shock 200 J ซ้ำอีกครั้ง', ok: false, why: 'ยัง PEA อยู่ — non-shockable ห้าม shock', worsen: true },
        ],
      },
    },
    { inter: 'มีชีพจร — VT ไม่เสถียร!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
    { say: { who: 'att_dech', pose: 'stern', text: 'ระวัง! <span class="cbs-em">ตอนนี้มีชีพจรแล้ว</span> — VT ที่มีชีพจรแต่ความดันตก ห้ามกดหน้าอก ห้าม defib ธรรมดา' }, t: 5 },
    {
      choice: {
        q: 'Pulse VT ความดัน 70/40 ซึมลง — ทำอะไร',
        options: [
          {
            tgt: 'DEFIB', label: 'Synchronized cardioversion 100 J (กด SYNC!)', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'กด SYNC แล้วค่ะ… เครื่องจับ R wave… <span class="cbs-em">Cardiovert 100 J — ปล่อย!</span>' }, t: 8 },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'จอกลับมาเป็นจังหวะแคบสม่ำเสมอ… <span class="cbs-em">ชีพจรชัดขึ้น ความดันขึ้นครับ!</span>' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Defibrillation 200 J แบบไม่ sync', ok: false, why: 'ผู้ป่วยมีชีพจร! ไฟที่ไม่ sync อาจตกช่วง T wave → เหนี่ยวนำให้กลายเป็น VF', worsen: true },
          { tgt: 'CPR', label: 'กดหน้าอกต่อทันที', ok: false, why: 'มีชีพจรแล้ว — การกดหน้าอกบนหัวใจที่ยังบีบทำให้จังหวะรวนและอันตราย', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'จังหวะกลับมาปกติ ชีพจรชัด — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care — ยืนยัน airway, ดู 12-lead, ประคับความดัน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'สัญญาณชีพนิ่งแล้วค่ะ — <span class="cbs-em">T 37°C · P 70 · BP 100/60 · RR 10</span>' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! คุณเห็นภาพรวม — <span class="cbs-em">เอาสิ่งแปลกปลอมออกแก้ hypoxia</span> PEA ไม่ shock พอชีพจรกลับเป็น VT ก็เลือก sync cardioversion ไม่ใช่ defib ลุงรอดแล้ว' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — การ shock ทำให้ arrest ซ้ำ', worsen: true },
          { tgt: 'DRUG', label: 'Epinephrine อีก 1 dose', ok: false, why: 'ROSC แล้ว ไม่ต้อง bolus Epi ต่อ — เปลี่ยนไปโหมด post-arrest' },
        ],
      },
    },
    { end: true },
  ],
};
