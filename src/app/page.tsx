import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/aegis/demo-button";
import { EvaluationCard } from "@/components/aegis/evaluation-card";
import { listEvaluations } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const evaluations = listEvaluations();
  const complete = evaluations.filter((e) => e.status === "complete").length;

  return (
    <div className="space-y-10">
      <section className="fade-up flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Decision Support · Multi-Agent Council</p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground">
            Evaluate AI use cases with an executive council of agents
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Six specialist agents — CTO, CISO, CFO, Legal, Operations, and
            Innovation — independently assess each use case, then a consensus
            pass produces an executive briefing, risk scorecard, vendor
            comparison, acquisition memo, and implementation roadmap.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Button size="lg" render={<Link href="/evaluation/new" />}>
            Create New Evaluation
          </Button>
          <DemoButton />
        </div>
      </section>

      <section className="fade-up" style={{ animationDelay: "120ms" }}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-heading text-xl text-foreground">
            Recent Evaluations
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {evaluations.length} total · {complete} complete
          </span>
        </div>
        {evaluations.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-16 text-center">
            <p className="font-heading text-lg text-foreground">
              No evaluations yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create your first evaluation, or load the demo scenario to see the
              full council workflow end-to-end.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {evaluations.map((evaluation) => (
              <EvaluationCard key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
