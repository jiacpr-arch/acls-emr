---
name: verify
description: Build/launch/drive recipe for verifying changes in this Vite React app (acls-emr), including the Code Blue Sim game at /sim.
---

# Verify recipe — acls-emr

Vite + React SPA. No test suite that covers UI flows — verify by driving the app.

## Build & launch

```bash
npm ci                      # first time in a fresh container
npx eslint <files>          # lint
npm run build               # vite build (~1 min)
npx vite --port 5199 --strictPort   # dev server; routes: /, /sim, /scenarios, /pre-course, ...
```

Course mode is a build-time flag: default `acls`; set `VITE_COURSE_MODE=bls` for BLS-only routes.

## Driving with Playwright (headless)

- Chromium binary: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (pass as `executablePath`; do NOT `playwright install`).
- Install `playwright` npm package in a scratch dir, not the repo.
- Use a mobile-ish viewport (420x900) — the app is mobile-first.

### Code Blue Sim (/sim) selectors

- Case cards: `button.cbs-case` (disabled = locked). Track headers: `.cbs-track-name`.
- Intro screen start button: `button.cbs-btn-main` with text `รับเคส`.
- Advance dialogue: click `.cbs-dlg` (force: true). Interject/shout nodes auto-advance — just wait.
- Answer a decision point: `button.cbs-choice` (option label text includes the scenario data's `label`).
- End screen appears when no `.cbs-dlg` and no `button.cbs-choice` remain; contains debrief + grade.
- Unlock state for probing: localStorage key `acls_codeblue_cleared` = JSON array of cleared scenario ids (e.g. `["stroke-ischemic-basic-01"]`). Hi-scores: `acls_codeblue_hiscore*`, grades/awards: `acls_codeblue_grades` / `acls_codeblue_awards`.
- To auto-play a case correctly, import its scenario file and pick options where `ok: true`.

## Gotchas

- Supabase calls fail in the sandbox (proxy) — the sim falls back to built-in scenarios; ignore `ERR_TUNNEL_CONNECTION_FAILED` console noise on /sim.
- Scenario data lives in two separate systems: `src/data/codeBlueScenarios.js` (+ `src/data/scenarios/*.js`) feeds the /sim game; `src/data/scenarios.js` feeds /scenarios → Recording (EMR drill).
