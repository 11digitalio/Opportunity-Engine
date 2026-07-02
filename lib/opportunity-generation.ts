import { db } from "./db";

type ClusterInput = {
  id: number;
  cluster_name: string;
  industry_id: number;
  research_session_id: number | null;
  workflow_id: number | null;
  problem_summary: string;
  business_impact: string | null;
  notes: string | null;
  industry_name: string;
  customer_types: string | null;
  estimated_market_size: string | null;
  number_of_businesses: number | null;
  core_business_objective: string | null;
  workflow_name: string | null;
  frequency: string | null;
  current_tools_used: string | null;
  manual_steps: string | null;
  pain_description: string | null;
  evidence_count: number;
  average_severity: number | null;
  average_confidence: number | null;
  source_count: number;
  product_count: number;
  product_names: string | null;
};

export type ClusterScores = {
  painScore: number;
  frequencyScore: number;
  aiLeverageScore: number;
  marketSizeScore: number;
  competitiveGapScore: number;
  distributionDifficulty: number;
  opportunityScore: number;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const containsAny = (value: string, terms: string[]) => terms.some((term) => value.toLowerCase().includes(term));

export function scoreCluster(cluster: ClusterInput): ClusterScores {
  const text = [
    cluster.problem_summary, cluster.business_impact, cluster.manual_steps,
    cluster.pain_description, cluster.current_tools_used,
  ].filter(Boolean).join(" ");

  const painScore = clamp((cluster.average_severity ?? 0) * 10);

  const frequencyText = (cluster.frequency ?? "").toLowerCase();
  const cadence = frequencyText.includes("multiple") || frequencyText.includes("hour") ? 100
    : frequencyText.includes("daily") ? 95
      : frequencyText.includes("weekly") ? 75
        : frequencyText.includes("monthly") ? 55
          : frequencyText.includes("quarter") ? 35
            : 45;
  const evidenceFrequency = clamp(35 + cluster.evidence_count * 9);
  const frequencyScore = clamp(cadence * 0.7 + evidenceFrequency * 0.3);

  let aiLeverage = 45;
  if (cluster.manual_steps) aiLeverage += 15;
  if (containsAny(text, ["manual", "repeated", "duplicate", "re-enter", "review", "triage"])) aiLeverage += 15;
  if (containsAny(text, ["multiple", "fragment", "portal", "phone", "email", "fax"])) aiLeverage += 10;
  if (containsAny(text, ["document", "message", "record", "verify", "match", "schedule"])) aiLeverage += 10;
  if (cadence >= 75) aiLeverage += 5;
  const aiLeverageScore = clamp(aiLeverage);

  let marketSize = 65;
  const businesses = cluster.number_of_businesses ?? 0;
  if (businesses >= 100_000) marketSize = 95;
  else if (businesses >= 50_000) marketSize = 90;
  else if (businesses >= 10_000) marketSize = 80;
  else if (businesses >= 2_000) marketSize = 70;
  else if (businesses > 0) marketSize = 55;
  else if (cluster.estimated_market_size && !containsAny(cluster.estimated_market_size, ["unknown", "research", "tbd"])) marketSize = 75;
  if ((cluster.customer_types ?? "").split(/\n|,/).filter(Boolean).length >= 3) marketSize += 5;
  const marketSizeScore = clamp(marketSize);

  let competitiveGap = 45;
  if (cluster.product_count >= 3) competitiveGap += 10;
  if (cluster.pain_description) competitiveGap += 10;
  if (cluster.business_impact) competitiveGap += 10;
  if (containsAny(text, ["fail", "difficult", "incomplete", "unreliable", "cumbersome", "does not", "do not", "without"])) competitiveGap += 15;
  if (cluster.source_count >= 3) competitiveGap += 5;
  const competitiveGapScore = clamp(competitiveGap);

  let distributionDifficulty = 65;
  const customers = (cluster.customer_types ?? "").toLowerCase();
  if (containsAny(customers, ["owner", "manager", "director", "administrator"])) distributionDifficulty -= 15;
  if (businesses >= 50_000) distributionDifficulty += 10;
  if (businesses > 0 && businesses < 10_000) distributionDifficulty -= 5;
  if (cluster.product_count >= 5) distributionDifficulty -= 5;
  distributionDifficulty = clamp(distributionDifficulty);

  const opportunityScore = clamp(
    painScore * 0.30 +
    frequencyScore * 0.20 +
    aiLeverageScore * 0.20 +
    marketSizeScore * 0.10 +
    competitiveGapScore * 0.15 +
    (100 - distributionDifficulty) * 0.05,
  );

  return {
    painScore, frequencyScore, aiLeverageScore, marketSizeScore,
    competitiveGapScore, distributionDifficulty, opportunityScore,
  };
}

function qualification(cluster: ClusterInput, scores: ClusterScores) {
  const checks = [
    { label: "Evidence Count", actual: cluster.evidence_count, required: 5 },
    { label: "Average Confidence", actual: cluster.average_confidence ?? 0, required: 8 },
    { label: "Average Severity", actual: cluster.average_severity ?? 0, required: 7 },
    { label: "Opportunity Score", actual: scores.opportunityScore, required: 80 },
  ];
  const failed = checks.filter((check) => check.actual < check.required);
  return {
    qualified: failed.length === 0,
    reason: failed.length === 0
      ? `Promoted automatically: ${cluster.evidence_count} evidence items, ${cluster.average_confidence?.toFixed(1)}/10 average confidence, ${cluster.average_severity?.toFixed(1)}/10 average severity, and ${scores.opportunityScore}/100 Opportunity Score met every qualification threshold.`
      : `Not promoted: ${failed.map((check) => `${check.label} ${Number(check.actual.toFixed(1))} (needs ${check.required}+)`).join("; ")}.`,
  };
}

function joinParts(...parts: (string | null | undefined)[]) {
  return parts.map((part) => part?.trim()).filter(Boolean).join("\n\n");
}

function getClusters() {
  return db.prepare(`
    SELECT ec.*, i.name AS industry_name, i.customer_types, i.estimated_market_size,
      i.number_of_businesses, i.core_business_objective,
      w.name AS workflow_name, w.frequency, w.current_tools_used, w.manual_steps, w.pain_description,
      COUNT(DISTINCT eci.evidence_id) AS evidence_count,
      AVG(e.severity) AS average_severity, AVG(e.confidence) AS average_confidence,
      COUNT(DISTINCT e.source_type) AS source_count,
      COUNT(DISTINCT p.id) AS product_count,
      group_concat(DISTINCT p.product_name) AS product_names
    FROM evidence_clusters ec
    JOIN industries i ON i.id = ec.industry_id
    LEFT JOIN workflows w ON w.id = ec.workflow_id
    LEFT JOIN evidence_cluster_items eci ON eci.cluster_id = ec.id
    LEFT JOIN evidence e ON e.id = eci.evidence_id
    LEFT JOIN products p ON p.industry_id = ec.industry_id
    WHERE i.name NOT LIKE '[Sample]%'
    GROUP BY ec.id
    ORDER BY ec.id
  `).all() as ClusterInput[];
}

function createOpportunity(cluster: ClusterInput, scores: ClusterScores, reason: string) {
  const alternatives = joinParts(
    cluster.current_tools_used ? `Current tools: ${cluster.current_tools_used}.` : null,
    cluster.product_names ? `Known software alternatives: ${cluster.product_names}.` : null,
  ) || "Current alternatives have not been documented.";
  const customer = joinParts(
    cluster.customer_types ? `${cluster.customer_types.replace(/\n+/g, ", ")} in ${cluster.industry_name}.` : `${cluster.industry_name} operators.`,
    cluster.workflow_name ? `The primary user owns or supports the ${cluster.workflow_name.toLowerCase()} workflow.` : null,
  );
  const willingness = scores.painScore >= 80 && scores.frequencyScore >= 85
    ? "$500–$1,500 per location per month, subject to customer interviews and ROI validation."
    : "$200–$750 per location per month, subject to customer interviews and ROI validation.";
  const aiOpportunity = `Use AI to interpret incoming workflow data, identify exceptions, recommend or execute the next action, and keep records synchronized while routing uncertain cases to staff. The leverage score is ${scores.aiLeverageScore}/100 because the workflow is ${cluster.frequency?.toLowerCase() ?? "recurring"} and includes repeatable judgment or administrative steps.`;
  const risks = joinParts(
    "Workflow and system integrations may be difficult or vendor-dependent.",
    "Automation errors could create operational, financial, or compliance risk without human review.",
    !cluster.estimated_market_size || containsAny(cluster.estimated_market_size, ["unknown", "research", "tbd"])
      ? "Market size is not yet documented and must be validated." : null,
    "Willingness to pay and a repeatable acquisition channel remain unproven.",
  );
  const moatIdeas = joinParts(
    `Build a proprietary dataset of ${cluster.workflow_name?.toLowerCase() ?? "workflow"} decisions, exceptions, and outcomes.`,
    "Create deep integrations and customer-specific workflow rules that improve with usage.",
    "Benchmark performance across customers and turn operational history into defensible recommendations.",
  );
  const openQuestions = joinParts(
    "Which user owns the budget and how is the problem measured today?",
    "Which integrations and data permissions are required for a usable first version?",
    "What error rate and human-review model will customers accept?",
    `Will customers pay ${willingness.split(",")[0].toLowerCase()} for a measurable improvement?`,
  );
  const insufficient = joinParts(
    cluster.pain_description,
    `The cluster remains supported by ${cluster.evidence_count} evidence items despite ${cluster.product_count || "documented"} existing products in the market.`,
  );

  const result = db.prepare(`
    INSERT INTO opportunities (
      industry_id, research_session_id, workflow_id, evidence_cluster_id, status, opportunity_name, problem_statement,
      user_persona, current_workaround, current_workflow, estimated_cost, existing_solutions,
      solutions_insufficient, estimated_willingness_to_pay, ai_opportunity, risks, moat_ideas,
      open_questions, confidence_score, promotion_reason, pain_score, frequency_score,
      ai_leverage_score, market_score, competitive_gap_score, distribution_difficulty,
      opportunity_score, generated_at, pain_severity, pain_frequency, ai_leverage,
      market_size_score, competition_gap, distribution_access, research_notes, review_status
    ) VALUES (
      ?, ?, ?, ?, 'Needs Interviews', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, 'Needs Review'
    )
  `).run(
    cluster.industry_id, cluster.research_session_id, cluster.workflow_id, cluster.id, cluster.cluster_name, cluster.problem_summary,
    customer, cluster.current_tools_used, cluster.manual_steps, cluster.business_impact, alternatives,
    insufficient, willingness, aiOpportunity, risks, moatIdeas, openQuestions,
    Math.round(cluster.average_confidence ?? 0), reason,
    scores.painScore, scores.frequencyScore, scores.aiLeverageScore, scores.marketSizeScore,
    scores.competitiveGapScore, scores.distributionDifficulty, scores.opportunityScore,
    Math.max(1, Math.round(scores.painScore / 10)),
    Math.max(1, Math.round(scores.frequencyScore / 10)),
    Math.max(1, Math.round(scores.aiLeverageScore / 10)),
    Math.max(1, Math.round(scores.marketSizeScore / 10)),
    Math.max(1, Math.round(scores.competitiveGapScore / 10)),
    Math.max(1, Math.round((100 - scores.distributionDifficulty) / 10)),
    `Generated from Evidence Pattern #${cluster.id}. Review generated assumptions before prototyping.`,
  );
  const opportunityId = Number(result.lastInsertRowid);
  db.prepare(`
    INSERT OR IGNORE INTO evidence_opportunities (evidence_id, opportunity_id)
    SELECT evidence_id, ? FROM evidence_cluster_items WHERE cluster_id = ?
  `).run(opportunityId, cluster.id);
  return opportunityId;
}

export function generateOpportunities() {
  const clusters = getClusters();
  const existing = new Set((db.prepare("SELECT evidence_cluster_id FROM opportunities WHERE evidence_cluster_id IS NOT NULL").all() as { evidence_cluster_id: number }[])
    .map((row) => row.evidence_cluster_id));
  const result = { scored: clusters.length, promoted: 0, alreadyPromoted: 0, leftAsEvidenceClusters: 0 };

  const run = db.transaction(() => {
    for (const cluster of clusters) {
      const scores = scoreCluster(cluster);
      const decision = qualification(cluster, scores);
      db.prepare(`
        UPDATE evidence_clusters SET pain_score = ?, frequency_score = ?, ai_leverage_score = ?,
          market_size_score = ?, competitive_gap_score = ?, distribution_difficulty = ?,
          opportunity_score = ?, qualification_reason = ?, scored_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        scores.painScore, scores.frequencyScore, scores.aiLeverageScore, scores.marketSizeScore,
        scores.competitiveGapScore, scores.distributionDifficulty, scores.opportunityScore,
        decision.reason, cluster.id,
      );
      if (existing.has(cluster.id)) {
        result.alreadyPromoted += 1;
      } else if (decision.qualified) {
        createOpportunity(cluster, scores, decision.reason);
        result.promoted += 1;
      } else {
        result.leftAsEvidenceClusters += 1;
      }
    }
  });
  run.immediate();
  return result;
}
