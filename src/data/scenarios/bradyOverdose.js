// เคส: Overdose → unstable bradycardia → asystole → VF → ROSC (megacode)
// จุดสอน: bradycardia จาก toxin → Atropine ไม่ได้ผล → transcutaneous pacing + คิดถึง antidote
//         (glucagon สำหรับ BB, calcium/high-dose insulin สำหรับ CCB) ·
//         asystole เป็น non-shockable (Epi + CPR ห้าม shock) · พอเปลี่ยนเป็น VF จึง shock
export const bradyOverdose = {
  id: 'brady-od-01',
  title: 'Bradycardia — กินยาเกินขนาด',
  subtitle: 'หญิงอายุ 45 ปี กินยาลดความดันเกินขนาด (สงสัย beta-blocker/CCB) ซึมลง ชีพจรช้ามาก',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'overdose',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้เตียง 3 ซึมลงมากค่ะ ญาติบอกว่า<span class="cbs-em">กินยาความดันไปเยอะมาก</span> ชีพจรช้าจนน่ากลัว!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เคสนี้มี "ต้นเหตุ" ชัด… <span class="cbs-em">ยาเกินขนาด</span> คุณคือ Team Leader — ค่อยๆ คิดให้ทัน' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'MONITOR', label: 'ติด monitor + วัดสัญญาณชีพ + คลำชีพจร ประเมินว่ายังมีชีพจรไหม', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">Sinus bradycardia rate 24/min</span> แต่ยัง<span class="cbs-em">คลำชีพจรได้</span> BP 70/40 ซึมมาก' }, t: 8, fx: { rhythm: 'nsr' } },
              { inter: 'UNSTABLE BRADYCARDIA!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ยังมีชีพจรอยู่ — การกดหน้าอกบนหัวใจที่ยังเต้นอาจเหนี่ยวนำให้ arrest ได้', worsen: true },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่รู้ rhythm และผู้ป่วยยังมีชีพจร — shock ไม่มีที่ตรงนี้', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ช้า 24 ครั้ง ความดันตก ซึม — <span class="cbs-em">unstable bradycardia ที่ยังมีชีพจร</span> คิดตาม algorithm เลย' }, t: 4 },
    {
      choice: {
        q: 'Unstable bradycardia — ยาตัวแรก',
        options: [
          {
            tgt: 'DRUG', label: 'Atropine 1 mg IV (ให้ซ้ำได้ทุก 3-5 นาที สูงสุด 3 mg)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Atropine 1 mg in!"</span> IV เปิดได้แล้วค่ะ' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'ยังไม่ขึ้นเลยค่ะ… rate ยัง 26 <span class="cbs-em">Atropine ไม่ได้ผล</span> — ยาพิษกดหัวใจไว้แน่น' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion 50 J', ok: false, why: 'Cardioversion ใช้กับ tachyarrhythmia ที่ unstable — ไม่ใช่ bradycardia' },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push เร็ว', ok: false, why: 'Adenosine ใช้ชะลอ SVT — ให้ในคนหัวใจช้าอยู่แล้วยิ่งอันตราย', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Atropine ไม่ขึ้น — ขั้นต่อไป',
        options: [
          {
            tgt: 'DEFIB', label: 'Transcutaneous pacing ทันที + ให้ยาระงับความเจ็บ/sedation', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'แปะ pacing pads… <span class="cbs-em">capture ได้ที่ 70/min</span> ชีพจรเริ่มดีขึ้น ให้ sedation คุมความเจ็บแล้วค่ะ' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'pacing แค่ประคอง… <span class="cbs-em">อย่าลืมว่าต้นเหตุคือยาพิษ</span> ต้องแก้ที่ตัวยา' }, t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่ม CPR เพราะ pacing กับ atropine ไม่ได้ผล', ok: false, why: 'ยังมีชีพจร — pacing คือขั้นถัดไป ไม่ใช่ CPR', worsen: true },
          { tgt: 'DRUG', label: 'Epinephrine 1 mg IV push', ok: false, why: 'ใน bradycardia ที่มีชีพจร Epi ใช้แบบ infusion 2-10 mcg/min ไม่ใช่ push 1 mg (นั่นคือขนาดสำหรับ arrest)' },
        ],
      },
    },
    {
      choice: {
        q: 'สงสัยยา BB/CCB overdose — ให้ antidote อะไร',
        options: [
          {
            tgt: 'DRUG', label: 'Glucagon (ถ้า beta-blocker) / Calcium + high-dose insulin (ถ้า CCB) — ปรึกษาพิษวิทยา', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ญาติยืนยันว่า<span class="cbs-em">กินทั้ง beta-blocker และยา CCB</span>ค่ะ! กำลังให้ glucagon กับ calcium + insulin แล้ว' }, t: 8 },
              { inter: 'TOXIN — OVERDOSE!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg IV', ok: false, why: 'Amiodarone ยิ่งกดการนำไฟฟ้าและความดัน — อันตรายมากใน BB/CCB overdose', worsen: true },
          { tgt: 'DRUG', label: 'Naloxone 0.4 mg', ok: false, why: 'Naloxone แก้ opioid — ไม่ช่วยใน BB/CCB overdose' },
        ],
      },
    },
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้ทรุดลงอีก… <span class="cbs-em">pacing ไม่ capture แล้ว คลำชีพจรไม่ได้!</span>' }, t: 5 },
    { inter: 'ASYSTOLE!', drama: 'red', t: 4, fx: { rhythm: 'flat', alarm: true } },
    {
      choice: {
        q: 'จอเป็นเส้นเรียบ ไม่มีชีพจร — ทำอะไร',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">หนึ่ง-สอง-สาม…</span>', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เดินหน้าให้ antidote ต่อค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock asystole', ok: false, why: 'Asystole เป็น non-shockable! เส้นเรียบ shock ไม่ได้ผลและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Atropine 1 mg อีกรอบ', ok: false, why: 'Atropine ไม่ใช้ใน asystole arrest แล้ว — ให้ CPR + Epi', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'อย่าหยุดคิดต้นเหตุ — <span class="cbs-em">Toxins ใน H\'s &amp; T\'s</span> antidote ต้องไหลต่อระหว่างกู้ชีพ' }, t: 4 },
    {
      choice: {
        q: 'Rhythm check หลัง CPR 2 นาที — จอเปลี่ยนเป็นคลื่นสั่นพลิ้ว',
        options: [
          {
            tgt: 'MONITOR', label: 'อ่าน rhythm — หยุดกดให้สั้นที่สุด', ok: true,
            then: [
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 6, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation!</span> จังหวะนี้ shock ได้แล้วค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epi ต่อโดยไม่ดูจอ', ok: false, why: 'ต้องอ่าน rhythm ก่อน — จังหวะเปลี่ยนเป็น shockable แล้ว แผนเปลี่ยนทั้งหมด' },
          { tgt: 'YOU', label: 'หยุดกดนานๆ เพื่อดูจอให้ชัด', ok: false, why: 'หยุดกดให้สั้นที่สุด — hands-off time คือศัตรู', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF — ตอนนี้ทำอะไร',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!!" — Shock 200 J แล้วกดต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อทันทีครับ! <span class="cbs-em">ไม่หยุดเช็คชีพจร</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… คลื่นเป็นระเบียบ <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'CPR', label: 'กด CPR ต่อโดยไม่ shock', ok: false, why: 'VF เป็น shockable — ไฟฟ้าคือการรักษาหลัก ต้อง shock ทันที', worsen: true },
          { tgt: 'DRUG', label: 'Atropine 1 mg ก่อน shock', ok: false, why: 'Atropine ไม่มีที่ใน VF — ไฟฟ้ามาก่อนเสมอในจังหวะ shockable' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'AIRWAY', label: 'ROSC! ดูแล airway + post-arrest care + antidote/พิษวิทยาต่อเนื่อง', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'สัญญาณชีพกลับมา… <span class="cbs-em">T 36.5°C, P 60, BP 120/70</span> ECG เป็น sinus rhythm มี PVCs เล็กน้อยค่ะ' }, t: 6 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณเห็นว่า<span class="cbs-em">ต้นเหตุคือยาพิษ</span> — bradycardia ให้ atropine→pacing แล้วคิดถึง antidote, asystole ห้าม shock ให้ Epi+CPR, พอเป็น VF จึง shock ครบทุกจังหวะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — shock จะทำให้ arrest ซ้ำ' },
          { tgt: 'DRUG', label: 'Epi 1 mg push อีก 1 dose', ok: false, why: 'ROSC แล้ว — ไม่ push Epi ต่อ ถ้าความดันตกใช้ infusion titrate' },
        ],
      },
    },
    { end: true },
  ],
};
