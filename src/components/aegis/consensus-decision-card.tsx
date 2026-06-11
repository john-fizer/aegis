import { Card, CardContent } from "@/components/ui/card";
import { DecisionBadge } from "./status-badge";
import type { ConsensusReport } from "@/lib/types";

function List({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <ul className="space-y-1.5 text-sm text-foreground/85">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConsensusDecisionCard({
  consensus,
}: {
  consensus: ConsensusReport;
}) {
  return (
    <Card className="gold-rule bg-panel py-0">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">Council Consensus</p>
            <h2 className="font-heading text-2xl text-foreground">
              Recommended Decision
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              Confidence {Math.round(consensus.confidenceScore * 100)}%
            </span>
            <DecisionBadge
              decision={consensus.decision}
              className="px-3 py-1 text-xs"
            />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {consensus.executiveSummary}
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <p className="eyebrow mb-1.5">Majority View</p>
              <p className="text-sm text-foreground/85">{consensus.majorityView}</p>
            </div>
            <List label="Dissenting Concerns" items={consensus.dissentingConcerns} />
          </div>
          <div className="space-y-5">
            <List label="Key Risks" items={consensus.keyRisks} />
            <List label="Recommended Next Steps" items={consensus.recommendedNextSteps} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
