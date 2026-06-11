import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import type { GeneratedDocument } from "@/lib/types";

export function MarkdownReportViewer({
  document,
}: {
  document: GeneratedDocument;
}) {
  return (
    <Card className="bg-card py-0">
      <CardContent className="p-6">
        <div className="report-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {document.markdown}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
