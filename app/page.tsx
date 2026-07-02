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
};
type EvidenceRow = { id: number; quote_snippet: string; source_type: string; industry_name: string; created_at: string };
type InterviewRow = { id: number; interviewee_name: string; role_title: string | null; industry_name: string; opportunity_name: string | null; created_at: string };
type SessionRow = {
  id: number;
  industry_id: number;
  evidence_count: number;
  cluster_count: number;
  opportunity_count: number;
  validation_count: number;
  interview_count: number;
  concept_count: number;
  approved_concept_count: number;
  experiment_count: number;
  successful_experiment_count: number;
  leading_opportunity_id: number | null;
  leading_opportunity_status: string | null;
};

export default function Dashboard() {
  const strongest = db.prepare(`
    SELECT o.id, o.industry_id, o.research_session_id, o.opportunity_name, o.problem_statement, o.promotion_reason, i.name industry_name,
      o.opportunity_score, o.confidence_score, o.status,
      (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) evidence_count,
      (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) interview_count,
      (SELECT COUNT(*) FROM validation_packages vp WHERE vp.opportunity_id = o.id) validation_count,
      (SELECT COUNT(*) FROM product_concepts pc WHERE pc.opportunity_id = o.id) concept_count,
      (SELECT COUNT(*) FROM product_concepts pc WHERE pc.opportunity_id = o.id AND pc.review_status = 'Approved') approved_concept_count,
      (SELECT COUNT(*) FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id WHERE pc.opportunity_id = o.id) experiment_count,
      (SELECT COUNT(*) FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
        WHERE pc.opportunity_id = o.id AND ex.status IN ('Complete', 'Completed', 'Successful')) successful_experiment_count
    FROM opportunities o JOIN industries i ON i.id = o.industry_id
    WHERE i.name NOT LIKE '[Sample]%'
    ORDER BY COALESCE(o.opportunity_score, 0) DESC, o.confidence_score DESC LIMIT 1
  `).get() as OpportunityRow | undefined;
  const newestSession = db.prepare(`
    SELECT rs.id, rs.industry_id,
      (SELECT COUNT(*) FROM evidence WHERE research_session_id = rs.id) evidence_count,
      (SELECT COUNT(*) FROM evidence_clusters WHERE research_session_id = rs.id) cluster_count,
      (SELECT COUNT(*) FROM opportunities WHERE research_session_id = rs.id) opportunity_count,
      (SELECT COUNT(*) FROM validation_packages WHERE research_session_id = rs.id) validation_count,
      (SELECT COUNT(*) FROM interviews WHERE research_session_id = rs.id) interview_count,
      (SELECT COUNT(*) FROM product_concepts WHERE research_session_id = rs.id) concept_count,
      (SELECT COUNT(*) FROM product_concepts WHERE research_session_id = rs.id AND review_status = 'Approved') approved_concept_count,
      (SELECT COUNT(*) FROM experiments WHERE research_session_id = rs.id) experiment_count,
      (SELECT COUNT(*) FROM experiments WHERE research_session_id = rs.id AND status IN ('Complete', 'Completed', 'Successful')) successful_experiment_count,
      (SELECT id FROM opportunities WHERE research_session_id = rs.id ORDER BY COALESCE(opportunity_score, total_score, 0) DESC LIMIT 1) leading_opportunity_id,
      (SELECT status FROM opportunities WHERE research_session_id = rs.id ORDER BY COALESCE(opportunity_score, total_score, 0) DESC LIMIT 1) leading_opportunity_status
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id
    WHERE i.name NOT LIKE '[Sample]%' ORDER BY datetime(rs.updated_at) DESC LIMIT 1
  `).get() as SessionRow | undefined;
  const recentEvidence = db.prepare(`
    SELECT e.id, e.quote_snippet, e.source_type, i.name industry_name, e.created_at
    FROM evidence e JOIN industries i ON i.id = e.industry_id
    WHERE i.name NOT LIKE '[Sample]%' ORDER BY datetime(e.created_at) DESC LIMIT 5
  `).all() as EvidenceRow[];
  const recentInterviews = db.prepare(`
    SELECT iv.id, iv.interviewee_name, iv.role_title, i.name industry_name, o.opportunity_name, iv.created_at
    FROM interviews iv JOIN industries i ON i.id = iv.industry_id
    LEFT JOIN opportunities o ON o.id = iv.opportunity_id
    WHERE i.name NOT LIKE '[Sample]%' ORDER BY datetime(iv.created_at) DESC LIMIT 5
  `).all() as InterviewRow[];

  const facts: WorkflowFacts = newestSession ? {
    sessionId: newestSession.id,
    industryId: newestSession.industry_id,
    opportunityId: newestSession.leading_opportunity_id,
    evidenceCount: newestSession.evidence_count,
    clusterCount: newestSession.cluster_count,
    opportunityCount: newestSession.opportunity_count,
    validationCount: newestSession.validation_count,
    interviewCount: newestSession.interview_count,
    conceptCount: newestSession.concept_count,
    approvedConceptCount: newestSession.approved_concept_count,
    experimentCount: newestSession.experiment_count,
    successfulExperimentCount: newestSession.successful_experiment_count,
    opportunityStatus: newestSession.leading_opportunity_status,
    building: false,
  } : { evidenceCount: 0, clusterCount: 0, opportunityCount: 0, validationCount: 0, interviewCount: 0, conceptCount: 0, experimentCount: 0 };
  const nextAction = newestSession
    ? nextRecommendedAction(facts)
    : { label: "Start Research Session", description: "Choose an industry and begin collecting real market signals.", href: "/research-sessions?new=1" };
  const strongestNextAction = strongest ? nextRecommendedAction({
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
  }) : null;

  return <>
    <header className="page-header dashboard-header">
      <div><span className="eyebrow">Decision center</span><h1>What should you build next?</h1><p className="subtitle">Focus on the next decision, then follow the strongest market signal.</p></div>
      <Link className="button secondary" href="/evidence?new=1">Add Evidence</Link>
    </header>

    <section aria-labelledby="next-heading">
      <h2 className="dashboard-question" id="next-heading">What should I do next?</h2>
      <NextActionCard action={nextAction} />
    </section>

    <section aria-labelledby="strongest-heading">
      <h2 className="dashboard-question" id="strongest-heading">What’s closest to becoming a business?</h2>
      {strongest ? <Link className="card opportunity-spotlight" href={`/opportunities/${strongest.id}`}>
        <div className="opportunity-spotlight-main">
          <span className="eyebrow">Strongest opportunity</span>
          <h2>{strongest.opportunity_name}</h2>
          <p>{strongest.industry_name}</p>
          <p className="opportunity-spotlight-reason"><strong>Why it leads:</strong> {short(strongest.promotion_reason || strongest.problem_statement, 150)}</p>
          <div className="opportunity-spotlight-meta">
            <StatusBadge status={strongest.status} />
            <span>{strongest.confidence_score}/10 confidence</span>
            <span>{strongest.evidence_count} evidence</span>
            <span>{strongest.interview_count} interviews</span>
          </div>
        </div>
        <div className="opportunity-spotlight-score">
          <strong>{strongest.opportunity_score ?? "—"}</strong><span>Opportunity score</span>
          <div className="score-track"><i style={{ width: `${strongest.opportunity_score ?? 0}%` }} /></div>
        </div>
        <div className="opportunity-spotlight-next">
          <span className="eyebrow">Next action</span>
          <strong>{strongestNextAction?.label}</strong>
          <span>Open opportunity →</span>
        </div>
      </Link> : <div className="card action-empty"><p>No opportunity has been qualified yet. Group recurring evidence into a pattern to identify the first candidate.</p><Link className="button secondary small" href="/evidence-clusters">Review Evidence Patterns</Link></div>}
    </section>

    <section aria-labelledby="activity-heading">
      <h2 className="dashboard-question" id="activity-heading">What’s happening?</h2>
      <div className="dashboard-activity-grid">
        <ActivityCard title="Recent evidence" href="/evidence">
          {recentEvidence.length ? recentEvidence.map((item) => <Link className="activity-row" href={`/evidence/${item.id}`} key={item.id}>
            <span className="activity-type">{item.source_type}</span>
            <strong>{short(item.quote_snippet)}</strong>
            <small>{item.industry_name} · {formatDate(item.created_at)}</small>
          </Link>) : <div className="empty compact">No evidence yet. Add a customer signal to start building the case.</div>}
        </ActivityCard>
        <ActivityCard title="Recent interviews" href="/interviews">
          {recentInterviews.length ? recentInterviews.map((item) => <div className="activity-row" key={item.id}>
            <span className="activity-type">Interview</span>
            <strong>{item.interviewee_name}{item.role_title ? ` · ${item.role_title}` : ""}</strong>
            <small>{item.opportunity_name || item.industry_name} · {formatDate(item.created_at)}</small>
          </div>) : <div className="empty compact">No interviews yet. Conduct the first interview to begin validating the leading opportunity.</div>}
        </ActivityCard>
      </div>
    </section>
  </>;
}

function ActivityCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <section className="card activity-card"><div className="section-title title-action"><h2>{title}</h2><Link href={href}>View all</Link></div><div>{children}</div></section>;
}

function short(value: string, length = 78) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function formatDate(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(normalized));
}
