import { Link } from 'react-router-dom';
import { HeartPulse, ArrowRight, BookOpen, Check, Award } from 'lucide-react';

export default function BLSLandingHero({ isClinical, learnPath }) {
  const next = learnPath.next;
  const complete = !next && learnPath.activeStudent && learnPath.total > 0;
  const destination = next?.path || (complete ? '/certification' : '/learn');
  return (
    <>
      <header className="bls-nav">
        <Link to="/" className="bls-brand"><span><HeartPulse size={25} /></span><strong>BLS<span>Jia Training Center</span></strong></Link>
        <nav aria-label="เมนูหลัก BLS">
          <Link to="/learn">บทเรียน</Link><Link to="/skill-practice">ฝึก CPR</Link><Link to="/sim">ฝึกสถานการณ์</Link><Link to="/guide">คู่มือ</Link>
        </nav>
      </header>
      <section className="bls-hero" aria-labelledby="bls-welcome">
        <div className="bls-hero-copy">
          <p className="bls-eyebrow"><span /> BASIC LIFE SUPPORT · สำหรับบุคลากรทางการแพทย์</p>
          <h1 id="bls-welcome">เรียนรู้การช่วยชีวิต<br /><em>ฝึกให้มั่นใจ</em><br />พร้อมลงมือจริง</h1>
          <p className="bls-intro">ทบทวนการช่วยชีวิตขั้นพื้นฐาน ตั้งแต่ CPR และการใช้ AED ไปจนถึงการทำงานเป็นทีม ผ่านบทเรียนและสถานการณ์จำลอง</p>
          <div className="bls-hero-buttons">
            <Link to={destination} className="bls-primary"><BookOpen size={19} />{next ? 'เรียนต่อจากครั้งล่าสุด' : complete ? 'ดูใบประกาศนียบัตร' : 'เริ่มเรียน BLS'}<ArrowRight size={18} /></Link>
            <Link to="/sim" className="bls-text-link">ลองฝึกสถานการณ์ <ArrowRight size={17} /></Link>
          </div>
          <div className="bls-reassurance"><span><Check size={16} /> เรียนตามเวลาที่สะดวก</span><span><Check size={16} /> {isClinical ? 'โหมดบันทึก Clinical' : 'โหมดฝึก Training'}</span></div>
        </div>
        <figure className="bls-hero-visual">
          <img src="/images/bls-training-illustration.jpg" width="1536" height="1024" alt="ภาพประกอบทีมบุคลากรทางการแพทย์ฝึกช่วยชีวิตร่วมกัน" fetchPriority="high" />
          <figcaption><span><BookOpen size={23} /></span><div><strong>เรียนให้เข้าใจ แล้วฝึกให้เป็น</strong><small>ทักษะเล็ก ๆ ที่สร้างโอกาสให้ชีวิต</small></div></figcaption>
        </figure>
      </section>
      <div className="bls-facts" aria-label="รายละเอียดการเรียน BLS">
        <div><strong>CPR</strong><span>การกดหน้าอกและช่วยหายใจ</span></div>
        <div><strong>AED</strong><span>ฝึกใช้เครื่องอย่างมั่นใจ</span></div>
        <div><strong>5</strong><span>ขั้นสู่ใบประกาศนียบัตร</span></div>
        <div><Award size={27} /><span>เรียนและสอบผ่าน<br /><b>รับใบประกาศภาคทฤษฎี</b></span></div>
      </div>
    </>
  );
}
