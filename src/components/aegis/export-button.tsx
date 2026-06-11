import { Button } from "@/components/ui/button";

export function ExportButton({ evaluationId }: { evaluationId: string }) {
  return (
    <Button
      variant="outline"
      render={
        <a href={`/api/evaluations/${evaluationId}/export/markdown`} download />
      }
    >
      Export Full Report (.md)
    </Button>
  );
}
