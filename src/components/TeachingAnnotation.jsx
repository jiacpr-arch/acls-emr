import PanelWrapper from './PanelWrapper';
import { useState, useEffect } from 'react';
import { Edit, Check, AlertTriangle, X, MessageSquare, Send } from 'lucide-react';

// Teaching Annotation — instructor writes comments on student's case
// Stored in localStorage keyed by caseId
const ANNOTATIONS_KEY = 'acls_annotations';

function getAnnotations(caseId) {
  try {
    const all = JSON.parse(localStorage.getItem(ANNOTATIONS_KEY) || '{}');
    return all[caseId] || [];
  } catch { return []; }
}

function saveAnnotation(caseId, annotation) {
  try {
    const all = JSON.parse(localStorage.getItem(ANNOTATIONS_KEY) || '{}');
    if (!all[caseId]) all[caseId] = [];
    all[caseId].push(annotation);
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(all));
  } catch { /* */ }
}

export default function TeachingAnnotation({ caseId, onClose }) {
  const [annotations, setAnnotations] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    setAnnotations(getAnnotations(caseId));
  }, [caseId]);

  const addComment = () => {
    if (!newComment.trim()) return;
    const annotation = {
      id: Date.now(),
      text: newComment.trim(),
      category,
      timestamp: new Date().toISOString(),
      author: 'Instructor',
    };
    saveAnnotation(caseId, annotation);
    setAnnotations(prev => [...prev, annotation]);
    setNewComment('');
  };

  const categories = [
    { key: 'praise', label: 'Good', Icon: Check, color: 'bg-success/10 text-success border-success/30' },
    { key: 'improve', label: 'Improve', Icon: AlertTriangle, color: 'bg-warning/10 text-warning border-warning/30' },
    { key: 'critical', label: 'Critical', Icon: X, color: 'bg-danger/10 text-danger border-danger/30' },
    { key: 'general', label: 'Note', Icon: MessageSquare, color: 'bg-info/10 text-info border-info/30' },
  ];

  const catColor = (cat) => categories.find(c => c.key === cat)?.color || 'bg-bg-primary text-text-primary';
  const catIcon = (cat) => categories.find(c => c.key === cat)?.Icon || MessageSquare;

  return (
    <PanelWrapper title="Instructor Comments" icon={<Edit size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="space-y-2">
        {annotations.length === 0 && (
          <div className="text-center py-8 text-text-muted text-caption">No comments yet</div>
        )}
        {annotations.map(a => {
          const ICmp = catIcon(a.category);
          return (
            <div key={a.id} className={`px-3 py-2.5 border ${catColor(a.category)}`}
              style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-caption font-medium inline-flex items-start gap-2">
                <ICmp size={13} strokeWidth={2.4} className="shrink-0 mt-0.5" />
                <span>{a.text}</span>
              </div>
              <div className="text-[10px] opacity-60 mt-1 ml-5 font-mono">
                {a.author} · {new Date(a.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 mt-3 border-t border-border space-y-2">
        <div className="grid grid-cols-4 gap-1">
          {categories.map(c => {
            const CIcon = c.Icon;
            return (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`py-2 text-[10px] font-bold inline-flex items-center justify-center gap-1 ${
                  category === c.key ? 'ring-2 ring-info' : ''
                } ${c.color} border`}
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <CIcon size={11} strokeWidth={2.4} /> {c.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Write comment…"
            className="flex-1 text-caption" rows={2} />
          <button onClick={addComment} disabled={!newComment.trim()}
            className="btn btn-info self-end disabled:opacity-40">
            <Send size={14} strokeWidth={2.2} /> Add
          </button>
        </div>
      </div>
    </PanelWrapper>
  );
}

// Small badge showing annotation count
export function AnnotationBadge({ caseId }) {
  const count = getAnnotations(caseId).length;
  if (count === 0) return null;
  return (
    <span className="badge bg-info/15 text-info">
      <Edit size={10} strokeWidth={2.2} /> {count}
    </span>
  );
}
