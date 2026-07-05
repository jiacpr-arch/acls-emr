import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

// นักเรียนส่วนใหญ่สแกน QR / กดลิงก์เข้าคลาสจากกลุ่ม LINE ซึ่งเปิดหน้าเว็บใน
// in-app browser ของ LINE — IndexedDB ของ WebView นั้นแยกจาก Safari/Chrome
// ทำให้ผลการเรียนไปเก็บผิดที่ (เปิดจากเบราว์เซอร์จริงครั้งหน้าแล้ว "ผลหาย")
// และ LINE ล้าง storage ได้เองโดยไม่เตือน
//
// ทางออก: LINE รองรับพารามิเตอร์ openExternalBrowser=1 — URL ที่มีพารามิเตอร์นี้
// จะถูกเด้งไปเปิดในเบราว์เซอร์หลักของเครื่องอัตโนมัติ คอมโพเนนต์นี้ตรวจ user agent
// แล้ว (1) พยายามเด้งออกอัตโนมัติหนึ่งครั้ง (2) แสดง overlay อธิบาย + ปุ่มเปิดเอง
// สำหรับ Facebook/Instagram/Messenger ไม่มีพารามิเตอร์แบบนี้ จึงแสดงเฉพาะวิธีเปิดเอง
const UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_LINE = / Line\//i.test(UA);
const IS_META_APP = /FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(UA);

const DISMISS_KEY = 'inapp-browser-dismissed';
const AUTO_ESCAPE_KEY = 'inapp-browser-escape-tried';

function externalBrowserUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('openExternalBrowser', '1');
  return url.toString();
}

export default function InAppBrowserGuard() {
  const inApp = IS_LINE || IS_META_APP;
  const [dismissed, setDismissed] = useState(
    () => !inApp || sessionStorage.getItem(DISMISS_KEY) === '1'
  );

  useEffect(() => {
    if (!IS_LINE || dismissed) return;
    if (sessionStorage.getItem(AUTO_ESCAPE_KEY)) return;
    sessionStorage.setItem(AUTO_ESCAPE_KEY, '1');
    window.location.replace(externalBrowserUrl());
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.72)' }}>
      <div className="dash-card w-full max-w-md space-y-4 !p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 inline-flex items-center justify-center bg-warning/15 text-warning shrink-0"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>
          <div className="space-y-1">
            <div className="text-headline text-text-primary">
              กำลังเปิดในหน้าต่างของ {IS_LINE ? 'LINE' : 'Facebook/Instagram'}
            </div>
            <p className="text-caption text-text-secondary leading-relaxed">
              ถ้าเรียนในหน้าต่างนี้ <strong>ผลการเรียนอาจหาย</strong> และอาจารย์อาจไม่เห็นคะแนน
              เพราะข้อมูลไม่ได้เก็บในเบราว์เซอร์หลักของเครื่อง
              กรุณาเปิดใน Safari หรือ Chrome ก่อนเริ่มเรียน
            </p>
          </div>
        </div>

        {IS_LINE ? (
          <a href={externalBrowserUrl()} className="btn btn-primary w-full">
            <ExternalLink size={16} strokeWidth={2.2} /> เปิดในเบราว์เซอร์ (Safari/Chrome)
          </a>
        ) : (
          <div className="text-caption text-text-secondary bg-bg-tertiary px-3.5 py-3"
            style={{ borderRadius: 'var(--radius-md)' }}>
            กดปุ่ม <strong>⋯</strong> มุมขวาบน แล้วเลือก <strong>"เปิดในเบราว์เซอร์"</strong>
            (Open in browser)
          </div>
        )}

        {IS_LINE && (
          <div className="text-2xs text-text-muted text-center">
            ถ้าปุ่มไม่ทำงาน: กดปุ่ม <strong>⋯</strong> มุมขวาล่าง →
            เลือก <strong>"เปิดในเบราว์เซอร์เริ่มต้น"</strong>
          </div>
        )}

        <button
          onClick={() => { sessionStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}
          className="w-full text-center text-2xs text-text-muted underline py-1">
          ใช้งานต่อในหน้าต่างนี้ (ไม่แนะนำ)
        </button>
      </div>
    </div>
  );
}
