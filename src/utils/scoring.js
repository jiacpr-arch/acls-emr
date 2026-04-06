// ACLS Performance Scoring — Training Mode Only

export function calculateScore(events, timerData) {
  const scores = {};

  // 1. Time to first shock (shockable rhythms only)
  const firstShock = events.find(e => e.category === 'shock');
  if (firstShock) {
    const t = firstShock.elapsed || 0;
    scores.timeToFirstShock = {
      value: t,
      label: `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`,
      rating: t <= 120 ? 'good' : t <= 180 ? 'fair' : 'poor',
      target: '< 2 min',
    };
  }

  // 2. Epi timing compliance
  const epiEvents = events
    .filter(e => e.category === 'drug' && e.type?.includes('Epinephrine'))
    .sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));

  if (epiEvents.length >= 2) {
    const intervals = [];
    for (let i = 1; i < epiEvents.length; i++) {
      intervals.push((epiEvents[i].elapsed || 0) - (epiEvents[i - 1].elapsed || 0));
    }
    const compliant = intervals.filter(iv => iv >= 180 && iv <= 300).length;
    const pct = Math.round((compliant / intervals.length) * 100);
    scores.epiCompliance = {
      value: pct,
      label: `${pct}% (${compliant}/${intervals.length})`,
      rating: pct >= 80 ? 'good' : pct >= 50 ? 'fair' : 'poor',
      target: 'q3-5 min (180-300s)',
      intervals: intervals.map(iv => Math.round(iv)),
    };
  } else if (epiEvents.length === 1) {
    scores.epiCompliance = {
      value: 100,
      label: '1 dose given',
      rating: 'good',
      target: 'q3-5 min',
    };
  }

  // 3. CCF%
  const ccf = timerData.ccf || 0;
  scores.ccf = {
    value: ccf,
    label: `${ccf}%`,
    rating: ccf >= 80 ? 'good' : ccf >= 60 ? 'fair' : 'poor',
    target: '≥ 60%',
  };

  // 4. Total hands-off time
  const totalPause = Math.round(timerData.totalPauseTime || 0);
  const totalElapsed = Math.round(timerData.elapsed || 1);
  const pausePct = Math.round((totalPause / totalElapsed) * 100);
  scores.handsOffTime = {
    value: totalPause,
    label: `${Math.floor(totalPause / 60)}:${String(totalPause % 60).padStart(2, '0')} (${pausePct}%)`,
    rating: pausePct <= 20 ? 'good' : pausePct <= 40 ? 'fair' : 'poor',
    target: '< 20% of total time',
  };

  // 5. Overall grade
  const ratingPoints = { good: 3, fair: 2, poor: 1 };
  const allRatings = Object.values(scores).map(s => ratingPoints[s.rating] || 2);
  const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
  scores.grade = avg >= 2.7 ? 'A' : avg >= 2.3 ? 'B' : avg >= 1.7 ? 'C' : avg >= 1.3 ? 'D' : 'F';

  return scores;
}
