export const rhythms = [
  // SHOCKABLE
  {
    id: "vf", name: "Ventricular Fibrillation", abbreviation: "VF",
    shockable: true, category: "cardiac_arrest",
    ecgDescription: "Chaotic, irregular. No P/QRS/T waves.",
    actions: ["Defibrillation (Biphasic 120-200J)", "Resume CPR 2 min", "Epi 1mg after 2nd shock, q3-5min", "Amiodarone 300mg after 3rd shock", "Consider H's & T's"],
    energyBiphasic: { first: 120, subsequent: 200 }, energyMonophasic: 360
  },
  {
    id: "pvt", name: "Pulseless VT", abbreviation: "pVT",
    shockable: true, category: "cardiac_arrest",
    ecgDescription: "Wide QRS (>0.12s), regular, fast. No pulse.",
    actions: ["Defibrillation (same as VF)", "Resume CPR 2 min", "Epi 1mg after 2nd shock, q3-5min", "Amiodarone 300mg after 3rd shock"],
    energyBiphasic: { first: 120, subsequent: 200 }, energyMonophasic: 360
  },
  // NON-SHOCKABLE
  {
    id: "pea", name: "PEA", abbreviation: "PEA",
    shockable: false, category: "cardiac_arrest",
    ecgDescription: "Organized rhythm but NO pulse.",
    actions: ["CPR 2 min", "Epi 1mg ASAP, q3-5min", "NO shock", "Treat H's & T's"]
  },
  {
    id: "asystole", name: "Asystole", abbreviation: "Asystole",
    shockable: false, category: "cardiac_arrest",
    ecgDescription: "Flat line. Confirm in 2 leads.",
    actions: ["CPR 2 min", "Epi 1mg ASAP, q3-5min", "NO shock", "Treat H's & T's", "Consider termination"]
  },
  // BRADYCARDIA
  {
    id: "sinus_brady", name: "Sinus Bradycardia", abbreviation: "SB",
    shockable: false, category: "bradycardia",
    ecgDescription: "Normal P before QRS, rate <60.",
    actions: ["Atropine 1mg q3-5min (max 3mg)", "If ineffective: TCP", "Dopamine 5-20 mcg/kg/min", "Epi 2-10 mcg/min"]
  },
  {
    id: "second_degree_type2", name: "2nd Degree Type II", abbreviation: "AVB2-II",
    shockable: false, category: "bradycardia",
    ecgDescription: "Constant PR with sudden dropped QRS.",
    actions: ["High risk → complete block", "Atropine may NOT work", "TCP immediately", "Cardiology for permanent PM"]
  },
  {
    id: "third_degree", name: "3rd Degree AV Block", abbreviation: "AVB3",
    shockable: false, category: "bradycardia",
    ecgDescription: "Complete AV dissociation.",
    actions: ["Atropine usually NOT effective", "TCP IMMEDIATELY", "Dopamine/Epi drip as bridge", "Urgent transvenous pacing"]
  },
  // TACHYCARDIA
  {
    id: "svt", name: "SVT", abbreviation: "SVT",
    shockable: false, category: "tachycardia", subtype: "narrow_regular",
    ecgDescription: "Narrow QRS, regular, 150-250 bpm.",
    actions: ["Unstable: Cardioversion 50-100J", "Stable: Vagal maneuvers", "Adenosine 6mg → 12mg → 12mg", "Diltiazem or Beta-blocker"],
    cardioversionEnergy: { initial: 50, subsequent: 100 }
  },
  {
    id: "afib", name: "Atrial Fibrillation", abbreviation: "AF",
    shockable: false, category: "tachycardia", subtype: "narrow_irregular",
    ecgDescription: "Irregularly irregular. No P waves.",
    actions: ["Unstable: Cardioversion 120-200J", "Stable: Rate control", "Diltiazem 15-20mg IV", "Avoid AV blockers if WPW"],
    cardioversionEnergy: { initial: 120, subsequent: 200 }
  },
  {
    id: "vt_pulse", name: "VT with pulse", abbreviation: "VT",
    shockable: false, category: "tachycardia", subtype: "wide_regular",
    ecgDescription: "Wide QRS, regular, >100 bpm.",
    actions: ["Unstable: Cardioversion 100J", "Stable: Amiodarone 150mg IV/10min", "Polymorphic VT → defibrillate"],
    cardioversionEnergy: { initial: 100, subsequent: 200 }
  },
  {
    id: "torsades", name: "Torsades de Pointes", abbreviation: "TdP",
    shockable: true, category: "tachycardia", subtype: "wide_irregular",
    ecgDescription: "Polymorphic VT, twisting QRS, prolonged QT.",
    actions: ["Pulseless: Defibrillation", "With pulse: MgSO4 1-2g IV", "Stop QT-prolonging drugs", "Overdrive pacing"]
  },
  // POST-ROSC
  {
    id: "rosc", name: "ROSC", abbreviation: "ROSC",
    shockable: false, category: "post_arrest",
    ecgDescription: "Organized rhythm WITH pulse and BP.",
    actions: ["SpO2 92-98%, EtCO2 35-45", "MAP ≥65 mmHg", "12-Lead ECG → STEMI?", "TTM 32-36°C ≥24hr", "Glucose 140-180"]
  }
];

export function getRhythmById(id) {
  return rhythms.find(r => r.id === id);
}

export function getShockableRhythms() {
  return rhythms.filter(r => r.shockable);
}

export function getRhythmsByCategory(category) {
  return rhythms.filter(r => r.category === category);
}
