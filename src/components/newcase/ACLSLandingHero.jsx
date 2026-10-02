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
        <figure className="acls-home-visual">
          <img src="/images/acls-training-hero-red.webp" width="1536" height="1024" alt="ห้องจำลองการฝึก ACLS พร้อมหุ่นฝึกและอุปกรณ์" fetchPriority="high" />
          <span className="acls-image-note">ภาพประกอบ AI</span>
        </figure>
        <div className="acls-home-copy">
          <div className="acls-home-eyebrow">ACLS LEARNING SPACE</div>
          <h1 id="acls-welcome">เรียนให้เข้าใจ<br /><em>พร้อมช่วยชีวิต</em></h1>
          <p>เรียน · ฝึก · บันทึก Code Blue</p>
          <Link to="/learn" className="acls-home-learn"><BookOpen size={18} /><strong>เริ่มเรียน ACLS</strong><ArrowUpRight size={17} /></Link>
          <div className="acls-home-meta"><span /> {isClinical ? 'Clinical' : 'Training'} mode</div>
        </div>
      </section>
      <nav className="acls-home-actions" aria-label="ฝึกและบันทึก ACLS">
        <Link to="/sim" className="acls-home-action"><span className="acls-action-icon"><Play size={19} /></span><span className="acls-action-copy"><strong>ฝึกสถานการณ์</strong><small>Code Blue Sim</small></span><ArrowUpRight size={16} /></Link>
        <button onClick={() => onStart('rrt')} disabled={loading} aria-busy={loading} className="acls-home-action"><span className="acls-action-icon"><ClipboardPlus size={19} /></span><span className="acls-action-copy"><strong>{loading ? 'กำลังเปิดเคส…' : 'บันทึกเคส'}</strong><small>CODE BLUE / CODE 8</small></span><ArrowUpRight size={16} /></button>
      </nav>
    </>
  );
}
