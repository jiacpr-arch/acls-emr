import { useState } from 'react';
import { rpcUpsertStation, rpcDeleteStation } from '../../services/cohortSync';
import { DEFAULT_STATIONS, STATION_KIND_META, resolveChecklistForStation } from '../../data/checkinStations';
import ChecklistGrader from './ChecklistGrader';
import { Plus, Trash, Award, ClipboardCheck, ClipboardList, Sparkles } from 'lucide-react';

// จัดการรายชื่อฐานของคลาส — เพิ่ม/เปลี่ยนประเภท/ลบ + ปุ่มเพิ่มชุดฐานมาตรฐาน
// เรียก RPC ตรงๆ แล้วให้หน้าแม่ reload board (onChanged)
export default function StationManager({ stations, courseMode, onChanged }) {
  const [newName, setNewName] = useState('');
  const [newKind, setNewKind] = useState('practice');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewStation, setPreviewStation] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    const { error: err } = await fn();
    setBusy(false);
    if (err) {
      setError('บันทึกไม่สำเร็จ — ตรวจอินเทอร์เน็ต/รหัสอาจารย์ แล้วลองใหม่');
      return false;
    }
    onChanged();
    return true;
  };

  const addStation = async () => {
    const name = newName.trim();
    if (!name) return;
    const maxOrder = stations.reduce((m, s) => Math.max(m, s.sortOrder || 0), 0);
    const ok = await run(() => rpcUpsertStation({ name, kind: newKind, sortOrder: maxOrder + 1 }));
    if (ok) { setNewName(''); setNewKind('practice'); }
  };

  const addDefaults = async () => {
    const defaults = DEFAULT_STATIONS[courseMode] || DEFAULT_STATIONS.acls;
    const existing = new Set(stations.map(s => s.name));
    const missing = defaults.filter(d => !existing.has(d.name));
    if (!missing.length) return;
    setBusy(true);
    setError('');
    let maxOrder = stations.reduce((m, s) => Math.max(m, s.sortOrder || 0), 0);
    for (const d of missing) {
      maxOrder += 1;
      const { error: err } = await rpcUpsertStation({ name: d.name, kind: d.kind, sortOrder: maxOrder });
      if (err) {
        setError('เพิ่มฐานมาตรฐานไม่ครบ — ลองกดอีกครั้ง');
        break;
      }
    }
    setBusy(false);
    onChanged();
  };

  const toggleKind = (s) => run(() => rpcUpsertStation({
    stationId: s.id,
    name: s.name,
    kind: s.kind === 'exam' ? 'practice' : 'exam',
    sortOrder: s.sortOrder,
  }));

  const remove = (s) => {
    if (!confirm(`ลบ "${s.name}"? ประวัติเช็คชื่อ/ผลสอบของฐานนี้จะถูกลบทั้งหมด`)) return;
    run(() => rpcDeleteStation(s.id));
  };

  return (
    <div className="dash-card space-y-3">
      <div className="text-body-strong text-text-primary">จัดการฐาน</div>

      {stations.length === 0 && (
        <p className="text-caption text-text-muted">
          ยังไม่มีฐาน — เพิ่มเองด้านล่าง หรือกดปุ่มเพิ่มชุดฐานมาตรฐาน
        </p>
      )}

      {stations.map((s) => {
        const hasChecklist = !!resolveChecklistForStation(s.name);
        return (
          <div key={s.id} className="flex items-center gap-2 bg-bg-tertiary p-2.5"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="flex-1 min-w-0 text-caption text-text-primary truncate">{s.name}</div>
            {hasChecklist && (
              <button disabled={busy} onClick={() => setPreviewStation(s)}
                className="btn btn-ghost btn-sm shrink-0" aria-label={`ดูเช็คลิสต์ ${s.name}`}
                title="ดูเช็คลิสต์อ้างอิง">
                <ClipboardList size={13} strokeWidth={2.2} />
              </button>
            )}
            <button
              disabled={busy}
              onClick={() => toggleKind(s)}
              className={`btn btn-sm shrink-0 font-bold ${
                s.kind === 'exam' ? 'bg-warning/15 text-warning' : 'bg-info/12 text-info'
              }`}
              title="สลับประเภทฐาน: เช็คชื่อ ↔ สอบ">
              {s.kind === 'exam'
                ? <><Award size={12} strokeWidth={2.4} /> {STATION_KIND_META.exam.label}</>
                : <><ClipboardCheck size={12} strokeWidth={2.4} /> {STATION_KIND_META.practice.label}</>}
            </button>
            <button disabled={busy} onClick={() => remove(s)}
              className="btn btn-ghost btn-sm text-danger shrink-0" aria-label={`ลบ ${s.name}`}>
              <Trash size={13} strokeWidth={2.2} />
            </button>
          </div>
        );
      })}

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addStation(); }}
          placeholder="ชื่อฐานใหม่ เช่น ฐาน Airway"
          className="flex-1 min-w-0 text-caption"
        />
        <select value={newKind} onChange={(e) => setNewKind(e.target.value)} className="shrink-0 text-caption">
          <option value="practice">เช็คชื่อ</option>
          <option value="exam">สอบ</option>
        </select>
        <button disabled={busy || !newName.trim()} onClick={addStation}
          className="btn btn-primary btn-sm shrink-0 disabled:opacity-40">
          <Plus size={13} strokeWidth={2.4} /> เพิ่ม
        </button>
      </div>

      <button disabled={busy} onClick={addDefaults} className="btn btn-ghost btn-sm btn-block">
        <Sparkles size={13} strokeWidth={2.2} /> เพิ่มชุดฐานมาตรฐาน ({(DEFAULT_STATIONS[courseMode] || DEFAULT_STATIONS.acls).length} ฐาน)
      </button>

      {error && <div className="text-caption text-danger">{error}</div>}

      <ChecklistGrader
        open={!!previewStation}
        station={previewStation}
        readOnly
        onClose={() => setPreviewStation(null)}
      />
    </div>
  );
}
