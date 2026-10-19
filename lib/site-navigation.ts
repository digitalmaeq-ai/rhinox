// One shared map between the header menus and the homepage Explore engine.
// The menus keep their own labels and routes; this file says which branch of
// the explore taxonomy each menu destination represents, so both surfaces
// read the same data (counts) and can deep-link into each other.

export interface MenuTaxonomyTarget {
  category: string;
  path: string[];
}

// Destination page -> taxonomy branch it lists.
export const menuTaxonomy: Record<string, MenuTaxonomyTarget> = {
  "/education/stem-steam": { category: "educational", path: ["learning", "stem-steam"] },
  "/education/think-move-code": { category: "commerce", path: ["books", "think-move-code"] },
  "/education/books": { category: "commerce", path: ["books"] },
  "/education/coding-robotics": { category: "educational", path: ["technology"] },
  "/education/teacher-parent-resources": { category: "resource", path: ["resources"] },

  "/explore/experiences": { category: "interactive", path: ["experiences"] },
  "/explore/project-lab": { category: "educational", path: ["projects"] },
  "/explore/virtual-lab": { category: "interactive", path: ["virtual-labs"] },
  "/explore/stem-games": { category: "interactive", path: ["experiences", "games"] },
  "/explore/stem-quizzes": { category: "interactive", path: ["experiences", "stem-quizzes"] },
  "/explore/stem-challenges": { category: "interactive", path: ["competitions"] },

  // RhinoCode landing page. Only this one page is mapped: the studios are
  // tools, and Game Challenges lists the same branch, so mapping more pages
  // would make "which page matches this branch" ambiguous.
  "/coding-robotics": { category: "interactive", path: ["experiences", "games", "coding-games"] },

  "/shop/books": { category: "commerce", path: ["books"] },
  "/shop/kits": { category: "commerce", path: ["kits"] },
  "/shop/laboratory-equipment": { category: "commerce", path: ["laboratory-equipment"] },
  "/shop/laboratory-chemicals": { category: "commerce", path: ["laboratory-chemicals"] },

  "/schools/stem-school-solutions": { category: "resource", path: ["services", "school-stem-solutions"] },
  "/schools/laboratory-solutions": { category: "resource", path: ["services"] },
  "/schools/coding-robotics": { category: "resource", path: ["services", "coding-robotics-training"] },
  "/schools/teacher-training": { category: "resource", path: ["services", "teacher-training"] },

  "/resources/articles": { category: "resource", path: ["resources", "articles"] },
  "/resources/videos": { category: "resource", path: ["resources", "videos"] },
  "/resources/free-downloads": { category: "resource", path: ["resources", "free-downloads"] },
};

// Menus whose dropdown pages are all browsable in the Explore "Site menu" view.
export const EXPLORE_MENUS = [
  "EDUCATION",
  "EXPLORE",
  "CODING & ROBOTICS",
  "SHOP",
  "SCHOOLS & INSTITUTIONS",
  "RESOURCES",
];

// Link that opens the homepage Explore section on a menu (and optionally one
// of its dropdown pages).
export function menuHref(label: string, dest?: string): string {
  const params = new URLSearchParams({ menu: label });
  if (dest) params.set("dest", dest);
  return `/?${params.toString()}#explore`;
}

// Link that opens the homepage Explore engine on a branch.
export function exploreHref(target: MenuTaxonomyTarget): string {
  const value = [target.category, ...target.path].join("/");
  return `/?explore=${value}#explore`;
}

// Parse the `explore` query value back into a branch.
export function parseExploreParam(value: string | null): MenuTaxonomyTarget | null {
  if (!value) return null;
  const [category, ...path] = value.split("/").filter(Boolean);
  return category ? { category, path } : null;
}

// Reverse lookup for the engine: the menu page that best matches a branch
// (exact match, otherwise the deepest menu page that contains it).
export function getPageForTaxonomy(category: string, path: string[]): string | null {
  let best: { href: string; depth: number } | null = null;
  for (const [href, target] of Object.entries(menuTaxonomy)) {
    if (target.category !== category || target.path.length > path.length) continue;
    if (!target.path.every((seg, i) => path[i] === seg)) continue;
    if (!best || target.path.length > best.depth) {
      best = { href, depth: target.path.length };
    }
  }
  return best?.href ?? null;
}

// ---- Menu data: the single source for the header and the Explore section ----

export type MenuItem = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
};

export type MenuColumn = {
  title: string;
  items: MenuItem[];
};

export type MegaMenu = {
  columns: MenuColumn[];
  featured?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    label: string;
  };
};

export type NavigationItem = {
  label: string;
  href: string;
  megaMenu?: MegaMenu;
};

export const navigation: NavigationItem[] = [
  {
    label: "EDUCATION",
    href: "/education",
    megaMenu: {
      columns: [
        {
          title: "STEM & STEAM",
          items: [
            {
              label: "STEM & STEAM Education",
              href: "/education/stem-steam",
              description:
                "Practical science, technology, engineering, arts and mathematics learning.",
            },
            {
              label: "Think • Move • Code",
              href: "/education/think-move-code",
              description:
                "Rhinox's progressive learning journey for young learners.",
            },
          ],
        },
        {
          title: "LEARNING",
          items: [
            {
              label: "Books",
              href: "/education/books",
              description:
                "Curriculum aligned books, workbooks and activity resources.",
            },
            {
              label: "Coding & Robotics",
              href: "/education/coding-robotics",
              description:
                "Coding, robotics, computational thinking and maker learning.",
            },
            {
              label: "Teacher & Parent Resources",
              href: "/education/teacher-parent-resources",
              description:
                "Resources designed to support learning beyond the classroom.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "RHINOX EDUCATION",
        title: "Learn. Practise. Build.",
        description:
          "Explore a connected STEM learning ecosystem designed for schools, teachers, parents and young creators.",
        href: "/education",
        label: "Explore Education",
      },
    },
  },

  {
    label: "EXPLORE",
    href: "/explore",
    megaMenu: {
      columns: [
        {
          title: "DISCOVER & BUILD",
          items: [
            {
              label: "Explore STEM",
              href: "/explore",
              description: "Discover the wider Rhinox STEM learning ecosystem.",
            },
            {
              label: "Project Lab",
              href: "/explore/project-lab",
              description: "Build practical STEM projects and learn by making.",
            },
            {
              label: "STEM Lab Designer",
              href: "/explore/lab-designer",
              description: "Explore and design laboratory learning environments.",
            },
          ],
        },
        {
          title: "INTERACTIVE",
          items: [
            {
              label: "Experiences",
              href: "/explore/experiences",
              description: "Short games, puzzles and early science activities, easiest first.",
            },
            {
              label: "Virtual Labs",
              href: "/explore/virtual-lab",
              description: "WAEC/NECO-style practicals in physics, chemistry and biology with CBT, calculations and records.",
            },
            {
              label: "STEM Games",
              href: "/explore/stem-games",
              description: "Learn through purposeful STEM based games and challenges.",
            },
          ],
        },
        {
          title: "TEST & CHALLENGE",
          items: [
            {
              label: "STEM Quizzes",
              href: "/explore/stem-quizzes",
              description: "Test understanding and reinforce important concepts.",
            },
            {
              label: "STEM Challenges",
              href: "/explore/stem-challenges",
              description: "Solve problems, experiment and create new solutions.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "EXPLORE RHINOX",
        title: "Discover. Build. Create.",
        description:
          "Move beyond traditional learning with projects, experiments, virtual labs, games and challenges.",
        href: "/explore",
        label: "Explore the Lab",
      },
    },
  },

  {
    label: "CODING & ROBOTICS",
    href: "/coding-robotics",
    megaMenu: {
      columns: [
        {
          title: "RHINOCODE STUDIOS",
          items: [
            {
              label: "RhinoBot: Robot Programming Lab",
              href: "/coding-robotics/robot-lab",
              description:
                "Program a robot with blocks, solve missions and save your programmes.",
            },
            {
              label: "RhinoCode Game Creator",
              href: "/coding-robotics/game-creator",
              description:
                "Design a maze game, choose its rules, play it and save it.",
            },
          ],
        },
        {
          title: "PRACTISE & SHARE",
          items: [
            {
              label: "Game Challenges",
              href: "/coding-robotics/challenges",
              description:
                "Coding puzzles and missions that turn instructions into action.",
            },
            {
              label: "My Projects",
              href: "/coding-robotics/my-projects",
              description:
                "The programmes and games you have made, kept together.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "RHINOCODE",
        title: "Code it. Build it. Play it.",
        description:
          "One home for learning to code: program a robot, solve game challenges and build your own games.",
        href: "/coding-robotics",
        label: "Explore RhinoCode",
      },
    },
  },

  {
    label: "SHOP",
    // A plain link, no dropdown: the /shop page itself lists every category.
    href: "/shop",
  },

  {
    label: "SCHOOLS & INSTITUTIONS",
    href: "/schools",
    megaMenu: {
      columns: [
        {
          title: "SOLUTIONS",
          items: [
            {
              label: "STEM School Solutions",
              href: "/schools/stem-school-solutions",
              description:
                "Integrated STEM education solutions for schools and learning centres.",
            },
            {
              label: "Laboratory Solutions",
              href: "/schools/laboratory-solutions",
              description:
                "Laboratory planning, supply, setup and support.",
            },
            {
              label: "Coding & Robotics",
              href: "/schools/coding-robotics",
              description:
                "Coding and robotics programmes for schools and institutions.",
            },
            {
              label: "Books & Publishing",
              href: "/education/books",
              description:
                "Rhinox STEM books, workbooks and activity books for schools.",
            },
          ],
        },
        {
          title: "SUPPORT",
          items: [
            {
              label: "Teacher Training",
              href: "/schools/teacher-training",
              description:
                "Practical professional development for STEM educators.",
            },
            {
              label: "STEM Clubs",
              href: "/schools/stem-clubs",
              description:
                "Hands-on clubs for schools. Express interest in the pilot.",
              badge: "New",
            },
            {
              label: "Request a Quote",
              href: "/schools/request-a-quote",
              description:
                "Tell us what your school or institution needs.",
              badge: "CTA",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "FOR INSTITUTIONS",
        title: "Build a stronger STEM ecosystem.",
        description:
          "From laboratories and equipment to teacher training and coding programmes.",
        href: "/schools",
        label: "View School Solutions",
      },
    },
  },

  {
    label: "RESOURCES",
    href: "/resources",
    megaMenu: {
      columns: [
        {
          title: "LEARN",
          items: [
            {
              label: "Articles",
              href: "/resources/articles",
              description:
                "STEM articles, explainers, ideas and educational insights.",
            },
            {
              label: "Videos",
              href: "/resources/videos",
              description:
                "Educational videos and practical demonstrations.",
            },
            {
              label: "Free Downloads",
              href: "/resources/free-downloads",
              description:
                "Useful STEM resources available for free download.",
            },
          ],
        },
        {
          title: "MY RHINOX",
          items: [
            {
              label: "My Rhinox Library",
              href: "/resources/my-rhinox-library",
              description:
                "Your personal collection of Rhinox learning resources.",
            },
            {
              label: "Badges",
              href: "/resources/badges",
              description:
                "Recognition for learning, participation and achievement.",
            },
            {
              label: "Certificates",
              href: "/resources/certificates",
              description:
                "Certificates earned through Rhinox learning experiences.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "RHINOX RESOURCES",
        title: "Keep learning.",
        description:
          "Articles, videos, downloads and learning resources to support continuous discovery.",
        href: "/resources",
        label: "Browse Resources",
      },
    },
  },

  {
    label: "ABOUT",
    href: "/about",
    megaMenu: {
      columns: [
        {
          title: "RHINOX",
          items: [
            {
              label: "About Rhinox",
              href: "/about",
              description:
                "Discover Rhinox Scientifica and what we are building.",
            },
            {
              label: "Our Mission",
              href: "/about/mission",
              description:
                "The ideas and principles behind the Rhinox ecosystem.",
            },
            {
              label: "Support",
              href: "/about/support",
              description:
                "Find help and information about using Rhinox resources.",
            },
            {
              label: "Contact",
              href: "/contact",
              description:
                "Talk to the Rhinox team about orders, schools and partnerships.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "RHINOX SCIENTIFICA",
        title: "Science. Technology. Creativity.",
        description:
          "Building practical STEM experiences that help learners discover, create and progress.",
        href: "/about",
        label: "About Rhinox",
      },
    },
  },
];

