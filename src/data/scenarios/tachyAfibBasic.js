// เคส: Atrial Fibrillation with RVR — STABLE (พื้นฐาน) — narrow-complex IRREGULAR มีชีพจรตลอด
// จุดสอน: AFib RVR ที่ stable → rate control (diltiazem หรือ β-blocker) ไม่ใช่ adenosine ·
//         adenosine ไม่แปลง AFib (ใช้กับ narrow REGULAR SVT) ·
//         ห้าม cardiovert AFib ที่ไม่ทราบ onset/>48 ชม. โดยไม่ประเมิน anticoagulation ก่อน (เสี่ยง embolic stroke)
//         ** ผู้ป่วยมีชีพจรตลอด — ไม่มี CPR/shock ในเคสนี้ **
export const tachyAfibBasic = {
  id: 'tachy-afib-basic-01',
  title: 'ใจสั่นจังหวะไม่สม่ำเสมอ — AFib with RVR (stable)',
  subtitle: 'หญิงอายุ 62 ปี ใจสั่น เหนื่อยเล็กน้อย ชีพจรเต้นไม่สม่ำเสมอ ยังรู้สึกตัวดี',
  level: 'basic',
  track: 'tachy',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์ คนไข้หญิงเตียง 5 บ่นใจสั่น เหนื่อยเล็กน้อยค่ะ <span class="cbs-em">Monitor ขึ้นอัตราหัวใจเร็ว ~150</span> แต่ยังคุยรู้เรื่องดี' }, t: 5 },
    { inter: 'HR ~150 — จังหวะไม่สม่ำเสมอ!', drama: 'red', t: 0, fx: { alarm: true } },
    { say: { who: 'att_dech', pose: 'stern', text: 'ใจสั่นแบบนี้ต้องแยกให้ออก… <span class="cbs-em">คุณคือ Team Leader</span> — จับให้ได้ว่าเป็นจังหวะแบบไหน สม่ำเสมอหรือไม่ และผู้ป่วยเสถียรแค่ไหน' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด monitor/12-lead + คลำชีพจร + เปิด IV', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้น <span class="cbs-em">narrow-complex เต้นไม่สม่ำเสมอแบบ irregularly irregular ~150/นาที</span> ไม่เห็น P wave ชัด — คลำชีพจรได้แต่จังหวะไม่เท่ากันค่ะ' }, t: 8, fx: { rhythm: 'tachy' } },
              { say: { who: 'att_dech', pose: 'stern', text: 'Narrow + <span class="cbs-em">irregular</span> + ไม่มี P wave = Atrial Fibrillation with RVR ล่ะ' }, t: 5 },
            ],
          },
          { tgt: 'CPR', label: 'เริ่มกดหน้าอกทันที', ok: false, why: 'ผู้ป่วยยัง "มีชีพจร" และรู้สึกตัวดี — การกดหน้าอกบนหัวใจที่ยังบีบเองอาจเหนี่ยวนำให้ arrest', worsen: true },
          { tgt: 'DEFIB', label: 'Defibrillate (unsync) 200 J เลย', ok: false, why: 'มีชีพจร + ยังไม่ประเมิน — unsync shock บนจังหวะที่มี R wave เสี่ยง R-on-T กลายเป็น VF', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'AFib with RVR — ประเมิน stable หรือ unstable',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินสัญญาณ unstable (ความดันตก·ซึม·เจ็บอกรุนแรง·หัวใจล้ม)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'BP 122/78 รู้สึกตัวดี พูดเป็นประโยค เจ็บอกแค่แน่นๆ ไม่รุนแรง <span class="cbs-em">ไม่มีสัญญาณ unstable ค่ะ</span>' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'เสถียร — <span class="cbs-em">stable AFib RVR</span> ยังไม่ต้องรีบไฟฟ้า มีเวลาให้เลือกยาอย่างถูกต้อง' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion ทันที (ยังไม่ต้องประเมิน)', ok: false, why: 'ต้องแยก stable/unstable ก่อนเสมอ — cardioversion เร่งด่วนสงวนไว้สำหรับ unstable เท่านั้น' },
          { tgt: 'DRUG', label: 'ให้ Atropine 0.5 mg IV', ok: false, why: 'Atropine เป็นยาของ bradycardia — ผู้ป่วยหัวใจ "เร็ว" ไม่ใช่ช้า ให้ผิดทาง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Stable AFib RVR — เลือกการรักษาหลัก',
        options: [
          {
            tgt: 'DRUG', label: 'Rate control — Diltiazem IV (หรือ β-blocker เช่น metoprolol); ถ้ามี HF/EF ต่ำ เลือกยาให้เหมาะ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Diltiazem IV in!"</span> …อัตราหัวใจค่อยๆ ช้าลง เหลือ ~110 อาการใจสั่นเบาลงค่ะ' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — เป้าหมายคือ <span class="cbs-em">คุมอัตราการเต้น</span> ก่อน ไม่จำเป็นต้องรีบแปลงจังหวะในเคสที่เสถียร' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine 6 mg IV push เพื่อแปลง AFib', ok: false, why: 'Adenosine ใช้กับ narrow "regular" SVT — มัน "ไม่แปลง" AFib (จังหวะ irregular จาก atria หลายจุด) เพียงแค่เผยจังหวะชั่วครู่' },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg IV push เร็ว', ok: false, why: 'ไม่ใช่ first-line ของ stable AFib RVR และ push เร็วทำ BP ตก — เริ่มด้วย rate control (diltiazem/β-blocker) ก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'ญาติถามว่า "ช็อกหัวใจให้กลับปกติเลยได้ไหม" — คุณตอบอย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'เคสเสถียรไม่รีบ cardiovert — ถ้าจะแปลงจังหวะ AFib ที่ onset ไม่ชัด/>48 ชม. ต้องประเมิน anticoagulation/TEE ก่อน', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — AFib ที่เป็นนานเกิน 48 ชม. อาจมี <span class="cbs-em">ลิ่มเลือดใน atrium</span> การ cardiovert โดยไม่ประเมิน anticoagulation ก่อน เสี่ยงดันลิ่มหลุดไปอุดสมอง (embolic stroke)' }, t: 8 },
            ],
          },
          { tgt: 'DEFIB', label: 'Synchronized cardioversion เลย ทั้งที่ไม่ทราบ onset และยังไม่ประเมิน anticoagulation', ok: false, why: 'AFib ที่ไม่ทราบ onset/>48 ชม. + ไม่ได้ anticoag = เสี่ยง embolic stroke จากลิ่มใน atrium — เคสเสถียรห้ามรีบ', worsen: true },
          { tgt: 'DEFIB', label: 'Unsynchronized shock ให้จบไปเลย', ok: false, why: 'ผู้ป่วยมีชีพจร — unsync บนจังหวะที่มี R wave เสี่ยง R-on-T กลายเป็น VF และยังไม่ประเมิน stroke risk', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ก่อนรับไว้ต่อ — วางแผนอะไรเพิ่ม',
        options: [
          {
            tgt: 'YOU', label: 'หาปัจจัยกระตุ้น (ไข้·ติดเชื้อ·thyroid·ขาดน้ำ) + วางแผน anticoagulation ตาม CHA2DS2-VASc + ปรึกษา cardiology', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'เจาะ CBC·อิเล็กโทรไลต์·thyroid·ประเมินภาวะขาดน้ำแล้วค่ะ อัตราหัวใจนิ่งที่ ~95 อาการดีขึ้นชัดเจน' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'เยี่ยม — คุม rate ได้ ควบหาต้นเหตุ และประเมิน <span class="cbs-em">ความเสี่ยง stroke</span> เพื่อวางแผน anticoagulation ครบถ้วน' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'Adenosine เข็มที่สอง 12 mg เผื่อแปลงจังหวะได้', ok: false, why: 'Adenosine ไม่แปลง AFib ไม่ว่าจะกี่เข็ม — จังหวะ irregular จากหลายจุดใน atria ไม่ตอบสนอง' },
          { tgt: 'CPR', label: 'เริ่ม CPR เผื่อหัวใจล้า', ok: false, why: 'ผู้ป่วยมีชีพจรและรู้สึกตัวดี — CPR บนหัวใจที่ยังบีบเองเป็นอันตราย', worsen: true },
        ],
      },
    },
    { inter: 'RATE CONTROLLED — อาการดีขึ้น!', green: true, t: 5, fx: { rosc: true } },
    { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! stable AFib RVR = <span class="cbs-em">rate control ก่อน (diltiazem/β-blocker) ไม่ใช่ adenosine</span> และห้าม cardiovert AFib ที่ onset ไม่ชัด/>48 ชม. โดยไม่ประเมิน anticoagulation — เพราะเสี่ยง embolic stroke จากลิ่มใน atrium ส่งเข้าเฝ้าต่อได้เลย' }, t: 6 },
    { end: true },
  ],
};
