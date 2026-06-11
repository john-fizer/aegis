# AEGIS v2 — Build Spec (DRAFT, pending approval)

Status: **awaiting approval**
Baseline: v1 MVP on `main` (multi-agent council, consensus, vendor comparison,
risk scorecard, four generated documents, markdown export, mock/Anthropic/
OpenAI-compatible providers, SQLite).

## Objective

Evolve AEGIS from a single-shot evaluation tool into a living decision-support
workspace: visible agent deliberation, a true debate round, richer exports,
and portfolio-level insight across evaluations — while keeping the
zero-config demo working end-to-end.

---

## P0 — Core v2 features

### 1. Live council streaming

Watching the council work is the product's signature moment; today the run is
a single blocking request.

- Stream per-agent status over Server-Sent Events: `queued → analyzing →
  complete` with elapsed time.
- Agent Council tab shows six seats filling in live as each agent finishes;
  consensus seat activates last.
- Run endpoint becomes async: `POST /:id/run` returns immediately;
  `GET /:id/events` streams progress; page reconnects safely mid-run.
- Works in mock mode (artificial 1-2s stagger) so the demo shows the effect.

**Acceptance:** kicking off a run shows each agent completing individually in
the UI without a page refresh, in both mock and live-LLM modes.

### 2. True debate round

v1 agents work independently and consensus is a single synthesis pass. v2 adds
structured deliberation:

- Round 1: independent assessments (as today).
- Round 2: each agent receives the other five assessments and submits a
  rebuttal/revision — agreements, challenges, and revised confidence.
- Consensus pass now cites the debate: which positions moved, which dissent
  held firm.
- UI: "Debate" sub-view on the Agent Council tab showing position shifts
  (initial vs revised confidence per agent).

**Acceptance:** a completed run stores both rounds; the council view shows at
least one revised position in the demo scenario.

### 3. PDF export

- Render the executive briefing and full report as styled PDFs (charcoal/gold
  document theme to match the app).
- `GET /:id/export/pdf` plus per-document PDF buttons on the Export tab.

**Acceptance:** demo scenario downloads a polished multi-page PDF with cover
page, decision banner, and all four documents.

---

## P1 — Workspace features

### 4. Evaluation versioning & comparison

- Re-running an evaluation snapshots the previous run instead of overwriting.
- Run history list per evaluation; side-by-side diff of two runs (decision,
  confidence, key risks).
- Compare two *different* evaluations on one screen (portfolio trade-offs).

### 5. Portfolio dashboard

- Dashboard upgrades from a list to an executive portfolio view: decisions
  breakdown (Go / Conditional / No-Go), average confidence, risk heatmap
  across evaluations, sensitivity mix.
- Built with the existing chart-free aesthetic: stat tiles + a CSS heatmap
  (no chart library unless needed).

### 6. Editable evaluations

- Edit form fields after creation (status resets to draft with a warning).
- Duplicate-as-new for what-if analysis (e.g. same use case at High vs
  Moderate sensitivity).

---

## P2 — Platform hardening

### 7. Postgres/Supabase option

- Data layer behind an interface; `DATABASE_URL` with `postgres://` switches
  drivers. SQLite stays the zero-config default.

### 8. Auth (single-team)

- Optional simple auth gate (env-configured shared passcode for MVP-2, real
  provider later). Off by default so the demo stays one-click.

### 9. Research-grounded vendor scoring

- Optional web-research pass (when an LLM key is present) that annotates the
  rule-based vendor baseline with current offerings/authorizations, clearly
  labeled and dated. Rule-based scores remain the source of truth.

---

## Non-goals for v2

- Multi-tenant SaaS, billing, role-based access control
- Fine-tuning or custom model hosting
- Replacing the deterministic mock engine (it stays the no-key fallback)

## Build order

1. Async run + SSE progress (P0-1) — foundation for everything visible
2. Debate round data model + agents (P0-2)
3. Debate UI + live council view polish
4. PDF export (P0-3)
5. Run versioning (P1-4)
6. Portfolio dashboard (P1-5)
7. Edit/duplicate evaluations (P1-6)
8. P2 items as time allows

## Acceptance criteria (v2 complete when)

- Demo scenario streams live agent progress with zero config
- Debate round visible with revised positions
- PDF export produces a styled multi-page report
- Re-runs preserve history; two runs comparable side-by-side
- Portfolio dashboard summarizes all evaluations
- All v1 acceptance criteria still pass
