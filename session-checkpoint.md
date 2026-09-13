# Session Checkpoint - OrangeHRM

## LIVE Instance (source of truth, 2026-09-11)
- App: `https://orangehrm-app.onrender.com` — OrangeHRM 5.9, all migrations, login `Admin` / `Orangehrm@2026`
- Web: Render free `orangehrm-app` (Apache+PHP only, image `d63824c`) ← `victor-render2026/orangehrm-render` (SSH `~/.ssh/id_ed25519`)
- DB: Aiven free MySQL `mysql-339a7caa-orangehrm-db.a.aivencloud.com:23149`, db `orangehrm`, user `avnadmin` (pass in Render dashboard only); allowlist open; `sql_require_primary_key=OFF`
- Redeploy-safe: `start.sh` restores `lib/confs/Conf.php` + `key.ohrm` from env (`OHRM_DB_*` in Blueprint, `OHRM_DB_PASS` dashboard-only via `sync: false`); Apache runs as www-data (644/chown!)
- CI: `vars.BASE_URL` = Render URL; suite serial on CI (`workers: 1`), 60m job caps; API seed (`seed-data.spec.ts`) creates Alice Administrator + Tech Conference + claim

## Current State (2026-09-12)
- Suite hardening commits pushed (`9eec36f`, `6fa6cc8`, `9d17599`, `04ed8d1`, `67874d9`, `8f752c1`, `65011f6`); CI serial run in flight
- Known slow-suite mechanics: shared PHP session serializes same-session requests → no in-file `parallel`, generous waits (`waitForTable`, `expect.poll`, 30–60s), describe timeouts 180s on slow files
- Open: CI green confirmation; Stryker scope decision (783 mutants ≈ 1–2h); AGENTS.md Pi-section uncommitted (чужое окно? не трогать без спроса)

## Standing Notes
- Env: `export PATH="/usr/local/bin:$PATH"` + `source ~/.nvm/nvm.sh`; node/docker/llhttp in `/usr/local/bin` (`libllhttp.9.3.dylib` → `9.4.1` symlink)
- No-Go: no demo source edits, no secrets in code (Aiven pass lives in Render dashboard, mirrored here only), CI/CD changes need human OK
- `helpers/` + `playwright.config.ts` + `package.json` + `AGENTS.md` = ask-boundary; `e2e/` + `pom/` + `k6/` = free edit
- Local docker (`LOCAL=true`, `:8080`, MariaDB 10.11.4) is post-mutation — NOT a reference dataset; seed builds data via API on the target itself
- Positions-CV-CL checkpoints = чужое окно, не трогать

## Backlog (from Jul, still open)
1. `scripts/regression-advice.py` needs `GROQ_API_KEY` in GitHub Secrets
2. DB migration detection + rollback checks; dependency bump scan; config/env deploy verify; coverage mapping; CI Check Run; secret leak detector

## Archive — Jun–Aug 2026 (compressed, details superseded)
- **Envs:** demo `opensource-demo.orangehrmlive.com` (RETIRED 2026-09-11, unstable) → local docker 5.4→5.8.1→5.9 (`outputs/local-deployment.yml`) → Render+Aiven (live)
- **Claim API (reused by seed):** `POST /api/v2/claim/employees/{empNumber}/requests` + `PUT .../action {"action":"SUBMIT"}`; autocomplete bug → prefer API over `pressSequentially`
- **POM lessons:** `fillByLabel` select/textarea support; pencil `i.bi-pencil-fill` opens forms (cell clicks don't); checkbox not `.oxd-table-cell` (index from 0); routes: `/admin/viewSkills`, `/admin/viewJobTitleList`, `/admin/saveSystemUser`
- **Tags:** `@local` = needs seeded env (workspace-notifications 5.9-only, buzz/leave data-dependent); `@smoke` runs everywhere; `auth.spec` isolated in `auth` project; `loggedInPage` skips re-login if authenticated; storageState session ~24min idle → relogin in `BasePage.goto`
- **Allure TestOps:** removed (trial expired Jun); regression-advice workflow posts PR checklist instead
- **PWA-004:** `seed.spec.ts` → `e2e/.auth/admin.json` (gitignored)
- **Stryker 10.0.0:** `commandRunner.command` must be STRING; 783 mutants (admin 481 + auth 302); scope TBD
- **Autonoma:** gpt-4o $1.18 vs deepseek-v3.2 $3.62 (context wall 131K; KB needs 200K+); .md specs not executable; factory endpoints: `/buzz/shares/{id}/likes`, `/recruitment/candidates` (no vacancyId), `/api/v2/directory/employees`
- **Monitoring:** Grafana OrangeHRM coverage http://localhost:3003 (qa-automation-sandbox/monitoring)
- **Old Gotchas:** admin-create autocomplete "Invalid" on fresh installs; MAINT-002 isolation flake; llhttp symlink; demo DOM drift between sessions
- **Content:** Articles phase posts + carousels in `~/Articles` (see git log, not here)

---
## 2026-09-10 03:14 — Session Wrap-up

**What happened:**
- Stryker mutation testing configured and verified (`stryker.conf.json` — `commandRunner.command` as string, `--project chromium --grep 'ADMIN-API|AUTH-API'`)
- 783 mutants identified across `admin.spec.ts` (481) + `auth.spec.ts` (302)
- Stryker dry-run confirmed working — tests pass with proper filter
- OrangeHRM Docker deployment configs created for Render
- `docker-compose.yml`, `render-orangehrm.yaml`, `Dockerfile.render`, `supervisord.conf` committed (`687d2d2`)
- All passwords updated to `Orangehrm@2026` (not `admin123` from demo)
- Stryker cleanup completed (removed temp files from project root)

**Stryker status:** Configured, working, but 783 mutants = ~1-2h runtime. Need to reduce scope or accept runtime.

**Next:** Deploy OrangeHRM on Render tomorrow

## 2026-09-11 04:45 MSK — OrangeHRM LIVE on Render + Aiven MySQL ✅

**Result:** `https://orangehrm-app.onrender.com` installed (5.9, all migrations), login `Admin` / `Orangehrm@2026`, survives redeploys.

**Architecture (final):**
- Render free web service `orangehrm-app` (Apache + PHP only, NO local DB) ← `victor-render2026/orangehrm-render`
- DB: Aiven free MySQL (`mysql-339a7caa-orangehrm-db.a.aivencloud.com:23149`, db `orangehrm`, user `avnadmin`, 1GB/1GB) — same pattern as Buzzhive→Neon
- `start.sh` restores `lib/confs/Conf.php` + `key.ohrm` from env on boot (ephemeral FS!) — `OHRM_DB_*` in Blueprint, `OHRM_DB_PASS` via `sync: false` (dashboard-only, not in git)
- Debug pages (`aiven-test.php`, `install-log.php`) removed from image

**Gotchas solved:**
1. MariaDB-in-container dies OOM on 512MB free tier (even 16MB buffer pool) → dropped local DB entirely
2. Installer 2002 on Aiven host — cause was whitespace from copy-paste in Host/Port fields (diagnosed via `aiven-test.php`: DNS/TCP/PDO all OK from same container). Fix: retype manually + Existing Empty Database
3. Migration V3_3_3 fails 3750 — Aiven `sql_require_primary_key=ON` → set OFF in Aiven Advanced configuration
4. Post-redeploy blank login 500 — `key.ohrm` created root:600, Apache runs www-data → `chown www-data + chmod 644` both files (`d63824c`)
5. Blueprint `Failed sync` + `0 services selected` — service was created manually; deploy via service page Manual Deploy (Blueprint sync page also works: `/blueprint/<id>/sync/...`)
6. Free instance spins down on idle (+50s cold start) — CI/tests need generous timeouts (already 60s)

**Commits (`victor-render2026/orangehrm-render`, main):** `9adf75f` no-DB image → `f0e75a0` aiven-test diag → `7d26a13` install-log viewer → `7a1243e` Conf/key restore from env → `d63824c` www-data perms fix (LIVE)

**Aiven creds:** Service URI in Render dashboard; app DB `orangehrm`; IP allowlist = Open to all

**Next (needs user OK per AGENTS.md — config boundaries):**
- `playwright.config.ts` BASE_URL → Render URL (ask)
- `helpers/credentials.ts` — already handles `LOCAL=true` → `Orangehrm@2026` ✅ no change needed
- GitHub CI `vars.BASE_URL` → Render URL
- Decide: fork vs migrate (see discussion 2026-09-11)

**Agent warm-check 2026-09-11:** dashboard без сессии → HTTP 302 на логин за 0.67с (холодного сна нет). Caveats для one-pager: cold start 30–60с после idle (warm-up перед прогонами); фриз на конкретный деплой + no-redeploy на окно.
**Correction:** сид-данные НЕ сбрасываются при рестарте — БД на внешнем Aiven (persistent), из env восстанавливаются только `Conf.php`/`key.ohrm`. Перед раном проверять не сиды, а живость инстанса (cold start).
**Pending:** решение А (форк RENDER-режим) vs Б (миграция дефолта на Render) — за пользователем.

## 2026-09-11 05:10 MSK — Вариант Б внедрён, сид зелёный ✅

**Изменения (uncommitted, в работе):**
- `playwright.config.ts` — `export const RENDER_URL`, baseURL по умолчанию → Render (LOCAL untouched, `BASE_URL` override сохранён)
- `helpers/credentials.ts` — пароль по таргету: LOCAL/Render/localhost → `Orangehrm@2026`, чужой хост → `admin123` (демо только через явный override)
- `e2e/seed.spec.ts` — pre-step `warm up target` (до 150с, скип при LOCAL) + `setTimeout(180000)` на сид
- `pom/BasePage.ts` — убран хардкод demo-URL (импорт RENDER_URL из конфига)
- `pom/LoginPage.ts` — `goto()` идёт напрямую через `page.goto` (bypass `super.goto`): найден рейс `reloginIfNeeded` (авто-логин на /auth/login) против ожидания формы — на медленном Render падало с дашбордом на скрине

**Проверка:** `npx playwright test e2e/seed.spec.ts --project=setup` → 2 passed (14.0s), `e2e/.auth/admin.json` перезаписан под Render
**Остаток:** GitHub CI `vars.BASE_URL` → Render URL (настройки репо, не код); коммит по команде пользователя

## 2026-09-11 ~17:00 MSK — PAUSE. CI diagnosis found, fix pending

**CI #119:** smoke 80 tests / 2 workers → 59m44s → killed by 60m job cap. Mass ×/T/F = systemic, not data.
**Root cause (proven locally, dashboard.spec 1 test = 3.3 min fail):** smoke project loads valid `admin.json` storageState (seed saves working Render session) → browser already logged in → `LoginPage.goto()` lands on login URL → app redirects to dashboard → username input never appears → 30s expect + reloads × 3 attempts burn ~3 min per test, then fail. Screenshot at failure = dashboard as Victor Admin. On demo this passed only because demo sessions expired fast.
**Planned fix (after pause):** `LoginPage.goto()` early-return when already authenticated (dashboard title visible / URL not login) instead of forcing form wait. Then re-run seed+smoke subset locally, then CI.
**Also pending:** user logout/login cycle OK (their words); dirty files decision (AGENTS.md Pi-section legit, root Dockerfile.render/render-orangehrm.yaml dead, .obsidian now gitignored+untracked); CI vars.BASE_URL set by user; commit+push of cleanup pending user command.

## 2026-09-11 вечер — Session end
- OrangeHRM 5.9 LIVE: Render `orangehrm-app` (image `d63824c`) + Aiven MySQL (`orangehrm` DB), `Admin`/`Orangehrm@2026`, redeploy-safe (Conf/key из env)
- Вариант Б влит: `9eec36f` (Render-дефолт, пароль по таргету, warm-up) + `6fa6cc8` (CI: BASE_URL, 60м) — оба запушены; CI var выставлен пользователем
- CI #116-119: упираются в кап (30м→60м); диагноз — storageState-сессия + `LoginPage.goto` ждёт форму → ~3 мин/тест; фикс запланирован (early-return)
- Cleanup сделан наполовину: корневые дубли удалены из индекса, `.obsidian/` в gitignore+untracked — НЕ закоммичено; `AGENTS.md` Pi-секция нетронута
- Открыто на завтра: фикс goto → локальный прогон → коммит/пуш → CI green → решение по Stryker-скоупу (783 мутанта)

## 2026-09-11 вечер — API-сид в setup, claim-падения закрыты ✅
- `e2e/seed-data.spec.ts` (идемпотентный check-then-create, скип при LOCAL): employee Alice Administrator + event Tech Conference + ≥1 claim (USD) через `/api/v2` с куками UI-сессии (без OAuth)
- `playwright.config.ts`: setup testMatch + seed-data.spec.ts
- Локально: setup 3 passed; claim-search 8 passed + 1 flaky (3.4)
- Commit `9d17599`, push ✅ — CI ран полетел

## 2026-09-11 ночь — Session end, debug in progress
- Запушено: `04ed8d1` (relogin→goto path), `9d17599` (API-сид: Alice/Tech Conference/claim + setup testMatch)
- CI smoke с сидом: всё ещё красный — кластеры: claim-search, claim-validation 6.1-6.3, time×5, AG-04/AG-11, performance tabs, recruitment candidate
- Локальный полный smoke: 77 passed / 16 failed / 5 flaky (45 мин). claim-search standalone зеленел → подозрение на межтестовое удаление сида в сьюте
- Локальный стенд после мутаций как эталон не используется (сид строится через API на самом таргете)
- Positions-чекпоинты не трогаю (подтверждено пользователю)
- Next: interference claim-спеков → time/admin-gaps/performance/recruitment по одному → CI green

## 2026-09-12 — Suite hardening vs Render, commit 67874d9 ✅
- claim-search: waitForTable + expect.poll counts + toHaveCount 30s; Reference-Id колонка nth(0) (чекбокс не .oxd-table-cell); 3.8 пустое состояние = body ИЛИ No Records
- claim-validation: clickAdd ждёт кнопку (waitForTable + 30s click)
- BasePage.relogin: ждать dashboard после submit, потом goto(path) — убрана гонка обрыва логина
- AG-04: /admin/skill → /admin/viewSkills (реальный роут); AG-11: форма через i.bi-pencil-fill
- LoginPage.loginAsAdmin: waitForLoad 60s (auth/validate stalls)
- Локально: dashboard/auth/pim/directory/myinfo/claim-search/claim-validation/performance/recruitment/admin-gaps — всё зелено
- Push 9d17599..67874d9, CI ран полетел

## 2026-09-12 (cont.) — claim-search timeout + serialize, checkpoint slim ✅
- `8f752c1`: claim-search describe timeout 180s (waits overflow 60s budget → "target closed")
- `65011f6`: no in-file `parallel` (claim-*), `workers: 1` on CI — shared PHP session wedges free-tier under parallel load
- Checkpoint slimmed 817→~140 lines (archive compressed, Sep log kept)
- CI serial run in flight, awaiting green

## 2026-09-12 — CI GREEN ✅ (#126, 56m22s, push 65011f6)
- smoke (98 tests, serial) + python + full chromium — все зелёные против Render
- Остались только warnings: Node20 deprecation от actions/checkout/setup-node/setup-python (косметика, чинится апстримом)
- Эпопея закрыта: demo retired → Render+Aiven live → suite hardened → CI green

## 2026-09-12 — TEST_CASES.md refresh + decisions ✅
- Doc: AUTH-005/DIR-002/BUZZ-003 → ✅, CLAIM-002 → ✅ (LOCAL); totals 34/52→38/52 (65%→73%); legend += Render note
- Решения пользователя: мутанты → другой агент (после Ради́ка + статьи 26 в пн); дэшборд позже; недостающие тесты (ADMIN-004/005, LEAVE-004...) — запланировать

## 2026-09-12 — Scheduled: ADMIN-004/005 + LEAVE-004 for CI ✅ (planned)
- ADMIN-004 (delete user), ADMIN-005 (edit user): @local exist, promote to @smoke with timestamped names
- LEAVE-004 (reject request): needs leave-request seed + reject flow

## 2026-09-13 — ADMIN-004/005 promoted, LEAVE-004 deferred, CI #129 green ✅

**ADMIN-004/005 → @smoke:**
- 2.17 (edit) + 2.19 (delete) rewritten to use `createUserViaAPI`/`deleteUserViaAPI` (avoids flaky employee autocomplete)
- `AdminPage.ts` gains API helpers + 30s autocomplete waits; test cleanup deletes via API
- Locally passing 5/5; CI #129 54m56s green (`150d602`)

**Seed data expanded (`seed-data.spec.ts`):**
- Step 4: alice user account (userRoleId 2, `AlicePass123!`)
- Step 5: leave chain — period (Jan 1), Annual type, 10-day entitlement for Alice

**LEAVE-004 deferred — root cause identified:**
- OrangeHRM 5.9 **auto-approves all leaves** → status "Scheduled", never "Pending Approval"
- Admin Reject button requires "Pending Approval" status; Leave List default filter is "Pending Approval"
- Explored 6 approaches: two-user UI context (session conflicts), API as Alice (403 ESS role), chip removal (status required), direct page.goto (Dashboard redirect), LeavePage.applyLeave (uses admin creds), API-create-then-search (auto-approved hides from filter)
- **Blocker:** leave approval workflow not configured on this instance; needs Admin → Leave → Configure or equivalent
- TODO: configure approval workflow OR test "Cancel" on approved leave instead

**Files changed:**
- `e2e/admin.spec.ts` — API create/delete helpers, 2.17/2.19 tagged @smoke
- `e2e/leave.spec.ts` — cleaned up, LEAVE-004 removed (deferred)
- `e2e/seed-data.spec.ts` — +alice user, +leave chain
- `pom/AdminPage.ts` — API helpers, 30s waits
- `pom/LeavePage.ts` — reverted to simple admin login
