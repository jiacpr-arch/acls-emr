import { useEffect, useState } from 'react';
import { fetchVideoLessons, groupByTopic } from '../services/videoLessonService';
import { VIDEO_TOPICS } from '../data/videoTopics';

// โหลดวิดีโอบทเรียนทั้งหมด (cache) แล้วจัดกลุ่มตามหัวข้อ
// คืน { lessons, byTopic, topics, loading, error } — topics = เฉพาะหัวข้อที่มีคลิป เรียงตาม VIDEO_TOPICS
export function useVideoLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchVideoLessons()
      .then(rows => { if (alive) { setLessons(rows); setError(null); } })
      .catch(err => { if (alive) setError(err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const byTopic = groupByTopic(lessons);
  const topics = VIDEO_TOPICS.filter(tpc => byTopic[tpc.id]?.length);

  return { lessons, byTopic, topics, loading, error };
}
