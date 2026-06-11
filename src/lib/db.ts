import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";
import type {
  AgentOutput,
  ConsensusReport,
  Evaluation,
  EvaluationDetail,
  EvaluationInput,
  EvaluationStatus,
  GeneratedDocument,
  RiskScore,
  VendorScore,
} from "./types";

const dbPath =
  process.env.DATABASE_URL?.replace(/^file:/, "") ??
  path.join(process.cwd(), "aegis.db");

declare global {
  // eslint-disable-next-line no-var
  var __aegisDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(dbPath);
  // Tolerate concurrent opens (Next.js build/page-data workers).
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      use_case_title TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      data_sensitivity TEXT NOT NULL,
      budget_range TEXT NOT NULL,
      timeline TEXT NOT NULL,
      preferred_cloud TEXT NOT NULL,
      human_in_loop INTEGER NOT NULL,
      current_systems TEXT NOT NULL,
      desired_outcome TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_outputs (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
      agent_name TEXT NOT NULL,
      role TEXT NOT NULL,
      summary TEXT NOT NULL,
      findings TEXT NOT NULL,
      risks TEXT NOT NULL,
      recommendations TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS artifacts (
      evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      PRIMARY KEY (evaluation_id, kind)
    );
  `);
  return db;
}

// Open lazily (so importing this module at build time doesn't touch the
// file) and reuse the connection across dev hot-reloads.
function getDb(): Database.Database {
  if (!globalThis.__aegisDb) {
    globalThis.__aegisDb = createDb();
  }
  return globalThis.__aegisDb;
}

type EvaluationRow = {
  id: string;
  organization_name: string;
  use_case_title: string;
  problem_statement: string;
  data_sensitivity: string;
  budget_range: string;
  timeline: string;
  preferred_cloud: string;
  human_in_loop: number;
  current_systems: string;
  desired_outcome: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToEvaluation(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    organizationName: row.organization_name,
    useCaseTitle: row.use_case_title,
    problemStatement: row.problem_statement,
    dataSensitivity: row.data_sensitivity as Evaluation["dataSensitivity"],
    budgetRange: row.budget_range,
    timeline: row.timeline,
    preferredCloud: row.preferred_cloud as Evaluation["preferredCloud"],
    humanInLoop: row.human_in_loop === 1,
    currentSystems: row.current_systems,
    desiredOutcome: row.desired_outcome,
    status: row.status as EvaluationStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createEvaluation(input: EvaluationInput): Evaluation {
  const now = new Date().toISOString();
  const id = randomUUID();
  getDb().prepare(
    `INSERT INTO evaluations (
      id, organization_name, use_case_title, problem_statement,
      data_sensitivity, budget_range, timeline, preferred_cloud,
      human_in_loop, current_systems, desired_outcome, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
  ).run(
    id,
    input.organizationName,
    input.useCaseTitle,
    input.problemStatement,
    input.dataSensitivity,
    input.budgetRange,
    input.timeline,
    input.preferredCloud,
    input.humanInLoop ? 1 : 0,
    input.currentSystems,
    input.desiredOutcome,
    now,
    now
  );
  return getEvaluation(id)!;
}

export function getEvaluation(id: string): Evaluation | null {
  const row = getDb()
    .prepare("SELECT * FROM evaluations WHERE id = ?")
    .get(id) as EvaluationRow | undefined;
  return row ? rowToEvaluation(row) : null;
}

export function listEvaluations(): Evaluation[] {
  const rows = getDb()
    .prepare("SELECT * FROM evaluations ORDER BY created_at DESC")
    .all() as EvaluationRow[];
  return rows.map(rowToEvaluation);
}

export function setEvaluationStatus(id: string, status: EvaluationStatus) {
  getDb().prepare(
    "UPDATE evaluations SET status = ?, updated_at = ? WHERE id = ?"
  ).run(status, new Date().toISOString(), id);
}

export function saveAgentOutput(
  output: Omit<AgentOutput, "id" | "createdAt">
): AgentOutput {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  getDb().prepare(
    `INSERT INTO agent_outputs (
      id, evaluation_id, agent_name, role, summary,
      findings, risks, recommendations, confidence_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    output.evaluationId,
    output.agentName,
    output.role,
    output.summary,
    JSON.stringify(output.findings),
    JSON.stringify(output.risks),
    JSON.stringify(output.recommendations),
    output.confidenceScore,
    createdAt
  );
  return { ...output, id, createdAt };
}

type AgentOutputRow = {
  id: string;
  evaluation_id: string;
  agent_name: string;
  role: string;
  summary: string;
  findings: string;
  risks: string;
  recommendations: string;
  confidence_score: number;
  created_at: string;
};

export function listAgentOutputs(evaluationId: string): AgentOutput[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM agent_outputs WHERE evaluation_id = ? ORDER BY created_at ASC"
    )
    .all(evaluationId) as AgentOutputRow[];
  return rows.map((row) => ({
    id: row.id,
    evaluationId: row.evaluation_id,
    agentName: row.agent_name,
    role: row.role,
    summary: row.summary,
    findings: JSON.parse(row.findings),
    risks: JSON.parse(row.risks),
    recommendations: JSON.parse(row.recommendations),
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
  }));
}

export function clearRunArtifacts(evaluationId: string) {
  getDb().prepare("DELETE FROM agent_outputs WHERE evaluation_id = ?").run(
    evaluationId
  );
  getDb().prepare("DELETE FROM artifacts WHERE evaluation_id = ?").run(
    evaluationId
  );
}

function saveArtifact(evaluationId: string, kind: string, payload: unknown) {
  getDb().prepare(
    `INSERT INTO artifacts (evaluation_id, kind, payload) VALUES (?, ?, ?)
     ON CONFLICT (evaluation_id, kind) DO UPDATE SET payload = excluded.payload`
  ).run(evaluationId, kind, JSON.stringify(payload));
}

function getArtifact<T>(evaluationId: string, kind: string): T | null {
  const row = getDb()
    .prepare(
      "SELECT payload FROM artifacts WHERE evaluation_id = ? AND kind = ?"
    )
    .get(evaluationId, kind) as { payload: string } | undefined;
  return row ? (JSON.parse(row.payload) as T) : null;
}

export function saveConsensus(report: ConsensusReport) {
  saveArtifact(report.evaluationId, "consensus", report);
}

export function getConsensus(evaluationId: string): ConsensusReport | null {
  return getArtifact<ConsensusReport>(evaluationId, "consensus");
}

export function saveVendorScores(evaluationId: string, scores: VendorScore[]) {
  saveArtifact(evaluationId, "vendor-scores", scores);
}

export function getVendorScores(evaluationId: string): VendorScore[] {
  return getArtifact<VendorScore[]>(evaluationId, "vendor-scores") ?? [];
}

export function saveRiskScores(evaluationId: string, scores: RiskScore[]) {
  saveArtifact(evaluationId, "risk-scores", scores);
}

export function getRiskScores(evaluationId: string): RiskScore[] {
  return getArtifact<RiskScore[]>(evaluationId, "risk-scores") ?? [];
}

export function saveDocuments(
  evaluationId: string,
  documents: GeneratedDocument[]
) {
  saveArtifact(evaluationId, "documents", documents);
}

export function getDocuments(evaluationId: string): GeneratedDocument[] {
  return getArtifact<GeneratedDocument[]>(evaluationId, "documents") ?? [];
}

export function getEvaluationDetail(id: string): EvaluationDetail | null {
  const evaluation = getEvaluation(id);
  if (!evaluation) return null;
  return {
    evaluation,
    agentOutputs: listAgentOutputs(id),
    consensus: getConsensus(id),
    vendorScores: getVendorScores(id),
    riskScores: getRiskScores(id),
    documents: getDocuments(id),
  };
}
