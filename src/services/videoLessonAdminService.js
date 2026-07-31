import { supabase } from './supabase';
import { invalidateVideoLessonsCache, mapVideoLessonRow } from './videoLessonService';
import { authedPost } from './adminApi';
import { COURSE_MODE } from '../config/courseMode';

// CRUD วิดีโอบทเรียน สำหรับหน้าแอดมิน — เขียนผ่าน client ที่ล็อกอินแอดมินแล้ว (RLS คุมสิทธิ์)
// รูปแบบเดียวกับ alsAdminService.js (insert/update/delete ตรงไปที่ตาราง)

// payload (camelCase) → row (snake_case)
function toRow(p) {
  const row = {
    course_mode: COURSE_MODE,
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
    .eq('course_mode', COURSE_MODE)
    .order('topic', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapVideoLessonRow);
}

export async function createVideoLesson(payload) {
  // next sort_order ภายใน topic (เฉพาะโหมดเดียวกัน)
  const { data: existing, error: cErr } = await supabase
    .from('video_lessons')
    .select('sort_order')
    .eq('course_mode', COURSE_MODE)
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

// สลับ sort_order ระหว่างคลิป 2 อันที่อยู่ติดกัน (เลื่อนขึ้น/ลง)
export async function swapVideoLessonOrder(a, b) {
  const { error: e1 } = await supabase.from('video_lessons').update({ sort_order: b.sortOrder }).eq('id', a.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('video_lessons').update({ sort_order: a.sortOrder }).eq('id', b.id);
  if (e2) throw e2;
  invalidateVideoLessonsCache();
}

// ให้ AI (Claude ผ่าน /api/video-lessons/generate-quiz) ร่างควิซ 3 ข้อจาก title/keyPoints/chapters
// ของคลิป — ไม่เขียน DB เอง ฝั่งเรียกใช้ (AdminVideoLessons.jsx) เป็นคนบันทึกต่อ
export async function generateQuizWithAI({ title, keyPoints, chapters, topicLabel }) {
  const { quiz } = await authedPost('/api/video-lessons/generate-quiz', { title, keyPoints, chapters, topicLabel });
  return quiz;
}

// ให้ AI ร่าง "สรุปประเด็น" (markdown bullets) จาก title/topic/chapters — ส่งสรุปเดิม (ถ้ามี)
// ไปให้ปรับปรุงต่อ; ไม่เขียน DB เอง ฝั่งเรียกใช้เป็นคนบันทึกต่อเช่นเดียวกับควิซ
export async function generateKeyPointsWithAI({ title, topicLabel, chapters, keyPoints }) {
  const res = await authedPost('/api/video-lessons/generate-key-points', { title, topicLabel, chapters, keyPoints });
  return res.keyPoints;
}
