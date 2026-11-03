# Rhinox Scientifica: Component Architecture Recommendations

| | |
|---|---|
| **Status** | Design planning only. Revision 2, after management review. No component has been changed. |
| **Date** | 3 November 2026 |
| **Builds on** | `full-site-design-audit.md` (section F) and `phase-0-design-system.md` |
| **Principle** | **Adopt before you build.** Reuse what exists, restyle it to the tokens, and add as few new parts as possible. |

### Revision history

| Revision | Date | Change |
|---|---|---|
| 1 | 3 November 2026 | First issue. |
| 2 | 3 November 2026 | Targeted revision. (6) One authoritative inventory (section 1.1) now classifies every component as **new**, **wrapper**, **refactored**, **restricted**, **revived**, **retained**, **retired** or **page-local**, with definitions and counts that add up; the counts in revision 1 mixed components, a data file, a variant and a style rule and are corrected. (7) Section 1.2 separates page family, page purpose, reusable component and page-local composition. (4) Protected areas (Rhinox Code Studio, Think • Move • Code!) are listed with the rules for shared-style changes. (3) Official product names. (9) Navigation data files are named as protected dependencies. |

---

## 1. Summary

The site already has a good set of building blocks, but the **repetition comes from three templates that force a fixed sequence**, and the codebase also contains **20 shared components that nothing imports** (about 1,450 lines). Several of these unused parts are exactly what the redesign needs (an accordion, breadcrumbs, filter and search bars, tabs).

Recommendation in one line: **add three components and one icon map, keep two thin wrappers during migration, refactor three components and one data file, restrict one component, one variant and one style rule, restyle and revive six unused ones, decide one near-duplicate, and retire 15 after confirmation.** The component count goes down overall.

### 1.1 Authoritative inventory and counts

This table replaces the earlier summary. Every item appears once. The definitions are the ones used in all four documents.

| Status | Definition | Items | Count |
|---|---|---|---|
| **New component** | Does not exist today and is created | `PageHeader`, `SectionHero` (four variants), `DetailHeader` | 3 |
| **New shared file (not a component)** | A map, not a visual component | `icons.ts` (named SVG paths) | 1 |
| **Wrapper** | A thin component that keeps an old name and props and passes through to a new component. It lets callers migrate one page at a time, and is retired when no caller remains. | `Icon` (new, wraps `icons.ts`); `HubHero` (wraps `SectionHero` `split`); `ContentHero` (wraps `PageHeader` on listings and `DetailHeader` on details) | 3 (1 new wrapper, 2 transitional) |
| **Refactored (kept, changed)** | Exists, stays, is changed in structure | `SectionPage`, `GenericListingRenderer`, `HubClosing` (components); `pageData.ts` (a data file, counted separately) | 3 components + 1 data file |
| **Restricted** | Stays, but allowed on fewer pages | `HubShowcase` (component); `SectionHero` `split` variant (a variant of the new component); two-tone headline (a style rule, not a component) | 1 component + 1 variant + 1 style rule |
| **Revived (unused today, restyled and used)** | Exists with no importer; adopted in place of writing something new | `Accordion`, `Breadcrumbs`, `FilterBar`, `SearchBar`, `Tabs`, `Pagination` (`Pagination` only when a library needs it) | 6 |
| **Decide** | Two near-duplicates; keep one | `SectionHeading` (unused) versus `HubSectionHead` (used) | 1 pair |
| **Retired (after confirmation)** | Unused, superseded | `Hero`, `CTASection`, `EditorialBlock`, `FeaturePanel`, `FullWidthFeature`, `SplitSection`, `ContentCatalogue`, `FeaturedContent`, `ContentMeta`, `ExperienceRow`, `CompactCard`, `Card`, `Slider` (13 unused) plus `ContentGrid` and `ContentCard` (used only by the unused ones) | 15 |
| **Retained** | No change beyond token updates | Everything else: global parts, shop, renderers, forms, `RelatedContent`, `ContentNotFoundCard`, `ContentList`, homepage sections, and the protected areas below | not counted individually |
| **Page-local composition** | Built from the above for one page; not added to the shared inventory | See 1.3 | 7 listed |

How the 20 unused components reconcile: 6 revived + 1 in the decide pair (`SectionHeading`) + 13 retired = 20. The 15 retired includes `ContentGrid` and `ContentCard`, which are used only by retired components and so are not in the 20.

Why revision 1's numbers differed: it counted `pageData.ts` (a data file), `HubHero` and `ContentHero` (now wrappers) among six "refactors", and counted a variant and a style rule among three "restrictions". Those are now stated for what they are.

### 1.2 Page family, page purpose, component and page-local composition

These four terms are not interchangeable (full definitions in `phase-0-design-system.md` section 5.0).

| Term | Level | Example |
|---|---|---|
| **Page family** (F1–F9) | A composition rule for a group of pages | F9 Section hubs: a short header, then a way of choosing |
| **Page purpose** | What one page is for | Education: "choose where to start"; Coding & Robotics: "start coding in one click" |
| **Reusable component** | A built piece used in two or more places | `PageHeader`, `SectionHero`, `Accordion` |
| **Page-local composition** | An arrangement for one page, assembled from components | The Education numbered index; the Coding studio launcher |

A family selects *which* header and which supporting parts are allowed; the purpose selects *what content* goes in; a component is *how* it is built. Components are never named after a purpose ("EducationIndex"): that would be a page-local composition.

### 1.3 Page-local compositions (not shared components)

| Page | Composition | Built from |
|---|---|---|
| Homepage | The compact Journey line in band 1 | Existing `RhinoxJourney` data and links, `Icon` |
| Explore | The workbench shell (rail plus results) | Existing `ExploreRhinox` engine, `PageHeader`, `SearchBar`, `FilterBar` |
| Education | The numbered index row | `PageHeader`, `Accordion`, `Icon` |
| Resources | The typed three-column grid | `PageHeader` with search, `ContentList` rows, `Icon` |
| Schools | The sticky index and the offer row; the persistent enquiry button | `SectionHero` `plain`, `HubSteps`, `Accordion` |
| Coding & Robotics | The studio window | `SectionHero` `feature`, existing image handling |
| Hub choosing devices in general | A tile selector, a topic map or an engine, per hub | Existing parts |

Counts of "unused" come from a search of `app/`, `lib/` and `scripts/` for imports of each file name. A component may still be referenced by a plan outside the repository, so nothing is deleted without confirmation.

---

## 2. Evidence

| Finding | Detail |
|---|---|
| Fixed-sequence templates | `SectionPage` renders 11 pages with the same five parts in the same order. `GenericListingRenderer` renders about 10 catch-all listings with one hero and one list. |
| Four copies of the hero | Backdrop, grid and two-column hero are written in `hub.module.css`, `content.module.css`, `about/page.module.css` and `contact/page.module.css`. |
| Unused components | `Accordion`, `Breadcrumbs`, `CTASection`, `Card`, `CompactCard`, `ContentCatalogue`, `ContentMeta`, `EditorialBlock`, `ExperienceRow`, `FeaturePanel`, `FeaturedContent`, `FilterBar`, `FullWidthFeature`, `Hero`, `Pagination`, `SearchBar`, `SectionHeading`, `Slider`, `SplitSection`, `Tabs`: **no importers.** `ContentGrid` and `ContentCard` are used only by the unused `ContentCatalogue` and `FeaturedContent`. |
| Homepage hero | The hero carousel is defined inside `app/page.tsx`; `app/components/Hero.tsx` is an older unused copy. |
| Dead configuration | Five `shop-*` entries in `pageData.ts` are not referenced by any page. |
| Duplicated icon paths | The same SVG path strings appear in at least seven files. |
| Old markup | Fourteen files still use the older `rx-content-card` and `rx-content-meta-type` classes (mostly stub pages). |
| Button | `Button.tsx` is imported in four files, while most pages use the `rx-button` classes directly. |

---

## 3. Review of existing components

### 3.1 Retain (no change recommended)

| Component or group | Family | Why |
|---|---|---|
| `Header`, `Footer`, `BackToTop` | Global | Working; they take token updates only. A change to them is also tested inside the protected areas, because they wrap them. |
| `ShopCatalogue` and the shop pages | F6 | Already distinct and compact; the model for a family with its own identity. |
| `ProductDetailRenderer`, `ProjectDetailRenderer`, `ExperimentDetailRenderer`, `QuizDetailRenderer` | F8 | Typed renderers that already differ by content. Only their header changes (see `DetailHeader`). |
| `ExperienceExplorer`, `InteractiveMatrix` | F4 | Already distinct libraries. |
| `ContentList`, `rows.ts` | F4 | The row list is the right pattern for text-led results. |
| `RelatedContent` | F8 | Used in four places; useful. |
| `ContentNotFoundCard` | F8 | Used by the catch-all route. |
| Homepage sections: `RhinoxJourney`, `PlayRhinox`, `PlayLabs`, `RhinoCodeBand`, `ExploreRhinox`, `ShopRhinox`, `SchoolsRhinox`, `MoreRhinox` | F1 | They already differ from each other. Their content and order are page decisions (`phase-1-core-pages.md` 1.2 and 1.2a). `ExploreRhinox` and the navigation data it reads (`lib/site-navigation.ts`, `lib/menu-destinations.ts`, `lib/menu-counts.ts`) are protected by the navigation data contract (`phase-1-core-pages.md` 8.3). |
| `StudioShell`, Rhinox Code Studio, RhinoBot, Game Creator, `LearningHome`, the interactive runtime workspaces | F3 | **Protected area.** Out of scope. Receive no token or style change unless they opt in through the migration in `phase-0-design-system.md` section 7. |
| Think • Move • Code! pages (`TmcHome`, `VideoPanel`, `OpenOnHash`) | F2 | **Protected area.** Out of scope; preserved. Its styles read shared tokens about 139 times, so shared token values are not edited in place (`phase-0-design-system.md` section 7.2). |
| `QuizPlayer` | F3 | Working player. |
| Forms: `ContactForm`, `QuoteForm`, `StemClubsForm` | F7 | Take the form tokens (section 4.8 of the design system). Behaviour unchanged. |

### 3.2 Refactor, and the two transitional wrappers

| Component | Problem | Change | Effect |
|---|---|---|---|
| **`SectionPage`** | Fixed five-part sequence; the pages it renders look the same | Accept a **list of sections** (for example `intro`, `list`, `steps`, `proof`, `enquiry`) instead of a fixed order. Each of the 11 pages chooses its own sequence. | Removes the main source of look-alike pages without duplicating the component. |
| **`pageData.ts`** (a data file, not a component) | One shape of copy for all pages; contains unused entries | Keep as the one source of copy. Add a `family` and a `sections` field. Remove the five unused `shop-*` entries after confirmation. | Single source remains; no new data store. |
| **`GenericListingRenderer`** | Uses `ContentHero` for every list | Use the new `PageHeader` (compact). Keep the filterable list, the notice and the empty state. | Fixes about 10 listing pages in one place. |
| **`HubHero`** (becomes a **wrapper**) | Used on every hub and on non-hub pages | Keeps its name and props and renders `SectionHero` `split`, so callers migrate one page at a time. Retired when no caller remains. No longer used on library pages. | Merges four hero copies into one. |
| **`HubClosing`** | Always carries a second photograph and two buttons | Make the image optional and the band lighter. | Removes the repeated closing photograph. |
| **`ContentHero`** (becomes a **wrapper**) | Used for listings and details | Keeps its name and props; renders `PageHeader` on listings and `DetailHeader` on details. Retired once nothing uses it. | One fewer hero implementation. |

### 3.3 Restrict to specific families

| Component | Allowed on | Not allowed on |
|---|---|---|
| **`SectionHero`, `split` variant** (a variant of the new component; today's `HubHero`) | One hub at most, plus the institutional pages that need an action next to a statement | Library pages, detail pages, achievement pages |
| **`HubShowcase`** (existing component; photo tiles) | Hubs that benefit from tiles (Education) with the no-photograph variant for others | Library pages |
| **Two-tone headline style** (a style rule, not a component) | Homepage and the hubs | Everywhere else (one colour) |

### 3.4 Revive and restyle (currently unused)

These match needs in the redesign. They would be restyled to the tokens, given tests, and adopted in place of new components.

| Component | Use in the redesign | Notes |
|---|---|---|
| `Accordion` (91 lines) | F4 filter groups, F7 and F8 "details", F9 hub content, Support questions | Check it follows the standard accordion pattern (button, `aria-expanded`, region). |
| `Breadcrumbs` (60 lines) | F4, F8 | Replaces ad hoc breadcrumbs in several pages. |
| `FilterBar` and `SearchBar` | F4 | Review against the Explore and Experience explorer filters; reuse where they fit. |
| `Tabs` (72 lines) | F5 achievement dashboards, F6 product detail | Check keyboard behaviour. |
| `Pagination` | F4 when a library exceeds one page | Not needed until a library has enough items. |
| `SectionHeading` | Section titles | Compare with `HubSectionHead`; keep one. |

### 3.4a Decide between near-duplicates

| Pair | Recommendation |
|---|---|
| `SectionHeading` and `HubSectionHead` | Keep one. |
| `Card`, `CompactCard`, `ContentCard` and the product and experience cards | Keep only the card that has a user (product, experience, resource). The unused generic ones are retired. |
| `Slider` and the rotating homepage parts | A slider is not recommended; section 4.12 of the design system limits auto-advancing content. |

### 3.5 Retired (after confirmation)

These are the 13 unused components plus `ContentGrid` and `ContentCard`, 15 in all. The two wrappers in 3.2 are retired later, when their callers have moved.

| Component | Reason |
|---|---|
| `Hero.tsx` | Unused; the live hero is in `app/page.tsx` |
| `CTASection`, `EditorialBlock`, `FeaturePanel`, `FullWidthFeature`, `SplitSection` | Unused layout blocks, each a hero or band variant that the new `SectionHero` replaces |
| `ContentCatalogue`, `ContentGrid`, `ContentCard`, `FeaturedContent`, `ContentMeta`, `ExperienceRow`, `CompactCard`, `Card` | Unused catalogue and card chain (`ContentGrid` and `ContentCard` are used only by `ContentCatalogue` and `FeaturedContent`); superseded by the library and shop components |
| `Slider` | Unused; not recommended |
| Five `shop-*` entries in `pageData.ts` | Not referenced by any page |

Deletion happens only after you confirm that no plan outside the repository needs them, and only on a branch.

---

## 4. New components (three), one icon map and one wrapper

| Name | Purpose | Replaces | Used by |
|---|---|---|---|
| **`PageHeader`** | A compact header: eyebrow, title, one line of text, an optional count, optional actions and filters slot. Height about 120–160 px. No photograph. | `ContentHero` on listings; headings built by hand on Explore Experiences and Virtual Labs | F4, F5, parts of F7 and F8 |
| **`SectionHero`** | The one hero, with four variants: `split` (text and media side by side), `statement` (centred text over plain background), `feature` (text with a product preview), `plain` (title and lead only) | `HubHero`, and the hero in `about` and `contact` styles | F1, F7, F9 |
| **`DetailHeader`** | Title block for item pages: type label, title, summary, key facts and the primary action | The `ContentHero` use inside detail renderers | F8 |
| **`icons.ts`** (map, not a component) and **`Icon`** (thin wrapper that reads it) | A single map of named SVG paths and one small `Icon` wrapper | Duplicate path strings in at least seven files | All families |

**Why only these.** Hub pages each use a different "way of choosing" (see the wireframes). Those devices are **page-local compositions built from existing parts**, not shared components, because turning them into a shared component would reproduce the repetition the redesign is meant to remove.

---

## 5. Component use by family

| Family | Header | Main parts | Supporting parts |
|---|---|---|---|
| **F1 Editorial** | `SectionHero` (variant per page) | Homepage sections; page-local bands | `Icon`, `HubSteps` |
| **F2 Learning** | Existing | `TmcHome`, accordions, `OpenOnHash` | None added (protected) |
| **F3 Workspaces** | None (shell) | Existing workspaces | None by default (protected) |
| **F4 Libraries** | `PageHeader` | `ContentList`, `ExperienceExplorer`, `InteractiveMatrix`, `FilterBar`, `SearchBar`, `Accordion` | `Breadcrumbs`, `Pagination` |
| **F5 Dashboards** | `PageHeader` with a summary row | Lists, `Tabs` | `Icon` |
| **F6 Catalogues** | Existing | `ShopCatalogue`, `ProductDetailRenderer` | `Tabs`, `Breadcrumbs` |
| **F7 Institutional** | `SectionHero` (`plain` or `split`) | `SectionPage` sections, `HubSteps`, forms | `Accordion` |
| **F8 Detail** | `DetailHeader` | Typed renderers, `RelatedContent` | `Breadcrumbs` |
| **F9 Hubs** | `SectionHero` (variant per hub) | Page-local choosing device, `HubShowcase` (no-photo variant) | `Icon` |

---

## 6. Styling architecture

| Issue | Recommendation |
|---|---|
| Two token layers (`globals.css`, `redesign.css`) | Merge into one token file; keep names. `redesign.css` becomes unnecessary once the values are in the base. |
| 6,600-line `globals.css` | Do not rewrite. Move tokens and the `rx-` primitives (button, eyebrow, container) to the top; leave page rules alone and remove them as pages move to the new parts. |
| Hard-coded colours in module CSS | Replace with tokens as each module is touched. |
| `home-polish.css` | Review for rules that duplicate tokens; keep only what is needed. |
| Tailwind | Available but used sparingly; follow the file being edited, as the project rules say. No change. |
| New dependencies | **None.** No icon library, no animation library. |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Restyling revived components could change behaviour | Review each one's markup and add a small test before use; adopt on one page first. |
| Refactoring `SectionPage` touches 11 pages | Keep the old sequence as the default so nothing changes until a page opts in. |
| Retiring unused components | Confirm first; do it on a branch; a deletion is a revert away. |
| `HubHero` used in five pages | Convert as variants; keep the same props at first. |
| Tests reference class names | Update tests per step; run the full set before merging. |
| A shared style or token change reaches a protected area | Additive tokens, scoped adoption, and the regression pass in `phase-0-design-system.md` sections 7.2 and 7.3. A failure there blocks the merge. |
| A menu or navigation change removes items from the Explore engine | The navigation data contract in `phase-1-core-pages.md` section 8.3 is met first. |
| Wrappers left in place indefinitely | Each wrapper has a named retirement condition (no callers); tracked in the migration plan. |

---

## 8. Questions for management

1. May the 20 unused components be removed after a final check (and which, if any, are part of a plan outside the repository)?
2. Is it acceptable to revive and restyle `Accordion`, `Breadcrumbs`, `Tabs`, `FilterBar`, `SearchBar` and `Pagination` rather than writing new ones?
3. Do you agree that hub pages should use page-local compositions rather than one shared "hub tile" component?
4. Do you agree that `HubHero` and `ContentHero` become temporary wrappers rather than being replaced in one step?
5. Which one of `SectionHeading` and `HubSectionHead` should remain?
