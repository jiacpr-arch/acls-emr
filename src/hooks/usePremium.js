import { useEffect, useSyncExternalStore } from 'react';
import { getPremiumState, subscribePremium, loadPremium, isPassActive } from '../services/premium';

// { loaded, configured, loggedIn, pass, returnFlag, hasPass, locked }
// inCourse = ผู้เรียนที่อยู่ในคลาสของอาจารย์ (ไม่ใช่ลีกออนไลน์) — นักเรียนคอร์สใช้ฟรี
export function usePremium({ inCourse = false } = {}) {
  const state = useSyncExternalStore(subscribePremium, getPremiumState);
  useEffect(() => {
    if (!getPremiumState().loaded) loadPremium();
  }, []);
  const hasPass = isPassActive(state.pass);
  return { ...state, hasPass, locked: state.configured && !inCourse && !hasPass };
}
