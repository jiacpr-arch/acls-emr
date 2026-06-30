import { supabase } from './supabase';
import { invalidateVideoLessonsCache, mapVideoLessonRow } from './videoLessonService';

// CRUD วิดีโอบทเรียน สำหรับหน้าแอดมิน — เขียนผ่าน client ที่ล็อกอินแอดมินแล้ว (RLS คุมสิทธิ์)
// รูปแบบเดียวกับ alsAdminService.js (insert/update/delete ตรงไปที่ตาราง)

// payload (camelCase) → row (snake_case)
function toRow(p) {
  const row = {
    topic: p.topic,
    title: (p.title || '').trim(),
    youtube_id: (p.youtubeId || '').trim(),
    orientation: p.orientation || 'portrait',
    start_sec: p.startSec === '' || p.startSec == null ? null : Number(p.startSec),
    end_sec: p.endSec === '' || p.endSec == null ? null : Number(p.endSec),
    required: p.required !== false,
    key_points: p.keyPoints || '',
    chapters: Array.isArray(p.chapters) ? p.chapters : [],
    quiz: Array.isArray(p.quiz) ? p.quiz : [],
    related_path: p.relatedPath || null,
    related_label: p.relatedLabel || null,
  };
  if (p.sortOrder != null) row.sort_order = p.sortOrder;
  return row;
}

export async function listVideoLessonsAdmin() {
  const { data, error } = await supabase
    .from('video_lessons')
    .select('*')
    .order('topic', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapVideoLessonRow);
}

export async function createVideoLesson(payload) {
  // next sort_order ภายใน topic
  const { data: existing, error: cErr } = await supabase
    .from('video_lessons')
    .select('sort_order')
    .eq('topic', payload.topic)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (cErr) throw cErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('video_lessons')
    .insert({ ...toRow(payload), sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  invalidateVideoLessonsCache();
  return mapVideoLessonRow(data);
}

export async function updateVideoLesson(id, payload) {
  const { error } = await supabase
    .from('video_lessons')
    .update(toRow(payload))
    .eq('id', id);
  if (error) throw error;
  invalidateVideoLessonsCache();
}

export async function deleteVideoLesson(id) {
  const { error } = await supabase.from('video_lessons').delete().eq('id', id);
  if (error) throw error;
  invalidateVideoLessonsCache();
}
