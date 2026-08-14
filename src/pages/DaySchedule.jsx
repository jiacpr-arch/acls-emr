import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DAY_META, DAY_BLOCKS, STATIONS, PASS_RULES, CONTINGENCIES,
  toMinutes, findCurrentBlock,
} from '../data/blsDaySchedule';
import {
  ChevronLeft, ScanLine, Clock, Coffee, Wrench, ClipboardCheck,
  AlertTriangle, ChevronDown,
} from 'lucide-react';

// หน้า "ตารางวันนี้" สำหรับอาจารย์เปิดบนมือถือระหว่างคุมฐาน — ไฮไลต์ช่วงที่
// กำลังดำเนินอยู่ตามนาฬิกาเครื่อง แล้วเลื่อนดูรายละเอียดฐาน/แผนสำรองได้
// ข้อมูลทั้งหมดเป็น static (src/data/blsDaySchedule.js) จึงเปิดได้แม้เน็ตล่ม
const KIND_META = {
  prep:  { label: 'เตรียมงาน', Icon: Wrench, cls: 'text-warning' },
  teach: { label: 'สอน', Icon: Clock, cls: 'text-info' },
  break: { label: 'พัก', Icon: Coffee, cls: 'text-text-muted' },
  exam:  { label: 'สอบ', Icon: ClipboardCheck, cls: 'text-danger' },
};

export default function DaySchedule() {
  const navigate = useNavigate();

  // นาทีจากเที่ยงคืนของเครื่อง — อัปเดตทุก 30 วินาทีเพื่อให้ไฮไลต์ขยับเอง
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const currentIdx = useMemo(() => findCurrentBlock(nowMin), [nowMin]);
  const current = currentIdx >= 0 ? DAY_BLOCKS[currentIdx] : null;
  const next = currentIdx >= 0
    ? DAY_BLOCKS[currentIdx + 1]
    : DAY_BLOCKS.find(b => toMinutes(b.start) > nowMin);

  const minsLeft = current ? toMinutes(current.end) - nowMin : null;

  const [openStation, setOpenStation] = useState(null);

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course/cohort')}
        className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับหน้าอาจารย์
      </button>

      <div>
        <h1 className="text-title text-text-primary">{DAY_META.title}</h1>
        <p className="text-caption text-text-muted">{DAY_META.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 dash-card !p-3">
        {DAY_META.facts.map(f => (
          <div key={f.label} className="text-center">
            <div className="text-body-strong text-text-primary leading-tight">{f.value}</div>
            <div className="text-2xs text-text-muted leading-tight">{f.label}</div>
          </div>
        ))}
      </div>

      {/* ตอนนี้ถึงไหนแล้ว — การ์ดใหญ่สุดของหน้า อาจารย์เหลือบดูแวบเดียวต้องรู้ */}
      <div className="dash-card space-y-2"
        style={{ borderColor: current ? 'var(--color-info)' : undefined }}>
        <div className="text-overline">ตอนนี้</div>
        {current ? (
          <>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-title text-text-primary">{current.title}</span>
              <span className="text-caption text-text-muted text-numeric">
                {current.start}–{current.end}
              </span>
            </div>
            <div className="text-caption text-info">
              เหลืออีก {minsLeft} นาที
              {next && <span className="text-text-muted"> · ต่อไป {next.title} {next.start}</span>}
            </div>
            {current.lines.map(l => (
              <p key={l} className="text-caption text-text-secondary">{l}</p>
            ))}
          </>
        ) : (
          <div className="text-body text-text-secondary">
            {next
              ? <>ยังไม่ถึงเวลาเริ่ม — ช่วงแรกคือ <b>{next.title}</b> เวลา {next.start}</>
              : 'จบตารางของวันแล้ว'}
          </div>
        )}
      </div>

      <button onClick={() => navigate('/pre-course/checkin')}
        className="btn btn-primary btn-block">
        <ScanLine size={16} strokeWidth={2.2} /> ไปหน้าเช็คชื่อเข้าฐาน
      </button>

      {/* ลำดับวัน */}
      <div className="space-y-2">
        <div className="text-overline px-1">ลำดับวัน</div>
        <div className="dash-card !p-0 overflow-hidden">
          {DAY_BLOCKS.map((b, i) => {
            const meta = KIND_META[b.kind];
            const done = nowMin >= toMinutes(b.end);
            const isNow = i === currentIdx;
            return (
              <div key={`${b.start}-${b.title}`}
                className="flex gap-3 px-3 py-2.5 border-b border-border last:border-b-0"
                style={{
                  background: isNow ? 'color-mix(in srgb, var(--color-info) 8%, transparent)' : undefined,
                  opacity: done && !isNow ? 0.5 : 1,
                }}>
                <div className="text-caption text-numeric text-text-muted shrink-0 pt-0.5"
                  style={{ width: 44 }}>
                  {b.start}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <meta.Icon size={13} strokeWidth={2.2} className={meta.cls} />
                    <span className={`text-body-strong ${isNow ? 'text-info' : 'text-text-primary'}`}>
                      {b.title}
                    </span>
                    <span className="text-2xs text-text-muted text-numeric">
                      {toMinutes(b.end) - toMinutes(b.start)} น.
                    </span>
                  </div>
                  {b.lines.map(l => (
                    <p key={l} className="text-caption text-text-muted mt-0.5">{l}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ฐานฝึก — พับไว้ กดเปิดเฉพาะฐานที่ตัวเองคุม */}
      <div className="space-y-2">
        <div className="text-overline px-1">ฐานฝึก 4 ฐาน · ฐานละ 35 นาที</div>
        <div className="space-y-2">
          {STATIONS.map(s => {
            const open = openStation === s.key;
            return (
              <div key={s.key} className="dash-card !p-0 overflow-hidden">
                <button
                  onClick={() => setOpenStation(open ? null : s.key)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left">
                  <span className="w-8 h-8 inline-flex items-center justify-center bg-info/15 text-info text-body-strong shrink-0"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    {s.key}
                  </span>
                  <span className="flex-1 text-body-strong text-text-primary">{s.title}</span>
                  <ChevronDown size={16} strokeWidth={2.2}
                    className="text-text-muted shrink-0"
                    style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }} />
                </button>
                {open && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border pt-2.5">
                    <ul className="space-y-1">
                      {s.items.map(it => (
                        <li key={it} className="text-caption text-text-secondary flex gap-2">
                          <span className="text-text-muted">–</span><span>{it}</span>
                        </li>
                      ))}
                    </ul>

                    {s.subPlan && (
                      <div className="bg-bg-tertiary rounded-lg p-2.5 space-y-1">
                        <div className="text-overline">แบ่งเวลาในฐาน (นาทีที่)</div>
                        {s.subPlan.map(row => (
                          <div key={row.at} className="flex gap-2 text-caption">
                            <span className="text-numeric text-text-muted shrink-0" style={{ width: 44 }}>
                              {row.at}
                            </span>
                            <span className="text-text-secondary">{row.what}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {s.note && (
                      <p className="text-caption text-text-muted">{s.note}</p>
                    )}

                    <div className="border-t border-border pt-2">
                      <div className="text-overline">ต้องเห็นก่อนออกจากฐาน</div>
                      <p className="text-caption text-text-primary font-semibold">{s.gate}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* เกณฑ์ผ่าน */}
      <div className="space-y-2">
        <div className="text-overline px-1">เกณฑ์ผ่านทั้งหลักสูตร</div>
        <div className="dash-card !p-0 overflow-hidden">
          {PASS_RULES.map(r => (
            <div key={r.part}
              className="flex gap-3 px-3 py-2.5 border-b border-border last:border-b-0">
              <div className="min-w-0 flex-1">
                <div className="text-caption text-text-primary">{r.part}</div>
                <div className={`text-caption ${r.critical ? 'text-danger font-semibold' : 'text-text-muted'}`}>
                  {r.rule}
                </div>
              </div>
              <div className="text-2xs text-text-muted shrink-0 pt-0.5">{r.when}</div>
            </div>
          ))}
        </div>
        <p className="text-caption text-text-muted px-1">
          ครบทั้ง 4 บรรทัด ระบบจะออกใบประกาศนียบัตรฉบับสมบูรณ์ (อายุ 24 เดือน) ให้ดาวน์โหลดเองได้ทันที
        </p>
      </div>

      {/* แผนสำรอง */}
      <div className="space-y-2">
        <div className="text-overline px-1 flex items-center gap-1.5">
          <AlertTriangle size={12} strokeWidth={2.4} className="text-warning" />
          แผนสำรอง
        </div>
        <div className="dash-card !p-0 overflow-hidden">
          {CONTINGENCIES.map(c => (
            <div key={c.when} className="px-3 py-2.5 border-b border-border last:border-b-0">
              <div className="text-caption text-text-primary font-semibold">{c.when}</div>
              <div className="text-caption text-text-muted">{c.then}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-2xs text-text-muted px-1">
        ตารางนี้เก็บอยู่ในแอป เปิดได้แม้ไม่มีเน็ต · ต้นฉบับฉบับเต็มอยู่ที่ docs/bls-teaching-schedule.md
      </p>
    </div>
  );
}
