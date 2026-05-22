-- ============================================================================
-- Unused Index Cleanup Script — Supabase project: emr-ai-clinic
-- Source: Supabase performance advisor (lint 0005_unused_index)
-- Generated: 2026-05-22
--
-- HOW TO USE:
--   1. Review each section carefully
--   2. Uncomment the DROP statements you want to apply
--   3. Run in a transaction first (BEGIN; ... ROLLBACK;) to verify nothing breaks
--   4. Apply via supabase migration or psql against the live DB
--
-- NOTE: An index showing as "unused" only means it has not been used since the
-- last pg_stat_reset(). If the feature using it has not been exercised yet
-- (e.g. new admin page, rare report), the index may still be needed.
-- ============================================================================


-- ============================================================================
-- SECTION 1: DO NOT DROP — Constraint-backed index
-- ============================================================================
-- `appointments_no_overlap` is the index backing an EXCLUSION CONSTRAINT
-- that prevents double-booking. Dropping it removes the constraint.
-- DO NOT DROP THIS.
--
-- CREATE INDEX appointments_no_overlap ON public.appointments
--   USING gist (clinic_id, user_id, tsrange(scheduled_at, ...))
--   WHERE (user_id IS NOT NULL AND status NOT IN ('cancelled','no_show'))


-- ============================================================================
-- SECTION 2: REVIEW BEFORE DROPPING — Search / trigram (GIN) indexes
-- ============================================================================
-- These power ILIKE / similarity search on master data lookups.
-- If you have a "search drug/supply/procedure by name" feature anywhere
-- (autocomplete, EMR drug picker, billing item picker), KEEP THEM.
-- They appear unused only because pg_stat_reset was recent OR the search
-- feature hasn't been exercised in the stats window.

-- DROP INDEX IF EXISTS public.drug_masters_indication_trgm_idx;
-- DROP INDEX IF EXISTS public.supply_masters_name_trgm_idx;
-- DROP INDEX IF EXISTS public.supply_masters_name_en_trgm_idx;
-- DROP INDEX IF EXISTS public.procedure_masters_name_trgm_idx;
-- DROP INDEX IF EXISTS public.procedure_masters_name_en_trgm_idx;


-- ============================================================================
-- SECTION 3: REVIEW — Partial indexes (filtered, likely intentional)
-- ============================================================================
-- These have a WHERE clause and are small/targeted. Often used by background
-- jobs (auto-purge, advice listing). Verify before dropping.

-- DROP INDEX IF EXISTS public.clinics_advice_listed_idx;       -- WHERE advice_listed = true
-- DROP INDEX IF EXISTS public.visits_auto_purge_at_idx;        -- WHERE auto_purge_at IS NOT NULL


-- ============================================================================
-- SECTION 4: PROBABLY SAFE — Recently-created FK indexes (just added)
-- ============================================================================
-- These were just created (this session) to fix unindexed-FK warnings.
-- They will show as "unused" until queries exercise them. DO NOT drop now —
-- re-evaluate after 2–4 weeks of normal traffic.

-- DROP INDEX IF EXISTS pocket.drug_favorites_drug_id_idx;
-- DROP INDEX IF EXISTS public.advice_referrals_advice_user_id_idx;
-- DROP INDEX IF EXISTS public.diagnoses_diagnosed_by_idx;
-- DROP INDEX IF EXISTS public.emergency_access_patient_id_idx;
-- DROP INDEX IF EXISTS public.emergency_access_user_id_idx;
-- DROP INDEX IF EXISTS public.patients_primary_doctor_id_idx;
-- DROP INDEX IF EXISTS public.prescriptions_prescribed_by_idx;
-- DROP INDEX IF EXISTS public.public_qa_api_key_id_idx;
-- DROP INDEX IF EXISTS public.stock_movements_stock_id_idx;
-- DROP INDEX IF EXISTS public.users_clinic_id_idx;
-- DROP INDEX IF EXISTS public.visits_user_id_idx;


-- ============================================================================
-- SECTION 5: CANDIDATES FOR DROP — Plain btree, app-level features
-- ============================================================================
-- These look like leftover indexes from features that never shipped or
-- query patterns that changed. Safe to drop if the corresponding feature
-- is confirmed inactive. Run with audit_logs first to check.

-- --- Pocket schema (selfcare/training/doctor billing) ---
-- DROP INDEX IF EXISTS pocket.selfcare_logs_doctor_id_created_at_idx;
-- DROP INDEX IF EXISTS pocket.training_attempts_doctor_id_started_at_idx;
-- DROP INDEX IF EXISTS pocket.doctor_invoices_doctor_id_issued_at_idx;

-- --- Clinic-scoped list indexes (likely redundant with composite indexes) ---
-- DROP INDEX IF EXISTS public.anc_records_clinic_id_idx;
-- DROP INDEX IF EXISTS public.growth_records_clinic_id_idx;
-- DROP INDEX IF EXISTS public.vaccinations_clinic_id_idx;
-- DROP INDEX IF EXISTS public.consents_clinic_id_idx;
-- DROP INDEX IF EXISTS public.lab_results_clinic_id_idx;
-- DROP INDEX IF EXISTS public.medical_images_clinic_id_idx;
-- DROP INDEX IF EXISTS public.diagnoses_clinic_id_idx;
-- DROP INDEX IF EXISTS public.prescriptions_clinic_id_idx;
-- DROP INDEX IF EXISTS public.vitals_clinic_id_idx;
-- DROP INDEX IF EXISTS public.drug_stocks_clinic_id_idx;
-- DROP INDEX IF EXISTS public.drug_master_feedbacks_clinic_id_idx;
-- DROP INDEX IF EXISTS public.idx_clinics_parent_clinic_id;

-- --- Composite indexes for list pages / reports ---
-- DROP INDEX IF EXISTS public.consultations_clinic_id_created_at_idx;
-- DROP INDEX IF EXISTS public.patients_clinic_id_created_at_idx;
-- DROP INDEX IF EXISTS public.patients_clinic_id_primary_doctor_id_idx;
-- DROP INDEX IF EXISTS public.patients_clinic_id_id_card_index_idx;
-- DROP INDEX IF EXISTS public.patients_clinic_id_phone_index_idx;
-- DROP INDEX IF EXISTS public.visits_clinic_id_status_idx;
-- DROP INDEX IF EXISTS public.appointments_clinic_id_status_idx;
-- DROP INDEX IF EXISTS public.appointments_patient_id_scheduled_at_idx;
-- DROP INDEX IF EXISTS public.invoices_clinic_id_issued_at_idx;
-- DROP INDEX IF EXISTS public.invoices_stripe_session_id_idx;
-- DROP INDEX IF EXISTS public.referrals_clinic_id_referred_at_idx;
-- DROP INDEX IF EXISTS public.advice_referrals_clinic_id_created_at_idx;
-- DROP INDEX IF EXISTS public.advice_invoices_advice_user_id_issued_at_idx;
-- DROP INDEX IF EXISTS public.advice_messages_session_id_created_at_idx;
-- DROP INDEX IF EXISTS public.ai_conversations_clinic_id_created_at_idx;
-- DROP INDEX IF EXISTS public.audit_logs_clinic_id_timestamp_idx;
-- DROP INDEX IF EXISTS public.audit_logs_user_id_timestamp_idx;
-- DROP INDEX IF EXISTS public.consents_patient_id_consent_type_idx;
-- DROP INDEX IF EXISTS public.diagnoses_visit_id_idx;
-- DROP INDEX IF EXISTS public.prescriptions_visit_id_idx;
-- DROP INDEX IF EXISTS public.medical_images_visit_id_idx;
-- DROP INDEX IF EXISTS public.vitals_visit_id_idx;
-- DROP INDEX IF EXISTS public.visit_charges_service_item_id_idx;
-- DROP INDEX IF EXISTS public.ckd_visits_ckd_patient_id_idx;
-- DROP INDEX IF EXISTS public.diet_plans_patient_id_idx;
-- DROP INDEX IF EXISTS public.security_quote_requests_clinic_id_status_idx;
-- DROP INDEX IF EXISTS public.security_quote_requests_status_created_at_idx;
-- DROP INDEX IF EXISTS public.emergency_access_lookup_idx;

-- --- Single-column flag indexes (low selectivity, rarely useful) ---
-- DROP INDEX IF EXISTS public.api_keys_active_idx;
-- DROP INDEX IF EXISTS public.users_active_idx;
-- DROP INDEX IF EXISTS public.diet_plans_is_template_idx;
-- DROP INDEX IF EXISTS public.ckd_patients_stage_idx;
-- DROP INDEX IF EXISTS public.drug_masters_trade_name_idx;
-- DROP INDEX IF EXISTS public.drug_master_feedbacks_master_id_idx;
-- DROP INDEX IF EXISTS public.drug_master_feedbacks_status_idx;
-- DROP INDEX IF EXISTS public.knowledge_tips_date_idx;
-- DROP INDEX IF EXISTS public.daily_tips_active_date_idx;
-- DROP INDEX IF EXISTS public.public_qa_question_hash_idx;
-- DROP INDEX IF EXISTS public.public_qa_created_at_idx;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Before dropping, sanity-check usage with these queries:
--
--   -- Confirm an index really has 0 scans:
--   SELECT relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
--   FROM pg_stat_user_indexes
--   WHERE indexrelname = 'INDEX_NAME_HERE';
--
--   -- Find which queries the planner would use a specific index for (sample):
--   EXPLAIN ANALYZE SELECT ... FROM table WHERE ...;
--
--   -- Reset stats and observe over 1–2 weeks of normal traffic:
--   SELECT pg_stat_reset();
