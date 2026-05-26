// Static fallback content, ported from the original acls-emr Vite app
// (src/data/alsContent.js, src/data/qaDeepContent.js). Used when the Supabase
// fetch fails so the reader still renders. Live DB content takes precedence.
import type { AclsChapter, QaDeepData } from "./content-types";

export const staticChapters: AclsChapter[] = [
  {
    id: "ch1",
    title: "บทที่ 1: ภาพรวม ALS",
    icon: "📚",
    sections: [
      { heading: "ALS คืออะไร", body: "Advanced Life Support (ALS) คือระบบการช่วยชีวิตขั้นสูง ครอบคลุมการจัดการทางเดินหายใจ, การให้ยา, การอ่านจังหวะหัวใจ และการ defibrillation โดยทีมแพทย์และพยาบาลที่ผ่านการฝึกอบรม" },
      { heading: "Chain of Survival", body: "ห่วงโซ่แห่งการรอดชีวิต: 1) รู้เร็ว-โทรเร็ว 2) CPR เร็ว 3) Defibrillation เร็ว 4) ALS เร็ว 5) ดูแลหลังกู้ชีพ — ทุกห่วงสำคัญเท่ากัน ขาดห่วงใดผลลัพธ์จะแย่ลงอย่างมาก" },
      { heading: "ทีม ALS", body: "ประกอบด้วย: Team Leader (สั่งการ), Airway (ดูแลทางหายใจ), Compressor (กดหน้าอก), Drug Admin (ให้ยา), Recorder (จดบันทึก) — การสื่อสารแบบ closed-loop สำคัญมาก" },
    ],
  },
  {
    id: "ch2",
    title: "บทที่ 2: การประเมินผู้ป่วยฉุกเฉิน",
    icon: "🔍",
    sections: [
      { heading: "Primary Survey (ABCDE)", body: "A-Airway: ทางเดินหายใจเปิดโล่ง? B-Breathing: หายใจได้ดี? C-Circulation: ชีพจร/ความดัน? D-Disability: ระดับความรู้สึกตัว (AVPU/GCS)? E-Exposure: ตรวจทั้งตัว หาสาเหตุ" },
      { heading: "Secondary Survey", body: "ซักประวัติ SAMPLE: S-Signs/Symptoms, A-Allergies, M-Medications, P-Past history, L-Last meal, E-Events — พร้อมตรวจร่างกายอย่างละเอียด head-to-toe" },
      { heading: "Pulse Check", body: "คลำชีพจร carotid (ผู้ใหญ่) หรือ brachial (ทารก) ไม่เกิน 10 วินาที ถ้าไม่แน่ใจว่ามีชีพจร ให้เริ่ม CPR ทันที" },
    ],
  },
  {
    id: "ch3",
    title: "บทที่ 3: ทางเดินหายใจ",
    icon: "🫁",
    sections: [
      { heading: "Basic Airway", body: "Head tilt-Chin lift (ห้ามใช้ถ้าสงสัย C-spine injury), Jaw thrust, OPA (Oropharyngeal airway), NPA (Nasopharyngeal airway) — BVM ต้องจับให้แนบ ใช้เทคนิค EC-clamp" },
      { heading: "Advanced Airway", body: "ETT (Endotracheal tube): gold standard แต่ต้องชำนาญ, LMA/i-gel: ใส่ง่ายกว่า เหมาะกับ non-expert — หลังใส่ต้องยืนยันตำแหน่งด้วย EtCO2 waveform capnography" },
      { heading: "การช่วยหายใจขณะ CPR", body: "ไม่มี advanced airway: 30:2 (กด 30 ครั้ง หายใจ 2 ครั้ง) / มี advanced airway: กดต่อเนื่อง 100-120/min + หายใจ 1 ครั้งทุก 6 วินาที (10/min)" },
    ],
  },
  {
    id: "ch4",
    title: "บทที่ 4: จังหวะหัวใจ",
    icon: "💓",
    sections: [
      { heading: "อ่าน EKG 6 ขั้น", body: "1) Rate: นับ QRS ใน 6 วินาที × 10 — <60 brady, >100 tachy / 2) Rhythm: สม่ำเสมอ? วัด R-R interval / 3) P wave: มีหรือไม่? นำทุก QRS หรือไม่? / 4) PR interval: ปกติ 0.12-0.20s — ยาว = AV block / 5) QRS width: แคบ <0.12s (supraventricular) vs กว้าง ≥0.12s (ventricular หรือ BBB) / 6) ST/T: ยก/กด = ischemia, T inverted, QT ยาว" },
      { heading: "Shockable Rhythms", body: "VF (Ventricular Fibrillation): เส้นหยักไม่เป็นระเบียบ — pVT (Pulseless VT): QRS กว้าง เร็ว ไม่มีชีพจร — ทั้งสองต้อง Defibrillate ทันที 120-200J biphasic" },
      { heading: "Non-Shockable Rhythms", body: "PEA (Pulseless Electrical Activity): มี rhythm บนจอแต่คลำชีพจรไม่ได้ — Asystole: เส้นตรง — ทั้งสองห้าม shock ให้ CPR + Epinephrine ทันที + หาสาเหตุ H&T" },
      { heading: "Bradycardia & Tachycardia", body: "Bradycardia <60/min + อาการ → Atropine → TCP / Tachycardia แยก narrow vs wide QRS, stable vs unstable → unstable = cardioversion ทันที" },
      { heading: "Tips แยกจังหวะ", body: "Narrow + Regular = Sinus tach / SVT — Narrow + Irregular = AF / Aflutter เปลี่ยน block — Wide + Regular = VT (สมมติว่า VT จนพิสูจน์ได้ว่าไม่ใช่) — Wide + Irregular = TdP / AF c WPW — Flat line ต้องเช็ค lead ก่อนสรุป asystole" },
    ],
  },
  {
    id: "ch5",
    title: "บทที่ 5: การกู้ชีพ",
    icon: "⚡",
    sections: [
      { heading: "CPR คุณภาพสูง", body: "กดลึก 5-6 cm, เร็ว 100-120/min, ปล่อยให้หน้าอกคืนตัวเต็มที่, หยุดน้อยที่สุด (CCF >80%), สลับคนกดทุก 2 นาที" },
      { heading: "Defibrillation", body: "ชนิด biphasic: 120-200J (ตามผู้ผลิต), monophasic: 360J — วาง paddle: Anterior-Lateral (ขวาไหปลาร้า, ซ้ายรักแร้) — Shock แล้ว CPR ต่อทันที 2 นาที ไม่ต้องเช็ค rhythm" },
      { heading: "วงรอบ ALS", body: "CPR 2 min → Check Rhythm → Shockable? Shock แล้ว CPR ต่อ / Non-shockable? CPR ต่อ → Epi ทุก 3-5 min → Amiodarone หลัง shock ครั้งที่ 3 → หา H&T ตลอด" },
    ],
  },
  {
    id: "ch6",
    title: "บทที่ 6: ยาฉุกเฉิน",
    icon: "💉",
    sections: [
      { heading: "Epinephrine (Adrenaline)", body: "Cardiac arrest: 1 mg IV/IO ทุก 3-5 min — Bradycardia: 2-10 mcg/min drip — Anaphylaxis: 0.3-0.5 mg IM — เป็นยาหลักที่ต้องให้เร็วที่สุดใน non-shockable rhythm" },
      { heading: "Amiodarone", body: "VF/pVT ที่ดื้อต่อ shock: ครั้งแรก 300 mg IV bolus, ครั้งที่สอง 150 mg — ผสม D5W — ระวัง hypotension" },
      { heading: "ยาอื่นที่สำคัญ", body: "Atropine 1mg IV (bradycardia, max 3mg) / Adenosine 6-12-12mg rapid push (SVT) / Magnesium 1-2g IV (Torsades) / NaHCO3 1mEq/kg (hyperkalemia, TCA overdose)" },
    ],
  },
  {
    id: "ch7",
    title: "บทที่ 7: สถานการณ์พิเศษ",
    icon: "🚨",
    sections: [
      { heading: "Drowning (จมน้ำ)", body: "ให้ rescue breaths เร็ว เพราะสาเหตุคือ hypoxia — ถ้าสงสัย C-spine injury ให้ระวัง — อาจต้อง suction น้ำ — hypothermia ร่วมด้วยบ่อย" },
      { heading: "Anaphylaxis", body: "Epinephrine 0.3-0.5mg IM ต้นขาด้านข้าง ทันที ซ้ำได้ทุก 5-15 min — IV fluid bolus — Antihistamine + Steroid เสริม — เตรียม intubation ถ้าบวมทางหายใจ" },
      { heading: "Pregnancy", body: "ดันมดลูกไปทางซ้าย (left uterine displacement) ตลอดเวลา CPR — C-section ภายใน 5 นาทีถ้า CPR ไม่ตอบสนอง (Perimortem cesarean delivery)" },
    ],
  },
  {
    id: "ch8",
    title: "บทที่ 8: การดูแลหลังกู้ชีพ",
    icon: "🌡️",
    sections: [
      { heading: "Post-ROSC Targets", body: "SpO2 90-98% (avoid hypoxia + hyperoxia), PaCO2 35-45, MAP ≥65 mmHg (hard target — Norepinephrine first-line), Glucose 70-180 mg/dL, Temperature Control 32–37.5°C อย่างน้อย 36 ชม." },
      { heading: "Temperature Control (เปลี่ยนชื่อจาก TTM)", body: "เป้าหมายอุณหภูมิ 32–37.5°C ต่อเนื่อง ≥ 36 ชม. — ครอบคลุมทั้ง hypothermic, normothermic และการป้องกันไข้ — ใช้ cooling blanket / intravascular; หลีกเลี่ยง prehospital cold IV fluid (เพิ่มความเสี่ยง pulmonary edema, re-arrest) — sedation ขณะ shivering — rewarming ช้าๆ 0.25-0.5°C/hr" },
      { heading: "Neuroprognostication", body: "เลื่อนอย่างน้อย 72 ชม. หลัง return to normothermia + หยุด sedation/paralytic — ใช้ multimodal: clinical exam, EEG, CT/MRI, NSE, SSEP — อย่าตัดสินเร็วเกินไป" },
    ],
  },
  {
    id: "ch9",
    title: "บทที่ 9: การช่วยชีวิตเมื่ออาหารติดคอ (Choking)",
    icon: "🫁",
    sections: [
      {
        qa: [
          {
            q: "การทุบหลังทำให้สิ่งแปลกปลอมหลุดจากการสำลักได้อย่างไร?",
            images: [
              {
                src: "/images/als/choking-overview.png",
                alt: "ผลสัมฤทธิ์ทางการแพทย์ของการช่วยชีวิตเมื่ออาหารติดคอ",
                caption: "สรุปกลไกทางชีวฟิสิกส์ พลศาสตร์ของไหล และตัวชี้วัดผลลัพธ์ของการทุบหลังและการกดท้อง",
              },
            ],
            a: `
การทุบหลัง (Back blows) เป็นเทคนิคปฐมพยาบาลพื้นฐานที่ใช้ช่วยเหลือผู้ที่มีสิ่งกีดขวางทางเดินหายใจจากการสำลัก

## กลไกการทำงาน

**1. สร้างแรงดันและกระแสอากาศ**
- การทุบแรงๆ ระหว่างสะบักทั้งสองข้างจะสร้าง **แรงสั่นสะเทือน** และ **เพิ่มแรงดันในช่องทรวงอก** ชั่วคราว
- แรงดันนี้จะดันให้อากาศในปอดพัดขึ้นมาด้านบน เหมือนเวลาเราเป่าลมแรงๆ

**2. ใช้หลักการไอเทียม**
- การทุบหลังคล้ายการไออย่างรุนแรง
- สร้างแรงลมดันให้สิ่งกีดขวางถูกผลักออกจากทางเดินหายใจ

**3. การเคลื่อนที่ของไดอะแฟรม**
- แรงกระแทกจากการทุบส่งผลให้ **ไดอะแฟรมเคลื่อนตัวขึ้นกะทันหัน**
- ทำให้ปริมาตรในปอดลดลงอย่างรวดเร็ว และดันให้อากาศพร้อมกับสิ่งกีดขวางถูกขับออก

## เทคนิคที่ถูกต้อง

### สำหรับผู้ใหญ่และเด็กโต
1. ยืนด้านหลังผู้ป่วย โน้มตัวผู้ป่วยไปด้านหน้าเล็กน้อย
2. วางมือข้างหนึ่งไว้ที่หน้าอกผู้ป่วยเพื่อประคอง
3. ใช้สันมือของอีกข้างทุบแรงๆ ระหว่างสะบักทั้งสองข้าง **5 ครั้ง**
4. ทุบในแนวจากด้านหลังไปด้านหน้าและขึ้นด้านบน

### สำหรับทารก
1. วางทารกนอนคว่ำบนแขน โดยศีรษะต่ำกว่าลำตัว
2. ใช้สันมือทุบเบาๆ ระหว่างสะบัก **5 ครั้ง**

> ⚠️ **ข้อควรระวัง**
> - ต้องโน้มตัวผู้ป่วยไปด้านหน้า เพื่อให้สิ่งกีดขวางถูกขับออกทางปาก ไม่ใช่ดันลงไปลึกกว่า
> - ใช้แรงที่เหมาะสม ไม่แรงเกินไปจนทำให้เกิดการบาดเจ็บ
> - หากทุบหลัง 5 ครั้งไม่ได้ผล ให้สลับกับ **การกดท้อง (Heimlich maneuver)**

## ผลสัมฤทธิ์ทางการแพทย์โดยละเอียด

### 1. กลไกทางชีวฟิสิกส์ของการทุบหลัง
**การสร้างแรงดันภายในทางเดินหายใจ** — แรงกระแทกที่สันมือบริเวณระหว่างสะบัก (T1–T6):
- สร้างความเร่ง **50–100 m/s²** ในเนื้อปอด
- เพิ่มแรงดันภายในทรวงอก **40–60 cmH₂O** ชั่วคราว
- สร้าง peak expiratory flow **300–400 L/min** (เทียบกับการไอปกติ 100–200 L/min)

**การเปลี่ยนแปลงทางกลศาสตร์ของระบบหายใจ**
- ไดอะแฟรมเคลื่อนขึ้นกะทันหัน **2–3 cm**
- ลดปริมาตรปอด **0.3–0.5 ลิตร** ใน 0.2–0.3 วินาที
- ความเร็วอากาศในหลอดลม **5–8 m/s**

### 2. พลศาสตร์ของไหลในทางเดินหายใจ
**แรงที่เกิดกับสิ่งกีดขวาง**
- แรงยก (Lift force) **0.5–2.0 N**
- แรงลาก (Drag force) **1.5–3.0 N**
- ความเร่งของสิ่งกีดขวาง **10–30 m/s²**

**ประสิทธิภาพการกำจัด** สำหรับสิ่งกีดขวางขนาด 1–3 cm³
- อัตราความสำเร็จ **65–75%** ในการเคลื่อนย้ายสู่คอหอย
- ใช้เวลา **0.5–1.5 วินาที** หลังได้รับการทุบ

### 3. ผลทางสรีรวิทยาของการกดท้อง (Heimlich)
**กลไกการทำงาน** — กดใต้ลิ้นปี่ขึ้นด้านบน 45°:
- ลดปริมาตรปอด **0.5–0.8 ลิตร**
- เพิ่มแรงดันภายในปอด **60–100 cmH₂O**
- ความเร็วอากาศในหลอดลมใหญ่ **8–12 m/s**

**การตอบสนองของระบบประสาท**
- กระตุ้นเส้นประสาทเวกัส (Vagus nerve)
- ยับยั้งการหายใจชั่วคราว 1–2 วินาที
- กระตุ้นศูนย์การไอในก้านสมอง

### 4. ตัวชี้วัดผลลัพธ์ทางการแพทย์
**ประสิทธิภาพโดยรวม**

| เทคนิค | กำจัดบางส่วน | กำจัดสมบูรณ์ |
|---|---|---|
| ทุบหลังเพียงอย่างเดียว | 45–55% | 25–35% |
| ทุบหลัง + กดท้อง | 75–85% | ลด hypoxia 60–70% |

**ผลต่อ SaO₂**
- ก่อนช่วยเหลือ: มักต่ำกว่า **80%** (เสี่ยงอันตราย)
- หลังช่วยเหลือสำเร็จ: กลับสู่ **≥92%** ภายใน 2–3 นาที
- ป้องกันภาวะสมองขาดออกซิเจนได้หากช่วยเหลือภายใน **4 นาที**

### 5. ภาวะแทรกซ้อนที่อาจเกิดขึ้น
**จากการทุบหลัง**
- รอยฟกช้ำบริเวณหลัง **15–20%**
- กระดูกซี่โครงร้าว **2–3%** (ในผู้สูงอายุ)

**จากการกดท้อง**
- กระดูกซี่โครงร้าว **5–10%**
- การบาดเจ็บของตับหรือม้าม **1–2%**
- อาหาร regurgitation **20–30%**

### 6. ปัจจัยที่ส่งผลต่อความสำเร็จ
**ปัจจัยด้านผู้ป่วย**
- อายุและความแข็งแรงของกล้ามเนื้อหายใจ
- ขนาดและตำแหน่งของสิ่งกีดขวาง
- ระยะเวลาที่ขาดออกซิเจนก่อนช่วยเหลือ

**ปัจจัยด้านเทคนิค**
- แรงและทิศทางที่เหมาะสม
- ความเร็วในการให้ความช่วยเหลือ
- การประสานงานระหว่างทุบหลังและกดท้อง

## หลักการสำคัญ

> ✅ **สรุปประโยชน์ทางการแพทย์**
> - ช่วยเปิดทางเดินหายใจและช่วยให้กลับมาหายใจได้ปกติ
> - เพิ่มออกซิเจนในเลือดอย่างรวดเร็ว ป้องกันอวัยวะสำคัญเสียหาย
> - ลดความเสี่ยงภาวะหัวใจหยุดเต้นและเสียชีวิต
> - เป็นเทคนิคที่ทำได้ทันที ไม่ต้องใช้อุปกรณ์

> ⚠️ **หลักการสำคัญ**
> - โน้มตัวไปด้านหน้า เพื่อให้สิ่งกีดขวางออกทางปาก
> - ใช้แรงที่เหมาะสม ไม่รุนแรงเกินไป
> - หากไม่สำเร็จ ให้สลับทุบหลัง 5 ครั้ง กับการกดท้อง 5 ครั้ง จนกว่าจะสำเร็จหรือผู้ช่วยเหลือมาถึง
`,
          },
        ],
      },
    ],
  },
];

export const staticQaDeep: QaDeepData = {
  page: {
    title: "Q&A ACLS เชิงลึก",
    intro: "รวมคำถาม-คำตอบเชิงลึกประกอบ infographic สำหรับทบทวน ACLS",
    coverImage: null,
  },
  items: [
    {
      id: "static-1",
      chapterId: null,
      question: "ทำไมต้องกด CPR ต่อเนื่องโดยรบกวนให้น้อยที่สุด?",
      answer:
        "การหยุดกดแต่ละครั้งทำให้ **coronary perfusion pressure (CPP) ตกลงทันที** และต้องใช้เวลา 15–30 วินาทีของการกดต่อเนื่องเพื่อให้ CPP กลับมาสูงพอที่จะ perfuse หัวใจ\n\n- **Chest Compression Fraction (CCF) ≥ 60%** (AHA 2020) ยิ่งสูงยิ่งดี ตั้งเป้า 80%\n- หยุดกดเฉพาะตอน rhythm check, shock delivery, pulse check (รวมไม่เกิน 10 วินาที)\n- ใส่ advanced airway เพื่อกดต่อเนื่องโดยไม่ต้องหยุดหายใจ",
      cover: null,
      infographics: [],
    },
    {
      id: "static-2",
      chapterId: null,
      question: "Epinephrine ให้เมื่อไหร่ ใน shockable vs non-shockable rhythm?",
      answer:
        "### Non-shockable (Asystole / PEA)\nให้ **Epinephrine 1 mg IV/IO ทันทีที่ตั้ง IV ได้** แล้วซ้ำทุก 3–5 นาที\n\n### Shockable (VF / pVT)\nให้ **Epinephrine หลัง shock ครั้งที่ 2** (หลัง CPR + shock 2 ครั้งแล้วยังไม่ตอบสนอง)\nซ้ำทุก 3–5 นาที",
      cover: null,
      infographics: [],
    },
  ],
};
