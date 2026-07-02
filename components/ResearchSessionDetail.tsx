"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { researchStatuses } from "@/lib/research-sessions";
import { RecommendedAction, WorkflowStage } from "@/lib/workflow";
import { NextActionCard, PipelineHeader, StatusBadge } from "@/components/WorkflowUI";

type Industry = { id: number; name: string };
type RelatedItem = { id: number; name: string; detail: string | null; meta: string | null };
type Metrics = { evidence: number; clusters: number; opportunities: number; validations: number; interviews: number; concepts: number; experiments: number };
type Session = Record<string, string | number | null>;
type Activity = { id: string; label: string; detail: string; created_at: string };

export default function ResearchSessionDetail({
  session,
  industries,
  metrics,
  qualifiedOpportunityCount,
  stages,
  progress,
  nextAction,
  activity,
  related,
}: {
  session: Session;
  industries: Industry[];
  metrics: Metrics;
  qualifiedOpportunityCount: number;
  stages: WorkflowStage[];
  progress: number;
  nextAction: RecommendedAction;
  activity: Activity[];
  related: Record<keyof Metrics, RelatedItem[]>;
}) {
  const router = useRouter();
  const id = Number(session.id);
  const [form, setForm] = useState({
    industry_id: String(session.industry_id),
    started_date: String(session.started_date),
    status: String(session.status),
    notes: String(session.notes ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/research-sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setMessage(data.error ?? "Could not save session.");
    setMessage("Changes saved.");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete research session #${id}? Linked records will remain but lose their session link.`)) return;
    const response = await fetch(`/api/research-sessions/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/research-sessions");
  }

  return <>
    <div className="issue-breadcrumb">
      <Link href="/research-sessions">Research Sessions</Link><span>›</span>
      <Link href={`/industries/${session.industry_id}`}>{String(session.industry_name)}</Link><span>›</span>
      <span>{String(session.name || `Session #${id}`)}</span>
    </div>
    <header className="research-header">
      <div>
        <div className="title-with-badge"><h1>{String(session.name || `${session.industry_name} — Research`)}</h1><StatusBadge status={form.status} /></div>
        <p className="subtitle">Project homepage · Updated {formatTimestamp(session.updated_at)}</p>
      </div>
      <div className="actions">
        <button className="button secondary" onClick={remove}>Delete</button>
        <button className="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </div>
    </header>
    {message && <div className={message === "Changes saved." ? "saved-message" : "error"}>{message}</div>}

    <PipelineHeader stages={stages} />
    <NextActionCard action={nextAction} />

    <section className="card project-summary">
      <div className="project-summary-main">
        <span className="eyebrow">Summary</span>
        <h2>{String(session.industry_name)}</h2>
        <p>{String(session.notes || "Research project tracking evidence, qualified opportunities, validation, and experiments for this industry.")}</p>
        <div className="session-facts">
          <Fact label="Industry" value={String(session.industry_name)} />
          <Fact label="Status" value={form.status} />
          <Fact label="Started" value={formatTimestamp(session.started_at || session.started_date)} />
          <Fact label="Last Updated" value={formatTimestamp(session.updated_at)} />
        </div>
      </div>
      <div className="project-progress">
        <span className="eyebrow">Overall Project Completion</span>
        <strong>{progress}%</strong>
        <div className="progress-track large"><span style={{ width: `${progress}%` }} /></div>
        <p>Calculated from completed workflow stages.</p>
      </div>
    </section>

    <section className="run-metrics session-metrics project-metrics" aria-label="Project health">
      <Metric label="Evidence Count" value={metrics.evidence} href={`/evidence?sessionId=${id}`} />
      <Metric label="Evidence Patterns" value={metrics.clusters} href={`/evidence-clusters?sessionId=${id}`} />
      <Metric label="Qualified Opportunities" value={qualifiedOpportunityCount} href={`/opportunities?sessionId=${id}`} />
      <Metric label="Validation Plans" value={metrics.validations} href={`/validation-packages?sessionId=${id}`} />
      <Metric label="Interviews" value={metrics.interviews} href={`/interviews?sessionId=${id}`} />
      <Metric label="Product Concepts" value={metrics.concepts} href={`/product-concepts?sessionId=${id}`} />
      <Metric label="Experiments" value={metrics.experiments} href={`/experiments?sessionId=${id}`} />
    </section>

    <div className="research-layout">
      <div className="stack">
        <ActivityTimeline activity={activity} />
        <TopOpportunities items={related.opportunities.slice(0, 5)} />
        <RelatedSection title="Recent Evidence" items={related.evidence.slice(0, 8)} base="/evidence" emptyText="No evidence yet. Add the first customer signal to start building the case." actionLabel="Add Evidence" actionHref={`/evidence?new=1&sessionId=${id}`} />
        <RelatedSection title="Evidence Patterns" items={related.clusters} base="/evidence-clusters" emptyText="No evidence patterns yet. Group evidence to reveal recurring problems." actionLabel="Create Evidence Pattern" actionHref={`/evidence-clusters?new=1&sessionId=${id}`} />
        <RelatedSection title="Validation Plans" items={related.validations} base="/validation-packages" emptyText="No validation plan exists yet. Promote an opportunity before preparing customer discovery." actionLabel="Review Opportunities" actionHref={`/opportunities?sessionId=${id}`} />
        <RelatedSection title="Interviews" items={related.interviews} base="/interviews" emptyText="No interviews have been conducted yet. Start customer discovery to validate this project." actionLabel="Start Interviews" actionHref={`/interviews?new=1&sessionId=${id}`} />
        <RelatedSection title="Product Concepts" items={related.concepts} base="/product-concepts" emptyText="No product concepts have been generated yet. Validate an opportunity first." actionLabel="Review Opportunities" actionHref={`/opportunities?sessionId=${id}`} />
        <RelatedSection title="Experiments" items={related.experiments} base="/experiments" emptyText="No experiments are running yet. Select a product concept to create a measurable test." actionLabel="Create Experiment" actionHref={`/experiments?new=1&sessionId=${id}`} />
      </div>

      <aside className="stack sticky-sidebar">
        <section className="card issue-sidebar">
          <div className="section-title sidebar-title"><h2>Project Settings</h2></div>
          <div className="field">
            <label htmlFor="detail-status">Status</label>
            <select id="detail-status" className="select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {researchStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="detail-industry">Industry</label>
            <select id="detail-industry" className="select" value={form.industry_id} disabled>
              {industries.map((industry) => <option key={industry.id} value={industry.id}>{industry.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="detail-started">Started date</label>
            <input id="detail-started" className="input" type="date" value={form.started_date} onChange={(event) => setForm({ ...form, started_date: event.target.value })} />
          </div>
        </section>
        <section className="card notes-card">
          <div className="section-title"><h2>Notes</h2></div>
          <textarea className="notes-editor compact-editor" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add findings, decisions, and next steps…" />
        </section>
        <section className="card detail-body">
          <div className="section-title inline-title"><h2>Run Log</h2></div>
          <pre className="run-log compact-log">{String(session.full_run_log || "No run log yet.")}</pre>
        </section>
      </aside>
    </div>
  </>;
}

function ActivityTimeline({ activity }: { activity: Activity[] }) {
  return <section className="card section-card">
    <div className="section-title"><h2>Recent Activity</h2></div>
    {activity.length ? <div className="activity-timeline">{activity.map((item) => <div className="activity-item" key={item.id}>
      <span className="activity-dot" />
      <div><strong>{item.label}</strong><p>{item.detail}</p></div>
      <time>{relativeDate(item.created_at)}</time>
    </div>)}</div> : <div className="empty">Activity will appear as records are created.</div>}
  </section>;
}

function TopOpportunities({ items }: { items: RelatedItem[] }) {
  return <section className="card section-card">
    <div className="section-title"><h2>Top Opportunities</h2></div>
    {items.length ? <div className="table-wrap"><table><thead><tr><th>Opportunity</th><th>Status</th><th>Added</th></tr></thead><tbody>
      {items.map((item) => <tr key={item.id}><td className="cell-main"><Link href={`/opportunities/${item.id}`}>{item.name}</Link></td><td><StatusBadge status={item.detail} /></td><td>{formatTimestamp(item.meta)}</td></tr>)}
    </tbody></table></div> : <ActionEmpty text="No qualified opportunities yet. Generate opportunities from the strongest evidence patterns." label="Review Evidence Patterns" href="/evidence-clusters" />}
  </section>;
}

function RelatedSection({ title, items, base, emptyText, actionLabel, actionHref }: { title: string; items: RelatedItem[]; base: string; emptyText: string; actionLabel: string; actionHref: string }) {
  const linked = ["/evidence", "/evidence-clusters", "/opportunities"].includes(base);
  return <section className="card section-card">
    <div className="section-title"><h2>{title}</h2></div>
    {items.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Details</th><th>Date</th></tr></thead><tbody>
      {items.map((item) => <tr key={item.id}><td className="cell-main">{linked ? <Link href={`${base}/${item.id}`}>{item.name}</Link> : item.name}</td><td>{item.detail || "—"}</td><td>{formatTimestamp(item.meta)}</td></tr>)}
    </tbody></table></div> : <ActionEmpty text={emptyText} label={actionLabel} href={actionHref} />}
  </section>;
}

function ActionEmpty({ text, label, href }: { text: string; label: string; href: string }) {
  return <div className="action-empty"><p>{text}</p><Link className="button secondary small" href={href}>{label}</Link></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "—"}</p></div>;
}

function Metric({ label, value, href }: { label: string; value: number; href: string }) {
  return <Link className="card run-metric" href={href}><strong>{value}</strong><span>{label}</span></Link>;
}

function formatTimestamp(value: string | number | null) {
  if (!value) return "—";
  const text = String(value);
  const normalized = text.includes("T") ? text : `${text.replace(" ", "T")}Z`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: text.length > 10 ? "short" : undefined }).format(new Date(normalized));
}

function relativeDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatTimestamp(value);
}
