import Link from "next/link";
import { RecommendedAction, WorkflowStage } from "@/lib/workflow";

export function PipelineHeader({ stages }: { stages: WorkflowStage[] }) {
  const currentIndex = stages.findIndex((stage) => !stage.complete);
  return <nav className="pipeline-header" aria-label="Workflow progress">
    {stages.map((stage, index) => {
      const state = stage.complete ? "complete" : index === currentIndex ? "current" : "future";
      return <Link className={`pipeline-step ${state}`} href={stage.href} key={stage.key}>
        <span className="pipeline-label">{stage.label}</span>
        <span className="pipeline-line"><i /></span>
      </Link>;
    })}
  </nav>;
}

export function WorkflowCard({ title = "Research Progress", stages }: { title?: string; stages: WorkflowStage[] }) {
  const complete = stages.filter((stage) => stage.complete).length;
  return <section className="card workflow-card">
    <div className="workflow-card-heading">
      <div><h2>{title}</h2><p>{complete} of {stages.length} stages complete</p></div>
      <strong>{Math.round((complete / stages.length) * 100)}%</strong>
    </div>
    <div className="workflow-stage-list">
      {stages.map((stage) => <Link className={`workflow-stage-row ${stage.complete ? "complete" : ""}`} href={stage.href} key={stage.key}>
        <span className="workflow-check" aria-hidden="true">{stage.complete ? "✓" : "○"}</span>
        <span>{stage.label}{stage.detail ? ` (${stage.detail})` : ""}</span>
        <span className="workflow-arrow">→</span>
      </Link>)}
    </div>
  </section>;
}

export function NextActionCard({ action }: { action: RecommendedAction }) {
  return <section className="card next-action-card">
    <div>
      <span className="eyebrow">Next Recommended Action</span>
      <h2>{action.label}</h2>
      <p>{action.description}</p>
    </div>
    <Link className="button" href={action.href}>{action.label} →</Link>
  </section>;
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeStatus(status);
  const slug = normalized.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${slug}`}>{normalized}</span>;
}

export function normalizeStatus(status: string | null | undefined) {
  const value = status?.trim() || "Draft";
  const aliases: Record<string, string> = {
    "Created": "Draft",
    "Not Started": "Draft",
    "In Progress": "Running",
    "Ready for Prototype": "Validated",
    "Ready for Pilot": "Validated",
    "Complete": "Completed",
  };
  return aliases[value] ?? value;
}
