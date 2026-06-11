import { getEvaluationDetail } from "@/lib/db";
import { fullReportMarkdown } from "@/lib/reports";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const detail = getEvaluationDetail(id);
  if (!detail) {
    return new Response("Evaluation not found", { status: 404 });
  }
  const markdown = fullReportMarkdown(
    detail.evaluation,
    detail.agentOutputs,
    detail.consensus,
    detail.documents
  );
  const slug = detail.evaluation.useCaseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="aegis-report-${slug}.md"`,
    },
  });
}
