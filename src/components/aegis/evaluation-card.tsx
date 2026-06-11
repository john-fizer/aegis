import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { Evaluation } from "@/lib/types";

export function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Link href={`/evaluation/${evaluation.id}`} className="group block">
      <Card className="gold-rule overflow-hidden bg-card py-0 transition-colors group-hover:bg-secondary/60">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-1">{evaluation.organizationName}</p>
              <h3 className="font-heading text-lg leading-snug text-foreground">
                {evaluation.useCaseTitle}
              </h3>
            </div>
            <StatusBadge status={evaluation.status} />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {evaluation.problemStatement}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>Sensitivity: {evaluation.dataSensitivity}</span>
            <span>{evaluation.budgetRange}</span>
            <span>{evaluation.timeline}</span>
            <span>
              {new Date(evaluation.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
