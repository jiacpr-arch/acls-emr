// เคส BLS (MorRoo): พบผู้ป่วยหมดสติในหอผู้ป่วย — BLS ในโรงพยาบาลแบบทีม 2 คน
// จุดสอน: activate ระบบฉุกเฉิน, bag-mask 30:2, สลับคนกดทุก 2 นาที,
// หยุดกดให้สั้นที่สุด, ส่งเวรทีม ACLS แบบมีข้อมูล
export const blsTeamWard = {
  id: 'bls-team-ward-01',
  title: 'Code ในหอผู้ป่วย',
  subtitle: 'เวรดึก คุณเดินตรวจตราแล้วพบผู้ป่วยเตียง 8 นอนนิ่ง หน้าซีด ไม่ตอบสนอง',
  level: 'megacode',
  track: 'adult',
  course: 'bls',
  hiddenCause: null,
  outcome: {
    stamp: 'ส่งเวรสำเร็จ!',
    win: 'BLS คุณภาพสูงต่อเนื่องจนทีม ACLS รับช่วง — ผู้ป่วยกลับมามีชีพจร',
  },
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'เตียง 8! <span class="cbs-em">คนไข้นอนนิ่งผิดปกติ หน้าซีดมาก!</span>' }, t: 3 },
    { inter: 'พบผู้ป่วยหมดสติ!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'คุณคือพยาบาลเวรที่เจอคนแรก มีเพื่อนอีกหนึ่งคนในหอ — <span class="cbs-em">ระบบทั้งโรงพยาบาลรอสัญญาณจากคุณ</span>' }, t: 3 },
    {
      choice: {
        q: 'พบผู้ป่วยไม่ตอบสนองบนเตียง',
        options: [
          {
            tgt: 'YOU', label: 'เขย่าเรียก + กดกริ่งฉุกเฉิน ตะโกนเรียกเพื่อนร่วมเวร', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'panic', text: 'เขย่าแล้วไม่ตื่นค่ะ! เพื่อนกำลังวิ่งมา!' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'เดินไปหาแฟ้มดูประวัติผู้ป่วยก่อน', ok: false, why: 'ประเมินผู้ป่วยก่อน — แฟ้มไว้ทีหลัง เวลาทองกำลังเดิน', worsen: true },
          { tgt: 'CPR', label: 'กดหน้าอกทันทีบนที่นอนนุ่ม ๆ', ok: false, why: 'ยังไม่ยืนยัน arrest และที่นอนนุ่มดูดแรงกด — ประเมินก่อน แล้วเตรียมพื้นแข็ง/กระดานรองหลัง' },
        ],
      },
    },
    {
      choice: {
        q: 'เช็คหายใจ+ชีพจร carotid พร้อมกัน ≤10 วิ — ไม่มีทั้งคู่',
        options: [
          {
            tgt: 'YOU', label: 'สั่งเพื่อน "แจ้ง Code! เอารถ emergency + AED มา!" แล้วเริ่มกดทันที', ok: true,
            then: [
              { inter: 'CODE BLUE!', drama: 'red', t: 3, fx: { alarm: true } },
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ปรับเตียงราบ สอดกระดานรองหลัง — <span class="cbs-em">เริ่มกด!</span> ลึก 5-6 ซม. 100-120/นาที!', fx: { cpr: true, firstCPR: true } }, t: 7 },
            ],
          },
          { tgt: 'YOU', label: 'โทรตามแพทย์เจ้าของไข้ก่อน รอคำสั่ง', ok: false, why: 'Arrest ไม่ต้องรอคำสั่งใคร — แจ้ง code แล้วเริ่ม CPR ทันที', worsen: true },
          { tgt: 'AIRWAY', label: 'ไปหยิบ bag-mask มาช่วยหายใจก่อนค่อยกด', ok: false, why: 'กดหน้าอกมาก่อนเสมอ — ให้เพื่อนเอาอุปกรณ์มาระหว่างคุณกด' },
        ],
      },
    },
    {
      choice: {
        q: 'เพื่อนกลับมาพร้อมรถ emergency + bag-mask',
        options: [
          {
            tgt: 'AIRWAY', label: 'แบ่งหน้าที่: คุณกดต่อ เพื่อน bag — จังหวะ 30 กด : 2 บีบ', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: 'เปิดทางเดินหายใจ head tilt-chin lift ครอบ mask แนบสนิท — <span class="cbs-em">30:2 นะคะ!</span> อกยกดีค่ะ' }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ดี — บีบพอ<span class="cbs-em">เห็นอกยก 1 วินาทีต่อครั้ง</span> บีบแรงเกินลมเข้ากระเพาะ อาเจียนสำลักได้' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'หยุดกดยาว ๆ ไปช่วยกันประกอบ bag ให้เสร็จก่อน', ok: false, why: 'ห้ามหยุดกด — คนหนึ่งกดต่อ อีกคนจัดการอุปกรณ์', worsen: true },
          { tgt: 'AIRWAY', label: 'บีบ bag รัว ๆ ทุกวินาทีให้ออกซิเจนเยอะ ๆ', ok: false, why: 'บีบเร็วเกิน = ลมเข้ากระเพาะ + ดันความดันในอก เลือดกลับหัวใจแย่ลง — 30:2 เท่านั้น' },
        ],
      },
    },
    { say: { who: 'fon_defib', pose: 'talk', text: 'AED มาแล้วค่ะ! เปิดเครื่อง แปะแผ่นระหว่างที่ยังกดอยู่…' }, t: 15 },
    {
      choice: {
        q: 'AED สั่ง "หยุดแตะตัว กำลังวิเคราะห์"',
        options: [
          {
            tgt: 'DEFIB', label: 'ยกมือออกทุกคน ให้เครื่องวิเคราะห์ — หยุดกดให้สั้นที่สุด', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'stern', text: '<span class="cbs-em">"Shock advised — charging"</span> ถอยห่างทุกคนค่ะ!', fx: { rhythm: 'vf' } }, t: 5 },
              { inter: 'SHOCK!', t: 4, fx: { shock: true } },
            ],
          },
          { tgt: 'CPR', label: 'กดต่อระหว่างเครื่องวิเคราะห์ ไม่อยากเสียจังหวะ', ok: false, why: 'การกดรบกวนการวิเคราะห์ rhythm — หยุดสั้น ๆ เฉพาะช่วงเครื่องอ่านเท่านั้น', worsen: true },
          { tgt: 'YOU', label: 'ถือโอกาสคลำชีพจรนาน ๆ ระหว่างวิเคราะห์', ok: false, why: 'ปล่อยให้เครื่องทำงาน — ยิ่งยืดช่วงหยุดกด ยิ่งแย่' },
        ],
      },
    },
    {
      choice: {
        q: 'หลัง shock ครั้งแรก — คุณกดมาเกือบ 2 นาทีแล้ว แขนเริ่มล้า',
        options: [
          {
            tgt: 'CPR', label: 'กดต่อทันที + นัดสลับคนกดตอนครบรอบวิเคราะห์หน้า', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'ผมต่อเองครับ! <span class="cbs-em">สลับตอนเครื่องวิเคราะห์ จะได้ไม่เสียจังหวะกด</span> — เปลี่ยน!', fx: { cpr: true } }, t: 6 },
              { say: { who: 'att_dech', pose: 'stern', text: 'ถูกต้อง — <span class="cbs-em">คนกดล้า = กดตื้นโดยไม่รู้ตัว</span> สลับทุก 2 นาทีตอนจังหวะหยุดที่มีอยู่แล้ว' }, t: 4 },
            ],
          },
          { tgt: 'CPR', label: 'ฝืนกดคนเดียวต่อไปเรื่อย ๆ ไม่บอกใคร', ok: false, why: 'คุณภาพการกดตกเงียบ ๆ เมื่อล้า — วางแผนสลับคนทุก 2 นาที' },
          { tgt: 'YOU', label: 'หยุดพักดื่มน้ำก่อนค่อยกดต่อ', ok: false, why: 'หยุดกด = เลือดหยุดไหล — สลับให้เพื่อนกดแทน ไม่ใช่หยุดทั้งคู่', worsen: true },
        ],
      },
    },
    { skip: 'CPR คุณภาพสูงต่อเนื่อง สลับคนกดตามรอบ — ทีม ACLS กำลังวิ่งมา', t: 120 },
    {
      choice: {
        q: 'ทีม ACLS มาถึงพร้อมหมอเวร',
        options: [
          {
            tgt: 'YOU', label: 'รายงานสั้น: "พบไม่ตอบสนอง xx:xx เริ่มกดทันที shock แล้ว 1 ครั้ง" — กดต่อจนทีมสั่งเปลี่ยน', ok: true,
            then: [
              { say: { who: 'att_dech', pose: 'talk', text: 'รับทราบ — ข้อมูลครบ เวลาเป๊ะ <span class="cbs-em">ทีมรับช่วงต่อ</span> เตรียมยา เตรียมใส่ท่อ' }, t: 5 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'เดี๋ยวนะ… จอขึ้น sinus — <span class="cbs-em">คลำชีพจรได้แล้วค่ะ!</span>', fx: { rosc: true } }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดกดทุกอย่างทันทีที่ทีมโผล่มา ถอยไปเงียบ ๆ', ok: false, why: 'CPR ต้องต่อเนื่องจนทีมพร้อมรับช่วง และเขาต้องการข้อมูลจากคุณ — คุณคือคนเดียวที่รู้เหตุการณ์', worsen: true },
          { tgt: 'YOU', label: 'เล่าประวัติผู้ป่วยยาวเหยียดตั้งแต่แรกรับ', ok: false, why: 'ส่งเวรตอน code ต้องสั้นและตรงประเด็น: พบเมื่อไหร่ ทำอะไรไปแล้ว shock กี่ครั้ง' },
        ],
      },
    },
    {
      choice: {
        q: 'ROSC — ทีม ACLS ดูแลต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ช่วยวัดสัญญาณชีพ เตรียมย้าย ICU และบันทึกเหตุการณ์ตามเวลา', ok: true,
            then: [
              { inter: 'ส่งเวรสมบูรณ์!', green: true, t: 4 },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก — <span class="cbs-em">ROSC เกิดจาก BLS คุณภาพสูงของทีมคุณ</span> ก่อนยาหรือท่อช่วยหายใจใด ๆ จะมาถึงด้วยซ้ำ' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'ถือว่าหมดหน้าที่ เดินกลับไปทำงานอื่นเลย', ok: false, why: 'หลัง ROSC ยังต้องเฝ้าระวังใกล้ชิด + บันทึกเหตุการณ์ — ทีมยังต้องการคุณ' },
          { tgt: 'CPR', label: 'ขอกดหน้าอกต่ออีกหน่อยเผื่อหัวใจหยุดอีก', ok: false, why: 'มีชีพจรแล้วห้ามกด — เฝ้าระวังและพร้อมเริ่มใหม่ถ้าหยุดอีกเท่านั้น', worsen: true },
        ],
      },
    },
    { end: true },
  ],
};
