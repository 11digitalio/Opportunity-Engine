import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Industry = Record<string, string | number | null>;

export default async function IndustryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const industry = db.prepare("SELECT * FROM industries WHERE id = ?").get(Number(id)) as Industry | undefined;
  if (!industry) notFound();

  const fields = [
    ["Description", industry.description],
    ["Customer types", industry.customer_types],
    ["Estimated market size", industry.estimated_market_size],
    ["Number of businesses", industry.number_of_businesses],
    ["Existing software vendors", industry.existing_software_vendors],
    ["Research analysis", industry.research_notes],
    ["Notes", industry.notes],
  ];

  return (
    <>
      <div className="issue-breadcrumb"><Link href="/industry-pipeline">Industry Pipeline</Link> / Industry record</div>
      <header className="page-header">
        <div><h1>{industry.name}</h1><p className="subtitle">Assess the market, workflows, evidence, and opportunities in one place.</p></div>
        <Link className="button secondary" href="/industries">All Industries</Link>
      </header>
      <div className="card detail-body">
        {fields.map(([label, value]) => (
          <div className="detail-field" key={String(label)}>
            <h3>{label}</h3>
            <p>{value === null || value === "" ? <span className="muted">—</span> : String(value)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
