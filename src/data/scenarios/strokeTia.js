// เคส: TIA (ปานกลาง) — อาการหายเองก่อนถึงโรงพยาบาล แต่ห้ามชะล่าใจ
// จุดสอน: TIA = warning stroke ต้อง workup เต็มรูปแบบเหมือน stroke · DTX/NIHSS/CT ครบแม้อาการหาย ·
//         ABCD² ประเมินความเสี่ยง stroke ใน 48 ชม. · คะแนนสูง → admit + หา AF/carotid + เริ่ม antiplatelet
export const strokeTia = {
  id: 'stroke-tia-01',
  title: 'อาการหายก่อนถึงมือหมอ — TIA',
  subtitle: 'ชายอายุ 68 ปี ความดันสูง เบาหวาน สูบบุหรี่ — แขนซ้ายอ่อนแรง พูดไม่ชัด ~20 นาทีแล้วหายเอง',
  level: 'intermediate',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'talk', text: 'อาจารย์คะ ชาย 68 ปี ญาติเล่าว่า 1 ชั่วโมงก่อน <span class="cbs-em">แขนซ้ายอ่อนแรง + พูดไม่ชัด อยู่ ~20 นาทีแล้วหายเอง</span> — ตอนนี้อาการ<span class="cbs-em">ปกติทุกอย่าง</span>ค่ะ BP 158/90 HR 84 SpO₂ 98%' }, t: 6, fx: { rhythm: 'nsr' } },
    { say: { who: 'boy_compressor', pose: 'talk', text: 'คนไข้บอก "หายแล้วหมอ กลับบ้านได้ยัง" ครับ ญาติก็อยากพากลับแล้ว…' }, t: 5 },
    { say: { who: 'att_dech', pose: 'stern', text: 'นี่แหละจุดที่หมอหลายคนพลาด — อาการหายสนิทต่อหน้าต่อตา <span class="cbs-em">คุณจะทำยังไง Leader?</span>' }, t: 5 },
    {
      choice: {
        q: 'ผู้ป่วยอาการหายแล้ว — คำสั่งของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'Workup เต็มรูปแบบเหมือน stroke — เริ่มจาก FAST + ซักประวัติละเอียด', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'FAST: <span class="cbs-em">ปกติทั้งหมด</span>ค่ะ — แต่ประวัติจากญาติชัดเจนว่ามี focal deficit จริง ~20 นาที' }, t: 8 },
              { say: { who: 'att_dech', pose: 'talk', text: 'อาการชั่วคราวแบบนี้คือ <span class="cbs-em">TIA — "warning stroke"</span> ธรรมชาติส่งคำเตือนมาแล้ว อยู่ที่เราจะฟังไหม' }, t: 5 },
            ],
          },
          { tgt: 'MONITOR', label: 'ให้กลับบ้าน นัด OPD สัปดาห์หน้า', ok: false, why: 'TIA คือสัญญาณเตือน stroke ตัวจริง — ความเสี่ยงสูงสุดคือ 48 ชั่วโมงแรก ปล่อยกลับคืนนี้อาจกลับมาด้วย stroke เต็มตัว', worsen: true },
          { tgt: 'DRUG', label: 'อาการเคยเป็น stroke — ให้ tPA เลยตอนนี้', ok: false, why: 'tPA ให้เมื่อ "ยังมี deficit และอยู่ใน window" — อาการหายสนิทแล้วไม่มีอะไรให้ละลาย มีแต่ความเสี่ยงเลือดออกฟรีๆ', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'สิ่งแรกที่ต้องตัดออก',
        options: [
          {
            tgt: 'LAB', label: 'เช็ค DTX — hypoglycemia ก็ทำ transient deficit ได้', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'DTX = <span class="cbs-em">118 mg/dL ปกติ</span>ค่ะ — ไม่ใช่น้ำตาลต่ำ' }, t: 7 },
            ],
          },
          { tgt: 'CT', label: 'ข้าม DTX ได้ เพราะอาการหายแล้ว', ok: false, why: 'Hypoglycemia ทำ deficit ชั่วคราวที่ "หายเอง" ได้เหมือน TIA เป๊ะ — DTX ยิ่งจำเป็นในเคสอาการหาย ไม่ใช่ยิ่งข้ามได้' },
          { tgt: 'DRUG', label: 'เริ่ม Aspirin ทันทีก่อนตรวจอะไรทั้งนั้น', ok: false, why: 'ยังไม่ได้ CT — ถ้า deficit ชั่วคราวนั้นเกิดจากเลือดออกเล็กๆ aspirin จะซ้ำเติม ลำดับคือ ตรวจก่อน ยาทีหลัง' },
        ],
      },
    },
    {
      choice: {
        q: 'ประเมินเชิง objective',
        options: [
          {
            tgt: 'YOU', label: 'NIHSS เต็มรูปแบบ — บันทึกเป็น baseline เผื่ออาการกลับมา', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'NIHSS = <span class="cbs-em">0</span> ค่ะ — บันทึกไว้เป็น baseline แล้ว ถ้ามีอะไรเปลี่ยนเทียบได้ทันที' }, t: 8 },
            ],
          },
          { tgt: 'MONITOR', label: 'FAST ปกติแล้ว NIHSS ไม่จำเป็น', ok: false, why: 'NIHSS ละเอียดกว่า FAST มากและเป็น baseline ทางกฎหมาย/ทางคลินิก — ถ้าตี 3 คืนนี้อาการกลับมา คุณจะรู้ทันทีว่าแย่ลงแค่ไหน' },
          { tgt: 'LAB', label: 'ส่งตรวจเลือดครบชุดแล้วรอผลก่อนทำอย่างอื่น', ok: false, why: 'Lab ส่งคู่ขนานได้ แต่ไม่ใช่ตัวแทนการประเมินระบบประสาท — NIHSS ทำได้เดี๋ยวนี้ข้างเตียง' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'NIHSS 0, DTX ปกติ — จะเรียกว่า TIA ได้เต็มปาก <span class="cbs-em">ยังขาดอีกหนึ่งชิ้น</span>' }, t: 4 },
    {
      choice: {
        q: 'ชิ้นสุดท้ายก่อนวินิจฉัย TIA',
        options: [
          {
            tgt: 'CT', label: 'CT Brain — TIA วินิจฉัยได้ต่อเมื่อ imaging ไม่พบ infarct', ok: true,
            then: [
              { skip: '— ส่ง CT Brain —', t: 8 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'CT Brain: <span class="cbs-em">ปกติ ไม่มี infarct ไม่มี hemorrhage</span> ค่ะ — เข้าได้กับ TIA' }, t: 7 },
            ],
          },
          { tgt: 'YOU', label: 'ประวัติ + NIHSS 0 พอแล้ว วินิจฉัย TIA ได้เลย', ok: false, why: 'ถ้า imaging พบ infarct จริง นั่นคือ stroke ไม่ใช่ TIA — การรักษาและความเร่งด่วนต่างกัน ต้องมีภาพยืนยัน' },
          { tgt: 'MONITOR', label: 'นัดมา CT พรุ่งนี้เช้าแบบ OPD', ok: false, why: 'ความเสี่ยง stroke สูงสุดคือ 24–48 ชม.แรก — การประเมินต้องจบวันนี้ ไม่ใช่แยกย้ายแล้วค่อยมาต่อ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'CT ปกติ → TIA ยืนยัน ทีนี้ตอบผมสิ — <span class="cbs-em">ความเสี่ยงที่เขาจะเป็น stroke จริงใน 48 ชั่วโมง ประเมินด้วยอะไร?</span>' }, t: 5 },
    {
      choice: {
        q: 'ประเมินความเสี่ยงหลัง TIA',
        options: [
          {
            tgt: 'YOU', label: 'ABCD² score — Age, BP, Clinical, Duration, DM', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คิดแล้วค่ะ: อายุ≥60 (1) + BP≥140/90 (1) + อ่อนแรงครึ่งซีก (2) + นาน≥10นาที (1) + DM (1) = <span class="cbs-em">ABCD² = 6 — High risk!</span>' }, t: 8 },
              { inter: 'HIGH RISK!!', drama: 'red', t: 0 },
            ],
          },
          { tgt: 'LAB', label: 'ดูจากผลเลือดอย่างเดียวพอ', ok: false, why: 'ไม่มีค่าเลือดตัวไหนพยากรณ์ stroke หลัง TIA ได้ — เครื่องมือมาตรฐานคือ ABCD² ที่รวมอายุ ความดัน อาการ ระยะเวลา และเบาหวาน' },
          { tgt: 'MONITOR', label: 'ไม่ต้องประเมิน — TIA ทุกรายเสี่ยงเท่ากัน', ok: false, why: 'ความเสี่ยงต่างกันหลายเท่าตามคะแนน — ABCD² คือตัวตัดสินว่าใคร admit ใครกลับได้ ประเมินก่อนเสมอ' },
        ],
      },
    },
    {
      choice: {
        q: 'ABCD² = 6 (high risk) — แผนจำหน่าย',
        options: [
          {
            tgt: 'MONITOR', label: 'Admit + monitor EKG หา AF + workup carotid + เริ่ม antiplatelet', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'happy', text: 'รับ admit แล้วครับ — EKG ติด monitor หา AF, นัด carotid ultrasound, aspirin เริ่มแล้วครับ' }, t: 7 },
              { inter: 'WARNING HEEDED!', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'คุณฟังคำเตือนของธรรมชาติ — <span class="cbs-em">TIA ที่ถูก workup วันนี้ คือ stroke ที่ไม่เกิดพรุ่งนี้</span> ผู้ป่วยที่ "หายแล้ว" อันตรายที่สุดตรงที่ทุกคนอยากปล่อยกลับ' }, t: 7 },
            ],
          },
          { tgt: 'YOU', label: 'ให้กลับบ้าน พรุ่งนี้ค่อยมา admit ต่อคิว', ok: false, why: 'ABCD² 6 = ความเสี่ยง stroke ใน 48 ชม.สูงมาก — คืนนี้แหละคือคืนที่เสี่ยงที่สุด ต้องอยู่โรงพยาบาล', worsen: true },
          { tgt: 'DRUG', label: 'จ่าย aspirin กลับบ้าน แค่นี้พอ', ok: false, why: 'ยาอย่างเดียวไม่ตอบโจทย์ — ต้องหา "ต้นตอ" (AF? carotid stenosis?) ซึ่งเปลี่ยนการรักษาทั้งแผน และต้องเฝ้าช่วงเสี่ยงสูงใน รพ.', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
