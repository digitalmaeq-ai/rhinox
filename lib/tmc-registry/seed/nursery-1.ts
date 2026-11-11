/**
 * Nursery 1 Book Registry seed: STRUCTURE ONLY (books, exact page ranges, titles, resource files).
 *
 * No book wording is stored here. Page ranges and week titles were read page by page from the
 * final-draft files listed below (status: revised, NOT approved) and cross-checked: the two books
 * agree on all 39 week titles and the website uses the same titles.
 *
 * Source files (supplied by the owner on 10 November 2026):
 *   Activity Book interior  TMC-Nursery-1-Activity-Book-Interior2-REVISED_4.pdf  110 pages
 *   Activity Book cover     TMC-Nursery-1-Activity-Book-Cover-REVISED_2.pdf        1 page
 *   Teacher Guide interior  TMC-Nursery-1-Teacher-Guide-Interior-REVISED_1.pdf    84 pages
 *
 * Learner-facing book text, answers and activities are private and are not in this public repo.
 * Printed Activity Book page numbers equal PDF page numbers.
 */
import type {
  TmcBook,
  TmcBookLesson,
  TmcBookRegistry,
  TmcLearningResource,
  TmcLegacyLessonMapping,
  TmcRelationship,
  TmcBookPage,
  TmcPageRole,
  TmcSourceProvenance,
  TmcTerm,
  TmcWeek,
} from "../../../types/tmc-registry";

export const N1_ACTIVITY_BOOK_ID = "tmc-n1-activity-book-r4";
export const N1_TEACHER_GUIDE_ID = "tmc-n1-teacher-guide-r1";

const AB_HASH = "f4de8066a97e4dd565d90dfe71569395f0e1a81ae32c47c481f03923ca8f3250";
const AB_COVER_HASH = "f946fb1d24b44abcea8d8f458e8aa0640c6ab321dfc5d837f9df22a82b4e8cbd";
const TG_HASH = "ba10825d494d41bc3bc74e635c31b60f5caf8720cc86067f1c29c6d5c2e52565";

/** [term, week, title, Activity Book first page, last page, Teacher Guide first page, last page] */
export const NURSERY_1_WEEK_TABLE = [
  [1, 1, "I Can Do Things in Steps", 6, 8, 8, 9],
  [1, 2, "My Day Has Order", 9, 11, 10, 11],
  [1, 3, "I Can Give Instructions", 12, 14, 12, 13],
  [1, 4, "First, Next, Last", 15, 17, 14, 15],
  [1, 5, "Let’s Fix Mistakes", 18, 20, 16, 17],
  [1, 6, "Do It Again!", 21, 23, 18, 19],
  [1, 7, "Practice & Play: Robot Says Games", 24, 26, 20, 21],
  [1, 8, "Practice & Play: Pictures Tell a Story", 27, 29, 22, 23],
  [1, 9, "Following a Path", 30, 32, 24, 25],
  [1, 10, "Revision & Reinforcement", 33, 34, 26, 27],
  [1, 11, "Mini-project: Robot Says with Ayo", 35, 37, 28, 29],
  [1, 12, "Assessment", 38, 38, 30, 31],
  [1, 13, "Showcase & Badges", 39, 39, 32, 32],
  [2, 1, "What is a Pattern?", 41, 43, 34, 35],
  [2, 2, "Move in Patterns", 44, 46, 36, 37],
  [2, 3, "Hear the Pattern", 47, 49, 38, 39],
  [2, 4, "See the Pattern", 50, 52, 40, 41],
  [2, 5, "Finish What Comes Next", 53, 55, 42, 43],
  [2, 6, "Sorting is Smart", 56, 58, 44, 45],
  [2, 7, "Practice & Play: Pattern Games", 59, 61, 46, 47],
  [2, 8, "Practice & Play: Make Your Own", 62, 64, 48, 49],
  [2, 9, "Patterns Are Everywhere", 65, 67, 50, 51],
  [2, 10, "Revision & Reinforcement", 68, 69, 52, 53],
  [2, 11, "Mini-project: Ayo’s Robot Dance", 70, 72, 54, 55],
  [2, 12, "Assessment: Station Check", 73, 73, 56, 57],
  [2, 13, "Showcase & Badges", 74, 74, 58, 58],
  [3, 1, "What is a Problem?", 76, 78, 60, 61],
  [3, 2, "Break It Small", 79, 81, 62, 63],
  [3, 3, "Choose the Right Way", 82, 84, 64, 65],
  [3, 4, "Try Another Way", 85, 87, 66, 67],
  [3, 5, "Let’s Build It!", 88, 90, 68, 69],
  [3, 6, "If This Happens…", 91, 93, 70, 71],
  [3, 7, "Practice & Play: Help Ayo Move", 94, 96, 72, 73],
  [3, 8, "Practice & Play: Big Challenge", 97, 99, 74, 75],
  [3, 9, "I Am a Thinker", 100, 102, 76, 77],
  [3, 10, "Revision & Reinforcement", 103, 104, 78, 79],
  [3, 11, "Mini-project: Ayo’s Ramp and Route", 105, 107, 80, 81],
  [3, 12, "Assessment: practical check", 108, 108, 82, 83],
  [3, 13, "Showcase & Badges", 109, 110, 84, 84],
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const curriculumRef = (term: number, week: number) => `tmc-v3-16-nursery-1-t${term}-w${week}`;

const provenanceFor = (
  id: string,
  title: string,
  kind: TmcSourceProvenance["sourceKind"],
  version: string,
  sha: string,
  pages?: [number, number],
): TmcSourceProvenance => ({
  sourceId: id,
  sourceTitle: title,
  sourceVersion: version,
  sourceKind: kind,
  sourceFileSha256: sha,
  pageStart: pages?.[0],
  pageEnd: pages?.[1],
  extractionMethod: "manual",
  verifiedAt: "2026-11-10",
});

export const NURSERY_1_BOOKS: TmcBook[] = [
  {
    bookId: N1_ACTIVITY_BOOK_ID,
    title: "Think • Move • Code! Nursery 1 Activity Book",
    bookType: "activity-book",
    level: "Nursery 1",
    edition: "Revised final draft",
    version: "Interior REVISED_4; Cover REVISED_2",
    language: "English",
    intendedAudience: ["learner", "parent", "teacher"],
    publicationStatus: "unpublished",
    editorialStatus: "revised",
    availability: "verified",
    fileSha256: AB_HASH,
    pageCount: 110,
    provenance: [
      provenanceFor("tmc-n1-ab-interior", "Nursery 1 Activity Book interior", "activity-book", "REVISED_4", AB_HASH, [1, 110]),
      provenanceFor("tmc-n1-ab-cover", "Nursery 1 Activity Book cover", "activity-book", "REVISED_2", AB_COVER_HASH, [1, 1]),
    ],
    relatedCurriculumReferenceIds: NURSERY_1_WEEK_TABLE.map(([t, w]) => curriculumRef(t, w)),
    accessLevel: "licensed",
  },
  {
    bookId: N1_TEACHER_GUIDE_ID,
    title: "Think • Move • Code! Nursery 1 Teacher Guide",
    bookType: "teacher-guide",
    level: "Nursery 1",
    edition: "Revised final draft",
    version: "Interior REVISED_1",
    language: "English",
    intendedAudience: ["teacher"],
    publicationStatus: "unpublished",
    editorialStatus: "revised",
    availability: "verified",
    fileSha256: TG_HASH,
    pageCount: 84,
    provenance: [provenanceFor("tmc-n1-tg-interior", "Nursery 1 Teacher Guide interior", "teacher-guide", "REVISED_1", TG_HASH, [1, 84])],
    relatedCurriculumReferenceIds: NURSERY_1_WEEK_TABLE.map(([t, w]) => curriculumRef(t, w)),
    accessLevel: "teacher-only",
  },
];

function lesson(
  bookId: string,
  id: string,
  unitKind: TmcBookLesson["unitKind"],
  title: string,
  pageStart: number,
  pageEnd: number,
  term?: TmcTerm,
  week?: TmcWeek,
  prov?: TmcSourceProvenance,
): TmcBookLesson {
  return {
    lessonId: id,
    bookId,
    level: "Nursery 1",
    term,
    week,
    unitKind,
    lessonTitle: title,
    pageStart,
    pageEnd,
    conceptsTaught: [],
    keyVocabulary: [],
    learningInstructions: [],
    activities: [],
    examples: [],
    practicalTasks: [],
    projects: [],
    exercises: [],
    reviewQuestions: [],
    relatedIllustrationIds: [],
    relatedDigitalResourceIds: [],
    approvalStatus: "revised",
    contentStatus: "structure-only",
    curriculumReferenceIds: term && week ? [curriculumRef(term, week)] : [],
    provenance: prov ? [prov] : [],
  };
}

const abId = (t: number, w: number) => `tmc-n1-ab-t${t}-w${w}`;
const tgId = (t: number, w: number) => `tmc-n1-tg-t${t}-w${w}`;
const AB_PROV = (pages: [number, number]) => provenanceFor("tmc-n1-ab-interior", "Nursery 1 Activity Book interior", "activity-book", "REVISED_4", AB_HASH, pages);
const TG_PROV = (pages: [number, number]) => provenanceFor("tmc-n1-tg-interior", "Nursery 1 Teacher Guide interior", "teacher-guide", "REVISED_1", TG_HASH, pages);

/** Non-week units, so that every page of each book belongs to exactly one unit. */
const AB_OTHER: Array<[string, TmcBookLesson["unitKind"], string, number, number]> = [
  ["tmc-n1-ab-front-matter", "front-matter", "Front matter: meet RhinoBot and Ayo, contents, for grown-ups, safety rules", 1, 4],
  ["tmc-n1-ab-t1-opener", "term-opener", "Term 1 opener", 5, 5],
  ["tmc-n1-ab-t2-opener", "term-opener", "Term 2 opener", 40, 40],
  ["tmc-n1-ab-t3-opener", "term-opener", "Term 3 opener", 75, 75],
];
const TG_OTHER: Array<[string, TmcBookLesson["unitKind"], string, number, number]> = [
  ["tmc-n1-tg-front-matter", "front-matter", "Front matter: how this guide works", 1, 6],
  ["tmc-n1-tg-t1-overview", "term-overview", "Term 1 overview", 7, 7],
  ["tmc-n1-tg-t2-overview", "term-overview", "Term 2 overview", 33, 33],
  ["tmc-n1-tg-t3-overview", "term-overview", "Term 3 overview", 59, 59],
];

/** Weekly support files that exist in public/tmc/n1/t{term}-w{week}/ (existence is checked by the tests). */
type FileKind = {
  suffix: string;
  slug: string;
  title: string;
  resourceType: TmcLearningResource["resourceType"];
  /** Which book the resource follows. */
  follows: "ab" | "tg";
  access: TmcLearningResource["accessLevel"];
  audience: TmcLearningResource["audience"];
  origin: TmcLearningResource["origin"];
};
const WEEK_FILES: FileKind[] = [
  { suffix: "Lesson-Plan.pdf", slug: "lesson-plan", title: "Lesson plan", resourceType: "lesson-plan", follows: "tg", access: "teacher-only", audience: ["teacher"], origin: "book" },
  { suffix: "Teacher-Parent-Guide.pdf", slug: "teacher-parent-guide", title: "Teacher and parent guide", resourceType: "teacher-parent-guide", follows: "tg", access: "public", audience: ["teacher", "parent"], origin: "book" },
  { suffix: "Project-Sheet.pdf", slug: "project-sheet", title: "Project sheet", resourceType: "project-sheet", follows: "tg", access: "teacher-only", audience: ["teacher"], origin: "book" },
  { suffix: "Review-Sheet.pdf", slug: "review-sheet", title: "Review sheet", resourceType: "review-sheet", follows: "tg", access: "teacher-only", audience: ["teacher"], origin: "book" },
  { suffix: "Question-Bank.pdf", slug: "question-bank-pdf", title: "Question bank (PDF, with answers)", resourceType: "question-bank", follows: "tg", access: "teacher-only", audience: ["teacher"], origin: "book" },
  { suffix: "Question-Bank.xlsx", slug: "question-bank-xlsx", title: "Question bank (Excel, with answers)", resourceType: "question-bank", follows: "tg", access: "teacher-only", audience: ["teacher"], origin: "book" },
  { suffix: "Printable-Cards.pdf", slug: "printable-cards", title: "Printable cards", resourceType: "printable", follows: "ab", access: "licensed", audience: ["teacher"], origin: "book" },
  { suffix: "QR-Code.png", slug: "qr-code", title: "QR code for this week", resourceType: "qr-code", follows: "ab", access: "public", audience: ["teacher", "parent"], origin: "book" },
];
const WEEK_GAMES: Array<{ file: string; slug: string; title: string }> = [
  { file: "matching-game.html", slug: "matching-game", title: "Matching game" },
  { file: "screen-game.html", slug: "screen-game", title: "Screen game" },
];
/** Weeks that have a reviewed interactive lesson. A test checks this against lib/tmc/lessons.ts. */
export const NURSERY_1_INTERACTIVE_LESSON_WEEKS: ReadonlyArray<readonly [number, number]> = [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8]];
const DIGITAL_NOTE =
  "Website page or digital extra. Not yet compared with the final Activity Book and Teacher Guide, so it stays a draft until that check is done.";
const UNREVIEWED_NOTE =
  "File exists in public/tmc/n1. Not yet compared with the final Activity Book and Teacher Guide, so it stays a draft until that check is done.";

function resource(
  id: string,
  title: string,
  resourceType: TmcLearningResource["resourceType"],
  source: { bookId: string; lessonId: string },
  uri: string | undefined,
  access: TmcLearningResource["accessLevel"],
  audience: TmcLearningResource["audience"],
  origin: TmcLearningResource["origin"],
  term?: TmcTerm,
  week?: TmcWeek,
  digital?: { availability: TmcLearningResource["availability"]; note: string },
): TmcLearningResource {
  return {
    id,
    title,
    resourceType,
    source,
    origin,
    enrichmentLabel: origin === "enrichment" ? "Digital enrichment: not an activity from the book" : undefined,
    level: "Nursery 1",
    term,
    week,
    audience,
    accessLevel: access,
    availability: digital?.availability ?? "verified",
    status: "draft",
    uri,
    // Website routes and planned items are not files under public/; only real files can be access debt.
    servedFromPublicPath: digital ? false : true,
    provenance: [
      {
        sourceId: "tmc-n1-weekly-pack",
        sourceTitle: "Nursery 1 weekly pack",
        sourceVersion: "not yet reviewed against the final books",
        sourceKind: resourceType === "question-bank" ? "assessment-bank" : "other",
        notes: digital?.note ?? UNREVIEWED_NOTE,
      },
    ],
  };
}

export function buildNursery1Resources(): TmcLearningResource[] {
  const out: TmcLearningResource[] = [];
  for (const [t, w] of NURSERY_1_WEEK_TABLE) {
    const term = t as TmcTerm;
    const week = w as TmcWeek;
    const folder = `/tmc/n1/t${t}-w${w}`;
    const code = `TMC-N1-T${t}-W${pad(w)}`;
    const ab = { bookId: N1_ACTIVITY_BOOK_ID, lessonId: abId(t, w) };
    const tg = { bookId: N1_TEACHER_GUIDE_ID, lessonId: tgId(t, w) };
    for (const f of WEEK_FILES) {
      out.push(resource(`tmc-n1-t${t}-w${w}-${f.slug}`, f.title, f.resourceType, f.follows === "ab" ? ab : tg,
        `${folder}/${code}-${f.suffix}`, f.access, f.audience, f.origin, term, week));
    }
    for (const g of WEEK_GAMES) {
      out.push(resource(`tmc-n1-t${t}-w${w}-${g.slug}`, g.title, "game", ab, `${folder}/${g.file}`, "public", ["learner"], "enrichment", term, week));
    }
    // Stage 6: website pages and digital extras linked to this week. These are routes, not files.
    out.push(resource(`tmc-n1-t${t}-w${w}-week-page`, "Week page on the website", "learning-hub-page", ab,
      `/think-move-code/nursery-1/term-${t}/week-${w}`, "public", ["learner", "parent", "teacher"], "book", term, week,
      { availability: "verified", note: DIGITAL_NOTE }));
    out.push(resource(`tmc-n1-t${t}-w${w}-quiz`, "Read-aloud quiz", "quiz", tg,
      `/explore/stem-quizzes/nursery-1-term-${t}-week-${w}`, "public", ["learner", "teacher"], "enrichment", term, week,
      { availability: "verified", note: DIGITAL_NOTE }));
    if (NURSERY_1_INTERACTIVE_LESSON_WEEKS.some(([lt, lw]) => lt === t && lw === w)) {
      out.push(resource(`tmc-n1-t${t}-w${w}-interactive-lesson`, "Interactive RhinoBot lesson", "interactive-lesson", ab,
        `/think-move-code/nursery-1/term-${t}/week-${w}/lesson`, "public", ["learner"], "enrichment", term, week,
        { availability: "verified", note: DIGITAL_NOTE }));
    }
    if (w === 13) {
      out.push(resource(`tmc-n1-t${t}-w13-step-star-stickers`, `Term ${t} Step Star stickers`, "printable", ab,
        `${folder}/TMC-N1-Term${t}-Step-Star-Stickers.pdf`, "licensed", ["teacher"], "book", term, week));
      out.push(resource(`tmc-n1-t${t}-w13-term-badge`, `Term ${t} Step Thinker badge`, "badge", ab,
        `${folder}/step-thinker-term${t}-badge.png`, "public", ["learner", "parent"], "book", term, week));
    }
    if (t === 3 && w === 13) {
      out.push(resource("tmc-n1-t3-w13-year-badge", "Step Thinker Year badge", "badge", ab,
        `${folder}/step-thinker-year-badge.png`, "public", ["learner", "parent"], "book", term, week));
    }
  }
  // Whole-year and whole-term files.
  const frontTg = { bookId: N1_TEACHER_GUIDE_ID, lessonId: "tmc-n1-tg-front-matter" };
  out.push(resource("tmc-n1-all-question-bank-xlsx", "Question bank, all 39 weeks (Excel, with answers)", "question-bank", frontTg,
    "/tmc/n1/all/TMC-N1-Question-Bank-All-Weeks.xlsx", "teacher-only", ["teacher"], "book"));
  out.push(resource("tmc-n1-all-question-bank-docx", "Question bank, all 39 weeks (Word, with answers)", "question-bank", frontTg,
    "/tmc/n1/all/TMC-N1-Question-Bank-All-Weeks.docx", "teacher-only", ["teacher"], "book"));
  for (const term of [1, 2, 3]) {
    out.push(resource(`tmc-n1-t${term}-bonus-video`, `Term ${term} bonus teacher video`, "video",
      { bookId: N1_ACTIVITY_BOOK_ID, lessonId: `tmc-n1-ab-t${term}-opener` }, undefined, "public", ["teacher", "parent"], "enrichment",
      term as TmcTerm, undefined,
      { availability: "planned", note: "Planned bonus video. Not published yet, so it has no address." }));
    out.push(resource(`tmc-n1-t${term}-card-pack`, `Term ${term} printable card pack`, "printable",
      { bookId: N1_ACTIVITY_BOOK_ID, lessonId: `tmc-n1-ab-t${term}-opener` },
      `/tmc/n1/all/TMC-N1-Term${term}-Printable-Card-Pack.pdf`, "licensed", ["teacher"], "book"));
  }
  return out;
}

export function buildNursery1Lessons(resources: TmcLearningResource[]): TmcBookLesson[] {
  const out: TmcBookLesson[] = [];
  for (const [id, kind, title, a, b] of AB_OTHER) out.push(lesson(N1_ACTIVITY_BOOK_ID, id, kind, title, a, b, undefined, undefined, AB_PROV([a, b])));
  for (const [id, kind, title, a, b] of TG_OTHER) out.push(lesson(N1_TEACHER_GUIDE_ID, id, kind, title, a, b, undefined, undefined, TG_PROV([a, b])));
  for (const [t, w, title, abStart, abEnd, tgStart, tgEnd] of NURSERY_1_WEEK_TABLE) {
    const abLesson = lesson(N1_ACTIVITY_BOOK_ID, abId(t, w), "week", title, abStart, abEnd, t as TmcTerm, w as TmcWeek, AB_PROV([abStart, abEnd]));
    abLesson.relatedDigitalResourceIds = resources.filter((r) => r.source.lessonId === abLesson.lessonId).map((r) => r.id);
    out.push(abLesson);
    const tgLesson = lesson(N1_TEACHER_GUIDE_ID, tgId(t, w), "week", title, tgStart, tgEnd, t as TmcTerm, w as TmcWeek, TG_PROV([tgStart, tgEnd]));
    tgLesson.relatedDigitalResourceIds = resources.filter((r) => r.source.lessonId === tgLesson.lessonId).map((r) => r.id);
    out.push(tgLesson);
  }
  return out;
}

/** How each kind of resource relates to the book lesson it follows. */
const RELATION_BY_TYPE: Record<TmcLearningResource["resourceType"], TmcRelationship["relation"]> = {
  "lesson-plan": "supports",
  "teacher-parent-guide": "supports",
  "project-sheet": "supports",
  "review-sheet": "assesses",
  "question-bank": "assesses",
  quiz: "assesses",
  printable: "supports",
  "qr-code": "supports",
  "learning-hub-page": "supports",
  badge: "supports",
  certificate: "supports",
  worksheet: "supports",
  transcript: "supports",
  illustration: "supports",
  diagram: "supports",
  game: "extends",
  video: "extends",
  "interactive-lesson": "extends",
};

/**
 * Stage 6 relationships.
 *  - Each week's Teacher Guide lesson is the companion of its Activity Book lesson.
 *  - Every resource is linked to the book lesson it follows (supports, assesses or extends).
 *  - Weekly cards and question banks are parts of the term or all-weeks files.
 *  - Each quiz references the week's question bank it was written from.
 */
function buildRelationships(resources: TmcLearningResource[]): TmcRelationship[] {
  const out: TmcRelationship[] = NURSERY_1_WEEK_TABLE.map(([t, w]) => ({
    fromId: tgId(t, w),
    toId: abId(t, w),
    relation: "companion" as const,
    rationale: "Same week in the Teacher Guide and the Activity Book.",
  }));
  for (const r of resources) {
    out.push({
      fromId: r.id,
      toId: r.source.lessonId,
      relation: RELATION_BY_TYPE[r.resourceType],
      rationale: r.origin === "enrichment"
        ? "Digital enrichment that extends or checks this book lesson. It is not an activity from the book."
        : "Follows this book lesson.",
    });
  }
  for (const [t, w] of NURSERY_1_WEEK_TABLE) {
    out.push({ fromId: `tmc-n1-t${t}-w${w}-quiz`, toId: `tmc-n1-t${t}-w${w}-question-bank-pdf`, relation: "references",
      rationale: "The quiz is a read-aloud version of this week's question bank." });
    out.push({ fromId: `tmc-n1-t${t}-w${w}-printable-cards`, toId: `tmc-n1-t${t}-card-pack`, relation: "part-of",
      rationale: "The weekly cards are included in the term card pack." });
    out.push({ fromId: `tmc-n1-t${t}-w${w}-question-bank-xlsx`, toId: "tmc-n1-all-question-bank-xlsx", relation: "part-of",
      rationale: "This week is included in the all-weeks question bank." });
  }
  return out;
}

/**
 * Lessons written before the book-first rule. None is confirmed against the final books, so
 * all stay unresolved and out of the approved catalogue until a person compares them with the page.
 */
const LEGACY_NOTE = "Not yet compared with the final book page. Do not treat as approved.";
export const NURSERY_1_LEGACY_MAPPINGS: TmcLegacyLessonMapping[] = [
  { legacyId: "tmc-v3-15-nursery-1-t1-w1", legacyCurriculumVersion: "3.15", level: "Nursery 1", term: 1, week: 1,
    status: "unresolved", candidateBookLessonId: abId(1, 1), discrepancies: [LEGACY_NOTE], editorialReviewRequired: true, preservedForCompatibility: true },
  { legacyId: "tmc-v3-15-nursery-1-t1-w2", legacyCurriculumVersion: "3.15", level: "Nursery 1", term: 1, week: 2,
    status: "unresolved", candidateBookLessonId: abId(1, 2), discrepancies: [LEGACY_NOTE], editorialReviewRequired: true, preservedForCompatibility: true },
  { legacyId: "tmc-v3-15-year-1-t1-w3", legacyCurriculumVersion: "3.15", level: "Year 1", term: 1, week: 3,
    status: "unresolved", discrepancies: ["No Year 1 book has been supplied, so there is nothing to map to."], editorialReviewRequired: true, preservedForCompatibility: true },
];

/* ------------------------------------------------------------------ */
/* Stage 3: page-level index                                           */
/* ------------------------------------------------------------------ */

/** Short structural labels for the Activity Book front-matter pages (page number to label). */
const AB_FRONT_LABELS: Record<number, string> = { 1: "Meet RhinoBot and Ayo", 2: "Contents", 3: "For grown-ups", 4: "Safety rules" };

/**
 * Roles come from the final books' own structure, checked page by page against the Activity Book
 * REVISED_4 and Teacher Guide REVISED_1 when this index was built:
 *  - Activity Book week of 3 pages: Think & Move, Code it!, Draw it!. One exception: Term 1 Week 5
 *    opens with a Think & Code page.
 *  - Week 10 (2 pages): Code it!, Draw it!. Week 12 (1 page): My stars. Week 13: badge page(s).
 *  - Teacher Guide week of 2 pages: lesson plan, then check and support (Week 12: station check).
 *    Week 13 is one showcase page.
 */
export const AB_THINK_CODE_EXCEPTION = { term: 1, week: 5 } as const;

export function buildNursery1Pages(): TmcBookPage[] {
  const out: TmcBookPage[] = [];
  const add = (bookId: string, pageNumber: number, lessonId: string, role: TmcPageRole, label?: string) =>
    out.push({ bookId, pageNumber, lessonId, role, ...(label ? { label } : {}) });

  for (const [id, kind, , a, b] of AB_OTHER) {
    for (let page = a; page <= b; page += 1) {
      add(N1_ACTIVITY_BOOK_ID, page, id, kind === "term-opener" ? "term-opener" : "front-matter", kind === "front-matter" ? AB_FRONT_LABELS[page] : undefined);
    }
  }
  for (const [id, kind, , a, b] of TG_OTHER) {
    for (let page = a; page <= b; page += 1) add(N1_TEACHER_GUIDE_ID, page, id, kind === "term-overview" ? "term-overview" : "front-matter");
  }
  for (const [t, w, , abStart, abEnd, tgStart, tgEnd] of NURSERY_1_WEEK_TABLE) {
    const abRoles: TmcPageRole[] =
      w === 13 ? Array(abEnd - abStart + 1).fill("badge")
      : w === 12 ? ["my-stars"]
      : w === 10 ? ["code-it", "draw-it"]
      : [t === AB_THINK_CODE_EXCEPTION.term && w === AB_THINK_CODE_EXCEPTION.week ? "think-code" : "think-move", "code-it", "draw-it"];
    abRoles.forEach((role, i) => add(N1_ACTIVITY_BOOK_ID, abStart + i, abId(t, w), role));
    const tgRoles: TmcPageRole[] = w === 13 ? ["showcase"] : ["lesson-plan", w === 12 ? "station-check" : "check-support"];
    tgRoles.forEach((role, i) => add(N1_TEACHER_GUIDE_ID, tgStart + i, tgId(t, w), role));
    if (abRoles.length !== abEnd - abStart + 1) throw new Error(`Activity Book T${t}W${w}: ${abRoles.length} roles for ${abEnd - abStart + 1} pages`);
    if (tgRoles.length !== tgEnd - tgStart + 1) throw new Error(`Teacher Guide T${t}W${w}: ${tgRoles.length} roles for ${tgEnd - tgStart + 1} pages`);
  }
  return out.sort((x, y) => x.bookId.localeCompare(y.bookId) || x.pageNumber - y.pageNumber);
}

const resources = buildNursery1Resources();

export const NURSERY_1_REGISTRY: TmcBookRegistry = {
  books: NURSERY_1_BOOKS,
  lessons: buildNursery1Lessons(resources),
  pages: buildNursery1Pages(),
  resources,
  relationships: buildRelationships(resources),
  legacyMappings: NURSERY_1_LEGACY_MAPPINGS,
};
