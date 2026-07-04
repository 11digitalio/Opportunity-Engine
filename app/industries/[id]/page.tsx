import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Industry = Record<string, string | number | null>;
type Opportunity = { id: number; opportunity_name: string; problem_statement: string; opportunity_score: number | null };
type ResearchSummary = { evidence_count: number; workflow_count: number; product_count: number; pattern_count: number; opportunity_count: number };

export default async function IndustryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const industry = db.prepare("SELECT * FROM industries WHERE id = ?").get(Number(id)) as Industry | undefined;
  if (!industry) notFound();

  const summary = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM evidence WHERE industry_id = ?) evidence_count,
      (SELECT COUNT(*) FROM workflows WHERE industry_id = ?) workflow_count,
      (SELECT COUNT(*) FROM products WHERE industry_id = ?) product_count,
      (SELECT COUNT(*) FROM evidence_clusters WHERE industry_id = ?) pattern_count,
      (SELECT COUNT(*) FROM opportunities WHERE industry_id = ?) opportunity_count
  `).get(industry.id, industry.id, industry.id, industry.id, industry.id) as ResearchSummary;
  const opportunities = db.prepare(`
    SELECT id, opportunity_name, problem_statement, opportunity_score
    FROM opportunities WHERE industry_id = ?
    ORDER BY COALESCE(opportunity_score, total_score, 0) DESC, confidence_score DESC LIMIT 3
  `).all(industry.id) as Opportunity[];

  return (
    <>
      <div className="issue-breadcrumb"><Link href="/">Dashboard</Link><span>›</span><span>{industry.name}</span></div>
      <header className="page-header industry-summary-header">
        <div><span className="eyebrow">Research findings</span><h1>What Opportunity Engine discovered</h1><p className="subtitle">{industry.name}</p></div>
        {opportunities[0] && <Link className="button" href={`/opportunities/${opportunities[0].id}`}>Investigate top opportunity</Link>}
      </header>

      <section className="card research-summary-card" aria-labelledby="research-summary-heading">
        <div><span className="eyebrow">Research summary</span><h2 id="research-summary-heading">The market contains repeated, expensive operational failures.</h2><p>Analysis of customer signals, daily workflows, and the current software landscape surfaced a concentrated set of buildable opportunities.</p></div>
        <ul>
          <li><strong>{summary.evidence_count}</strong><span>customer signals analyzed</span></li>
          <li><strong>{summary.workflow_count}</strong><span>workflows mapped</span></li>
          <li><strong>{summary.product_count}</strong><span>software products analyzed</span></li>
          <li><strong>{summary.pattern_count}</strong><span>recurring evidence patterns found</span></li>
          <li><strong>{summary.opportunity_count}</strong><span>high-confidence opportunities discovered</span></li>
        </ul>
      </section>

      <section className="industry-top-opportunities" aria-labelledby="industry-opportunities-heading">
        <div className="dashboard-section-heading"><div><span className="eyebrow">Ranked findings</span><h2 id="industry-opportunities-heading">Top opportunities</h2></div></div>
        <div className="industry-opportunity-list">
          {opportunities.map((opportunity, index) => <article className="card industry-opportunity-card" key={opportunity.id}>
            <span className="industry-opportunity-rank">{index + 1}</span>
            <div><h3>{opportunity.opportunity_name}</h3><p>{opportunity.problem_statement}</p></div>
            <strong>{opportunity.opportunity_score ?? "—"}<small>/100</small></strong>
            <Link className="button secondary small" href={`/opportunities/${opportunity.id}`}>Investigate</Link>
          </article>)}
        </div>
      </section>

      <section className="card industry-snapshot" aria-labelledby="industry-snapshot-heading">
        <div><span className="eyebrow">Industry snapshot</span><h2 id="industry-snapshot-heading">{industry.name}</h2></div>
        <div>
          <Snapshot label="Customer types" value={industry.customer_types} fallback="Practice owners, office managers, front-desk teams, and clinical staff." />
          <Snapshot label="Market characteristics" value={industry.research_notes || industry.description} fallback="Operationally complex practices with high administrative load and fragmented workflows." />
          <Snapshot label="Current software landscape" value={industry.existing_software_vendors} fallback={`${summary.product_count} products reviewed across practice management, scheduling, communication, and insurance workflows.`} />
        </div>
      </section>
    </>
  );
}

function Snapshot({ label, value, fallback }: { label: string; value: unknown; fallback: string }) {
  return <div><h3>{label}</h3><p>{value === null || value === "" ? fallback : String(value)}</p></div>;
}
