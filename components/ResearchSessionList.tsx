"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { researchStatuses } from "@/lib/research-sessions";
import { StatusBadge } from "@/components/WorkflowUI";

type Industry = { id: number; name: string };
type Session = {
  id: number;
  name: string | null;
  industry_name: string;
  started_date: string;
  status: string;
  checklist_json: string;
  notes: string | null;
  action_type: string | null;
  duration_seconds: number | null;
  evidence_created_count: number;
  opportunities_promoted_count: number;
  product_concepts_created_count: number;
  workflow_count: number; product_count: number; evidence_count: number; cluster_count: number;
  opportunity_count: number; validation_count: number; interview_count: number; concept_count: number; experiment_count: number;
  building: number;
};

export default function ResearchSessionList({ sessions, industries }: { sessions: Session[]; industries: Industry[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    industry_id: industries[0] ? String(industries[0].id) : "",
    started_date: new Date().toISOString().slice(0, 10),
    status: "Not Started",
    notes: "",
  });

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/research-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error ?? "Could not create session.");
      return;
    }
    router.push(`/research-sessions/${data.id}`);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Research Sessions</h1>
          <p className="subtitle">Track each industry from initial scan through validation.</p>
        </div>
        <button className="button" onClick={() => setCreating(true)} disabled={!industries.length}>New Research Session</button>
      </header>

      {!industries.length && (
        <div className="card empty">Create an industry before starting a research session.</div>
      )}

      {industries.length > 0 && sessions.length === 0 && (
        <div className="card action-empty"><p>No research sessions yet. Start a project to track an industry from evidence through building.</p><button className="button secondary small" onClick={() => setCreating(true)}>New Research Session</button></div>
      )}

      <div className="issue-list">
        {sessions.map((session) => {
          const complete = [
            true,
            session.evidence_count > 0,
            session.cluster_count > 0,
            session.opportunity_count > 0,
            session.validation_count > 0,
            session.interview_count >= 7,
            session.experiment_count > 0,
            session.building > 0,
          ].filter(Boolean).length;
          const percent = Math.round((complete / 8) * 100);
          return (
            <Link className="issue-row" href={`/research-sessions/${session.id}`} key={session.id}>
              <span className={`issue-icon ${session.status === "Complete" ? "complete" : ""}`} aria-hidden="true" />
              <span className="issue-main">
                <span className="issue-title">{session.name || `${session.industry_name} — Research`}</span>
                <span className="issue-meta">#{session.id} · {session.industry_name} · {formatDate(session.started_date)} · <StatusBadge status={session.status} /> · {formatDuration(session.duration_seconds)}</span>
              </span>
              <span className="issue-progress">
                <span className="progress-count">{complete}/8</span>
                <span className="progress-track"><span style={{ width: `${percent}%` }} /></span>
              </span>
            </Link>
          );
        })}
      </div>

      {creating && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCreating(false)}>
          <form className="modal research-modal" onSubmit={create}>
            <div className="modal-header">
              <h2>New Research Session</h2>
              <button type="button" className="button secondary small" onClick={() => setCreating(false)}>Close</button>
            </div>
            <div className="modal-body">
              {error && <div className="error">{error}</div>}
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="session-industry">Industry *</label>
                  <select id="session-industry" className="select" required value={form.industry_id} onChange={(event) => setForm({ ...form, industry_id: event.target.value })}>
                    {industries.map((industry) => <option key={industry.id} value={industry.id}>{industry.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="session-started">Started date *</label>
                  <input id="session-started" className="input" type="date" required value={form.started_date} onChange={(event) => setForm({ ...form, started_date: event.target.value })} />
                </div>
                <div className="field full">
                  <label htmlFor="session-status">Status *</label>
                  <select id="session-status" className="select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    {researchStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="session-notes">Notes</label>
                  <textarea id="session-notes" className="textarea" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="button secondary" onClick={() => setCreating(false)}>Cancel</button>
                <button className="button" disabled={saving}>{saving ? "Creating…" : "Create session"}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "in progress";
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
