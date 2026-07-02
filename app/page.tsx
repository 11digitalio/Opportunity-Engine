import Link from "next/link";
import { db } from "@/lib/db";
import { NextActionCard, StatusBadge } from "@/components/WorkflowUI";
import { nextRecommendedAction, WorkflowFacts } from "@/lib/workflow";

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

type IndustryRow = {
  id: number;
  name: string;
  description: string | null;
  opportunity_count: number;
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
  const industry = db.prepare(`
    SELECT i.id, i.name, i.description,
      (SELECT COUNT(*) FROM opportunities o WHERE o.industry_id = i.id) opportunity_count
    FROM industries i
    LEFT JOIN research_sessions rs ON rs.industry_id = i.id
    WHERE i.name NOT LIKE '[Sample]%'
    GROUP BY i.id
    ORDER BY MAX(datetime(COALESCE(rs.updated_at, i.updated_at))) DESC LIMIT 1
  `).get() as IndustryRow | undefined;

  const facts: WorkflowFacts | null = strongest ? {
    sessionId: strongest.research_session_id,
    industryId: strongest.industry_id,
    opportunityId: strongest.id,
    evidenceCount: strongest.evidence_count,
    clusterCount: 1,
    opportunityCount: 1,
    validationCount: strongest.validation_count,
    interviewCount: strongest.interview_count,
    conceptCount: strongest.concept_count,
    approvedConceptCount: strongest.approved_concept_count,
    experimentCount: strongest.experiment_count,
    successfulExperimentCount: strongest.successful_experiment_count,
    opportunityStatus: strongest.status,
    building: false,
  } : null;
  const nextAction = facts
    ? nextRecommendedAction(facts)
    : { label: "Choose an industry", description: "Start with one market where you can reach buyers and verify painful work.", href: "/industries" };

  return <>
    <header className="page-header dashboard-header">
      <div>
        <span className="eyebrow">Decision center</span>
        <h1>What should you build next?</h1>
        <p className="subtitle">The clearest opportunities, the recommended product, and the next decision.</p>
      </div>
      <Link className="button secondary" href="/opportunities">View all opportunities</Link>
    </header>

    <section className="dashboard-decision-grid" aria-label="Current decision">
      <div>
        <h2 className="dashboard-question">Which industry are you evaluating?</h2>
        {industry ? <Link className="card industry-focus" href={`/industries/${industry.id}`}>
          <span className="eyebrow">Industry being researched</span>
          <h2>{industry.name}</h2>
          <p>{industry.description || "Research is focused on identifying painful, repeated work worth solving."}</p>
          <small>{industry.opportunity_count} {industry.opportunity_count === 1 ? "opportunity" : "opportunities"} identified <b>Open industry →</b></small>
        </Link> : <div className="card action-empty"><p>No active industry yet.</p><Link className="button secondary small" href="/industries">Choose an industry</Link></div>}
      </div>
      <div>
        <h2 className="dashboard-question">What should you do next?</h2>
        <NextActionCard action={nextAction} />
      </div>
    </section>

    <section aria-labelledby="top-opportunities">
      <div className="dashboard-section-heading">
        <div><h2 id="top-opportunities">Which opportunities deserve attention?</h2><p>Ranked by strength of the problem and confidence in the evidence.</p></div>
        <Link href="/opportunities">Compare all</Link>
      </div>
      {opportunities.length ? <div className="dashboard-opportunity-list">
        {opportunities.map((opportunity, index) => <Link className="card dashboard-opportunity" href={`/opportunities/${opportunity.id}`} key={opportunity.id}>
          <span className="opportunity-rank">#{index + 1}</span>
          <div className="dashboard-opportunity-copy">
            <div className="opportunity-card-labels"><span>{opportunity.industry_name}</span><StatusBadge status={opportunity.status} /></div>
            <h3>{opportunity.opportunity_name}</h3>
            <p>{opportunity.problem_statement}</p>
            <small>{opportunity.recommended_concept ? <>Recommended product: <strong>{opportunity.recommended_concept}</strong></> : "Product recommendation still needs validation."}</small>
          </div>
          <div className="dashboard-opportunity-strength">
            <strong>{opportunity.opportunity_score ?? "—"}</strong><span>Strength</span>
            <small>{opportunity.confidence_score}/10 confidence</small>
          </div>
          <span className="opportunity-open">Review →</span>
        </Link>)}
      </div> : <div className="card action-empty"><p>No opportunity has been qualified yet. Review recurring evidence patterns to identify the strongest problem.</p><Link className="button secondary small" href="/evidence-clusters">Review evidence patterns</Link></div>}
    </section>

    <details className="dashboard-research-links">
      <summary>Open research workspace</summary>
      <div>
        <Link href="/research-sessions">Research sessions</Link>
        <Link href="/evidence-clusters">Evidence patterns</Link>
        <Link href="/evidence">Raw evidence</Link>
        <Link href="/interviews">Interviews</Link>
      </div>
    </details>
  </>;
}
