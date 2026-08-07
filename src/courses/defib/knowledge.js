// คลังความรู้ Defibrillation & Electrical Therapy — เนื้อหาอ้างอิงเชิงลึก (ระดับ "ปรมาจารย์") สำหรับหน้า /knowledge
// Schema เดียวกับ src/data/alsContent.js / blsKnowledgeContent.js:
//   chapter = { id, title, icon, sections: [{ heading?, body?, images?, videos?, qa? }] }
//   body รองรับ Markdown เต็ม (หัวข้อย่อย/ตาราง/ตัวหนา) ผ่าน SkillKnowledge.jsx → mdComponents
//
// โครงเนื้อหา 7 ชั้น: Anatomy → Histology → Physiology → Pathology → Pharmacology → Equipment → Technique
// เรียบเรียงตามหลักหทัยสรีรวิทยา/ไฟฟ้าหัวใจมาตรฐาน + แนวทาง ILCOR/ACLS 2020–2025 (paraphrase — ไม่คัดลอกต้นฉบับ)
//
// ⚠️ DRAFT — ยังไม่ผ่าน medical review: เนื้อหาคลินิก โดยเฉพาะบท Pharmacology (บท 5) และค่าพลังงาน (J)
//    ต้องผ่านการตรวจสอบโดยแพทย์ EM/ICU/หทัยวิทยา ก่อนใช้กับผู้เรียนจริง
//    ค่าพลังงาน/ขนาดยาเป็น "หลักการทั่วไป" ต้องยึดคู่มือเครื่องและ protocol สถาบันเสมอ

export const chapters = [
  // ────────────────────────────── บทที่ 1 — ANATOMY ──────────────────────────────
  {
    id: 'df-ch1', title: 'บทที่ 1: กายวิภาคหัวใจและระบบนำไฟฟ้า (Anatomy)',
    icon: '🫀',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบายว่าทำไม VF/pVT เป็นปัญหาของ **ventricle** และ defibrillation จึงมุ่งรีเซ็ตมวลนี้
- เรียงลำดับ **SA → AV → His-Purkinje** พร้อมอัตราธรรมชาติและ escape rhythm
- จับคู่ **P/QRS/T** บน ECG กับเหตุการณ์ไฟฟ้าในหัวใจ
- อธิบาย **R-on-T** และเหตุผลของ synchronized cardioversion
- นิยาม **CPP** และเชื่อมกับ "ทำไม peri-shock pause ต้องสั้น"`,
      },
      {
        heading: 'ห้องหัวใจ ผนัง และหลอดเลือดโคโรนารี',
        body: `หัวใจมี 4 ห้อง: **atria (บน) 2 + ventricles (ล่าง) 2** — ventricle ซ้ายผนังหนาสุดเพราะปั๊มเลือดสู่ร่างกายทั้งตัว

**ทำไม defibrillation ต้องสนใจ ventricle:** จังหวะที่ทำให้หัวใจหยุดทำงาน (VF/pVT) เป็นความผิดปกติของ **ventricle** ที่บีบเลือดไม่ได้ การช็อกจึงมุ่ง "รีเซ็ต" มวลกล้ามเนื้อ ventricle

**หลอดเลือดโคโรนารี** เลี้ยงกล้ามเนื้อหัวใจเอง:
- RCA (ขวา) มักเลี้ยง SA/AV node ในคนส่วนใหญ่ → การตีบของ RCA สัมพันธ์กับ bradycardia/heart block
- LAD/LCx (ซ้าย) เลี้ยงผนังหน้า/ข้างของ LV

> **Coronary perfusion pressure (CPP)** = ความดัน aorta ช่วงคลายตัว − ความดันใน RA เป็นตัวกำหนดว่าเลือดจะไหลเลี้ยงหัวใจได้แค่ไหน — แนวคิดนี้คือหัวใจของ "ทำไม peri-shock pause ต้องสั้น" (บท 7)`,
      },
      {
        heading: 'ระบบนำไฟฟ้า: SA → AV → His-Purkinje',
        body: `หัวใจมี "ระบบสายไฟ" ในตัวที่สร้างและนำสัญญาณไฟฟ้า:

| โครงสร้าง | หน้าที่ | อัตราธรรมชาติ |
|---|---|---|
| **SA node** (ใน RA) | pacemaker หลัก | ~60–100/นาที |
| **AV node** | หน่วงสัญญาณให้ ventricle เติมเลือดก่อนบีบ | ~40–60/นาที (backup) |
| **Bundle of His → แขนงซ้าย/ขวา** | นำสัญญาณลง septum | — |
| **Purkinje fibers** | กระจายสัญญาณทั่ว ventricle เร็วมาก | ~20–40/นาที (backup) |

**ลำดับชั้น pacemaker:** ยิ่งอยู่สูง (SA) ยิ่งเร็วและ "คุม" ส่วนล่าง; ถ้า SA ล้มเหลว ตัวล่างจะรับช่วง (escape rhythm) แต่ช้าลง

**เชื่อมโยงคลื่นไฟฟ้าหัวใจ (ECG):** P wave = atrial depolarize (SA), PR interval = หน่วงที่ AV, QRS = ventricle depolarize (His-Purkinje), T wave = ventricle repolarize`,
        qa: [
          {
            q: 'ทำไม T wave จึงเป็นช่วง "อันตราย" และเกี่ยวกับ synchronized cardioversion อย่างไร?',
            a: `**T wave = ช่วง repolarization ของ ventricle** ซึ่งมี "relative refractory period" อยู่ — เป็นช่วงที่เซลล์บางส่วนพร้อมกระตุ้นได้ บางส่วนยังไม่พร้อม (ความไม่สม่ำเสมอนี้เอื้อต่อการเกิด reentry, บท 4)

ถ้ามี**สิ่งกระตุ้นไฟฟ้าแรง ๆ ตกลงตรงช่วง T wave** (ปรากฏการณ์ **R-on-T**) อาจจุดชนวนให้เกิด **VF** ได้

**นี่คือเหตุผลของ synchronized cardioversion:** เมื่อต้องช็อกผู้ป่วยที่ **ยังมีชีพจร** (tachyarrhythmia ไม่คงที่) เครื่องจะ "sync" ปล่อยกระแสให้ตรงกับ **R wave** โดยเจตนา เพื่อ **หลบช่วง T wave** ไม่ให้กระตุ้น VF

ต่างจาก defibrillation (VF/pVT ไม่มีชีพจร) ที่ปล่อยไฟทันทีโดยไม่ sync เพราะไม่มี R wave ที่เป็นระเบียบให้ sync และการรอ sync จะเสียเวลาโดยเปล่าประโยชน์`,
          },
        ],
      },
      {
        kind: 'pearl',
        body: `**RCA เลี้ยง SA/AV node ในคนส่วนใหญ่** — inferior MI (RCA อุด) จึงมักมาพร้อม **bradycardia/AV block** ให้เฝ้าระวังหัวใจเต้นช้าและเตรียม pacing/atropine ไว้ล่วงหน้า`,
      },
      {
        heading: '⟐ เชิงลึก: Conduction velocity, Autonomic tone และ Coronary dominance',
        body: `**ความเร็วนำสัญญาณ (conduction velocity) — ทำไม AV ต้องหน่วง:**

| โครงสร้าง | ความเร็วโดยประมาณ | เหตุผลเชิงหน้าที่ |
|---|---|---|
| **AV node** | ~0.05 m/s (ช้าสุด) | หน่วงให้ ventricle เติมเลือดก่อนบีบ (PR interval) + กันความถี่สูงจาก atria |
| กล้ามเนื้อ atria/ventricle | ~0.5–1 m/s | — |
| **His-Purkinje** | ~2–4 m/s (เร็วสุด) | กระจายทั่ว ventricle เกือบพร้อมกัน → บีบประสาน |

**Autonomic control:** vagal (parasympathetic, ACh→M2) กด SA/AV เด่น; sympathetic (NE→β₁) เร่งทั้งอัตราและการนำ — สมดุลนี้อธิบาย bradycardia จาก vagal tone และ tachycardia จาก catecholamine

**Coronary dominance:** ~85% **right-dominant** (RCA ให้ PDA + เลี้ยง AV node) — inferior STEMI จึงมักมาพร้อม AV block/bradycardia` },
      {
        kind: 'summary',
        body: `| โครงสร้าง | อัตราธรรมชาติ |
|---|---|
| SA node | 60–100/นาที (pacemaker หลัก) |
| AV node | 40–60 (backup + หน่วงสัญญาณ) |
| Purkinje | 20–40 (backup ต่ำสุด) |

P = atria · QRS = ventricle depol · T = ventricle repol (ช่วงเสี่ยง R-on-T)

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ถ้า SA node หยุดทำงาน หัวใจจะหยุดเต้นทันทีไหม เพราะอะไร?',
            a: `ไม่ทันที — ระบบนำไฟฟ้ามี **ลำดับชั้น backup**: ถ้า SA ล้มเหลว AV node (~40–60) หรือ Purkinje (~20–40) จะรับช่วงเป็น **escape rhythm** แต่ช้าลงและอาจไม่พอเลี้ยงร่างกาย จึงเป็นที่มาของ symptomatic bradycardia ที่อาจต้อง pacing`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 2 — HISTOLOGY ──────────────────────────────
  {
    id: 'df-ch2', title: 'บทที่ 2: จุลกายวิภาคกล้ามเนื้อหัวใจ (Histology)',
    icon: '🔬',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบาย **gap junction (connexin)** และแนวคิด functional syncytium
- เชื่อมโยงว่าทำไม syncytium ทำให้ **mass depolarization** (รากฐาน defibrillation) เป็นไปได้
- แยก **pacemaker cell vs contractile cell** และ automaticity (funny current I_f)`,
      },
      {
        heading: 'Cardiomyocyte, Intercalated disc และ Gap junction',
        body: `กล้ามเนื้อหัวใจ (cardiac muscle) มีลักษณะเฉพาะที่อธิบายว่าทำไม defibrillation ถึงได้ผล:

- **Cardiomyocyte** — เซลล์กล้ามเนื้อหัวใจ มีลาย (striated) เหมือนกล้ามเนื้อลาย แต่ควบคุมไม่ได้ (involuntary) และมี **1 นิวเคลียส** ต่อเซลล์
- **Intercalated disc** — รอยต่อระหว่างเซลล์ที่แข็งแรง มี 2 องค์ประกอบสำคัญ:
  - *Desmosome/fascia adherens* — ยึดเซลล์เชิงกล ให้แรงบีบส่งต่อกันได้
  - **Gap junction (connexin)** — "ช่องเชื่อม" ให้ ไอออนและกระแสไฟฟ้าไหลจากเซลล์สู่เซลล์โดยตรง

**Functional syncytium:** เพราะ gap junction เชื่อมทุกเซลล์ กล้ามเนื้อหัวใจจึงทำงานเป็น **"หน่วยเดียว"** — สัญญาณไฟฟ้าที่จุดหนึ่งกระจายไปทั้งดวง ทำให้หัวใจบีบตัวประสานกัน

> **นี่คือรากฐานของ defibrillation:** เพราะเซลล์เชื่อมกันหมด กระแสไฟจากภายนอกจึงสามารถ **depolarize มวลกล้ามเนื้อพร้อมกันทั้งดวง (mass depolarization)** เพื่อหยุดวงจรไฟฟ้าวุ่นวายของ VF แล้วเปิดโอกาสให้ pacemaker ธรรมชาติกลับมาคุม`,
      },
      {
        heading: 'Pacemaker cells vs Contractile cells',
        body: `เซลล์หัวใจมี 2 ชนิดหน้าที่ต่างกัน:

| ชนิด | ที่อยู่ | คุณสมบัติเด่น |
|---|---|---|
| **Pacemaker (autorhythmic) cells** | SA/AV node, conduction system | มี **automaticity** — depolarize เองได้ (unstable resting potential ที่ค่อย ๆ รั่วขึ้น = "funny current" I_f) |
| **Contractile (working) cells** | atria, ventricle | หดตัวสร้างแรงบีบ; มี **plateau phase** ยาว (บท 3) |

- Pacemaker cells มี resting membrane ที่ไม่นิ่ง — ค่อย ๆ ไหลขึ้นถึง threshold เอง ทำให้เกิดจังหวะอัตโนมัติ
- SA node ไหลขึ้นเร็วสุด จึง "ชนะ" เป็น pacemaker หลัก (overdrive suppression)
- **T-tubule + sarcoplasmic reticulum** ใน contractile cell จัดการแคลเซียมสำหรับการบีบตัว (excitation–contraction coupling)`,
      },
      {
        heading: '⟐ ระดับโมเลกุล: Connexin isoforms และ Excitation–contraction coupling',
        body: `**Gap junction — connexin isoform ต่างกันตามตำแหน่ง** (กำหนดความเร็ว/ทิศทางการนำ):

| Connexin | ตำแหน่งเด่น | หมายเหตุ |
|---|---|---|
| **Cx43** | ventricle (มากสุด) | remodeling/redistribution ในแผลเป็น → เอื้อ reentry |
| **Cx40** | atria + His-Purkinje | conduction เร็ว |
| **Cx45** | SA/AV node | conduction ช้า |

**Excitation–contraction coupling (calcium-induced calcium release):** action potential → เปิด **L-type Ca²⁺ channel (DHPR)** ที่ T-tubule → Ca²⁺ เล็กน้อยไปเปิด **RyR2** บน sarcoplasmic reticulum → ปล่อย Ca²⁺ ก้อนใหญ่ → จับ troponin C → บีบตัว; **SERCA** ปั๊ม Ca²⁺ กลับ SR (คลายตัว)

> **เชื่อม arrhythmia:** RyR2 ที่รั่ว (phosphorylation เกิน/พันธุกรรม) → Ca²⁺ leak → delayed afterdepolarization → triggered activity (เช่น CPVT, digoxin toxicity)` },
      {
        kind: 'summary',
        body: `**หัวใจของบท:** gap junction เชื่อมทุกเซลล์เป็น **หน่วยเดียว** → กระแสภายนอกจึง depolarize ทั้งดวงพร้อมกันได้ = ทำไม defibrillation ได้ผล · pacemaker cell มี automaticity (I_f) · SA ชนะเพราะไต่ threshold เร็วสุด (overdrive suppression)

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ถ้ากล้ามเนื้อหัวใจไม่มี gap junction การ defibrillation จะเป็นไปได้ไหม?',
            a: `แทบเป็นไปไม่ได้อย่างมีประสิทธิภาพ — เพราะการช็อกอาศัยการที่กระแสไฟ **กระจายจากเซลล์สู่เซลล์ทั่วทั้งมวลกล้ามเนื้อ** ผ่าน gap junction พร้อมกัน ถ้าเซลล์แยกกันไม่เชื่อมต่อ กระแสจะ depolarize เฉพาะจุดที่สัมผัส ไม่สามารถ "รีเซ็ต" วงจร reentry ทั้งดวงได้`,
          },
          {
            q: 'ทำไม SA node จึงเป็น pacemaker หลักของหัวใจ ทั้งที่เซลล์ในระบบนำไฟฟ้าอื่นก็มี automaticity?',
            a: `เพราะ SA node มี resting membrane ที่ไต่ขึ้นถึง threshold **เร็วที่สุด** (funny current I_f แรงสุด) จึง depolarize เองบ่อยที่สุด — ทุกครั้งที่ SA ยิงก่อน สัญญาณจะกระจายไปทั่วหัวใจและ "รีเซ็ต" เซลล์ pacemaker อื่นก่อนที่มันจะไต่ถึง threshold ของตัวเอง (**overdrive suppression**) ผลคือ SA "ชนะ" เป็นผู้นำจังหวะ; ถ้า SA ล้มเหลว เซลล์รอง(AV junction/His-Purkinje) ที่ช้ากว่าจะรับหน้าที่แทนเป็น escape rhythm`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 3 — PHYSIOLOGY ──────────────────────────────
  {
    id: 'df-ch3', title: 'บทที่ 3: ไฟฟ้าสรีรวิทยาหัวใจ (Physiology)',
    icon: '⚡',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบาย **action potential 5 เฟส** ของ ventricle และไอออนหลักแต่ละเฟส (Na→Ca plateau→K)
- อธิบาย **refractory period** และเชื่อมกับ R-on-T
- แยก **"พลังงาน (J) ที่ตั้ง" vs "กระแส (current) ที่หัวใจได้รับ"** และบทบาทของ **impedance**
- อธิบายว่าทำไม **biphasic** ใช้พลังงานต่ำกว่า monophasic`,
      },
      {
        heading: 'Cardiac action potential และช่องไอออน (Ion channels)',
        body: `**Action potential ของ ventricular myocyte** มี 5 เฟส (0–4) ที่ต่างจากเซลล์ประสาทตรง "plateau" ยาว:

| เฟส | เหตุการณ์ | ไอออนหลัก |
|---|---|---|
| **0** Upstroke | depolarize เร็ว | **Na⁺ เข้า** |
| **1** Early repol | ลงเล็กน้อย | K⁺ ออก (I_to) |
| **2** Plateau | คงระดับ (เอกลักษณ์หัวใจ) | **Ca²⁺ เข้า** สมดุลกับ K⁺ ออก |
| **3** Repolarization | กลับสู่ค่าพัก | **K⁺ ออก** |
| **4** Resting | ค่าพัก (~−90 mV) | รักษาโดย Na⁺/K⁺ ATPase |

**Refractory period:** ระหว่าง plateau เซลล์ **ไม่สามารถถูกกระตุ้นซ้ำ** (absolute refractory) — ป้องกันการบีบซ้อนและ tetany; ช่วงปลาย (relative refractory ≈ T wave บน ECG) กระตุ้นได้ด้วยสิ่งเร้าแรง = ช่วงเสี่ยง R-on-T

> Plateau ที่ Ca²⁺ เข้ายาว ๆ คือสิ่งที่ทำให้หัวใจ **บีบตัวได้นานพอ** จะไล่เลือดออก และเป็นเป้าหมายของยากลุ่ม calcium channel blocker`,
      },
      {
        heading: 'Defibrillation physics: กระแส, Impedance และ Waveform',
        body: `การช็อกไฟฟ้าคือการส่ง **"กระแส (current, แอมป์)"** ผ่านหัวใจให้มากพอจะ depolarize มวลกล้ามเนื้อวิกฤต แม้เครื่องจะตั้งเป็น **"พลังงาน (joule)"** ก็ตาม

**ปัจจัยที่กำหนดกระแสที่ไหลผ่านหัวใจจริง:**
- **Transthoracic impedance (TTI)** = แรงต้านของหน้าอก (ผิวหนัง, ไขมัน, ปอด, ขนหน้าอก, แรงกด pad) — ยิ่ง impedance สูง กระแสยิ่งไหลน้อยที่พลังงานเท่ากัน
- ลด impedance ได้โดย: **เจล/แผ่นนำไฟฟ้าที่ดี, กด pad แนบสนิท, เช็ดหน้าอกแห้ง, โกน/ปัดขนถ้าจำเป็น, ปล่อยไฟช่วงหายใจออก**

**Waveform:**
- **Monophasic** — กระแสไหลทิศเดียว ต้องใช้พลังงานสูง (มักคงที่ 360 J)
- **Biphasic** — กระแสไหลสองทิศสลับกันในช็อกครั้งเดียว → depolarize มีประสิทธิภาพกว่าที่พลังงานต่ำกว่า (มัก 120–200 J ตามรุ่นเครื่อง) และเครื่องหลายรุ่นชดเชย impedance อัตโนมัติ

> **สรุปแนวคิด:** "พลังงานที่ตั้ง" ไม่เท่ากับ "กระแสที่หัวใจได้รับ" — เทคนิคที่ลด impedance จึงสำคัญพอ ๆ กับตัวเลข J`,
        qa: [
          {
            q: 'ทำไม biphasic ใช้พลังงานต่ำกว่า monophasic ได้ ในเชิงไฟฟ้าสรีรวิทยา?',
            a: `**Monophasic** ปล่อยกระแสทิศทางเดียว ต้องอาศัยพลังงานสูงเพื่อให้กระแส "รอบเดียว" มากพอจะ depolarize มวลกล้ามเนื้อวิกฤต

**Biphasic** ปล่อยกระแส **สองเฟสสลับทิศ** ในการช็อกครั้งเดียว:
- เฟสแรก depolarize เซลล์
- เฟสสอง (ทิศกลับ) ช่วยปรับสภาพเยื่อเซลล์ให้ตอบสนองสม่ำเสมอขึ้น ลด threshold ที่ต้องใช้

ผลคือ depolarize มวลกล้ามเนื้อได้ทั่วถึงกว่าที่ **กระแส/พลังงานต่ำกว่า** → บาดเจ็บกล้ามเนื้อหัวใจน้อยลง และเครื่องพกพาเบาลง

นอกจากนี้เครื่อง biphasic หลายรุ่น **วัดและชดเชย transthoracic impedance** ให้อัตโนมัติ ปรับรูปคลื่น/เวลาให้กระแสที่ส่งถึงหัวใจคงที่ขึ้นในผู้ป่วยที่หน้าอกต้านทานต่างกัน — จึงเป็นมาตรฐานของเครื่องรุ่นใหม่เกือบทั้งหมด`,
          },
        ],
      },
      {
        kind: 'case',
        heading: 'เคส: ช็อกแล้วแต่ VF ยังอยู่ — impedance สูง',
        body: `ชาย 90 กก. ขนหน้าอกดก เหงื่อท่วม ช็อก 200 J (biphasic) ครั้งแรกไม่สำเร็จ VF ยังอยู่`,
        qa: [
          {
            q: 'ก่อนเพิ่มพลังงาน มีอะไรทำได้บ้างเพื่อให้ "กระแสถึงหัวใจ" มากขึ้น (เชื่อมแนวคิด impedance)?',
            a: `เพราะ **พลังงานที่ตั้ง ≠ กระแสที่หัวใจได้รับ** — ก่อนอื่นลด TTI: (1) **เช็ดเหงื่อ/น้ำให้แห้ง** (น้ำพากระแสไปตามผิว) (2) **กด pad แนบสนิท** (3) **โกน/ปัดขนหน้าอก**บริเวณ pad (4) วาง pad ให้ "หนีบหัวใจ" ถูกตำแหน่ง (5) ปล่อยไฟช่วง **หายใจออก** (ปอดมีลมน้อย impedance ต่ำลง) — จากนั้นจึงพิจารณาเพิ่มพลังงานตามคู่มือเครื่อง + ให้ CPR คุณภาพสูงคั่นเสมอ`,
          },
        ],
      },
      {
        heading: '⟐ ระดับโมเลกุล: Action potential กับ ion channel เฉพาะเฟส',
        body: `| เฟส | เหตุการณ์ | Channel / current หลัก |
|---|---|---|
| **0** upstroke | depolarize เร็ว | **I_Na** (fast Na⁺, Naᵥ1.5/**SCN5A**) |
| **1** notch | ลงเล็กน้อย | **I_to** (transient outward K⁺) |
| **2** plateau | คงระดับ (เอกลักษณ์หัวใจ) | **I_CaL** (L-type Ca²⁺) สมดุลกับ **I_Kr/I_Ks** |
| **3** repolarization | กลับค่าพัก | **I_Kr (hERG/KCNH2)** + **I_Ks (KCNQ1)** |
| **4** resting/pacemaker | ค่าพัก/ไต่ขึ้นเอง | **I_K1** (คงค่าพัก) · **I_f (funny, HCN)** ใน pacemaker |

**Resting potential ≈ Nernst ของ K⁺:** \`E_K = 61 × log([K]o/[K]i)\` — ~−90 mV; ดังนั้น **hyperkalemia (K]o↑)** ทำ resting เป็นบวกขึ้น → inactivate I_Na → นำสัญญาณช้า (peaked T → wide QRS → sine wave → arrest)

**Refractory period:** absolute (ERP, Na channel ยัง inactivated) → relative (RRP ≈ ช่วง T wave, กระตุ้นได้ด้วยสิ่งเร้าแรง = **R-on-T**)` },
      {
        heading: '⟐ ฟิสิกส์ Defibrillation: Ohm, Critical mass และ ULV',
        body: `**กระแสคือสิ่งที่ depolarize หัวใจ ไม่ใช่พลังงาน:** \`I = V / Z\` (Z = transthoracic impedance, TTI ~70–80 Ω) — เครื่องตั้ง **joule** แต่ผลอยู่ที่ **ampere ที่ไหลผ่าน myocardium**

- **Critical mass hypothesis:** ต้อง depolarize มวลกล้ามเนื้อวิกฤต (~ส่วนใหญ่ของ ventricle) พร้อมกันเพื่อหยุดวงจร reentry ทุกวง
- **Upper limit of vulnerability (ULV):** ช็อกที่ **แรงเกินไป** ก็เหนี่ยวนำ VF ซ้ำได้ (มี "หน้าต่าง" ที่เหมาะสม) — เป็นเหตุผลเชิงทฤษฎีว่าทำไมพลังงานสูงสุดไม่ใช่คำตอบเสมอ
- **Biphasic truncated exponential:** เฟสสองช่วยลด threshold + เครื่องปรับ **tilt/ระยะเวลา** ชดเชย impedance ให้กระแสคงที่

**Weil — coronary perfusion pressure:** \`CPP = aortic diastolic − right atrial diastolic\` — CPP > ~15 mmHg สัมพันธ์กับโอกาส ROSC; นี่คือฟิสิกส์เบื้องหลัง "peri-shock pause สั้น" และ epinephrine (α₁ เพิ่ม aortic diastolic)` },
      {
        kind: 'evidence',
        body: `**Waveform capnography เป็น class I** สำหรับยืนยันตำแหน่งท่อและติดตามคุณภาพ CPR/ROSC · แนวทางปัจจุบันเน้น **high-quality CPR + defibrillation เร็ว** เป็นปัจจัยรอดชีวิตหลัก มากกว่ายา · การเลือก fixed vs escalating energy — เครื่องต่างรุ่นมี protocol ต่างกัน *(อ้างเชิงหลักการ — ตรวจสอบ ILCOR/AHA ล่าสุด)*` },
      {
        kind: 'warning',
        body: `**Special populations:** เด็ก — defibrillation ตามน้ำหนัก (มัก 2→4 J/kg), ใช้ pediatric attenuator ถ้ามีแต่ไม่ชะลอ · ตั้งครรภ์ — ช็อกได้ตามปกติ (พลังงานไม่ต้องปรับ), left-lateral tilt, เตรียม perimortem C-section ถ้าไม่ ROSC · hypothermia รุนแรง — หัวใจอาจดื้อช็อก/ยา ให้ทำ CPR ต่อและอุ่นร่างกายควบคู่` },
      {
        kind: 'summary',
        body: `**สรุปไฟฟ้าสรีรวิทยา:** AP 5 เฟส (I_Na → I_CaL plateau → I_Kr/I_Ks) · resting ≈ E_K (hyperkalemia อันตราย) · defibrillation = **กระแส (I=V/Z)** depolarize critical mass · CPP ขับ ROSC

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ทำไม hyperkalemia รุนแรงจึงทำให้ QRS กว้างและนำไปสู่ arrest — อธิบายด้วย Nernst และ channel?',
            a: `[K]o ที่สูงทำให้ \`E_K\` (และ resting potential) **เป็นบวกขึ้น** → Na⁺ channel (Naᵥ1.5) ส่วนหนึ่งอยู่สภาพ **inactivated** ตั้งแต่ค่าพัก → phase 0 upstroke ช้าลง การนำสัญญาณทั่ว ventricle ช้าลง → **QRS กว้างขึ้นเรื่อย ๆ** จนรวมกับ T เป็น sine wave และหยุดเต้น — จึงให้ **calcium** (คงเสถียร membrane ทันที) + ดัน K⁺ เข้าเซลล์ (insulin/glucose, β-agonist) + ขับออก`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 4 — PATHOLOGY ──────────────────────────────
  {
    id: 'df-ch4', title: 'บทที่ 4: กลไกการเกิดภาวะหัวใจเต้นผิดจังหวะ (Pathology)',
    icon: '🌀',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบาย **3 กลไก** ของ arrhythmia (automaticity / triggered / reentry) และ 3 เงื่อนไขของ reentry
- แยก **shockable (VF/pVT) vs non-shockable (asystole/PEA)** ตามกลไก
- ท่อง **H's & T's** สาเหตุที่แก้ได้ของ PEA/asystole
- อธิบาย **3-phase model ของ VF** และเหตุผลที่ทุกนาทีมีค่า`,
      },
      {
        heading: 'สามกลไกของ arrhythmia และ Reentry',
        body: `ภาวะหัวใจเต้นผิดจังหวะเกิดจาก 3 กลไกหลัก:

1. **Enhanced automaticity** — เซลล์ที่ไม่ใช่ pacemaker เกิด depolarize เองผิดปกติ (เช่น จาก ischemia, catecholamine, อิเล็กโทรไลต์)
2. **Triggered activity** — after-depolarization (early/delayed) กระตุ้นให้เกิด beat ซ้ำ (เกี่ยวกับ QT ยาว → torsades)
3. **Reentry** — สำคัญที่สุดใน VF/VT

**Reentry เกิดได้เมื่อครบ 3 เงื่อนไข:**
- มี **สองทางเดิน** ของสัญญาณ (เช่น รอบแผลเป็นจากกล้ามเนื้อตาย)
- มี **unidirectional block** (ทางหนึ่งบล็อกชั่วคราว)
- **conduction ช้าพอ** ให้เนื้อเยื่อต้นทางฟื้นจาก refractory ทันเวลาให้สัญญาณวนกลับ

> เมื่อสัญญาณ "วนเป็นวงไม่รู้จบ" และแตกเป็นหลายวงเล็ก ๆ → กลายเป็น **VF** ที่กล้ามเนื้อ ventricle สั่นพลิ้วไร้ระเบียบ บีบเลือดไม่ได้`,
      },
      {
        heading: 'Shockable vs Non-shockable: เลือกการรักษาตามกลไก',
        body: `| จังหวะ | กลไก | ช็อก? | เหตุผล |
|---|---|---|---|
| **VF** | reentry แตกเป็นหลายวง | ✅ | defibrillation รีเซ็ตไฟฟ้าวุ่นวายได้ตรงจุด |
| **pVT** (ไม่มีชีพจร) | reentry/automaticity เร็วจนบีบเลือดไม่ได้ | ✅ | เช่นเดียวกับ VF |
| **Asystole** | ไม่มีกิจกรรมไฟฟ้าเลย | ❌ | "ไม่มีอะไรให้รีเซ็ต" — ต้อง CPR + หาสาเหตุ + ยา |
| **PEA** | มีไฟฟ้าแต่ไม่มีการบีบที่มีผล | ❌ | ปัญหาไม่ใช่ไฟฟ้าวุ่นวาย แต่เป็นสาเหตุอื่น (H's & T's) |

**H's & T's** (สาเหตุที่แก้ได้ของ PEA/asystole): Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia / Toxins, Tamponade, Tension pneumothorax, Thrombosis (coronary/pulmonary)

> การแยก shockable/non-shockable ผิดพลาดเป็นอันตราย: การ **ช็อก asystole** ไม่ช่วยและทำให้หยุดกดหน้าอกโดยเปล่าประโยชน์`,
        qa: [
          {
            q: 'ทำไมทุก 1 นาทีที่ VF ไม่ได้รับการช็อก โอกาสรอดจึงลดลงอย่างมาก?',
            a: `VF เป็นภาวะที่กล้ามเนื้อหัวใจ **ใช้พลังงาน (ATP) มหาศาลจากการสั่นพลิ้ว** ทั้งที่ไม่มีเลือดมาเลี้ยง (ไม่มี output)

**ระยะของ VF (3-phase model):**
1. *Electrical phase* (~4 นาทีแรก) — หัวใจยังมีพลังงาน **ช็อกได้ผลดีที่สุด**
2. *Circulatory phase* (~4–10 นาที) — พลังงานร่อยหรอ ต้อง **CPR ก่อน** เพื่อเติมเลือด/ออกซิเจนให้กล้ามเนื้อ แล้วช็อกจึงสำเร็จ
3. *Metabolic phase* (> 10 นาที) — เซลล์เสียหายจากการขาดเลือดสะสม การพยากรณ์แย่ลงมาก

ทุกนาทีที่ผ่านไปโดยไม่มี CPR/defibrillation โอกาสรอดลดลงประมาณ **7–10%** เพราะทั้งพลังงานหัวใจหมดและอวัยวะ (โดยเฉพาะสมอง) ขาดออกซิเจนสะสม — นี่คือเหตุผลที่ **"ช็อกเร็ว + กดหน้าอกคุณภาพสูงไม่ขาดตอน"** คือหัวใจของการช่วยชีวิต`,
          },
        ],
      },
      {
        heading: '⟐ เชิงลึก: Reentry wavelength, Triggered activity และ Channelopathies',
        body: `**Reentry — เงื่อนไขเชิงปริมาณ:** \`wavelength = conduction velocity × refractory period\`
- reentry เกิดง่ายเมื่อ **wavelength สั้น** (นำช้า + refractory สั้น) พอให้คลื่นวนกลับเจอเนื้อเยื่อที่ฟื้นแล้ว — จึงเป็นเหตุผลที่ยา **class III (ยืด refractory)** ต้าน reentry และ ischemia (นำช้า) ส่งเสริม reentry

**Triggered activity (afterdepolarization):**
| ชนิด | เกิดเมื่อ | สัมพันธ์กับ |
|---|---|---|
| **EAD** (early) | เฟส 2–3, QT ยาว | **Torsades** (I_Kr block, ยา, hypoK/Mg) |
| **DAD** (delayed) | เฟส 4, Ca²⁺ overload | digoxin toxicity, CPVT (RyR2), catecholamine |

**Channelopathies (พันธุกรรม) — arrest ในหัวใจโครงสร้างปกติ:**
- **Long QT:** LQT1 (**KCNQ1/I_Ks**), LQT2 (**hERG/I_Kr**), LQT3 (**SCN5A/I_Na** gain) → torsades
- **Brugada:** SCN5A loss → ST ยก V1–V3, VF ตอนพัก/ไข้
- **CPVT:** RyR2/CASQ2 → VT จาก catecholamine (ออกกำลัง/อารมณ์)` },
      {
        heading: '⟐ Differential: Wide-complex tachycardia (WCT)',
        body: `WCT (QRS ≥ 120 ms) — **สมมติเป็น VT ไว้ก่อนจนพิสูจน์เป็นอื่น** โดยเฉพาะถ้ามีประวัติโรคหัวใจ

| สาเหตุ | เบาะแส |
|---|---|
| **VT** (พบบ่อยสุด) | AV dissociation, capture/fusion beats, concordance, QRS กว้างมาก |
| **SVT + aberrancy** (BBB) | รูป QRS ตรงแบบ typical RBBB/LBBB |
| **SVT + pre-excitation** (WPW/antidromic) | ระวัง — AV nodal blocker (adenosine/verapamil) **อันตราย** ใน AF + WPW |
| **Toxic/metabolic** (hyperK, TCA, Na-channel blocker) | QRS กว้างทั่ว, ประวัติยา |

> **หลักปฏิบัติ:** ผู้ป่วยไม่คงที่ → synchronized cardioversion; อย่ามัวแยกชนิดจนช้า — "ถ้าสงสัย VT รักษาแบบ VT"` },
      {
        kind: 'summary',
        body: `| จังหวะ | ช็อก? | ทำอะไร |
|---|---|---|
| VF / pVT | ✅ | defib + CPR |
| Asystole / PEA | ❌ | CPR + หา H's&T's + ยา |

**H's:** Hypovolemia · Hypoxia · H⁺(acidosis) · Hypo/Hyperkalemia · Hypothermia
**T's:** Toxins · Tamponade · Tension pneumothorax · Thrombosis (MI/PE)

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ผู้ป่วย arrest พบเป็น VF มา ~7 นาทีโดยไม่มีใครทำ CPR — ควร "ช็อกทันที" หรือ "กดก่อน" และเพราะอะไร?',
            a: `ตามหลัก **3-phase model** ผู้ป่วยน่าจะอยู่ใน *circulatory phase* (พลังงานหัวใจร่อยหรอ) — การ **CPR คุณภาพสูงสักครู่เพื่อเติมเลือด/ออกซิเจนให้กล้ามเนื้อหัวใจก่อน** ช่วยเพิ่มโอกาสที่การช็อกจะสำเร็จ (ต่างจากช่วง electrical phase ~4 นาทีแรกที่ช็อกทันทีได้ผลดีสุด) — ในทางปฏิบัติทีมจะกดหน้าอกทันทีระหว่างเตรียม/ชาร์จเครื่อง แล้วช็อกโดยไม่หน่วง CCF`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 5 — PHARMACOLOGY ──────────────────────────────
  {
    id: 'df-ch5', title: 'บทที่ 5: เภสัชวิทยาที่เกี่ยวข้อง (Pharmacology)',
    icon: '💊',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- อธิบายว่าประโยชน์หลักของ **epinephrine** ใน arrest มาจากฤทธิ์ **α₁** (เพิ่ม CPP) ไม่ใช่ β
- บอกบทบาทของ **amiodarone/lidocaine** ใน VF/pVT ที่ดื้อการช็อก
- อธิบายความจำเป็นของ **sedation** ก่อน cardioversion/pacing ในผู้ตื่น
- โยง **Vaughan-Williams class** กับเฟสของ action potential (บท 3)`,
      },
      {
        kind: 'warning',
        body: `เนื้อหาบทนี้อธิบาย **กลไกและชั้นยา** เพื่อความเข้าใจเชิงลึกเท่านั้น **ไม่ใช่คำสั่งใช้ยา/ขนาดยา** — ขนาดยา ข้อบ่งชี้ และลำดับการให้ ต้องยึด protocol ACLS ของสถาบันและการกำกับของแพทย์เสมอ`,
      },
      {
        heading: 'ยาที่ให้ระหว่าง arrest: Vasopressor และ Antiarrhythmic',
        body: `**Vasopressor — Epinephrine (adrenaline):**
- ออกฤทธิ์ที่ **α₁ receptor** ทำให้หลอดเลือดส่วนปลายหดตัว → เพิ่ม **aortic diastolic pressure** → เพิ่ม **coronary/cerebral perfusion pressure** ระหว่าง CPR
- ประโยชน์หลักใน arrest มาจากฤทธิ์ α (หดหลอดเลือด) ไม่ใช่ฤทธิ์ β ต่อหัวใจโดยตรง

**Antiarrhythmic (สำหรับ VF/pVT ที่ดื้อต่อการช็อก):**
| ยา | กลุ่ม/กลไก | บทบาท |
|---|---|---|
| **Amiodarone** | หลายช่อง (K⁺/Na⁺/Ca²⁺/β) | ยืด refractory ทำให้ reentry เกิดต่อยาก |
| **Lidocaine** | Na⁺ channel blocker (Class Ib) | ทางเลือกแทน amiodarone |

> ยาเหล่านี้ **ไม่ทดแทนการช็อก/CPR** — เป็นตัวเสริมให้ช็อกครั้งถัดไปสำเร็จง่ายขึ้นเท่านั้น; หลักการคือ "ให้ยาโดยไม่ทำให้หยุดกดหน้าอก"`,
      },
      {
        heading: 'ยาสำหรับ Cardioversion / Pacing และ Antiarrhythmic classes (Vaughan-Williams)',
        body: `ผู้ป่วยที่ทำ **synchronized cardioversion** หรือ **transcutaneous pacing** ขณะยังรู้สึกตัว จะเจ็บมาก จึงต้องการ **sedation/analgesia** (เช่น กลุ่ม benzodiazepine + opioid หรือยา induction สั้น ๆ) ภายใต้การเฝ้าระวังทางเดินหายใจ

**การจัดกลุ่มยาต้านหัวใจเต้นผิดจังหวะ (Vaughan-Williams) — เพื่อเข้าใจภาพรวม:**
| Class | เป้าหมาย | ตัวอย่าง |
|---|---|---|
| **I** | Na⁺ channel | lidocaine (Ib), flecainide (Ic) |
| **II** | β-blocker | metoprolol, esmolol |
| **III** | K⁺ channel (ยืด repolarization) | amiodarone, sotalol |
| **IV** | Ca²⁺ channel | verapamil, diltiazem |
| อื่น ๆ | — | adenosine (AV node), magnesium (torsades) |

> **เชื่อมโยงบท 3:** แต่ละ class เข้าจัดการคนละเฟสของ action potential — เข้าใจ ion channel จึงเข้าใจว่าทำไมยาแต่ละตัวเหมาะกับ arrhythmia ต่างชนิด`,
        qa: [
          {
            q: 'ทำไม epinephrine จึงช่วยใน cardiac arrest ทั้งที่ "ฤทธิ์กระตุ้นหัวใจ" ดูขัดกับหัวใจที่กำลังวุ่นวาย?',
            a: `ประโยชน์หลักของ epinephrine ใน arrest **ไม่ได้มาจากการกระตุ้นหัวใจ (β) โดยตรง** แต่มาจากฤทธิ์ **α₁ (หดหลอดเลือดส่วนปลาย)**

**กลไก:**
- α₁ ทำให้หลอดเลือดทั่วร่างกายหดตัว → เพิ่ม **ความดัน aorta ช่วงคลายตัว (diastolic)**
- CPP = ความดัน aorta diastolic − ความดัน RA → **CPP สูงขึ้น** → เลือดไหลเลี้ยงกล้ามเนื้อหัวใจดีขึ้น
- กล้ามเนื้อหัวใจที่ได้เลือด/ออกซิเจนมากขึ้น → **ตอบสนองต่อการช็อกได้ดีขึ้น** (ดันจาก circulatory phase กลับสู่ภาวะที่ช็อกสำเร็จ)

ส่วนฤทธิ์ β (เพิ่มการทำงาน/ใช้ออกซิเจนของหัวใจ) จริง ๆ อาจเป็น *ผลเสีย* ในบางแง่ — จึงเป็นเหตุผลที่การให้ยาต้อง **ควบคู่กับ CPR คุณภาพสูงเสมอ** และไม่ให้ยาทดแทนการกดหน้าอก/ช็อก`,
          },
        ],
      },
      {
        kind: 'pearl',
        body: `**ทำไม Epinephrine ให้ซ้ำทุก 3–5 นาที:** ฤทธิ์ **α₁** ที่ดัน coronary perfusion pressure ขึ้น *onset ~30 วินาที–1 นาที (IV/IO)* แต่ *duration สั้น ~3–5 นาที* — ถ้าปล่อยหมดฤทธิ์ CPP ตกกลับ จึงต้องเติมซ้ำ **ก่อนฤทธิ์เดิมหาย** ให้พอดีจังหวะ rhythm check ทุก 2 นาที`,
      },
      {
        heading: '⟐ ระดับโมเลกุล: Signaling ของยา และ Use-dependence',
        body: `**Adrenergic signaling ของ epinephrine:**
- **α₁** → Gq → phospholipase C → IP₃/DAG → Ca²⁺ ในกล้ามเนื้อเรียบหลอดเลือด → **vasoconstriction** (เพิ่ม aortic diastolic → CPP) = ประโยชน์หลักใน arrest
- **β₁** → Gs → **adenylyl cyclase → cAMP → PKA** → เพิ่ม I_CaL (inotropy/chronotropy) แต่ก็เพิ่มการใช้ O₂ (ผลเสียใน ischemia)

**Adenosine:** A1 receptor → **Gi** → เปิด **GIRK (I_KACh)** + ลด cAMP → **hyperpolarize AV node** ชั่วขณะ → บล็อกการนำ (จบ AVNRT/AVRT) — half-life < 10 วินาที จึง push เร็ว+flush; **theophylline บล็อก** (ต้องใช้ขนาดสูงขึ้น), **dipyridamole เสริมฤทธิ์**

**Vaughan-Williams เชิงโมเลกุล + use-dependence:**
| Class | เป้า | หมายเหตุ |
|---|---|---|
| **Ia/Ib/Ic** | Na⁺ channel (จับ **state-dependent**) | Ib (lidocaine) จับ inactivated state เด่น → เลือกทำงานที่เนื้อเยื่อ ischemic/เต้นเร็ว (**use-dependence**) |
| **II** | β-blocker | ลด cAMP |
| **III** | K⁺ (I_Kr) → ยืด APD/refractory | amiodarone จับ **หลาย** channel (I,II,III,IV) |
| **IV** | Ca²⁺ (L-type) | verapamil/diltiazem — ห้ามใน WCT ที่อาจเป็น VT |

> **Amiodarone reverse-use-dependence** ของ QT prolongation ทำให้เกิด torsades น้อยกว่ายา class III บริสุทธิ์` },
      {
        kind: 'warning',
        body: `**Special populations / เตือน:** ยาว QT + hypoK/hypoMg → torsades: รักษาด้วย **magnesium** (คงเสถียร ไม่ใช่ยืด QT เพิ่ม) + overdrive pacing · digoxin toxicity → DAD/arrhythmia หลากหลาย (ระวัง calcium ใน dig tox — "stone heart" theoretical) · ไต/ตับวายเปลี่ยน clearance ของ amiodarone (สะสม, ตับ) และ metabolite; ผู้สูงอายุไวต่อ bradycardia/hypotension` },
      {
        kind: 'summary',
        body: `| ยา | กลไกเด่น | บทบาทใน arrest |
|---|---|---|
| Epinephrine | **α₁** หดหลอดเลือด → CPP↑ | ให้ทุก ~3–5 นาที (ตาม protocol) |
| Amiodarone | หลายช่อง ยืด refractory | VF/pVT ดื้อช็อก |
| Lidocaine | Na⁺ (Ib) | ทางเลือกแทน amiodarone |
| Magnesium | — | torsades (QT ยาว) |

ยา **ไม่ทดแทน** CPR/ช็อก — ให้โดยไม่หยุดกด

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'Vaughan-Williams Class III (เช่น amiodarone) ออกฤทธิ์ที่เฟสไหนของ action potential และผลคืออะไร?',
            a: `Class III บล็อก **K⁺ channel** ในเฟส 3 (repolarization) → ยืดเวลา repolarization และ **refractory period** ให้ยาวขึ้น → เซลล์กลับมากระตุ้นซ้ำได้ช้าลง ทำให้วงจร **reentry เกิดต่อได้ยาก** (แต่การยืด QT มากไปก็เสี่ยง torsades — จึงต้องระวัง)`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 6 — EQUIPMENT ──────────────────────────────
  {
    id: 'df-ch6', title: 'บทที่ 6: เครื่องมือช็อกไฟฟ้าและการตั้งค่า (Equipment)',
    icon: '🧰',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- เลือกใช้ **AED vs manual** ตามสถานการณ์/ผู้ใช้ และรู้โหมด SYNC/Pacer
- วาง **pad** ตำแหน่ง anterior-lateral / anterior-posterior ได้ถูกและรู้เหตุผล
- ใช้เทคนิค **ลด impedance** ระดับปฏิบัติ (แห้ง/แนบ/โกนขน) + ตัวเลขระยะสำคัญ
- จัดการข้อควรระวัง: ICD, แผ่นแปะยา, สิ่งแวดล้อมเปียก`,
      },
      {
        heading: 'AED vs Manual Defibrillator',
        body: `**AED (Automated External Defibrillator):**
- วิเคราะห์จังหวะอัตโนมัติและ **สั่งช็อกเฉพาะ shockable rhythm** — ออกแบบให้ผู้ไม่ชำนาญใช้ได้ปลอดภัย
- ระหว่างเครื่อง "analyzing" ต้องหยุดสัมผัสผู้ป่วย → เป็น pause ที่ต้องบริหารให้สั้น
- มีโหมด/แผ่นสำหรับเด็ก (attenuator ลดพลังงาน) แต่ **ถ้าไม่มี ใช้ของผู้ใหญ่แทนได้ ห้ามชะลอการช็อก**

**Manual defibrillator:**
- ผู้ใช้ที่ผ่านการฝึก **อ่านจังหวะเอง เลือกพลังงานเอง และกดช็อกเอง** → เร็วกว่าเพราะข้ามการวิเคราะห์อัตโนมัติ
- มีโหมด **SYNC** (cardioversion) และ **Pacer** (pacing) เพิ่มเติม
- แสดง ECG, SpO₂, EtCO₂ ช่วยประเมินคุณภาพ CPR แบบเรียลไทม์`,
      },
      {
        heading: 'Pads: ตำแหน่ง การนำไฟฟ้า และข้อควรระวัง',
        body: `**ตำแหน่ง pad:**
- **Anterior–lateral** (นิยม): ใต้ไหปลาร้าขวา + ชายโครงซ้ายแนวรักแร้ (mid-axillary)
- **Anterior–posterior**: หน้าอก + หลัง (ใช้บ่อยใน cardioversion/pacing) — เป้าหมายคือ "หนีบหัวใจไว้ระหว่าง pad" ให้กระแสไหลผ่าน myocardium มากที่สุด

**เทคนิคลด transthoracic impedance (บท 3):**
- เช็ดหน้าอกให้ **แห้ง** (น้ำนำไฟฟ้าไปตามผิว → ช็อกไม่ได้ผล + ไหม้ผิว)
- แผ่น/เจลนำไฟฟ้าแนบสนิท กดแน่น
- โกน/ปัดขนหน้าอกหนา ๆ ถ้าขวางการแนบ

**ข้อควรระวัง:**
- **Pacemaker/ICD ฝัง** — วาง pad ห่างจากตัวเครื่อง ≥ ~2.5 ซม. (ไม่วางทับ ไม่งั้นกระแสถูก shunt เข้าเครื่องและอาจทำเครื่องเสียหาย/หัวใจได้กระแสน้อยลง)
- **แผ่นแปะยา (transdermal)** — ลอกออกและเช็ดก่อน (เสี่ยงประกายไฟ/ขวางการนำไฟฟ้า)
- **สิ่งแวดล้อมเปียก/โลหะ** — ย้ายผู้ป่วยพ้นแอ่งน้ำ; ตะโกน "CLEAR" ทุกครั้งก่อนช็อก

**ตัวเลขเชิงปฏิบัติ:** pad ผู้ใหญ่เส้นผ่านศูนย์กลาง ~8–12 ซม. · ถ้าใช้ **paddle** กดแรง ~8 กก. (ลด impedance) · pad ทั้งสองต้อง **ไม่แตะกัน** (เว้น ≥ ~2.5 ซม.) ไม่งั้นเกิด arcing กระแสลัดตามผิว`,
      },
      {
        heading: '⟐ เชิงลึก: วิศวกรรมของเครื่องช็อก',
        body: `**Biphasic truncated exponential (BTE) vs rectilinear biphasic (RLB):** ทั้งคู่ปล่อยกระแสสองเฟส แต่ต่างวิธี **ชดเชย impedance** — RLB ควบคุมกระแสให้เกือบคงที่ (rectilinear), BTE ปรับ **tilt/ระยะเวลา** ตาม TTI ที่วัดได้ ก่อน/ระหว่างช็อก → กระแสที่หัวใจสม่ำเสมอขึ้นในผู้ป่วยหน้าอกต้านทานต่างกัน

**pad (self-adhesive) vs paddle:** pad ปลอดภัยกว่า (hands-off, วางตำแหน่งคงที่, hands-free pacing) และให้ CCF ดีกว่า; paddle ต้องกด ~8 กก.ลด impedance แต่ต้องหยุดกดและถือ

**การเลือกพลังงาน:** biphasic เริ่ม ~120–200 J ตาม **คู่มือเครื่องรุ่นนั้น** (แต่ละ waveform มี dose-response ต่างกัน — จึงห้ามสมมติค่าข้ามรุ่น); escalating vs fixed ยังถกเถียง

> **ICD/pacemaker ฝัง:** วาง pad ห่าง ≥ ~2.5 ซม. (บางแนวทาง ~8 ซม.) และ **ตรวจสอบ/interrogate เครื่องหลังช็อก** เพราะกระแสภายนอกอาจรีเซ็ต/ทำ lead เสียหาย` },
      {
        kind: 'summary',
        body: `| ประเด็น | ตัวเลข/หลักจำ |
|---|---|
| Pad–ICD | ห่าง ≥ ~2.5 ซม. |
| Pad–Pad | ไม่แตะกัน (เว้น ≥ ~2.5 ซม.) |
| Paddle force | ~8 กก. (ลด impedance) |
| Biphasic energy | ~120–200 J ตามคู่มือเครื่อง |
| ก่อนช็อก | แห้ง · แนบ · CLEAR |

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ผู้ป่วยตัวเปียกในห้องน้ำ arrest — ทำไมต้องเช็ดหน้าอกแห้งและย้ายพ้นน้ำก่อนช็อก?',
            a: `น้ำเป็น **ตัวนำไฟฟ้า** — ถ้าหน้าอก/พื้นเปียก กระแสจากการช็อกจะ **ไหลลัดไปตามผิวหนัง/พื้น** แทนที่จะไหลผ่านหัวใจ ทำให้ช็อกไม่ได้ผลเต็มที่ + เสี่ยงไฟไหม้ผิวเป็นบริเวณกว้าง + อันตรายต่อผู้ช่วยเหลือ — เช็ดแห้ง ย้ายพ้นแอ่งน้ำ แล้วจึงช็อก`,
          },
          {
            q: 'AED "ไม่แนะนำให้ช็อก" ในผู้ป่วยที่ยังไม่มีชีพจร หมายความว่าอย่างไร และควรทำอะไรต่อ?',
            a: `แปลว่าเครื่องวิเคราะห์แล้วพบจังหวะ **non-shockable** (เช่น asystole/PEA) ไม่ใช่ "ผู้ป่วยปลอดภัย" — การช็อกจะไม่ช่วยจังหวะกลุ่มนี้ ดังนั้นต้อง **กดหน้าอก CPR ต่อทันที** ให้ครบรอบ (ราว 2 นาที) แล้วให้เครื่องวิเคราะห์ซ้ำ พร้อมตามหา/แก้สาเหตุที่แก้ได้ (H's & T's) — ห้ามเข้าใจผิดว่าไม่ต้องทำอะไรต่อ`,
          },
        ],
      },
    ],
  },

  // ────────────────────────────── บทที่ 7 — TECHNIQUE ──────────────────────────────
  {
    id: 'df-ch7', title: 'บทที่ 7: เทคนิค Defib / Cardioversion / Pacing (Technique)',
    icon: '🔄',
    sections: [
      {
        kind: 'objective',
        body: `เมื่อจบบทนี้ ผู้เรียนจะสามารถ:
- ใช้เทคนิค **charge-while-compressing** เพื่อลด peri-shock pause และเพิ่ม **CCF > 80%**
- ทำ **defibrillation** และ **synchronized cardioversion** ครบขั้น + รู้ว่าต้องเปิด SYNC ใหม่ทุกครั้ง
- ทำ **transcutaneous pacing** และยืนยัน **electrical + mechanical capture**
- แยกใช้สามเทคนิคไฟฟ้าให้ถูกกับผู้ป่วย`,
      },
      {
        heading: 'ลด Peri-shock pause และเพิ่ม Chest Compression Fraction (CCF)',
        body: `**ทำไม pause ต้องสั้น (เชื่อมโยงบท 1 — CPP):**
- coronary perfusion pressure สร้างจากการกดหน้าอก **ตกเร็วทันทีที่หยุดกด** และต้องกดหลายครั้งกว่าจะไต่กลับขึ้นมา
- **peri-shock pause** (ช่วงหยุดกดรอบ ๆ การช็อก) ที่ยาว → CPP ตก → โอกาสช็อกสำเร็จและการรอดชีวิตลดลง

**เทคนิคลด pause:**
1. **ชาร์จเครื่องระหว่างยังกดหน้าอกอยู่** (charge while compressing)
2. เมื่อชาร์จเสร็จ หยุดกดสั้นที่สุด → ช็อก → **กลับมากดทันที** (ไม่คลำชีพจร)
3. เตรียมทีม/บทบาทล่วงหน้า สื่อสารชัด

**CCF (Chest Compression Fraction)** เป้าหมาย **> 80%** = สัดส่วนเวลาที่ "มือกดจริง" ต่อเวลาทั้งหมด; วิธีเพิ่มที่ได้ผลสุดคือลด pause ทุกชนิด (การวิเคราะห์ AED, การช็อก, การเปลี่ยนคนกด, การใส่ท่อ)`,
      },
      {
        heading: 'Defibrillation และ Synchronized Cardioversion',
        body: `**Defibrillation (VF/pVT — ไม่มีชีพจร):**
1. ยืนยัน shockable rhythm
2. เลือกพลังงานตามคู่มือเครื่อง (biphasic มัก 120–200 J)
3. **ชาร์จระหว่างกด** → "CLEAR" → ช็อก → **CPR ต่อทันที 2 นาที** ไม่คลำชีพจร (myocardial stunning — บท 4/หัวใจยังบีบอ่อนช่วงแรก)

**Synchronized Cardioversion (มีชีพจรแต่ไม่คงที่):**
1. เปิดโหมด **SYNC** (เครื่องจะ mark R wave)
2. เลือกพลังงานตาม arrhythmia
3. ช็อก โดยเครื่องจะรอปล่อยไฟให้ตรง R wave (หลบ T wave — บท 1)
4. **เปิด SYNC ใหม่ทุกครั้ง**ก่อนช็อกซ้ำ (เครื่องมักกลับไปโหมดปกติหลังช็อก)

> **ข้อผิดที่อันตราย:** ลืมเปิด SYNC แล้ว "cardiovert" ผู้ป่วยที่มีชีพจร = เสี่ยงปล่อยไฟตรง T wave → R-on-T → VF`,
      },
      {
        heading: 'Transcutaneous Pacing และการแยกสามเทคนิค',
        body: `**Transcutaneous pacing (TCP)** — กระตุ้นหัวใจผ่าน pad บนผิวหนัง ใช้ใน **bradycardia ที่ไม่คงที่และไม่ตอบสนองต่อยา**
1. ติด pad (มัก AP), เปิดโหมด Pacer
2. ตั้งอัตรา (rate) แล้วค่อย ๆ เพิ่ม **output (mA)** จนได้ **capture**
3. **ยืนยัน 2 ระดับ:**
   - *Electrical capture* — pacing spike ตามด้วย QRS กว้างบนจอ
   - **Mechanical capture** — คลำชีพจร (เช่น femoral) ได้ตรงอัตราที่ตั้ง = ไฟฟ้าแปลงเป็นการไหลเวียนจริง
4. ให้ยาแก้ปวด/สงบ (บท 5) เพราะเจ็บมาก

**สรุปการแยกสามเทคนิคไฟฟ้า:**
| เทคนิค | ผู้ป่วย | sync? |
|---|---|---|
| **Defibrillation** | ไม่มีชีพจร (VF/pVT) | ไม่ (ปล่อยทันที) |
| **Cardioversion** | มีชีพจร เต้นเร็วไม่คงที่ | ใช่ (sync R wave) |
| **Pacing** | มีชีพจร เต้นช้าไม่คงที่ | กระตุ้นตามอัตราที่ตั้ง |`,
        qa: [
          {
            q: 'ทำไมต้องกลับมากดหน้าอกทันทีหลังช็อก โดยไม่คลำชีพจรก่อน?',
            a: `แม้การช็อกจะ "หยุด VF" สำเร็จ หัวใจก็มัก **ยังบีบตัวอ่อนแรงในช่วงนาทีแรก ๆ** (myocardial stunning) — ยังสร้าง output/ชีพจรที่คลำได้ไม่พอทันที

ถ้าเราหยุดคลำชีพจรทันทีหลังช็อก:
- เป็น **การหยุดกดที่ไม่จำเป็น** — CPP ที่เพิ่งสร้างจะตกอีก (บท 1)
- แม้จริง ๆ หัวใจกลับมาเต้น การกดต่ออีกเล็กน้อยก็ไม่เป็นอันตราย เทียบกับความเสียหายจากการปล่อยให้ไม่มีเลือดไหลเวียน

**แนวปฏิบัติ:** หลังช็อกให้ **CPR ต่อทันที 2 นาทีเต็ม** แล้วค่อยประเมิน rhythm/ชีพจรในรอบถัดไป — ยกเว้นเห็นสัญญาณชัดว่าผู้ป่วยฟื้น (ขยับ ไอ หายใจปกติ) หรือ **EtCO₂ พุ่งขึ้นฉับพลัน** (สัญญาณ ROSC) จึงประเมินได้เร็วขึ้น`,
          },
        ],
      },
      {
        kind: 'warning',
        body: `**อย่าลืมเปิด SYNC ใหม่ก่อน cardiovert ซ้ำ** — เครื่องส่วนใหญ่กลับไปโหมด defib (unsync) อัตโนมัติหลังปล่อยไฟ ถ้าลืม กระแสอาจตกตรง **T wave** → R-on-T → เหนี่ยวนำ **VF** ในผู้ป่วยที่ยังมีชีพจร`,
      },
      {
        heading: '⟐ เชิงลึก: Refractory VF และ Pacing thresholds',
        body: `**Refractory VF (ช็อกมาตรฐาน ≥3 ครั้งไม่หาย) — ทางเลือกขั้นสูง:**
- **Vector change (VC):** เปลี่ยนตำแหน่ง pad เป็น **anterior–posterior** เพื่อให้กระแสผ่านมวล ventricle ในแกนต่างออกไป
- **Double sequential external defibrillation (DSED):** ใช้ 2 เครื่อง 2 คู่ pad ปล่อยไฟ **แทบพร้อมกัน** — depolarize critical mass ได้มากขึ้น
- ควบคู่: ทบทวน reversible causes, คุณภาพ CPR, antiarrhythmic, พิจารณา ECPR ในบริบทที่เหมาะ

**Transcutaneous pacing — ตัวเลขเชิงเทคนิค:** ตั้ง rate (~60–80) แล้วเพิ่ม **output (mA)** จนได้ capture (มัก ~40–90 mA); ยืนยัน **electrical + mechanical capture** (คลำชีพจร/femoral หรือ US) — pacing เจ็บ ต้อง analgesia/sedation; เป็น **bridge** ไป transvenous pacing/สาเหตุที่แก้ได้` },
      {
        kind: 'evidence',
        body: `**DOSE-VF (concept):** ใน refractory VF การ **DSED หรือ vector-change** สัมพันธ์กับอัตราหยุด VF/รอดชีวิตดีกว่าช็อกมาตรฐานซ้ำที่ตำแหน่งเดิม — สนับสนุนการเปลี่ยนกลยุทธ์เมื่อช็อกซ้ำไม่ได้ผล *(อ้างเชิงหลักการจากงานวิจัยล่าสุด — ตรวจสอบ protocol/แนวทางสถาบันก่อนนำไปใช้ เพราะยังเป็นแนวปฏิบัติที่กำลังพัฒนา)*` },
      {
        kind: 'summary',
        body: `| เทคนิค | ผู้ป่วย | SYNC? | หลังทำ |
|---|---|---|---|
| Defibrillation | VF/pVT ไม่มีชีพจร | ไม่ | CPR ต่อ 2 นาที ไม่คลำชีพจร |
| Cardioversion | เต้นเร็วไม่คงที่ มีชีพจร | ใช่ (R wave) | เปิด SYNC ใหม่ก่อนช็อกซ้ำ |
| Pacing | เต้นช้าไม่คงที่ | — | ยืนยัน electrical + mechanical capture |

Charge-while-compressing → peri-shock pause สั้น → **CCF > 80%**

**ทดสอบตัวเอง:**`,
        qa: [
          {
            q: 'ระหว่าง pacing เห็น pacing spike + QRS บนจอ (electrical capture) แต่คลำชีพจรไม่ได้ตามอัตราที่ตั้ง — แปลว่าอะไร?',
            a: `เป็น **electrical capture โดยไม่มี mechanical capture** — ไฟฟ้ากระตุ้นได้แต่กล้ามเนื้อ **ยังบีบตัวไม่สร้างการไหลเวียนจริง** จึงยังไม่ถือว่า pacing สำเร็จ ต้อง **เพิ่ม output (mA)** จนคลำชีพจร (เช่น femoral) ได้ตรงอัตราที่ตั้ง — การยืนยัน mechanical capture คือสิ่งเดียวที่บอกว่าไฟฟ้าแปลงเป็นเลือดไปเลี้ยงจริง`,
          },
        ],
      },
    ],
  },
];
