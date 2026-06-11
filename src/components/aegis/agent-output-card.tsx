import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AgentOutput } from "@/lib/types";

function Section({ label, items }: { label: string; items: string[] }) {
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

export function AgentOutputCard({ output }: { output: AgentOutput }) {
  const confidence = Math.round(output.confidenceScore * 100);
  return (
    <Card className="gold-rule bg-card py-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-0">
        <div>
          <p className="eyebrow mb-1">{output.agentName}</p>
          <h3 className="font-heading text-lg text-foreground">{output.role}</h3>
        </div>
        <div className="w-28 shrink-0 text-right">
          <p className="font-mono text-[11px] text-muted-foreground">
            Confidence {confidence}%
          </p>
          <Progress value={confidence} className="mt-1.5 h-1" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-foreground/90">
          {output.summary}
        </p>
        <Section label="Findings" items={output.findings} />
        <Section label="Risks" items={output.risks} />
        <Section label="Recommendations" items={output.recommendations} />
      </CardContent>
    </Card>
  );
}
