// เคส: Basilar / Posterior Circulation Stroke (megacode) — FAST หลอกตา
// จุดสอน: posterior stroke อาจ FAST-negative (แขนขาแรงปกติ) · Dizziness + Diplopia + Dysarthria + Ataxia
//         = สงสัย posterior circulation · อย่าวินิจฉัย "เวียนหัวบ้านหมุน" ง่ายๆ ในคนมี vascular risk ·
//         posterior fossa CT มักปกติช่วงแรก — ใน window + ไม่มีข้อห้าม ก็ยังให้ tPA · basilar ไม่รักษาอัตราตายสูงมาก
export const strokeBasilar = {
  id: 'stroke-basilar-01',
  title: 'FAST ปกติแต่กำลังจะแย่ — Basilar Stroke',
  subtitle: 'หญิงอายุ 62 ปี ความดันสูง AF ไม่กินยา — เวียนหัวรุนแรงฉับพลัน เห็นภาพซ้อน เดินเซล้ม 1.5 ชั่วโมงก่อน',
  level: 'megacode',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'talk', text: 'อาจารย์คะ หญิง 62 ปี <span class="cbs-em">เวียนหัวรุนแรงฉับพลัน + เห็นภาพซ้อน + พูดอ้อแอ้ + เดินเซล้ม</span> 1.5 ชั่วโมงก่อน — BP 172/94 HR 88 ไม่สม่ำเสมอ SpO₂ 96% แต่<span class="cbs-em">แขนขาแรงปกติทั้งสองข้าง</span>ค่ะ' }, t: 7, fx: { rhythm: 'nsr' } },
    { say: { who: 'boy_compressor', pose: 'talk', text: 'เวรก่อนหน้าเกือบจ่ายยาแก้เวียนหัวแล้วให้กลับบ้านครับ — บอกว่า "น่าจะน้ำในหูไม่เท่ากัน"' }, t: 5 },
    { say: { who: 'att_dech', pose: 'stern', text: 'หยุดตรงนั้นก่อน — ประวัติ HT + AF ไม่กินยา แล้วอาการมา<span class="cbs-em">ฉับพลันเป็นชุด</span>แบบนี้… คุณคิดยังไง Leader' }, t: 5 },
    {
      choice: {
        q: 'อ่านภาพเคสนี้',
        options: [
          {
            tgt: 'YOU', label: 'Vertigo + Diplopia + Dysarthria + Ataxia ฉับพลัน = สงสัย posterior circulation stroke จนกว่าจะพิสูจน์ได้ว่าไม่ใช่', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'ใช่ — สมองส่วนหลัง (brainstem/cerebellum) ไม่ได้คุมแค่แขนขา มันคุม<span class="cbs-em">การทรงตัว สายตา การพูด การกลืน… และการหายใจ</span> อาการชุดนี้คือเสียงเตือนของมัน' }, t: 7 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ยาแก้เวียนหัว + ยาแก้อาเจียน สังเกตอาการ 2 ชั่วโมง', ok: false, why: 'นี่คือกับดักคลาสสิก — basilar stroke ที่ถูกวินิจฉัยเป็น "เวียนหัวธรรมดา" มีอัตราตายสูงมาก ยาแก้เวียนหัวแค่กลบเสียงเตือน', worsen: true },
          { tgt: 'MONITOR', label: 'FAST ปกติ (แขนขาแรงดี) = ตัด stroke ออกได้', ok: false, why: 'FAST ออกแบบมาจับ anterior circulation — posterior stroke แขนขามักแรงปกติ FAST-negative ไม่เท่ากับไม่ใช่ stroke', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ประเมินเพิ่ม',
        options: [
          {
            tgt: 'YOU', label: 'FAST + ตรวจ cerebellar signs + เช็ค DTX', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'FAST: Face ปกติ Arms ปกติ <span class="cbs-em">Speech อ้อแอ้ (dysarthria)</span> — nystagmus ชัด finger-to-nose เซทั้งสองข้าง — DTX 142 ปกติค่ะ' }, t: 9 },
              { say: { who: 'att_dech', pose: 'stern', text: 'FAST เกือบปกติแต่ cerebellar signs เพียบ — <span class="cbs-em">posterior circulation จนกว่าภาพจะบอกอย่างอื่น</span> เดินเครื่องเต็มสูบ' }, t: 6 },
            ],
          },
          { tgt: 'LAB', label: 'ส่งตรวจการได้ยิน + ปรึกษา ENT เรื่องน้ำในหู', ok: false, why: 'ผิดทิศ — ในคนที่มี vascular risk เต็มตัว ต้องตัด stroke ก่อนเสมอ ENT ไว้ทีหลังถ้าภาพสมองปกติจริง', worsen: true },
          { tgt: 'DRUG', label: 'เปิด IV ให้น้ำเกลือ อาการน่าจะดีขึ้นเอง', ok: false, why: 'น้ำเกลือไม่ละลายลิ่มเลือด — ทุก 15 นาทีที่เสียไปคือ window ของ tPA ที่หดลง' },
        ],
      },
    },
    {
      choice: {
        q: 'Imaging',
        options: [
          {
            tgt: 'CT', label: 'NIHSS + CT Brain ด่วน (onset 1.5 ชม. — ยังอยู่ใน window!)', ok: true,
            then: [
              { skip: '— CT ด่วน —', t: 8 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'NIHSS = <span class="cbs-em">8</span> — CT Brain: <span class="cbs-em">ไม่มี hemorrhage</span> ค่ะ… แต่ posterior fossa ดูปกติ ไม่เห็นรอย infarct ชัดค่ะ' }, t: 8 },
            ],
          },
          { tgt: 'MONITOR', label: 'รอดูอาการถึงเที่ยงก่อน ค่อยตัดสินใจส่งภาพ', ok: false, why: 'Onset 1.5 ชม. คือ "ยังทัน" — การรอคือการเลือกให้หลุด window ทั้งที่ผู้ป่วยมาเร็ว', worsen: true },
          { tgt: 'CT', label: 'ขอ MRI ก่อนเพราะ posterior fossa ดูยากใน CT', ok: false, why: 'จริงที่ MRI ไวกว่าใน posterior fossa แต่ถ้าคิว MRI ทำให้เกิน window = แพ้ทั้งกระดาน — CT ตัด hemorrhage ก่อนแล้วเดินหน้าได้เลย' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'CT ไม่มีเลือดออก แต่ก็<span class="cbs-em">ไม่เห็น infarct</span>… หมอบางคนจะบอกว่า "ภาพปกติ ไม่ใช่ stroke มั้ง" — คุณล่ะ?' }, t: 5 },
    {
      choice: {
        q: 'CT ไม่เห็นรอยโรค — แปลว่าอะไร',
        options: [
          {
            tgt: 'YOU', label: 'Posterior fossa มัก CT ปกติช่วงแรก — clinical ชัด + ไม่มีเลือดออก + ใน window = เดินหน้ารักษา', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'ถูกต้อง — CT ช่วงแรกไวต่อ infarct หลังแค่บางส่วน หน้าที่หลักของมันในเคสนี้คือ<span class="cbs-em">ตัด hemorrhage เพื่อเปิดทาง tPA</span> ซึ่งมันทำแล้ว' }, t: 7 },
            ],
          },
          { tgt: 'MONITOR', label: 'ภาพปกติ = ไม่ใช่ stroke ให้กลับบ้านพร้อมยาแก้เวียนหัว', ok: false, why: 'CT ปกติช่วงแรกคือเรื่อง "ปกติ" ของ posterior stroke — ปล่อยกลับตอนนี้ผู้ป่วยอาจกลับมาด้วย locked-in syndrome หรือไม่กลับมาเลย', worsen: true },
          { tgt: 'LAB', label: 'ส่ง lumbar puncture หาสาเหตุอื่นก่อน', ok: false, why: 'ไม่มีข้อบ่งชี้ LP ในภาพนี้ — มีแต่จะเผาเวลาใน window ที่เหลืออยู่', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ตัดสินใจการรักษา',
        options: [
          {
            tgt: 'DRUG', label: 'ทบทวนเกณฑ์ — ใน 4.5 ชม. + ไม่มีข้อห้าม → ให้ tPA (Alteplase 0.9 mg/kg)', ok: true,
            then: [
              { inter: 'tPA — GO!', drama: 'red', t: 5 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Alteplase เดินแล้วค่ะ — <span class="cbs-em">Door-to-Needle 52 นาที</span> bolus แล้ว drip 60 นาทีต่อค่ะ' }, t: 7 },
            ],
          },
          { tgt: 'DRUG', label: 'อาการไม่หนัก (NIHSS 8) — aspirin พอ ไม่ต้องเสี่ยง tPA', ok: false, why: 'Basilar circulation คือก้านสมอง — "ไม่หนักตอนนี้" กลายเป็น locked-in ได้ในไม่กี่ชั่วโมง เข้าเกณฑ์ tPA ต้องให้', worsen: true },
          { tgt: 'MONITOR', label: 'ปรึกษา neuro แล้วรอทีมมาดูพรุ่งนี้เช้า', ok: false, why: 'ปรึกษาได้แต่ห้ามรอ — window เดินไม่หยุด และ basilar occlusion ที่ไม่ rx อัตราตายสูงมาก', worsen: true },
        ],
      },
    },
    { skip: '— tPA drip · ส่ง CTA/MRA ต่อ —', t: 10 },
    { say: { who: 'fon_defib', pose: 'talk', text: 'MRA ยืนยัน: <span class="cbs-em">Basilar artery stenosis with partial occlusion</span> — บนเตียง dysarthria เริ่มลดลง เดินเซน้อยลงค่ะ!' }, t: 7 },
    {
      choice: {
        q: 'หลัง tPA — คำสั่งเฝ้าระวัง',
        options: [
          {
            tgt: 'MONITOR', label: 'Monitor BP q15min + neuro check ใกล้ชิด — แย่ลงเมื่อไหร่พิจารณา thrombectomy ทันที', ok: true,
            then: [
              { inter: 'BASILAR — CAUGHT IN TIME!', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เคสที่เกือบถูกส่งกลับบ้านพร้อมยาแก้เวียนหัว — <span class="cbs-em">FAST ปกติไม่ได้แปลว่าปลอดภัย จำ 4D: Dizziness, Diplopia, Dysarthria, Ataxia (เดินเซ)</span> ความสงสัยของคุณวันนี้คือเส้นแบ่งระหว่างเดินกลับบ้านกับ locked-in' }, t: 8 },
            ],
          },
          { tgt: 'YOU', label: 'อาการดีขึ้นแล้ว ถือว่าปิดเคส ส่ง ward ได้', ok: false, why: 'Basilar stroke แย่ลงเร็วและร้ายแรงที่สุดในบรรดา stroke — หลัง tPA ต้องเฝ้าใกล้ชิดพร้อมแผนสำรอง thrombectomy เสมอ', worsen: true },
          { tgt: 'DRUG', label: 'เริ่ม heparin drip ควบคู่กัน stenosis จะได้ไม่ตันซ้ำ', ok: false, why: 'ห้าม anticoagulant ภายใน 24 ชม.หลัง tPA — เสี่ยงเลือดออกในก้านสมองซึ่งไม่มีพื้นที่ให้ผิดพลาดเลย', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
