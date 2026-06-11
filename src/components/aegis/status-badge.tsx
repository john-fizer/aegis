import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Decision, EvaluationStatus } from "@/lib/types";

const STATUS_STYLES: Record<EvaluationStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  running: "bg-caution/15 text-caution border-caution/40",
  complete: "bg-go/15 text-go border-go/40",
  failed: "bg-nogo/15 text-nogo border-nogo/40",
};

export function StatusBadge({ status }: { status: EvaluationStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[10px] uppercase tracking-widest", STATUS_STYLES[status])}
    >
      {status === "running" && (
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-caution" />
      )}
      {status}
    </Badge>
  );
}

const DECISION_STYLES: Record<Decision, string> = {
  Go: "bg-go/15 text-go border-go/40",
  "Conditional Go": "bg-caution/15 text-caution border-caution/40",
  "No-Go": "bg-nogo/15 text-nogo border-nogo/40",
};

export function DecisionBadge({
  decision,
  className,
}: {
  decision: Decision;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[10px] uppercase tracking-widest",
        DECISION_STYLES[decision],
        className
      )}
    >
      {decision}
    </Badge>
  );
}
