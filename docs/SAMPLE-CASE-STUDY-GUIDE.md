# Continuum: a guide to replacing the sample with real work

Review page: `/projects/sample-continuum/`.

From the project folder, run `npm run build`, then `npm run preview -- --port 4173`. Open `http://127.0.0.1:4173/projects/sample-continuum/`. This starts a local review server and does not publish the site. With a `/portfolio/` hosting base, the review path becomes `/portfolio/projects/sample-continuum/`.

Continuum is a fictional teaching project, not client work or evidence of Sumit’s employment achievements. Its research, eight-week timeline, team, quotes, and results are illustrative. At Sumit’s request, it now replaces CHIP-2 in the homepage’s first selected-work slot, clearly labeled as a fictional sample. It stays outside the seven real projects’ count and navigation loop, is always `noindex`, and is excluded from sitemap generation. The existing seven projects are unchanged.

The page presents **all fourteen sections as separate, numbered content blocks in the original brief's order**. Their labels, headings, and main explanations remain visible with the guide off. Use **Explain this structure** near the introduction to reveal one additional authoring note per section. Without JavaScript, those notes work as ordinary disclosures. Optional supporting evidence remains in separate disclosures.

## Three reading depths

- **15 seconds:** the hero and executive snapshot establish the product, scope, role, status, and strongest supported result.
- **60–90 seconds:** skim the headings, three decisions, product views, validation comparison, and impact. Their argument should stand without opening a disclosure.
- **5–10 minutes:** inspect the evidence, alternatives, edge cases, prototype, limitations, and reflection. These explain the reasoning without crowding the initial reading path.

## What belongs in each section

| Topic                      | Purpose                                               | Replace with real material                                                                 |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1. Project hero            | State the change and show the product                 | Approved product imagery and a specific outcome-oriented sentence                          |
| 2. Executive snapshot      | Establish role, scope, context, and result            | Exact ownership, project dates, team roles, release status, and qualified outcome          |
| 3. Context + system        | Explain the actors and dependencies                   | A small map of the real workflow, including the boundary of your work                      |
| 4. Problem + stakes        | Connect a product failure to its consequences         | An observed problem, who experienced it, operational cost, and why it mattered then        |
| 5. Success definition      | State the desired behavior before discussing results  | Original success criteria or honestly labeled retrospective proxies                        |
| 6. Designing for reality   | Explain constraint → design consequence               | Actual technical, policy, organizational, or delivery constraints                          |
| 7. Evidence + reframing    | Show how understanding changed                        | Initial assumption, observation, interpretation, and the revised opportunity               |
| 8. Product decisions       | Reveal judgment                                       | Three to five choices, alternatives, evidence, trade-offs, collaborators, and consequences |
| 9. Final experience        | Demonstrate what people can accomplish                | Screens and interactions grouped by user outcome, with concise annotations                 |
| 10. System details         | Explain the mechanism behind an important choice      | Relevant permissions, states, errors, recovery, accessibility, or reusable patterns        |
| 11. Validation + iteration | Connect an observation to a change and another check  | Task, participants, observed issue, revision, retest, and limitations                      |
| 12. Impact                 | Distinguish intended benefit from demonstrated change | User, product, and organizational results with sources and measurement context             |
| 13. Reflection + next bet  | Make uncertainty useful                               | What to preserve, what to change, and the next specific experiment                         |
| 14. Next project           | Continue the visitor’s exploration                    | A relevant real project with a clear title and visual                                      |

The compact index retains five navigation links with section ranges: Overview (02–03), Problem (04–07), Decisions (08), Solution (09–11), and Impact (12–13). These are navigation shortcuts, not merged content sections. Project Hero (01) opens the page; Next Project (14) closes it. Each of the fourteen sections has its own URL anchor, visible label, heading, and authoring note. Keep every section identifiable when the guide and supporting disclosures are closed.

The previously compacted sections now have independent anchors: `#context-system`, `#success-definition`, `#designing-for-reality`, `#evidence-reframing`, `#system-details`, `#validation-iteration`, and `#reflection-next-bet`. Existing `#overview`, `#problem`, `#decisions`, `#solution`, and `#impact` bookmarks still work.

## The sample's argument

The original assumption is “the form takes too long.” The illustrative observation is that workers cannot distinguish a local save from a delivered referral. The reframe is “make the handoff explicit.”

The three decisions depend on one another:

1. **Name the next owner.** A destination review makes responsibility clear before confirmation; the trade-off is an extra step.
2. **Saving is not sending.** An explicit queue preserves offline work; the trade-off is retry, acknowledgement, and reconciliation complexity.
3. **Give each role a useful queue.** Role-specific actions improve relevance; the trade-off is deeper navigation for cross-role information.

For real work, describe your actual influence. “I proposed,” “engineering identified,” “product prioritized,” and “we decided” carry different meanings. Do not adopt the sample's fictional stakeholder conversations as your own.

## Metrics and testimonial handling

The sample consistently uses **4/8 → 7/8 unassisted completions** and **150 → 105 seconds median task time**. The latter is an illustrative 30% reduction. These are invented teaching numbers, not data collected from users. Do not transfer them to another page, résumé, or project card.

For a real case, record the task definition, sample size, before/after conditions, dates, measurement method, and whether people repeated the task. Distinguish pilot evidence from production outcomes. Qualitative evidence is preferable to an unsupported percentage.

The sample Product Manager quote is explicitly fictional. Replace it only with authentic approved wording and attribution, or remove it. It does not establish an actual team, manager, or endorsement.

## Using the prototype

The simulation starts with synthetic record `DEMO-014` and two invented clinics. It requires a destination, preserves that choice when going Back, and confirms one handoff. With offline simulation enabled, it queues the handoff. Reconnect & send completes it once. Restart clears all state.

Nothing is stored or transmitted. The “queue” is in-memory teaching state, not production offline support. Reloading resets it. The sample provides no clinical interpretation or medical recommendations. A real offline product would need durable storage, server acknowledgement, permission enforcement, reconciliation, and an audit trail.

## Editing and reusable assets

- Narrative and editable queue interface: `projects/sample-continuum/index.html`.
- Sample-only presentation: `src/sample-case.css`; use existing typography and theme tokens.
- Guide, demonstration binding, and shallow reveal: `src/modules/sample-case.js`, loaded only on the sample page.
- Pure referral state model: `src/modules/referral-state.js`.
- Original SVG artwork source: `scripts/create-continuum-art.mjs`; run `node scripts/create-continuum-art.mjs` after editing it. Output stays under `public/assets/continuum/` and does not overwrite real project imagery.
- The SVGs embed the existing local fonts. The mobile hero is a deliberate composition rather than a scaled-down desktop canvas. Gallery captions and surrounding HTML provide the important explanations in readable text.

For a real case study, copy this page to a new project folder, replace the fictional content using the table above, and review the scope and evidence before adding it to selected work. The old `templates/case-study.html` remains a legacy concept scaffold; Continuum is the current decision-narrative example. Remove sample-specific `noindex` and sitemap exclusion only after the copied page is genuinely ready for public presentation.

## Current delivery boundary

The sample and shared loader replacement are complete, and all fourteen sample sections are individually visible. The subsequent Home phase now follows the brief’s nine parts, with three selected projects and a short teaser including Sumit’s confirmed anime interest. About now follows its seven required sections, with optional Recognition omitted until verified. Work now includes featured employment projects, separate freelance preview slots, additional summaries, and an archive; the sample remains outside that collection. Playground now follows Introduction → Experiment Grid → Experiment Detail, retaining its four working explorations with Idea / Experiment / Result notes. The shared quality/detail source pass is complete; visual review and browser measurements remain pending. Product Designer roles and freelance enquiries remain the intended audiences; no extra personal interests have been invented.

The old five-second waiting screen and visit schedule are retired. A 0.65-second wordmark-symbol entrance accompanies the normal page entrance. Navigation stays available, and reduced motion skips the decoration.
