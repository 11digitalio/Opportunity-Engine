# Opportunity Engine

A local-first workspace for evidence-driven vertical SaaS research. Data stays on your computer in SQLite.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The writable database is created automatically at `data/opportunity-engine.db`. A fresh checkout imports the committed `data/seed/opportunity-engine.db` snapshot, so local and deployed builds start from the same dataset. Existing records from the original Ideas model are migrated into Opportunities and Product Concepts.

## Keep deployment data in sync

After changing local records, update and commit the deployment seed:

```bash
npm run db:snapshot
git add data/seed/opportunity-engine.db
```

Vercel loads this committed seed into its writable temporary directory. It never depends on browser storage or an uncommitted local database. Because Vercel's filesystem is temporary, changes made in the deployed app return to the committed snapshot after a cold start or redeployment.

The **Data Source / Build Info** panel is visible during development. Set `SHOW_DATA_DEBUG=1` in a production environment to display it there; the panel reports the environment, build commit, seed revision, loaded source, and real/sample record counts.

## Research workflow

**Industry → Workflow → Evidence → Pain Point → Opportunity → Product Concept → Experiment**

1. Define an industry and the workflows performed inside it.
2. Collect evidence from reviews, forums, interviews, and other sources.
3. Group repeated evidence into a clear pain point.
4. Create an opportunity when the business problem has enough support.
5. Explore one or more product concepts as possible solutions.
6. Run experiments to test whether customers care enough to pay.

Definitions:

- **Evidence** is proof that a problem exists.
- **Opportunity** is the validated business problem.
- **Product Concept** is one possible solution to an opportunity.
- **Experiment** tests whether people care enough to pay.

Opportunity scores measure the quality of the business problem. Product concept scores measure the practicality and potential of a specific solution. Confidence is entered manually from 1–10; linked evidence and interview counts are shown beside it to keep the judgment grounded.

## Bulk evidence

Open **Evidence**, select **Bulk Add Evidence**, choose shared source details, and paste one snippet per line. Each non-empty line becomes a separate evidence record.

## Production build

```bash
npm run build
npm start
```

## Reset the database

Stop the development server, then run:

```bash
npm run db:reset
```

This permanently removes local records and restores one clearly marked sample research chain. Sample records can also be deleted normally in the app.
