import PremiumPanel from './PremiumPanel';

// ป๊อปอัปขาย Prep Pass — เปิดจากเคสที่ล็อกใน /sim
export default function PremiumModal({ open, onClose, returnTo }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose} role="presentation">
      <div className="w-full max-w-md bg-bg-secondary text-text-primary animate-slide-up p-5 space-y-3 max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Prep Pass">
        <PremiumPanel returnTo={returnTo} />
        <button type="button" onClick={onClose}
          className="block w-full text-center text-caption text-text-muted underline bg-transparent">
          ไว้ทีหลัง
        </button>
      </div>
    </div>
  );
}
