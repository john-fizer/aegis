import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { overallScore } from "@/agents/vendors";
import type { VendorScore } from "@/lib/types";

function ScoreCell({ value }: { value: number }) {
  const tone =
    value >= 8.5 ? "text-go" : value >= 6.5 ? "text-foreground/85" : "text-muted-foreground";
  return (
    <TableCell className={cn("text-center font-mono text-xs", tone)}>
      {value.toFixed(1)}
    </TableCell>
  );
}

export function VendorComparisonTable({ scores }: { scores: VendorScore[] }) {
  if (!scores.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Vendor comparison is generated when the analysis runs.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="eyebrow">Vendor</TableHead>
            <TableHead className="eyebrow">Offering</TableHead>
            <TableHead className="eyebrow text-center">Overall</TableHead>
            <TableHead className="eyebrow text-center">Fit</TableHead>
            <TableHead className="eyebrow text-center">Security</TableHead>
            <TableHead className="eyebrow text-center">Cost</TableHead>
            <TableHead className="eyebrow text-center">Governance</TableHead>
            <TableHead className="eyebrow text-center">Integration</TableHead>
            <TableHead className="eyebrow text-center">Enterprise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((s, i) => (
            <TableRow key={s.vendor} className={i === 0 ? "bg-gold/5" : undefined}>
              <TableCell className="font-medium text-foreground">
                {s.vendor}
                {i === 0 && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-gold">
                    Lead
                  </span>
                )}
                <p className="mt-1 max-w-sm text-xs font-normal text-muted-foreground">
                  {s.notes}
                </p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {s.modelOrService}
              </TableCell>
              <TableCell className="text-center font-mono text-sm font-semibold text-gold">
                {overallScore(s).toFixed(1)}
              </TableCell>
              <ScoreCell value={s.fitScore} />
              <ScoreCell value={s.securityScore} />
              <ScoreCell value={s.costScore} />
              <ScoreCell value={s.governanceScore} />
              <ScoreCell value={s.integrationScore} />
              <ScoreCell value={s.enterpriseScore} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
