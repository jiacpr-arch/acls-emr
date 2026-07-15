// เคส: Maternal cardiac arrest จาก severe preeclampsia/eclampsia (megacode)
// จุดสอน: CPR ในหญิงตั้งครรภ์ — manual left uterine displacement (LUD) +
//         ตำแหน่งกดหน้าอกปกติ + เตรียม resuscitative hysterotomy ภายใน ~4 นาที ·
//         asystole/PEA เป็น non-shockable · นึกถึงสาเหตุเฉพาะครรภ์ (eclampsia/Mg,
//         เลือดออก, PE, amniotic fluid embolism) · Calcium คือ antidote ของ Mg toxicity
export const preeclampsia = {
  id: 'preeclampsia-arrest-01',
  title: 'Maternal Arrest — คุณแม่ครรภ์เป็นพิษ',
  subtitle: 'หญิงอายุ 28 ปี G2P1A0 GA 36 สัปดาห์ severe preeclampsia BP 180/100 urine protein +++ แล้วหมดสติหัวใจหยุดเต้น',
  level: 'megacode',
  course: 'acls',
  hiddenCause: 'eclampsia',
  story: [
    { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คุณแม่เตียง 3 เกร็งชักแล้วหมดสติเลยค่ะ! <span class="cbs-em">ครรภ์ 36 สัปดาห์ ความดัน 180/100!</span>' }, t: 5 },
    { inter: 'CODE BLUE!!', drama: 'red', t: 0 },
    { say: { who: 'att_dech', pose: 'stern', text: 'เคสนี้มีสองชีวิต… <span class="cbs-em">severe preeclampsia ครรภ์ใกล้ครบกำหนด</span> คุณคือ Team Leader — เริ่มได้' }, t: 5 },
    {
      choice: {
        q: 'คำสั่งแรก',
        options: [
          {
            tgt: 'YOU', label: 'ประเมินการตอบสนอง + คลำชีพจร ≤10 วินาที + เรียกทีม (รวมสูติ/ทารกแรกเกิด)', ok: true,
            then: [
              { inter: 'ไม่มีชีพจร!!', drama: 'red', t: 8, fx: { alarm: true } },
              { say: { who: 'nurse_mint', pose: 'panic', text: 'คลำไม่ได้ค่ะ! <span class="cbs-em">Maternal cardiac arrest!</span>' }, t: 4 },
            ],
          },
          { tgt: 'DEFIB', label: 'แปะ pads แล้ว shock เลย', ok: false, why: 'ยังไม่รู้ rhythm และยังไม่ยืนยัน arrest — ประเมินก่อน' },
          { tgt: 'DRUG', label: 'ให้ MgSO4 ทันทีเพราะชัก', ok: false, why: 'ตอนนี้ไม่มีชีพจรหรือยังไม่รู้ — ต้องยืนยัน arrest + เริ่ม CPR ก่อน' },
        ],
      },
    },
    {
      choice: {
        q: 'ไม่มีชีพจร — หญิงตั้งครรภ์ครรภ์โต ทำอะไรก่อน',
        options: [
          {
            tgt: 'CPR', label: 'เริ่ม CPR คุณภาพสูง + manual left uterine displacement (LUD) + แปะ pads ดู rhythm', ok: true,
            then: [
              { say: { who: 'boy_compressor', pose: 'talk', text: 'เริ่มกดครับ! <span class="cbs-em">ตำแหน่งกดเหมือนผู้ใหญ่ปกติ</span> — มีคนช่วยดันมดลูกไปทางซ้ายแล้ว!', fx: { cpr: true, firstCPR: true } }, t: 8 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'จอขึ้นแล้วค่ะ… <span class="cbs-em">เส้นเรียบ ไม่มีคลื่นไฟฟ้าเลย</span>' }, t: 6 },
              { inter: 'ASYSTOLE!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
            ],
          },
          { tgt: 'YOU', label: 'กดหน้าอกต่ำลงมาที่ท้อง เพราะมดลูกดันหัวใจขึ้น', ok: false, why: 'ตำแหน่งกดหน้าอกเหมือนผู้ใหญ่ปกติ (กลางกระดูกอก) — ไม่ต้องเลื่อน สิ่งที่เพิ่มคือ LUD', worsen: true },
          { tgt: 'AIRWAY', label: 'ใส่ ET tube ก่อนเป็นอันดับแรก', ok: false, why: 'CPR + LUD มาก่อน advanced airway เสมอ', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'ดีมาก — <span class="cbs-em">LUD ลด aortocaval compression</span> ให้เลือดไหลกลับหัวใจ ถ้าลืมข้อนี้ กดแทบไม่มีผล' }, t: 4 },
    {
      choice: {
        q: 'Asystole — non-shockable ขั้นต่อไป',
        options: [
          {
            tgt: 'DRUG', label: 'CPR ต่อ + Epinephrine 1 mg IV (non-shockable)', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi 1 mg in!"</span> IV เส้นบนสะดือเปิดได้แล้วค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
              { skip: 'CPR ต่อเนื่อง — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'stern', text: 'Rhythm check… มีคลื่นขึ้นมาแล้ว แต่ช้ามาก' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'Charge 200 J แล้ว shock', ok: false, why: 'Asystole เป็น non-shockable! การ shock ไม่ช่วยและเสียเวลากด', worsen: true },
          { tgt: 'DRUG', label: 'Amiodarone 300 mg', ok: false, why: 'Amiodarone ใช้ใน VF/pVT — ไม่ใช่ asystole' },
        ],
      },
    },
    {
      choice: {
        q: 'จอเปลี่ยนเป็น sinus bradycardia rate 40 แต่คลำชีพจรไม่ได้ — คือจังหวะอะไร ทำอะไร',
        options: [
          {
            tgt: 'CPR', label: 'นี่คือ PEA — CPR ต่อ + LUD ต่อ + Epinephrine โดสที่สองตาม cycle', ok: true,
            then: [
              { inter: 'PEA!', drama: 'red', t: 4, fx: { rhythm: 'flat' } },
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"Epi dose 2 in!"</span> กดต่อเนื่องไม่หยุดค่ะ', fx: { epi: true, cpr: true } }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'มี rhythm แล้ว shock ได้เลย', ok: false, why: 'มีไฟฟ้าแต่ไม่มีชีพจร = PEA ยัง non-shockable — ห้าม shock', worsen: true },
          { tgt: 'YOU', label: 'มี rhythm rate 40 แปลว่า ROSC หยุดกดได้', ok: false, why: 'คลำชีพจรไม่ได้ = ยัง arrest (PEA) ต้องกดต่อ ห้ามหยุด', worsen: true },
        ],
      },
    },
    { say: { who: 'att_dech', pose: 'stern', text: 'กด 4 นาทีแล้วยังไม่กลับ… <span class="cbs-em">ในหญิงตั้งครรภ์ถ้าไม่ ROSC ใน ~4 นาที ต้องเตรียม resuscitative hysterotomy</span> และคิดสาเหตุเฉพาะครรภ์' }, t: 4 },
    {
      choice: {
        q: 'หาสาเหตุ + จัดการเฉพาะครรภ์ — คุณจะทำอะไร',
        options: [
          {
            tgt: 'YOU', label: 'เตรียม perimortem C-section (resuscitative hysterotomy) ให้ทันภายใน ~4-5 นาที + ทบทวนสาเหตุครรภ์', ok: true,
            then: [
              { say: { who: 'fon_defib', pose: 'panic', text: 'สูติแพทย์ถึงแล้ว! <span class="cbs-em">เตรียมผ่าคลอดฉุกเฉินที่ข้างเตียงเลยค่ะ</span> — ไม่ย้ายห้อง!' }, t: 8 },
              { say: { who: 'att_dech', pose: 'stern', text: 'การเอาทารกออกช่วยลด aortocaval compression และเพิ่มโอกาส ROSC ของแม่ — <span class="cbs-em">คิดถึง eclampsia/Mg, เลือดออก, PE, amniotic fluid embolism</span>' }, t: 6 },
            ],
          },
          { tgt: 'DEFIB', label: 'ลอง shock อีกครั้งเผื่อได้ผล', ok: false, why: 'PEA ยัง non-shockable — และไม่แก้สาเหตุเฉพาะครรภ์', worsen: true },
          { tgt: 'YOU', label: 'ย้ายผู้ป่วยไปห้องผ่าตัดก่อนค่อยผ่า', ok: false, why: 'ห้ามเสียเวลาย้าย — perimortem C-section ทำข้างเตียงระหว่าง CPR ต่อเนื่อง', worsen: true },
        ],
      },
    },
    {
      choice: {
        q: 'บริบท eclampsia — ยา/antidote ตัวไหนถูกต้อง',
        options: [
          {
            tgt: 'DRUG', label: 'ให้ Magnesium sulfate 1 g IV สำหรับ eclampsia/seizure prophylaxis; ถ้าสงสัย Mg toxicity เป็นเหตุ arrest ให้หยุด Mg + calcium gluconate เป็น antidote', ok: true,
            then: [
              { say: { who: 'nurse_mint', pose: 'talk', text: '<span class="cbs-em">"MgSO4 in!"</span> เตรียม calcium gluconate ไว้ข้างเตียงเผื่อ Mg toxicity แล้วค่ะ', fx: { cpr: true } }, t: 8 },
              { skip: 'CPR ต่อเนื่อง + ผ่าคลอดฉุกเฉิน — 2 นาที', t: 110 },
              { say: { who: 'fon_defib', pose: 'panic', text: 'ทารกออกแล้ว… <span class="cbs-em">คลำชีพจรแม่ได้แล้วค่ะ!!</span>' }, t: 6 },
            ],
          },
          { tgt: 'DRUG', label: 'ให้ calcium gluconate เป็นตัวหลักรักษา eclampsia', ok: false, why: 'Calcium เป็น antidote ของ Mg toxicity ไม่ใช่ยาหลักของ eclampsia — ยาหลักคือ MgSO4' },
          { tgt: 'DRUG', label: 'ให้ Epinephrine 5 mg เพิ่มขนาดให้แรง', ok: false, why: 'ขนาดผิด (Epi 1 mg เสมอ) และไม่จัดการบริบท eclampsia' },
        ],
      },
    },
    {
      choice: {
        q: 'มีชีพจรกลับมา (T 37°C, P 120, BP 140/100, R 10) — ทำอะไรต่อ',
        options: [
          {
            tgt: 'YOU', label: 'ROSC! post-arrest care + คุม BP/MgSO4 ต่อ + ดูแลทารกแรกเกิด + ICU สูติ', ok: true,
            then: [
              { inter: 'ROSC!!', green: true, t: 5, fx: { rosc: true } },
              { say: { who: 'att_dech', pose: 'happy', text: 'เยี่ยมมาก! คุณ<span class="cbs-em">ทำ LUD + กดตำแหน่งปกติ + ผ่าคลอดทันเวลา</span> — สองชีวิตรอดเพราะคุณคิดถึงสาเหตุเฉพาะครรภ์' }, t: 5 },
            ],
          },
          { tgt: 'DEFIB', label: 'Shock ย้ำให้ชัวร์', ok: false, why: 'มีชีพจรจังหวะปกติแล้ว — ห้าม shock' },
          { tgt: 'DRUG', label: 'Epi อีก 1 dose', ok: false, why: 'ROSC แล้ว ไม่ต้อง bolus Epi ต่อ' },
        ],
      },
    },
    { end: true },
  ],
};
