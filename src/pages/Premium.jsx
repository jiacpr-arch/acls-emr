import PageHero from '../components/PageHero';
import PremiumPanel from '../components/PremiumPanel';

// หน้าขาย Prep Pass แบบเต็มหน้า — ใช้เป็นลิงก์ในโฆษณา/LINE (/premium)
export default function Premium() {
  return (
    <div className="page-container flex flex-col gap-4">
      <PageHero eyebrow="Code Blue Sim" title="Prep Pass" desc="ปลดล็อกเคสระดับปานกลางและ Megacode ทุกเคส" />
      <div className="card p-5">
        <PremiumPanel returnTo="/premium" />
      </div>
    </div>
  );
}
