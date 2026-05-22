import { Check, X } from 'lucide-react';

export default function QuizQuestion({ question, chosenId, onChoose, locked, showCorrect }) {
  return (
    <div className="space-y-3">
      <div className="text-headline text-text-primary leading-snug">{question.question}</div>
      <div className="space-y-2">
        {question.choices.map((c) => {
          const selected = chosenId === c.id;
          const isCorrect = showCorrect && c.id === question.correctId;
          const isWrong = showCorrect && selected && c.id !== question.correctId;
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => onChoose(c.id)}
              className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors border ${
                isCorrect ? 'border-success bg-success/10'
                  : isWrong ? 'border-danger bg-danger/10'
                  : selected ? 'border-info bg-info/8'
                  : 'border-border bg-bg-secondary hover:bg-bg-tertiary'
              } disabled:cursor-default`}
              style={{ borderRadius: 'var(--radius-md)' }}>
              <span className={`w-7 h-7 inline-flex items-center justify-center text-caption font-bold shrink-0 ${
                isCorrect ? 'bg-success text-white'
                  : isWrong ? 'bg-danger text-white'
                  : selected ? 'bg-info text-white'
                  : 'bg-bg-tertiary text-text-secondary'
              }`} style={{ borderRadius: 'var(--radius-full)' }}>
                {isCorrect ? <Check size={14} strokeWidth={2.6} />
                  : isWrong ? <X size={14} strokeWidth={2.6} />
                  : c.id.toUpperCase()}
              </span>
              <span className="text-body text-text-primary leading-relaxed flex-1">{c.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
