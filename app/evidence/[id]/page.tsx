import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Evidence = {
  id: number;
  source_type: string;
  source_name: string;
  source_url: string | null;
  quote_snippet: string;
  evidence_summary: string | null;
  pain_category: string | null;
  severity: number;
  confidence: number;
  date_collected: string;
  notes: string | null;
  industry_name: string;
  workflow_name: string | null;
  cluster_id: number | null;
  cluster_name: string | null;
  evidence_quality_score: number;
  review_status: string;
};

export default async function EvidenceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidence = db.prepare(`
    SELECT e.*, i.name AS industry_name, w.name AS workflow_name,
      eci.cluster_id, ec.cluster_name
    FROM evidence e
    JOIN industries i ON i.id = e.industry_id
    LEFT JOIN workflows w ON w.id = e.workflow_id
    LEFT JOIN evidence_cluster_items eci ON eci.evidence_id = e.id
    LEFT JOIN evidence_clusters ec ON ec.id = eci.cluster_id
    WHERE e.id = ?
  `).get(Number(id)) as Evidence | undefined;
  if (!evidence) notFound();

  return (
    <>
      <header className="page-header">
        <div>
          <p className="subtitle"><Link href="/evidence">Evidence</Link> / {evidence.industry_name}</p>
          <h1>Evidence #{evidence.id} {evidence.industry_name.startsWith("[Sample]") && <span className="sample-badge">Sample</span>}</h1>
        </div>
        <Link className="button secondary" href="/evidence">Back to Evidence</Link>
      </header>
      <div className="detail-grid">
        <section className="card detail-body">
          <Detail label="Quote / snippet" value={evidence.quote_snippet} />
          <Detail label="Evidence summary" value={evidence.evidence_summary} />
          <Detail label="Source" value={`${evidence.source_type} · ${evidence.source_name}`} />
          {evidence.source_url && <div className="detail-field"><h3>Source link</h3><p><a href={evidence.source_url} target="_blank" rel="noreferrer">Open original source</a></p></div>}
          <Detail label="Pain category" value={evidence.pain_category} />
          <Detail label="Review status" value={evidence.review_status} />
          <Detail label="Notes" value={evidence.notes} />
        </section>
        <aside className="stack">
          <div className="detail-stats">
            <div className="card detail-stat"><strong>{evidence.severity}/10</strong><span>Severity</span></div>
            <div className="card detail-stat"><strong>{evidence.confidence}/10</strong><span>Confidence</span></div>
            <div className="card detail-stat"><strong>{evidence.evidence_quality_score}/10</strong><span>Evidence Quality</span></div>
          </div>
          <section className="card detail-body">
            <Detail label="Industry" value={evidence.industry_name} />
            <Detail label="Workflow" value={evidence.workflow_name} />
            <Detail label="Collected" value={evidence.date_collected} />
            <div className="detail-field"><h3>Evidence Pattern</h3><p>{evidence.cluster_id
              ? <Link href={`/evidence-clusters/${evidence.cluster_id}`}>{evidence.cluster_name}</Link>
              : "Not grouped into a pattern"}</p></div>
          </section>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "—"}</p></div>;
}
