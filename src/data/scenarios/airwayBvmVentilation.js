// เคส Airway Management: Bag-Mask Ventilation คนเดียว — EC-clamp, seal, จังหวะบีบ, ป้องกันลมเข้ากระเพาะ
export const airwayBvmVentilation = {
  id: 'aw-bvm-01',
  title: 'หยุดหายใจหลัง Overdose',
  subtitle: 'ชายวัย 30 ปี พบหมดสติข้างถนน ไม่หายใจ ญาติสงสัยใช้ยาเกินขนาด ชีพจรยังคลำได้',
  level: 'intermediate',
  track: 'ventilation',
  course: 'airway',
  hiddenCause: null,
  story: [
    { say: { who: 'att_dech', pose: 'stern', text: 'ไม่หายใจ แต่ชีพจรยังมี — ต้อง bag-mask ทันที เริ่มอย่างไรดี?' }, t: 4 },
    { say: { who: 'krit_airway', pose: 'talk', text: 'หมอกฤตครับ… overdose กดศูนย์หายใจ แต่หัวใจยังเต้น — <span class="cbs-em">แค่ช่วยหายใจให้ถูกวิธี เขารอด</span> ทำตามผมทีละขั้นครับ' }, t: 4 },
    {
      choice: {
        q: 'ผู้ป่วยไม่หายใจแต่ยังมีชีพจร จะเริ่มช่วยหายใจอย่างไร?',
        options: [
          {
            tgt: 'AIRWAY', label: 'เปิดทางเดินหายใจ + ใส่ OPA ก่อนเริ่ม bag-mask', ok: true,
            then: [{ say: { who: 'boy_compressor', pose: 'talk', text: 'OPA เข้าที่แล้วครับ พร้อม bag ต่อ' }, t: 4 }],
          },
          { tgt: 'YOU', label: 'เริ่ม bag-mask ทันทีโดยไม่เปิดทางเดินหายใจก่อน', ok: false, why: 'ไม่เปิดทางเดินหายใจก่อน อากาศจะเข้าไม่เต็มที่ ทำให้ ventilate ไม่ได้ผล' },
          { tgt: 'YOU', label: 'รอท่อช่วยหายใจ (ET tube) มาก่อนค่อยช่วยหายใจ', ok: false, why: 'ห้ามรอ — bag-mask ต้องเริ่มทันทีระหว่างเตรียมอุปกรณ์ขั้นสูง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'จะจับ mask อย่างไรให้ seal แน่น (ช่วยหายใจคนเดียว)?',
        options: [
          {
            tgt: 'AIRWAY', label: 'จับแบบ E-C clamp มือเดียว', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'talk', text: 'นิ้วโป้ง-นิ้วชี้ทำตัว C กดขอบ mask… อีกสามนิ้วทำตัว E เกี่ยว<span class="cbs-em">ขอบกระดูกกราม</span> — ยกกรามขึ้นหา mask ไม่ใช่กด mask ลงหาหน้าครับ' }, t: 4 },
              { say: { who: 'nurse_mint', pose: 'talk', text: 'seal ดีค่ะ อกยกตอนบีบ bag' }, t: 4 },
            ],
          },
          { tgt: 'AIRWAY', label: 'กดมาสก์ลงแรง ๆ ด้วยฝ่ามือ', ok: false, why: 'กดแรงเกินอาจกดจมูก/ปากจนรั่ว seal ไม่สนิท — ใช้เทคนิค E-C clamp' },
          { tgt: 'AIRWAY', label: 'ใช้แค่ 2 นิ้วจับขอบมาสก์', ok: false, why: 'seal ไม่พอ อากาศรั่วออกด้านข้าง — ใช้ E-C clamp เต็มมือ' },
        ],
      },
    },
    {
      choice: {
        q: 'บีบ bag แล้วอกไม่ค่อยยก จะทำอะไรก่อน?',
        options: [
          {
            tgt: 'AIRWAY', label: 'ปรับท่าศีรษะ (re-tilt) + เช็ค seal ใหม่ก่อนเป่าซ้ำ', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'talk', text: 'ฟังดูครับ… เสียงลมรั่วข้างแก้มหายไปแล้ว — <span class="cbs-em">seal สนิท</span> อกยกพอดี ไม่ต้องบีบแรงกว่านี้' }, t: 4 },
              { say: { who: 'att_dech', pose: 'talk', text: 'ดี — อกยกขึ้นแล้ว ต่อเนื่องแบบนี้' }, t: 4 },
            ],
          },
          { tgt: 'YOU', label: 'บีบ bag แรงและถี่ขึ้นทันที', ok: false, why: 'บีบแรง/เร็วเกินไม่ช่วยถ้าท่าศีรษะหรือ seal ยังไม่ดี อาจดันลมเข้ากระเพาะแทน', worsen: true },
          { tgt: 'AIRWAY', label: 'เรียกคนที่สองมาช่วยจับ 2 มือทันทีโดยไม่เช็คท่าก่อน', ok: false, why: 'เช็คท่าและ seal คนเดียวก่อน ถ้ายังไม่ดีค่อยเรียกช่วย 2 คน' },
        ],
      },
    },
    {
      choice: {
        q: 'จะบีบ bag ด้วยจังหวะ/ปริมาณเท่าไหร่ไม่ให้ลมเข้ากระเพาะ?',
        options: [
          {
            tgt: 'AIRWAY', label: 'บีบพอให้อกยกเบา ๆ ทุก 6 วินาที (10 ครั้ง/นาที)', ok: true,
            then: [
              { say: { who: 'krit_airway', pose: 'stern', text: 'ช้า ๆ ครับ… หนึ่งครั้งทุก 6 วินาที <span class="cbs-em">อย่า hyperventilate</span> — บีบถี่เกิน ความดันในอกสูง เลือดกลับหัวใจน้อยลง' }, t: 4 },
              { skip: 'ช่วยหายใจต่อเนื่อง สังเกต SpO2 ค่อย ๆ ขึ้น', t: 20 },
            ],
          },
          { tgt: 'AIRWAY', label: 'บีบเต็มถุงให้เร็วที่สุดทุกครั้ง', ok: false, why: 'บีบแรง/เร็วเกินดันลมเข้ากระเพาะ เสี่ยงสำลัก และลดเลือดไหลกลับหัวใจ', worsen: true },
          { tgt: 'AIRWAY', label: 'บีบห่าง ๆ ทุก 15 วินาทีเผื่อลมเข้ากระเพาะ', ok: false, why: 'ช้าเกินไป ผู้ป่วยจะขาดออกซิเจน — จังหวะที่ถูกต้องคือทุก 6 วินาที' },
        ],
      },
    },
    {
      choice: {
        q: 'SpO2 ขึ้นมา 96% ชีพจรแรงขึ้น จะทำอะไรต่อ?',
        options: [
          {
            tgt: 'YOU', label: 'ช่วยหายใจต่อเนื่อง + เตรียมส่งต่อ/พิจารณาทางเดินหายใจขั้นสูงถ้าต้องช่วยนาน', ok: true,
            then: [
              { inter: 'หายใจดีขึ้นแล้ว!', green: true, t: 4 },
              { say: { who: 'nurse_mint', pose: 'happy', text: 'SpO2 96% ชีพจรแรงขึ้นค่ะ ส่งต่อ ER ได้เลย' }, t: 5 },
            ],
          },
          { tgt: 'YOU', label: 'หยุดบีบ bag เพราะ SpO2 ขึ้นแล้ว', ok: false, why: 'ผู้ป่วยยังไม่หายใจเอง ต้องช่วยหายใจต่อเนื่องจนหายใจเองหรือส่งต่อทีมขั้นสูง' },
          { tgt: 'AIRWAY', label: 'ถอด OPA ออกเพราะกลัวสำลัก', ok: false, why: 'ยังไม่หายใจเอง — ทิ้ง OPA ไว้ช่วยเปิดทาง จนกว่าจะรู้สึกตัว' },
        ],
      },
    },
    { end: true },
  ],
};
