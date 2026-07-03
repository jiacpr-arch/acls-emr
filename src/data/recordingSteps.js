// ==========================================
// ACLS Recording — step machine definition
// (state ids, entry points, branch logic)
// ==========================================

export const STEPS = {
  // BLS SURVEY
  SCENE_SAFETY: 'scene_safety',
  CHECK_RESPONSE: 'check_response',
  CALL_FOR_HELP: 'call_for_help',
  CHECK_PULSE: 'check_pulse',
  // RRT/MET ENTRY
  RRT_ARRIVED: 'rrt_arrived',
  // Pulse present pathways
  PULSE_PRESENT: 'pulse_present',
  PULSE_BRADYCARDIA: 'pulse_bradycardia',
  PULSE_TACHYCARDIA: 'pulse_tachycardia',
  PULSE_NORMAL: 'pulse_normal',
  PULSE_MI: 'pulse_mi',
  PULSE_STROKE: 'pulse_stroke',
  // No pulse → CPR
  START_CPR: 'start_cpr',
  ATTACH_MONITOR: 'attach_monitor',
  INITIAL_RHYTHM: 'initial_rhythm',
  // Primary Survey (ACLS)
  SHOCK_DECISION: 'shock_decision',
  CPR_CYCLE: 'cpr_cycle',
  RHYTHM_CHECK: 'rhythm_check',
  GIVE_DRUG: 'give_drug',
  AIRWAY_MANAGEMENT: 'airway_mgmt',
  SECONDARY_SURVEY: 'secondary_survey',
  // Outcomes
  ROSC: 'rosc',
  TERMINATED: 'terminated',
};

export function getInitialStep(startMode) {
  if (startMode === 'resume') return STEPS.CPR_CYCLE; // resume to dashboard
  if (startMode === 'rrt') return STEPS.RRT_ARRIVED;
  if (startMode === 'arrest') return STEPS.START_CPR;
  if (startMode === 'pulse') return STEPS.PULSE_PRESENT;
  if (startMode === 'stroke') return STEPS.PULSE_STROKE;
  if (startMode === 'mi') return STEPS.PULSE_MI;
  return STEPS.SCENE_SAFETY;
}

export const DIRECT_ENTRY_LABELS = {
  arrest: '❌ Cardiac Arrest — direct entry',
  pulse: '🫀 Pulse assessment — direct entry',
  stroke: '🧠 Suspected Stroke — direct entry',
  mi: '🫀 Suspected ACS/MI — direct entry',
};

// Steps counted as "in cardiac arrest" for the QuickBar.
export const ARREST_STEPS = [
  STEPS.CPR_CYCLE,
  STEPS.SHOCK_DECISION,
  STEPS.RHYTHM_CHECK,
  STEPS.GIVE_DRUG,
  STEPS.AIRWAY_MANAGEMENT,
  STEPS.SECONDARY_SURVEY,
];

// Steps where the TimerBar shows the CPR cycle timer. Broader than
// ARREST_STEPS on purpose: the cycle timer already matters while starting
// CPR / attaching the monitor / reading the initial rhythm.
export const CPR_TIMER_STEPS = [
  STEPS.START_CPR,
  STEPS.ATTACH_MONITOR,
  STEPS.INITIAL_RHYTHM,
  STEPS.SHOCK_DECISION,
  STEPS.CPR_CYCLE,
  STEPS.RHYTHM_CHECK,
  STEPS.GIVE_DRUG,
  STEPS.AIRWAY_MANAGEMENT,
  STEPS.SECONDARY_SURVEY,
];

export function getShockEnergy(rhythm, shockCount) {
  return rhythm?.energyBiphasic
    ? (shockCount === 0 ? rhythm.energyBiphasic.first : rhythm.energyBiphasic.subsequent)
    : 200;
}

// After a rhythm is selected: STEPS.ROSC means "end the case as ROSC",
// anything else is the next wizard step.
export function nextStepAfterRhythm(rhythm, { isRecheck = false } = {}) {
  if (isRecheck && rhythm.id === 'rosc') return STEPS.ROSC;
  return rhythm.shockable ? STEPS.SHOCK_DECISION : STEPS.CPR_CYCLE;
}
