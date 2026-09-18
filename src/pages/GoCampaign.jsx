import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { resolveCampaign } from '../data/campaigns';
import { captureCampaign, track } from '../services/analytics';

/**
 * ลิงก์สั้น /go/:campaign — เก็บ attribution แล้วเด้งไปหน้าปลายทางทันที
 * ผู้ใช้แทบไม่เห็นหน้านี้ ข้อความข้างล่างเป็นตัวสำรองเผื่อ redirect ไม่ทำงาน
 */
export default function GoCampaign() {
  const { campaign } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const content = searchParams.get('c');
  // ใช้เฉพาะปุ่มสำรองด้านล่าง — ตัว redirect resolve ใหม่ใน effect
  const { target } = resolveCampaign(campaign, content);

  useEffect(() => {
    const { target: to, utm, known } = resolveCampaign(campaign, content);
    // ต้องเขียน attribution ก่อน navigate — pageview ของหน้าปลายทางจะได้แนบ utm ไปด้วย
    captureCampaign(utm, `/go/${campaign}`);
    track('shortlink_open', {
      props: { shortlink: campaign || '', shortlink_known: known, ...utm },
    });
    navigate(to, { replace: true });
  }, [campaign, content, navigate]);

  return (
    <div className="page-container py-16 text-center">
      <p className="text-caption text-text-muted">กำลังพาไปที่หน้าเกม…</p>
      <a href={target} className="text-caption text-info underline">
        ถ้าไม่เด้งภายใน 2 วินาที กดตรงนี้
      </a>
    </div>
  );
}
