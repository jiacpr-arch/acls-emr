// Anonymous per-device visit streak. Stored in localStorage.
//   - increment if last visit was yesterday
//   - keep if already visited today
//   - reset to 1 if gap > 1 day
//   - reset to 1 if never visited

const KEY = 'visit-streak';

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  // a, b are YYYY-MM-DD strings in local time
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: 0, lastVisit: null, best: 0 };
    const parsed = JSON.parse(raw);
    return {
      count: parsed.count || 0,
      lastVisit: parsed.lastVisit || null,
      best: parsed.best || parsed.count || 0,
    };
  } catch {
    return { count: 0, lastVisit: null, best: 0 };
  }
}

// Call once on app load / dashboard mount. Returns updated streak.
export function recordVisitToday() {
  const today = todayLocal();
  const prev = getStreak();

  let next;
  if (!prev.lastVisit) {
    next = { count: 1, lastVisit: today, best: Math.max(1, prev.best) };
  } else if (prev.lastVisit === today) {
    return prev; // already counted today
  } else {
    const gap = daysBetween(prev.lastVisit, today);
    const count = gap === 1 ? prev.count + 1 : 1;
    next = { count, lastVisit: today, best: Math.max(count, prev.best) };
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable; return next anyway
  }
  return next;
}
