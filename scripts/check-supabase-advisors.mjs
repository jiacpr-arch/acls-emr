#!/usr/bin/env node
/**
 * Supabase Health Check
 *
 * Queries the Supabase Management API to detect critical database issues
 * (RLS disabled on public tables, unindexed foreign keys, etc.) and opens
 * a GitHub issue when problems are found.
 *
 * Required env vars:
 *   SUPABASE_ACCESS_TOKEN  - Personal access token (https://supabase.com/dashboard/account/tokens)
 *   SUPABASE_PROJECT_REF   - Project ref (e.g. elyyijlcjfvhxbpzscnv for emr-ai-clinic)
 *   GITHUB_TOKEN           - Provided automatically by GitHub Actions
 *   GITHUB_REPOSITORY      - Provided automatically (owner/repo)
 *
 * Exit codes:
 *   0 = no critical issues
 *   1 = critical issues found (issue opened/updated)
 *   2 = script error
 */

const MGMT_API = 'https://api.supabase.com/v1';
const ISSUE_TITLE = '🚨 Supabase health check: critical issues detected';
const ISSUE_LABEL = 'supabase-health';

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(2);
  }
  return v;
}

async function runSql(token, ref, query) {
  const res = await fetch(`${MGMT_API}/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Supabase API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function checkRlsDisabled(token, ref) {
  const rows = await runSql(
    token,
    ref,
    `SELECT schemaname || '.' || tablename AS rel
       FROM pg_tables
      WHERE schemaname = 'public'
        AND rowsecurity = false
        AND tablename NOT LIKE '\\_%'
      ORDER BY tablename`,
  );
  return rows.map((r) => r.rel);
}

async function checkUnindexedForeignKeys(token, ref) {
  const rows = await runSql(
    token,
    ref,
    `WITH fk AS (
       SELECT conrelid AS rel, conname, conkey, contype
         FROM pg_constraint
        WHERE contype = 'f'
     )
     SELECT n.nspname || '.' || c.relname AS rel,
            fk.conname AS constraint_name
       FROM fk
       JOIN pg_class c ON c.oid = fk.rel
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname IN ('public', 'pocket')
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
           WHERE i.indrelid = fk.rel
             AND (i.indkey::int2[])[0:array_length(fk.conkey,1)-1] @> fk.conkey
        )
      ORDER BY n.nspname, c.relname`,
  );
  return rows.map((r) => `${r.rel} (${r.constraint_name})`);
}

async function findExistingIssue(repoToken, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/issues?state=open&labels=${ISSUE_LABEL}`,
    { headers: { Authorization: `Bearer ${repoToken}`, Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) throw new Error(`GitHub list ${res.status}: ${await res.text()}`);
  const issues = await res.json();
  return issues.find((i) => i.title === ISSUE_TITLE);
}

async function upsertIssue(repoToken, repo, body, existing) {
  const url = existing
    ? `https://api.github.com/repos/${repo}/issues/${existing.number}`
    : `https://api.github.com/repos/${repo}/issues`;
  const method = existing ? 'PATCH' : 'POST';
  const payload = existing
    ? { body }
    : { title: ISSUE_TITLE, body, labels: [ISSUE_LABEL] };
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${repoToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`GitHub ${method} ${res.status}: ${await res.text()}`);
  return res.json();
}

async function closeIssue(repoToken, repo, existing) {
  await fetch(`https://api.github.com/repos/${repo}/issues/${existing.number}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${repoToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: 'closed', state_reason: 'completed' }),
  });
  await fetch(`https://api.github.com/repos/${repo}/issues/${existing.number}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${repoToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: '✅ Health check passed on next run. Closing.' }),
  });
}

function formatIssueBody({ rlsDisabled, unindexedFks, projectRef, runUrl }) {
  const lines = [
    `Automated health check found issues in Supabase project \`${projectRef}\`.`,
    '',
    `_Last run: ${new Date().toISOString()} — [workflow run](${runUrl})_`,
    '',
  ];
  if (rlsDisabled.length) {
    lines.push(
      '## 🔴 RLS disabled on public tables (CRITICAL)',
      '',
      'These tables are exposed via PostgREST without row-level security:',
      '',
      ...rlsDisabled.map((t) => `- \`${t}\``),
      '',
      '**Fix:** enable RLS + add policy. Example:',
      '```sql',
      'ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY deny_all ON public.<table>',
      "  AS PERMISSIVE FOR ALL TO public USING (false) WITH CHECK (false);",
      '```',
      '',
    );
  }
  if (unindexedFks.length) {
    lines.push(
      '## 🟡 Unindexed foreign keys',
      '',
      ...unindexedFks.map((t) => `- ${t}`),
      '',
    );
  }
  lines.push(
    '---',
    'Triggered by `.github/workflows/supabase-health-check.yml`. ' +
      'To stop these issues, fix the underlying problems or close this issue and remove the workflow.',
  );
  return lines.join('\n');
}

async function main() {
  const supaToken = required('SUPABASE_ACCESS_TOKEN');
  const projectRef = required('SUPABASE_PROJECT_REF');
  const repoToken = required('GITHUB_TOKEN');
  const repo = required('GITHUB_REPOSITORY');
  const runUrl =
    `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}`;

  console.log(`Checking project ${projectRef}...`);

  const [rlsDisabled, unindexedFks] = await Promise.all([
    checkRlsDisabled(supaToken, projectRef),
    checkUnindexedForeignKeys(supaToken, projectRef),
  ]);

  console.log(`RLS-disabled tables: ${rlsDisabled.length}`);
  console.log(`Unindexed FKs: ${unindexedFks.length}`);

  const critical = rlsDisabled.length > 0;
  const existing = await findExistingIssue(repoToken, repo);

  if (!critical && unindexedFks.length === 0) {
    if (existing) {
      console.log(`No issues found. Closing existing issue #${existing.number}.`);
      await closeIssue(repoToken, repo, existing);
    } else {
      console.log('All clear.');
    }
    return 0;
  }

  const body = formatIssueBody({ rlsDisabled, unindexedFks, projectRef, runUrl });
  const issue = await upsertIssue(repoToken, repo, body, existing);
  console.log(`Issue ${existing ? 'updated' : 'created'}: ${issue.html_url}`);
  return critical ? 1 : 0;
}

main().then(
  (code) => process.exit(code ?? 0),
  (err) => {
    console.error(err);
    process.exit(2);
  },
);
