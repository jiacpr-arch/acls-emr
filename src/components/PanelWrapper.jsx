// Reusable Panel Wrapper — consistent layout for all overlays
// Centered on screen with max-width, header + content + sticky buttons

export default function PanelWrapper({ title, icon, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Panel card — centered, max-width */}
      <div className="w-full max-w-lg h-full max-h-[100dvh] flex flex-col bg-bg-secondary animate-slide-up md:h-auto md:max-h-[85vh] md:rounded-2xl md:shadow-2xl md:m-4">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-bg-tertiary shrink-0">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <span className="font-bold text-text-primary text-base">{title}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Sticky bottom buttons */}
        <div className="shrink-0 border-t border-bg-tertiary bg-bg-secondary p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:rounded-b-2xl">
          <div className="flex gap-3">
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
    </div>
  );
}
