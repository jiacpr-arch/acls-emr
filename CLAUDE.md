# acls-emr

Vite + React SPA (mobile-first) — สื่อการสอน ACLS/BLS พร้อมเกม Code Blue Sim ที่ /sim

## Gotchas

- Scenario data มี **2 ระบบแยกกัน** อย่าแก้ผิดที่: `src/data/codeBlueScenarios.js` (+ `src/data/scenarios/*.js`) ใช้กับเกม /sim ส่วน `src/data/scenarios.js` ใช้กับ /scenarios → Recording (EMR drill)
- Course mode เป็น build-time flag: ค่า default คือ `acls`; ตั้ง `VITE_COURSE_MODE=bls` เพื่อ build เฉพาะ route ฝั่ง BLS
- ไม่มี UI test — งานที่แตะ UI ให้ verify ด้วยการขับแอปจริงตามสูตรใน skill `verify` (`/verify`); `npm test` ครอบคลุมเฉพาะ `api/**/*.test.js`
- ใน sandbox/remote: Supabase เชื่อมต่อไม่ได้ (ติด proxy) — /sim จะ fallback ไปใช้ built-in scenarios เอง; console error `ERR_TUNNEL_CONNECTION_FAILED` บน /sim ถือเป็นเรื่องปกติ ไม่ใช่บั๊ก
- ESLint มี error เดิมค้างอยู่จำนวนมาก — CI จึงรัน lint แบบไม่บังคับ; ห้ามเพิ่ม lint error ใหม่ในไฟล์ที่แตะ
