// Shared loading placeholder — same markup as the inline loading cards the
// exam pages used, so swapping them in is visually identical.
export default function LoadingCard({ label = 'กำลังโหลด...', fullPage = false }) {
  const card = (
    <div className="dash-card text-center !p-6 text-text-muted text-caption">{label}</div>
  );
  if (!fullPage) return card;
  return <div className="page-container">{card}</div>;
}
