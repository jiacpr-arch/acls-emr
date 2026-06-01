-- ============================================================================
-- News feed: add is_evergreen flag — Supabase project: emr-ai-clinic
-- Generated: 2026-06-01
--
-- WHY:
--   The daily news cron (api/news/fetch-daily.js) was increasingly inserting
--   old-dated guideline/research explainers. Because the feed is sorted by
--   published_at, those items never reach the top, so the feed looked frozen
--   ("ข่าวเก่า ไม่อัปเดต") even though the cron ran every day.
--
--   We now separate genuine fresh news from evergreen reference material so the
--   reference items are kept but never bury fresh news.
--
-- STATUS: ALREADY APPLIED to the live emr-ai-clinic DB on 2026-06-01.
--   This file documents the change for traceability (the repo has no migrations
--   dir; schema is managed directly in Supabase, shared by acls + bls deploys).
-- ============================================================================

alter table public.news
  add column if not exists is_evergreen boolean not null default false;

-- Backfill: items whose publication date was already >30 days old at fetch time
-- are reference material, not fresh news.
update public.news
  set is_evergreen = true
  where is_evergreen = false
    and published_at < fetched_at - interval '30 days';

-- Supports the fresh-only homepage query and recency ordering.
create index if not exists news_evergreen_published_idx
  on public.news (is_evergreen, published_at desc);
