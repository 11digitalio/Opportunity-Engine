import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OpportunityActions from "@/components/OpportunityActions";
import { StatusBadge } from "@/components/WorkflowUI";
import { nextRecommendedAction, WorkflowFacts } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Opportunity = {
  id: number; industry_id: number; research_session_id: number | null; evidence_cluster_id: number | null;
  opportunity_name: string; problem_statement: string; user_persona: string | null; current_workaround: string | null;
  current_workflow: string | null; estimated_cost: string | null; estimated_willingness_to_pay: string | null;
  existing_solutions: string | null; solutions_insufficient: string | null; why_now: string | null;
  total_score: number; opportunity_score: number | null; confidence_score: number; status: string; review_status: string;
  promotion_reason: string | null; risks: string | null; open_questions: string | null; moat_ideas: string | null;
  ai_opportunity: string | null; research_notes: string | null; notes: string | null;
  pain_score: number | null; frequency_score: number | null; ai_leverage_score: number | null;
  market_score: number | null; competitive_gap_score: number | null; distribution_difficulty: number | null;
  industry_name: string; workflow_name: string | null; originating_cluster_name: string | null;
  research_session_name: string | null; evidence_count: number; interview_count: number; average_quality_score: number | null;
};

type Concept = {
  id: number; concept_name: string; one_sentence_pitch: string | null; proposed_solution: string | null;
  main_risk: string | null; total_score: number; review_status: string;
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
    SELECT e.id, e.quote_snippet, e.evidence_summary, e.source_type, e.source_name, e.severity,
      e.confidence, e.evidence_quality_score, e.date_collected, e.source_url
    FROM evidence e JOIN evidence_opportunities eo ON eo.evidence_id = e.id WHERE eo.opportunity_id = ?
    ORDER BY e.severity DESC, e.evidence_quality_score DESC, e.date_collected DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const interviews = db.prepare(`
    SELECT id, interviewee_name, role_title, company, date, pain_severity, would_pay, strongest_quote
    FROM interviews WHERE opportunity_id = ? ORDER BY date DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const concepts = db.prepare(`
    SELECT id, concept_name, one_sentence_pitch, proposed_solution, main_risk, total_score, review_status
    FROM product_concepts WHERE opportunity_id = ? ORDER BY total_score DESC, created_at DESC
  `).all(opportunity.id) as Concept[];
  const experiments = db.prepare(`
    SELECT ex.id, ex.hypothesis, ex.status, ex.validation_method, pc.concept_name
    FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
    WHERE pc.opportunity_id = ? ORDER BY ex.created_at DESC
  `).all(opportunity.id) as Record<string, string | number | null>[];
  const validation = db.prepare("SELECT * FROM validation_packages WHERE opportunity_id = ?").get(opportunity.id) as Record<string, string | number | null> | undefined;

  const pricingValidated = interviews.some((item) => String(item.would_pay).toLowerCase() === "yes");
  const approvedConceptCount = concepts.filter((item) => item.review_status === "Approved").length;
  const successfulExperimentCount = experiments.filter((item) => ["Complete", "Completed", "Successful"].includes(String(item.status))).length;
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
    successfulExperimentCount,
    opportunityStatus: opportunity.status,
    building: false,
  };
  const nextAction = nextRecommendedAction(facts);
  const isSample = opportunity.industry_name.startsWith("[Sample]");

  return <>
    <div className="issue-breadcrumb">
      <Link href="/opportunities">Opportunities</Link><span>›</span>
      <Link href={`/industries/${opportunity.industry_id}`}>{opportunity.industry_name}</Link><span>›</span>
      <span>{opportunity.opportunity_name}</span>
    </div>

    <header className="page-header opportunity-detail-header">
      <div>
        <span className="eyebrow">Opportunity</span>
        <div className="title-with-badge"><h1>{opportunity.opportunity_name} {isSample && <span className="sample-badge">Sample</span>}</h1><StatusBadge status={opportunity.status} /></div>
      </div>
      <div className="actions"><OpportunityActions opportunityId={opportunity.id} isSample={isSample} /><Link className="button secondary" href="/opportunities">Back</Link></div>
    </header>

    <section className="card opportunity-decision-hero">
      <div className="opportunity-decision-story">
        <div className="opportunity-confidence">
          <span>Confidence</span><strong>{opportunity.confidence_score}/10</strong>
          <i><b style={{ width: `${opportunity.confidence_score * 10}%` }} /></i>
        </div>
        <h2>{opportunity.problem_statement}</h2>
        <div className="opportunity-why">
          <span>Why this opportunity exists</span>
          <p>{opportunity.promotion_reason || opportunityReason(opportunity)}</p>
        </div>
      </div>
      <div className="opportunity-next-step">
        <span className="eyebrow">Next validation step</span>
        <h3>{nextAction.label}</h3>
        <p>{nextAction.description}</p>
        <Link className="button" href={nextAction.href}>Take next step</Link>
      </div>
    </section>

    <section className="product-recommendations" aria-labelledby="product-recommendation-heading">
      <div className="decision-section-heading">
        <div><span className="eyebrow">Product recommendation</span><h2 id="product-recommendation-heading">What should you build?</h2><p>The best current product directions for this opportunity.</p></div>
        <Link href={`/product-concepts?opportunityId=${opportunity.id}`}>View all concepts</Link>
      </div>
      {concepts.length ? <div className="concept-recommendation-grid">
        {concepts.slice(0, 3).map((concept, index) => <article className={`card concept-recommendation concept-rank-${index}`} key={concept.id}>
          <ConceptRank index={index} />
          <h3>{concept.concept_name}</h3>
          <p>{concept.one_sentence_pitch || concept.proposed_solution || "The product direction needs a sharper value proposition."}</p>
          <div><span>{concept.total_score} score</span><StatusBadge status={concept.review_status} /></div>
        </article>)}
      </div> : <div className="card no-recommendation">
        <div><span className="eyebrow">No recommendation yet</span><h3>Define the product only after the opportunity is clear.</h3><p>The next step above will move this opportunity toward a credible product recommendation.</p></div>
        <Link className="button secondary" href={`/product-concepts?new=1&opportunityId=${opportunity.id}`}>Add product concept</Link>
      </div>}
    </section>

    <section className="proof-library" aria-labelledby="proof-heading">
      <div className="decision-section-heading">
        <div><span className="eyebrow">Proof library</span><h2 id="proof-heading">Why should you believe this?</h2><p>Open only the research you need to verify the recommendation.</p></div>
      </div>

      <DecisionDetails title="Supporting Evidence" meta={`${evidence.length} record${evidence.length === 1 ? "" : "s"}`}>
        <RelatedTable headers={["Signal", "Source", "Quality", "Severity"]} rows={evidence.map((item) => [
          <Link key={String(item.id)} href={`/evidence/${item.id}`}>{String(item.evidence_summary || item.quote_snippet)}</Link>,
          `${item.source_type} · ${item.source_name}`, `${item.evidence_quality_score}/10`, `${item.severity}/10`,
        ])} empty="No supporting evidence is linked yet." />
      </DecisionDetails>

      <DecisionDetails title="Customer Quotes" meta={`${evidence.length + interviews.filter((item) => item.strongest_quote).length} quotes`}>
        <div className="quote-library">
          {evidence.map((item) => <blockquote key={String(item.id)}><p>“{item.quote_snippet}”</p><cite>{item.source_name} · {item.source_type}</cite></blockquote>)}
          {interviews.filter((item) => item.strongest_quote).map((item) => <blockquote key={`interview-${item.id}`}><p>“{item.strongest_quote}”</p><cite>{item.interviewee_name}{item.role_title ? ` · ${item.role_title}` : ""}</cite></blockquote>)}
          {!evidence.length && !interviews.some((item) => item.strongest_quote) && <p className="empty-inline">No customer quotes are linked yet.</p>}
        </div>
      </DecisionDetails>

      <DecisionDetails title="Evidence Patterns" meta={opportunity.originating_cluster_name || "Not linked"}>
        <div className="detail-grid compact-details">
          <Detail label="Originating pattern" value={opportunity.originating_cluster_name} />
          <Detail label="Why it matters" value={opportunity.promotion_reason} />
          {opportunity.evidence_cluster_id && <Link className="button secondary small" href={`/evidence-clusters/${opportunity.evidence_cluster_id}`}>Open evidence pattern</Link>}
        </div>
      </DecisionDetails>

      <DecisionDetails title="Workflows" meta={opportunity.workflow_name || "Not linked"}>
        <div className="detail-grid compact-details">
          <Detail label="Workflow" value={opportunity.workflow_name} />
          <Detail label="How the work happens today" value={opportunity.current_workflow || opportunity.current_workaround} />
          <Detail label="Why current software fails" value={opportunity.solutions_insufficient} />
        </div>
      </DecisionDetails>

      <DecisionDetails title="Market Validation" meta={`${opportunity.opportunity_score ?? opportunity.total_score}/100 strength`}>
        <div className="market-validation-grid">
          <div className="detail-grid compact-details">
            <Detail label="Who has this problem?" value={opportunity.user_persona} />
            <Detail label="What do they use today?" value={opportunity.existing_solutions} />
            <Detail label="What might they pay?" value={opportunity.estimated_willingness_to_pay || opportunity.estimated_cost} />
            <Detail label="Why now?" value={opportunity.why_now} />
          </div>
          <div className="score-grid">
            <Score label="Pain" value={opportunity.pain_score} /><Score label="Frequency" value={opportunity.frequency_score} />
            <Score label="Automation potential" value={opportunity.ai_leverage_score} /><Score label="Market" value={opportunity.market_score} />
            <Score label="Competitive gap" value={opportunity.competitive_gap_score} /><Score label="Distribution ease" value={opportunity.distribution_difficulty === null ? null : 100 - opportunity.distribution_difficulty} />
          </div>
        </div>
      </DecisionDetails>

      <DecisionDetails title="Interviews" meta={`${interviews.length} completed`}>
        <RelatedTable headers={["Customer", "Role", "Pain", "Would pay"]} rows={interviews.map((item) => [
          item.interviewee_name, [item.role_title, item.company].filter(Boolean).join(" · "), `${item.pain_severity}/10`, item.would_pay,
        ])} empty="No customer interviews have been completed yet." />
      </DecisionDetails>

      <DecisionDetails title="Risks" meta={opportunity.risks || opportunity.open_questions ? "Review needed" : "None recorded"}>
        <div className="detail-grid compact-details"><Detail label="What could make this a bad business?" value={opportunity.risks} /><Detail label="What is still unknown?" value={opportunity.open_questions} /><Detail label="What could make it defensible?" value={opportunity.moat_ideas} /></div>
      </DecisionDetails>

      <DecisionDetails title="Validation Plan" meta={validation ? "Plan ready" : "Not created"}>
        {validation ? <div className="detail-grid compact-details">
          <Detail label="What needs to be true?" value={String(validation.assumptions_to_test || "")} />
          <Detail label="Who should we talk to?" value={String(validation.target_interviewees || "")} />
          <Detail label="What proves demand?" value={String(validation.success_criteria || "")} />
          <Detail label="Interview plan" value={String(validation.interview_plan || "")} />
        </div> : <div className="empty-with-action"><p>No validation plan exists yet.</p><Link className="button secondary small" href={`/validation-packages?new=1&opportunityId=${opportunity.id}`}>Create validation plan</Link></div>}
      </DecisionDetails>

      <DecisionDetails title="Experiments" meta={`${experiments.length} test${experiments.length === 1 ? "" : "s"}`}>
        <RelatedTable headers={["Hypothesis", "Product", "Method", "Status"]} rows={experiments.map((item) => [
          item.hypothesis, item.concept_name, item.validation_method, <StatusBadge key={String(item.id)} status={String(item.status)} />,
        ])} empty="No experiments have been run yet." />
      </DecisionDetails>

      <DecisionDetails title="Research Notes" meta="Supporting context">
        <div className="detail-grid compact-details">
          <Detail label="Research analysis" value={opportunity.research_notes} /><Detail label="Notes" value={opportunity.notes} />
          <Detail label="Research session" value={opportunity.research_session_name} /><Detail label="Automation opportunity" value={opportunity.ai_opportunity} />
        </div>
      </DecisionDetails>
    </section>
  </>;
}

function opportunityReason(opportunity: Opportunity) {
  if (opportunity.interview_count >= 3 && opportunity.evidence_count >= 3) return "Customers and independent evidence consistently describe the same painful workflow.";
  if (opportunity.evidence_count >= 5 && (opportunity.average_quality_score ?? 0) >= 7) return "Repeated, high-quality customer evidence points to a costly problem that current tools do not solve well.";
  if (opportunity.evidence_count >= 3) return "Several independent customer signals describe a recurring problem worth validating.";
  return "The evidence collected so far makes this the clearest problem to investigate next.";
}

function ConceptRank({ index }: { index: number }) {
  return <span className={`decision-badge decision-${index === 0 ? "recommended" : index === 1 ? "runner-up" : "needs-more-validation"}`}>{index === 0 ? "Recommended" : index === 1 ? "Runner-up" : "Needs more validation"}</span>;
}

function DecisionDetails({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) {
  return <details className="decision-details"><summary><span>{title}</span><small>{meta}</small></summary><div className="decision-details-body">{children}</div></details>;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-field"><h3>{label}</h3><p>{value || "Not validated yet."}</p></div>;
}

function RelatedTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="empty-inline">{empty}</p>;
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td className={cellIndex === 0 ? "cell-main" : ""} key={cellIndex}>{cell || "—"}</td>)}</tr>)}</tbody></table></div>;
}

function Score({ label, value }: { label: string; value: number | null }) {
  return <div className="score-card"><span>{label}</span><strong>{value ?? "—"}</strong><small>/100</small><i><b style={{ width: `${value ?? 0}%` }} /></i></div>;
}
