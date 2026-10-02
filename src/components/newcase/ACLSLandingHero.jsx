import { Link } from 'react-router-dom';
import { ArrowUpRight, HeartPulse, BookOpen, Play, ClipboardPlus } from 'lucide-react';

export default function ACLSLandingHero({ isClinical, onStart, loading }) {
  return (
    <>
      <header className="acls-home-nav">
        <Link to="/" className="acls-home-brand"><span><HeartPulse size={23} /></span><strong>ACLS<span>by MorRoo · หมอรู้</span></strong></Link>
        <Link to="/guide" className="acls-home-guide">คู่มือ <ArrowUpRight size={16} /></Link>
      </header>
      <section className="acls-home-hero" aria-labelledby="acls-welcome">
        <div className="acls-home-copy">
          <div className="acls-home-eyebrow">ADVANCED CARDIAC LIFE SUPPORT</div>
          <h1 id="acls-welcome">เรียนให้เข้าใจ<br /><em>ฝึกให้พร้อม</em> ช่วยชีวิต</h1>
          <p>ทบทวน ACLS ฝึกสถานการณ์ และบันทึก Code Blue</p>
          <div className="acls-home-meta">โหมด {isClinical ? 'Clinical' : 'Training'}</div>
        </div>
        <figure className="acls-home-visual">
          <img src="/images/acls-training-hero-red.webp" width="1536" height="1024" alt="ห้องจำลองการฝึก ACLS พร้อมหุ่นฝึกและอุปกรณ์" fetchPriority="high" />
          <span className="acls-image-note">ภาพประกอบสร้างด้วย AI</span>
        </figure>
      </section>
      <nav className="acls-home-actions" aria-label="เริ่มใช้งาน ACLS">
        <Link to="/learn" className="acls-home-action is-primary"><BookOpen size={22} /><strong>เรียน ACLS</strong><span>บทเรียนและวิดีโอ</span><ArrowUpRight size={17} /></Link>
        <Link to="/sim" className="acls-home-action"><Play size={22} /><strong>ฝึกสถานการณ์</strong><span>Code Blue Sim</span><ArrowUpRight size={17} /></Link>
        <button onClick={() => onStart('rrt')} disabled={loading} aria-busy={loading} className="acls-home-action"><ClipboardPlus size={22} /><strong>{loading ? 'กำลังเปิดเคส…' : 'บันทึกเคส'}</strong><span>CODE BLUE / CODE 8</span><ArrowUpRight size={17} /></button>
      </nav>
    </>
  );
}
