import Link from "next/link";
import { db } from "@/lib/db";
import { NextActionCard, StatusBadge } from "@/components/WorkflowUI";
import { nextRecommendedAction, WorkflowFacts } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type CountRow = { count: number };
type OpportunityRow = { id: number; opportunity_name: string; industry_name: string; opportunity_score: number | null; confidence_score: number; evidence_count: number; interview_count: number; status: string };
type EvidenceRow = { id: number; quote_snippet: string; source_type: string; industry_name: string; created_at: string };
type SessionRow = { id: number; name: string | null; industry_id: number; industry_name: string; created_at: string; evidence_count: number; cluster_count: number; opportunity_count: number; validation_count: number; interview_count: number; concept_count: number; approved_concept_count: number; experiment_count: number; successful_experiment_count: number; leading_opportunity_id: number | null; leading_opportunity_status: string | null };

export default function Dashboard() {
  const readyForInterviews = scalar(`
    SELECT COUNT(*) count FROM validation_packages vp
    JOIN opportunities o ON o.id = vp.opportunity_id JOIN industries i ON i.id = o.industry_id
    WHERE i.name NOT LIKE '[Sample]%' AND (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) < 7
  `);
  const validationWaitingReview = scalar(`
    SELECT COUNT(*) count FROM validation_packages vp JOIN opportunities o ON o.id = vp.opportunity_id
    JOIN industries i ON i.id = o.industry_id WHERE i.name NOT LIKE '[Sample]%' AND vp.review_status = 'Needs Review'
  `);
  const experimentsRunning = scalar(`
    SELECT COUNT(*) count FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
    JOIN opportunities o ON o.id = pc.opportunity_id JOIN industries i ON i.id = o.industry_id
    WHERE i.name NOT LIKE '[Sample]%' AND ex.status = 'Running'
  `);
  const pendingReviews = scalar(`
    SELECT
      (SELECT COUNT(*) FROM evidence e JOIN industries i ON i.id = e.industry_id WHERE i.name NOT LIKE '[Sample]%' AND e.review_status = 'Needs Review') +
      (SELECT COUNT(*) FROM evidence_clusters ec JOIN industries i ON i.id = ec.industry_id WHERE i.name NOT LIKE '[Sample]%' AND ec.review_status = 'Needs Review') +
      (SELECT COUNT(*) FROM opportunities o JOIN industries i ON i.id = o.industry_id WHERE i.name NOT LIKE '[Sample]%' AND o.review_status = 'Needs Review') +
      (SELECT COUNT(*) FROM product_concepts pc JOIN opportunities o ON o.id = pc.opportunity_id JOIN industries i ON i.id = o.industry_id WHERE i.name NOT LIKE '[Sample]%' AND pc.review_status = 'Needs Review')
      count
  `);
  const highestConfidence = db.prepare(`
    SELECT o.id, o.opportunity_name, i.name industry_name, o.opportunity_score, o.confidence_score, o.status,
      (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) evidence_count,
      (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) interview_count
    FROM opportunities o JOIN industries i ON i.id = o.industry_id WHERE i.name NOT LIKE '[Sample]%'
    ORDER BY o.confidence_score DESC, COALESCE(o.opportunity_score, 0) DESC LIMIT 1
  `).get() as OpportunityRow | undefined;
  const newestSession = db.prepare(`
    SELECT rs.id, rs.name, rs.industry_id, i.name industry_name, rs.created_at,
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
  const mostActiveIndustry = db.prepare(`
    SELECT i.id, i.name,
      (SELECT COUNT(*) FROM evidence e WHERE e.industry_id = i.id) +
      (SELECT COUNT(*) FROM evidence_clusters ec WHERE ec.industry_id = i.id) +
      (SELECT COUNT(*) FROM opportunities o WHERE o.industry_id = i.id) activity_count
    FROM industries i WHERE i.name NOT LIKE '[Sample]%' ORDER BY activity_count DESC, i.name LIMIT 1
  `).get() as { id: number; name: string; activity_count: number } | undefined;
  const lowConfidence = db.prepare(`
    SELECT o.id, o.opportunity_name, i.name industry_name, o.opportunity_score, o.confidence_score, o.status,
      (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) evidence_count,
      (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) interview_count
    FROM opportunities o JOIN industries i ON i.id = o.industry_id
    WHERE o.confidence_score <= 5 AND i.name NOT LIKE '[Sample]%'
    ORDER BY COALESCE(o.opportunity_score, 0) DESC LIMIT 8
  `).all() as OpportunityRow[];
  const recentEvidence = db.prepare(`
    SELECT e.id, e.quote_snippet, e.source_type, i.name industry_name, e.created_at
    FROM evidence e JOIN industries i ON i.id = e.industry_id
    WHERE i.name NOT LIKE '[Sample]%' ORDER BY datetime(e.created_at) DESC LIMIT 8
  `).all() as EvidenceRow[];

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
    : { label: "Start Research Session", description: "Create a project homepage for the next industry to investigate.", href: "/research-sessions?new=1" };

  return <>
    <header className="page-header">
      <div><h1>Today</h1><p className="subtitle">The work that needs attention across the opportunity pipeline.</p></div>
      <Link className="button" href="/evidence?new=1">Add Evidence</Link>
    </header>
    <NextActionCard action={nextAction} />

    <section className="action-dashboard-grid">
      <ActionCard label="Ready For Interviews" value={readyForInterviews} detail="Validation packages with interviews remaining" href="/interviews" tone={readyForInterviews ? "attention" : ""} />
      <ActionCard label="Validation Waiting Review" value={validationWaitingReview} detail="Packages requiring a decision" href="/validation-packages" tone={validationWaitingReview ? "attention" : ""} />
      <ActionCard label="Experiments Running" value={experimentsRunning} detail="Active tests collecting signal" href="/experiments" tone={experimentsRunning ? "active" : ""} />
      <ActionCard label="Pending Reviews" value={pendingReviews} detail="Evidence, clusters, opportunities, and concepts" href="/opportunities" tone={pendingReviews ? "attention" : ""} />
    </section>

    <div className="dashboard-grid overview-grid">
      <SpotlightCard title="Highest Confidence Opportunity" href={highestConfidence ? `/opportunities/${highestConfidence.id}` : "/opportunities"}>
        {highestConfidence ? <><h3>{highestConfidence.opportunity_name}</h3><p>{highestConfidence.industry_name}</p><div className="spotlight-meta"><strong>{highestConfidence.confidence_score}/10 confidence</strong><StatusBadge status={highestConfidence.status} /></div></> : <EmptyInline text="No opportunities have been qualified yet." />}
      </SpotlightCard>
      <SpotlightCard title="Newest Research Session" href={newestSession ? `/research-sessions/${newestSession.id}` : "/research-sessions?new=1"}>
        {newestSession ? <><h3>{newestSession.name || newestSession.industry_name}</h3><p>{newestSession.industry_name}</p><div className="spotlight-meta"><strong>{formatDate(newestSession.created_at)}</strong><span>{newestSession.evidence_count} evidence</span></div></> : <EmptyInline text="Start the first research session." />}
      </SpotlightCard>
      <SpotlightCard title="Most Active Industry" href={mostActiveIndustry ? `/industries/${mostActiveIndustry.id}` : "/industries"}>
        {mostActiveIndustry ? <><h3>{mostActiveIndustry.name}</h3><p>Most research activity in the workspace</p><div className="spotlight-meta"><strong>{mostActiveIndustry.activity_count} linked records</strong></div></> : <EmptyInline text="Activity will appear after research begins." />}
      </SpotlightCard>
    </div>

    <div className="dashboard-grid">
      <TableCard title="Low Confidence Opportunities" action={<Link href="/opportunities">View all</Link>}>
        {lowConfidence.length ? <table><thead><tr><th>Opportunity</th><th>Score</th><th>Confidence</th><th>Next proof</th></tr></thead><tbody>
          {lowConfidence.map((item) => <tr key={item.id}><td className="cell-main"><Link href={`/opportunities/${item.id}`}>{item.opportunity_name}</Link></td><td><span className="score">{item.opportunity_score ?? "—"}</span></td><td>{item.confidence_score}/10</td><td>{item.evidence_count} evidence · {item.interview_count}/7 interviews</td></tr>)}
        </tbody></table> : <EmptyTable text="No low-confidence opportunities need attention." />}
      </TableCard>
      <TableCard title="Recently Added Evidence" action={<Link href="/evidence">View all</Link>}>
        {recentEvidence.length ? <table><thead><tr><th>Evidence</th><th>Industry</th><th>Added</th></tr></thead><tbody>
          {recentEvidence.map((item) => <tr key={item.id}><td className="cell-main"><Link href={`/evidence/${item.id}`}>{short(item.quote_snippet)}</Link><small>{item.source_type}</small></td><td>{item.industry_name}</td><td>{formatDate(item.created_at)}</td></tr>)}
        </tbody></table> : <EmptyTable text="No evidence has been added yet." />}
      </TableCard>
    </div>
  </>;
}

function scalar(sql: string) {
  return Number((db.prepare(sql).get() as CountRow).count ?? 0);
}

function ActionCard({ label, value, detail, href, tone }: { label: string; value: number; detail: string; href: string; tone: string }) {
  return <Link className={`card action-dashboard-card ${tone}`} href={href}><span>{label}</span><strong>{value}</strong><p>{detail}</p><i>Review work →</i></Link>;
}

function SpotlightCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return <Link className="card spotlight-card" href={href}><span className="eyebrow">{title}</span>{children}<i>Open →</i></Link>;
}

function TableCard({ title, action, children }: { title: string; action: React.ReactNode; children: React.ReactNode }) {
  return <section className="card section-card"><div className="section-title title-action"><h2>{title}</h2>{action}</div><div className="table-wrap">{children}</div></section>;
}

function EmptyInline({ text }: { text: string }) {
  return <p className="muted">{text}</p>;
}

function EmptyTable({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

function short(value: string, length = 72) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

function formatDate(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(normalized));
}
