import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { failResearchLog, finishResearchLog, startResearchLog } from "@/lib/research-log";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Context) {
  const opportunityId = Number((await params).id);
  const opportunity = db.prepare(`
    SELECT o.*, i.name AS industry_name FROM opportunities o
    JOIN industries i ON i.id = o.industry_id WHERE o.id = ?
  `).get(opportunityId) as Record<string, string | number | null> | undefined;
  if (!opportunity) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  if (String(opportunity.industry_name).startsWith("[Sample]")) {
    return NextResponse.json({ error: "Product concepts are disabled for sample opportunities." }, { status: 400 });
  }

  const sessionId = startResearchLog(Number(opportunity.industry_id), "Product Concept Generation", `Started product concept generation for Opportunity #${opportunityId}.`);
  try {
    const persona = String(opportunity.user_persona || `${opportunity.industry_name} operators`);
    const problem = String(opportunity.problem_statement);
    const solution = String(opportunity.ai_opportunity || `Streamline the workflow behind: ${problem}`);
    const alternatives = String(opportunity.existing_solutions || "manual tools and general-purpose software");
    const moat = String(opportunity.moat_ideas || "Workflow data, integrations, and customer-specific operating rules.");
    const risk = String(opportunity.risks || "Customer adoption and integration complexity.");
    const baseName = String(opportunity.opportunity_name).replace(/^\[Sample\]\s*/, "");
    const concepts = [
      {
        name: `${baseName} Copilot`,
        pitch: `An AI copilot that helps ${persona.toLowerCase()} complete the highest-friction work faster and with fewer errors.`,
        solution: `${solution}\n\nKeep a human approval step for uncertain or high-impact decisions.`,
        differentiation: "Embedded workflow assistance with context-aware recommendations instead of another disconnected dashboard.",
        why: `It reduces the manual work that remains around ${alternatives} while preserving existing systems of record.`,
        features: "Unified work queue\nAI recommendations\nHuman approval controls\nException alerts\nOutcome reporting",
        pricing: "$499–$1,499 per location per month, validated against measurable time or revenue impact.",
        distribution: "Founder-led outreach to operators with the strongest pain, followed by partnerships with vertical consultants.",
        risk,
        scores: [8, 9, 8, 8, 7, 7, 7],
      },
      {
        name: `${baseName} Autopilot`,
        pitch: `A focused automation layer that executes repetitive steps for ${persona.toLowerCase()} and escalates exceptions.`,
        solution: `Automate the repeatable portions of the current workflow, using rules and AI classification to route edge cases to staff.`,
        differentiation: "Outcome-oriented automation with exception handling, audit history, and fast setup for one narrow workflow.",
        why: "Existing software records work; this concept actively completes it and measures the operational result.",
        features: "Trigger-based automation\nException inbox\nApproval rules\nAudit trail\nIntegration connectors",
        pricing: "Usage-based base plan from $750 per month plus volume tiers.",
        distribution: "Sell a fixed-scope workflow audit and convert successful audits into paid pilots.",
        risk: "Integration reliability and customer tolerance for automated actions.",
        scores: [6, 7, 9, 9, 7, 6, 7],
      },
      {
        name: `${baseName} Command Center`,
        pitch: `A shared command center that gives ${persona.toLowerCase()} one place to see, prioritize, and resolve workflow exceptions.`,
        solution: "Aggregate fragmented signals into a prioritized queue with ownership, deadlines, recommended actions, and operational analytics.",
        differentiation: "Cross-tool visibility and prioritized exception management designed around the vertical workflow.",
        why: `It layers over ${alternatives} and fixes fragmentation without requiring a full system replacement.`,
        features: "Cross-system inbox\nPriority scoring\nOwnership and SLA tracking\nTemplates\nPerformance dashboard",
        pricing: "$300–$900 per team per month with an implementation fee.",
        distribution: "Target teams already using multiple tools through vertical communities and integration marketplaces.",
        risk: "May be perceived as a dashboard rather than a must-have system.",
        scores: [9, 9, 7, 7, 7, 8, 8],
      },
      {
        name: `${baseName} Benchmark`,
        pitch: `A benchmarking and decision-support product that shows ${persona.toLowerCase()} where workflow performance is leaking time and money.`,
        solution: "Collect workflow outcomes, compare them against peer benchmarks, and recommend the highest-return operational changes.",
        differentiation: "Proprietary vertical benchmarks tied to specific operational decisions and financial outcomes.",
        why: "Existing tools report activity inside one product; this concept explains performance across the full workflow.",
        features: "Data import\nPeer benchmarks\nLeak detection\nROI recommendations\nExecutive reports",
        pricing: "$6,000–$18,000 annually based on locations and data volume.",
        distribution: "Lead with an anonymized benchmark report distributed through industry associations.",
        risk: "Requires sufficient normalized data before recommendations become defensible.",
        scores: [7, 6, 8, 8, 7, 8, 6],
      },
    ];
    const insert = db.prepare(`
      INSERT INTO product_concepts (
        opportunity_id, research_session_id, industry_id, concept_name, one_sentence_pitch, target_customer, proposed_solution,
        differentiation_summary, why_beats_existing_software, mvp_description, key_features,
        pricing_hypothesis, distribution_idea, main_risk, moat_ideas, review_status,
        ease_of_build, speed_to_validate, differentiation, monetization_potential,
        founder_fit, technical_risk, gtm_simplicity, research_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Needs Review', ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const create = db.transaction(() => {
      for (const concept of concepts) {
        insert.run(
          opportunityId, opportunity.research_session_id, opportunity.industry_id, concept.name, concept.pitch, persona, concept.solution,
          concept.differentiation, concept.why, `Validate the core workflow before expanding.\n\n${concept.features}`,
          concept.features, concept.pricing, concept.distribution, concept.risk, moat,
          ...concept.scores, "Locally generated from the linked opportunity. Review all assumptions.",
        );
      }
    });
    create.immediate();
    finishResearchLog(sessionId, {
      productConceptsCreated: concepts.length,
      log: [`Created ${concepts.length} product concepts.`, "All generated concepts were marked Needs Review."],
    });
    return NextResponse.json({ created: concepts.length });
  } catch (error) {
    failResearchLog(sessionId, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Concept generation failed." }, { status: 500 });
  }
}
