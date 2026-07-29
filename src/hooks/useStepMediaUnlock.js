import { useState } from 'react';
import { getOpenedMap, markVideoOpened } from '../utils/mediaUnlock';

// ปลดล็อกกล่องวิดีโอทีละขั้น — ขั้น i ปลดล็อกเมื่อทุกขั้นก่อนหน้าที่มีวิดีโอถูกเปิดดูแล้ว
// steps: [{ key: string|number, hasVideo: boolean }]
export function useStepMediaUnlock(pageKey, steps) {
  const [opened, setOpened] = useState(() => getOpenedMap(pageKey));

  const isUnlocked = (index) =>
    steps.slice(0, index).every(s => !s.hasVideo || opened[s.key]);

  const markOpened = (stepKey) => {
    markVideoOpened(pageKey, stepKey);
    setOpened(m => ({ ...m, [stepKey]: true }));
  };

  return { isUnlocked, markOpened, opened };
}
