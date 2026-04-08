// Reusable Panel Wrapper — consistent layout for all overlays
// Header + scrollable content + sticky bottom buttons
// Responsive: max-width on desktop

export default function PanelWrapper({ title, icon, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bg-secondary animate-slide-up">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-bold text-text-primary text-base">{title}</span>
        </div>
      </div>

      {/* Scrollable content — max-width on desktop */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {children}
        </div>
      </div>

      {/* Sticky bottom buttons — both same size */}
      <div className="shrink-0 border-t border-bg-tertiary bg-bg-secondary p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex gap-3">
          {onSave && (
            <button onClick={onSave}
              className="flex-[3] btn btn-primary btn-lg btn-block">
              ✅ {saveLabel}
            </button>
          )}
          <button onClick={onClose}
            className={`${onSave ? 'flex-1' : 'flex-1'} btn btn-ghost btn-lg btn-block`}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
