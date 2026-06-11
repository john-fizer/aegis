import {
  clearRunArtifacts,
  getEvaluation,
  saveAgentOutput,
  saveConsensus,
  saveDocuments,
  saveRiskScores,
  saveVendorScores,
  setEvaluationStatus,
} from "@/lib/db";
import { complete, extractJson, resolveProvider } from "@/lib/llm";
import type {
  AgentOutput,
  ConsensusReport,
  Evaluation,
} from "@/lib/types";
import {
  AGENT_DEFINITIONS,
  buildEvaluationBrief,
  CONSENSUS_SYSTEM_PROMPT,
  type AgentDefinition,
} from "./definitions";
import { mockAgentResult, mockConsensus, type AgentResult } from "./mock";
import { scoreRisks } from "./risk";
import { scoreVendors } from "./vendors";
import { generateDocuments } from "@/lib/reports";

async function runAgent(
  def: AgentDefinition,
  evaluation: Evaluation,
  useMock: boolean
): Promise<AgentResult> {
  if (useMock) return mockAgentResult(def.name, evaluation);
  const raw = await complete({
    system: def.systemPrompt,
    user: buildEvaluationBrief(evaluation),
  });
  const parsed = extractJson<AgentResult>(raw);
  return {
    summary: String(parsed.summary ?? ""),
    findings: (parsed.findings ?? []).map(String),
    risks: (parsed.risks ?? []).map(String),
    recommendations: (parsed.recommendations ?? []).map(String),
    confidenceScore: Math.max(0, Math.min(1, Number(parsed.confidenceScore) || 0.5)),
  };
}

async function runConsensus(
  evaluation: Evaluation,
  outputs: AgentOutput[],
  useMock: boolean
): Promise<ConsensusReport> {
  if (useMock) return mockConsensus(evaluation, outputs);
  const boardInput = outputs
    .map(
      (o) =>
        `## ${o.role} (${o.agentName}) — confidence ${o.confidenceScore}\n` +
        `Summary: ${o.summary}\n` +
        `Findings:\n${o.findings.map((f) => `- ${f}`).join("\n")}\n` +
        `Risks:\n${o.risks.map((r) => `- ${r}`).join("\n")}\n` +
        `Recommendations:\n${o.recommendations.map((r) => `- ${r}`).join("\n")}`
    )
    .join("\n\n");
  const raw = await complete({
    system: CONSENSUS_SYSTEM_PROMPT,
    user: `${buildEvaluationBrief(evaluation)}\n\nBOARD ASSESSMENTS:\n\n${boardInput}`,
    maxTokens: 8192,
  });
  const parsed = extractJson<Omit<ConsensusReport, "evaluationId">>(raw);
  const decision = ["Go", "Conditional Go", "No-Go"].includes(parsed.decision)
    ? parsed.decision
    : "Conditional Go";
  return {
    evaluationId: evaluation.id,
    decision,
    executiveSummary: String(parsed.executiveSummary ?? ""),
    majorityView: String(parsed.majorityView ?? ""),
    dissentingConcerns: (parsed.dissentingConcerns ?? []).map(String),
    keyRisks: (parsed.keyRisks ?? []).map(String),
    recommendedNextSteps: (parsed.recommendedNextSteps ?? []).map(String),
    confidenceScore: Math.max(0, Math.min(1, Number(parsed.confidenceScore) || 0.5)),
  };
}

/**
 * Full evaluation pipeline: six agents in parallel, consensus pass, vendor
 * scoring, risk scorecard, and document generation. Marks the evaluation
 * complete (or failed) when done.
 */
export async function runEvaluation(evaluationId: string): Promise<void> {
  const evaluation = getEvaluation(evaluationId);
  if (!evaluation) throw new Error(`Evaluation not found: ${evaluationId}`);

  const useMock = resolveProvider() === "mock";
  setEvaluationStatus(evaluationId, "running");
  clearRunArtifacts(evaluationId);

  try {
    const results = await Promise.all(
      AGENT_DEFINITIONS.map(async (def) => ({
        def,
        result: await runAgent(def, evaluation, useMock),
      }))
    );

    const outputs = results.map(({ def, result }) =>
      saveAgentOutput({
        evaluationId,
        agentName: def.name,
        role: def.role,
        ...result,
      })
    );

    const consensus = await runConsensus(evaluation, outputs, useMock);
    saveConsensus(consensus);

    const vendorScores = scoreVendors(evaluation);
    saveVendorScores(evaluationId, vendorScores);

    const riskScores = scoreRisks(evaluation);
    saveRiskScores(evaluationId, riskScores);

    const documents = generateDocuments(
      evaluation,
      outputs,
      consensus,
      vendorScores,
      riskScores
    );
    saveDocuments(evaluationId, documents);

    setEvaluationStatus(evaluationId, "complete");
  } catch (error) {
    setEvaluationStatus(evaluationId, "failed");
    throw error;
  }
}
