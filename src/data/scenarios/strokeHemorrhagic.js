// เคส: Hemorrhagic Stroke (ปานกลาง) — เลือดออกในสมอง ห้าม tPA เด็ดขาด
// จุดสอน: ปวดหัวรุนแรงฉับพลัน + อาเจียน + BP สูงมาก = ธงแดง ICH · CT คือตัวตัดสิน ischemic/hemorrhagic ·
//         ICH = ห้าม tPA/antiplatelet · ลด SBP เป้า ~140 (nicardipine) · ปรึกษา neurosurgery + ยกหัวเตียง 30° เฝ้า herniation
export const strokeHemorrhagic = {
  id: 'stroke-hemorrhagic-01',
  title: 'ปวดหัวแตกฉับพลัน — Hemorrhagic Stroke',
  subtitle: 'หญิงอายุ 72 ปี ความดันสูงไม่คุมยา ปวดหัวรุนแรงฉับพลัน อาเจียน แขนขาซ้ายอ่อนแรง 45 นาทีก่อน',
  level: 'intermediate',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! หญิง 72 ปี <span class="cbs-em">ปวดหัวรุนแรงฉับพลัน + อาเจียน + แขนขาซ้ายอ่อนแรง</span> 45 นาทีก่อนค่ะ — BP <span class="cbs-em">210/120</span>! HR 92 GCS 13 ซึมลงเรื่อยๆ' }, t: 6, fx: { rhythm: 'nsr' } },
    { inter: 'STROKE ALERT!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ปวดหัวแบบ "ฟ้าผ่า" + อาเจียน + ความดันทะลุ 200… ภาพนี้กระซิบอะไรบางอย่าง — แต่<span class="cbs-em">อย่าเพิ่งข้ามขั้นตอน</span> Leader' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน FAST + เช็ค DTX + จับเวลา onset', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'FAST: <span class="cbs-em">หน้าเบี้ยวซ้าย + แขนซ้ายตก + พูดอ้อแอ้</span> — DTX 110 ปกติ onset 45 นาทีค่ะ' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'onset 45 นาที ใน window — เตรียม tPA เลยจะได้ไม่เสียเวลา', ok: false, why: 'ธงแดง ICH เต็มไปหมด (ปวดหัวฟ้าผ่า อาเจียน BP 210/120) — ถ้าเป็นเลือดออกแล้วให้ tPA คือหายนะ ต้อง CT ตัดสินก่อนเท่านั้น', worsen: true },
          { tgt: 'DRUG', label: 'ลด BP ลงให้เป็นปกติ 120/80 ก่อนทำอย่างอื่น', ok: false, why: 'ยังไม่รู้ชนิด stroke — ลดความดันฮวบตอนนี้อาจตัดเลือดเลี้ยงสมองส่วนที่เหลือ ประเมิน + CT ก่อนแล้วค่อยตั้งเป้า BP ตามชนิด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ขั้นต่อไป',
        options: [
          {
            tgt: 'CT', label: 'NIHSS + CT Brain ด่วนที่สุด', ok: true,
            then: [
              { skip: '— เข็นเข้า CT ด่วน —', t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'NIHSS = <span class="cbs-em">18 (Severe)</span> — CT: <span class="cbs-em">Intracerebral hemorrhage ที่ basal ganglia ขนาด 3 ซม.</span> ค่ะอาจารย์!' }, t: 8 },
              { inter: 'HEMORRHAGE!!', drama: 'red', t: 0 },
            ],
          },
          { tgt: 'LAB', label: 'รอผล coag ก่อนค่อยส่ง CT', ok: false, why: 'ผลเลือดห้ามถ่วง CT — คนไข้ซึมลงเรื่อยๆ ทุกนาทีที่รอ เลือดในสมองอาจกำลังขยาย', worsen: true },
          { tgt: 'MONITOR', label: 'ให้ยาแก้ปวด+แก้อาเจียนก่อน อาการดีขึ้นค่อยไป CT', ok: false, why: 'ยาแก้ปวดไม่ได้รักษาสาเหตุและอาจกดระดับความรู้สึกตัวจนประเมิน GCS ไม่ได้ — CT คือคำตอบเดียวที่บอกว่าในหัวเกิดอะไรขึ้น' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ICH ยืนยัน — ทีนี้คำถามข้อสอบ: <span class="cbs-em">tPA อยู่ตรงไหนของเคสนี้?</span>' }, t: 4 },
    {
      choice: {
        q: 'บทบาทของ tPA ในเคสนี้',
        options: [
          {
            tgt: 'YOU', label: 'ห้ามเด็ดขาด — hemorrhage คือ absolute contraindication ทั้ง tPA และ antiplatelet', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'ถูกต้อง — เลือดออกอยู่แล้วเติมยาละลายลิ่มเลือด = <span class="cbs-em">เร่งให้เลือดออกจนสมองถูกกดทับ</span> เส้นแบ่งชีวิตของเคสนี้คือ CT ที่คุณเพิ่งส่งไป' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ tPA ขนาดต่ำ เพราะยังอยู่ใน window', ok: false, why: '"Window" ใช้กับ ischemic เท่านั้น — hemorrhage ไม่มี window มีแต่ข้อห้าม ให้เมื่อไหร่เลือดออกขยายเมื่อนั้น', worsen: true },
          { tgt: 'DRUG', label: 'งด tPA แต่ให้ Aspirin แทนพอประมาณ', ok: false, why: 'Antiplatelet ก็ห้ามเช่นกัน — ทุกอย่างที่ขัดขวางการแข็งตัวของเลือดคือศัตรูของเคส ICH', worsen: true },
        ],
      },
    },
    { say: { who: 'nurse_mint', pose: 'panic', text: 'BP ยัง <span class="cbs-em">205/118</span> ค่ะอาจารย์ — ผู้ป่วยซึมลงอีก GCS 12!' }, t: 5 },
    {
      choice: {
        q: 'จัดการความดันใน ICH',
        options: [
          {
            tgt: 'DRUG', label: 'Nicardipine drip — ลด SBP ลงเป้า ~140 แบบคุมได้', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Nicardipine drip เดินแล้วค่ะ — SBP ค่อยๆ ลง <span class="cbs-em">185 → 162 → 145</span> ตามเป้า' }, t: 8 },
            ],
          },
          { tgt: 'MONITOR', label: 'ปล่อย BP สูงไว้ สมองจะได้มีเลือดไปเลี้ยง', ok: false, why: 'ใน ICH ความดันที่สูงมากคือแรงดันที่ดันให้เลือดออกขยายตัว — ต้องลดแบบคุมได้ เป้า SBP ~140', worsen: true },
          { tgt: 'DRUG', label: 'ยาลดความดันใต้ลิ้นออกฤทธิ์แรงเร็ว ให้เลย', ok: false, why: 'ยาใต้ลิ้นออกฤทธิ์แบบคุมไม่ได้ — BP ดิ่งเกินเป้าแล้วดึงกลับไม่ได้ ใน ICH ต้องใช้ drip ที่ไต่ระดับได้ทีละนิด', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'จัดการต่อเนื่อง',
        options: [
          {
            tgt: 'YOU', label: 'ปรึกษา Neurosurgery ด่วน + ยกหัวเตียง 30° + ทบทวนยา reverse anticoagulation', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'Neurosurgery รับทราบ กำลังลงมาครับ — ยกหัวเตียง 30° แล้ว ญาติยืนยัน<span class="cbs-em">ไม่ได้กินยากันเลือดแข็ง</span>ครับ' }, t: 8 },
            ],
          },
          { tgt: 'MONITOR', label: 'BP ลงแล้ว ส่งขึ้น ward สามัญรอเตียงว่าง', ok: false, why: 'ICH 3 ซม. + GCS ที่ยังไหลลง = เสี่ยง herniation ได้ทุกชั่วโมง — ต้องอยู่ที่ที่เฝ้า neuro ใกล้ชิดและผ่าตัดได้ทันที', worsen: true },
          { tgt: 'DRUG', label: 'ให้ Vitamin K + FFP ทันทีทุกราย', ok: false, why: 'Reverse ใช้เมื่อมี anticoagulant อยู่ในตัว — ต้องเช็คประวัติยา/ค่า coag ก่อน ให้พร่ำเพรื่อคือความเสี่ยงและเสียเวลา' },
        ],
      },
    },
    {
      choice: {
        q: 'คำสั่งเฝ้าระวังสุดท้าย',
        options: [
          {
            tgt: 'MONITOR', label: 'เฝ้า GCS/pupil ใกล้ชิดทุก 15 นาที — สัญญาณ herniation เมื่อไหร่แจ้งทันที', ok: true,
            then: [
              { inter: 'ICH — CONTAINED', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'คุมเกมได้ครบ — <span class="cbs-em">CT ก่อนยาเสมอ · ICH ห้าม tPA/antiplatelet · SBP เป้า ~140 แบบ drip · neurosurgery + เฝ้า herniation</span> เคสนี้แพ้ชนะกันที่วินัย ไม่ใช่ความเร็วอย่างเดียว' }, t: 7 },
            ],
          },
          { tgt: 'YOU', label: 'อาการนิ่งแล้ว ลดความถี่การประเมินเหลือทุก 4 ชั่วโมง', ok: false, why: 'ICH แย่ลงเร็วและเงียบ — ช่วงแรกต้องประเมินถี่ระดับ 15 นาที การ "นิ่ง" ชั่วคราวไม่ใช่หลักประกัน', worsen: true },
          { tgt: 'DRUG', label: 'ให้ยากล่อมประสาทให้หลับลึกจะได้พักสมอง', ok: false, why: 'กดระดับความรู้สึกตัว = ปิดตาตัวเองจากสัญญาณ herniation — GCS คือเครื่องมือเฝ้าระวังหลักของเคสนี้', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
