// เคส: PEA arrest จาก Tension pneumothorax (megacode) — non-shockable + ต้องสืบสาเหตุ
// จุดสอน: PEA ห้าม shock · ผู้ป่วย COPD/ใส่เครื่องช่วยหายใจ ที่ arrest แบบ PEA
//         + เสียงหายใจหายข้างเดียว + หลอดลมเบี้ยว → tension pneumothorax →
//         needle decompression ก่อน ไม่งั้นกดทั้งวันก็ไม่ ROSC
export const tensionPneumo = {
  id: 'tension-pneumo-01',
  title: 'PEA — ลุง COPD ที่จู่ๆ ดิ้นแล้วนิ่ง',
  subtitle: 'ชายอายุ 65 ปี COPD กำเริบ ใส่ท่อช่วยหายใจอยู่ จู่ๆ ความดันตก ออกซิเจนวูบ แล้วหมดชีพจร',
  level: 'megacode',
  track: 'causes',
  hiddenCause: 'tension-pneumothorax',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 ความดันตกฮวบ SpO₂ เหลือ 60 แล้วค่ะ! เครื่องช่วยหายใจ alarm ดังลั่น!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ลุงใส่ท่ออยู่แท้ๆ ทำไมถึงทรุดเร็วขนาดนี้… <span class="cbs-em">คุณคือ Team Leader</span> ว่ามาเลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำ carotid ไม่ได้ค่ะ! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่รู้ rhythm และยังไม่ยืนยัน arrest — ประเมินก่อนเสมอ' },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น… <span class="cbs-em">QRS แคบ เป็นจังหวะ แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ถอดท่อออกแล้วใส่ใหม่ก่อนเลย', ok: false, why: 'ยังไม่ถึงเวลา — CPR มาก่อน แล้วค่อยหาว่าทำไม PEA', worsen: true },
          { tgt: 'YOU', label: 'รอผล X-ray ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: '<span class="cbs-em">PEA มีสาเหตุเสมอ</span> — คนไข้ใส่ท่อที่ทรุดเฉียบพลันแบบนี้ ต้องนึกถึง H\'s &amp; T\'s ให้ไว' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไปพร้อมเริ่มหาสาเหตุ',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> ค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! shock ไม่ช่วยและทำให้หยุดกด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    {
      choice: {
        q: 'ตรวจร่างกายด่วนหาสาเหตุ — คุณสั่งอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ฟังปอดสองข้าง + ดูหลอดลม + เส้นเลือดคอ ระหว่างที่ทีมกดต่อ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ฟังปอด… <span class="cbs-em">ข้างขวาเงียบสนิท!</span> เคาะโปร่งเหมือนกลอง!' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'หลอดลมเบี้ยวไปทางซ้าย เส้นเลือดคอโป่ง <span class="cbs-em">bagging ก็ยากขึ้นเรื่อยๆ!</span>' }, t: 6 },
              { inter: 'TENSION PNEUMOTHORAX!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'MONITOR', label: 'สั่งรอ portable chest X-ray มายืนยันก่อน', ok: false, why: 'Tension pneumothorax เป็นการวินิจฉัยทางคลินิก — รอ X-ray ผู้ป่วยตายก่อน', worsen: true },
          { tgt: 'DRUG', label: 'เพิ่ม Epi เป็น 3 mg ให้ดันความดันขึ้น', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่แก้ต้นเหตุที่บีบหัวใจอยู่' },
        ],
      },
    },
    {
      choice: {
        q: 'ปอดขวาเงียบ + หลอดลมเบี้ยว — สิ่งที่ช่วยชีวิตตอนนี้',
        options: [
          {
            tgt: 'AIRWAY', label: 'Needle decompression ทันที เข็มใหญ่ ช่องซี่โครงที่ 2 แนวกลางไหปลาร้าขวา', ok: true,
            then: [
              { inter: 'HISSSS — ลมพุ่งออก!', drama: 'red', t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ลมพุ่งออกมาเลยค่ะ! ตามด้วยใส่ ICD… <span class="cbs-em">bagging คล่องขึ้นทันที</span>', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span> ความดันเริ่มกลับมา!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 200 J เผื่อช่วยได้', ok: false, why: 'ยัง PEA — non-shockable และไม่ปลดแรงกดในทรวงอก', worsen: true },
          { tgt: 'AIRWAY', label: 'ดูดเสมหะในท่อช่วยหายใจก่อน', ok: false, why: 'ไม่ตรงสาเหตุ — ปัญหาคือลมอัดในเยื่อหุ้มปอด ไม่ใช่เสมหะอุดท่อ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ใส่สาย ICD ถาวร + X-ray ยืนยัน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! <span class="cbs-em">คุณฟังปอดจนเจอ tension pneumo</span> — ถ้ามัวแต่กดกับให้ยา ลุงไม่รอดแน่ ปลดแรงบีบหัวใจได้ทันเวลา' }, t: 5 },
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
