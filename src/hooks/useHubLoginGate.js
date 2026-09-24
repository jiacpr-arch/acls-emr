import { useEffect } from 'react';
import { useClassStore } from '../stores/classStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { usePassport } from './usePassport';
import { rpcGetClassExamPolicy } from '../services/cohortSync';

// The teacher's class rule "log in with the JIA account before the exam"
// (supabase-cleanup/class-hub-login.sql). For a learner in such a class the pre-test, post-test and
// certificate wait until the JIA account is logged in AND confirmed for the active student on this
// device (hubSub, StudentIdentityModal) — so the class's grades and certificate carry the
// Hub-verified person and reach the Hub. The rule is re-read whenever online and cached in the class
// context for offline use.
//
// It never locks a class out of its exam: on a deployment without the JIA login (passport not
// configured) or offline (/api/passport/me can't answer) the rule can't be met, so nothing is blocked.
// { blocked, reason: 'loading' | 'login' | 'confirm' | null, passport }
export function useHubLoginGate() {
  const classCode = useClassStore(s => s.classCode);
  const syncDisabled = useClassStore(s => s.syncDisabled);
  const requireHubLogin = useClassStore(s => s.requireHubLogin);
  const setRequireHubLogin = useClassStore(s => s.setRequireHubLogin);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const passport = usePassport();

  useEffect(() => {
    if (!classCode || syncDisabled) return undefined;
    let cancelled = false;
    rpcGetClassExamPolicy(classCode)
      .then(({ data }) => { if (!cancelled && data) setRequireHubLogin(data.requireHubLogin); })
      .catch(() => { /* offline — keep the cached rule */ });
    return () => { cancelled = true; };
  }, [classCode, syncDisabled, setRequireHubLogin]);

  if (!classCode || !requireHubLogin) return { blocked: false, reason: null, passport };
  if (!passport.loaded) return { blocked: true, reason: 'loading', passport };
  if (!passport.configured) return { blocked: false, reason: null, passport };
  if (!passport.loggedIn) return { blocked: true, reason: 'login', passport };
  if (!activeStudent || activeStudent.hubSub !== passport.profile?.sub) return { blocked: true, reason: 'confirm', passport };
  return { blocked: false, reason: null, passport };
}
