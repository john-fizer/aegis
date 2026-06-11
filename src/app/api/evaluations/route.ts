import { NextResponse } from "next/server";
import { createEvaluation, listEvaluations } from "@/lib/db";
import type { EvaluationInput } from "@/lib/types";

const SENSITIVITIES = ["Low", "Moderate", "High"];
const CLOUDS = ["AWS", "Azure", "Google Cloud", "No Preference"];

export async function GET() {
  return NextResponse.json(listEvaluations());
}

export async function POST(request: Request) {
  const body = await request.json();
  const required = [
    "organizationName",
    "useCaseTitle",
    "problemStatement",
    "budgetRange",
    "timeline",
    "currentSystems",
    "desiredOutcome",
  ] as const;
  for (const field of required) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }
  if (!SENSITIVITIES.includes(body.dataSensitivity)) {
    return NextResponse.json(
      { error: "dataSensitivity must be Low, Moderate, or High" },
      { status: 400 }
    );
  }
  if (!CLOUDS.includes(body.preferredCloud)) {
    return NextResponse.json(
      { error: "preferredCloud must be AWS, Azure, Google Cloud, or No Preference" },
      { status: 400 }
    );
  }

  const input: EvaluationInput = {
    organizationName: body.organizationName.trim(),
    useCaseTitle: body.useCaseTitle.trim(),
    problemStatement: body.problemStatement.trim(),
    dataSensitivity: body.dataSensitivity,
    budgetRange: body.budgetRange.trim(),
    timeline: body.timeline.trim(),
    preferredCloud: body.preferredCloud,
    humanInLoop: Boolean(body.humanInLoop),
    currentSystems: body.currentSystems.trim(),
    desiredOutcome: body.desiredOutcome.trim(),
  };
  const evaluation = createEvaluation(input);
  return NextResponse.json(evaluation, { status: 201 });
}
