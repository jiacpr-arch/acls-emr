// Reusable Panel Wrapper — consistent layout for all overlays
// Header + scrollable content + sticky bottom buttons
// Responsive: max-width on desktop

export default function PanelWrapper({ title, icon, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bg-secondary animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-bold text-text-primary text-base">{title}</span>
        </div>
      </div>

      {/* Scrollable content — max-width on desktop */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto p-4">
          {children}
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="shrink-0 border-t border-bg-tertiary bg-bg-secondary p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex gap-2">
          {onSave && (
            <button onClick={onSave}
              className="flex-1 btn-action btn-info py-3.5 text-sm font-bold" style={{ minHeight: '52px' }}>
              ✅ {saveLabel}
            </button>
          )}
          <button onClick={onClose}
            className={`${onSave ? 'w-20' : 'flex-1'} btn-action btn-ghost py-3.5 text-sm font-bold`}
            style={{ minHeight: '52px' }}>
            ✕ {onSave ? '' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
