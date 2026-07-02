"use client";

import { FormEvent, MouseEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/WorkflowUI";

type PipelineItem = {
  id: number;
  name: string;
  overall_score: number | null;
  status: string;
  research_stage: string;
  priority: string;
  notes: string | null;
  updated_at: string;
  industry_record_id: number | null;
};

const statuses = ["Backlog", "Researching", "Validated", "Rejected", "Building"];
const stages = ["Scoring", "Software Audit", "Workflow Mapping", "Evidence Collection", "Opportunity Mapping", "Interviews", "MVP", "Complete"];
const priorities = ["High", "Medium", "Low"];

const emptyItem = {
  name: "",
  overall_score: "",
  status: "Backlog",
  research_stage: "Scoring",
  priority: "Medium",
  notes: "",
};

export default function IndustryPipeline() {
  const router = useRouter();
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [scoreSort, setScoreSort] = useState<"asc" | "desc">("desc");
  const [editing, setEditing] = useState<PipelineItem | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ scoreSort });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (stage) params.set("stage", stage);
    if (priority) params.set("priority", priority);
    const response = await fetch(`/api/data/industry-pipeline?${params}`, { cache: "no-store" });
    const data = await response.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [priority, scoreSort, search, stage, status]);

  useEffect(() => {
    const timer = setTimeout(loadItems, 180);
    return () => clearTimeout(timer);
  }, [loadItems]);

  async function remove(item: PipelineItem, event: MouseEvent) {
    event.stopPropagation();
    if (!window.confirm(`Delete “${item.name}” from the pipeline?`)) return;
    const response = await fetch(`/api/data/industry-pipeline?id=${item.id}`, { method: "DELETE" });
    if (!response.ok) return window.alert((await response.json()).error ?? "Delete failed.");
    loadItems();
  }

  async function startResearch(item: PipelineItem, event: MouseEvent) {
    event.stopPropagation();
    const response = await fetch("/api/research-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_id: item.id }),
    });
    if (!response.ok) return window.alert((await response.json()).error ?? "Update failed.");
    const data = await response.json();
    router.push(`/research-sessions/${data.id}`);
  }

  function openRecord(item: PipelineItem) {
    if (item.industry_record_id) router.push(`/industries/${item.industry_record_id}`);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Industry Pipeline</h1>
          <p className="subtitle">Prioritize which markets deserve research next.</p>
        </div>
        <button className="button" onClick={() => setEditing(null)}>Add Industry</button>
      </header>

      <div className="filters">
        <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search industries…" />
        <Filter value={status} onChange={setStatus} label="All statuses" options={statuses} />
        <Filter value={stage} onChange={setStage} label="All stages" options={stages} />
        <Filter value={priority} onChange={setPriority} label="All priorities" options={priorities} />
      </div>

      <div className="card table-wrap">
        {loading ? <PipelineSkeleton /> : items.length === 0 ? <div className="action-empty"><p>No industries match these filters. Add an industry to the research backlog or clear the filters.</p><button className="button secondary small" onClick={() => setEditing(null)}>Add Industry</button></div> : (
          <table className="pipeline-table">
            <thead>
              <tr>
                <th>Industry</th>
                <th>
                  <button className="sort-button" onClick={() => setScoreSort((current) => current === "desc" ? "asc" : "desc")}>
                    Overall Score (/100) {scoreSort === "desc" ? "↓" : "↑"}
                  </button>
                </th>
                <th>Status</th>
                <th>Research Stage</th>
                <th>Priority</th>
                <th>Last Updated</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={item.industry_record_id ? "clickable-row" : ""}
                  onClick={() => openRecord(item)}
                  title={item.industry_record_id ? "Open full industry record" : "No full industry record yet"}
                >
                  <td className="cell-main">{item.name}</td>
                  <td>{item.overall_score === null ? <span className="muted">—</span> : <span className="score">{item.overall_score}</span>}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{item.research_stage}</td>
                  <td><span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td>{formatDate(item.updated_at)}</td>
                  <td><span className="table-preview">{truncate(item.notes, 90)}</span></td>
                  <td>
                    <div className="actions">
                      <button className="button secondary small" disabled={item.status === "Researching" && item.research_stage === "Scoring"} onClick={(event) => startResearch(item, event)}>Start Research</button>
                      <button className="button secondary small" onClick={(event) => { event.stopPropagation(); setEditing(item); }}>Edit</button>
                      <button className="button danger small" onClick={(event) => remove(item, event)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== undefined && <PipelineModal item={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); loadItems(); }} />}
    </>
  );
}

function Filter({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[] }) {
  return (
    <select className="select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}

function PipelineSkeleton() {
  return <div className="table-skeleton" role="status" aria-label="Loading industries">
    {Array.from({ length: 6 }, (_, row) => <div className="skeleton-row" key={row}>
      {Array.from({ length: 8 }, (_, column) => <span className="skeleton-block" key={column} />)}
    </div>)}
  </div>;
}

function truncate(value: string | null, length: number) {
  if (!value) return "—";
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function PipelineModal({ item, onClose, onSaved }: { item: PipelineItem | null; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState(() => item ? {
    name: item.name,
    overall_score: item.overall_score ?? "",
    status: item.status,
    research_stage: item.research_stage,
    priority: item.priority,
    notes: item.notes ?? "",
  } : emptyItem);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/data/industry-pipeline", {
      method: item ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item ? { ...values, id: item.id } : values),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error ?? "Save failed.");
    onSaved();
  }

  const set = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <h2>{item ? "Edit" : "Add"} Pipeline Industry</h2>
          <button type="button" className="button secondary small" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          <div className="form-grid">
            <Field label="Industry *"><input className="input" required value={values.name} onChange={(event) => set("name", event.target.value)} /></Field>
            <Field label="Overall Score (/100)"><input className="input" type="number" min="0" max="100" value={values.overall_score} onChange={(event) => set("overall_score", event.target.value)} /></Field>
            <Field label="Status *"><Filter value={values.status} onChange={(value) => set("status", value)} label="Select status" options={statuses} /></Field>
            <Field label="Research Stage *"><Filter value={values.research_stage} onChange={(value) => set("research_stage", value)} label="Select stage" options={stages} /></Field>
            <Field label="Priority *"><Filter value={values.priority} onChange={(value) => set("priority", value)} label="Select priority" options={priorities} /></Field>
            <div className="field full"><label>Notes</label><textarea className="textarea" value={values.notes} onChange={(event) => set("notes", event.target.value)} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button className="button" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

function formatDate(value: string) {
  const date = new Date(value.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
