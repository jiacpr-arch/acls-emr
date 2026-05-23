import { useEffect, useState } from 'react';
import { MessageCircleQuestion, Send, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { submitStudentQuestion } from '../services/studentQuestionService';

const STAGES = [
  'กำลังบันทึกคำถาม…',
  'กำลังให้ DeepSeek ตอบคำถามเชิงลึก…',
  'กำลังจัดหมวดและสร้างรูปประกอบ…',
  'เกือบเสร็จแล้ว…',
];

export default function StudentQuestionForm({ onClose }) {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stageIdx, setStageIdx] = useState(0);

  // Cycle through friendly progress messages while waiting (~30s)
  useEffect(() => {
    if (!submitting) return;
    setStageIdx(0);
    const id = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, STAGES.length - 1));
    }, 7000);
    return () => clearInterval(id);
  }, [submitting]);

  const canSubmit = question.trim().length >= 5 && !submitting;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const data = await submitStudentQuestion({
        question,
        studentName: name,
      });
      setResult(data);
    } catch (err) {
      setError(err?.message || 'ส่งคำถามไม่สำเร็จ');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-2 sm:p-4">
      <div
        className="w-full sm:max-w-lg bg-bg-primary border border-border overflow-hidden"
        style={{ borderRadius: 'var(--radius-2xl)' }}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-bg-secondary">
          <div className="inline-flex items-center gap-2">
            <div
              className="w-8 h-8 inline-flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <MessageCircleQuestion size={16} strokeWidth={2.2} className="text-white" />
            </div>
            <div>
              <div className="text-body-strong text-text-primary leading-tight">ถามคำถาม ACLS</div>
              <div className="text-[11px] text-text-muted">AI จะร่างคำตอบเชิงลึก รออาจารย์ตรวจก่อนเผยแพร่</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="ปิด"
            disabled={submitting}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {result ? (
            <ResultPanel result={result} onClose={onClose} onReset={() => {
              setResult(null);
              setQuestion('');
              setName('');
            }} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="text-caption font-bold text-text-secondary mb-1 block">
                  คำถามของคุณ <span className="text-danger">*</span>
                </span>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="เช่น  Epinephrine ให้ทุกกี่นาทีใน asystole และเพราะอะไรจึงให้ทุก 3-5 นาที?"
                  disabled={submitting}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info disabled:opacity-60"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
                <div className="flex justify-between mt-1 text-[11px] text-text-muted">
                  <span>อย่างน้อย 5 ตัวอักษร</span>
                  <span>{question.length}/2000</span>
                </div>
              </label>

              <label className="block">
                <span className="text-caption font-bold text-text-secondary mb-1 block">
                  ชื่อ <span className="text-text-muted font-normal">(ไม่บังคับ)</span>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="ชื่อ-ห้องเรียน-รุ่น"
                  disabled={submitting}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info disabled:opacity-60"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
              </label>

              {error && (
                <div className="dash-card border-l-4 border-l-danger flex items-start gap-2 py-2.5">
                  <AlertTriangle size={14} strokeWidth={2.2} className="text-danger shrink-0 mt-0.5" />
                  <div className="text-caption text-text-primary">{error}</div>
                </div>
              )}

              {submitting && (
                <div
                  className="dash-card border-l-4 border-l-info flex items-start gap-2 py-2.5"
                  aria-live="polite"
                >
                  <Loader2 size={14} strokeWidth={2.2} className="text-info shrink-0 mt-0.5 animate-spin" />
                  <div className="space-y-1">
                    <div className="text-caption text-text-primary font-bold">{STAGES[stageIdx]}</div>
                    <div className="text-[11px] text-text-muted">
                      ระบบกำลังให้ DeepSeek ตอบและสร้างรูป — โดยปกติใช้เวลาประมาณ 15-40 วินาที กรุณาอย่าปิดหน้าจอ
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn-primary w-full disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} strokeWidth={2.2} className="animate-spin" /> กำลังประมวลผล…
                  </>
                ) : (
                  <>
                    <Send size={14} strokeWidth={2.2} /> ส่งคำถาม
                  </>
                )}
              </button>

              <p className="text-[11px] text-text-muted text-center">
                คำตอบที่ได้เป็นการสร้างจาก AI — อาจารย์จะตรวจสอบก่อนนำขึ้นแสดงในหน้า Q&A
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result, onClose, onReset }) {
  const isFailed = result.status === 'failed';
  return (
    <div className="space-y-3 py-2">
      <div className={`dash-card border-l-4 ${isFailed ? 'border-l-warning' : 'border-l-success'} flex items-start gap-2 py-3`}>
        {isFailed ? (
          <AlertTriangle size={16} strokeWidth={2.2} className="text-warning shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 size={16} strokeWidth={2.2} className="text-success shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="text-body-strong text-text-primary">
            {isFailed ? 'บันทึกคำถามแล้ว' : 'ส่งคำถามสำเร็จ'}
          </div>
          <div className="text-caption text-text-secondary leading-relaxed">
            {result.message}
          </div>
          <div className="text-[10px] text-text-muted font-mono break-all pt-1">
            รหัสคำถาม: {result.id}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onReset} className="btn btn-ghost flex-1">ถามคำถามใหม่</button>
        <button onClick={onClose} className="btn btn-primary flex-1">ปิด</button>
      </div>
    </div>
  );
}
