/**
 * Book Registry core: pure validation and access policy. No file, network or React access.
 *
 * Book-first rule: the approved books are the single source of truth for instructional content.
 * Only approved or published book editions can be a production source. Revised or "final draft"
 * is NOT approved. Nothing here reads the Master Curriculum.
 *
 * Keep this file free of runtime imports so scripts can load it with node --experimental-strip-types.
 */
import type {
  TmcAccessLevel,
  TmcBook,
  TmcBookContentItem,
  TmcBookLesson,
  TmcBookRegistry,
  TmcBookStatus,
  TmcLearningResource,
} from "../../types/tmc-registry";

export const BOOK_STATUS_ORDER: readonly TmcBookStatus[] = [
  "draft",
  "under-review",
  "revised",
  "approved",
  "published",
];

/** Only these editions may serve as the production instructional source. */
export const PRODUCTION_STATUSES: readonly TmcBookStatus[] = ["approved", "published"];

export const isProductionStatus = (status: TmcBookStatus): boolean => PRODUCTION_STATUSES.includes(status);

/** Resource types that carry answers or teacher-only instruction. They may never be public. */
export const TEACHER_ONLY_RESOURCE_TYPES: readonly TmcLearningResource["resourceType"][] = [
  "lesson-plan",
  "project-sheet",
  "review-sheet",
  "question-bank",
];

const STRICT_ACCESS: readonly TmcAccessLevel[] = ["teacher-only", "internal"];
const SHA256 = /^[a-f0-9]{64}$/;

export interface RegistryValidation {
  errors: string[];
  warnings: string[];
}

export interface ValidateOptions {
  /** Require every page of a book with a known page count to belong to exactly one unit. */
  requireFullPageCoverage?: boolean;
  /** Require every resource to be linked to its source lesson by at least one relationship (Stage 6). */
  requireResourceRelationships?: boolean;
}

const rank = (status: TmcBookStatus): number => BOOK_STATUS_ORDER.indexOf(status);

export function indexBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) if (!map.has(key(item))) map.set(key(item), item);
  return map;
}

function findDuplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) (seen.has(id) ? duplicates : seen).add(id);
  return [...duplicates];
}

/** Resource types that may assess a lesson. */
export const ASSESSING_RESOURCE_TYPES: readonly TmcLearningResource["resourceType"][] = ["quiz", "question-bank", "review-sheet"];

/** Resources still served from a public path although their access level says otherwise. */
export function findAccessDebt(resources: readonly TmcLearningResource[]): TmcLearningResource[] {
  return resources.filter((resource) => resource.accessLevel !== "public" && resource.servedFromPublicPath === true);
}

export function validateBookRegistry(registry: TmcBookRegistry, options: ValidateOptions = {}): RegistryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { books, lessons, resources, relationships, legacyMappings } = registry;

  for (const id of findDuplicates(books.map((book) => book.bookId))) errors.push(`Duplicate book id: ${id}.`);
  for (const id of findDuplicates(lessons.map((lesson) => lesson.lessonId))) errors.push(`Duplicate lesson id: ${id}.`);
  for (const id of findDuplicates(resources.map((resource) => resource.id))) errors.push(`Duplicate resource id: ${id}.`);
  for (const id of findDuplicates(legacyMappings.map((mapping) => mapping.legacyId))) {
    errors.push(`Duplicate legacy mapping id: ${id}.`);
  }

  const bookById = indexBy(books, (book) => book.bookId);
  const lessonById = indexBy(lessons, (lesson) => lesson.lessonId);

  /* ---- books ---- */
  for (const book of books) {
    const label = `Book ${book.bookId}`;
    if (book.publicationStatus === "published" && !isProductionStatus(book.editorialStatus)) {
      errors.push(`${label}: is marked published but its editorial status is "${book.editorialStatus}".`);
    }
    if (book.editorialStatus === "published" && book.publicationStatus !== "published") {
      errors.push(`${label}: editorial status is "published" but publication status is "${book.publicationStatus}".`);
    }
    if ((book.availability === "planned" || book.availability === "missing") && rank(book.editorialStatus) > rank("under-review") &&
        book.editorialStatus !== "superseded") {
      errors.push(`${label}: is ${book.availability} but has editorial status "${book.editorialStatus}".`);
    }
    if (isProductionStatus(book.editorialStatus) && book.availability !== "verified") {
      errors.push(`${label}: cannot be ${book.editorialStatus} unless its file is verified.`);
    }
    if (book.availability === "verified") {
      if (!book.fileSha256 || !SHA256.test(book.fileSha256)) errors.push(`${label}: verified but has no valid SHA-256.`);
      if (!Number.isInteger(book.pageCount) || (book.pageCount ?? 0) < 1) errors.push(`${label}: verified but has no page count.`);
    }
    if (!book.edition.trim() || !book.version.trim()) errors.push(`${label}: edition and version are required.`);
    if (book.supersedesBookId && !bookById.has(book.supersedesBookId)) {
      errors.push(`${label}: supersedes unknown book ${book.supersedesBookId}.`);
    }
  }

  /* ---- lessons ---- */
  const unitsByBook = new Map<string, TmcBookLesson[]>();
  for (const lesson of lessons) {
    const label = `Lesson ${lesson.lessonId}`;
    const book = bookById.get(lesson.bookId);
    if (!book) {
      errors.push(`${label}: unknown book ${lesson.bookId}.`);
      continue;
    }
    unitsByBook.set(book.bookId, [...(unitsByBook.get(book.bookId) ?? []), lesson]);
    if (lesson.level !== book.level) errors.push(`${label}: level "${lesson.level}" differs from its book's level "${book.level}".`);
    if (!Number.isInteger(lesson.pageStart) || !Number.isInteger(lesson.pageEnd) || lesson.pageStart < 1 || lesson.pageEnd < lesson.pageStart) {
      errors.push(`${label}: invalid page range ${lesson.pageStart}-${lesson.pageEnd}.`);
    } else if (book.pageCount && lesson.pageEnd > book.pageCount) {
      errors.push(`${label}: page ${lesson.pageEnd} is beyond the book's ${book.pageCount} pages.`);
    }
    if (lesson.unitKind === "week") {
      if (!(lesson.term && lesson.term >= 1 && lesson.term <= 3) || !(lesson.week && lesson.week >= 1 && lesson.week <= 13)) {
        errors.push(`${label}: a week unit needs a term of 1 to 3 and a week of 1 to 13.`);
      }
    } else if (lesson.week !== undefined) {
      errors.push(`${label}: only week units may have a week number.`);
    }
    // A lesson can never be more approved than its book.
    if (isProductionStatus(lesson.approvalStatus) && !isProductionStatus(book.editorialStatus)) {
      errors.push(`${label}: is "${lesson.approvalStatus}" but its book is only "${book.editorialStatus}".`);
    }
    if (rank(lesson.approvalStatus) > rank(book.editorialStatus) && book.editorialStatus !== "superseded" && lesson.approvalStatus !== "superseded") {
      errors.push(`${label}: status "${lesson.approvalStatus}" is ahead of its book's "${book.editorialStatus}".`);
    }
    // Content that was never captured cannot be approved.
    if (lesson.contentStatus === "structure-only" && isProductionStatus(lesson.approvalStatus)) {
      errors.push(`${label}: cannot be ${lesson.approvalStatus} while its content is structure-only.`);
    }
  }

  /* ---- page coverage per book ---- */
  for (const [bookId, units] of unitsByBook) {
    const book = bookById.get(bookId);
    if (!book?.pageCount) continue;
    const owner = new Array<string | null>(book.pageCount + 1).fill(null);
    for (const unit of units) {
      if (unit.pageStart < 1 || unit.pageEnd > book.pageCount || unit.pageEnd < unit.pageStart) continue;
      for (let page = unit.pageStart; page <= unit.pageEnd; page += 1) {
        if (owner[page]) errors.push(`Book ${bookId}: page ${page} belongs to both ${owner[page]} and ${unit.lessonId}.`);
        else owner[page] = unit.lessonId;
      }
    }
    const gaps: number[] = [];
    for (let page = 1; page <= book.pageCount; page += 1) if (!owner[page]) gaps.push(page);
    if (gaps.length > 0) {
      const message = `Book ${bookId}: ${gaps.length} page(s) belong to no unit (${gaps.slice(0, 12).join(", ")}${gaps.length > 12 ? ", ..." : ""}).`;
      (options.requireFullPageCoverage ? errors : warnings).push(message);
    }
  }

  /* ---- resources ---- */
  for (const resource of resources) {
    const label = `Resource ${resource.id}`;
    const lesson = lessonById.get(resource.source?.lessonId ?? "");
    if (!lesson || lesson.bookId !== resource.source.bookId) {
      errors.push(`${label}: has no valid book lesson source (${resource.source?.bookId}/${resource.source?.lessonId}).`);
    } else {
      if (lesson.level !== resource.level) errors.push(`${label}: level differs from its source lesson.`);
      if (lesson.unitKind === "week" && (lesson.term !== resource.term || lesson.week !== resource.week)) {
        errors.push(`${label}: term/week differ from its source lesson.`);
      }
    }
    if (resource.origin === "enrichment" && !resource.enrichmentLabel?.trim()) {
      errors.push(`${label}: enrichment must carry an enrichment label.`);
    }
    if (resource.origin === "book" && resource.enrichmentLabel) {
      errors.push(`${label}: only enrichment may carry an enrichment label.`);
    }
    if ((resource.status === "published" || resource.status === "approved") && resource.availability !== "verified") {
      errors.push(`${label}: cannot be ${resource.status} unless its file is verified.`);
    }
    if (resource.availability === "verified" && !resource.uri) errors.push(`${label}: verified but has no uri.`);
    if (resource.availability === "planned" || resource.availability === "missing") {
      if (resource.uri) errors.push(`${label}: is ${resource.availability} so it must not have a uri.`);
    }
    if (TEACHER_ONLY_RESOURCE_TYPES.includes(resource.resourceType) && !STRICT_ACCESS.includes(resource.accessLevel)) {
      errors.push(`${label}: ${resource.resourceType} must be teacher-only, not "${resource.accessLevel}".`);
    }
    // A resource built on a book that is not production-approved may not be published.
    const book = lesson ? bookById.get(lesson.bookId) : undefined;
    if (book && resource.status === "published" && !isProductionStatus(book.editorialStatus)) {
      errors.push(`${label}: is published but its source book is only "${book.editorialStatus}".`);
    }
  }
  const debt = findAccessDebt(resources);
  if (debt.length > 0) {
    warnings.push(`${debt.length} resource(s) have a restricted access level but are still served from a public path (access debt).`);
  }

  /* ---- relationships ---- */
  const knownIds = new Set<string>([...bookById.keys(), ...lessonById.keys(), ...resources.map((r) => r.id)]);
  for (const edge of relationships) {
    if (!knownIds.has(edge.fromId)) errors.push(`Relationship ${edge.relation}: unknown from id ${edge.fromId}.`);
    if (!knownIds.has(edge.toId)) errors.push(`Relationship ${edge.relation}: unknown to id ${edge.toId}.`);
  }
  const resourceById = indexBy(resources, (resource) => resource.id);
  const seenEdges = new Set<string>();
  const linkedResourceIds = new Set<string>();
  const placeOf = (id: string) => {
    const lesson = lessonById.get(id);
    if (lesson) return { level: lesson.level, term: lesson.term, week: lesson.week, weekly: lesson.unitKind === "week" };
    const resource = resourceById.get(id);
    if (resource) return { level: resource.level, term: resource.term, week: resource.week, weekly: resource.week !== undefined };
    return undefined;
  };
  for (const edge of relationships) {
    const label = `Relationship ${edge.relation} ${edge.fromId} -> ${edge.toId}`;
    if (edge.fromId === edge.toId) errors.push(`${label}: connects an item to itself.`);
    const key = `${edge.fromId}|${edge.toId}|${edge.relation}`;
    if (seenEdges.has(key)) errors.push(`${label}: is listed twice.`);
    seenEdges.add(key);
    if (resourceById.has(edge.fromId)) linkedResourceIds.add(edge.fromId);
    if (resourceById.has(edge.toId)) linkedResourceIds.add(edge.toId);
    const from = placeOf(edge.fromId);
    const to = placeOf(edge.toId);
    if (from && to) {
      if (from.level !== to.level) errors.push(`${label}: connects different levels.`);
      if (from.weekly && to.weekly && (from.term !== to.term || from.week !== to.week)) {
        errors.push(`${label}: connects different weeks.`);
      }
    }
    if (edge.relation === "assesses") {
      const source = resourceById.get(edge.fromId);
      if (!source || !ASSESSING_RESOURCE_TYPES.includes(source.resourceType)) {
        errors.push(`${label}: only a quiz, question bank or review sheet can assess a lesson.`);
      }
    }
  }
  for (const lesson of lessons) {
    for (const id of lesson.relatedDigitalResourceIds) {
      const related = resourceById.get(id);
      if (!related) errors.push(`Lesson ${lesson.lessonId}: lists unknown digital resource ${id}.`);
      else if (related.source.lessonId !== lesson.lessonId) {
        errors.push(`Lesson ${lesson.lessonId}: lists ${id}, whose source is a different lesson.`);
      }
    }
  }
  const unlinked = resources.filter((resource) => !linkedResourceIds.has(resource.id));
  if (unlinked.length > 0) {
    const message = `${unlinked.length} resource(s) have no relationship to a lesson (${unlinked.slice(0, 5).map((r) => r.id).join(", ")}${unlinked.length > 5 ? ", ..." : ""}).`;
    (options.requireResourceRelationships ? errors : warnings).push(message);
  }

  /* ---- legacy mappings ---- */
  for (const mapping of legacyMappings) {
    const label = `Legacy mapping ${mapping.legacyId}`;
    if (/^tmc-v3-16-/.test(mapping.legacyId)) errors.push(`${label}: a legacy id must never be relabelled as v3.16.`);
    if (mapping.status === "unresolved" && !mapping.editorialReviewRequired) {
      errors.push(`${label}: an unresolved mapping must be flagged for editorial review.`);
    }
    if (mapping.status === "mapped") {
      if (!mapping.candidateBookLessonId || !lessonById.has(mapping.candidateBookLessonId)) {
        errors.push(`${label}: is mapped but its book lesson does not exist.`);
      }
      if (!mapping.reviewedBy || !mapping.reviewedAt) errors.push(`${label}: a mapping needs a named reviewer and date.`);
    }
  }

  return { errors, warnings };
}

/** Lessons a learner may be served: approved or published book, approved lesson, content actually captured. */
export function getProductionLessons(registry: TmcBookRegistry): TmcBookLesson[] {
  const bookById = indexBy(registry.books, (book) => book.bookId);
  return registry.lessons.filter((lesson) => {
    const book = bookById.get(lesson.bookId);
    return Boolean(book) && isProductionStatus(book!.editorialStatus) && isProductionStatus(lesson.approvalStatus) &&
      lesson.contentStatus !== "structure-only";
  });
}

export type BookAccess = {
  learnerId: string | null;
  canReadLicensedCurriculum: boolean;
  /** Only a verified teacher entitlement may set this. Never derived from client input. */
  isTeacher?: boolean;
};

const STRIP_FOR_LEARNERS: readonly TmcAccessLevel[] = ["teacher-only", "internal"];

function filterItems(items: TmcBookContentItem[], isTeacher: boolean): TmcBookContentItem[] {
  return items.filter((item) => isTeacher ? item.accessLevel !== "internal" : !STRIP_FOR_LEARNERS.includes(item.accessLevel));
}

/**
 * Policy for serving a book lesson. Fails closed: returns null unless the caller is an
 * authenticated, licensed learner, the lesson is in the production set, and the book is
 * readable by that audience. Teacher-only items are removed unless a verified teacher.
 */
export function authorizeBookLesson(
  registry: TmcBookRegistry,
  lessonId: string,
  access: BookAccess | null,
): TmcBookLesson | null {
  if (!access || typeof access.learnerId !== "string" || access.learnerId.trim().length === 0 ||
      access.canReadLicensedCurriculum !== true) return null;
  const isTeacher = access.isTeacher === true;
  const lesson = getProductionLessons(registry).find((candidate) => candidate.lessonId === lessonId);
  if (!lesson) return null;
  const book = registry.books.find((candidate) => candidate.bookId === lesson.bookId);
  if (!book || book.accessLevel === "internal") return null;
  if (book.accessLevel === "teacher-only" && !isTeacher) return null;
  return {
    ...lesson,
    activities: filterItems(lesson.activities, isTeacher),
    examples: filterItems(lesson.examples, isTeacher),
    practicalTasks: filterItems(lesson.practicalTasks, isTeacher),
    projects: filterItems(lesson.projects, isTeacher),
    exercises: filterItems(lesson.exercises, isTeacher),
    reviewQuestions: filterItems(lesson.reviewQuestions, isTeacher),
  };
}

/** A book is a production source only when approved or published. */
export const isProductionSource = (book: TmcBook): boolean => isProductionStatus(book.editorialStatus);
