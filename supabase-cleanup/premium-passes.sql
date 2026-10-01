-- Prep Pass (เนื้อหาเสียเงิน) — ดู docs/premium-pass.md
-- รันบนโปรเจกต์ของแอปนี้ (elyyijlcjfvhxbpzscnv) ครั้งเดียว; เพิ่มตาราง/ฟังก์ชันใหม่อย่างเดียว ไม่แตะของเดิม
-- เข้าถึงได้เฉพาะ service role (api/premium/*) — RLS เปิด ไม่มี policy

create table if not exists public.premium_passes (
  id uuid primary key default gen_random_uuid(),
  hub_sub text not null,                      -- บัญชี JIA (sub ของ Hub passport)
  plan text not null,                         -- id ใน src/config/premiumPlans.js
  amount_thb integer not null default 0,      -- ยอดที่ Stripe เก็บจริง
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  stripe_session_id text not null unique,     -- กัน webhook ซ้ำ
  created_at timestamptz not null default now()
);

create index if not exists premium_passes_sub_expires_idx
  on public.premium_passes (hub_sub, expires_at desc);

alter table public.premium_passes enable row level security;

-- ให้ pass ต่อท้าย pass เดิมที่ยังไม่หมด (ซื้อซ้ำ = ต่ออายุ) และ idempotent ต่อ checkout session
create or replace function public.grant_premium_pass(
  p_sub text, p_plan text, p_days integer, p_amount_thb integer, p_session text
) returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing timestamptz;
  v_start timestamptz;
  v_expires timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('premium_pass:' || p_sub));

  select expires_at into v_existing from premium_passes where stripe_session_id = p_session;
  if found then
    return v_existing;
  end if;

  select greatest(now(), coalesce(max(expires_at), now())) into v_start
    from premium_passes where hub_sub = p_sub;
  v_expires := v_start + make_interval(days => p_days);

  insert into premium_passes (hub_sub, plan, amount_thb, starts_at, expires_at, stripe_session_id)
  values (p_sub, p_plan, coalesce(p_amount_thb, 0), v_start, v_expires, p_session);

  return v_expires;
end;
$$;

revoke all on function public.grant_premium_pass(text, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.grant_premium_pass(text, text, integer, integer, text) to service_role;
