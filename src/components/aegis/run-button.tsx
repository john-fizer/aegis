"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { EvaluationStatus } from "@/lib/types";

export function RunButton({
  evaluationId,
  status,
}: {
  evaluationId: string;
  status: EvaluationStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}/run`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Run failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={run} disabled={loading}>
        {loading
          ? "Council in session…"
          : status === "complete"
            ? "Re-run Analysis"
            : "Run Multi-Agent Analysis"}
      </Button>
      {error && <p className="max-w-xs text-right text-xs text-nogo">{error}</p>}
    </div>
  );
}
