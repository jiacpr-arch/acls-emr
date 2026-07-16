// Megacode/Case evaluation checklist — Tachycardia
// Digitised from the JIA "ใบประเมิน Case/Megacode: ภาวะหัวใจเต้นเร็ว (Tachycardia)" form.
// Team Leader runs the ACLS Tachycardia Algorithm; ★ items are critical steps
// that must ALL pass for an overall PASS, regardless of raw score.

export default {
  id: 'tachycardia',
  title: 'ใบประเมิน Case/Megacode: ภาวะหัวใจเต้นเร็ว (Tachycardia)',
  subtitle: 'ประเมินบทบาท Team Leader วิ่ง ACLS Tachycardia Algorithm (สำหรับบุคลากรทางการแพทย์ — ACLS Provider)',
  scenario: 'สถานการณ์: ผู้ป่วยในหอผู้ป่วยมีอาการใจสั่น แน่นหน้าอก หรือความดันโลหิตต่ำ พยาบาลตรวจพบชีพจรเต้นเร็วผิดปกติและตามทีม ผู้เข้ารับการประเมินรับบทบาท Team Leader นำทีมประเมินและรักษาผู้ป่วยตามลำดับขั้นของ ACLS Tachycardia Algorithm (ผู้สอนกำหนดชนิดจังหวะ เช่น SVT, AF with RVR, VT with pulse) จนอาการคงที่หรือส่งต่อทีมขั้นสูง',
  passCriteria: { totalItems: 22, minPassed: 18, criticalRequired: true },
  sections: [
    {
      title: 'ส่วนที่ 1 การประเมินเบื้องต้นและ BLS Survey',
      items: [
        { id: 't1', text: 'ประเมินการตอบสนอง การหายใจ และชีพจรเบื้องต้น (BLS survey) ก่อนเริ่มขั้นตอนขั้นสูง', critical: true },
        { id: 't2', text: 'เปิดทางเดินหายใจให้โล่ง และให้ออกซิเจนหากพบภาวะพร่องออกซิเจน', critical: false },
        { id: 't3', text: 'ต่อเครื่อง monitor คลื่นไฟฟ้าหัวใจ วัด SpO2 และวัดความดันโลหิต', critical: true },
        { id: 't4', text: 'สั่งเปิดเส้นเลือด (IV access) ให้ทันเวลา', critical: true },
        { id: 't5', text: 'ทำ 12-lead ECG หากทำได้ โดยไม่ทำให้การรักษาหลักล่าช้าออกไป', critical: false },
      ],
    },
    {
      title: 'ส่วนที่ 2 การระบุจังหวะและประเมินความรุนแรง',
      items: [
        { id: 't6', text: 'ระบุจากจอ monitor ได้ถูกต้องว่าเป็น tachycardia (อัตราหัวใจ > 100 ครั้ง/นาที และเร็วเกินกว่าจะอธิบายได้จากสาเหตุทางสรีรวิทยาปกติ)', critical: true },
        { id: 't7', text: 'ประเมินอาการ/อาการแสดงที่บ่งชี้ภาวะไม่คงที่ (unstable): ความดันโลหิตต่ำ ระดับความรู้สึกตัวเปลี่ยนแปลงเฉียบพลัน ภาวะช็อก เจ็บแน่นหน้าอกจากหัวใจขาดเลือด หรือหัวใจล้มเหลวเฉียบพลัน', critical: true },
        { id: 't8', text: 'สรุปและสื่อสารกับทีมได้ถูกต้องว่าผู้ป่วยอยู่ในภาวะ "stable" หรือ "unstable tachycardia" ก่อนตัดสินใจรักษา', critical: true },
      ],
    },
    {
      title: 'ส่วนที่ 3 การรักษา Unstable Tachycardia',
      items: [
        { id: 't9', text: 'สั่งทำ synchronized cardioversion ทันทีเมื่อประเมินว่า unstable โดยไม่ชักช้า', critical: true },
        { id: 't10', text: 'พิจารณาให้ยาระงับความรู้สึก (sedation) ก่อนช็อก หากผู้ป่วยยังรู้สึกตัวและเวลาเอื้ออำนวย', critical: false },
        { id: 't11', text: 'กรณี regular narrow-complex ที่ unstable อาจพิจารณาให้ Adenosine ระหว่างเตรียมเครื่อง cardioversion หากไม่ทำให้การรักษาล่าช้า', critical: false },
      ],
    },
    {
      title: 'ส่วนที่ 4 การประเมิน Stable Tachycardia: QRS กว้าง (Wide Complex ≥ 0.12 วินาที)',
      items: [
        { id: 't12', text: 'ประเมินความกว้างของ QRS จาก ECG/monitor ได้ถูกต้องว่าแคบหรือกว้าง', critical: true },
        { id: 't13', text: 'กรณี wide-complex regular monomorphic อาจพิจารณาให้ Adenosine เพื่อช่วยวินิจฉัย/รักษา', critical: false },
        { id: 't14', text: 'พิจารณาให้ยา antiarrhythmic infusion (เช่น procainamide, amiodarone, sotalol) และปรึกษาผู้เชี่ยวชาญสำหรับ wide-complex tachycardia ที่ไม่ทราบชนิดแน่ชัดหรือ polymorphic', critical: false },
      ],
    },
    {
      title: 'ส่วนที่ 5 การประเมิน Stable Tachycardia: QRS แคบ (Narrow Complex < 0.12 วินาที)',
      items: [
        { id: 't15', text: 'กรณี narrow-complex regular: ทำ vagal maneuvers ก่อนเป็นลำดับแรก', critical: true },
        { id: 't16', text: 'หากไม่ตอบสนองต่อ vagal maneuvers: ให้ Adenosine 6 มก. IV push อย่างรวดเร็ว ตามด้วย NSS flush ทันที', critical: true },
        { id: 't17', text: 'หากยังไม่ conversion ให้ Adenosine 12 มก. ซ้ำได้อีก 1 ครั้ง (สูงสุดรวม 2 ครั้งของขนาด 12 มก.)', critical: false },
        { id: 't18', text: 'กรณี narrow-complex irregular (สงสัย atrial fibrillation/flutter/MAT): ควบคุมอัตราด้วยยากลุ่ม beta-blocker หรือ calcium channel blocker และปรึกษาผู้เชี่ยวชาญ', critical: false },
      ],
    },
    {
      title: 'ส่วนที่ 6 การประเมินซ้ำและการทำงานเป็นทีม',
      items: [
        { id: 't19', text: 'ประเมินซ้ำหลังให้ยา/ทำหัตถการทุกครั้ง (ชีพจร ความดันโลหิต จังหวะหัวใจ อาการทางคลินิก)', critical: true },
        { id: 't20', text: 'สื่อสารแบบ closed-loop และมอบหมายบทบาทหน้าที่ให้ทีมชัดเจน (ยา, IV, monitor, บันทึกเวลา)', critical: false },
        { id: 't21', text: 'ปรับเปลี่ยนแผนการรักษาทันทีเมื่ออาการเปลี่ยนแปลง เช่น อาการแย่ลงจนไม่มีชีพจร (pulseless) ต้องเปลี่ยนไปใช้ Cardiac Arrest Algorithm ทันที', critical: true },
        { id: 't22', text: 'บันทึกเวลาที่ให้ยา/ทำหัตถการ และขนาดยาที่ให้ถูกต้องครบถ้วน', critical: false },
      ],
    },
  ],
  reference: 'ACLS Tachycardia Algorithm — แนวทางการช่วยชีวิตของคณะกรรมการมาตรฐานการช่วยชีวิต (TRC) สมาคมแพทย์โรคหัวใจแห่งประเทศไทยฯ และ AHA Guidelines for CPR and ECC ฉบับปัจจุบัน',
};
