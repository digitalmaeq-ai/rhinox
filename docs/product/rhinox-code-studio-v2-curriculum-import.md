# V3.15 curriculum import procedure

## Why this exists

The V2 learner interface must use a versioned curriculum catalogue rather than treating exercise labels as proof of alignment. The current Learning Home prototype contains one detailed lesson record. The importer prepares the full weekly index without inventing missing fields.

## Input

Export the complete **Master Matrix** sheet from `Think-Move-Code-Master-Curriculum-v3.15.xlsx` as UTF-8 CSV. Do not use `rhinox_code_studio_curriculum_master_index_v3_15.csv` as importer input: it contains 507 weekly records but only 18 columns, omitting required source fields such as Focus, Think, Move, Build, Create and Mastery target. The importer accepts the actual workbook column names, including:

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

The importer stops on missing schema columns, malformed CSV, duplicate week keys, duplicate matrix row identifiers, invalid levels or terms, missing themes, missing weeks, or a record count other than 507. Build and Create may be blank only when they are not listed as core parts. If either is required by `Core parts this week (must do)` but the corresponding activity is blank, the importer fails with a source-row error rather than inventing an activity. It writes one JSON file per level and a manifest containing the source file hash.

## Release gates after import

1. Review record counts and manifest hash against the approved workbook export.
2. Compare all current exercises against the actual row objective, activity, assessment evidence, platform and no-device fallback. A matching theme label is not sufficient.
3. Store any richer lesson script separately from the Master Matrix index. Mark it as teacher-authored or editorially adapted; never imply those additional fields came directly from the workbook.
4. Link each activity by a stable curriculum key such as `tmc-v3-15-year-7-t1-w2`.
5. Run the import in a local checkout, inspect the generated JSON, and keep the full catalogue in private storage. Do **not** commit the full catalogue to this public repository. Commit only a reviewed public-preview subset or non-sensitive manifest metadata. Do not import unreviewed data into the production learner route.
6. Add regression checks for 507 records, 13 levels, 39 records per level, 3 terms per level, 13 weeks per term and unique level/term/week keys.

## Current status

The importer now accepts the workbook's actual Master Matrix headers and generates a combined `catalogue.json`, per-level JSON files, and a source-hash manifest under `.private-data/code-studio-v2/catalogue` by default. `.private-data/` is ignored by Git because the full curriculum is commercially valuable content and the GitHub repository is public. Regression tests cover both schemas and rejection of the incomplete 213-row helper index. GitHub Actions for commit `01a93a597b05bac4a6215c3bdfc6c1aeba182e05` passed importer regression tests, lint and production build. The generated full catalogue is **not yet committed or connected to the learner route**. The first prototype remains limited to one detailed lesson until the real full workbook export is imported and reviewed.

## Actual workbook inspection (21 October 2026)

The current private workbook was inspected locally. The **Master Matrix** sheet has 508 rows including the header and 43 columns. It contains 507 weekly records, with 39 records for each of the 13 levels, unique level/term/week keys, and no missing expected weeks. The companion CSV has 507 records but only 18 columns and is not a complete import source. The current workbook SHA-256 is `1258742f7c808eb16d2c35bc2c2283a152e3121afda21a6f25fc9eb1f39bb980`.

The import validation identified a source inconsistency: **Excel row 235 (Year 4, Term 3, Week 13)** lists `Build + Create` as the required core parts but has a blank Build activity. The importer should accept blank Build/Create fields when those parts are not core requirements, but it must reject this row until the curriculum source is corrected. Do not fabricate the missing activity or modify the original workbook without approval.

The full catalogue remains private and must not be committed to this public repository. Even after the source inconsistency is corrected and the catalogue imports successfully, curriculum records are not automatically approved runnable lessons: lesson specs require separate review, and licensed access stays disabled until trusted server-side authentication and entitlement are implemented.
