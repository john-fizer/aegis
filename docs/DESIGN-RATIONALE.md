# AEGIS — Design Rationale

Why the evaluation model is built the way it is. Each section states the
decision, the alternatives considered, and the reasoning that settled it.

---

## 1. Why a council of six agents instead of one big prompt

**Decision:** Six role-scoped agents (CTO, CISO, CFO, Legal, Operations,
Innovation) run independently, then a consensus pass synthesizes.

**Alternative considered:** One large prompt asking a single model for a
comprehensive assessment.

**Reasoning:**
- **Role pressure produces honest tension.** A single prompt asked to "cover
  security, cost, legal, and innovation" averages those concerns into mush.
  A CISO agent whose only job is security *finds* security problems — and the
  tension between the CISO's caution and the Innovation agent's ambition is
  the actual signal an executive needs. Real review boards work because each
  seat is professionally obligated to its own lens.
- **Independent first-pass prevents anchoring.** Agents do not see each
  other's round-1 output. If the CTO assessed first and others saw it,
  every later assessment would anchor on the CTO's framing — the same
  groupthink failure boards suffer when the loudest seat speaks first.
- **Mirrors how the output is consumed.** Agencies route AI proposals through
  exactly these functions (technical, security, budget, legal, ops). Mapping
  agents 1:1 to those functions makes each output directly forwardable to its
  real-world counterpart.
- **Practical benefit:** six smaller, focused prompts are individually
  testable, independently improvable, and run in parallel (six concurrent
  calls ≈ the latency of one).

## 2. Why the consensus pass is a separate agent

**Decision:** A seventh "facilitator" agent receives all six assessments and
produces the decision (Go / Conditional Go / No-Go), majority view, and
dissent.

**Reasoning:** Synthesis is a different cognitive task than assessment. The
facilitator's prompt is deliberately neutral — it has no domain lens, so it
can weigh the CISO against the Innovation agent without being either. Keeping
it separate also means the decision logic can be audited on its own: you can
read exactly what inputs produced the recommendation.

**Why dissent is a first-class output:** A consensus that hides disagreement
is a liability in government decision-making. "Conditional Go, with the CISO
dissenting until zero-retention terms are signed" is more defensible — and
more useful — than a clean "Go." The schema *forces* the model to surface
dissent rather than smooth it over.

## 3. Why the v2 debate round exists (and why only two rounds)

**Decision (v2):** After independent assessment, each agent sees the other
five outputs and submits agreements, challenges, and a revised confidence.

**Reasoning:** Round 1 protects independence; round 2 captures the value of
deliberation — positions that survive contact with other experts deserve more
weight, and positions that move tell you where the uncertainty lives. The
visible confidence shift (e.g., CTO drops from 82% to 78% after the CISO's
challenge) is decision-relevant information no single-pass system produces.

**Why not more rounds:** Multi-round debates converge fast and then start
performing agreement. Two rounds gets ~90% of the value at 2× the cost of one;
five rounds gets marginally more at 5× the cost and risks the agents
negotiating away legitimate dissent.

## 4. Why vendor scores and the risk scorecard are rule-based, not LLM

**Decision:** Vendor comparison and risk scoring are deterministic functions
of the evaluation's fields. Only the six assessments + consensus use the LLM.

**Reasoning:**
- **Consistency is the product.** If two evaluations with identical inputs
  produced different vendor rankings, the tool loses credibility instantly —
  procurement contexts demand explainable, repeatable scoring. A rule like
  "FedRAMP-authorized vendors gain +1 security when sensitivity is High" can
  be defended in a protest; "the model felt Azure was safer that day" cannot.
- **LLMs add no information here.** The vendor landscape facts (cloud
  alignment, authorization status, cost posture) are stable inputs we encode
  once. Asking an LLM to re-derive them per run adds variance and hallucination
  risk while contributing nothing.
- **The split is principled:** LLMs do what they're good at (reasoning over a
  specific, novel problem statement); rules do what they're good at
  (consistent scoring against known criteria). v2's research-grounded
  annotations (P2) keep this split — the LLM may *annotate* the baseline, never
  overwrite it.

## 5. Why the mock engine exists and is evaluation-aware

**Decision:** With no API key, a deterministic engine derives all outputs from
the submitted fields — and different inputs produce different decisions.

**Reasoning:** The spec's hard requirement was "the demo must work
end-to-end." A keyless first-run experience removes every adoption barrier.
But canned static text would be discovered in 30 seconds of play — so the mock
engine branches on the actual inputs (sensitivity, budget ceiling,
human-in-the-loop, cloud, current systems). High sensitivity without human
review yields a No-Go; a Microsoft estate boosts Azure's integration score.
The mock is honest about being a heuristic, but it demonstrates the *shape* of
the product faithfully, and it doubles as a fast, free test harness for the
UI and pipeline.

## 6. Why the decision heuristic is what it is (mock consensus)

**Decision:** Mock decisions key on the two highest-stakes fields:
`dataSensitivity` and `humanInLoop`. High + no-HITL → No-Go; otherwise
conditions accumulate toward Conditional Go.

**Reasoning:** These are the two fields that dominate real federal AI
go/no-go decisions (OMB guidance centers on rights/safety impact and human
oversight). Budget and timeline shape *how* you proceed; sensitivity and
oversight shape *whether* you proceed. A "Conditional Go" default posture also
reflects reality: almost no AI proposal is an unconditional yes, and an
unconditional no is rare when human oversight exists.

## 7. Why confidence scores are everywhere

Every agent output carries a 0–1 confidence. Three reasons:
- It forces the model to commit to an uncertainty estimate, which sharpens
  the prose (hedged findings get low scores instead of weasel words).
- The consensus confidence is computed/justified from the seats, making the
  final number traceable.
- In v2 the debate round makes confidence *dynamic* — the delta between
  initial and revised confidence is the headline metric of the debate UI.

## 8. Why JSON contracts instead of free-text agent output

**Decision:** Every agent prompt ends with a strict JSON shape; the
orchestrator parses with a tolerant extractor (strips fences, finds the
object) and clamps/defaults every field.

**Reasoning:** The UI, the documents, and the consensus pass all consume
structured fields (findings[], risks[], recommendations[]). Free text would
require a second parsing pass with its own failure modes. The tolerant
extractor + per-field validation means one malformed agent response degrades
gracefully instead of failing the whole run.

## 9. Why provider abstraction with three backends

**Decision:** One `complete(system, user)` interface; Anthropic SDK,
OpenAI-compatible REST, and mock behind it. Auto-detection by available keys.

**Reasoning:** Government buyers are exactly the audience that will ask
"can this run against *our* approved endpoint?" An OpenAI-compatible REST
backend covers Azure OpenAI, local inference servers, and most gateways for
free. The abstraction also keeps agent logic provider-neutral — prompts are
the asset, not SDK calls — and lets the mock slot in as just another provider
rather than a special case.

## 10. Why documents are generated from templates over structured data

**Decision:** The four documents (briefing, scorecard, memo, roadmap) are
markdown templates filled from structured outputs — not LLM-written documents.

**Reasoning:** Same logic as §4 — the LLM's judgment is already captured in
the structured fields; the documents are a *presentation* of that judgment.
Template generation guarantees every document has every required section
(the spec lists them explicitly), keeps formatting deterministic for export,
and means a document regenerates identically from the same run data.

## 11. Why SQLite + an artifacts table

**Decision:** better-sqlite3, with normalized tables only where the app
queries by field (evaluations, agent_outputs) and a generic JSON `artifacts`
table for everything else (consensus, vendor scores, risk scores, documents).

**Reasoning:** Zero-config persistence was a v1 requirement. The
artifacts pattern acknowledges that consensus reports and vendor scores are
read and written *whole* — normalizing them into columns would add migration
surface with no query benefit. v2's run versioning drops in cleanly: artifacts
key by run instead of by evaluation, and history is free.

## 12. Why the UI looks the way it does

**Decision:** Dark "federal command brief": charcoal/navy field, muted gold
accents, serif display (Spectral), mono data labels (IBM Plex Mono), minimal
motion.

**Reasoning:** The audience is executives deciding on millions in spend — the
interface should read like a classified briefing room, not a SaaS trial. Gold
is used only for emphasis (lead vendor, confidence, phase markers) so it stays
a signal, not decoration. Risk colors (green/amber/red) appear *only* where
risk is being communicated, per the spec's "risk colors only where useful."

---

*Living document — updated as v2 decisions land (SSE streaming, debate round,
PDF export, run versioning).*
