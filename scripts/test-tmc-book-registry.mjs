/**
 * Book Registry tests.
 * Run with: node --experimental-strip-types scripts/test-tmc-book-registry.mjs
 *
 * Part 1 checks the real Nursery 1 seed against the real files in this repo.
 * Part 2 uses synthetic registries to prove every validation and access rule.
 * No book wording, answers or private catalogue data are read or stored.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorizeBookLesson,
  findAccessDebt,
  getProductionLessons,
  isProductionStatus,
  validateBookRegistry,
} from "../lib/tmc-registry/book-registry.ts";
import {
  N1_ACTIVITY_BOOK_ID,
  N1_TEACHER_GUIDE_ID,
  NURSERY_1_REGISTRY,
  NURSERY_1_WEEK_TABLE,
} from "../lib/tmc-registry/seed/nursery-1.ts";
import { NURSERY_1_WEEKS } from "../lib/tmc/nursery-1-weeks.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}\n${error.stack}`);
    process.exitCode = 1;
  }
};
const R = NURSERY_1_REGISTRY;

/* ------------------------------------------------------------------ */
/* Part 1: the real Nursery 1 seed                                     */
/* ------------------------------------------------------------------ */

test("seed validates with full page coverage and no errors", () => {
  const { errors } = validateBookRegistry(R, { requireFullPageCoverage: true });
  assert.deepEqual(errors, []);
});

test("seed has 2 books and 86 units: 78 week units plus 8 front-matter, opener and overview units", () => {
  assert.equal(R.books.length, 2);
  assert.equal(R.lessons.length, 86);
  const weeks = R.lessons.filter((l) => l.unitKind === "week");
  assert.equal(weeks.length, 78);
  assert.equal(weeks.filter((l) => l.bookId === N1_ACTIVITY_BOOK_ID).length, 39);
  assert.equal(weeks.filter((l) => l.bookId === N1_TEACHER_GUIDE_ID).length, 39);
  assert.equal(new Set(R.lessons.map((l) => l.lessonId)).size, 86);
});

test("every Nursery 1 week appears once per book, terms 1 to 3 and weeks 1 to 13", () => {
  assert.equal(NURSERY_1_WEEK_TABLE.length, 39);
  for (let term = 1; term <= 3; term += 1) {
    for (let week = 1; week <= 13; week += 1) {
      for (const book of [N1_ACTIVITY_BOOK_ID, N1_TEACHER_GUIDE_ID]) {
        const hits = R.lessons.filter((l) => l.bookId === book && l.unitKind === "week" && l.term === term && l.week === week);
        assert.equal(hits.length, 1, `${book} T${term}W${week}`);
      }
    }
  }
});

test("every page of both books belongs to exactly one unit (110 and 84 pages)", () => {
  for (const [bookId, pages] of [[N1_ACTIVITY_BOOK_ID, 110], [N1_TEACHER_GUIDE_ID, 84]]) {
    const owner = new Map();
    for (const unit of R.lessons.filter((l) => l.bookId === bookId)) {
      for (let p = unit.pageStart; p <= unit.pageEnd; p += 1) {
        assert.ok(!owner.has(p), `${bookId} page ${p} twice`);
        owner.set(p, unit.lessonId);
      }
    }
    assert.equal(owner.size, pages);
  }
});

test("page ranges match the verified reading of the final books", () => {
  const ab = (t, w) => R.lessons.find((l) => l.lessonId === `tmc-n1-ab-t${t}-w${w}`);
  const tg = (t, w) => R.lessons.find((l) => l.lessonId === `tmc-n1-tg-t${t}-w${w}`);
  assert.deepEqual([ab(1, 1).pageStart, ab(1, 1).pageEnd], [6, 8]);
  assert.deepEqual([ab(1, 10).pageStart, ab(1, 10).pageEnd], [33, 34], "Week 10 has no Think & Move page");
  assert.deepEqual([ab(1, 12).pageStart, ab(1, 12).pageEnd], [38, 38], "My stars");
  assert.deepEqual([ab(3, 13).pageStart, ab(3, 13).pageEnd], [109, 110], "badge plus Year badge");
  assert.deepEqual([tg(1, 1).pageStart, tg(1, 1).pageEnd], [8, 9]);
  assert.deepEqual([tg(1, 12).pageStart, tg(1, 12).pageEnd], [30, 31], "station check page");
  assert.deepEqual([tg(3, 13).pageStart, tg(3, 13).pageEnd], [84, 84]);
});

test("Activity Book and Teacher Guide agree on every week title, and the website matches", () => {
  for (const week of NURSERY_1_WEEKS) {
    const a = R.lessons.find((l) => l.lessonId === `tmc-n1-ab-t${week.term}-w${week.week}`);
    const t = R.lessons.find((l) => l.lessonId === `tmc-n1-tg-t${week.term}-w${week.week}`);
    assert.equal(a.lessonTitle, t.lessonTitle);
    assert.equal(a.lessonTitle, week.title, `website title T${week.term}W${week.week}`);
    assert.equal(t.pageStart, week.teacherGuidePage, `website Teacher Guide page T${week.term}W${week.week}`);
  }
});

test("books are revised final drafts, never approved or published", () => {
  for (const book of R.books) {
    assert.equal(book.editorialStatus, "revised");
    assert.equal(book.publicationStatus, "unpublished");
    assert.equal(book.availability, "verified");
    assert.match(book.fileSha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(R.books.find((b) => b.bookId === N1_ACTIVITY_BOOK_ID).pageCount, 110);
  assert.equal(R.books.find((b) => b.bookId === N1_TEACHER_GUIDE_ID).pageCount, 84);
  assert.ok(R.lessons.every((l) => l.approvalStatus === "revised" && l.contentStatus === "structure-only"));
  assert.ok(R.lessons.every((l) => l.activities.length === 0 && l.exercises.length === 0), "no book wording is stored");
});

test("no draft book is a production source: nothing is served, even to a licensed learner", () => {
  assert.equal(getProductionLessons(R).length, 0);
  const access = { learnerId: "learner-1", canReadLicensedCurriculum: true };
  for (const lesson of R.lessons) assert.equal(authorizeBookLesson(R, lesson.lessonId, access), null);
});

test("every resource file exists on disk and is non-empty (so 'verified' is true)", () => {
  assert.ok(R.resources.length > 400, `expected 400+ resources, got ${R.resources.length}`);
  for (const r of R.resources) {
    const file = path.join(root, "public", r.uri);
    assert.ok(existsSync(file), `missing file for ${r.id}: ${r.uri}`);
    assert.ok(statSync(file).size > 0, `empty file for ${r.id}`);
  }
  assert.equal(new Set(R.resources.map((r) => r.id)).size, R.resources.length);
  assert.equal(new Set(R.resources.map((r) => r.uri)).size, R.resources.length);
});

test("every file in public/tmc/n1 is registered (no unregistered deliverable)", () => {
  const registered = new Set(R.resources.map((r) => r.uri));
  const walk = (dir, base) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name), `${base}/${entry.name}`) : [`${base}/${entry.name}`]);
  const onDisk = walk(path.join(root, "public/tmc/n1"), "/tmc/n1");
  const unregistered = onDisk.filter((uri) => !registered.has(uri));
  assert.deepEqual(unregistered, ["/tmc/n1/ayo.png"], "only the shared mascot image is outside the registry");
});

test("resources are drafts until compared with the final books; none published", () => {
  assert.ok(R.resources.every((r) => r.status === "draft"));
  assert.ok(R.resources.every((r) => r.availability === "verified"));
  assert.ok(R.resources.filter((r) => r.origin === "enrichment").every((r) => r.enrichmentLabel));
  assert.ok(R.resources.filter((r) => r.resourceType === "game").every((r) => r.origin === "enrichment"));
});

test("teacher-only classes: lesson plans, project and review sheets, question banks", () => {
  const byType = (t) => R.resources.filter((r) => r.resourceType === t);
  for (const type of ["lesson-plan", "project-sheet", "review-sheet", "question-bank"]) {
    assert.ok(byType(type).length >= 39);
    assert.ok(byType(type).every((r) => r.accessLevel === "teacher-only"), type);
  }
  assert.ok(byType("teacher-parent-guide").every((r) => r.accessLevel === "public"));
  assert.ok(byType("qr-code").every((r) => r.accessLevel === "public"));
  assert.ok(byType("game").every((r) => r.accessLevel === "public"));
  assert.ok(byType("printable").every((r) => r.accessLevel === "licensed"));
  assert.equal(byType("question-bank").length, 39 * 2 + 2, "39 PDFs, 39 Excel files, plus the all-weeks Excel and Word files");
});

test("access debt is tracked: restricted resources still served from a public path", () => {
  const debt = findAccessDebt(R.resources);
  const restricted = R.resources.filter((r) => r.accessLevel !== "public");
  assert.equal(debt.length, restricted.length);
  assert.ok(debt.length > 0);
  const { warnings } = validateBookRegistry(R);
  assert.ok(warnings.some((w) => w.includes(`${debt.length} resource(s)`)));
});

test("legacy lessons stay unresolved, flagged, preserved, and are not relabelled v3.16", () => {
  assert.equal(R.legacyMappings.length, 3);
  for (const m of R.legacyMappings) {
    assert.equal(m.status, "unresolved");
    assert.equal(m.editorialReviewRequired, true);
    assert.equal(m.preservedForCompatibility, true);
    assert.ok(!m.legacyId.startsWith("tmc-v3-16-"));
  }
  assert.equal(R.legacyMappings.find((m) => m.level === "Year 1").candidateBookLessonId, undefined, "no Year 1 book exists");
});

test("registry stays out of public assets and client components", () => {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.name === "node_modules" || e.name === ".next" || e.name === ".git" ? [] :
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  const sources = [...walk(path.join(root, "app")), ...walk(path.join(root, "lib"))].filter((f) => /\.(ts|tsx)$/.test(f));
  for (const file of sources) {
    const text = readFileSync(file, "utf8");
    const importsRegistry = /tmc-registry\/(seed|book-registry)/.test(text);
    if (importsRegistry && /^\s*["']use client["']/m.test(text)) assert.fail(`client component imports the registry: ${file}`);
    if (importsRegistry && !file.includes(`${path.sep}tmc-registry${path.sep}`)) {
      assert.fail(`only the registry's own server module may import it for now: ${file}`);
    }
  }
  const publicFiles = walk(path.join(root, "public")).filter((f) => !f.includes(`${path.sep}pyodide${path.sep}`));
  assert.ok(!publicFiles.some((f) => /tmc-(book-registry|curriculum-reference)|catalogue\.json|manifest\.json/.test(f)));
  const gitignore = readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^\/\.private-data\/$/m);
});

test("server loader fails closed: server-only, uses the trusted auth adapter, which denies by default", () => {
  const loader = readFileSync(path.join(root, "lib/tmc-registry/book-registry.server.ts"), "utf8");
  assert.match(loader, /import "server-only"/);
  assert.match(loader, /getAuthenticatedCurriculumAccess/);
  assert.match(loader, /authorizeBookLesson/);
  const adapter = readFileSync(path.join(root, "lib/code-studio-v2/learner-access.server.ts"), "utf8");
  assert.match(adapter, /return null;/, "no identity provider is connected, so access is denied");
});

/* ------------------------------------------------------------------ */
/* Part 2: synthetic rules                                             */
/* ------------------------------------------------------------------ */

const H = "a".repeat(64);
function makeBook(over = {}) {
  return {
    bookId: "b1", title: "Synthetic book", bookType: "activity-book", level: "Nursery 1", edition: "E1", version: "v1",
    language: "English", intendedAudience: ["learner"], publicationStatus: "unpublished", editorialStatus: "approved",
    availability: "verified", fileSha256: H, pageCount: 4, provenance: [], relatedCurriculumReferenceIds: [], accessLevel: "licensed", ...over,
  };
}
function makeLesson(over = {}) {
  return {
    lessonId: "l1", bookId: "b1", level: "Nursery 1", term: 1, week: 1, unitKind: "week", lessonTitle: "Synthetic", pageStart: 1, pageEnd: 2,
    conceptsTaught: [], keyVocabulary: [], learningInstructions: [], activities: [], examples: [], practicalTasks: [], projects: [],
    exercises: [], reviewQuestions: [], relatedIllustrationIds: [], relatedDigitalResourceIds: [], approvalStatus: "approved",
    contentStatus: "transcribed", curriculumReferenceIds: [], provenance: [], ...over,
  };
}
function makeResource(over = {}) {
  return {
    id: "r1", title: "Synthetic resource", resourceType: "worksheet", source: { bookId: "b1", lessonId: "l1" }, origin: "book",
    level: "Nursery 1", term: 1, week: 1, audience: ["learner"], accessLevel: "authenticated", availability: "verified",
    status: "draft", uri: "/x", provenance: [], ...over,
  };
}
const reg = (over = {}) => ({
  books: [makeBook()], lessons: [makeLesson()], resources: [makeResource()], relationships: [], legacyMappings: [], ...over,
});
const errorsOf = (registry, options) => validateBookRegistry(registry, options).errors.join("\n");

test("a clean synthetic registry validates", () => {
  assert.deepEqual(validateBookRegistry(reg()).errors, []);
});

test("duplicate book, lesson and resource ids are errors", () => {
  assert.match(errorsOf(reg({ books: [makeBook(), makeBook()] })), /Duplicate book id: b1/);
  assert.match(errorsOf(reg({ lessons: [makeLesson(), makeLesson()] })), /Duplicate lesson id: l1/);
  assert.match(errorsOf(reg({ resources: [makeResource(), makeResource()] })), /Duplicate resource id: r1/);
});

test("lesson relationships: unknown book, level mismatch, bad pages, page overlap", () => {
  assert.match(errorsOf(reg({ lessons: [makeLesson({ bookId: "nope" })] })), /unknown book nope/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ level: "Year 1" })] })), /differs from its book's level/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ pageStart: 3, pageEnd: 2 })] })), /invalid page range/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ pageEnd: 9 })] })), /beyond the book's 4 pages/);
  const overlap = reg({ lessons: [makeLesson(), makeLesson({ lessonId: "l2", pageStart: 2, pageEnd: 3 })] });
  assert.match(errorsOf(overlap), /page 2 belongs to both l1 and l2/);
});

test("week units need term 1-3 and week 1-13; other units may not have a week", () => {
  assert.match(errorsOf(reg({ lessons: [makeLesson({ term: 4 })] })), /needs a term of 1 to 3/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ week: 14 })] })), /week of 1 to 13/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ unitKind: "front-matter", term: undefined, week: 3 })] })), /only week units may have a week/);
});

test("page coverage gaps warn by default and fail when full coverage is required", () => {
  const r = reg();
  assert.ok(validateBookRegistry(r).warnings.some((w) => /belong to no unit/.test(w)));
  assert.match(errorsOf(r, { requireFullPageCoverage: true }), /belong to no unit/);
});

test("no draft or revised book is treated as approved", () => {
  const revised = reg({ books: [makeBook({ editorialStatus: "revised" })] });
  assert.match(errorsOf(revised), /"approved" but its book is only "revised"/);
  assert.equal(getProductionLessons(revised).length, 0);
  assert.equal(isProductionStatus("revised"), false);
  assert.equal(isProductionStatus("approved"), true);
  assert.equal(isProductionStatus("published"), true);
});

test("a book cannot be published without approval, or approved without a verified file", () => {
  assert.match(errorsOf(reg({ books: [makeBook({ editorialStatus: "revised", publicationStatus: "published" })] })), /marked published but its editorial status/);
  assert.match(errorsOf(reg({ books: [makeBook({ editorialStatus: "published", publicationStatus: "unpublished" })] })), /editorial status is "published"/);
  assert.match(errorsOf(reg({ books: [makeBook({ availability: "planned" })] })), /is planned but has editorial status "approved"/);
  assert.deepEqual(validateBookRegistry(reg({ books: [makeBook({ availability: "planned", editorialStatus: "draft", fileSha256: undefined, pageCount: undefined })], lessons: [makeLesson({ approvalStatus: "draft", contentStatus: "structure-only", pageEnd: 2 })] })).errors, [], "a planned draft book with draft lessons is fine");
});

test("verified books need a valid SHA-256 and a page count; edition and version are required", () => {
  assert.match(errorsOf(reg({ books: [makeBook({ fileSha256: "xyz" })] })), /no valid SHA-256/);
  assert.match(errorsOf(reg({ books: [makeBook({ pageCount: undefined })] })), /no page count/);
  assert.match(errorsOf(reg({ books: [makeBook({ edition: " " })] })), /edition and version are required/);
  assert.match(errorsOf(reg({ books: [makeBook({ supersedesBookId: "ghost" })] })), /supersedes unknown book/);
});

test("a lesson cannot be ahead of its book, or approved while structure-only", () => {
  const ahead = reg({ books: [makeBook({ editorialStatus: "under-review" })], lessons: [makeLesson({ approvalStatus: "revised" })] });
  assert.match(errorsOf(ahead), /ahead of its book/);
  assert.match(errorsOf(reg({ lessons: [makeLesson({ contentStatus: "structure-only" })] })), /structure-only/);
});

test("resources must point at a real book lesson, with matching level, term and week", () => {
  assert.match(errorsOf(reg({ resources: [makeResource({ source: { bookId: "b1", lessonId: "ghost" } })] })), /no valid book lesson source/);
  assert.match(errorsOf(reg({ resources: [makeResource({ source: { bookId: "other", lessonId: "l1" } })] })), /no valid book lesson source/);
  assert.match(errorsOf(reg({ resources: [makeResource({ level: "Year 1" })] })), /level differs/);
  assert.match(errorsOf(reg({ resources: [makeResource({ week: 5 })] })), /term\/week differ/);
});

test("enrichment must be labelled; book content must not carry the label", () => {
  assert.match(errorsOf(reg({ resources: [makeResource({ origin: "enrichment" })] })), /must carry an enrichment label/);
  assert.deepEqual(validateBookRegistry(reg({ resources: [makeResource({ origin: "enrichment", enrichmentLabel: "Digital enrichment" })] })).errors, []);
  assert.match(errorsOf(reg({ resources: [makeResource({ enrichmentLabel: "x" })] })), /only enrichment may carry/);
});

test("unverified resources cannot be published; planned or missing resources have no uri", () => {
  assert.match(errorsOf(reg({ resources: [makeResource({ status: "published", availability: "unverified" })] })), /cannot be published unless its file is verified/);
  assert.match(errorsOf(reg({ resources: [makeResource({ availability: "planned" })] })), /planned so it must not have a uri/);
  assert.match(errorsOf(reg({ resources: [makeResource({ uri: undefined })] })), /verified but has no uri/);
});

test("a resource cannot be published while its source book is only revised", () => {
  const r = reg({ books: [makeBook({ editorialStatus: "revised" })], lessons: [makeLesson({ approvalStatus: "revised", contentStatus: "structure-only" })],
    resources: [makeResource({ status: "published" })] });
  assert.match(errorsOf(r), /is published but its source book is only "revised"/);
});

test("answer-bearing resource types can never be public, authenticated or licensed", () => {
  for (const type of ["lesson-plan", "project-sheet", "review-sheet", "question-bank"]) {
    for (const access of ["public", "authenticated", "licensed"]) {
      assert.match(errorsOf(reg({ resources: [makeResource({ resourceType: type, accessLevel: access })] })), /must be teacher-only/);
    }
    assert.deepEqual(validateBookRegistry(reg({ resources: [makeResource({ resourceType: type, accessLevel: "teacher-only" })] })).errors, []);
  }
});

test("relationships must connect known ids", () => {
  assert.match(errorsOf(reg({ relationships: [{ fromId: "l1", toId: "ghost", relation: "companion" }] })), /unknown to id ghost/);
  assert.deepEqual(validateBookRegistry(reg({ relationships: [{ fromId: "l1", toId: "b1", relation: "part-of" }] })).errors, []);
});

test("legacy mappings: never relabelled, unresolved must be flagged, mapped needs a real lesson and reviewer", () => {
  const legacy = (over) => ({ legacyId: "tmc-v3-15-x", legacyCurriculumVersion: "3.15", level: "Nursery 1", status: "unresolved",
    discrepancies: [], editorialReviewRequired: true, preservedForCompatibility: true, ...over });
  assert.match(errorsOf(reg({ legacyMappings: [legacy({ legacyId: "tmc-v3-16-nursery-1-t1-w1" })] })), /never be relabelled as v3.16/);
  assert.match(errorsOf(reg({ legacyMappings: [legacy({ editorialReviewRequired: false })] })), /flagged for editorial review/);
  assert.match(errorsOf(reg({ legacyMappings: [legacy({ status: "mapped", candidateBookLessonId: "ghost" })] })), /book lesson does not exist/);
  assert.match(errorsOf(reg({ legacyMappings: [legacy({ status: "mapped", candidateBookLessonId: "l1" })] })), /named reviewer and date/);
  assert.deepEqual(validateBookRegistry(reg({ legacyMappings: [legacy({ status: "mapped", candidateBookLessonId: "l1", reviewedBy: "editor", reviewedAt: "2026-11-10" })] })).errors, []);
});

test("production lessons need an approved book, an approved lesson and captured content", () => {
  const r = reg({ lessons: [makeLesson(), makeLesson({ lessonId: "l2", pageStart: 3, pageEnd: 4, approvalStatus: "revised", contentStatus: "transcribed" })] });
  assert.deepEqual(getProductionLessons(r).map((l) => l.lessonId), ["l1"]);
});

test("access policy: fails closed for missing, anonymous, blank or unlicensed callers", () => {
  const r = reg();
  const ok = { learnerId: "learner-1", canReadLicensedCurriculum: true };
  assert.equal(authorizeBookLesson(r, "l1", ok)?.lessonId, "l1");
  assert.equal(authorizeBookLesson(r, "l1", null), null, "unauthenticated");
  assert.equal(authorizeBookLesson(r, "l1", { learnerId: null, canReadLicensedCurriculum: true }), null);
  assert.equal(authorizeBookLesson(r, "l1", { learnerId: "   ", canReadLicensedCurriculum: true }), null);
  assert.equal(authorizeBookLesson(r, "l1", { learnerId: "learner-1", canReadLicensedCurriculum: false }), null, "not licensed");
  assert.equal(authorizeBookLesson(r, "ghost", ok), null);
  assert.equal(authorizeBookLesson(r, "l1", { learnerId: "learner-1", canReadLicensedCurriculum: "yes" }), null, "entitlement must be exactly true");
});

test("access policy: draft or unreviewed lessons never reach learners", () => {
  const ok = { learnerId: "learner-1", canReadLicensedCurriculum: true };
  const draftBook = reg({ books: [makeBook({ editorialStatus: "revised" })], lessons: [makeLesson({ approvalStatus: "revised" })] });
  assert.equal(authorizeBookLesson(draftBook, "l1", ok), null);
  const structureOnly = reg({ lessons: [makeLesson({ approvalStatus: "revised", contentStatus: "structure-only" })] });
  assert.equal(authorizeBookLesson(structureOnly, "l1", ok), null);
});

test("access policy: teacher-only books need a teacher; internal books never served", () => {
  const ok = { learnerId: "learner-1", canReadLicensedCurriculum: true };
  const teacherBook = reg({ books: [makeBook({ accessLevel: "teacher-only" })] });
  assert.equal(authorizeBookLesson(teacherBook, "l1", ok), null);
  assert.equal(authorizeBookLesson(teacherBook, "l1", { ...ok, isTeacher: true })?.lessonId, "l1");
  assert.equal(authorizeBookLesson(teacherBook, "l1", { ...ok, isTeacher: "true" }), null, "isTeacher must be exactly true");
  const internal = reg({ books: [makeBook({ accessLevel: "internal" })] });
  assert.equal(authorizeBookLesson(internal, "l1", { ...ok, isTeacher: true }), null);
});

test("access policy: teacher-only and internal items are removed for learners; teachers keep teacher-only", () => {
  const item = (id, accessLevel) => ({ itemId: id, text: `Synthetic ${id}`, accessLevel });
  const r = reg({ lessons: [makeLesson({ exercises: [item("e-pub", "licensed"), item("e-ans", "teacher-only"), item("e-int", "internal")] })] });
  const learner = authorizeBookLesson(r, "l1", { learnerId: "learner-1", canReadLicensedCurriculum: true });
  assert.deepEqual(learner.exercises.map((i) => i.itemId), ["e-pub"]);
  const teacher = authorizeBookLesson(r, "l1", { learnerId: "t-1", canReadLicensedCurriculum: true, isTeacher: true });
  assert.deepEqual(teacher.exercises.map((i) => i.itemId), ["e-pub", "e-ans"]);
  assert.equal(r.lessons[0].exercises.length, 3, "the registry itself is not mutated");
});

console.log(`\n${passed} book registry tests passed.`);
