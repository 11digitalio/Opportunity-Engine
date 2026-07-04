"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const storageKey = "opportunity-engine-onboarding-complete";

const screens = [
  {
    eyebrow: "Welcome to Opportunity Engine",
    title: "Stop guessing what to build.",
    body: "Opportunity Engine discovers recurring customer problems from real-world discussions and turns them into software opportunities.",
    visual: "signal",
  },
  {
    eyebrow: "From noise to direction",
    title: "Research happens automatically.",
    body: "The engine organizes scattered customer signals into a clear path from market research to product direction.",
    visual: "pipeline",
  },
  {
    eyebrow: "Evidence before opinions",
    title: "Decide with confidence.",
    body: "Every opportunity is backed by customer evidence, market validation, and a recommended product idea—so you can see what to build and why.",
    visual: "decision",
  },
  {
    eyebrow: "See it in action",
    title: "Explore a real research project.",
    body: "Walk through the dental practices case study to see real customer pain become ranked opportunities and product concepts.",
    visual: "demo",
  },
] as const;

export default function WelcomeOnboarding() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVisible(localStorage.getItem(storageKey) !== "true");
  }, []);

  function complete() {
    localStorage.setItem(storageKey, "true");
    setVisible(false);
    router.push("/");
  }

  if (!visible) return null;
  const screen = screens[step];

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-ambient onboarding-ambient-one" />
      <div className="onboarding-ambient onboarding-ambient-two" />
      <div className="onboarding-frame">
        <div className="onboarding-brand"><span>OE</span> Opportunity Engine</div>
        <div className="onboarding-content">
          <div className="onboarding-copy" key={screen.title}>
            <span className="onboarding-eyebrow">{screen.eyebrow}</span>
            <h1 id="onboarding-title">{screen.title}</h1>
            <p>{screen.body}</p>
            {screen.visual === "signal" && (
              <div className="signal-visual" aria-hidden="true">
                <span>“No-shows cost us hours every week.”</span>
                <span>“Insurance follow-up is entirely manual.”</span>
                <span>“Our software does not talk to each other.”</span>
                <strong>Recurring pain → product opportunity</strong>
              </div>
            )}
            {screen.visual === "pipeline" && (
              <div className="onboarding-pipeline" aria-label="Opportunity discovery pipeline">
                {["Industry", "Evidence", "Patterns", "Opportunities", "Product Concepts"].map((item, index) => (
                  <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 4 && <i>→</i>}</div>
                ))}
              </div>
            )}
            {screen.visual === "decision" && (
              <div className="decision-visual" aria-hidden="true">
                <div><small>Opportunity score</small><strong>92</strong><span>High potential</span></div>
                <ul><li>12 customer signals</li><li>9/10 evidence confidence</li><li>Product concept recommended</li></ul>
              </div>
            )}
            {screen.visual === "demo" && (
              <div className="demo-visual" aria-hidden="true">
                <span className="demo-icon">✦</span>
                <div><small>Featured research project</small><strong>Independent Dental Practices</strong><p>Real pain signals. Ranked opportunities. Actionable product concepts.</p></div>
              </div>
            )}
          </div>
        </div>
        <div className="onboarding-footer">
          <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${screens.length}`}>
            {screens.map((item, index) => <button className={index === step ? "active" : ""} key={item.title} onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} />)}
          </div>
          <div className="onboarding-actions">
            {step > 0 && <button className="onboarding-back" onClick={() => setStep(step - 1)}>Back</button>}
            {step < screens.length - 1
              ? <button className="onboarding-next" onClick={() => setStep(step + 1)}>Continue <span>→</span></button>
              : <>
                <button className="onboarding-skip" onClick={complete}>Skip onboarding</button>
                <button className="onboarding-next" onClick={complete}>Open Opportunity Dashboard <span>→</span></button>
              </>}
          </div>
        </div>
      </div>
    </div>
  );
}
