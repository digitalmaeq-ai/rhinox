# TMC v3.16 — Comprehensive Content Registry

**Status:** Architecture baseline and source audit; implementation is not yet populated or release-ready.  
**Repository:** `digitalmaeq-ai/rhinox`  
**Branch:** `feature/tmc-v3-16-content-registry`  
**Curriculum authority:** Think • Move • Code! Master Curriculum v3.16.

## 1. Purpose

The TMC Content Registry is the canonical, versioned content layer for the Rhinox learning ecosystem. It supplies consistent curriculum identity, source references, learning steps, exercises, projects, assessments, media and progression relationships to:

- Code Studio and its guided lesson engine;
- Robot Lab and virtual/physical mission adapters;
- the TMC Learning Hub and book-linked QR destinations;
- Student Books, Activity Books and Teacher Guides;
- teacher and school dashboards;
- the future AI Tutor and recommendation service;
- the Club Edition, derived from the School Edition.

The registry is not a second curriculum and must not invent or rewrite curriculum. The approved Master Curriculum v3.16 is the source of curriculum structure. The books and guides provide age-appropriate delivery and teaching detail. Digital activities are mapped extensions, with their authorship and review status explicit.

## 2. Verified v3.16 source audit

The supplied workbook `Think-Move-Code-Master-Curriculum-v3.16_4.xlsx` was inspected directly.

- Workbook SHA-256: `bdfbf6f487000c5fbaadca1c890aa38bca85e147ed7d1d505a225ab3f3ce6f14`
- 24 worksheets.
- Master Matrix: 43 columns and 507 weekly records (508 rows including header).
- 13 levels: Nursery 1, Nursery 2 and Year 1–Year 11.
- 39 weekly records per level; 13 weeks per term; 3 terms per level.
- All expected level/term/week combinations are present.
- A blank Main strand is valid for some integration, revision, project, assessment or showcase weeks. Do not fill it by inference.
- Build and Create are sometimes blank where they are not required core parts. Do not invent missing source activities.

The 24 workbook sheets and their registry roles:

| Workbook sheet | Registry responsibility |
|---|---|
| Read Me | Curriculum rules, source authority and production principles |
| Competency Framework | Level competencies, minimum viable learner outcomes and exit evidence |
| Concept Ladders | Concept progression, prerequisites and future bridges |
| Robotics Ladders | Robotics skill progression |
| AI Progression | AI and emerging technology progression |
| Spiral Progression | Revisit and deepen concepts across levels |
| Hardware Progression | Hardware and kit progression |
| Coding & Hardware Path | Coding environments and hardware pathway |
| Level & Term Map | Stage, term title, big idea, strands, focus and coding tools |
| Master Matrix | 507 canonical weekly curriculum records |
| Club Edition | Derived club modules, pacing, builds and badges |
| Assessment | Age-banded evidence models and assessment policy |
| Teaching Methods | Pedagogy and instructional-method guidance |
| Mascots | Approved character identity and level mapping |
| Book Production Map | Book and teacher-resource deliverables by level |
| Book Copy | Learner-facing copy and character dialogue |
| Open Items | Unresolved editorial, curriculum and production decisions |
| Launch Pathway | Catch-up/entry pathways for schools adopting TMC mid-sequence |
| Curriculum Alignment | NERDC and other alignment evidence |
| Lagos & Federal Map | Nigerian scheme/reference mapping |
| International Standards | International evidence mapping |
| Other Schemes (reference) | Additional comparison evidence |
| Sources | Reference bibliography and source records |
| Modernisation Guide | Curriculum maintenance and update policy |

## 3. Source hierarchy and conflict handling

1. **Master Curriculum v3.16** governs level, term, week, concepts, competencies, progression, hardware, platform, core parts, fallback and assessment intent.
2. **Student Book / Activity Book** governs learner-facing wording, page tasks, illustrations and learner interactions.
3. **Teacher Guide** governs teaching sequence, preparation, differentiation, safety, observation and marking guidance.
4. **Teacher Activity Guide / assessment bank** supplies teacher-only assessment and answer materials where the production map calls for them.
5. **Approved videos, QR assets, printables and games** support the relevant lesson; they do not override the curriculum.
6. **Digital lesson specifications** translate approved source material into Code Studio or Robot Lab interactions. They are editorial/digital adaptations, not source facts.

If sources disagree, create a conflict record linked to the affected lesson and source locations. Do not silently choose a version or overwrite one source with another. Resolve through editorial/curriculum review.

## 4. Registry entities

The shared contracts are defined in `types/tmc-registry.ts`. The registry is normalised into linked entities rather than a single oversized lesson JSON object.

### A. Curriculum record

One record for every Master Matrix row, keyed by a permanent ID:

`tmc-v3-16-{level-slug}-t{term}-w{week}`

Example: `tmc-v3-16-nursery-1-t1-w1`.

A curriculum record stores all 43 Master Matrix fields (including nullable fields) with source provenance. It is not automatically a runnable lesson.

### B. Learning steps

A lesson may contain Think, Move, Code, Build, Create, Test, Improve, Explain and Check steps. The Master Matrix's Think/Move/Code/Build/Create fields remain the source content. Test, Improve and Explain can be added as clearly attributed digital/teacher enrichments where supported by the source and pedagogy.

### C. Book and guide references

Link each weekly record to the applicable book edition, exact page range, activity label, section and QR destination. Store separate editions and revision history; do not assume every level has every book type. Follow the Book Production Map.

### D. Digital activities

Code Studio exercises and Robot Lab missions are separate linked records. A curriculum record can have:
- no digital interaction (unplugged lesson);
- one or more Code Studio exercises;
- one or more Robot Lab missions;
- a physical build or teacher-observed activity;
- a mixed sequence.

Do not force all 507 weeks into a code editor or robot simulator.

### E. Assessment and evidence

Keep the curriculum's assessment evidence separate from automated app checks. Each evidence item declares its mode: automatic, learner-confirmed, teacher-observed or portfolio-reviewed. Automated simulation success must never be described as proof that a learner physically built or understood a robot. Teacher observation remains authoritative where the curriculum says so.

### F. Assets and learning resources

Register QR codes, videos, transcripts, illustrations, diagrams, printables, games, badges, certificates, worksheets, teacher notes and club resources with audience, language, access level, status and provenance.

### G. Relationships

Use explicit edges for prerequisite, follows, teaches, assesses, supports, extends, companion, references, unlocks and part-of. This graph powers navigation, progression, recommendations and AI retrieval.

## 5. Product boundaries

| Consumer | Reads from registry | Writes back |
|---|---|---|
| Code Studio | Curriculum, lesson steps, exercises, starter projects, success criteria and fallbacks | Attempt events, automated evidence and learner project references |
| Robot Lab | Mission definition, robot profile, simulator config, allowed commands, build brief and safety notes | Simulator run evidence, mission result and project reference |
| Learning Hub | Level/term/week catalogue, book links, QR resources and videos | Resource completion and navigation events |
| Teacher workspace | Teacher guides, assessment criteria, rubrics, class assignments and evidence | Observation records, assessment decisions and feedback |
| AI Tutor | Approved learner-facing explanations, vocabulary, prerequisites and source references | No curriculum edits; proposed enrichment must enter editorial review |
| Club Edition | Derived module links, session plan, project and badge mapping | Session attendance, mastery checklist and showcase evidence |

The registry must not depend on React components. UI renderers consume typed data. Code execution adapters and Robot Lab simulation engines remain separate from curriculum definitions.

## 6. Content workflow and publication gates

Recommended lifecycle:

`source-only → imported → enrichment-draft → editorial-review → curriculum-review → approved → published`

A record can be archived without deleting its history. Draft, imported or merely curriculum-complete records are not launchable.

A Code Studio activity or Robot Lab mission may launch only when:
1. its curriculum record exists in the active version;
2. all required source fields and linked assets are present;
3. its age, reading level, platform and hardware requirements are appropriate;
4. its success criteria and evidence limitations are explicit;
5. its no-power/no-device/no-kit fallback is present where required;
6. automated checks have valid typed contracts;
7. teacher-observed evidence is not falsely automated;
8. the lesson wording and activity have been reviewed;
9. the exact activity spec is approved and registered in the reviewed-launch allowlist.

Stretch activities never block core completion or badges. Secure assessment answers and marking keys remain teacher-only.

## 7. Intellectual property and hosting boundary

The GitHub repository `digitalmaeq-ai/rhinox` is public. The full Master Matrix, complete book manuscripts, teacher guides, answer keys, proprietary illustrations and full lesson content must **not** be committed to it.

Public GitHub should contain:
- registry TypeScript contracts and validation code;
- import/export tooling;
- non-sensitive schema documentation;
- synthetic fixtures and tests;
- a non-sensitive manifest with counts, version and source hash;
- explicitly approved public preview records only.

Private content storage should contain:
- the complete v3.16 Master Matrix export/catalogue;
- complete book/guide text and page maps;
- teacher-only answers, rubrics and assessment banks;
- original media and licensed assets;
- full lesson specifications until approved for learner publication.

The server-side registry loader must enforce authentication, school/licence entitlement, audience and resource access. Never expose teacher-only fields or proprietary source files through client bundles, public static assets or unauthorised API routes. Do not add a paid database or storage provider without approval; the current local/private storage boundary remains the starting point.

## 8. v3.15 migration requirements

The current Code Studio V2 importer, catalogue types and documentation still contain v3.15 assumptions. Migration must:
- accept the actual v3.16 Master Matrix headers, including all 43 columns;
- retain every field, including alignment, visual requirements, QR/Hub links, video requirements, robot/maker challenge, chapter gate and hardware/platform fields;
- set curriculum version to 3.16 in every generated record and stable ID;
- validate exactly 507 records, 13 levels, 39 records per level and 13 weeks per term;
- preserve nullable strands and optional Build/Create values;
- report blank required core activities and other source validation issues without fabricating content;
- record workbook SHA-256, import time, importer/schema version and source sheet;
- create a deterministic private catalogue and per-level indexes;
- compare the 3.16 records with prior v3.15 content and produce a change report, never silently overwrite reviewed lesson specs;
- keep v3.15 records available for historical progress interpretation, but do not serve them as the current curriculum.

## 9. Existing repository findings

The V2 branch merged to `main` through PR #17 on 23 October 2026. Existing work includes the v2 learning route, guided lesson prototype, lesson gates, private curriculum loader, exercise contracts, robot simulator and a v3.15 importer.

The V2 curriculum import documentation explicitly says the full curriculum catalogue is private and not connected to the learner route. The current v3.15 importer is not sufficient for v3.16 and must be migrated before the full catalogue is connected.

The current reviewed/draft lesson-spec files are not a complete content registry. A draft or example lesson must not be promoted merely because its structure fits the new schema.

## 10. Available source material and gaps

Verified in the current working Library:
- `Think-Move-Code-Master-Curriculum-v3.16_4.xlsx` (the 24-sheet authority described above);
- `TMC-Nursery-1-Teacher-Guide-Interior-REVISED_1.pdf`;
- `TMC-Nursery-1-Activity-Book-Interior2-REVISED_4.pdf`;
- `Think_Move_Code_Nursery_1_Corrected_Manuscript_v3_16.docx`;
- earlier Nursery 1 student-book drafts and production/design references.

Repository and Library inspection did not establish that final, approved book/guide files exist for all 13 levels. The Book Production Map must determine expected deliverables; missing source files must be reported as gaps, not filled by generating guessed lesson copy. The Nursery 1 source set should be reconciled page-by-page first, then the same source-ingestion process can be applied to the next available level.

## 11. Acceptance criteria for the complete registry

- [ ] All 507 v3.16 Master Matrix records imported without missing or duplicate level/term/week keys.
- [ ] All 24 workbook sheets inventoried and mapped to registry entities or reference-only metadata.
- [ ] All 13 levels and 39 weekly records per level indexed.
- [ ] Every record preserves original nullable values and has source provenance.
- [ ] Book Production Map deliverables reconciled against actual files and editions.
- [ ] All available books and guides indexed by exact level, edition, page and week.
- [ ] QR, video, printable and illustration links checked; broken/placeholder links flagged.
- [ ] Digital lesson enrichments clearly distinguished from verbatim curriculum/book source.
- [ ] Code Studio exercise and Robot Lab mission mappings reviewed individually.
- [ ] Assessment/evidence model respects age band and teacher-observation requirements.
- [ ] Unresolved source conflicts and open items remain visible.
- [ ] Private content is not committed to public GitHub or exposed to unauthorised clients.
- [ ] Import, schema, access and progression tests pass before learner release.

## 12. Immediate implementation sequence

1. Finish the source inventory and page-level Nursery 1 reconciliation.
2. Upgrade the importer and validators from v3.15 to v3.16.
3. Generate the full private 507-record catalogue and manifest.
4. Build book/page/resource indexes from available Nursery 1 materials.
5. Create the lesson enrichment layer and link the existing reviewed lesson only after re-review against v3.16.
6. Add Code Studio and Robot Lab mappings as separate, review-gated records.
7. Connect the private server-side loader and test entitlement boundaries.
8. Expand level by level; do not mark missing books or unreviewed lessons as complete.
