import { Check, X } from 'lucide-react';

export default function QuizQuestion({ question, chosenId, onChoose, locked, showCorrect }) {
  return (
    <div className="space-y-4">
      <div
        className="text-text-primary leading-snug font-bold"
        style={{ fontSize: '18px', lineHeight: 1.4 }}
      >
        {question.question}
      </div>
      <div className="flex flex-col gap-3">
        {question.choices.map((c) => {
          const selected = chosenId === c.id;
          const isCorrect = showCorrect && c.id === question.correctId;
          const isWrong = showCorrect && selected && c.id !== question.correctId;
          const stateClasses = isCorrect
            ? 'border-success bg-success/10'
            : isWrong
              ? 'border-danger bg-danger/10'
              : selected
                ? 'border-info bg-info/10'
                : 'border-border-strong bg-bg-secondary hover:bg-bg-tertiary active:bg-bg-tertiary';
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => onChoose(c.id)}
              className={`w-full flex items-center gap-3 text-left transition-colors disabled:cursor-default ${stateClasses}`}
              style={{
                borderRadius: 'var(--radius-md)',
                borderWidth: '2px',
                borderStyle: 'solid',
                padding: '16px 16px',
                minHeight: '64px',
                boxShadow: selected || isCorrect || isWrong
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
                  width: '36px',
                  height: '36px',
                  fontSize: '15px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {isCorrect ? <Check size={18} strokeWidth={2.6} />
                  : isWrong ? <X size={18} strokeWidth={2.6} />
                  : c.id.toUpperCase()}
              </span>
              <span
                className="text-text-primary flex-1"
                style={{ fontSize: '16px', lineHeight: 1.5, fontWeight: 500 }}
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
