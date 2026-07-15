// เคส: Unstable Bradycardia (พื้นฐาน) — Atropine → Transcutaneous Pacing เส้นเดียว ไม่มี arrest
export const bradycardiaBasic = {
  id: 'brady-basic-01',
  title: 'Bradycardia — ใจเต้นช้าจนหน้ามืด',
  subtitle: 'หญิงอายุ 65 ปี อ่อนเพลีย มึนงง เดินซวนเซ ใจเต้นช้ามาก แต่ยังคลำชีพจรได้ตลอด',
  level: 'basic',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'คุณหมอคะ! คนไข้เตียง 5 อ่อนเพลียมาก มึนงง เดินแล้วซวนเซ ใจเต้นช้ามากค่ะ!' }, t: 5 },
    { say: { who: 'att_dech', pose: 'talk', text: 'ไปดูกันเลย — วันนี้คุณดูแลเคสนี้ เริ่มประเมินได้เลย' }, t: 4 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด cardiac monitor + วัดสัญญาณชีพ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ติด monitor แล้วค่ะ… จอขึ้น <span class="cbs-em">Sinus bradycardia อัตรา 40 ครั้ง/นาที</span>', fx: { rhythm: 'brady' } }, t: 8 },
              { inter: 'SINUS BRADYCARDIA HR 40!', drama: 'red', t: 4, fx: { alarm: true } },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันทีเพราะหัวใจเต้นช้า', ok: false, why: 'ผู้ป่วยยังมีชีพจร คลำได้ชัดเจน — การกดหน้าอกทั้งที่มีชีพจรเป็นอันตราย', worsen: true },
          { tgt: 'DRUG', label: 'ฉีด Atropine ทันทีโดยยังไม่ประเมิน', ok: false, why: 'ต้องประเมิน ABC และดู rhythm ก่อนเลือกการรักษาเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ประเมินว่า stable หรือ unstable',
        options: [
          {
            tgt: 'YOU', label: 'ถามอาการเจ็บหน้าอก/ใจสั่น/เหนื่อย/ซึมลง + วัดความดันโลหิต', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ผู้ป่วยบอกแน่นหน้าอกเล็กน้อย ซึมลง… <span class="cbs-em">ความดัน 78/50 ค่ะ!</span>' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'อาการพวกนี้เกิด<span class="cbs-em">จาก bradycardia โดยตรง</span> — นี่คือ unstable bradycardia ต้องรักษาเดี๋ยวนี้' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ทันทีเพราะ HR ต่ำมาก', ok: false, why: 'ผู้ป่วยยังมีชีพจร — การช็อกไฟแบบไม่ sync ทั้งที่มีชีพจรอันตรายมาก', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Adenosine 6 mg push', ok: false, why: 'Adenosine ใช้รักษา tachycardia (เช่น SVT) ไม่ใช่ bradycardia' },
        ],
      },
    },
    {
      choice: {
        q: 'Unstable bradycardia — การรักษาแรก',
        options: [
          {
            tgt: 'DRUG', label: 'Atropine 1 mg IV — ให้ซ้ำได้ทุก 3-5 นาที สูงสุด 3 mg', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '"Atropine 1 mg IV!" ยาเข้าแล้วค่ะ' }, t: 6 },
              { skip: 'รอดูการตอบสนอง 3 นาที', t: 170 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'HR ขึ้นนิดเดียวเป็น 42… <span class="cbs-em">อาการยังไม่ดีขึ้นเลยค่ะ</span>' }, t: 6 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ท่อช่วยหายใจก่อนให้ยา', ok: false, why: 'ผู้ป่วยยังหายใจเองได้ดี ไม่มีข้อบ่งชี้ใส่ท่อ — ให้ atropine ก่อน' },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกเพราะ HR ต่ำกว่า 60', ok: false, why: 'เกณฑ์กดหน้าอกคือไม่มีชีพจร ไม่ใช่แค่ HR ต่ำ — ผู้ป่วยยังมีชีพจรชัดเจน', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Atropine ให้ครบแล้วไม่ตอบสนอง — ขั้นต่อไป',
        options: [
          {
            tgt: 'DEFIB', label: 'เริ่ม Transcutaneous pacing (TCP): เปิด pacer ตั้ง rate ~70/min แล้วเพิ่ม output จนเห็น capture', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'แปะ pads แล้ว เปิด pacer… เพิ่ม mA ขึ้นเรื่อยๆ 60…70…80… <span class="cbs-em">capture! spike ตามด้วย QRS กว้าง คลำชีพจรตรงจังหวะเป๊ะ!</span>', fx: { rhythm: 'pacing' } }, t: 10 },
              { inter: 'PACING CAPTURE!', drama: 'red', t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Atropine ซ้ำต่อไปเรื่อยๆ จนกว่า HR จะขึ้น', ok: false, why: 'ให้ atropine ครบ 3 mg แล้วไม่ได้ผล ควรไป pacing ทันที — การให้ซ้ำต่อไปเรื่อยๆ เสียเวลาที่มีค่า', worsen: true },
          { tgt: 'MONITOR', label: 'รอดูอาการต่ออีกสักพักก่อนตัดสินใจ', ok: false, why: 'ผู้ป่วย unstable อยู่ ห้ามรอเฉยๆ ต้องรีบไปขั้นถัดไปทันที' },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยรู้สึกตัวและร้องเจ็บมากจากไฟ pacing',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ sedation/analgesia (เช่น fentanyl + midazolam) แล้ว pace ต่อ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ยาแล้วค่ะ ผู้ป่วยสงบลง <span class="cbs-em">ยังคง capture — ความดันเริ่มขึ้นแล้ว</span>' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'หยุด pacing เพราะผู้ป่วยทนเจ็บไม่ไหว', ok: false, why: 'หยุด pace แล้วเสีย capture ทันที ความดันจะตกซ้ำ — ต้องให้ยาแก้ปวด ไม่ใช่หยุดเครื่อง', worsen: true },
          { tgt: 'DEFIB', label: 'เพิ่ม output แรงขึ้นอีกโดยไม่ให้ยาก่อน', ok: false, why: 'ยิ่งเพิ่ม mA ยิ่งเจ็บ — ต้อง sedation ก่อนเสมอเมื่อผู้ป่วยรู้สึกตัว', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'อาการดีขึ้น ความดันขึ้น — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินซ้ำ + หาสาเหตุ (ยา เช่น beta-blocker, MI, hypothyroid) + monitor ต่อเนื่อง', ok: true,
            then: [
              { inter: 'STABLE!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณจัดการ unstable bradycardia ได้ครบ: <span class="cbs-em">Atropine ก่อน แล้วไป transcutaneous pacing เมื่อยาไม่ได้ผล พร้อม sedation เสมอ</span> อย่าลืมหาสาเหตุที่แก้ไขได้ด้วย' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Atropine อีกโดสไว้กันเหนียว', ok: false, why: 'ความดันและอาการดีขึ้นแล้ว ไม่มีข้อบ่งชี้ให้ยาเพิ่ม — ควรหาสาเหตุที่แก้ไขได้แทน' },
          { tgt: 'CPR', label: 'เตรียม CPR ไว้ก่อนเผื่อทรุดอีก', ok: false, why: 'ผู้ป่วยมีชีพจรและอาการดีขึ้นแล้ว ไม่มีข้อบ่งชี้ CPR' },
        ],
      },
    },
    { end: true },
  ],
};
