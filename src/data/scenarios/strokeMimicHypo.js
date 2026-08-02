// เคส: Stroke Mimic — Hypoglycemia (พื้นฐาน) — อาการเหมือน stroke แต่ตัวจริงคือน้ำตาลต่ำ
// จุดสอน: ทุกรายสงสัย stroke ต้องเช็ค DTX ก่อนเสมอ · DM + อดอาหาร + เหงื่อแตก = ธงแดง hypoglycemia ·
//         แก้น้ำตาลแล้วอาการหาย = mimic ไม่ให้ tPA · ยังต้อง CT ยืนยันไม่มีรอยโรคซ่อน + ป้องกันไม่ให้เกิดซ้ำ
export const strokeMimicHypo = {
  id: 'stroke-mimic-hypo-01',
  title: 'เหมือน Stroke แต่ไม่ใช่ — Hypoglycemia',
  subtitle: 'ชายอายุ 58 ปี เบาหวานกิน Glibenclamide อดข้าวเช้า — พูดสับสน แขนขวาอ่อนแรง เหงื่อแตกท่วมตัว',
  level: 'basic',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! ชาย 58 ปี ลูกพามา — <span class="cbs-em">พูดไม่รู้เรื่อง แขนขวาอ่อนแรง</span> 20 นาทีก่อนค่ะ! BP 130/80 HR 102 SpO₂ 98% แต่<span class="cbs-em">เหงื่อแตกท่วมตัว</span>เลยค่ะ' }, t: 6, fx: { rhythm: 'nsr' } },
    { inter: 'STROKE ALERT!!', drama: 'red', t: 0 },
    { say: { who: 'family_witness', pose: 'panic', text: 'หมอคะ! พ่อเป็นเบาหวาน กิน <span class="cbs-em">Glibenclamide ทุกเช้า</span> — แต่เช้านี้<span class="cbs-em">กินยาแล้วไม่ได้กินข้าวเลย</span>ค่ะ บอกว่าไม่หิว!' }, t: 6 },
    { say: { who: 'att_dech', pose: 'stern', text: 'ลูกบอกว่าพ่อเป็นเบาหวาน กิน Glibenclamide แล้วเช้านี้<span class="cbs-em">ไม่ได้กินข้าว</span>… คุณเห็นอะไรในภาพนี้ไหม Leader' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรกของคุณ',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน FAST + ซักประวัติเวลาเริ่มอาการ', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'FAST: <span class="cbs-em">พูดสับสน + แขนขวาอ่อนแรงเล็กน้อย</span> — เข้าเกณฑ์สงสัย stroke ค่ะ onset 20 นาทีก่อน' }, t: 8 },
            ],
          },
          { tgt: 'CT', label: 'อาการชัดแล้ว — เข็นเข้า CT ทันทีไม่ต้องประเมิน', ok: false, why: 'FAST ใช้เวลาไม่ถึงนาทีและเป็นตัวยืนยันว่าควรเดิน pathway ไหน — ข้ามการประเมินคือเดินเกมโดยไม่มีข้อมูล' },
          { tgt: 'DRUG', label: 'อาการ+ประวัติเบาหวานชัด — ฉีด glucose เลยไม่ต้องตรวจอะไร', ok: false, why: 'ใกล้เคียงแต่ยังผิด — ต้องยืนยันค่า DTX ก่อน ถ้าน้ำตาลไม่ต่ำจริง glucose ที่เกินจะทำร้ายสมองที่ขาดเลือด และคุณจะหลงทางทั้งเคส' },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'สงสัย stroke ทุกราย — มี<span class="cbs-em">กติกาเหล็ก</span>อยู่หนึ่งข้อก่อนไปต่อ อย่าให้ผมต้องบอก' }, t: 4 },
    {
      choice: {
        q: 'กติกาเหล็กของทุกเคสสงสัย stroke',
        options: [
          {
            tgt: 'LAB', label: 'เช็ค DTX ก่อนเสมอ', ok: true,
            then: [
              { say: { who: 'mind_runner', pose: 'talk', text: 'เจาะ DTX แล้วค่ะ — เครื่องกำลังอ่าน… <span class="cbs-em">ค่าออกแล้วค่ะ!</span>' }, t: 5 },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'DTX = <span class="cbs-em">42 mg/dL</span> — Hypoglycemia ค่ะอาจารย์!' }, t: 7 },
              { inter: 'น้ำตาลต่ำ!!', drama: 'red', t: 0 },
              { say: { who: 'mind_runner', pose: 'talk', text: 'เก็บเลือดยืนยัน plasma glucose <span class="cbs-em">วิ่งส่งแล็บเองเลยค่ะ</span> — 3 นาทีถึง!' }, t: 5 },
            ],
          },
          { tgt: 'CT', label: 'ส่ง CT Brain ก่อน ค่าน้ำตาลไว้ทีหลัง', ok: false, why: 'DTX คือของที่ต้องมาก่อน CT — ใช้เวลาแค่วินาทีเดียว และถ้าต่ำจริง แก้ได้ทันทีโดยไม่ต้องเสีย CT ทั้งรอบ', worsen: true },
          { tgt: 'DRUG', label: 'เปิด IV เตรียม tPA รอไว้เลย', ok: false, why: 'ยังไม่รู้ด้วยซ้ำว่าเป็น stroke จริงไหม — เตรียมยาละลายลิ่มเลือดให้คนน้ำตาลต่ำคือเดินผิดทางทั้งขบวน' },
        ],
      },
    },
    {
      choice: {
        q: 'DTX 42 mg/dL — จัดการอย่างไร',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ 50% Glucose 50 mL IV push แล้วประเมินอาการซ้ำ', ok: true,
            then: [
              { skip: '— 10 นาทีต่อมา —', t: 10 },
              { say: { who: 'boy_compressor', pose: 'happy', text: 'DTX ซ้ำ = <span class="cbs-em">110</span> ครับ — ผู้ป่วย<span class="cbs-em">พูดชัดปกติ แขนขวาแรงกลับมาเต็ม</span>!' }, t: 7 },
              { say: { who: 'att_dech', pose: 'talk', text: 'อาการหายสนิทหลังแก้น้ำตาล — นี่คือ <span class="cbs-em">stroke mimic</span> ตัวคลาสสิก แต่เกมยังไม่จบนะ' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ให้กินน้ำหวานเอง แล้วรอดูอาการเฉยๆ', ok: false, why: 'ผู้ป่วยซึม/สับสน — ให้กินเองเสี่ยงสำลัก และน้ำตาล 42 ต้องแก้ทาง IV ให้เร็วและวัดผลได้', worsen: true },
          { tgt: 'CT', label: 'พา CT ก่อนค่อยแก้น้ำตาล เดี๋ยวภาพไม่ทัน', ok: false, why: 'สมองที่ขาดน้ำตาลกำลังเสียหายทุกนาที — แก้สิ่งที่เจอแล้วและแก้ได้ทันทีก่อนเสมอ CT รอได้', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'อาการหายแล้ว… หลายคนจะปิดเคสตรงนี้ — <span class="cbs-em">แต่คุณควรทำอะไรต่อเพื่อปิดให้สนิท?</span>' }, t: 5 },
    {
      choice: {
        q: 'ปิดเคสให้สนิท',
        options: [
          {
            tgt: 'YOU', label: 'ประเมิน NIHSS ซ้ำเป็นหลักฐานว่า deficit หายจริง + CT ยืนยันไม่มีรอยโรคซ่อน', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'talk', text: 'NIHSS = <span class="cbs-em">0</span> ค่ะ — CT Brain: <span class="cbs-em">ปกติ</span> ไม่มี infarct ไม่มี hemorrhage' }, t: 8 },
              { say: { who: 'att_dech', pose: 'talk', text: 'สรุป: <span class="cbs-em">Hypoglycemia-induced focal deficit</span> — ไม่ใช่ stroke ไม่ให้ tPA' }, t: 5 },
            ],
          },
          { tgt: 'DRUG', label: 'อาการหายแล้วแต่เผื่อไว้ — ให้ tPA ขนาดครึ่งเดียว', ok: false, why: 'ไม่มี "tPA เผื่อไว้" — deficit หายและสาเหตุคือน้ำตาลต่ำ ให้ยาละลายลิ่มเลือดคือความเสี่ยงเลือดออกล้วนๆ โดยไม่มีประโยชน์', worsen: true },
          { tgt: 'MONITOR', label: 'หายแล้วก็ให้กลับบ้านเลย', ok: false, why: 'Glibenclamide ออกฤทธิ์ยาว — น้ำตาลต่ำซ้ำได้อีกในไม่กี่ชั่วโมง และยังไม่ได้พิสูจน์ว่าไม่มีรอยโรคอื่นซ่อนอยู่' },
        ],
      },
    },
    {
      choice: {
        q: 'แผนก่อนจำหน่าย',
        options: [
          {
            tgt: 'MONITOR', label: 'Admit สังเกต + เช็ค DTX ซ้ำเป็นระยะ + ปรับยา Glibenclamide + สอนป้องกัน hypoglycemia', ok: true,
            then: [
              { inter: 'MIMIC CAUGHT!', green: true, t: 5 },
              { say: { who: 'att_dech', pose: 'happy', text: 'จับ mimic ได้สวยงาม — <span class="cbs-em">DTX ก่อนเสมอในทุกเคสสงสัย stroke</span> ถ้าวันนั้นคุณข้ามไป CT แล้วรีบ tPA… คนไข้น้ำตาลต่ำจะได้ยาละลายลิ่มเลือดฟรีๆ จำเคสนี้ไว้ให้แม่น' }, t: 7 },
            ],
          },
          { tgt: 'DRUG', label: 'เริ่ม Aspirin ป้องกัน stroke ระยะยาว', ok: false, why: 'เคสนี้ไม่ใช่ stroke — ยาที่ต้องจัดการคือ Glibenclamide ที่ทำให้น้ำตาลต่ำ ไม่ใช่เพิ่ม antiplatelet โดยไม่มีข้อบ่งชี้' },
          { tgt: 'YOU', label: 'นัด follow-up 3 เดือน ไม่ต้อง admit', ok: false, why: 'ยาเบาหวานตัวเดิมยังออกฤทธิ์อยู่ในตัว — เสี่ยงน้ำตาลต่ำซ้ำที่บ้านคืนนี้ ต้องสังเกตอาการจนพ้นช่วงเสี่ยงและปรับยาก่อน', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
