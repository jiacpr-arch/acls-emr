import { reversibleCauses } from '../data/hs-and-ts';

export default function HsAndTs() {
  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">H's & T's — Reversible Causes</div>

      <div className="grid grid-cols-2 gap-3">
        {/* H's */}
        <div>
          <div className="text-xs font-bold text-info mb-1">H's</div>
          <div className="space-y-1">
            {reversibleCauses.hs.map((cause, i) => (
              <div key={i} className="bg-bg-tertiary/50 rounded-lg p-2">
                <div className="text-xs font-semibold text-text-primary">{cause.name}</div>
                <div className="text-[10px] text-text-muted">{cause.signs}</div>
                <div className="text-[10px] text-info mt-0.5">Tx: {cause.treatment}</div>
              </div>
            ))}
          </div>
        </div>

        {/* T's */}
        <div>
          <div className="text-xs font-bold text-danger mb-1">T's</div>
          <div className="space-y-1">
            {reversibleCauses.ts.map((cause, i) => (
              <div key={i} className="bg-bg-tertiary/50 rounded-lg p-2">
                <div className="text-xs font-semibold text-text-primary">{cause.name}</div>
                <div className="text-[10px] text-text-muted">{cause.signs}</div>
                <div className="text-[10px] text-danger mt-0.5">Tx: {cause.treatment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
