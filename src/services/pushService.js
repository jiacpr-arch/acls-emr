import { VAPID_PUBLIC_KEY } from '../config/push';
import { IS_BLS } from '../config/courseMode';

const COURSE = IS_BLS ? 'bls' : 'acls';

export function isPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export function getPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Convert URL-safe base64 to Uint8Array (required by PushManager.subscribe)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getRegistration() {
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) return reg;
  return navigator.serviceWorker.ready;
}

export async function subscribePush() {
  if (!isPushSupported()) throw new Error('Push not supported');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }

  const reg = await getRegistration();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Send to backend
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: sub.toJSON(),
      course: COURSE,
      userAgent: navigator.userAgent.slice(0, 200),
    }),
  });

  if (!res.ok) {
    throw new Error('Backend subscribe failed: ' + res.status);
  }

  return sub;
}

export async function unsubscribePush() {
  const reg = await getRegistration();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => { /* best effort */ });

  await sub.unsubscribe();
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null;
  const reg = await getRegistration();
  return reg.pushManager.getSubscription();
}
