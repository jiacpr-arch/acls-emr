// Pediatric Drug Dosing Calculator
// Auto-switches when age < 16 or weight < 40kg

export function isPediatric(patient) {
  if (!patient) return false;
  if (patient.age && patient.age < 16) return true;
  if (patient.weight && patient.weight < 40) return true;
  return false;
}

// Calculate pediatric doses based on weight
export function getPediatricDoses(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  const w = weightKg;

  return {
    epinephrine: {
      dose: `${(w * 0.01).toFixed(2)} mg`,
      concentration: '1:10,000',
      volume: `${(w * 0.1).toFixed(1)} ml`,
      note: '0.01 mg/kg (1:10,000) IV/IO. Max 1mg.',
      interval: 'q3-5 min',
    },
    amiodarone: {
      dose: `${(w * 5).toFixed(0)} mg`,
      note: '5 mg/kg IV/IO. Max 300mg. Can repeat x2 (max 15mg/kg/day)',
    },
    atropine: {
      dose: `${Math.max(w * 0.02, 0.1).toFixed(2)} mg`,
      note: '0.02 mg/kg IV. Min 0.1mg. Max 0.5mg (child) / 1mg (adolescent)',
    },
    adenosine_first: {
      dose: `${(w * 0.1).toFixed(1)} mg`,
      note: '0.1 mg/kg rapid IV push. Max 6mg.',
    },
    adenosine_second: {
      dose: `${(w * 0.2).toFixed(1)} mg`,
      note: '0.2 mg/kg rapid IV push. Max 12mg.',
    },
    defibrillation: {
      first: `${(w * 2).toFixed(0)} J`,
      subsequent: `${(w * 4).toFixed(0)} J`,
      note: '2 J/kg first → 4 J/kg subsequent. Max 10 J/kg or adult dose.',
    },
    cardioversion: {
      dose: `${(w * 0.5).toFixed(0)}-${(w * 1).toFixed(0)} J`,
      note: '0.5-1 J/kg. May increase to 2 J/kg.',
    },
    lidocaine: {
      dose: `${(w * 1).toFixed(0)} mg`,
      note: '1 mg/kg IV/IO. May repeat. Max 3mg/kg.',
    },
    sodium_bicarb: {
      dose: `${(w * 1).toFixed(0)} mEq`,
      note: '1 mEq/kg IV slow push.',
    },
    calcium_chloride: {
      dose: `${(w * 20).toFixed(0)} mg`,
      note: '20 mg/kg (0.2 ml/kg of 10%) IV slow push.',
    },
    glucose: {
      dose: `${(w * 0.5).toFixed(1)} g`,
      note: 'D10W: 5 ml/kg. D25W: 2 ml/kg (>1yr). D50W: avoid in peds.',
    },
    ett_size: {
      uncuffed: `${(patient?.age ? (patient.age / 4 + 4) : w / 10 + 3.5).toFixed(1)}`,
      cuffed: `${(patient?.age ? (patient.age / 4 + 3.5) : w / 10 + 3).toFixed(1)}`,
      depth: `${(patient?.age ? (patient.age / 2 + 12) : w / 5 + 10).toFixed(0)} cm`,
      note: 'Cuffed preferred. Uncuffed: age/4+4. Cuffed: age/4+3.5.',
    },
    fluid_bolus: {
      dose: `${(w * 20).toFixed(0)} ml`,
      note: '20 ml/kg NS/LR bolus. May repeat. Assess after each bolus.',
    },
  };
}

// Get ETT size by age
export function getETTSize(age) {
  if (!age) return null;
  if (age < 1) return { uncuffed: '3.5', cuffed: '3.0' };
  return {
    uncuffed: (age / 4 + 4).toFixed(1),
    cuffed: (age / 4 + 3.5).toFixed(1),
  };
}
