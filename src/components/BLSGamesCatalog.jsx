import { Link } from 'react-router-dom';
import { HeartPulse, Brain, Siren, FileText, Hospital, Zap, Trophy, ChevronRight } from 'lucide-react';

const sections = [
  { title: 'เริ่มจากทักษะพื้นฐาน', items: [
    { path: '/skill-practice', Icon: HeartPulse, title: 'ฝึก CPR', desc: 'ฝึกจังหวะกดหน้าอกด้วย Metronome และจับเวลา' },
    { path: '/bls/scenario', Icon: Brain, title: 'เกมลำดับขั้น BLS', desc: 'ฝึกตัดสินใจตามสถานการณ์ทีละขั้น' },
    { path: '/drill', Icon: Zap, title: 'จับเวลาฝึก', desc: 'ตั้งรอบฝึกและติดตามเวลาของทีม' },
  ] },
  { title: 'ฝึกสถานการณ์และการบันทึก', items: [
    { path: '/sim', Icon: Siren, title: 'สถานการณ์จำลอง Code Blue', desc: 'ฝึกการช่วยชีวิตในสถานการณ์จำลอง' },
    { path: '/recorder-game', Icon: FileText, title: 'ขั้นที่ 1 · ฝึกบันทึกเคส', desc: 'ซ้อมเลือกเหตุการณ์และบันทึกด้วยปุ่มจำลอง' },
    { path: '/scenarios', Icon: Hospital, title: 'ขั้นที่ 2 · สอบสนามจริง', desc: 'นำทักษะมาฝึกบนหน้าบันทึกเคสจริง' },
  ] },
  { title: 'ผลการฝึก', items: [
    { path: '/sim-board', Icon: Trophy, title: 'อันดับและผลการฝึก', desc: 'ดูคะแนนจากสถานการณ์จำลองและอันดับในคลาส' },
  ] },
];

export default function BLSGamesCatalog() {
  return sections.map(section => <section key={section.title} className="bls-games-section">
    <h2>{section.title}</h2>
    {section.items.map(({ path, Icon, title, desc }) => <Link key={path} to={path} className="card card-hover bls-game-row">
      <Icon size={25} /><span><strong>{title}</strong><small>{desc}</small></span><ChevronRight size={18} />
    </Link>)}
  </section>);
}
