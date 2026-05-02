import { Check, X } from 'lucide-react';

export default function PanelWrapper({ title, icon, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div
        className="panel-wrapper w-full max-w-lg h-full max-h-[100dvh] flex flex-col bg-bg-secondary animate-slide-up md:h-auto md:max-h-[85vh] md:m-4"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        {/* Drag handle (mobile bottom-sheet feel) */}
        <div className="md:hidden w-10 h-1 bg-bg-tertiary mx-auto mt-3" style={{ borderRadius: 99 }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-lg shrink-0">{icon}</span>}
            <span className="text-headline text-text-primary truncate">{title}</span>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary shrink-0"
            style={{ borderRadius: 99 }}
            aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Sticky bottom buttons */}
        <div className="shrink-0 border-t border-border bg-bg-secondary p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            {onSave && (
              <button onClick={onSave}
                className="flex-[3] btn btn-primary btn-lg btn-block">
                <Check size={16} strokeWidth={2.4} /> {saveLabel}
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 btn btn-ghost btn-lg btn-block">
              <X size={16} strokeWidth={2.2} /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
