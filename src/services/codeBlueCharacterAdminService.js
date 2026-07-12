import { supabase } from './supabase';
import { invalidateCharacterCache } from './codeBlueCharacterService';

// ==========================================
// Code Blue — CRUD ตัวละคร + อัปโหลดรูปเข้า storage (bucket 'acls-images')
// เขียนผ่าน client ที่ล็อกอินแอดมินแล้ว (RLS คุมสิทธิ์)
// ==========================================
const IMAGES_BUCKET = 'acls-images';
const DIR = 'code-blue-characters';

export const CHAR_POSES = ['idle', 'talk', 'panic', 'stern', 'happy'];

export function mapAdminRow(row) {
  return {
    id: row.id,
    charKey: row.char_key,
    name: row.name || '',
    role: row.role || '',
    plateFrom: row.plate_from || '#405089',
    plateTo: row.plate_to || '#232F5E',
    poses: row.poses && typeof row.poses === 'object' ? row.poses : {},
    sortOrder: row.sort_order ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function listCharacters() {
  const { data, error } = await supabase
    .from('code_blue_characters')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAdminRow);
}

// อัปโหลดรูป 1 ท่า → คืน public URL
export async function uploadPoseImage(charKey, pose, file) {
  const ext = (file.name.split('.').pop() || 'webp').toLowerCase();
  const path = `${DIR}/${charKey}/${pose}-${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function toRow({ charKey, name, role, plateFrom, plateTo, poses }) {
  return {
    char_key: (charKey || '').trim(),
    name: (name || charKey || 'ตัวละคร').trim(),
    role: (role || '').trim(),
    plate_from: plateFrom || '#405089',
    plate_to: plateTo || '#232F5E',
    poses: poses || {},
  };
}

export async function createCharacter(input) {
  const { data, error } = await supabase
    .from('code_blue_characters')
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  invalidateCharacterCache();
  return mapAdminRow(data);
}

export async function updateCharacter(id, input) {
  const { error } = await supabase
    .from('code_blue_characters')
    .update(toRow(input))
    .eq('id', id);
  if (error) throw error;
  invalidateCharacterCache();
}

export async function deleteCharacter(id) {
  const { error } = await supabase.from('code_blue_characters').delete().eq('id', id);
  if (error) throw error;
  invalidateCharacterCache();
}
