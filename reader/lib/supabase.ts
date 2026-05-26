import { createClient } from "@supabase/supabase-js";

// Reuses the existing ACLS Supabase project. These are public client-side
// values (same as the original acls-emr app) with hardcoded fallbacks so the
// app runs without a .env.local. Read-only, anonymous access only.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://elyyijlcjfvhxbpzscnv.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_ie9hrnsxONcotMSqcQF_Og_zXj-8sIp";

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
