// Shared pre-test/post-test set helpers — extracted from
// src/courses/bls-hcp/preTest/index.js and postTest/index.js so the airway /
// defib / iv skill courses share the same "pick a random set, don't repeat
// the last one on retake" behavior instead of re-implementing it per course.

export function pickRandomSet(sets, excludeId = null) {
  const pool = excludeId
    ? sets.filter(s => s.id !== excludeId)
    : sets;
  const choices = pool.length ? pool : sets;
  return choices[Math.floor(Math.random() * choices.length)];
}

export function getSetById(sets, setId) {
  return sets.find(s => s.id === setId) || null;
}
