import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sourceTypes } from "@/lib/sections";
import { failResearchLog, finishResearchLog, qualityScoreForSource, startResearchLog } from "@/lib/research-log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let sessionId: number | null = null;
  try {
    const body = await request.json() as Record<string, unknown>;
    const researchSessionId = Number(body.research_session_id);
    const industryId = Number(body.industry_id);
    const workflowId = body.workflow_id ? Number(body.workflow_id) : null;
    const productId = body.product_id ? Number(body.product_id) : null;
    const sourceType = String(body.source_type ?? "");
    const lines = String(body.snippets ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!researchSessionId || !industryId || !sourceTypes.includes(sourceType) || !lines.length) throw new Error("Research Session, industry, source type, and at least one snippet are required.");
    const session = db.prepare("SELECT industry_id, status FROM research_sessions WHERE id = ?").get(researchSessionId) as { industry_id: number; status: string } | undefined;
    if (!session || session.industry_id !== industryId) throw new Error("Research Session and industry must match.");
    const industry = db.prepare("SELECT name FROM industries WHERE id = ?").get(industryId) as { name: string } | undefined;
    if (!industry) throw new Error("Industry not found.");
    if (industry.name.startsWith("[Sample]")) throw new Error("Sample records are excluded from import actions.");
    sessionId = startResearchLog(industryId, "Evidence Import", `Started bulk evidence import from ${sourceType}.`);
    const insert = db.prepare(`
      INSERT INTO evidence (research_session_id, industry_id, workflow_id, product_id, source_type, source_name, quote_snippet, severity, confidence, evidence_quality_score, date_collected)
      VALUES (?, ?, ?, ?, ?, ?, ?, 5, 5, ?, date('now'))
    `);
    const add = db.transaction(() => {
      for (const line of lines) insert.run(researchSessionId, industryId, workflowId, productId, sourceType, `Bulk paste — ${sourceType}`, line, qualityScoreForSource(sourceType));
    });
    add();
    finishResearchLog(sessionId, {
      evidenceCreated: lines.length,
      sourcesSearched: [sourceType],
      log: [`Imported ${lines.length} evidence records.`, `Default quality score: ${qualityScoreForSource(sourceType)}/10.`],
    });
    return NextResponse.json({ created: lines.length }, { status: 201 });
  } catch (error) {
    if (sessionId) failResearchLog(sessionId, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bulk import failed." }, { status: 400 });
  }
}
