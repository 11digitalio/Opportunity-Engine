import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OpportunityActions from "@/components/OpportunityActions";
import { NextActionCard, PipelineHeader, StatusBadge, WorkflowCard } from "@/components/WorkflowUI";
import { nextRecommendedAction, opportunityWorkflow, pipelineStages, WorkflowFacts } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Opportunity = {
  industry_id: number;
  id: number; opportunity_name: string; problem_statement: string; user_persona: string | null;
  current_workaround: string | null; estimated_cost: string | null; existing_solutions: string | null;
  solutions_insufficient: string | null; why_now: string | null; total_score: number; confidence_score: number;
  notes: string | null; research_notes: string | null; industry_name: string; workflow_name: string | null;
  evidence_count: number; interview_count: number;
  evidence_cluster_id: number | null; originating_cluster_name: string | null; status: string;
  current_workflow: string | null; estimated_willingness_to_pay: string | null; ai_opportunity: string | null;
  risks: string | null; moat_ideas: string | null; open_questions: string | null; promotion_reason: string | null;
  pain_score: number | null; frequency_score: number | null; ai_leverage_score: number | null;
  market_score: number | null; competitive_gap_score: number | null; distribution_difficulty: number | null;
  opportunity_score: number | null;
  review_status: string; average_quality_score: number | null;
  research_session_id: number | null; research_session_name: string | null;
};

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = db.prepare(`
    SELECT o.*, i.name industry_name, w.name workflow_name, ec.cluster_name originating_cluster_name,
      rs.name research_session_name,
      (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) evidence_count,
      (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) interview_count,
      (SELECT ROUND(AVG(e.evidence_quality_score), 1) FROM evidence e
        JOIN evidence_opportunities eo ON eo.evidence_id = e.id WHERE eo.opportunity_id = o.id) average_quality_score
    FROM opportunities o JOIN industries i ON i.id = o.industry_id
    LEFT JOIN workflows w ON w.id = o.workflow_id
    LEFT JOIN research_sessions rs ON rs.id = o.research_session_id
    LEFT JOIN evidence_clusters ec ON ec.id = o.evidence_cluster_id WHERE o.id = ?
  `).get(Number(id)) as Opportunity | undefined;
  if (!opportunity) notFound();

  const evidence = db.prepare(`
    SELECT e.id, e.quote_snippet, e.source_type, e.source_name, e.severity, e.confidence, e.date_collected
    FROM evidence e JOIN evidence_opportunities eo ON eo.evidence_id = e.id WHERE eo.opportunity_id = ?
    ORDER BY e.severity DESC, e.date_collected DESC
  `).all(opportunity.id) as Record<string, string | number>[];
  const interviews = db.prepare(`
    SELECT id, interviewee_name, role_title, company, date, pain_severity, would_pay, strongest_quote
    FROM interviews WHERE opportunity_id = ? ORDER BY date DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const concepts = db.prepare(`
    SELECT id, concept_name, one_sentence_pitch, total_score, review_status FROM product_concepts WHERE opportunity_id = ? ORDER BY total_score DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const experiments = db.prepare(`
    SELECT ex.id, ex.hypothesis, ex.status, ex.validation_method, pc.concept_name
    FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
    WHERE pc.opportunity_id = ? ORDER BY ex.created_at DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const validation = db.prepare("SELECT * FROM validation_packages WHERE opportunity_id = ?").get(opportunity.id) as Record<string, string | number | null> | undefined;
  const pricingValidated = interviews.some((interview) => String(interview.would_pay).toLowerCase() === "yes");
  const approvedConceptCount = concepts.filter((concept) => concept.review_status === "Approved").length;
  const activeExperimentCount = experiments.filter((experiment) => ["Running", "Complete", "Completed", "Successful"].includes(String(experiment.status))).length;
  const successfulExperimentCount = experiments.filter((experiment) => ["Complete", "Completed", "Successful"].includes(String(experiment.status))).length;
  const building = opportunity.status === "Building" || Boolean(db.prepare("SELECT 1 FROM industry_pipeline WHERE name = ? AND status = 'Building'").get(opportunity.industry_name));
  const facts: WorkflowFacts = {
    sessionId: opportunity.research_session_id,
    industryId: opportunity.industry_id,
    opportunityId: opportunity.id,
    evidenceCount: evidence.length,
    clusterCount: opportunity.evidence_cluster_id ? 1 : 0,
    opportunityCount: 1,
    validationCount: validation ? 1 : 0,
    interviewCount: interviews.length,
    pricingValidated,
    conceptCount: concepts.length,
    approvedConceptCount,
    experimentCount: experiments.length,
    activeExperimentCount,
    successfulExperimentCount,
    opportunityStatus: opportunity.status,
    building,
  };
  const nextAction = nextRecommendedAction(facts);
  const isSample = opportunity.industry_name.startsWith("[Sample]");

  return (
    <>
      <div className="issue-breadcrumb">
        {opportunity.research_session_id
          ? <Link href={`/research-sessions/${opportunity.research_session_id}`}>{opportunity.research_session_name || `Research Session #${opportunity.research_session_id}`}</Link>
          : <Link href="/research-sessions">Research Sessions</Link>}
        <span>›</span><Link href={`/industries/${opportunity.industry_id}`}>{opportunity.industry_name}</Link>
        {opportunity.evidence_cluster_id && <><span>›</span><Link href={`/evidence-clusters/${opportunity.evidence_cluster_id}`}>{opportunity.originating_cluster_name}</Link></>}
        <span>›</span><span>{opportunity.opportunity_name}</span>
      </div>
      <header className="page-header">
        <div>
          <div className="title-with-badge"><h1>{opportunity.opportunity_name} {isSample && <span className="sample-badge">Sample</span>}</h1><StatusBadge status={opportunity.status} /></div>
          <p className="subtitle">{opportunity.workflow_name ?? "No workflow linked"}</p>
        </div>
        <div className="actions">
          <OpportunityActions opportunityId={opportunity.id} isSample={isSample} />
          <Link className="button secondary" href="/opportunities">Back</Link>
        </div>
      </header>

      <PipelineHeader stages={pipelineStages(facts)} />
      <NextActionCard action={nextAction} />

      <nav className="related-links" aria-label="Related opportunity content">
        <Link href={`/evidence?opportunityId=${opportunity.id}`}><strong>{evidence.length}</strong><span>Linked Evidence</span></Link>
        <Link href={opportunity.evidence_cluster_id ? `/evidence-clusters/${opportunity.evidence_cluster_id}` : "/evidence-clusters"}><strong>{opportunity.evidence_cluster_id ? 1 : 0}</strong><span>Evidence Clusters</span></Link>
        <Link href={`/validation-packages?opportunityId=${opportunity.id}`}><strong>{validation ? 1 : 0}</strong><span>Validation Package</span></Link>
        <Link href={`/interviews?opportunityId=${opportunity.id}`}><strong>{interviews.length}</strong><span>Interviews</span></Link>
        <Link href={`/product-concepts?opportunityId=${opportunity.id}`}><strong>{concepts.length}</strong><span>Product Concepts</span></Link>
        <Link href={`/experiments?opportunityId=${opportunity.id}`}><strong>{experiments.length}</strong><span>Experiments</span></Link>
      </nav>

      <div className="detail-grid">
        <div className="stack">
          <WorkflowCard stages={opportunityWorkflow(facts)} />
          <section className="card detail-body">
            <div className="detail-field">
              <h3>Research Session</h3>
              <p>{opportunity.research_session_id
                ? <Link href={`/research-sessions/${opportunity.research_session_id}`}>{opportunity.research_session_name || `Session #${opportunity.research_session_id}`}</Link>
                : "No research session linked"}</p>
            </div>
            <div className="detail-field">
              <h3>Originating Cluster</h3>
              <p>{opportunity.evidence_cluster_id
                ? <Link href={`/evidence-clusters/${opportunity.evidence_cluster_id}`}>{opportunity.originating_cluster_name}</Link>
                : "No originating cluster (legacy record)"}</p>
            </div>
            <div className="detail-field"><h3>Status</h3><p><StatusBadge status={opportunity.status} /></p></div>
            <div className="detail-field"><h3>Review status</h3><p><StatusBadge status={opportunity.review_status} /></p></div>
            <Detail label="Problem statement" value={opportunity.problem_statement} />
            <Detail label="Current workflow" value={opportunity.current_workflow ?? opportunity.current_workaround} />
            <Detail label="Current alternatives" value={opportunity.existing_solutions} />
            <Detail label="Why existing software fails" value={opportunity.solutions_insufficient} />
            <Detail label="Ideal customer" value={opportunity.user_persona} />
            <Detail label="Estimated willingness to pay" value={opportunity.estimated_willingness_to_pay ?? opportunity.estimated_cost} />
            <Detail label="AI opportunity" value={opportunity.ai_opportunity} />
            <Detail label="Risks" value={opportunity.risks} />
            <Detail label="Moat ideas" value={opportunity.moat_ideas} />
            <Detail label="Open questions" value={opportunity.open_questions} />
            <Detail label="Reason it was promoted" value={opportunity.promotion_reason} />
          </section>
          <RelatedTable title="Linked evidence" empty="No evidence is linked yet. Add supporting proof before advancing validation." action={{ label: "Add Evidence", href: `/evidence?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Evidence", "Source", "Severity", "Confidence", "Collected"]} rows={evidence.map((item) => [
            <Link key={item.id} href={`/evidence/${item.id}`}>{item.quote_snippet}</Link>, `${item.source_type} · ${item.source_name}`, `${item.severity}/10`, `${item.confidence}/10`, item.date_collected,
          ])} />
          <RelatedTable title="Linked interviews" empty="No interviews have been conducted yet. Start customer discovery to validate this opportunity." action={{ label: "Start Interviews", href: `/interviews?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Interviewee", "Role", "Date", "Pain", "Would pay"]} rows={interviews.map((item) => [
            item.interviewee_name, [item.role_title, item.company].filter(Boolean).join(" · "), item.date, `${item.pain_severity}/10`, item.would_pay,
          ])} />
          <RelatedTable title="Product concepts" empty="No product concepts have been generated yet. Validate the opportunity before defining a solution." action={{ label: "Generate Product Concepts", href: `/opportunities/${opportunity.id}` }} headers={["Concept", "Pitch", "Score"]} rows={concepts.map((item) => [
            item.concept_name, item.one_sentence_pitch, item.total_score,
          ])} />
          <RelatedTable title="Experiments" empty="No experiments are running yet. Select a product concept and create a measurable test." action={{ label: "Create Experiment", href: `/experiments?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Hypothesis", "Concept", "Method", "Status"]} rows={experiments.map((item) => [
            item.hypothesis, item.concept_name, item.validation_method, item.status,
          ])} />
          <section className="card detail-body">
            <div className="section-title inline-title"><h2>Validation Package</h2>{validation && <StatusBadge status={String(validation.status)} />}</div>
            {validation ? <>
              <Detail label="Review status" value={String(validation.review_status)} />
              <Detail label="Interview plan" value={String(validation.interview_plan ?? "")} />
              <Detail label="Interview questions" value={String(validation.interview_questions ?? "")} />
              <Detail label="Target interviewees" value={String(validation.target_interviewees ?? "")} />
              <Detail label="Outreach message" value={String(validation.outreach_message ?? "")} />
              <Detail label="Landing page draft" value={String(validation.landing_page_draft ?? "")} />
              <Detail label="Pricing hypotheses" value={String(validation.pricing_hypotheses ?? "")} />
              <Detail label="Assumptions to test" value={String(validation.assumptions_to_test ?? "")} />
              <Detail label="MVP scope" value={String(validation.mvp_scope ?? "")} />
              <Detail label="Success criteria" value={String(validation.success_criteria ?? "")} />
              <Link className="button secondary" href={`/validation-packages?opportunityId=${opportunity.id}`}>Edit validation package</Link>
            </> : <div className="action-empty"><p>No validation package exists yet. Generate one to define interviews, assumptions, pricing, and success criteria.</p><Link className="button secondary small" href={`/opportunities/${opportunity.id}`}>Generate Validation Package</Link></div>}
          </section>
        </div>

        <aside className="stack sticky-sidebar">
          <div className="detail-stats">
            <div className="card detail-stat"><strong>{opportunity.opportunity_score ?? opportunity.total_score}</strong><span>Opportunity Score /100</span></div>
            <div className="card detail-stat"><strong>{opportunity.confidence_score}/10</strong><span>Confidence Score</span></div>
            <div className="card detail-stat"><strong>{opportunity.evidence_count}</strong><span>Supporting Evidence</span></div>
            <div className="card detail-stat"><strong>{opportunity.interview_count}</strong><span>Interviews</span></div>
            <div className="card detail-stat"><strong>{opportunity.average_quality_score ?? "—"}</strong><span>Avg. Evidence Quality</span></div>
          </div>
          <div className="score-grid">
            <Score label="Pain" value={opportunity.pain_score} />
            <Score label="Frequency" value={opportunity.frequency_score} />
            <Score label="AI Leverage" value={opportunity.ai_leverage_score} />
            <Score label="Market Size" value={opportunity.market_score} />
            <Score label="Competitive Gap" value={opportunity.competitive_gap_score} />
            <Score label="Distribution Difficulty" value={opportunity.distribution_difficulty} />
          </div>
          <section className="card detail-body metrics-status-panel">
            <div className="section-title inline-title"><h2>Validation Status</h2></div>
            <div className="detail-field"><h3>Validation</h3><p><StatusBadge status={validation ? String(validation.review_status || validation.status) : "Draft"} /></p></div>
            <div className="detail-field"><h3>Experiment</h3><p><StatusBadge status={experiments[0] ? String(experiments[0].status) : "Draft"} /></p></div>
          </section>
          <section className="card detail-body">
            <Detail label="Research notes / AI output" value={opportunity.research_notes} />
            <Detail label="Notes" value={opportunity.notes} />
          </section>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "—"}</p></div>;
}

function RelatedTable({ title, empty, action, headers, rows }: { title: string; empty: string; action: { label: string; href: string }; headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <section className="card section-card">
      <div className="section-title"><h2>{title}</h2></div>
      {rows.length ? <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td className={cellIndex === 0 ? "cell-main" : ""} key={cellIndex}>{cell || "—"}</td>)}</tr>)}</tbody>
      </table></div> : <div className="action-empty"><p>{empty}</p><Link className="button secondary small" href={action.href}>{action.label}</Link></div>}
    </section>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return <div className="card score-card"><span>{label}</span><strong>{value ?? "—"}</strong><small>/100</small></div>;
}
