// เคส: PEA arrest จาก Ruptured AAA (megacode) — non-shockable + hypovolemia จากเลือดออก
// จุดสอน: PEA ห้าม shock · hypovolemia ต้องให้ "เลือด" (massive transfusion) ไม่ใช่ crystalloid ล้วน ·
//         เลือดออกมหาศาลในช่องท้อง = surgical emergency → หยุดต้นเหตุด้วยการผ่าตัดด่วน Epi อย่างเดียวไม่พอ
export const aaaRupture = {
  id: 'aaa-rupture-01',
  title: 'PEA — ลุงเส้นเลือดใหญ่แตก',
  subtitle: 'ชายอายุ 70 ปี เบาหวาน ความดันสูง ปวดท้อง/หลังรุนแรง ความดันตกฮวบ แล้วหมดสติใน ER',
  level: 'megacode',
  track: 'causes',
  course: 'acls',
  hiddenCause: 'hypovolemia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 เรียกไม่รู้สึกตัวแล้วค่ะ! เมื่อกี้ยัง<span class="cbs-em">ปวดท้องร้าวไปหลัง</span>รุนแรง ความดันตกลงเรื่อยๆ!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เคสนี้อันตราย… <span class="cbs-em">ปวดท้องร้าวหลัง + ความดันตก</span> ในผู้สูงอายุความดันสูง คุณคือ Team Leader — เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ! ตัวซีดเย็นมาก — <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">มี QRS เป็นจังหวะ แต่คลำชีพจรไม่ได้เลย</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'YOU', label: 'รอ CT ยืนยัน AAA ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ imaging — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำไว้ — <span class="cbs-em">PEA มีไฟฟ้าแต่หัวใจไม่บีบ</span> มันมี "สาเหตุ" เสมอ ต้องไล่ H\'s &amp; T\'s' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เปิด IV ได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง PEA เหมือนเดิมค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่มีที่ใน PEA' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… <span class="cbs-em">ทำไมลุงถึง arrest?</span> ถ้าไม่แก้สาเหตุ กดทั้งวันก็ไม่กลับมา' }, t: 4 },
    {
      choice: {
        q: 'หาสาเหตุ (H\'s &amp; T\'s) — คุณจะทำอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ตรวจหน้าท้อง + POCUS: ประเมิน hypovolemia/เลือดออก', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'หน้าท้องโป่งตึงและมี <span class="cbs-em">ก้อนเต้นตุบๆ (pulsatile mass)</span> ค่ะ!' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'POCUS เห็น <span class="cbs-em">AAA ขนาดใหญ่ + เลือดท่วมช่องท้อง!</span> — ruptured AAA เสียเลือดมหาศาล!' }, t: 6 },
              { inter: 'HYPOVOLEMIA!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'PEA ยัง non-shockable — และยังไม่ได้หาสาเหตุ', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi 5 mg เพิ่มขนาดให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่แก้ต้นเหตุที่เสียเลือด' },
        ],
      },
    },
    {
      choice: {
        q: 'Ruptured AAA เสียเลือดมหาศาล — จะแก้ hypovolemia อย่างไร',
        options: [
          {
            tgt: 'DRUG', label: 'เปิดเส้นใหญ่ 2 เส้น + Massive Transfusion Protocol (ให้เลือด) ทันที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"เลือดมาแล้ว!"</span> PRC + FFP + platelet เปิดเต็มที่ผ่านเส้นใหญ่ค่ะ', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'ให้เลือดไปหลายถุงแล้ว… แต่ <span class="cbs-em">ยังเสียเลือดออกไม่หยุด</span> ค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'เปิด NSS/crystalloid ปริมาณมากรัวๆ อย่างเดียว', ok: false, why: 'เลือดออกมหาศาลต้องให้ "เลือด" — crystalloid ล้วนทำให้เจือจาง เลือดแข็งตัวแย่ลง (dilutional coagulopathy)', worsen: true },
          { tgt: 'MONITOR', label: 'ส่ง CT abdomen ยืนยันขนาด AAA ก่อนให้เลือด', ok: false, why: 'ผู้ป่วย arrest อยู่ — ห้ามเสียเวลาไป CT ต้องให้เลือด + กู้ชีพไปพร้อมกัน', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ให้เลือดคือประคอง… แต่ <span class="cbs-em">รูที่รั่วยังอยู่</span> — hypovolemia จากเลือดออกจะหยุดได้ต้อง "อุด" ที่ต้นเหตุ นี่คือ surgical emergency' }, t: 5 },
    {
      choice: {
        q: 'จะหยุดต้นเหตุ (เลือดออก) อย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'ปรึกษา Vascular surgery ด่วน + activate OR/hybrid room เพื่อ repair', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ติดต่อ Vascular แล้วค่ะ! <span class="cbs-em">OR/hybrid เตรียมพร้อมรับเลย!</span>' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'ระหว่างให้เลือดต่อเนื่อง… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้เลือดต่อไปเรื่อยๆ รอความดันขึ้นเองก่อนค่อยตัดสินใจ', ok: false, why: 'เลือดออกไม่มีทางหยุดเองถ้าไม่ผ่าตัด — ยิ่งรอยิ่งเสียเลือดจน arrest ซ้ำ', worsen: true },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ให้ดีก่อน แล้วค่อยคิดเรื่องผ่าตัด', ok: false, why: 'airway จัดการไปแล้วในทีม — ปัญหาคือเลือดออก ที่ต้อง definitive surgical repair ด่วน' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ส่ง OR ด่วนทันทีเพื่อ definitive repair (ยังเสียเลือดอยู่)', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'stern', text: 'T 36.2°C, P 120, <span class="cbs-em">BP 90/40 — ยังต่ำ ยังเสียเลือดอยู่</span> ค่ะ' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! คุณ<span class="cbs-em">หาต้นเหตุเจอและแก้ถูก</span> — hypovolemia จากเลือดออกต้องให้เลือด + หยุดต้นเหตุด้วยการผ่าตัด ส่ง OR เลย!' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'MONITOR', label: 'admit ICU สังเกตอาการเฉยๆ ยังไม่ต้องผ่าตัด', ok: false, why: 'BP ยังต่ำเพราะเลือดออกไม่หยุด — ถ้าไม่รีบ repair ผู้ป่วย arrest ซ้ำแน่นอน', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
