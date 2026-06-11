import { NextResponse } from "next/server";
import { getEvaluationDetail } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const detail = getEvaluationDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
