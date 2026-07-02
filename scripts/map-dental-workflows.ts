import Database from "better-sqlite3";
import path from "node:path";

const db = new Database(path.join(process.cwd(), "data", "opportunity-engine.db"));
db.pragma("foreign_keys = ON");

const industry = db
  .prepare("SELECT id FROM industries WHERE name = ?")
  .get("Independent Dental Practices") as { id: number } | undefined;

if (!industry) throw new Error("Independent Dental Practices industry not found.");

const workflows = [
  {
    name: "New patient intake",
    who: "Front desk or patient coordinator; patients complete their own forms",
    frequency: "Daily",
    tools: "Practice management software, online or paper intake forms, document scanner, email or patient portal",
    steps: "Receive the inquiry; create the patient record; collect demographics, medical history, consent forms, and insurance details; review for completeness; scan or enter information; route relevant history to the clinical team.",
    pain: "Information often arrives through multiple channels and must be checked or re-entered. Missing forms, duplicate records, and incomplete histories can delay check-in and create follow-up work.",
    research: "Common front-office workflow before a first visit. The exact mix of paper forms, online forms, and portal entry varies by practice.",
  },
  {
    name: "Appointment scheduling",
    who: "Front desk staff, scheduling coordinator, or office manager",
    frequency: "Daily",
    tools: "Dental practice management schedule, phone, online booking, email, text messaging",
    steps: "Identify the patient and visit type; check provider, operatory, and equipment availability; estimate visit length; review relevant preferences or restrictions; book the appointment; document notes and provide instructions.",
    pain: "Scheduling requires balancing clinical duration, provider availability, room constraints, and patient preferences. Changes made by phone or message can create back-and-forth work and schedule gaps.",
    research: "A continuous front-office workflow covering new bookings, rescheduling, cancellations, and emergency visits.",
  },
  {
    name: "Appointment confirmation",
    who: "Front desk staff or automated messaging system, with staff handling exceptions",
    frequency: "Daily",
    tools: "Practice management software, automated reminder service, phone, SMS, email",
    steps: "Review upcoming appointments; send reminders; monitor replies; call patients who do not respond; record confirmation status; reschedule cancellations; note special instructions.",
    pain: "Automated reminders reduce some work, but unanswered messages and ambiguous replies still need manual follow-up. Late cancellations and unconfirmed appointments make the schedule less predictable.",
    research: "Usually performed for appointments in the next several days, with timing and contact methods set by office policy.",
  },
  {
    name: "Insurance verification",
    who: "Insurance coordinator, front desk staff, or billing staff",
    frequency: "Daily",
    tools: "Payer portals, clearinghouse, phone, fax, practice management software, eligibility tools",
    steps: "Collect insurance details; confirm patient and plan eligibility; check coverage dates, deductibles, maximums, frequencies, limitations, waiting periods, and coordination of benefits; document findings; flag uncertainties before treatment.",
    pain: "Coverage details may be spread across portals, phone calls, and plan documents, and responses can be incomplete or difficult to interpret. Staff must translate plan information into estimates while recognizing that verification is not a guarantee of payment.",
    research: "Commonly completed before visits and larger procedures; depth of verification depends on the planned treatment and payer.",
  },
  {
    name: "Treatment plan presentation",
    who: "Dentist and treatment coordinator, sometimes supported by hygienists or assistants",
    frequency: "Daily",
    tools: "Practice management software, imaging software, intraoral images, printed or digital treatment plans, financing tools",
    steps: "Review diagnosis and recommended care; organize procedures and sequencing; explain clinical findings, options, benefits, and risks; estimate insurance and patient portions; discuss timing and financing; answer questions; record acceptance or follow-up needs.",
    pain: "Clinical, insurance, and financial information must be presented clearly in a limited amount of time. Patients may defer decisions when estimates are uncertain or when follow-up is inconsistent.",
    research: "Occurs after diagnosis for restorative, surgical, periodontal, cosmetic, and other planned care.",
  },
  {
    name: "Recall / patient reactivation",
    who: "Recall coordinator, front desk staff, hygienist, or office manager",
    frequency: "Weekly",
    tools: "Practice management reports, recall lists, phone, SMS, email, postcards",
    steps: "Run reports for overdue or inactive patients; segment by due date or treatment need; review contact history; send messages or call; record outcomes; schedule responsive patients; create future follow-up tasks.",
    pain: "Lists can be long, contact information may be outdated, and repeated outreach is difficult to track consistently. Staff often fit reactivation work around immediate front-desk demands.",
    research: "Broader than routine hygiene recall because it can include inactive patients and people with unscheduled diagnosed treatment.",
  },
  {
    name: "Billing & collections",
    who: "Billing coordinator, financial coordinator, front desk staff, or office manager",
    frequency: "Daily",
    tools: "Practice management ledger, payment terminal, online payment service, statements, phone, accounting software",
    steps: "Post charges and payments; collect copays or estimated patient portions; reconcile adjustments; generate statements; review aging balances; contact patients; arrange payment plans; document collection activity.",
    pain: "Patient balances change as claims are processed, which can make explanations and collection timing difficult. Reconciliation, statement follow-up, and documenting payment arrangements require sustained attention.",
    research: "Includes point-of-service collections and follow-up on outstanding patient accounts; policies vary by practice.",
  },
  {
    name: "Claims submission",
    who: "Insurance or billing coordinator, sometimes an outsourced billing service",
    frequency: "Daily",
    tools: "Practice management software, electronic clearinghouse, payer portals, imaging or attachment service",
    steps: "Review completed procedures and codes; confirm provider and payer information; add narratives, radiographs, or other attachments; submit claims; monitor acknowledgments; correct rejected claims; track pending claims and responses.",
    pain: "Claims can be delayed by missing documentation, coding errors, payer-specific requirements, or data mismatches. Rejections and requests for additional information create repeated follow-up across different systems.",
    research: "Typically batched at least daily so completed care enters the reimbursement cycle promptly.",
  },
  {
    name: "Clinical charting",
    who: "Dentists, dental hygienists, and dental assistants",
    frequency: "Daily",
    tools: "Electronic dental record, periodontal charting, imaging software, templates, voice or keyboard entry",
    steps: "Review medical history; document examination findings, diagnoses, periodontal measurements, procedures, materials, anesthetic, consent, and post-operative instructions; update odontogram; sign or finalize the note.",
    pain: "Documentation competes with patient care and room turnover, so notes may be completed between visits or after clinic hours. Templates help but still require careful editing to keep records accurate and patient-specific.",
    research: "A clinical and compliance workflow performed for every patient encounter, with content depending on visit type.",
  },
  {
    name: "Hygiene recall",
    who: "Hygiene coordinator, hygienist, or front desk staff",
    frequency: "Daily",
    tools: "Practice management recall module, hygiene schedule, phone, SMS, email, postcards",
    steps: "Identify patients due or overdue for preventive or periodontal maintenance; check recommended interval; contact the patient; schedule the correct visit type and duration; document attempts; set the next follow-up.",
    pain: "Maintaining a full hygiene schedule requires continual outreach while avoiding duplicate or excessive contact. Different recall intervals and unscheduled family members make list management more complex.",
    research: "Focused specifically on preventive and periodontal maintenance intervals and usually managed as an ongoing daily queue.",
  },
  {
    name: "Daily schedule optimization",
    who: "Office manager, scheduling coordinator, front desk staff, and clinical leads",
    frequency: "Daily",
    tools: "Practice management schedule, production views, waitlist or short-call list, phone, team huddle notes",
    steps: "Review the next day and current day; identify gaps, bottlenecks, emergencies, and provider or operatory conflicts; confirm visit readiness; move or add patients; use a waitlist to fill openings; communicate changes to the team.",
    pain: "The schedule can change quickly because of cancellations, emergencies, late patients, and treatment changes. Filling openings without creating clinical bottlenecks requires repeated judgment and outreach.",
    research: "Often addressed during a morning huddle and revisited throughout the day as conditions change.",
  },
  {
    name: "Patient communication",
    who: "Front desk staff, treatment coordinators, clinical staff, and office manager",
    frequency: "Daily",
    tools: "Phone, voicemail, SMS, email, patient portal, practice management notes",
    steps: "Receive and triage questions; verify patient identity; review the chart or account; answer administrative questions or route clinical issues; send instructions or documents; record important communication; create follow-up tasks.",
    pain: "Messages arrive through several channels and may require input from different team members. Without consistent routing and documentation, responses can be delayed or duplicated.",
    research: "Covers routine inbound and outbound communication outside dedicated confirmation, recall, and billing workflows.",
  },
  {
    name: "Referral management",
    who: "Referral coordinator, front desk staff, dentist, or dental assistant",
    frequency: "Weekly",
    tools: "Practice management software, referral forms, secure email, fax, phone, imaging export, specialist portals",
    steps: "Prepare the referral reason and clinical records; send forms, images, and notes; confirm receipt; help the patient coordinate specialist care; track appointment and report status; import specialist findings; update the care plan.",
    pain: "Referral information often moves through fax, email, phone, and separate specialist systems. Missing records or unclear status can lead to repeated calls and incomplete continuity of care.",
    research: "Includes outgoing referrals to specialists and, where applicable, tracking incoming referrals from other providers.",
  },
  {
    name: "Lab case tracking",
    who: "Dental assistants, lab coordinator, front desk staff, and treating dentist",
    frequency: "Daily",
    tools: "Practice management notes, paper or digital lab slips, lab portal, shipping records, calendar, phone",
    steps: "Create the lab prescription; package or upload impressions, scans, and case details; record the sent date and due date; monitor status; receive and inspect the case; document arrival; confirm the patient's delivery appointment.",
    pain: "Case status and due dates may be split between the dental record, lab portal, shipping information, and informal notes. A delay or incomplete case can disrupt a reserved delivery appointment.",
    research: "Relevant to crowns, dentures, aligners, appliances, and other work produced by an outside or in-house lab.",
  },
  {
    name: "Inventory management",
    who: "Lead dental assistant, supply coordinator, office manager, or assigned clinical staff",
    frequency: "Weekly",
    tools: "Supply lists, spreadsheets, vendor websites, barcode or inventory systems, paper count sheets",
    steps: "Check stock and expiration dates; review expected procedure needs; record items below par levels; consolidate orders; compare vendors or approved products; place orders; receive and verify shipments; store supplies and resolve discrepancies.",
    pain: "Counts and reorder levels are often maintained manually, while usage changes with the procedure mix. Over-ordering ties up space and cash, but shortages can interrupt clinical work.",
    research: "Usually reviewed on a recurring cadence, with urgent replenishment handled as needed between formal counts.",
  },
  {
    name: "Staff scheduling",
    who: "Office manager, practice owner, or scheduling lead",
    frequency: "Weekly",
    tools: "Scheduling or payroll software, shared calendar, spreadsheet, text, email",
    steps: "Review provider hours and patient demand; assign front-office and clinical coverage; account for skills, rooms, breaks, time off, and meetings; publish the schedule; arrange coverage for changes; communicate updates.",
    pain: "Coverage must match both the patient schedule and role-specific staffing needs. Time-off requests and last-minute absences can require manual coordination and frequent schedule changes.",
    research: "Typically planned weekly or further ahead, then adjusted when patient demand or staff availability changes.",
  },
] as const;

const existing = db.prepare(
  "SELECT id FROM workflows WHERE industry_id = ? AND name = ? ORDER BY id LIMIT 1",
);
const update = db.prepare(`
  UPDATE workflows SET who_does_it = ?, frequency = ?, current_tools_used = ?, manual_steps = ?,
    pain_description = ?, research_notes = ?, notes = NULL, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);
const insert = db.prepare(`
  INSERT INTO workflows (
    industry_id, name, who_does_it, frequency, current_tools_used, manual_steps,
    pain_description, research_notes, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
`);

db.transaction(() => {
  for (const workflow of workflows) {
    const row = existing.get(industry.id, workflow.name) as { id: number } | undefined;
    if (row) {
      update.run(
        workflow.who,
        workflow.frequency,
        workflow.tools,
        workflow.steps,
        workflow.pain,
        workflow.research,
        row.id,
      );
    } else {
      insert.run(
        industry.id,
        workflow.name,
        workflow.who,
        workflow.frequency,
        workflow.tools,
        workflow.steps,
        workflow.pain,
        workflow.research,
      );
    }
  }
})();

db.close();
