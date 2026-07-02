"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OpportunityActions({ opportunityId, isSample }: { opportunityId: number; isSample: boolean }) {
  const router = useRouter();
  const [working, setWorking] = useState<"concepts" | "validate" | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: "concepts" | "validate") {
    setWorking(action);
    setMessage("");
    const response = await fetch(`/api/opportunities/${opportunityId}/${action}`, { method: "POST" });
    const data = await response.json();
    setWorking(null);
    if (!response.ok) return setMessage(data.error ?? "Action failed.");
    setMessage(action === "concepts"
      ? `${data.created} product concepts created and marked Needs Review.`
      : data.existing ? "This opportunity already has a validation plan." : "Validation plan created and marked Needs Review.");
    router.refresh();
  }

  return (
    <div>
      <div className="actions">
        <button className="button" disabled={Boolean(working) || isSample} onClick={() => run("validate")}>
          {working === "validate" ? "Creating…" : "Validate Opportunity"}
        </button>
        <button className="button secondary" disabled={Boolean(working) || isSample} onClick={() => run("concepts")}>
          {working === "concepts" ? "Generating…" : "Generate Product Concepts"}
        </button>
      </div>
      {isSample && <p className="action-note">Generation actions are disabled for sample opportunities.</p>}
      {message && <p className="action-note">{message}</p>}
    </div>
  );
}
