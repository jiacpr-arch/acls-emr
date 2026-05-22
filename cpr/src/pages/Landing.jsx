import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import StatsRow from '../components/StatsRow';
import Curriculum from '../components/Curriculum';
import WhyUs from '../components/WhyUs';
import CTA from '../components/CTA';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />
      <main>
        <Hero />
        <StatsRow />
        <Curriculum />
        <WhyUs />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
