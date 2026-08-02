# พื้นหลังฉากในเกม Code Blue Sim — สเปกและ prompt สร้างภาพ

เอกสารนี้ใช้สั่ง AI สร้างภาพ (ChatGPT / อื่น ๆ) ให้ได้พื้นหลังที่เข้าชุดกับ `er_bay.webp` ที่มีอยู่แล้ว

> **ระบบพร้อมรับภาพแล้ว** — โค้ดอ่านฉากจากฟิลด์ `bg` ของโจทย์ ถ้ายังไม่มีไฟล์ เกมจะใช้ `er_bay.webp`
> ไปก่อนโดยไม่พัง วางไฟล์เมื่อไหร่ฉากเปลี่ยนทันทีโดยไม่ต้องแก้โค้ด

---

## 1. สเปกไฟล์ (เหมือนกันทุกฉาก)

| หัวข้อ | ค่า |
|---|---|
| ขนาด | **1536 × 1024 px** (อัตราส่วน 3:2 แนวนอน) — เท่ากับ `er_bay.webp` เดิม |
| ไฟล์ | `.webp` คุณภาพราว 80 (ให้ได้ขนาดไฟล์ประมาณ 200–300 KB) |
| ที่วาง | `public/images/backgrounds/{key}.webp` |

ชื่อไฟล์ต้องตรงกับ key เป๊ะ ๆ: `ward_night.webp` · `public_indoor.webp` · `home_room.webp` ·
`poolside.webp` · `pediatric.webp` · `delivery_room.webp` · `ambulance.webp` · `ct_room.webp` ·
`cath_lab.webp` · `outdoor_street.webp`

> **สถานะ:** ทุก key ข้างบนมีไฟล์รูปแล้ว — 4 ฉากหลัง (ambulance, ct_room, cath_lab,
> outdoor_street) ยังไม่ถูกใช้โดยเคส built-in ตัวไหน (เคสเดิมดำเนินเรื่องใน ER/ฉากที่มีอยู่แล้ว)
> มีไว้ให้เคสใหม่/เคสจากแอดมิน-AI ตั้ง `bg` ได้ทันที

**ถ้า AI ส่งออกมาเป็น PNG/JPG** แปลงเป็น webp ก่อนวาง เช่น
`cwebp -q 80 ward_night.png -o ward_night.webp` หรือใช้เว็บแปลงไฟล์ทั่วไป

---

## 2. ข้อบังคับเรื่ององค์ประกอบ — สำคัญที่สุด

ถ้าสองข้อนี้พลาด ภาพจะสวยแต่ใช้ในเกมไม่ได้

**① กลางภาพส่วนล่างต้องโล่ง**
ตัวละครจะยืนทับตรงกลางค่อนไปทางล่างของภาพ บริเวณนั้นต้องเป็นพื้นว่าง ๆ
ไม่มีเตียง ไม่มีเครื่องมือ ไม่มีเสา

**② ของสำคัญต้องอยู่ "แถบกลาง" ของภาพ**
บนมือถือ CSS ใช้ `cover` กับกรอบที่แคบและสูงกว่าภาพมาก จึง **ครอปซ้าย-ขวาทิ้งไปราว 40%**
เหลือเห็นเฉพาะแถบกลางประมาณ 60% ของความกว้าง
→ อะไรที่อยากให้ผู้เล่นเห็น (ป้าย ตู้ AED เตียง) ต้องอยู่ในแถบกลาง ไม่ใช่ชิดขอบซ้าย/ขวา

**③ ห้ามมีคนหรือสัตว์ในภาพเด็ดขาด** — ฉากต้องว่างเปล่าเหมือนเวทีละครที่ยังไม่มีนักแสดง

---

## 3. บล็อกสไตล์ร่วม — ต่อท้ายทุก prompt

ก๊อปบล็อกนี้ไปต่อท้าย prompt ของทุกฉาก เพื่อให้ทั้ง 6 ภาพเป็นชุดเดียวกัน

```
Style: semi-realistic anime illustration, clean linework, soft even lighting,
moderately saturated colors, detailed but uncluttered. Eye-level wide-angle
camera looking into the room. Empty scene — absolutely no people, no animals,
no hands. Keep the lower-center area of the frame clear and open (floor space).
Place all important objects near the horizontal center of the image, not at the
left or right edges. English signage only, no Thai text. No watermark, no
border, no text overlay. 3:2 landscape, 1536x1024.
```

---

## 4. Prompt รายฉาก

### `ward_night.webp` — หอผู้ป่วยกลางดึก
ใช้กับ 4 เคส: Code ในหอผู้ป่วย · หายใจช้าลงเรื่อย ๆ เตียง 12 · จอเตือน VF ตอนตีสาม · บีบ bag ให้เป็น

```
A hospital inpatient ward at night, viewed from the foot of an empty bed area.
Dimmed overhead lights, one warm pool of light near a made-up hospital bed with
a privacy curtain half drawn. A vital-signs monitor on a stand glowing softly in
the dark, an IV pole, a bedside table. Dark window at the back reflecting the
room. Quiet, still, 3 a.m. atmosphere.
```

### `public_indoor.webp` — ที่สาธารณะในร่ม (ห้าง / โรงอาหาร)
ใช้กับ 3 เคส: ล้มหมดสติในห้าง · สำลักในโรงอาหาร · คุณแม่ท้องแก่สำลัก

```
The ground-floor atrium of a modern shopping mall, polished reflective stone
floor, bright daylight from a skylight above. A green wall-mounted AED cabinet
with a heart-and-lightning symbol is clearly visible on a pillar near the center.
Shop fronts and a food-court seating area blurred in the background, planters,
a directory sign. Open empty floor in the foreground.
```

### `home_room.webp` — บ้าน / ห้องพัก
ใช้กับ 4 เคส: พ่อล้มหมดสติที่บ้าน · หมดสติในหอพัก · ทารกสำลักของเล่น · หมดสติในห้องน้ำ ชั้น 8

```
The living room of a small Thai apartment, late afternoon light through a
sliding balcony door. A fabric sofa pushed to one side, a low wooden coffee
table, a rug, a TV on a cabinet, a floor lamp. Tiled floor with clear open space
in the middle of the room. Lived-in but tidy, ordinary and homely.
```

### `poolside.webp` — ริมสระว่ายน้ำ / ริมน้ำกลางแจ้ง
ใช้กับ 2 เคส: หมดสติข้างสระว่ายน้ำ · เด็กจมน้ำในคลอง

```
The edge of an outdoor swimming pool on a late afternoon, wet non-slip tile deck
in the foreground reflecting the sky, calm turquoise water with gentle ripples
behind. Sun loungers and a folded parasol along the far side, a life ring on a
post, low tropical plants and a fence beyond. Warm golden light, wet footprints
on the deck.
```

### `pediatric.webp` — ห้องตรวจกุมารเวช
ใช้กับ 2 เคส: ชักหยุดแล้ว แต่ไม่หายใจ · ทารกนิ่งไปในเปล

```
A pediatric examination room in a hospital, bright and cheerful. A small
examination couch with colorful patterned paper cover against one wall, a height
chart and cartoon animal decals on pastel walls, a cabinet with pediatric
supplies, a weighing scale for infants, a small oxygen setup. Warm friendly
lighting, clean vinyl floor with open space in the middle.
```

### `delivery_room.webp` — ห้องคลอด
ใช้กับ 1 เคส: ห้องคลอด — ครรภ์ 34 สัปดาห์

```
A hospital delivery room, clinical and brightly lit. A delivery bed with
stirrups folded down and a clean sheet, a fetal heart-rate monitor on a rolling
stand with a paper strip, an infant warmer with an overhead heat lamp along the
far wall, an instrument trolley covered with a sterile drape, a wall-mounted
oxygen and suction panel. Pale green-tiled walls, polished floor with clear open
space in front of the bed.
```

---

## 5. หลังได้ภาพมาแล้ว

1. แปลงเป็น `.webp` แล้ววางที่ `public/images/backgrounds/` ตามชื่อไฟล์ข้างบน
2. เปิดเกมดูบนมือถือ (หรือย่อหน้าต่างให้แคบ) เช็คว่าของสำคัญไม่ถูกครอปหาย
3. ถ้าฉากไหนดูรก/แย่งความสนใจจากตัวละคร ให้ generate ใหม่โดยเติมคำว่า
   `simpler, fewer objects, more empty floor space` เข้าไปใน prompt

## 6. การเพิ่มฉากใหม่ในอนาคต

1. เพิ่ม key + คำอธิบายใน `BACKGROUNDS` ที่ `src/data/codeBlueScenarios.js`
2. วางไฟล์ `public/images/backgrounds/{key}.webp`
3. ใส่ `bg: '{key}'` ในไฟล์โจทย์ที่ต้องการ

key ที่ไม่มีใน `BACKGROUNDS` จะตกไปใช้ `er_bay` โดยอัตโนมัติ — โจทย์ที่พิมพ์ผิดจึงไม่ทำให้เวทีภาพหาย
