# Supabase Cleanup & Health Monitoring

## What's here

- `drop-unused-indexes.sql` — review-only DROP statements for ~50 unused indexes
  flagged by the Supabase performance advisor. All commented out; uncomment
  per section after review.

## Automated health check

`.github/workflows/supabase-health-check.yml` runs
`scripts/check-supabase-advisors.mjs` daily at 09:00 ICT against every
Supabase project listed in the workflow's matrix (one parallel job per
project). For each project it opens (or updates) a separate GitHub issue
when it detects:

- **RLS-disabled tables** in the `public` schema (CRITICAL)
- **SECURITY DEFINER views** that bypass caller RLS (CRITICAL)
- Unindexed foreign keys (informational — logged but does not open an issue
  on its own)

If a future run finds the project healthy, the corresponding issue is
auto-closed with a confirmation comment.

### Currently monitored projects

| Name | Ref |
| --- | --- |
| emr-ai-clinic | `elyyijlcjfvhxbpzscnv` |
| pharmroo | `xdafacvqfqkicaxfhwom` |
| jia-unified | `tpoiyykbgsgnrdwzgzvn` |
| roodee | `oijpocbsyqdkorvjylbi` |
| morroo | `knxidnzexqehusndquqg` |
| jialucksa-crm | `cxlpazuwsajcjaidzupf` |

To add or remove a project, edit the `matrix.project` list in the workflow.

### Setup (one-time)

1. **Create a Supabase personal access token**
   https://supabase.com/dashboard/account/tokens
   (token must have access to all projects in the matrix)

2. **Add it as a GitHub Actions secret**
   Repository → Settings → Secrets and variables → Actions →
   New repository secret:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: `sbp_...`

3. **Trigger a manual run** to verify
   Actions → Supabase Health Check → Run workflow

### Cost

- GitHub-hosted runner: ~30 seconds per run × 30 runs/month ≈ free tier
- Supabase Management API: free

### Stopping the workflow

Delete `.github/workflows/supabase-health-check.yml`, or disable it via
Actions → Supabase Health Check → … → Disable workflow.
