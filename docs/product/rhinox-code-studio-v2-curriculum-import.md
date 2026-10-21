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
node scripts/import-code-studio-curriculum.mjs ./path/to/v3.15-master-index.csv
```

Optional output directory:

```bash
node scripts/import-code-studio-curriculum.mjs ./path/to/v3.15-master-index.csv ./lib/code-studio-v2/catalogue
```

The importer stops on missing fields, malformed CSV, duplicate week keys, duplicate matrix row identifiers, invalid levels or terms, missing themes, missing weeks, or a record count other than 507. It writes one JSON file per level and a manifest containing the source file hash.

## Release gates after import

1. Review record counts and manifest hash against the approved workbook export.
2. Compare all current exercises against the actual row objective, activity, assessment evidence, platform and no-device fallback. A matching theme label is not sufficient.
3. Store any richer lesson script separately from the Master Matrix index. Mark it as teacher-authored or editorially adapted; never imply those additional fields came directly from the workbook.
4. Link each activity by a stable curriculum key such as `tmc-v3-15-year-7-t1-w2`.
5. Run the import in a local checkout, inspect the generated JSON, then add the generated catalogue to version control. Do not import unreviewed data into the production learner route.
6. Add regression checks for 507 records, 13 levels, 39 records per level, 3 terms per level, 13 weeks per term and unique level/term/week keys.

## Current status

The importer now accepts the workbook's actual Master Matrix headers and generates a combined `catalogue.json`, per-level JSON files, and a source-hash manifest. Regression tests cover both schemas and rejection of the incomplete 213-row helper index. The updated workflow must pass before the change is considered verified. The generated full catalogue is **not yet committed or connected to the learner route**. The first prototype remains limited to one detailed lesson until the real full workbook export is imported and reviewed.
