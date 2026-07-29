// เคส: Wake-up Stroke + LVO (megacode) — นอก tPA window แต่ยังมีไพ่ thrombectomy
// จุดสอน: last known well = เวลาที่ "เห็นปกติครั้งสุดท้าย" ไม่ใช่เวลาตื่นมาพบ · gaze deviation + neglect +
//         อ่อนแรงสนิท = สงสัย LVO · นอก window/on warfarin → ไม่ให้ tPA แต่ LVO + ASPECTS ดี → mechanical
//         thrombectomy (ขยายได้ถึง 24 ชม.) · post-thrombectomy ต้องคุม BP + เฝ้า reperfusion hemorrhage
export const strokeLvoWakeup = {
  id: 'stroke-lvo-wakeup-01',
  title: 'ตื่นมาก็เป็นแล้ว — Wake-up Stroke (LVO)',
  subtitle: 'หญิงอายุ 70 ปี AF กิน Warfarin — สามีตื่นมา 6 โมงเช้าพบพูดไม่ได้ แขนขาซ้ายอ่อนแรงสนิท',
  level: 'megacode',
  track: 'stroke',
  course: 'acls',
  hiddenCause: null,
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! หญิง 70 ปี AF กิน Warfarin — สามีตื่นมา 06:00 พบ<span class="cbs-em">พูดไม่ได้ + แขนขาซ้ายอ่อนแรงสนิท</span>! BP 168/92 HR 96 ไม่สม่ำเสมอ SpO₂ 95%', fx: { rhythm: 'afib' } }, t: 6 },
    { inter: 'STROKE ALERT!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'Wake-up stroke — เจอตอนตื่น… คำถามแรกที่ชี้ชะตาทั้งเคส: <span class="cbs-em">"เวลา onset" ของผู้ป่วยรายนี้คือกี่โมง?</span>' }, t: 5 },
    {
      choice: {
        q: 'นับเวลา onset อย่างไร',
        options: [
          {
            tgt: 'YOU', label: 'ใช้ last known well — เวลาที่เห็นปกติครั้งสุดท้าย (เข้านอน 22:00) ไม่ใช่เวลาตื่นมาพบ', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'ถูก — เราไม่รู้ว่าเกิดตอนไหนของคืน จึงต้องนับแบบเลวร้ายสุด: <span class="cbs-em">22:00 → ตอนนี้ = 8 ชั่วโมงกว่า</span> เกิน tPA window แน่นอน… แต่เกมยังไม่จบ' }, t: 7 },
            ],
          },
          { tgt: 'YOU', label: 'นับจาก 06:00 ตอนสามีตื่นมาพบ — เพิ่ง 1 ชั่วโมง ยังทัน tPA', ok: false, why: 'อันตรายมาก! อาการอาจเกิดตั้งแต่เที่ยงคืน — นับเวลาจากตอน "พบ" จะทำให้ให้ tPA นอก window จริง เสี่ยงเลือดออกในสมองโดยไม่มีประโยชน์', worsen: true },
          { tgt: 'DRUG', label: 'ไม่ต้องเถียงเรื่องเวลา ให้ tPA ไว้ก่อนได้เปรียบ', ok: false, why: 'tPA นอก window บนสมองที่ infarct ไปแล้ว = เปลี่ยน ischemic เป็น hemorrhagic ด้วยมือเราเอง — เวลาคือเกณฑ์ ไม่ใช่พิธีกรรม', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'ประเมินต่อ',
        options: [
          {
            tgt: 'YOU', label: 'FAST + DTX + ตรวจระบบประสาทละเอียด', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'FAST: หน้าเบี้ยวซ้าย + <span class="cbs-em">แขนขาซ้าย 0/5 อ่อนแรงสนิท</span> + <span class="cbs-em">ตาเหลือกไปทางขวา (gaze deviation) + ไม่รับรู้ซีกซ้าย (neglect)</span> — DTX 128 ปกติค่ะ' }, t: 9 },
              { say: { who: 'att_dech', pose: 'stern', text: 'อาการหนัก + gaze deviation + neglect — ภาพนี้ร้องบอกว่า <span class="cbs-em">Large Vessel Occlusion</span> เส้นใหญ่อุด ไม่ใช่เส้นเล็ก' }, t: 6 },
            ],
          },
          { tgt: 'MONITOR', label: 'เกิน window แล้ว — รับ admit แบบ palliative สังเกตอาการ', ok: false, why: 'เกิน "tPA window" ไม่เท่ากับหมดทางรักษา — ยังมี mechanical thrombectomy ที่เกณฑ์ขยายได้ถึง 24 ชม. ต้องประเมินต่อให้สุด', worsen: true },
          { tgt: 'LAB', label: 'รอ INR ก่อนแล้วค่อยตรวจร่างกาย', ok: false, why: 'INR สำคัญแต่ส่งคู่ขนานได้ — การตรวจระบบประสาทตอนนี้คือตัวบอกว่าสงสัย LVO หรือไม่ ซึ่งเปลี่ยนปลายทางทั้งเคส' },
        ],
      },
    },
    {
      choice: {
        q: 'Imaging สำหรับเคสสงสัย LVO',
        options: [
          {
            tgt: 'CT', label: 'NIHSS + CT Brain + CTA (ดูเส้นเลือดใหญ่) ด่วน', ok: true,
            then: [
              { skip: '— CT + CTA ด่วน —', t: 10 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'NIHSS = <span class="cbs-em">22 (Severe)</span> — CT: ไม่มีเลือดออก <span class="cbs-em">ASPECTS 9</span> (เนื้อสมองส่วนใหญ่ยังไม่ตาย!) — CTA: <span class="cbs-em">M1 occlusion ฝั่งขวา — LVO ยืนยัน!</span>' }, t: 9 },
              { inter: 'LVO CONFIRMED!!', drama: 'red', t: 0 },
            ],
          },
          { tgt: 'CT', label: 'CT non-contrast อย่างเดียวพอ ประหยัดเวลา', ok: false, why: 'สงสัย LVO ต้องเห็น "เส้นเลือด" — CTA คือตัวยืนยันตำแหน่งอุดตันที่ interventionist ต้องใช้ตัดสินใจ thrombectomy' },
          { tgt: 'MONITOR', label: 'ทำ MRI แบบนัดคิวปกติ ภาพชัดกว่า', ok: false, why: 'คิว MRI ปกติ = ชั่วโมงถึงวัน — penumbra ที่ยังพอรอดกำลังตายทุกนาที CT/CTA เดี๋ยวนี้คือคำตอบ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'สรุปไพ่บนโต๊ะ: LVO ยืนยัน · นอก window 8 ชม. · on Warfarin INR ยังไม่รู้ · ASPECTS 9 — <span class="cbs-em">เดินเกมยังไง Leader?</span>' }, t: 6 },
    {
      choice: {
        q: 'ตัดสินใจการรักษา — จุดชี้ชะตา',
        options: [
          {
            tgt: 'YOU', label: 'ไม่ให้ tPA (นอก window + on warfarin) → Activate ทีม thrombectomy ทันที', ok: true,
            then: [
              { inter: 'ACTIVATE THROMBECTOMY!', drama: 'red', t: 5 },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ทีม Interventional neuroradiology รับเคสแล้วครับ — LVO + ASPECTS 9 <span class="cbs-em">เข้าเกณฑ์ thrombectomy (ขยายได้ถึง 24 ชม.)</span> เตรียมห้อง cath!' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ tPA ก่อนแล้วค่อยตามด้วย thrombectomy จะได้ครบสูตร', ok: false, why: 'เคสนี้ tPA ติดข้อห้ามสองชั้น: นอก window และ on warfarin — การ "ให้ครบสูตร" ทั้งที่ห้ามคือเลือดออกในสมองรออยู่', worsen: true },
          { tgt: 'MONITOR', label: 'NIHSS 22 หนักเกินไป ไม่คุ้มทำหัตถการ — admit ประคับประคอง', ok: false, why: 'NIHSS สูงยิ่งได้ประโยชน์จาก thrombectomy ถ้าเนื้อสมองยังไม่ตาย (ASPECTS 9 ยืนยันแล้ว) — การยอมแพ้ตรงนี้คือทิ้งโอกาสฟื้นทั้งชีวิตของผู้ป่วย', worsen: true },
        ],
      },
    },
    { skip: '— ห้อง Cath · Mechanical thrombectomy —', t: 12 },
    { say: { who: 'fon_defib', pose: 'happy', text: 'ดึงลิ่มเลือดออกได้! <span class="cbs-em">TICI 3 — reperfusion สมบูรณ์!</span> บนเตียงผู้ป่วยเริ่มขยับแขนซ้าย พูดตะกุกตะกักได้แล้วค่ะ!' }, t: 7 },
    { inter: 'TICI 3!!', green: true, t: 5 },
    {
      choice: {
        q: 'หลัง thrombectomy สำเร็จ — คำสั่งดูแลต่อ',
        options: [
          {
            tgt: 'MONITOR', label: 'ICU + คุม BP <180/105 + neuro check q15-30min เฝ้า reperfusion hemorrhage', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'happy', text: 'รับ ICU แล้วค่ะ — NIHSS ประเมินซ้ำ<span class="cbs-em">ลดจาก 22 เหลือ 6</span>! BP คุมตามเป้า neuro check ทุก 15 นาทีค่ะ' }, t: 8 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เกมระดับ megacode — <span class="cbs-em">last known well คือกฎเหล็ก · หมด window ไม่ใช่หมดหวัง · LVO + ASPECTS ดี = thrombectomy</span> คุณเพิ่งคืนครึ่งชีวิตให้ผู้ป่วยด้วยการไม่ยอมแพ้ตั้งแต่คำว่า "เกิน window"' }, t: 8 },
            ],
          },
          { tgt: 'DRUG', label: 'เปิดหลอดเลือดแล้ว — เริ่ม Warfarin ต่อทันทีคืนนี้กัน stroke ซ้ำ', ok: false, why: 'หลัง reperfusion ใหม่ๆ เนื้อสมองเปราะ — anticoagulant เต็มขนาดทันทีเสี่ยง hemorrhagic transformation จังหวะเริ่มยาต้องวางแผนทีหลัง', worsen: true },
          { tgt: 'YOU', label: 'สำเร็จแล้ว ส่ง ward สามัญ พรุ่งนี้ค่อยประเมิน', ok: false, why: '24-48 ชม.แรกหลัง thrombectomy คือช่วงเสี่ยง reperfusion hemorrhage และสมองบวม — ต้อง ICU + เฝ้าใกล้ชิด ไม่ใช่ ward สามัญ', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
