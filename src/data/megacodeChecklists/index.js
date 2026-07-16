import tachycardia from './tachycardia';

// Registry of Megacode/Case evaluation checklists.
// Add a new case by creating a data file matching the same shape as
// `tachycardia.js` (id, title, subtitle, scenario, passCriteria, sections[],
// reference) and registering it here — no other code needs to change.
export const MEGACODE_CHECKLISTS = {
  tachycardia,
};

export const MEGACODE_CHECKLIST_LIST = Object.values(MEGACODE_CHECKLISTS);

export function getMegacodeChecklist(caseId) {
  return MEGACODE_CHECKLISTS[caseId] || null;
}

export function getAllItems(checklist) {
  return checklist.sections.flatMap(section => section.items);
}

export function getCriticalItems(checklist) {
  return getAllItems(checklist).filter(item => item.critical);
}

// statusMap: { [itemId]: true | false | undefined } — true = ปฏิบัติได้/ทำแล้ว
export function evaluateChecklist(checklist, statusMap) {
  const allItems = getAllItems(checklist);
  const criticalItems = allItems.filter(item => item.critical);
  const passedCount = allItems.filter(item => statusMap[item.id] === true).length;
  const missedCritical = criticalItems.filter(item => statusMap[item.id] !== true);
  const criticalPassed = missedCritical.length === 0;
  const { totalItems, minPassed, criticalRequired } = checklist.passCriteria;
  const passed = passedCount >= minPassed && (!criticalRequired || criticalPassed);

  return {
    passedCount,
    totalItems,
    minPassed,
    criticalPassed,
    missedCritical,
    passed,
    percent: totalItems > 0 ? Math.round((passedCount / totalItems) * 100) : 0,
  };
}
