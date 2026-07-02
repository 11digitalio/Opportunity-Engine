import { db } from "./db";

type FinishMetrics = {
  workflowsCreated?: number;
  evidenceCreated?: number;
  evidenceClustersCreated?: number;
  opportunitiesPromoted?: number;
  productConceptsCreated?: number;
  searchQueries?: string[];
  sourcesSearched?: string[];
  aiModel?: string;
  tokenCount?: number;
  costEstimate?: number;
  log?: string[];
};

export function startResearchLog(industryId: number, actionType: string, openingLine: string) {
  const now = new Date().toISOString();
  const current = db.prepare(`
    SELECT id, full_run_log FROM research_sessions
    WHERE industry_id = ? AND status = 'Running'
    ORDER BY datetime(started_at) DESC, id DESC LIMIT 1
  `).get(industryId) as { id: number; full_run_log: string | null } | undefined;
  if (current) {
    db.prepare(`
      UPDATE research_sessions SET action_type = ?, full_run_log = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(actionType, [current.full_run_log, `[${now}] ${openingLine}`].filter(Boolean).join("\n"), current.id);
    return current.id;
  }
  const industry = db.prepare("SELECT name FROM industries WHERE id = ?").get(industryId) as { name: string };
  const result = db.prepare(`
    INSERT INTO research_sessions (
      industry_id, name, started_date, started_at, status, research_stage,
      checklist_json, action_type, full_run_log
    ) VALUES (?, ?, date(?), ?, 'Running', 'Evidence Collection', '{}', ?, ?)
  `).run(industryId, `${industry.name} — Research`, now, now, actionType, `[${now}] Research session started\n[${now}] ${openingLine}`);
  return Number(result.lastInsertRowid);
}

export function finishResearchLog(id: number, metrics: FinishMetrics = {}) {
  const session = db.prepare("SELECT started_at, full_run_log FROM research_sessions WHERE id = ?").get(id) as
    { started_at: string | null; full_run_log: string | null } | undefined;
  if (!session) return;
  const finishedAt = new Date().toISOString();
  const started = session.started_at ? new Date(session.started_at).getTime() : Date.now();
  const duration = Math.max(0, Math.round((Date.now() - started) / 1000));
  const additions = metrics.log ?? ["Action completed successfully."];
  const log = [session.full_run_log, ...additions.map((line) => `[${finishedAt}] ${line}`)].filter(Boolean).join("\n");
  db.prepare(`
    UPDATE research_sessions SET duration_seconds = ?,
      search_queries = ?, sources_searched = ?, workflows_created_count = ?,
      evidence_created_count = evidence_created_count + ?, evidence_clusters_created_count = evidence_clusters_created_count + ?,
      opportunities_promoted_count = opportunities_promoted_count + ?, product_concepts_created_count = product_concepts_created_count + ?,
      ai_model_used = ?, token_count = ?, cost_estimate = ?, full_run_log = ?,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(
    duration, (metrics.searchQueries ?? []).join("\n"), (metrics.sourcesSearched ?? []).join("\n"),
    metrics.workflowsCreated ?? 0, metrics.evidenceCreated ?? 0, metrics.evidenceClustersCreated ?? 0,
    metrics.opportunitiesPromoted ?? 0, metrics.productConceptsCreated ?? 0,
    metrics.aiModel ?? null, metrics.tokenCount ?? null, metrics.costEstimate ?? null, log, id,
  );
}

export function failResearchLog(id: number, error: unknown) {
  const session = db.prepare("SELECT started_at, full_run_log FROM research_sessions WHERE id = ?").get(id) as
    { started_at: string | null; full_run_log: string | null } | undefined;
  if (!session) return;
  const finishedAt = new Date().toISOString();
  const started = session.started_at ? new Date(session.started_at).getTime() : Date.now();
  const duration = Math.max(0, Math.round((Date.now() - started) / 1000));
  const message = error instanceof Error ? error.message : "Unknown failure";
  db.prepare(`
    UPDATE research_sessions SET duration_seconds = ?,
      full_run_log = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(duration, [session.full_run_log, `[${finishedAt}] FAILED: ${message}`].filter(Boolean).join("\n"), id);
}

export function qualityScoreForSource(sourceType: string) {
  const source = sourceType.toLowerCase();
  if (source.includes("owner") || source.includes("buyer") || source.includes("revenue") || source.includes("payment")) return 10;
  if (source.includes("staff") || source.includes("user") || source.includes("support") || source.includes("internal") || source === "interview") return 9;
  if (source === "g2") return 7;
  if (["capterra", "app store", "google play"].includes(source)) return 6;
  return 5;
}
