# V3.15 curriculum import procedure

## Why this exists

The V2 learner interface must use a versioned curriculum catalogue rather than treating exercise labels as proof of alignment. The current Learning Home prototype contains one detailed lesson record. The importer prepares the full weekly index without inventing missing fields.

## Input

Export the v3.15 curriculum index as a UTF-8 CSV with the following columns:

- `matrix_row`, `level`, `term`, `week`, `week_type`, `theme`, `strand`
- `prior_learning`, `future_bridge`, `assessment_evidence`, `platform`
- `core_parts`, `stretch`, `fallback`, `competency`, `code`
- `practical_activity`, `weekly_check`

An extra `index` column is accepted. CSV quoted commas, escaped quotes and line breaks inside fields are supported.

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

The importer has been committed to the V2 branch. The generated full catalogue is **not yet committed or connected to the learner route**. This distinction is intentional: the first prototype remains limited to one verified detailed lesson until the full import and mapping checks are run.
