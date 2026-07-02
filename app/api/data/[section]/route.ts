import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sections } from "@/lib/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ section: string }> };
type Scalar = string | number | null;

const selectQueries: Record<string, string> = {
  "research-sessions": `SELECT rs.*, i.name AS industry_name
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id`,
  "industry-pipeline": `SELECT ip.*,
    (SELECT id FROM industries i WHERE lower(i.name) = lower(ip.name) OR lower(replace(i.name, '[Sample] ', '')) = lower(ip.name) LIMIT 1) AS industry_record_id
    FROM industry_pipeline ip`,
  industries: "SELECT i.* FROM industries i",
  workflows: "SELECT w.*, i.name AS industry_name FROM workflows w JOIN industries i ON i.id = w.industry_id",
  products: "SELECT p.*, i.name AS industry_name FROM products p JOIN industries i ON i.id = p.industry_id",
  evidence: `SELECT e.*, i.name AS industry_name, w.name AS workflow_name, p.product_name,
    CASE WHEN i.name LIKE '[Sample]%' THEN 1 ELSE 0 END AS is_sample,
    eci.cluster_id, ec.cluster_name,
    COALESCE((SELECT group_concat(pain_point_id) FROM evidence_pain_points WHERE evidence_id = e.id), '') AS pain_point_ids,
    COALESCE((SELECT group_concat(opportunity_id) FROM evidence_opportunities WHERE evidence_id = e.id), '') AS opportunity_ids
    FROM evidence e JOIN industries i ON i.id = e.industry_id
    LEFT JOIN workflows w ON w.id = e.workflow_id LEFT JOIN products p ON p.id = e.product_id
    LEFT JOIN evidence_cluster_items eci ON eci.evidence_id = e.id
    LEFT JOIN evidence_clusters ec ON ec.id = eci.cluster_id`,
  "evidence-clusters": `SELECT ec.*, i.name AS industry_name, w.name AS workflow_name,
    COUNT(eci.evidence_id) AS evidence_count,
    ROUND(AVG(e.severity), 1) AS average_severity,
    ROUND(AVG(e.confidence), 1) AS average_confidence,
    ROUND(AVG(e.evidence_quality_score), 1) AS average_quality_score,
    COALESCE(group_concat(eci.evidence_id), '') AS evidence_ids,
    o.id AS opportunity_id,
    COALESCE(o.status, 'None') AS opportunity_status
    FROM evidence_clusters ec
    JOIN industries i ON i.id = ec.industry_id
    LEFT JOIN workflows w ON w.id = ec.workflow_id
    LEFT JOIN evidence_cluster_items eci ON eci.cluster_id = ec.id
    LEFT JOIN evidence e ON e.id = eci.evidence_id
    LEFT JOIN opportunities o ON o.evidence_cluster_id = ec.id
    GROUP BY ec.id`,
  "pain-points": `SELECT pp.*, i.name AS industry_name, w.name AS workflow_name
    FROM pain_points pp JOIN industries i ON i.id = pp.industry_id LEFT JOIN workflows w ON w.id = pp.workflow_id`,
  opportunities: `SELECT o.*, i.name AS industry_name, w.name AS workflow_name, pp.pain_summary AS pain_point_name,
    ec.cluster_name AS originating_cluster_name,
    (SELECT COUNT(*) FROM evidence_opportunities eo WHERE eo.opportunity_id = o.id) AS evidence_count,
    (SELECT COUNT(*) FROM interviews iv WHERE iv.opportunity_id = o.id) AS interview_count,
    (SELECT ROUND(AVG(e.evidence_quality_score), 1) FROM evidence e
      JOIN evidence_opportunities eo ON eo.evidence_id = e.id WHERE eo.opportunity_id = o.id) AS average_quality_score,
    CASE WHEN i.name LIKE '[Sample]%' THEN 1 ELSE 0 END AS is_sample,
    COALESCE((SELECT group_concat(evidence_id) FROM evidence_opportunities WHERE opportunity_id = o.id), '') AS evidence_ids
    FROM opportunities o JOIN industries i ON i.id = o.industry_id
    LEFT JOIN workflows w ON w.id = o.workflow_id LEFT JOIN pain_points pp ON pp.id = o.pain_point_id
    LEFT JOIN evidence_clusters ec ON ec.id = o.evidence_cluster_id`,
  "product-concepts": `SELECT pc.*, o.opportunity_name, i.name AS industry_name
    FROM product_concepts pc JOIN opportunities o ON o.id = pc.opportunity_id JOIN industries i ON i.id = o.industry_id`,
  "validation-packages": `SELECT vp.*, o.opportunity_name, o.industry_id, i.name AS industry_name
    FROM validation_packages vp JOIN opportunities o ON o.id = vp.opportunity_id
    JOIN industries i ON i.id = o.industry_id`,
  interviews: `SELECT iv.*, i.name AS industry_name, o.opportunity_name, pc.concept_name
    FROM interviews iv JOIN industries i ON i.id = iv.industry_id
    LEFT JOIN opportunities o ON o.id = iv.opportunity_id LEFT JOIN product_concepts pc ON pc.id = iv.product_concept_id`,
  experiments: `SELECT ex.*, pc.concept_name, o.opportunity_name, i.name AS industry_name
    FROM experiments ex JOIN product_concepts pc ON pc.id = ex.product_concept_id
    JOIN opportunities o ON o.id = pc.opportunity_id JOIN industries i ON i.id = o.industry_id`,
};

function applyParentLinks(sectionKey: string, values: Record<string, Scalar>) {
  if (["evidence", "evidence-clusters", "interviews"].includes(sectionKey) && values.research_session_id) {
    const session = db.prepare("SELECT industry_id FROM research_sessions WHERE id = ?").get(values.research_session_id) as { industry_id: number } | undefined;
    if (!session) throw new Error("Research Session was not found.");
    if (values.industry_id && Number(values.industry_id) !== session.industry_id) throw new Error("Industry must match the selected Research Session.");
    values.industry_id = session.industry_id;
  }
  if (sectionKey === "product-concepts" || sectionKey === "validation-packages") {
    const opportunity = db.prepare("SELECT industry_id, research_session_id FROM opportunities WHERE id = ?").get(values.opportunity_id) as
      { industry_id: number; research_session_id: number | null } | undefined;
    if (!opportunity) throw new Error("Opportunity was not found.");
    if (!opportunity.research_session_id) throw new Error("The selected Opportunity must belong to a Research Session.");
    values.research_session_id = opportunity.research_session_id;
    if (sectionKey === "product-concepts") values.industry_id = opportunity.industry_id;
  }
  if (sectionKey === "experiments") {
    const concept = db.prepare("SELECT industry_id, research_session_id FROM product_concepts WHERE id = ?").get(values.product_concept_id) as
      { industry_id: number | null; research_session_id: number | null } | undefined;
    if (!concept) throw new Error("Product Concept was not found.");
    if (!concept.research_session_id || !concept.industry_id) throw new Error("The selected Product Concept must belong to a Research Session and Industry.");
    values.research_session_id = concept.research_session_id;
    values.industry_id = concept.industry_id;
  }
  if (sectionKey === "interviews" && values.opportunity_id) {
    const opportunity = db.prepare("SELECT industry_id, research_session_id FROM opportunities WHERE id = ?").get(values.opportunity_id) as
      { industry_id: number; research_session_id: number | null } | undefined;
    if (!opportunity?.research_session_id) throw new Error("The selected Opportunity must belong to a Research Session.");
    values.industry_id = opportunity.industry_id;
    values.research_session_id = opportunity.research_session_id;
  }
  if (sectionKey === "interviews" && !values.opportunity_id && values.product_concept_id) {
    const concept = db.prepare("SELECT industry_id, research_session_id, opportunity_id FROM product_concepts WHERE id = ?").get(values.product_concept_id) as
      { industry_id: number | null; research_session_id: number | null; opportunity_id: number } | undefined;
    if (!concept?.research_session_id || !concept.industry_id) throw new Error("The selected Product Concept must belong to a Research Session.");
    values.industry_id = concept.industry_id;
    values.research_session_id = concept.research_session_id;
    values.opportunity_id = concept.opportunity_id;
  }
}

function cleanPayload(sectionKey: string, body: Record<string, unknown>) {
  const section = sections[sectionKey];
  const values: Record<string, Scalar> = {};
  const multi: Record<string, number[]> = {};
  for (const field of section.fields) {
    let value = body[field.key];
    if (field.type === "multi-relation") {
      const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
      multi[field.key] = list.map(Number).filter((id) => Number.isInteger(id) && id > 0);
      continue;
    }
    if (field.type === "number") {
      const numericValue = value === "" || value === null || value === undefined ? null : Number(value);
      if (numericValue !== null && (!Number.isFinite(numericValue) || (field.min !== undefined && numericValue < field.min) || (field.max !== undefined && numericValue > field.max))) {
        throw new Error(`${field.label} must be between ${field.min ?? 0} and ${field.max ?? "the allowed maximum"}.`);
      }
      value = numericValue;
    } else if (field.type === "relation") {
      value = value ? Number(value) : null;
    } else {
      value = typeof value === "string" ? value.trim() : "";
    }
    if (field.required && (value === "" || value === null || value === undefined)) throw new Error(`${field.label} is required.`);
    values[field.key] = value as Scalar;
  }
  return { values, multi };
}

function syncLinks(sectionKey: string, id: number, multi: Record<string, number[]>) {
  if (sectionKey === "evidence") {
    db.prepare("DELETE FROM evidence_pain_points WHERE evidence_id = ?").run(id);
    db.prepare("DELETE FROM evidence_opportunities WHERE evidence_id = ?").run(id);
    const pain = db.prepare("INSERT INTO evidence_pain_points (evidence_id, pain_point_id) VALUES (?, ?)");
    const opportunity = db.prepare("INSERT INTO evidence_opportunities (evidence_id, opportunity_id) VALUES (?, ?)");
    for (const painId of multi.pain_point_ids ?? []) pain.run(id, painId);
    for (const opportunityId of multi.opportunity_ids ?? []) opportunity.run(id, opportunityId);
  }
  if (sectionKey === "opportunities") {
    db.prepare("DELETE FROM evidence_opportunities WHERE opportunity_id = ?").run(id);
    const evidence = db.prepare("INSERT INTO evidence_opportunities (evidence_id, opportunity_id) VALUES (?, ?)");
    for (const evidenceId of multi.evidence_ids ?? []) evidence.run(evidenceId, id);
  }
  if (sectionKey === "evidence-clusters") {
    db.prepare("DELETE FROM evidence_cluster_items WHERE cluster_id = ?").run(id);
    const evidence = db.prepare("INSERT INTO evidence_cluster_items (cluster_id, evidence_id) VALUES (?, ?)");
    for (const evidenceId of multi.evidence_ids ?? []) evidence.run(id, evidenceId);
    const opportunity = db.prepare("SELECT id FROM opportunities WHERE evidence_cluster_id = ?").get(id) as { id: number } | undefined;
    if (opportunity) {
      db.prepare("DELETE FROM evidence_opportunities WHERE opportunity_id = ?").run(opportunity.id);
      const support = db.prepare("INSERT INTO evidence_opportunities (evidence_id, opportunity_id) VALUES (?, ?)");
      for (const evidenceId of multi.evidence_ids ?? []) support.run(evidenceId, opportunity.id);
    }
  }
}

function errorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes("UNIQUE constraint failed: evidence_cluster_items.evidence_id")) {
    return "One or more selected evidence records already belong to another pattern.";
  }
  if (message.includes("UNIQUE constraint failed: opportunities.evidence_cluster_id")) {
    return "This Evidence Pattern already has an Opportunity.";
  }
  return message;
}

export async function GET(request: NextRequest, { params }: Context) {
  const { section: sectionKey } = await params;
  const section = sections[sectionKey];
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 404 });

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const industryId = request.nextUrl.searchParams.get("industryId");
  const minScore = request.nextUrl.searchParams.get("minScore");
  const sourceType = request.nextUrl.searchParams.get("sourceType");
  const minSeverity = request.nextUrl.searchParams.get("minSeverity");
  const status = request.nextUrl.searchParams.get("status");
  const stage = request.nextUrl.searchParams.get("stage");
  const priority = request.nextUrl.searchParams.get("priority");
  const scoreSort = request.nextUrl.searchParams.get("scoreSort");
  const scored = sectionKey === "opportunities" || sectionKey === "product-concepts";
  const order = sectionKey === "industry-pipeline" && ["asc", "desc"].includes(scoreSort ?? "")
    ? `overall_score IS NULL, overall_score ${scoreSort === "asc" ? "ASC" : "DESC"}, updated_at DESC`
    : sectionKey === "evidence-clusters"
      ? "evidence_count DESC, average_severity DESC, created_at DESC"
      : sectionKey === "opportunities"
        ? "COALESCE(opportunity_score, 0) DESC, created_at DESC"
        : scored ? "total_score DESC, created_at DESC" : "created_at DESC";
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (search) {
    const searchable = [...new Set(section.columns.filter((key) => !["total_score", "evidence_count", "interview_count"].includes(key)))];
    clauses.push(`(${searchable.map((key) => `CAST("${key}" AS TEXT) LIKE ?`).join(" OR ")})`);
    values.push(...searchable.map(() => `%${search}%`));
  }
  if (industryId && sectionKey !== "industries") {
    clauses.push("industry_id = ?");
    values.push(Number(industryId));
  }
  if (minScore && scored) {
    clauses.push(sectionKey === "opportunities" ? "COALESCE(opportunity_score, 0) >= ?" : "total_score >= ?");
    values.push(Number(minScore));
  }
  if (sourceType && sectionKey === "evidence") {
    clauses.push("source_type = ?");
    values.push(sourceType);
  }
  if (minSeverity && sectionKey === "evidence") {
    clauses.push("severity >= ?");
    values.push(Number(minSeverity));
  }
  if (status && sectionKey === "industry-pipeline") {
    clauses.push("status = ?");
    values.push(status);
  }
  if (stage && sectionKey === "industry-pipeline") {
    clauses.push("research_stage = ?");
    values.push(stage);
  }
  if (priority && sectionKey === "industry-pipeline") {
    clauses.push("priority = ?");
    values.push(priority);
  }

  const sql = `SELECT * FROM (${selectQueries[sectionKey]}) data ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY ${order}`;
  return NextResponse.json({ items: db.prepare(sql).all(...values) });
}

export async function POST(request: NextRequest, { params }: Context) {
  const { section: sectionKey } = await params;
  const section = sections[sectionKey];
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  try {
    const { values, multi } = cleanPayload(sectionKey, await request.json());
    const create = db.transaction(() => {
      if (sectionKey === "opportunities") {
        const clusterId = Number(values.evidence_cluster_id);
        if (!clusterId) throw new Error("Opportunities must be created from an Evidence Pattern.");
        const cluster = db.prepare("SELECT industry_id, workflow_id FROM evidence_clusters WHERE id = ?").get(clusterId) as { industry_id: number; workflow_id: number | null } | undefined;
        if (!cluster) throw new Error("The originating Evidence Pattern was not found.");
        values.industry_id = cluster.industry_id;
        values.workflow_id = cluster.workflow_id;
        values.research_session_id = (db.prepare("SELECT research_session_id FROM evidence_clusters WHERE id = ?").get(clusterId) as { research_session_id: number | null }).research_session_id;
        if (!values.research_session_id) throw new Error("The originating Evidence Pattern must belong to a Research Session.");
        multi.evidence_ids = (db.prepare("SELECT evidence_id FROM evidence_cluster_items WHERE cluster_id = ?").all(clusterId) as { evidence_id: number }[])
          .map((item) => item.evidence_id);
      }
      applyParentLinks(sectionKey, values);
      const keys = Object.keys(values);
      const result = db.prepare(`INSERT INTO ${section.table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`).run(...Object.values(values));
      const id = Number(result.lastInsertRowid);
      syncLinks(sectionKey, id, multi);
      return id;
    });
    return NextResponse.json({ id: create() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error, "Could not create item.") }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { section: sectionKey } = await params;
  const section = sections[sectionKey];
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    if (!id) throw new Error("A valid item ID is required.");
    const { values, multi } = cleanPayload(sectionKey, body);
    const update = db.transaction(() => {
      if (sectionKey === "opportunities") {
        const existing = db.prepare("SELECT evidence_cluster_id FROM opportunities WHERE id = ?").get(id) as { evidence_cluster_id: number | null } | undefined;
        if (!existing) throw new Error("Item not found.");
        values.evidence_cluster_id = existing.evidence_cluster_id;
        if (existing.evidence_cluster_id) {
          const cluster = db.prepare("SELECT industry_id, workflow_id FROM evidence_clusters WHERE id = ?").get(existing.evidence_cluster_id) as { industry_id: number; workflow_id: number | null };
          values.industry_id = cluster.industry_id;
          values.workflow_id = cluster.workflow_id;
          values.research_session_id = (db.prepare("SELECT research_session_id FROM evidence_clusters WHERE id = ?").get(existing.evidence_cluster_id) as { research_session_id: number | null }).research_session_id;
          multi.evidence_ids = (db.prepare("SELECT evidence_id FROM evidence_cluster_items WHERE cluster_id = ?").all(existing.evidence_cluster_id) as { evidence_id: number }[])
            .map((item) => item.evidence_id);
        }
      }
      applyParentLinks(sectionKey, values);
      const keys = Object.keys(values);
      const result = db.prepare(`UPDATE ${section.table} SET ${keys.map((key) => `${key} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(...Object.values(values), id);
      if (!result.changes) throw new Error("Item not found.");
      syncLinks(sectionKey, id, multi);
    });
    update();
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error, "Could not update item.") }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { section: sectionKey } = await params;
  const section = sections[sectionKey];
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "A valid item ID is required." }, { status: 400 });
  const result = db.prepare(`DELETE FROM ${section.table} WHERE id = ?`).run(id);
  if (!result.changes) return NextResponse.json({ error: "Item not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
