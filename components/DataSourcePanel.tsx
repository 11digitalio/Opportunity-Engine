import { getDataSourceInfo } from "@/lib/db";

const labels: Record<string, string> = {
  industries: "Industries",
  workflows: "Workflows",
  products: "Products",
  evidence: "Evidence",
  evidence_clusters: "Patterns",
  opportunities: "Opportunities",
  product_concepts: "Concepts",
};

export default function DataSourcePanel() {
  const visible = process.env.NODE_ENV === "development"
    || process.env.SHOW_DATA_DEBUG === "1"
    || process.env.NEXT_PUBLIC_SHOW_DATA_DEBUG === "1";
  if (!visible) return null;

  const info = getDataSourceInfo();
  return (
    <details className="data-source-panel">
      <summary>Data Source / Build Info</summary>
      <dl>
        <div><dt>Environment</dt><dd>{info.environment}</dd></div>
        <div><dt>Build commit</dt><dd>{short(info.buildCommit)}</dd></div>
        <div><dt>Seed revision</dt><dd>{info.seedRevision}</dd></div>
        <div><dt>Loaded from</dt><dd>{info.source}</dd></div>
      </dl>
      <div className="data-source-counts">
        {Object.entries(info.counts).map(([key, count]) => (
          <span key={key}>
            <strong>{count.real}</strong> {labels[key] ?? key}
            {count.sample > 0 && <small> +{count.sample} sample</small>}
          </span>
        ))}
      </div>
      <p>Application counts exclude records marked as sample.</p>
    </details>
  );
}

function short(value: string) {
  return value === "unavailable" ? value : value.slice(0, 12);
}
