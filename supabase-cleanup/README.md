# Supabase Cleanup & Health Monitoring

## What's here

- `drop-unused-indexes.sql` — review-only DROP statements for ~50 unused indexes
  flagged by the Supabase performance advisor. All commented out; uncomment
  per section after review.

## Automated health check

`.github/workflows/supabase-health-check.yml` runs `scripts/check-supabase-advisors.mjs`
daily at 09:00 ICT against the live Supabase project. It opens (or updates) a
GitHub issue when it detects:

- RLS-disabled tables in the `public` schema (critical security)
- Unindexed foreign keys (performance)

If a future run finds the project healthy, it automatically closes the existing
issue with a confirmation comment.

### Setup (one-time)

1. **Create a Supabase personal access token**
   https://supabase.com/dashboard/account/tokens

2. **Add it as a GitHub Actions secret**
   Repository → Settings → Secrets and variables → Actions →
   New repository secret:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: `sbp_...`

3. **Add the project ref as a repository variable** (not secret — it's not sensitive)
   Same page → Variables tab → New repository variable:
   - Name: `SUPABASE_PROJECT_REF`
   - Value: `elyyijlcjfvhxbpzscnv`  (emr-ai-clinic)

4. **Trigger a manual run** to verify
   Actions → Supabase Health Check → Run workflow

### Cost

- GitHub-hosted runner: ~30 seconds per run × 30 runs/month ≈ free tier
- Supabase Management API: free

### Stopping the workflow

Delete `.github/workflows/supabase-health-check.yml`, or disable it via
Actions → Supabase Health Check → … → Disable workflow.
