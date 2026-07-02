"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { FieldConfig, SectionConfig } from "@/lib/sections";
import { labelFor, relationLabel, sourceTypes } from "@/lib/sections";
import { StatusBadge } from "@/components/WorkflowUI";

type ItemValue = string | number | null | number[];
type Item = Record<string, ItemValue>;
type RelationData = Record<string, Item[]>;

export default function SectionManager({
  section,
  industries,
  startCreating = false,
  initialValues,
}: {
  section: SectionConfig;
  industries: Item[];
  startCreating?: boolean;
  initialValues?: Item;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [relations, setRelations] = useState<RelationData>({ industries });
  const [search, setSearch] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [minSeverity, setMinSeverity] = useState("");
  const [editing, setEditing] = useState<Item | null | undefined>(startCreating ? null : undefined);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const hasFilters = Boolean(search || industryId || minScore || sourceType || minSeverity);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (industryId) params.set("industryId", industryId);
    if (minScore && section.slug === "ideas") params.set("minScore", minScore);
    if (minScore && ["opportunities", "product-concepts"].includes(section.slug)) params.set("minScore", minScore);
    if (sourceType && section.slug === "evidence") params.set("sourceType", sourceType);
    if (minSeverity && section.slug === "evidence") params.set("minSeverity", minSeverity);
    const response = await fetch(`/api/data/${section.slug}?${params}`, { cache: "no-store" });
    const data = await response.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [industryId, minScore, minSeverity, search, section.slug, sourceType]);

  useEffect(() => {
    const timer = setTimeout(loadItems, 180);
    return () => clearTimeout(timer);
  }, [loadItems]);

  useEffect(() => {
    const required = [...new Set(section.fields.filter((field) => field.relation && field.relation !== "industries").map((field) => field.relation!))];
    Promise.all(required.map(async (relation) => {
      const response = await fetch(`/api/data/${relation}`, { cache: "no-store" });
      const data = await response.json();
      return [relation, data.items ?? []] as const;
    })).then((entries) => setRelations((current) => ({ ...current, ...Object.fromEntries(entries) })));
  }, [section.fields]);

  async function remove(item: Item) {
    const name = displayName(item);
    if (!window.confirm(`Delete “${name}”? Related records may also be removed.`)) return;
    const response = await fetch(`/api/data/${section.slug}?id=${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error ?? "Delete failed.");
      return;
    }
    loadItems();
  }

  function displayName(item: Item) {
    const key = section.fields.find((field) => field.required && field.type !== "relation")?.key ?? section.columns[0];
    return String(item[key] ?? section.singular);
  }

  async function generateOpportunities() {
    setGenerating(true);
    setGenerationMessage("");
    const response = await fetch("/api/opportunities/generate", { method: "POST" });
    const data = await response.json();
    setGenerating(false);
    if (!response.ok) {
      setGenerationMessage(data.error ?? "Generation failed.");
      return;
    }
    setGenerationMessage(`${data.scored} patterns scored · ${data.promoted} promoted · ${data.leftAsEvidenceClusters} kept as Evidence Patterns`);
    loadItems();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{section.title}</h1>
          <p className="subtitle">{sectionSubtitle(section.slug)}</p>
        </div>
        <div className="actions">
          {section.slug === "evidence" && <button className="button secondary" onClick={() => setBulkOpen(true)}>Bulk Add Evidence</button>}
          {["evidence-clusters", "opportunities"].includes(section.slug) && <button className="button" disabled={generating} onClick={generateOpportunities}>{generating ? "Generating…" : "Generate Opportunities"}</button>}
          {section.slug !== "opportunities" && <button className="button" onClick={() => setEditing(null)}>Add {section.singular}</button>}
        </div>
      </header>
      {generationMessage && <div className="generation-result">{generationMessage}</div>}

      <div className="filters card">
        <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section.title.toLowerCase()}…`} />
        {section.slug !== "industries" && (
          <select className="select" value={industryId} onChange={(event) => setIndustryId(event.target.value)}>
            <option value="">All industries</option>
            {industries.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}
          </select>
        )}
        {["opportunities", "product-concepts"].includes(section.slug) && (
          <select className="select" value={minScore} onChange={(event) => setMinScore(event.target.value)}>
            <option value="">Any score</option>
            {(section.slug === "product-concepts" ? [60, 50, 40] : [90, 80, 70, 60, 50]).map((value) => <option value={value} key={value}>{value}+ score</option>)}
          </select>
        )}
        {section.slug === "evidence" && (
          <>
            <select className="select" value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
              <option value="">All source types</option>
              {sourceTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select className="select" value={minSeverity} onChange={(event) => setMinSeverity(event.target.value)}>
              <option value="">Any severity</option>
              {[9, 8, 7, 6, 5].map((value) => <option key={value} value={value}>{value}+ severity</option>)}
            </select>
          </>
        )}
        <span className={`filter-count ${loading ? "filter-count-loading" : ""}`}>{loading ? "Updating results" : `${items.length} result${items.length === 1 ? "" : "s"}`}</span>
        {hasFilters && <button className="clear-filters" type="button" onClick={() => { setSearch(""); setIndustryId(""); setMinScore(""); setSourceType(""); setMinSeverity(""); }}>Clear filters</button>}
      </div>

      <div className={`card table-wrap section-table section-table-${section.slug}`}>
        {loading ? <TableSkeleton columns={section.columns.length + (section.slug === "product-concepts" ? 2 : 1)} /> : items.length === 0 ? <div className="action-empty">
          <p>{emptyGuidance(section.slug, section.title)}</p>
          {section.slug !== "opportunities" && <button className="button secondary small" onClick={() => setEditing(null)}>Add {section.singular}</button>}
          {section.slug === "opportunities" && <Link className="button secondary small" href="/evidence-clusters">Review Evidence Patterns</Link>}
        </div> : (
          <table>
            <thead>
              <tr>
                {section.columns.map((column) => <th key={column}>{section.slug === "opportunities" && column === "evidence_count" ? "Proof" : labelFor(column, section)}</th>)}
                {section.slug === "product-concepts" && <th>Decision</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item.id)}>
                  {section.columns.map((column, index) => (
                    <td key={column} className={index === 0 ? "cell-main" : ""}>
                      {index === 0 && (Number(item.is_sample) === 1 || String(item.industry_name ?? item.name ?? "").startsWith("[Sample]")) && <span className="sample-badge">Sample</span>}
                      {["total_score", "opportunity_score"].includes(column)
                        ? <ScoreValue value={item[column]} max={column === "total_score" && section.slug === "product-concepts" ? 70 : 100} />
                        : ["status", "opportunity_status", "review_status"].includes(column)
                          ? <StatusBadge status={String(item[column] ?? "")} />
                        : column === "opportunity_name" && section.slug === "opportunities"
                          ? <><Link className="section-link row-title" href={`/opportunities/${item.id}`}>{String(item[column])}</Link><small>{String(item.industry_name ?? "")}</small></>
                        : column === "confidence_score" && section.slug === "opportunities"
                          ? <span className="confidence-value">{String(item[column])}/10</span>
                        : column === "evidence_count" && section.slug === "opportunities"
                          ? <span className="proof-value"><strong>{String(item[column])}</strong> evidence · <strong>{String(item.interview_count ?? 0)}</strong> interviews</span>
                        : column === "concept_name" && section.slug === "product-concepts"
                          ? <><span className="row-title">{String(item[column])}</span><small>{String(item.opportunity_name ?? "")}</small></>
                        : column === "name" && section.slug === "workflows"
                          ? <><span className="row-title">{String(item[column])}</span><small>{String(item.industry_name ?? "")}</small></>
                        : column === "pain_description" && section.slug === "workflows"
                          ? <span className="workflow-summary">{truncate(item[column], 78)}</span>
                        : column === "who_does_it" && section.slug === "workflows"
                          ? <span className="workflow-summary">{truncate(item[column], 54)}</span>
                        : column === "cluster_name"
                          ? <Link className="section-link" href={`/evidence-clusters/${item.id}`}>{String(item[column])}</Link>
                        : column === "quote_snippet"
                          ? <Link className="section-link" href={`/evidence/${item.id}`}>{truncate(item[column])}</Link>
                        : column === "website" && item[column]
                          ? <a href={String(item[column])} target="_blank" rel="noreferrer">{String(item[column])}</a>
                        : truncate(item[column], section.slug === "workflows" ? 68 : 100)}
                    </td>
                  ))}
                  {section.slug === "product-concepts" && <td><div className="concept-decision"><DecisionBadge value={conceptDecision(item, items)} /><small>{conceptDecisionReason(item, items)}</small></div></td>}
                  <td>
                    <div className="actions row-actions">
                      {section.slug === "opportunities" && <Link className="button secondary small" href={`/opportunities/${item.id}`}>Open</Link>}
                      {section.slug === "evidence" && <Link className="button secondary small" href={`/evidence/${item.id}`}>View</Link>}
                      {section.slug === "evidence-clusters" && <Link className="button secondary small" href={`/evidence-clusters/${item.id}`}>View</Link>}
                      {section.slug === "evidence-clusters" && item.opportunity_id
                        ? <Link className="button secondary small" href={`/opportunities/${item.opportunity_id}`}>View Opportunity</Link>
                        : null}
                      <button className="button secondary small" onClick={() => setEditing(item)}>Edit</button>
                      <button className="button danger small" onClick={() => remove(item)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== undefined && (
        <ItemModal
          section={section}
          item={editing ?? null}
          creating={editing === null}
          relations={relations}
          initialValues={initialValues}
          onClose={() => { setEditing(undefined); setError(""); }}
          error={error}
          onSave={async (payload) => {
            setError("");
            const response = await fetch(`/api/data/${section.slug}`, {
              method: editing ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
            });
            const data = await response.json();
            if (!response.ok) {
              setError(data.error ?? "Save failed.");
              return;
            }
            setEditing(undefined);
            loadItems();
          }}
        />
      )}
      {bulkOpen && (
        <BulkEvidenceModal
          relations={relations}
          onClose={() => setBulkOpen(false)}
          onSaved={() => { setBulkOpen(false); loadItems(); }}
        />
      )}
    </>
  );
}

function sectionSubtitle(slug: string) {
  const subtitles: Record<string, string> = {
    industries: "Choose the markets worth investigating.",
    workflows: "Understand how work gets done and where friction repeats.",
    products: "Compare the software customers use and where it falls short.",
    evidence: "Collect customer signals before drawing conclusions.",
    "evidence-clusters": "Find recurring patterns across customer evidence.",
    "pain-points": "Define the customer problems supported by repeated evidence.",
    opportunities: "Rank the strongest problems worth solving.",
    "product-concepts": "Explore possible solutions for validated problems.",
    "validation-packages": "Reduce uncertainty before building.",
    interviews: "Capture what customers say, do, and will pay for.",
    experiments: "Test the riskiest assumptions with measurable outcomes.",
    "research-sessions": "Keep each market investigation focused on the next decision.",
  };
  return subtitles[slug] ?? "Keep the research organized and ready for the next decision.";
}

function ScoreValue({ value, max }: { value: ItemValue; max: number }) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return <span className="muted">—</span>;
  return <span className="score-value"><strong>{numeric}</strong><i><b style={{ width: `${Math.max(0, Math.min(100, numeric / max * 100))}%` }} /></i></span>;
}

function conceptDecision(item: Item, items: Item[]) {
  const peers = items
    .filter((candidate) => String(candidate.opportunity_id) === String(item.opportunity_id))
    .sort((a, b) => Number(b.total_score ?? 0) - Number(a.total_score ?? 0));
  const index = peers.findIndex((candidate) => String(candidate.id) === String(item.id));
  if (index === 0) return "Recommended";
  if (index === 1) return "Runner-up";
  return "Needs more validation";
}

function conceptDecisionReason(item: Item, items: Item[]) {
  const peers = items
    .filter((candidate) => String(candidate.opportunity_id) === String(item.opportunity_id))
    .sort((a, b) => Number(b.total_score ?? 0) - Number(a.total_score ?? 0));
  const index = peers.findIndex((candidate) => String(candidate.id) === String(item.id));
  if (index === 0) return "Highest current score; strongest build candidate.";
  if (index === 1) {
    const gap = Math.max(0, Number(peers[0]?.total_score ?? 0) - Number(item.total_score ?? 0));
    return `${gap}-point gap; best alternative if the leader’s assumption fails.`;
  }
  return "Validate demand and differentiation before selecting.";
}

function DecisionBadge({ value }: { value: string }) {
  const slug = value.toLowerCase().replaceAll(" ", "-");
  return <span className={`decision-badge decision-${slug}`}>{value}</span>;
}

function emptyGuidance(slug: string, title: string) {
  const messages: Record<string, string> = {
    evidence: "No evidence matches these filters. Add customer proof to move research forward.",
    "evidence-clusters": "No evidence patterns match these filters. Add and group evidence to reveal recurring problems.",
    opportunities: "No opportunities match these filters. Review qualified evidence patterns and promote the strongest problem.",
    "validation-packages": "No validation plans match these filters. Open an opportunity to prepare customer discovery.",
    interviews: "No interviews match these filters. Start customer discovery from a validation plan.",
    "product-concepts": "No product concepts match these filters. Validate an opportunity before defining a solution.",
    experiments: "No experiments match these filters. Select a product concept and launch a measurable test.",
  };
  return messages[slug] ?? `No ${title.toLowerCase()} match these filters. Add the first record to continue.`;
}

function TableSkeleton({ columns }: { columns: number }) {
  return <div className="table-skeleton" role="status" aria-label="Loading results">
    {Array.from({ length: 6 }, (_, row) => <div className="skeleton-row" key={row}>
      {Array.from({ length: columns }, (_, column) => <span className="skeleton-block" key={column} />)}
    </div>)}
  </div>;
}

function ItemModal({ section, item, creating, relations, initialValues, onClose, onSave, error }: {
  section: SectionConfig;
  item: Item | null;
  creating: boolean;
  relations: RelationData;
  initialValues?: Item;
  onClose: () => void;
  onSave: (payload: Item) => Promise<void>;
  error: string;
}) {
  const initial = useMemo(() => Object.fromEntries(section.fields.map((field) => {
    const current = item?.[field.key] ?? initialValues?.[field.key];
    const value = field.type === "multi-relation"
      ? (Array.isArray(current) ? current : String(current ?? "").split(",").filter(Boolean).map(Number))
      : current ?? (field.type === "number" && field.min === 1 ? 5 : field.options?.[0] ?? "");
    return [field.key, value];
  })), [initialValues, item, section.fields]);
  const [values, setValues] = useState<Item>(initial);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSave(values);
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <h2>{creating ? "Create" : "Edit"} {section.singular}</h2>
          <button type="button" className="button secondary small" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          <div className="form-grid">
            {section.fields.map((field) => (
              <div className={`field ${field.full ? "full" : ""}`} key={field.key}>
                <label htmlFor={field.key}>{field.label}{field.required ? " *" : ""}</label>
                <Field field={field} value={values[field.key]} relations={relations} onChange={(value) => setValues((current) => ({
                  ...current,
                  [field.key]: value,
                  ...(section.slug === "evidence" && field.key === "source_type"
                    ? { evidence_quality_score: defaultQuality(String(value)) }
                    : {}),
                }))} />
              </div>
            ))}
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

function Field({ field, value, relations, onChange }: { field: FieldConfig; value: Item[string]; relations: RelationData; onChange: (value: ItemValue) => void }) {
  const common = {
    id: field.key,
    required: field.required,
    value: String(value ?? ""),
    disabled: field.readOnly,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
  };
  if (field.type === "textarea") return <textarea className="textarea" {...common} />;
  if (field.type === "select") return <select className="select" {...common}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  if (field.type === "relation") {
    return (
      <select className="select" {...common}>
        <option value="">{field.required ? "Select…" : "None"}</option>
        {(relations[field.relation!] ?? []).map((item) => {
          const label = relationLabel[field.relation!];
          return <option key={String(item.id)} value={String(item.id)}>{truncate(item[label], 90)}</option>;
        })}
      </select>
    );
  }
  if (field.type === "multi-relation") {
    const selected = Array.isArray(value) ? value.map(String) : String(value ?? "").split(",").filter(Boolean);
    return (
      <select
        className="select multi-select"
        id={field.key}
        multiple
        disabled={field.readOnly}
        value={selected}
        onChange={(event) => onChange(Array.from(event.currentTarget.selectedOptions, (option) => Number(option.value)))}
      >
        {(relations[field.relation!] ?? []).map((item) => {
          const label = relationLabel[field.relation!];
          const assignedElsewhere = field.relation === "evidence" && Boolean(item.cluster_id) && !selected.includes(String(item.id));
          const suffix = assignedElsewhere ? ` — already in ${String(item.cluster_name)}` : "";
          return <option disabled={assignedElsewhere} key={String(item.id)} value={String(item.id)}>{truncate(`${String(item[label] ?? "")}${suffix}`, 110)}</option>;
        })}
      </select>
    );
  }
  return <input className="input" type={field.type} min={field.min} max={field.max} {...common} />;
}

function truncate(value: Item[string], length = 100) {
  if (value === null || value === undefined || value === "") return <span className="muted">—</span>;
  const text = String(value);
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function defaultQuality(sourceType: string) {
  const source = sourceType.toLowerCase();
  if (source.includes("owner") || source.includes("buyer") || source.includes("revenue") || source.includes("payment")) return 10;
  if (source.includes("staff") || source.includes("user") || source.includes("support") || source.includes("internal")) return 9;
  if (source === "g2") return 7;
  if (["capterra", "app store", "google play"].includes(source)) return 6;
  return 5;
}

function BulkEvidenceModal({ relations, onClose, onSaved }: { relations: RelationData; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState({ research_session_id: "", industry_id: "", workflow_id: "", product_id: "", source_type: "Reddit", snippets: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/evidence/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error ?? "Bulk import failed.");
    onSaved();
  }

  const selectRelation = (key: "research_session_id" | "industry_id" | "workflow_id" | "product_id", label: string, relation: string, required = false) => (
    <div className="field">
      <label>{label}{required ? " *" : ""}</label>
      <select className="select" value={values[key]} required={required} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}>
        <option value="">{required ? "Select…" : "None"}</option>
        {(relations[relation] ?? []).map((item) => <option key={String(item.id)} value={String(item.id)}>{truncate(item[relationLabel[relation]], 100)}</option>)}
      </select>
    </div>
  );

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header"><h2>Bulk Add Evidence</h2><button type="button" className="button secondary small" onClick={onClose}>Close</button></div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          <p className="subtitle bulk-help">Select shared details once, then paste one evidence snippet per line.</p>
          <div className="form-grid">
            {selectRelation("research_session_id", "Research Session", "research-sessions", true)}
            {selectRelation("industry_id", "Industry", "industries", true)}
            {selectRelation("workflow_id", "Workflow", "workflows")}
            {selectRelation("product_id", "Software product", "products")}
            <div className="field">
              <label>Source type *</label>
              <select className="select" value={values.source_type} onChange={(event) => setValues((current) => ({ ...current, source_type: event.target.value }))}>
                {sourceTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="field full">
              <label>Evidence snippets *</label>
              <textarea className="textarea bulk-textarea" required value={values.snippets} onChange={(event) => setValues((current) => ({ ...current, snippets: event.target.value }))} placeholder={"First evidence snippet\nSecond evidence snippet\nThird evidence snippet"} />
            </div>
          </div>
          <div className="modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button" disabled={saving}>{saving ? "Adding…" : "Add Evidence"}</button></div>
        </div>
      </form>
    </div>
  );
}
