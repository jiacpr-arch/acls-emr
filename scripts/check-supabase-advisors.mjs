#!/usr/bin/env node
/**
 * Supabase Health Check (multi-project)
 *
 * Queries the Supabase Management API to detect critical issues and opens
 * (or updates / closes) a GitHub issue per project.
 *
 * Required env vars:
 *   SUPABASE_ACCESS_TOKEN  - Personal access token
 *   GITHUB_TOKEN           - Provided automatically by GitHub Actions
 *   GITHUB_REPOSITORY      - Provided automatically (owner/repo)
 *
 * Project selection (one of):
 *   SUPABASE_PROJECT_REF   - Single project (legacy mode)
 *   SUPABASE_PROJECT_NAME  - Optional friendly name for the single project
 *   PROJECT_REF + PROJECT_NAME - Per-job matrix mode
 *
 * Exit codes:
 *   0 = no critical issues (or only issues that don't warrant an alert)
 *   1 = critical issues found (issue opened/updated)
 *   2 = script error
 */

const MGMT_API = 'https://api.supabase.com/v1';
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

async function checkSecurityDefinerViews(token, ref) {
  // Views default to SECURITY DEFINER semantics in Postgres — RLS on
  // underlying tables is evaluated as the view owner, not the caller.
  // The fix is to set `security_invoker=on` in reloptions. This query
  // flags any public-schema view/matview that has NOT opted in.
  const rows = await runSql(
    token,
    ref,
    `SELECT n.nspname || '.' || c.relname AS rel
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('v','m')
        AND n.nspname = 'public'
        AND NOT (
          COALESCE(c.reloptions, '{}') && ARRAY['security_invoker=true','security_invoker=on']
        )
      ORDER BY n.nspname, c.relname`,
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
      WHERE n.nspname NOT IN ('pg_catalog','information_schema','pg_toast','auth','storage','realtime','supabase_functions','vault','extensions','graphql','graphql_public','pgsodium','pgsodium_masks')
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
           WHERE i.indrelid = fk.rel
             AND (i.indkey::int2[])[0:array_length(fk.conkey,1)-1] @> fk.conkey
        )
      ORDER BY n.nspname, c.relname`,
  );
  return rows.map((r) => `${r.rel} (${r.constraint_name})`);
}

async function findExistingIssue(repoToken, repo, title) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/issues?state=open&labels=${ISSUE_LABEL}&per_page=100`,
    { headers: { Authorization: `Bearer ${repoToken}`, Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) throw new Error(`GitHub list ${res.status}: ${await res.text()}`);
  const issues = await res.json();
  return issues.find((i) => i.title === title);
}

async function upsertIssue(repoToken, repo, title, body, existing) {
  const url = existing
    ? `https://api.github.com/repos/${repo}/issues/${existing.number}`
    : `https://api.github.com/repos/${repo}/issues`;
  const method = existing ? 'PATCH' : 'POST';
  const payload = existing ? { body } : { title, body, labels: [ISSUE_LABEL] };
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

function formatIssueBody({ rlsDisabled, secDefViews, unindexedFks, projectRef, projectName, runUrl }) {
  const lines = [
    `Automated health check found issues in Supabase project \`${projectName}\` (\`${projectRef}\`).`,
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
      '**Fix:**',
      '```sql',
      'ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY deny_all ON public.<table>',
      "  AS PERMISSIVE FOR ALL TO public USING (false) WITH CHECK (false);",
      '```',
      '',
    );
  }
  if (secDefViews.length) {
    lines.push(
      '## 🔴 SECURITY DEFINER views (CRITICAL)',
      '',
      'These views run with creator privileges, bypassing the caller\'s RLS:',
      '',
      ...secDefViews.map((v) => `- \`${v}\``),
      '',
      '**Fix:** recreate the view with `WITH (security_invoker=on)` or change to a regular view.',
      '',
    );
  }
  if (unindexedFks.length) {
    lines.push(
      '## 🟡 Unindexed foreign keys (informational)',
      '',
      ...unindexedFks.map((t) => `- ${t}`),
      '',
    );
  }
  lines.push(
    '---',
    'Triggered by `.github/workflows/supabase-health-check.yml`.',
  );
  return lines.join('\n');
}

async function main() {
  const supaToken = required('SUPABASE_ACCESS_TOKEN');
  const repoToken = required('GITHUB_TOKEN');
  const repo = required('GITHUB_REPOSITORY');

  const projectRef = process.env.PROJECT_REF ?? process.env.SUPABASE_PROJECT_REF;
  const projectName =
    process.env.PROJECT_NAME ?? process.env.SUPABASE_PROJECT_NAME ?? projectRef;
  if (!projectRef) {
    console.error('Missing PROJECT_REF or SUPABASE_PROJECT_REF');
    process.exit(2);
  }
  const issueTitle = `🚨 Supabase health check: ${projectName}`;
  const runUrl =
    `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}`;

  console.log(`Checking project ${projectName} (${projectRef})...`);

  const [rlsDisabled, secDefViews, unindexedFks] = await Promise.all([
    checkRlsDisabled(supaToken, projectRef),
    checkSecurityDefinerViews(supaToken, projectRef),
    checkUnindexedForeignKeys(supaToken, projectRef),
  ]);

  console.log(`RLS-disabled tables: ${rlsDisabled.length}`);
  console.log(`SECURITY DEFINER views: ${secDefViews.length}`);
  console.log(`Unindexed FKs: ${unindexedFks.length}`);

  const critical = rlsDisabled.length > 0 || secDefViews.length > 0;
  const existing = await findExistingIssue(repoToken, repo, issueTitle);

  if (!critical && unindexedFks.length === 0) {
    if (existing) {
      console.log(`All clear. Closing existing issue #${existing.number}.`);
      await closeIssue(repoToken, repo, existing);
    } else {
      console.log('All clear.');
    }
    return 0;
  }

  // Only open an issue when we have something critical to flag.
  // Unindexed FK alone is too noisy across projects.
  if (!critical) {
    console.log(`Non-critical findings only (${unindexedFks.length} unindexed FKs). No issue opened.`);
    return 0;
  }

  const body = formatIssueBody({
    rlsDisabled,
    secDefViews,
    unindexedFks,
    projectRef,
    projectName,
    runUrl,
  });
  const issue = await upsertIssue(repoToken, repo, issueTitle, body, existing);
  console.log(`Issue ${existing ? 'updated' : 'created'}: ${issue.html_url}`);
  return 1;
}

main().then(
  (code) => process.exit(code ?? 0),
  (err) => {
    console.error(err);
    process.exit(2);
  },
);
