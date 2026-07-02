export type WorkflowFacts = {
  sessionId?: number | null;
  industryId?: number | null;
  opportunityId?: number | null;
  evidenceCount: number;
  clusterCount: number;
  opportunityCount: number;
  validationCount: number;
  interviewCount: number;
  pricingValidated?: boolean;
  conceptCount: number;
  approvedConceptCount?: number;
  experimentCount: number;
  activeExperimentCount?: number;
  successfulExperimentCount?: number;
  opportunityStatus?: string | null;
  building?: boolean;
};

export type WorkflowStage = {
  key: string;
  label: string;
  complete: boolean;
  href: string;
  detail?: string;
};

export type RecommendedAction = {
  label: string;
  description: string;
  href: string;
};

const validatedStatuses = new Set(["Validated", "Ready for Prototype", "Ready for Pilot", "Building", "Completed"]);

function sectionHref(section: string, facts: WorkflowFacts, create = false) {
  const params = new URLSearchParams();
  if (create) params.set("new", "1");
  if (facts.sessionId) params.set("sessionId", String(facts.sessionId));
  if (facts.opportunityId) params.set("opportunityId", String(facts.opportunityId));
  return `/${section}${params.size ? `?${params}` : ""}`;
}

export function isOpportunityValidated(status?: string | null) {
  return validatedStatuses.has(status ?? "");
}

export function pipelineStages(facts: WorkflowFacts): WorkflowStage[] {
  return [
    { key: "research", label: "Research", complete: Boolean(facts.sessionId), href: facts.sessionId ? `/research-sessions/${facts.sessionId}` : "/research-sessions" },
    { key: "evidence", label: "Evidence", complete: facts.evidenceCount > 0, href: sectionHref("evidence", facts) },
    { key: "clustering", label: "Clustering", complete: facts.clusterCount > 0, href: sectionHref("evidence-clusters", facts) },
    { key: "opportunity", label: "Opportunity", complete: facts.opportunityCount > 0, href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : sectionHref("opportunities", facts) },
    { key: "validation", label: "Validation", complete: facts.validationCount > 0, href: sectionHref("validation-packages", facts) },
    { key: "interviews", label: "Interviews", complete: facts.interviewCount >= 7, href: sectionHref("interviews", facts) },
    { key: "experiment", label: "Experiment", complete: facts.experimentCount > 0, href: sectionHref("experiments", facts) },
    { key: "building", label: "Building", complete: Boolean(facts.building), href: "/industry-pipeline" },
  ];
}

export function workflowProgress(facts: WorkflowFacts) {
  const stages = pipelineStages(facts);
  const complete = stages.filter((stage) => stage.complete).length;
  return { complete, total: stages.length, percent: Math.round((complete / stages.length) * 100) };
}

export function opportunityWorkflow(facts: WorkflowFacts): WorkflowStage[] {
  const interviews = Array.from({ length: 7 }, (_, index): WorkflowStage => ({
    key: `interview-${index + 1}`,
    label: `Interview ${index + 1}`,
    complete: facts.interviewCount > index,
    href: sectionHref("interviews", facts, facts.interviewCount <= index),
  }));
  const validated = isOpportunityValidated(facts.opportunityStatus);
  return [
    { key: "session", label: "Research Session Created", complete: Boolean(facts.sessionId), href: facts.sessionId ? `/research-sessions/${facts.sessionId}` : "/research-sessions" },
    { key: "evidence", label: "Evidence Added", detail: String(facts.evidenceCount), complete: facts.evidenceCount > 0, href: sectionHref("evidence", facts) },
    { key: "cluster", label: "Evidence Cluster Created", complete: facts.clusterCount > 0, href: sectionHref("evidence-clusters", facts) },
    { key: "promoted", label: "Opportunity Promoted", complete: Boolean(facts.opportunityId), href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : "/opportunities" },
    { key: "validation", label: "Validation Package Generated", complete: facts.validationCount > 0, href: sectionHref("validation-packages", facts) },
    ...interviews,
    { key: "pricing", label: "Pricing Validated", complete: Boolean(facts.pricingValidated), href: sectionHref("interviews", facts) },
    { key: "concept", label: "Product Concept Selected", complete: (facts.approvedConceptCount ?? 0) > 0, href: sectionHref("product-concepts", facts) },
    { key: "experiment", label: "Experiment Running", complete: (facts.activeExperimentCount ?? 0) > 0 || (facts.successfulExperimentCount ?? 0) > 0, href: sectionHref("experiments", facts) },
    { key: "validated", label: "Opportunity Validated", complete: validated, href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : "/opportunities" },
    { key: "building", label: "Building", complete: Boolean(facts.building), href: "/industry-pipeline" },
  ];
}

export function nextRecommendedAction(facts: WorkflowFacts): RecommendedAction {
  if (!facts.evidenceCount) return { label: "Add Evidence", description: "Collect the first proof for this research project.", href: sectionHref("evidence", facts, true) };
  if (!facts.clusterCount) return { label: "Generate Evidence Clusters", description: "Group the evidence into recurring problems.", href: sectionHref("evidence-clusters", facts, true) };
  if (!facts.opportunityCount) return { label: "Generate Opportunities", description: "Promote the strongest evidence cluster into an opportunity.", href: sectionHref("evidence-clusters", facts) };
  if (!facts.validationCount) return { label: "Generate Validation Package", description: "Prepare the interview plan and assumptions to test.", href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : sectionHref("opportunities", facts) };
  if (facts.interviewCount < 7) return { label: `Conduct Interview ${facts.interviewCount + 1}`, description: `${7 - facts.interviewCount} customer interviews remain before validation review.`, href: sectionHref("interviews", facts, true) };
  if (!isOpportunityValidated(facts.opportunityStatus)) return { label: "Review Validation", description: "Review the completed interviews and update the opportunity decision.", href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : sectionHref("opportunities", facts) };
  if (!(facts.approvedConceptCount ?? 0)) return {
    label: facts.conceptCount ? "Select Product Concept" : "Generate Product Concepts",
    description: facts.conceptCount ? "Review the concepts and approve the strongest option." : "Turn the validated opportunity into testable product directions.",
    href: facts.opportunityId ? `/opportunities/${facts.opportunityId}` : sectionHref("product-concepts", facts),
  };
  if (!facts.experimentCount) return { label: "Launch Experiment", description: "Create a measurable test for the selected product concept.", href: sectionHref("experiments", facts, true) };
  if (!(facts.successfulExperimentCount ?? 0)) return { label: "Review Experiment", description: "Record results and decide whether the signal is strong enough to build.", href: sectionHref("experiments", facts) };
  if (!facts.building) return { label: "Move To Building", description: "The opportunity has passed research, validation, and experiment gates.", href: "/industry-pipeline" };
  return { label: "Continue Building", description: "This project is in the building stage.", href: "/industry-pipeline" };
}
