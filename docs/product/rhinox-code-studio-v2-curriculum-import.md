# V3.15 curriculum import procedure

## Why this exists

The V2 learner interface must use a versioned curriculum catalogue rather than treating exercise labels as proof of alignment. The current Learning Home prototype contains one detailed lesson record. The importer prepares the full weekly index without inventing missing fields.

## Input

Export the complete **Master Matrix** sheet from `Think-Move-Code-Master-Curriculum-v3.15.xlsx` as UTF-8 CSV. Do not use `rhinox_code_studio_curriculum_master_index_v3_15.csv`: that helper index currently contains only 213 records and omits the remainder of the curriculum. The importer accepts the actual workbook column names, including:

- `Level`, `Term`, `Week`, `Week type`, `Theme (child-facing)`, `Main strand`
- `Prior Learning`, `Future Bridge`, `Assessment Evidence`, `Kit / platform`
- `Core parts this week (must do)`, `Stretch (optional)`, `Fallback: no power / device / kit`, `Competency statement (from Competency Framework)`, `Code`
- `Practical activity`, `Check My Learning (weekly)`, `Mastery target`

Other Master Matrix columns are allowed and ignored by the importer. CSV quoted commas, escaped quotes and line breaks inside fields are supported. The older normalised helper-index schema is also accepted for migration/testing, but a partial file will fail the 507-record check.

## Run

From the repository root:

```bash
node scripts/import-code-studio-curriculum.mjs ./path/to/v3.15-master-matrix.csv
```

Optional output directory:

```bash
node scripts/import-code-studio-curriculum.mjs ./path/to/v3.15-master-matrix.csv ./.private-data/code-studio-v2/catalogue
```

The importer stops on missing fields, malformed CSV, duplicate week keys, duplicate matrix row identifiers, invalid levels or terms, missing themes, missing weeks, or a record count other than 507. It writes one JSON file per level and a manifest containing the source file hash.

## Release gates after import

1. Review record counts and manifest hash against the approved workbook export.
2. Compare all current exercises against the actual row objective, activity, assessment evidence, platform and no-device fallback. A matching theme label is not sufficient.
3. Store any richer lesson script separately from the Master Matrix index. Mark it as teacher-authored or editorially adapted; never imply those additional fields came directly from the workbook.
4. Link each activity by a stable curriculum key such as `tmc-v3-15-year-7-t1-w2`.
5. Run the import in a local checkout, inspect the generated JSON, and keep the full catalogue in private storage. Do **not** commit the full catalogue to this public repository. Commit only a reviewed public-preview subset or non-sensitive manifest metadata. Do not import unreviewed data into the production learner route.
6. Add regression checks for 507 records, 13 levels, 39 records per level, 3 terms per level, 13 weeks per term and unique level/term/week keys.

## Current status

The importer now accepts the workbook's actual Master Matrix headers and generates a combined `catalogue.json`, per-level JSON files, and a source-hash manifest under `.private-data/code-studio-v2/catalogue` by default. `.private-data/` is ignored by Git because the full curriculum is commercially valuable content and the GitHub repository is public. Regression tests cover both schemas and rejection of the incomplete 213-row helper index. GitHub Actions for commit `01a93a597b05bac4a6215c3bdfc6c1aeba182e05` passed importer regression tests, lint and production build. The generated full catalogue is **not yet committed or connected to the learner route**. The first prototype remains limited to one detailed lesson until the real full workbook export is imported and reviewed.

## Actual workbook export: independent local validation

The complete Master Matrix was inspected from the original `.xlsx`. It contains 508 rows including the header and 43 columns. The workbook contains exactly 507 unique level/term/week records, 39 per each of the 13 levels, and 156 intentionally blank primary strands for weeks where a single strand is not assigned. The private catalogue archive in the working environment contains 507 records, all 13 per-level files, a manifest, and an exercise-review file. It is not committed to this public repository.

A field-by-field comparison between the original workbook and all 507 records in that private catalogue found **zero missing keys and zero mismatches** across the mapped fields: level, term, week, week type, theme, focus, strand, Think/Move/Code/Build/Create, practical activity, weekly check, mastery target, prior learning, future bridge, assessment evidence, platform, core parts, stretch, fallback, competency, vocabulary, term big idea, cognitive demand and independence level. The archive manifest records source SHA-256 `77e90685e7347a7185c0fdcb6fe0978d8454c30e57a5ae64c08b396c170fc32b`.

**Important distinction:** this verifies that the private catalogue matches the mapped source workbook fields. The repository's JavaScript importer has passed synthetic regression tests in CI but has **not yet been executed against the exact source CSV**. The private catalogue is also **not deployed or connected to the learner route**. Existing exercise mappings still require semantic review; a curriculum row alone does not certify an exercise as aligned. Do not expose licensed lesson content until a real authentication and entitlement provider is connected server-side. The lesson component now receives an explicit `activities` prop from the server page rather than importing the catalogue itself. A server-only learner-access adapter currently returns `null` because no trusted identity/entitlement provider is configured; the licensed loader therefore fails closed. The current page intentionally passes only the one reviewed public-preview activity. This is an integration seam, not a completed authentication system.
