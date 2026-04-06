import Dexie from 'dexie';

export const db = new Dexie('ACLS_EMR');

db.version(1).stores({
  cases: 'id, mode, startTime, outcome',
  events: '++autoId, caseId, timestamp, category, type',
  cprCycles: '++autoId, caseId, cycleNumber',
  etco2Readings: '++autoId, caseId, elapsed',
});

// Generate case ID: YYYY-MMDD-NNN
export async function generateCaseId() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const todayCases = await db.cases
    .where('id')
    .startsWith(dateStr)
    .count();
  const seq = String(todayCases + 1).padStart(3, '0');
  return `${dateStr}-${seq}`;
}

// Save full case
export async function saveCase(caseData) {
  await db.cases.put(caseData);
}

// Add event to case
export async function addEvent(event) {
  const id = await db.events.add(event);
  return id;
}

// Get all events for a case
export async function getCaseEvents(caseId) {
  return db.events.where('caseId').equals(caseId).sortBy('timestamp');
}

// Save CPR cycle quality data
export async function saveCPRCycle(cycle) {
  return db.cprCycles.add(cycle);
}

// Save EtCO2 reading
export async function saveEtCO2(reading) {
  return db.etco2Readings.add(reading);
}

// Get all cases
export async function getAllCases() {
  return db.cases.orderBy('startTime').reverse().toArray();
}

// Get a single case with all related data
export async function getFullCase(caseId) {
  const [caseData, events, cycles, etco2] = await Promise.all([
    db.cases.get(caseId),
    db.events.where('caseId').equals(caseId).sortBy('timestamp'),
    db.cprCycles.where('caseId').equals(caseId).sortBy('cycleNumber'),
    db.etco2Readings.where('caseId').equals(caseId).sortBy('elapsed'),
  ]);
  return { ...caseData, events, cprCycles: cycles, etco2Readings: etco2 };
}

// Delete a case and all related data
export async function deleteCase(caseId) {
  await Promise.all([
    db.cases.delete(caseId),
    db.events.where('caseId').equals(caseId).delete(),
    db.cprCycles.where('caseId').equals(caseId).delete(),
    db.etco2Readings.where('caseId').equals(caseId).delete(),
  ]);
}
