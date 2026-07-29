// เคส: VF → PEA → VF → ROSC → ACS (megacode) — rhythm สลับไปมา ต้องปรับ algorithm ตาม rhythm ปัจจุบัน
// จุดสอน: VF → shock + Amiodarone · PEA ห้าม shock/amio ให้ Epi + หา H's & T's ·
//         กลับเป็น VF → shock อีก · post-ROSC มัก hypotension ต้อง fluid/inotrope ·
//         หา 12-lead เจอ ACS → aspirin + ส่ง cath lab
export const vfPeaVfAcs = {
  id: 'vf-pea-vf-acs-01',
  title: 'Megacode — เจ็บหน้าอกแล้ว arrest',
  subtitle: 'ชายอายุ 45 ปี เจ็บหน้าอกร้าวลงแขนซ้าย แล้วหมดสติล้มลงหน้าห้องฉุกเฉิน',
  level: 'megacode',
  track: 'arrest',
  course: 'acls',
  hiddenCause: 'acs',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้เจ็บหน้าอกเตียง 3 <span class="cbs-em">ล้มลงแล้วค่ะ!</span> เมื่อกี้ยังกุมอกอยู่เลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ชายหนุ่ม 45 เจ็บหน้าอกนำมาก่อน… เคสนี้ rhythm จะเล่นตุกติกกับคุณ <span class="cbs-em">คุณคือ Team Leader</span> เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม/crash cart', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ หายใจเฮือก! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock ทันที', ok: false, why: 'ยังไม่ยืนยัน arrest และยังไม่รู้ rhythm — ต้องประเมินก่อน' },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ทันที', ok: false, why: 'ต้องยืนยัน arrest และเริ่ม CPR ก่อนเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ยืนยัน arrest — ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูงทันที + แปะ pads ดู rhythm', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">หนึ่ง-สอง-สาม…</span> ลึก 5-6 ซม.', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 6, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้ว ไม่บีบเลือดเลยค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก', worsen: true },
          { tgt: 'YOU', label: 'รอ 12-lead ECG ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — ไม่มีชีพจรต้องเริ่ม CPR ทันที', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF รอบแรก — เครื่อง defib พร้อม',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!" — Shock 200 J แล้วกดต่อทันที 2 นาที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'IV เปิดได้แล้วค่ะ — กดต่อเลย! <span class="cbs-em">ไม่เช็คชีพจร</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… <span class="cbs-em">ยัง VF ค่ะ!</span> ดื้อไฟ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epinephrine ก่อนค่อย shock', ok: false, why: 'ใน shockable rhythm ไฟฟ้ามาก่อนยาเสมอ' },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อน', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
        ],
      },
    },
    {
      choice: {
        q: 'VF ดื้อไฟ — รอบนี้ครบชุด',
        options: [
          {
            tgt: 'DEFIB', label: 'Shock 200 J + Amiodarone 300 mg IV + Epi 1 mg', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amio 300 in! Epi 1 mg in!"</span> เข็มเข้าเส้นแล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… เดี๋ยวนะ จอเปลี่ยนแล้ว! <span class="cbs-em">เป็นจังหวะ sinus rate 80… แต่คลำชีพจรไม่ได้ค่ะ!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg แต่งดไม่ต้อง shock', ok: false, why: 'VF ต้อง shock ก่อนเสมอ — ยาเสริมไฟ ไม่ใช่แทนไฟ', worsen: true },
        ],
      },
    },
    { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'pea' } },
    { say: { who: 'att_dech', pose: 'stern', text: 'ระวัง! <span class="cbs-em">มีไฟฟ้าแต่คลำชีพจรไม่ได้ = PEA</span> — เปลี่ยนเป็น non-shockable แล้ว อย่าเผลอ shock' }, t: 5 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV + เริ่มหา H\'s &amp; T\'s', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> กดต่อเนื่องอยู่ค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ชายหนุ่มเจ็บหน้าอกนำมาก่อน arrest… <span class="cbs-em">สาเหตุน่าจะอยู่ที่หลอดเลือดหัวใจ</span> Thrombosis-coronary' }, t: 5 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock จังหวะนี้', ok: false, why: 'PEA เป็น non-shockable! shock ไม่ช่วยและทำให้หยุดกดเสียเวลา', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg ซ้ำอีก', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่มีที่ใน PEA' },
        ],
      },
    },
    { inter: 'VF อีกแล้ว!', drama: 'red', t: 4, fx: { rhythm: 'vf' } },
    { say: { who: 'fon_defib', pose: 'panic', text: 'จอเปลี่ยนอีกค่ะ! <span class="cbs-em">กลับเป็น VF!</span> หัวใจสั่นพลิ้วอีกครั้ง!' }, t: 4 },
    {
      choice: {
        q: 'กลับมาเป็น VF — ทำอะไร',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!" — Shock 200 J แล้วกดต่อทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อครับ! <span class="cbs-em">คุณภาพการกดต้องไม่ตก!</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">คลื่นเป็นจังหวะสม่ำเสมอ — organized rhythm… คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epi ก่อนแล้วค่อย shock', ok: false, why: 'จังหวะกลับเป็น shockable แล้ว — ไฟฟ้ามาก่อนยา' },
          { tgt: 'YOU', label: 'ยังเป็น PEA อยู่ ให้ CPR อย่างเดียว ห้าม shock', ok: false, why: 'rhythm เปลี่ยนเป็น VF แล้ว ต้องปรับตามจังหวะปัจจุบัน — คราวนี้ shock ได้', worsen: true },
        ],
      },
    },
    { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
    { say: { who: 'fon_defib', pose: 'stern', text: 'สัญญาณชีพกลับมาแล้ว แต่… <span class="cbs-em">BP 80/50 ค่อนข้างต่ำ</span> P 70, T 37°C, R หายใจเองแค่ 6/นาที' }, t: 6 },
    {
      choice: {
        q: 'Post-ROSC — BP 80/50 หายใจเอง 6/นาที จัดการอย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'ช่วยหายใจ + IV fluid bolus + inotrope/vasopressor แก้ hypotension', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ NSS bolus แล้วเริ่ม <span class="cbs-em">Norepinephrine drip</span> ช่วยหายใจด้วยค่ะ' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'BP ขยับขึ้น 100/65 แล้วค่ะ — ดีขึ้น!' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำอีกทีให้ชัวร์', ok: false, why: 'ROSC มีชีพจรจังหวะปกติแล้ว — shock จะทำให้ arrest ซ้ำ', worsen: true },
          { tgt: 'YOU', label: 'BP 80/50 ปล่อยไว้ก่อน รอสังเกตอาการ', ok: false, why: 'post-arrest hypotension ต้องรีบแก้ด้วย fluid/inotrope ปล่อยไว้อวัยวะขาดเลือดต่อ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยเสถียรขึ้น — ขั้นต่อไปเพื่อหาต้นเหตุ',
        options: [
          {
            tgt: 'MONITOR', label: 'ทำ 12-lead ECG หาสาเหตุ arrest', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: '12-lead ออกแล้วค่ะ! <span class="cbs-em">ST elevation ผนัง anterior — STEMI!</span>' }, t: 6 },
              { inter: 'ACS — STEMI!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Epi 1 dose ต่ออีก', ok: false, why: 'ROSC แล้วไม่ต้อง bolus Epi — ถ้าจำเป็นให้เป็น drip ปรับความดัน ไม่ใช่ bolus' },
          { tgt: 'YOU', label: 'ยังไม่ต้องหาสาเหตุ ส่ง ICU เฉยๆ', ok: false, why: 'เจ็บหน้าอกนำมาก่อน arrest ต้องหา 12-lead หา ACS ทันที ไม่งั้นพลาด reperfusion' },
        ],
      },
    },
    {
      choice: {
        q: 'STEMI หลัง arrest — การรักษาต้นเหตุ',
        options: [
          {
            tgt: 'DRUG', label: 'Aspirin + activate cath lab ทำ PCI ด่วน', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! <span class="cbs-em">Aspirin เคี้ยว + ปรึกษา cardio ส่ง cath lab</span> เปิดเส้นเลือดที่อุดตันคือทางรอดจริงของเคสนี้' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock เผื่อ VF กลับมา', ok: false, why: 'ตอนนี้มีชีพจรจังหวะปกติ — ไม่มีข้อบ่งชี้ shock' },
          { tgt: 'YOU', label: 'รอผล troponin ค่อยตัดสินใจส่ง cath', ok: false, why: 'STEMI ที่ ECG ชัดเจน + cardiac arrest ไม่ต้องรอ troponin — เวลาคือกล้ามเนื้อหัวใจ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'happy', text: 'จำไว้ — <span class="cbs-em">rhythm สลับ VF↔PEA ต้องปรับ algorithm ตามจังหวะปัจจุบันเสมอ</span> VF ให้ shock+amio · PEA ให้ Epi + หา cause ห้าม shock · หลัง ROSC มัก hypotension ต้อง fluid/inotrope · แล้วอย่าลืม 12-lead หา ACS ส่ง cath lab เคสนี้เป็นของคุณ' }, t: 6 },
    { end: true },
  ],
};
