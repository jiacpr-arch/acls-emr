export const reversibleCauses = {
  hs: [
    { name: "Hypovolemia", signs: "Flat neck veins, blood loss/dehydration", treatment: "Volume resuscitation — NS/LR bolus, blood products" },
    { name: "Hypoxia", signs: "Cyanosis, low SpO2, airway issues", treatment: "BVM, intubation, confirm with EtCO2" },
    { name: "Hydrogen ion (Acidosis)", signs: "DKA, renal failure, prolonged arrest", treatment: "NaHCO3 1 mEq/kg IV, treat cause" },
    { name: "Hypo/Hyperkalemia", signs: "ECG changes, renal failure, dialysis", treatment: "Hypo: KCl. Hyper: Ca, Insulin+D50, NaHCO3" },
    { name: "Hypothermia", signs: "Cold exposure, <30°C, Osborn J waves", treatment: "Active rewarming, limit shocks until >30°C" }
  ],
  ts: [
    { name: "Tension Pneumothorax", signs: "Absent breath sounds, tracheal deviation, JVD", treatment: "Needle decompression 2nd ICS → chest tube" },
    { name: "Tamponade (Cardiac)", signs: "Beck's triad: JVD + muffled sounds + hypotension", treatment: "Pericardiocentesis" },
    { name: "Toxins / OD", signs: "Ingestion history, toxidrome", treatment: "Antidotes: Naloxone, NaHCO3, Lipid emulsion" },
    { name: "Thrombosis — PE", signs: "Sudden onset, DVT hx, RV strain", treatment: "Alteplase 50mg IV, prolonged CPR (>60 min)" },
    { name: "Thrombosis — MI", signs: "ST changes, chest pain, cardiac hx", treatment: "PCI or fibrinolysis" }
  ]
};
