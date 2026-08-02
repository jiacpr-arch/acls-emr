// เคส: PEA arrest จาก Hyperkalemia (megacode) — non-shockable + ต้องสืบสาเหตุ
// จุดสอน: PEA ห้าม shock · ต้องหา H's & T's · CKD ขาด HD → นึกถึง hyperK →
//         Calcium gluconate เป็น first-line ไม่งั้นไม่มีทาง ROSC
export const peaHyperK = {
  id: 'pea-hyperk-01',
  title: 'PEA — ป้าที่ขาดล้างไต',
  subtitle: 'หญิงอายุ 70 ปี CKD ระยะสุดท้าย ญาติพามาด้วยอ่อนเพลีย ซึมลง แล้วหมดสติใน ER',
  level: 'megacode',
  track: 'causes',
  hiddenCause: 'hyperkalemia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ป้าเตียง 5 เรียกไม่รู้สึกตัวแล้วค่ะ! เมื่อกี้ยังบ่นเหนื่อยอยู่เลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เคสนี้ไม่ธรรมดา… <span class="cbs-em">ป้าเป็น CKD</span> คุณคือ Team Leader — เริ่มได้' }, t: 5 },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">มี QRS กว้าง เป็นจังหวะ แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'pea' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'YOU', label: 'รอผล lab ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำไว้ — <span class="cbs-em">PEA คือจังหวะที่มีไฟฟ้าแต่หัวใจไม่บีบ</span> มันมี "สาเหตุ" เสมอ H\'s &amp; T\'s' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'สองนาทีแล้วครับ! <span class="cbs-em">สลับคนกดเดี๋ยวนี้</span> — มือใหม่วางปุ๊บกดปั๊บ ช่องว่างต้องสั้นที่สุด!' }, t: 4 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง PEA เหมือนเดิมค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… <span class="cbs-em">ทำไมป้าถึง arrest?</span> ถ้าไม่แก้สาเหตุ กดทั้งวันก็ไม่กลับมา' }, t: 4 },
    {
      choice: {
        q: 'หาสาเหตุ (H\'s &amp; T\'s) — คุณจะทำอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ถามญาติ + ส่ง POCT: โพแทสเซียม/gas ด่วน', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ญาติบอกว่า… <span class="cbs-em">"ป้าไม่ได้ไปฟอกไตมาอาทิตย์นึงแล้วค่ะ"</span>' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'POCT ออกแล้ว! <span class="cbs-em">K = 7.8 mEq/L</span> — และ ECG เก่ามี peaked T, QRS กว้าง!' }, t: 6 },
              { inter: 'HYPERKALEMIA!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'PEA ยัง non-shockable — และยังไม่ได้หาสาเหตุ', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi 5 mg เพิ่มขนาดให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่แก้ต้นเหตุ' },
        ],
      },
    },
    {
      choice: {
        q: 'K 7.8 + CKD ขาดฟอกไต — ยาตัวไหนช่วยชีวิตตอนนี้',
        options: [
          {
            tgt: 'DRUG', label: 'Calcium gluconate IV (stabilize หัวใจ) — ตามด้วย insulin+glucose, NaHCO₃', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Calcium in!"</span> ตามด้วย insulin + glucose แล้วค่ะ', fx: { cpr: true } }, t: 8 },
              { say: { who: 'boy_compressor', pose: 'stern', text: 'จังหวะแบบนี้ไฟฟ้าช่วยไม่ได้ครับ — <span class="cbs-em">non-shockable ทั้งชีวิตป้าอยู่บนมือเรา</span> กดลึก 5-6 ซม. ปล่อยอกคืนสุดทุกครั้ง!' }, t: 4 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'QRS แคบลง… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'ไม่แก้ hyperK — Amio ไม่มีที่ในเคสนี้' },
          { tgt: 'DEFIB', label: 'Shock 200 J เดี๋ยวนี้', ok: false, why: 'ยัง non-shockable และไม่แก้ hyperK', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ปรึกษาไตด่วนเพื่อ HD ฉุกเฉิน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! คุณ<span class="cbs-em">หาต้นเหตุเจอและแก้ถูก</span> — hyperK ที่ไม่แก้ shock กี่ทีก็ไม่รอด ป้าได้ไปฟอกไตต่อแล้ว' }, t: 5 },
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
