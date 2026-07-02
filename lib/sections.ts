export type FieldType = "text" | "textarea" | "number" | "url" | "date" | "select" | "relation" | "multi-relation";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  full?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  relation?: string;
};

export type SectionConfig = {
  slug: string;
  title: string;
  singular: string;
  table: string;
  fields: FieldConfig[];
  columns: string[];
};

const industry: FieldConfig = { key: "industry_id", label: "Industry", type: "relation", relation: "industries", required: true };
const researchSession: FieldConfig = { key: "research_session_id", label: "Research Session", type: "relation", relation: "research-sessions", required: true };
const score = (key: string, label: string): FieldConfig => ({ key, label, type: "number", min: 1, max: 10, required: true });
const reviewStatus: FieldConfig = { key: "review_status", label: "Review status", type: "select", required: true, options: ["Needs Review", "Approved", "Rejected"] };

const conceptScores = [
  ["ease_of_build", "Ease of build"],
  ["speed_to_validate", "Speed to validate"],
  ["differentiation", "Differentiation"],
  ["monetization_potential", "Monetization potential"],
  ["founder_fit", "Founder fit"],
  ["technical_risk", "Technical risk (10 = low risk)"],
  ["gtm_simplicity", "Go-to-market simplicity"],
].map(([key, label]) => score(key, label));

export const sourceTypes = ["Reddit", "Forum", "Comment", "Capterra", "G2", "App Store", "Google Play", "Interview", "Interview — Staff/User", "Interview — Owner/Buyer", "Revenue/Payment Data", "Support Ticket/Internal Data", "YouTube", "LinkedIn", "Website", "Other"];

export const sections: Record<string, SectionConfig> = {
  "research-sessions": {
    slug: "research-sessions", title: "Research Sessions", singular: "Research Session", table: "research_sessions",
    columns: ["name", "status", "research_stage"],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      industry,
      { key: "status", label: "Status", type: "select", required: true, options: ["Not Started", "Running", "Complete", "Failed"] },
      { key: "research_stage", label: "Research Stage", type: "text", required: true },
    ],
  },
  "industry-pipeline": {
    slug: "industry-pipeline", title: "Industry Pipeline", singular: "Pipeline Industry", table: "industry_pipeline",
    columns: ["name", "overall_score", "status", "research_stage", "priority", "updated_at", "notes"],
    fields: [
      { key: "name", label: "Industry", type: "text", required: true },
      { key: "overall_score", label: "Overall Score (/100)", type: "number", min: 0, max: 100 },
      { key: "status", label: "Status", type: "select", required: true, options: ["Backlog", "Researching", "Validated", "Rejected", "Building"] },
      { key: "research_stage", label: "Research Stage", type: "select", required: true, options: ["Scoring", "Software Audit", "Workflow Mapping", "Evidence Collection", "Opportunity Mapping", "Interviews", "MVP", "Complete"] },
      { key: "priority", label: "Priority", type: "select", required: true, options: ["High", "Medium", "Low"] },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  industries: {
    slug: "industries", title: "Industries", singular: "Industry", table: "industries",
    columns: ["name", "customer_types", "estimated_market_size", "number_of_businesses"],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "customer_types", label: "Customer types", type: "text" },
      { key: "core_business_objective", label: "Core business objective", type: "textarea", full: true },
      { key: "estimated_market_size", label: "Estimated market size", type: "text" },
      { key: "number_of_businesses", label: "Number of businesses", type: "number", min: 0 },
      { key: "existing_software_vendors", label: "Existing software vendors", type: "textarea", full: true },
      { key: "research_notes", label: "Research notes / AI output", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  workflows: {
    slug: "workflows", title: "Workflows", singular: "Workflow", table: "workflows",
    columns: ["name", "who_does_it", "frequency", "pain_description"],
    fields: [
      industry,
      { key: "name", label: "Name", type: "text", required: true },
      { key: "who_does_it", label: "Who does it", type: "text" },
      { key: "frequency", label: "Frequency", type: "text" },
      { key: "current_tools_used", label: "Current tools used", type: "textarea", full: true },
      { key: "manual_steps", label: "Manual steps", type: "textarea", full: true },
      { key: "pain_description", label: "Pain description", type: "textarea", full: true },
      { key: "research_notes", label: "Research notes / AI output", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  products: {
    slug: "products", title: "Software Products", singular: "Software Product", table: "products",
    columns: ["product_name", "industry_name", "pricing", "target_customer", "website"],
    fields: [
      industry,
      { key: "product_name", label: "Product name", type: "text", required: true },
      { key: "website", label: "Website", type: "url" },
      { key: "pricing", label: "Pricing", type: "text" },
      { key: "target_customer", label: "Target customer", type: "text" },
      { key: "strengths", label: "Strengths", type: "textarea", full: true },
      { key: "weaknesses", label: "Weaknesses", type: "textarea", full: true },
      { key: "review_sources", label: "Review sources", type: "textarea", full: true },
      { key: "research_notes", label: "Research notes / AI output", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  evidence: {
    slug: "evidence", title: "Evidence", singular: "Evidence", table: "evidence",
    columns: ["quote_snippet", "industry_name", "source_type", "evidence_quality_score", "severity", "review_status", "date_collected"],
    fields: [
      researchSession,
      industry,
      { key: "workflow_id", label: "Workflow (optional)", type: "relation", relation: "workflows" },
      { key: "product_id", label: "Software product (optional)", type: "relation", relation: "products" },
      { key: "source_type", label: "Source type", type: "select", options: sourceTypes, required: true },
      { key: "source_name", label: "Source name", type: "text", required: true },
      { key: "source_url", label: "Source URL", type: "url" },
      { key: "quote_snippet", label: "Quote / snippet", type: "textarea", required: true, full: true },
      { key: "evidence_summary", label: "Evidence summary", type: "textarea", full: true },
      { key: "pain_category", label: "Pain category", type: "text" },
      { key: "severity", label: "Severity", type: "number", min: 1, max: 10, required: true },
      { key: "confidence", label: "Confidence", type: "number", min: 1, max: 10, required: true },
      { key: "evidence_quality_score", label: "Evidence Quality Score", type: "number", min: 1, max: 10, required: true },
      { key: "date_collected", label: "Date collected", type: "date", required: true },
      { key: "pain_point_ids", label: "Linked pain points", type: "multi-relation", relation: "pain-points", full: true },
      { key: "opportunity_ids", label: "Linked opportunities", type: "multi-relation", relation: "opportunities", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
      reviewStatus,
    ],
  },
  "evidence-clusters": {
    slug: "evidence-clusters", title: "Evidence Patterns", singular: "Evidence Pattern", table: "evidence_clusters",
    columns: ["cluster_name", "industry_name", "evidence_count", "average_quality_score", "average_severity", "opportunity_score", "review_status", "opportunity_status"],
    fields: [
      { key: "cluster_name", label: "Cluster Name", type: "text", required: true },
      researchSession,
      industry,
      { key: "workflow_id", label: "Primary Workflow", type: "relation", relation: "workflows" },
      { key: "problem_summary", label: "Problem Summary", type: "textarea", required: true, full: true },
      { key: "business_impact", label: "Business Impact", type: "textarea", full: true },
      { key: "evidence_ids", label: "Linked Evidence", type: "multi-relation", relation: "evidence", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
      reviewStatus,
    ],
  },
  "pain-points": {
    slug: "pain-points", title: "Pain Points", singular: "Pain Point", table: "pain_points",
    columns: ["pain_summary", "industry_name", "workflow_name", "who_feels_pain", "cost_of_pain", "frequency"],
    fields: [
      industry,
      { key: "workflow_id", label: "Workflow", type: "relation", relation: "workflows" },
      { key: "pain_summary", label: "Pain summary", type: "textarea", required: true, full: true },
      { key: "who_feels_pain", label: "Who feels the pain", type: "text" },
      { key: "cost_of_pain", label: "Cost of pain", type: "text" },
      { key: "frequency", label: "Frequency", type: "text" },
      { key: "current_workaround", label: "Current workaround", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  opportunities: {
    slug: "opportunities", title: "Opportunities", singular: "Opportunity", table: "opportunities",
    columns: ["opportunity_name", "status", "opportunity_score", "confidence_score", "evidence_count"],
    fields: [
      { key: "evidence_cluster_id", label: "Originating Evidence Pattern", type: "relation", relation: "evidence-clusters", readOnly: true },
      { ...researchSession, readOnly: true, required: false },
      { ...industry, readOnly: true },
      { key: "workflow_id", label: "Workflow", type: "relation", relation: "workflows", readOnly: true },
      { key: "pain_point_id", label: "Related pain point", type: "relation", relation: "pain-points" },
      { key: "evidence_ids", label: "Supporting evidence from cluster", type: "multi-relation", relation: "evidence", full: true, readOnly: true },
      { key: "opportunity_name", label: "Opportunity name", type: "text", required: true },
      { key: "problem_statement", label: "Problem statement", type: "textarea", required: true, full: true },
      { key: "status", label: "Pipeline badge", type: "select", required: true, options: ["Needs Interviews", "Needs More Evidence", "Ready for Prototype", "Ready for Pilot", "Rejected"] },
      { key: "current_workflow", label: "Current workflow", type: "textarea", full: true },
      { key: "existing_solutions", label: "Current alternatives", type: "textarea", full: true },
      { key: "solutions_insufficient", label: "Why existing software fails", type: "textarea", full: true },
      { key: "user_persona", label: "Ideal customer", type: "textarea", full: true },
      { key: "estimated_willingness_to_pay", label: "Estimated willingness to pay", type: "text", full: true },
      { key: "ai_opportunity", label: "AI opportunity", type: "textarea", full: true },
      { key: "risks", label: "Risks", type: "textarea", full: true },
      { key: "moat_ideas", label: "Moat ideas", type: "textarea", full: true },
      { key: "open_questions", label: "Open questions", type: "textarea", full: true },
      score("confidence_score", "Confidence score"),
      { key: "pain_score", label: "Pain Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "frequency_score", label: "Frequency Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "ai_leverage_score", label: "AI Leverage Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "market_score", label: "Market Size Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "competitive_gap_score", label: "Competitive Gap Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "distribution_difficulty", label: "Distribution Difficulty", type: "number", min: 0, max: 100, readOnly: true },
      { key: "opportunity_score", label: "Overall Opportunity Score", type: "number", min: 0, max: 100, readOnly: true },
      { key: "promotion_reason", label: "Reason it was promoted", type: "textarea", full: true, readOnly: true },
      { key: "research_notes", label: "Research notes / AI output", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
      reviewStatus,
    ],
  },
  "product-concepts": {
    slug: "product-concepts", title: "Product Concepts", singular: "Product Concept", table: "product_concepts",
    columns: ["concept_name", "one_sentence_pitch", "total_score"],
    fields: [
      { key: "opportunity_id", label: "Opportunity", type: "relation", relation: "opportunities", required: true },
      { ...researchSession, readOnly: true, required: false },
      { ...industry, readOnly: true, required: false },
      { key: "concept_name", label: "Product concept name", type: "text", required: true },
      { key: "one_sentence_pitch", label: "One sentence pitch", type: "textarea", full: true },
      { key: "target_customer", label: "Target customer", type: "text" },
      { key: "proposed_solution", label: "Proposed solution", type: "textarea", full: true },
      { key: "differentiation_summary", label: "Differentiation", type: "textarea", full: true },
      { key: "why_beats_existing_software", label: "Why this beats existing software", type: "textarea", full: true },
      { key: "mvp_description", label: "MVP description", type: "textarea", full: true },
      { key: "key_features", label: "Key features", type: "textarea", full: true },
      { key: "pricing_hypothesis", label: "Pricing hypothesis", type: "text" },
      { key: "distribution_idea", label: "Distribution idea", type: "textarea", full: true },
      { key: "main_risk", label: "Main risk", type: "textarea", full: true },
      { key: "moat_ideas", label: "Moat ideas", type: "textarea", full: true },
      { key: "research_notes", label: "Research notes / AI output", type: "textarea", full: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
      reviewStatus,
      ...conceptScores,
    ],
  },
  "validation-packages": {
    slug: "validation-packages", title: "Validation Plans", singular: "Validation Plan", table: "validation_packages",
    columns: ["opportunity_name", "industry_name", "status", "review_status", "created_at"],
    fields: [
      { key: "opportunity_id", label: "Opportunity", type: "relation", relation: "opportunities", required: true },
      { ...researchSession, readOnly: true, required: false },
      { key: "interview_plan", label: "Interview plan", type: "textarea", full: true },
      { key: "interview_questions", label: "Interview questions", type: "textarea", full: true },
      { key: "target_interviewees", label: "Target interviewees", type: "textarea", full: true },
      { key: "outreach_message", label: "Outreach message", type: "textarea", full: true },
      { key: "landing_page_draft", label: "Landing page draft", type: "textarea", full: true },
      { key: "pricing_hypotheses", label: "Pricing hypotheses", type: "textarea", full: true },
      { key: "assumptions_to_test", label: "Assumptions to test", type: "textarea", full: true },
      { key: "mvp_scope", label: "MVP scope", type: "textarea", full: true },
      { key: "success_criteria", label: "Success criteria", type: "textarea", full: true },
      { key: "status", label: "Status", type: "select", required: true, options: ["Draft", "Running", "Complete"] },
      reviewStatus,
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  interviews: {
    slug: "interviews", title: "Interviews", singular: "Interview", table: "interviews",
    columns: ["interviewee_name", "industry_name", "opportunity_name", "role_title", "company", "date", "would_pay"],
    fields: [
      researchSession,
      industry,
      { key: "opportunity_id", label: "Opportunity (optional)", type: "relation", relation: "opportunities" },
      { key: "product_concept_id", label: "Product concept (optional)", type: "relation", relation: "product-concepts" },
      { key: "interviewee_name", label: "Interviewee name", type: "text", required: true },
      { key: "role_title", label: "Role / title", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "contact_method", label: "Source / contact method", type: "text" },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "transcript_notes", label: "Transcript / notes", type: "textarea", full: true },
      { key: "strongest_quote", label: "Strongest quote", type: "textarea", full: true },
      score("pain_severity", "Pain severity"),
      { key: "current_workaround", label: "Current workaround", type: "textarea", full: true },
      { key: "would_pay", label: "Would pay", type: "select", options: ["Yes", "No", "Maybe"], required: true },
      { key: "willingness_to_pay_estimate", label: "Willingness to pay estimate", type: "text" },
      { key: "follow_up_needed", label: "Follow-up needed", type: "select", options: ["Yes", "No"], required: true },
      { key: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },
  experiments: {
    slug: "experiments", title: "Experiments", singular: "Experiment", table: "experiments",
    columns: ["hypothesis", "concept_name", "validation_method", "status", "start_date", "next_step"],
    fields: [
      { key: "product_concept_id", label: "Product concept", type: "relation", relation: "product-concepts", required: true },
      { ...researchSession, readOnly: true, required: false },
      { ...industry, readOnly: true, required: false },
      { key: "hypothesis", label: "Hypothesis", type: "textarea", required: true, full: true },
      { key: "validation_method", label: "Validation method", type: "text" },
      { key: "target_users", label: "Target users", type: "text" },
      { key: "outreach_script", label: "Outreach script", type: "textarea", full: true },
      { key: "success_criteria", label: "Success criteria", type: "textarea", full: true },
      { key: "results", label: "Results", type: "textarea", full: true },
      { key: "status", label: "Status", type: "select", required: true, options: ["Not Started", "Running", "Validated", "Invalidated", "Paused"] },
      { key: "next_step", label: "Next step", type: "textarea", full: true },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "end_date", label: "End date", type: "date" },
    ],
  },
};

export const relationLabel: Record<string, string> = {
  industries: "name", workflows: "name", products: "product_name", evidence: "quote_snippet",
  "evidence-clusters": "cluster_name", "pain-points": "pain_summary", opportunities: "opportunity_name", "product-concepts": "concept_name",
  "validation-packages": "opportunity_name", "research-sessions": "name",
};

export const columnLabels: Record<string, string> = {
  name: "Industry", overall_score: "Overall Score (/100)", research_stage: "Research Stage", updated_at: "Last Updated",
  industry_name: "Industry", product_name: "Product", workflow_name: "Workflow", pain_point_name: "Pain point",
  opportunity_name: "Opportunity", concept_name: "Product concept", quote_snippet: "Evidence",
  total_score: "Score", confidence_score: "Confidence", evidence_count: "Evidence", interview_count: "Interviews",
  cluster_name: "Cluster Name", average_severity: "Average Severity", average_confidence: "Average Confidence",
  average_quality_score: "Avg. Evidence Quality", evidence_quality_score: "Quality",
  business_impact: "Business Impact", opportunity_status: "Opportunity Status", originating_cluster_name: "Originating Cluster",
  opportunity_score: "Opportunity Score",
};

export function labelFor(key: string, section: SectionConfig) {
  return columnLabels[key] ?? section.fields.find((field) => field.key === key)?.label ?? key.replaceAll("_", " ");
}
