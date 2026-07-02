import { NextResponse } from "next/server";
import { generateOpportunities } from "@/lib/opportunity-generation";
import { db } from "@/lib/db";
import { failResearchLog, finishResearchLog, startResearchLog } from "@/lib/research-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const industries = db.prepare(`
    SELECT DISTINCT i.id FROM industries i
    JOIN evidence_clusters ec ON ec.industry_id = i.id
    WHERE i.name NOT LIKE '[Sample]%'
  `).all() as { id: number }[];
  const sessions = industries.map(({ id }) => ({ industryId: id, sessionId: startResearchLog(id, "Opportunity Generation", "Started evidence-cluster scoring and opportunity generation.") }));
  try {
    const result = generateOpportunities();
    for (const session of sessions) {
      const sources = db.prepare(`
        SELECT DISTINCT e.source_name FROM evidence e WHERE e.industry_id = ? ORDER BY e.source_name
      `).all(session.industryId) as { source_name: string }[];
      finishResearchLog(session.sessionId, {
        opportunitiesPromoted: result.promoted,
        sourcesSearched: sources.map((source) => source.source_name),
        log: [`Scored ${result.scored} clusters.`, `Promoted ${result.promoted} opportunities.`, `${result.leftAsEvidenceClusters} clusters require more evidence.`],
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    for (const session of sessions) failResearchLog(session.sessionId, error);
    const message = error instanceof Error ? error.message : "Opportunity generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
