import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RiskScore } from "@/lib/types";

const LEVEL_COLOR: Record<RiskScore["level"], string> = {
  Low: "text-go",
  Moderate: "text-caution",
  High: "text-nogo",
};

const LEVEL_BAR: Record<RiskScore["level"], string> = {
  Low: "bg-go",
  Moderate: "bg-caution",
  High: "bg-nogo",
};

export function RiskScorecard({ risks }: { risks: RiskScore[] }) {
  if (!risks.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Risk scorecard is generated when the analysis runs.
      </p>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {risks.map((risk, i) => (
        <Card
          key={risk.category}
          className="fade-up bg-card py-0"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardContent className="space-y-3 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading text-lg text-foreground">
                {risk.category}
              </h3>
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-widest",
                  LEVEL_COLOR[risk.level]
                )}
              >
                {risk.level} · {risk.score}/10
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", LEVEL_BAR[risk.level])}
                style={{ width: `${risk.score * 10}%` }}
              />
            </div>
            <p className="text-sm text-foreground/85">{risk.rationale}</p>
            <p className="text-sm text-muted-foreground">
              <span className="eyebrow mr-2">Mitigation</span>
              {risk.mitigation}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
