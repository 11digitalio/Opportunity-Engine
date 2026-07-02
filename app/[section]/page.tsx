import { notFound } from "next/navigation";
import SectionManager from "@/components/SectionManager";
import IndustryPipeline from "@/components/IndustryPipeline";
import { db } from "@/lib/db";
import { sections } from "@/lib/sections";

export const dynamic = "force-dynamic";

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ new?: string; sessionId?: string; conceptId?: string; opportunityId?: string }>;
}) {
  const { section: slug } = await params;
  const query = await searchParams;
  const section = sections[slug];
  if (!section) notFound();
  if (slug === "industry-pipeline") return <IndustryPipeline />;
  const industries = db.prepare("SELECT id, name FROM industries ORDER BY name").all() as Record<string, string | number | null>[];
  const sessionId = Number(query.sessionId);
  const session = sessionId
    ? db.prepare("SELECT industry_id FROM research_sessions WHERE id = ?").get(sessionId) as { industry_id: number } | undefined
    : undefined;
  const conceptId = Number(query.conceptId);
  const opportunityId = Number(query.opportunityId);
  const initialValues = {
    ...(session ? { research_session_id: sessionId, industry_id: session.industry_id } : {}),
    ...(conceptId ? { product_concept_id: conceptId } : {}),
    ...(opportunityId ? { opportunity_id: opportunityId } : {}),
  };
  return <SectionManager
    section={section}
    industries={industries}
    startCreating={query.new === "1"}
    initialValues={Object.keys(initialValues).length ? initialValues : undefined}
  />;
}
