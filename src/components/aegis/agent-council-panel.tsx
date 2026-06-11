import { AgentOutputCard } from "./agent-output-card";
import type { AgentOutput } from "@/lib/types";

export function AgentCouncilPanel({ outputs }: { outputs: AgentOutput[] }) {
  if (!outputs.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No agent assessments yet. Run the analysis to convene the council.
      </p>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {outputs.map((output, i) => (
        <div
          key={output.id}
          className="fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <AgentOutputCard output={output} />
        </div>
      ))}
    </div>
  );
}
