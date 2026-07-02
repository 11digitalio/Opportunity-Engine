import { notFound } from "next/navigation";
import ResearchSessionDetail from "@/components/ResearchSessionDetail";
import { db } from "@/lib/db";
import { nextRecommendedAction, pipelineStages, workflowProgress, WorkflowFacts } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type CountRow = { count: number };
type RelatedItem = { id: number; name: string; detail: string | null; meta: string | null };
type Activity = { id: string; label: string; detail: string; created_at: string };

export default async function ResearchSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const session = db.prepare(`
    SELECT rs.*, i.name AS industry_name
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id
    WHERE rs.id = ?
  `).get(id) as Record<string, string | number | null> | undefined;
  if (!session) notFound();

  const count = (table: string) => (db.prepare(`SELECT COUNT(*) count FROM ${table} WHERE research_session_id = ?`).get(id) as CountRow).count;
  const metrics = {
    evidence: count("evidence"),
    clusters: count("evidence_clusters"),
    opportunities: count("opportunities"),
    validations: count("validation_packages"),
    interviews: count("interviews"),
    concepts: count("product_concepts"),
    experiments: count("experiments"),
  };
  const qualifiedOpportunityCount = (db.prepare(`
    SELECT COUNT(*) count FROM opportunities
    WHERE research_session_id = ? AND review_status = 'Approved'
  `).get(id) as CountRow).count;
  const approvedConceptCount = (db.prepare("SELECT COUNT(*) count FROM product_concepts WHERE research_session_id = ? AND review_status = 'Approved'").get(id) as CountRow).count;
  const activeExperimentCount = (db.prepare("SELECT COUNT(*) count FROM experiments WHERE research_session_id = ? AND status IN ('Running', 'Complete', 'Completed', 'Successful')").get(id) as CountRow).count;
  const successfulExperimentCount = (db.prepare("SELECT COUNT(*) count FROM experiments WHERE research_session_id = ? AND status IN ('Complete', 'Completed', 'Successful')").get(id) as CountRow).count;
  const building = (db.prepare("SELECT COUNT(*) count FROM industry_pipeline WHERE name = ? AND status = 'Building'").get(session.industry_name) as CountRow).count > 0;
  const leadingOpportunity = db.prepare(`
    SELECT id, status FROM opportunities WHERE research_session_id = ?
    ORDER BY COALESCE(opportunity_score, total_score, 0) DESC LIMIT 1
  `).get(id) as { id: number; status: string } | undefined;

  const facts: WorkflowFacts = {
    sessionId: id,
    industryId: Number(session.industry_id),
    opportunityId: leadingOpportunity?.id,
    evidenceCount: metrics.evidence,
    clusterCount: metrics.clusters,
    opportunityCount: metrics.opportunities,
    validationCount: metrics.validations,
    interviewCount: metrics.interviews,
    conceptCount: metrics.concepts,
    approvedConceptCount,
    experimentCount: metrics.experiments,
    activeExperimentCount,
    successfulExperimentCount,
    opportunityStatus: leadingOpportunity?.status,
    building,
  };

  const related = {
    evidence: db.prepare(`SELECT id, quote_snippet AS name, source_type AS detail, created_at AS meta FROM evidence WHERE research_session_id = ? ORDER BY datetime(created_at) DESC`).all(id) as RelatedItem[],
    clusters: db.prepare(`SELECT id, cluster_name AS name, problem_summary AS detail, created_at AS meta FROM evidence_clusters WHERE research_session_id = ? ORDER BY datetime(created_at) DESC`).all(id) as RelatedItem[],
    opportunities: db.prepare(`SELECT id, opportunity_name AS name, status AS detail, created_at AS meta FROM opportunities WHERE research_session_id = ? ORDER BY COALESCE(opportunity_score, total_score, 0) DESC`).all(id) as RelatedItem[],
    validations: db.prepare(`SELECT vp.id, o.opportunity_name AS name, vp.status AS detail, vp.created_at AS meta FROM validation_packages vp JOIN opportunities o ON o.id = vp.opportunity_id WHERE vp.research_session_id = ? ORDER BY datetime(vp.created_at) DESC`).all(id) as RelatedItem[],
    interviews: db.prepare(`SELECT id, interviewee_name AS name, COALESCE(role_title, company, '') AS detail, created_at AS meta FROM interviews WHERE research_session_id = ? ORDER BY datetime(created_at) DESC`).all(id) as RelatedItem[],
    concepts: db.prepare(`SELECT id, concept_name AS name, review_status AS detail, created_at AS meta FROM product_concepts WHERE research_session_id = ? ORDER BY total_score DESC`).all(id) as RelatedItem[],
    experiments: db.prepare(`SELECT id, hypothesis AS name, status AS detail, created_at AS meta FROM experiments WHERE research_session_id = ? ORDER BY datetime(created_at) DESC`).all(id) as RelatedItem[],
  };

  const activity = db.prepare(`
    SELECT * FROM (
      SELECT 'session-' || id id, 'Created Research Session' label, COALESCE(name, 'Research session started') detail, created_at FROM research_sessions WHERE id = ?
      UNION ALL SELECT 'evidence-' || id, 'Added Evidence', source_name, created_at FROM evidence WHERE research_session_id = ?
      UNION ALL SELECT 'cluster-' || id, 'Generated Evidence Cluster', cluster_name, created_at FROM evidence_clusters WHERE research_session_id = ?
      UNION ALL SELECT 'opportunity-' || id, CASE WHEN status = 'Archived' THEN 'Opportunity Archived' ELSE 'Promoted Opportunity' END, opportunity_name, CASE WHEN status = 'Archived' THEN updated_at ELSE created_at END FROM opportunities WHERE research_session_id = ?
      UNION ALL SELECT 'validation-' || vp.id, CASE WHEN vp.review_status = 'Approved' THEN 'Validation Approved' ELSE 'Generated Validation Package' END, o.opportunity_name, CASE WHEN vp.review_status = 'Approved' THEN vp.updated_at ELSE vp.created_at END FROM validation_packages vp JOIN opportunities o ON o.id = vp.opportunity_id WHERE vp.research_session_id = ?
      UNION ALL SELECT 'interview-' || id, CASE WHEN COALESCE(transcript_notes, '') <> '' THEN 'Interview Completed' ELSE 'Created Interview' END, interviewee_name, CASE WHEN COALESCE(transcript_notes, '') <> '' THEN updated_at ELSE created_at END FROM interviews WHERE research_session_id = ?
      UNION ALL SELECT 'concept-' || id, 'Generated Product Concept', concept_name, created_at FROM product_concepts WHERE research_session_id = ?
      UNION ALL SELECT 'experiment-' || id, CASE WHEN status IN ('Complete', 'Completed', 'Successful') THEN 'Experiment Finished' ELSE 'Experiment Started' END, hypothesis, CASE WHEN status IN ('Complete', 'Completed', 'Successful') THEN updated_at ELSE created_at END FROM experiments WHERE research_session_id = ?
    ) ORDER BY datetime(created_at) DESC LIMIT 20
  `).all(id, id, id, id, id, id, id, id) as Activity[];

  return <ResearchSessionDetail
    session={session}
    industries={db.prepare("SELECT id, name FROM industries ORDER BY name").all() as { id: number; name: string }[]}
    metrics={metrics}
    qualifiedOpportunityCount={qualifiedOpportunityCount}
    stages={pipelineStages(facts)}
    progress={workflowProgress(facts).percent}
    nextAction={nextRecommendedAction(facts)}
    activity={activity}
    related={related}
  />;
}
