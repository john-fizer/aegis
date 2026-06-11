export type DataSensitivity = "Low" | "Moderate" | "High";
export type PreferredCloud = "AWS" | "Azure" | "Google Cloud" | "No Preference";
export type EvaluationStatus = "draft" | "running" | "complete" | "failed";
export type Decision = "Go" | "Conditional Go" | "No-Go";

export type Evaluation = {
  id: string;
  organizationName: string;
  useCaseTitle: string;
  problemStatement: string;
  dataSensitivity: DataSensitivity;
  budgetRange: string;
  timeline: string;
  preferredCloud: PreferredCloud;
  humanInLoop: boolean;
  currentSystems: string;
  desiredOutcome: string;
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;
};

export type EvaluationInput = Omit<
  Evaluation,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export type AgentOutput = {
  id: string;
  evaluationId: string;
  agentName: string;
  role: string;
  summary: string;
  findings: string[];
  risks: string[];
  recommendations: string[];
  confidenceScore: number;
  createdAt: string;
};

export type ConsensusReport = {
  evaluationId: string;
  decision: Decision;
  executiveSummary: string;
  majorityView: string;
  dissentingConcerns: string[];
  keyRisks: string[];
  recommendedNextSteps: string[];
  confidenceScore: number;
};

export type VendorScore = {
  vendor: string;
  modelOrService: string;
  fitScore: number;
  securityScore: number;
  costScore: number;
  governanceScore: number;
  integrationScore: number;
  enterpriseScore: number;
  notes: string;
};

export type RiskCategory =
  | "Security"
  | "Privacy"
  | "Operational"
  | "Vendor"
  | "Compliance";

export type RiskScore = {
  category: RiskCategory;
  level: "Low" | "Moderate" | "High";
  score: number; // 1-10, higher = riskier
  rationale: string;
  mitigation: string;
};

export type DocumentKind =
  | "executive-briefing"
  | "risk-scorecard"
  | "acquisition-memo"
  | "implementation-roadmap";

export type GeneratedDocument = {
  evaluationId: string;
  kind: DocumentKind;
  title: string;
  markdown: string;
};

export type EvaluationDetail = {
  evaluation: Evaluation;
  agentOutputs: AgentOutput[];
  consensus: ConsensusReport | null;
  vendorScores: VendorScore[];
  riskScores: RiskScore[];
  documents: GeneratedDocument[];
};
