import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, AlertTriangle, Save, Trash2, Upload, Users } from 'lucide-react';
import {
  listCharacters, createCharacter, updateCharacter, deleteCharacter, uploadPoseImage, CHAR_POSES,
} from '../services/codeBlueCharacterAdminService';

const POSE_LABEL = {
  idle: 'ปกติ', talk: 'พูด', panic: 'ตกใจ', stern: 'จริงจัง', happy: 'ยิ้ม',
};

const blankChar = () => ({
  id: null, charKey: '', name: '', role: '',
  plateFrom: '#405089', plateTo: '#232F5E', poses: {},
});

export default function AdminCodeBlueCharacters() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try { setList(await listCharacters()); }
    catch (err) { setLoadErr(err?.message || String(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (editing) {
    return <CharacterEditor item={editing} onClose={() => { setEditing(null); load(); }} />;
  }

  return (
    <div className="page-container space-y-3 pb-28">
      <Link to="/admin" className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> แดชบอร์ดแอดมิน
      </Link>
      <div className="flex items-center gap-2">
        <Users size={20} strokeWidth={2.4} className="text-purple" />
        <h1 className="text-headline text-text-primary">ตัวละครเกม Code Blue</h1>
      </div>
      <p className="text-2xs text-text-muted leading-relaxed">
        เพิ่มตัวละครใหม่ + อัปโหลดรูปแต่ละสีหน้า — ตัวละครใหม่จะเลือกใช้ในโจทย์ได้ทันที
        (นอกเหนือจาก 4 ตัวมาตรฐาน: nurse_mint, boy_compressor, fon_defib, att_dech)
      </p>

      <button onClick={() => setEditing(blankChar())} className="btn btn-info btn-block font-bold">
        <Plus size={14} strokeWidth={2.4} /> เพิ่มตัวละครใหม่
      </button>

      <div className="flex items-center justify-between">
        <span className="text-2xs text-text-muted">{list.length} ตัวละคร (custom)</span>
        <button onClick={load} className="btn btn-ghost btn-icon btn-sm"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : loadErr ? (
        <div className="glass-card !p-3 border-2 border-danger/40 text-caption text-danger inline-flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={2.4} /> โหลดไม่สำเร็จ: {loadErr} (ตาราง code_blue_characters อาจยังไม่ถูกสร้าง)
        </div>
      ) : list.length === 0 ? (
        <div className="text-center text-caption text-text-muted py-8">ยังไม่มีตัวละคร custom — กด "เพิ่มตัวละครใหม่"</div>
      ) : (
        <div className="space-y-2">
          {list.map(c => {
            const cover = c.poses.idle || c.poses.talk || Object.values(c.poses)[0];
            return (
              <button key={c.id} onClick={() => setEditing(c)}
                className="w-full dash-card !p-3 flex items-center gap-3 text-left hover:bg-bg-tertiary transition-colors">
                {cover
                  ? <img src={cover} alt={c.name} className="w-10 h-10 object-cover rounded border border-border" />
                  : <div className="w-10 h-10 rounded border border-border" style={{ background: `linear-gradient(180deg, ${c.plateFrom}, ${c.plateTo})` }} />}
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-black text-text-primary truncate">{c.name || '(ไม่มีชื่อ)'}</div>
                  <div className="text-3xs text-text-muted font-mono">{c.charKey} · {Object.keys(c.poses).length} รูป</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CharacterEditor({ item, onClose }) {
  const [charKey, setCharKey] = useState(item.charKey || '');
  const [name, setName] = useState(item.name || '');
  const [role, setRole] = useState(item.role || '');
  const [plateFrom, setPlateFrom] = useState(item.plateFrom || '#405089');
  const [plateTo, setPlateTo] = useState(item.plateTo || '#232F5E');
  const [poses, setPoses] = useState(item.poses || {});
  const [saving, setSaving] = useState(false);
  const [uploadingPose, setUploadingPose] = useState('');

  const keyValid = /^[a-z][a-z0-9_]{2,}$/.test(charKey);

  async function handleUpload(pose, file) {
    if (!file) return;
    if (!keyValid) { alert('ตั้ง "รหัสตัวละคร" (a-z, _) ให้ถูกก่อนอัปโหลด'); return; }
    setUploadingPose(pose);
    try {
      const url = await uploadPoseImage(charKey, pose, file);
      setPoses(p => ({ ...p, [pose]: url }));
    } catch (err) {
      alert('อัปโหลดไม่สำเร็จ: ' + (err?.message || err));
    } finally {
      setUploadingPose('');
    }
  }

  async function save() {
    if (!keyValid) { alert('รหัสตัวละครต้องเป็น a-z ตัวเล็ก/ตัวเลข/_ อย่างน้อย 3 ตัว'); return; }
    setSaving(true);
    try {
      const input = { charKey, name, role, plateFrom, plateTo, poses };
      if (item.id) await updateCharacter(item.id, input);
      else await createCharacter(input);
      onClose();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
      setSaving(false);
    }
  }

  async function remove() {
    if (!item.id) { onClose(); return; }
    if (!confirm('ลบตัวละครนี้? (โจทย์ที่อ้างถึงจะแสดงเป็นตัวสำรอง)')) return;
    setSaving(true);
    try { await deleteCharacter(item.id); onClose(); }
    catch (err) { alert('ลบไม่สำเร็จ: ' + (err?.message || err)); setSaving(false); }
  }

  return (
    <div className="page-container space-y-3 pb-28">
      <button onClick={onClose} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> กลับรายการ
      </button>
      <h1 className="text-headline text-text-primary">{item.id ? 'แก้ไขตัวละคร' : 'ตัวละครใหม่'}</h1>

      <div className="space-y-2">
        <div>
          <input value={charKey} onChange={e => setCharKey(e.target.value.toLowerCase())}
            placeholder="รหัสตัวละคร (a-z, _ เช่น doctor_new)" disabled={!!item.id}
            className="w-full px-3 py-2 border border-border rounded text-sm font-mono" />
          {!keyValid && charKey.length > 0 && <div className="text-3xs text-danger mt-0.5">ใช้ a-z ตัวเล็ก/ตัวเลข/_ อย่างน้อย 3 ตัว</div>}
          {item.id && <div className="text-3xs text-text-muted mt-0.5">รหัสแก้ไม่ได้หลังสร้าง (โจทย์อ้างถึงอยู่)</div>}
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อที่แสดง เช่น พยาบาลฟ้า"
          className="w-full px-3 py-2 border border-border rounded text-sm font-bold" />
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="บทบาท เช่น Nurse / Airway"
          className="w-full px-3 py-2 border border-border rounded text-sm" />
        <div className="flex items-center gap-3">
          <label className="text-2xs text-text-muted flex items-center gap-1.5">
            สีป้าย
            <input type="color" value={plateFrom} onChange={e => setPlateFrom(e.target.value)} className="w-8 h-8 rounded border border-border" />
            <input type="color" value={plateTo} onChange={e => setPlateTo(e.target.value)} className="w-8 h-8 rounded border border-border" />
          </label>
          <span className="text-2xs px-3 py-1 rounded text-white font-bold" style={{ background: `linear-gradient(180deg, ${plateFrom}, ${plateTo})` }}>
            {name || 'ตัวอย่างป้าย'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xs font-black text-text-primary">รูปแต่ละสีหน้า (WebP/PNG โปร่งใส แนะนำกว้าง ~600px)</div>
        <div className="grid grid-cols-5 gap-2">
          {CHAR_POSES.map(pose => (
            <label key={pose} className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-full aspect-[4/5] rounded border-2 border-border overflow-hidden bg-bg-tertiary flex items-center justify-center">
                {uploadingPose === pose
                  ? <span className="text-3xs text-text-muted">…</span>
                  : poses[pose]
                    ? <img src={poses[pose]} alt={pose} className="w-full h-full object-cover" />
                    : <Upload size={16} strokeWidth={2} className="text-text-muted" />}
              </div>
              <span className="text-3xs text-text-muted">{POSE_LABEL[pose]}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => handleUpload(pose, e.target.files?.[0])} />
            </label>
          ))}
        </div>
        <div className="text-3xs text-text-muted">ท่าที่ยังไม่มีรูป เกมจะใช้ตัวสำรอง (silhouette) ให้ — อัปโหลดทีหลังได้</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={save} disabled={saving} className="btn btn-success btn-block font-bold">
          <Save size={14} strokeWidth={2.4} /> {item.id ? 'บันทึก' : 'สร้างตัวละคร'}
        </button>
        {item.id && (
          <button onClick={remove} disabled={saving} className="btn btn-ghost btn-block text-danger border border-danger/40">
            <Trash2 size={14} strokeWidth={2.4} /> ลบ
          </button>
        )}
      </div>
    </div>
  );
}
