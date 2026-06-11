import type {
  AgentOutput,
  ConsensusReport,
  Evaluation,
  GeneratedDocument,
  RiskScore,
  VendorScore,
} from "./types";
import { overallScore } from "@/agents/vendors";

const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function executiveBriefing(
  e: Evaluation,
  consensus: ConsensusReport
): GeneratedDocument {
  const markdown = `# Executive Briefing: ${e.useCaseTitle}

**Organization:** ${e.organizationName}
**Date:** ${fmtDate(e.updatedAt)}
**Recommended Decision:** ${consensus.decision}
**Board Confidence:** ${(consensus.confidenceScore * 100).toFixed(0)}%

## Summary

${consensus.executiveSummary}

## Recommended Decision

**${consensus.decision}.** ${consensus.majorityView}

## Business/Mission Impact

${e.desiredOutcome}

The initiative addresses the following problem: ${e.problemStatement}

## Key Risks

${bullets(consensus.keyRisks)}

## Recommended Path

${bullets(consensus.recommendedNextSteps)}

## Next Steps

1. Circulate this briefing and the acquisition memo to the approval chain.
2. Resolve the conditions noted by dissenting board members.
3. Initiate the Phase 1 discovery activities in the implementation roadmap.
`;
  return {
    evaluationId: e.id,
    kind: "executive-briefing",
    title: "Executive Briefing",
    markdown,
  };
}

function riskScorecard(
  e: Evaluation,
  risks: RiskScore[]
): GeneratedDocument {
  const sections = risks
    .map(
      (r) => `## ${r.category} Risk — ${r.level} (${r.score}/10)

${r.rationale}

**Mitigation:** ${r.mitigation}`
    )
    .join("\n\n");

  const markdown = `# Risk Scorecard: ${e.useCaseTitle}

**Organization:** ${e.organizationName}
**Data Sensitivity:** ${e.dataSensitivity}
**Human-in-the-Loop:** ${e.humanInLoop ? "Required" : "Not required"}

| Category | Level | Score |
| --- | --- | --- |
${risks.map((r) => `| ${r.category} | ${r.level} | ${r.score}/10 |`).join("\n")}

${sections}

## Mitigation Plan

${bullets(risks.map((r) => `**${r.category}:** ${r.mitigation}`))}
`;
  return {
    evaluationId: e.id,
    kind: "risk-scorecard",
    title: "Risk Scorecard",
    markdown,
  };
}

function acquisitionMemo(
  e: Evaluation,
  consensus: ConsensusReport,
  vendors: VendorScore[]
): GeneratedDocument {
  const top = vendors.slice(0, 3);
  const markdown = `# Acquisition Memo: ${e.useCaseTitle}

## Purpose

This memorandum documents market research and analysis supporting the acquisition of an
AI-assisted capability for ${e.organizationName}: ${e.useCaseTitle}.

## Background

${e.problemStatement}

Current environment: ${e.currentSystems}.
Desired outcome: ${e.desiredOutcome}

## Requirements

- Data sensitivity handling: ${e.dataSensitivity}
- Human-in-the-loop review: ${e.humanInLoop ? "Required" : "Not required"}
- Cloud environment: ${e.preferredCloud}
- Budget range: ${e.budgetRange}
- Target timeline: ${e.timeline}
- Zero data retention / no training on submitted data (contractual)
- Immutable audit logging of model version, prompts, sources, and outputs

## Market Research Summary

Eight commercial AI providers were assessed against use-case fit, security posture,
cost, governance, integration effort, and enterprise readiness. The market is mature
enough to support a buy-then-configure acquisition; no developmental effort is required.

## Vendor Comparison

| Vendor | Offering | Overall | Fit | Security | Cost | Governance |
| --- | --- | --- | --- | --- | --- | --- |
${vendors
  .map(
    (v) =>
      `| ${v.vendor} | ${v.modelOrService} | ${overallScore(v)} | ${v.fitScore} | ${v.securityScore} | ${v.costScore} | ${v.governanceScore} |`
  )
  .join("\n")}

Leading candidates: ${top.map((v) => v.vendor).join(", ")}.

${top.map((v) => `- **${v.vendor}** — ${v.notes}`).join("\n")}

## Evaluation Criteria

1. Technical fit to the document review/summarization use case (30%)
2. Security authorization and data-handling guarantees (25%)
3. Total cost of ownership across pilot and scale phases (20%)
4. Governance, auditability, and transparency documentation (15%)
5. Integration effort with the existing environment (10%)

## Recommendation

${consensus.decision === "No-Go" ? `The board does not recommend proceeding at this time. ${consensus.executiveSummary}` : `Proceed with a competitive solicitation among the leading candidates under a ${consensus.decision.toLowerCase()} posture. ${consensus.majorityView}`}
`;
  return {
    evaluationId: e.id,
    kind: "acquisition-memo",
    title: "Acquisition Memo",
    markdown,
  };
}

function roadmap(e: Evaluation): GeneratedDocument {
  const hitl = e.humanInLoop;
  const markdown = `# Implementation Roadmap: ${e.useCaseTitle}

Target timeline: ${e.timeline}. Phases may overlap; gates between phases are decision
points, not calendar dates.

## Phase 1: Discovery

- Confirm document sources, volumes, and access controls across ${e.currentSystems}.
- Finalize security and compliance requirements; complete vendor data-handling review.
- Establish the pre-pilot baseline: review hours per document package, error rates.
- Award pilot contract with priced options for scale.

## Phase 2: Pilot

- Deploy to 5-10 power users embedded in the existing review workflow.
- ${hitl ? "Stand up the human review queue with a defined SLA and override tracking." : "Stand up automated output-quality monitoring with sampled human audits."}
- Iterate prompts and retrieval quality on two-week feedback cycles.
- Gate: pilot metrics meet or beat baseline with no unresolved security findings.

## Phase 3: Controlled Deployment

- Expand to the full target team with role-based training (2 hours per reviewer).
- Integrate audit logging with the agency SIEM and records schedule.
- Run the model-update acceptance test process for the first vendor version change.
- Gate: adoption ≥ 70% of target users; helpdesk and sustainment ownership assigned.

## Phase 4: Scale

- Open the platform's ingestion and retrieval services to adjacent use cases.
- Negotiate scale pricing; enable budget caps and alerting on inference spend.
- Publish productivity metrics to the executive dashboard.

## Phase 5: Governance Review

- Annual (or post-incident) review of decisions, audit logs, and override rates.
- Re-benchmark the vendor against the market; re-compete or extend.
- Update the AI use-case inventory and compliance documentation.
`;
  return {
    evaluationId: e.id,
    kind: "implementation-roadmap",
    title: "Implementation Roadmap",
    markdown,
  };
}

export function generateDocuments(
  e: Evaluation,
  outputs: AgentOutput[],
  consensus: ConsensusReport,
  vendors: VendorScore[],
  risks: RiskScore[]
): GeneratedDocument[] {
  return [
    executiveBriefing(e, consensus),
    riskScorecard(e, risks),
    acquisitionMemo(e, consensus, vendors),
    roadmap(e),
  ];
}

/** Full report: every artifact concatenated into one exportable markdown file. */
export function fullReportMarkdown(
  e: Evaluation,
  outputs: AgentOutput[],
  consensus: ConsensusReport | null,
  documents: GeneratedDocument[]
): string {
  const header = `# AEGIS Evaluation Report: ${e.useCaseTitle}

**Organization:** ${e.organizationName}
**Status:** ${e.status}
**Generated:** ${fmtDate(e.updatedAt)}

---
`;
  const council = outputs.length
    ? `\n# Agent Council Assessments\n\n${outputs
        .map(
          (o) => `## ${o.role} — confidence ${(o.confidenceScore * 100).toFixed(0)}%

${o.summary}

**Findings**

${bullets(o.findings)}

**Risks**

${bullets(o.risks)}

**Recommendations**

${bullets(o.recommendations)}`
        )
        .join("\n\n")}\n\n---\n`
    : "";

  const consensusSection = consensus
    ? `\n# Consensus Decision: ${consensus.decision}\n\n${consensus.executiveSummary}\n\n**Majority view:** ${consensus.majorityView}\n\n**Dissenting concerns**\n\n${bullets(consensus.dissentingConcerns)}\n\n---\n`
    : "";

  const docs = documents.map((d) => d.markdown).join("\n\n---\n\n");

  return [header, consensusSection, council, docs].join("\n");
}
