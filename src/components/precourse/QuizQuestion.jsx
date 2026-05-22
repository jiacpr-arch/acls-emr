import { Check, X } from 'lucide-react';

export default function QuizQuestion({ question, chosenId, onChoose, locked, showCorrect }) {
  return (
    <div className="space-y-2.5">
      <div
        className="text-text-primary leading-snug font-bold"
        style={{ fontSize: '15px', lineHeight: 1.4 }}
      >
        {question.question}
      </div>
      <div className="flex flex-col gap-1.5">
        {question.choices.map((c) => {
          const selected = chosenId === c.id;
          const isCorrect = showCorrect && c.id === question.correctId;
          const isWrong = showCorrect && selected && c.id !== question.correctId;
          const stateClasses = isCorrect
            ? 'border-success bg-success/15'
            : isWrong
              ? 'border-danger bg-danger/15'
              : selected
                ? 'border-info bg-info/25'
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
                borderWidth: emphasized ? '2.5px' : '2px',
                borderStyle: 'solid',
                padding: '6px 10px',
                minHeight: '38px',
                boxShadow: emphasized
                  ? 'var(--shadow-2)'
                  : 'none',
              }}>
              <span
                className={`inline-flex items-center justify-center font-bold shrink-0 ${
                  isCorrect ? 'bg-success text-white'
                    : isWrong ? 'bg-danger text-white'
                    : selected ? 'bg-info text-white'
                    : 'bg-bg-tertiary text-text-secondary'
                }`}
                style={{
                  width: '24px',
                  height: '24px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {isCorrect ? <Check size={13} strokeWidth={2.6} />
                  : isWrong ? <X size={13} strokeWidth={2.6} />
                  : c.id.toUpperCase()}
              </span>
              <span
                className="text-text-primary flex-1 text-left"
                style={{ fontSize: '14px', lineHeight: 1.35, fontWeight: 500 }}
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
