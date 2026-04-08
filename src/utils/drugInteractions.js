// Drug Interaction & Allergy Check System
// Checks patient medications + allergies before administering drugs

const interactions = [
  { drug: 'calcium', contra: ['digoxin'], severity: 'critical', message: 'Ca + Digoxin → increased toxicity → fatal arrhythmia!' },
  { drug: 'ntg', contra: ['sildenafil', 'tadalafil', 'vardenafil', 'pde5', 'viagra', 'cialis'], severity: 'critical', message: 'NTG + PDE5 inhibitor → severe hypotension!' },
  { drug: 'adenosine', contra: ['carbamazepine', 'tegretol'], severity: 'warning', message: 'Adenosine + Carbamazepine → enhanced effect, use half dose' },
  { drug: 'adenosine', contra: ['dipyridamole', 'persantine'], severity: 'warning', message: 'Adenosine + Dipyridamole → potentiated effect, reduce dose' },
  { drug: 'amiodarone', contra: ['digoxin'], severity: 'warning', message: 'Amiodarone increases Digoxin levels → reduce Digoxin dose 50%' },
  { drug: 'amiodarone', contra: ['warfarin'], severity: 'warning', message: 'Amiodarone increases Warfarin effect → monitor INR closely' },
  { drug: 'beta_blocker', contra: ['verapamil', 'diltiazem'], severity: 'critical', message: 'Beta-blocker + Ca channel blocker → severe bradycardia/heart block!' },
  { drug: 'tpa', contra: ['warfarin', 'heparin', 'enoxaparin', 'rivaroxaban', 'apixaban', 'dabigatran', 'anticoagulant'], severity: 'critical', message: 'tPA + Anticoagulant → high bleeding risk! Check INR/aPTT first' },
  { drug: 'nahco3', contra: ['calcium'], severity: 'warning', message: 'NaHCO₃ + Ca → precipitates! Flush line between drugs' },
  { drug: 'atropine', contra: ['glaucoma'], severity: 'warning', message: 'Atropine CI in narrow-angle glaucoma' },
];

// Check drug against patient medications
export function checkDrugInteraction(drugId, patientMedications = []) {
  const meds = Array.isArray(patientMedications)
    ? patientMedications.join(' ').toLowerCase()
    : String(patientMedications).toLowerCase();

  if (!meds) return [];

  const warnings = [];
  const drugLower = drugId.toLowerCase();

  for (const ix of interactions) {
    if (drugLower.includes(ix.drug)) {
      for (const contra of ix.contra) {
        if (meds.includes(contra)) {
          warnings.push({ severity: ix.severity, message: ix.message });
        }
      }
    }
  }

  return warnings;
}

// Check drug against allergies
export function checkAllergy(drugId, allergies = []) {
  const allergyStr = Array.isArray(allergies)
    ? allergies.join(' ').toLowerCase()
    : String(allergies).toLowerCase();

  if (!allergyStr) return null;

  const drugLower = drugId.toLowerCase();
  const drugAliases = {
    epinephrine: ['epi', 'adrenaline'],
    amiodarone: ['cordarone'],
    atropine: ['atropine'],
    aspirin: ['asa', 'aspirin', 'acetylsalicylic'],
    morphine: ['morphine', 'opioid'],
    naloxone: ['narcan'],
    alteplase: ['tpa', 'alteplase', 'activase'],
    heparin: ['heparin'],
    adenosine: ['adenosine', 'adenocard'],
    diltiazem: ['diltiazem', 'cardizem'],
    metoprolol: ['metoprolol', 'lopressor'],
    nitroglycerin: ['ntg', 'nitroglycerin', 'glyceryl'],
  };

  for (const [drug, aliases] of Object.entries(drugAliases)) {
    if (drugLower.includes(drug) || aliases.some(a => drugLower.includes(a))) {
      if (aliases.some(a => allergyStr.includes(a)) || allergyStr.includes(drug)) {
        return { severity: 'critical', message: `⚠️ ALLERGY: Patient allergic to ${drug}!` };
      }
    }
  }

  return null;
}
