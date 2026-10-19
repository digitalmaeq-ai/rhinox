import type { ContentType } from "@/types/content";
import type { ShopCategory, ProductContent } from "@/types/products";
import type { ContentItem } from "./content";
import {
  getAllContent,
  getContentByType,
  getContentBySlug,
  getProductsByShopCategory,
} from "./content";
import { isLiveContent } from "./interactive-experiences";

// A content SECTION is a browsable URL prefix — "/explore/stem-quizzes",
// "/shop/kits" — that the generic content engine (app/[...path]/page.tsx)
// resolves without a dedicated route folder. This is the piece of the
// locked architecture diagram that used to require one hand-written
// `[section]/page.tsx` + `[section]/[slug]/page.tsx` pair per section (20
// pairs, almost all identical boilerplate): adding a new browsable section
// for an existing content type is now one entry here, not two new files.
//
// A section lists every item whose contentType is in `contentTypes`
// (unioned together); when `shopCategory` is set, listing and detail
// resolution are additionally filtered to ProductContent items of that
// shop category specifically (this also fixes a real pre-existing bug: the
// old per-category shop [slug] pages resolved products by slug alone, so a
// book's slug would technically also render — incorrectly — under
// /shop/kits/<slug>; matching shopCategory here prevents that).
export interface ContentSection {
  path: string;
  eyebrow: string;
  heading: string;
  description: string;
  contentTypes: ContentType[];
  shopCategory?: ShopCategory;
  // Live interactive experiences that also belong on this page. They keep
  // their own /experiences/<slug> pages; this only lists them here, so a
  // menu page shows every experience that fits it.
  includeExperiences?: (experience: ExperienceFacts) => boolean;
  // Types whose detail pages open under this path without being listed
  // (their registry route points here).
  alsoResolve?: ContentType[];
  // A short pointer shown above the listing, for pages whose topic has a
  // newer home elsewhere on the site.
  notice?: { text: string; href: string; label: string };
  notFoundLabel: string;
}

export interface ExperienceFacts {
  subjects: string[];
  runtime: string;
  taxonomyBranch: string;
  /** The full interactive branch, e.g. "experiences/games/coding-games". */
  taxonomyPath: string;
  component: string;
}

const CODING = ["coding", "robotics"];

function factsOf(item: ContentItem): ExperienceFacts {
  const e = item as ContentItem & {
    subjects?: string[];
    runtime?: string;
    component?: string;
    taxonomy?: { category: string; path: string[] }[];
  };
  const path = e.taxonomy?.find((t) => t.category === "interactive")?.path ?? [];
  return {
    subjects: e.subjects ?? [],
    runtime: e.runtime ?? "",
    taxonomyBranch: path.slice(0, 2).join("/"),
    taxonomyPath: path.join("/"),
    component: e.component ?? "",
  };
}

const isCoding = (e: ExperienceFacts) => e.subjects.some((x) => CODING.includes(x));
const isNotCoding = (e: ExperienceFacts) => !isCoding(e);
const isScienceLab = (e: ExperienceFacts) => e.runtime === "simulation" || e.runtime === "virtual-lab";
// Engineering virtual labs (gears, bridges, solar) live on the Virtual Labs page, not here.
const isEngineering = (e: ExperienceFacts) => e.subjects.includes("engineering") && !isScienceLab(e);
// Coding games belong to RhinoCode (/coding-robotics), so each is listed on exactly one
// games page: Game Challenges, or the Robot Lab studio for the lab itself.
const isCodingGame = (e: ExperienceFacts) => e.taxonomyPath === "experiences/games/coding-games";
const isChallenge = (e: ExperienceFacts) => isCodingGame(e) && e.component !== "rhinobot-lab";
// STEM Games lists real games only (filed under experiences/games), except coding games.
// Sorting and matching activities live on the Experiences page, so no item is listed on both.
const isPlayable = (e: ExperienceFacts) =>
  e.taxonomyBranch === "experiences/games" && !isCodingGame(e);

export const contentSections: ContentSection[] = [
  {
    path: "/education/stem-steam",
    eyebrow: "Rhinox Scientifica",
    heading: "STEM & STEAM Education",
    description:
      "Structured STEM and STEAM learning resources designed for practical learning.",
    contentTypes: ["lesson"],
    includeExperiences: isNotCoding,
    alsoResolve: ["activity"],
    notFoundLabel: "Lesson Not Found",
  },
  {
    path: "/education/coding-robotics",
    eyebrow: "Rhinox Scientifica",
    heading: "Coding & Robotics",
    description:
      "Discover coding, robotics, computational thinking and practical technology learning.",
    contentTypes: ["project"],
    includeExperiences: isCoding,
    notice: {
      text: "Looking to practise? RhinoCode brings the Robot Lab and coding game challenges together.",
      href: "/coding-robotics",
      label: "Open RhinoCode",
    },
    notFoundLabel: "Coding or Robotics Content Not Found",
  },
  {
    path: "/education/teacher-parent-resources",
    eyebrow: "Rhinox Scientifica",
    heading: "Teacher & Parent Resources",
    description:
      "Practical resources to help teachers and parents support STEM learning.",
    contentTypes: ["teacher-resource", "parent-resource", "worksheet", "assessment"],
    notFoundLabel: "Teacher Resource Not Found",
  },
  {
    path: "/education/think-move-code",
    eyebrow: "Rhinox Scientifica",
    heading: "Think • Move • Code",
    description:
      "The Think • Move • Code book series and the hands-on coding and robotics activities that go with it.",
    contentTypes: ["product"],
    shopCategory: "books",
    includeExperiences: isCoding,
    notFoundLabel: "Learning Content Not Found",
  },
  {
    // Detail route (app/education/books/[slug]/page.tsx) stays a small
    // dedicated redirect to /shop/books/[slug] — this section only covers
    // the listing at /education/books.
    path: "/education/books",
    eyebrow: "Rhinox Scientifica",
    heading: "Books",
    description:
      "Explore Rhinox books, workbooks and activity based learning resources.",
    contentTypes: ["product"],
    shopCategory: "books",
    notFoundLabel: "Book Not Found",
  },
  {
    path: "/explore/experiments",
    eyebrow: "Rhinox Scientifica",
    heading: "Experiments",
    description:
      "Practical science experiments and investigations for curious learners.",
    contentTypes: ["experiment"],
    includeExperiences: isScienceLab,
    notFoundLabel: "Experiment Not Found",
  },
  {
    path: "/explore/project-lab",
    eyebrow: "Rhinox Scientifica",
    heading: "Project Lab",
    description:
      "Build practical STEM projects and turn ideas into working creations.",
    contentTypes: ["project"],
    includeExperiences: isEngineering,
    notFoundLabel: "Project Not Found",
  },
  {
    path: "/explore/stem-challenges",
    eyebrow: "Rhinox Scientifica",
    heading: "STEM Challenges",
    description:
      "Open ended STEM challenges that encourage problem solving, creativity and making.",
    contentTypes: ["challenge"],
    notFoundLabel: "Challenge Not Found",
  },
  {
    path: "/explore/stem-games",
    eyebrow: "Rhinox Scientifica",
    heading: "STEM Games",
    description:
      "Interactive games designed to make STEM learning engaging and practical.",
    contentTypes: ["game"],
    includeExperiences: isPlayable,
    notFoundLabel: "Game Not Found",
  },
  {
    path: "/coding-robotics/challenges",
    eyebrow: "RhinoCode",
    heading: "Game Challenges",
    description:
      "Coding puzzles and missions where you plan the steps, run your code and watch it work.",
    contentTypes: [],
    includeExperiences: isChallenge,
    notFoundLabel: "Game Challenge Not Found",
  },
  {
    path: "/explore/stem-quizzes",
    eyebrow: "Rhinox Scientifica",
    heading: "STEM Quizzes",
    description: "Interactive quizzes and knowledge checks for STEM learners.",
    contentTypes: ["quiz"],
    notFoundLabel: "Quiz Not Found",
  },
  {
    path: "/resources/articles",
    eyebrow: "Rhinox Scientifica",
    heading: "Articles",
    description:
      "Educational articles, STEM insights and practical learning ideas.",
    contentTypes: ["article"],
    notFoundLabel: "Article Not Found",
  },
  {
    path: "/resources/badges",
    eyebrow: "Rhinox Scientifica",
    heading: "Learning Badges",
    description:
      "Digital achievements recognising learning and practical STEM progress.",
    contentTypes: ["badge"],
    notFoundLabel: "Badge Not Found",
  },
  {
    path: "/resources/certificates",
    eyebrow: "Rhinox Scientifica",
    heading: "Certificates",
    description:
      "Certificates for Rhinox learning programmes, workshops and achievements.",
    contentTypes: ["certificate"],
    notFoundLabel: "Certificate Not Found",
  },
  {
    path: "/resources/free-downloads",
    eyebrow: "Rhinox Scientifica",
    heading: "Free Downloads",
    description:
      "Free worksheets, guides and downloadable STEM learning resources.",
    contentTypes: ["download"],
    alsoResolve: ["worksheet"],
    notFoundLabel: "Download Not Found",
  },
  {
    path: "/resources/videos",
    eyebrow: "Rhinox Scientifica",
    heading: "Companion Videos",
    description:
      "Educational videos that extend and support Rhinox learning content.",
    contentTypes: ["video"],
    notFoundLabel: "Video Not Found",
  },
  {
    path: "/shop/books",
    eyebrow: "Rhinox Scientifica",
    heading: "Books & Workbooks",
    description: "Explore Rhinox books, workbooks and activity books.",
    contentTypes: ["product"],
    shopCategory: "books",
    notFoundLabel: "Book Not Found",
  },
  {
    path: "/shop/digital-resources",
    eyebrow: "Rhinox Scientifica",
    heading: "Digital Resources",
    description: "Digital learning resources available from Rhinox Scientifica.",
    // NOTE: this section has always listed contentType "download" items
    // (not ShopCategory "digital-resources" products — no product currently
    // uses that category). Preserved exactly as the original hardcoded
    // route behaved; not a new design decision.
    contentTypes: ["download"],
    notFoundLabel: "Digital Resource Not Found",
  },
  {
    path: "/shop/kits",
    eyebrow: "Rhinox Scientifica",
    heading: "STEM & STEAM Kits",
    description:
      "Practical STEM and STEAM kits for learning, building and creating.",
    contentTypes: ["product"],
    shopCategory: "kits",
    notFoundLabel: "Kit Not Found",
  },
  {
    path: "/shop/laboratory-chemicals",
    eyebrow: "Rhinox Scientifica",
    heading: "Laboratory Chemicals",
    description: "Laboratory chemicals and scientific supplies.",
    contentTypes: ["product"],
    shopCategory: "laboratory-chemicals",
    notFoundLabel: "Laboratory Chemical Not Found",
  },
  {
    path: "/shop/laboratory-equipment",
    eyebrow: "Rhinox Scientifica",
    heading: "Laboratory Equipment",
    description:
      "Laboratory equipment and scientific instruments supplied by Rhinox Scientifica.",
    contentTypes: ["product"],
    shopCategory: "laboratory-equipment",
    notFoundLabel: "Laboratory Equipment Not Found",
  },
];

export function getSectionByPath(path: string): ContentSection | null {
  return contentSections.find((section) => section.path === path) ?? null;
}

// All items a listing page for this section should show.
export function getSectionItems(section: ContentSection): ContentItem[] {
  const own = section.shopCategory
    ? getProductsByShopCategory(section.shopCategory)
    : section.contentTypes.flatMap((type) => getContentByType(type));
  if (!section.includeExperiences) return own;

  const test = section.includeExperiences;
  const extra = getAllContent().filter(
    (item) => item.contentType === "experience" && isLiveContent(item) && test(factsOf(item)),
  );
  const seen = new Set(own.map((item) => item.id));
  return [...own, ...extra.filter((item) => !seen.has(item.id))];
}

// A single item for this section's detail page, or null if the slug
// doesn't resolve to any of the section's content types (or, for a
// shopCategory section, resolves to a product in a different category).
export function getSectionItemBySlug(
  section: ContentSection,
  slug: string
): ContentItem | null {
  for (const type of [...section.contentTypes, ...(section.alsoResolve ?? [])]) {
    const item = getContentBySlug(type, slug);

    if (!item) {
      continue;
    }

    if (section.shopCategory) {
      if (
        item.contentType === "product" &&
        (item as ProductContent).shopCategory === section.shopCategory
      ) {
        return item;
      }

      continue;
    }

    return item;
  }

  return null;
}
