# TMC Book-First Content Registry and v3.16 Curriculum Reference

**Status:** Stage 2 architecture baseline. Types and documentation only. No importer, no data and no runtime change yet.
**Repository:** `digitalmaeq-ai/rhinox`
**Branch:** `feature/tmc-v3-16-content-registry` (draft PR #66, not to be merged without owner approval)

## 1. The governing rule

> **The TMC Master Curriculum guides the development of the books. The approved books define the instructional content. Every other TMC educational resource, assessment and digital experience is developed from, and stays consistent with, those approved books.**

The relationship is a chain:

1. **Master Curriculum v3.16** guides how the books are developed and organised.
2. **Approved books** establish the actual instructional content.
3. **Everything else** (Teacher Guides, Code Studio, Robot Lab, assessments, videos, worksheets, games, QR pages, the AI Tutor) is derived from the approved books and points at an exact book lesson.

Nothing in the codebase may reverse this. In particular, a curriculum record is **never** the parent of a lesson, exercise, mission, assessment, worksheet, video or AI answer.

## 2. Role of the v3.16 curriculum reference catalogue

It exists for:
- the original level, term and week structure;
- intended coverage and progression, to support editorial checks ("does the book cover what was intended?");
- development provenance and traceability.

It does **not** supply learner-facing text, exercises, missions, assessments or tutor answers. Importing it is not approval to publish anything. Records carry `role: "reference-only"` so tooling can refuse to treat them as lessons.

### Source workbook (to be verified)

The workbook `Think-Move-Code-Master-Curriculum-v3.16_4.xlsx` is described in the task brief as:
- 24 worksheets; Master Matrix of 43 columns and 507 weekly records;
- 13 levels (Nursery 1, Nursery 2, Year 1 to Year 11), 39 records per level, 3 terms, 13 weeks per term.

**The workbook has not been supplied to the importer work yet.** These figures must be verified against the real file, including its SHA-256, before the importer reports them as fact.

Blank Main strand, Build, Create and alignment values can be legitimate and are preserved as blank. A missing activity that the source marks as a required core part is a source issue to report, never something to invent.

| Workbook sheet | Role in the reference catalogue |
|---|---|
| Read Me | Curriculum rules and production principles |
| Competency Framework | Level competencies and exit evidence |
| Concept Ladders | Concept progression and future bridges |
| Robotics Ladders | Robotics skill progression |
| AI Progression | AI and emerging technology progression |
| Spiral Progression | Revisit and deepen concepts across levels |
| Hardware Progression | Hardware and kit progression |
| Coding & Hardware Path | Coding environments and hardware pathway |
| Level & Term Map | Stage, term title, big idea, strands, focus, coding tools |
| Master Matrix | 507 weekly curriculum reference rows |
| Club Edition | Club module reference (separate programme, see section 8) |
| Assessment | Age-banded evidence models |
| Teaching Methods | Pedagogy guidance |
| Mascots | Approved character identity and level mapping |
| Book Production Map | Planned book and teacher-resource deliverables (plans, not evidence a book exists) |
| Book Copy | Character and dialogue guidance for book writing |
| Open Items | Unresolved editorial and production decisions |
| Launch Pathway | Entry pathways for schools adopting TMC mid-sequence |
| Curriculum Alignment | NERDC and other alignment evidence |
| Lagos & Federal Map | Nigerian scheme and reference mapping |
| International Standards | International evidence mapping |
| Other Schemes (reference) | Comparison evidence |
| Sources | Bibliography |
| Modernisation Guide | Maintenance and update policy |

## 3. Book Registry (the central instructional registry)

Defined in `types/tmc-registry.ts`.

**`TmcBook`** is one edition of one book: ID, title, type (student book, activity book, teacher guide, teacher activity guide, other), level, edition, version, language, audience, publication status, editorial status, availability, file location, file SHA-256, page count, source manuscript, provenance and related curriculum reference IDs. A new edition is a new record; the older one becomes `superseded`.

**`TmcBookLesson`** is one lesson or unit inside one book edition: lesson ID, book ID, level, term, week, chapter or unit, title, page range, concepts, vocabulary, learning instructions, activities, examples, practical tasks, projects, exercises, review questions, illustration links, digital resource links and approval status.

**`TmcBookLessonRef`** is the exact source location (book, lesson, pages, section, activity label). Every derived resource must carry one.

Book content is preserved as written. Import must not summarise, rewrite or generate instruction. Teacher-only items and answers carry `accessLevel: "teacher-only"`.

### Approval states

`draft`, `under-review`, `revised`, `approved`, `published`, `superseded`.

- Only `approved` or `published` editions may serve as the production instructional source.
- A revised or "final draft" manuscript is **not** approved. Moving a book to `approved` is an explicit owner decision recorded with who and when.
- `availability` (`verified`, `unverified`, `planned`, `missing`) is separate from approval. A planned book that appears only in the Book Production Map is `planned`, never complete.

### Edition and version management

Each book edition records its exact version and file SHA-256. If a file changes, it is a new version and its derived resources are re-reviewed. Page references are valid only for the edition they were taken from.

## 4. Derived resources

Code Studio activities and exercises, Robot Lab missions, assessments and every other resource extend `TmcDerivedBase`, which **requires** a `source: TmcBookLessonRef` and an `origin`:

- `book`: reproduces or directly follows an activity written in the book.
- `enrichment`: a digital extension. It must be labelled as enrichment, name its originating book lesson, must not contradict or replace the book, and must never be presented as a book activity.

Rules:
- A book lesson need not have a coding exercise, a Robot Lab mission or a digital version. Do not force one.
- Learning stages (think, move, code, build, create, test, improve, explain, check) are used only where the relevant book lesson contains them. There is no generic sequence imposed on every lesson.
- Assessments cover only concepts, activities and skills in the cited book lesson, and keep the age-appropriate method the book specifies. They are never generated from curriculum records.
- The AI Tutor uses approved book content as its primary source, names the book and lesson, separates approved content from enrichment, flags gaps, and never uses draft or unapproved books as authority.
- Crosswalks (`TmcBookCurriculumCrosswalk`) record where a book lesson covers, partly covers or extends the curriculum intent. A crosswalk is an editorial check, not a content dependency.

## 5. Legacy lessons

Lessons written before this rule (the v3.15 era) are not trusted by default.

- Do not rename a `tmc-v3-15-…` ID to v3.16 and call it migrated.
- Do not use curriculum similarity alone as proof that a legacy lesson matches a book lesson.
- To migrate: identify the legacy lesson, find the originating approved book lesson, confirm chapter and page, compare the content, record discrepancies, and migrate only when the match is reliable.
- Until then the lesson is a `TmcLegacyLessonMapping` with status `unresolved`. It stays out of the approved catalogue, its data is kept for compatibility, and it is flagged for editorial review.
- Do not regenerate legacy lessons from curriculum records.

## 6. Nursery 1 source set (first level to be perfected)

Nursery 1 is the template level. The other levels use the same pattern once their books exist. A level with no supplied book is `planned` or `missing`, not guessed.

Final-draft files supplied by the owner on 10 November 2026. Status: **revised (final draft), not approved**.

| Book | Source file | Pages | SHA-256 |
|---|---|---|---|
| Activity Book, interior | `TMC-Nursery-1-Activity-Book-Interior2-REVISED_4.pdf` | 110 | `f4de8066a97e4dd565d90dfe71569395f0e1a81ae32c47c481f03923ca8f3250` |
| Activity Book, cover | `TMC-Nursery-1-Activity-Book-Cover-REVISED_2.pdf` | 1 | `f946fb1d24b44abcea8d8f458e8aa0640c6ab321dfc5d837f9df22a82b4e8cbd` |
| Teacher Guide, interior | `TMC-Nursery-1-Teacher-Guide-Interior-REVISED_1.pdf` | 84 | `ba10825d494d41bc3bc74e635c31b60f5caf8720cc86067f1c29c6d5c2e52565` |

Not yet supplied or inspected: the corrected manuscript v3.16 (`.docx`), any Student Book and any Teacher Activity Guide. They are recorded as `unverified` or `missing` until seen.

Note on reading the Activity Book PDF: its embedded text layer is unreliable, so book content and page numbers must be taken from the rendered pages, not from text extraction.

## 7. Private content and access

The GitHub repository is public. These must **not** be committed to it:
- the full v3.16 workbook or any raw CSV export;
- generated private catalogues;
- complete book text or page maps;
- answer keys, marking guides and teacher-only content;
- original licensed media.

Public GitHub may hold: types and validation code, importer tooling, schema documentation, **synthetic** test fixtures, a non-sensitive manifest (counts, version, hash) and explicitly approved public previews.

Private content stays server-side under the existing boundary (`.private-data/…`, read only by server modules that require an authenticated, licensed learner and fail closed). Do not assume every resource uses the same store; follow the existing security architecture and recommend changes only where necessary. Never expose the full registry or catalogue to client components, never expose draft or unapproved lessons to learners, and never add a paid database or storage provider without approval.

Teacher-only and answer-key material is classified `teacher-only` and must not be served from public static paths.

## 8. Club Edition

The Club Edition is a separate programme. Its modules use their own ID namespace (`tmc-club-{module-slug}`), may reference approved book lessons and curriculum references, and are never mixed with book lesson IDs or the 507 school curriculum references.

## 9. Curriculum reference importer

Files: `scripts/lib/tmc-curriculum-reference.mjs` (pure logic), `scripts/import-tmc-curriculum-reference.mjs` (command line), `scripts/test-tmc-curriculum-reference-import.mjs` (tests, synthetic data only).

It reads the Master Matrix as CSV (no new dependency; export the sheet as UTF-8 CSV) and writes a **reference** catalogue. It does not read the book registry and produces no lesson content.

```
node scripts/import-tmc-curriculum-reference.mjs <master-matrix.csv> \
  --workbook <Think-Move-Code-Master-Curriculum-v3.16_4.xlsx> \
  [--out <dir>] [--version 3.16] [--dry-run]
```

Output (default `.private-data/tmc-curriculum-reference/v3.16/`, gitignored): `catalogue.json` (all records), `levels/<level>.json` (one per level), `manifest.json` (version, filenames, SHA-256 of the CSV and of the workbook if given, import date, counts, validation) and `source-issues.json`.

Behaviour:
- The 43 Master Matrix headers are an exact contract. A missing, extra, renamed or duplicate header fails the import.
- IDs are `tmc-v3-16-{level-slug}-t{term}-w{week}`. Every original column is kept in `rawSourceFields` and blank values stay `null`. Each record carries its source row number (header is row 1).
- Validation (errors fail the import and nothing is written): exactly 507 records, 13 levels, 39 per level, terms 1 to 3, weeks 1 to 13, no duplicates, no missing weeks, valid level, term and week.
- Source issues (reported, never corrected, do not fail the import): a core part of Build or Create whose column is blank. Blank strand, Build, Create and alignment fields are otherwise legitimate.
- Output inside the repository is refused unless it is under `.private-data/`.
- A workbook hash is recorded only if the workbook file is supplied; otherwise a warning is recorded and the hash is left `null`.

Run the tests: `node scripts/test-tmc-curriculum-reference-import.mjs` (also runs in CI).

Import is not approval to publish. The catalogue stays private and server-side.

## 10. Publication gate

A digital resource may reach learners only when all are true:
1. its book lesson exists in an `approved` or `published` book edition;
2. its exact page reference is recorded;
3. its origin is labelled (`book` or `enrichment`);
4. required assets and fallbacks are present;
5. evidence limits are explicit and teacher-observed evidence is not falsely automated;
6. wording and activity have been reviewed by a person;
7. it is registered in the reviewed-launch allowlist.

Stretch activities never block core completion.

## 11. Known limitations and unresolved items

- The v3.16_4 workbook and the corrected manuscript are not yet supplied to this work.
- No Nursery 1 book is approved yet. Approval is the owner's decision.
- Existing v3.15 lessons are unresolved legacy mappings until checked against the book.
- Page-level indexes for the Nursery 1 books are not built yet (Stage 3).
- Access classification of previously published Nursery 1 support files is pending an owner decision and is outside this stage.

## 12. Stage plan

1. Audit (done).
2. Architecture, types and documentation (this change).
3. Resource inventory and page-level Nursery 1 index.
4. Curriculum reference importer and tests (done).
5. Book Registry implementation.
6. Digital resource relationships.
7. Security and compatibility review.
8. Verification (tests, typecheck, lint, build).
