// เคส: Ischemic Stroke (พื้นฐาน) — เส้นทางมาตรฐาน FAST → DTX → NIHSS/CT → tPA
// จุดสอน: Time is brain — จับเวลา onset ให้ชัด · ทุกรายสงสัย stroke ต้องเช็ค DTX ตัดโรคเลียนแบบ ·
//         CT ไม่มีเลือดออก + อยู่ใน window + ไม่มีข้อห้าม → tPA · หลังให้ tPA ต้อง monitor BP/neuro q15min
export const strokeIschemicBasic = {
  id: 'stroke-ischemic-basic-01',
  title: 'พูดไม่ชัด แขนขวาตก — Ischemic Stroke',
  subtitle: 'ชายอายุ 65 ปี AF ไม่ได้กินยากันเลือดแข็ง เมียพบพูดไม่ชัด แขนขวาอ่อนแรง 1 ชั่วโมงก่อน',
  level: 'basic',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ชาย 65 ปี ญาติพามา — <span class="cbs-em">พูดไม่ชัด แขนขวาอ่อนแรง</span> เป็นมาประมาณ 1 ชั่วโมงค่ะ! BP 175/95 HR 88 จังหวะไม่สม่ำเสมอ SpO₂ 97%', fx: { rhythm: 'afib' } }, t: 6 },
    { inter: 'STROKE ALERT!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ผู้ป่วยรู้ตัว มีชีพจร — แต่<span class="cbs-em">สมองกำลังขาดเลือดอยู่ตอนนี้</span> คุณคือ Leader… นาฬิกาเดินแล้ว' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน FAST (Face-Arm-Speech-Time) + ถามเวลาเริ่มอาการให้ชัด', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'FAST: <span class="cbs-em">หน้าเบี้ยวขวา + แขนขวาตก + พูดไม่ชัด</span> ค่ะ — เมียยืนยันเริ่มเป็นตอน 1 ชั่วโมงก่อนเป๊ะ ตอนกำลังกินข้าว' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ Aspirin เคี้ยวทันทีกันไว้ก่อน', ok: false, why: 'ยังไม่รู้ว่าเป็น ischemic หรือ hemorrhagic — ถ้าเลือดออกในสมอง aspirin จะซ้ำเติม ต้องประเมิน + CT ก่อนเสมอ', worsen: true },
          { tgt: 'MONITOR', label: 'สังเกตอาการก่อน 1 ชั่วโมง เผื่อหายเอง', ok: false, why: 'Time is brain! เสียเวลา 1 ชั่วโมง = เซลล์สมองตายเพิ่มมหาศาลและอาจหลุด tPA window — stroke ต้อง track ด่วนทันที', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'FAST positive + onset 1 ชั่วโมง… แต่ก่อนจะปักใจว่า stroke — มีอะไรที่<span class="cbs-em">เลียนแบบ stroke</span> แล้วแก้ได้ในไม่กี่นาที?' }, t: 5 },
    {
      choice: {
        q: 'ตัด stroke mimic',
        options: [
          {
            tgt: 'LAB', label: 'เจาะ DTX (น้ำตาลปลายนิ้ว) เดี๋ยวนี้', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'DTX = <span class="cbs-em">135 mg/dL</span> — ปกติค่ะ ไม่ใช่ hypoglycemia' }, t: 7 },
              { say: { who: 'att_dech', pose: 'talk', text: 'ดี — น้ำตาลต่ำทำอาการเหมือน stroke ได้เป๊ะ เช็คก่อนเสมอ ตัดออกแล้วก็เดินหน้า stroke pathway เต็มตัว' }, t: 5 },
            ],
          },
          { tgt: 'CT', label: 'ข้ามไป CT เลย ไม่ต้องเจาะอะไร', ok: false, why: 'DTX ใช้เวลาแค่วินาทีเดียวและ hypoglycemia คือ mimic ที่พบบ่อยสุด — ถ้าใช่ ให้ glucose หายเลย ไม่ต้องเปลือง CT' },
          { tgt: 'DRUG', label: 'ให้ 50% glucose ไปก่อนเลย เผื่อน้ำตาลต่ำ', ok: false, why: 'ให้ glucose ทั้งที่ไม่รู้ค่า — ถ้าน้ำตาลปกติหรือสูง ยิ่ง hyperglycemia ยิ่งแย่ต่อสมองที่ขาดเลือด เจาะ DTX ก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'ขั้นต่อไปของ stroke pathway',
        options: [
          {
            tgt: 'CT', label: 'ประเมิน NIHSS + ส่ง CT Brain ด่วน (non-contrast)', ok: true,
            then: [
              { skip: '— เข็นผู้ป่วยเข้าห้อง CT · Door-to-CT 20 นาที —', t: 10 },
              { say: { who: 'fon_defib', pose: 'talk', text: 'NIHSS = <span class="cbs-em">12 (Moderate)</span> ค่ะ — CT Brain: <span class="cbs-em">ไม่มี hemorrhage</span> → Ischemic stroke!' }, t: 8 },
            ],
          },
          { tgt: 'LAB', label: 'รอผลเลือดครบทุกตัวก่อนค่อยส่ง CT', ok: false, why: 'ห้ามให้ lab ถ่วง CT — เป้า Door-to-CT <25 นาที ผลเลือดตามไปอ่านทีหลังได้ (ยกเว้นสงสัยผิดปกติจริง)', worsen: true },
          { tgt: 'DRUG', label: 'เริ่ม tPA เลย อาการชัดขนาดนี้ไม่ต้องรอ CT', ok: false, why: 'ห้ามเด็ดขาด! ถ้าเป็น hemorrhagic stroke แล้วให้ tPA = เทน้ำมันลงกองไฟ — ต้องมี CT ยืนยันว่าไม่มีเลือดออกก่อนเสมอ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'Ischemic ยืนยัน onset 1 ชั่วโมง <span class="cbs-em">อยู่ใน window</span> — คำถามสุดท้ายก่อนตัดสินใจใหญ่: เขาให้ยาได้ไหม' }, t: 5 },
    {
      choice: {
        q: 'ตัดสินใจเรื่อง tPA',
        options: [
          {
            tgt: 'DRUG', label: 'ทบทวนเกณฑ์ tPA — เข้าเกณฑ์ ไม่มีข้อห้าม → ให้ Alteplase 0.9 mg/kg', ok: true,
            then: [
              { inter: 'tPA — GO!', drama: 'red', t: 5 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'Alteplase 0.9 mg/kg — <span class="cbs-em">10% bolus แล้วที่เหลือ drip 60 นาที</span> เริ่มแล้วค่ะ! Door-to-Needle 45 นาที' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'BP 175/95 สูงไป — ลดความดันให้ต่ำกว่า 120/80 ก่อนค่อยว่ากัน', ok: false, why: 'เกณฑ์ tPA คือ BP <185/110 — 175/95 ผ่านแล้ว การกดความดันต่ำเกินไปยิ่งลดเลือดไปเลี้ยงสมองส่วนที่กำลังขาดเลือด', worsen: true },
          { tgt: 'MONITOR', label: 'admit สังเกตอาการ ให้ยาพรุ่งนี้เช้าถ้ายังไม่ดีขึ้น', ok: false, why: 'tPA มี window 3–4.5 ชั่วโมงจาก onset — รอถึงพรุ่งนี้คือหลุด window แน่นอน โอกาสฟื้นของผู้ป่วยหายไปกับเวลา', worsen: true },
        ],
      },
    },
    { say: { who: 'boy_compressor', pose: 'talk', text: 'tPA เดินอยู่ครับ — ผู้ป่วยเริ่มขยับแขนขวาได้นิดๆ แล้ว!' }, t: 5 },
    {
      choice: {
        q: 'ระหว่างและหลัง tPA drip — คำสั่งดูแลต่อ',
        options: [
          {
            tgt: 'MONITOR', label: 'Monitor BP + Neuro check ทุก 15 นาที — แย่ลงเมื่อไหร่หยุด drip ทันที', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'happy', text: 'ครบ drip 60 นาที — <span class="cbs-em">พูดชัดขึ้น แขนขวายกได้</span> BP 160/88 ไม่มีปวดหัว ไม่ซึมค่ะ!' }, t: 7 },
              { inter: 'DOOR-TO-NEEDLE 45 นาที!', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'ครบวงจร — <span class="cbs-em">FAST เร็ว · DTX ตัด mimic · CT ก่อนยา · tPA ใน window · เฝ้า q15min</span> จำลำดับนี้ให้ขึ้นใจ ทุกนาทีที่เร็วขึ้นคือสมองที่รอดเพิ่ม' }, t: 6 },
            ],
          },
          { tgt: 'YOU', label: 'ยาเข้าแล้วถือว่าจบเคส — ส่งขึ้น ward สามัญได้เลย', ok: false, why: 'อันตรายที่สุดของ tPA คือเลือดออกในสมอง "หลังให้ยา" — 24 ชั่วโมงแรกต้อง monitor ใกล้ชิดใน stroke unit/ICU', worsen: true },
          { tgt: 'DRUG', label: 'เติม Aspirin + Heparin ทันทีหลัง drip เพื่อกันซ้ำ', ok: false, why: 'ห้าม antiplatelet/anticoagulant ภายใน 24 ชั่วโมงหลัง tPA — เพิ่มความเสี่ยงเลือดออกในสมองรุนแรง', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
