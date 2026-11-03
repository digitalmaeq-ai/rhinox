# Rhinox Scientifica: Full-Site Design and Content Architecture Audit

| | |
|---|---|
| **Status** | Draft for review by Rhinox management. Nothing in this document has been implemented. |
| **Date** | 3 November 2026 |
| **Source of truth** | `main` at commit `d6aae2c` (the homepage still has the separate Play and Hands-on sections) |
| **Also inspected** | Open pull requests #23 (Linear-inspired) and #24 (Apple-inspired). Both are unmerged CSS drafts, so they were read for intent only and are not treated as production. |
| **Method** | Read-only inspection of the repository (every `page.tsx`, layout, shared component, CSS module, the navigation file, the content registry and section map, page configuration files) plus the earlier live crawl of the 39 menu destinations. |
| **Not done in this audit** | No code was changed, no commits or pull requests were made, and nothing was merged. A fresh visual pass at every breakpoint was not run for every route (see section I). |

---

## A. Executive summary

**The core finding.** Most pages on the site look interchangeable because they are built from the same three hero templates and draw from the same nine stock photographs. The pages differ in content but not in composition.

**What the evidence shows**

1. **One hero shape, repeated.** About 30 landing and listing pages (plus every generic item page) open with the same or a closely related arrangement: pale-blue background with a faint grid, a small blue eyebrow, a two-line headline whose second line is blue, one grey sentence, then either two buttons or an item count, with a rounded photograph on the right and two or three white chips along its bottom edge.
2. **Only three entry points make most of them.**
   - `HubHero` (defined in `app/components/hub/HubParts.tsx`) is used directly by five pages (Education, Resources, Schools, Request a Quote, STEM Clubs) and by `SectionPage`.
   - `SectionPage` renders 11 pages from configuration (`pageData.ts`): RhinoCode home, 6 Resources pages and 4 Schools pages.
   - `ContentHero` renders every content listing and every generic detail page, about 10 listing pages through the catch-all route plus every item detail page.
3. **The hero was built four times.** The same backdrop, grid and two-column hero are written separately in `hub.module.css`, `content.module.css`, `about/page.module.css` and `contact/page.module.css`. About, Our Mission and Support share one copy (`about/page.module.css`), and Contact has its own.
4. **Nine photographs carry the whole site.** The nine files in `public/images/hero` and `public/images/journey` are referenced about 110 times in code. `classroom.jpg` alone is referenced 28 times, `stem-lab.jpg` 17 times and `coding.jpg` 14 times. A visitor sees the same students and laboratory repeatedly.
5. **Thin pages get a full hero.** Most content sections hold one item or none. For these pages the hero is most of the page, which makes them look the same as each other and unfinished.
6. **Pages with real identity already exist and prove the point.** The Shop (`ShopCatalogue`), STEM Games (own cover and rails), the Think • Move • Code! home, Code Studio and the interactive player each look like what they are. The problem is limited to the template pages.
7. **The "Apple-inspired" direction is not in production.** It exists only as pull request #24, which changes two CSS files (`app/redesign.css`, `Footer.module.css`) for the shell and homepage. It does not address inner pages. A production build and visual QA are noted as outstanding on that pull request.

**What this audit recommends**

- Keep the Apple-inspired direction (quiet surfaces, precise borders, restrained blue, compact density) as the shared visual language, and express page purpose through composition rather than through colour or decoration.
- Replace "one hero for everything" with **nine page families** (section 5 evaluates your proposed eight and adds one: section hubs). Each family has one composition and a small number of shared parts.
- Introduce a **compact page header** for library and list pages so a page with one item is not mostly hero. Reserve the large hero for the six section landing pages, the homepage and a few institutional pages, and give each a different composition.
- Remove the repeated hero code by consolidating four implementations into one shared primitive with variants. Net component count should go down, not up.
- Replace most stock-photo heroes with content-led visuals (real item previews, badge designs, product covers, product screenshots) using the material the site already has.
- Fix navigation and content overlaps first (previous audit; paused for the Explore coupling described in section H), because several pages exist only to repeat another page.

**Priority order** (detail in section J): shared primitive and accessibility fixes → library and list pages → section hubs → institutional pages → achievement pages → detail pages and stubs.

---

## B. Complete route inventory

Counts: **54 `page.tsx` files**, 6 `layout.tsx` files (including the root), 1 API route, `robots.ts`, `sitemap.ts`, `not-found.tsx`, and **10 listing pages plus their item pages generated by the catch-all route** `app/[...path]/page.tsx` from `lib/content-sections.ts`. Short links `/q/n1-t{T}-w{W}` and `/q` are redirects defined in `next.config.ts` (`lib/tmc/short-links.ts`).

Family codes are explained in section E: **F1** editorial and immersive, **F2** education and learning portals, **F3** application workspaces, **F4** searchable resource libraries, **F5** achievement dashboards, **F6** e-commerce catalogues, **F7** institutional and service pages, **F8** simple content and detail pages, **F9** section hubs (added).

Template names: **HubHero** = `HubParts.tsx`; **SectionPage** = `hub/SectionPage.tsx` driven by `pageData.ts`; **ContentHero** = `content/ContentHero.tsx`; **Listing** = `GenericListingRenderer`; **Detail** = `GenericDetailRenderer` or a typed renderer.

### B1. Site-wide and information pages

| Route | File | Current template | Family |
|---|---|---|---|
| `/` | `app/page.tsx` | Hero carousel + 8 home sections (see C) | F1 |
| `/about` | `app/about/page.tsx` | Own hero (page.module.css), offerings, approach | F1 |
| `/about/mission` | `app/about/mission/page.tsx` | Same own hero (tight variant) with a side card | F1 |
| `/about/support` | `app/about/support/page.tsx` | Same own hero pattern | F8 |
| `/contact` | `app/contact/page.tsx` | Own hero (contact/page.module.css) + `ContactForm` | F7 |
| `not-found` | `app/not-found.tsx` | System page | F8 |

### B2. Education

| Route | File | Current template | Family |
|---|---|---|---|
| `/education` | `app/education/page.tsx` | HubHero + HubShowcase + HubHighlights + HubClosing | F9 |
| `/education/stem-steam` | catch-all | Listing (ContentHero + rows) | F4 |
| `/education/think-move-code` | catch-all | Listing | F4 (duplicates `/think-move-code`) |
| `/education/books` | catch-all | Listing | F4 (duplicates `/shop/books`) |
| `/education/coding-robotics` | catch-all | Listing | F4 (duplicates `/coding-robotics`) |
| `/education/teacher-parent-resources` | catch-all | Listing | F4 |
| `/education/books/[slug]` | `app/education/books/[slug]/page.tsx` | Redirect to `/shop/books/[slug]` | system |
| `/education/<section>/<slug>` | catch-all | Detail (lessons, activities) | F8 |

### B3. Explore and experiences

| Route | File | Current template | Family |
|---|---|---|---|
| `/explore` | `app/explore/page.tsx` | `ExploreRhinox` (the homepage Explore engine) with a screen-reader-only h1 | F9 |
| `/explore/experiences` | `app/explore/experiences/page.tsx` | Compact heading + Virtual Labs banner + `ExperienceExplorer` | F4 |
| `/explore/virtual-lab` | `app/explore/virtual-lab/page.tsx` | Heading + `ExperienceExplorer` | F4 |
| `/explore/virtual-lab/[slug]` | `app/explore/virtual-lab/[slug]/page.tsx` | "Being prepared" stub that only echoes the slug | F8 (stub) |
| `/explore/stem-games` | `app/explore/stem-games/page.tsx` | Own design (cover + rails, games.module.css) | F4 |
| `/explore/lab-designer` | `app/explore/lab-designer/page.tsx` | "Coming soon" stub | F8 (stub) |
| `/explore/project-lab` | catch-all | Listing (1 item) | F4 |
| `/explore/experiments` | catch-all | Listing | F4 |
| `/explore/stem-challenges` | catch-all | Listing (1 item) | F4 |
| `/explore/stem-quizzes` | catch-all | Listing ("being prepared") | F4 |
| `/experiences` | `app/experiences/page.tsx` | Redirect to `/explore/experiences` | system |
| `/experiences/[slug]` | `app/experiences/[slug]/page.tsx` | Experience player workspace (own page.module.css) | F3 |

### B4. Coding and robotics

| Route | File | Current template | Family |
|---|---|---|---|
| `/coding-robotics` | `app/coding-robotics/page.tsx` | SectionPage (`rhinocode-home`) | F9 |
| `/coding-robotics/code-studio` | `code-studio/page.tsx` + StudioShell layout | Workspace (Python) | F3 |
| `/coding-robotics/code-studio/arduino` | `arduino/page.tsx` | Workspace (Arduino) | F3 |
| `/coding-robotics/code-studio/web` | `web/page.tsx` | Workspace (Web) | F3 |
| `/coding-robotics/code-studio/workspace` | `workspace/page.tsx` | Workspace (robot) | F3 |
| `/coding-robotics/code-studio/guided/[activityId]/[taskId]` | `guided/.../page.tsx` | Guided robot workspace | F3 |
| `/coding-robotics/robot-lab` | `robot-lab/page.tsx` + StudioShell | Runtime workspace | F3 |
| `/coding-robotics/game-creator` | `game-creator/page.tsx` + StudioShell | Workspace | F3 |
| `/coding-robotics/my-projects` | `my-projects/page.tsx` + StudioShell | Saved-work dashboard | F5 |
| `/coding-robotics/studio` | `studio/page.tsx` + StudioShell | Studio overview (search, sort, open) | F3 |
| `/coding-robotics/challenges` | catch-all | Listing (3 items) | F4 |
| `/coding-robotics/code-studio/learn` | `next.config.ts` | Redirect to `/think-move-code` | system |

### B5. Think • Move • Code!

| Route | File | Current template | Family |
|---|---|---|---|
| `/think-move-code` | `think-move-code/page.tsx` → `TmcHome` | Compact programme home: term/week accordions, videos, downloads | F2 |
| `/think-move-code/nursery-1` | page.tsx | Redirect to `/think-move-code` | system |
| `/think-move-code/nursery-1/[term]` | page.tsx | Redirect to `/think-move-code#term-N` | system |
| `/think-move-code/nursery-1/[term]/[week]` | page.tsx (284 lines) | Week page (own design) | F2 |
| `/think-move-code/nursery-1/[term]/[week]/lesson` | page.tsx | Interactive lesson (`LearningHome` focus mode) | F3 |
| `/think-move-code/nursery-1/[term]/[week]/play/[game]` | page.tsx | Screen game | F3 |
| `/q/n1-t{T}-w{W}`, `/q` | `next.config.ts` | Printed QR short links (must not change) | system |

### B6. Shop

| Route | File | Current template | Family |
|---|---|---|---|
| `/shop` | `shop/page.tsx` | `ShopCatalogue` (all) | F6 |
| `/shop/books` | page.tsx | ShopCatalogue | F6 |
| `/shop/kits` | page.tsx | ShopCatalogue | F6 |
| `/shop/digital-resources` | page.tsx | ShopCatalogue | F6 |
| `/shop/laboratory-equipment` | page.tsx | ShopCatalogue | F6 |
| `/shop/laboratory-chemicals` | page.tsx | ShopCatalogue | F6 |
| `/shop/<category>/<slug>` | catch-all | `ProductDetailRenderer` | F6 |
| `/api/shop/products` | `api/shop/products/route.ts` | JSON API | system |

### B7. Schools and institutions

| Route | File | Current template | Family |
|---|---|---|---|
| `/schools` | `schools/page.tsx` | HubHero + HubShowcase + HubSteps + HubClosing | F9 |
| `/schools/stem-school-solutions` | page.tsx | SectionPage | F7 |
| `/schools/laboratory-solutions` | page.tsx | SectionPage | F7 |
| `/schools/coding-robotics` | page.tsx | SectionPage | F7 |
| `/schools/teacher-training` | page.tsx | SectionPage | F7 |
| `/schools/teacher-training/[slug]` | page.tsx | Stub that echoes the slug | F8 (stub) |
| `/schools/stem-clubs` | page.tsx | HubHero + HubSteps + `StemClubsForm` | F7 |
| `/schools/request-a-quote` | page.tsx | HubHero + `QuoteForm` | F7 |

### B8. Resources

| Route | File | Current template | Family |
|---|---|---|---|
| `/resources` | `resources/page.tsx` | HubHero + HubShowcase + HubFeature + HubClosing | F9 |
| `/resources/articles` | page.tsx | SectionPage | F4 |
| `/resources/videos` | page.tsx | SectionPage | F4 |
| `/resources/free-downloads` | page.tsx | SectionPage | F4 |
| `/resources/badges` | page.tsx | SectionPage | F5 |
| `/resources/certificates` | page.tsx | SectionPage | F5 |
| `/resources/my-rhinox-library` | page.tsx | SectionPage | F5 |
| `/resources/my-rhinox-library/[slug]` | page.tsx | Stub that echoes the slug | F8 (stub) |
| `/resources/<section>/<slug>` | catch-all | Detail (article, video, download) | F8 |

**Accounting check.** Every `page.tsx` under `app/` appears above: the root, About (3), Contact, Education (2 files), Explore (6 files), `/experiences` (2), Coding & Robotics (10), Think • Move • Code! (6), Shop (6), Schools (8), Resources (8) and the catch-all. Redirect-only routes are included so that nothing is missing.

---

## C. Page-by-page assessment

### C1. The homepage (`/`)

| | |
|---|---|
| **Purpose** | Introduce Rhinox and route visitors to Education, Play, Code, Shop and Schools. |
| **Audience** | Parents, teachers, schools and learners, mixed. |
| **Composition** | Hero carousel (defined inside `app/page.tsx`; `app/components/Hero.tsx` is an unused older copy), then eight sections in this order: `RhinoxJourney`, `PlayRhinox`, `PlayLabs`, `RhinoCodeBand`, `ExploreRhinox`, `ShopRhinox`, `SchoolsRhinox`, `MoreRhinox`. |
| **Strengths** | The sections already differ from each other (the Play stage, the Hands-on previews, the Explore engine, the Schools story rotator). This is the part of the site with the most variety. |
| **Concerns** | Long (9 stacked sections). Play and Hands-on overlap in purpose. `ExploreRhinox` is coupled to the navigation data (section H). Section order does not yet reflect a priority for the visitor type. |
| **Desktop / mobile** | Per-section CSS modules; the Play change in this session was verified at 1440, 1366, 768 and 390 pixels. Other sections were not re-tested here. |

### C2. Hub pages (`/education`, `/explore`, `/coding-robotics`, `/schools`, `/resources`)

All five open with the same split hero. Four of them (Education, Schools, Resources and, through `SectionPage`, RhinoCode home) use `HubHero`; Explore is the exception, because it has no hero and opens directly on the Explore engine.

| Page | Purpose | Observed sequence | Concern |
|---|---|---|---|
| Education | Choose where to start | HubHero → HubShowcase (5 cards) → HubHighlights → HubClosing | Three of the five cards lead to pages that duplicate other pages (previous audit) |
| Resources | Find a resource type | HubHero → HubShowcase (4) → HubFeature → HubClosing | "My Rhinox Library" is shown with a "Coming soon" tag |
| Schools | Buy services | HubHero → HubShowcase → HubSteps → HubClosing | Appropriate shape, but identical hero to the two above |
| Explore | Browse everything | `ExploreRhinox` only | No page identity; the h1 is hidden from sight |
| RhinoCode | Enter the coding area | HubHero → intro → catalogue → closing (SectionPage) | Same hero as every Schools and Resources page |

### C3. Listing pages (catch-all listings, `/explore/experiences`, `/explore/virtual-lab`, `/explore/stem-games`, `/resources/articles`, `/resources/videos`, `/resources/free-downloads`)

`GenericListingRenderer` renders **10 catch-all listings** with `ContentHero` and a row list. The hero text comes from `lib/listing-presentation.ts` (17 entries, a `lineTwo`, chips and one of the nine photographs). The page body is `ContentList`, a single filterable list of rows.

| Observation | Evidence |
|---|---|
| Most listings are nearly empty | `content/` holds one file for each of: article, assessment, book, challenge, download, game, lesson, parent resource, project, quiz, teacher resource, video, worksheet. There are 11 activities, 4 experiments, 39 experiences and 8 products. The site shows only live items, so visible counts may be lower. |
| Large hero, little content | Crawled text length for these pages was roughly 290–310 characters (Books, Teacher & Parent Resources, Project Lab, STEM Quizzes, STEM Challenges). |
| Visually interchangeable | Education > Books, Teacher & Parent Resources, Project Lab, STEM Quizzes and STEM Challenges differ only in the words and the photograph. |

Exceptions with their own identity: `/explore/stem-games` (own cover and rails), `/explore/experiences` and `/explore/virtual-lab` (compact heading and an interactive explorer).

### C4. Resources and Schools detail pages from `SectionPage` (Schools and Resources)

`SectionPage` is a fixed five-part sequence: **HubHero → "intro" split with an icon list → catalogue (rows) or empty note → steps (optional) → HubClosing** (a second photograph and two buttons). All eleven pages follow it, and all copy lives in `pageData.ts`. Because the sequence is fixed, a page about badges, one about laboratory solutions and one about videos have the same shape. Each also carries two photographs (hero and closing) taken from the same nine files.

Five more configurations for the shop (`shop-books`, `shop-kits`, `shop-digital-resources`, `shop-laboratory-equipment`, `shop-laboratory-chemicals`) exist in `pageData.ts` but are not referenced by any page, because the shop pages use `ShopCatalogue`. They appear to be dead configuration.

### C5. Information pages (`/about`, `/about/mission`, `/about/support`, `/contact`)

About, Mission, Support and Contact use two further copies of the same hero (`about/page.module.css` and `contact/page.module.css`). Mission adds a side card. Contact adds a form. They share the hero look and differ in the lower sections.

### C6. Application pages (Code Studio, RhinoBot, Game Creator, the experience player, Think • Move • Code!)

These are the pages with the most distinct identity: the StudioShell rail with a workspace, the experience player, the Think • Move • Code! home and the week page. They are not the source of the repetition problem. The main design concerns are consistency of the shell with the Apple-inspired direction and the handoff between the website and the workspaces (breadcrumbs and "back" targets), not hero repetition.

### C7. Shop (`/shop`)

`ShopCatalogue` is already a compact catalogue: headline, search, category tabs with live counts, filters and a product grid, with a generated book cover when a product has no image. It has a distinct identity and is the model for how a family can be consistent without a hero. Product detail pages use `ProductDetailRenderer`. Per the content registry there are 8 product files.

### C8. Stub pages

Four pages are placeholders. Three of them echo the URL slug as the heading (`virtual-lab/[slug]`, `teacher-training/[slug]`, `my-rhinox-library/[slug]`) and carry a one-sentence note; the Lab Designer page says "Coming soon". They use the older `rx-section` markup and none of the newer templates, so they also look different from everything else, but in the wrong way (unfinished).

---

## D. Visual repetition analysis

### D1. The shared pattern

| Element | Where it repeats | Observed in code |
|---|---|---|
| Pale-blue background with faint 48-pixel grid | HubHero, ContentHero, About, Mission, Support, Contact | `heroBackdrop` / `heroGrid` rules exist in `hub.module.css`, `content.module.css`, `about/page.module.css`, `contact/page.module.css` |
| Eyebrow, then two-line headline with the second line in blue | Every hub, listing, SectionPage and information page | `lineOne` and `lineTwo` in `HubHero`, `ContentHero` and the page configs |
| Rounded photo on the right with white chips | HubHero, ContentHero | `heroPhoto` / `photo` plus `chips` |
| "Intro" split with an icon list | All 11 SectionPage pages | Fixed in `SectionPage.tsx` |
| Closing band with a second photo and two buttons | Hubs and SectionPage pages | `HubClosing` |

### D2. Page groups that are interchangeable

| Group | Pages | What differs between them |
|---|---|---|
| **G1. SectionPage siblings** | Schools: STEM School Solutions, Laboratory Solutions, Coding & Robotics, Teacher Training. Resources: Articles, Videos, Free Downloads, Badges, Certificates, My Rhinox Library | The words, one of nine photos, and (for some) an empty-state note |
| **G2. Catch-all listings** | Education: STEM & STEAM, Think • Move • Code, Books, Coding & Robotics, Teacher & Parent Resources. Explore: Project Lab, STEM Challenges, STEM Quizzes, Experiments. Coding: Game Challenges | The words, a tagline and a photo; most hold 0–3 items |
| **G3. Hub pages** | Education, Resources, Schools, RhinoCode | Card count and closing wording |
| **G4. Information pages** | About, Mission, Support, Contact | Lower sections; the hero shape is the same |
| **G5. Stub pages** | Lab Designer and three slug stubs | Wording only; each looks different from the rest of the site |

Group G1 and G2 together account for about 20 pages that a visitor cannot tell apart at a glance.

### D3. Image reuse

References to the nine stock photographs across `app/` and `lib/`:

| File | References |
|---|---|
| `hero/classroom.jpg` | 28 |
| `hero/stem-lab.jpg` | 17 |
| `hero/coding.jpg` | 14 |
| `journey/journey-science.jpg` | 11 |
| `journey/journey-robotics.jpg` | 11 |
| `journey/journey-pexels.jpg` | 9 |
| `journey/journey-unsplash.jpg` | 8 |
| `hero/microscope.jpg` | 7 |
| `journey/journey-pixabay.jpg` | 4 |

The file names suggest third-party stock sources. This audit did not verify licences or usage terms; see section K.

### D4. What already works

| Page | Why it has identity |
|---|---|
| Shop | Compact catalogue structure that matches the job (search, tabs with counts, filters, product grid) and generated covers when there is no image |
| STEM Games | Own cover and shelves, designed around playing |
| Think • Move • Code! home | Programme structure (terms, weeks, deliverables) is the layout |
| Code Studio and workspaces | A tool layout that is the product itself |

The recommendation is to extend this idea to the other pages: **let the content or the task define the layout, not a template.**

---

## E. Proposed design system and page families

### E1. Shared visual language (retained)

The Apple-inspired direction, as described in pull request #24 and the agreed compact approach, is kept unchanged as the baseline.

- **Surfaces:** white and pale blue, quiet and flat, with precise 1-pixel borders.
- **Colour:** restrained blue accents; no new brand colours.
- **Density:** compact. Spacing and type sizes are tighter than today.
- **Type:** the existing display and body fonts.
- **Motion:** subtle, and off under reduced motion.

Pages are made different through **composition** (what is placed where, and at what scale), not through louder colour or decoration. A family may use a different background tint within the existing blue-and-white palette. No page needs a new colour.

### E2. Evaluation of the proposed eight families

| Family | Suitable? | Notes |
|---|---|---|
| 1. Editorial and immersive | Yes | Right for the homepage, About and Mission: pages that tell a story and can carry large imagery. |
| 2. Education and learning portals | Yes | Right for the Think • Move • Code! home, week pages and STEM & STEAM. Structure should follow curriculum (programme, term, week), not cards. |
| 3. Application workspaces | Yes | Already distinct (StudioShell, players). Keep the shell, avoid changing behaviour. |
| 4. Searchable resource libraries | Yes | Replaces about 20 hero-led list pages. The main source of the problem today. |
| 5. Achievement dashboards | Yes, with a caution | Right for My Projects, Badges, Certificates and My Rhinox Library. Content does not exist yet for badges or certificates (no content file of those types), so this family should not be built before there is something to show. |
| 6. E-commerce catalogues | Yes | Already in place (`ShopCatalogue`). Extend the same consistency to product detail pages. |
| 7. Institutional and service pages | Yes | Right for Schools pages, STEM Clubs, Request a Quote and Contact. These are sales pages and need proof and a clear next step. |
| 8. Simple content and detail pages | Yes | Right for articles, videos, downloads, lessons, support and stubs. Should be quiet and readable. |

### E3. One family added

| Family | Why it is justified |
|---|---|
| **9. Section hubs** | Education, Explore, Coding & Robotics, Schools, Resources and the Shop landing exist to help a visitor choose where to go. Today they use the same hero as everything else, so the signposting is lost. A hub is neither an editorial page nor a library. It has its own job. |

No further family is needed. Forms (Contact, Request a Quote, STEM Clubs) sit within family 7 because their purpose is institutional enquiry.

### E4. Family definitions

| Family | Composition rule | Hero | Background |
|---|---|---|---|
| F1 Editorial | Story-led: large type or imagery, generous space | Full hero, composition unique per page | Pale blue or white; one large visual |
| F2 Learning portal | Structure of the programme is the layout (accordions, week rail) | Compact title bar with the programme facts | White with a pale-blue band |
| F3 Workspace | Tool fills the screen; the shell is shared | None (the tool is the page) | Application grey-blue |
| F4 Library | Search and filters first; results immediately visible | **Compact header only**: title, one line, count, filters | White; no photograph |
| F5 Dashboard | Personal summary on top, items below | Summary row | White |
| F6 Catalogue | Search, tabs with counts, grid | None (existing) | White |
| F7 Institutional | Outcome, proof, process, enquiry | Short hero with a clear action | Pale blue; one real visual |
| F8 Simple | Readable column and a short "at a glance" list | Title block, no photograph | White |
| F9 Hub | Choose-your-path: large tiles or a map of the section | Short hero with distinct composition per hub | Pale blue |

---

## F. Recommended component architecture

### F1. Principles

1. **Fewer primitives, more composition.** The aim is for the number of components to go down. At most three new primitives are proposed; everything else reuses existing parts.
2. **One hero implementation.** The four duplicate hero implementations become one shared primitive with variants.
3. **No component should force a sequence.** `SectionPage` today fixes the order of its sections; the replacement should accept sections as a list.
4. **Working code is kept.** Workspaces, the experience player, the shop and the Think • Move • Code! pages are not replaced.

### F2. Component by component

| Component | Verdict | Reason and action |
|---|---|---|
| `HubHero` | **Restrict and refactor** | Keep for the section hubs and a few institutional pages. Stop using it for list or library pages. Allow variants (split, centred, full-bleed) so hubs differ. Merge its backdrop and grid with the other three hero copies. |
| `HubParts` (`HubSectionHead`, `HubSteps`, `HubClosing`, `HubFeature`, `HubHighlights`) | **Keep** | Useful building blocks. Make `HubClosing` optional or lighter, and allow it to omit the second photograph. |
| `HubShowcase` | **Keep, restrict to hubs** | Used on Education, Resources and Schools. Add a variant that does not use a photograph. |
| `SectionPage` | **Refactor** | Replace the fixed five-part sequence with a list of sections, so that Schools pages and Resources pages can have different shapes. The 11 pages it renders move to the F4, F5 and F7 patterns. |
| `pageData.ts` | **Refactor** | Keep as the single source of copy. Remove the five unused `shop-*` entries (dead configuration; confirm before deletion). Add a `family` field. |
| `GenericListingRenderer` | **Refactor** | Replace `ContentHero` with the compact library header. Keep `ContentList`, filters and the "being prepared" state. This single change affects about 10 catch-all listing pages. |
| `ContentHero` | **Replace for listings, keep for detail** | Listing pages use the compact header. Detail pages may keep a smaller hero, but without the same chips and two-tone headline. |
| `GenericDetailRenderer` and typed renderers | **Keep** | Typed renderers (product, project, experiment, quiz) already have a different structure. Reduce the hero to a title block. |
| `ShopCatalogue` | **Keep** | The best example of a distinct family. No change recommended. |
| `ExperienceExplorer`, `InteractiveMatrix` | **Keep** | Already distinct. Align their page heading with the compact library header. |
| Homepage components (`RhinoxJourney`, `PlayRhinox`, `PlayLabs`, `RhinoCodeBand`, `ExploreRhinox`, `ShopRhinox`, `SchoolsRhinox`, `MoreRhinox`) | **Keep** | They already differ from each other. Section order and length are a separate decision. `ExploreRhinox` should be decoupled from the menu before menu changes (section H). |
| Workspace components (`StudioShell`, `CodeStudio`, `RhinoBotLab`, `GameCreator`, `LearningHome`) | **Keep unchanged** | No visual change is proposed except what pull request #24 may bring to shared tokens. |
| About and Contact hero CSS | **Merge** | Move onto the shared hero primitive. |

### F3. The three new primitives

| Primitive | Purpose | Replaces |
|---|---|---|
| **`PageHeader`** (compact) | Title, one line, count and optional filters/actions in a slim row | `ContentHero` on list pages; the headings built by hand on Explore Experiences and Virtual Labs |
| **`SectionHero`** (with variants) | The one hero, with `split`, `centred`, `feature` and `plain` variants | `HubHero`, the About and Contact hero copies |
| **`DetailHeader`** | Title block for item pages, with the at-a-glance list | The `ContentHero` use inside detail renderers |

Together, `PageHeader` and `SectionHero` replace four duplicate hero implementations (net component count decreases). Nothing else is new.

---

## G. Page-specific redesign specifications

Common to all pages: Apple-inspired compact baseline (section E1); the existing header, footer and mega-menu are unchanged; every page keeps its present route, content source and function.

### G1. Homepage and editorial pages (F1)

| Page | Purpose and audience | Recommended layout and hero | Sections in order | Mobile and notes |
|---|---|---|---|---|
| **`/`** | Orient every visitor; mixed audience | Keep the hero carousel. Decide whether Play and Hands-on stay separate (management decision; the merged version was built, reverted by request, and remains in the history as commit `037aba4`) | Journey → Play → (Hands-on) → RhinoCode → Explore → Shop → Schools → More | Per-section CSS already responsive; re-test after any change |
| **`/about`** | Explain who Rhinox is; parents, partners | Editorial: one large statement and one real visual (a product or classroom photograph used once) | Statement → what we do (six offerings) → approach (Think, Move, Code, Build, Create) → call to action | Offerings as a two-column grid on mobile |
| **`/about/mission`** | Principles | Editorial, quieter than About; centred text, no side card | Mission → principles → link back to About | Single column |
| **`/about/support`** | Help; existing users | Simple page (F8): question list in accordions | Common questions → contact | Accordions replace long text |

### G2. Education and learning (F2, F9)

| Page | Purpose and audience | Recommended layout and hero | Sections in order | Notes |
|---|---|---|---|---|
| **`/education`** | Hub for parents and teachers | `SectionHero` split variant, then large tiles for the real destinations only | STEM & STEAM → Think • Move • Code! → Teacher & Parent Resources (Books and Coding & Robotics link out to Shop and RhinoCode) | Depends on the menu decision (section H) |
| **`/education/stem-steam`** | Lesson and activity library (about 28 items) | F4 library: compact header, subject and age filters, results at once | Filters → list → related links | The only listing of the five with enough content to justify filters |
| **`/education/teacher-parent-resources`** | Resources for adults | F4 library with a short "start here" block above the list | Start here → list | One item today; the "start here" block avoids an almost empty page |
| **`/education/think-move-code`, `/education/books`, `/education/coding-robotics`** | Duplicates | Redirect to `/think-move-code`, `/shop/books`, `/coding-robotics` | n/a | Recommended in the earlier menu audit; blocked by the Explore coupling |
| **`/think-move-code`** | Programme home (teachers, parents) | Keep as built | Hero band → term accordions → videos and downloads | Already compact |
| **Week page** | One week of the programme | Keep; align header to `DetailHeader` | Goal → resources → next week | Own 284-line design; do not replace |

### G3. Explore and play (F4, F9)

| Page | Purpose and audience | Recommended layout and hero | Notes |
|---|---|---|---|
| **`/explore`** | Hub / search across the site | Visible `PageHeader` (the h1 is currently hidden), then the Explore engine | Add a visible heading for sighted users |
| **`/explore/experiences`** | Library of interactive experiences (39 experience records in `content/`; the site lists the live ones) | `PageHeader` + `ExperienceExplorer` (already close) | Merge the Virtual Labs banner into the header actions |
| **`/explore/virtual-lab`** | Library of virtual labs | Same as above | Same header pattern as Experiences |
| **`/explore/stem-games`** | Games | Keep own design | Hold as the model of a distinct library |
| **`/explore/project-lab`, `/explore/stem-challenges`** | One item each | F4 compact header with a short explanation; consider combining into one "Projects and challenges" page | Matches the menu audit |
| **`/explore/stem-quizzes`, `/explore/experiments`** | Quizzes empty; experiments 4 | F4 compact header; quizzes hidden from menus until content exists | |
| **`/explore/lab-designer`** | Empty stub | Keep out of menus; if retained, use the F8 stub pattern with an honest "coming later" note | Do not invent features |
| **`/explore/virtual-lab/[slug]`** | Stub that echoes the slug | F8 detail with the lab's real title (from the content record) or a redirect | |
| **`/experiences/[slug]`** | Play an experience | Keep the workspace | Alignment to shell tokens only |

### G4. Coding and robotics (F3, F5, F9)

| Page | Recommended layout | Notes |
|---|---|---|
| **`/coding-robotics`** | Section hub with a different composition from the Schools hub: show the three studios as large entries (they are the product), then Game Challenges and My Projects | Replaces the SectionPage template |
| **Code Studio family** (`code-studio`, `arduino`, `web`, `workspace`, `guided`) | Keep unchanged | Workspaces |
| **`/coding-robotics/robot-lab`, `/game-creator`** | Keep unchanged | |
| **`/coding-robotics/studio`** | Keep (overview inside the shell) | |
| **`/coding-robotics/my-projects`** | F5 dashboard: summary, saved work as a list | Content is local to the learner |
| **`/coding-robotics/challenges`** | F4 library; 3 items | Compact header |

### G5. Shop (F6)

| Page | Recommended layout | Notes |
|---|---|---|
| `/shop` and the five category pages | Keep `ShopCatalogue` as built | It is the reference for a distinct, compact family |
| Product detail (`/shop/<category>/<slug>`) | Align `ProductDetailRenderer` with the catalogue (same header style, price and action area) | Eight product files exist |
| `/api/shop/products` | Unchanged | |

### G6. Schools and institutions (F7, F9)

| Page | Purpose and audience | Recommended layout and hero | Sections in order | Notes |
|---|---|---|---|---|
| **`/schools`** | Hub for school leaders | `SectionHero` feature variant | Outcomes → four service tiles → how it works → request a quote | Different from the other hubs |
| **`/schools/stem-school-solutions`** | Sell a whole programme | Institutional: outcome statement, then how it works | Outcome → what is included → process → enquiry | |
| **`/schools/laboratory-solutions`** | Laboratory fit-out | Institutional with real equipment imagery from the product range | Needs → what we supply → process → enquiry | Use product visuals, not a second stock photo |
| **`/schools/coding-robotics`** | Coding and robotics programmes for schools | Institutional; link to RhinoCode as the product demonstration | Programmes → what learners make → enquiry | Distinguish from `/coding-robotics` (the learner-facing area) |
| **`/schools/teacher-training`** | Teacher development | Institutional with a programme outline | Programme → format → enquiry | |
| **`/schools/stem-clubs`** | Pilot interest | Keep form, shorten hero | Hero → steps → form | Already has its own form |
| **`/schools/request-a-quote`** | Lead capture | Form-first, minimal hero | Form → what happens next | |
| **`/contact`** | Contact | Form-first with direct contact details | Details → form | Merge hero CSS onto the primitive |
| **`/schools/teacher-training/[slug]`** | Stub | F8 stub with the real title or remove | | |

### G7. Resources and achievements (F4, F5, F9)

| Page | Recommended layout | Notes |
|---|---|---|
| **`/resources`** | Section hub: four or five tiles without photographs, a search box | |
| **`/resources/articles`** | F4 library with article rows (title, summary, reading time) | One article today |
| **`/resources/videos`** | F4 library with video cards and thumbnails | One video today; shares data with the Think • Move • Code! video panel |
| **`/resources/free-downloads`** | F4 library with download rows (file type, size, button) | |
| **`/resources/badges`, `/resources/certificates`, `/resources/my-rhinox-library`** | One F5 page with tabs, or three pages sharing one component | No badge or certificate content exists in `content/`; do not build the dashboard until there is something to show |
| **`/resources/my-rhinox-library/[slug]`** | F8 stub | |

### G8. System and simple pages (F8)

| Page | Notes |
|---|---|
| `not-found` | Align with the compact baseline and offer the main sections |
| Generic item detail (`/<section>/<slug>`) | `DetailHeader` + reading column + at-a-glance list |
| Redirect-only routes | No design change; keep the Think • Move • Code! short links exactly as printed |

---

## H. Content and navigation problems

1. **Duplicate destinations.** `/education/think-move-code`, `/education/books`, `/education/coding-robotics` repeat `/think-move-code`, `/shop/books` and `/coding-robotics`. Schools > Books & Publishing points at the same Books page. Game Challenges, STEM Games and Experiences overlap. The earlier proposal to remove them from the menu was tried and **reverted by request** because the homepage Explore "By site menu" view is built from the same navigation list and counts items per menu page (removing an entry removes that page's items from that view). Any future menu change needs a "hidden in header, still in Explore" flag first.
2. **Empty or near-empty pages in the menu.** STEM Quizzes, STEM Lab Designer, Project Lab, STEM Challenges, Books and Teacher & Parent Resources hold zero or one item. A menu that points at them looks unfinished.
3. **Dead configuration.** The five `shop-*` entries in `pageData.ts` are not used by any page.
4. **Stub pages echo the URL slug** as a heading (`virtual-lab/[slug]`, `teacher-training/[slug]`, `my-rhinox-library/[slug]`).
5. **Overlapping Resources and Think • Move • Code! content.** Videos and Free Downloads should be the index of everything, with Think • Move • Code! files included, rather than a competing list.
6. **Public programme files.** Files under `public/tmc` (including answer-bearing question banks and teacher packs) are publicly reachable, which conflicts with the intended access model for the teacher guide and the partly locked online book. Gating them requires a new access mechanism (a new service, which needs your approval).
7. **Production versus draft design.** Pull requests #23 and #24 are unmerged CSS drafts. The Apple-inspired direction is approved in principle but not live.

---

## I. Accessibility and responsive design concerns

These come from code inspection and the earlier crawl, not from a fresh assistive-technology test.

| Concern | Evidence | Recommendation |
|---|---|---|
| **No skip-to-content link** | Searching `app/` for "skip to", "skip-link" and "skipLink" finds nothing | Add a skip link in the root layout; low risk |
| **Two-line headlines have no space between lines** | The crawl returned headings such as "Learning thatstarts with doing." (two `<span>` lines inside one `<h1>`) | Put a space between lines or use a line break so assistive technology and text extraction read the heading correctly. Verify with a screen reader. |
| **Hidden heading on Explore** | `/explore` uses a screen-reader-only `h1` and no visible page title | Add a visible heading (see G3) |
| **Image alt text not reviewed individually** | Hero alt text is set per page configuration; 18 images use `alt=""` across the app (some are likely decorative) | Review each; keep empty alt only for decorative images |
| **Focus visibility** | `:focus-visible` appears in 54 of 68 stylesheets | Check the 14 stylesheets without it, especially for filters, accordions and tabs |
| **Reduced motion** | `prefers-reduced-motion` handled in 42 stylesheets; many modules have no motion at all | Check carousels and auto-advancing sections (Play stage, Schools rotator, hero carousel) pause under reduced motion |
| **Colour alone** | Chips and tags use colour plus text; not exhaustively verified | Confirm status and difficulty indicators always carry text |
| **Responsive** | `hub.module.css` has breakpoints at 1024, 900 and 640 pixels; the Play section and Think • Move • Code! home were tested at 1440, 1366, 768 and 390 pixels in this project | Run a one-time visual pass of every route at 1440, 1024, 768 and 390 pixels before implementation; this was not done here |
| **Large text on small screens** | Hero headings are large by design | The compact direction reduces this; confirm line lengths on 390 pixels |

---

## J. Prioritised implementation roadmap

No step below should begin until Rhinox management approves this document.

| Phase | Work | Why first | Effort | Risk |
|---|---|---|---|---|
| **0. Decisions** | Approve this document. Decide pull request #24 (Apple) versus #23 (Linear). Decide the homepage Play structure. Supply YouTube links if they should appear. | The roadmap depends on them | None | None |
| **1. Foundation** | Add a skip link. Fix two-line headings. Consolidate the four hero implementations into `SectionHero`. Add `PageHeader`. | Removes duplication and fixes accessibility without changing page content | Small–medium | Low |
| **2. Library pages** | Move `GenericListingRenderer` and the Resources list pages to the compact `PageHeader`. | Fixes about 20 interchangeable pages at once | Medium | Low–medium |
| **3. Menu and Explore decoupling** | Add "hidden in header, still in Explore" to menu entries, then remove duplicate destinations | Required before any further menu cleanup | Small | Medium (homepage Explore) |
| **4. Section hubs** | Redesign Education, Explore, RhinoCode, Resources and Schools hubs with different compositions | Gives each section an identity | Medium | Medium |
| **5. Institutional pages** | Rework the four Schools pages, STEM Clubs, Request a Quote and Contact; use product and programme visuals | Sales pages need proof, not stock images | Medium | Low |
| **6. Detail and stub pages** | `DetailHeader`; real stub content or redirects | Quiet readability | Small–medium | Low |
| **7. Achievement pages** | Build the F5 dashboard only when badges and certificates have content | Avoid empty dashboards | Later | Low |
| **8. Imagery** | Replace stock photographs with content-led visuals | Largest visual impact; depends on assets | Ongoing | Low |

---

## K. Risks and dependencies

| Risk or dependency | Detail | Mitigation |
|---|---|---|
| **Homepage Explore depends on the navigation list** | Removing a menu entry removes its items from "By site menu" | Phase 3 flag before any menu change |
| **Unmerged design pull requests** | #23 and #24 change only CSS for the shell and homepage and are marked as lacking build and visual QA | Treat as a baseline only after QA; do not assume it is live |
| **Printed QR short links** | `/q/n1-t{T}-w{W}` are on printed material | Never change or break them; keep redirects |
| **Content is thin** | Most sections hold 0–3 items; layouts built for volume will look empty | Design for few items first (compact header) |
| **Stock imagery licensing** | File names suggest several stock sources; licences were not checked | Confirm usage rights, or replace with owned material |
| **Test suites reference class names and structure** | Browser tests exist for the studio, Think • Move • Code! and the homepage | Update tests with each phase; run the full set before merging |
| **Shared CSS** | `globals.css` is about 6,600 lines; `redesign.css` and `home-polish.css` add layers | Change tokens deliberately and test the shell first |
| **Public programme files** | Gating needs a new access service | Requires management approval before any work |
| **Scope creep into workspaces** | Workspaces are the product's core and are stable | Keep them out of the redesign except for shared tokens |

### Acceptance checklist (from the brief)

- [x] Every existing route accounted for (section B).
- [x] Similar-looking pages identified (section D2).
- [x] Each page has a justified design direction (sections E and G).
- [x] Designs reflect actual content and functionality (counts and structures cited from the repository).
- [x] Existing working features preserved (workspaces, shop, programme pages, redirects and QR links untouched).
- [x] Apple-inspired direction retained (section E1).
- [x] Net duplication in the codebase decreases (section F: one hero primitive replaces four copies; at most three new components).

*End of document. Implementation should not begin until management has reviewed and approved it.*
