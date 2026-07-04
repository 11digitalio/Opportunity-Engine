import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type OpportunityRow = {
  id: number;
  industry_id: number;
  research_session_id: number | null;
  opportunity_name: string;
  industry_name: string;
  opportunity_score: number | null;
  confidence_score: number;
  status: string;
  evidence_count: number;
  interview_count: number;
  validation_count: number;
  concept_count: number;
  approved_concept_count: number;
  experiment_count: number;
  successful_experiment_count: number;
  problem_statement: string;
  promotion_reason: string | null;
  recommended_concept: string | null;
};

const opportunitySelect = `
  SELECT o.id, o.industry_id, o.research_session_id, o.opportunity_name, o.problem_statement, o.promotion_reason,
    i.name industry_name, o.opportunity_score, o.confidence_score, o.status,
    (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) evidence_count,
    (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) interview_count,
    (SELECT COUNT(*) FROM validation_packages vp WHERE vp.opportunity_id = o.id) validation_count,
    (SELECT COUNT(*) FROM product_concepts pc WHERE pc.opportunity_id = o.id) concept_count,
    (SELECT COUNT(*) FROM product_concepts pc WHERE pc.opportunity_id = o.id AND pc.review_status = 'Approved') approved_concept_count,
    (SELECT COUNT(*) FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id WHERE pc.opportunity_id = o.id) experiment_count,
    (SELECT COUNT(*) FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
      WHERE pc.opportunity_id = o.id AND ex.status IN ('Complete', 'Completed', 'Successful')) successful_experiment_count,
    (SELECT pc.concept_name FROM product_concepts pc WHERE pc.opportunity_id = o.id
      ORDER BY pc.total_score DESC, pc.created_at DESC LIMIT 1) recommended_concept
  FROM opportunities o JOIN industries i ON i.id = o.industry_id
  WHERE i.name NOT LIKE '[Sample]%'
  ORDER BY COALESCE(o.opportunity_score, 0) DESC, o.confidence_score DESC`;

export default function Dashboard() {
  const opportunities = db.prepare(`${opportunitySelect} LIMIT 3`).all() as OpportunityRow[];
  const strongest = opportunities[0];

  return <>
    <header className="page-header dashboard-header showcase-header dashboard-command-header">
      <div>
        <span className="eyebrow">Opportunity Engine / Executive Brief</span>
        <h1>Three high-confidence software opportunities found.</h1>
        <p className="subtitle">Customer signals point to one immediate priority: eliminate the manual work and uncertainty surrounding insurance verification.</p>
      </div>
    </header>

    {strongest ? <section className="dashboard-primary-decision" aria-labelledby="primary-opportunity">
      <div className="dashboard-primary-copy">
        <span className="eyebrow">Highest-ranked opportunity</span>
        <h2 id="primary-opportunity">{strongest.opportunity_name}</h2>
        <p>{strongest.problem_statement}</p>
        <div className="dashboard-primary-proof">
          <span><strong>{strongest.opportunity_score ?? "—"}/100</strong> opportunity score</span>
          <span><strong>{strongest.confidence_score}/10</strong> confidence</span>
          <span><strong>{strongest.evidence_count}</strong> supporting signals</span>
        </div>
      </div>
      <div className="dashboard-primary-action">
        <span>Recommended next move</span>
        <p>See the customer evidence, market gap, and product direction behind the top-ranked finding.</p>
        <Link className="button dashboard-investigate" href={`/opportunities/${strongest.id}`}>Investigate Insurance Verification Burden <span>→</span></Link>
      </div>
    </section> : null}

    <section className="dashboard-secondary-opportunities" aria-labelledby="top-opportunities">
      <div className="dashboard-section-heading">
        <div><span className="eyebrow">What else the research uncovered</span><h2 id="top-opportunities">Other opportunities</h2></div>
        <Link href="/opportunities">Compare all</Link>
      </div>
      {opportunities.length > 1 ? <div className="dashboard-opportunity-list">
        {opportunities.slice(1).map((opportunity, index) => <Link className="card dashboard-opportunity" href={`/opportunities/${opportunity.id}`} key={opportunity.id}>
          <span className="opportunity-rank">#{index + 2}</span>
          <div className="dashboard-opportunity-copy">
            <h3>{opportunity.opportunity_name}</h3>
            <p>{opportunity.problem_statement}</p>
          </div>
          <div className="dashboard-opportunity-strength">
            <strong>{opportunity.opportunity_score ?? "—"}/100</strong><span>Opportunity score</span>
          </div>
          <span className="opportunity-open">Investigate →</span>
        </Link>)}
      </div> : <div className="card action-empty"><p>No opportunity has been qualified yet. Review recurring evidence patterns to identify the strongest problem.</p><Link className="button secondary small" href="/evidence-clusters">Review evidence patterns</Link></div>}
    </section>

    <details className="dashboard-research-links">
      <summary>Review supporting research</summary>
      <div>
        <Link href="/research-sessions">Research sessions</Link>
        <Link href="/evidence-clusters">Evidence patterns</Link>
        <Link href="/evidence">Raw evidence</Link>
        <Link href="/interviews">Interviews</Link>
      </div>
    </details>
  </>;
}
