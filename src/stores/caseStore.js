import { create } from 'zustand';
import { generateCaseId, saveCase, addEvent as addEventDB } from '../db/database';
import { useTimerStore } from './timerStore';

// Auto-save session state to localStorage
const SESSION_KEY = 'acls_active_session';
function saveSession(state) {
  try {
    const session = {
      currentCase: state.currentCase,
      events: state.events,
      drugTimers: state.drugTimers,
      currentRhythm: state.currentRhythm,
      shockCount: state.shockCount,
      epiCount: state.epiCount,
      amiodaroneCount: state.amiodaroneCount,
      patient: state.patient,
      team: state.team,
      etco2Readings: state.etco2Readings,
      latestEtCO2: state.latestEtCO2,
      airway: state.airway,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) { /* localStorage full or unavailable */ }
}

export function getActiveSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    if (!session.currentCase || session.currentCase.outcome !== 'ongoing') return null;
    return session;
  } catch (e) { return null; }
}

export function clearActiveSession() {
  localStorage.removeItem(SESSION_KEY);
}

export const useCaseStore = create((set, get) => ({
  // Current case
  currentCase: null,
  events: [],
  drugTimers: [],        // active drug countdown timers
  currentRhythm: null,
  shockCount: 0,
  epiCount: 0,
  amiodaroneCount: 0,

  // Patient info
  patient: {
    hn: '', name: '', age: null, weight: null, gender: '',
    chiefComplaint: '', pmh: [], medications: [], allergies: [],
    witnessed: false, bystanderCPR: false, initialRhythm: '',
    location: '', timeFound: null
  },

  // Team
  team: {
    leader: '', airway: '', compressor: [], drugAdmin: '', recorder: '', others: []
  },

  // EtCO2
  etco2Readings: [],
  latestEtCO2: null,

  // CPR cycles
  cprCycles: [],

  // Create new case
  createCase: async (mode = 'clinical') => {
    const id = await generateCaseId();
    const newCase = {
      id,
      mode,
      startTime: new Date(),
      endTime: null,
      outcome: 'ongoing',
      notes: ''
    };
    set({
      currentCase: newCase,
      events: [],
      drugTimers: [],
      currentRhythm: null,
      shockCount: 0,
      epiCount: 0,
      amiodaroneCount: 0,
      etco2Readings: [],
      latestEtCO2: null,
      cprCycles: [],
    });
    await saveCase(newCase);
    return newCase;
  },

  // Update patient info
  setPatient: (patient) => set({ patient }),
  updatePatient: (field, value) => set((s) => ({
    patient: { ...s.patient, [field]: value }
  })),

  // Set team
  setTeam: (team) => set({ team }),

  // Airway details
  airway: { device: null, tubeSize: null, tubeDepth: null, cuffPressure: null, attempts: 0, confirmMethod: null, ventMode: null, placedAt: null },
  updateAirway: (data) => set((s) => ({ airway: { ...s.airway, ...data, placedAt: s.airway.placedAt || useTimerStore.getState().elapsed } })),

  // Add event to timeline
  addEvent: async (event) => {
    const state = get();
    if (!state.currentCase) return;

    const fullEvent = {
      caseId: state.currentCase.id,
      timestamp: new Date(),
      elapsed: event.elapsed || 0,
      category: event.category,
      type: event.type,
      details: event.details || {},
      recordedBy: 'system'
    };

    await addEventDB(fullEvent);
    set((s) => ({ events: [fullEvent, ...s.events] }));
    return fullEvent;
  },

  // Set rhythm
  setRhythm: (rhythm) => {
    set({ currentRhythm: rhythm });
  },

  // Increment counters
  addShock: () => set((s) => ({ shockCount: s.shockCount + 1 })),

  // Drug timer management
  addDrugTimer: (drugId, drugName, intervalSeconds) => {
    const timer = {
      id: `${drugId}_${Date.now()}`,
      drugId,
      drugName,
      startedAt: Date.now(),
      intervalSeconds,
      isActive: true
    };
    set((s) => ({ drugTimers: [...s.drugTimers, timer] }));
  },

  removeDrugTimer: (timerId) => {
    set((s) => ({
      drugTimers: s.drugTimers.filter(t => t.id !== timerId)
    }));
  },

  // EtCO2
  addEtCO2: (value, context = 'during_cpr') => {
    const state = get();
    let alert = null;
    if (context === 'during_cpr') {
      if (value < 10) alert = 'low_quality';
      else if (value > 20) alert = 'possible_rosc';
    } else {
      if (value >= 35 && value <= 45) alert = 'normal';
    }
    const reading = {
      timestamp: new Date(),
      elapsed: state.currentCase ? Math.floor((Date.now() - new Date(state.currentCase.startTime).getTime()) / 1000) : 0,
      value,
      context,
      alert
    };
    set((s) => ({
      etco2Readings: [...s.etco2Readings, reading],
      latestEtCO2: reading
    }));
  },

  // End case
  endCase: async (outcome) => {
    const state = get();
    if (!state.currentCase) return;
    const timer = useTimerStore.getState();
    const updated = {
      ...state.currentCase,
      endTime: new Date(),
      outcome,
      patient: state.patient,
      team: state.team,
      events: state.events,
      cprCycles: state.cprCycles,
      etco2Readings: state.etco2Readings,
      notes: state.currentCase.notes,
      // CPR quality metrics
      ccf: timer.getCCF(),
      totalCPRTime: Math.round(timer.totalCPRTime),
      totalPauseTime: Math.round(timer.totalPauseTime),
      cycleNumber: timer.cycleNumber,
      shockCount: state.shockCount,
      elapsed: Math.round(timer.elapsed),
    };
    await saveCase(updated);
    set({ currentCase: updated });
  },

  // Clear current case
  // Clear current case
  clearCase: () => {
    clearActiveSession();
    set({
      currentCase: null, events: [], drugTimers: [], currentRhythm: null,
      shockCount: 0, epiCount: 0, amiodaroneCount: 0,
      etco2Readings: [], latestEtCO2: null, cprCycles: [],
      patient: { hn: '', name: '', age: null, weight: null, gender: '', chiefComplaint: '', pmh: [], medications: [], allergies: [], witnessed: false, bystanderCPR: false, initialRhythm: '', location: '', timeFound: null },
      team: { leader: '', airway: '', compressor: [], drugAdmin: '', recorder: '', others: [] }
    });
  },

  // Restore session from localStorage
  restoreSession: (session) => {
    set({
      currentCase: session.currentCase,
      events: session.events || [],
      drugTimers: session.drugTimers || [],
      currentRhythm: session.currentRhythm,
      shockCount: session.shockCount || 0,
      epiCount: session.epiCount || 0,
      amiodaroneCount: session.amiodaroneCount || 0,
      patient: session.patient || {},
      team: session.team || {},
      etco2Readings: session.etco2Readings || [],
      latestEtCO2: session.latestEtCO2,
      airway: session.airway || {},
    });
  },
}));

// Auto-save to localStorage on every state change
useCaseStore.subscribe((state) => {
  if (state.currentCase) saveSession(state);
});
