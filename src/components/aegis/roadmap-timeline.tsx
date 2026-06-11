import type { GeneratedDocument } from "@/lib/types";

type Phase = { title: string; items: string[] };

/** Parse the roadmap markdown into phases for the timeline view. */
function parsePhases(markdown: string): Phase[] {
  const phases: Phase[] = [];
  let current: Phase | null = null;
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^## (Phase .+)$/);
    if (heading) {
      current = { title: heading[1], items: [] };
      phases.push(current);
      continue;
    }
    const bullet = line.match(/^- (.+)$/);
    if (bullet && current) current.items.push(bullet[1]);
  }
  return phases;
}

export function RoadmapTimeline({ roadmap }: { roadmap: GeneratedDocument | null }) {
  if (!roadmap) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        The implementation roadmap is generated when the analysis runs.
      </p>
    );
  }
  const phases = parsePhases(roadmap.markdown);
  return (
    <ol className="relative ml-3 space-y-8 border-l border-border pl-8">
      {phases.map((phase, i) => (
        <li
          key={phase.title}
          className="fade-up relative"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-gold/50 bg-background font-mono text-[11px] text-gold">
            {i + 1}
          </span>
          <h3 className="font-heading text-lg text-foreground">{phase.title}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
            {phase.items.map((item, j) => (
              <li key={j} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                  }}
                />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
