// Code Blue Simulator — โจทย์แบบ story-driven (Ace Attorney style)
//
// โครงนี้คือ "ข้อมูลโจทย์" ล้วนๆ — engine อยู่ที่ src/game/storyEngine.js
// ตัวละครอ้างด้วย charId จาก src/game/characters.js (who) + สีหน้า (pose)
// text อนุญาต HTML แค่ <span class="cbs-em"> สำหรับเน้นคำ
//
// อนาคต: ระบบเขียนโจทย์เอง (admin editor / AI generate) จะผลิต object
// หน้าตาแบบเดียวกันนี้ลง Supabase แล้วโหลดมาเล่นแทน built-in ได้เลย

export const scenario = {
  id: 'vf-arrest-01',
  title: 'CODE BLUE: ภารกิจกู้ชีพ',
  subtitle: 'ชายอายุ 58 ปี เจ็บหน้าอกร้าวลงแขนซ้าย 30 นาที ล้มลงหมดสติต่อหน้าคุณ',
  difficulty: 'basic',

  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์!! คนไข้เตียง 2 ล้มลงค่ะ!! เมื่อกี้ยังนั่งคุยอยู่เลย!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ทั้งห้องหันมาที่คุณ… <span class="cbs-em">คุณคือ Team Leader</span> — คำสั่งแรกของคุณจะกำหนดทุกอย่าง' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ตรวจการตอบสนอง + เรียกทีม ขอ crash cart', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'เขย่าเรียก… <span class="cbs-em">ไม่ตอบสนองค่ะ!</span> Crash cart กำลังมา!' }, t: 10 }],
          },
          { tgt: 'CPR', label: 'กดหน้าอกทันที ไม่ต้องประเมิน', ok: false, why: 'ยังไม่ยืนยันว่า arrest — ถ้าเป็นแค่เป็นลม การกดหน้าอกทำอันตรายได้' },
          { tgt: 'DRUG', label: 'ฉีด Epinephrine ทันที', ok: false, why: 'ยังไม่รู้ด้วยซ้ำว่าหัวใจหยุดเต้น — ประเมินก่อนเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่ตอบสนอง หายใจเฮือก — ต่อเลย',
        options: [
          {
            tgt: 'YOU', label: 'คลำ carotid pulse ไม่เกิน 10 วินาที', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'att_dech', pose: 'stern', text: 'Cardiac arrest ยืนยันแล้ว… นาฬิกาสมองของผู้ป่วยเริ่มนับถอยหลัง <span class="cbs-em">ทุกวินาทีที่ไม่กด สมองตายเพิ่ม</span>' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ฟังเสียงปอดละเอียดๆ สัก 1 นาที', ok: false, why: 'นานเกินไป — ทุกนาทีที่ช้า โอกาสรอดหายไป ~10%' },
          { tgt: 'MONITOR', label: 'ติด 12-lead ECG ก่อน', ok: false, why: '12-lead รอได้ ชีพจรรอไม่ได้' },
        ],
      },
    },
    {
      choice: {
        q: 'ทีม 4 คนพร้อม — สั่งใครทำอะไร',
        options: [
          {
            tgt: 'CPR', label: 'พี่บอย! กดหน้าอกเลย ลึก 5-6 ซม. 100-120/นาที', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'รับทราบครับ! <span class="cbs-em">เริ่มกด!</span> หนึ่ง-สอง-สาม-สี่…', fx: { cpr: true, firstCPR: true } }, t: 10 }],
          },
          { tgt: 'DEFIB', label: 'รอเครื่อง defib มาก่อนค่อยเริ่ม', ok: false, why: 'ห้ามรอเด็ดขาด — สมองขาดออกซิเจนทุกวินาที', worsen: true },
          { tgt: 'AIRWAY', label: 'หยุดทุกอย่างเพื่อใส่ท่อช่วยหายใจ', ok: false, why: 'CPR มาก่อน advanced airway เสมอในนาทีแรก' },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'talk', text: 'Crash cart มาแล้วค่ะ! เครื่อง defib พร้อม!' }, t: 15 },
    {
      choice: {
        q: 'ใช้ crash cart ยังไง',
        options: [
          {
            tgt: 'MONITOR', label: 'แปะ pads ดู rhythm — หยุดกดให้สั้นที่สุด', ok: true,
            then: [
              { inter: 'VF — SHOCKABLE!!', drama: 'red', t: 8, fx: { rhythm: 'vf' } },
              { say: { who: 'fon_defib', pose: 'panic', text: 'จอขึ้น <span class="cbs-em">Ventricular Fibrillation!</span> หัวใจสั่นพลิ้ว ไม่บีบเลือดเลยค่ะ!' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'เปิด IV ฉีด Epi ก่อนดูจอ', ok: false, why: 'ต้องรู้ rhythm ก่อน — shockable หรือไม่ เปลี่ยนแผนทั้งหมด' },
          { tgt: 'YOU', label: 'สั่งหยุดกดนานๆ เพื่อดูจอชัดๆ', ok: false, why: 'หยุดกดให้สั้นที่สุด — hands-off time คือศัตรูตัวจริง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF — เครื่อง defib อยู่ในมือ',
        options: [
          {
            tgt: 'DEFIB', label: 'Charge 200 J — กดหน้าอกต่อระหว่างรอไฟ', ok: true,
            then: [{ say: { who: 'fon_defib', pose: 'talk', text: 'Charging… <span class="cbs-em">200 จูล พร้อมค่ะ!</span> เสียงหวีดของเครื่องดังขึ้นเรื่อยๆ' }, t: 8 }],
          },
          { tgt: 'DEFIB', label: 'ลองพลังงานต่ำ 50 J ก่อน', ok: false, why: 'ต่ำเกินไป — VF ผู้ใหญ่ใช้ 120-200 J (biphasic)' },
          { tgt: 'DRUG', label: 'ให้ Amiodarone ก่อนค่อย shock', ok: false, why: 'ไฟฟ้ามาก่อนยาเสมอใน shockable rhythm' },
        ],
      },
    },
    {
      choice: {
        q: 'CHARGED — วินาทีชี้ชะตา',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!!" กวาดตารอบเตียง — SHOCK!', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'ตัวผู้ป่วยกระตุกขึ้นจากเตียง… <span class="cbs-em">กดต่อเลยไหมครับ?!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock เลย ไม่เสียเวลา clear', ok: false, why: 'ไฟ 200 J ลงคนที่ยังแตะเตียง = ทีมของคุณ arrest แทน', worsen: true },
          { tgt: 'YOU', label: 'ถือไฟค้างไว้ รอดูจออีก 30 วิ', ok: false, why: 'ไฟพร้อมต้องปล่อยทันที — VF ยิ่งค้างนานยิ่งดื้อไฟ' },
        ],
      },
    },
    {
      choice: {
        q: 'ทันทีหลัง shock',
        options: [
          {
            tgt: 'CPR', label: 'กดต่อทันที 2 นาที — ไม่เช็คชีพจร', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'IV ได้แล้วค่ะ! <span class="cbs-em">เส้นพร้อมให้ยา!</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… <span class="cbs-em">ยัง VF ค่ะ!</span> ดื้อไฟ!' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดคลำชีพจรเดี๋ยวนี้', ok: false, why: 'หัวใจหลัง shock ยังอ่อนแรง — CPR ต่อทันที 2 นาทีก่อนเช็ค' },
          { tgt: 'DRUG', label: 'หยุดรอดูผลของไฟก่อน', ok: false, why: 'ไม่มีจังหวะไหนที่ "หยุดรอ" ใน cardiac arrest', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'VF ดื้อไฟ — รอบนี้ต้องครบชุด',
        options: [
          {
            tgt: 'DEFIB', label: 'Shock 200 J + Epinephrine 1 mg IV ตามทันที', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> เสียงขานยาดังทั่วห้อง — เข็มที่สองพร้อม', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… ยัง VF! พี่บอยเหงื่อหยดลงพื้นแล้วค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Atropine 1 mg', ok: false, why: 'Atropine ไม่มีที่ใน VF — ใช้ใน bradycardia' },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push เร็วๆ', ok: false, why: 'Adenosine ใช้ใน SVT ที่มีชีพจร — ไม่ใช่ที่นี่' },
        ],
      },
    },
    {
      choice: {
        q: 'ยาตัวถัดไปของคุณ',
        options: [
          {
            tgt: 'DRUG', label: 'Shock ครั้งที่ 3 + Amiodarone 300 mg IV bolus', ok: true,
            then: [
              { inter: 'SHOCK!!', t: 5, fx: { shock: true } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '"Amio 300 in!" — สลับคนกด <span class="cbs-em">คุณภาพการกดต้องไม่ตก</span>', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาทีผ่านไป', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'Rhythm check… เดี๋ยวนะ… จอเปลี่ยน… <span class="cbs-em">คลื่นเรียบสม่ำเสมอ… มีชีพจรค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Epinephrine 5 mg ให้แรงขึ้นไปเลย', ok: false, why: 'ขนาดผิด — Epi ใน arrest คือ 1 mg เสมอ ทุก 3-5 นาที' },
          { tgt: 'YOU', label: 'ประกาศยุติการกู้ชีพ', ok: false, why: 'เร็วเกินไปมาก — VF ที่ยังสั่นคือหัวใจที่ยังสู้อยู่', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'วินาทีสุดท้าย — คุณจะทำอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! หยุด CPR — post-arrest care + 12-lead ด่วน', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'BP 110/70 กลับมาแล้ว… ทั้งห้องถอนหายใจพร้อมกัน <span class="cbs-em">ส่งต่อ Cath lab — เคสนี้เป็นของคุณ</span>' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'กดต่ออีก 2 นาทีเผื่อไว้', ok: false, why: 'มีชีพจรแล้ว — การกดต่อทำร้ายหัวใจที่เพิ่งกลับมา' },
          { tgt: 'DEFIB', label: 'Shock ซ้ำอีกทีให้ชัวร์', ok: false, why: 'Shock จังหวะปกติ = ทำให้ arrest ซ้ำ อันตรายที่สุด', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};

export const scenarios = [scenario];
