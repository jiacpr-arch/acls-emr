import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://elyyijlcjfvhxbpzscnv.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_ie9hrnsxONcotMSqcQF_Og_zXj-8sIp';

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'acls-emr-auth',
  },
});

export const isSupabaseConfigured = () => Boolean(url && anonKey);
