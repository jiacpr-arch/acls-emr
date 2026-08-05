import { useState } from 'react';
import { GAME_BUTTONS } from '../../data/recorderGameLevels';
import { CASE_CATEGORIES, CASE_CATEGORY_META, caseToLevel, blankEvent } from '../../data/recorderCases';
import {
  createRecorderCase, updateRecorderCase, setRecorderCaseStatus, deleteRecorderCase,
} from '../../services/recorderCaseAdminService';
import { LivePlay } from '../../pages/RecorderGamePlay';
import {
  Save, Play, Send, X, Trash2, Plus, AlertTriangle, CheckCircle2,
} from 'lucide-react';

const BUTTON_IDS = Object.keys(GAME_BUTTONS);

// buttonId → key ของ expect.data (ถ้าต้องการ)
function dataKeyFor(buttonId) {
  const needs = GAME_BUTTONS[buttonId]?.needsData;
  if (needs === 'rhythm') return 'rhythm';
  if (needs === 'energy') return 'energy';
  if (needs === 'drug') return 'drug';
  if (needs === 'choice') return 'choice';
  return null;
}

export default function RecorderCaseEditor({ item, onClose, onSaved }) {
  const p = item.payload || {};
  const [titleTh, setTitleTh] = useState(item.titleTh || p.title_th || '');
  const [category, setCategory] = useState(item.category || p.category || 'cardiac_arrest');
  const [difficulty, setDifficulty] = useState(item.difficulty || p.difficulty || 'basic');
  const [introTh, setIntroTh] = useState(p.intro_th || '');
  const [initialSceneJson, setInitialSceneJson] = useState(
    JSON.stringify(p.initialScene || {}, null, 0)
  );
  const [events, setEvents] = useState(
    (Array.isArray(p.events) ? p.events : [blankEvent(6)]).map(e => ({ ...e }))
  );
  const [busy, setBusy] = useState('');
  const [testing, setTesting] = useState(false);
  const [id, setId] = useState(item.id || null);
  const warnings = item.warnings || [];

  const buildPayload = () => {
    let initialScene = {};
    try { initialScene = JSON.parse(initialSceneJson || '{}'); } catch { initialScene = {}; }
    return {
      title_th: titleTh, category, difficulty, intro_th: introTh,
      wrongPressPenalty: Number(p.wrongPressPenalty) || 15,
      initialScene,
      events: events.map(e => ({ ...e, t: Number(e.t) || 0, points: Number(e.points) || 100 })),
    };
  };

  const updateEvent = (i, patch) => {
    setEvents(evs => evs.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };
  const updateExpect = (i, patch) => {
    setEvents(evs => evs.map((e, idx) => (idx === i ? { ...e, expect: { ...e.expect, ...patch } } : e)));
  };
  const setEventData = (i, buttonId, value) => {
    const key = dataKeyFor(buttonId);
    if (!key) return updateExpect(i, { buttonId, data: undefined });
    const val = key === 'energy' ? Number(value) : value;
    updateExpect(i, { buttonId, data: { [key]: val } });
  };
  const addEvent = () => {
    const lastT = events.length ? Number(events[events.length - 1].t) || 0 : 0;
    setEvents(evs => [...evs, blankEvent(lastT + 12)]);
  };
  const removeEvent = (i) => setEvents(evs => evs.filter((_, idx) => idx !== i));

  const doSave = async () => {
    setBusy('save');
    try {
      const input = { titleTh, category, difficulty, source: item.source || 'manual', payload: buildPayload() };
      if (id) {
        await updateRecorderCase(id, input);
      } else {
        const created = await createRecorderCase(input);
        setId(created.id);
      }
      onSaved?.();
      return true;
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
      return false;
    } finally {
      setBusy('');
    }
  };

  const doPublish = async () => {
    const ok = await doSave();
    if (!ok) return;
    if (!window.confirm('เผยแพร่เคสนี้ให้ผู้เรียนเห็น? ตรวจ dose/พลังงาน/จังหวะให้ถูกก่อนนะ')) return;
    setBusy('publish');
    try {
      await setRecorderCaseStatus(id, 'published');
      onSaved?.();
      onClose();
    } catch (err) {
      alert('เผยแพร่ไม่สำเร็จ: ' + (err?.message || err));
    } finally { setBusy(''); }
  };

  const doReject = async () => {
    if (!id) { onClose(); return; }
    setBusy('reject');
    try { await setRecorderCaseStatus(id, 'rejected'); onSaved?.(); onClose(); }
    catch (err) { alert('ไม่สำเร็จ: ' + (err?.message || err)); }
    finally { setBusy(''); }
  };

  const doDelete = async () => {
    if (!id) { onClose(); return; }
    if (!window.confirm('ลบเคสนี้ถาวร?')) return;
    setBusy('delete');
    try { await deleteRecorderCase(id); onSaved?.(); onClose(); }
    catch (err) { alert('ลบไม่สำเร็จ: ' + (err?.message || err)); }
    finally { setBusy(''); }
  };

  // ---------- TEST PLAY overlay ----------
  if (testing) {
    const level = caseToLevel({ ...buildPayload(), id: id || 'preview' });
    return (
      <div className="fixed inset-0 z-[60] bg-bg-primary">
        <LivePlay key={'test_' + Date.now()} level={level} onFinish={() => setTesting(false)} readyMode="none" />
        <button onClick={() => setTesting(false)}
          className="absolute top-2 right-2 z-[70] btn btn-danger btn-sm">
          <X size={14} strokeWidth={2.4} /> ปิดทดลอง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="glass-card !p-3 border-2 border-warning/50 space-y-1">
          <div className="text-xs font-bold text-warning inline-flex items-center gap-1.5">
            <AlertTriangle size={14} strokeWidth={2.4} /> ตรวจสอบก่อนเผยแพร่ ({warnings.length})
          </div>
          {warnings.map((w, i) => <div key={i} className="text-2xs text-text-secondary">• {w}</div>)}
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-1 gap-2">
        <label className="text-2xs font-bold text-text-secondary">ชื่อเคส
          <input value={titleTh} onChange={e => setTitleTh(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-border rounded text-sm" placeholder="เช่น VF Arrest — ชาย 55 ปี" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-2xs font-bold text-text-secondary">หมวด
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full mt-1 px-2 py-2 border border-border rounded text-sm">
              {CASE_CATEGORIES.map(c => <option key={c} value={c}>{CASE_CATEGORY_META[c].label_th}</option>)}
            </select>
          </label>
          <label className="text-2xs font-bold text-text-secondary">ระดับ
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="w-full mt-1 px-2 py-2 border border-border rounded text-sm">
              <option value="basic">basic</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </label>
        </div>
        <label className="text-2xs font-bold text-text-secondary">บทนำ (intro)
          <textarea value={introTh} onChange={e => setIntroTh(e.target.value)} rows={2}
            className="w-full mt-1 px-3 py-2 border border-border rounded text-sm" />
        </label>
        <label className="text-2xs font-bold text-text-secondary">Initial scene (JSON)
          <textarea value={initialSceneJson} onChange={e => setInitialSceneJson(e.target.value)} rows={2}
            className="w-full mt-1 px-3 py-2 border border-border rounded text-xs font-mono" />
        </label>
      </div>

      {/* Events */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-text-primary">เหตุการณ์ ({events.length})</div>
          <button onClick={addEvent} className="btn btn-ghost btn-sm"><Plus size={13} strokeWidth={2.4} /> เพิ่ม</button>
        </div>
        {events.map((e, i) => {
          const key = dataKeyFor(e.expect?.buttonId);
          const dataVal = key ? (e.expect?.data?.[key] ?? '') : '';
          return (
            <div key={i} className="glass-card !p-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-text-muted">t=</span>
                <input type="number" value={e.t} onChange={ev => updateEvent(i, { t: ev.target.value })}
                  className="w-16 px-2 py-1 border border-border rounded text-xs" />
                <span className="text-2xs font-bold text-text-muted ml-auto">pts</span>
                <input type="number" value={e.points} onChange={ev => updateEvent(i, { points: ev.target.value })}
                  className="w-16 px-2 py-1 border border-border rounded text-xs" />
                <button onClick={() => removeEvent(i)} className="btn btn-ghost btn-icon btn-sm text-danger"><Trash2 size={13} /></button>
              </div>
              <input value={e.narration_th} onChange={ev => updateEvent(i, { narration_th: ev.target.value })}
                className="w-full px-2 py-1 border border-border rounded text-xs" placeholder="narration (สิ่งที่เกิดขึ้น)" />
              <div className="flex items-center gap-2">
                <select value={e.expect?.buttonId || ''}
                  onChange={ev => setEventData(i, ev.target.value, '')}
                  className="flex-1 px-2 py-1 border border-border rounded text-xs">
                  {BUTTON_IDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {key && (
                  <input value={dataVal} onChange={ev => setEventData(i, e.expect.buttonId, ev.target.value)}
                    className="w-28 px-2 py-1 border border-border rounded text-xs" placeholder={key} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={doSave} disabled={!!busy} className="btn btn-ghost btn-block font-bold border">
          <Save size={14} strokeWidth={2.4} /> {busy === 'save' ? 'บันทึก…' : 'บันทึกร่าง'}
        </button>
        <button onClick={() => setTesting(true)} className="btn btn-info btn-block font-bold">
          <Play size={14} strokeWidth={2.4} /> ทดลองเล่น
        </button>
        <button onClick={doPublish} disabled={!!busy} className="btn btn-success btn-block font-black">
          <Send size={14} strokeWidth={2.4} /> {busy === 'publish' ? 'เผยแพร่…' : 'เผยแพร่'}
        </button>
        <button onClick={doReject} disabled={!!busy} className="btn btn-warning btn-block font-bold">
          <X size={14} strokeWidth={2.4} /> ปฏิเสธ
        </button>
      </div>
      <div className="flex items-center justify-between pt-1">
        <button onClick={onClose} className="btn btn-ghost btn-sm">
          <CheckCircle2 size={13} strokeWidth={2.4} /> ปิด
        </button>
        <button onClick={doDelete} disabled={!!busy} className="btn btn-ghost btn-sm text-danger">
          <Trash2 size={13} strokeWidth={2.4} /> ลบ
        </button>
      </div>
    </div>
  );
}
