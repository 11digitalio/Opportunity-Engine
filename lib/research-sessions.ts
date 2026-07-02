export const researchChecklist = [
  { key: "industry_selected", label: "Industry selected" },
  { key: "workflows_mapped", label: "Workflows mapped" },
  { key: "software_products_identified", label: "Software products identified" },
  { key: "evidence_collected", label: "Evidence collected" },
  { key: "evidence_clustered", label: "Evidence clustered" },
  { key: "opportunities_generated", label: "Opportunities generated" },
  { key: "validation_package_created", label: "Validation package created" },
  { key: "interviews_started", label: "Interviews started" },
  { key: "product_concepts_generated", label: "Product concepts generated" },
  { key: "experiment_launched", label: "Experiment launched" },
] as const;

export const researchStatuses = ["Not Started", "Running", "Complete", "Failed"] as const;
export const researchStages = ["Scoring", "Evidence Collection", "Evidence Clustering", "Opportunity Generation", "Validation", "Interviews", "Product Concepts", "Experiments", "Complete"] as const;

export type ChecklistState = Record<(typeof researchChecklist)[number]["key"], boolean>;

export function emptyChecklist(): ChecklistState {
  return Object.fromEntries(researchChecklist.map((item) => [item.key, false])) as ChecklistState;
}

export function parseChecklist(value: string): ChecklistState {
  try {
    const saved = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(researchChecklist.map((item) => [item.key, saved[item.key] === true])) as ChecklistState;
  } catch {
    return emptyChecklist();
  }
}
