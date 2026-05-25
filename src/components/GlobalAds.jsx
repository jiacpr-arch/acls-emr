import JiacprCourseBanner from './JiacprCourseBanner';
import MorrooAdCard from './MorrooAdCard';

// Rendered once in App.jsx so the course banner + cross-promo card appear at
// the bottom of every page. Carries the floating pill-bar clearance that the
// per-page .page-container bottom padding used to provide.
export default function GlobalAds() {
  return (
    <div
      className="mx-auto px-4 space-y-3"
      style={{
        maxWidth: '32rem',
        paddingTop: 8,
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <JiacprCourseBanner />
      <MorrooAdCard />
    </div>
  );
}
