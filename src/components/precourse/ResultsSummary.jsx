import { Trophy, AlertCircle, Check, X } from 'lucide-react';

export default function ResultsSummary({ attempt, lesson, student }) {
  if (!attempt || !lesson) return null;
  const passed = attempt.passed;

  const wrongAnswers = attempt.answers.filter(a => !a.correct);

  return (
    <div className="space-y-4">
      <div className={`dash-card text-center !p-6 ${
        passed ? 'border-success/40 border-2' : 'border-warning/40 border-2'
      }`}>
        <div className={`w-16 h-16 mx-auto inline-flex items-center justify-center ${
          passed ? 'bg-success' : 'bg-warning'
        } text-white`}
          style={{ borderRadius: 'var(--radius-2xl)' }}>
          {passed ? <Trophy size={28} strokeWidth={2.4} /> : <AlertCircle size={28} strokeWidth={2.4} />}
        </div>
        <div className={`text-numeric text-5xl mt-3 ${passed ? 'text-success' : 'text-warning'}`}>
          {attempt.score}%
        </div>
        <div className="text-caption text-text-muted mt-1">
          {attempt.correctCount} / {attempt.totalQuestions} ข้อถูก · เกณฑ์ผ่าน {lesson.passingScore}%
        </div>
        <div className={`text-headline mt-3 ${passed ? 'text-success' : 'text-warning'}`}>
          {passed ? '✓ ผ่านเกณฑ์ pre-course' : 'ยังไม่ผ่าน — ลองทำใหม่ได้'}
        </div>
        {student && (
          <div className="text-caption text-text-muted mt-2">
            {student.name} · {student.studentId}
          </div>
        )}
      </div>

      {wrongAnswers.length > 0 && (
        <div className="space-y-2">
          <div className="text-overline text-text-muted px-1">ข้อที่ตอบผิด</div>
          {wrongAnswers.map((a) => {
            const q = lesson.quiz.find(qq => qq.id === a.questionId);
            if (!q) return null;
            const chosen = q.choices.find(c => c.id === a.chosenId);
            const correct = q.choices.find(c => c.id === q.correctId);
            return (
              <div key={a.questionId} className="dash-card space-y-2 border-l-4 border-l-danger">
                <div className="text-body-strong text-text-primary">{q.question}</div>
                <div className="text-caption inline-flex items-start gap-2 text-danger">
                  <X size={14} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                  <span>คำตอบของคุณ: {chosen?.text || '-'}</span>
                </div>
                <div className="text-caption inline-flex items-start gap-2 text-success">
                  <Check size={14} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                  <span>คำตอบที่ถูก: {correct?.text || '-'}</span>
                </div>
                {q.explanation && (
                  <div className="text-caption text-text-secondary bg-bg-tertiary/60 p-2 leading-relaxed"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
