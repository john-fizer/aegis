import type { Evaluation, VendorScore } from "@/lib/types";

type VendorProfile = {
  vendor: string;
  modelOrService: string;
  // Base scores 1-10 reflecting general market position.
  fit: number;
  security: number;
  cost: number;
  governance: number;
  integration: number;
  enterprise: number;
  cloud: "AWS" | "Azure" | "Google Cloud" | null;
  fedrampHigh: boolean;
  notes: string;
};

const VENDOR_PROFILES: VendorProfile[] = [
  {
    vendor: "OpenAI",
    modelOrService: "GPT-4o / Enterprise API",
    fit: 9, security: 7, cost: 6, governance: 6, integration: 8, enterprise: 8,
    cloud: null, fedrampHigh: false,
    notes: "Strong general capability; government data residency available via Azure OpenAI rather than direct.",
  },
  {
    vendor: "Anthropic",
    modelOrService: "Claude (Opus / Sonnet)",
    fit: 9, security: 8, cost: 6, governance: 8, integration: 8, enterprise: 8,
    cloud: null, fedrampHigh: false,
    notes: "Strong document analysis and safety posture; available via AWS Bedrock and Google Vertex for cloud-aligned procurement.",
  },
  {
    vendor: "Google Gemini",
    modelOrService: "Gemini via Vertex AI",
    fit: 8, security: 8, cost: 7, governance: 7, integration: 7, enterprise: 8,
    cloud: "Google Cloud", fedrampHigh: true,
    notes: "Tight Vertex AI integration; strong long-context document handling; FedRAMP High via Google Cloud.",
  },
  {
    vendor: "Microsoft Azure AI",
    modelOrService: "Azure OpenAI Service",
    fit: 8, security: 9, cost: 6, governance: 9, integration: 9, enterprise: 9,
    cloud: "Azure", fedrampHigh: true,
    notes: "Best fit for Microsoft 365/SharePoint estates; FedRAMP High regions and mature enterprise controls.",
  },
  {
    vendor: "AWS Bedrock",
    modelOrService: "Bedrock (multi-model)",
    fit: 8, security: 9, cost: 7, governance: 9, integration: 8, enterprise: 9,
    cloud: "AWS", fedrampHigh: true,
    notes: "Multi-model marketplace with GovCloud path; strong guardrails and private networking story.",
  },
  {
    vendor: "Cohere",
    modelOrService: "Command / Embed",
    fit: 7, security: 7, cost: 8, governance: 7, integration: 6, enterprise: 7,
    cloud: null, fedrampHigh: false,
    notes: "Competitive RAG/embedding stack with private deployment options; smaller enterprise footprint.",
  },
  {
    vendor: "Mistral",
    modelOrService: "Mistral Large / La Plateforme",
    fit: 7, security: 6, cost: 8, governance: 6, integration: 6, enterprise: 6,
    cloud: null, fedrampHigh: false,
    notes: "Strong open-weight options enabling self-hosting; lighter compliance and support ecosystem.",
  },
  {
    vendor: "Meta Llama",
    modelOrService: "Llama (self-hosted / via Bedrock)",
    fit: 6, security: 6, cost: 9, governance: 5, integration: 5, enterprise: 6,
    cloud: null, fedrampHigh: false,
    notes: "Open weights eliminate per-token vendor cost but shift security, hosting, and governance burden in-house.",
  },
];

const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n * 10) / 10));

export function scoreVendors(e: Evaluation): VendorScore[] {
  const high = e.dataSensitivity === "High";
  const moderate = e.dataSensitivity === "Moderate";
  const scores = VENDOR_PROFILES.map((p) => {
    let fit = p.fit;
    let security = p.security;
    let cost = p.cost;
    let governance = p.governance;
    let integration = p.integration;
    const enterprise = p.enterprise;

    // Cloud alignment boosts integration and fit.
    if (e.preferredCloud !== "No Preference") {
      if (p.cloud === e.preferredCloud) {
        integration += 1.5;
        fit += 0.5;
      } else if (p.cloud !== null) {
        integration -= 1;
      }
    }
    // Microsoft estate alignment.
    if (/sharepoint|microsoft|office|365/i.test(e.currentSystems) && p.vendor === "Microsoft Azure AI") {
      integration += 1;
    }
    // Sensitivity weighting: authorized clouds gain, unauthorized lose.
    if (high) {
      security += p.fedrampHigh ? 1 : -1.5;
      governance += p.fedrampHigh ? 1 : -1;
    } else if (moderate && p.fedrampHigh) {
      security += 0.5;
    }
    // Tight budgets favor cost-efficient options.
    if (/under|<|\b50,?000|\b100,?000\b/i.test(e.budgetRange)) {
      cost += p.cost >= 8 ? 1 : 0;
    }

    return {
      vendor: p.vendor,
      modelOrService: p.modelOrService,
      fitScore: clamp(fit),
      securityScore: clamp(security),
      costScore: clamp(cost),
      governanceScore: clamp(governance),
      integrationScore: clamp(integration),
      enterpriseScore: clamp(enterprise),
      notes: p.notes,
    };
  });

  return scores.sort(
    (a, b) => overallScore(b) - overallScore(a)
  );
}

export function overallScore(s: VendorScore): number {
  const total =
    s.fitScore +
    s.securityScore +
    s.costScore +
    s.governanceScore +
    s.integrationScore +
    s.enterpriseScore;
  return Math.round((total / 6) * 10) / 10;
}
