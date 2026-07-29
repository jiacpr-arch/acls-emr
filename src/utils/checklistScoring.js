// คำนวณคะแนน/ข้อวิกฤต/ผ่าน-ไม่ผ่านแนะนำ จาก checklist items + สถานะติ๊ก —
// แยกจาก ChecklistGrader.jsx เพื่อทดสอบได้ตรงๆ โดยไม่ต้อง render component
export function tallyChecklist(items, checked) {
  const total = items.length;
  const checkedCount = items.filter((it) => checked[it.no]).length;
  const criticalItems = items.filter((it) => it.critical);
  const criticalDone = criticalItems.every((it) => checked[it.no]);
  return { total, checkedCount, criticalDone };
}

export function suggestPass(tally, passRule) {
  if (!passRule) return null;
  return tally.checkedCount >= passRule.min && tally.criticalDone;
}
