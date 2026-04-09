export const reversibleCauses = {
  hs: [
    {
      name: "Hypovolemia",
      signs: "Flat neck veins, blood loss/dehydration",
      treatment: "Volume resuscitation — NS/LR bolus, blood products",
      whenToSuspect: [
        "Trauma / visible bleeding",
        "GI hemorrhage (hematemesis, melena)",
        "Ruptured AAA / ectopic pregnancy",
        "Flat neck veins during CPR",
        "Known dehydration (DKA, diarrhea)"
      ],
      protocol: [
        "Establish 2 large-bore IV (16-18G)",
        "NS or LR 1-2 L rapid bolus (pressure bag)",
        "Activate massive transfusion protocol if hemorrhagic",
        "Type & crossmatch + pRBC if Hb < 7",
        "Identify and control source of bleeding",
        "Consider surgical/IR consultation"
      ],
      keyPoints: [
        "Do NOT delay CPR for volume — run fluids during compressions",
        "Goal: MAP > 65 mmHg after ROSC",
        "Avoid excessive crystalloid > 3L — switch to blood products"
      ],
      labsNeeded: ["CBC", "Type & Screen", "Lactate", "Coagulation"]
    },
    {
      name: "Hypoxia",
      signs: "Cyanosis, low SpO2, airway issues",
      treatment: "BVM, intubation, confirm with EtCO2",
      whenToSuspect: [
        "SpO2 < 90% before arrest",
        "Drowning / submersion",
        "Airway obstruction (foreign body, edema)",
        "Respiratory failure / COPD exacerbation",
        "EtCO2 rising but no ROSC (suggests ventilation issue)"
      ],
      protocol: [
        "BVM with 100% O2 — ensure good seal",
        "OPA/NPA if no gag reflex",
        "Suction if visible secretions/vomit",
        "Consider SGA (iGel/LMA) if BVM difficult",
        "Intubate (ETT) with direct/video laryngoscopy",
        "Confirm placement: EtCO2 waveform + bilateral breath sounds",
        "Post-intubation: continuous ventilation 10 breaths/min"
      ],
      keyPoints: [
        "Avoid hyperventilation — 10 breaths/min during CPR",
        "If ETT placed: do NOT stop compressions for ventilation",
        "Check for tube displacement after every move/turn"
      ],
      labsNeeded: ["ABG", "Chest X-ray", "EtCO2"]
    },
    {
      name: "Hydrogen ion (Acidosis)",
      signs: "DKA, renal failure, prolonged arrest",
      treatment: "NaHCO3 1 mEq/kg IV, treat cause",
      whenToSuspect: [
        "Known DKA / metabolic acidosis",
        "Renal failure (uremia)",
        "Prolonged cardiac arrest (> 15 min)",
        "Pre-existing severe sepsis",
        "Toxic ingestion (methanol, ethylene glycol)"
      ],
      protocol: [
        "NaHCO3 1 mEq/kg IV slow push",
        "Can repeat 0.5 mEq/kg q10min",
        "Increase ventilation rate to blow off CO2",
        "Treat underlying cause (DKA protocol, dialysis)",
        "Recheck ABG after 1-2 doses"
      ],
      keyPoints: [
        "Flush line before/after Ca — precipitates with NaHCO3",
        "Not routine in all arrests — use for known/suspected acidosis",
        "Target pH > 7.20",
        "Each amp NaHCO3 = 50 mEq = 50 ml of 8.4% solution"
      ],
      labsNeeded: ["ABG/VBG", "BMP (HCO3)", "Lactate", "Ketones"]
    },
    {
      name: "Hypo/Hyperkalemia",
      signs: "ECG changes, renal failure, dialysis",
      treatment: "Hypo: KCl. Hyper: Ca, Insulin+D50, NaHCO3",
      whenToSuspect: [
        "Dialysis patient / missed dialysis",
        "Renal failure (Cr > 3)",
        "ECG: peaked T waves / wide QRS (hyperK)",
        "ECG: U waves / flat T / ST depression (hypoK)",
        "Medications: K-sparing diuretics, ACEi, digoxin"
      ],
      protocol: [
        "STAT K+ level (iSTAT / ABG)",
        "If HyperK (K > 5.5):",
        "  - CaCl 10% 10ml IV over 2-3 min (or Ca gluconate 30ml)",
        "  - NaHCO3 50 mEq IV",
        "  - Regular Insulin 10u + D50W 50ml IV",
        "  - Albuterol nebulizer 10-20 mg",
        "  - Kayexalate 30g PO/PR (slow onset)",
        "  - Consider emergent dialysis",
        "If HypoK (K < 3.0):",
        "  - KCl 20 mEq IV over 1 hr (max 40 mEq/hr via central)",
        "  - MgSO4 2g IV if Mg low (K won't correct without Mg)",
        "  - Recheck K+ every 1-2 hours"
      ],
      keyPoints: [
        "Calcium stabilizes membrane in MINUTES — give FIRST in hyperK",
        "Insulin shifts K+ intracellular — must co-administer glucose",
        "In cardiac arrest: Ca can be given faster (push over 1 min)",
        "Dialysis is definitive treatment for severe hyperK with renal failure"
      ],
      labsNeeded: ["K+", "Mg2+", "Ca2+", "Cr/BUN", "ECG", "ABG"]
    },
    {
      name: "Hypothermia",
      signs: "Cold exposure, <30°C, Osborn J waves",
      treatment: "Active rewarming, limit shocks until >30°C",
      whenToSuspect: [
        "Cold exposure / drowning in cold water",
        "Core temp < 35°C (mild) / < 30°C (severe)",
        "Osborn (J) waves on ECG",
        "Elderly found down in cold environment",
        "Sepsis with hypothermia"
      ],
      protocol: [
        "Measure core temperature (esophageal/rectal)",
        "Remove wet clothing, insulate",
        "If T < 30°C: limit to 1 shock attempt, withhold drugs until > 30°C",
        "If T 30-35°C: space drugs at double normal interval",
        "Active external rewarming: Bair Hugger, warm blankets",
        "Active core rewarming: warm IV fluids (38-42°C)",
        "Severe (< 30°C): consider ECMO/bypass rewarming",
        "Continue CPR — 'not dead until warm and dead'"
      ],
      keyPoints: [
        "Drugs are ineffective in hypothermia < 30°C",
        "VF may be refractory until rewarmed",
        "Continue resuscitation much longer than usual",
        "Target rewarming rate: 1-2°C per hour"
      ],
      labsNeeded: ["Core temperature", "ABG", "K+", "Glucose", "Coagulation"]
    }
  ],
  ts: [
    {
      name: "Tension Pneumothorax",
      signs: "Absent breath sounds, tracheal deviation, JVD",
      treatment: "Needle decompression 2nd ICS → chest tube",
      whenToSuspect: [
        "Trauma (blunt/penetrating chest)",
        "Post-central line placement (subclavian/IJ)",
        "Mechanical ventilation with high pressures",
        "Unilateral absent breath sounds",
        "Difficult to ventilate despite patent airway",
        "Subcutaneous emphysema"
      ],
      protocol: [
        "Needle decompression: 14G needle + syringe",
        "Site: 2nd ICS, midclavicular line (affected side)",
        "Alternative: 5th ICS, anterior axillary line",
        "Insert perpendicular — expect rush of air",
        "Follow with chest tube (28-32 Fr)",
        "Chest tube: 5th ICS, anterior axillary line",
        "Connect to underwater seal / Pleur-evac"
      ],
      keyPoints: [
        "This is a CLINICAL diagnosis — do NOT wait for CXR",
        "In arrest: decompress BOTH sides if uncertain",
        "14G needle may not reach pleural space in obese patients — use 8cm needle",
        "After decompression: reassess breath sounds bilaterally"
      ],
      labsNeeded: ["CXR (post-procedure)", "ABG"]
    },
    {
      name: "Tamponade (Cardiac)",
      signs: "Beck's triad: JVD + muffled sounds + hypotension",
      treatment: "Pericardiocentesis",
      whenToSuspect: [
        "Penetrating chest/epigastric trauma",
        "Post-cardiac surgery / catheterization",
        "Known pericardial effusion / malignancy",
        "Beck's triad (often incomplete in arrest)",
        "PEA with narrow QRS",
        "Distended neck veins during CPR"
      ],
      protocol: [
        "Bedside echo/ultrasound: pericardial effusion + RV collapse",
        "Pericardiocentesis (subxiphoid approach):",
        "  - 18G spinal needle, 45° angle toward left shoulder",
        "  - Aspirate while advancing",
        "  - Even 15-20ml removal can improve hemodynamics",
        "IV fluid bolus 1-2L (increase preload as bridge)",
        "Prepare for OR (thoracotomy) if traumatic",
        "Consider pericardial window"
      ],
      keyPoints: [
        "Ultrasound-guided is preferred — reduces complications",
        "Even small volume aspiration (20 ml) can restore pulse",
        "In arrest: aggressive fluid resuscitation as temporizing measure",
        "Do NOT delay for imaging if clinical suspicion is high"
      ],
      labsNeeded: ["FAST/Echo", "CBC", "Coagulation", "Type & Screen"]
    },
    {
      name: "Toxins / OD",
      signs: "Ingestion history, toxidrome",
      treatment: "Antidotes: Naloxone, NaHCO3, Lipid emulsion",
      whenToSuspect: [
        "History of ingestion / pill bottles at scene",
        "Toxidrome pattern (miosis, mydriasis, diaphoresis)",
        "Young patient with no cardiac history",
        "Psychiatric history / suicide attempt",
        "Wide QRS (TCAs, Na channel blockers)",
        "Prolonged QTc (many drugs)"
      ],
      protocol: [
        "Identify toxin if possible — pill bottles, history",
        "Contact Poison Control",
        "Opioid: Naloxone 0.4-2 mg IV/IN — repeat q2-3 min",
        "TCA / Na channel blocker: NaHCO3 1-2 mEq/kg IV bolus",
        "  - Target serum pH 7.45-7.55, keep QRS < 120ms",
        "Beta-blocker: Glucagon 3-5 mg IV → infusion 3-5 mg/hr",
        "  - High-dose Insulin 1 u/kg bolus + D50W",
        "Ca-channel blocker: CaCl 1-2g IV, High-dose Insulin",
        "Local anesthetic toxicity: Lipid Emulsion 20%",
        "  - 1.5 ml/kg bolus → 0.25 ml/kg/min infusion",
        "Digoxin: DigiFab (Digoxin-specific antibody fragments)"
      ],
      keyPoints: [
        "Prolonged CPR may be warranted — young patients can recover",
        "Lipid Emulsion is the rescue for local anesthetic systemic toxicity (LAST)",
        "NaHCO3 for ANY drug causing wide QRS in arrest",
        "Activated charcoal only if < 1 hr and airway protected"
      ],
      labsNeeded: ["Tox screen", "Acetaminophen/Salicylate levels", "ECG (QRS/QTc)", "ABG", "BMP"]
    },
    {
      name: "Thrombosis — PE",
      signs: "Sudden onset, DVT hx, RV strain",
      treatment: "Alteplase 50mg IV, prolonged CPR (>60 min)",
      whenToSuspect: [
        "Sudden PEA arrest (especially narrow QRS PEA)",
        "Known DVT / recent surgery / immobilization",
        "RV dilation on echo / McConnell's sign",
        "Prior PE history",
        "Post-partum / OCP use",
        "S1Q3T3 pattern on ECG (uncommon)"
      ],
      protocol: [
        "Ultrasound: RV dilation, D-sign, McConnell's",
        "If PE confirmed or highly suspected:",
        "  - Alteplase (tPA) 50 mg IV bolus",
        "  - Can give 2nd dose (total 100 mg) if no response",
        "  - Alternative: Tenecteplase weight-based",
        "Heparin 80 u/kg IV bolus (if not already on anticoagulation)",
        "Continue CPR for at least 60-90 min after fibrinolysis",
        "Consider surgical embolectomy / catheter-directed therapy",
        "ECMO if available and massive PE"
      ],
      keyPoints: [
        "tPA during CPR: continue compressions for 60-90 min after dosing",
        "Relative contraindication to fibrinolysis in arrest is acceptable risk",
        "PEA with narrow complex = think PE until proven otherwise",
        "Fibrinolysis = commitment to prolonged resuscitation"
      ],
      labsNeeded: ["Echo (RV strain)", "CT-PA (if ROSC)", "D-dimer", "Troponin", "ABG"]
    },
    {
      name: "Thrombosis — MI",
      signs: "ST changes, chest pain, cardiac hx",
      treatment: "PCI or fibrinolysis",
      whenToSuspect: [
        "Chest pain / ACS symptoms before arrest",
        "ST elevation on 12-lead (STEMI)",
        "Known CAD / prior MI / stents",
        "VF/VT as initial rhythm",
        "Risk factors: DM, HTN, smoking, family hx",
        "Elderly with new arrhythmia"
      ],
      protocol: [
        "12-lead ECG as soon as possible (during CPR or post-ROSC)",
        "If STEMI identified:",
        "  - Activate cath lab immediately",
        "  - Aspirin 325 mg (crushed if possible)",
        "  - Heparin 60 u/kg IV bolus (max 4000u)",
        "  - P2Y12 inhibitor: Ticagrelor 180mg or Clopidogrel 600mg",
        "  - Emergent PCI — door-to-balloon < 90 min",
        "If PCI not available within 120 min:",
        "  - Fibrinolysis: tPA / TNKase / Reteplase",
        "  - Door-to-needle < 30 min"
      ],
      keyPoints: [
        "Cardiac arrest + VF = consider coronary angiography even without STEMI",
        "Do NOT delay cath lab activation — call early",
        "PCI can be done during TTM (therapeutic hypothermia)",
        "No STEMI but high suspicion → still consider angiography"
      ],
      labsNeeded: ["12-lead ECG", "Troponin", "CBC", "BMP", "Coagulation", "Type & Screen"]
    }
  ]
};
