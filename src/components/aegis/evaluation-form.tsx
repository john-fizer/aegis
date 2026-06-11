"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EvaluationInput } from "@/lib/types";

const INITIAL: EvaluationInput = {
  organizationName: "",
  useCaseTitle: "",
  problemStatement: "",
  dataSensitivity: "Moderate",
  budgetRange: "",
  timeline: "",
  preferredCloud: "No Preference",
  humanInLoop: true,
  currentSystems: "",
  desiredOutcome: "",
};

export function EvaluationForm() {
  const router = useRouter();
  const [form, setForm] = useState<EvaluationInput>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EvaluationInput>(key: K, value: EvaluationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create evaluation");
      router.push(`/evaluation/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="gold-rule bg-card py-0">
        <CardContent className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org">Organization name</Label>
            <Input
              id="org"
              required
              value={form.organizationName}
              onChange={(e) => set("organizationName", e.target.value)}
              placeholder="Federal Acquisition Office"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Use case title</Label>
            <Input
              id="title"
              required
              value={form.useCaseTitle}
              onChange={(e) => set("useCaseTitle", e.target.value)}
              placeholder="AI Procurement Document Review"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="problem">Problem statement</Label>
            <Textarea
              id="problem"
              required
              rows={4}
              value={form.problemStatement}
              onChange={(e) => set("problemStatement", e.target.value)}
              placeholder="Describe the mission problem this AI capability should address…"
            />
          </div>
          <div className="space-y-2">
            <Label>Data sensitivity</Label>
            <Select
              value={form.dataSensitivity}
              onValueChange={(v) =>
                set("dataSensitivity", v as EvaluationInput["dataSensitivity"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred cloud</Label>
            <Select
              value={form.preferredCloud}
              onValueChange={(v) =>
                set("preferredCloud", v as EvaluationInput["preferredCloud"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Azure">Azure</SelectItem>
                <SelectItem value="Google Cloud">Google Cloud</SelectItem>
                <SelectItem value="No Preference">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget range</Label>
            <Input
              id="budget"
              required
              value={form.budgetRange}
              onChange={(e) => set("budgetRange", e.target.value)}
              placeholder="$250,000 - $1,000,000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              required
              value={form.timeline}
              onChange={(e) => set("timeline", e.target.value)}
              placeholder="6 months"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="systems">Current systems / tools</Label>
            <Input
              id="systems"
              required
              value={form.currentSystems}
              onChange={(e) => set("currentSystems", e.target.value)}
              placeholder="SharePoint, Microsoft 365, document repositories"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="outcome">Desired outcome</Label>
            <Textarea
              id="outcome"
              required
              rows={3}
              value={form.desiredOutcome}
              onChange={(e) => set("desiredOutcome", e.target.value)}
              placeholder="Reduce manual review time, flag risks earlier…"
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch
              id="hitl"
              checked={form.humanInLoop}
              onCheckedChange={(v) => set("humanInLoop", v)}
            />
            <Label htmlFor="hitl" className="cursor-pointer">
              Human-in-the-loop review required
            </Label>
          </div>
          <div className="flex items-center justify-between gap-4 md:col-span-2">
            {error ? (
              <p className="text-sm text-nogo">{error}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Creating an evaluation does not run the council — you can review
                the brief first.
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Evaluation"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
