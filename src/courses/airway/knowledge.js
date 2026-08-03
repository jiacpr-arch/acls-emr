// คลังความรู้ Airway Management — เนื้อหาอ้างอิงเชิงลึก (ระดับ "ปรมาจารย์") สำหรับหน้า /knowledge
// Schema เดียวกับ src/data/alsContent.js / blsKnowledgeContent.js:
//   chapter = { id, title, icon, sections: [{ heading?, body?, images?, videos?, qa? }] }
//   body รองรับ Markdown เต็ม (หัวข้อย่อย/ตาราง/ตัวหนา) ผ่าน SkillKnowledge.jsx → mdComponents
//   qa[].a เป็น Markdown, qa[].q เป็นข้อความ
//
// โครงเนื้อหา 7 ชั้น: Anatomy → Histology → Physiology → Pathology → Pharmacology → Equipment → Technique
// เรียบเรียงตามหลักกายวิภาค/สรีรวิทยามาตรฐาน + แนวทาง ILCOR/ACLS 2020–2025 (paraphrase — ไม่คัดลอกต้นฉบับ)
//
// ⚠️ DRAFT — ยังไม่ผ่าน medical review: เนื้อหาคลินิก โดยเฉพาะบท Pharmacology (บท 5)
//    ต้องผ่านการตรวจสอบโดยแพทย์ EM/ICU/วิสัญญี ก่อนใช้กับผู้เรียนจริง
//    ขนาดยาทั้งหมดเป็น "หลักการทั่วไป" ต้องยึด protocol สถาบัน + น้ำหนักตัวจริงเสมอ

export const chapters = [
  // ────────────────────────────── บทที่ 1 — ANATOMY ──────────────────────────────
  {
    id: 'aw-ch1', title: 'บทที่ 1: กายวิภาคทางเดินหายใจ (Anatomy)',
    icon: '🫁',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- แยกทางเดินหายใจ **ส่วนบน/ส่วนล่าง** และบอกจุดแบ่งที่ระดับสายเสียงได้
- ระบุกระดูกอ่อนกล่องเสียง 4 กลุ่ม (thyroid, cricoid, epiglottis, arytenoid) และ **landmark ทางคลินิก** ของแต่ละชิ้น
- อธิบายว่าทำไม **right mainstem** จึงเป็นตำแหน่งที่ท่อลึกเกินมักลงไป และเชื่อมกับมุมแยกหลอดลม
- เปรียบเทียบทางเดินหายใจ **เด็ก vs ผู้ใหญ่** และผลต่อการเลือก blade/การจัดท่า`,
      },
      {
        heading: 'ภาพรวม: ทางเดินหายใจส่วนบนและส่วนล่าง',
        body: `ทางเดินหายใจแบ่งตามหน้าที่และตำแหน่งเป็น **ส่วนบน (upper airway)** และ **ส่วนล่าง (lower airway)** โดยมี *กล่องเสียง (larynx)* เป็นจุดแบ่ง

## ทางเดินหายใจส่วนบน (จมูก → เหนือสายเสียง)
- **จมูก/โพรงจมูก (nasal cavity)** — turbinate (conchae) 3 อัน เพิ่มพื้นที่ผิว ทำหน้าที่ กรอง/ทำให้อุ่น/เพิ่มความชื้น อากาศ; เป็นเหตุผลที่การหายใจทางจมูกดีต่อการปรับสภาพอากาศ แต่มีแรงต้านสูงกว่าปาก
- **คอหอย (pharynx)** แบ่งเป็น 3 ส่วน:
  - *Nasopharynx* — หลังโพรงจมูก มี adenoid
  - *Oropharynx* — หลังช่องปาก มี tonsil และ **โคนลิ้น** (จุดอุดกั้นที่พบบ่อยที่สุดในผู้หมดสติ)
  - *Laryngopharynx (hypopharynx)* — ต่อลงไปถึงกล่องเสียง/หลอดอาหาร

## ทางเดินหายใจส่วนล่าง (กล่องเสียง → ถุงลม)
กล่องเสียง → หลอดลมคอ (trachea) → หลอดลมหลัก (main bronchi) → แตกแขนงลงไปจนถึงถุงลม (alveoli)

> เส้นแบ่ง "บน/ล่าง" ที่ระดับสายเสียง (vocal cords) มีความหมายทางคลินิก: การใส่ท่อช่วยหายใจ (ETT) คือการวางท่อ **ผ่านสายเสียงลงไปในทางเดินหายใจส่วนล่าง** เพื่อป้องกันทางเดินหายใจอย่างสมบูรณ์`,
      },
      {
        heading: 'กายวิภาคกล่องเสียง (Larynx): กระดูกอ่อน สายเสียง และ landmark สำคัญ',
        body: `กล่องเสียงคือ "ทางแยก" ระหว่างอากาศกับอาหาร ประกอบด้วยกระดูกอ่อนหลายชิ้นที่ต้องรู้จักก่อนทำหัตถการขั้นสูง

| กระดูกอ่อน | ลักษณะเด่น | ความสำคัญทางคลินิก |
|---|---|---|
| **Thyroid** | ใหญ่สุด รูปโล่ ("ลูกกระเดือก") | landmark คลำหาตำแหน่ง |
| **Cricoid** | วงแหวน **สมบูรณ์วงเดียว**ของทางเดินหายใจ | Sellick maneuver, จุดต่ำสุดที่แคบในเด็ก |
| **Epiglottis** | ฝาปิดรูปใบไม้ | ปิด glottis ขณะกลืน; Miller blade ยกชิ้นนี้โดยตรง |
| **Arytenoid** (คู่) | ควบคุมการเปิด-ปิดสายเสียง | landmark มองเห็นขณะ laryngoscopy |

**Glottis** = ช่องระหว่างสายเสียง (vocal cords) — เป็นจุดที่ **แคบที่สุดในทางเดินหายใจผู้ใหญ่**

**Cricothyroid membrane** — เยื่อระหว่าง thyroid กับ cricoid cartilage เป็นจุดเจาะทำ *cricothyrotomy* เมื่อ "แทงท่อไม่ได้ ช่วยหายใจไม่ได้ (CICO)"

**Vallecula** — แอ่งระหว่างโคนลิ้นกับ epiglottis เป็นจุดที่ปลาย **Macintosh (curved) blade** วางเพื่อยก epiglottis โดยอ้อม`,
      },
      {
        heading: 'หลอดลมและการแตกแขนง (Tracheobronchial tree)',
        body: `- **Trachea** ยาว ~10–12 ซม. มีกระดูกอ่อนรูปเกือกม้า (C-shaped) ~16–20 วง ด้านหลังเป็นกล้ามเนื้อเรียบ (trachealis) ติดกับหลอดอาหาร
- แยกที่ **carina** (ระดับ sternal angle / T4–5)
- **หลอดลมหลักขวา (right main bronchus)** สั้น กว้าง และ**ตั้งชันกว่า** → สิ่งแปลกปลอมและ ETT ที่ลึกเกินมักเข้าขวา (right mainstem intubation)
- แตกแขนงลงไป ~23 generation: bronchi → bronchioles → terminal bronchioles → respiratory bronchioles → alveolar ducts → alveoli
- ยิ่งลึกลงไป **พื้นที่หน้าตัดรวม (total cross-sectional area) ยิ่งมาก** → ความเร็วลมช้าลง เอื้อต่อการแพร่ของแก๊ส (ดูบท 3)`,
        qa: [
          {
            q: 'ทำไม ETT ที่ใส่ลึกเกินไป มักลงไปที่ปอดขวา และเกิดผลอะไร?',
            a: `เพราะ **หลอดลมหลักขวาตั้งชันเกือบตรงกับแนวหลอดลมคอ** (มุมแยกน้อยกว่าซ้าย) ท่อหรือสิ่งแปลกปลอมที่ผ่าน carina ลงไปจึงมีแนวโน้มเข้าขวาตามแรงโน้มถ่วงและแนวกายวิภาค

**ผลที่ตามมา (right mainstem intubation):**
- ปอดซ้ายไม่ได้รับการช่วยหายใจ → เสียงหายใจข้างซ้ายเบา/หาย, หน้าอกขยายไม่เท่ากัน
- เสี่ยง **ภาวะออกซิเจนต่ำ** และ **barotrauma** ที่ปอดขวาจากปริมาตรที่มากเกิน

**การป้องกัน/แก้ไข:** ยึดความลึกท่อที่มุมปากตามหลัก (ผู้ใหญ่ ~21 ซม.หญิง / ~23 ซม.ชาย) ฟังปอดทั้งสองข้าง + ยืนยันด้วย waveform capnography ถ้าเสียงข้างซ้ายเบา ให้ถอยท่อออกทีละน้อยจนเสียงเท่ากัน`,
          },
          {
            q: 'ทางเดินหายใจของเด็กต่างจากผู้ใหญ่อย่างไร และมีผลต่อการจัดการอย่างไร?',
            a: `| ลักษณะในเด็ก | ผลทางคลินิก |
|---|---|
| ศีรษะ/ท้ายทอย (occiput) ใหญ่ | คอพับงอเมื่อนอนหงาย — รองไหล่แทนรองศีรษะ |
| ลิ้นใหญ่เมื่อเทียบกับช่องปาก | อุดกั้นง่าย, มองกล่องเสียงยากกว่า |
| กล่องเสียงอยู่**สูงและเยื้องหน้า** (C3–4) | มุมมองต่างจากผู้ใหญ่ |
| Epiglottis ยาว อ่อน รูปตัว Ω | มักต้องใช้ **straight (Miller) blade** ยกตรง |
| จุดแคบที่สุดอยู่ที่ **cricoid** (ไม่ใช่ glottis) | ท่อที่ผ่านสายเสียงได้อาจยังติดที่ cricoid |
| ทางเดินหายใจเล็ก | บวมเพียงเล็กน้อยเพิ่มแรงต้านมหาศาล (ดูกฎ Poiseuille บท 3) |

หลักคิด: เด็กเสี่ยงขาดออกซิเจนเร็วกว่าเพราะ **การใช้ออกซิเจนต่อน้ำหนักสูง + FRC สำรองน้อย** จึงต้อง pre-oxygenate ดีและทำหัตถการให้กระชับ`,
          },
        ],
      },
      {
        kind: 'pearl',
        body: `**"3-3-2" คลำได้ที่ข้างเตียง** ใช้ประเมินความยากก่อนใส่ท่อใน 10 วินาที: อ้าปาก **3 นิ้ว** · คาง→hyoid **3 นิ้ว** · hyoid→thyroid notch **2 นิ้ว** — น้อยกว่าเกณฑ์ = พื้นที่ทำงานแคบ เตรียมแผนสำรอง`,
      },
      {
        kind: 'case',
        heading: 'เคส: ท่อใส่แล้วแต่ SpO₂ ไม่ขึ้น เสียงปอดซ้ายเบา',
        body: `ชาย 60 ปี หลังใส่ ETT ลึก 26 ซม.ที่มุมปาก SpO₂ 88% หน้าอกขวายกเด่นกว่าซ้าย ฟังปอดซ้ายเบา`,
        qa: [
          {
            q: 'สาเหตุที่น่าจะเป็นที่สุดคืออะไร และแก้ไขอย่างไร (อิงกายวิภาคบทนี้)?',
            a: `**Right mainstem intubation** — ท่อลึกเกิน ลงหลอดลมหลักขวาที่ตั้งชันเกือบตรงแนว trachea ปอดซ้ายจึงไม่ได้ระบายอากาศ

**แก้ไข:** คลาย cuff → **ถอยท่อออกทีละ ~1 ซม.** พร้อมฟังปอดจนเสียงสองข้างเท่ากัน (ผู้ใหญ่มักได้ที่ ~21 ซม.หญิง / ~23 ซม.ชายที่มุมปาก) → ใส่ cuff ใหม่ → ยืนยันด้วย **waveform capnography** + ฟังปอดซ้ำ

**บทเรียน:** ตัวเลขความลึกที่มุมปากไม่ใช่พิธีกรรม — มันคือการกันปลายท่อให้อยู่ **เหนือ carina** ตามระยะกายวิภาคจริง`,
          },
        ],
      },
      {
        heading: '⟐ เชิงลึกเฉพาะทาง: Innervation ของทางเดินหายใจ',
        body: `การควบคุมประสาทสัมพันธ์โดยตรงกับ reflex, การทำ awake intubation และภาวะแทรกซ้อน

| เส้นประสาท | เลี้ยง (sensory/motor) | ความสำคัญคลินิก |
|---|---|---|
| **CN IX (glossopharyngeal)** | sensory: oropharynx, โคนลิ้น 1/3 หลัง, tonsil | gag reflex; บล็อกเพื่อ awake laryngoscopy |
| **Superior laryngeal n. (internal br., จาก CN X)** | sensory: เหนือสายเสียงถึง epiglottis | ไวต่อ laryngospasm; บล็อกที่ cornu ของ hyoid |
| **Recurrent laryngeal n. (จาก CN X)** | sensory: ใต้สายเสียง + motor: กล้ามเนื้อ intrinsic เกือบทั้งหมด | บาดเจ็บ → เสียงแหบ/สายเสียงอัมพาต; สองข้าง = อุดกั้นเฉียบพลัน |
| **Cricothyroid m.** | motor: external branch ของ superior laryngeal | ตึงสายเสียง (pitch) |

> **นัยเชิงหัตถการ:** laryngospasm คือ reflex ผ่าน superior laryngeal n. — จัดการด้วย positive pressure, ลึกยาสลบ, หรือ succinylcholine ขนาดต่ำ; การกระตุ้นสายเสียงตอนยาสลบตื้นเป็นตัวจุดชนวนที่พบบ่อย` },
      {
        kind: 'evidence',
        body: `**ตัวทำนายทางเดินหายใจยากที่มีหลักฐานรองรับ** (ใช้ประกอบ ไม่ใช่ตัดสินเดี่ยว): Mallampati III–IV, thyromental distance < 6 ซม., mouth opening < 3 ซม., neck extension จำกัด, upper-lip-bite test, คอหนา/BMI สูง — ความไว/จำเพาะของแต่ละตัวปานกลาง จึงใช้ **รวมกัน (เช่น LEMON/El-Ganzouri)** และเตรียมแผนสำรองเสมอ *(ตรวจสอบกับแนวทาง difficult airway ฉบับล่าสุด เช่น DAS/ASA)*` },
      {
        kind: 'warning',
        body: `**Special populations — กายวิภาคที่เปลี่ยนความเสี่ยง:** ผู้สูงอายุ (ฟันโยก, ข้อคอเสื่อม, arthritis → extension จำกัด) · หญิงตั้งครรภ์ (เยื่อบุบวม/เลือดคั่ง → เลือกท่อเล็กลง ~0.5–1 มม., desaturate เร็วจาก FRC ลด) · อ้วน (จัดท่า ramped, desaturate เร็ว) · **Down syndrome** (atlantoaxial instability + ลิ้นใหญ่ + subglottic แคบ) · rheumatoid (cricoarytenoid/atlantoaxial involvement)` },
      {
        kind: 'summary',
        body: `| ประเด็น | จำให้ขึ้นใจ |
|---|---|
| จุดแบ่งบน/ล่าง | ระดับ **สายเสียง (glottis)** |
| แคบสุด (ผู้ใหญ่) | glottis · (เด็ก = cricoid) |
| ลิ้นตก | จุดอุดกั้นที่พบบ่อยสุดในผู้หมดสติ |
| ท่อลึกเกิน | เข้า **right mainstem** → ถอยจนเสียงเท่ากัน |
| Cricothyroid membrane | ทางออกสุดท้าย CICO |

**ทดสอบตัวเอง:** ลองตอบก่อนดูเฉลย`,
        qa: [
          {
            q: 'ทำไมเด็กเล็กจึงต้องรองไหล่ (ไม่ใช่รองศีรษะ) เพื่อจัดท่า?',
            a: `เพราะ **occiput (ท้ายทอย) ของเด็กใหญ่** เมื่อนอนราบจะดันให้คอ *ก้มพับ* อุดทางเดินหายใจ — รองไหล่ช่วยชดเชยให้แกนทางเดินหายใจตรง (ตรงข้ามกับผู้ใหญ่ที่มัก sniffing/หนุนศีรษะ)`,
          },
          {
            q: 'Macintosh (curved) กับ Miller (straight) blade วางปลายต่างกันตรงไหน และทำไม?',
            a: `**Macintosh** วางปลายที่ **vallecula** (แอ่งหน้า epiglottis) ยก epiglottis *โดยอ้อม* ผ่านเอ็น · **Miller** สอดใต้ epiglottis ยก *โดยตรง* — เด็กเล็กที่ epiglottis ยาวอ่อนรูป Ω มักคุมได้ดีกว่าด้วย Miller`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 2 — HISTOLOGY ──────────────────────────────
  {
    id: 'aw-ch2', title: 'บทที่ 2: จุลกายวิภาคทางเดินหายใจ (Histology)',
    icon: '🔬',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบาย **mucociliary escalator** และเหตุผลที่ผู้ป่วยคาท่อต้องได้ความชื้น (humidification)
- เปรียบเทียบเยื่อบุตามความลึก (pseudostratified → simple cuboidal → alveolus) และเซลล์เด่นแต่ละระดับ
- อธิบายหน้าที่ **type I / type II pneumocyte** และ **surfactant** ด้วยกฎ Laplace
- เชื่อมโยงการสูญเสีย surfactant → shunt → เหตุผลที่ต้องใช้ **PEEP**`,
      },
      {
        heading: 'เยื่อบุทางเดินหายใจและ Mucociliary escalator',
        body: `ทางเดินหายใจส่วนนำอากาศ (conducting zone) บุด้วย **respiratory epithelium** = *pseudostratified ciliated columnar epithelium with goblet cells* (เยื่อบุเทียมหลายชั้น มีซิเลียและเซลล์สร้างเมือก)

**องค์ประกอบสำคัญ:**
- **Ciliated cells** — ซิเลียโบกพัดเมือกขึ้นสู่คอหอยด้วยความเร็วสม่ำเสมอ (mucociliary escalator) เพื่อกำจัดฝุ่น/เชื้อโรค
- **Goblet cells** — สร้างเมือก (mucus) ดักจับอนุภาค
- **Basal cells** — เซลล์ต้นกำเนิดสำหรับซ่อมแซมเยื่อบุ
- **ต่อม seromucous** ใน submucosa — เพิ่มสารคัดหลั่ง

> **ความสำคัญทางคลินิก:** ควันบุหรี่/ท่อช่วยหายใจ/ออกซิเจนแห้ง ทำลายซิเลีย → เมือกคั่ง เสี่ยงติดเชื้อและอุดกั้น เป็นเหตุผลที่ต้อง **ให้ความชื้น (humidification)** กับผู้ป่วยที่คาท่อ และดูดเสมหะเมื่อจำเป็น`,
      },
      {
        heading: 'การเปลี่ยนผ่านของเยื่อบุตามความลึก และถุงลม (Alveolus)',
        body: `ยิ่งลึกลงไป เยื่อบุยิ่ง "บางลง" เพื่อเอื้อต่อการแลกเปลี่ยนแก๊ส:

| ระดับ | เยื่อบุ | หมายเหตุ |
|---|---|---|
| หลอดลมใหญ่ | pseudostratified ciliated + goblet | มีกระดูกอ่อน |
| Bronchiole | simple ciliated columnar/cuboidal | ไม่มีกระดูกอ่อน มี smooth muscle เด่น (จุดหดเกร็งใน asthma) |
| Terminal bronchiole | simple cuboidal + **Club (Clara) cells** | ไม่มี goblet; Club cells สร้างสารคล้าย surfactant/ซ่อมแซม |
| Alveolus | เยื่อบางที่สุด | จุดแลกเปลี่ยนแก๊สจริง |

**เซลล์ในถุงลม:**
- **Type I pneumocyte** — แบนบาง คลุมพื้นผิว ~95% เป็นด่านแลกเปลี่ยนแก๊ส
- **Type II pneumocyte** — สร้าง **surfactant** และเป็นเซลล์ต้นกำเนิดซ่อม type I
- **Alveolar macrophage (dust cell)** — กินสิ่งแปลกปลอม/เชื้อโรค

**Blood–air barrier** บางเพียง ~0.5 µm ประกอบด้วย: type I pneumocyte + fused basement membrane + endothelium ของ capillary — บางพอให้ O₂/CO₂ แพร่ผ่านได้เร็ว`,
        qa: [
          {
            q: 'Surfactant คืออะไร ทำงานด้วยหลักฟิสิกส์ใด และเกี่ยวกับ ACLS อย่างไร?',
            a: `**Surfactant** เป็นสารลดแรงตึงผิว (ส่วนใหญ่คือ *dipalmitoylphosphatidylcholine, DPPC*) สร้างโดย **type II pneumocyte** เคลือบผิวด้านในถุงลม

**หลักฟิสิกส์ — กฎของ Laplace:** ความดันที่ทำให้ถุงลมยุบ P = 2T/r (T = แรงตึงผิว, r = รัศมี)
- ถุงลมเล็ก (r น้อย) จะมีแนวโน้มยุบและดันอากาศไปยังถุงลมใหญ่
- Surfactant **ลด T โดยเฉพาะเมื่อถุงลมเล็กลง** จึงทำให้ถุงลมขนาดต่างกันอยู่ร่วมกันได้โดยไม่ยุบ (เพิ่ม compliance, ป้องกัน atelectasis)

**เชื่อมโยง resuscitation:** ภาวะที่ทำลาย/ลด surfactant (เช่น ARDS, จมน้ำ, aspiration) ทำให้ถุงลมยุบ → shunt → ออกซิเจนต่ำที่แก้ด้วย FiO₂ อย่างเดียวได้ไม่เต็มที่ ต้องอาศัย **PEEP** เพื่อคงถุงลมให้เปิด (recruitment) — เป็นเหตุผลที่ BVM รุ่นดีมี PEEP valve`,
          },
        ],
      },
      {
        kind: 'warning',
        body: `**ออกซิเจนแห้ง + ท่อ = ศัตรูของซิเลีย** การให้ O₂ flow สูงแบบไม่ให้ความชื้นนาน ๆ และการคาท่อ ทำให้ซิเลียหยุดโบก เมือกเหนียวคั่ง → **mucus plugging** อุดท่อ/หลอดลม เป็นสาเหตุที่ EtCO₂ ตกหรือ SpO₂ ดิ่งแบบหาสาเหตุอื่นไม่เจอ — นึกถึง "ดูดเสมหะ/เปลี่ยนท่อ" ไว้เสมอ`,
      },
      {
        heading: '⟐ เชิงลึกเฉพาะทาง: ระดับโมเลกุลของ Surfactant และ Cilia',
        body: `**Surfactant — องค์ประกอบและโปรตีน:** สร้างใน **lamellar bodies** ของ type II pneumocyte; ~90% เป็น phospholipid (หลักคือ **DPPC/dipalmitoylphosphatidylcholine**) + ~10% โปรตีน

| Surfactant protein | หน้าที่ |
|---|---|
| **SP-B, SP-C** (hydrophobic) | เร่งการกระจายฟิล์ม ลดแรงตึงผิว; **SP-B deficiency** → RDS รุนแรงในทารก |
| **SP-A, SP-D** (hydrophilic, collectins) | innate immunity — opsonization เชื้อ/ควบคุมการอักเสบ |

**Cilia — โครงสร้างระดับ ultrastructure:** axoneme แบบ **"9+2"** (microtubule doublet 9 คู่ล้อม 2 เดี่ยว) ขับเคลื่อนด้วย **dynein arm** ที่ใช้ ATP — ความผิดปกติของ dynein = **primary ciliary dyskinesia** (Kartagener) → เสมหะคั่ง/หลอดลมโป่งพอง

> **Club (Clara) cells** มี **CYP450** เมแทบอลิซึมสารพิษที่สูดเข้า + เป็น progenitor ซ่อม epithelium; **alveolar macrophage** มาจาก monocyte สาย myeloid` },
      {
        kind: 'evidence',
        body: `**Exogenous surfactant** ได้ผลชัดใน **neonatal RDS** (ลดอัตราตาย) แต่ **ไม่ได้ผลใน adult ARDS** — เพราะ ARDS มีการอักเสบ/รั่วของโปรตีนที่ยับยั้ง surfactant มากกว่าการขาดปริมาณ กลไกจึงต่างกัน จุดนี้เตือนว่า "กลไกเดียวกันในต่างบริบทให้ผลต่างกัน" *(อ้างเชิงหลักการ — ตรวจสอบ guideline neonatology/critical care ล่าสุด)*` },
      {
        kind: 'summary',
        body: `| โครงสร้าง | หน้าที่หลัก |
|---|---|
| Ciliated + goblet | จับ+พัดเมือกออก (escalator) |
| Type I pneumocyte | ผิวแลกเปลี่ยนแก๊ส ~95% |
| Type II pneumocyte | สร้าง **surfactant** + ซ่อม type I |
| Surfactant | ลดแรงตึงผิว (Laplace) กัน atelectasis |
| Blood–air barrier | ~0.5 µm ให้แก๊สแพร่เร็ว |

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ทำไม shunt (ถุงลมยุบ/มีน้ำ) จึงเป็น hypoxemia ชนิดที่ "ให้ O₂ อย่างเดียวไม่ค่อยขึ้น"?',
            a: `เพราะเลือดที่ไหลผ่านถุงลมซึ่ง **ยุบ/เต็มไปด้วยของเหลว ไม่เคยสัมผัสอากาศเลย** — ต่อให้เพิ่ม FiO₂ เป็น 100% อากาศก็ไปไม่ถึงเลือดส่วนนั้น ต้อง **เปิดถุงลมกลับ (PEEP/recruitment/แก้สาเหตุ)** จึงจะได้ผล`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 3 — PHYSIOLOGY ──────────────────────────────
  {
    id: 'aw-ch3', title: 'บทที่ 3: สรีรวิทยาการหายใจและการแลกเปลี่ยนแก๊ส (Physiology)',
    icon: '📊',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- แยก **minute vs alveolar ventilation** และอธิบายว่าทำไม "หายใจเร็วตื้น" จึงระบาย CO₂ แย่
- ใช้ **กฎ Poiseuille (รัศมี⁴)** อธิบายว่าบวมเล็กน้อยทำให้แรงต้านพุ่งได้อย่างไร
- อ่าน **O₂–Hb curve** และทิศทาง Bohr (ขวา/ซ้าย) กับความหมายทางคลินิก
- อธิบายว่าทำไม **EtCO₂** สะท้อนคุณภาพ CPR และจับ ROSC
- จำแนกกลไก hypoxemia 5 แบบ และรู้ว่าอันไหน "ให้ O₂ ไม่ขึ้น"`,
      },
      {
        heading: 'การระบายอากาศ: Minute vs Alveolar ventilation และ Dead space',
        body: `**นิยามพื้นฐาน:**
- Tidal volume (V_T) ~500 mL, อัตราหายใจ (RR) ~12–16/นาที
- **Minute ventilation** = V_T × RR (~6–8 L/นาที)
- **Dead space (V_D)** = อากาศที่ "ไม่ได้แลกเปลี่ยนแก๊ส"
  - *Anatomical* — ในทางเดินนำอากาศ ~150 mL
  - *Alveolar* — ถุงลมที่มีลมแต่ไม่มีเลือดมาเลี้ยง
  - *Physiological* = anatomical + alveolar
- **Alveolar ventilation** = (V_T − V_D) × RR ← ตัวที่กำหนดการแลกเปลี่ยนแก๊สจริง

> **นัยทางคลินิก:** การหายใจเร็วตื้น (V_T น้อย, RR สูง) อาจมี minute ventilation ปกติ แต่ **alveolar ventilation ต่ำ** เพราะสัดส่วน dead space มาก — จึงระบาย CO₂ ได้แย่ นี่คือเหตุผลที่ "บีบ BVM แรงและเร็ว" ไม่ได้ช่วย และยังเพิ่ม gastric inflation`,
      },
      {
        heading: 'Compliance, Resistance และงานของการหายใจ',
        body: `- **Compliance (C)** = ΔVolume/ΔPressure — ปอด "ยืดง่าย" แค่ไหน; ลดลงใน pulmonary edema, ARDS, fibrosis
- **Resistance (R)** = แรงต้านการไหลของอากาศ; เพิ่มใน asthma/COPD/สิ่งแปลกปลอม

**กฎ Poiseuille (สำคัญมากในทางเดินหายใจ):** อัตราการไหล ∝ **รัศมี⁴**
- รัศมีทางเดินหายใจลดครึ่งหนึ่ง → แรงต้านเพิ่ม **16 เท่า**
- อธิบายว่าทำไมการบวมเพียงเล็กน้อย (croup, angioedema) ในทางเดินหายใจเล็กของเด็กจึงทำให้หายใจลำบากรุนแรง

**Time constant** = R × C กำหนดว่าถุงลมเติม/ระบายเร็วแค่ไหน — ปอดที่ R สูง (เช่น COPD) ต้องการ **เวลาหายใจออกนานขึ้น** ไม่งั้นเกิด air trapping / auto-PEEP`,
      },
      {
        heading: 'การขนส่งออกซิเจน: Hb, Oxygen content และ O₂–Hb dissociation curve',
        body: `**ปริมาณออกซิเจนในเลือด (CaO₂)** = (1.34 × Hb × SaO₂) + (0.003 × PaO₂)
- ส่วนใหญ่ออกซิเจนขนส่งโดย **จับกับฮีโมโกลบิน** ไม่ใช่ละลายในพลาสมา
- ดังนั้น **โลหิตจาง (Hb ต่ำ)** ลดการขนส่งออกซิเจนได้แม้ SpO₂ = 100%

**O₂–Hb dissociation curve (รูป S):**
- ช่วงบนแบน (PaO₂ > 60) → SpO₂ เปลี่ยนน้อยแม้ PaO₂ เปลี่ยนมาก (buffer)
- ช่วงล่างชัน (PaO₂ < 60) → SpO₂ ดิ่งเร็ว = "หน้าผา" ที่อันตราย

**Bohr effect — curve เลื่อนขวา (ปล่อย O₂ ให้เนื้อเยื่อง่ายขึ้น)** เมื่อ: CO₂↑, H⁺↑ (กรด), อุณหภูมิ↑, 2,3-BPG↑ — สภาวะของเนื้อเยื่อที่ทำงานหนัก/ขาดเลือด
**เลื่อนซ้าย (จับ O₂ แน่น ปล่อยยาก):** ด่าง, เย็น, CO poisoning, HbF`,
        qa: [
          {
            q: 'ทำไม EtCO₂ (waveform capnography) จึงสะท้อนคุณภาพ CPR และตรวจจับ ROSC ได้?',
            a: `EtCO₂ (คาร์บอนไดออกไซด์ปลายลมหายใจออก) ขึ้นกับ 3 ปัจจัย: **การสร้าง CO₂ ในเนื้อเยื่อ → การนำส่งกลับหัวใจ/ปอด (perfusion) → การระบายออกทางปอด (ventilation)**

ระหว่าง cardiac arrest ถ้าคุมการช่วยหายใจให้คงที่ ตัวแปรที่เหลือคือ **perfusion จากการกดหน้าอก**:
- **กดหน้าอกมีคุณภาพ** → เลือดไหลกลับปอดมาก → พา CO₂ มาระบายมาก → **EtCO₂ สูงขึ้น** (เป้าหมายมักอ้างอิง > 10–20 mmHg)
- EtCO₂ ต่ำต่อเนื่อง = สัญญาณว่า CPR ไม่มีประสิทธิภาพ (กดตื้น/ช้า/คนกดล้า)

**ตรวจจับ ROSC:** เมื่อหัวใจกลับมาเต้นเอง cardiac output พุ่งขึ้นทันที → **EtCO₂ กระโดดสูงขึ้นฉับพลันและคงอยู่** มักเป็นสัญญาณแรกก่อนคลำชีพจรได้ ทำให้ไม่ต้องหยุดกดเพื่อคลำบ่อย ๆ

นี่คือสรีรวิทยาที่ทำให้ capnography เป็น "มาตรฐานทอง" ทั้งยืนยันตำแหน่งท่อ + วัดคุณภาพ CPR + จับ ROSC`,
          },
          {
            q: 'อธิบายกลไก 5 อย่างของภาวะออกซิเจนในเลือดต่ำ (hypoxemia) และอันไหนที่ให้ออกซิเจนแล้วไม่ดีขึ้น?',
            a: `| กลไก | ตัวอย่าง | ตอบสนองต่อ O₂? |
|---|---|---|
| **Hypoventilation** | ยากดการหายใจ, หมดสติ | ดีขึ้น |
| **V/Q mismatch** | ปอดบวม, PE, COPD | มักดีขึ้น |
| **Shunt** (เลือดผ่านถุงลมที่ยุบ/มีน้ำ) | ARDS, atelectasis, จมน้ำ | **ดีขึ้นน้อย/ไม่ดีขึ้น** — ต้องใช้ PEEP/recruitment |
| **Diffusion limitation** | fibrosis | ดีขึ้น |
| **Low FiO₂/แรงดันต่ำ** | ที่สูง, แก๊สพิษ | ดีขึ้น |

**หัวใจสำคัญ:** *shunt แท้* คือกลไกที่ให้ออกซิเจนอย่างเดียวไม่พอ เพราะเลือดไม่เคยสัมผัสถุงลมที่มีอากาศเลย — ต้องเปิดถุงลมที่ยุบให้กลับมาแลกเปลี่ยนแก๊ส (PEEP, CPAP, จัดการสาเหตุ) จึงจะแก้ได้ตรงจุด`,
          },
        ],
      },
      {
        kind: 'case',
        heading: 'เคส: หอบหืดรุนแรง — capnography รูป "ครีบฉลาม"',
        body: `หญิง 30 ปี หอบหืดกำเริบ หายใจมีเสียง wheeze ทั่วปอด SpO₂ 90% waveform capnography ขาขึ้นลาดเอียงเป็น **shark-fin**`,
        qa: [
          {
            q: 'รูป shark-fin เกิดจากกลไกใด และเชื่อมกับ compliance/resistance บทนี้อย่างไร?',
            a: `**Resistance ที่หลอดลมเล็กสูงมาก** (bronchospasm) → แต่ละถุงลมมี **time constant (R×C)** ต่างกัน ระบายลมออกไม่พร้อมกัน CO₂ จากถุงลมจึงทยอยออก ทำให้ขาขึ้น (phase II) *ลาดเอียง* แทนที่จะชัน

**นัยการรักษา:** ปัญหาคือ "ลมออกไม่ทัน" → ต้อง **ยืดเวลาหายใจออก** (ลด RR) กันเกิด air trapping/auto-PEEP; รักษา bronchospasm; **ห้ามบีบ BVM เร็ว** เพราะยิ่งเติมลมก่อนถุงลมระบายหมด → ความดันในอกพุ่ง → ความดันตก/pneumothorax`,
          },
        ],
      },
      {
        heading: '⟐ เชิงลึกเฉพาะทาง: สมการสำคัญและตัวอย่างคำนวณ',
        body: `**1) Alveolar gas equation (หา PAO₂ ในถุงลม):**

\`PAO₂ = FiO₂ × (Patm − PH₂O) − PaCO₂ / R\`

- ที่ระดับน้ำทะเล: Patm 760, PH₂O 47 mmHg, R (respiratory quotient) ≈ 0.8
- หายใจ room air (FiO₂ 0.21), PaCO₂ 40: \`PAO₂ = 0.21×(760−47) − 40/0.8 = 149.7 − 50 ≈ **100 mmHg**\`

**2) A–a gradient** = PAO₂ − PaO₂
- ปกติ ≈ **(อายุ/4) + 4** mmHg (กว้างขึ้นตามอายุ); กว้างผิดปกติ = shunt / V̇/Q̇ mismatch / diffusion; **ปกติแต่ hypoxemia** = hypoventilation หรือ FiO₂/แรงดันต่ำ

**3) Oxygen content (CaO₂):** \`CaO₂ = (1.34 × Hb × SaO₂) + (0.003 × PaO₂)\` — สังเกตว่า Hb มีน้ำหนักมากกว่าส่วนที่ละลาย (0.003) มหาศาล

**4) Bohr (dead space):** \`V_D/V_T = (PaCO₂ − PeCO₂) / PaCO₂\` (Pe = mixed expired) — ปกติ ~0.2–0.35

**5) Shunt (Qs/Qt) เชิงแนวคิด:** เลือดที่ไม่สัมผัสถุงลม — เมื่อ shunt สูง PaO₂ ไม่ขึ้นตาม FiO₂ (แยกจาก V̇/Q̇ mismatch ที่ยังตอบ O₂)` },
      {
        heading: '⟐ ระดับโมเลกุล: O₂–Hb curve และการขนส่ง CO₂',
        body: `**O₂–Hb dissociation** เป็นรูป **sigmoid** จาก **cooperative binding** (Hill coefficient ≈ 2.7) — การจับ O₂ ตัวแรกเปลี่ยนโครงสร้าง Hb (T→R state) ให้จับตัวถัดไปง่ายขึ้น

- **P50** (PaO₂ ที่ SaO₂ 50%) ≈ **26–27 mmHg** — ตัวชี้ตำแหน่ง curve
- เลื่อน **ขวา (P50↑, ปล่อย O₂ ง่าย):** CO₂↑, H⁺↑, อุณหภูมิ↑, **2,3-BPG↑** (จับที่ β-chain ของ deoxyHb)
- เลื่อน **ซ้าย:** ด่าง, เย็น, **CO** (affinity สูงกว่า O₂ ~240 เท่า + เลื่อนซ้าย = พิษสองชั้น), **HbF** (จับ 2,3-BPG น้อย)

**CO₂ transport (3 รูป):** ~**70% เป็น HCO₃⁻** (ผ่าน **carbonic anhydrase** ใน RBC → chloride shift), ~23% เป็น **carbamino-Hb**, ~7% ละลาย — **Haldane effect:** deoxyHb จับ CO₂/H⁺ ได้ดีกว่า จึงพา CO₂ กลับปอดมากขึ้น (คู่กับ Bohr effect ที่เนื้อเยื่อ)` },
      {
        kind: 'evidence',
        body: `**Apneic oxygenation (NO DESAT):** ให้ O₂ flow ทางจมูกระหว่าง apnea ของ intubation ช่วยยืดเวลา desaturation (อาศัย aventilatory mass flow) — ลดอุบัติการณ์ hypoxemia ในผู้ป่วยเสี่ยง · **Permissive hypercapnia** ใน ARDS/asthma: ยอมให้ PaCO₂ สูงเพื่อเลี่ยง volutrauma โดยคุม pH *(อ้างเชิงหลักการ — ตรวจสอบ ARDSnet/critical care ล่าสุด)*` },
      {
        kind: 'warning',
        body: `**Special populations — สรีรวิทยาที่ทำให้ desaturate เร็ว:** หญิงตั้งครรภ์ (FRC ลด ~20%, O₂ consumption เพิ่ม → apnea แล้ว SpO₂ ตกเร็วมาก) · อ้วน (FRC ลดจากน้ำหนักผนังอก, closing capacity > FRC) · เด็ก (O₂ consumption ต่อ นน. สูง ~2 เท่า, FRC สำรองน้อย) — ทั้งหมดต้อง **pre-oxygenate ให้ดีและทำหัตถการกระชับ**` },
      {
        kind: 'summary',
        body: `| หลักการ | ตัวเลข/ทิศทางที่ต้องจำ |
|---|---|
| Alveolar vent. | (V_T − V_D) × RR ← ตัวจริงที่ล้าง CO₂ |
| Poiseuille | flow ∝ **รัศมี⁴** (รัศมีครึ่ง → ต้าน ×16) |
| O₂–Hb "หน้าผา" | PaO₂ < 60 → SpO₂ ดิ่งเร็ว |
| Bohr ขวา | CO₂↑/กรด/ร้อน/2,3-BPG↑ → ปล่อย O₂ ง่าย |
| EtCO₂ เป้า CPR | > 10–20 mmHg; พุ่งขึ้น = ROSC |

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ผู้ป่วยหายใจ 40 ครั้ง/นาที แต่ตื้นมาก (V_T ~200 mL) — minute ventilation ดู "พอ" แต่ทำไมยังคั่ง CO₂?',
            a: `เพราะ dead space (~150 mL) กินสัดส่วนใหญ่ของแต่ละครั้ง: alveolar = (200−150) × 40 = **2,000 mL/นาที** เท่านั้น (เทียบปกติ ~4–5 L) — ลมส่วนใหญ่แค่ "เข้า-ออก dead space" ไม่ถึงถุงลม จึงระบาย CO₂ ไม่พอ ต้องเพิ่ม **ความลึก** ไม่ใช่แค่ความถี่`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 4 — PATHOLOGY ──────────────────────────────
  {
    id: 'aw-ch4', title: 'บทที่ 4: พยาธิสรีรวิทยาการอุดกั้นและภาวะหายใจล้มเหลว (Pathology)',
    icon: '🚨',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- แยกกลไกอุดกั้นตามระดับ (ลิ้นตก/laryngospasm/angioedema/FB/สารคัดหลั่ง/บวม) และจับคู่ **เสียง → การแก้**
- แยก **respiratory failure Type I vs II** ตามค่าก๊าซในเลือด
- อธิบายพยาธิสภาพของ **aspiration** และวิธีป้องกัน
- ใช้ **LEMON** ประเมินทางเดินหายใจยากล่วงหน้า`,
      },
      {
        heading: 'กลไกการอุดกั้นทางเดินหายใจ',
        body: `แยกตาม "ระดับและกลไก" เพื่อเลือกการแก้ไขให้ตรงจุด:

| กลไก | ที่เกิด | เสียง/สัญญาณ | การแก้เบื้องต้น |
|---|---|---|---|
| **โคนลิ้นตก** (กล้ามเนื้อหย่อนในผู้หมดสติ) | oropharynx | snoring | head-tilt/chin-lift, jaw-thrust, OPA/NPA |
| **Laryngospasm** (สายเสียงหดเกร็ง) | glottis | stridor/เงียบสนิท | จัดท่า, positive pressure, (ยาคลายกล้ามเนื้อถ้าจำเป็น) |
| **Angioedema** (บวมจากภูมิแพ้/ยา ACEI) | ริมฝีปาก ลิ้น glottis | เสียงเปลี่ยน, stridor | adrenaline, จัดการทางเดินหายใจเร็ว |
| **สิ่งแปลกปลอม (FBAO)** | ตั้งแต่คอถึงหลอดลม | ไอ/สำลัก/เงียบ | back blows + abdominal/chest thrust |
| **สารคัดหลั่ง/เลือด/อาเจียน** | ทุกระดับ | gurgling | ดูดเสมหะ (suction), จัดท่า |
| **บวม/มะเร็ง/การติดเชื้อ** (epiglottitis, croup) | supraglottic/subglottic | stridor | หลีกเลี่ยงกระตุ้น, ทางเดินหายใจขั้นสูงโดยผู้เชี่ยวชาญ |

> **หลักฟังเสียง:** *snoring* = ระดับลิ้น/คอหอย · *stridor* = ระดับกล่องเสียง · *gurgling* = มีของเหลว · *wheeze* = หลอดลมเล็กหดเกร็ง`,
      },
      {
        heading: 'ภาวะหายใจล้มเหลว 2 ชนิด และการสำลัก (Aspiration)',
        body: `**Type I (Hypoxemic):** PaO₂ ต่ำ, PaCO₂ ปกติ/ต่ำ — ปัญหาที่ "การแลกเปลี่ยนออกซิเจน" (ปอดบวม, ARDS, PE)

**Type II (Hypercapnic):** PaCO₂ สูง ± PaO₂ ต่ำ — ปัญหาที่ "การระบายอากาศ (ventilation)" (ยากดการหายใจ, กล้ามเนื้ออ่อนแรง, COPD รุนแรง, ทางเดินหายใจอุดกั้น)

**Aspiration pathophysiology:** เมื่อ gag/สายเสียงไม่ป้องกัน สารในกระเพาะ (กรด) ลงปอด → เยื่อบุถูกทำลาย, สูญเสีย surfactant, เกิด chemical pneumonitis + shunt
- ป้องกัน: จัดท่า, suction, ใส่ท่อมี cuff, หลีกเลี่ยง gastric inflation จากการบีบ BVM แรงเกิน (ดูบท 3)`,
        qa: [
          {
            q: 'ประเมิน "ทางเดินหายใจยาก (difficult airway)" ล่วงหน้าอย่างไร?',
            a: `ใช้เครื่องมือช่วยจำ **LEMON**:
- **L**ook externally — ใบหน้าผิดรูป, เครา, ฟันยื่น, คอสั้น, อ้วน
- **E**valuate 3-3-2 — อ้าปากได้ 3 นิ้ว, คาง-hyoid 3 นิ้ว, hyoid-thyroid 2 นิ้ว
- **M**allampati — มองเห็นโครงสร้างคอหอยได้มากแค่ไหน (class III–IV = ยาก)
- **O**bstruction/Obesity — มีก้อน/บวม/อ้วน
- **N**eck mobility — คอขยับได้จำกัด (ข้ออักเสบ, collar)

**ประเด็นสำคัญ:** การประเมินล่วงหน้าช่วยให้เตรียม *แผนสำรอง* (SGA, video laryngoscope, ชุด cric) และ **เรียกความช่วยเหลือก่อน** ไม่ใช่ค้นพบว่ายากตอนที่ผู้ป่วยขาดออกซิเจนแล้ว`,
          },
        ],
      },
      {
        heading: '⟐ เชิงลึก: กลไกระดับโมเลกุลของ Angioedema และ Flow-volume loop',
        body: `**Angioedema — 2 เส้นทางที่รักษาต่างกัน:**

| ชนิด | mediator | ตอบต่อ adrenaline/steroid/antihistamine? |
|---|---|---|
| **Histaminergic** (allergic/anaphylaxis) | histamine, mast cell | **ตอบดี** — adrenaline คือหลัก |
| **Bradykinin-mediated** (ACE-inhibitor, hereditary C1-INH def.) | **bradykinin** สะสม | **ตอบไม่ดี**ต่อยาแพ้มาตรฐาน — ต้องจัดการทางเดินหายใจเชิงรุก; HAE ใช้ C1-INH/icatibant |

> ACEi ยับยั้งการสลาย bradykinin → angioedema ที่มาช้าและดื้อ adrenaline — จุดที่แพทย์เฉพาะทางต้องแยกเพราะเปลี่ยนการรักษาโดยสิ้นเชิง

**Flow-volume loop จำแนกระดับอุดกั้น:**
- **Variable extrathoracic** (เช่น vocal cord dysfunction, croup) → **inspiratory** flattening (stridor ตอนหายใจเข้า)
- **Variable intrathoracic** (เช่น tracheomalacia) → **expiratory** flattening
- **Fixed** (เช่น subglottic stenosis, mass) → flatten ทั้งเข้า-ออก` },
      {
        kind: 'warning',
        body: `**Differential ของ stridor ตามอายุ (เฉพาะทาง):** ทารก — laryngomalacia (พบบ่อยสุด), vascular ring, subglottic hemangioma · เด็ก — **croup** (viral, เห่า), **epiglottitis** (แบคทีเรีย, น้ำลายไหล, tripod — ห้ามกระตุ้น), **FBAO**, bacterial tracheitis, retropharyngeal abscess · ผู้ใหญ่ — angioedema, anaphylaxis, มะเร็งกล่องเสียง, post-extubation edema, vocal cord dysfunction (เลียนแบบ asthma)` },
      {
        kind: 'evidence',
        body: `**Croup:** dexamethasone ขนาดเดียวลดความรุนแรง/การกลับมา รพ.; nebulized epinephrine สำหรับ moderate-severe (ออกฤทธิ์เร็วแต่สั้น เฝ้า rebound) · **Epiglottitis:** จัดการทางเดินหายใจในห้องผ่าตัดโดยทีมพร้อม ไม่กระตุ้นเด็ก *(อ้างเชิงหลักการ — ตรวจสอบแนวทางกุมาร/ENT ล่าสุด)*` },
      {
        kind: 'summary',
        body: `| เสียง | ระดับที่อุดกั้น | แก้เบื้องต้น |
|---|---|---|
| Snoring | ลิ้น/คอหอย | chin-lift/jaw-thrust, OPA/NPA |
| Stridor | กล่องเสียง | จัดการเร็ว (adrenaline ถ้า angioedema) |
| Gurgling | มีของเหลว | **suction** |
| Wheeze | หลอดลมเล็ก | รักษา bronchospasm |

Type I = ปัญหา **ออกซิเจน** (PaO₂↓) · Type II = ปัญหา **ระบายอากาศ** (PaCO₂↑)

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ผู้ป่วย COPD ซึม หายใจช้า ABG: PaCO₂ 80, PaO₂ 55 — เป็น failure ชนิดใด และประเด็นการให้ O₂ คืออะไร?',
            a: `**Type II (hypercapnic)** — ปัญหาหลักคือ *ระบายอากาศไม่พอ* ให้ **titrate O₂ เป้า SpO₂ ~88–92%** (ไม่ใช่ 100%) เพราะ O₂ สูงเกินอาจลด hypoxic drive + เพิ่ม V/Q mismatch ทำให้ CO₂ คั่งขึ้นอีก — และเตรียมช่วยระบายอากาศ (NIV/บีบช่วย) เพราะรากปัญหาคือ ventilation`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 5 — PHARMACOLOGY ──────────────────────────────
  {
    id: 'aw-ch5', title: 'บทที่ 5: เภสัชวิทยาที่เกี่ยวข้อง (Pharmacology)',
    icon: '💊',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบาย **ออกซิเจนในฐานะยา** (เป้า SpO₂, โทษของ hyperoxia) และหลัก pre-oxygenation
- อธิบายหลักการ **RSI** = induction + paralytic และเหตุผลที่ทำเกือบพร้อมกัน
- เปรียบเทียบผลต่อ **ระบบไหลเวียน** ของ induction agents (etomidate/ketamine/propofol)
- แยก **succinylcholine vs rocuronium** เชิงกลไก + ข้อห้ามสำคัญ`,
      },
      {
        kind: 'warning',
        body: `เนื้อหาบทนี้อธิบาย **กลไกและชั้นยา (mechanism/class)** เพื่อความเข้าใจเชิงลึกเท่านั้น **ไม่ใช่คำสั่งใช้ยาหรือขนาดยาสำหรับผู้ป่วยจริง** — ขนาดยา/ข้อบ่งชี้ต้องยึด protocol ของสถาบัน น้ำหนักตัวจริง และการกำกับของแพทย์เสมอ; การจัดการยา RSI เป็นหัตถการของผู้ผ่านการฝึกเฉพาะทาง`,
      },
      {
        heading: 'ออกซิเจนในฐานะ "ยา" และหลัก Pre-oxygenation',
        body: `ออกซิเจนเป็นยาที่มีทั้งขนาดและผลข้างเคียง:
- **เป้าหมาย SpO₂** โดยทั่วไป 94–98% (ผู้ป่วยเสี่ยง CO₂ คั่ง เช่น COPD มักตั้งเป้าต่ำกว่า ~88–92% ตามแนวทาง)
- **Hyperoxia (ออกซิเจนเกิน)** สัมพันธ์กับการบาดเจ็บจาก reactive oxygen species และผลเสียหลัง ROSC — จึง *titrate ลง* หลังผู้ป่วยฟื้น ไม่ปล่อย 100% ค้างไว้โดยไม่จำเป็น

**Pre-oxygenation / denitrogenation:** ให้ออกซิเจนเข้มข้นสูงก่อนใส่ท่อ เพื่อ "ล้างไนโตรเจน" ออกจาก FRC แล้วแทนที่ด้วยออกซิเจน → ยืดเวลาที่ผู้ป่วยจะเริ่มขาดออกซิเจนระหว่างหยุดหายใจ (apnea) ให้ทำหัตถการได้ปลอดภัยขึ้น`,
      },
      {
        heading: 'หลักการ Rapid Sequence Intubation (RSI): Induction + Paralytic',
        body: `RSI คือการให้ยาสลบ (induction) ตามด้วยยาคลายกล้ามเนื้อ (NMBA) เกือบพร้อมกัน เพื่อสร้างสภาพใส่ท่อที่ดีที่สุดและลดการสำลัก

**ยานำสลบ (Induction agents) — เข้าใจ "ผลต่อระบบไหลเวียน":**
| ยา | จุดเด่นเชิงกลไก | ข้อพิจารณา |
|---|---|---|
| **Etomidate** | กระทบความดันน้อย | กด adrenal ชั่วคราว |
| **Ketamine** | กระตุ้น sympathetic, คงความดัน + ขยายหลอดลม | ดีในภาวะช็อก/หอบ |
| **Propofol** | ออกฤทธิ์เร็ว หลับลึก | **ลดความดัน** ระวังในผู้ป่วยช็อก |

**ยาคลายกล้ามเนื้อ (NMBA) — ออกฤทธิ์ที่ neuromuscular junction:**
- **Succinylcholine (depolarizing)** — จับ ACh receptor แล้ว "ค้าง depolarize" ทำให้กล้ามเนื้อเป็นอัมพาต; ออกฤทธิ์เร็วมาก/สั้น แต่มีข้อห้าม (hyperkalemia, burn/crush เก่า, มะเร็งกล้ามเนื้อบางชนิด — เสี่ยงโพแทสเซียมพุ่ง)
- **Rocuronium (non-depolarizing)** — แข่งกับ ACh ที่ receptor; ออกฤทธิ์นานกว่า (มี sugammadex เป็นตัว reverse)

> **กับดักที่ต้องรู้:** ยา induction บางตัวทำให้ *หลับ* แต่ NMBA ทำให้ *เป็นอัมพาตหายใจเองไม่ได้* — ถ้าใส่ท่อไม่สำเร็จต้องช่วยหายใจ (BVM/SGA) จนกว่ายาหมดฤทธิ์หรือมีแผนสำรอง จึงต้องเตรียม "แผนล้มเหลว" ทุกครั้งก่อนให้ยา`,
        qa: [
          {
            q: 'ทำไมลำดับและการเลือกยาใน RSI จึงต้องคำนึงถึง "สภาพผู้ป่วย" ไม่ใช่สูตรตายตัว?',
            a: `เพราะยาแต่ละตัวมีผลต่างกันต่อ **ความดันโลหิตและหัวใจ** ซึ่งในผู้ป่วยวิกฤตอาจเป็นตัวชี้เป็นชี้ตาย

**ตัวอย่างการคิดเชิงกลไก:**
- ผู้ป่วย **ช็อก/ความดันต่ำ** → propofol อาจทำความดันดิ่งจนหัวใจหยุด; ketamine/etomidate ที่คงความดันมักเหมาะกว่า
- ผู้ป่วย **หอบหืดรุนแรง** → ketamine มีฤทธิ์ขยายหลอดลมเสริม
- ผู้ป่วยเสี่ยง **hyperkalemia** (ไตวาย, แผลไหม้/บาดเจ็บกล้ามเนื้อเก่า) → เลี่ยง succinylcholine เลือก rocuronium

หลักคิดคือ "**physiologically difficult airway**" — บางครั้งความยากไม่ได้อยู่ที่กายวิภาค แต่อยู่ที่ผู้ป่วยจะทน apnea/ยาที่กดระบบไหลเวียนได้แค่ไหน จึงต้อง optimize ความดัน/ออกซิเจนก่อน และเลือกยาให้เข้ากับสรีรวิทยา — **ไม่มีสูตรเดียวใช้ได้กับทุกคน**`,
          },
        ],
      },
      {
        heading: 'Onset / Duration ของยา RSI และทำไม "ลำดับ + จังหวะ" จึงสำคัญ',
        body: `RSI ให้ induction แล้วตามด้วย paralytic **เกือบพร้อมกัน** เพราะต้องการให้ทั้งสอง "ออกฤทธิ์สุด" ตรงจังหวะที่จะใส่ท่อ

| ยา | Onset | Duration | นัยต่อจังหวะ |
|---|---|---|---|
| **Succinylcholine** | **~45–60 วินาที** | **สั้น ~6–10 นาที** | ได้สภาพใส่ท่อเร็ว; ถ้าใส่ไม่ได้ ยาหมดฤทธิ์เร็ว ผู้ป่วยกลับมาหายใจเองได้ |
| **Rocuronium** | ~60 วินาที (dose สูงเร็วขึ้น) | **นาน ~30–60 นาที** | ต้องมั่นใจว่าช่วยหายใจได้ เพราะอัมพาตนาน (มี sugammadex reverse) |
| **Etomidate/Ketamine/Propofol** | ~15–45 วินาที | ~5–15 นาที | ให้ *ก่อน/พร้อม* paralytic ให้ผู้ป่วยหลับก่อนเป็นอัมพาต |

**ทำไมจังหวะสำคัญ:**
- ต้องให้ **induction (หลับ) นำหรือพร้อม paralytic** — ห้ามให้ paralytic ก่อนจนผู้ป่วย "เป็นอัมพาตแต่ยังรู้สึกตัว"
- รอให้ paralytic **ออกฤทธิ์สุด (~45–60 วินาที)** ก่อนจึงใส่ท่อ — ใส่เร็วเกินตอนกล้ามเนื้อยังไม่คลายเต็มที่ = มองยาก/บาดเจ็บ
- ช่วง apnea นี้อาศัย **pre-oxygenation** (ที่ทำไว้ก่อน) เป็นออกซิเจนสำรอง` },
      {
        kind: 'pearl',
        body: `**เลือก induction ตาม "ความดัน" ไม่ใช่ความเคยชิน:** ช็อก/ความดันต่ำ → *ketamine หรือ etomidate* (คงความดัน) · หอบหืด → *ketamine* (ขยายหลอดลม) · เสี่ยง hyperkalemia (ไตวาย/ไหม้เก่า) → เลี่ยง *succinylcholine* ใช้ *rocuronium*`,
      },
      {
        heading: '⟐ ระดับโมเลกุล: NMBA และ Induction agents ที่ receptor',
        body: `**Succinylcholine (depolarizing) ที่ nicotinic ACh receptor (NMJ):**
- จับ receptor แล้ว **ค้าง depolarize** (agonist ที่ไม่ถูกสลายเร็ว) → phase I block; ให้ซ้ำ/นานเข้า phase II (คล้าย non-depol)
- เมแทบอลิซึมโดย **plasma (pseudo)cholinesterase** — **pseudocholinesterase deficiency** (พันธุกรรม/atypical) → อัมพาตยืดยาวเป็นชั่วโมง
- **Hyperkalemia:** ในภาวะ **upregulation ของ extrajunctional/fetal nAChR** (แผลไหม้เก่า >24–72 ชม., denervation, immobility นาน, กล้ามเนื้อเสื่อม) การ depolarize ปล่อย K⁺ มหาศาล → arrest
- **Malignant hyperthermia:** กระตุ้น **RYR1 (ryanodine receptor)** ที่ผิดปกติ → Ca²⁺ ท่วม sarcoplasm, hypermetabolism, EtCO₂/อุณหภูมิพุ่ง — **รักษาด้วย dantrolene** (บล็อก RYR1)

**Rocuronium (non-depolarizing):** แข่งกับ ACh แบบ competitive; **reverse ด้วย sugammadex** = **γ-cyclodextrin** ที่ "ห่อหุ้ม (encapsulate)" โมเลกุล rocuronium ในกระแสเลือด → ดึงออกจาก receptor เร็ว

**Induction agents ที่ receptor:** propofol & etomidate = **GABA_A** agonist (etomidate ยังยับยั้ง **11β-hydroxylase** → adrenal suppression) · **ketamine = NMDA receptor antagonist** (dissociative, คง sympathetic + bronchodilation)` },
      {
        kind: 'evidence',
        body: `**RSI:** succinylcholine (~1–1.5 mg/kg) หรือ rocuronium ขนาดสูง (~1.2 mg/kg) ให้สภาพใส่ท่อใกล้เคียง; **sugammadex** ทำให้ rocuronium เป็นทางเลือกที่ reverse ได้เร็วแม้ deep block · **Cricoid pressure** ยัง controversial (อาจบิด anatomy/บดบัง view) — หลายแนวทางให้ปรับ/ปล่อยถ้าขัดการมองเห็น *(อ้างเชิงหลักการ — ตรวจสอบแนวทางวิสัญญี/EM ล่าสุด)*` },
      {
        kind: 'warning',
        body: `**Special populations / PK:** ไตวาย — เลี่ยงยา/metabolite ที่ขับทางไต (เช่นสะสมของบางยา), succinylcholine เพิ่ม K⁺ ระวังใน hyperkalemia อยู่เดิม · ตับวาย — การสร้าง pseudocholinesterase ลด → succinylcholine ออกฤทธิ์นานขึ้น · ผู้สูงอายุ/ช็อก — ลดขนาด induction, ระวัง propofol กดความดัน · เด็ก — succinylcholine เสี่ยง bradycardia/hyperkalemia (จาก myopathy แฝง) จึงสงวนไว้เฉพาะข้อบ่งชี้` },
      {
        kind: 'summary',
        body: `| ยา | จุดเด่นเชิงกลไก | ระวัง |
|---|---|---|
| Etomidate | กระทบความดันน้อย | กด adrenal ชั่วคราว |
| Ketamine | คงความดัน + ขยายหลอดลม | — |
| Propofol | เร็ว หลับลึก | **ลดความดัน** |
| Succinylcholine | depolarizing เร็ว/สั้น | **hyperkalemia** |
| Rocuronium | non-depol. นานกว่า | reverse ด้วย sugammadex |

O₂ เป้า **94–98%** (COPD ~88–92%); หลัง ROSC *titrate ลง* เลี่ยง hyperoxia

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ทำไม RSI จึงต้องมี "แผนล้มเหลว" เตรียมก่อนดันยา ทุกครั้ง?',
            a: `เพราะ NMBA ทำให้ผู้ป่วย **หายใจเองไม่ได้ (อัมพาต)** ทันที — ถ้าใส่ท่อไม่สำเร็จ จะต้องช่วยหายใจ (BVM/SGA) จนยาหมดฤทธิ์หรือทำแผนสำรอง (video laryngoscope/cric) การเตรียมอุปกรณ์+บทบาททีมล่วงหน้าคือสิ่งที่กันไม่ให้ "ใส่ไม่ได้ + ช่วยหายใจไม่ได้" กลายเป็นหายนะ`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 6 — EQUIPMENT ──────────────────────────────
  {
    id: 'aw-ch6', title: 'บทที่ 6: อุปกรณ์จัดการทางเดินหายใจ (Equipment)',
    icon: '🧰',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- เลือก/วัดขนาด **OPA vs NPA** ตามระดับความรู้สึกตัว และรู้ข้อห้าม
- อธิบายส่วนประกอบ **BVM** (one-way valve, reservoir, PEEP valve) และเหตุผลของแต่ละชิ้น
- อธิบายโครงสร้าง **ETT ระดับ mm/cm** — cuff, Murphy eye, และ **"เส้นดำ" (vocal cord marker)** กับระยะกายวิภาค
- เทียบ **Macintosh vs Miller** และรู้บทบาท video laryngoscope/bougie
- อ่าน **4 เฟสของ capnography** และรูปคลื่นที่บอกโรค`,
      },
      {
        heading: 'อุปกรณ์พื้นฐาน: OPA, NPA และ Bag-Valve-Mask',
        body: `**OPA (Oropharyngeal airway):**
- ยกโคนลิ้นพ้นผนังคอหลัง; ใช้เฉพาะผู้ **หมดสติสนิท ไม่มี gag reflex** (ไม่งั้นกระตุ้นอาเจียน)
- วัดขนาด: มุมปาก → มุมกราม (หรือติ่งหู)

**NPA (Nasopharyngeal airway):**
- ทน gag reflex ได้ดีกว่า ใช้ในผู้กึ่งรู้สึกตัว
- วัด: ปลายจมูก → ติ่งหู; **ห้าม**เมื่อสงสัยกระดูกฐานกะโหลกหัก

**BVM (Bag-Valve-Mask):**
- ถุงบีบ (self-inflating) + **one-way valve** + หน้ากาก + **reservoir bag** (ทำให้ FiO₂ ใกล้ 100% เมื่อต่อออกซิเจน flow สูง)
- ตัวเลือก **PEEP valve** ช่วยคงถุงลมเปิด (ดูบท 2 — surfactant/atelectasis)
- บีบ ~ให้เห็นหน้าอกยกพอดี, ~1 วินาที/ครั้ง เพื่อเลี่ยง gastric inflation`,
      },
      {
        heading: 'ทางเดินหายใจขั้นสูง: SGA, ETT และ Laryngoscope',
        body: `**Supraglottic airway (SGA) — LMA / i-gel:**
- วางเหนือ glottis โดย **ไม่ต้องมองเห็นสายเสียง** → ใส่เร็ว เหมาะกับสถานการณ์เร่งด่วน/ผู้ใส่ประสบการณ์น้อย
- ป้องกัน aspiration ได้น้อยกว่า ETT (i-gel รุ่นใหม่มีช่องระบายกระเพาะ)

**Endotracheal tube (ETT) — โครงสร้างระดับ mm/cm:**
- ท่อผ่านสายเสียงลงหลอดลม มี **cuff** ปิดผนึก (ป้องกัน aspiration ดีที่สุด), **Murphy eye** (รูข้างปลายท่อ — สำรองทางลมถ้าปลายท่อชิดผนัง/อุดตัน)
- **"เส้นดำ" ใกล้ปลายท่อ (vocal cord guide marker):** ปลายท่อถึงแถบดำยาว **~10 ซม.** — ออกแบบให้ *เมื่อวางแถบดำคร่อมที่สายเสียง ปลายท่อจะอยู่กลางหลอดลมพอดี เหนือ carina* เพราะระยะ **vocal cord → carina ในผู้ใหญ่ ~10–13 ซม.** (นี่คือ "ตัวเลขกายวิภาค" ที่ทำให้ marker ใช้ได้จริง)
- **ความลึกที่มุมปาก** (ยึดเป็นตัวเลขซ้ำ): ผู้ใหญ่ ~**21 ซม.หญิง / ~23 ซม.ชาย**; เด็ก ≈ (อายุ/2)+12 หรือ 3×ID
- **ขนาด (ID มม.):** ผู้ใหญ่หญิง ~7.0–7.5, ชาย ~7.5–8.0; เด็ก ≈ (อายุ/4)+4 (cuffed ลบ ~0.5)
- **แรงดัน cuff** เป้า ~20–30 cmH₂O — สูงเกินกดเยื่อบุหลอดลมขาดเลือด, ต่ำเกินรั่ว/สำลัก

**Laryngoscope:**
| ชนิด | หลักการ | จุดวางปลาย |
|---|---|---|
| **Macintosh (curved)** | ยก epiglottis *โดยอ้อม* | vallecula |
| **Miller (straight)** | ยก epiglottis *โดยตรง* | ใต้ epiglottis |
| **Video laryngoscope** | กล้องที่ปลาย เห็นมุมที่ direct มองไม่เห็น | เพิ่มอัตราสำเร็จในทางเดินหายใจยาก |

**อุปกรณ์เสริม:** bougie (ช่วยนำท่อเมื่อเห็น glottis ไม่ชัด), stylet, Magill forceps (คีบสิ่งแปลกปลอม), ชุด cricothyrotomy (แผนสุดท้าย CICO)`,
      },
      {
        heading: 'Capnography: อ่าน waveform เป็นภาษาของทางเดินหายใจ',
        body: `**Waveform capnography** วัด CO₂ ตลอดรอบหายใจ ให้ข้อมูลมากกว่าตัวเลข EtCO₂ ตัวเดียว

**4 เฟสของ waveform ปกติ (สี่เหลี่ยมมุมป้าน):**
- I — เริ่มหายใจออก (dead space, CO₂ = 0)
- II — ขาขึ้นชัน (แก๊สจากถุงลมเริ่มออก)
- III — plateau (ค่าที่อ่านคือปลาย plateau = EtCO₂)
- IV — หายใจเข้า ดิ่งกลับ 0

**รูปคลื่นที่บอกโรค:**
- **"ครีบฉลาม" (shark-fin)** ขาขึ้นลาดเอียง = **หลอดลมหดเกร็ง/อุดกั้น** (asthma/COPD)
- **ค่าตกฮวบเป็น 0 ทันที** = ท่อหลุด/เครื่องหลุด/หัวใจหยุด
- **ค่าตกทีละน้อย** = เลือดออก/ช็อก/hyperventilation
- **ค่าพุ่งขึ้นฉับพลัน** ระหว่าง CPR = สงสัย **ROSC**

> การมี waveform ต่อเนื่องคือเหตุผลที่ capnography เป็นมาตรฐานยืนยันตำแหน่งท่อ — ไม่มี waveform ให้ **สงสัยท่ออยู่ผิดที่ (หลอดอาหาร) ทันที**`,
        qa: [
          {
            q: 'เลือก SGA หรือ ETT อย่างไร และอะไรคือ trade-off เชิงกลไก?',
            a: `**ETT** = ป้องกันทางเดินหายใจสมบูรณ์ที่สุด (cuff กัน aspiration, ให้ positive pressure ได้ดี) แต่ **ใส่ยาก** ต้องมองเห็น glottis + ทักษะสูง + เสี่ยงหยุดกดหน้าอกนานถ้าใส่ยาก

**SGA** = ใส่เร็ว ไม่ต้องเห็นสายเสียง เหมาะเมื่อ **ต้องการทางเดินหายใจเร็วโดยไม่ขัดจังหวะ CPR** หรือผู้ใส่ประสบการณ์จำกัด แต่ป้องกัน aspiration ได้น้อยกว่าและอาจรั่วเมื่อ compliance ปอดแย่มาก

**หลักตัดสินใจใน cardiac arrest:** แนวทางปัจจุบันยอมรับทั้งสองอย่าง — สิ่งที่สำคัญกว่าชนิดท่อคือ **"ใส่แล้วต้องไม่ทำให้ chest compression fraction ลดลง"** และ **ยืนยันตำแหน่งด้วย capnography** เสมอ; ระหว่างพยายามใส่ ETT ไม่ควรหยุดกดหน้าอกเกิน ~10 วินาที/ครั้ง ถ้าใส่ยากให้เปลี่ยนเป็น SGA`,
          },
        ],
      },
      {
        heading: '⟐ เชิงลึก: ฟิสิกส์ของ Cuff, Capnography และ Video laryngoscope',
        body: `**ETT cuff — ทำไมเป้าแรงดัน 20–30 cmH₂O:** ใช้ **high-volume low-pressure cuff** กระจายแรงบนผนัง trachea; แรงดันที่ผนัง **ต้องต่ำกว่า capillary perfusion pressure ของเยื่อบุ (~30 mmHg ≈ 40 cmH₂O)** ไม่งั้นเยื่อบุขาดเลือด → ischemia/stenosis ระยะยาว; ต่ำเกิน (<20) เสี่ยง micro-aspiration รอบ cuff

**Waveform capnography — หลักการวัด:** วัด CO₂ ด้วย **การดูดกลืนแสงอินฟราเรดที่ ~4.26 µm** (CO₂ ดูดกลืนจำเพาะ) — mainstream (เร็ว) vs sidestream (ดูดตัวอย่าง)
- 4 เฟส (I dead space → II ขาขึ้น → III plateau/alveolar → 0 หายใจเข้า); **α-angle** กว้างขึ้นใน obstruction (shark-fin)

**Video laryngoscope — 2 แบบ:** *Macintosh-style blade* (ใช้เทคนิคคล้าย DL, ใส่ท่อตรง) vs **hyperangulated blade** (มุมชันเห็น glottis ที่ direct มองไม่เห็น แต่ **ต้องใช้ stylet/รูปโค้งเฉพาะ** เพราะท่อต้องเลี้ยวมุมชัน)` },
      {
        kind: 'evidence',
        body: `**Video laryngoscopy** เพิ่มอัตราการเห็น glottis (Cormack-Lehane) และ **first-pass success** โดยเฉพาะในทางเดินหายใจยาก/ผู้ทำประสบการณ์น้อย จนหลายแนวทางแนะนำเป็น first-line หรือ backup ทันที · **Bougie** (coudé tip) ช่วยเมื่อเห็น glottis ไม่ชัด — ยืนยันด้วย "tracheal clicks" และ "hold-up" *(อ้างเชิงหลักการ — ตรวจสอบ meta-analysis/แนวทางล่าสุด)*` },
      {
        kind: 'summary',
        body: `| อุปกรณ์ | ตัวเลข/หลักจำ |
|---|---|
| OPA | มุมปาก→มุมกราม; เฉพาะไม่มี gag |
| NPA | ปลายจมูก→ติ่งหู; ห้ามใน base of skull fx |
| ETT เส้นดำ | ปลายท่อ→marker ~10 ซม. = คร่อมสายเสียง |
| ความลึกมุมปาก | ~21 ญ / ~23 ช ซม. |
| Cuff pressure | 20–30 cmH₂O |
| Capnography | ไม่มี waveform = สงสัยท่อผิดที่ทันที |

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ทำไม Murphy eye จึงสำคัญ และ "ไม่มี waveform capnography" หลังใส่ท่อควรคิดอะไรก่อน?',
            a: `**Murphy eye** = รูสำรองข้างปลายท่อ ถ้าปลายท่อชิดผนังหลอดลมหรือมีเสมหะอุด ลมยังผ่านรูนี้ได้ — กันการอุดตันสมบูรณ์

**ไม่มี waveform** = ให้สงสัย **ท่ออยู่ในหลอดอาหาร (esophageal intubation)** จนกว่าจะพิสูจน์เป็นอื่น → มองสายเสียงซ้ำ/ถอดท่อแล้วช่วยหายใจ ไม่ใช่คิดว่า "เครื่องเสีย" (ยกเว้น cardiac arrest ที่ flow ต่ำมากอาจได้ waveform เตี้ย — ยังต้องยืนยันด้วยการมองเห็น)`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 7 — TECHNIQUE ──────────────────────────────
  {
    id: 'aw-ch7', title: 'บทที่ 7: เทคนิคหัตถการแบบบูรณาการ (Technique)',
    icon: '🙌',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- จัดท่า **sniffing / ear-to-sternal-notch** และเลือกท่าตามวัย (เชื่อมกายวิภาคบท 1)
- ทำ **E-C clamp** ที่ถูกต้อง และรู้ว่าเมื่อไรเปลี่ยนเป็น 2 คน
- เรียงลำดับ **intubation** ครบขั้น + เทคนิคช่วยเห็น glottis (BURP/ELM, bougie)
- จัดการ **FBAO** ตามกลุ่มวัย และรู้ทางออกสุดท้าย **CICO → cricothyrotomy**
- ปรับจังหวะ CPR/ช่วยหายใจ **หลังใส่ advanced airway**`,
      },
      {
        heading: 'จัดท่าและเปิดทางเดินหายใจด้วยมือ',
        body: `**จัดท่า (positioning)** เชื่อมโยงกับกายวิภาคบท 1 — จัดให้ 3 แกน (ปาก-คอหอย-กล่องเสียง) เป็นแนวเดียว:
- ผู้ใหญ่: **sniffing position** (ก้มคอเล็กน้อย เงยศีรษะ) หรือจัด **ear-to-sternal-notch** (โดยเฉพาะผู้ป่วยอ้วน — หนุนไหล่/ศีรษะ)
- เด็กเล็ก: รองไหล่ (occiput ใหญ่ทำให้คอพับ — ดูบท 1)

**เปิดทางเดินหายใจด้วยมือ:**
- **Head-tilt/chin-lift** — มาตรฐานเมื่อไม่สงสัย trauma
- **Jaw-thrust** — เมื่อสงสัยบาดเจ็บกระดูกคอ (ไม่เงยศีรษะ); ถ้าไม่ได้ผล ความโล่งของทางเดินหายใจสำคัญกว่า ให้กลับมา head-tilt`,
      },
      {
        heading: 'Bag-Mask, SGA และ Intubation ที่มีคุณภาพ',
        body: `**BVM (เทคนิค E-C, ยิ่ง 2 คนยิ่งดี):**
- มือทำ "C" ด้วยนิ้วโป้ง/ชี้กดหน้ากาก, "E" ด้วย 3 นิ้วเกี่ยว *กระดูก*ขากรรไกรยกเข้าหาหน้ากาก (ไม่กดเนื้อใต้คาง)
- seal ยาก → เปลี่ยนเป็น 2 คน (คนหนึ่ง 2 มือ seal, อีกคนบีบ) + ใส่ OPA/NPA เสริม

**ใส่ SGA:** หล่อลื่น, สอดตามแนวเพดานปาก, ดันจนรู้สึกต้าน, ยืนยันการช่วยหายใจ (หน้าอกยก + capnography)

**Intubation (ETT):**
1. Pre-oxygenate ให้ดี (บท 5)
2. laryngoscopy — เปิดปาก, สอด blade, ยก **ตามแนวด้าม (ไปข้างหน้า-ขึ้น) ไม่งัดฟัน**
3. เทคนิคช่วยเห็น glottis: **BURP/ELM** (กดกล่องเสียงถอยหลัง-ขึ้น-ขวา), ใช้ **bougie**
4. ดันท่อผ่านสายเสียงจน cuff พ้น, ใส่ลม cuff
5. **ยืนยัน:** waveform capnography (ทอง) + ฟังปอด 2 ข้าง + หน้าอกยกเท่ากัน; ระวัง right mainstem (บท 1)
6. ยึดท่อ, บันทึกความลึก`,
      },
      {
        heading: 'FBAO และทางเดินหายใจล้มเหลว (CICO)',
        body: `**FBAO (สิ่งแปลกปลอมอุดกั้น) — แยกความรุนแรงก่อน:**
- *อุดกั้นบางส่วน* (ยังไอ/พูดได้) → ให้ไอเอง เฝ้าดูใกล้ชิด ห้ามแทรกแซงเกินจำเป็น
- *อุดกั้นสมบูรณ์* (ไอไม่ออก/เงียบ, กุมคอ) → ช่วยทันที

**เทคนิคตามกลุ่ม:**
| กลุ่ม | วิธี |
|---|---|
| ผู้ใหญ่/เด็กโต | abdominal thrust (Heimlich) |
| ตั้งครรภ์ท้ายๆ / อ้วนมาก | chest thrust |
| ทารก < 1 ปี | สลับ back blows 5 + chest thrusts 5 (**ห้าม** abdominal thrust) |
| หมดสติระหว่างช่วย | วางลงพื้น เริ่ม **CPR ทันที**; เปิดปากมองก่อนช่วยหายใจ หยิบเฉพาะที่ *มองเห็น* (ไม่ล้วงมั่ว) |

**Can't Intubate, Can't Oxygenate (CICO):** เมื่อทั้งใส่ท่อและช่วยหายใจล้มเหลว → หัตถการสุดท้ายคือ **cricothyrotomy** (เจาะผ่าน cricothyroid membrane, บท 1) โดยผู้ได้รับการฝึก — เป็นทางรอดเดียวเมื่อ "แทงไม่ได้ ช่วยหายใจไม่ได้"`,
        qa: [
          {
            q: 'เมื่อใส่ advanced airway (ETT/SGA) แล้ว จังหวะ CPR และการช่วยหายใจเปลี่ยนอย่างไร และทำไม?',
            a: `**ก่อนมี advanced airway:** ทำเป็นรอบ **30 กดหน้าอก : 2 ช่วยหายใจ** — ต้องหยุดกดเพื่อช่วยหายใจเพราะ BVM กับหน้าอกที่ขยับพร้อมกันทำให้ลมเข้าไม่ดีและเสี่ยง gastric inflation

**หลังใส่ advanced airway:** **กดหน้าอกต่อเนื่องไม่หยุด** + ช่วยหายใจแยกจังหวะ ~1 ครั้งทุก 6 วินาที (~10/นาที)

**เหตุผลเชิงสรีรวิทยา:**
- ท่อที่ผ่านสายเสียง/SGA ที่ seal ดี ทำให้ช่วยหายใจได้โดย**ไม่ต้องหยุดกด** → เพิ่ม **chest compression fraction** และคง coronary perfusion pressure (ดูความสำคัญใน defib)
- **ห้าม over-ventilate:** การบีบเร็ว/แรงเกินเพิ่มความดันในทรวงอก → ลดเลือดไหลกลับหัวใจ → ลด cardiac output จาก CPR และ EtCO₂ ตก

สรุป: เป้าหมายคือ "กดไม่หยุด + ช่วยหายใจพอดี ๆ" ซึ่งเป็นไปได้เมื่อทางเดินหายใจถูกกันไว้แล้ว`,
          },
        ],
      },
      {
        kind: 'warning',
        body: `**ห้าม blind finger sweep** (ล้วงคอแบบมองไม่เห็น) ในผู้ป่วย FBAO — อาจดันสิ่งแปลกปลอมลึกลงไปอีกหรือทำให้บาดเจ็บ; เอาออก **เฉพาะที่มองเห็นชัดเจน** เท่านั้น และในผู้หมดสติให้ **เริ่ม CPR** (การกดหน้าอกสร้างแรงดันไล่สิ่งแปลกปลอมได้)`,
      },
      {
        heading: '⟐ เชิงลึก: Failed-airway algorithm และ Surgical cricothyrotomy',
        body: `**แนวคิด Vortex/DAS — 3 ทางหลักก่อนถึง CICO:** (1) face-mask (2) SGA (3) ETT — แต่ละทางมี "optimization" (จัดท่า, adjunct, ขนาด, ปรับ operator) ก่อนประกาศล้มเหลว; จำกัดจำนวนครั้งเพื่อไม่ให้เกิด "can't intubate, can't oxygenate (CICO)" โดยไม่ทันตั้งตัว

**Scalpel–bougie–tube cricothyrotomy (ผู้ใหญ่):**
1. คลำ **laryngeal handshake** หา cricothyroid membrane
2. มีดกรีดแนวตั้งผ่านผิว → กรีดแนวขวางทะลุ membrane
3. สอด **bougie** ลง trachea → เลื่อน **ETT/tracheostomy tube ~6.0** ตาม bougie → ใส่ cuff, ยืนยัน capnography

> **เด็กเล็ก (< ~8–10 ปี):** cricothyroid membrane เล็กมาก — ใช้ **needle cricothyrotomy + jet/ที่รองรับ** แทน surgical (เสี่ยง barotrauma ต้องระวังทางลมออก)` },
      {
        kind: 'evidence',
        body: `**Human factors** เป็นสาเหตุใหญ่ของ airway disaster (NAP4 concept): ความล้มเหลวมักไม่ใช่เทคนิคล้วน แต่คือการ **ไม่ประกาศ/ไม่ลงมือ cricothyrotomy ทันเวลา** ("การตัดสินใจ" มากกว่า "มือ") — จึงเน้นการซ้อม, checklist, และ shared mental model *(อ้างเชิงหลักการ — ตรวจสอบ DAS/NAP report ล่าสุด)*` },
      {
        kind: 'warning',
        body: `**Special populations — เทคนิคที่ต้องปรับ:** หญิงตั้งครรภ์ (ท่า left-lateral tilt ลด aortocaval compression, desaturate เร็ว, aspiration เสี่ยงสูง → cuffed ETT) · อ้วน (ท่า ramped/HELP: ear-to-sternal-notch, pre-oxygenate ท่าหัวสูง) · trauma cervical (in-line stabilization, VL/bougie ช่วยลดการขยับคอ)` },
      {
        kind: 'summary',
        body: `| สถานการณ์ | ทำอะไร |
|---|---|
| จัดท่าผู้ใหญ่ | sniffing / ear-to-sternal-notch |
| จัดท่าเด็กเล็ก | รองไหล่ (occiput ใหญ่) |
| BVM seal ยาก | เปลี่ยน 2 คน + OPA/NPA |
| ยืนยันท่อ | capnography + ฟังปอด 2 ข้าง |
| FBAO ผู้ใหญ่ | abdominal thrust; หมดสติ → CPR |
| CICO | cricothyrotomy (cricothyroid membrane) |

หลัง advanced airway: **กดต่อเนื่อง + ช่วยหายใจ 1 ครั้ง/6 วินาที** ห้าม over-ventilate

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ทำ E-C clamp แล้ว seal ไม่อยู่ ลมเข้าน้อย — ควรไล่แก้อะไรบ้างก่อนสรุปว่า "ช่วยหายใจไม่ได้"?',
            a: `ไล่ตามลำดับ: (1) **จัดท่า** ใหม่ (sniffing/ยกคาง) (2) ใส่ **OPA/NPA** เปิดทางลิ้นที่ตก (3) เปลี่ยนเป็น **เทคนิค 2 คน** (คนหนึ่งสองมือ seal + E-C สองข้าง อีกคนบีบ) (4) ตรวจขนาด **หน้ากาก**/ปล่อยลมในเครา/ฟันปลอม (5) พิจารณา **SGA** — ส่วนใหญ่ปัญหาคือลิ้นตก+seal ไม่ใช่ "ช่วยหายใจไม่ได้จริง"`,
          },
        ],
      },
    ],
  },
];
