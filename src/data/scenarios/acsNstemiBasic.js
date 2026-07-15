// เคส: ACS — NSTEMI / Unstable Angina (พื้นฐาน) — เจ็บหน้าอกที่ "ไม่มี ST elevation"
// จุดสอน: ACS Algorithm แขนง NSTEMI/UA — ผู้ป่วยรู้สึกตัว มีชีพจรตลอด ไม่มี cardiac arrest
//         · 12-lead ECG ภายใน 10 นาที ("time is muscle" ใช้กับทุก ACS ไม่ใช่แค่ STEMI)
//         · ECG ไม่มี ST elevation (ST depression/T inversion หรือปกติ) → ไม่ใช่ STEMI
//         · ต่างจาก STEMI: "ไม่ activate cath lab ฉุกเฉินทันที" — เข้าสู่ NSTEMI/UA pathway
//           risk stratify (TIMI/GRACE), serial troponin, aspirin + ยาต้านเกล็ดเลือด/anticoagulant,
//           admit/monitor, ปรึกษา cardiology วางแผน invasive strategy (early ถ้า high-risk)
//         · ห้ามให้ fibrinolytics ใน NSTEMI · ค่า troponin เดียวปกติ ตัด ACS ไม่ได้
export const acsNstemiBasic = {
  id: 'acs-nstemi-basic-01',
  title: 'เจ็บหน้าอก — แต่จอ ECG ไม่มี ST ยก',
  subtitle: 'หญิงอายุ 64 ปี เจ็บแน่นหน้าอกร้าวลงแขนซ้าย ~40 นาที รู้สึกตัวดี ชีพจรเต้นชัดตลอด',
  level: 'basic',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'talk', text: 'อาจารย์คะ คนไข้หญิงเตียง 3 <span class="cbs-em">เจ็บแน่นหน้าอกร้าวลงแขนซ้าย ~40 นาที</span> ยังรู้สึกตัวดี พูดคุยได้ ชีพจรเต้นชัดค่ะ' }, t: 5 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เจ็บอกสงสัย ACS — คนไข้ยังไม่ arrest มีชีพจรอยู่ <span class="cbs-em">อย่าเพิ่งกระโดดไปที่ cath lab</span> เก็บข้อมูลให้ครบก่อน คุณคือ Team Leader เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + ติด monitor + เปิด IV + วัดสัญญาณชีพ (ให้ O₂ เฉพาะถ้า SpO₂ < 90%)', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ติด monitor แล้วค่ะ — <span class="cbs-em">sinus rhythm HR 88</span> BP 138/84, SpO₂ 97% ไม่ต้องให้ออกซิเจน IV เปิดได้แล้ว' }, t: 8, fx: { rhythm: 'nsr' } },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — คนไข้เจ็บอกแต่ยังเสถียร ต่อไปคือคำสั่งที่ "เปลี่ยนทุกอย่าง" ของเคส ACS' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ให้ออกซิเจน high-flow mask 10 LPM ทันทีทุกรายเจ็บอก', ok: false, why: 'SpO₂ 97% ปกติ — ให้ออกซิเจนแบบ routine เมื่อไม่มี hypoxia ไม่มีประโยชน์และอาจเพิ่ม vasoconstriction ให้เฉพาะเมื่อ SpO₂ < 90% หรือมีอาการเหนื่อย' },
          { tgt: 'DRUG', label: 'เจ็บอก ACS แน่ ๆ ฉีด fibrinolytic (thrombolytic) เลยกันเสียเวลา', ok: false, why: 'ยังไม่ได้ดู ECG ด้วยซ้ำ! และ fibrinolytic ห้ามใช้ใน ACS ที่ไม่ใช่ STEMI — ประเมิน + 12-lead ก่อนเสมอ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'คำสั่งที่สำคัญที่สุดในนาทีนี้',
        options: [
          {
            tgt: 'MONITOR', label: 'สั่ง 12-lead ECG ให้เสร็จภายใน 10 นาที', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ยิง 12-lead ภายใน 6 นาทีค่ะ! <span class="cbs-em">"Time is muscle"</span> กล้ามเนื้อหัวใจรอไม่ได้ กำลังส่งให้อาจารย์อ่าน' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — 12-lead ภายใน 10 นาทีคือหัวใจของ ACS ทุกแขนง ไม่ใช่แค่ STEMI ECG จะบอกว่าเราอยู่กิ่งไหนของ algorithm' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'ส่งเข้า cath lab ฉุกเฉินทันทีเลย ไม่ต้องรอ ECG', ok: false, why: 'ยังไม่รู้ว่าเป็น STEMI หรือไม่ — การ activate cath lab ฉุกเฉินสงวนไว้สำหรับ STEMI ต้องอ่าน 12-lead ก่อนถึงจะรู้ว่าเข้ากิ่งไหน', worsen: true },
          { tgt: 'AIRWAY', label: 'ใส่ท่อช่วยหายใจเตรียมไว้ก่อน กันคนไข้ทรุด', ok: false, why: 'คนไข้รู้สึกตัวดี หายใจเองปกติ SpO₂ 97% — ไม่มีข้อบ่งชี้ใส่ท่อ การ intubate โดยไม่จำเป็นมีแต่ความเสี่ยง' },
        ],
      },
    },
    {
      choice: {
        q: 'ECG ออกแล้ว — คุณอ่านว่าอย่างไร',
        options: [
          {
            tgt: 'MONITOR', label: 'ไม่มี ST elevation (เห็น ST depression / T inversion) → นี่ไม่ใช่ STEMI เข้ากิ่ง NSTEMI/UA', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'อ่านแม่นมาก — <span class="cbs-em">ไม่มี ST ยกตามเกณฑ์</span> มีแค่ ST depression/T inversion นี่คือ NSTEMI หรือ unstable angina ไม่ใช่ STEMI แผนจึงต่างกัน' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ทบทวน lead อื่นแล้วค่ะ ไม่มี ST elevation ที่ไหนเลย <span class="cbs-em">ไม่เข้าเกณฑ์ reperfusion ฉุกเฉิน</span>' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ไม่มี ST ยก = ตัด ACS ออกได้ ให้คนไข้กลับบ้าน', ok: false, why: 'ECG ปกติ/ไม่มี ST ยก ตัด ACS ไม่ได้ — NSTEMI/UA จำนวนมาก ECG ไม่ยก ต้องดู troponin เป็นชุดและสังเกตอาการต่อ', worsen: true },
          { tgt: 'YOU', label: 'มีเจ็บอก = STEMI activate cath lab ฉุกเฉินทันที', ok: false, why: 'สับสน STEMI vs NSTEMI — ไม่มี ST elevation จึงไม่เข้าเกณฑ์ STEMI การ activate cath lab ฉุกเฉินแบบ STEMI คือ over-treatment ในกิ่งนี้' },
        ],
      },
    },
    {
      choice: {
        q: 'ยาแรกที่ควรให้เร็วที่สุด (ถ้าไม่มีข้อห้าม)',
        options: [
          {
            tgt: 'DRUG', label: 'Aspirin 160–325 mg เคี้ยว ทันที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ให้ <span class="cbs-em">Aspirin 300 mg เคี้ยว</span> แล้วค่ะ คนไข้ไม่มีประวัติแพ้ ไม่มีเลือดออก' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูก — aspirin ให้เร็วเหมือนกันทั้ง STEMI และ NSTEMI/UA เป็นเสาหลักของ ACS ทุกกิ่ง' }, t: 4 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ fibrinolytic (thrombolytic) เพราะเป็น ACS', ok: false, why: 'NSTEMI/UA ห้ามให้ fibrinolytic — ไม่มีข้อบ่งชี้และเพิ่มความเสี่ยงเลือดออกโดยไม่มีประโยชน์ (ต่างจาก STEMI ที่ไม่มี PCI ซึ่งพิจารณาได้)', worsen: true },
          { tgt: 'DRUG', label: 'อมยา Nitroglycerin ใต้ลิ้นเลย โดยยังไม่ดู BP/RV/ยา PDE5', ok: false, why: 'ต้องเช็ค BP, RV infarction และประวัติยากลุ่ม PDE5 (sildenafil ฯลฯ) ก่อน — ให้ nitrate ทั้งที่ความดันต่ำ/RV infarct/เพิ่งใช้ PDE5 ทำให้ความดันตกรุนแรง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'จัดการ NSTEMI/UA ต่อ — ทำอะไร',
        options: [
          {
            tgt: 'DRUG', label: 'ส่ง serial troponin, พิจารณายาต้านเกล็ดเลือดตัวที่สอง + anticoagulant ตามแนวทาง, nitroglycerin สำหรับเจ็บอก (หลังเช็ค BP/RV/PDE5), admit monitor', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'ส่ง troponin ครั้งแรกแล้วค่ะ นัดซ้ำเป็นชุด <span class="cbs-em">BP/RV/PDE5 เช็คผ่าน</span> เริ่ม nitrate อาการเจ็บทุเลาลง เตรียมยาต้านเกล็ดเลือด/anticoagulant รอปรึกษา' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ครบถ้วน — <span class="cbs-em">serial troponin</span> สำคัญมาก ค่าเดียวปกติตัด ACS ไม่ได้ ต้องดูแนวโน้ม รับไว้ใน monitor เฝ้าอาการต่อ' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'troponin ครั้งแรกปกติ → ให้คนไข้กลับบ้านได้', ok: false, why: 'ค่า troponin เดียวปกติตัด ACS ไม่ได้ — ต้องส่งเป็นชุด (serial) และสังเกตอาการ NSTEMI/UA จำนวนมาก troponin แรกยังไม่ขึ้น การปล่อยกลับบ้านตอนนี้อันตราย', worsen: true },
          { tgt: 'DRUG', label: 'ให้ fibrinolytic + activate cath lab ฉุกเฉินให้ครบชุดแบบ STEMI', ok: false, why: 'นี่คือ NSTEMI/UA ไม่ใช่ STEMI — fibrinolytic ไม่มีข้อบ่งชี้และเพิ่มอันตราย ส่วน cath lab ทำตาม risk stratification ไม่ใช่ฉุกเฉินทันทีแบบ STEMI', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ตัดสินใจเรื่อง invasive strategy',
        options: [
          {
            tgt: 'YOU', label: 'ทำ risk stratification (TIMI/GRACE) + ปรึกษา cardiology — high-risk พิจารณา early invasive (~ภายใน 24 ชม.)', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'stern', text: 'นี่คือหัวใจของกิ่ง NSTEMI — <span class="cbs-em">ไม่ activate cath lab ทันทีแบบ STEMI</span> แต่ประเมินความเสี่ยงก่อน ยิ่ง high-risk (troponin ขึ้น, ECG เปลี่ยน, คะแนนสูง) ยิ่งควร invasive เร็ว' }, t: 6 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ปรึกษา cardiology แล้วค่ะ ประเมินเป็น high-risk วางแผน <span class="cbs-em">early invasive ภายใน 24 ชม.</span> คนไข้ยังเสถียร อาการดีขึ้น' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'activate cath lab ฉุกเฉินเดี๋ยวนี้เหมือน STEMI ทุกราย', ok: false, why: 'ไม่มี ST elevation จึงไม่เข้าเกณฑ์ activate ฉุกเฉินแบบ STEMI — NSTEMI ใช้ risk stratification กำหนดจังหวะ invasive (early ถ้า high-risk) ไม่ใช่วิ่งเข้า cath lab ทันทีทุกราย' },
          { tgt: 'DRUG', label: 'ให้ fibrinolytic ปิดท้ายให้ครบ กัน STEMI ที่อาจซ่อนอยู่', ok: false, why: 'ไม่มีข้อบ่งชี้ — 12-lead ไม่มี ST elevation การให้ fibrinolytic ใน NSTEMI เพิ่มความเสี่ยงเลือดออกโดยไม่มีประโยชน์ ถ้าสงสัยเปลี่ยนแปลงให้ทำ ECG ซ้ำ ไม่ใช่ให้ยาละลายลิ่มเลือด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'สรุปเคส — จะจัดการต่ออย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'คนไข้ได้ aspirin + ยาตามแนวทาง, serial troponin, เสถียร → ADMIT — ACS PATHWAY / ส่งต่อ CCU ตามแผน cardiology', ok: true,
            then: [
              { inter: 'ADMIT — ACS PATHWAY', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">แยก NSTEMI/UA ออกจาก STEMI ได้ถูก</span> — 12-lead เร็ว, ไม่มี ST ยก จึงไม่วิ่ง cath lab ฉุกเฉิน แต่ให้ aspirin, serial troponin, ยาตามแนวทาง, risk stratify แล้วปรึกษา cardiology วางแผน early invasive เคสนี้เป็นของคุณ' }, t: 6 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ท่อช่วยหายใจก่อนย้าย เผื่อคนไข้ทรุดระหว่างทาง', ok: false, why: 'คนไข้รู้สึกตัวดี หายใจเองปกติ SpO₂ ปกติ — ไม่มีข้อบ่งชี้ intubate การใส่ท่อโดยไม่จำเป็นเพิ่มภาวะแทรกซ้อน' },
          { tgt: 'DRUG', label: 'ให้ fibrinolytic 1 โดสปิดท้ายให้ชัวร์ก่อนส่ง CCU', ok: false, why: 'NSTEMI/UA ไม่มีข้อบ่งชี้ fibrinolytic — เพิ่มความเสี่ยงเลือดออกโดยไม่มีประโยชน์ ส่งต่อตามแผน cardiology ก็เพียงพอ', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
