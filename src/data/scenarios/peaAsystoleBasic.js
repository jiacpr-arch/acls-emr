// เคส: PEA/Asystole Arrest (พื้นฐาน) — non-shockable arm ของ Adult Cardiac Arrest Algorithm
// จุดสอน: PEA/Asystole ห้าม shock เด็ดขาด · CPR คุณภาพสูงต่อเนื่อง · Epinephrine 1 mg ทุก 3-5 นาที ·
//         สำรวจ H's & T's คร่าวๆ ระหว่างกด (ไม่ต้องเจาะจงสาเหตุเดียว — คู่หูฝั่ง shockable ของ vfArrest.js)
export const peaAsystoleBasic = {
  id: 'pea-asystole-basic-01',
  title: 'PEA/Asystole — หมดสติในหอผู้ป่วย',
  subtitle: 'ชายอายุ 54 ปี หมดสติกะทันหันในหอผู้ป่วย ไม่ทราบสาเหตุชัดเจน',
  level: 'basic',
  track: 'arrest',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์!! คนไข้เตียง 8 หมดสติค่ะ! เมื่อกี้ยังนอนดูทีวีอยู่เลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทั้งห้องหันมาที่คุณ… <span class="cbs-em">คุณคือ Team Leader</span> — เริ่มได้เลย' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำชีพจรไม่ได้เลยค่ะ! <span class="cbs-em">Cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'กดหน้าอกทันที ไม่ต้องประเมิน', ok: false, why: 'ยังไม่ยืนยันว่า arrest — ต้องประเมินก่อนเสมอ' },
          { tgt: 'DRUG', label: 'ฉีด Epinephrine ทันที', ok: false, why: 'ยังไม่รู้ด้วยซ้ำว่าหัวใจหยุดเต้น — ประเมินก่อนเสมอ' },
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
              { inter: 'PEA — NON-SHOCKABLE!!', drama: 'red', t: 4, fx: { rhythm: 'pea' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก', worsen: true },
          { tgt: 'YOU', label: 'รอผล lab ก่อนค่อยเริ่ม CPR', ok: false, why: 'ห้ามรอ — เริ่ม CPR ทันทีที่ไม่มีชีพจร', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'จำไว้ — <span class="cbs-em">PEA และ Asystole เป็น non-shockable ทั้งคู่</span> ห้าม shock เด็ดขาด กด CPR ต่อ ให้ Epinephrine และตามหาสาเหตุด้วย H\'s &amp; T\'s ไปด้วย' }, t: 5 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ทันที (ให้ซ้ำได้ทุก 3-5 นาที)', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 }],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg IV', ok: false, why: 'Amiodarone ใช้ใน VF/pulseless VT เท่านั้น — ไม่ใช่ PEA' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Epi อย่างเดียวไม่พอ… ระหว่างกดต่อ ให้ลองสำรวจสาเหตุที่แก้ไขได้คร่าวๆ ไปด้วย' }, t: 4 },
    {
      choice: {
        q: 'สำรวจ H\'s &amp; T\'s — คุณจะเช็คอะไรระหว่างกดต่อ',
        options: [
          {
            tgt: 'YOU', label: 'เช็คทางเดินหายใจ/ออกซิเจน + ถามประวัติเสียเลือด-ขาดน้ำ + วัดอุณหภูมิ + ดูยาที่ใช้', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ทางเดินหายใจโล่งดีครับ ให้ออกซิเจนเต็มที่แล้ว ไม่มีประวัติเสียเลือดหรือขาดน้ำ อุณหภูมิตัวปกติ ไม่มียาที่น่าสงสัยครับ' }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ครบ 2 นาที! <span class="cbs-em">ขอสลับคนกด</span> — เปลี่ยนไวๆ หยุดกดไม่เกิน 10 วิครับ!' }, t: 4 },
              { inter: 'ASYSTOLE — เส้นเรียบ!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… เส้นเรียบสนิทเลยค่ะ ยัง non-shockable' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg IV', ok: false, why: 'Atropine ไม่แนะนำให้ใช้ใน PEA/asystole arrest แล้วตาม guideline ปัจจุบัน' },
          { tgt: 'DEFIB', label: 'ลอง shock ดูสักครั้งเผื่อได้ผล', ok: false, why: 'ยัง non-shockable อยู่ — การ shock ไม่ช่วยจังหวะนี้', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ยัง non-shockable (asystole) — ทำอะไรต่อ',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV ซ้ำ (ครบ 3-5 นาทีจากโดสแรก) — ยังห้าม shock', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi โดสสองให้แล้วค่ะ!"</span>', fx: { epi: true, cpr: true } }, t: 6 },
              { say: { who: 'boy_compressor', pose: 'stern', text: 'Non-shockable ยิ่งต้องพึ่งมือเรา — <span class="cbs-em">ลึก 5-6 ซม. ปล่อยให้อก recoil สุดทุกครั้ง!</span> ห้ามตกครับ!' }, t: 4 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เดี๋ยวนะ… จอเริ่มมีคลื่นสม่ำเสมอ… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock เส้นเรียบนี้เลย', ok: false, why: 'Asystole ก็ non-shockable เหมือน PEA — ห้าม shock', worsen: true },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้นไปเลย', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! หยุด CPR — ประเมิน airway/vitals + 12-lead ด่วน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยม! <span class="cbs-em">PEA/Asystole ไม่มี shock ในสูตรเลย</span> — หัวใจของการรอดคือ CPR ไม่หยุด + Epi ตรงเวลา ส่ง post-arrest care ต่อได้เลย' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'กดต่ออีก 2 นาทีเผื่อไว้', ok: false, why: 'มีชีพจรแล้ว — การกดต่อทำร้ายหัวใจที่เพิ่งกลับมา' },
          { tgt: 'DEFIB', label: 'Shock ซ้ำให้ชัวร์', ok: false, why: 'จังหวะปกติมีชีพจรแล้ว ห้าม shock — จะทำให้ arrest ซ้ำ', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
