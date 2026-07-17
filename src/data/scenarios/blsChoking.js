// เคส BLS (สำหรับ MorRoo): ผู้ใหญ่สำลักอาหารจนหมดสติ — choking → CPR
// ขอบเขต BLS: ประเมินสำลักรุนแรง → abdominal thrust → หมดสติ → CPR + เรียก AED
export const blsChoking = {
  id: 'bls-choking-01',
  title: 'สำลักในร้านอาหาร',
  subtitle: 'หญิงวัย 45 ปี กำลังกินข้าวอยู่ดี ๆ ก็ลุกขึ้นเอามือกุมคอ พูดไม่ออก หน้าเริ่มเขียว',
  level: 'basic',
  track: 'choking',
  course: 'bls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'เธอเอามือกุมคอ! พูดไม่ออก ไอไม่มีเสียงเลยค่ะ!' }, t: 4 },
    { inter: 'สำลักรุนแรง!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'สัญญาณสากลของการสำลัก — <span class="cbs-em">มือกุมคอ</span> เธอยังรู้ตัวอยู่ คุณจะทำอะไร?' }, t: 3 },
    {
      choice: {
        q: 'ผู้ป่วยสำลัก ยังรู้สึกตัว ไอไม่มีเสียง',
        options: [
          {
            tgt: 'YOU', label: 'ถาม "สำลักใช่ไหม?" แล้วทำ abdominal thrust (Heimlich)', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'ยืนหลังเธอ กระตุกเข้า-ขึ้นที่ท้อง… <span class="cbs-em">ทำซ้ำเรื่อย ๆ ค่ะ</span>' }, t: 6 }],
          },
          { tgt: 'CPR', label: 'จับนอนลงกดหน้าอกทันที', ok: false, why: 'ยังรู้สึกตัวอยู่ — ใช้ abdominal thrust ก่อน CPR เริ่มเมื่อหมดสติ', worsen: true },
          { tgt: 'YOU', label: 'ให้ดื่มน้ำเยอะ ๆ ให้อาหารไหลลง', ok: false, why: 'อันตราย! ห้ามให้กินดื่มตอนสำลัก — ทำ abdominal thrust' },
        ],
      },
    },
    {
      choice: {
        q: 'กระตุกหลายครั้งแล้วยังไม่ออก — เธอเริ่มตัวอ่อนหมดสติ',
        options: [
          {
            tgt: 'YOU', label: 'ประคองลงพื้น + สั่งคน "โทร 1669! เอา AED!" แล้วเริ่ม CPR', ok: true,
            then: [
              { inter: 'หมดสติแล้ว!', drama: 'red', t: 5, fx: { alarm: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดหน้าอกครับ! <span class="cbs-em">กดแล้วดูในปากทุกครั้งก่อนเป่า</span> ถ้าเห็นสิ่งแปลกปลอมค่อยเอาออก', fx: { cpr: true, firstCPR: true } }, t: 8 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ล้วงคอลึก ๆ หาเศษอาหารทันที', ok: false, why: 'ห้ามล้วงมั่ว (blind finger sweep) อาจดันลงลึกกว่าเดิม — เริ่ม CPR การกดหน้าอกช่วยดันสิ่งอุดกั้น', worsen: true },
          { tgt: 'YOU', label: 'ทำ abdominal thrust ต่อทั้งที่หมดสติแล้ว', ok: false, why: 'พอหมดสติเปลี่ยนเป็น CPR — การกดหน้าอกสร้างแรงดันไล่สิ่งอุดกั้นได้ดีกว่า' },
        ],
      },
    },
    {
      choice: {
        q: 'กด CPR ไป — จังหวะจะเปิดทางหายใจเป่า',
        options: [
          {
            tgt: 'AIRWAY', label: 'เปิดปาก มองหาสิ่งแปลกปลอม เห็นชัดจึงเขี่ยออก', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'เห็นเศษอาหารชิ้นใหญ่! <span class="cbs-em">เขี่ยออกมาได้แล้วค่ะ!</span>' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — เอาออกเฉพาะที่<span class="cbs-em">เห็นชัด</span>เท่านั้น แล้วกดต่อ อย่าหยุดนาน' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ล้วงนิ้วกวาดในคอแบบสุ่ม ๆ', ok: false, why: 'blind finger sweep ห้ามทำ — เขี่ยออกเฉพาะสิ่งที่มองเห็นชัดเจน', worsen: true },
          { tgt: 'DEFIB', label: 'หยุดกดไปเอา AED มาแปะรอ', ok: false, why: 'สาเหตุคือสิ่งอุดกั้น — จัดการทางเดินหายใจ + กดต่อ ไม่ใช่หยุดยาว' },
        ],
      },
    },
    {
      choice: {
        q: 'เอาสิ่งอุดกั้นออกแล้ว — ทำต่ออย่างไร',
        options: [
          {
            tgt: 'CPR', label: 'กด CPR ต่อ 30:2 + ติด AED เมื่อมาถึง ทำจน EMS มา', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'กดต่อ! เป่าได้แล้ว อกขยับดีขึ้น', fx: { cpr: true } }, t: 6 },
              { skip: 'CPR + AED ต่อเนื่อง จน EMS มาถึง', t: 90 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เธอไอออกมา! <span class="cbs-em">หายใจเองแล้ว มีชีพจรค่ะ!</span>' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'พอเอาของออกแล้วก็หยุด ปลุกให้ตื่นเอง', ok: false, why: 'ยังไม่มีชีพจร — ต้อง CPR ต่อจนกว่าจะฟื้นหรือ EMS มา', worsen: true },
          { tgt: 'AIRWAY', label: 'เป่าปากรัว ๆ อย่างเดียวไม่ต้องกด', ok: false, why: 'ต้องกดหน้าอกเป็นหลัก 30:2 — เป่าอย่างเดียวเลือดไม่ไหลเวียน' },
        ],
      },
    },
    {
      choice: {
        q: 'ผู้ป่วยหายใจเอง + มีชีพจร EMS มาถึง',
        options: [
          {
            tgt: 'YOU', label: 'จัดท่า recovery + เฝ้าการหายใจ + ส่งต่อ EMS', ok: true,
            then: [
              { inter: 'รอดแล้ว!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'สุดยอด! <span class="cbs-em">จำ 3 จังหวะ: สำลักรู้ตัว→thrust, หมดสติ→CPR, เห็นของค่อยเขี่ย</span> คุณช่วยชีวิตเธอไว้ได้' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'กดหน้าอกต่ออีกเผื่อไว้', ok: false, why: 'มีชีพจร+หายใจเองแล้ว หยุดกด จัดท่า recovery' },
          { tgt: 'AIRWAY', label: 'ทำ abdominal thrust ซ้ำกันเหนียว', ok: false, why: 'ทางเดินหายใจโล่งและหายใจเองแล้ว ไม่ต้องทำอีก' },
        ],
      },
    },
    { end: true },
  ],
};
