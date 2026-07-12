# Character Bible — Code Blue Simulator

คู่มือสร้าง "รูปตัวละครจริง" มาแทน SVG placeholder ในเกม
**เกมใช้รูปจริงทันทีที่มีไฟล์** — ไม่ต้องแก้โค้ดใดๆ แค่วางไฟล์ให้ถูกที่ถูกชื่อ

## วิธีใส่รูปเข้าเกม (สำคัญที่สุด)

1. วางไฟล์ที่ `public/images/characters/{charId}/{pose}.webp`
2. ชื่อโฟลเดอร์ = charId ในตาราง / ชื่อไฟล์ = pose (ตัวพิมพ์เล็ก)
3. (ทางเลือก) เพิ่มเฟรมปากอ้า `{pose}_talk.webp` — เกมจะสลับ 2 เฟรมตอนตัวละครพูดอัตโนมัติ ถ้าไม่มีก็ยังเล่นได้
4. รูปไหนยังไม่มี เกม fallback เป็น SVG placeholder ให้เอง → **ทยอยส่งทีละรูปได้เลย**

ตัวอย่าง:
```
public/images/characters/
  nurse_mint/
    idle.webp
    idle_talk.webp      ← ปากอ้า (optional)
    panic.webp
    ...
  boy_compressor/
    idle.webp
    ...
```

## Spec ไฟล์

| หัวข้อ | ค่า |
|---|---|
| ฟอร์แมต | **WebP พื้นหลังโปร่งใส** (PNG โปร่งใสก็ได้ แล้วค่อยแปลง) |
| ขนาด | กว้าง **600px** สูง ~750px (สัดส่วน 4:5 ประมาณ viewBox 200×250 ของ placeholder) |
| การครอบตัด | **ครึ่งตัวบน (bust)** — ศีรษะถึงประมาณเอว หันหน้าเข้ากล้องเล็กน้อย |
| น้ำหนักไฟล์ | ≤ 150 KB/รูป (WebP quality ~80) |

## ตัวละครปัจจุบัน 4 ตัว

> ทุกตัวต้องมี 5 pose หลัก: `idle` `talk` `panic` `stern` `happy`
> (talk = ท่าเดียวกับ idle แต่กำลังพูด — ถ้าขี้เกียจวาดแยก ใช้รูป idle ซ้ำได้)

### 1. `nurse_mint` — พยาบาลมิ้นท์ (Nurse · IV & Drugs)
- หญิงไทย วัย ~26-28 ปี ผมดำมัดมวยต่ำ หน้าตาสดใสแต่มือโปร
- ชุด scrub **สีเขียวมิ้นท์/teal** (#2FA8A0) ป้ายชื่อห้อยคอ
- บุคลิก: มือไวใจนิ่ง ขานยาเสียงดังฟังชัด "Epi 1 mg in!"
- Pose แอ็คชั่นเสริม (อนาคต): `action_inject` — ดันยาเข้าสาย IV

### 2. `boy_compressor` — พี่บอย (Compressor)
- ชายไทย วัย ~30 ปี ตัวใหญ่บึกบึน ผมสั้นชี้ๆ **คาดผ้าคาดหัวสีแดง**
- ชุด scrub **สีเขียว** (#3E9E52) แขนกล้ามชัด มีเหงื่อซึม
- บุคลิก: พลังเยอะ นับจังหวะเสียงดัง "หนึ่ง-สอง-สาม-สี่!" เหนื่อยก็ไม่ยอมหยุด
- Pose แอ็คชั่นเสริม: `action_cpr` — มือประสานกดหน้าอก (มองจากด้านข้างเล็กน้อย)

### 3. `fon_defib` — หมอฝน (Defib / Monitor)
- หญิงไทย วัย ~29 ปี ผมยาวมัดหางม้า แว่นไม่มี ตาคมจริงจัง
- ชุด scrub **สีส้มอำพัน** (#D98A2B)
- บุคลิก: เป๊ะเรื่องเครื่อง อ่านจอไว ตะโกน "CLEAR!" ได้น่าเกรงขาม
- Pose แอ็คชั่นเสริม: `action_clear` — สองมือชูแผ่น paddle ตะโกน CLEAR

### 4. `att_dech` — อ.เดช (Attending / อาจารย์แพทย์)
- ชายไทย วัย ~50 ปี ใส่**แว่นกรอบเหลี่ยม** ผมหงอกแซมข้างหู
- **เสื้อกาวน์ขาวยาว** ทับเชิ้ตน้ำเงินเข้ม + เนคไทแดงเข้ม ยืนกอดอก
- บุคลิก: เหมือน Edgeworth — พูดน้อยแต่คม โผล่มาตอนคุณตัดสินใจผิดพร้อมประโยค "ช้าก่อน!"
- Pose แอ็คชั่นเสริม: `action_point` — ชี้นิ้วมาข้างหน้าแบบ "OBJECTION!"

## Prompt template สำหรับ generate ด้วย AI

### ขั้นที่ 1 — สร้าง reference sheet ก่อน (ทำครั้งเดียวต่อตัวละคร)

> Character reference sheet, front-facing bust portrait, flat anime style inspired by
> Ace Attorney / Phoenix Wright courtroom drama, bold clean outlines, cel shading,
> 2-3 tone shadows, no gradient background.
> Character: [วางคำบรรยายตัวละครจากด้านบน แปลเป็นอังกฤษ]
> Thai person, medical setting. Plain white background.

เก็บรูปที่ถูกใจที่สุดไว้เป็น **ภาพอ้างอิง** — ทุกครั้งที่ generate pose ใหม่ให้แนบภาพนี้เสมอ (feature "reference image" / "character consistency" ของเครื่องมือที่ใช้) เพื่อให้หน้าตาเหมือนเดิมทุกรูป

### ขั้นที่ 2 — generate ทีละ pose (แนบภาพอ้างอิงทุกครั้ง)

> Same character as the reference image, exact same face, hair, and outfit.
> Bust portrait, flat anime style, bold outlines, cel shading,
> **transparent background**, PNG.
> Expression/pose: [เลือกจากตารางล่าง]

| pose | คำบรรยายที่ใช้ใน prompt |
|---|---|
| `idle` | calm neutral expression, mouth closed, looking at viewer |
| `idle_talk` | same as idle but mouth open mid-speech |
| `panic` | shocked wide eyes, mouth open shouting, sweat drop, leaning forward |
| `stern` | serious frown, furrowed brows, intense stare |
| `happy` | warm relieved smile, eyes slightly closed |
| `action_cpr` | arms locked straight down performing chest compressions, intense effort |
| `action_clear` | holding two defibrillator paddles up, shouting |
| `action_inject` | pushing syringe into IV line, focused |
| `action_point` | dramatic finger point at viewer, Ace Attorney objection pose |

### ขั้นที่ 3 — จัดไฟล์
1. ลบพื้นหลังถ้าไม่โปร่งใส (เช่น remove.bg)
2. ครอบตัดให้เหลือ bust สัดส่วน 4:5, ย่อเหลือกว้าง 600px
3. แปลงเป็น WebP (เช่น [squoosh.app](https://squoosh.app) quality ~80)
4. ตั้งชื่อ + วางโฟลเดอร์ตามหัวข้อแรก แล้ว commit

## เพิ่มตัวละครใหม่ในอนาคต

1. เพิ่ม entry ใน `src/game/characters.js` — id, ชื่อ, role, สี nameplate และ (ถ้าอยากมี placeholder) ฟังก์ชัน SVG — ก๊อปตัวที่ใกล้เคียงแล้วแก้สีได้
2. เพิ่มโปรไฟล์ในไฟล์นี้ + generate รูปตาม pipeline ข้างบน
3. วางรูปใน `public/images/characters/{ตัวใหม่}/`
4. โจทย์ไหนอยากให้ตัวละครใหม่พูด ใช้ `who: '<charId ใหม่>'` ได้ทันที
