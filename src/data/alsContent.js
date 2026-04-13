export const alsChapters = [
  {
    id: 'ch1', title: 'บทที่ 1: ภาพรวม ALS',
    icon: '📚',
    sections: [
      { heading: 'ALS คืออะไร', body: 'Advanced Life Support (ALS) คือระบบการช่วยชีวิตขั้นสูง ครอบคลุมการจัดการทางเดินหายใจ, การให้ยา, การอ่านจังหวะหัวใจ และการ defibrillation โดยทีมแพทย์และพยาบาลที่ผ่านการฝึกอบรม' },
      { heading: 'Chain of Survival', body: 'ห่วงโซ่แห่งการรอดชีวิต: 1) รู้เร็ว-โทรเร็ว 2) CPR เร็ว 3) Defibrillation เร็ว 4) ALS เร็ว 5) ดูแลหลังกู้ชีพ — ทุกห่วงสำคัญเท่ากัน ขาดห่วงใดผลลัพธ์จะแย่ลงอย่างมาก' },
      { heading: 'ทีม ALS', body: 'ประกอบด้วย: Team Leader (สั่งการ), Airway (ดูแลทางหายใจ), Compressor (กดหน้าอก), Drug Admin (ให้ยา), Recorder (จดบันทึก) — การสื่อสารแบบ closed-loop สำคัญมาก' },
    ],
  },
  {
    id: 'ch2', title: 'บทที่ 2: การประเมินผู้ป่วยฉุกเฉิน',
    icon: '🔍',
    sections: [
      { heading: 'Primary Survey (ABCDE)', body: 'A-Airway: ทางเดินหายใจเปิดโล่ง? B-Breathing: หายใจได้ดี? C-Circulation: ชีพจร/ความดัน? D-Disability: ระดับความรู้สึกตัว (AVPU/GCS)? E-Exposure: ตรวจทั้งตัว หาสาเหตุ' },
      { heading: 'Secondary Survey', body: 'ซักประวัติ SAMPLE: S-Signs/Symptoms, A-Allergies, M-Medications, P-Past history, L-Last meal, E-Events — พร้อมตรวจร่างกายอย่างละเอียด head-to-toe' },
      { heading: 'Pulse Check', body: 'คลำชีพจร carotid (ผู้ใหญ่) หรือ brachial (ทารก) ไม่เกิน 10 วินาที ถ้าไม่แน่ใจว่ามีชีพจร ให้เริ่ม CPR ทันที' },
    ],
  },
  {
    id: 'ch3', title: 'บทที่ 3: ทางเดินหายใจ',
    icon: '🫁',
    sections: [
      { heading: 'Basic Airway', body: 'Head tilt-Chin lift (ห้ามใช้ถ้าสงสัย C-spine injury), Jaw thrust, OPA (Oropharyngeal airway), NPA (Nasopharyngeal airway) — BVM ต้องจับให้แนบ ใช้เทคนิค EC-clamp' },
      { heading: 'Advanced Airway', body: 'ETT (Endotracheal tube): gold standard แต่ต้องชำนาญ, LMA/i-gel: ใส่ง่ายกว่า เหมาะกับ non-expert — หลังใส่ต้องยืนยันตำแหน่งด้วย EtCO2 waveform capnography' },
      { heading: 'การช่วยหายใจขณะ CPR', body: 'ไม่มี advanced airway: 30:2 (กด 30 ครั้ง หายใจ 2 ครั้ง) / มี advanced airway: กดต่อเนื่อง 100-120/min + หายใจ 1 ครั้งทุก 6 วินาที (10/min)' },
    ],
  },
  {
    id: 'ch4', title: 'บทที่ 4: จังหวะหัวใจ',
    icon: '💓',
    sections: [
      { heading: 'Shockable Rhythms', body: 'VF (Ventricular Fibrillation): เส้นหยักไม่เป็นระเบียบ — pVT (Pulseless VT): QRS กว้าง เร็ว ไม่มีชีพจร — ทั้งสองต้อง Defibrillate ทันที 120-200J biphasic' },
      { heading: 'Non-Shockable Rhythms', body: 'PEA (Pulseless Electrical Activity): มี rhythm บนจอแต่คลำชีพจรไม่ได้ — Asystole: เส้นตรง — ทั้งสองห้าม shock ให้ CPR + Epinephrine ทันที + หาสาเหตุ H&T' },
      { heading: 'Bradycardia & Tachycardia', body: 'Bradycardia <60/min + อาการ → Atropine → TCP / Tachycardia แยก narrow vs wide QRS, stable vs unstable → unstable = cardioversion ทันที' },
    ],
  },
  {
    id: 'ch5', title: 'บทที่ 5: การกู้ชีพ',
    icon: '⚡',
    sections: [
      { heading: 'CPR คุณภาพสูง', body: 'กดลึก 5-6 cm, เร็ว 100-120/min, ปล่อยให้หน้าอกคืนตัวเต็มที่, หยุดน้อยที่สุด (CCF >80%), สลับคนกดทุก 2 นาที' },
      { heading: 'Defibrillation', body: 'ชนิด biphasic: 120-200J (ตามผู้ผลิต), monophasic: 360J — วาง paddle: Anterior-Lateral (ขวาไหปลาร้า, ซ้ายรักแร้) — Shock แล้ว CPR ต่อทันที 2 นาที ไม่ต้องเช็ค rhythm' },
      { heading: 'วงรอบ ALS', body: 'CPR 2 min → Check Rhythm → Shockable? Shock แล้ว CPR ต่อ / Non-shockable? CPR ต่อ → Epi ทุก 3-5 min → Amiodarone หลัง shock ครั้งที่ 3 → หา H&T ตลอด' },
    ],
  },
  {
    id: 'ch6', title: 'บทที่ 6: ยาฉุกเฉิน',
    icon: '💉',
    sections: [
      { heading: 'Epinephrine (Adrenaline)', body: 'Cardiac arrest: 1 mg IV/IO ทุก 3-5 min — Bradycardia: 2-10 mcg/min drip — Anaphylaxis: 0.3-0.5 mg IM — เป็นยาหลักที่ต้องให้เร็วที่สุดใน non-shockable rhythm' },
      { heading: 'Amiodarone', body: 'VF/pVT ที่ดื้อต่อ shock: ครั้งแรก 300 mg IV bolus, ครั้งที่สอง 150 mg — ผสม D5W — ระวัง hypotension' },
      { heading: 'ยาอื่นที่สำคัญ', body: 'Atropine 1mg IV (bradycardia, max 3mg) / Adenosine 6-12-12mg rapid push (SVT) / Magnesium 1-2g IV (Torsades) / NaHCO3 1mEq/kg (hyperkalemia, TCA overdose)' },
    ],
  },
  {
    id: 'ch7', title: 'บทที่ 7: สถานการณ์พิเศษ',
    icon: '🚨',
    sections: [
      { heading: 'Drowning (จมน้ำ)', body: 'ให้ rescue breaths เร็ว เพราะสาเหตุคือ hypoxia — ถ้าสงสัย C-spine injury ให้ระวัง — อาจต้อง suction น้ำ — hypothermia ร่วมด้วยบ่อย' },
      { heading: 'Anaphylaxis', body: 'Epinephrine 0.3-0.5mg IM ต้นขาด้านข้าง ทันที ซ้ำได้ทุก 5-15 min — IV fluid bolus — Antihistamine + Steroid เสริม — เตรียม intubation ถ้าบวมทางหายใจ' },
      { heading: 'Pregnancy', body: 'ดันมดลูกไปทางซ้าย (left uterine displacement) ตลอดเวลา CPR — C-section ภายใน 5 นาทีถ้า CPR ไม่ตอบสนอง (Perimortem cesarean delivery)' },
    ],
  },
  {
    id: 'ch8', title: 'บทที่ 8: การดูแลหลังกู้ชีพ',
    icon: '🌡️',
    sections: [
      { heading: 'Post-ROSC Targets', body: 'SpO2 92-98% (ไม่ให้ O2 มากเกิน), MAP ≥65 mmHg, EtCO2 35-45, Glucose 140-180 mg/dL, Temperature 32-36°C (TTM) อย่างน้อย 24 ชม.' },
      { heading: 'Targeted Temperature Management', body: 'เป้าหมาย 32-36°C ต่อเนื่อง 24 ชม. ป้องกันสมองบวม — ใช้ cooling blanket / IV cold saline — ให้ยา sedation ระหว่างทำ — rewarming ช้าๆ 0.25-0.5°C/hr' },
      { heading: 'Neuroprognostication', body: 'ประเมินสมองหลัง 72 ชม. ขึ้นไป — ใช้หลายวิธีร่วมกัน: clinical exam, EEG, CT/MRI, NSE, SSEP — อย่าตัดสินเร็วเกินไป' },
    ],
  },
];
