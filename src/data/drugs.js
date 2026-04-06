export const drugs = [
  // === CARDIAC ARREST ===
  {
    id: "epinephrine_arrest",
    name: "Epinephrine",
    indication: "Cardiac Arrest (all rhythms)",
    dose: "1 mg",
    route: "IV/IO",
    interval: "Every 3-5 minutes",
    intervalSeconds: 180,
    maxDose: "No maximum in arrest",
    notes: "Give ASAP for non-shockable. For shockable, give after 2nd shock.",
    category: "cardiac_arrest"
  },
  {
    id: "amiodarone_first",
    name: "Amiodarone (1st)",
    indication: "VF/pVT refractory to shock",
    dose: "300 mg",
    route: "IV/IO bolus",
    interval: "Once",
    maxDose: "300 mg first dose",
    notes: "Give after 3rd shock. Dilute in 20-30 mL D5W or NS.",
    category: "cardiac_arrest"
  },
  {
    id: "amiodarone_second",
    name: "Amiodarone (2nd)",
    indication: "VF/pVT still refractory",
    dose: "150 mg",
    route: "IV/IO bolus",
    interval: "Once (after 1st dose)",
    maxDose: "150 mg second dose",
    notes: "Can give once more if VF/pVT persists.",
    category: "cardiac_arrest"
  },
  {
    id: "lidocaine_first",
    name: "Lidocaine",
    indication: "VF/pVT if Amiodarone unavailable",
    dose: "1-1.5 mg/kg",
    route: "IV/IO",
    interval: "Repeat 0.5-0.75 mg/kg q5-10min",
    maxDose: "3 mg/kg total",
    notes: "Alternative to Amiodarone. Weight-based.",
    category: "cardiac_arrest",
    weightBased: true
  },
  {
    id: "sodium_bicarb",
    name: "Sodium Bicarbonate",
    indication: "Hyperkalemia, TCA OD, severe metabolic acidosis",
    dose: "1 mEq/kg",
    route: "IV",
    interval: "Repeat as needed (ABG)",
    notes: "Not routine. Use for specific indications.",
    category: "cardiac_arrest",
    weightBased: true
  },
  {
    id: "calcium_chloride",
    name: "Calcium Chloride 10%",
    indication: "Hyperkalemia, Ca-blocker OD, Hypermagnesemia",
    dose: "500-1000 mg (5-10 mL)",
    route: "IV slow push",
    interval: "Repeat as needed",
    notes: "Central line preferred. 3x more Ca than gluconate.",
    category: "cardiac_arrest"
  },
  {
    id: "magnesium",
    name: "Magnesium Sulfate",
    indication: "Torsades de Pointes, hypomagnesemia",
    dose: "1-2 g",
    route: "IV/IO over 5-20 min",
    interval: "May repeat once",
    notes: "Push for Torsades, slow infusion otherwise.",
    category: "cardiac_arrest"
  },
  // === BRADYCARDIA ===
  {
    id: "atropine",
    name: "Atropine",
    indication: "Symptomatic Bradycardia",
    dose: "1 mg",
    route: "IV",
    interval: "Every 3-5 minutes",
    intervalSeconds: 180,
    maxDose: "3 mg total",
    notes: "NOT effective in complete heart block or infranodal block.",
    category: "bradycardia"
  },
  {
    id: "dopamine_drip",
    name: "Dopamine",
    indication: "Bradycardia unresponsive to Atropine",
    dose: "5-20 mcg/kg/min",
    route: "IV infusion",
    interval: "Continuous",
    notes: "Titrate to HR and BP.",
    category: "bradycardia",
    weightBased: true,
    isInfusion: true
  },
  {
    id: "epinephrine_drip",
    name: "Epinephrine Infusion",
    indication: "Bradycardia unresponsive to Atropine",
    dose: "2-10 mcg/min",
    route: "IV infusion",
    interval: "Continuous",
    notes: "Alternative to Dopamine. Titrate to effect.",
    category: "bradycardia",
    isInfusion: true
  },
  // === TACHYCARDIA ===
  {
    id: "adenosine_first",
    name: "Adenosine (1st)",
    indication: "Stable regular narrow-complex SVT",
    dose: "6 mg",
    route: "Rapid IV push + 20mL NS flush",
    interval: "Once",
    notes: "Rapid push at proximal IV. Record rhythm strip.",
    category: "tachycardia"
  },
  {
    id: "adenosine_second",
    name: "Adenosine (2nd/3rd)",
    indication: "SVT persists after 1st dose",
    dose: "12 mg",
    route: "Rapid IV push + 20mL NS flush",
    interval: "May repeat once",
    maxDose: "Total: 6+12+12 = 30 mg",
    notes: "Half dose if via central line or on Carbamazepine.",
    category: "tachycardia"
  },
  {
    id: "diltiazem",
    name: "Diltiazem",
    indication: "Rate control AF/Aflutter (stable)",
    dose: "15-20 mg (0.25 mg/kg) IV over 2 min",
    route: "IV",
    interval: "Repeat 20-25 mg after 15 min",
    notes: "Avoid in WPW, decompensated HF, severe hypotension.",
    category: "tachycardia",
    weightBased: true
  },
  {
    id: "amiodarone_vt",
    name: "Amiodarone (stable VT)",
    indication: "Stable monomorphic VT",
    dose: "150 mg IV over 10 min",
    route: "IV",
    interval: "May repeat q10min",
    maxDose: "2.2 g in 24 hours",
    notes: "Maintenance: 1 mg/min x 6hr, then 0.5 mg/min x 18hr.",
    category: "tachycardia",
    isInfusion: true
  },
  // === ACUTE MI ===
  {
    id: "aspirin_acs",
    name: "Aspirin",
    indication: "Acute Coronary Syndrome",
    dose: "160-325 mg",
    route: "Chew & swallow",
    interval: "Once (stat)",
    notes: "Non-enteric coated. Give to ALL ACS unless true allergy.",
    category: "mi"
  },
  {
    id: "nitroglycerin",
    name: "Nitroglycerin",
    indication: "ACS chest pain",
    dose: "0.4 mg SL",
    route: "Sublingual",
    interval: "Every 5 min x 3 doses",
    maxDose: "3 doses total",
    notes: "CI: SBP <90, RV infarct, PDE5 inhibitor.",
    category: "mi"
  },
  {
    id: "heparin_acs",
    name: "UFH",
    indication: "ACS anticoagulation",
    dose: "60 u/kg bolus (max 4000u), 12 u/kg/hr (max 1000u/hr)",
    route: "IV",
    interval: "Continuous, adjust by aPTT",
    notes: "Target aPTT 50-70 sec.",
    category: "mi",
    weightBased: true,
    isInfusion: true
  },
  // === OTHER ===
  {
    id: "naloxone",
    name: "Naloxone",
    indication: "Known/suspected opioid OD",
    dose: "0.4-2 mg",
    route: "IV/IM/IN",
    interval: "Every 2-3 min as needed",
    notes: "Titrate to breathing. May need repeat doses.",
    category: "other"
  },
  {
    id: "alteplase_stroke",
    name: "Alteplase (tPA)",
    indication: "Acute Ischemic Stroke <4.5hr",
    dose: "0.9 mg/kg (max 90 mg)",
    route: "IV: 10% bolus 1min, 90% over 60min",
    interval: "Once",
    notes: "Door-to-Needle <60 min. Rule out hemorrhage CT first.",
    category: "stroke",
    weightBased: true,
    isInfusion: true
  }
];

// Get drugs by category
export function getDrugsByCategory(category) {
  return drugs.filter(d => d.category === category);
}

// Get drug by id
export function getDrugById(id) {
  return drugs.find(d => d.id === id);
}

// Calculate weight-based dose
export function calcDose(drug, weightKg) {
  if (!drug.weightBased || !weightKg) return drug.dose;
  return drug.dose; // UI will show calculated dose
}
