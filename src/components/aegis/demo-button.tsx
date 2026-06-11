"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Demo failed");
      router.push(`/evaluation/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={loadDemo} disabled={loading}>
        {loading ? "Running demo council…" : "Run Demo Scenario"}
      </Button>
      {error && <p className="text-xs text-nogo">{error}</p>}
    </div>
  );
}
