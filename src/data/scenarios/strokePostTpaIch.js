// เคส: Post-tPA Symptomatic ICH (megacode) — เคสเดินสวยจนนาทีที่ 40 ของ drip
// จุดสอน: ระหว่าง tPA drip ต้องเฝ้าใกล้ชิด — ปวดหัวรุนแรง/อาเจียน/ซึมลง/BP พุ่ง = สงสัย symptomatic ICH ·
//         หยุด drip ทันที ก่อนทำอย่างอื่น · CT ซ้ำยืนยัน · reverse ด้วย cryoprecipitate + ส่ง labs coag ·
//         คุม BP + ปรึกษา neurosurgery + เฝ้า herniation — ภาวะแทรกซ้อนที่ทุกคนให้ tPA ต้องรับมือเป็น
export const strokePostTpaIch = {
  id: 'stroke-post-tpa-ich-01',
  title: 'นาทีที่ 40 ของ Drip — Post-tPA Hemorrhage',
  subtitle: 'ชายอายุ 74 ปี ischemic stroke ได้ tPA ตามเกณฑ์ทุกอย่าง — แล้วจู่ๆ แย่ลงกลาง drip',
  level: 'megacode',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ชาย 74 ปี <span class="cbs-em">แขนขวาอ่อนแรง + พูดไม่ได้</span> 1 ชั่วโมงก่อนค่ะ — BP 178/98 HR 76 SpO₂ 97%' }, t: 6, fx: { rhythm: 'nsr' } },
    { inter: 'STROKE ALERT!!', drama: 'red', t: 0 },
    {
      choice: {
        q: 'เดินเครื่อง stroke pathway',
        options: [
          {
            tgt: 'YOU', label: 'FAST + DTX + จับเวลา onset ให้แน่น', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'FAST positive: <span class="cbs-em">หน้าเบี้ยว + แขนขวาตก + aphasia</span> — DTX 126 ปกติ onset 1 ชั่วโมงชัดเจนค่ะ' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ tPA ทันทีจากอาการอย่างเดียว', ok: false, why: 'ลำดับห้ามข้าม: ประเมิน → DTX → CT → เช็คเกณฑ์ → แล้วค่อยยา — ความเร็วที่ข้ามขั้นตอนคือความเร็วเข้าหาหายนะ', worsen: true },
          { tgt: 'MONITOR', label: 'admit ไว้ก่อน พรุ่งนี้ round แล้วค่อยว่ากัน', ok: false, why: 'Onset 1 ชั่วโมง ใน window เต็มๆ — เคสที่ "ทันเวลา" ที่สุดกลับถูกทำให้ช้าที่สุดไม่ได้', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'Imaging + เกณฑ์',
        options: [
          {
            tgt: 'CT', label: 'NIHSS + CT ด่วน (เป้า Door-to-CT <25 นาที)', ok: true,
            then: [
              { skip: '— CT ด่วน —', t: 8 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'NIHSS = <span class="cbs-em">14 (Moderate)</span> — CT: <span class="cbs-em">ไม่มี hemorrhage</span> → Ischemic — BP 178/98 (<185/110 ผ่าน) ไม่มีข้อห้ามอื่นค่ะ' }, t: 8 },
            ],
          },
          { tgt: 'LAB', label: 'รอ coag panel ครบก่อน CT', ok: false, why: 'Lab ส่งคู่ขนาน — ไม่มีประวัติ anticoagulant ไม่ต้องรอผลก่อนเดินหน้า CT/tPA' },
          { tgt: 'DRUG', label: 'ลดความดันลงต่ำๆ ไว้ก่อนเผื่อได้ให้ยา', ok: false, why: '178/98 ผ่านเกณฑ์ tPA (<185/110) แล้ว — กดต่ำเกินตัดเลือดเลี้ยง penumbra ที่กำลังรอการช่วย', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'เข้าเกณฑ์ครบ — ตัดสินใจ',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ tPA — Alteplase 0.9 mg/kg (10% bolus + drip 60 นาที) + สั่งเฝ้าใกล้ชิดระหว่าง drip', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'tPA เดินแล้วค่ะ Door-to-Needle 48 นาที — monitor BP + neuro ทุก 15 นาทีตามสั่งค่ะ' }, t: 7 },
              { skip: '— นาทีที่ 40 ของ drip —', t: 10 },
              { say: { who: 'family_witness', pose: 'panic', text: 'หมอคะ!! เมื่อกี้เขายังบีบมือฉันอยู่เลย จู่ๆ ก็กุมหัวบอกว่า<span class="cbs-em">ปวดขึ้นมาใหม่ ปวดกว่าตอนแรกมาก</span> แล้วตอนนี้เรียกก็ไม่ค่อยรู้ตัวแล้วค่ะ!!' }, t: 6 },
              { say: { who: 'boy_compressor', pose: 'panic', text: 'อาจารย์!! ผู้ป่วย<span class="cbs-em">ปวดหัวรุนแรงเฉียบพลัน อาเจียนพุ่ง ซึมลง GCS 15 → 11</span> — BP พุ่ง <span class="cbs-em">210/115</span> ครับ!!' }, t: 8 },
              { inter: 'ผู้ป่วยแย่ลงกลาง DRIP!!', drama: 'red', t: 0 },
            ],
          },
          { tgt: 'MONITOR', label: 'เกณฑ์ผ่านแต่อายุ 74 แล้ว — งดยาดีกว่า ปลอดภัยไว้ก่อน', ok: false, why: 'อายุ 74 ไม่ใช่ข้อห้าม — เข้าเกณฑ์ครบแล้วไม่ให้ = ตัดโอกาสฟื้นของผู้ป่วยด้วยความกลัวของเราเอง', worsen: true },
          { tgt: 'DRUG', label: 'ให้ tPA แล้วปล่อยผู้ป่วยพักเงียบๆ ไม่ต้องกวนบ่อย', ok: false, why: 'ระหว่าง drip คือช่วงเสี่ยง symptomatic ICH สูงสุด — "ไม่กวน" คือการปิดตาจากภาวะแทรกซ้อนที่ต้องจับให้ได้ในนาทีแรก', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ปวดหัวรุนแรง + อาเจียน + ซึมลง + BP พุ่ง <span class="cbs-em">กลาง tPA drip</span> — วินาทีนี้ทำอะไร "ก่อน" ทุกอย่าง Leader!' }, t: 5 },
    {
      choice: {
        q: 'การกระทำแรก — วินาทีชี้ชะตา',
        options: [
          {
            tgt: 'DRUG', label: 'หยุด tPA drip ทันที!', ok: true,
            then: [
              { inter: 'STOP THE DRIP!!', drama: 'red', t: 5 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'หยุด drip แล้วค่ะ! — เหลือยาค้างอีก ~20% ที่ยังไม่เข้า' }, t: 6 },
            ],
          },
          { tgt: 'CT', label: 'รีบเข็นไป CT ก่อน โดยยังเดิน drip ต่อระหว่างทาง', ok: false, why: 'ทุกหยดที่ยังเข้าคือเลือดออกที่ขยายต่อ — หยุด drip ใช้เวลา 2 วินาทีและต้องมาก่อนทุกอย่าง', worsen: true },
          { tgt: 'DRUG', label: 'ให้ยาแก้ปวด + ยาแก้อาเจียนก่อน อาการน่าจะดีขึ้น', ok: false, why: 'อาการชุดนี้กลาง drip = สงสัย symptomatic ICH จนกว่าจะพิสูจน์ได้ — ยาแก้ปวดคือการรักษา "เสียง" ไม่ใช่ "ไฟ"', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'หยุด drip แล้ว — ต่อทันที',
        options: [
          {
            tgt: 'CT', label: 'CT Brain ซ้ำด่วน + ส่ง labs (PT/aPTT/fibrinogen/CBC) + จอง cryoprecipitate', ok: true,
            then: [
              { say: { who: 'mind_runner', pose: 'talk', text: 'เปลมาแล้วค่ะ! แจ้งห้อง CT <span class="cbs-em">ขอคิวด่วนที่สุด</span> — เลือด coag ฉันวิ่งส่งแล็บเองเลยค่ะ!' }, t: 5 },
              { skip: '— CT ซ้ำด่วน —', t: 8 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'CT ซ้ำ: <span class="cbs-em">Hemorrhagic transformation — เลือดออกในเนื้อสมองบริเวณ infarct!</span> ยืนยัน symptomatic ICH ค่ะ' }, t: 8 },
              { inter: 'sICH CONFIRMED!!', drama: 'red', t: 0 },
            ],
          },
          { tgt: 'MONITOR', label: 'รอดูอีก 30 นาทีว่าซึมลงจริงไหมค่อยส่งภาพ', ok: false, why: 'GCS หล่น 4 แต้มกลาง drip ไม่ใช่เรื่องรอดู — ทุกครึ่งชั่วโมงที่รอคือเลือดที่ขยายและสมองที่ถูกกด', worsen: true },
          { tgt: 'DRUG', label: 'ให้ vitamin K ทันที reverse tPA', ok: false, why: 'Vitamin K ใช้ reverse warfarin — ไม่ได้ผลกับ tPA ตัว reverse หลักของ fibrinolytic คือ cryoprecipitate (คืน fibrinogen)' },
        ],
      },
    },
    {
      choice: {
        q: 'Reverse การแข็งตัวของเลือด',
        options: [
          {
            tgt: 'DRUG', label: 'Cryoprecipitate 10 units (± TXA) — คืน fibrinogen ที่ tPA สลายไป', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Cryoprecipitate 10 units เดินแล้วค่ะ — fibrinogen ที่ส่งไปได้ <span class="cbs-em">89 mg/dL (ต่ำ)</span> สมเหตุผลที่ให้เลยค่ะ' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'FFP อย่างเดียวก็พอ มีในตู้เย็นอยู่แล้ว', ok: false, why: 'เป้าหมายคือ fibrinogen — cryoprecipitate เข้มข้นกว่า FFP หลายเท่าในปริมาตรที่เล็กกว่า คือตัวเลือกแรกของ post-tPA ICH' },
          { tgt: 'YOU', label: 'เลือดออกแล้ว reverse ไปก็เท่านั้น — ข้ามไปปรึกษาผ่าตัดเลย', ok: false, why: 'ผ่าตัดบนผู้ป่วยที่เลือดยังไม่แข็งตัว = เลือดออกบนโต๊ะ — reverse คือสิ่งที่ทำให้ทางเลือกอื่นเป็นไปได้', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ปิดเกม — จัดการต่อเนื่อง',
        options: [
          {
            tgt: 'MONITOR', label: 'คุม BP + ปรึกษา Neurosurgery ด่วน + เฝ้า GCS/pupil ทุก 15 นาที ระวัง herniation', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'Neurosurgery มาถึงแล้วครับ — ตอนนี้ GCS ทรงตัวที่ 11 pupil เท่ากันสองข้าง BP คุมอยู่ที่ 165/92 ครับ' }, t: 8 },
              { inter: 'COMPLICATION — CONTROLLED', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'คุณทำทุกขั้นถูกตั้งแต่ให้ยา "ตามเกณฑ์" จนรับมือภาวะแทรกซ้อน — จำไว้: <span class="cbs-em">sICH ไม่ได้แปลว่าคุณผิดที่ให้ tPA แต่จะผิดทันทีถ้าจับไม่ทันหรือหยุด drip ช้า</span> — เฝ้าให้ไว หยุดให้เร็ว reverse ให้ถูก' }, t: 8 },
            ],
          },
          { tgt: 'YOU', label: 'Reverse แล้วถือว่าจบ ลดระดับการเฝ้าได้', ok: false, why: 'เลือดออกอาจขยายต่อได้อีกหลายชั่วโมง — ช่วงหลัง reverse คือช่วงเฝ้า herniation เข้มข้นที่สุด ไม่ใช่ช่วงผ่อน', worsen: true },
          { tgt: 'DRUG', label: 'อาการทรงตัวแล้ว เริ่ม tPA drip ต่อให้ครบ dose เดิม', ok: false, why: 'ห้ามเด็ดขาด — ยืนยัน sICH แล้ว tPA คือสิ่งที่ทำให้เลือดออก การต่อ drip คือราดน้ำมันกลับเข้ากองไฟ', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
