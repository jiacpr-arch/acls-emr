import { Check, X } from 'lucide-react';

export default function QuizQuestion({ question, chosenId, onChoose, locked, showCorrect }) {
  return (
    <div className="space-y-3">
      <div
        className="text-text-primary leading-snug font-bold"
        style={{ fontSize: '16px', lineHeight: 1.4 }}
      >
        {question.question}
      </div>
      <div className="flex flex-col gap-2">
        {question.choices.map((c) => {
          const selected = chosenId === c.id;
          const isCorrect = showCorrect && c.id === question.correctId;
          const isWrong = showCorrect && selected && c.id !== question.correctId;
          const stateClasses = isCorrect
            ? 'border-success bg-success/15'
            : isWrong
              ? 'border-danger bg-danger/15'
              : selected
                ? 'border-info bg-info/20'
                : 'border-border-strong bg-bg-secondary hover:bg-bg-tertiary active:bg-bg-tertiary';
          const emphasized = selected || isCorrect || isWrong;
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => onChoose(c.id)}
              className={`w-full flex items-center gap-2.5 text-left transition-colors disabled:cursor-default ${stateClasses}`}
              style={{
                borderRadius: 'var(--radius-md)',
                borderWidth: emphasized ? '3px' : '1.5px',
                borderStyle: 'solid',
                padding: emphasized ? '9px 11px' : '10px 12px',
                minHeight: '46px',
                boxShadow: emphasized
                  ? 'var(--shadow-2)'
                  : 'var(--shadow-1)',
              }}>
              <span
                className={`inline-flex items-center justify-center font-bold shrink-0 ${
                  isCorrect ? 'bg-success text-white'
                    : isWrong ? 'bg-danger text-white'
                    : selected ? 'bg-info text-white'
                    : 'bg-bg-tertiary text-text-secondary'
                }`}
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {isCorrect ? <Check size={15} strokeWidth={2.6} />
                  : isWrong ? <X size={15} strokeWidth={2.6} />
                  : c.id.toUpperCase()}
              </span>
              <span
                className="text-text-primary flex-1"
                style={{ fontSize: '14px', lineHeight: 1.4, fontWeight: 500 }}
              >
                {c.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
