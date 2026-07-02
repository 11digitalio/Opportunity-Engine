import { db } from "../lib/db";

const INDUSTRY_NAME = "Long-term International Travelers";
const COLLECTED_DATE = "2026-07-02";

type WorkflowSeed = {
  key: string;
  name: string;
  who: string;
  frequency: string;
  tools: string;
  steps: string;
  pain: string;
};

type ProductSeed = {
  key: string;
  name: string;
  website: string;
  pricing: string;
  target: string;
  strengths: string;
  weaknesses: string;
  sources: string;
  notes: string;
};

type EvidenceSeed = {
  key: string;
  workflow: string;
  product?: string;
  pattern: string;
  sourceType: string;
  sourceName: string;
  url: string;
  quote: string;
  summary: string;
  category: string;
  severity: number;
  confidence: number;
  quality: number;
};

type PatternSeed = {
  key: string;
  name: string;
  workflow: string;
  problem: string;
  impact: string;
  notes: string;
  scores: [number, number, number, number, number, number];
};

type OpportunitySeed = {
  pattern: string;
  name: string;
  persona: string;
  workaround: string;
  currentWorkflow: string;
  cost: string;
  alternatives: string;
  insufficient: string;
  willingness: string;
  aiOpportunity: string;
  risks: string;
  moats: string;
  questions: string;
};

type ConceptSeed = {
  opportunity: string;
  name: string;
  pitch: string;
  solution: string;
  differentiation: string;
  beats: string;
  mvp: string;
  features: string;
  pricing: string;
  distribution: string;
  risk: string;
  moat: string;
  scores: [number, number, number, number, number, number, number];
};

const workflows: WorkflowSeed[] = [
  {
    key: "housing",
    name: "Find and secure work-ready apartments",
    who: "Traveler, partner, or family member",
    frequency: "Every 1–12 months, with weekly search activity before each move",
    tools: "Airbnb, Flatio, Booking.com, local agents, Facebook groups, WhatsApp, spreadsheets",
    steps: "Choose neighborhoods; compare monthly prices and lease terms; verify listing identity; confirm internet, desk, noise, utilities, and cancellation terms; pay deposit; document condition; resolve stay problems.",
    pain: "Short stays are expensive, local leases require guarantees, listings are hard to verify remotely, and tourist reviews rarely validate month-long work conditions.",
  },
  {
    key: "visas",
    name: "Research and maintain visa compliance",
    who: "Traveler, immigration adviser, employer HR, or partner",
    frequency: "Weekly during applications; reviewed before every border crossing and status deadline",
    tools: "Embassy sites, immigration portals, VFS, lawyers, Facebook groups, Reddit, calendars, document folders",
    steps: "Determine eligibility; collect contracts, bank statements, insurance, police checks, apostilles, and translations; book appointments; submit; track expiry and physical-presence rules.",
    pain: "Requirements are fragmented, change by consulate, expire on different timelines, and can conflict across official and community sources.",
  },
  {
    key: "connectivity",
    name: "Set up mobile data and preserve phone-number continuity",
    who: "Traveler",
    frequency: "At every arrival, device change, plan expiry, or outage",
    tools: "Airalo, Holafly, local SIM vendors, carrier apps, dual-SIM phones, hotspots",
    steps: "Check device support; compare local, regional, and global plans; install or buy SIM; configure roaming and APN; test service; retain home number; top up; keep an outage fallback.",
    pain: "Activation and coverage can fail on arrival, plan rules are confusing, and replacing a home number breaks account recovery and two-factor authentication.",
  },
  {
    key: "banking",
    name: "Access money and banking across borders",
    who: "Traveler, bank, card issuer, or client payer",
    frequency: "Daily spending and monthly income, transfers, and bill payments",
    tools: "Wise, Revolut, home-country banks, credit cards, ATMs, PayPal, local bank accounts",
    steps: "Maintain a home address and number; notify banks; exchange currencies; choose cards and ATMs; verify transfers; handle fraud checks; retain emergency access to funds.",
    pain: "Banks assume a fixed residence and phone number, while foreign logins, compliance checks, and card holds can block essential money access.",
  },
  {
    key: "taxes",
    name: "Track tax residence and filing obligations",
    who: "Traveler, accountant, employer, or business owner",
    frequency: "Continuous day tracking with monthly reviews and annual filings",
    tools: "Spreadsheets, calendars, accountants, government sites, tax software, visa forums",
    steps: "Track presence days, income source, permanent-home ties, employer rules, treaties, and filing deadlines; retain documents; obtain advice when itineraries change.",
    pain: "Visa permission, work authorization, social security, and tax residence are separate regimes with country-specific thresholds and contradictory public advice.",
  },
  {
    key: "coworking",
    name: "Find dependable coworking and focused workspaces",
    who: "Remote employee, freelancer, or business owner",
    frequency: "Daily or several times per week",
    tools: "Coworker, Google Maps, Nomads.com, local communities, hotel lounges, cafés",
    steps: "Compare location, hours, internet, power, quiet zones, call policy, ergonomics, day passes, and meeting-room fees; test before committing.",
    pain: "Photos and reviews omit call constraints, noise, power reliability, and extra room fees that determine whether normal remote work is possible.",
  },
  {
    key: "transport",
    name: "Coordinate transportation between countries and cities",
    who: "Traveler",
    frequency: "Every few weeks or months",
    tools: "Google Flights, Rome2Rio, rail and bus apps, airline apps, local transit apps",
    steps: "Compare routes; check entry and baggage constraints; book; arrange first/last-mile transport; manage changes; protect connection time; store tickets offline.",
    pain: "Multi-modal plans are fragmented, changes cascade into lodging and work commitments, and unfamiliar local transport increases arrival-day risk.",
  },
  {
    key: "planning",
    name: "Plan multi-country stays and transitions",
    who: "Traveler, partner, or family",
    frequency: "Weekly planning plus a concentrated cycle before each move",
    tools: "TripIt, Notion, spreadsheets, calendar, email, travel blogs, maps",
    steps: "Sequence countries; reconcile visa days, weather, work hours, costs, transport, housing, healthcare, and personal commitments; store reservations and contingencies.",
    pain: "Each move creates interdependent decisions across many tools, producing decision fatigue, missed constraints, and repeated administrative work.",
  },
  {
    key: "packing",
    name: "Pack, replace, and move essential gear",
    who: "Traveler",
    frequency: "At every move, climate change, or equipment failure",
    tools: "Packing lists, luggage scales, retailer sites, repair shops, cloud inventory",
    steps: "Choose climate and work gear; meet baggage limits; protect devices and documents; repack; replace consumables; dispose of excess items.",
    pain: "Overpacking makes frequent moves physically costly, while underpacking critical work, medical, or power gear creates urgent local purchases.",
  },
  {
    key: "language",
    name: "Navigate language barriers and translation",
    who: "Traveler and local service provider",
    frequency: "Daily, with high stakes during medical, housing, legal, and transport events",
    tools: "Google Translate, DeepL, messaging, screenshots, local contacts",
    steps: "Translate forms and messages; communicate needs; confirm meaning; preserve names, addresses, and instructions offline; escalate to a human interpreter when needed.",
    pain: "Routine interactions become tiring and high-stakes misunderstandings can affect medical records, contracts, payments, and safety.",
  },
  {
    key: "safety",
    name: "Assess safety and respond to incidents",
    who: "Traveler, host, insurer, bank, or local authority",
    frequency: "Continuous monitoring and incident-driven response",
    tools: "Government advisories, maps, local groups, emergency numbers, password manager, device tracking",
    steps: "Evaluate neighborhood and transit risk; protect belongings and accounts; store emergency contacts; report theft or scams; replace documents and devices.",
    pain: "Risk information is generic, local conditions change, and travelers lack a single incident plan connecting authorities, insurers, banks, and trusted contacts.",
  },
  {
    key: "services",
    name: "Find and vet local services",
    who: "Traveler",
    frequency: "Several times per month and urgently after problems",
    tools: "Google Maps, local Facebook groups, WhatsApp, expat forums, concierge services",
    steps: "Find clinics, pharmacies, repair shops, laundries, cleaners, accountants, lawyers, gyms, and delivery services; verify language, price, availability, and trust.",
    pain: "Tourist ratings do not reliably capture long-term needs, English availability, transparent pricing, or whether a provider can handle foreign documents and payment methods.",
  },
  {
    key: "budgeting",
    name: "Budget and manage cost-of-living volatility",
    who: "Traveler or household",
    frequency: "Daily expense capture and monthly reforecasting",
    tools: "Wise, banking apps, spreadsheets, budgeting apps, cost-of-living sites",
    steps: "Estimate housing, transport, insurance, healthcare, tax, visa, connectivity, and emergency costs; convert currencies; compare forecast with actuals; replenish reserves.",
    pain: "Headline destination budgets omit deposits, fees, emergency travel, plan changes, and price volatility, so cash needs are underestimated.",
  },
  {
    key: "healthcare",
    name: "Find and coordinate healthcare abroad",
    who: "Traveler, clinic, doctor, pharmacy, or caregiver",
    frequency: "As needed, plus preventive care every 6–12 months",
    tools: "Google Maps, insurer networks, telemedicine, clinic portals, translation tools, medical records",
    steps: "Choose appropriate care; verify language and payment; book; share history; translate records; obtain prescriptions; coordinate follow-up across countries.",
    pain: "Care networks, language, records, and payment rules change by country, and continuity breaks when the traveler moves before follow-up is complete.",
  },
  {
    key: "insurance",
    name: "Choose insurance and complete claims",
    who: "Traveler, insurer, clinic, or assistance provider",
    frequency: "Policy review at itinerary changes; claims when incidents occur",
    tools: "SafetyWing, World Nomads, insurer portals, email, document scanners",
    steps: "Compare travel medical with global health coverage; verify country, activity, and visa requirements; collect documents; submit and appeal claims; track reimbursement.",
    pain: "Policy categories are easy to confuse, exclusions are discovered late, and clinics produce documents that claims teams may not accept.",
  },
  {
    key: "productivity",
    name: "Maintain productivity across locations and time zones",
    who: "Remote employee, freelancer, founder, or manager",
    frequency: "Daily",
    tools: "Calendar, Slack, Zoom, VPN, task managers, coworking, hotspot, noise-canceling headset",
    steps: "Align hours; protect focus blocks; test internet and backup; find call-ready space; maintain sleep and work routines; communicate availability.",
    pain: "Time zones, unreliable infrastructure, frequent moves, and missing routines compound into missed calls, long workdays, and burnout.",
  },
  {
    key: "connection",
    name: "Maintain relationships and local connection",
    who: "Traveler, partner, family, friends, colleagues, or local community",
    frequency: "Daily online contact and weekly local social activity",
    tools: "WhatsApp, Meetup, coworking events, Facebook groups, Nomads.com, video calls",
    steps: "Coordinate time zones; find compatible communities; attend recurring activities; maintain home relationships; rebuild a local network after each move.",
    pain: "Mobility resets relationships, communities can feel transactional, and time-zone gaps make both local and home connections harder to sustain.",
  },
  {
    key: "moving",
    name: "Execute country-to-country administrative handovers",
    who: "Traveler or household",
    frequency: "Every 1–12 months",
    tools: "Checklists, calendar, email, cloud storage, carrier and banking apps",
    steps: "Close housing; recover deposits; settle utilities; download records; update addresses; preserve phone and banking access; activate next-country transport, housing, SIM, and insurance.",
    pain: "Departure and arrival tasks span unrelated providers, and a failure in one dependency can leave the traveler without housing, money, data, documents, or care.",
  },
];

const products: ProductSeed[] = [
  {
    key: "airbnb",
    name: "Airbnb",
    website: "https://www.airbnb.com/stays/monthly",
    pricing: "Varies by listing; monthly discounts may apply",
    target: "Travelers seeking furnished stays of 28 nights or longer",
    strengths: "Large inventory, flexible dates, reviews, monthly-stay filters, work-friendly amenity filters",
    weaknesses: "Work conditions are self-reported; long-stay cancellation, support, fees, and listing accuracy remain recurring review complaints",
    sources: "https://www.airbnb.com/stays/monthly\nhttps://www.trustpilot.com/review/www.airbnb.com",
    notes: "Relevant to apartment discovery and booking, but not a complete long-stay verification or country-transition system.",
  },
  {
    key: "flatio",
    name: "Flatio",
    website: "https://www.flatio.com/",
    pricing: "Varies by property and stay",
    target: "Remote workers and travelers seeking furnished mid-term rentals",
    strengths: "Mid-term positioning, furnished inventory, online contracting",
    weaknesses: "Market coverage and inventory depth vary by location",
    sources: "https://www.flatio.com/",
    notes: "Direct alternative for 1–12 month accommodation.",
  },
  {
    key: "nomads",
    name: "Nomads.com",
    website: "https://nomads.com/",
    pricing: "Custom",
    target: "Digital nomads comparing destinations and communities",
    strengths: "Nomad-oriented cost, internet, place, and community data",
    weaknesses: "City-level and community information does not verify a specific apartment, legal case, or operational handover",
    sources: "https://nomads.com/\nhttps://nomads.com/what-are-the-struggles-youve-encountered-when-picking-a-new-place-to-visit-and-live-in-for-a-while/5490",
    notes: "Useful discovery layer and research community.",
  },
  {
    key: "wise",
    name: "Wise",
    website: "https://wise.com/",
    pricing: "Variable fees by currency, transfer, card, and region",
    target: "International travelers, expatriates, freelancers, and cross-border businesses",
    strengths: "Multi-currency balances, international transfers, exchange-rate transparency, debit card",
    weaknesses: "Verification, transfer holds, account restrictions, and home-country availability can interrupt access",
    sources: "https://wise.com/ad/pricing/\nhttps://www.trustpilot.com/review/wise.com",
    notes: "Core financial tool; not a substitute for backup banking or tax-residency tracking.",
  },
  {
    key: "revolut",
    name: "Revolut",
    website: "https://www.revolut.com/",
    pricing: "Free and paid plans vary by country",
    target: "Consumers needing app-based multi-currency spending and transfers",
    strengths: "Multi-currency account, cards, budgeting, and travel features",
    weaknesses: "Availability, plan terms, and regulated account rules vary by residence",
    sources: "https://www.revolut.com/",
    notes: "Alternative or backup cross-border money tool.",
  },
  {
    key: "airalo",
    name: "Airalo",
    website: "https://www.airalo.com/all-esim",
    pricing: "Destination-based; global plans shown from US$8.50",
    target: "International travelers needing local, regional, or global eSIM data",
    strengths: "Broad destination coverage, pre-arrival purchase, multiple plan scopes",
    weaknesses: "Activation, device configuration, local coverage, throttling, and refund friction appear in public reviews",
    sources: "https://www.airalo.com/all-esim\nhttps://www.trustpilot.com/review/airalo.com\nhttps://apps.apple.com/tw/app/airalo-esim-for-travel-data/id1475911720?l=en-GB&platform=iphone&see-all=reviews",
    notes: "Connectivity product; travelers still need home-number continuity and outage fallback.",
  },
  {
    key: "holafly",
    name: "Holafly",
    website: "https://esim.holafly.com/",
    pricing: "Varies by destination, duration, and plan",
    target: "International travelers buying destination eSIM data",
    strengths: "Destination plans and unlimited-data positioning in many markets",
    weaknesses: "Coverage, hotspot, throttling, and fair-use rules vary by plan",
    sources: "https://esim.holafly.com/",
    notes: "Alternative eSIM provider.",
  },
  {
    key: "safetywing",
    name: "SafetyWing Nomad Insurance",
    website: "https://safetywing.com/nomad-insurance",
    pricing: "Age-, plan-, date-, and add-on-based quote",
    target: "Nomads and long-term international travelers",
    strengths: "Travel-focused recurring coverage and a broader global-health option",
    weaknesses: "Claims documentation, exclusions, reimbursement timing, and travel-versus-health coverage distinctions create friction",
    sources: "https://safetywing.com/nomad-insurance\nhttps://www.trustpilot.com/review/safetywing.com\nhttps://apps.apple.com/us/app/safetywing/id1574203583",
    notes: "Directly relevant insurance product with public claim-process evidence.",
  },
  {
    key: "worldnomads",
    name: "World Nomads",
    website: "https://www.worldnomads.com/",
    pricing: "Custom quote",
    target: "International travelers seeking travel insurance",
    strengths: "Travel-oriented policy purchase and destination coverage",
    weaknesses: "Policy terms, residence eligibility, exclusions, and trip-duration rules require case-by-case review",
    sources: "https://www.worldnomads.com/",
    notes: "Travel-insurance alternative; not necessarily comprehensive long-term healthcare.",
  },
  {
    key: "rome2rio",
    name: "Rome2Rio",
    website: "https://www.rome2rio.com/",
    pricing: "Free traveler search; supplier prices vary",
    target: "Travelers comparing multi-modal routes",
    strengths: "Cross-mode route discovery across countries",
    weaknesses: "Final schedules, entry rules, disruption handling, and booking obligations remain distributed across operators",
    sources: "https://www.rome2rio.com/",
    notes: "Useful discovery layer for country-to-country transport.",
  },
  {
    key: "tripit",
    name: "TripIt",
    website: "https://www.tripit.com/",
    pricing: "Free plan; paid Pro plan",
    target: "Travelers consolidating reservations and itineraries",
    strengths: "Reservation import and itinerary organization",
    weaknesses: "Does not reconcile visa, tax, housing quality, healthcare, and work-readiness dependencies",
    sources: "https://www.tripit.com/",
    notes: "Itinerary organizer rather than an end-to-end long-stay operations system.",
  },
  {
    key: "coworker",
    name: "Coworker",
    website: "https://www.coworker.com/",
    pricing: "Workspace prices vary by venue",
    target: "Remote workers finding coworking spaces",
    strengths: "Global coworking discovery and venue profiles",
    weaknesses: "Call policy, real-time capacity, noise, power, and internet reliability still need local verification",
    sources: "https://www.coworker.com/",
    notes: "Workspace discovery product.",
  },
  {
    key: "googlemaps",
    name: "Google Maps",
    website: "https://maps.google.com/",
    pricing: "Free consumer app",
    target: "Travelers navigating and finding local services",
    strengths: "Broad place inventory, directions, reviews, saved lists, and offline maps",
    weaknesses: "Reviews are not tailored to foreign-document handling, long-stay needs, insurance, language, or nomad work requirements",
    sources: "https://maps.google.com/",
    notes: "General discovery layer used across local services, safety, transit, and healthcare.",
  },
];

const evidence: EvidenceSeed[] = [
  {
    key: "housing-1", workflow: "housing", product: "airbnb", pattern: "housing-proof",
    sourceType: "Reddit", sourceName: "r/digitalnomad — Are We Done With Airbnb?",
    url: "https://www.reddit.com/r/digitalnomad/comments/1hn0p6h/digital_nomads_are_we_done_with_airbnb_my/",
    quote: "Internet Problems: About 9 out of 10 bookings have internet issues.",
    summary: "A long-term nomad reports that advertised accommodation repeatedly fails a core work requirement.",
    category: "Unverified work-ready housing", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "housing-2", workflow: "housing", product: "nomads", pattern: "housing-proof",
    sourceType: "Nomad Forum", sourceName: "Nomads.com — struggles picking a place",
    url: "https://nomads.com/what-are-the-struggles-youve-encountered-when-picking-a-new-place-to-visit-and-live-in-for-a-while/5490",
    quote: "The apartment, however, didn’t have internet.",
    summary: "A nomad forum participant describes a booked apartment missing the infrastructure required to work.",
    category: "Unverified work-ready housing", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "housing-3", workflow: "housing", pattern: "housing-proof",
    sourceType: "Reddit", sourceName: "r/digitalnomad — Accommodation Challenges",
    url: "https://www.reddit.com/r/digitalnomad/comments/1co6ubv",
    quote: "Is it easy to find a 1 month rental that’s well priced and has everything you need to work from home?",
    summary: "The recurring search problem is not merely lodging availability but finding a correctly priced, work-ready monthly home.",
    category: "Mid-term inventory mismatch", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "housing-4", workflow: "housing", pattern: "housing-proof",
    sourceType: "Public Forum", sourceName: "Bogleheads — full-time Airbnb discussion",
    url: "https://www.bogleheads.org/forum/viewtopic.php?t=342984",
    quote: "You run into issues like avals, longer term lease, requirement of setting up utilities.",
    summary: "Local rental markets impose guarantor, lease, and utility requirements that do not fit a one-to-twelve-month traveler.",
    category: "Mid-term inventory mismatch", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "housing-5", workflow: "housing", pattern: "housing-proof",
    sourceType: "Travel Forum", sourceName: "Rick Steves Travel Forum — apartment rental scam",
    url: "https://community.ricksteves.com/travel-forum/tourist-scams/airbnb-scam",
    quote: "They wanted a 500GBP “refundable” deposit for a 2 week stay.",
    summary: "Remote apartment search exposes travelers to advance-fee scams that are difficult to verify before arrival.",
    category: "Rental scam risk", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "housing-6", workflow: "housing", pattern: "housing-proof",
    sourceType: "Facebook Group", sourceName: "Barcelona Digital Nomads — public housing discussion",
    url: "https://www.facebook.com/groups/847138072058478/posts/7291316914307196/",
    quote: "Can tell if this is not as I think, and that is a potential scam.",
    summary: "A public nomad group post asks the community to verify whether a local housing offer is fraudulent.",
    category: "Rental scam risk", severity: 9, confidence: 8, quality: 6,
  },
  {
    key: "housing-7", workflow: "housing", product: "airbnb", pattern: "housing-proof",
    sourceType: "Product Review", sourceName: "Trustpilot — Airbnb",
    url: "https://www.trustpilot.com/review/www.airbnb.com",
    quote: "Now I’m without accomodation the next two nights and with food poisoning.",
    summary: "A last-minute host cancellation left a traveler without accommodation while ill, and support did not provide a replacement.",
    category: "Stay failure recovery", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "visa-1", workflow: "visas", pattern: "compliance",
    sourceType: "Reddit", sourceName: "r/digitalnomad — fragmented visa process",
    url: "https://www.reddit.com/r/digitalnomad/comments/1ttyyn8/is_the_visarelocation_process_as_insanely/",
    quote: "You have to juggle a dozen different things.",
    summary: "A Portugal D8 applicant describes an interdependent chain of checks, apostilles, translations, banking, housing, insurance, appointments, and expiries.",
    category: "Fragmented compliance", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "visa-2", workflow: "visas", pattern: "compliance",
    sourceType: "Reddit", sourceName: "r/digitalnomad — fragmented visa process comment",
    url: "https://www.reddit.com/r/digitalnomad/comments/1ttyyn8/is_the_visarelocation_process_as_insanely/",
    quote: "The information exists in 10 different places — embassy sites, Facebook groups, Reddit threads from 2019, blogs that haven’t been updated.",
    summary: "Another participant confirms that official and community guidance is scattered and contradictory.",
    category: "Conflicting guidance", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "visa-3", workflow: "visas", pattern: "compliance",
    sourceType: "Reddit", sourceName: "r/digitalnomad — Spain DNV warning",
    url: "https://www.reddit.com/r/digitalnomad/comments/1swh2nx/you_want_to_do_the_spanish_digital_nomad_visa_dont/",
    quote: "Seven months in, thousands spent on paperwork, translations, apostilles, appointments, and I’m still not done.",
    summary: "An experienced visa applicant reports long duration, high cost, outdated systems, and inconsistent in-person handling.",
    category: "Visa process burden", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "visa-4", workflow: "visas", pattern: "compliance",
    sourceType: "Reddit", sourceName: "r/digitalnomad — visa documents disputed",
    url: "https://www.reddit.com/r/digitalnomad/comments/1eopx24",
    quote: "Four months of waiting - 2000 euros.",
    summary: "A rejected applicant reports that submitted documents were treated as missing, creating months of delay and legal cost.",
    category: "Visa rejection risk", severity: 10, confidence: 8, quality: 7,
  },
  {
    key: "visa-5", workflow: "visas", pattern: "compliance",
    sourceType: "Reddit", sourceName: "r/digitalnomad — Spanish DNV nightmare",
    url: "https://www.reddit.com/r/digitalnomad/comments/15ut6de",
    quote: "The documentation extra that they request does not appear in the original requirements.",
    summary: "An applicant reports a new tax-certificate and apostille request that was absent from the published requirements.",
    category: "Changing requirements", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "visa-6", workflow: "taxes", pattern: "compliance",
    sourceType: "Nomad Forum", sourceName: "Nomads.com — Taxes Chat",
    url: "https://nomads.com/chat/taxes",
    quote: "Are there any community docs providing tax advice for digital nomads?",
    summary: "Nomads seek community documentation and country-specific accountants because tax obligations are not resolved by the visa alone.",
    category: "Tax guidance fragmentation", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "visa-7", workflow: "taxes", pattern: "compliance",
    sourceType: "Podcast", sourceName: "The Rabbit Hole — Digital Nomad",
    url: "https://www.radiofreerabbit.com/podcast/215-digital-nomad",
    quote: "The complications around visas and taxes while pursuing a digital nomad lifestyle.",
    summary: "A long-form practitioner discussion identifies visas and taxes as inherent logistical complications, alongside reliable internet and community building.",
    category: "Tax and visa complexity", severity: 8, confidence: 7, quality: 7,
  },
  {
    key: "connect-1", workflow: "connectivity", pattern: "identity-connectivity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — cons no one told you",
    url: "https://www.reddit.com/r/digitalnomad/comments/vlzkk4",
    quote: "This is a pain in the ass when you don’t have your old SIM card and therefore don’t have your old phone number.",
    summary: "Losing the home SIM breaks password resets and two-factor authentication just when a traveler is logging in from a new country.",
    category: "Phone identity continuity", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "connect-2", workflow: "banking", pattern: "identity-connectivity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — bank authentication comment",
    url: "https://www.reddit.com/r/digitalnomad/comments/vlzkk4",
    quote: "I cannot access some of my bank accounts in the US because they will not authenticate to a VOIP number or a foreign number.",
    summary: "A traveler confirms that common number workarounds are rejected by banks, blocking financial access.",
    category: "Bank authentication failure", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "connect-3", workflow: "banking", pattern: "identity-connectivity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — bank travel advisory",
    url: "https://www.reddit.com/r/digitalnomad/comments/17bptnt",
    quote: "They can’t fathom that I don’t have a return date.",
    summary: "Bank travel-notice workflows assume a bounded holiday rather than continuous international movement.",
    category: "Fixed-residence assumption", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "connect-4", workflow: "connectivity", product: "airalo", pattern: "identity-connectivity",
    sourceType: "Product Review", sourceName: "Trustpilot — Airalo",
    url: "https://www.trustpilot.com/review/airalo.com",
    quote: "I have found it very difficult to get the eSIM to work and had to use a different service.",
    summary: "An invited reviewer reports failure of the primary eSIM and the need to buy an alternative during the trip.",
    category: "eSIM activation failure", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "connect-5", workflow: "connectivity", product: "airalo", pattern: "identity-connectivity",
    sourceType: "App Store Review", sourceName: "Apple App Store — Airalo",
    url: "https://apps.apple.com/tw/app/airalo-esim-for-travel-data/id1475911720?l=en-GB&platform=iphone&see-all=reviews",
    quote: "I was stuck going in circles, wasting more time with no results.",
    summary: "An App Store reviewer describes failed service recovery followed by a confusing, slow refund process.",
    category: "Connectivity support failure", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "connect-6", workflow: "connectivity", product: "airalo", pattern: "identity-connectivity",
    sourceType: "Reddit", sourceName: "r/productreview — Airalo unlimited plan",
    url: "https://www.reddit.com/r/productreview/comments/1u1k7br/airalo_esim_review_is_their_plan_really_unlimited/",
    quote: "Some people say the data gets throttled way before it should.",
    summary: "Travelers cannot easily compare fair-use limits, throttling, and reinstall restrictions before relying on an eSIM.",
    category: "Connectivity plan ambiguity", severity: 7, confidence: 8, quality: 7,
  },
  {
    key: "health-1", workflow: "insurance", product: "safetywing", pattern: "care-continuity",
    sourceType: "Product Review", sourceName: "Trustpilot — SafetyWing",
    url: "https://www.trustpilot.com/review/safetywing.com",
    quote: "For a company that is meant to cover international claims for travelers, their lack of flexibility is astounding.",
    summary: "A reviewer reports claim rejection because local clinic paperwork did not match the insurer’s expected label and format.",
    category: "Claims document mismatch", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "health-2", workflow: "insurance", product: "safetywing", pattern: "care-continuity",
    sourceType: "Product Review", sourceName: "Trustpilot — SafetyWing reimbursement",
    url: "https://www.trustpilot.com/review/safetywing.com",
    quote: "It has now been over six weeks since I first submitted my claim.",
    summary: "A traveler reports repeated reimbursement failures, missing communication, and unresolved funds.",
    category: "Claims delay", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "health-3", workflow: "insurance", product: "safetywing", pattern: "care-continuity",
    sourceType: "App Store Review", sourceName: "Apple App Store — SafetyWing",
    url: "https://apps.apple.com/us/app/safetywing/id1574203583",
    quote: "Because I went to the doctor within the first 72 hours of having the policy I was denied coverage.",
    summary: "An app reviewer discovered a timing exclusion only after seeking medical care.",
    category: "Coverage exclusion surprise", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "health-4", workflow: "healthcare", pattern: "care-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — health insurance abroad",
    url: "https://www.reddit.com/r/digitalnomad/comments/1knqfj4",
    quote: "Most insurance in the US don’t cover illnesses that occur while abroad.",
    summary: "A first-time nomad learned after becoming sick that home employer coverage may not follow the worker internationally.",
    category: "Coverage gap", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "health-5", workflow: "healthcare", product: "safetywing", pattern: "care-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — healthcare as a nomad",
    url: "https://www.reddit.com/r/digitalnomad/comments/1ic03ng",
    quote: "I used it for awhile, but never made a claim and always paid out of pocket, which is why I stopped using it.",
    summary: "An experienced nomad found the insurance-versus-cash decision difficult across countries with very different care costs.",
    category: "Coverage value uncertainty", severity: 7, confidence: 9, quality: 8,
  },
  {
    key: "health-6", workflow: "healthcare", pattern: "care-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — best and worst healthcare",
    url: "https://www.reddit.com/r/digitalnomad/comments/1t65c45/best_and_worst_healthcare_experience/",
    quote: "There was already a major language barrier. All communication was done through Google translate.",
    summary: "A traveler managing surgery follow-up across facilities relied on machine translation during a high-stakes care transition.",
    category: "Medical continuity and language", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "move-1", workflow: "moving", pattern: "move-operations",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — Why I STOPPED being a Digital Nomad",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=Ugwxf-qGlSsiYM5Delp4AaABAg",
    quote: "Traveling is actually hard work--dealing with immigration/visas, languages, local customs and laws, new relationships, currencies, foods, time zones.",
    summary: "A highly liked public comment enumerates the repeated administrative and adaptation load of long-term travel.",
    category: "Country transition overload", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "move-2", workflow: "planning", pattern: "move-operations",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — work while traveling comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=UgwJn5buKMNWDAjuNKh4AaABAg",
    quote: "I personally couldn’t imagine working while traveling all the time.",
    summary: "A commenter distinguishes sustainable long stays from continuous movement while working.",
    category: "Travel-work conflict", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "move-3", workflow: "moving", pattern: "move-operations",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — slow travel comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=UgxgU26mUQaWizrzI-d4AaABAg",
    quote: "Our rule is no more than one country per month.",
    summary: "A third-year nomad uses a minimum-stay rule to reduce transition load and preserve community.",
    category: "Move cadence management", severity: 7, confidence: 9, quality: 8,
  },
  {
    key: "move-4", workflow: "packing", pattern: "move-operations",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — traveling nurse comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=Ugy9eteFapBrchlPLwl4AaABAg",
    quote: "I eventually got tired of living out of a suitcase and missing my family.",
    summary: "A twenty-year traveling professional links repeated packing and relocation with fatigue and relationship cost.",
    category: "Long-term mobility fatigue", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "move-5", workflow: "planning", pattern: "move-operations",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — constant planning comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=Ugz6owH2YUbNzsTb0Vd4AaABAg",
    quote: "Constantly planning and catching flights is tiring.",
    summary: "A long-term traveler identifies planning and transport churn as the reason travel stopped feeling enjoyable.",
    category: "Planning fatigue", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "move-6", workflow: "transport", pattern: "move-operations",
    sourceType: "Reddit", sourceName: "r/solotravel — avoiding travel burnout",
    url: "https://www.reddit.com/r/solotravel/comments/18r2ovk",
    quote: "Back to back transportation to the next destination can be tiring.",
    summary: "Long-trip participants recommend inserting rest days because repeated transfers create cumulative burnout.",
    category: "Transport fatigue", severity: 7, confidence: 8, quality: 7,
  },
  {
    key: "productivity-1", workflow: "productivity", pattern: "work-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — productivity across locations",
    url: "https://www.reddit.com/r/digitalnomad/comments/1lckn1g",
    quote: "Between unreliable WiFi, different time zones messing with client calls, and constantly having to find new workspaces, I feel like I’m always behind.",
    summary: "A six-month nomad describes three operational failures compounding into missed productivity.",
    category: "Remote work continuity", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "productivity-2", workflow: "coworking", product: "coworker", pattern: "work-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — coworking space problem",
    url: "https://www.reddit.com/r/digitalnomad/comments/xtd2jm/the_problem_with_coworking_spaces/",
    quote: "If you need to make or take a call will have to book their phone booth, Skype room, or meeting room, for an extra fee.",
    summary: "A remote worker reports that coworking call policies and room fees conflict with normal meeting-heavy work.",
    category: "Workspace fit", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "productivity-3", workflow: "coworking", pattern: "work-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — coworking reliability",
    url: "https://www.reddit.com/r/digitalnomad/comments/1so3cxn/has_anyone_else_noticed_coworking_digital_nomad/",
    quote: "I go to coworking for 1 reason = work without worrying about electricity + internet.",
    summary: "A nomad frames coworking value primarily as infrastructure reliability rather than community or aesthetics.",
    category: "Power and internet reliability", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "productivity-4", workflow: "housing", product: "airbnb", pattern: "work-continuity",
    sourceType: "Reddit", sourceName: "r/digitalnomad — unreliable rental internet",
    url: "https://www.reddit.com/r/digitalnomad/comments/tscgoy/how_many_of_you_avoid_cowork_spaces_and_cities/",
    quote: "I choose a coworking space if the place I rent happens to have unreliable internet even after confirming with the host.",
    summary: "A traveler pays for a second workspace after a host’s internet assurance proves unreliable.",
    category: "Duplicate workspace cost", severity: 8, confidence: 9, quality: 8,
  },
  {
    key: "productivity-5", workflow: "productivity", pattern: "work-continuity",
    sourceType: "Podcast", sourceName: "The Rabbit Hole — Digital Nomad",
    url: "https://www.radiofreerabbit.com/podcast/215-digital-nomad",
    quote: "Finding fast reliable internet in India and building a social network abroad.",
    summary: "A podcast guest identifies reliable internet and local network-building as practical challenges, not destination-selection preferences.",
    category: "Remote work infrastructure", severity: 8, confidence: 7, quality: 7,
  },
  {
    key: "productivity-6", workflow: "productivity", pattern: "work-continuity",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — rural Thailand deadline comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM",
    quote: "I also remember being in rural Thailand during the rainy season, with an impending deadline and limited internet.",
    summary: "A public YouTube commenter describes a location-specific connectivity failure colliding with a real work deadline.",
    category: "Deadline connectivity risk", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "safety-1", workflow: "language", pattern: "local-trust",
    sourceType: "Reddit", sourceName: "r/solotravel — worst part of traveling",
    url: "https://www.reddit.com/r/solotravel/comments/slsyub",
    quote: "Language barrier if you’re on a long trip. It gets exhausting that you can’t have a proper conversation most of the time.",
    summary: "A long-trip traveler describes cumulative language fatigue rather than a one-off translation inconvenience.",
    category: "Language fatigue", severity: 7, confidence: 9, quality: 8,
  },
  {
    key: "safety-2", workflow: "safety", pattern: "local-trust",
    sourceType: "Reddit", sourceName: "r/solotravel — belongings safety",
    url: "https://www.reddit.com/r/solotravel/comments/slsyub",
    quote: "Making sure my belongings are not stolen.",
    summary: "A solo traveler identifies continuous protection of belongings as a core recurring burden.",
    category: "Theft prevention", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "safety-3", workflow: "services", product: "googlemaps", pattern: "local-trust",
    sourceType: "Reddit", sourceName: "r/digitalnomad — healthcare facility trust",
    url: "https://www.reddit.com/r/digitalnomad/comments/1t65c45/best_and_worst_healthcare_experience/",
    quote: "This place was an old abandoned soviet building that apparently was also a hospital.",
    summary: "A traveler’s trusted clinician redirected follow-up care to a facility the patient could not confidently assess.",
    category: "Local provider verification", severity: 10, confidence: 9, quality: 8,
  },
  {
    key: "safety-4", workflow: "safety", product: "nomads", pattern: "local-trust",
    sourceType: "Nomad Review", sourceName: "Nomads.com — Medellín reviews",
    url: "https://nomadlist.com/modal/city/medellin",
    quote: "If you are a female digital nomad you won’t feel any of this.",
    summary: "A city review challenges generalized safety narratives by pointing out that experience differs by traveler profile.",
    category: "Personalized safety context", severity: 9, confidence: 7, quality: 6,
  },
  {
    key: "safety-5", workflow: "visas", pattern: "local-trust",
    sourceType: "Public Discussion", sourceName: "RaiYai forum — Thai DTV visa agents",
    url: "https://www.raiyai.com/forum/topic/please-do-not-use-thai-visa-agents-for-the-dtv-visa/",
    quote: "Digital nomads being denied entry or extorted for 20,000 baht at the airport.",
    summary: "A public forum warns that unverified visa-agent use can turn into entry denial and immediate financial risk.",
    category: "Unverified local intermediary", severity: 10, confidence: 7, quality: 6,
  },
  {
    key: "budget-1", workflow: "budgeting", pattern: "financial-resilience",
    sourceType: "Reddit", sourceName: "r/digitalnomad — financial mistakes",
    url: "https://www.reddit.com/r/digitalnomad/comments/1rfcliv/what_financial_mistake_cost_you_the_most_as_a/",
    quote: "Nomad life needs at least six months liquid.",
    summary: "A traveler argues that foreign-country failures require a much larger liquid reserve than a conventional emergency fund.",
    category: "Emergency reserve underestimation", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "budget-2", workflow: "budgeting", pattern: "financial-resilience",
    sourceType: "Reddit", sourceName: "r/digitalnomad — emergency cost examples",
    url: "https://www.reddit.com/r/digitalnomad/comments/1rfcliv/what_financial_mistake_cost_you_the_most_as_a/",
    quote: "Turns out I owe back taxes and need to fly somewhere with better internet to sort this mess out.",
    summary: "Unexpected compliance and connectivity problems combine into expensive emergency travel.",
    category: "Cross-category emergency cost", severity: 9, confidence: 8, quality: 7,
  },
  {
    key: "budget-3", workflow: "budgeting", pattern: "financial-resilience",
    sourceType: "Travel Blog", sourceName: "Digiwander — biggest digital nomad mistakes",
    url: "https://digiwander.com/the-10-biggest-digital-nomad-mistakes/",
    quote: "Many underestimate ongoing costs, fail to account for income fluctuations, or neglect emergency funds.",
    summary: "A travel guide identifies underbudgeting and income volatility as common causes of debt or forced return.",
    category: "Budget forecast failure", severity: 8, confidence: 7, quality: 6,
  },
  {
    key: "budget-4", workflow: "budgeting", product: "airalo", pattern: "financial-resilience",
    sourceType: "Product Discussion", sourceName: "r/Airalo — prices skyrocketing",
    url: "https://www.reddit.com/r/Airalo/comments/1p6t98b/prices_skyrocketing/",
    quote: "The equivalent Airalo plan is now more than triple the price.",
    summary: "A user reports rapid plan-price movement that makes a previously selected connectivity budget unreliable.",
    category: "Price volatility", severity: 7, confidence: 8, quality: 7,
  },
  {
    key: "routine-1", workflow: "productivity", pattern: "routine-community",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — routine comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=Ugz4jRJHzKOnG5d9z8R4AaABAg",
    quote: "The lack of ability to form regular routines has been hard on my physical and mental health.",
    summary: "A frequently traveling professional links routine disruption directly to health impact.",
    category: "Routine disruption", severity: 9, confidence: 9, quality: 8,
  },
  {
    key: "routine-2", workflow: "moving", pattern: "routine-community",
    sourceType: "YouTube Comment", sourceName: "Nordic Adam — slomading comment",
    url: "https://www.youtube.com/watch?v=rBT1q82oJtM&lc=Ugz95ODUZmsxqswqFKt4AaABAg",
    quote: "What worked is the concept of “slomading” which means staying minimum 3 months in one location.",
    summary: "A nomad describes longer minimum stays as an operational workaround for constant transition.",
    category: "Move cadence management", severity: 7, confidence: 8, quality: 7,
  },
  {
    key: "routine-3", workflow: "connection", pattern: "routine-community",
    sourceType: "Reddit", sourceName: "r/digitalnomad — freeing and lonely",
    url: "https://www.reddit.com/r/digitalnomad/comments/1nk2921/does_anyone_else_feel_like_being_a_digital_nomad/",
    quote: "Loneliness often comes from mobility, not freedom.",
    summary: "A participant attributes recurring loneliness to the reset caused by moves rather than remote work itself.",
    category: "Relationship reset", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "routine-4", workflow: "services", pattern: "routine-community",
    sourceType: "Nomad Forum", sourceName: "Freaking Nomads — reality of nomad work",
    url: "https://freakingnomads.com/discussions/general/ive-been-thinking-about-living-on-the-road-whats-it-really-like-to-work-as-a-digital-nomad--1762443987013",
    quote: "The mental load of always “figuring out” basics.",
    summary: "A nomad forum discussion frames recurring local setup as mental overhead that affects mood and productivity.",
    category: "Repeated local setup", severity: 8, confidence: 8, quality: 7,
  },
  {
    key: "transport-1", workflow: "packing", pattern: "travel-friction",
    sourceType: "Travel Blog", sourceName: "Travipak — digital nomad mistakes",
    url: "https://www.travipak.com/blog/digital-nomad-mistakes-new-travelers-always-make/",
    quote: "Overpacking is a rookie mistake—and it makes every travel day harder than it needs to be.",
    summary: "A long-term travel guide describes the repeated physical cost of moving unnecessary gear.",
    category: "Packing load", severity: 6, confidence: 7, quality: 6,
  },
  {
    key: "transport-2", workflow: "packing", pattern: "travel-friction",
    sourceType: "Reddit", sourceName: "r/solotravel — long-term preparation",
    url: "https://www.reddit.com/r/solotravel/comments/daznyz",
    quote: "I always remember to take a travel adapter for the countries you’ll visit to charge your electronics.",
    summary: "Long-term travel preparation depends on country-specific power and connectivity gear that is easy to miss.",
    category: "Critical gear continuity", severity: 6, confidence: 8, quality: 7,
  },
  {
    key: "transport-3", workflow: "transport", pattern: "travel-friction",
    sourceType: "Reddit", sourceName: "r/solotravel — travel fatigue",
    url: "https://www.reddit.com/r/solotravel/comments/ybbfra",
    quote: "You shouldn’t be stressing about sleeping location and transportation if you properly plan what you’re doing each week.",
    summary: "A long-trip discussion treats transport and lodging stress as a recurring planning problem that requires weekly structure.",
    category: "Transport planning burden", severity: 7, confidence: 8, quality: 7,
  },
  {
    key: "insurance-7", workflow: "insurance", product: "safetywing", pattern: "care-continuity",
    sourceType: "Podcast", sourceName: "Zero To Travel — reality of digital nomad life",
    url: "https://podcasts.apple.com/us/podcast/the-reality-of-digital-nomad-life-warts-and/id778339885?i=1000638546195",
    quote: "The health scare that ultimately cut their travels short.",
    summary: "A long-form nomad interview connects an overseas health event with ending the travel plan and discusses navigating Thai hospitals.",
    category: "Health event trip disruption", severity: 10, confidence: 7, quality: 7,
  },
  {
    key: "facebook-visa", workflow: "visas", pattern: "compliance",
    sourceType: "Facebook Group", sourceName: "Moving to Portugal D7 & D8 — public discussion",
    url: "https://www.facebook.com/groups/269859389341804/posts/536407542686986/",
    quote: "I can show proof of required income through bank statements and tax returns but I don’t have any contracts.",
    summary: "A public visa-group participant has sufficient income evidence but cannot map a nonstandard work arrangement to the contract requirement.",
    category: "Eligibility evidence mismatch", severity: 8, confidence: 8, quality: 6,
  },
];

const patterns: PatternSeed[] = [
  {
    key: "compliance",
    name: "Visa and tax compliance is a fragmented moving target",
    workflow: "visas",
    problem: "Travelers must reconcile changing visa, work authorization, tax, social-security, insurance, document, appointment, and physical-presence rules across disconnected official portals and informal communities.",
    impact: "Rejected applications, unlawful work or overstay risk, missed appointments, duplicated legal work, thousands in fees, forced itinerary changes, and avoidable tax exposure.",
    notes: "Evidence spans Reddit applicants, Nomads.com tax discussions, a public Facebook visa group, and a practitioner podcast. The product must preserve official-source provenance and country-specific uncertainty.",
    scores: [92, 84, 90, 88, 92, 56],
  },
  {
    key: "identity-connectivity",
    name: "Connectivity failures cascade into identity and money lockouts",
    workflow: "connectivity",
    problem: "Changing SIMs and countries is treated as a data-plan purchase, but travelers also need to preserve a trusted phone identity, bank authentication, account recovery, reliable activation, and a tested outage fallback.",
    impact: "Arrival without data, inability to access money or work systems, duplicate plan purchases, missed account alerts, delayed travel, and exposure to roaming or emergency costs.",
    notes: "Evidence combines Reddit reports, Airalo product reviews, and App Store reviews. The pattern is broader than eSIM comparison.",
    scores: [88, 94, 91, 92, 86, 48],
  },
  {
    key: "housing-proof",
    name: "Monthly housing lacks proof of work readiness and safe recovery",
    workflow: "housing",
    problem: "Travelers choosing a one-to-twelve-month home cannot reliably verify internet, workspace, noise, utilities, listing identity, local lease fit, cancellation exposure, or replacement support before committing remotely.",
    impact: "Lost workdays, double payment for coworking or replacement lodging, deposit fraud, unsafe or unsuitable stays, and high switching costs after arrival.",
    notes: "Evidence spans Reddit, Nomads.com, a public Facebook group, Bogleheads, Rick Steves, and Airbnb product reviews.",
    scores: [91, 88, 78, 94, 91, 52],
  },
  {
    key: "move-operations",
    name: "Country moves create an unowned operational handover",
    workflow: "moving",
    problem: "Each move requires synchronized departure and arrival work across housing, transport, documents, visa status, SIMs, banking, insurance, work commitments, packing, local services, and relationships, but no provider owns the handover.",
    impact: "Decision fatigue, travel burnout, missed dependencies, work interruption, avoidable emergency spending, and travelers shortening or abandoning the lifestyle.",
    notes: "Evidence includes multiple independent YouTube commenters and long-term travel discussions.",
    scores: [84, 88, 91, 95, 87, 50],
  },
  {
    key: "work-continuity",
    name: "Remote-work continuity cannot be verified before arrival",
    workflow: "productivity",
    problem: "Housing and coworking discovery tools do not verify the combined conditions required for real work: stable internet and power, backup connectivity, call permissions, quiet, ergonomics, time-zone fit, and deadline resilience.",
    impact: "Missed calls and deadlines, longer workdays, duplicate workspace spend, client or employer risk, and burnout.",
    notes: "Evidence spans Reddit, a podcast, a YouTube comment, housing reports, and coworking reports.",
    scores: [86, 92, 86, 93, 84, 49],
  },
  {
    key: "care-continuity",
    name: "Healthcare and insurance break at country and document boundaries",
    workflow: "healthcare",
    problem: "Travelers struggle to distinguish emergency travel insurance from ongoing global health coverage, identify suitable local care, communicate history, obtain accepted claim documents, and preserve follow-up across moves.",
    impact: "Denied or delayed claims, large out-of-pocket costs, deferred preventive care, unsafe handoffs, repeated tests, and itinerary-ending health events.",
    notes: "Evidence spans Trustpilot, App Store, Reddit, and a long-form podcast. No medical advice is inferred from the complaints.",
    scores: [91, 72, 82, 92, 91, 58],
  },
  {
    key: "local-trust",
    name: "Travelers cannot quickly verify safe, foreigner-ready local help",
    workflow: "services",
    problem: "Generic ratings and destination advice do not answer whether a neighborhood, clinic, adviser, agent, or service is safe, language-compatible, transparent, and capable of handling foreign documents and payments.",
    impact: "Theft and scam exposure, unsafe care, entry problems, wasted time, language exhaustion, and reliance on unverified intermediaries.",
    notes: "This cluster remains a pain point until more direct evidence supports a focused product wedge.",
    scores: [89, 65, 75, 92, 84, 64],
  },
  {
    key: "financial-resilience",
    name: "Nomad budgets omit cross-category failure costs",
    workflow: "budgeting",
    problem: "Destination budgets and banking tools underrepresent deposits, compliance corrections, emergency flights, replacement connectivity, health costs, price volatility, and the need for cash across multiple institutions.",
    impact: "Insufficient reserves, debt, forced return, inability to absorb account holds, and poor destination decisions based on incomplete cost models.",
    notes: "Evidence is recurring but currently below the five-item promotion threshold.",
    scores: [86, 72, 76, 95, 78, 58],
  },
  {
    key: "routine-community",
    name: "Frequent moves reset routines and relationships",
    workflow: "connection",
    problem: "Every relocation disrupts sleep, exercise, focus, care habits, local relationships, and contact with home; community tools emphasize discovery but not durable recurring connection.",
    impact: "Loneliness, reduced productivity, physical and mental strain, shorter nomad tenure, and retreat to a fixed home base.",
    notes: "Evidence points to slow travel as a workaround. More interviews are needed before treating this as a standalone software opportunity.",
    scores: [83, 75, 68, 90, 72, 62],
  },
  {
    key: "travel-friction",
    name: "Packing and transport friction compounds across a long trip",
    workflow: "transport",
    problem: "Travelers repeatedly rebuild packing lists, power and connectivity kits, baggage decisions, local transport, and rest schedules without a reusable operational profile.",
    impact: "Physical strain, missed essentials, replacement purchases, stressful arrivals, and cumulative travel fatigue.",
    notes: "Three evidence items support the pattern; it remains unpromoted pending stronger recurrence and willingness-to-pay evidence.",
    scores: [70, 78, 77, 95, 66, 58],
  },
];

const opportunities: OpportunitySeed[] = [
  {
    pattern: "compliance",
    name: "Traveler Compliance Control Plane",
    persona: "Long-term international travelers, remote employees, freelancers, and couples planning multi-country stays; advisers and mobility teams are secondary users.",
    workaround: "Country-specific spreadsheets, saved Reddit and Facebook threads, embassy tabs, lawyers, calendar reminders, and manually renamed document folders.",
    currentWorkflow: "Build an itinerary; identify visa and work rules; gather time-sensitive documents; compare official and informal guidance; schedule appointments; track days and downstream tax or insurance consequences.",
    cost: "Evidence reports months of delay, thousands in legal and document fees, rejected applications, and forced travel changes.",
    alternatives: "Embassy portals, VFS, immigration lawyers, Nomads.com, relocation firms, generic checklists, calendars, and cloud storage.",
    insufficient: "Existing sources are country- or provider-specific, lack dependency tracking, become stale, and rarely show which claim is official, community-reported, or uncertain.",
    willingness: "Test US$19–49/month for self-serve planning and US$199–499 per active application; test adviser and employer plans separately.",
    aiOpportunity: "Use retrieval and structured rules to assemble a traveler-specific requirement graph from cited official sources, detect conflicts, explain uncertainty, and draft a checklist. Never present generated text as legal or tax advice; route high-risk cases to qualified professionals.",
    risks: "Legal and tax liability; fast-changing rules; jurisdictional coverage; false confidence; access to official sources; adviser channel conflict; sensitive identity documents.",
    moats: "Versioned requirement graph with source provenance; traveler outcome data; document dependency templates; adviser review network; change-detection history.",
    questions: "Which country transitions create the highest cost today?\nWhat proof would make a requirement trustworthy?\nWhich reminders or dependency errors have caused real loss?\nWhen is a lawyer mandatory versus optional?\nWould travelers pay per application or continuously?",
  },
  {
    pattern: "identity-connectivity",
    name: "Cross-Border Connectivity and Identity Continuity",
    persona: "Travelers who change countries regularly while retaining home-country banks, work accounts, and phone-based authentication.",
    workaround: "Dual-SIM phones, a cheap home plan, manual eSIM comparison, screenshots of setup instructions, backup cards, VOIP numbers, and airport SIM purchases.",
    currentWorkflow: "Choose a plan; confirm device and country support; install; retain the home line; test data and SMS; update account recovery; monitor expiry and fair-use limits; switch during outages.",
    cost: "Travelers report arrival without service, duplicate purchases, failed bank authentication, and inability to access essential accounts.",
    alternatives: "Airalo, Holafly, local carriers, home roaming, VOIP providers, password managers, Wise, and bank travel notices.",
    insufficient: "Connectivity vendors optimize the data-plan transaction, not the end-to-end outcome of remaining reachable, authenticated, funded, and online through a move.",
    willingness: "Test US$8–15/month for continuity monitoring plus affiliate or reseller margin on connectivity; test a US$49 pre-departure setup service.",
    aiOpportunity: "Generate a device-, itinerary-, and account-specific continuity plan; compare plan rules; flag incompatible authentication methods; monitor expiry; guide safe setup; trigger fallback options after a failed test.",
    risks: "Carrier dependency, device diversity, handling of security-sensitive account information, support burden during outages, and weak margins without distribution partnerships.",
    moats: "Device and carrier compatibility history; anonymized activation outcomes; destination-specific failure patterns; account-recovery playbooks; embedded distribution with insurers, employers, and travel platforms.",
    questions: "Which accounts still require the home number?\nWhat failed on the last country change?\nHow much is an hour without banking or work access worth?\nWould users share only account requirements rather than credentials?\nWho should provide emergency support?",
  },
  {
    pattern: "housing-proof",
    name: "Verified Work-Ready Monthly Stays",
    persona: "Remote workers and slow travelers booking furnished homes for one to twelve months without an in-person viewing.",
    workaround: "Ask hosts for speed tests and video calls, inspect review text, book a hotel first, search Facebook groups, pay for coworking, or accept a high-priced flexible platform.",
    currentWorkflow: "Search by neighborhood and dates; compare total monthly cost; verify identity, lease, internet, noise, desk, utilities, and cancellation; pay; inspect; resolve defects or relocate.",
    cost: "Evidence shows lost work, duplicate coworking and replacement lodging spend, deposit scam exposure, and high switching cost after arrival.",
    alternatives: "Airbnb monthly stays, Flatio, Booking.com, local agents, housing groups, coliving, and corporate-housing providers.",
    insufficient: "Tourist reviews and amenity checkboxes do not prove current internet, call noise, ergonomics, scam resistance, or a workable replacement path for a month-long stay.",
    willingness: "Test a traveler-paid US$49–99 verification fee, refundable booking protection, and host or property-manager subscription for verified status.",
    aiOpportunity: "Extract work-readiness claims from listings and reviews, detect contradictions, request missing proof, score verification freshness, and assemble a comparable total-cost and risk report. Human verification remains required for identity and disputes.",
    risks: "Marketplace cold start, verification fraud, local rental regulation, payments and deposits, liability for outages, and supply resistance to extra evidence.",
    moats: "Time-stamped internet and workspace proofs; stay-length-specific reviews; property issue and recovery history; verified host identity; insurer or escrow partnerships.",
    questions: "Which housing failure caused the largest work or cash loss?\nWhat evidence would you trust before paying?\nWould you pay for verification separately?\nHow fresh must internet and noise proof be?\nWho should bear replacement cost?",
  },
  {
    pattern: "move-operations",
    name: "Country Move Operations Manager",
    persona: "Individuals, couples, and families moving between countries every one to twelve months while continuing to work.",
    workaround: "Reusable Notion pages, spreadsheets, calendar reminders, email search, packing lists, screenshots, and memory.",
    currentWorkflow: "Close the old stay and services; preserve records, deposits, phone, money, and care; coordinate transport and work; activate the next home, data, local transport, services, and compliance tasks.",
    cost: "Evidence links constant planning and transport to fatigue, missed dependencies, work conflict, and abandonment of continuous travel.",
    alternatives: "TripIt, Notion templates, calendar, Rome2Rio, airline apps, packing apps, relocation agents, and destination guides.",
    insufficient: "Existing tools organize reservations or generic tasks but do not model cross-category dependencies, ownership, evidence, and a reusable traveler profile across moves.",
    willingness: "Test US$12–25/month for active travelers and a US$79 assisted move review; test employer mobility sponsorship.",
    aiOpportunity: "Create a dependency-aware handover plan from itinerary and traveler profile, extract reservations and deadlines, adapt reusable checklists, identify missing fallback coverage, and surface the next highest-risk action.",
    risks: "Broad scope, notification fatigue, itinerary access, reliance on third-party data, support expectations, and travelers defaulting to free general-purpose tools.",
    moats: "Longitudinal move history; dependency templates by country pair and traveler type; failure and recovery outcomes; integrations across booking, calendar, insurance, and connectivity.",
    questions: "Which tasks are forgotten most often?\nWhat must be complete before departure versus arrival?\nWhich information should persist across every move?\nWould couples assign ownership in the tool?\nWhat failure justifies a paid review?",
  },
  {
    pattern: "work-continuity",
    name: "Remote Work Readiness Verification",
    persona: "Remote employees, freelancers, and founders whose income depends on reliable calls, focus work, and secure connectivity abroad.",
    workaround: "Ask hosts, run speed tests after arrival, buy coworking day passes, carry a hotspot, search generic reviews, and move calls around time zones.",
    currentWorkflow: "Evaluate home and coworking options; verify internet, power, noise, calls, desk, VPN and time-zone fit; test backups; monitor conditions; relocate when the setup fails.",
    cost: "Evidence reports missed deadlines, always feeling behind, duplicate workspace spending, paid call rooms, and deadline risk during connectivity failures.",
    alternatives: "Coworker, Nomads.com, Google Maps, Airbnb amenity filters, Speedtest, local SIMs, coworking day passes, and employer VPN tools.",
    insufficient: "Each tool verifies one piece, while the real outcome depends on the combined chain of housing, workspace, primary and backup internet, power, calls, security, and working hours.",
    willingness: "Test US$9–19/month for readiness reports and monitoring; test employer-paid risk checks for approved work locations.",
    aiOpportunity: "Combine current proofs, user work requirements, time zones, call load, connectivity options, and outage reports into a readiness score with explicit evidence and fallback instructions.",
    risks: "Freshness of local data, false assurance, speed-test gaming, employer security rules, and overlap with housing and coworking marketplaces.",
    moats: "Work-requirement profiles; time-stamped infrastructure proofs; outage and recovery history; employer policy mappings; verified location performance by workload.",
    questions: "What minimum setup does the job actually require?\nWhich failure has affected income or performance?\nWould an employer pay to approve locations?\nHow often must proof refresh?\nIs housing verification or ongoing monitoring more valuable?",
  },
  {
    pattern: "care-continuity",
    name: "Global Care and Claims Navigator",
    persona: "Long-term travelers managing acute, preventive, or follow-up care across countries and insurance systems.",
    workaround: "Search Google Maps and expat groups, contact insurer chat, pay cash, translate records, scan documents, and manually chase clinics and claims teams.",
    currentWorkflow: "Choose care; confirm network and coverage; book; communicate history; pay; obtain acceptable records; submit or appeal claims; schedule follow-up before the next move.",
    cost: "Evidence reports denied claims, six-week reimbursement delays, out-of-pocket care, language-dependent records, unsafe handoffs, and health events ending travel.",
    alternatives: "SafetyWing, World Nomads, insurer assistance lines, telemedicine, Google Maps, local private clinics, and translation apps.",
    insufficient: "Insurers focus on policy and claims, directories focus on discovery, and clinics focus on treatment; no layer owns cross-country continuity and document acceptance.",
    willingness: "Test US$15–30/month with insurer or employer sponsorship; test a US$49–149 assisted claim or care-navigation service.",
    aiOpportunity: "Translate and structure non-diagnostic records, map policy requirements to document checklists, identify missing claim fields, maintain a portable care timeline, and route medical decisions to licensed providers.",
    risks: "Medical and insurance regulation, privacy, emergency expectations, inaccurate translation, provider-network freshness, and liability boundaries.",
    moats: "Country- and insurer-specific document acceptance data; multilingual care handoff templates; provider capability verification; claim outcome feedback; trusted assistance network.",
    questions: "Where does the current care journey break?\nWhich documents are rejected most often?\nWould users pay the navigator or expect insurer coverage?\nHow should emergency cases be routed?\nWhat health data is necessary versus excessive?",
  },
];

const concepts: ConceptSeed[] = [
  {
    opportunity: "Traveler Compliance Control Plane",
    name: "Borderless Rules",
    pitch: "A cited, traveler-specific control plane that turns multi-country visa, tax, insurance, document, and deadline rules into one versioned dependency graph.",
    solution: "Users add citizenships, residence, work structure, employer constraints, and a tentative itinerary. Borderless Rules builds a source-cited requirement graph, marks uncertainty, tracks document freshness and presence days, and prepares a review packet for qualified advisers.",
    differentiation: "The unit of work is a traveler’s multi-country dependency graph, not a generic country article or static visa checklist.",
    beats: "It preserves source provenance, change history, deadlines, and cross-country conflicts while escalating legal and tax judgment instead of pretending to replace it.",
    mvp: "Support two high-volume country pathways and one citizenship cohort; official-source ingestion; itinerary and day tracking; document dependency checklist; alerts; adviser export; no document custody.",
    features: "Traveler profile\nVersioned official-source citations\nDependency and expiry timeline\nPresence-day tracker\nConflict and uncertainty flags\nAdviser review export",
    pricing: "US$29/month or US$249 per active application; validate adviser referral and employer plans.",
    distribution: "Country-specific public checkers, nomad communities, immigration and tax advisers, remote-employer mobility teams, and insurance partners.",
    risk: "A stale or overconfident rule can cause material harm.",
    moat: "Versioned rules graph, change history, verified applicant outcomes, and adviser-reviewed edge cases.",
    scores: [6, 8, 9, 9, 7, 5, 7],
  },
  {
    opportunity: "Cross-Border Connectivity and Identity Continuity",
    name: "Signal Continuity",
    pitch: "A pre-move continuity check that keeps data, trusted phone identity, banking access, and work authentication alive across country changes.",
    solution: "Signal Continuity maps devices, home-number requirements, account authentication methods, itinerary, and data needs; recommends primary and fallback connectivity; guides setup; and verifies critical SMS and account access before departure.",
    differentiation: "It optimizes successful account and work continuity, not merely the cheapest gigabytes.",
    beats: "It coordinates home-line retention, eSIM compatibility, bank authentication, expiry, and fallback tests across vendors.",
    mvp: "Device and itinerary intake; critical-account requirement inventory without credentials; plan comparison; activation checklist; pre-departure test; expiry alerts; emergency fallback card.",
    features: "Device compatibility\nHome-number retention map\nCritical-account checklist\nPrimary and backup plan comparison\nActivation verification\nExpiry and outage alerts",
    pricing: "US$9/month plus optional US$49 assisted setup.",
    distribution: "eSIM affiliates, digital banks, remote-work communities, travel insurers, device retailers, and relocation providers.",
    risk: "Support demand spikes exactly when carrier or device failures occur.",
    moat: "Activation outcome data by device, carrier, destination, and authentication method.",
    scores: [8, 9, 8, 7, 7, 7, 8],
  },
  {
    opportunity: "Verified Work-Ready Monthly Stays",
    name: "StayProof",
    pitch: "Independent, time-stamped proof that a monthly home is safe to book and ready for real remote work.",
    solution: "StayProof collects host identity, live video, recent internet and power tests, workspace measurements, noise windows, total monthly cost, lease and deposit terms, and issue-recovery commitments into a comparable report.",
    differentiation: "Verification is designed for living and working for one to twelve months, with evidence freshness and recovery terms visible before payment.",
    beats: "Tourist-star ratings and amenity checkboxes cannot prove current internet, noise, desk setup, listing identity, or replacement support.",
    mvp: "One city; independent remote verification; standardized video and speed test; document and deposit checklist; month-long guest review; replacement assistance through partners.",
    features: "Identity and listing verification\nTimestamped internet and power proof\nWorkspace and noise evidence\nTrue monthly cost\nLease and deposit risk flags\nRecovery commitment",
    pricing: "US$79 traveler verification fee; test host-paid verified status without compromising independence.",
    distribution: "Nomad housing groups, remote-work communities, local property managers, relocation advisers, and travel-insurance partnerships.",
    risk: "Verification cost and liability may exceed willingness to pay without strong local density.",
    moat: "Fresh property proofs, month-long work-condition history, and issue-recovery outcomes.",
    scores: [5, 8, 9, 8, 7, 5, 6],
  },
  {
    opportunity: "Country Move Operations Manager",
    name: "MoveOps",
    pitch: "A reusable operations manager for closing one country and becoming functional in the next without dropping housing, money, data, documents, care, or work.",
    solution: "MoveOps imports itinerary and reservations, applies a traveler profile, creates a dependency-aware handover, assigns tasks across a household, and highlights the next action most likely to block the move.",
    differentiation: "It models departure and arrival as one linked operational handover across categories.",
    beats: "Generic task managers and itinerary apps store lists and bookings but do not understand cross-border dependencies or preserve a reusable traveler setup.",
    mvp: "Country move template library; reusable traveler profile; reservation and calendar import; dependency graph; shared ownership; offline arrival pack; post-move review.",
    features: "Reusable traveler profile\nDeparture-arrival dependency plan\nShared task ownership\nReservation and deadline extraction\nOffline arrival pack\nFailure and lesson capture",
    pricing: "US$15/month while traveling or US$59 per move.",
    distribution: "Slow-travel communities, remote employers, relocation firms, travel newsletters, insurers, and coworking networks.",
    risk: "The product may become a broad checklist with weak retention unless it prevents measurable failures.",
    moat: "Longitudinal move outcomes and country-pair dependency templates.",
    scores: [8, 9, 8, 7, 7, 8, 8],
  },
  {
    opportunity: "Remote Work Readiness Verification",
    name: "WorkReady Abroad",
    pitch: "Evidence-backed readiness reports for the exact remote workload a traveler must perform at a home, coworking space, or destination.",
    solution: "Users define calls, security, bandwidth, hours, and ergonomics. WorkReady Abroad combines current infrastructure proof, time zones, venue rules, backup options, and recent failure reports into an auditable readiness plan.",
    differentiation: "A location can pass for asynchronous work and fail for sales calls; the score is workload-specific and evidence-backed.",
    beats: "General city scores, speed tests, and venue reviews do not test the complete chain or match it to a real job.",
    mvp: "Work-requirement profile; verified internet, power, call, and desk checks; time-zone overlay; backup-plan test; shareable employer report.",
    features: "Workload profile\nEvidence-backed venue checks\nTime-zone and call-fit analysis\nPrimary and backup connectivity\nEmployer-ready report\nFreshness alerts",
    pricing: "US$12/month traveler plan; test US$49 per employer-approved location.",
    distribution: "Remote employers, coworking operators, furnished-housing providers, VPN and eSIM partners, and remote-work communities.",
    risk: "Infrastructure changes quickly and a readiness score could be treated as a guarantee.",
    moat: "Workload-specific performance data and verified failure history.",
    scores: [7, 9, 8, 8, 7, 7, 8],
  },
  {
    opportunity: "Global Care and Claims Navigator",
    name: "CarePass Abroad",
    pitch: "A privacy-conscious care and claims navigator that keeps medical context, local provider choice, accepted documents, and follow-up intact across countries.",
    solution: "CarePass Abroad maintains a minimal portable care timeline, verifies provider and language capabilities, turns insurer requirements into a document checklist, structures translated records, and tracks claims and follow-up without giving medical advice.",
    differentiation: "The product owns the handoff between traveler, provider, and insurer across country boundaries.",
    beats: "Directories, translation apps, and insurer portals each cover one step and leave the traveler to reconcile the rest during illness.",
    mvp: "One insurer and two destinations; provider capability verification; minimal care summary; claim-document checklist; secure record links; reimbursement tracker; human assistance escalation.",
    features: "Portable care timeline\nProvider language and payment verification\nPolicy-to-document checklist\nStructured translation support\nClaim and reimbursement tracker\nHuman navigator escalation",
    pricing: "US$19/month or US$79 per assisted claim; validate insurer-paid distribution.",
    distribution: "Travel insurers, remote employers, nomad communities, telemedicine providers, and international clinics.",
    risk: "Privacy, medical boundaries, emergency expectations, and insurer cooperation.",
    moat: "Insurer-specific document outcomes, multilingual handoff templates, and verified provider capabilities.",
    scores: [5, 7, 9, 8, 6, 4, 6],
  },
];

const validationQuestions: Record<string, string> = {
  "Traveler Compliance Control Plane": [
    "Walk me through the last visa or residency application you managed.",
    "Where did you store requirements, documents, deadlines, and presence days?",
    "Which sources contradicted each other, and how did you decide what to trust?",
    "What mistake, delay, or professional fee cost the most?",
    "Which rules must come directly from an official source?",
    "When do you involve a lawyer or tax professional?",
    "Would a cited dependency timeline change your behavior before booking?",
    "Would you pay per application, monthly, or through an adviser?",
  ].join("\n"),
  "Cross-Border Connectivity and Identity Continuity": [
    "What happened the last time you changed SIMs or countries?",
    "Which accounts still depend on your home phone number?",
    "Have a bank, employer, or service rejected a foreign or VOIP number?",
    "How do you test data, SMS, and account recovery before departure?",
    "What backup do you use when an eSIM fails?",
    "What did the last connectivity failure cost in time or money?",
    "Would you share authentication requirements without sharing credentials?",
    "Would you pay for an assisted pre-departure continuity check?",
  ].join("\n"),
  "Verified Work-Ready Monthly Stays": [
    "Tell me about the last month-long home you booked remotely.",
    "Which listing claims were wrong or impossible to verify?",
    "How did internet, noise, desk quality, utilities, and neighborhood affect work?",
    "What did you do when the stay failed?",
    "What evidence would you trust before paying a deposit?",
    "How recent must a speed, noise, or video verification be?",
    "Would you pay US$79 for independent verification?",
    "Who should pay for replacement lodging after a verified claim fails?",
  ].join("\n"),
  "Country Move Operations Manager": [
    "Walk me through the final two weeks before your last country move.",
    "Which departure and arrival tasks depended on each other?",
    "What did you forget, repeat, or discover too late?",
    "How do partners divide ownership?",
    "Which information should persist across every move?",
    "What must be available offline on arrival?",
    "Which failure would justify paying for a move review?",
    "How often would you use this between moves?",
  ].join("\n"),
  "Remote Work Readiness Verification": [
    "Describe the minimum conditions your real work requires.",
    "When has a housing or coworking claim failed under an actual deadline?",
    "How do calls, VPN, power, noise, time zones, and ergonomics change the decision?",
    "What backup do you carry and when has it failed?",
    "Which proof would you trust before arrival?",
    "Would your employer pay to approve a work location?",
    "How frequently must readiness evidence refresh?",
    "Would you pay for a report, monitoring, or both?",
  ].join("\n"),
  "Global Care and Claims Navigator": [
    "Walk me through the last time you needed care abroad.",
    "How did you choose the provider and confirm language, payment, and coverage?",
    "Which records or claim documents were hard to obtain or rejected?",
    "How did you manage follow-up after moving?",
    "What information should be portable, and what should never be stored?",
    "When is human navigation essential?",
    "Would you pay directly or expect insurer or employer coverage?",
    "What outcome would make the service trustworthy?",
  ].join("\n"),
};

function score(scores: [number, number, number, number, number, number]) {
  const [pain, frequency, ai, market, gap, distribution] = scores;
  return Math.round(
    pain * 0.30 +
    frequency * 0.20 +
    ai * 0.20 +
    market * 0.10 +
    gap * 0.15 +
    (100 - distribution) * 0.05,
  );
}

function clearExistingIndustry() {
  const existing = db.prepare("SELECT id FROM industries WHERE name = ?").get(INDUSTRY_NAME) as { id: number } | undefined;
  if (!existing) return;
  const industryId = existing.id;
  const opportunityIds = (db.prepare("SELECT id FROM opportunities WHERE industry_id = ?").all(industryId) as { id: number }[]).map((row) => row.id);
  const conceptIds = opportunityIds.length
    ? (db.prepare(`SELECT id FROM product_concepts WHERE opportunity_id IN (${opportunityIds.map(() => "?").join(",")})`).all(...opportunityIds) as { id: number }[]).map((row) => row.id)
    : [];

  if (conceptIds.length) {
    db.prepare(`DELETE FROM experiments WHERE product_concept_id IN (${conceptIds.map(() => "?").join(",")})`).run(...conceptIds);
  }
  if (opportunityIds.length) {
    db.prepare(`DELETE FROM validation_packages WHERE opportunity_id IN (${opportunityIds.map(() => "?").join(",")})`).run(...opportunityIds);
    db.prepare(`DELETE FROM evidence_opportunities WHERE opportunity_id IN (${opportunityIds.map(() => "?").join(",")})`).run(...opportunityIds);
  }
  db.prepare("DELETE FROM interviews WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM product_concepts WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM opportunities WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM evidence_cluster_items WHERE cluster_id IN (SELECT id FROM evidence_clusters WHERE industry_id = ?)").run(industryId);
  db.prepare("DELETE FROM evidence_clusters WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM evidence_pain_points WHERE evidence_id IN (SELECT id FROM evidence WHERE industry_id = ?)").run(industryId);
  db.prepare("DELETE FROM evidence WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM pain_points WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM experiments WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM research_sessions WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM products WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM workflows WHERE industry_id = ?").run(industryId);
  db.prepare("DELETE FROM industries WHERE id = ?").run(industryId);
}

const populate = db.transaction(() => {
  clearExistingIndustry();

  const industryResult = db.prepare(`
    INSERT INTO industries (
      name, description, customer_types, core_business_objective, estimated_market_size,
      number_of_businesses, existing_software_vendors, notes, research_notes
    ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
  `).run(
    INDUSTRY_NAME,
    "People living and working outside their home country for one to twelve months, including digital nomads, slow travelers, remote employees, freelancers, founders, couples, and families. The scope is recurring travel operations rather than destination recommendations.",
    "Digital nomads\nSlow travelers\nRemote employees\nFreelancers and founders\nInternational couples and families\nLong-stay independent travelers",
    "Remain legally compliant, safely housed, healthy, connected, funded, and productive while repeatedly establishing daily life across countries.",
    "Global cross-border traveler segment; no unsupported top-down market-size claim was inserted. Validate reachable segments and willingness to pay through the included experiments.",
    products.map((product) => product.name).join(", "),
    "Research scope: operational problems experienced during one-to-twelve-month international stays. Destination inspiration and recommendation content are excluded.",
    "Evidence-first synthesis completed from public discussions, nomad forums, public Facebook group posts, YouTube comments, travel blogs, product and App Store reviews, travel software reviews, and podcasts. Quotes are stored with direct source URLs and source types.",
  );
  const industryId = Number(industryResult.lastInsertRowid);

  db.prepare(`
    INSERT INTO industry_pipeline (name, overall_score, status, research_stage, priority, notes)
    VALUES (?, ?, 'Researching', 'Experiments', 'High', ?)
    ON CONFLICT(name) DO UPDATE SET
      overall_score = excluded.overall_score,
      status = excluded.status,
      research_stage = excluded.research_stage,
      priority = excluded.priority,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    INDUSTRY_NAME,
    86,
    "Full evidence-first research pass populated on 2026-07-02. Six evidence-backed opportunities have validation plans, interview questions, product concepts, and experiments. No interviews are recorded as completed.",
  );

  const checklist = {
    industry_selected: true,
    workflows_mapped: true,
    software_products_identified: true,
    evidence_collected: true,
    evidence_clustered: true,
    opportunities_generated: true,
    validation_package_created: true,
    interviews_started: false,
    product_concepts_generated: true,
    experiment_launched: false,
  };
  const sessionResult = db.prepare(`
    INSERT INTO research_sessions (
      industry_id, started_date, status, checklist_json, notes, started_at, finished_at,
      duration_seconds, search_queries, sources_searched, workflows_created_count,
      evidence_created_count, evidence_clusters_created_count, opportunities_promoted_count,
      product_concepts_created_count, ai_model_used, full_run_log, action_type, name, research_stage
    ) VALUES (?, ?, 'Complete', ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Experiments')
  `).run(
    industryId,
    COLLECTED_DATE,
    JSON.stringify(checklist),
    "Desk research and synthesis are complete. Validation plans, interview questions, and not-started experiments are ready. No customer interview or experiment result has been fabricated.",
    "2026-07-02T12:00:00Z",
    "2026-07-02T18:00:00Z",
    [
      "digital nomad apartment internet scam monthly rental",
      "digital nomad visa tax fragmented requirements",
      "digital nomad eSIM 2FA banking access",
      "digital nomad health insurance claims reviews",
      "digital nomad coworking productivity time zones",
      "long term travel planning packing transport burnout",
      "digital nomad language safety local services",
    ].join("\n"),
    [
      "Reddit",
      "Nomads.com and Freaking Nomads forums",
      "Public Facebook group discussions",
      "YouTube comments",
      "Travel blogs",
      "Trustpilot product reviews",
      "Apple App Store reviews",
      "Travel software reviews",
      "Public travel and finance forums",
      "Podcasts",
    ].join("\n"),
    workflows.length,
    evidence.length,
    patterns.length,
    opportunities.length,
    concepts.length,
    "OpenAI GPT-5",
    [
      `[${COLLECTED_DATE}] Created industry and research session.`,
      `[${COLLECTED_DATE}] Mapped ${workflows.length} operational workflows and ${products.length} existing products.`,
      `[${COLLECTED_DATE}] Collected ${evidence.length} public evidence records with direct source URLs.`,
      `[${COLLECTED_DATE}] Synthesized ${patterns.length} evidence patterns and pain points after evidence collection.`,
      `[${COLLECTED_DATE}] Ranked patterns with the existing weighted scoring framework.`,
      `[${COLLECTED_DATE}] Promoted ${opportunities.length} qualifying patterns into evidence-backed opportunities.`,
      `[${COLLECTED_DATE}] Created product concepts only after evidence synthesis.`,
      `[${COLLECTED_DATE}] Created validation plans, interview questions, and not-started experiments. No interview or experiment outcome was invented.`,
    ].join("\n"),
    "Full Industry Research",
    `${INDUSTRY_NAME} — Full Research`,
  );
  const sessionId = Number(sessionResult.lastInsertRowid);

  const workflowIds = new Map<string, number>();
  const insertWorkflow = db.prepare(`
    INSERT INTO workflows (
      industry_id, name, who_does_it, frequency, current_tools_used, manual_steps,
      pain_description, notes, research_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of workflows) {
    const result = insertWorkflow.run(
      industryId,
      item.name,
      item.who,
      item.frequency,
      item.tools,
      item.steps,
      item.pain,
      "Mapped before opportunity synthesis.",
      `Operational workflow for ${INDUSTRY_NAME}; supported by the linked raw evidence and evidence patterns.`,
    );
    workflowIds.set(item.key, Number(result.lastInsertRowid));
  }

  const productIds = new Map<string, number>();
  const insertProduct = db.prepare(`
    INSERT INTO products (
      industry_id, product_name, website, pricing, target_customer, strengths,
      weaknesses, review_sources, notes, research_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of products) {
    const result = insertProduct.run(
      industryId,
      item.name,
      item.website,
      item.pricing,
      item.target,
      item.strengths,
      item.weaknesses,
      item.sources,
      item.notes,
      "Public product positioning and review sources collected during the 2026-07-02 research session. Pricing is marked variable or Custom where a stable universal price is unavailable.",
    );
    productIds.set(item.key, Number(result.lastInsertRowid));
  }

  const evidenceIds = new Map<string, number>();
  const patternEvidenceIds = new Map<string, number[]>();
  const insertEvidence = db.prepare(`
    INSERT INTO evidence (
      industry_id, research_session_id, workflow_id, product_id, source_type, source_name,
      source_url, quote_snippet, evidence_summary, pain_category, severity, confidence,
      date_collected, notes, evidence_quality_score, review_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
  `);
  for (const item of evidence) {
    const result = insertEvidence.run(
      industryId,
      sessionId,
      workflowIds.get(item.workflow),
      item.product ? productIds.get(item.product) : null,
      item.sourceType,
      item.sourceName,
      item.url,
      item.quote,
      item.summary,
      item.category,
      item.severity,
      item.confidence,
      COLLECTED_DATE,
      "Public-source evidence captured before pattern, pain-point, opportunity, or concept creation.",
      item.quality,
    );
    const id = Number(result.lastInsertRowid);
    evidenceIds.set(item.key, id);
    patternEvidenceIds.set(item.pattern, [...(patternEvidenceIds.get(item.pattern) ?? []), id]);
  }

  const patternIds = new Map<string, number>();
  const painPointIds = new Map<string, number>();
  const insertPattern = db.prepare(`
    INSERT INTO evidence_clusters (
      cluster_name, industry_id, research_session_id, workflow_id, problem_summary,
      business_impact, notes, pain_score, frequency_score, ai_leverage_score,
      market_size_score, competitive_gap_score, distribution_difficulty,
      opportunity_score, qualification_reason, scored_at, review_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'Approved')
  `);
  const insertPain = db.prepare(`
    INSERT INTO pain_points (
      industry_id, workflow_id, complaint_links, pain_summary, who_feels_pain,
      cost_of_pain, frequency, current_workaround, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const linkPatternEvidence = db.prepare("INSERT INTO evidence_cluster_items (cluster_id, evidence_id) VALUES (?, ?)");
  const linkPainEvidence = db.prepare("INSERT INTO evidence_pain_points (evidence_id, pain_point_id) VALUES (?, ?)");

  for (const item of patterns) {
    const supporting = patternEvidenceIds.get(item.key) ?? [];
    const opportunityScore = score(item.scores);
    const qualifies = supporting.length >= 5 && opportunityScore >= 80;
    const [pain, frequency, ai, market, gap, distribution] = item.scores;
    const reason = qualifies
      ? `Promoted after synthesis: ${supporting.length} linked evidence items and ${opportunityScore}/100 weighted Opportunity Score met the evidence-count and score thresholds.`
      : `Retained as an Evidence Pattern: ${supporting.length} linked evidence items and ${opportunityScore}/100 weighted Opportunity Score; more evidence or validation is required before promotion.`;
    const result = insertPattern.run(
      item.name,
      industryId,
      sessionId,
      workflowIds.get(item.workflow),
      item.problem,
      item.impact,
      item.notes,
      pain,
      frequency,
      ai,
      market,
      gap,
      distribution,
      opportunityScore,
      reason,
    );
    const patternId = Number(result.lastInsertRowid);
    patternIds.set(item.key, patternId);
    for (const evidenceId of supporting) linkPatternEvidence.run(patternId, evidenceId);

    const links = supporting
      .map((id) => (db.prepare("SELECT source_url FROM evidence WHERE id = ?").get(id) as { source_url: string }).source_url)
      .filter((value, index, all) => all.indexOf(value) === index)
      .join("\n");
    const painResult = insertPain.run(
      industryId,
      workflowIds.get(item.workflow),
      links,
      item.problem,
      "Long-term international travelers and remote workers; partners, families, employers, advisers, hosts, insurers, and providers share parts of the burden.",
      item.impact,
      workflows.find((workflow) => workflow.key === item.workflow)?.frequency ?? "Recurring",
      "Spreadsheets, saved posts, generic booking and travel apps, local agents, manual verification, and repeated troubleshooting.",
      `Synthesized only after linking ${supporting.length} raw evidence records. Evidence Pattern #${patternId}.`,
    );
    const painPointId = Number(painResult.lastInsertRowid);
    painPointIds.set(item.key, painPointId);
    for (const evidenceId of supporting) linkPainEvidence.run(evidenceId, painPointId);
  }

  const opportunityIds = new Map<string, number>();
  const insertOpportunity = db.prepare(`
    INSERT INTO opportunities (
      industry_id, research_session_id, workflow_id, pain_point_id, evidence_cluster_id,
      status, opportunity_name, problem_statement, user_persona, current_workaround,
      current_workflow, estimated_cost, existing_solutions, solutions_insufficient,
      estimated_willingness_to_pay, ai_opportunity, risks, moat_ideas, open_questions,
      confidence_score, promotion_reason, pain_score, frequency_score, ai_leverage_score,
      market_score, competitive_gap_score, distribution_difficulty, opportunity_score,
      generated_at, pain_severity, pain_frequency, willingness_to_pay, market_size_score,
      workflow_repetition, ai_leverage, competition_gap, distribution_access,
      mvp_simplicity, expansion_potential, urgency, why_now_strength, research_notes,
      review_status
    ) VALUES (
      ?, ?, ?, ?, ?, 'Needs Interviews', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved'
    )
  `);
  const linkOpportunityEvidence = db.prepare("INSERT INTO evidence_opportunities (evidence_id, opportunity_id) VALUES (?, ?)");

  for (const item of opportunities) {
    const pattern = patterns.find((candidate) => candidate.key === item.pattern);
    if (!pattern) throw new Error(`Missing pattern ${item.pattern}`);
    const supporting = patternEvidenceIds.get(item.pattern) ?? [];
    const opportunityScore = score(pattern.scores);
    const [pain, frequency, ai, market, gap, distribution] = pattern.scores;
    const result = insertOpportunity.run(
      industryId,
      sessionId,
      workflowIds.get(pattern.workflow),
      painPointIds.get(item.pattern),
      patternIds.get(item.pattern),
      item.name,
      pattern.problem,
      item.persona,
      item.workaround,
      item.currentWorkflow,
      item.cost,
      item.alternatives,
      item.insufficient,
      item.willingness,
      item.aiOpportunity,
      item.risks,
      item.moats,
      item.questions,
      8,
      `Promoted from Evidence Pattern #${patternIds.get(item.pattern)} with ${supporting.length} linked evidence records and a weighted Opportunity Score of ${opportunityScore}/100.`,
      pain,
      frequency,
      ai,
      market,
      gap,
      distribution,
      opportunityScore,
      Math.max(1, Math.round(pain / 10)),
      Math.max(1, Math.round(frequency / 10)),
      7,
      Math.max(1, Math.round(market / 10)),
      Math.max(1, Math.round(frequency / 10)),
      Math.max(1, Math.round(ai / 10)),
      Math.max(1, Math.round(gap / 10)),
      Math.max(1, Math.round((100 - distribution) / 10)),
      6,
      8,
      8,
      8,
      `Evidence-backed opportunity generated after raw evidence, pattern, and pain-point synthesis. Rank is determined by the existing weighted score: pain 30%, frequency 20%, AI leverage 20%, market 10%, competitive gap 15%, and inverse distribution difficulty 5%.`,
    );
    const opportunityId = Number(result.lastInsertRowid);
    opportunityIds.set(item.name, opportunityId);
    for (const evidenceId of supporting) linkOpportunityEvidence.run(evidenceId, opportunityId);

    const questions = validationQuestions[item.name];
    db.prepare(`
      INSERT INTO validation_packages (
        opportunity_id, research_session_id, interview_plan, interview_questions,
        target_interviewees, outreach_message, landing_page_draft, pricing_hypotheses,
        assumptions_to_test, mvp_scope, success_criteria, status, review_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 'Approved', ?)
    `).run(
      opportunityId,
      sessionId,
      "Complete 12–15 problem interviews in two weeks. Recruit at least five travelers who changed countries in the last 90 days, include experienced and first-year travelers, and include relevant secondary actors. Ask for the last real event before discussing a solution. Record disconfirming evidence and actual costs.",
      questions,
      `${item.persona}\nPrioritize people with a relevant failure in the last 90 days. Include at least two users of the named existing products and two people who paid a professional or replacement provider.`,
      `Hi — I’m researching how people traveling internationally for months at a time handle ${item.name.toLowerCase()}. I’m not selling anything. Could I ask about the last time this workflow failed or took more effort than expected? The call is 25 minutes, and I’ll share the anonymized findings.`,
      `${item.name}\n\nLong-term travel should not require rebuilding critical life operations in every country.\n\nJoin a small research cohort testing a focused way to reduce this specific failure. No destination recommendations and no broad travel feed.`,
      `${item.willingness}\nTest a no-card waitlist, a refundable concierge pre-order, and a paid manual pilot before building software.`,
      `The problem occurred recently and repeats across moves.\nThe traveler can quantify time, money, work, safety, or health impact.\nExisting tools do not solve the cross-provider workflow.\nA reachable buyer will pay for prevention or recovery.\nThe narrow MVP can deliver value without taking regulated responsibility.`,
      concepts.find((concept) => concept.opportunity === item.name)?.mvp,
      "At least 12 completed interviews; 8 report the problem in the last year; 6 quantify material impact; 5 reject the current workaround; 4 join a follow-up; 3 accept the proposed price range; and 2 place a refundable deposit or sign a paid concierge pilot.",
      "Interview questions are a validation plan, not completed interview evidence. No interviewee or result has been fabricated.",
    );
  }

  const conceptIds = new Map<string, number>();
  const insertConcept = db.prepare(`
    INSERT INTO product_concepts (
      opportunity_id, research_session_id, industry_id, concept_name, one_sentence_pitch,
      target_customer, proposed_solution, differentiation_summary, why_beats_existing_software,
      mvp_description, key_features, pricing_hypothesis, distribution_idea, main_risk,
      moat_ideas, review_status, ease_of_build, speed_to_validate, differentiation,
      monetization_potential, founder_fit, technical_risk, gtm_simplicity, research_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of concepts) {
    const opportunity = opportunities.find((candidate) => candidate.name === item.opportunity);
    if (!opportunity) throw new Error(`Missing opportunity ${item.opportunity}`);
    const result = insertConcept.run(
      opportunityIds.get(item.opportunity),
      sessionId,
      industryId,
      item.name,
      item.pitch,
      opportunity.persona,
      item.solution,
      item.differentiation,
      item.beats,
      item.mvp,
      item.features,
      item.pricing,
      item.distribution,
      item.risk,
      item.moat,
      ...item.scores,
      `Created only after ${evidence.length} evidence rows were grouped into ${patterns.length} patterns and six qualifying opportunities were ranked. Assumptions remain subject to the linked validation plan.`,
    );
    conceptIds.set(item.name, Number(result.lastInsertRowid));
  }

  const experimentsByConcept: Record<string, {
    hypothesis: string;
    method: string;
    users: string;
    outreach: string;
    criteria: string;
    next: string;
  }> = {
    "Borderless Rules": {
      hypothesis: "Travelers actively preparing a two-country move will pay for a source-cited dependency review before paying a lawyer for full-service representation.",
      method: "Concierge MVP: manually build a cited requirement graph for 10 qualified participants, charge a refundable US$99 deposit, and measure corrections found before booking or submission.",
      users: "Remote workers and freelancers applying for Portugal D8 or Spain DNV while planning a second-country stay.",
      outreach: "Planning a D8 or DNV application? I’m testing a cited dependency review that shows document expiries, appointments, presence days, and unresolved conflicts. Looking for 10 people with an active application.",
      criteria: "10 qualified calls; 5 deposits; 4 complete data intake; 3 identify a material missed dependency; 3 request ongoing tracking; zero unsupported legal or tax conclusions.",
      next: "Recruit through two public visa communities and three adviser referrals; deliver manually before building ingestion.",
    },
    "Signal Continuity": {
      hypothesis: "Frequent travelers will pay to prevent a country change from breaking data, SMS authentication, banking, and work access.",
      method: "Offer a US$39 assisted continuity audit using a structured account-requirement inventory and pre-departure test. Do not request credentials.",
      users: "Travelers changing countries in the next 30 days who retain home-country banks or employer systems.",
      outreach: "Changing countries soon? I’m testing a 30-minute continuity audit for eSIM setup, home-number retention, bank SMS, work login, expiry, and backup data—without collecting credentials.",
      criteria: "15 calls; 8 reveal an untested critical dependency; 5 pay; 4 complete the pre-departure test; fewer than 10% require emergency support after arrival.",
      next: "Create the no-credential intake and recruit users with recent eSIM or 2FA failures.",
    },
    "StayProof": {
      hypothesis: "A meaningful segment of month-long renters will pay US$79 for independent work-readiness and listing verification before transferring a deposit.",
      method: "In one city, manually verify 20 candidate listings with host identity, live video, recent speed and power tests, desk measurements, noise windows, and lease/deposit review.",
      users: "Remote workers booking one-to-three-month stays worth at least US$1,000/month.",
      outreach: "Booking a month-long remote-work stay? I’m testing independent proof of internet, desk, noise, listing identity, total cost, and recovery terms before you pay.",
      criteria: "20 discovery calls; 8 verification requests; 5 paid orders; 4 completed host checks; 3 decisions changed; refund requests under 15%.",
      next: "Select one dense nomad city and recruit two local verifiers plus five property managers.",
    },
    "MoveOps": {
      hypothesis: "Traveling households will pay for a dependency-aware move review when they can see a concrete risk that generic checklists missed.",
      method: "Run a manual two-week handover service for 12 upcoming moves using a reusable profile, shared task board, offline arrival pack, and post-move failure review.",
      users: "Individuals and couples moving countries within 45 days while working at least 20 hours per week.",
      outreach: "Moving countries while working? I’m testing a handover review that connects departure, housing, transport, documents, money, phone, insurance, and first-week setup.",
      criteria: "12 calls; 8 complete profiles; 5 pay US$49; 5 uncover a missed dependency; 4 reuse the profile for a second plan; no critical task missed by the service.",
      next: "Build the reusable traveler profile in a no-code prototype and recruit from slow-travel communities.",
    },
    "WorkReady Abroad": {
      hypothesis: "Remote workers or their employers will pay for current, workload-specific readiness proof before approving a location.",
      method: "Create 15 manual readiness reports for real homes and coworking spaces, matched to call load, bandwidth, VPN, power, hours, and backup requirements.",
      users: "Meeting-heavy remote workers with a planned stay of at least one month and remote employers with location-approval policies.",
      outreach: "I’m testing an evidence-backed remote-work readiness report for your exact calls, VPN, time zone, power, internet, desk, and backup needs before you arrive.",
      criteria: "15 reports; 8 reveal a material mismatch; 5 paid traveler reports or 2 employer pilots; 80% of checks remain accurate after arrival; 3 users request monitoring.",
      next: "Define three workload profiles and verify ten locations through local partners.",
    },
    "CarePass Abroad": {
      hypothesis: "Travelers with non-emergency claims or follow-up care will pay for document and handoff navigation if medical advice remains with licensed providers.",
      method: "Partner with one licensed assistance provider and one insurer broker to manually support 10 non-emergency cases across two countries.",
      users: "Long-term travelers with a recent outpatient claim, translated record, or cross-country follow-up requirement.",
      outreach: "Had care abroad and now dealing with records, insurer documents, translation, reimbursement, or follow-up? I’m researching a navigation service that does not provide medical advice.",
      criteria: "10 cases; 8 complete document checklists; 5 avoid a resubmission; 4 pay or receive sponsored access; median resolution time improves; no privacy or clinical-boundary incident.",
      next: "Secure compliance review and a human navigator before handling any health information.",
    },
  };

  const insertExperiment = db.prepare(`
    INSERT INTO experiments (
      product_concept_id, research_session_id, industry_id, hypothesis, validation_method,
      target_users, outreach_script, success_criteria, results, status, next_step,
      start_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Started', ?, NULL, NULL)
  `);
  for (const [conceptName, experiment] of Object.entries(experimentsByConcept)) {
    insertExperiment.run(
      conceptIds.get(conceptName),
      sessionId,
      industryId,
      experiment.hypothesis,
      experiment.method,
      experiment.users,
      experiment.outreach,
      experiment.criteria,
      "Not started. No result has been invented.",
      experiment.next,
    );
  }

  db.prepare(`
    UPDATE research_sessions SET
      workflows_created_count = ?,
      evidence_created_count = ?,
      evidence_clusters_created_count = ?,
      opportunities_promoted_count = ?,
      product_concepts_created_count = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(workflows.length, evidence.length, patterns.length, opportunities.length, concepts.length, sessionId);
});

populate.immediate();

const summary = db.prepare(`
  SELECT
    i.id AS industry_id,
    (SELECT COUNT(*) FROM workflows WHERE industry_id = i.id) AS workflows,
    (SELECT COUNT(*) FROM products WHERE industry_id = i.id) AS products,
    (SELECT COUNT(*) FROM evidence WHERE industry_id = i.id) AS evidence,
    (SELECT COUNT(*) FROM evidence_clusters WHERE industry_id = i.id) AS patterns,
    (SELECT COUNT(*) FROM pain_points WHERE industry_id = i.id) AS pain_points,
    (SELECT COUNT(*) FROM opportunities WHERE industry_id = i.id) AS opportunities,
    (SELECT COUNT(*) FROM product_concepts WHERE industry_id = i.id) AS concepts,
    (SELECT COUNT(*) FROM validation_packages vp JOIN opportunities o ON o.id = vp.opportunity_id WHERE o.industry_id = i.id) AS validation_plans,
    (SELECT COUNT(*) FROM experiments WHERE industry_id = i.id) AS experiments,
    (SELECT COUNT(*) FROM interviews WHERE industry_id = i.id) AS completed_interviews
  FROM industries i WHERE i.name = ?
`).get(INDUSTRY_NAME);

console.log(JSON.stringify(summary, null, 2));
