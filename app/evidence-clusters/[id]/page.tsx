import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/WorkflowUI";

export const dynamic = "force-dynamic";

type Cluster = {
  id: number;
  cluster_name: string;
  problem_summary: string;
  business_impact: string | null;
  notes: string | null;
  industry_name: string;
  workflow_name: string | null;
  evidence_count: number;
  average_severity: number | null;
  average_confidence: number | null;
  pain_score: number | null;
  frequency_score: number | null;
  ai_leverage_score: number | null;
  market_size_score: number | null;
  competitive_gap_score: number | null;
  distribution_difficulty: number | null;
  opportunity_score: number | null;
  qualification_reason: string | null;
  opportunity_id: number | null;
  opportunity_status: string;
  average_quality_score: number | null;
  review_status: string;
};

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
  evidence_quality_score: number;
  date_collected: string;
  notes: string | null;
  workflow_name: string | null;
  product_name: string | null;
};

export default async function EvidenceClusterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cluster = db.prepare(`
    SELECT ec.*, i.name AS industry_name, w.name AS workflow_name,
      COUNT(eci.evidence_id) AS evidence_count,
      ROUND(AVG(e.severity), 1) AS average_severity,
      ROUND(AVG(e.confidence), 1) AS average_confidence,
      ROUND(AVG(e.evidence_quality_score), 1) AS average_quality_score,
      o.id AS opportunity_id,
      COALESCE(o.status, 'None') AS opportunity_status
    FROM evidence_clusters ec
    JOIN industries i ON i.id = ec.industry_id
    LEFT JOIN workflows w ON w.id = ec.workflow_id
    LEFT JOIN evidence_cluster_items eci ON eci.cluster_id = ec.id
    LEFT JOIN evidence e ON e.id = eci.evidence_id
    LEFT JOIN opportunities o ON o.evidence_cluster_id = ec.id
    WHERE ec.id = ?
    GROUP BY ec.id
  `).get(Number(id)) as Cluster | undefined;
  if (!cluster) notFound();

  const evidence = db.prepare(`
    SELECT e.*, w.name AS workflow_name, p.product_name
    FROM evidence e
    JOIN evidence_cluster_items eci ON eci.evidence_id = e.id
    LEFT JOIN workflows w ON w.id = e.workflow_id
    LEFT JOIN products p ON p.id = e.product_id
    WHERE eci.cluster_id = ?
    ORDER BY e.severity DESC, e.confidence DESC, e.date_collected DESC
  `).all(cluster.id) as Evidence[];

  return (
    <>
      <header className="page-header">
        <div>
          <p className="subtitle"><Link href="/evidence-clusters">Evidence Clusters</Link> / {cluster.industry_name}</p>
          <h1>{cluster.cluster_name} {cluster.industry_name.startsWith("[Sample]") && <span className="sample-badge">Sample</span>}</h1>
          <p className="subtitle">{cluster.workflow_name ?? "No primary workflow linked"}</p>
        </div>
        <div className="actions">
          {cluster.opportunity_id
            ? <Link className="button" href={`/opportunities/${cluster.opportunity_id}`}>View Opportunity</Link>
            : <Link className="button" href="/evidence-clusters">Run Opportunity Generation</Link>}
          <Link className="button secondary" href="/evidence-clusters">Back to Evidence Clusters</Link>
        </div>
      </header>

      <div className="detail-grid">
        <div className="stack">
          <section className="card detail-body">
            <Detail label="Problem Summary" value={cluster.problem_summary} />
            <Detail label="Business Impact" value={cluster.business_impact} />
          </section>

          <section className="card section-card">
            <div className="section-title"><h2>Linked Evidence ({evidence.length})</h2></div>
            {evidence.length === 0 ? <div className="action-empty"><p>No evidence is linked yet. Add supporting records before promoting this cluster.</p><Link className="button secondary small" href="/evidence?new=1">Add Evidence</Link></div> : (
              <div className="evidence-records">
                {evidence.map((item) => (
                  <article className="evidence-record" key={item.id}>
                    <div className="evidence-record-header">
                      <div>
                        <span className="status">{item.source_type}</span>
                        <strong>{item.source_name}</strong>
                      </div>
                      <div className="evidence-scores">
                        <span>Severity <strong>{item.severity}/10</strong></span>
                        <span>Confidence <strong>{item.confidence}/10</strong></span>
                        <span>Quality <strong>{item.evidence_quality_score}/10</strong></span>
                      </div>
                    </div>
                    <blockquote>{item.quote_snippet}</blockquote>
                    <div className="evidence-meta">
                      <span>Collected {item.date_collected}</span>
                      {item.pain_category && <span>Category: {item.pain_category}</span>}
                      {item.workflow_name && <span>Workflow: {item.workflow_name}</span>}
                      {item.product_name && <span>Product: {item.product_name}</span>}
                    </div>
                    {item.evidence_summary && <Detail label="Evidence Summary" value={item.evidence_summary} />}
                    {item.notes && <Detail label="Notes" value={item.notes} />}
                    {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">Open source</a>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="stack">
          <div className="detail-stats cluster-stats">
            <div className="card detail-stat"><strong>{cluster.evidence_count}</strong><span>Evidence Count</span></div>
            <div className="card detail-stat"><strong>{cluster.average_severity ?? "—"}</strong><span>Average Severity</span></div>
            <div className="card detail-stat"><strong>{cluster.average_confidence ?? "—"}</strong><span>Average Confidence</span></div>
            <div className="card detail-stat"><strong>{cluster.average_quality_score ?? "—"}</strong><span>Avg. Evidence Quality</span></div>
          </div>
          <div className="score-grid">
            <Score label="Pain" value={cluster.pain_score} />
            <Score label="Frequency" value={cluster.frequency_score} />
            <Score label="AI Leverage" value={cluster.ai_leverage_score} />
            <Score label="Market Size" value={cluster.market_size_score} />
            <Score label="Competitive Gap" value={cluster.competitive_gap_score} />
            <Score label="Distribution Difficulty" value={cluster.distribution_difficulty} />
            <Score label="Opportunity" value={cluster.opportunity_score} featured />
          </div>
          <section className="card detail-body">
            <div className="detail-field"><h3>Opportunity Status</h3><p><StatusBadge status={cluster.opportunity_status} /></p></div>
            <Detail label="Qualification Decision" value={cluster.qualification_reason} />
            <div className="detail-field"><h3>Review Status</h3><p><StatusBadge status={cluster.review_status} /></p></div>
            <Detail label="Industry" value={cluster.industry_name} />
            <Detail label="Primary Workflow" value={cluster.workflow_name} />
            <Detail label="Notes" value={cluster.notes} />
          </section>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "—"}</p></div>;
}

function Score({ label, value, featured = false }: { label: string; value: number | null; featured?: boolean }) {
  return <div className={`card score-card ${featured ? "featured" : ""}`}><span>{label}</span><strong>{value ?? "—"}</strong><small>/100</small></div>;
}
