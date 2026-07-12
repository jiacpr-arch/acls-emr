# Code Blue Simulator v2 — แผนออกแบบ "เหมือนจริง" + ระบบเขียนโจทย์เอง

> เอกสารวางแผน (design doc) — ยังไม่ใช่โค้ด
> เป้าหมาย: ยกระดับจาก "quiz เลือกตอบทีละข้อ" → "megacode simulation ที่ใกล้เคียงห้องฉุกเฉินจริง"
> และเปิดให้ instructor **เขียนโจทย์ (scenario) เองได้** โดยไม่ต้องแก้โค้ด

---

## 1. ทำไมเวอร์ชันปัจจุบันยัง "ไม่เหมือนจริง"

สภาพปัจจุบัน (`src/pages/CodeBlueSim.jsx` + `src/data/codeBlueScenarios.js`):

| ปัญหา | ของจริงเป็นยังไง |
|---|---|
| เส้นทางเดียว 11 ขั้น ตายตัว — เล่นซ้ำเหมือนเดิมทุกครั้ง | ทุก code ไม่เหมือนกัน rhythm เปลี่ยนได้ ผู้ป่วยตอบสนองต่างกัน |
| Multiple choice 4 ตัวเลือก = มีคนยื่นเฉลยให้ | ไม่มีใครยื่น choice ให้ leader — ต้อง**นึกเอง**ว่าจะสั่งอะไร เมื่อไหร่ |
| เวลาเป็นแค่ timer นับถอยหลังต่อข้อ (25s) | เวลาเดินต่อเนื่อง: CPR cycle 2 นาที, Epi ทุก 3–5 นาที, defib ใช้เวลา charge |
| ผู้ป่วยไม่มี physiology — ตอบผิดแค่ -5 คะแนน | ทำช้า/ทำผิด → ผู้ป่วยแย่ลงจริง (VF เสื่อมเป็น asystole, ไม่มีทางรอดถ้าไม่แก้สาเหตุ) |
| ไม่มีสาเหตุซ่อน (H's & T's) ให้สืบ | Megacode จริงต้องหา reversible cause จากประวัติ/ตรวจ/lab |
| จบเกมได้แค่คะแนนรวม | Sim center จริงมี debrief: timeline สิ่งที่ทำ vs สิ่งที่ควรทำ พร้อม metric คุณภาพ CPR |

## 2. ของที่มีอยู่แล้วใน repo ที่จะต่อยอดได้เลย

- `src/data/rhythms.js` — นิยาม rhythm ครบ (shockable/ไม่, พลังงาน defib, actions)
- `src/data/hs-and-ts.js` — reversible causes ครบ
- `src/data/drugs.js`, `arrestDrugs.js` — ข้อมูลยา ขนาดยา
- `src/data/scenarios.js` — โครง scenario แบบ trigger/step ที่มีอยู่ (ใช้ในหน้า Recording)
- ระบบ Admin + Supabase (pattern จาก `AdminVideoLessons.jsx` + `videoLessonAdminService.js`)
- API เรียก Claude ที่ทำงานอยู่แล้ว (`api/video-lessons/generate-quiz.js`) → ใช้ pattern เดียวกันทำ **AI ช่วยแต่งโจทย์**

## 3. สถาปัตยกรรมใหม่: Simulation Engine

หัวใจคือแยก **engine ออกจาก UI** และเปลี่ยนจาก "ลำดับข้อสอบ" เป็น **state machine + นาฬิกาจำลอง (sim clock)**

```
src/game/
  engine/
    simClock.js        — เวลาเดินต่อเนื่อง (tick ทุก 1s, เร่ง 1x/2x ได้, pause ได้)
    patientModel.js    — สถานะผู้ป่วย + กติกา rhythm transition
    teamAgents.js      — ลูกทีม 4 คน รับ order, มี delay จริง, รายงานกลับ
    orderSystem.js     — รับคำสั่งจาก leader ทุกเมื่อ (ไม่ใช่รอถึง "ข้อ")
    scoring.js         — เก็บ event log + คำนวณ metric แบบ AHA
    eventQueue.js      — เหตุการณ์แทรกจาก scenario (ญาติเข้ามา, IV หลุด ฯลฯ)
  scenarios/
    schema.js          — JSON schema + validator ของโจทย์
    loader.js          — โหลดโจทย์จาก built-in / Supabase / ไฟล์ import
```

### 3.1 Patient model — ผู้ป่วยมี "ชีวิต" จริง

- state: `rhythm, hasPulse, hr, bp, spo2, etco2, consciousness, downtime`
- **Rhythm transition แบบมีเงื่อนไข + ความน่าจะเป็น** กำหนดจากโจทย์ เช่น
  - VF + shock ภายในเวลาดี + CPR คุณภาพดี + แก้สาเหตุแล้ว → โอกาส ROSC สูง
  - VF ปล่อยไว้นาน / CPR ขาดตอนบ่อย → เสื่อมเป็น asystole
  - โจทย์ hyperK: shock กี่ครั้งก็ไม่ ROSC จนกว่าจะสั่ง Calcium gluconate
- EtCO₂ เป็นตัวสะท้อนคุณภาพ CPR แบบ real-time (กดดี → 15–20, ROSC ใกล้ → พุ่ง >40)

### 3.2 Order-based interface — เลิก multiple choice

แทนที่ 4 ตัวเลือกต่อข้อ ด้วย **แผงสั่งการ (order panel)** เปิดสั่งได้ตลอดเวลา จัดหมวด:

| หมวด | ตัวอย่าง order |
|---|---|
| CPR | เริ่ม/หยุดกด, สลับคนกด, ปรับ rate/depth |
| Airway | BVM, OPA, ETT, LMA, O₂, capnography |
| Defib/Monitor | ติด pads, ดู rhythm, charge (เลือก J เอง), clear+shock, sync cardioversion, pacing |
| Drugs | เลือกยา + ขนาด + route เอง (Epi 1mg IV, Amio 300mg, Ca gluconate, NaHCO₃, Mg …) |
| Assess/Investigate | คลำ pulse, ประวัติจากญาติ, ดู jugular vein, ฟังปอด, POCT: DTX/K/gas, ultrasound |
| Team | มอบหมายบทบาท, ขอ crash cart, ตาม consult, คุยญาติ |

ความ "ยาก" มาจากการที่**ไม่มีเฉลยโผล่มา** — ผู้เล่นต้องรู้เองว่าตอนนี้ควรสั่งอะไร โหมด Easy อาจ highlight หมวดที่เกี่ยวข้องเป็น hint ได้

### 3.3 Team agents — ลูกทีมทำงานแบบมี delay จริง

- สั่งแล้วไม่เกิดทันที: เปิด IV ≈ 45s, ใส่ ETT ≈ 30s (และต้องมีคน bag ระหว่างนั้น), defib charge ≈ 6s
- ลูกทีม**รายงานกลับ**เป็น text/เสียง: "IV ได้แล้วครับ!", "Epi 1 mg in!", "ครบ 2 นาที ขอ rhythm check ครับ"
- Compressor เหนื่อย → ทุก 2 นาทีถ้า leader ไม่สั่งสลับคน คุณภาพการกดตก (EtCO₂ ลด)

### 3.4 นาฬิกาและจังหวะจริงของ ACLS

- Cycle timer 2 นาทีแสดงตลอด (เหมือน timer ที่ recorder ถือใน code จริง)
- Epi timer — ครบ 3 นาทีระบบ (หรือลูกทีม) เตือนเหมือน recorder จริง: "Epi ครบ 3 นาทีแล้วครับ"
- เกมจริง 1 case ≈ 8–15 นาที (ปรับเร่งเวลาได้ 2x สำหรับฝึกซ้ำ)

## 4. Scoring แบบ AHA + Debrief report

เก็บ **event log ทุกการกระทำพร้อม timestamp** แล้วคิดคะแนนตาม metric ที่ใช้จริงใน sim center:

- Time to first compression (เป้า <10s หลังยืนยัน arrest)
- Time to first shock (เป้า <2 นาที สำหรับ shockable)
- **Chest Compression Fraction (CCF)** — เป้า >80%
- Pre-/post-shock pause <10s
- Epi ตรงรอบ 3–5 นาที, ยาถูกตัว ถูกขนาด ถูกจังหวะ
- Rhythm check ทุก 2 นาที ใช้เวลา ≤10s
- หา/แก้ H's & T's ได้หรือไม่
- คำสั่งอันตราย (shock NSR, กดต่อระหว่าง shock, Atropine ใน VF) → หักหนัก + ผลเสียต่อผู้ป่วยจริง

**หน้า Debrief ท้ายเกม** (สำคัญที่สุดสำหรับการเรียนรู้):

- Timeline แนวตั้ง: การกระทำของผู้เล่น vs เส้นเวลา ideal ของ algorithm
- กราฟ EtCO₂ / CCF ตลอดเคส
- คะแนนแยกหมวด + จุดที่พลาดพร้อมคำอธิบาย (โยงกลับไปเนื้อหาใน Learn ได้)
- เก็บผลลง Supabase → instructor เห็นสถิติผู้เรียนใน AdminStats ได้

## 5. Scenario Schema — หัวใจของ "เขียนโจทย์เอง"

โจทย์ทั้งหมดเป็น **ข้อมูล ไม่ใช่โค้ด** ตาม schema เดียว:

```jsonc
{
  "id": "hyperk-ckd-01",
  "title": "PEA arrest ใน CKD",
  "difficulty": "megacode",          // basic | intermediate | megacode
  "patient": {
    "age": 70, "sex": "female",
    "history": "CKD stage 5 ขาด HD 1 สัปดาห์",
    "presentation": "ญาติพามาด้วยอ่อนเพลีย แล้วหมดสติใน ER"
  },
  "initial": {
    "rhythm": "pea",
    "vitals": { "hr": 30, "bp": "0/0", "spo2": 0 },
    "hiddenCauses": ["hyperkalemia"]   // อ้างอิง id จาก hs-and-ts.js
  },
  "findings": {                        // สิ่งที่ "สืบ" เจอเมื่อสั่ง assess/lab
    "poct_k": "K = 7.8 mEq/L",
    "ecg_clue": "Wide QRS, peaked T"
  },
  "phases": [
    {
      "rhythm": "pea",
      "transitions": [
        { "to": "nsr_rosc",  "require": ["cpr_ongoing", "epi_given", "calcium_given"], "probability": 0.85 },
        { "to": "asystole",  "afterMinutes": 8, "unless": ["calcium_given"] }
      ]
    }
  ],
  "events": [
    { "atSeconds": 90, "message": "ญาติ: 'หมอคะ เขาไม่ได้ฟอกไตมาอาทิตย์นึงแล้ว'", "type": "clue" },
    { "atSeconds": 240, "message": "IV เส้นแรกหลุด!", "effect": { "ivAccess": false } }
  ],
  "contraindicated": [
    { "action": "shock", "when": "rhythm=pea", "feedback": "PEA เป็น non-shockable!" }
  ],
  "debriefNotes": "จุดสอนหลัก: PEA + CKD → นึกถึง hyperK, Calcium first-line"
}
```

จุดสำคัญของ schema:

- **hiddenCauses** — โจทย์ megacode ต้องสืบสาเหตุจากประวัติ/lab จึงจะ ROSC ได้ ทำให้เล่นซ้ำแล้วไม่เบื่อ
- **transitions แบบมีเงื่อนไข + probability** — ผลลัพธ์ไม่ตายตัว 100% เหมือนชีวิตจริง
- **events** — เหตุการณ์แทรกตามเวลา สร้างความกดดันแบบ code จริง
- rhythm/ยา/สาเหตุ อ้างอิง id จาก data files เดิม → validator เช็คได้ว่าโจทย์เขียนถูก

## 6. เครื่องมือเขียนโจทย์ — 3 ระดับ

### ระดับ A — ไฟล์ JSON (ได้เร็วสุด, ทำใน Phase 1)
- เขียนไฟล์ตาม schema → มี `validateScenario()` ฟ้องทันทีถ้าผิด (rhythm ไม่มีจริง, ยาสะกดผิด, transition วนลูป)
- ปุ่ม "Import โจทย์" ในหน้าเกม (วาง JSON / เลือกไฟล์) สำหรับทดลองเล่นทันที

### ระดับ B — Scenario Editor ใน Admin (ตาม pattern เดิมของ repo)
- หน้า `AdminScenarios.jsx` แบบเดียวกับ `AdminVideoLessons.jsx`
- ฟอร์มเป็นขั้น: ข้อมูลผู้ป่วย → rhythm เริ่มต้น → สาเหตุซ่อน + findings → phases/transitions (เลือกจาก dropdown ไม่ต้องพิมพ์ JSON) → events → ทดลองเล่น (preview) → publish
- เก็บใน Supabase table `code_blue_scenarios` (draft/published, ผูก cohort ได้ → instructor สั่ง "สัปดาห์นี้ฝึกโจทย์ hyperK")

### ระดับ C — AI ช่วยแต่งโจทย์ (ต่อยอดจากของที่มี)
- ใช้ pattern เดียวกับ `api/video-lessons/generate-quiz.js` (Anthropic API มี key อยู่แล้ว)
- Instructor พิมพ์ภาษาไทยธรรมดา: *"หญิง 70 ปี CKD ขาด HD มาหนึ่งสัปดาห์ arrest แบบ PEA จาก hyperK อยากให้มี event ญาติบอกใบ้"*
- Claude แปลงเป็น scenario JSON ตาม schema → ผ่าน validator → เปิดใน editor ให้แก้ต่อ → กด publish
- ทำให้สร้างคลังโจทย์เป็นสิบๆ ข้อได้ในเวลาอันสั้น โดยคุณคุมความถูกต้องทางการแพทย์ขั้นสุดท้ายเอง

## 7. ความสมจริงด้านภาพ/เสียง (เลเยอร์ polish)

- **ECG แบบ canvas เดินต่อเนื่อง** ตาม rhythm จริง + compression artifact ระหว่างกด CPR, เข็มวิ่งแบบ monitor จริง
- **เสียง**: beep ตาม HR, alarm เมื่อ arrest, metronome 110/min ระหว่าง CPR, เสียง charge หึ่งๆ ของ defib, เสียงทีมรายงาน (Web Speech API ภาษาไทย หรืออัดเสียงจริง)
- **Defib panel เหมือนเครื่องจริง**: หมุนเลือก energy → CHARGE → ไฟกระพริบ → ตะโกน CLEAR (ปุ่มยืนยันทุกคนถอย) → SHOCK
- **Haptics** บนมือถือ: สั่นตอน shock / ตอน alarm
- ตัวละคร: อัปเกรดจาก SVG น่ารัก → สไตล์จริงจังขึ้นได้ภายหลัง แต่ engine ไม่ผูกกับสไตล์ภาพ (แยก layer แล้ว)

## 8. แผนงานเป็นเฟส

### Phase 1 — Engine + Schema (โครงกระดูกใหม่)
- [ ] สร้าง `src/game/engine/` — sim clock, patient model, order system, event log
- [ ] นิยาม scenario schema + validator
- [ ] แปลงโจทย์ VF เดิมเป็น schema ใหม่ (เกมเดิมยังเล่นได้ระหว่างพัฒนา — ทำหน้าใหม่แยกเป็น `CodeBlueSimV2`)
- [ ] UI order panel แบบจัดหมวด + team รายงานกลับเป็นข้อความ
- [ ] Import โจทย์จาก JSON ได้ (ระดับ A) → **คุณเริ่มเขียนโจทย์เองได้ตั้งแต่จบเฟสนี้**

### Phase 2 — Realism + Debrief
- [ ] Timing จริง: cycle 2 นาที, epi timer, delay ของแต่ละ action, compressor เหนื่อย
- [ ] Scoring แบบ AHA (CCF, time-to-shock, pause) + หน้า Debrief timeline
- [ ] เสียง + metronome + haptics, ECG canvas
- [ ] เก็บผลเล่นลง Supabase (ต่อกับ streak/stats เดิม)

### Phase 3 — Scenario Editor (ระดับ B)
- [ ] ตาราง `code_blue_scenarios` ใน Supabase + service + RLS แบบเดียวกับ video lessons
- [ ] หน้า AdminScenarios: ฟอร์ม + preview เล่นทดสอบ + publish/draft
- [ ] หน้าเลือกโจทย์ฝั่งผู้เรียน (คลังโจทย์, ระดับความยาก, ผูก cohort)

### Phase 4 — AI + ขยายคลัง
- [ ] `api/code-blue/generate-scenario.js` — AI แปลงคำบรรยายไทย → scenario JSON
- [ ] ชุดโจทย์มาตรฐาน: VF/pVT, PEA (hyperK, tension pneumo, tamponade, PE, hypovolemia), asystole, bradycardia, tachycardia unstable, post-ROSC care
- [ ] Leaderboard / ประวัติการเล่นรายคน ใน AdminStats

## 9. คำถามที่ควรตัดสินใจก่อนเริ่ม Phase 1

1. **โหมดเล่น**: จะเก็บโหมด "ง่าย" (มี hint/choice) ไว้คู่กับโหมด "จริงจัง" (order เอง) ไหม? — แนะนำมี 2 โหมดจาก engine เดียวกัน เพราะกลุ่มผู้เรียนมีทั้งมือใหม่และคนเตรียมสอบ megacode
2. **ผู้เขียนโจทย์**: instructor เท่านั้น (ผ่าน Admin) หรือเปิดให้ผู้เรียน import JSON เล่นเองได้ด้วย?
3. **เสียงทีม**: ใช้ Web Speech API (ฟรี ทันที แต่เสียง robotic) หรืออัดเสียงจริง (ดีกว่า แต่ต้องอัดทุกประโยค)?
