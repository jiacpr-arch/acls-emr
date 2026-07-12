# Prompt Pack — รูปตัวละครเกม (Recorder Hero + Code Blue Sim)

เกมทั้งสองใช้ตัวละครชุดเดียวกัน (`src/game/characters.js` + `CharacterSprite`)
**วางไฟล์แล้วเกมใช้รูปจริงทันที** ไม่ต้องแก้โค้ด — ถ้ายังไม่มีรูป เกม fallback เป็น SVG อนิเมะให้เอง

## วางไฟล์ที่ไหน
```
public/images/characters/{charId}/{pose}.webp
(ทางเลือก) {pose}_talk.webp = เฟรมปากอ้า เกมจะสลับ 2 เฟรมตอนพูดเอง
```
- charId: `boy_compressor` · `nurse_mint` · `fon_defib` · `att_dech`
- pose ที่เกมใช้จริง: **idle · talk · panic · stern · happy** (5 รูป/ตัว = 20 รูป)

## สเปกไฟล์
WebP พื้นหลังโปร่งใส · กว้าง 600px สูง ~750px (สัดส่วน 4:5) · ครึ่งตัวบน (bust) หันหน้าเข้ากล้อง · ≤150KB/รูป

---

## วิธีใช้ (2 ขั้น)

### ขั้น 1 — สร้าง "ภาพอ้างอิง" ต่อ 1 ตัวละคร (ทำครั้งเดียว)
ใช้ prompt ด้านล่างต่อตัว เก็บรูปที่ถูกใจไว้เป็น reference — **ทุกครั้งที่ทำ pose ใหม่ให้แนบภาพอ้างอิงนี้เสมอ** (feature character consistency / reference image) เพื่อให้หน้าเหมือนกันทุกรูป

### ขั้น 2 — สร้างทีละ pose (แนบภาพอ้างอิงทุกครั้ง)
ต่อท้าย prompt อ้างอิงด้วย: `Same character, exact same face/hair/outfit. Expression: <ดูตารางท้ายไฟล์>. Transparent background PNG.`

---

## Base prompt (ใช้ร่วมทุกตัว)
```
Character bust portrait, flat modern anime style inspired by Ace Attorney / visual-novel,
bold clean black outlines, cel shading with 2-3 tone shadows, bright saturated colors,
Thai person in a hospital resuscitation setting, front-facing, upper body (head to waist),
plain transparent background, high quality.
```

## ตัวละคร (แทน [CHAR] ใน base prompt)

**1. boy_compressor — "พี่บอย" (คนกดหน้าอก)**
```
Thai man ~30, big and muscular build, short spiky black hair, RED headband,
green scrub top (#3E9E52), athletic, slight sweat. Confident energetic vibe.
```

**2. nurse_mint — "พยาบาลมิ้นท์" (พยาบาล/ยา/IV)**
```
Thai woman ~27, black hair in a low bun, mint/teal scrub top (#2FA8A0),
ID badge on lanyard, bright but professional, calm and quick-handed.
```

**3. fon_defib — "หมอฝน" (คุมเครื่อง/defib)**
```
Thai woman ~29, long hair in a ponytail, amber/orange scrub top (#D98A2B),
sharp serious eyes, precise and commanding.
```

**4. att_dech — "อ.เดช" (อาจารย์แพทย์ / ผู้บรรยาย)**
```
Thai man ~50, square-frame glasses, greying hair at the temples,
long white doctor coat over dark navy shirt with a dark-red tie, arms crossed,
calm authoritative mentor (Edgeworth-like).
```

## ตาราง pose (ใส่ต่อท้ายตอนสร้างแต่ละรูป)
| ไฟล์ | Expression prompt |
|---|---|
| `idle` | calm neutral expression, mouth closed, looking at viewer |
| `talk` (หรือ `idle_talk`) | same as idle but mouth open mid-speech |
| `panic` | shocked wide eyes, mouth open shouting, sweat drop, leaning forward |
| `stern` | serious frown, furrowed brows, intense focused stare |
| `happy` | warm relieved smile, eyes slightly closed |

## จัดไฟล์ก่อน commit
1. ลบพื้นหลังถ้าไม่โปร่งใส (remove.bg) 2. ครอป bust 4:5 ย่อกว้าง 600px
3. แปลง WebP quality ~80 (squoosh.app) 4. ตั้งชื่อ/วางโฟลเดอร์ตามด้านบน แล้ว commit

> ทยอยส่งทีละรูปได้ — เกมจะใช้รูปจริงเฉพาะตัว/ pose ที่มีไฟล์ ที่เหลือใช้ SVG ไปก่อน
