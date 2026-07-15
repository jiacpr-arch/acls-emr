// เคส: PEA arrest จาก Hypoglycemia (megacode) — non-shockable + ต้องสืบสาเหตุ
// จุดสอน: PEA ห้าม shock · ต้องหา H's & T's · DM + ดื่มสุราหนัก → นึกถึง hypoglycemia →
//         เช็ค DTX ทันที · Dextrose (D50W) แก้ต้นเหตุ · thiamine ก่อน/พร้อม glucose ในผู้ติดสุรา
export const alcoholHypo = {
  id: 'alcohol-hypo-01',
  title: 'PEA — ลุงเบาหวานที่ดื่มหนัก',
  subtitle: 'ชายอายุ 50 ปี เบาหวาน ดื่มสุราหนักมาหลายวัน ญาติพามาด้วยซึมลง แล้วหมดสติใน ER',
  level: 'megacode',
  track: 'causes',
  course: 'acls',
  hiddenCause: 'hypoglycemia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ลุงเตียง 3 เรียกไม่รู้สึกตัวแล้วค่ะ! เมื่อกี้ยัง<span class="cbs-em">ซึมๆ พูดไม่รู้เรื่อง</span> กลิ่นเหล้าฉุนเลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เคสนี้มีเงื่อนงำ… <span class="cbs-em">ลุงเป็นเบาหวาน + ดื่มหนัก</span> คุณคือ Team Leader — เริ่มได้' }, t: 5 },
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
          { tgt: 'DRUG', label: 'ให้ Dextrose ทันทีเพราะน้ำตาลน่าจะต่ำ', ok: false, why: 'ต้องยืนยัน arrest + เริ่ม CPR ก่อน — เดายังไม่ได้' },
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
          { tgt: 'AIRWAY', label: 'รีบใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'YOU', label: 'รอผล DTX ก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำไว้ — <span class="cbs-em">PEA คือจังหวะที่มีไฟฟ้าแต่หัวใจไม่บีบ</span> มันมี "สาเหตุ" เสมอ H\'s &amp; T\'s' }, t: 4 },
    {
      choice: {
        q: 'PEA — ผู้ป่วยซึม/มีความเสี่ยงสำลัก จัดการอย่างไร',
        options: [
          {
            tgt: 'AIRWAY', label: 'Suction ล้างทางเดินหายใจ + bag-mask ออกซิเจน (พิจารณา ET tube เมื่อพร้อม)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Suction ออกมาเยอะเลยค่ะ… <span class="cbs-em">airway โล่งขึ้นแล้ว</span> bag ต่อเนื่องอยู่', fx: { cpr: true } }, t: 8 },
            ],
          },
          { tgt: 'YOU', label: 'ปล่อยทางเดินหายใจไว้ก่อน เดี๋ยวค่อยดู', ok: false, why: 'ผู้ป่วยซึม/สำลักได้ง่าย — ต้องเคลียร์ airway และให้ออกซิเจนควบคู่ CPR', worsen: true },
          { tgt: 'DEFIB', label: 'Shock เผื่อเป็น VF ซ่อนอยู่', ok: false, why: 'PEA เป็น non-shockable — การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'PEA — ยาตัวแรก (non-shockable)',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง PEA เหมือนเดิมค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ PEA' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… <span class="cbs-em">ทำไมลุงถึง arrest?</span> เบาหวาน + ดื่มหนัก — มีอะไรที่ตรวจง่ายมากที่ยังไม่ได้เช็ค?' }, t: 4 },
    {
      choice: {
        q: 'หาสาเหตุ (H\'s &amp; T\'s) — คุณจะทำอะไรก่อน',
        options: [
          {
            tgt: 'YOU', label: 'เจาะ DTX / น้ำตาลปลายนิ้วด่วน + ถามญาติ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ญาติบอกว่า… <span class="cbs-em">"ลุงดื่มหนักมาหลายวัน กินข้าวแทบไม่ได้เลยค่ะ"</span>' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'DTX ออกแล้ว! <span class="cbs-em">น้ำตาล = 22 mg/dL</span> — ต่ำมากค่ะ!' }, t: 6 },
              { inter: 'HYPOGLYCEMIA!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'PEA ยัง non-shockable — และยังไม่ได้หาสาเหตุ', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Epi 5 mg เพิ่มขนาดให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่แก้ต้นเหตุ' },
        ],
      },
    },
    {
      choice: {
        q: 'น้ำตาล 22 + DM ดื่มหนัก — จะแก้ต้นเหตุอย่างไร',
        options: [
          {
            tgt: 'DRUG', label: 'Thiamine ก่อน/พร้อมกัน แล้วให้ Dextrose (D50W) IV', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Thiamine + D50W in!"</span> ให้ตามลำดับแล้วค่ะ CPR ต่อเนื่อง', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอเปลี่ยนแล้ว… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Insulin เพราะเป็นเบาหวาน', ok: false, why: 'น้ำตาลกำลังต่ำมาก — Insulin จะยิ่งดิ่งลง อันตรายถึงชีวิต', worsen: true },
          { tgt: 'DEFIB', label: 'Shock 200 J เดี๋ยวนี้', ok: false, why: 'ยัง non-shockable และไม่แก้ hypoglycemia' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ติดตาม DTX ซ้ำ ป้องกันน้ำตาลตกซ้ำ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'สัญญาณชีพกลับมาแล้ว… <span class="cbs-em">T 37°C, P 120, BP 120/80, ECG sinus tachycardia</span> ค่ะ!' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! คุณ<span class="cbs-em">หาต้นเหตุเจอและแก้ถูก</span> — hypoglycemia เป็น reversible cause ที่ตรวจง่ายด้วย DTX และแก้ได้ด้วย glucose ในคน DM/ดื่มสุราต้องนึกถึงเสมอ และอย่าลืม thiamine' }, t: 6 },
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
