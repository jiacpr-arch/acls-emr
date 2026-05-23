import { useEffect, useState } from 'react';
import {
  Sparkles, RefreshCw, Send, Trash2, Save, X, AlertTriangle,
  CheckCircle2, Clock, Image as ImageIcon, Layers, MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  updateStudentQuestionDraft,
  rejectStudentQuestion,
  deleteStudentQuestion,
  reprocessStudentQuestion,
  publishStudentQuestion,
} from '../../services/studentQuestionAdminService';

const STATUS_META = {
  pending:     { label: 'รอประมวลผล', color: 'text-text-muted',  icon: Clock },
  processing:  { label: 'กำลังประมวลผล', color: 'text-info',     icon: RefreshCw },
  draft_ready: { label: 'พร้อมตรวจ', color: 'text-warning',      icon: Sparkles },
  published:   { label: 'เผยแพร่แล้ว', color: 'text-success',    icon: CheckCircle2 },
  rejected:    { label: 'ปฏิเสธ', color: 'text-text-muted',      icon: X },
  failed:      { label: 'ประมวลผลล้มเหลว', color: 'text-danger', icon: AlertTriangle },
};

export default function StudentQuestionReviewItem({ item, chapters, onChange }) {
  const [question, setQuestion] = useState(item.question || '');
  const [answer, setAnswer] = useState(item.deepseek_answer || '');
  const [chapterId, setChapterId] = useState(item.suggested_chapter_id || '');
  const [adminNotes, setAdminNotes] = useState(item.admin_notes || '');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setQuestion(item.question || '');
    setAnswer(item.deepseek_answer || '');
    setChapterId(item.suggested_chapter_id || '');
    setAdminNotes(item.admin_notes || '');
  }, [item.id, item.question, item.deepseek_answer, item.suggested_chapter_id, item.admin_notes]);

  const dirty =
    question !== (item.question || '') ||
    answer !== (item.deepseek_answer || '') ||
    chapterId !== (item.suggested_chapter_id || '') ||
    adminNotes !== (item.admin_notes || '');

  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  const handleSave = async () => {
    setBusy('save');
    try {
      await updateStudentQuestionDraft(item.id, {
        question,
        deepseek_answer: answer,
        suggested_chapter_id: chapterId || null,
        admin_notes: adminNotes,
      });
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy('');
  };

  const handleReprocess = async () => {
    if (!confirm('สั่ง AI สร้างคำตอบและรูปใหม่ (ทับของเดิม)?')) return;
    setBusy('reprocess');
    try {
      await reprocessStudentQuestion(item.id);
      onChange?.();
    } catch (err) {
      alert('สั่งใหม่ไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy('');
  };

  const handlePublish = async () => {
    if (!confirm('เผยแพร่คำถาม-คำตอบนี้เข้าสู่หน้า Q&A?')) return;
    setBusy('publish');
    try {
      // Persist any in-flight edits first, then publish with overrides
      // so the published item reflects what's on screen.
      if (dirty) {
        await updateStudentQuestionDraft(item.id, {
          question,
          deepseek_answer: answer,
          suggested_chapter_id: chapterId || null,
          admin_notes: adminNotes,
        });
      }
      await publishStudentQuestion(item.id, {
        question,
        answer,
        chapterId: chapterId || null,
      });
      onChange?.();
    } catch (err) {
      alert('เผยแพร่ไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy('');
  };

  const handleReject = async () => {
    const reason = prompt('เหตุผลที่ปฏิเสธ (ไม่บังคับ):', '');
    if (reason === null) return;
    setBusy('reject');
    try {
      await rejectStudentQuestion(item.id, reason || null);
      onChange?.();
    } catch (err) {
      alert('ปฏิเสธไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy('');
  };

  const handleDelete = async () => {
    if (!confirm('ลบคำถามนี้ถาวร? (ไม่สามารถกู้คืนได้)')) return;
    setBusy('delete');
    try {
      await deleteStudentQuestion(item.id);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy('');
  };

  const canEdit = item.status === 'draft_ready' || item.status === 'failed';
  const canPublish = item.status === 'draft_ready' && answer.trim().length > 0;

  return (
    <div className="dash-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${meta.color}`}>
            <StatusIcon size={12} strokeWidth={2.4} />
            {meta.label}
          </span>
          <span className="text-[11px] text-text-muted">
            {new Date(item.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
          {item.student_name && (
            <span className="text-[11px] text-text-muted">
              · {item.student_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {item.status !== 'published' && (
            <button
              onClick={handleReprocess}
              disabled={!!busy}
              className="btn btn-ghost btn-sm disabled:opacity-40"
              title="สั่ง AI สร้างใหม่"
            >
              <RefreshCw size={12} strokeWidth={2.2} className={busy === 'reprocess' ? 'animate-spin' : ''} />
              สร้างใหม่
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={!!busy}
            className="btn btn-ghost btn-sm text-danger disabled:opacity-40"
            title="ลบถาวร"
          >
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {item.error_message && (
        <div className="dash-card border-l-4 border-l-warning flex items-start gap-2 py-2">
          <AlertTriangle size={12} strokeWidth={2.2} className="text-warning shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed font-mono break-all">
            {item.error_message}
          </div>
        </div>
      )}

      {/* Question (editable) */}
      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 inline-flex items-center gap-1">
          <MessageSquare size={12} strokeWidth={2.2} /> คำถาม
        </span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          disabled={!canEdit}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info disabled:opacity-60"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      {/* Chapter classification */}
      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 inline-flex items-center gap-1">
          <Layers size={12} strokeWidth={2.2} /> หมวด
          {item.suggested_chapter_id && (
            <span className="text-text-muted font-normal">
              · AI แนะนำ:{' '}
              {chapters.find(c => c.id === item.suggested_chapter_id)?.title || item.suggested_chapter_id}
            </span>
          )}
        </span>
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          disabled={!canEdit}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info disabled:opacity-60"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <option value="">— ยังไม่จัดหมวด —</option>
          {chapters.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon ? `${c.icon} ` : ''}{c.title}
            </option>
          ))}
        </select>
        {item.classification_reason && (
          <div className="text-[11px] text-text-muted mt-1 italic">
            เหตุผล AI: {item.classification_reason}
          </div>
        )}
      </label>

      {/* Generated image preview */}
      {item.generated_image_url && (
        <div className="space-y-1">
          <div className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
            <ImageIcon size={12} strokeWidth={2.2} /> รูปประกอบที่ AI สร้าง
          </div>
          <img
            src={item.generated_image_url}
            alt={question.slice(0, 80)}
            className="w-full max-w-sm border border-border"
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}

      {/* Answer (editable, with preview) */}
      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">
          คำตอบ (Markdown — แก้ไขได้ก่อนเผยแพร่)
        </span>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={10}
          disabled={!canEdit}
          placeholder={item.status === 'pending' ? 'กำลังรอ AI สร้างคำตอบ…' : ''}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary font-mono focus:outline-none focus:border-info disabled:opacity-60"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      {answer && (
        <details className="dash-card">
          <summary className="cursor-pointer text-caption font-bold text-text-secondary">
            ดูตัวอย่าง preview
          </summary>
          <div className="prose prose-sm max-w-none mt-2 text-text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        </details>
      )}

      {/* Admin notes */}
      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">
          บันทึก admin <span className="text-text-muted font-normal">(ไม่แสดงให้นักเรียน)</span>
        </span>
        <input
          type="text"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={item.status === 'published'}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info disabled:opacity-60"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {canEdit && (
          <button
            onClick={handleSave}
            disabled={!dirty || !!busy}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            <Save size={12} strokeWidth={2.2} />
            {busy === 'save' ? 'กำลังบันทึก…' : 'บันทึกร่าง'}
          </button>
        )}
        {canPublish && (
          <button
            onClick={handlePublish}
            disabled={!!busy}
            className="btn btn-primary btn-sm disabled:opacity-40"
          >
            <Send size={12} strokeWidth={2.2} />
            {busy === 'publish' ? 'กำลังเผยแพร่…' : 'เผยแพร่เข้า Q&A'}
          </button>
        )}
        {item.status !== 'rejected' && item.status !== 'published' && (
          <button
            onClick={handleReject}
            disabled={!!busy}
            className="btn btn-ghost btn-sm text-text-muted disabled:opacity-40"
          >
            <X size={12} strokeWidth={2.2} />
            ปฏิเสธ
          </button>
        )}
        {item.status === 'published' && item.published_item_id && (
          <span className="text-[11px] text-success inline-flex items-center gap-1 px-2 py-1">
            <CheckCircle2 size={12} strokeWidth={2.2} />
            เผยแพร่แล้ว
            {item.published_at && (
              <span className="text-text-muted">
                · {new Date(item.published_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
