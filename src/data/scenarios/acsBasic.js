// เคส: Acute Coronary Syndrome (ACS) Algorithm — พื้นฐาน ไม่มี cardiac arrest
// จุดสอน: เจ็บหน้าอกสงสัย ACS ต้องได้ 12-lead ECG ภายใน 10 นาที ("time is muscle"),
//         Aspirin ต้องเคี้ยวไม่ใช่กลืน, เช็ค BP/RV infarct/PDE5 inhibitor ก่อนให้ Nitroglycerin,
//         O2 ให้เฉพาะ SpO2 ต่ำกว่า 90% หรือหายใจลำบาก, STEMI ชัดเจน = activate cath lab ทันที
//         ไม่ต้องรอ troponin ยืนยันก่อน
export const acsBasic = {
  id: 'acs-basic-01',
  title: 'ACS — เจ็บแน่นหน้าอกเฉียบพลัน',
  subtitle: 'ชายอายุ 55 ปี เจ็บแน่นหน้าอกร้าวไปแขนซ้าย เหงื่อแตก เดินมาโรงพยาบาลเอง รู้สึกตัวดีตลอด',
  level: 'basic',
  track: 'acs',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้ชายเดินมาที่เคาน์เตอร์เอง บอกว่า<span class="cbs-em">เจ็บแน่นหน้าอกมาก ร้าวไปแขนซ้าย</span> เหงื่อแตกทั้งตัวเลยค่ะ!' }, t: 5 },
    { inter: 'เจ็บหน้าอกเฉียบพลัน!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'คนไข้ยังรู้สึกตัวดี พูดคุยได้ พาเดินมาเอง — <span class="cbs-em">คุณคือหมอคนแรกที่ประเมิน</span> จำไว้ว่ากล้ามเนื้อหัวใจตายไปเรื่อยๆ ทุกนาทีที่ช้า' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน ABC + วัดสัญญาณชีพ + ให้นอนพักบนเตียง + ติด cardiac monitor และ O2 sat + เปิดเส้น IV', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'วัดแล้วค่ะ! BP 150/92, HR 108, SpO2 96% <span class="cbs-em">คนไข้ยังพูดรู้เรื่องดี</span> เปิด IV ได้แล้วค่ะ' }, t: 8 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'ติด monitor แล้วค่ะ — จังหวะเป็น <span class="cbs-em">sinus regular</span> มีชีพจรตลอด', fx: { rhythm: 'nsr' } }, t: 6 },
            ],
          },
          { tgt: 'AIRWAY', label: 'ใส่ท่อช่วยหายใจป้องกันไว้ก่อนเลย', ok: false, why: 'คนไข้รู้สึกตัวดี พูดคุยรู้เรื่อง ไม่มีข้อบ่งชี้ใส่ท่อช่วยหายใจ — ประเมิน ABC ธรรมดาก่อน' },
          { tgt: 'DRUG', label: 'ฉีดมอร์ฟีนระงับปวดทันทีก่อนอย่างอื่น', ok: false, why: 'มอร์ฟีนไม่ใช่ยาตัวแรก — ต้องประเมินสัญญาณชีพและเริ่ม ECG/aspirin ก่อนเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'เจ็บหน้าอกสงสัย ACS — สิ่งที่สำคัญที่สุดที่ต้องทำใน "10 นาทีแรก" คืออะไร',
        options: [
          {
            tgt: 'MONITOR', label: 'สั่ง 12-lead ECG ทันทีให้เสร็จภายใน 10 นาที พร้อมส่งเลือด troponin คู่ขนานโดยไม่ต้องรอผล', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'ECG กำลังปริ้นค่ะ! ส่งเลือด troponin คู่ไปด้วยแล้ว' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: '<span class="cbs-em">"Time is muscle"</span> — อย่ารอผล lab ก่อนดู ECG เด็ดขาด' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'รอผล troponin ก่อน ค่อยสั่ง 12-lead ECG', ok: false, worsen: true, why: 'ห้ามรอผลเลือดก่อนทำ ECG — เสียเวลาที่มีค่าที่สุดของกล้ามเนื้อหัวใจ' },
          { tgt: 'DRUG', label: 'ให้ Nitroglycerin ก่อน ค่อยดู ECG ทีหลัง', ok: false, why: 'ECG ต้องมาก่อนเสมอในนาทีแรก — เพื่อรู้ว่าเป็น STEMI หรือไม่ก่อนตัดสินใจเรื่องยา' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่มีประวัติแพ้ยาหรือเลือดออกง่าย — ยาตัวแรกที่ควรได้เร็วที่สุดคืออะไร',
        options: [
          {
            tgt: 'DRUG', label: 'Aspirin 160-325 mg ให้เคี้ยว (ไม่ใช่กลืนทั้งเม็ด)', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'คนไข้เคี้ยว aspirin แล้วค่ะ! <span class="cbs-em">ไม่มีประวัติแพ้ ASA หรือเลือดออกง่าย</span>' }, t: 8 }],
          },
          { tgt: 'DRUG', label: 'Aspirin 300 mg กลืนทั้งเม็ดกับน้ำ', ok: false, why: 'ต้องให้เคี้ยว ไม่ใช่กลืน — การเคี้ยวทำให้ดูดซึมเร็วกว่ามาก' },
          { tgt: 'DRUG', label: 'ให้ Clopidogrel แทน Aspirin เป็นตัวแรก', ok: false, why: 'Aspirin คือยาตัวแรกที่ต้องได้เร็วที่สุด — Clopidogrel ค่อยพิจารณาเพิ่มตามแผนรักษาต่อไป' },
        ],
      },
    },
    {
      choice: {
        q: 'SpO2 วัดได้ 96% คนไข้ไม่เหนื่อยหอบ — เรื่อง oxygen ควรทำอย่างไร',
        options: [
          {
            tgt: 'AIRWAY', label: 'ไม่ต้องให้ออกซิเจนเสริม เพราะ SpO2 ไม่ต่ำกว่า 90% และไม่มีอาการหายใจลำบาก — เฝ้าระวัง SpO2 ต่อเนื่อง', ok: true,
            then: [{ say: { who: 'nurse_mint', pose: 'talk', text: 'รับทราบค่ะ เฝ้า SpO2 ไว้ต่อเนื่อง ตอนนี้ยังปกติดี' }, t: 6 }],
          },
          { tgt: 'AIRWAY', label: 'ให้ oxygen mask high-flow 100% ทันทีเป็น routine ทุกราย', ok: false, why: 'แนวทางปัจจุบันไม่แนะนำให้ O2 เป็น routine ถ้า SpO2 ปกติ — ให้เฉพาะเมื่อ SpO2 ต่ำกว่า 90% หรือหายใจลำบากเท่านั้น' },
          { tgt: 'YOU', label: 'ให้ oxygen cannula 2 ลิตร/นาที เผื่อไว้ก่อนทุกคน', ok: false, why: 'เหตุผลเดียวกัน — SpO2 ปกติไม่จำเป็นต้องให้ O2 เสริม' },
        ],
      },
    },
    {
      choice: {
        q: 'คนไข้ยังเจ็บหน้าอกอยู่ พิจารณาให้ Nitroglycerin sublingual — ก่อนให้ต้องเช็คอะไรก่อน',
        options: [
          {
            tgt: 'DRUG', label: 'เช็ค BP ว่าไม่ต่ำ + ไม่ใช่ inferior MI/RV infarction + ไม่ได้ใช้ยากลุ่ม PDE5 inhibitor (เช่น sildenafil) มาใน 24-48 ชม. ก่อนให้ NTG SL', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'BP 142/88 ไม่ต่ำค่ะ ถามแล้วไม่ได้กินยาอะไรแบบนั้นมา ECG ก็ไม่เห็น inferior pattern' }, t: 8 },
              { say: { who: 'nurse_mint', pose: 'happy', text: 'ให้ NTG SL 1 เม็ดแล้วค่ะ <span class="cbs-em">คนไข้บอกปวดลดลง</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Nitroglycerin SL ทันทีโดยไม่ต้องเช็คอะไรก่อน', ok: false, worsen: true, why: 'ถ้าคนไข้เพิ่งใช้ PDE5 inhibitor หรือเป็น RV infarction การให้ NTG จะทำให้ความดันตกรุนแรงได้' },
          { tgt: 'DRUG', label: 'ให้ Nitroglycerin ทาง IV drip ขนาดสูงทันที', ok: false, why: 'เริ่มจาก sublingual ก่อนเสมอ ไม่ใช่เริ่มด้วย IV ขนาดสูงทันที' },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'panic', text: 'ผล 12-lead ECG ออกแล้วค่ะ! <span class="cbs-em">ST elevation ชัดเจนที่ II, III, aVF</span>!' }, t: 8 },
    { inter: 'STEMI!!', drama: 'red', t: 6 },
    { say: { who: 'att_dech', pose: 'stern', text: 'นี่คือ STEMI ชัดเจน — <span class="cbs-em">ตัดสินใจได้เลย ไม่ต้องรอใคร</span>' }, t: 5 },
    {
      choice: {
        q: 'พบ ST elevation ชัดเจน = STEMI — ทำอะไรต่อทันที',
        options: [
          {
            tgt: 'YOU', label: 'Activate cath lab ทันที พร้อมปรึกษา cardiology คู่ขนาน — ไม่ต้องรอผล troponin ยืนยันก่อน', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'happy', text: 'โทรแจ้ง cath lab แล้วค่ะ! ทีมกำลังเตรียมห้องสวนหัวใจ' }, t: 8 },
              { say: { who: 'att_dech', pose: 'happy', text: 'ถ้ายังปวดมากหลัง NTG ให้พิจารณา <span class="cbs-em">morphine ขนาดน้อยๆ อย่างระมัดระวัง</span> — ไม่ใช่ first-line แล้ว แต่ใช้ได้ถ้าจำเป็น' }, t: 6 },
              { inter: 'ACTIVATE CATH LAB!', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณวินิจฉัยเร็วและส่งต่อทันเวลา — <span class="cbs-em">"time is muscle" คือหัวใจของ ACS algorithm</span> คนไข้ได้ไป PCI ทันเวลาแล้ว' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'รอผล troponin ยืนยันก่อน ค่อย activate cath lab', ok: false, worsen: true, why: 'STEMI วินิจฉัยจาก ECG ได้เลย ไม่ต้องรอ troponin — การรอเสียเวลาทองของกล้ามเนื้อหัวใจ' },
          { tgt: 'DRUG', label: 'ให้ยาละลายลิ่มเลือดเองในห้องฉุกเฉินโดยไม่ปรึกษาใคร', ok: false, why: 'ต้องปรึกษา cardiology ควบคู่กันเสมอ — พิจารณา primary PCI เป็นหลักถ้าทำได้ทันเวลา' },
        ],
      },
    },
    { end: true },
  ],
};
