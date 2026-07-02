import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OpportunityActions from "@/components/OpportunityActions";
import { NextActionCard, PipelineHeader, StatusBadge } from "@/components/WorkflowUI";
import { nextRecommendedAction, pipelineStages, WorkflowFacts } from "@/lib/workflow";

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

      <section className="card memo-summary" id="thesis">
        <div>
          <span className="eyebrow">Opportunity thesis</span>
          <h2>{opportunity.problem_statement}</h2>
          <span className="memo-summary-label">Why it looks promising</span>
          <p>{opportunityThesisReason(opportunity)}</p>
          <div className="memo-summary-customer"><span>Who has this problem</span><strong>{opportunity.user_persona || "Customer profile still needs validation"}</strong></div>
        </div>
        <div className="memo-summary-metrics">
          <div><strong>{opportunity.opportunity_score ?? opportunity.total_score}</strong><span>Score /100</span></div>
          <div><strong>{opportunity.confidence_score}/10</strong><span>Confidence</span></div>
          <div><strong>{opportunity.evidence_count}</strong><span>Evidence</span></div>
          <div><strong>{opportunity.interview_count}</strong><span>Interviews</span></div>
        </div>
      </section>

      <nav className="memo-nav" aria-label="Opportunity report sections">
        <a href="#thesis">Opportunity thesis</a><a href="#pain">Pain</a><a href="#validation">Market validation</a>
        <a href="#interviews">Customer interviews</a><a href="#score">Score</a><a href="#concepts">Product concepts</a><a href="#plan">Validation plan</a><a href="#experiments">Experiments</a>
      </nav>

      <div className="memo-layout">
        <article className="memo-content">
          <MemoHeading number="02" title="Pain" subtitle="What breaks today, who feels it, and why current solutions fail." />
          <section className="card memo-section" id="pain">
            <Detail label="Problem" value={opportunity.problem_statement} />
            <div className="memo-two-column">
              <Detail label="Current workflow" value={opportunity.current_workflow ?? opportunity.current_workaround} />
              <Detail label="Why existing software fails" value={opportunity.solutions_insufficient} />
            </div>
          </section>

          <MemoHeading number="03" title="Market validation" subtitle="What is known about the buyer, alternatives, and willingness to pay." />
          <section className="card memo-section" id="validation">
            <div className="memo-two-column">
              <Detail label="Ideal customer" value={opportunity.user_persona} />
              <Detail label="Willingness to pay" value={opportunity.estimated_willingness_to_pay ?? opportunity.estimated_cost} />
              <Detail label="Current alternatives" value={opportunity.existing_solutions} />
              <Detail label="Evidence quality" value={opportunity.average_quality_score ? `${opportunity.average_quality_score}/10 average` : null} />
            </div>
          </section>
          <details className="supporting-evidence" id="evidence">
            <summary><span>Customer evidence</span><small>{evidence.length} record{evidence.length === 1 ? "" : "s"}</small></summary>
            <RelatedTable title="Supporting evidence" empty="No evidence is linked yet. Add supporting proof before advancing validation." action={{ label: "Add Evidence", href: `/evidence?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Evidence", "Source", "Severity", "Confidence", "Collected"]} rows={evidence.map((item) => [
              <Link key={item.id} href={`/evidence/${item.id}`}>{item.quote_snippet}</Link>, `${item.source_type} · ${item.source_name}`, `${item.severity}/10`, `${item.confidence}/10`, item.date_collected,
            ])} />
          </details>

          <MemoHeading number="04" title="Customer interviews" subtitle="Direct buyer conversations that confirm the pain and willingness to pay." />
          <RelatedTable id="interviews" title="Interview findings" empty="No interviews have been conducted yet. Start customer discovery to validate this opportunity." action={{ label: "Start Interviews", href: `/interviews?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Interviewee", "Role", "Date", "Pain", "Would pay"]} rows={interviews.map((item) => [
            item.interviewee_name, [item.role_title, item.company].filter(Boolean).join(" · "), item.date, `${item.pain_severity}/10`, item.would_pay,
          ])} />

          <MemoHeading number="05" title="Opportunity score" subtitle="A focused view of business potential and execution risk." />
          <section className="card memo-score-section" id="score">
            <div className="memo-overall-score"><strong>{opportunity.opportunity_score ?? opportunity.total_score}</strong><span>Overall opportunity score</span></div>
            <div className="score-grid">
              <Score label="Pain" value={opportunity.pain_score} />
              <Score label="Frequency" value={opportunity.frequency_score} />
              <Score label="Automation potential" value={opportunity.ai_leverage_score} />
              <Score label="Market size" value={opportunity.market_score} />
              <Score label="Competitive gap" value={opportunity.competitive_gap_score} />
              <Score label="Distribution ease" value={opportunity.distribution_difficulty === null ? null : 100 - opportunity.distribution_difficulty} />
            </div>
          </section>

          <CollapsibleMemo id="concepts" number="06" title="Product concepts" subtitle="Possible solutions ranked to make the next choice clear." count={`${concepts.length} concept${concepts.length === 1 ? "" : "s"}`}>
            <section className="card section-card">
              <div className="section-title title-action"><h2>Concept comparison</h2><Link href={`/product-concepts?opportunityId=${opportunity.id}`}>View all</Link></div>
              {concepts.length ? <div className="table-wrap"><table><thead><tr><th>Decision</th><th>Concept</th><th>Pitch</th><th>Score</th><th>Review</th></tr></thead>
                <tbody>{concepts.map((item, index) => <tr key={String(item.id)}>
                  <td><div className="concept-decision"><ConceptRank index={index} /><small>{conceptRankReason(index, concepts)}</small></div></td><td className="cell-main">{item.concept_name}</td><td>{item.one_sentence_pitch || "—"}</td>
                  <td><span className="score">{item.total_score}</span></td><td><StatusBadge status={String(item.review_status)} /></td>
                </tr>)}</tbody></table></div>
                : <div className="action-empty"><p>No product concepts have been generated yet. Use the action at the top of this report when the opportunity is ready.</p></div>}
            </section>
          </CollapsibleMemo>

          <CollapsibleMemo id="plan" number="07" title="Validation plan" subtitle="The assumptions, interviews, and success criteria required before building." count={validation ? "Plan ready" : "Not created"}>
            <section className="card memo-section">
              {validation ? <>
                <div className="validation-plan-header"><StatusBadge status={String(validation.review_status || validation.status)} /><Link href={`/validation-packages?opportunityId=${opportunity.id}`}>Edit plan</Link></div>
                <div className="memo-two-column">
                  <Detail label="Interview plan" value={String(validation.interview_plan ?? "")} />
                  <Detail label="Target interviewees" value={String(validation.target_interviewees ?? "")} />
                  <Detail label="Assumptions to test" value={String(validation.assumptions_to_test ?? "")} />
                  <Detail label="Success criteria" value={String(validation.success_criteria ?? "")} />
                </div>
                <details className="secondary-details">
                  <summary>Show outreach, pricing, and MVP details</summary>
                  <div className="memo-two-column details-content">
                    <Detail label="Interview questions" value={String(validation.interview_questions ?? "")} />
                    <Detail label="Outreach message" value={String(validation.outreach_message ?? "")} />
                    <Detail label="Landing page draft" value={String(validation.landing_page_draft ?? "")} />
                    <Detail label="Pricing hypotheses" value={String(validation.pricing_hypotheses ?? "")} />
                    <Detail label="MVP scope" value={String(validation.mvp_scope ?? "")} />
                  </div>
                </details>
              </> : <div className="action-empty"><p>No validation plan exists yet. Create one to define interviews, assumptions, pricing, and success criteria.</p></div>}
            </section>
          </CollapsibleMemo>

          <CollapsibleMemo id="experiments" number="08" title="Experiments" subtitle="Tests that can confirm or reject the riskiest assumptions." count={`${experiments.length} test${experiments.length === 1 ? "" : "s"}`}>
            <RelatedTable title="Active and completed tests" empty="No experiments are running yet. Select a product concept and create a measurable test." action={{ label: "Create Experiment", href: `/experiments?new=1&opportunityId=${opportunity.id}&sessionId=${opportunity.research_session_id ?? ""}` }} headers={["Hypothesis", "Concept", "Method", "Status"]} rows={experiments.map((item) => [
              item.hypothesis, item.concept_name, item.validation_method, <StatusBadge key={String(item.id)} status={String(item.status)} />,
            ])} />
          </CollapsibleMemo>
        </article>

        <aside className="memo-sidebar">
          <section className="card decision-snapshot">
            <span className="eyebrow">Decision snapshot</span>
            <div><span>Stage</span><StatusBadge status={opportunity.status} /></div>
            <div><span>Review</span><StatusBadge status={opportunity.review_status} /></div>
            <div><span>Validation plan</span><StatusBadge status={validation ? String(validation.review_status || validation.status) : "Draft"} /></div>
            <div><span>Latest experiment</span><StatusBadge status={experiments[0] ? String(experiments[0].status) : "Draft"} /></div>
          </section>
          <section className="card memo-sidebar-card">
            <Detail label="Key risks" value={opportunity.risks} />
            <Detail label="Open questions" value={opportunity.open_questions} />
          </section>
          <details className="card sidebar-details">
            <summary>Supporting context</summary>
            <div>
              <Detail label="Automation opportunity" value={opportunity.ai_opportunity} />
              <Detail label="Moat ideas" value={opportunity.moat_ideas} />
              <Detail label="Research notes" value={opportunity.research_notes} />
              <Detail label="Notes" value={opportunity.notes} />
              <Detail label="Research session" value={opportunity.research_session_name} />
              <Detail label="Originating pattern" value={opportunity.originating_cluster_name} />
            </div>
          </details>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "—"}</p></div>;
}

function opportunityThesisReason(opportunity: Opportunity) {
  if (opportunity.interview_count >= 3 && opportunity.evidence_count >= 3) {
    return "Customer interviews and independent evidence consistently confirm the same painful workflow.";
  }
  if (opportunity.evidence_count >= 5 && (opportunity.average_quality_score ?? 0) >= 7) {
    return "High-quality customer evidence shows a recurring problem with clear business impact.";
  }
  if (opportunity.evidence_count >= 3) {
    return "Multiple customer signals point to a recurring problem that deserves focused validation.";
  }
  return "The available evidence makes this the clearest problem to investigate next.";
}

function MemoHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <div className="memo-heading"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}

function CollapsibleMemo({ id, number, title, subtitle, count, children }: { id: string; number: string; title: string; subtitle: string; count: string; children: React.ReactNode }) {
  return <details className="memo-collapsible" id={id}>
    <summary><MemoHeading number={number} title={title} subtitle={subtitle} /><span className="memo-collapsible-meta">{count}</span></summary>
    <div className="memo-collapsible-content">{children}</div>
  </details>;
}

function RelatedTable({ id, title, empty, action, headers, rows }: { id?: string; title: string; empty: string; action: { label: string; href: string }; headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <section className="card section-card" id={id}>
      <div className="section-title title-action"><h2>{title}</h2>{rows.length ? <Link href={action.href}>{action.label}</Link> : null}</div>
      {rows.length ? <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td className={cellIndex === 0 ? "cell-main" : ""} key={cellIndex}>{cell || "—"}</td>)}</tr>)}</tbody>
      </table></div> : <div className="action-empty"><p>{empty}</p><Link className="button secondary small" href={action.href}>{action.label}</Link></div>}
    </section>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return <div className="score-card"><span>{label}</span><strong>{value ?? "—"}</strong><small>/100</small><i><b style={{ width: `${value ?? 0}%` }} /></i></div>;
}

function ConceptRank({ index }: { index: number }) {
  const label = index === 0 ? "Recommended" : index === 1 ? "Runner-up" : "Needs more validation";
  return <span className={`decision-badge decision-${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</span>;
}

function conceptRankReason(index: number, concepts: Record<string, string | number | null>[]) {
  if (index === 0) return "Highest current score; strongest build candidate.";
  if (index === 1) {
    const gap = Math.max(0, Number(concepts[0]?.total_score ?? 0) - Number(concepts[index]?.total_score ?? 0));
    return `${gap}-point gap; best alternative if the leader’s assumption fails.`;
  }
  return "Validate demand and differentiation before selecting.";
}
