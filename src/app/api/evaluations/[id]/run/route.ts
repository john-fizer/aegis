import { NextResponse } from "next/server";
import { getEvaluation, getEvaluationDetail } from "@/lib/db";
import { runEvaluation } from "@/agents";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const evaluation = getEvaluation(id);
  if (!evaluation) {
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  }
  if (evaluation.status === "running") {
    return NextResponse.json(
      { error: "Evaluation is already running" },
      { status: 409 }
    );
  }
  try {
    await runEvaluation(id);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Agent run failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
  return NextResponse.json(getEvaluationDetail(id));
}
