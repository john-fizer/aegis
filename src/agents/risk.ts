import type { Evaluation, RiskScore } from "@/lib/types";

const level = (score: number): RiskScore["level"] =>
  score >= 7 ? "High" : score >= 4 ? "Moderate" : "Low";

/**
 * Deterministic risk scorecard derived from the evaluation's stated
 * parameters. Kept rule-based (rather than LLM-generated) so scores are
 * consistent and explainable across runs.
 */
export function scoreRisks(e: Evaluation): RiskScore[] {
  const sensitivity = e.dataSensitivity;
  const hitl = e.humanInLoop;

  const security =
    sensitivity === "High" ? 8 : sensitivity === "Moderate" ? 5 : 3;
  const privacy =
    sensitivity === "High" ? 8 : sensitivity === "Moderate" ? 6 : 3;
  const operational = hitl ? 4 : 6;
  const vendor = e.preferredCloud === "No Preference" ? 5 : 4;
  const compliance = hitl
    ? sensitivity === "High"
      ? 6
      : 4
    : sensitivity === "High"
      ? 8
      : 6;

  return [
    {
      category: "Security",
      score: security,
      level: level(security),
      rationale: `${sensitivity}-sensitivity data processed by an external model service expands the attack surface and raises the bar for tenancy isolation and access control.`,
      mitigation:
        "Require zero data retention, mirror repository ACLs in the retrieval layer, and log all prompts/responses to the SIEM.",
    },
    {
      category: "Privacy",
      score: privacy,
      level: level(privacy),
      rationale:
        "Source documents may contain incidental PII (names, contacts, pricing) even when the workload is not formally a privacy system of record.",
      mitigation:
        "Apply PII detection/redaction at ingestion and contractually prohibit training on submitted data.",
    },
    {
      category: "Operational",
      score: operational,
      level: level(operational),
      rationale: hitl
        ? "Human review gates limit blast radius of model errors, but the review queue itself becomes a throughput dependency."
        : "Without a human review gate, model errors flow directly to consumers of the output, raising operational stakes.",
      mitigation: hitl
        ? "Staff and SLA the review queue; monitor queue depth and reviewer override rates."
        : "Deploy automated output-quality monitoring with sampling-based human audits.",
    },
    {
      category: "Vendor",
      score: vendor,
      level: level(vendor),
      rationale:
        "Model capability, pricing, and terms are evolving quickly; single-vendor coupling creates switching costs and price exposure.",
      mitigation:
        "Use a provider-abstraction layer, negotiate price protection, and re-compete or benchmark annually.",
    },
    {
      category: "Compliance",
      score: compliance,
      level: level(compliance),
      rationale:
        "AI-assisted analysis that influences official decisions carries records-retention, auditability, and accountability obligations.",
      mitigation:
        "Implement an immutable audit log (model version, prompt, sources, output) and a named-official adoption policy for every AI-assisted product.",
    },
  ];
}
