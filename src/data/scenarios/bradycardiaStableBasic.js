// เคส: Stable Bradycardia (พื้นฐาน) — HR ช้าแต่ "ไม่มีอาการไม่เสถียร"
// จุดสอน: bradycardia ที่ผู้ป่วยเสถียร (ไม่มี hypotension/altered mental/ischemic chest pain/shock)
//         = ไม่ต้องรีบ atropine/pacing — ให้ monitor + หาสาเหตุ + สังเกตอาการ
//         · แยกจาก unstable ที่ต้องรักษาเร่งด่วน (คนมักรีบเกินไป)
//         · ผู้ป่วยมีชีพจรตลอด ห้ามเริ่ม CPR/shock
export const bradycardiaStableBasic = {
  id: 'brady-stable-basic-01',
  title: 'หัวใจเต้นช้า — แต่คนไข้ยังสบายดี',
  subtitle: 'ชายอายุ 62 ปี มาตรวจตามนัด วัด HR ได้ ~45 โดยบังเอิญ รู้สึกตัวดี ไม่มีอาการ',
  level: 'basic',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'talk', text: 'อาจารย์คะ คนไข้ชายเตียง 5 มาตรวจตามนัด… <span class="cbs-em">จับชีพจรได้ HR ~45</span> แต่เจ้าตัวบอกว่าสบายดีค่ะ ไม่มีอาการอะไรเลย' }, t: 5 },
    { say: { who: 'att_dech', pose: 'stern', text: 'HR ช้า แต่คนไข้ยังนั่งคุยปกติ… <span class="cbs-em">อย่าเพิ่งรีบให้ยา</span> ประเมินก่อนว่า "เสถียร" หรือ "ไม่เสถียร" คุณคือ Team Leader เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด monitor + วัด BP/O₂ + ถามอาการ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ติด monitor แล้วค่ะ… <span class="cbs-em">Sinus bradycardia HR 45</span> BP 128/76, O₂ sat 98% คนไข้รู้สึกตัวดี พูดคุยฉะฉาน' }, t: 8, fx: { rhythm: 'brady' } },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — เก็บข้อมูลก่อนตัดสินใจเสมอ ต่อไปคือคำถามที่สำคัญที่สุด: <span class="cbs-em">คนไข้ "ไม่เสถียร" หรือเปล่า</span>' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ฉีด Atropine 1 mg ทันที เพราะ HR ต่ำ', ok: false, why: 'ยังไม่ประเมินเลยว่าเสถียรหรือไม่ — atropine ใช้เมื่อ bradycardia "มีอาการ/ไม่เสถียร" เท่านั้น ประเมินก่อน' },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกเพราะ HR ช้ามาก', ok: false, why: 'คนไข้ยังมีชีพจรและรู้สึกตัวดี! การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้เกิด arrest', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ประเมิน stable vs unstable — คนไข้รายนี้จัดเป็นอะไร',
        options: [
          {
            tgt: 'YOU', label: 'ถามหาสัญญาณไม่เสถียร: ความดันตก/ซึม/เจ็บอก/เหนื่อย/ช็อก → ไม่มีเลย = STABLE', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ถามครบแล้วค่ะ — <span class="cbs-em">ไม่เจ็บหน้าอก ไม่เหนื่อย ไม่หน้ามืด</span> ปลายมือปลายเท้าอุ่นดี ปัสสาวะปกติ' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'นี่คือ <span class="cbs-em">stable bradycardia</span> — unstable ต้องมี hypotension, altered mental status, ischemic chest pain หรือ signs of shock "ที่เกิดจาก" หัวใจช้า รายนี้ไม่มีสักข้อ' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'เริ่ม transcutaneous pacing ไว้ก่อน กันหัวใจหยุด', ok: false, why: 'คนไข้ stable ไม่มีอาการ — pacing เจ็บมากและไม่มีข้อบ่งชี้ TCP ใช้เมื่อ unstable และ atropine ไม่ได้ผล', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Atropine 1 mg เผื่อไว้ก่อนคนไข้จะแย่', ok: false, why: 'ไม่มีอาการไม่เสถียร = ไม่มีข้อบ่งชี้ให้ atropine — over-treatment เสียโอกาสหาสาเหตุ และ atropine มีผลข้างเคียง' },
        ],
      },
    },
    {
      choice: {
        q: 'Stable bradycardia — การจัดการที่ถูกต้อง',
        options: [
          {
            tgt: 'MONITOR', label: 'ไม่ให้ atropine — monitor ต่อ, เปิด IV, ทำ 12-lead, เริ่มหาสาเหตุ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: '12-lead ออกแล้วค่ะ — sinus bradycardia ไม่มี ischemia ชัด ๆ <span class="cbs-em">คนไข้ยังสบายดี เฝ้าจอต่อ</span>' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — stable คือ "monitor &amp; observe แล้วหาสาเหตุ" สาเหตุที่แก้ได้เจอบ่อย: <span class="cbs-em">ยา (β-blocker/CCB/digoxin), electrolyte, hypothyroid, ischemia, vagal tone/นักกีฬา</span>' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Adenosine 6 mg push เร็ว ๆ', ok: false, why: 'Adenosine ใช้กับ tachycardia (SVT) — ที่นี่หัวใจช้าอยู่แล้ว ยิ่งให้ยิ่งหยุด คนละขั้วกันเลย', worsen: true },
          { tgt: 'YOU', label: 'ให้คนไข้กลับบ้านได้เลย HR ช้านิดหน่อยไม่เป็นไร', ok: false, why: 'ประมาทเกินไป — ยังไม่ทำ 12-lead และไม่หาสาเหตุ — bradycardia ที่มาใหม่อาจซ่อนสาเหตุที่แก้ได้ (ยา/ischemia/hypothyroid)' },
        ],
      },
    },
    {
      choice: {
        q: 'หาสาเหตุที่แก้ได้ — ทำอะไรต่อ',
        options: [
          {
            tgt: 'MONITOR', label: 'ทบทวนยาที่คนไข้ใช้ + ส่ง lab (electrolyte, TSH, ดู trop/ECG ซ้ำ)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ทบทวนยาแล้วค่ะ — คนไข้เพิ่งถูกปรับเพิ่ม <span class="cbs-em">β-blocker</span> เมื่อสัปดาห์ก่อน! electrolyte ปกติ รอผล TSH' }, t: 6 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เจอเบาะแสแล้ว — bradycardia จากยาที่เพิ่งปรับ พบบ่อยและ "แก้ได้" การรีบให้ atropine ไปคงพลาดจุดนี้' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge เครื่อง shock 200 J เตรียมไว้ให้พร้อม', ok: false, why: 'คนไข้มีชีพจรและเสถียร — ไม่มีข้อบ่งชี้ให้ defibrillation เลย shock คนที่มีชีพจรปกติอาจเหนี่ยวนำ arrhythmia', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Atropine กันไว้ตอนนี้เลย จะได้ไม่ต้องรอ', ok: false, why: 'ยัง stable อยู่ — ให้ยาโดยไม่มีข้อบ่งชี้คือ over-treatment atropine ทำให้ใจสั่น/ปัสสาวะคั่ง/สับสนได้ และบดบังการหาสาเหตุ' },
        ],
      },
    },
    {
      choice: {
        q: 'วางแผนเฝ้าระวัง — ถ้าคนไข้เริ่มมีอาการจะทำอย่างไร',
        options: [
          {
            tgt: 'MONITOR', label: 'เฝ้า monitor ต่อ + เตรียม atropine/pacer ไว้ข้างเตียง เผื่อเข้าสู่ unstable pathway', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'นี่คือหัวใจของ stable branch — <span class="cbs-em">"เตรียมพร้อม แต่ยังไม่ทำ"</span> ถ้าเมื่อไรความดันตก/ซึม/เจ็บอก ค่อยเข้า unstable pathway: atropine → ถ้าไม่ขึ้นก็ pacing' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ผ่านไปครึ่งชั่วโมง HR ขยับขึ้นเป็น 52 หลังปรับลดยา <span class="cbs-em">คนไข้ยังสบายดีตลอด</span> ความดันคงที่' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Atropine ตอนนี้เลย ไม่ต้องรอให้มีอาการ', ok: false, why: 'สอนผิด concept — atropine เป็นการรักษา "เมื่อ" มีอาการไม่เสถียร ไม่ใช่ให้ล่วงหน้าตอนยังสบายดี' },
          { tgt: 'CPR', label: 'เริ่ม CPR ไว้เผื่อหัวใจหยุด', ok: false, why: 'คนไข้มีชีพจรและรู้สึกตัวดี — CPR ในคนที่ยังมีชีพจรเป็นอันตราย ไม่ใช่การ "เผื่อไว้"', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'สรุปเคส — จะจัดการต่ออย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'คนไข้เสถียร ได้สาเหตุแล้ว → admit/monitor สังเกตอาการ นัดติดตาม ปรึกษาถ้าจำเป็น', ok: true,
            then: [
              { inter: 'STABLE!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">แยก stable ออกจาก unstable ได้ถูก</span> — ไม่รีบ atropine/pacing แต่เลือก monitor + หาสาเหตุ (เจอ β-blocker) + วางแผนเฝ้าระวัง นี่คือจุดที่คนมักรีบเกินไป เคสนี้เป็นของคุณ' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock 1 ครั้งให้ชัวร์ก่อนส่งต่อ', ok: false, why: 'คนไข้จังหวะปกติมีชีพจร — การ shock ทำให้เกิด arrhythmia ใหม่ อันตรายที่สุดและไม่มีข้อบ่งชี้', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Atropine 1 dose ปิดท้ายกันช้าซ้ำ', ok: false, why: 'ยังไม่มีอาการไม่เสถียร — ไม่มีข้อบ่งชี้ ให้หาและติดตามสาเหตุแทน การให้ยาโดยไม่จำเป็นมีแต่ผลเสีย' },
        ],
      },
    },
    { end: true },
  ],
};
