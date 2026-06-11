import type { ConsensusReport, Evaluation } from "@/lib/types";

/**
 * Deterministic analysis engine used when no LLM API key is configured.
 * Outputs are derived from the evaluation's own fields so the demo reads as
 * a real assessment rather than canned filler.
 */

export type AgentResult = {
  summary: string;
  findings: string[];
  risks: string[];
  recommendations: string[];
  confidenceScore: number;
};

function sensitivityIs(e: Evaluation, level: string) {
  return e.dataSensitivity === level;
}

export function mockAgentResult(
  agentName: string,
  e: Evaluation
): AgentResult {
  const org = e.organizationName;
  const title = e.useCaseTitle.toLowerCase();
  const cloud =
    e.preferredCloud === "No Preference"
      ? "a cloud-agnostic deployment"
      : `deployment on ${e.preferredCloud}`;
  const high = sensitivityIs(e, "High");
  const moderate = sensitivityIs(e, "Moderate");

  switch (agentName) {
    case "ctoAgent":
      return {
        summary: `The ${title} use case is technically feasible with current commercial LLM capabilities. A retrieval-augmented generation (RAG) architecture over the existing document repositories, fronted by ${cloud}, is the lowest-risk path. Buy-then-configure is preferable to building from scratch.`,
        findings: [
          `Existing systems (${e.currentSystems}) expose APIs or connectors that support document ingestion without a data migration project.`,
          `A RAG architecture grounds model outputs in ${org}'s own documents, reducing hallucination risk for review and summarization tasks.`,
          `${e.humanInLoop ? "The required human-in-the-loop checkpoint maps cleanly to a queue-based review workflow." : "No human review gate is required, which simplifies the pipeline but raises the bar for output validation."}`,
          `Commercial models meet the capability bar; no custom model training is required for the stated outcome.`,
        ],
        risks: [
          "Integration with legacy document repositories may surface inconsistent metadata and access-control models.",
          "Vendor API rate limits and latency must be validated against expected document volumes.",
          `${high ? "High-sensitivity data may require a dedicated tenancy or government cloud region, narrowing vendor options." : "Standard enterprise tenancy should satisfy the stated sensitivity level."}`,
        ],
        recommendations: [
          "Adopt a buy-then-configure approach using a commercial foundation model with a managed RAG stack.",
          "Run a 6-8 week technical pilot against a representative document sample before committing to scale.",
          "Define an abstraction layer over the model provider to preserve switching ability.",
        ],
        confidenceScore: 0.82,
      };
    case "cisoAgent":
      return {
        summary: `Security posture is manageable for a ${e.dataSensitivity.toLowerCase()}-sensitivity workload, provided data residency, access control, and prompt/response logging controls are contractually required. ${high ? "High sensitivity makes vendor isolation guarantees the gating issue." : "No blocking security issue is identified at this sensitivity level."}`,
        findings: [
          `Data sensitivity is rated ${e.dataSensitivity}; controls must be scoped accordingly.`,
          "Procurement documents may incidentally contain PII (names, contact details, pricing) even when not classified as such.",
          `${e.humanInLoop ? "Human-in-the-loop review provides a compensating control for model output errors." : "Absence of human review removes a key compensating control; output monitoring must be automated."}`,
          "Vendor security posture varies materially: FedRAMP-authorized offerings reduce assessment burden.",
        ],
        risks: [
          "Inadvertent disclosure of procurement-sensitive data to a model provider without zero-retention guarantees.",
          "Over-broad user access to the AI system could bypass existing document-level permissions.",
          `${high ? "High-sensitivity data processed outside an authorized boundary would be a reportable incident." : "Standard data-handling risk applies; no elevated residency concern."}`,
          "Prompt injection via uploaded vendor documents could manipulate summaries or risk flags.",
        ],
        recommendations: [
          "Require zero data retention and no-training-on-customer-data terms in the contract.",
          "Mirror existing repository ACLs in the retrieval layer; never grant the model service broader access than the requesting user.",
          "Log all prompts and responses to the agency SIEM with a defined retention schedule.",
          `${high ? "Restrict the vendor shortlist to FedRAMP High / IL-equivalent authorized services." : "Prefer FedRAMP Moderate authorized services to reduce assessment effort."}`,
        ],
        confidenceScore: high ? 0.68 : 0.78,
      };
    case "cfoAgent":
      return {
        summary: `The stated budget of ${e.budgetRange} is ${budgetAdequacy(e)} for a pilot-to-production path on a ${e.timeline} timeline. Inference and integration labor are the dominant cost drivers; licensing is secondary at this scale.`,
        findings: [
          "Cost drivers in order of magnitude: integration/configuration labor, model inference (per-token), platform licensing, and training/change management.",
          `A phased spend profile fits the ${e.timeline} timeline: roughly 20% discovery, 30% pilot, 50% deployment and adoption.`,
          "Per-document inference cost for review/summarization workloads is typically cents per document at current commercial rates.",
          "Manual review time is the primary offset: hours of analyst time per document package can be reduced materially.",
        ],
        risks: [
          "Token-based pricing scales with document volume; an unbounded rollout could exceed projections.",
          "Vendor price changes during the contract term need protective language.",
          "Hidden costs: prompt engineering iteration, evaluation tooling, and ongoing model-version regression testing.",
        ],
        recommendations: [
          "Structure the award with a firm-fixed-price pilot phase and priced options for scale.",
          "Set a monthly inference budget cap with alerting before throttling.",
          "Track ROI as reviewed-documents-per-analyst-hour against a pre-pilot baseline.",
        ],
        confidenceScore: 0.74,
      };
    case "legalComplianceAgent":
      return {
        summary: `No statutory bar to the proposed use is identified, but auditability and records-management obligations must be designed in from the start. Procurement should follow existing competitive processes with AI-specific evaluation criteria.`,
        findings: [
          "AI-assisted document review supporting (not replacing) human decision-makers fits within current federal AI policy expectations, including OMB guidance on rights- and safety-impacting AI.",
          "Model inputs and outputs related to procurement decisions are likely federal records subject to retention schedules.",
          `${e.humanInLoop ? "The human-in-the-loop requirement supports defensibility of any decision influenced by the system." : "Without human review, any adverse procurement outcome influenced by the system is harder to defend."}`,
          "Vendor terms of service frequently conflict with government clauses (indemnification, data rights) and require negotiation.",
        ],
        risks: [
          "Protest risk if AI-generated analysis materially influences source selection without documented human judgment.",
          "Inadequate audit trail of model versions, prompts, and outputs would impair after-action review.",
          "Data rights ambiguity: ensure the agency retains unlimited rights in derived summaries and analysis.",
        ],
        recommendations: [
          "Require an immutable audit log covering model version, prompt, retrieved sources, and output for every analysis.",
          "Add AI-specific evaluation factors (security authorization, transparency documentation, model update policy) to the solicitation.",
          "Document a human-accountability policy: every AI-assisted output is reviewed and adopted by a named official.",
        ],
        confidenceScore: 0.71,
      };
    case "operationsAgent":
      return {
        summary: `Operational readiness is achievable within the ${e.timeline} window using a phased rollout. Adoption risk, not technology risk, is the most likely failure mode; training and workflow integration deserve dedicated investment.`,
        findings: [
          "A pilot team of 5-10 power users embedded in the existing review workflow is the fastest path to validated value.",
          `Current tooling (${e.currentSystems}) remains the system of record; the AI layer should augment, not replace, existing workflows.`,
          "Staffing impact is a role shift (reviewer to verifier), not a reduction, during the initial phases.",
          `${e.humanInLoop ? "The review queue must be staffed and SLA'd or it will become the bottleneck." : "Without a review gate, monitoring dashboards become the primary operational control."}`,
        ],
        risks: [
          "User distrust of AI summaries leading to duplicate manual work and negative ROI.",
          "Model output drift after vendor updates changing the tone or structure users were trained on.",
          "Helpdesk and sustainment ownership left undefined after deployment.",
        ],
        recommendations: [
          "Run structured pilot feedback cycles every two weeks with a designated product owner.",
          "Build role-based training: 2 hours for reviewers, half-day for power users and admins.",
          "Define a model-update acceptance test the team runs before any vendor version change reaches production.",
        ],
        confidenceScore: 0.77,
      };
    case "innovationAgent":
      return {
        summary: `Beyond the immediate use case, this establishes ${org}'s reusable pattern for grounded document intelligence. The same retrieval and governance stack extends to adjacent missions, compounding the return on the initial investment.`,
        findings: [
          "The use case creates a reusable, governed RAG platform: ingestion, retrieval, audit, and review components are mission-agnostic.",
          "Adjacent applications include policy comparison, FOIA response drafting, audit preparation, and institutional-knowledge capture.",
          "Early, visible wins in document review build the organizational trust required for higher-stakes AI adoption later.",
          "A governed deployment now positions the organization ahead of peers still in policy-drafting mode.",
        ],
        risks: [
          "Scoping the platform too narrowly to the first use case, requiring rework for the second.",
          "Pilot success creating unmanaged demand that outpaces the governance process.",
        ],
        recommendations: [
          "Design the ingestion and audit layers as shared services from day one.",
          "Maintain a ranked backlog of follow-on use cases with mission owners identified.",
          "Publish pilot metrics internally to build the case for the scale phase.",
        ],
        confidenceScore: 0.8,
      };
    default:
      throw new Error(`Unknown agent: ${agentName}`);
  }
}

function budgetAdequacy(e: Evaluation): string {
  const digits = e.budgetRange.replace(/[^0-9]/g, " ").trim().split(/\s+/);
  const ceiling = digits.length ? Number(digits[digits.length - 1]) : 0;
  if (ceiling >= 1_000_000) return "adequate";
  if (ceiling >= 250_000) return "workable but tight";
  return "likely insufficient";
}

export function mockConsensus(
  e: Evaluation,
  outputs: { agentName: string; confidenceScore: number; risks: string[] }[]
): ConsensusReport {
  const high = e.dataSensitivity === "High";
  const decision = high && !e.humanInLoop ? "No-Go" : high || !e.humanInLoop ? "Conditional Go" : "Conditional Go";
  const avgConfidence =
    outputs.reduce((sum, o) => sum + o.confidenceScore, 0) /
    Math.max(outputs.length, 1);

  return {
    evaluationId: e.id,
    decision,
    executiveSummary: `The review board assesses the ${e.useCaseTitle} initiative as viable and recommends a ${decision === "No-Go" ? "pause pending control redesign" : "conditional go"}. Technical feasibility is high using a retrieval-grounded architecture over existing repositories, and the budget of ${e.budgetRange} supports a pilot-to-production path within ${e.timeline}. Approval is conditioned on contractual data-protection terms, an immutable audit trail, and ${e.humanInLoop ? "a staffed human review gate" : "automated output monitoring in lieu of human review"}. No board member identified a disqualifying obstacle at the ${e.dataSensitivity.toLowerCase()} sensitivity level.`,
    majorityView:
      "Five of six board members support proceeding to a structured pilot. The board agrees the dominant risks are contractual and adoption-related rather than technical, and that a buy-then-configure approach with a commercial foundation model is the right acquisition posture.",
    dissentingConcerns: [
      `CISO: vendor data-retention and tenancy guarantees must be verified before any ${e.dataSensitivity.toLowerCase()}-sensitivity document is processed — willing to support only a conditional go.`,
      "Legal: audit-trail requirements must be in the solicitation, not retrofitted after award.",
    ],
    keyRisks: [
      "Data exposure to the model provider without zero-retention contract terms.",
      "Adoption failure if reviewers distrust or duplicate the AI's work.",
      "Unbounded inference costs as document volume scales.",
      "Insufficient audit trail to defend AI-influenced procurement decisions.",
    ],
    recommendedNextSteps: [
      "Issue the acquisition memo and open market research with the AI-specific evaluation criteria.",
      "Negotiate zero-retention and no-training data terms with shortlisted vendors.",
      "Stand up a 6-8 week pilot with 5-10 reviewers and a pre-pilot productivity baseline.",
      "Define the audit logging schema and review-gate SLA before pilot start.",
    ],
    confidenceScore: Number(avgConfidence.toFixed(2)),
  };
}
