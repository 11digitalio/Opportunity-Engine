import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
export const databasePath = process.env.OPPORTUNITY_ENGINE_DB_PATH ?? path.join(dataDir, "opportunity-engine.db");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(databasePath, { timeout: 5000 });
db.pragma("foreign_keys = ON");

function tableExists(table: string) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table));
}

function columns(table: string) {
  if (!tableExists(table)) return new Set<string>();
  return new Set((db.pragma(`table_info(${table})`) as { name: string }[]).map((column) => column.name));
}

function addColumn(table: string, definition: string) {
  const name = definition.split(/\s+/)[0];
  if (tableExists(table) && !columns(table).has(name)) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("duplicate column name")) throw error;
    }
  }
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, customer_types TEXT,
      core_business_objective TEXT, estimated_market_size TEXT, number_of_businesses INTEGER, existing_software_vendors TEXT, notes TEXT,
      research_notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS industry_pipeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, overall_score INTEGER,
      status TEXT NOT NULL DEFAULT 'Backlog', research_stage TEXT NOT NULL DEFAULT 'Scoring',
      priority TEXT NOT NULL DEFAULT 'Medium', notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, name TEXT NOT NULL, who_does_it TEXT,
      frequency TEXT, current_tools_used TEXT, manual_steps TEXT, pain_description TEXT, notes TEXT, research_notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, product_name TEXT NOT NULL, website TEXT,
      pricing TEXT, target_customer TEXT, strengths TEXT, weaknesses TEXT, review_sources TEXT, notes TEXT, research_notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS research_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, started_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Not Started', checklist_json TEXT NOT NULL DEFAULT '{}', notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS pain_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, workflow_id INTEGER, complaint_links TEXT,
      pain_summary TEXT NOT NULL, who_feels_pain TEXT, cost_of_pain TEXT, frequency TEXT, current_workaround TEXT,
      notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, pain_point_id INTEGER, idea_name TEXT NOT NULL,
      one_sentence_pitch TEXT, target_customer TEXT, current_alternative TEXT, willingness_to_pay_estimate TEXT,
      mvp_description TEXT, distribution_idea TEXT, why_now TEXT, notes TEXT,
      pain_severity INTEGER NOT NULL DEFAULT 1, pain_frequency INTEGER NOT NULL DEFAULT 1,
      budget_score INTEGER NOT NULL DEFAULT 1, ai_leverage INTEGER NOT NULL DEFAULT 1,
      workflow_repetition INTEGER NOT NULL DEFAULT 1, market_size_score INTEGER NOT NULL DEFAULT 1,
      competition_gap INTEGER NOT NULL DEFAULT 1, distribution_access INTEGER NOT NULL DEFAULT 1,
      mvp_simplicity INTEGER NOT NULL DEFAULT 1, expansion_potential INTEGER NOT NULL DEFAULT 1,
      founder_fit INTEGER NOT NULL DEFAULT 1,
      total_score INTEGER GENERATED ALWAYS AS (
        pain_severity + pain_frequency + budget_score + ai_leverage + workflow_repetition + market_size_score +
        competition_gap + distribution_access + mvp_simplicity + expansion_potential + founder_fit
      ) STORED,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  addColumn("industries", "research_notes TEXT");
  addColumn("industries", "core_business_objective TEXT");
  addColumn("workflows", "research_notes TEXT");
  addColumn("products", "research_notes TEXT");

  const oldExperimentColumns = columns("experiments");
  const migrateExperiments = oldExperimentColumns.has("idea_id") && !oldExperimentColumns.has("product_concept_id");
  if (migrateExperiments && !tableExists("legacy_experiments")) db.exec("ALTER TABLE experiments RENAME TO legacy_experiments");

  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, workflow_id INTEGER, product_id INTEGER,
      source_type TEXT NOT NULL, source_name TEXT NOT NULL, source_url TEXT, quote_snippet TEXT NOT NULL,
      evidence_summary TEXT, pain_category TEXT, severity INTEGER NOT NULL DEFAULT 5, confidence INTEGER NOT NULL DEFAULT 5,
      date_collected TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS evidence_clusters (
      id INTEGER PRIMARY KEY AUTOINCREMENT, cluster_name TEXT NOT NULL, industry_id INTEGER NOT NULL,
      workflow_id INTEGER, problem_summary TEXT NOT NULL, business_impact TEXT, notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS evidence_cluster_items (
      cluster_id INTEGER NOT NULL, evidence_id INTEGER NOT NULL UNIQUE,
      PRIMARY KEY (cluster_id, evidence_id),
      FOREIGN KEY (cluster_id) REFERENCES evidence_clusters(id) ON DELETE CASCADE,
      FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, workflow_id INTEGER, pain_point_id INTEGER,
      evidence_cluster_id INTEGER, status TEXT NOT NULL DEFAULT 'Created',
      opportunity_name TEXT NOT NULL, problem_statement TEXT NOT NULL, user_persona TEXT, current_workaround TEXT,
      estimated_cost TEXT, existing_solutions TEXT, solutions_insufficient TEXT, why_now TEXT,
      confidence_score INTEGER NOT NULL DEFAULT 5, research_notes TEXT, notes TEXT,
      pain_severity INTEGER NOT NULL DEFAULT 5, pain_frequency INTEGER NOT NULL DEFAULT 5,
      willingness_to_pay INTEGER NOT NULL DEFAULT 5, market_size_score INTEGER NOT NULL DEFAULT 5,
      workflow_repetition INTEGER NOT NULL DEFAULT 5, ai_leverage INTEGER NOT NULL DEFAULT 5,
      competition_gap INTEGER NOT NULL DEFAULT 5, distribution_access INTEGER NOT NULL DEFAULT 5,
      mvp_simplicity INTEGER NOT NULL DEFAULT 5, expansion_potential INTEGER NOT NULL DEFAULT 5,
      urgency INTEGER NOT NULL DEFAULT 5, why_now_strength INTEGER NOT NULL DEFAULT 5,
      total_score INTEGER GENERATED ALWAYS AS (
        pain_severity + pain_frequency + willingness_to_pay + market_size_score + workflow_repetition + ai_leverage +
        competition_gap + distribution_access + mvp_simplicity + expansion_potential + urgency + why_now_strength
      ) STORED,
      legacy_pain_point_id INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
      FOREIGN KEY (pain_point_id) REFERENCES pain_points(id) ON DELETE SET NULL,
      FOREIGN KEY (evidence_cluster_id) REFERENCES evidence_clusters(id) ON DELETE RESTRICT
    );
    CREATE TABLE IF NOT EXISTS product_concepts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, opportunity_id INTEGER NOT NULL, concept_name TEXT NOT NULL,
      one_sentence_pitch TEXT, target_customer TEXT, proposed_solution TEXT, mvp_description TEXT, key_features TEXT,
      pricing_hypothesis TEXT, distribution_idea TEXT, main_risk TEXT, research_notes TEXT, notes TEXT,
      ease_of_build INTEGER NOT NULL DEFAULT 5, speed_to_validate INTEGER NOT NULL DEFAULT 5,
      differentiation INTEGER NOT NULL DEFAULT 5, monetization_potential INTEGER NOT NULL DEFAULT 5,
      founder_fit INTEGER NOT NULL DEFAULT 5, technical_risk INTEGER NOT NULL DEFAULT 5,
      gtm_simplicity INTEGER NOT NULL DEFAULT 5,
      total_score INTEGER GENERATED ALWAYS AS (
        ease_of_build + speed_to_validate + differentiation + monetization_potential + founder_fit + technical_risk + gtm_simplicity
      ) STORED,
      legacy_idea_id INTEGER UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS validation_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, opportunity_id INTEGER NOT NULL UNIQUE,
      interview_plan TEXT, interview_questions TEXT, target_interviewees TEXT,
      outreach_message TEXT, landing_page_draft TEXT, pricing_hypotheses TEXT,
      assumptions_to_test TEXT, mvp_scope TEXT, success_criteria TEXT,
      status TEXT NOT NULL DEFAULT 'Draft', review_status TEXT NOT NULL DEFAULT 'Approved',
      notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, industry_id INTEGER NOT NULL, opportunity_id INTEGER, product_concept_id INTEGER,
      interviewee_name TEXT NOT NULL, role_title TEXT, company TEXT, contact_method TEXT, date TEXT NOT NULL,
      transcript_notes TEXT, strongest_quote TEXT, pain_severity INTEGER NOT NULL DEFAULT 5, current_workaround TEXT,
      would_pay TEXT NOT NULL DEFAULT 'Maybe', willingness_to_pay_estimate TEXT, follow_up_needed TEXT NOT NULL DEFAULT 'No',
      notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL,
      FOREIGN KEY (product_concept_id) REFERENCES product_concepts(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS evidence_pain_points (
      evidence_id INTEGER NOT NULL, pain_point_id INTEGER NOT NULL, PRIMARY KEY (evidence_id, pain_point_id),
      FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
      FOREIGN KEY (pain_point_id) REFERENCES pain_points(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS evidence_opportunities (
      evidence_id INTEGER NOT NULL, opportunity_id INTEGER NOT NULL, PRIMARY KEY (evidence_id, opportunity_id),
      FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_concept_id INTEGER NOT NULL, hypothesis TEXT NOT NULL,
      validation_method TEXT, target_users TEXT, outreach_script TEXT, success_criteria TEXT, results TEXT,
      status TEXT NOT NULL DEFAULT 'Not Started', next_step TEXT, start_date TEXT, end_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_concept_id) REFERENCES product_concepts(id) ON DELETE CASCADE
    );
  `);

  addColumn("opportunities", "evidence_cluster_id INTEGER REFERENCES evidence_clusters(id) ON DELETE RESTRICT");
  addColumn("opportunities", "status TEXT NOT NULL DEFAULT 'Created'");
  addColumn("opportunities", "current_workflow TEXT");
  addColumn("opportunities", "estimated_willingness_to_pay TEXT");
  addColumn("opportunities", "ai_opportunity TEXT");
  addColumn("opportunities", "risks TEXT");
  addColumn("opportunities", "moat_ideas TEXT");
  addColumn("opportunities", "open_questions TEXT");
  addColumn("opportunities", "promotion_reason TEXT");
  addColumn("opportunities", "pain_score INTEGER");
  addColumn("opportunities", "frequency_score INTEGER");
  addColumn("opportunities", "ai_leverage_score INTEGER");
  addColumn("opportunities", "market_score INTEGER");
  addColumn("opportunities", "competitive_gap_score INTEGER");
  addColumn("opportunities", "distribution_difficulty INTEGER");
  addColumn("opportunities", "opportunity_score INTEGER");
  addColumn("opportunities", "generated_at TEXT");
  addColumn("evidence_clusters", "pain_score INTEGER");
  addColumn("evidence_clusters", "frequency_score INTEGER");
  addColumn("evidence_clusters", "ai_leverage_score INTEGER");
  addColumn("evidence_clusters", "market_size_score INTEGER");
  addColumn("evidence_clusters", "competitive_gap_score INTEGER");
  addColumn("evidence_clusters", "distribution_difficulty INTEGER");
  addColumn("evidence_clusters", "opportunity_score INTEGER");
  addColumn("evidence_clusters", "qualification_reason TEXT");
  addColumn("evidence_clusters", "scored_at TEXT");
  addColumn("evidence", "evidence_quality_score INTEGER NOT NULL DEFAULT 5");
  addColumn("evidence", "review_status TEXT NOT NULL DEFAULT 'Approved'");
  addColumn("evidence_clusters", "review_status TEXT NOT NULL DEFAULT 'Approved'");
  addColumn("opportunities", "review_status TEXT NOT NULL DEFAULT 'Approved'");
  addColumn("product_concepts", "differentiation_summary TEXT");
  addColumn("product_concepts", "why_beats_existing_software TEXT");
  addColumn("product_concepts", "moat_ideas TEXT");
  addColumn("product_concepts", "review_status TEXT NOT NULL DEFAULT 'Approved'");
  addColumn("research_sessions", "started_at TEXT");
  addColumn("research_sessions", "finished_at TEXT");
  addColumn("research_sessions", "duration_seconds INTEGER");
  addColumn("research_sessions", "search_queries TEXT");
  addColumn("research_sessions", "sources_searched TEXT");
  addColumn("research_sessions", "workflows_created_count INTEGER NOT NULL DEFAULT 0");
  addColumn("research_sessions", "evidence_created_count INTEGER NOT NULL DEFAULT 0");
  addColumn("research_sessions", "evidence_clusters_created_count INTEGER NOT NULL DEFAULT 0");
  addColumn("research_sessions", "opportunities_promoted_count INTEGER NOT NULL DEFAULT 0");
  addColumn("research_sessions", "product_concepts_created_count INTEGER NOT NULL DEFAULT 0");
  addColumn("research_sessions", "ai_model_used TEXT");
  addColumn("research_sessions", "token_count INTEGER");
  addColumn("research_sessions", "cost_estimate REAL");
  addColumn("research_sessions", "full_run_log TEXT");
  addColumn("research_sessions", "action_type TEXT");
  addColumn("research_sessions", "name TEXT");
  addColumn("research_sessions", "research_stage TEXT NOT NULL DEFAULT 'Scoring'");
  addColumn("evidence", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("evidence_clusters", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("opportunities", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("validation_packages", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("interviews", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("product_concepts", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("product_concepts", "industry_id INTEGER REFERENCES industries(id) ON DELETE CASCADE");
  addColumn("experiments", "research_session_id INTEGER REFERENCES research_sessions(id) ON DELETE SET NULL");
  addColumn("experiments", "industry_id INTEGER REFERENCES industries(id) ON DELETE CASCADE");
  db.exec(`
    UPDATE opportunities SET status = 'Needs Interviews' WHERE status = 'Created';
    UPDATE opportunities SET status = 'Ready for Prototype' WHERE status = 'Validated';
    UPDATE research_sessions SET status = 'Running' WHERE status IN ('In Progress', 'Blocked');
    UPDATE research_sessions
      SET started_at = COALESCE(started_at, started_date || 'T00:00:00Z')
      WHERE started_at IS NULL;
    UPDATE industries SET notes = trim(COALESCE(notes || char(10), '') || 'Sample record — excluded from pipeline metrics and generation.')
      WHERE name LIKE '[Sample]%' AND COALESCE(notes, '') NOT LIKE '%excluded from pipeline metrics%';
    UPDATE evidence SET evidence_quality_score = CASE
      WHEN lower(source_type) = 'g2' THEN 7
      WHEN lower(source_type) IN ('capterra', 'app store', 'google play') THEN 6
      WHEN lower(source_type) IN ('reddit', 'forum', 'comment') THEN 5
      WHEN lower(source_type) LIKE '%owner%' OR lower(source_type) LIKE '%buyer%' THEN 10
      WHEN lower(source_type) LIKE '%revenue%' OR lower(source_type) LIKE '%payment%' THEN 10
      WHEN lower(source_type) LIKE '%support%' OR lower(source_type) LIKE '%internal%' THEN 9
      WHEN lower(source_type) = 'interview' OR lower(source_type) LIKE '%staff%' OR lower(source_type) LIKE '%user%' THEN 9
      ELSE evidence_quality_score END
      WHERE evidence_quality_score = 5;
  `);
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS opportunities_evidence_cluster_id_unique ON opportunities(evidence_cluster_id) WHERE evidence_cluster_id IS NOT NULL");

  migrateLegacyData();
  seedDatabase();
  seedIndustryPipeline();
  backfillResearchSessions();
}

function backfillResearchSessions() {
  const backfill = db.transaction(() => {
    const industry = db.prepare("SELECT id FROM industries WHERE name = 'Independent Dental Practices'").get() as { id: number } | undefined;
    if (!industry) return;

    const existing = db.prepare(`
      SELECT id FROM research_sessions
      WHERE industry_id = ? AND name = 'Independent Dental Practices — Initial Research'
      ORDER BY id LIMIT 1
    `).get(industry.id) as { id: number } | undefined;
    const prior = db.prepare(`
      SELECT id, started_at, full_run_log FROM research_sessions
      WHERE industry_id = ? ORDER BY datetime(COALESCE(started_at, started_date)), id
    `).all(industry.id) as { id: number; started_at: string | null; full_run_log: string | null }[];

    let sessionId = existing?.id;
    if (!sessionId) {
      const startedAt = prior[0]?.started_at ?? new Date().toISOString();
      const logs = prior.map((session) => session.full_run_log).filter(Boolean);
      logs.push(`[${new Date().toISOString()}] Existing Independent Dental Practices research linked to this session.`);
      const result = db.prepare(`
        INSERT INTO research_sessions (
          industry_id, name, started_date, started_at, status, research_stage,
          checklist_json, action_type, full_run_log
        ) VALUES (?, 'Independent Dental Practices — Initial Research', date(?), ?, 'Running', 'Interviews', '{}', 'Industry Research', ?)
      `).run(industry.id, startedAt, startedAt, logs.join("\n"));
      sessionId = Number(result.lastInsertRowid);
    }

    db.prepare("UPDATE evidence SET research_session_id = ? WHERE industry_id = ?").run(sessionId, industry.id);
    db.prepare("UPDATE evidence_clusters SET research_session_id = ? WHERE industry_id = ?").run(sessionId, industry.id);
    db.prepare("UPDATE opportunities SET research_session_id = ? WHERE industry_id = ?").run(sessionId, industry.id);
    db.prepare(`
      UPDATE validation_packages SET research_session_id = ?
      WHERE opportunity_id IN (SELECT id FROM opportunities WHERE industry_id = ?)
    `).run(sessionId, industry.id);
    db.prepare("UPDATE interviews SET research_session_id = ? WHERE industry_id = ?").run(sessionId, industry.id);
    db.prepare(`
      UPDATE product_concepts SET research_session_id = ?, industry_id = ?
      WHERE opportunity_id IN (SELECT id FROM opportunities WHERE industry_id = ?)
    `).run(sessionId, industry.id, industry.id);
    db.prepare(`
      UPDATE experiments SET research_session_id = ?, industry_id = ?
      WHERE product_concept_id IN (
        SELECT pc.id FROM product_concepts pc JOIN opportunities o ON o.id = pc.opportunity_id WHERE o.industry_id = ?
      )
    `).run(sessionId, industry.id, industry.id);

    const obsolete = prior.map((session) => session.id).filter((id) => id !== sessionId);
    if (obsolete.length) {
      db.prepare(`DELETE FROM research_sessions WHERE id IN (${obsolete.map(() => "?").join(",")})`).run(...obsolete);
    }
  });
  backfill.immediate();
}

function seedIndustryPipeline() {
  const names = [
    "Independent Dental Practices", "Veterinary Clinics", "Home Healthcare Agencies",
    "Behavioral Health Providers", "Physical Therapy Clinics", "Commercial HVAC Services",
    "Plumbing Companies", "Electrical Contractors", "Roofing Companies",
    "Restoration & Water Damage", "Commercial Property Management", "HOA Management Companies",
    "Self Storage Operators", "Freight Brokers", "Last-Mile Delivery Companies", "Fleet Management",
    "Accounting Firms", "Insurance Agencies", "Commercial Real Estate Brokerages", "Machine Shops",
    "Industrial Distributors", "Manufacturing Quality Control", "Hotel Management Companies",
    "Waste Management Companies", "Commercial Farming Operations",
  ];
  const insert = db.prepare(`
    INSERT OR IGNORE INTO industry_pipeline (name, status, research_stage, priority)
    VALUES (?, 'Backlog', 'Scoring', 'Medium')
  `);
  const seed = db.transaction(() => names.forEach((name) => insert.run(name)));
  seed.immediate();
}

function migrateLegacyData() {
  const migration = db.transaction(() => {
    const version = db.prepare("SELECT value FROM app_meta WHERE key = 'schema_version'").get() as { value: string } | undefined;
    if (Number(version?.value ?? 0) >= 2) return;

    if (tableExists("complaints")) {
      const evidenceCount = (db.prepare("SELECT COUNT(*) count FROM evidence").get() as { count: number }).count;
      if (evidenceCount === 0) {
        db.exec(`
          INSERT INTO evidence (industry_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes, created_at, updated_at)
          SELECT industry_id, product_id,
            CASE WHEN lower(source) LIKE '%interview%' THEN 'Interview' WHEN lower(source) LIKE '%forum%' THEN 'Forum' ELSE 'Other' END,
            source, CASE WHEN source_url LIKE '%example.com%' THEN '' ELSE source_url END, quote_snippet, quote_snippet,
            complaint_category, severity, 5, date(created_at), notes, created_at, updated_at
          FROM complaints
        `);
      }
    }

    const opportunityCount = (db.prepare("SELECT COUNT(*) count FROM opportunities").get() as { count: number }).count;
    if (opportunityCount === 0 && tableExists("ideas")) {
      const legacyIdeas = db.prepare(`
        SELECT ideas.*, pp.workflow_id, pp.pain_summary, pp.who_feels_pain, pp.cost_of_pain, pp.current_workaround AS pain_workaround
        FROM ideas LEFT JOIN pain_points pp ON pp.id = ideas.pain_point_id ORDER BY ideas.id
      `).all() as Record<string, string | number | null>[];
      const opportunityByPain = new Map<string, number>();
      for (const idea of legacyIdeas) {
        const key = String(idea.pain_point_id ?? `idea-${idea.id}`);
        let opportunityId = opportunityByPain.get(key);
        if (!opportunityId) {
          const result = db.prepare(`
            INSERT INTO opportunities (
              industry_id, workflow_id, pain_point_id, opportunity_name, problem_statement, user_persona,
              current_workaround, estimated_cost, existing_solutions, solutions_insufficient, why_now,
              confidence_score, notes, pain_severity, pain_frequency, willingness_to_pay, market_size_score,
              workflow_repetition, ai_leverage, competition_gap, distribution_access, mvp_simplicity,
              expansion_potential, urgency, why_now_strength, legacy_pain_point_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            idea.industry_id, idea.workflow_id, idea.pain_point_id,
            `[Migrated] ${idea.pain_summary || idea.idea_name}`, idea.pain_summary || idea.one_sentence_pitch || idea.idea_name,
            idea.who_feels_pain || idea.target_customer, idea.pain_workaround || idea.current_alternative, idea.cost_of_pain,
            idea.current_alternative, "Not yet documented", idea.why_now, 4, "Migrated from the previous Ideas model.",
            idea.pain_severity, idea.pain_frequency, idea.budget_score, idea.market_size_score, idea.workflow_repetition,
            idea.ai_leverage, idea.competition_gap, idea.distribution_access, idea.mvp_simplicity,
            idea.expansion_potential, idea.pain_severity, 5, idea.pain_point_id, idea.created_at, idea.updated_at
          );
          opportunityId = Number(result.lastInsertRowid);
          opportunityByPain.set(key, opportunityId);
        }
        db.prepare(`
          INSERT OR IGNORE INTO product_concepts (
            opportunity_id, concept_name, one_sentence_pitch, target_customer, proposed_solution, mvp_description,
            pricing_hypothesis, distribution_idea, main_risk, notes, ease_of_build, speed_to_validate,
            differentiation, monetization_potential, founder_fit, technical_risk, gtm_simplicity,
            legacy_idea_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          opportunityId, idea.idea_name, idea.one_sentence_pitch, idea.target_customer, idea.one_sentence_pitch,
          idea.mvp_description, idea.willingness_to_pay_estimate, idea.distribution_idea, "Not yet documented",
          idea.notes, idea.mvp_simplicity, idea.mvp_simplicity, idea.competition_gap, idea.budget_score,
          idea.founder_fit, idea.ai_leverage, idea.distribution_access, idea.id, idea.created_at, idea.updated_at
        );
      }
    }

    if (tableExists("legacy_experiments")) {
      const newCount = (db.prepare("SELECT COUNT(*) count FROM experiments").get() as { count: number }).count;
      if (newCount === 0) {
        db.exec(`
          INSERT INTO experiments (product_concept_id, hypothesis, validation_method, target_users, outreach_script, results, status, next_step, created_at, updated_at)
          SELECT pc.id, le.hypothesis, le.validation_method, le.target_users, le.outreach_script, le.results, le.status, le.next_step, le.created_at, le.updated_at
          FROM legacy_experiments le JOIN product_concepts pc ON pc.legacy_idea_id = le.idea_id
        `);
      }
    }

    db.prepare("UPDATE products SET website = '' WHERE website LIKE '%example.com%'").run();
    db.prepare("UPDATE industries SET name = '[Sample] ' || name WHERE name IN ('Independent Dental Practices', 'Commercial HVAC Services', 'Property Management')").run();
    db.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('schema_version', '2')").run();
  });
  migration.immediate();
}

export function seedDatabase() {
  const seed = db.transaction(() => {
    const count = db.prepare("SELECT COUNT(*) AS count FROM industries").get() as { count: number };
    if (count.count > 0) return;

    const industryId = Number(db.prepare(`
      INSERT INTO industries (name, description, customer_types, estimated_market_size, number_of_businesses, existing_software_vendors, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("[Sample] Commercial HVAC Services", "Contractors maintaining HVAC systems for commercial buildings.", "Dispatchers and service managers", "Research needed", 110000, "ServiceTitan, Jobber", "Sample record — safe to delete.").lastInsertRowid);
    const workflowId = Number(db.prepare(`
      INSERT INTO workflows (industry_id, name, who_does_it, frequency, current_tools_used, manual_steps, pain_description, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(industryId, "[Sample] Emergency job dispatch", "Dispatcher", "Multiple times daily", "Phone and scheduling board", "Check skills, location, availability, then call technicians", "Slow matching can cause missed SLAs.", "Sample record — safe to delete.").lastInsertRowid);
    const painId = Number(db.prepare(`
      INSERT INTO pain_points (industry_id, workflow_id, pain_summary, who_feels_pain, cost_of_pain, frequency, current_workaround, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(industryId, workflowId, "[Sample] Emergency jobs are manually matched to technician skills and location.", "Dispatchers", "Missed SLAs and technician downtime", "Multiple times daily", "Phone calls and group texts", "Sample record — safe to delete.").lastInsertRowid);
    const evidenceId = Number(db.prepare(`
      INSERT INTO evidence (industry_id, workflow_id, source_type, source_name, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?)
    `).run(industryId, workflowId, "Interview", "Sample discovery interview", "It takes several calls to find a qualified technician for urgent jobs.", "Manual matching delays dispatch.", "Dispatch", 8, 6, "Sample record — safe to delete.").lastInsertRowid);
    db.prepare("INSERT INTO evidence_pain_points (evidence_id, pain_point_id) VALUES (?, ?)").run(evidenceId, painId);
    const clusterId = Number(db.prepare(`
      INSERT INTO evidence_clusters (cluster_name, industry_id, workflow_id, problem_summary, business_impact, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("[Sample] Emergency dispatch delays", industryId, workflowId, "Dispatchers cannot quickly identify the best qualified nearby technician.", "Missed SLA penalties and technician idle time.", "Sample record — safe to delete.").lastInsertRowid);
    db.prepare("INSERT INTO evidence_cluster_items (cluster_id, evidence_id) VALUES (?, ?)").run(clusterId, evidenceId);
  });
  seed.immediate();
}

initializeDatabase();
