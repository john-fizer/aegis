import { NextResponse } from "next/server";
import { createEvaluation } from "@/lib/db";
import { runEvaluation } from "@/agents";
import type { EvaluationInput } from "@/lib/types";

const demoEvaluation: EvaluationInput = {
  organizationName: "Federal Acquisition Office",
  useCaseTitle: "AI Procurement Document Review",
  problemStatement:
    "The office needs an AI-assisted system to review procurement documents, summarize risks, compare vendor proposals, and support acquisition teams while maintaining human oversight and security controls.",
  dataSensitivity: "Moderate",
  budgetRange: "$250,000 - $1,000,000",
  timeline: "6 months",
  preferredCloud: "No Preference",
  humanInLoop: true,
  currentSystems:
    "SharePoint, Microsoft 365, existing procurement document repositories",
  desiredOutcome:
    "Reduce manual review time, improve consistency, flag risks earlier, and generate acquisition-ready summaries.",
};

/** Create the demo evaluation and run the full agent pipeline on it. */
export async function POST() {
  const evaluation = createEvaluation(demoEvaluation);
  try {
    await runEvaluation(evaluation.id);
  } catch (error) {
    return NextResponse.json(
      {
        id: evaluation.id,
        error: "Demo created but agent run failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ id: evaluation.id }, { status: 201 });
}
