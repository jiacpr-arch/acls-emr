// เคส: Unstable Tachycardia (พื้นฐาน) — tachycardia "มีชีพจร" ที่ไม่เสถียร
// จุดสอน: แยก stable vs unstable ให้ขาด · unstable tachycardia (hypotension/altered/ischemic chest pain/acute HF
//         ที่เกิดจากอัตราเร็ว) = synchronized cardioversion ทันที ทุก width · ให้ sedation ถ้ารู้ตัว+เวลาอำนวย ·
//         ผู้ป่วยมีชีพจรตลอด — ห้ามกดหน้าอก, ห้าม unsync defib (R-on-T เสี่ยง VF), ไม่เสียเวลาลองยา
export const tachyUnstableBasic = {
  id: 'tachy-unstable-basic-01',
  title: 'ใจสั่นจนความดันตก — Unstable Tachycardia',
  subtitle: 'หญิงอายุ 62 ปี ใจสั่นรุนแรง หน้ามืด เหงื่อแตก อัตราหัวใจเร็วมาก ยังพอมีสติ',
  level: 'basic',
  track: 'tachy',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้หญิงเตียง 4 ใจสั่นรุนแรง หน้ามืดจะเป็นลมค่ะ! <span class="cbs-em">ตัวเย็นเหงื่อแตก</span> ชีพจรเร็วจนจับแทบไม่ทัน!' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ผู้ป่วยยัง<span class="cbs-em">มีชีพจร</span>แต่กำลังจะไปแล้ว… คุณคือ Team Leader — จับให้ได้ว่านี่คือจังหวะแบบไหน แล้ว "เสถียรหรือไม่"' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด monitor + คลำชีพจร/วัด BP + เปิด IV', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">จังหวะเร็วสม่ำเสมอ ~190/นาที</span> — คลำชีพจรได้ค่ะ แต่เบาและเร็วมาก' }, t: 8, fx: { rhythm: 'tachy' } },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ผู้ป่วยยัง "มีชีพจร" — การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้ arrest จริง', worsen: true },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) 200 J ทันที', ok: false, why: 'ยังไม่ประเมินและผู้ป่วยมีชีพจร — ถ้าจะช็อกต้องเป็น synchronized เท่านั้น unsync เสี่ยง R-on-T กลายเป็น VF', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'เร็ว ~190 + มีชีพจร… คำถามชี้ชะตาคือ <span class="cbs-em">stable หรือ unstable</span> — ประเมินให้ขาด' }, t: 4 },
    {
      choice: {
        q: 'ประเมิน stable vs unstable',
        options: [
          {
            tgt: 'MONITOR', label: 'วัดสัญญาณชีพ + ประเมินอาการที่เกิดจากอัตราเร็ว (BP/สติ/เจ็บอก/หอบ)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: '<span class="cbs-em">BP 70/40</span> ค่ะ! ผู้ป่วยซึมลง เหงื่อแตก บ่นเจ็บหน้าอกแน่นๆ' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'hypotension + ซึมลง + เจ็บอก และอาการทั้งหมด<span class="cbs-em">เกิดจากอัตราเร็วโดยตรง</span> = <span class="cbs-em">UNSTABLE tachycardia</span> ชัดเจน' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ถือว่า stable ไว้ก่อน — เริ่ม vagal maneuver ช้าๆ', ok: false, why: 'อาการที่เห็น (หน้ามืด เหงื่อแตก เจ็บอก) บ่งชี้ unstable อยู่แล้ว — สมมติว่า stable ทำให้ประเมินช้าและรักษาผิดทาง' },
          { tgt: 'DEFIB', label: 'ยังไม่ต้องประเมิน รีบ cardiovert เลย', ok: false, why: 'ต้องยืนยันก่อนว่ามีชีพจรและ unstable จริง — ประเมินเร็วๆ ยังจำเป็น ไม่ใช่ข้ามไปเลย' },
        ],
      },
    },
    {
      choice: {
        q: 'Unstable tachycardia มีชีพจร — การรักษาหลัก',
        options: [
          {
            tgt: 'DEFIB', label: 'Synchronized cardioversion (กดโหมด SYNC!) เตรียมปล่อยไฟทันที', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'เปิดโหมด <span class="cbs-em">SYNC</span> ให้เครื่องจับ R wave แล้วค่ะ — เครื่องพร้อมปล่อยพลังงานตรงจังหวะ' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'ลอง Adenosine / ยาลดอัตราหัวใจก่อน', ok: false, why: 'unstable ไม่มีเวลาลองยา — ต้อง synchronized cardioversion ทันที ยาช้าเกินไปในภาวะนี้', worsen: true },
          { tgt: 'DEFIB', label: 'Unsynchronized defibrillation 200 J', ok: false, why: 'ยังมีชีพจร! unsync ที่ตกบน T wave (R-on-T) เปลี่ยนจังหวะที่มีชีพจรให้กลายเป็น VF ได้จริง — ต้อง SYNC', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ก่อนปล่อยไฟ — ผู้ป่วยยังรู้ตัวและยังพอมีวินาที <span class="cbs-em">อย่าลืมความรู้สึกของผู้ป่วย</span>' }, t: 4 },
    {
      choice: {
        q: 'เตรียมก่อน cardiovert',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ sedation ก่อน (ผู้ป่วยรู้ตัว + เวลายังอำนวย) แล้วค่อยปล่อยไฟ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ยา sedation แล้วค่ะ ผู้ป่วยหลับลง — <span class="cbs-em">เตรียม cardiovert ได้เลย</span>' }, t: 8 },
            ],
          },
          { tgt: 'DEFIB', label: 'ข้าม sedation ปล่อยไฟใส่ทั้งที่ผู้ป่วยรู้ตัวเต็มที่', ok: false, why: 'ผู้ป่วยรู้ตัวและยังมีเวลา — ควรให้ sedation ก่อนเพื่อความ humane การช็อกคนที่ตื่นเต็มที่โดยไม่จำเป็นคือการทำร้าย (จะข้ามได้ก็ต่อเมื่อ peri-arrest จริงๆ)' },
          { tgt: 'DRUG', label: 'รอ sedation ออกฤทธิ์เต็มที่ 15 นาทีก่อนค่อยช็อก', ok: false, why: 'unstable รอไม่ได้นานขนาดนั้น — ให้ sedation พอควรแล้วต้อง cardiovert เร็ว ห้ามชะลอจนผู้ป่วยทรุด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ปล่อยไฟ — วินาทีชี้ชะตา',
        options: [
          {
            tgt: 'DEFIB', label: '"CLEAR!" กวาดตารอบเตียง — ปล่อยไฟแบบ synchronized', ok: true,
            then: [
              { inter: 'SYNC — CARDIOVERT!', drama: 'red', t: 5 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เครื่องจับ R wave แล้วปล่อยไฟตรงจังหวะ… <span class="cbs-em">จอสะดุดแวบเดียว!</span>' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'happy', text: 'จังหวะกลับมาแล้ว — <span class="cbs-em">sinus rhythm!</span> อัตราหัวใจลงเหลือ ~90/นาที ค่ะ!' }, t: 6, fx: { rhythm: 'nsr' } },
            ],
          },
          { tgt: 'DEFIB', label: 'ปิดโหมด SYNC ปล่อยไฟแบบธรรมดา จะได้ไม่ต้องรอเครื่องจับจังหวะ', ok: false, why: 'ไม่กด SYNC = ไฟอาจตกช่วง T wave (R-on-T) เปลี่ยนจังหวะที่มีชีพจรให้กลายเป็น VF — ต้อง SYNC เสมอเมื่อมีชีพจร', worsen: true },
          { tgt: 'DEFIB', label: 'ปล่อยไฟเลย ไม่ต้อง clear ให้เสียเวลา', ok: false, why: 'ไฟลงคนที่ยังแตะเตียง = ทีมของคุณ arrest แทน — ต้อง clear ทุกครั้งก่อนปล่อยไฟ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'กลับเป็น sinus แล้ว — แต่ยังไม่จบ ต้องยืนยันว่าอาการดีขึ้นจริงและหาสาเหตุที่ทำให้เกิด' }, t: 4 },
    {
      choice: {
        q: 'หลัง cardioversion สำเร็จ — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC/สัญญาณชีพซ้ำ + post-conversion care + หาและแก้สาเหตุที่กระตุ้น', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'happy', text: '<span class="cbs-em">BP ขึ้นมา 118/72</span> ค่ะ! ผู้ป่วยรู้สึกตัวดีขึ้น หายใจสบายขึ้น เจ็บหน้าอกทุเลาลง' }, t: 6 },
              { inter: 'CONVERTED!', green: true, t: 5, fx: { rhythm: 'nsr' } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">แยก unstable ได้ขาด</span> — unstable tachycardia มีชีพจร = synchronized cardioversion ทันที ให้ sedation เมื่อผู้ป่วยรู้ตัว ห้ามเสียเวลาลองยา ห้ามกดหน้าอก และห้าม unsync ส่งเฝ้าติดตามหาสาเหตุต่อได้เลย' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Cardiovert ซ้ำอีกทีให้ชัวร์', ok: false, why: 'จังหวะกลับเป็น sinus ที่มีชีพจรแล้ว — การช็อกซ้ำจะเหนี่ยวนำให้เกิด arrest ใหม่' },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกไว้ก่อนกันพลาด', ok: false, why: 'ผู้ป่วยมีชีพจรและ BP ดีขึ้นแล้ว — การกดหน้าอกบนหัวใจที่บีบเองจะทำร้ายและอาจเหนี่ยวนำ arrest', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
