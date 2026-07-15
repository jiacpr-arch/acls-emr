// เคส: VF arrest จาก Severe hypothermia (megacode) — shockable แต่ดื้อจนกว่าจะอุ่น
// จุดสอน: hypothermia รุนแรง (core < 30°C) → VF ดื้อต่อ shock/ยา ·
//         จำกัด shock ไว้ก่อน · เดินหน้า active rewarming · CPR ต่อยาว ·
//         "ยังไม่ตายจนกว่าจะอุ่นและตาย (not dead until warm and dead)"
export const hypothermiaVf = {
  id: 'hypothermia-vf-01',
  title: 'VF — คนแช่น้ำเย็นที่ตัวเย็นเฉียบ',
  subtitle: 'ชายอายุ 40 ปี ตกลงไปในอ่างเก็บน้ำหน้าหนาว กู้ภัยนำส่ง ตัวเย็นจัด ซึม แล้วหมดชีพจร',
  level: 'megacode',
  track: 'causes',
  hiddenCause: 'hypothermia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้ตัวเย็นเฉียบเลยค่ะ ริมฝีปากเขียว วัดอุณหภูมิแกนได้แค่ 27 องศา!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ตัวเย็นขนาดนี้… กติกาเปลี่ยนไปจากเคสทั่วไป <span class="cbs-em">คุณคือ Team Leader</span> ตั้งสติให้ดี' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก — คนไข้ hypothermia',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน + คลำชีพจรนานขึ้นถึง ~60 วินาที (ชีพจรช้า/เบามาก) + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 10, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำเต็มที่แล้ว <span class="cbs-em">ไม่มีชีพจรจริงค่ะ!</span>' }, t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'กดหน้าอกทันทีโดยไม่ต้องคลำ', ok: false, why: 'ใน hypothermia ชีพจรช้าและเบามาก ควรคลำนานขึ้น (~60 วิ) ก่อน เพื่อเลี่ยงกดทับหัวใจที่ยังเต้นอยู่' },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ทันที', ok: false, why: 'ต้องยืนยัน arrest ก่อน — และใน hypothermia รุนแรงยายังออกฤทธิ์ไม่ดี' },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยัน arrest — ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูง + แปะ pads ดู rhythm + เริ่มอุ่นตัวไปพร้อมกัน', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 6, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation ค่ะ</span> — แต่ตัวคนไข้ยังเย็นจัด' }, t: 6 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'YOU', label: 'รอให้ตัวอุ่นก่อนค่อยเริ่ม CPR', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันที และอุ่นตัวไปพร้อมกัน', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำหลักไว้ — <span class="cbs-em">VF ในคนตัวเย็นจัดมักดื้อต่อ shock จนกว่าอุณหภูมิจะขึ้น</span> อย่าเพิ่งยิงไฟรัวๆ' }, t: 4 },
    {
      choice: {
        q: 'VF + core 27°C — จะ defibrillate ยังไง',
        options: [
          {
            tgt: 'DEFIB', label: 'Shock 1 ครั้งที่พลังงานสูงสุด แล้วโฟกัส CPR + rewarming ต่อ', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 6, fx: { shock: true } },
              { say: { who: 'fon_defib', pose: 'stern', text: 'ยิงไป 1 ครั้งแล้ว… <span class="cbs-em">ยัง VF อยู่ค่ะ</span> ตามคาดเพราะยังเย็น', fx: { rhythm: 'vf', cpr: true } }, t: 8 },
            ],
          },
          { tgt: 'DEFIB', label: 'ยิง shock รัวๆ ติดกันหลายครั้งจนกว่าจะหาย', ok: false, why: 'core < 30°C VF ดื้อไฟ — ยิงรัวไม่ช่วย ควรยิงจำกัดแล้วเน้นอุ่นตัว', worsen: true },
          { tgt: 'DRUG', label: 'อัด Amiodarone + Epi ถี่ๆ เหมือน VF ปกติ', ok: false, why: 'ตัวเย็นจัดยาสะสมไม่ออกฤทธิ์ — ให้เว้นระยะ/ชะลอยาจนตัวเริ่มอุ่น' },
        ],
      },
    },
    {
      choice: {
        q: 'สิ่งที่ "เปลี่ยนเกม" ที่แท้จริงในเคสนี้',
        options: [
          {
            tgt: 'YOU', label: 'Active rewarming เต็มที่: ถอดเสื้อผ้าเปียก ผ้าห่มลมร้อน น้ำเกลืออุ่น พิจารณา ECMO/bypass', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ถอดเสื้อเปียกออกหมดแล้ว เป่าลมร้อน + ให้สารน้ำอุ่นทาง IV ค่ะ <span class="cbs-em">อุณหภูมิเริ่มขยับ… 28… 29…</span>', fx: { cpr: true } }, t: 10 },
              { say: { who: 'att_dech', pose: 'stern', text: 'โทรปรึกษาทีม ECMO แล้ว — <span class="cbs-em">"ยังไม่ตายจนกว่าจะอุ่นและตาย"</span> เราจะกดต่อจนกว่าตัวจะอุ่น' }, t: 6 },
              { skip: 'CPR + อุ่นตัวต่อเนื่อง — core ค่อยๆ ขึ้นถึง 32°C', t: 300 },
            ],
          },
          { tgt: 'YOU', label: 'ประกาศยุติการกู้ชีพเพราะ shock แล้วไม่ขึ้น', ok: false, why: 'ห้ามยุติในคนตัวเย็นจนกว่าจะอุ่นแล้วยังไม่ตอบสนอง — hypothermia ปกป้องสมองไว้', worsen: true },
          { tgt: 'DRUG', label: 'เร่ง Epi เป็น 3 mg เพื่อกระตุ้นหัวใจ', ok: false, why: 'ขนาดผิดและไม่แก้ต้นเหตุ — หัวใจจะตอบยาได้ต่อเมื่ออุ่นขึ้น' },
        ],
      },
    },
    {
      choice: {
        q: 'core ขึ้นถึง 32°C แล้ว ยัง VF — ตอนนี้ทำอะไร',
        options: [
          {
            tgt: 'DEFIB', label: 'ตัวอุ่นพอแล้ว — เดินหน้าตาม ACLS ปกติ: Shock + Epi + Amiodarone', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg + Amio 300 in!"</span> คราวนี้ตัวอุ่นพอ ยาน่าจะออกฤทธิ์แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… จอเปลี่ยนแล้ว… <span class="cbs-em">คลื่นเรียบ มีชีพจรค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'ยังรอให้อุ่นกว่านี้ก่อนค่อยทำอะไร', ok: false, why: 'core > 30°C แล้ว — หัวใจตอบไฟ/ยาได้ ควรเดินหน้า ACLS เต็มรูปแบบ ไม่รอเฉยๆ', worsen: true },
          { tgt: 'DEFIB', label: 'ยิง shock รัวหลายครั้งชดเชยที่ผ่านมา', ok: false, why: 'กลับเข้าจังหวะปกติ 1 shock ต่อรอบ CPR — การยิงรัวไม่ใช่ ACLS' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + อุ่นตัวต่อจนปกติ + ICU', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! <span class="cbs-em">คุณอดทนพอ ไม่ยุติก่อนตัวอุ่น</span> — เคสตัวเย็นจัดที่หลายคนยอมแพ้ กลับรอดเพราะกดต่อและอุ่นตัวจนหัวใจพร้อมตอบ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'YOU', label: 'หยุดอุ่นตัวได้แล้วเพราะ ROSC', ok: false, why: 'ยังต้องอุ่นตัวต่อจนถึงอุณหภูมิเป้าหมาย — ตัวยังเย็นเสี่ยง VF ซ้ำ' },
        ],
      },
    },
    { end: true },
  ],
};
