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
    return NextResponse.json({ error: "Validation generation is disabled for sample opportunities." }, { status: 400 });
  }
  const existing = db.prepare("SELECT id FROM validation_packages WHERE opportunity_id = ?").get(opportunityId) as { id: number } | undefined;
  if (existing) return NextResponse.json({ id: existing.id, existing: true });

  const sessionId = startResearchLog(Number(opportunity.industry_id), "Validation Package Generation", `Started validation package generation for Opportunity #${opportunityId}.`);
  try {
    const customer = String(opportunity.user_persona || `${opportunity.industry_name} operators`);
    const problem = String(opportunity.problem_statement);
    const pricing = String(opportunity.estimated_willingness_to_pay || "$250–$1,500 per month");
    const result = db.prepare(`
      INSERT INTO validation_packages (
        opportunity_id, research_session_id, interview_plan, interview_questions, target_interviewees,
        outreach_message, landing_page_draft, pricing_hypotheses, assumptions_to_test,
        mvp_scope, success_criteria, status, review_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 'Needs Review')
    `).run(
      opportunityId,
      opportunity.research_session_id,
      "Run 10–15 problem interviews over two weeks. Start with recent examples, quantify frequency and impact, test budget ownership only after confirming the problem, and record disconfirming evidence.",
      `1. Walk me through the last time this problem happened.\n2. How often does it happen?\n3. Who is involved and what tools do they use?\n4. What breaks or gets delayed?\n5. What does the problem cost in time, revenue, risk, or customer experience?\n6. What have you tried already?\n7. Who owns the budget to solve this?\n8. What would a credible solution need to do?\n9. What would stop you from adopting it?\n10. Would you commit to a paid pilot if those conditions were met?`,
      `${customer}\nInterview workflow users, their managers, and the economic buyer. Prioritize teams that experienced the problem in the last 30 days.`,
      `Hi — I’m researching how ${String(opportunity.industry_name).toLowerCase()} teams handle this workflow. I’m not selling anything. Could I ask you about a recent example of ${problem.toLowerCase()}? The conversation takes 25 minutes, and I’ll share the findings afterward.`,
      `${opportunity.opportunity_name}\n\nStop losing time and money to ${problem.toLowerCase()}.\n\nA focused workflow product for ${customer.toLowerCase()} that reduces manual work, catches exceptions, and makes outcomes measurable.\n\nJoin the pilot waitlist.`,
      `Test ${pricing} as the expected range.\nCompare a lower self-serve tier, a fixed monthly team plan, and a paid pilot with implementation.\nAnchor pricing to quantified savings rather than feature count.`,
      "The problem is frequent and urgent.\nThe current workaround is materially inadequate.\nA specific buyer owns budget.\nThe product can access the required data.\nUsers will trust recommendations or automation.\nThe proposed price is below the measurable value created.",
      "One narrow end-to-end workflow; required data intake; prioritized work queue; recommendation or automation step; human review; audit history; basic outcome reporting. Exclude broad platform features and optional integrations.",
      "At least 10 completed interviews; 7 confirm the problem; 5 quantify meaningful cost; 3 agree to a concrete follow-up; 2 accept the pricing range; and at least 1 signs a paid pilot or equivalent commitment.",
    );
    const id = Number(result.lastInsertRowid);
    finishResearchLog(sessionId, { log: ["Created a draft validation package.", "The package was marked Needs Review."] });
    return NextResponse.json({ id });
  } catch (error) {
    failResearchLog(sessionId, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Validation package generation failed." }, { status: 500 });
  }
}
