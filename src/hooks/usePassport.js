import { useEffect, useSyncExternalStore } from 'react';
import { getPassportState, subscribePassport, loadPassport } from '../services/passport';

// { loaded, configured, loggedIn, profile: { sub, nameTh, nameEn, cardNo, verifyLevel } | null, returnFlag }
export function usePassport() {
  const state = useSyncExternalStore(subscribePassport, getPassportState);
  useEffect(() => {
    if (!getPassportState().loaded) loadPassport();
  }, []);
  return state;
}
