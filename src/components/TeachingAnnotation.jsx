import PanelWrapper from './PanelWrapper';
import { useState, useEffect } from 'react';

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
    { key: 'praise', label: '✅ Good', color: 'bg-success/10 text-success border-success/30' },
    { key: 'improve', label: '⚠️ Improve', color: 'bg-warning/10 text-warning border-warning/30' },
    { key: 'critical', label: '❌ Critical', color: 'bg-danger/10 text-danger border-danger/30' },
    { key: 'general', label: '💬 Note', color: 'bg-info/10 text-info border-info/30' },
  ];

  const catColor = (cat) => categories.find(c => c.key === cat)?.color || 'bg-bg-primary text-text-primary';

  return (
    <PanelWrapper title="Instructor Comments" icon="📝" onClose={onClose}>
      <div className="space-y-2">
        {annotations.length === 0 && (
          <div className="text-center py-6 text-text-muted text-xs">No comments yet</div>
        )}
        {annotations.map(a => (
          <div key={a.id} className={`rounded-xl px-3 py-2.5 border ${catColor(a.category)}`}>
            <div className="text-xs font-medium">{a.text}</div>
            <div className="text-[9px] opacity-60 mt-1">
              {a.author} · {new Date(a.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      <div className="p-4 border-t border-bg-tertiary space-y-2">
        <div className="grid grid-cols-4 gap-1">
          {categories.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`py-1.5 rounded-lg text-[9px] font-bold ${
                category === c.key ? 'ring-2 ring-info' : ''
              } ${catColor(c.key)} border`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Write comment..."
            className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-xs text-text-primary focus:outline-none focus:border-info"
            rows={2} />
          <button onClick={addComment} disabled={!newComment.trim()}
            className="btn-action btn-info px-4 text-xs font-bold self-end disabled:opacity-40 !min-h-[40px]">
            Add
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
    <span className="text-[9px] font-bold bg-info/15 text-info px-1.5 py-0.5 rounded">
      📝 {count}
    </span>
  );
}
