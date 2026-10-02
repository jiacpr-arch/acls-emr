import { Link } from 'react-router-dom';
import { ArrowUpRight, HeartPulse, BookOpen, Play } from 'lucide-react';

export default function ACLSLandingHero({ isClinical, learnPath, onStart, loading }) {
  const learningTarget = learnPath.next?.path || (learnPath.activeStudent && learnPath.total > 0 ? '/certification' : '/learn');
  return (
    <>
      <header className="acls-home-nav">
        <Link to="/" className="acls-home-brand"><span><HeartPulse size={23} /></span><strong>ACLS<span>by MorRoo · หมอรู้</span></strong></Link>
        <Link to="/guide" className="acls-home-guide">คู่มือการใช้งาน <ArrowUpRight size={16} /></Link>
      </header>
      <button className="acls-home-record-shortcut" onClick={() => onStart('rrt')} disabled={loading}><HeartPulse size={17} /><span>CODE BLUE / CODE 8 · เริ่มบันทึกทันที</span><ArrowUpRight size={17} /></button>
      <section className="acls-home-hero" aria-labelledby="acls-welcome">
        <div className="acls-home-copy">
          <div className="acls-home-eyebrow"><span /> ADVANCED CARDIAC LIFE SUPPORT</div>
          <h1 id="acls-welcome">เรียนรู้ให้เข้าใจ<br /><em>ฝึกให้พร้อม</em> ช่วยชีวิต</h1>
          <p>พื้นที่เรียนรู้ ACLS สำหรับบุคลากรทางการแพทย์<br className="acls-desktop-break" /> ทบทวนบทเรียน ฝึกสถานการณ์ และบันทึก Code Blue<br className="acls-desktop-break" /> ในที่เดียว</p>
          <div className="acls-home-ctas">
            <Link to={learningTarget} className="acls-home-primary"><BookOpen size={19} />{learnPath.next ? 'เรียนต่อจากครั้งล่าสุด' : learnPath.activeStudent && learnPath.total > 0 ? 'ดูใบประกาศนียบัตร' : 'เริ่มเรียน ACLS'}<ArrowUpRight size={18} /></Link>
            <Link to="/sim" className="acls-home-secondary"><Play size={17} /> ฝึก Code Blue Sim</Link>
          </div>
          <div className="acls-home-meta"><span>ACLS EMR</span><span className={isClinical ? 'acls-mode-clinical' : ''}>โหมด {isClinical ? 'Clinical' : 'Training'}</span></div>
        </div>
        <figure className="acls-home-visual">
          <img src="/images/acls-training-hero.webp" width="1536" height="1024" alt="ภาพประกอบห้องจำลองการฝึก ACLS พร้อมหุ่นฝึกและอุปกรณ์" fetchPriority="high" />
          <figcaption><span><HeartPulse size={19} /></span><div><strong>จากความรู้ สู่การฝึกสถานการณ์</strong><small>เรียน · ทบทวน · ฝึกตัดสินใจ</small></div></figcaption>
          <span className="acls-image-note">ภาพประกอบสร้างด้วย AI</span>
        </figure>
      </section>
      <div className="acls-home-section-heading"><div><span>YOUR LEARNING SPACE</span><h2>พร้อมเรียน พร้อมฝึก</h2></div><p>เลือกสิ่งที่ต้องการทำได้เลย</p></div>
    </>
  );
}
