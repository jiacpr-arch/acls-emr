// เคส: PEA arrest จาก Cardiac tamponade (megacode) — non-shockable + ต้องสืบสาเหตุ
// จุดสอน: PEA ห้าม shock · ผู้ป่วยมะเร็ง/หลังทำหัตถการหัวใจ ที่ arrest แบบ PEA
//         + เส้นเลือดคอโป่ง + เสียงหัวใจเบา → tamponade → POCUS ยืนยัน →
//         pericardiocentesis ถึงจะ ROSC
export const tamponade = {
  id: 'tamponade-01',
  title: 'PEA — คนไข้มะเร็งที่ความดันดิ่ง',
  subtitle: 'หญิงอายุ 55 ปี มะเร็งปอดระยะลุกลาม เหนื่อยมากขึ้น 2 วัน ความดันค่อยๆ ตก แล้วหมดสติใน ER',
  level: 'megacode',
  track: 'causes',
  hiddenCause: 'tamponade',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! พี่เขาความดันวัดแทบไม่ได้แล้วค่ะ เมื่อกี้ยังพูดอยู่เลย ตอนนี้เรียกไม่รู้สึกตัว!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ความดันค่อยๆ ตกแบบนี้… ไม่ใช่เรื่องบังเอิญ <span class="cbs-em">คุณคือ Team Leader</span> เริ่มได้' }, t: 5 },
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
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น… <span class="cbs-em">QRS แคบ อัตราเร็ว เป็นจังหวะ แต่คลำชีพจรไม่ได้</span>' }, t: 6 },
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'pea' } },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR มาก่อน advanced airway เสมอ', worsen: true },
          { tgt: 'DEFIB', label: 'Shock ทันทีเพราะจังหวะเร็ว', ok: false, why: 'QRS แคบมีจังหวะแต่ไม่มีชีพจร = PEA — non-shockable', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: '<span class="cbs-em">PEA อัตราเร็ว + ความดันค่อยๆ ตกก่อน arrest</span> — คิดถึง H\'s &amp; T\'s ตัวไหนบ้าง?' }, t: 4 },
    {
      choice: {
        q: 'PEA — ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'PEA เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน arrest algorithm ปัจจุบัน' },
        ],
      },
    },
    {
      choice: {
        q: 'หาสาเหตุ — เครื่องมือที่ตอบเร็วสุดข้างเตียง',
        options: [
          {
            tgt: 'MONITOR', label: 'POCUS หัวใจ ช่วงพักคลำชีพจร (≤10 วิ) + ดูเส้นเลือดคอ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอ echo ขึ้น… <span class="cbs-em">มีน้ำล้อมรอบหัวใจเยอะมาก! ห้องขวายุบตอน diastole!</span>' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'เส้นเลือดคอโป่งมาก เสียงหัวใจเบาลงค่ะ — <span class="cbs-em">Beck\'s triad!</span>' }, t: 6 },
              { inter: 'CARDIAC TAMPONADE!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'MONITOR', label: 'ส่ง 12-lead ECG เต็มรูปแบบก่อน', ok: false, why: '12-lead ไม่บอก tamponade และไม่ทันการ — POCUS ตอบภายในวินาที', worsen: true },
          { tgt: 'DRUG', label: 'ให้ยาเพิ่มความดันแรงๆ ไปก่อน', ok: false, why: 'ยาไม่แก้แรงบีบจากน้ำในเยื่อหุ้มหัวใจ — ต้องระบายน้ำออก', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'น้ำในเยื่อหุ้มหัวใจบีบหัวใจอยู่ — สิ่งที่ช่วยชีวิตตอนนี้',
        options: [
          {
            tgt: 'AIRWAY', label: 'Pericardiocentesis ใต้ POCUS ระบายน้ำออกทันที', ok: true,
            then: [
              { inter: 'ระบายน้ำออก 60 มล.!', drama: 'red', t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ดูดออกมาเป็นเลือดเก่าค่ะ! <span class="cbs-em">ห้องหัวใจเริ่มขยายได้ปกติแล้ว</span>', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!!</span> ความดัน 95/60!' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 200 J', ok: false, why: 'ยัง PEA — non-shockable และไม่ปลดน้ำที่บีบหัวใจ', worsen: true },
          { tgt: 'DRUG', label: 'ให้ NaHCO₃ แก้เลือดเป็นกรด', ok: false, why: 'ไม่ตรงสาเหตุ — ต้นเหตุคือน้ำบีบหัวใจ ต้องระบายออกก่อน', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมาแล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + ใส่สายระบายค้าง + ปรึกษาศัลย์หัวใจ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'สุดยอด! <span class="cbs-em">POCUS ช่วยคุณเจอ tamponade</span> — เคสนี้ยาเพิ่มความดันเท่าไหร่ก็ไม่พอ ต้องระบายน้ำออกเท่านั้น' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'CPR', label: 'กดต่ออีก 2 นาทีเผื่อไว้', ok: false, why: 'มีชีพจรแล้ว — การกดต่อทำร้ายหัวใจที่เพิ่งกลับมา' },
        ],
      },
    },
    { end: true },
  ],
};
