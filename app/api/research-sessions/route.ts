import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emptyChecklist, researchStatuses } from "@/lib/research-sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = db.prepare(`
    SELECT rs.*, i.name AS industry_name
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id
    ORDER BY CASE rs.status WHEN 'Running' THEN 0 WHEN 'Failed' THEN 1 WHEN 'Not Started' THEN 2 ELSE 3 END,
      date(rs.started_date) DESC, rs.id DESC
  `).all();
  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const pipelineId = Number(body.pipeline_id);
    if (pipelineId) {
      const createFromPipeline = db.transaction(() => {
        const pipeline = db.prepare("SELECT * FROM industry_pipeline WHERE id = ?").get(pipelineId) as { id: number; name: string } | undefined;
        if (!pipeline) throw new Error("Pipeline industry was not found.");
        let industry = db.prepare("SELECT id FROM industries WHERE lower(name) = lower(?) LIMIT 1").get(pipeline.name) as { id: number } | undefined;
        if (!industry) {
          const result = db.prepare("INSERT INTO industries (name, notes) VALUES (?, ?)").run(pipeline.name, "Created automatically when research started from Industry Pipeline.");
          industry = { id: Number(result.lastInsertRowid) };
        }
        const now = new Date().toISOString();
        const result = db.prepare(`
          INSERT INTO research_sessions (
            industry_id, name, started_date, started_at, status, research_stage,
            checklist_json, notes, action_type, full_run_log
          ) VALUES (?, ?, date(?), ?, 'Running', 'Scoring', ?, '', 'Industry Research', ?)
        `).run(
          industry.id,
          `${pipeline.name} — Research ${now.slice(0, 10)}`,
          now,
          now,
          JSON.stringify(emptyChecklist()),
          `[${now}] Research session started`,
        );
        db.prepare(`
          UPDATE industry_pipeline SET status = 'Researching', research_stage = 'Scoring', updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(pipelineId);
        return Number(result.lastInsertRowid);
      });
      return NextResponse.json({ id: createFromPipeline() }, { status: 201 });
    }
    const industryId = Number(body.industry_id);
    const startedDate = String(body.started_date ?? "").trim();
    const status = String(body.status ?? "Not Started");
    const notes = String(body.notes ?? "").trim();
    if (!Number.isInteger(industryId) || industryId < 1) throw new Error("Industry is required.");
    if (!startedDate) throw new Error("Started date is required.");
    if (!researchStatuses.includes(status as (typeof researchStatuses)[number])) throw new Error("Invalid status.");
    const result = db.prepare(`
      INSERT INTO research_sessions (industry_id, name, started_date, started_at, status, research_stage, checklist_json, notes, action_type, full_run_log)
      SELECT ?, name || ' — Research ' || ?, ?, ?, ?, 'Scoring', ?, ?, 'Manual Research', ?
      FROM industries WHERE id = ?
    `).run(industryId, startedDate, startedDate, `${startedDate}T00:00:00Z`, status, JSON.stringify(emptyChecklist()), notes, `[${new Date().toISOString()}] Research session started`, industryId);
    return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create session." }, { status: 400 });
  }
}
