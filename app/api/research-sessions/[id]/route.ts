import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emptyChecklist, researchChecklist, researchStatuses } from "@/lib/research-sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Context) {
  const id = Number((await params).id);
  const session = db.prepare(`
    SELECT rs.*, i.name AS industry_name
    FROM research_sessions rs JOIN industries i ON i.id = rs.industry_id
    WHERE rs.id = ?
  `).get(id);
  if (!session) return NextResponse.json({ error: "Research session not found." }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const id = Number((await params).id);
    const body = await request.json() as Record<string, unknown>;
    const current = db.prepare("SELECT * FROM research_sessions WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!current) return NextResponse.json({ error: "Research session not found." }, { status: 404 });

    const industryId = Number(body.industry_id ?? current.industry_id);
    const startedDate = String(body.started_date ?? current.started_date).trim();
    const status = String(body.status ?? current.status);
    const notes = String(body.notes ?? current.notes ?? "").trim();
    if (!Number.isInteger(industryId) || industryId < 1) throw new Error("Industry is required.");
    if (!startedDate) throw new Error("Started date is required.");
    if (!researchStatuses.includes(status as (typeof researchStatuses)[number])) throw new Error("Invalid status.");

    let checklistJson = String(current.checklist_json);
    if (body.checklist && typeof body.checklist === "object") {
      const submitted = body.checklist as Record<string, unknown>;
      const checklist = emptyChecklist();
      for (const item of researchChecklist) checklist[item.key] = submitted[item.key] === true;
      checklistJson = JSON.stringify(checklist);
    }

    db.prepare(`
      UPDATE research_sessions
      SET industry_id = ?, started_date = ?, status = ?, checklist_json = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(industryId, startedDate, status, checklistJson, notes, id);
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update session." }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const id = Number((await params).id);
  const result = db.prepare("DELETE FROM research_sessions WHERE id = ?").run(id);
  if (!result.changes) return NextResponse.json({ error: "Research session not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
