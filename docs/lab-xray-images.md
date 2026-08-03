# ผลแล็บ / เอกซเรย์ — คู่มือใส่รูปจริงเข้าเกม

คู่มือสร้าง "รูปผลตรวจจริง" มาแทนการ์ด placeholder ในเกม เมื่อบทเรียกให้เผยผลแล็บ
หรือเอกซเรย์กลางเกม **เกมใช้รูปจริงทันทีที่มีไฟล์** — ไม่ต้องแก้โค้ดใด ๆ
แค่วางไฟล์ให้ถูกที่ถูกชื่อ (เหมือนตัวละคร/ฉากหลัง)

## วิธีใส่รูปเข้าเกม (สำคัญที่สุด)

1. วางไฟล์ที่ `public/images/docs/{key}.webp`
2. ชื่อไฟล์ = `key` ที่ผูกไว้ในบทเคส (ดูหัวข้อ "Key ที่ผูกไว้ในบทแล้ว" ด้านล่าง)
3. รูปไหนยังไม่มี เกม fallback เป็นการ์ด placeholder ที่มีแค่ป้ายชื่อผลตรวจให้เอง
   → **ทยอยส่งทีละรูปได้เลย**

ตัวอย่าง:
```
public/images/docs/
  ecg_stemi.webp
  cxr_pneumothorax.webp
  ...
```

## Spec ไฟล์

| หัวข้อ | ค่า |
|---|---|
| ฟอร์แมต | **WebP** (PNG/JPG ก็ได้ แล้วค่อยแปลง) |
| ขนาด | กว้าง **1024px** สูง ~1280px (สัดส่วน 4:5) |
| การจัดวาง | ไม่ต้องครอปเต็มขอบ — เกมย่อรูปให้พอดีกรอบโดยเห็นครบทั้งภาพ (ไม่ตัดขอบ) |
| น้ำหนักไฟล์ | ≤ 200 KB/รูป (WebP quality ~80) |

## ผลตรวจ 2 ประเภท (`kind`) — กรอบหน้าจอจะจัดสไตล์ให้เองตามนี้

- **`lab`** — ใบผลตรวจ/กระดาษพิมพ์ (เช่น ผลเลือด, ผล lab panel) เกมใส่กรอบเป็น
  "ใบกระดาษหนีบคลิป" ให้เอง — ถ่าย/สร้างภาพเป็นกระดาษสีขาวอมครีมพร้อมตัวเลข/ตาราง
  วางบนพื้นเรียบก็พอ ไม่ต้องมีกรอบคลิปในรูป
- **`xray`** — ฟิล์มเอกซเรย์ / ECG strip / ภาพสแกน เกมใส่กรอบเป็น "กล่องไฟ (lightbox)"
  พื้นเข้มให้เอง — ถ่าย/สร้างภาพเป็นฟิล์มดำ-ขาวทั่วไป ไม่ต้องใส่แสงพื้นหลังเข้ามาเอง

## Prompt template สำหรับ generate ด้วย AI

### ผลแล็บ (`kind: 'lab'`)
> A printed medical lab report on plain white paper, clean clinical typography,
> table of values (e.g. troponin, electrolytes, CBC) with reference ranges,
> hospital letterhead style, photographed flat, no hands, no other objects,
> high detail, realistic.

### เอกซเรย์ / ECG strip (`kind: 'xray'`)
> A 12-lead ECG printout strip showing [ระบุจังหวะ เช่น "ST elevation in
> leads II, III, aVF"], classic ECG grid paper, black ink on pale pink/white
> grid, clean and legible, no hands, no other objects, photographed flat.

(หรือสำหรับฟิล์มเอกซเรย์จริง: "A chest X-ray film, grayscale radiograph showing
[ระบุความผิดปกติ], standard PA view, clean scan, no annotations, no hands.")

### จัดไฟล์
1. ครอบตัดให้เหลือแค่เอกสาร/ฟิล์ม ไม่มีพื้นหลังรก
2. ย่อเหลือกว้าง 1024px สัดส่วน ~4:5
3. แปลงเป็น WebP (เช่น [squoosh.app](https://squoosh.app) quality ~80)
4. ตั้งชื่อไฟล์ตาม `key` ในตารางด้านล่าง วางที่ `public/images/docs/` แล้ว commit

## Key ที่ผูกไว้ในบทแล้ว

> **สถานะ:** มีไฟล์รูปครบแล้ว — `ecg_stemi` (ใช้ในเคส acsBasic)

## เพิ่มผลตรวจใหม่ในอนาคต (สำหรับนักพัฒนา)

1. เลือก `key` ใหม่ที่ไม่ซ้ำ + ตัดสินใจ `kind` (`lab` หรือ `xray`)
2. ใส่ node ในไฟล์เคส (`src/data/scenarios/*.js`):
   `{ doc: { key: 'ชื่อคีย์', kind: 'lab'|'xray', caption: 'ป้ายกำกับสั้นๆ' }, t? }`
3. เพิ่มแถวในตาราง "key ที่ผูกไว้ในบทแล้ว" ข้างบน แล้ว generate รูปตาม pipeline นี้
4. วางรูปที่ `public/images/docs/{key}.webp` แล้วลบแถวออกจากตาราง (ถือว่าเสร็จ)
