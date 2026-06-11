// Central analytics fan-out: Meta Pixel (fbq) + PostHog.
// ทุกฟังก์ชันต้องไม่ throw และไม่ block UI — ad blocker/offline ทำให้ปลายทาง
// หายไปได้ตลอดเวลา การ track ล้มเหลวถือเป็นเรื่องปกติ
import { COURSE_MODE } from '../config/courseMode';

// Public (publishable) project key — ฝังในโค้ดได้เหมือน PIXEL_ID ใน MetaPixel.jsx
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
  || 'phc_zYMrFeM7HEGEBUdgeyixzNw24pt5XUom38QAAJfAwgLr';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

const FIRST_TOUCH_KEY = 'jiacpr_attribution_first';
const LAST_TOUCH_KEY = 'jiacpr_attribution_last';
const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

let phPromise = null;

function readStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}

// เก็บ utm_*/fbclid จาก URL ตอนเปิดเว็บ ลง localStorage เพื่อให้ attribution
// รอดข้าม navigation และการเปิดจาก home screen (PWA เปิดมาไม่มี query string)
function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found = {};
    for (const key of ATTRIBUTION_PARAMS) {
      const value = params.get(key);
      if (value) found[key] = value;
    }
    if (!Object.keys(found).length) return;
    const entry = {
      ...found,
      landing_page: window.location.pathname,
      captured_at: new Date().toISOString(),
    };
    if (!readStore(FIRST_TOUCH_KEY)) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(entry));
    }
    localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(entry));
  } catch {
    /* tracking ห้ามพังแอป */
  }
}

function attributionProps() {
  const first = readStore(FIRST_TOUCH_KEY);
  const last = readStore(LAST_TOUCH_KEY) || first;
  if (!last) return {};
  return {
    utm_source: last.utm_source,
    utm_medium: last.utm_medium,
    utm_campaign: last.utm_campaign,
    utm_content: last.utm_content,
    fbclid: last.fbclid,
    landing_page: last.landing_page,
    first_utm_source: first?.utm_source,
    first_utm_campaign: first?.utm_campaign,
  };
}

function baseProps() {
  return { course_mode: COURSE_MODE, ...attributionProps() };
}

// posthog-js โหลดแบบ dynamic import เพื่อไม่ให้ main chunk บวมจนชน
// precache cap ของ workbox (chunk แยกยังถูก precache โดย SW ตาม glob เดิม)
function loadPostHog() {
  if (!POSTHOG_KEY || phPromise) return phPromise;
  phPromise = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // SPA — ยิง $pageview เองใน trackPageview()
        capture_pageleave: true,
        autocapture: false,
        persistence: 'localStorage+cookie',
      });
      return posthog;
    })
    .catch(() => null);
  return phPromise;
}

function ph(callback) {
  phPromise?.then(posthog => {
    try {
      if (posthog) callback(posthog);
    } catch { /* noop */ }
  });
}

// fbq มี internal queue — เรียกได้ทันทีแม้ fbevents.js ยังโหลดไม่เสร็จ
function fb(...args) {
  try {
    window.fbq?.(...args);
  } catch { /* noop */ }
}

// เรียกครั้งเดียวระดับ module ใน main.jsx (รอด StrictMode double-mount)
export function initAnalytics() {
  captureAttribution();
  loadPostHog();
}

// จุดเดียวที่ยิง pageview ทั้งสองฝั่ง — กันยิงซ้ำ
export function trackPageview() {
  fb('track', 'PageView');
  ph(posthog => posthog.capture('$pageview'));
}

/**
 * track('contact_click', {
 *   meta: 'Contact',                // Meta standard event — string หรือ array ['Contact','Lead']
 *   metaCustom: 'PostTestDone',     // Meta custom event (optional)
 *   props: { channel: 'line' },     // ส่งทั้ง PostHog และ Meta
 * })
 */
export function track(name, { meta, metaCustom, props = {} } = {}) {
  const merged = { ...baseProps(), ...props };
  // meta รับได้ทั้ง string เดี่ยวและ array — ยิงได้หลาย standard event เช่น Contact + Lead
  for (const ev of [].concat(meta ?? [])) {
    if (ev) fb('track', ev, merged);
  }
  if (metaCustom) fb('trackCustom', metaCustom, merged);
  ph(posthog => posthog.capture(name, merged));
}

// ใช้ UUID ภายในเครื่องเป็น distinct id — ห้ามส่งเบอร์โทร/ชื่อจริง (PDPA)
export function identifyStudent(localId, props = {}) {
  if (!localId) return;
  ph(posthog => posthog.identify(localId, { course_mode: COURSE_MODE, ...props }));
}
