import { notFound } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AgentCouncilPanel } from "@/components/aegis/agent-council-panel";
import { ConsensusDecisionCard } from "@/components/aegis/consensus-decision-card";
import { ExportButton } from "@/components/aegis/export-button";
import { MarkdownReportViewer } from "@/components/aegis/markdown-report-viewer";
import { RiskScorecard } from "@/components/aegis/risk-scorecard";
import { RoadmapTimeline } from "@/components/aegis/roadmap-timeline";
import { RunButton } from "@/components/aegis/run-button";
import { StatusBadge } from "@/components/aegis/status-badge";
import { VendorComparisonTable } from "@/components/aegis/vendor-comparison-table";
import { getEvaluationDetail } from "@/lib/db";

export const dynamic = "force-dynamic";

function BriefField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="text-sm text-foreground/90">{value}</p>
    </div>
  );
}

export default async function EvaluationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const detail = getEvaluationDetail(id);
  if (!detail) notFound();

  const { evaluation, agentOutputs, consensus, vendorScores, riskScores, documents } =
    detail;
  const doc = (kind: string) => documents.find((d) => d.kind === kind) ?? null;
  const hasRun = evaluation.status === "complete";

  return (
    <div className="space-y-8">
      <section className="fade-up flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <p className="eyebrow">{evaluation.organizationName}</p>
            <StatusBadge status={evaluation.status} />
          </div>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground">
            {evaluation.useCaseTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasRun && <ExportButton evaluationId={evaluation.id} />}
          <RunButton evaluationId={evaluation.id} status={evaluation.status} />
        </div>
      </section>

      <Tabs defaultValue="overview" className="fade-up" style={{ animationDelay: "80ms" }}>
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-panel p-1">
          {[
            ["overview", "Overview"],
            ["council", "Agent Council"],
            ["risk", "Risk"],
            ["vendors", "Vendors"],
            ["acquisition", "Acquisition"],
            ["roadmap", "Roadmap"],
            ["export", "Export"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="font-mono text-[11px] uppercase tracking-wider data-[state=active]:bg-secondary"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {consensus && <ConsensusDecisionCard consensus={consensus} />}
          <Card className="bg-card py-0">
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <BriefField label="Problem Statement" value={evaluation.problemStatement} />
              </div>
              <BriefField label="Desired Outcome" value={evaluation.desiredOutcome} />
              <BriefField label="Current Systems" value={evaluation.currentSystems} />
              <BriefField label="Data Sensitivity" value={evaluation.dataSensitivity} />
              <BriefField label="Preferred Cloud" value={evaluation.preferredCloud} />
              <BriefField label="Budget Range" value={evaluation.budgetRange} />
              <BriefField label="Timeline" value={evaluation.timeline} />
              <BriefField
                label="Human-in-the-Loop"
                value={evaluation.humanInLoop ? "Required" : "Not required"}
              />
            </CardContent>
          </Card>
          {!hasRun && (
            <p className="text-center text-sm text-muted-foreground">
              Run the multi-agent analysis to generate the consensus
              recommendation, risk scorecard, vendor comparison, and acquisition
              documents.
            </p>
          )}
        </TabsContent>

        <TabsContent value="council">
          <AgentCouncilPanel outputs={agentOutputs} />
        </TabsContent>

        <TabsContent value="risk">
          <RiskScorecard risks={riskScores} />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorComparisonTable scores={vendorScores} />
        </TabsContent>

        <TabsContent value="acquisition">
          {doc("acquisition-memo") ? (
            <MarkdownReportViewer document={doc("acquisition-memo")!} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              The acquisition memo is generated when the analysis runs.
            </p>
          )}
        </TabsContent>

        <TabsContent value="roadmap">
          <RoadmapTimeline roadmap={doc("implementation-roadmap")} />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          {hasRun ? (
            <>
              <div className="flex items-center justify-between rounded-md border border-border bg-panel px-5 py-4">
                <div>
                  <p className="font-heading text-lg text-foreground">
                    Full evaluation report
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consensus, council assessments, and all four generated
                    documents in one markdown file.
                  </p>
                </div>
                <ExportButton evaluationId={evaluation.id} />
              </div>
              {documents.map((document) => (
                <div key={document.kind}>
                  <h3 className="eyebrow mb-2">{document.title}</h3>
                  <MarkdownReportViewer document={document} />
                </div>
              ))}
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Generated documents appear here after the analysis runs.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
