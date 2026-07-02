BEGIN IMMEDIATE;

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Dentrix Ascend', 'https://www.dentrixascend.com/', 'Dental practices and groups', 'Cloud practice management system', 'Public complaints reviewed for scheduling, billing, and staff timekeeping workflows.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Dentrix Ascend');

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Weave', 'https://www.getweave.com/', 'Dental and other healthcare practices', 'Phones, texting, reminders, and patient communication', 'Public complaints reviewed for confirmations, recall, support, and communication workflows.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Weave');

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Flex', 'https://www.flex.dental/', 'Open Dental practices', 'Patient communication, forms, statements, and treatment presentation', 'Public complaints reviewed for treatment presentation and billing workflows.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Flex');

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Lighthouse 360', 'https://www.lh360.com/', 'Dental practices', 'Patient communication and recall software', 'Public complaints reviewed for pricing, support, and integration limitations.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Lighthouse 360');

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Practice by Numbers', 'https://www.practicenumbers.com/', 'Dental practices', 'Analytics and patient engagement', 'Public complaints reviewed for patient texting usability.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Practice by Numbers');

INSERT INTO products (industry_id, product_name, website, target_customer, notes, research_notes)
SELECT 2, 'Vyne Trellis', 'https://vynedental.com/trellis/', 'Dental practices', 'Claims, eligibility, and patient engagement', 'Referenced in public insurance verification and patient communication discussions.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE industry_id = 2 AND product_name = 'Vyne Trellis');

-- 1. New patient intake
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 2, NULL, 'Reddit', 'Built custom automation for a dental practice losing $8k/month', 'https://www.reddit.com/r/Dentists/comments/1rcs26s/', 'staff re-entered everything into their practice management software manually', 'Paper or PDF intake forms require duplicate manual entry into the PMS.', 'Manual data entry', 7, 8, '2026-07-01', 'First-person account from a developer describing the observed workflow in a dental practice; operational claim is specific and measurable.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentists/comments/1rcs26s/' AND quote_snippet = 'staff re-entered everything into their practice management software manually');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 2, (SELECT id FROM products WHERE industry_id=2 AND product_name='Curve Dental'), 'Capterra', 'Curve Dental verified reviews', 'https://www.capterra.com/p/98688/Curve-Dental-Hero/reviews/', 'I do wish there was a way to make certain fields of patient forms "Required"', 'Curve forms can be submitted without fields the practice considers mandatory, creating follow-up work and incomplete records.', 'Incomplete intake data', 6, 9, '2026-07-01', 'Verified-user review; direct product-specific limitation.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/98688/Curve-Dental-Hero/reviews/' AND quote_snippet = 'I do wish there was a way to make certain fields of patient forms "Required"');

-- 2. Appointment scheduling
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 3, NULL, 'Reddit', 'Online Scheduling?', 'https://www.reddit.com/r/Dentists/comments/1adivth/', 'online scheduling isn''t favored due to higher no-show rates', 'Practices report that self-scheduled appointments can produce more no-shows.', 'No-shows', 7, 7, '2026-07-01', 'Public dental-practice discussion; complaint is operational but stated by the original poster as market feedback.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentists/comments/1adivth/' AND quote_snippet = 'online scheduling isn''t favored due to higher no-show rates');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 3, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix Ascend'), 'Reddit', 'Dentrix Ascend?', 'https://www.reddit.com/r/Dentistry/comments/1q7j4zv/', 'It does not have a lot of options available for customization.', 'Dentrix Ascend self-scheduling lacks enough customization for practice-specific booking rules.', 'Scheduling configuration', 6, 8, '2026-07-01', 'Practice owner/user feedback in a product discussion.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1q7j4zv/' AND quote_snippet = 'It does not have a lot of options available for customization.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 3, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix Ascend'), 'Reddit', 'Dentrix Ascend?', 'https://www.reddit.com/r/Dentistry/comments/1q7j4zv/', 'it didnt designate dr and assistant time', 'The scheduler did not visibly separate doctor and assistant time, limiting resource-aware appointment setup.', 'Resource scheduling', 7, 8, '2026-07-01', 'Separate user complaint on the same public product thread.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1q7j4zv/' AND quote_snippet = 'it didnt designate dr and assistant time');

-- 3. Appointment confirmation
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 4, (SELECT id FROM products WHERE industry_id=2 AND product_name='Weave'), 'Reddit', 'Thoughts on Weave? Pros and cons?', 'https://www.reddit.com/r/Dentistry/comments/1izx0fa/', 'So buggy it was unusable.', 'A dental user reports Weave was too unreliable to use for communication and confirmation workflows.', 'Reliability', 8, 8, '2026-07-01', 'Direct user complaint in a dental product discussion.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1izx0fa/' AND quote_snippet = 'So buggy it was unusable.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 4, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix'), 'Capterra', 'Dentrix verified reviews', 'https://www.capterra.com/p/2329/Dentrix/reviews/', 'texting with patients was not two way', 'Dentrix texting did not support real-time two-way confirmation conversations.', 'Communication limitation', 6, 9, '2026-07-01', 'Verified-user review; the reviewer also reported needing a separate unlinked website.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/2329/Dentrix/reviews/' AND quote_snippet = 'texting with patients was not two way');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 4, NULL, 'Reddit', 'Front desk + scheduling feels like constant chaos', 'https://www.reddit.com/r/Dentistry/comments/1pscb7g/', 'How do you handle confirmations + no-shows without living on your phone?', 'Manual confirmations consume staff attention and still leave practices exposed to no-shows.', 'Manual follow-up', 7, 8, '2026-07-01', 'Solo-practice owner describing the current workflow and asking peers for a workable system.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1pscb7g/' AND quote_snippet = 'How do you handle confirmations + no-shows without living on your phone?');

-- 4. Insurance verification
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 5, NULL, 'Reddit', 'Insurance verification???', 'https://www.reddit.com/r/Dentistry/comments/1ixbs9n/', 'insurance verification, it''s extremely long and tedious for us', 'Insurance verification is a major recurring front-desk time burden.', 'Administrative labor', 8, 8, '2026-07-01', 'Dental practice family member documenting the existing workflow.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1ixbs9n/' AND quote_snippet = 'insurance verification, it''s extremely long and tedious for us');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 5, NULL, 'Reddit', 'Insurance verification is still a pain', 'https://www.reddit.com/r/DentalBilling/comments/1rx4r6n/', 'checking different payer sites and then updating the same info again', 'Staff must switch among payer portals and duplicate eligibility data in the PMS.', 'Portal fragmentation', 8, 8, '2026-07-01', 'Direct complaint from a dental billing community.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalBilling/comments/1rx4r6n/' AND quote_snippet = 'checking different payer sites and then updating the same info again');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 5, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix'), 'Reddit', 'Insurance verification is still a pain', 'https://www.reddit.com/r/DentalBilling/comments/1rx4r6n/', 'it''s not notifying me if group numbers don''t match', 'Dentrix automated eligibility can miss group-number mismatches, forcing manual checks and risking benefit errors.', 'Verification accuracy', 9, 9, '2026-07-01', 'Product-specific report from the staff member discovering discrepancies.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalBilling/comments/1rx4r6n/' AND quote_snippet = 'it''s not notifying me if group numbers don''t match');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 5, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix'), 'Reddit', 'Insurance verification', 'https://www.reddit.com/r/Dentistry/comments/1jjzmp6/', 'we had some errors and it was expensive', 'A practice stopped Dentrix verification because errors undermined trust while the service remained costly.', 'Accuracy and cost', 9, 9, '2026-07-01', 'Direct report from a former user explaining why the office discontinued the service.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1jjzmp6/' AND quote_snippet = 'we had some errors and it was expensive');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 5, NULL, 'Reddit', 'Is insurance verification actually the worst part of the job?', 'https://www.reddit.com/r/orthodontics/comments/1s2cj6w/', 'even those are inaccurate at times', 'Software and online eligibility results can be inaccurate, so staff cannot safely eliminate manual review.', 'Verification accuracy', 8, 8, '2026-07-01', 'Orthodontic office user responding about actual verification tools.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/orthodontics/comments/1s2cj6w/' AND quote_snippet = 'even those are inaccurate at times');

-- 5. Treatment plan presentation
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 6, NULL, 'Reddit', 'Treatment plan presentation', 'https://www.reddit.com/r/Dentistry/comments/1ss6o6l/', 'I spend too much time going over their needs in too much detail', 'Complex presentations can overwhelm patients and reduce acceptance of valuable treatment.', 'Case acceptance', 8, 8, '2026-07-01', 'Dentist describes a recurring conversion problem, especially for $10k-$20k cases.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1ss6o6l/' AND quote_snippet = 'I spend too much time going over their needs in too much detail');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 6, NULL, 'Reddit', 'Presenting to patients using treatment plan software', 'https://www.reddit.com/r/Dentistry/comments/17ksgi8/', 'Software for treatment presentation often isn''t very helpful', 'Some presentation software reinforces treatment-heavy explanations instead of helping patients understand the underlying problem.', 'Low workflow value', 6, 8, '2026-07-01', 'Practicing dentist explains why software can work against case acceptance.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/17ksgi8/' AND quote_snippet = 'Software for treatment presentation often isn''t very helpful');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 6, (SELECT id FROM products WHERE industry_id=2 AND product_name='Flex'), 'Reddit', 'Patient statements in Open Dental are confusing after conversion', 'https://www.reddit.com/r/Dentistry/comments/1u8imq0/', 'Treatment plans require a lot of extra steps to present through Flex', 'Flex adds friction to treatment plan presentation instead of simplifying it.', 'Workflow complexity', 7, 9, '2026-07-01', 'Direct post-conversion report from a dental practice using Open Dental and Flex.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1u8imq0/' AND quote_snippet = 'Treatment plans require a lot of extra steps to present through Flex');

-- 6. Recall / patient reactivation
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 7, NULL, 'Reddit', 'Why is patient reactivation so incredibly difficult?', 'https://www.reddit.com/r/Dentistry/comments/1szlakr/', 'The front desk staff clearly hate making the calls, and the response rate is terrible.', 'Manual reactivation calls consume labor while producing poor response.', 'Low-yield outreach', 8, 9, '2026-07-01', 'Practice owner describing a large 18+ month inactive list and cold high-value consults.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1szlakr/' AND quote_snippet = 'The front desk staff clearly hate making the calls, and the response rate is terrible.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 7, NULL, 'Reddit', 'Built custom automation for a dental practice losing $8k/month', 'https://www.reddit.com/r/Dentists/comments/1rcs26s/', 'follow-ups were done whenever someone had a free moment - which was almost never', 'Recall and treatment follow-up are deferred indefinitely when they depend on spare staff time.', 'Follow-up failure', 8, 8, '2026-07-01', 'Observed practice workflow before automation.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentists/comments/1rcs26s/' AND quote_snippet = 'follow-ups were done whenever someone had a free moment - which was almost never');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 7, NULL, 'Reddit', 'How are general practice schedules looking?', 'https://www.reddit.com/r/Dentists/comments/1u1dm51/', 'She doesn''t take initiative in calling recalls', 'Recall activity depends heavily on individual front-desk execution, leaving production vulnerable when ownership is weak.', 'Process accountability', 8, 8, '2026-07-01', 'Dental biller/acting manager reports other clinical staff also making recall calls to compensate.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentists/comments/1u1dm51/' AND quote_snippet = 'She doesn''t take initiative in calling recalls');

-- 7. Billing & collections
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 8, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix'), 'Capterra', 'Dentrix verified reviews', 'https://www.capterra.com/p/2329/Dentrix/reviews/', 'close each month manually for more than a year and a half', 'A Dentrix failure forced manual month-end closing, consuming hours and reducing production.', 'Manual financial close', 9, 9, '2026-07-01', 'Verified user says escalation did not resolve the issue.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/2329/Dentrix/reviews/' AND quote_snippet = 'close each month manually for more than a year and a half');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 8, (SELECT id FROM products WHERE industry_id=2 AND product_name='Open Dental'), 'Capterra', 'Open Dental verified reviews', 'https://www.capterra.com/p/122350/Open-Dental/reviews/', 'balances are difficult to read', 'Open Dental ledger balances are hard to interpret across claim initiation and reconciliation.', 'Ledger clarity', 8, 9, '2026-07-01', 'Verified-user complaint specific to the ledger.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/122350/Open-Dental/reviews/' AND quote_snippet = 'balances are difficult to read');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 8, (SELECT id FROM products WHERE industry_id=2 AND product_name='Curve Dental'), 'Capterra', 'Curve Dental verified reviews', 'https://www.capterra.com/p/98688/Curve-Dental-Hero/reviews/', 'manually input the payment into the ledgers', 'Failed payment-terminal integration forced manual payment posting and weakened the patient portal.', 'Payment integration', 9, 9, '2026-07-01', 'Verified user reports trying four terminals over six months before giving up.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/98688/Curve-Dental-Hero/reviews/' AND quote_snippet = 'manually input the payment into the ledgers');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 8, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix Ascend'), 'Reddit', 'Awful Dentrix Ascend billing statements', 'https://www.reddit.com/r/Dentistry/comments/1hb6uj6/', 'calls first to question the balance or pays an incorrect amount', 'Unclear Ascend statements trigger avoidable calls and premature or incorrect patient payments.', 'Patient statement clarity', 9, 9, '2026-07-01', 'Practice reports constant patient complaints and calls.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1hb6uj6/' AND quote_snippet = 'calls first to question the balance or pays an incorrect amount');

-- 8. Claims submission
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 9, (SELECT id FROM products WHERE industry_id=2 AND product_name='Eaglesoft'), 'Reddit', 'Eaglesoft', 'https://www.reddit.com/r/DentalAssistant/comments/1eigvga/', 'process a claim at the same time it will crash', 'Eaglesoft crashes during multitasking around claims, interrupting front-desk work.', 'System reliability', 8, 8, '2026-07-01', 'Dental office user describes repeated crashes while trying to work efficiently.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalAssistant/comments/1eigvga/' AND quote_snippet = 'process a claim at the same time it will crash');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 9, NULL, 'Reddit', 'Dental Insurance Claims Bottleneck', 'https://www.reddit.com/r/askdentists/comments/1rp8zvk/', 'Insurances will deny whatever they can just because', 'Claims can be denied without a useful explanation even when practices submit requested material promptly.', 'Claim denial', 9, 7, '2026-07-01', 'Dental-office respondent describes payer behavior; source is public but the thread was initiated as market research.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/askdentists/comments/1rp8zvk/' AND quote_snippet = 'Insurances will deny whatever they can just because');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 9, NULL, 'Reddit', 'Dental Insurance Claims Headache', 'https://www.reddit.com/r/DentalAssistant/comments/1rp9872/', 'Make a checklist like for crowns: claim form, rationale, PA, perio chart', 'Claims require procedure-specific attachment and narrative checklists; missing one item creates rework or denial.', 'Documentation burden', 8, 8, '2026-07-01', 'Experienced dental assistant response describing training needed for claim submission.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalAssistant/comments/1rp9872/' AND quote_snippet = 'Make a checklist like for crowns: claim form, rationale, PA, perio chart');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 9, (SELECT id FROM products WHERE industry_id=2 AND product_name='Curve Dental'), 'Reddit', 'Dental software programs', 'https://www.reddit.com/r/Dentistry/comments/1nqh4j5/', 'insurance plans, claims, and ledgers leave a lot to be desired', 'An administrator working across multiple PMS products ranks Curve poorly for insurance and claims usability.', 'Claims usability', 7, 8, '2026-07-01', 'Comparative practitioner/admin feedback across nine software systems.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1nqh4j5/' AND quote_snippet = 'insurance plans, claims, and ledgers leave a lot to be desired');

-- 9. Clinical charting
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 10, (SELECT id FROM products WHERE industry_id=2 AND product_name='Eaglesoft'), 'Reddit', 'Eaglesoft', 'https://www.reddit.com/r/DentalAssistant/comments/1eigvga/', 'difficult to navigate, especially charting and perio charting', 'Eaglesoft charting and periodontal charting are difficult for staff to navigate.', 'Charting usability', 7, 8, '2026-07-01', 'Direct dental assistant user feedback.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalAssistant/comments/1eigvga/' AND quote_snippet = 'difficult to navigate, especially charting and perio charting');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 10, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix'), 'Capterra', 'Dentrix verified reviews', 'https://www.capterra.com/p/2329/Dentrix/reviews/', 'The imaging system was the most difficult part for me.', 'Dentrix imaging and X-ray transfer create a difficult clinical-record workflow.', 'Imaging workflow', 7, 9, '2026-07-01', 'Verified-user review from a specialty team manager.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.capterra.com/p/2329/Dentrix/reviews/' AND quote_snippet = 'The imaging system was the most difficult part for me.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 10, (SELECT id FROM products WHERE industry_id=2 AND product_name='Curve Dental'), 'Reddit', 'Can we please talk about Curve', 'https://www.reddit.com/r/DentalAssistant/comments/1o23i4i/', 'I have to do twice the steps and create a photo folder', 'Curve image organization requires duplicate steps to label and group clinical photos.', 'Clinical record organization', 7, 8, '2026-07-01', 'Dental assistant describing the daily image workflow.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalAssistant/comments/1o23i4i/' AND quote_snippet = 'I have to do twice the steps and create a photo folder');

-- 10. Hygiene recall
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 11, NULL, 'Reddit', 'RDH schedule with last-minute cancellations or no-shows', 'https://www.reddit.com/r/Dentistry/comments/1imozug/', 'We can expect a handful of last minute reschedules or no-shows each week.', 'Hygiene cancellations create expensive idle capacity at reported wages of $82-$85 per hour.', 'Idle chair capacity', 9, 9, '2026-07-01', 'Practice owner provides staffing, wage, and appointment-volume context.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1imozug/' AND quote_snippet = 'We can expect a handful of last minute reschedules or no-shows each week.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 11, (SELECT id FROM products WHERE industry_id=2 AND product_name='Weave'), 'Reddit', '2024 patient communication software', 'https://www.reddit.com/r/Dentistry/comments/1gbtxl9/', '25% of our active patient recall has not been contacted', 'Weave failed to contact a material share of active recall patients, forcing manual recall work and costing production.', 'Recall delivery failure', 10, 9, '2026-07-01', 'Practice reports tangible production losses and repeated troubleshooting.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1gbtxl9/' AND quote_snippet = '25% of our active patient recall has not been contacted');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 11, NULL, 'Reddit', 'How are general practice schedules looking?', 'https://www.reddit.com/r/Dentists/comments/1u1dm51/', 'the schedule can fall apart fast', 'When recall attempts and front-desk follow-up are weak, hygiene and provider schedules can become materially underfilled.', 'Recall execution', 9, 7, '2026-07-01', 'Peer response tied schedule deterioration to unanswered calls and incomplete recall work.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentists/comments/1u1dm51/' AND quote_snippet = 'the schedule can fall apart fast');

-- 11. Daily schedule optimization
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 12, NULL, 'Reddit', 'AI Scheduler', 'https://www.reddit.com/r/Dentistry/comments/1onghkk/', 'today''s schedule is proof they are ignoring me', 'Even documented scheduling protocols and training fail when staff must manually apply complex rules.', 'Protocol compliance', 8, 8, '2026-07-01', 'Practice owner reports seminars, meetings, cheat sheets, and consultant support did not prevent errors.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1onghkk/' AND quote_snippet = 'today''s schedule is proof they are ignoring me');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 12, NULL, 'Reddit', 'AI Scheduler', 'https://www.reddit.com/r/Dentistry/comments/1onghkk/', 'assistants do not need the scanner at the same time', 'The schedule must manually offset appointments competing for one intraoral scanner, creating resource conflicts.', 'Shared-resource conflict', 7, 9, '2026-07-01', 'Concrete resource constraint from the practice owner.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1onghkk/' AND quote_snippet = 'assistants do not need the scanner at the same time');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 12, NULL, 'Reddit', 'Check my schedule', 'https://www.reddit.com/r/Dentistry/comments/1nphq9d/', 'poor dentistry, poor patient care, poor office procedures and hygiene', 'Overpacked schedules leave insufficient time for notes, room turnover, lab cases, and quality care.', 'Overbooking', 10, 8, '2026-07-01', 'Practitioner response to a posted real schedule; operational consequences were explicitly described.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1nphq9d/' AND quote_snippet = 'poor dentistry, poor patient care, poor office procedures and hygiene');

-- 12. Patient communication
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 13, (SELECT id FROM products WHERE industry_id=2 AND product_name='Lighthouse 360'), 'Reddit', 'Patient communication system', 'https://www.reddit.com/r/Dentistry/comments/1r5fydb/', 'Lighthouse 360 is just so expensive $350 a month', 'A solo practice sees Lighthouse 360 as costly for its communication needs.', 'Software cost', 6, 8, '2026-07-01', 'Practice lists current stack and desired consolidation into Vyne.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1r5fydb/' AND quote_snippet = 'Lighthouse 360 is just so expensive $350 a month');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 13, (SELECT id FROM products WHERE industry_id=2 AND product_name='Weave'), 'Reddit', 'Patient communication system', 'https://www.reddit.com/r/Dentistry/comments/1r5fydb/', 'the support is downright horrible', 'Weave support quality makes communication problems harder for a practice to resolve.', 'Vendor support', 7, 8, '2026-07-01', 'Separate dental user responding with current Weave experience.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1r5fydb/' AND quote_snippet = 'the support is downright horrible');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 13, (SELECT id FROM products WHERE industry_id=2 AND product_name='Practice by Numbers'), 'Reddit', 'What do you use for Patient Communication?', 'https://www.reddit.com/r/Dentistry/comments/1ased7w/', 'Texting patients is kind of annoying because it isn''t as simple as Flex.', 'Practice by Numbers introduces more friction into routine patient texting than the user''s previous tool.', 'Messaging usability', 6, 8, '2026-07-01', 'User switched from Flex/Dental Intelligence and compares the daily workflow.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1ased7w/' AND quote_snippet = 'Texting patients is kind of annoying because it isn''t as simple as Flex.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 13, NULL, 'Reddit', 'Front desk + scheduling feels like constant chaos', 'https://www.reddit.com/r/Dentistry/comments/1pscb7g/', 'we miss calls, then we play phone tag', 'Phone, text, and WhatsApp fragmentation causes missed calls, phone tag, double bookings, and patient frustration.', 'Channel fragmentation', 8, 9, '2026-07-01', 'Solo-practice owner describes direct operational impact.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1pscb7g/' AND quote_snippet = 'we miss calls, then we play phone tag');

-- 13. Referral management
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 14, NULL, 'Reddit', 'Specialty letter headaches', 'https://www.reddit.com/r/Dentistry/comments/1s3glmf/', 'emails/attachments getting lost along the way', 'Referral correspondence is lost across mail, email, and attachments, breaking continuity of care.', 'Lost referral information', 8, 9, '2026-07-01', 'Dental specialist/practice discussion about same-day letters and delivery failures.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1s3glmf/' AND quote_snippet = 'emails/attachments getting lost along the way');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 14, NULL, 'Reddit', 'Specialty letter headaches', 'https://www.reddit.com/r/Dentistry/comments/1s3glmf/', 'Things explained in the letter, dentist never reads it.', 'Even delivered specialty correspondence can fail when the referring dentist does not review it.', 'Referral handoff failure', 7, 8, '2026-07-01', 'Separate recurring complaint in the same practitioner thread.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1s3glmf/' AND quote_snippet = 'Things explained in the letter, dentist never reads it.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 14, NULL, 'Industry Blog', 'Dentplicity — Your Fax Is Losing Cases', 'https://dentplicity.com/blog/dental-specialist-digital-referral-system', 'GP sends a fax. You miss it. Patient books with your competitor.', 'Fax-based referral intake can lose a case before the specialist contacts the patient.', 'Referral leakage', 9, 6, '2026-07-01', 'Vendor-authored industry article; concrete workflow is credible but confidence is reduced because the publisher sells referral software.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://dentplicity.com/blog/dental-specialist-digital-referral-system' AND quote_snippet = 'GP sends a fax. You miss it. Patient books with your competitor.');

-- 14. Lab case tracking
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 15, NULL, 'Reddit', 'My father is a dentist. He kept complaining about labs losing his cases.', 'https://www.reddit.com/r/dentallab/comments/1pr7k27/', 'Cases arrive late. Wrong shade. Lost cases.', 'Practices experience late, incorrect, and lost lab cases with poor status visibility.', 'Lab case failure', 9, 7, '2026-07-01', 'Developer relays repeated complaints from a dentist and interviews with lab owners; source has a product-building interest.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/dentallab/comments/1pr7k27/' AND quote_snippet = 'Cases arrive late. Wrong shade. Lost cases.');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 15, NULL, 'Reddit', 'My father is a dentist. He kept complaining about labs losing his cases.', 'https://www.reddit.com/r/dentallab/comments/1pr7k27/', 'No alerts for deadlines.', 'Labs using handwritten tickets and a single spreadsheet lack deadline alerts and real-time production status.', 'Deadline visibility', 9, 7, '2026-07-01', 'The post reports a lab losing a major dentist account after a missed deadline.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/dentallab/comments/1pr7k27/' AND quote_snippet = 'No alerts for deadlines.');

-- 15. Inventory management
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 16, NULL, 'Reddit', 'Inventory of Materials', 'https://www.reddit.com/r/Dentistry/comments/s92ap6/', 'We don''t really have a list that we keep track of inventory', 'Dental assistants rely on visual checks, verbal handoffs, and prior-order history instead of a live inventory record.', 'Inventory visibility', 7, 9, '2026-07-01', 'Direct dental assistant description of the office process.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/s92ap6/' AND quote_snippet = 'We don''t really have a list that we keep track of inventory');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 16, NULL, 'Reddit', 'Supply Ordering', 'https://www.reddit.com/r/Dentistry/comments/1rwc9tl/', 'When assistants did it they would easily have it over 6k a month.', 'Weak ordering controls increased monthly supply spending from roughly $3.5k to more than $6k.', 'Supply overspending', 9, 9, '2026-07-01', 'Dentist provides a direct before-and-after monthly cost comparison.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1rwc9tl/' AND quote_snippet = 'When assistants did it they would easily have it over 6k a month.');

-- 16. Staff scheduling
INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 17, (SELECT id FROM products WHERE industry_id=2 AND product_name='Dentrix Ascend'), 'Reddit', 'Problems with Dentrix Ascend', 'https://www.reddit.com/r/Dentistry/comments/1u73rko/', 'It doesn''t calculate overtime, and you can''t export the clock-in/out timestamps', 'Dentrix Ascend timekeeping cannot calculate or export data needed for overtime, forcing a separate paid service.', 'Timekeeping', 8, 9, '2026-07-01', 'Dentist documented the limitation after switching from Dentrix Legacy and contacting conversion support.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1u73rko/' AND quote_snippet = 'It doesn''t calculate overtime, and you can''t export the clock-in/out timestamps');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 17, NULL, 'Reddit', 'Scheduling changes with no notice', 'https://www.reddit.com/r/DentalAssistant/comments/14wxtcv/', 'they change your personal schedule with no notice', 'Patient schedule changes alter staff start times without notifying assistants, creating staffing and morale problems.', 'Schedule communication', 7, 9, '2026-07-01', 'Dental assistant provides a detailed example involving a changed start time.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/DentalAssistant/comments/14wxtcv/' AND quote_snippet = 'they change your personal schedule with no notice');

INSERT INTO evidence (industry_id, workflow_id, product_id, source_type, source_name, source_url, quote_snippet, evidence_summary, pain_category, severity, confidence, date_collected, notes)
SELECT 2, 17, NULL, 'Reddit', 'No hygienist — no temps', 'https://www.reddit.com/r/Dentistry/comments/1jixec3/', 'they sometimes cancel or no-show cuz they got a higher bid', 'Temp hygienists can be expensive and unreliable, forcing practices to reschedule patients or cover hygiene internally.', 'Temporary staffing', 9, 8, '2026-07-01', 'Practice owner reports local rates of $80-$90/hour and repeated temp reliability issues.'
WHERE NOT EXISTS (SELECT 1 FROM evidence WHERE source_url = 'https://www.reddit.com/r/Dentistry/comments/1jixec3/' AND quote_snippet = 'they sometimes cancel or no-show cuz they got a higher bid');

COMMIT;
