// เคส: PEA arrest จาก Massive pulmonary embolism (megacode) — non-shockable + ต้องสืบสาเหตุ
// จุดสอน: PEA ห้าม shock · ผู้ป่วยหลังผ่าตัด/ขาบวมข้างเดียว ที่ arrest แบบ PEA เฉียบพลัน
//         + POCUS เห็น RV โต → massive PE → พิจารณา thrombolytics ระหว่าง CPR
export const pulmonaryEmbolism = {
  id: 'pe-massive-01',
  title: 'PEA — คนไข้หลังผ่าตัดที่จู่ๆ ทรุด',
  subtitle: 'หญิงอายุ 48 ปี ผ่าตัดเปลี่ยนข้อสะโพก 3 วันก่อน ลุกเข้าห้องน้ำแล้วหน้ามืด เหนื่อยหอบ ก่อนหมดสติ',
  level: 'megacode',
  hiddenCause: 'pulmonary-embolism',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! พี่เขาลุกจากห้องน้ำแล้วล้มฟุบเลยค่ะ! บ่นเหนื่อยหอบก่อนหน้านี้แป๊บเดียว!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ผ่าตัดสะโพกมา 3 วัน แล้วทรุดตอนลุกเดิน… <span class="cbs-em">คุณคือ Team Leader</span> ระวังให้ดี' }, t: 5 },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น… <span class="cbs-em">Sinus tach มีจังหวะชัด แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'YOU', label: 'รอผล CT ปอดก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันที ผู้ป่วย arrest จะไป CT ไม่ได้', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: '<span class="cbs-em">หลังผ่าตัด + ขยับตัวแล้วทรุดเฉียบพลัน + PEA</span> — ตัวหนึ่งใน T\'s ต้องขึ้นมาในหัวคุณทันที' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> ค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    {
      choice: {
        q: 'หาสาเหตุข้างเตียง — คุณสั่งอะไร',
        options: [
          {
            tgt: 'MONITOR', label: 'POCUS หัวใจ ช่วงพักคลำชีพจร + ดูขาสองข้าง', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอ echo… <span class="cbs-em">ห้องขวาโตกว่าห้องซ้ายชัดเจน! ผนังกั้นดันไปทางซ้าย!</span>' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ขาขวาบวมกว่าข้างซ้ายเห็นชัดเลยค่ะ — <span class="cbs-em">น่าจะมี DVT!</span>' }, t: 6 },
              { inter: 'MASSIVE PE!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'MONITOR', label: 'รอส่ง CTPA ยืนยันก่อนตัดสินใจ', ok: false, why: 'ผู้ป่วย arrest ไป CT ไม่ได้ — ใช้ POCUS + คลินิกตัดสินข้างเตียง', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi ซ้ำรัวๆ ทุก 1 นาที', ok: false, why: 'ผิดจังหวะ (Epi ทุก 3-5 นาที) และไม่ได้หาต้นเหตุ' },
        ],
      },
    },
    {
      choice: {
        q: 'สงสัย massive PE ขณะ arrest — การตัดสินใจสำคัญ',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ thrombolytic (เช่น alteplase) + CPR ต่อยาวอย่างน้อย 60–90 นาที', ok: true,
            then: [
              { inter: 'ให้ยาละลายลิ่มเลือด!', drama: 'red', t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ตัดสินใจถูก — <span class="cbs-em">PE ที่ยืนยันหรือสงสัยชัด ให้ยาละลายลิ่มได้ระหว่าง CPR</span> แล้วต้องกดต่อให้ยาออกฤทธิ์', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่องหลังให้ยา — หลายนาที', t: 240 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span> ความดันเริ่มกลับมา!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 200 J เผื่อได้ผล', ok: false, why: 'ยัง PEA — non-shockable และไม่สลายลิ่มที่อุดปอด', worsen: true },
          { tgt: 'YOU', label: 'หยุด CPR ประกาศยุติเพราะ PE รักษาไม่ได้', ok: false, why: 'ยอมแพ้เร็วเกินไป — PE คือ T ที่แก้ได้ ให้ยาละลายลิ่มแล้วกดต่อยาวๆ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ปรึกษาทีม PE/หลอดเลือด เรื่องการรักษาต่อ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! <span class="cbs-em">คุณเชื่อมโยงประวัติผ่าตัด + RV โต จน call PE ได้</span> แล้วกล้าให้ยาละลายลิ่มระหว่าง code — นั่นคือสิ่งที่ช่วยชีวิตเคสนี้' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'DRUG', label: 'ให้ thrombolytic ซ้ำอีก dose ทันที', ok: false, why: 'ROSC แล้ว — ประเมินก่อน ไม่ bolus ยาละลายลิ่มซ้ำพร่ำเพรื่อ เสี่ยงเลือดออก' },
        ],
      },
    },
    { end: true },
  ],
};
