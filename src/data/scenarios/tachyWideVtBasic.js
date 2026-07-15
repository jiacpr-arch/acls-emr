// เคส: Wide-complex Regular Tachycardia — Stable Monomorphic VT (พื้นฐาน)
// จุดสอน: wide-complex tachycardia ที่ "มีชีพจร + stable" → ถือเป็น VT ไว้ก่อน
//         รักษาด้วย antiarrhythmic (amiodarone/procainamide IV) + เตรียม synchronized
//         cardioversion ไว้เผื่อทรุด · ผู้ป่วยมีชีพจรตลอด — ห้าม CPR/defibrillation
export const tachyWideVtBasic = {
  id: 'tachy-wide-vt-basic-01',
  title: 'ใจสั่น หัวใจเต้นเร็วกว้าง — VT ที่ยังมีชีพจร',
  subtitle: 'ชายอายุ 62 ปี ใจสั่น เจ็บอกเล็กน้อยแต่ยังพูดคุยรู้เรื่อง Monitor เร็วมาก',
  level: 'basic',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้เตียง 5 ใจสั่น เจ็บอกเล็กน้อยค่ะ <span class="cbs-em">Monitor เต้นเร็วมาก</span> แต่ยังพูดคุยรู้เรื่องดี' }, t: 5 },
    { inter: 'HR เร็วมาก!', drama: 'red', t: 0, fx: { alarm: true } },
    { say: { who: 'att_dech', pose: 'stern', text: 'เร็วผิดปกติ… <span class="cbs-em">คุณคือ Team Leader</span> — จับให้ได้ก่อนว่าจังหวะแบบไหน แล้วผู้ป่วยยังมีชีพจร เสถียรหรือไม่' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + คลำชีพจร + ติด monitor/12-lead + เปิด IV', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">wide-complex สม่ำเสมอ ~160/นาที</span> — คลำชีพจรได้ชัดค่ะ QRS กว้างเหมือนกันทุกตัว (monomorphic)' }, t: 8, fx: { rhythm: 'tachy' } },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ผู้ป่วยยัง "มีชีพจร" และพูดคุยได้ — การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้ arrest', worsen: true },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) 200 J เลย', ok: false, why: 'มีชีพจร + ยังไม่ประเมิน — unsync shock บนจังหวะที่มี R wave เสี่ยง R-on-T กลายเป็น VF', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Wide + regular + มีชีพจร — ประเมิน stable หรือ unstable',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินสัญญาณ unstable (ความดันตก/ซึม/เจ็บอกรุนแรง/หัวใจล้ม)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'BP 118/72 รู้สึกตัวดี พูดเป็นประโยค เจ็บอกแค่เล็กน้อย ไม่มี ischemic change ชัด — <span class="cbs-em">ยัง stable ค่ะ</span>' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'Stable = <span class="cbs-em">เรายังมีเวลาให้ใช้ยา</span> ไม่ต้องรีบช็อก แต่ต้องเตรียมเครื่องไว้เสมอเผื่อทรุด' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'ถือว่า unstable ไว้ก่อน — synchronized cardioversion เลย', ok: false, why: 'ยัง stable (BP ดี รู้สึกตัวดี เจ็บอกเล็กน้อย) — ยังมีเวลาใช้ยา ไม่จำเป็นต้องช็อกทันที' },
          { tgt: 'DRUG', label: 'ให้ Atropine 0.5 mg IV', ok: false, why: 'Atropine เป็นยาของ bradycardia — ไม่มีที่ในหัวใจเต้นเร็ว' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Wide-complex regular + มีชีพจร ถ้าแยกไม่ออกว่า VT หรือ SVT-aberrancy ให้ <span class="cbs-em">รักษาแบบ VT ไว้ก่อน</span> (ปลอดภัยกว่า) — นี่คือ default' }, t: 5 },
    {
      choice: {
        q: 'Stable wide-complex VT — การรักษาหลัก',
        options: [
          {
            tgt: 'DRUG', label: 'Amiodarone 150 mg IV ช้าๆ ~10 นาที (หรือ procainamide) + เตรียมเครื่อง cardioversion standby', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Amiodarone 150 mg เริ่มหยดแล้วค่ะ"</span> เปิดเส้นสำรองอีกเส้น เครื่อง defib/cardioversion ตั้งไว้ข้างเตียงพร้อม' }, t: 8 },
              { say: { who: 'att_dech', pose: 'talk', text: 'ดีมาก — พร้อมกันนี้ <span class="cbs-em">ปรึกษาผู้เชี่ยวชาญ</span> ไว้ด้วย wide-complex ต้องมีคนช่วยยืนยันแผน' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine 6 mg push เร็ว มั่นใจว่าเป็น SVT with aberrancy', ok: false, why: 'จังหวะนี้ต้องถือเป็น VT ไว้ก่อน — adenosine พอใช้ได้เฉพาะกรณี wide regular monomorphic ที่ "สงสัย SVT" อย่างระวัง ไม่ใช่ตัวเลือกหลัก ถ้าเป็น VT จริงอาจไม่ได้ผลและเสี่ยง' },
          { tgt: 'DRUG', label: 'Verapamil (CCB) IV ลดอัตราหัวใจ', ok: false, why: 'อันตรายมากใน wide-complex VT — CCB ทำ hemodynamic collapse/ความดันตกรุนแรงถ้าเป็น VT จริง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ระหว่างให้ยา — ต้องเฝ้าระวังอะไร และถ้าทรุดทำอย่างไร',
        options: [
          {
            tgt: 'MONITOR', label: 'เฝ้า BP/ชีพจร/อาการต่อเนื่อง — ถ้าทรุดเป็น unstable ให้ synchronized cardioversion ทันที', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'เครื่องตั้งโหมด SYNC เตรียมไว้แล้วค่ะ — ถ้า BP ตก ซึมลง หรือเจ็บอกรุนแรง จะ cardiovert ได้ทันที' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — <span class="cbs-em">stable ใช้ยา, unstable ใช้ synchronized cardioversion</span> เตรียมพร้อมไว้เสมอคือหัวใจของเคสนี้' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'ถ้าทรุด ให้ unsynchronized defibrillation แทน', ok: false, why: 'ตราบใดที่ยังมีชีพจรต้องเป็น synchronized cardioversion — unsync บนจังหวะที่มี R wave เสี่ยง R-on-T กลายเป็น VF', worsen: true },
          { tgt: 'CPR', label: 'ถ้าทรุด เริ่ม CPR ทันทีไม่ต้องคลำชีพจร', ok: false, why: 'ยังมีชีพจรอยู่ — การกดหน้าอกจะรบกวนหัวใจที่ยังบีบเอง เริ่ม CPR เฉพาะเมื่อคลำชีพจรไม่ได้จริง', worsen: true },
        ],
      },
    },
    { say: { who: 'nurse_mint', pose: 'happy', text: 'อาจารย์! หลังยาหยดไปสักพัก… <span class="cbs-em">จอเปลี่ยนแล้วค่ะ!</span> QRS แคบลง จังหวะสม่ำเสมอ อาการใจสั่นดีขึ้น' }, t: 6 },
    {
      choice: {
        q: 'จังหวะกำลังกลับ — ทำอะไรต่อ',
        options: [
          {
            tgt: 'MONITOR', label: 'ยืนยัน sinus rhythm + ประเมินซ้ำ + หา 12-lead และสาเหตุกระตุ้น', ok: true,
            then: [
              { inter: 'CONVERTED — กลับมาแล้ว!', green: true, t: 5, fx: { rhythm: 'nsr' } },
              { say: { who: 'fon_defib', pose: 'happy', text: 'จอขึ้น <span class="cbs-em">sinus rhythm ~88/นาที</span> QRS แคบ BP 122/76 ผู้ป่วยสบายขึ้นชัดเจนค่ะ' }, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! wide-complex tachycardia ที่มีชีพจรและ stable ให้ <span class="cbs-em">ถือเป็น VT ไว้ก่อน รักษาด้วย antiarrhythmic</span> เตรียม synchronized cardioversion เผื่อทรุด — ไม่รีบช็อกและไม่กดหน้าอกเมื่อยังมีชีพจร ส่งดูอาการต่อได้เลย' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion ย้ำอีกทีให้ชัวร์', ok: false, why: 'จังหวะกลับเป็น sinus และผู้ป่วยดีขึ้นแล้ว — การช็อกซ้ำจะเหนี่ยวนำให้เกิดจังหวะผิดปกติใหม่โดยไม่จำเป็น' },
          { tgt: 'DRUG', label: 'ให้ Amiodarone 150 mg ซ้ำอีก bolus ทันที', ok: false, why: 'จังหวะกลับแล้ว — ควรประเมินซ้ำก่อน ถ้าจะป้องกันซ้ำใช้เป็น maintenance infusion ตามคำปรึกษาผู้เชี่ยวชาญ ไม่ใช่ bolus ซ้ำพร่ำเพรื่อ' },
        ],
      },
    },
    { end: true },
  ],
};
