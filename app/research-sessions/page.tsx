import ResearchSessionList from "@/components/ResearchSessionList";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function ResearchSessionsPage() {
  const sessions = db.prepare(`
    SELECT rs.*, i.name AS industry_name,
      (SELECT COUNT(*) FROM workflows w WHERE w.industry_id = rs.industry_id) AS workflow_count,
      (SELECT COUNT(*) FROM products p WHERE p.industry_id = rs.industry_id) AS product_count,
      (SELECT COUNT(*) FROM evidence e WHERE e.research_session_id = rs.id) AS evidence_count,
      (SELECT COUNT(*) FROM evidence_clusters ec WHERE ec.research_session_id = rs.id) AS cluster_count,
      (SELECT COUNT(*) FROM opportunities o WHERE o.research_session_id = rs.id) AS opportunity_count,
      (SELECT COUNT(*) FROM validation_packages vp WHERE vp.research_session_id = rs.id) AS validation_count,
      (SELECT COUNT(*) FROM interviews iv WHERE iv.research_session_id = rs.id) AS interview_count,
      (SELECT COUNT(*) FROM product_concepts pc WHERE pc.research_session_id = rs.id) AS concept_count,
      (SELECT COUNT(*) FROM experiments ex WHERE ex.research_session_id = rs.id) AS experiment_count,
      (SELECT COUNT(*) FROM industry_pipeline ip WHERE ip.name = i.name AND ip.status = 'Building') AS building
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id
    ORDER BY CASE rs.status WHEN 'Running' THEN 0 WHEN 'Failed' THEN 1 WHEN 'Not Started' THEN 2 ELSE 3 END,
      date(rs.started_date) DESC, rs.id DESC
  `).all() as {
    id: number;
    name: string | null;
    industry_name: string;
    started_date: string;
    status: string;
    checklist_json: string;
    notes: string | null;
    action_type: string | null;
    duration_seconds: number | null;
    evidence_created_count: number;
    opportunities_promoted_count: number;
    product_concepts_created_count: number;
    workflow_count: number; product_count: number; evidence_count: number; cluster_count: number;
    opportunity_count: number; validation_count: number; interview_count: number; concept_count: number; experiment_count: number; building: number;
  }[];
  const industries = db.prepare("SELECT id, name FROM industries ORDER BY name").all() as { id: number; name: string }[];
  return <ResearchSessionList sessions={sessions} industries={industries} />;
}
