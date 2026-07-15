// เคส: Tachycardia มีชีพจร ตอบสนองต่อยา (พื้นฐาน) — ไม่มี arrest ต่อท้าย
// จุดสอน: Tachycardia Algorithm สาย stable — vagal maneuver → adenosine (push เร็ว + flush)
//         แยกให้ชัดว่าไม่ใช้ CPR/ไฟฟ้ากับผู้ป่วยที่ยังมีชีพจร (คู่กับ svtCascade.js ที่ unstable ต้อง cardiovert)
export const tachycardiaBasic = {
  id: 'tachy-basic-01',
  title: 'ใจสั่นกะทันหัน — Tachycardia มีชีพจร',
  subtitle: 'หญิงอายุ 26 ปี ใจสั่นขึ้นมาทันที แน่นหน้าอกเล็กน้อย ยังรู้สึกตัวดี',
  level: 'basic',
  track: 'tachy',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้เตียง 7 ใจสั่นขึ้นมากะทันหันค่ะ หน้าซีดเล็กน้อยแต่ยังพูดคุยรู้เรื่องอยู่!' }, t: 5 },
    { inter: 'ใจสั่น! HR เร็วมาก!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'คุณคือ Team Leader — จับให้ได้ว่าเป็นจังหวะอะไร แล้วเธอ <span class="cbs-em">stable หรือ unstable</span>' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'MONITOR', label: 'ประเมิน ABC + คลำชีพจร + ติด monitor และ 12-lead ECG', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">narrow-complex regular ~180/นาที</span> ค่ะ คลำชีพจรได้ชัดเจน', fx: { rhythm: 'tachy' } }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'BP 108/68 ยังพอไหว ไม่เจ็บหน้าอกรุนแรง ไม่ซึมค่ะ' }, t: 6 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ยังมีชีพจรชัดเจน — การกดหน้าอกบนหัวใจที่ยังบีบเองอันตรายและไม่จำเป็น', worsen: true },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) ทันที', ok: false, why: 'มีชีพจร — unsync shock เสี่ยงตกบน T wave (R-on-T) กลายเป็น VF', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Narrow + regular + stable = ยังพอมีเวลาลองวิธีที่ไม่รุกรานก่อน' }, t: 4 },
    {
      choice: {
        q: 'จังหวะแรกของการรักษา SVT ที่ stable',
        options: [
          {
            tgt: 'YOU', label: 'Vagal maneuver — ให้เบ่ง Valsalva', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'เบ่งแล้วค่ะ… <span class="cbs-em">ดีขึ้นนิดหน่อยแต่ยังเร็วอยู่ ~160</span>' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg IV push ทันที', ok: false, why: 'ยังไม่ลอง vagal/adenosine ก่อน — ไม่ใช่ first-line ของ narrow regular SVT ที่ stable' },
          { tgt: 'DRUG', label: 'Atropine 0.5 mg IV', ok: false, why: 'Atropine ใช้รักษา bradycardia ไม่ใช่ tachycardia' },
        ],
      },
    },
    {
      choice: {
        q: 'Vagal ไม่ได้ผลเต็มที่ — ทำต่ออย่างไร',
        options: [
          {
            tgt: 'DRUG', label: 'Adenosine 6 mg IV push เร็ว + flush ทันที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Adenosine 6 in — flush!"</span> …หยุดวูบสั้นๆ แล้วเด้งกลับมาเร็วอีกค่ะ' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'ให้ซ้ำ <span class="cbs-em">12 mg</span> push เร็ว + flush…' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'happy', text: 'จังหวะกลับเป็น <span class="cbs-em">sinus แล้วค่ะ!</span> HR 82 สม่ำเสมอ', fx: { rhythm: 'nsr' } }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine 6 mg หยดช้าๆ ทางน้ำเกลือ', ok: false, why: 'Adenosine ครึ่งชีวิตสั้นมาก ต้อง push เร็ว + flush ทันที ไม่งั้นสลายตัวก่อนถึงหัวใจ' },
          { tgt: 'DEFIB', label: 'Unsynchronized shock 200 J', ok: false, why: 'ยังมีชีพจร — ถ้าจะช็อกต้อง synchronized เท่านั้น ไม่ใช่ unsync', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'กลับเป็น sinus แล้ว — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินซ้ำ ABC/vitals + หาสาเหตุ (ไทรอยด์ คาเฟอีน ยา) + ปรึกษาต่อ', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! stable narrow SVT ตอบสนองต่อ <span class="cbs-em">vagal → adenosine</span> ได้เต็มๆ ไม่ต้องใช้ไฟฟ้าเลย' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Adenosine ซ้ำอีกเข็มเผื่อไว้', ok: false, why: 'กลับเป็น sinus แล้ว ไม่มีข้อบ่งชี้ให้ adenosine เพิ่ม' },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion เผื่อกลับเป็นซ้ำ', ok: false, why: 'จังหวะ sinus ปกติแล้ว มีชีพจรดี ไม่มีข้อบ่งชี้ cardiovert' },
        ],
      },
    },
    { inter: 'STABLE!', green: true, t: 5 },
    { end: true },
  ],
};
