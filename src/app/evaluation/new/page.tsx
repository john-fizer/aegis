import { EvaluationForm } from "@/components/aegis/evaluation-form";

export default function NewEvaluationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="fade-up">
        <p className="eyebrow mb-3">New Evaluation</p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Brief the council
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe the AI use case. The multi-agent council uses every field
          below to ground its assessment, so specificity improves the output.
        </p>
      </div>
      <div className="fade-up" style={{ animationDelay: "100ms" }}>
        <EvaluationForm />
      </div>
    </div>
  );
}
