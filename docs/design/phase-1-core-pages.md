# Rhinox Scientifica: Phase 1 Core Page Specifications

| | |
|---|---|
| **Status** | Design planning only. Revision 2, after management review (direction and six compositions accepted). No page has been changed. |
| **Date** | 3 November 2026 |
| **Pages** | Homepage, Explore, Education, Resources, Schools, Coding & Robotics |
| **Builds on** | `phase-0-design-system.md` (tokens and family rules) and `component-architecture.md` |
| **Wireframes** | `phase-1-wireframes.md` (diagrams for every page below) |
| **Out of scope** | Rhinox Code Studio and Think • Move • Code! are preserved as they are (protected areas: `phase-0-design-system.md` section 7). |

Measurements use the tokens in the design system. "Container" means the 1240 px page container; "col" means a column of the 12-column desktop grid; breakpoints are phone (under 640 px), tablet (640–1023 px), laptop (1024–1439 px) and wide (1440 px and up).

### Revision history

| Revision | Date | Change |
|---|---|---|
| 1 | 3 November 2026 | First issue. |
| 2 | 3 November 2026 | Targeted revision; no new visual direction. (2) Homepage: relationship between Rhinox Journey, Play and Hands-on settled with no added section; the page stays at eight bands (1.2, 1.2a). (3) Official product names applied (`phase-0-design-system.md` section 9). (5) Schools persistent enquiry button: safe-area behaviour and dismissal rules (5.14). (7) Page family, purpose and component distinguished (section 0). (8) Tablet (768) and intermediate-width (1024–1279) layouts added for every page (sections 1.14, 2.14, 3.14, 4.14, 5.15, 6.14). (9) Navigation data contract protects the Explore engine before any menu restructure (8.3). (10) Exact homepage content and destinations confirmed, with no invented counts, products or proof figures (1.13). Question 1 is resolved and question 3 is resolved in principle; questions 2 and 4–12 remain open. |

Items 1, 4 and 6 are specified in `phase-0-design-system.md` (colour, preservation) and `component-architecture.md` (inventory). Colour references in this document use `--rx-brand-blue` (#168fe5) for brand and graphics and `--rx-action` (#116eb1) for links and primary buttons.

---

## 0. How the six pages differ

The brief asks that these six pages do not become six versions of one two-column layout. Each has a different **organising idea**, a different **first screen**, and a different **choosing device**.

**Family, purpose, component and page-local composition are four different things** (defined in `phase-0-design-system.md` section 5.0). The *family* is the composition rule; the *purpose* is what this page is for; *components* are the reusable pieces; the *page-local composition* is the one-page arrangement built from them.

| Page | Family (rule) | Purpose (what it is for) | Organising idea | First screen | How the visitor chooses |
|---|---|---|---|---|---|
| **Homepage** | F1 Editorial | Orient a new visitor and send them to the right place in one click | A story told in bands that each have a different shape | Centred statement, two actions and the five-stage Rhinox Journey line | Five Journey stages, then the story |
| **Explore** | F9 Hub (tool) | Find any experience, lab, game, project or resource by search or topic | A workbench: a filter rail beside live results | Compact header, search and the results already visible | Search and filters |
| **Education** | F9 Hub | Choose where to start in Rhinox education | A table of contents | A large numbered index of the three real destinations | Pick a row |
| **Resources** | F9 Hub | Find and use a learning resource quickly | A library index | A large search box over a typed grid showing the newest item of each type | Search, or pick a type |
| **Schools** | F7 Institutional | Persuade a school leader and make an enquiry easy | A proposal document | A statement and proof, with a sticky section index and a persistent quote action | Scroll a single argument |
| **Coding & Robotics** | F9 Hub (product) | Start coding in one click and see how the studios fit together | A launcher | A dark band of three studio "windows" | Open a studio |

The three F9 hubs share a *family rule* (a short header, then a way of choosing) but have different *purposes* and different *page-local compositions* (a table of contents, a library index, a launcher), which is why they do not look alike. Explore is F9 as a tool; Coding & Robotics is F9 as a product.

No two of these share a first-screen composition. Only the homepage uses the display type size and the two-tone headline (the hubs may use one blue phrase, section 4.2 of the design system).

---

## 1. Homepage

### 1.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Tell a new visitor in one screen what Rhinox is, and send them to the right place in one click. |
| **Audience** | Four groups at once: parents choosing learning for a child, teachers looking for classroom resources, school leaders (laboratory and programmes) and learners who arrive to play. |
| **Success** | A visitor identifies which path is theirs within five seconds and reaches it in one click. |

### 1.2 Desktop layout (1440 px; container 1240 px)

The page is **eight bands**. No two consecutive bands share a composition. **No band is added to the current homepage; the current nine sections (hero, Journey, Play, Hands-on, RhinoCode band, Explore, Shop, Schools, More) become eight bands because the Journey is folded into the first band.**

| # | Band | Composition | Height (approx.) |
|---|---|---|---|
| 1 | **Statement and Journey** | Centred column (880 px). Eyebrow, H1 (display), one lead sentence, two buttons. Beneath, the existing **Rhinox Journey** as a full-width line of its five stages (Discover, Learn, Practise, Build, Create), each a link with its one-line idea. This line is the page's orientation into the site. | 560–620 px |
| 2 | **Play** | Two columns (the design from the open Play pull request #30): left, the open experience large; right, heading, chips and an accordion. | 540 px |
| 3 | **Hands-on** | Full-width band with the two existing live previews side by side and a caption each. Kept separate from Play (see 1.2a). | 420 px |
| 4 | **Code** | **Dark navy full-width band**: text and two buttons on the left, the real maze preview on the right. The only dark band on the page. | 360 px |
| 5 | **Explore** | The Explore engine inside the page with a compact header, the "by topic" tabs and results in three columns. | 560 px |
| 6 | **Shop** | A horizontal rail of the six existing showcase items (section 1.13), with the price or action under each where one exists. | 420 px |
| 7 | **Schools** | A **proof row** over a single statement, with one button. No photograph. Figures supplied by management (1.13). | 300 px |
| 8 | **More from Rhinox** | Resources and About as a two-part band: a list of the three resource types on the left, "My Rhinox" and "About" as plain rows on the right. | 340 px |

### 1.2a How Journey, Play and Hands-on relate

The three sections answer three different questions. They stay separate, they are not merged, and nothing new is added.

| Section | Question it answers | What it does | Where it sends the visitor |
|---|---|---|---|
| **Rhinox Journey** (band 1, below the statement) | "How does learning with Rhinox progress?" | Shows the five stages as one orientation line. It is the homepage's navigation into the site's learning areas. | Resources, Education, Explore, Project Lab, STEM Challenges |
| **Play** (band 2) | "What can I try right now?" | Opens a chosen experience from a list. | The experience itself |
| **Hands-on** (band 3) | "Can I run a real experiment here?" | Two live previews that start on click. | The experiment or lab itself |

Rules:

1. **No duplicate destinations.** Journey sends visitors to areas; Play and Hands-on send them to a single item. A link to the same page does not appear in more than one of the three.
2. **Journey is compact.** The five stages appear as a single line with their one-line ideas. The large rotating stage panel with its image and long text is not carried onto the new homepage unless management asks for it (question 3).
3. **Play and Hands-on are not merged.** An earlier merged version was reverted at management's request, so they remain two bands. They are kept visually different (a two-column accordion for Play, two side-by-side live previews for Hands-on) and neither repeats the other's heading style.
4. **If management later prefers one band,** Hands-on becomes a second tab inside Play. That removes a band and requires no new component. It is not recommended now.
5. **The five-door strip** (Learn, Play, Code, Shop, Schools) proposed in revision 1 is **withdrawn**: it would have duplicated the header menu and added an element. The Journey line replaces it, and Shop and Schools are reached through their own bands and the header.

### 1.3 Mobile layout (390 px)

| Band | Behaviour |
|---|---|
| 1 | Display type reduces to 36 px; the Journey line becomes a vertical list of five stages, each a full-width link with its one-line idea. |
| 2 | Heading and accordion first, large card below, as designed. |
| 4 | Dark band keeps its colour; the maze preview sits under the text at full width. |
| 5 | Filters collapse into one "Filters" button; results are one column. |
| 6 | The rail becomes a horizontal scroller with 16 px peek of the next item and visible scroll hints. |
| 7 | The three figures stack. |
| 8 | Two parts stack. |

### 1.4 Hero composition

- **Variant:** `statement` (centred), the only centred hero among the six pages.
- **H1:** the current heading is kept: "Everything you need to learn, build and create." The second line is the only part set in colour. The colour is `--rx-brand-blue` and, because the heading is 36 px or larger, it passes as large text.
- **Eyebrow:** the existing "Science • Technology • Education • Innovation".
- **Lead (17 px):** one sentence. The current paragraph is long; the shortened sentence is written by management from the existing paragraph ("Rhinox Scientifica brings together scientific equipment, laboratory solutions, STEM and STEAM education, books, learning resources, kits, technology, training and practical experiences…"). No new claim is added.
- **Actions:** primary "Explore Rhinox" (to `/explore`), secondary "Shop & Discover" (to `/shop`). The existing labels and destinations are kept.
- **Journey line:** five equal items, each with the stage label (15 px, 600), its existing one-line idea (13 px) and a link. Whole item is the target.
- **Current carousel:** the existing four slides (Science, Education, Technology, Laboratory Solutions) become a quiet, paused-by-default strip of four labelled links below the Journey line; the auto-advance is removed, in line with the motion rule. The slide links currently all go to `/explore`; the destinations are confirmed in 1.13.

### 1.5 Background treatment

White for the page; the pale tint (`#f3f7fb`) behind band 1 only; navy for band 4; white elsewhere. No grid, dots or gradients.

### 1.6 Navigation structure

Global header (sticky, 66 px). No in-page navigation. The Journey line is the in-page navigation.

### 1.7 Image placement

| Band | Image | Treatment |
|---|---|---|
| 1 | None (the page opens on type; the four hero photographs are not used on this page) | n/a |
| 2 | Real experience screenshot | Product preview |
| 3 | The two live previews already on the page | Live, not images |
| 4 | Live maze preview | Product preview on navy |
| 5 | Item thumbnails in results | Thumbnail |
| 6 | Product covers | Cover art; generated cover where none exists |
| 7, 8 | None | n/a |

No stock photograph on the homepage. (The four hero photographs are retired from this page.)

### 1.8 Typography hierarchy

Display 56/36 for the one H1; H2 28/24 per band; H3 18 for items; lead 17; body 15; labels 12; eyebrows 11 uppercase.

### 1.9 Interactive elements

| Element | Behaviour |
|---|---|
| Journey line | Links; hover raises the border colour; focus ring; the current stage is not auto-advanced |
| Play accordion | One open row at a time; selecting a row updates the large card; manual by default |
| Hands-on previews | Live; start on click, not on load |
| Explore engine | Search, filters, tabs; keeps its current behaviour |
| Shop rail | Horizontal scroll with buttons for keyboard users |

### 1.10 Calls to action

| Where | Action |
|---|---|
| Band 1 | Primary: Explore Rhinox. Secondary: Shop & Discover |
| Band 4 | **"Start coding"** (to `/coding-robotics`) and **"Open Game Creator"** (to `/coding-robotics/game-creator`). These replace the current labels "Open RhinoCode" and "Make a game"; destinations are unchanged. The copy change awaits approval (question 12). |
| Band 6 | Existing "Visit the shop"-style link to `/shop` (the current label is kept) |
| Band 7 | Request a quote |
| Band 8 | Browse resources |

### 1.11 Reusable components

New or revived: `SectionHero` (`statement`), `Icon` map (wrapper over the shared icon file), `Accordion` (revived, used by Play). Existing and kept: `RhinoxJourney` (compacted presentation), `PlayRhinox`, `PlayLabs`, `RhinoCodeBand`, `ExploreRhinox`, `ShopRhinox`, `SchoolsRhinox`, `MoreRhinox`. `HubSteps` is not used. No other new components are needed. The authoritative inventory is `component-architecture.md`.

### 1.12 Preserved

All homepage links, the Explore engine, the existing sections' data sources, metadata and the printed short links.

### 1.13 Exact content and destinations

This list is taken from the current code. Where a value comes from data, it says so and no figure is written here. **Nothing below is invented**; items that management must supply are marked.

| Band | Content | Destination | Source |
|---|---|---|---|
| 1 Hero | Eyebrow "Science • Technology • Education • Innovation"; H1 "Everything you need to learn, build and create." | n/a | Current `app/page.tsx` |
| 1 Hero | Primary "Explore Rhinox" | `/explore` | Current |
| 1 Hero | Secondary "Shop & Discover" | `/shop` | Current |
| 1 Hero strip | Four slides: Science (Scientific equipment, laboratory supplies…), Education, Technology, Laboratory Solutions | Currently `/explore` for all four (the "Discover more" link). **Default until decided: all four keep `/explore`.** Management may instead send each to its own area (suggested: Science and Laboratory Solutions to `/shop/laboratory-equipment`, Education to `/education`, Technology to `/coding-robotics`). | Current; the per-slide destinations are a management decision |
| 1 Journey | Discover → "Explore resources" | `/resources` | Current `RhinoxJourney` |
| 1 Journey | Learn → "Explore education" | `/education` | Current |
| 1 Journey | Practise → "Explore experiences" | `/explore` | Current |
| 1 Journey | Build → "Enter Project Lab" | `/explore/project-lab` | Current |
| 1 Journey | Create → "Explore challenges" | `/explore/stem-challenges` | Current |
| 2 Play | The experiences listed by the existing Play component; each opens its own experience | Per experience, resolved from the content index | Current `PlayRhinox` |
| 3 Hands-on | The two existing live previews, each with its own play control | Per experience | Current `PlayLabs` |
| 4 Code | "Code a robot. Build a game." with the maze preview | **"Start coding"** → `/coding-robotics`; **"Open Game Creator"** → `/coding-robotics/game-creator` (replacing the current "Open RhinoCode" and "Make a game") | Current `RhinoCodeBand` destinations; labels per question 12 |
| 5 Explore | The Explore engine | `/explore` and its parameters | Current `ExploreRhinox` |
| 6 Shop | 1. The featured book (currently Think • Move • Code!) | Its product page, resolved from product data | Current `ShopRhinox` |
| 6 Shop | 2. Coding & Robotics Kits | `/shop/kits` | Current |
| 6 Shop | 3. Glassware & Plasticware | `/shop/laboratory-equipment` | Current |
| 6 Shop | 4. Teacher's Training | `/schools/teacher-training` | Current |
| 6 Shop | 5. Digital Downloads | `/shop/digital-resources` | Current |
| 6 Shop | 6. Resources | `/resources` | Current |
| 6 Shop | Link to all products | `/shop` | Current |
| 7 Schools | The existing service stories and the quote link | `/schools/…` pages and `/schools/request-a-quote` | Current `SchoolsRhinox` |
| 7 Schools | **Proof row figures** | n/a | **Supplied by management.** If none are supplied, the row is left out and the statement stands alone. No figure is invented here. |
| 8 More | Resource types, My Rhinox (Library, Badges, Certificates), About links and Contact | `/resources/…`, `/my-rhinox/…` as listed in the navigation data, `/about…`, `/contact` | Current `MoreRhinox` |

Rules for numbers on the homepage:

- Every count (items in a category, labs, experiences) is read from the content system at build time. The documents write it as `{n}` and no number is typed into the design.
- Prices appear only for products that have one in the product data.
- No claim about learners reached, schools served, years of operation or similar is shown unless management supplies and confirms it.
- Product names follow `phase-0-design-system.md` section 9.

### 1.14 Tablet (768 px) and intermediate widths (1024–1279 px)

| Band | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| 1 Statement and Journey | Centred statement at 40 px display. The Journey line becomes a two-row grid (three stages, then two) of full-width links. | Single row of five stages with a minimum of 180 px each; the idea text drops to two lines. Display type steps down one size. |
| 2 Play | The two columns stay side by side only when each is at least 320 px; at 768 they are two stacked parts (large experience above, accordion below). | Two columns, container fluid with 24 px gutters; the large experience takes 55% of the width. |
| 3 Hands-on | The two previews stack at full width with a caption each. | Two previews side by side. |
| 4 Code | Text above and the maze below, centred, on the dark band. | Text left and maze right. |
| 5 Explore | Rail collapses to a "Topics" button; results in two columns. | Rail at 220 px, results in two columns. |
| 6 Shop | Horizontal rail showing about 2.5 items so the next one peeks. | Rail showing about 3.5 items. |
| 7 Schools | Proof row (if supplied) in a row of up to three; statement below. | Same as desktop. |
| 8 More | Two parts stack. | Two parts side by side. |

---

## 2. Explore

### 2.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Let a learner, parent or teacher find any experience, lab, game, project or resource, by search or topic. |
| **Audience** | Learners (play), parents (find something suitable), teachers (find something for a class). |
| **Today** | The page is the homepage Explore engine with a screen-reader-only heading. It has no visible title. |

### 2.2 Desktop layout (workbench)

| Zone | Content | Width |
|---|---|---|
| **Compact header** | Eyebrow "Explore", **visible H1** "Explore Rhinox", one line, and the result count | Full width, about 120 px tall |
| **Search row** | A wide search field and the sort selector | Full width, 56 px |
| **Left rail** | "By topic" tree (Learning, Technology, Experiences, Virtual Labs and others) with live counts, as a collapsible list | 3 cols (about 280 px), sticky |
| **Results** | Rows or tiles of items, each with a thumbnail, title, type label, level and time | 9 cols |
| **Right** | None | |

The "By site menu" view remains as a second tab in the rail, because the current engine offers it. It is built from the same navigation data as the site menu, so it is covered by the navigation data contract in section 8.3.

### 2.3 Mobile layout

| Zone | Behaviour |
|---|---|
| Header | Title and count only |
| Search | Full width, sticky under the header |
| Filters | One "Topics" button opens a full-height sheet; the selected topic shows as a removable chip |
| Results | One column, rows with a 64 px thumbnail |

### 2.4 Hero composition

None. A compact `PageHeader` replaces the hero. Explore is a tool, so it opens on the tool.

### 2.5 Background treatment

White. The rail has a 1-pixel right border; no tint.

### 2.6 Navigation structure

The rail is the page's navigation; breadcrumbs are not needed. Each result links to the item page; each topic selection updates the URL's `explore` parameter so a topic can be bookmarked (the current engine already reads this parameter).

### 2.7 Section sequence

Header → search → rail and results → optional "Can't find it? Ask the team" row at the end.

### 2.8 Image placement

Thumbnails only (64–96 px). No hero image.

### 2.9 Typography hierarchy

H1 40/30; item title 15 (600); metadata 12; counts 12 tabular figures.

### 2.10 Interactive elements

| Element | Behaviour |
|---|---|
| Search | Instant filtering; clear button; keyboard focus returns to the field after clear |
| Topic tree | Expand or collapse; arrow-key navigation; selected item has a bar and bold text (not colour alone) |
| Sort | Easiest first (default), newest, A to Z |
| Result item | Whole row is the link |

### 2.11 Calls to action

Open an item (primary action of each row). No marketing CTA on this page.

### 2.12 Reusable components

`PageHeader`, existing `ExploreRhinox` engine (restyled to tokens), `FilterBar`, `SearchBar` (revived), `Breadcrumbs` (not used), `Icon` map.

### 2.13 Preserved

The engine, the URL parameters `menu`, `dest` and `explore` and their deep links, menu counts, the "By site menu" view and the `/explore` URL. The engine is protected by the navigation data contract (section 8.3): this page's redesign changes appearance and layout around the engine, not its data sources.

### 2.14 Tablet (768 px) and intermediate widths (1024–1279 px)

| Zone | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| Header and search | Full width; search sticky under the site header | Same as desktop |
| Topic rail | Not shown as a rail. A "Topics" button opens a left sheet (360 px wide); the chosen topic shows as a removable chip beside the search field. | A 220 px sticky rail beside the results |
| Results | Rows with a 64 px thumbnail in one column, or tiles in two columns when the sort is "visual" | Two columns of rows |
| By site menu tab | Inside the Topics sheet | At the top of the rail |

---

## 3. Education

### 3.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Help a parent or teacher choose where to start in Rhinox education. |
| **Audience** | Parents of young learners, teachers, and tutors. |
| **Today** | A large split hero, five photo cards (three of which lead to pages duplicated elsewhere), a three-point strip and a closing band with another photograph. |

### 3.2 Desktop layout (table of contents)

| Zone | Content |
|---|---|
| **Header** | Eyebrow, H1 "Learning that starts with doing", one line. No photograph. About 140 px. |
| **Index** | A full-width list of the real destinations as a **numbered table of contents**: a large numeral (48 px), the destination name (28 px), a one-line description, a live count and an arrow. Each row is 96 px tall and is a single link. Rows are separated by hairlines. |
| **For adults band** | A narrow band with "Teacher and parent resources" shown as accordion entries named after the content that exists ("Teacher resources", "Parent resources", "Worksheets and assessments") with live counts, rather than a card. |
| **Closing** | A single line and button: "Teaching a class? Talk to us about training." |

Destinations in the index (only those that exist as distinct pages): **1 STEM & STEAM Education**, **2 Think • Move • Code!**, **3 Teacher & Parent Resources**. Books and Coding & Robotics appear as small "also see" links under the index (to the Shop and to Coding & Robotics), not as large rows, because they duplicate other sections (see the menu audit).

### 3.3 Mobile layout

Header stacks; each index row keeps the numeral (32 px) on the left and the text on the right; counts move below the description; the adults band becomes a full-width accordion.

### 3.4 Hero composition

None. The index is the hero. This avoids a hero over a page whose whole job is to choose.

### 3.5 Background treatment

White. A single pale-tint band behind the "for adults" part.

### 3.6 Navigation structure

Breadcrumb "Home / Education". The index is the in-page navigation.

### 3.7 Section sequence

Header → index (3 rows) → also see (2 links) → for adults → closing line.

### 3.8 Image placement

None on the page. Any photograph is optional and only on the "for adults" band, once, 4:3, with alt text.

### 3.9 Typography hierarchy

H1 40/30; index numerals 48/32 (Manrope, light blue `#c8d8e8` for the numeral so the title leads); index titles 28/22 H2; descriptions 15; counts 13 tabular.

### 3.10 Interactive elements

| Element | Behaviour |
|---|---|
| Index row | Entire row is a link; hover moves the arrow 4 px and underlines the title |
| Adults accordion | Standard accordion; first item open |

### 3.11 Calls to action

Primary: the first index row (start with STEM & STEAM). Secondary: "Teacher training" in the closing line.

### 3.12 Reusable components

`PageHeader`, `Accordion`, `Icon` map, a page-local index row. `HubShowcase` and `HubHighlights` are no longer used on this page.

### 3.13 Preserved

`/education` and its sub-routes, `/education/books/[slug]` redirect, metadata, existing counts. Redirect of the three duplicate sub-pages waits for the menu decision and for the navigation data contract (section 8.3).

### 3.14 Tablet (768 px) and intermediate widths (1024–1279 px)

| Zone | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| Header | Title and one line, full width | Same as desktop |
| Index | Rows stay single links. Numeral 40 px, title 24 px, description below the title; the count and arrow move to the right of the title row. Row height auto, minimum 88 px. | Numeral 48 px, title 28 px; description and count on one line |
| Also-see links | Two links in a row | Same as desktop |
| For-adults band | Accordion at full width | Accordion in an 880 px column |

---

## 4. Resources

### 4.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Let visitors find and use learning resources quickly. |
| **Audience** | Teachers (downloads), parents (videos and articles), learners (videos). |
| **Today** | A split hero, four photo cards (one marked "Coming soon") and a feature band. |

### 4.2 Desktop layout (library index)

| Zone | Content |
|---|---|
| **Search band** | Eyebrow, H1 "Keep learning beyond the classroom", and a **large search field** (60 px tall, 720 px wide) with type chips under it ("All", "Articles", "Videos", "Downloads"). |
| **Type grid** | Three columns, one per type (Articles, Videos, Free Downloads). Each column has a heading with its count, then **its newest item** (title, one line, a small thumbnail or file-type icon) and a "See all" link. Columns are separated by hairlines, not boxed. |
| **My Rhinox strip** | A single full-width row with three plain links (Library, Badges, Certificates), each with a short status ("Coming soon" where true). |
| **Closing** | A one-line suggestion box: "Want a topic covered? Tell us." with a button. |

### 4.3 Mobile layout

Search first, full width; type chips scroll horizontally; the three columns stack as three sections each with the newest item; the My Rhinox strip becomes three stacked rows.

### 4.4 Hero composition

`PageHeader` with the search field inside it. No photograph.

### 4.5 Background treatment

White; the search band uses the pale tint.

### 4.6 Navigation structure

Breadcrumb "Home / Resources". Type chips filter the search; "See all" links go to the library pages.

### 4.7 Section sequence

Search band → type grid → My Rhinox strip → closing.

### 4.8 Image placement

Small thumbnails or file-type icons inside the type grid only. The video column shows the thumbnail of the newest video if one exists; otherwise an icon.

### 4.9 Typography hierarchy

H1 40/30; column headings H2 20 (Manrope 700); item title H3 16; counts 12; the search field text 17.

### 4.10 Interactive elements

| Element | Behaviour |
|---|---|
| Search | Searches across the three types; results replace the grid in place with a clear "Back to resources" link |
| Type chips | Filter the search; one active at a time; active state has a bar and bold text |
| "See all" | Goes to the type's library page |

### 4.11 Calls to action

Primary: search. Secondary: "Free downloads". Closing: "Suggest a topic" (to Contact).

### 4.12 Reusable components

`PageHeader` with the search slot, `SearchBar` (revived), `ContentList` rows, `Icon` map. `HubHero`, `HubShowcase` and `HubFeature` are no longer used here.

### 4.13 Preserved

`/resources` and all six sub-pages; the content source; metadata; the "Coming soon" honesty for My Rhinox.

### 4.14 Tablet (768 px) and intermediate widths (1024–1279 px)

| Zone | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| Search band | Search field at full width (maximum 720 px); type chips on one row, scrolling if needed | Same as desktop |
| Type grid | Three columns are too tight at 768 px, so the grid becomes **one column of three sections**, each section a heading, its newest item and "See all" in a row | Three columns, separated by hairlines, each at least 280 px wide |
| My Rhinox strip | Three links in a row | Same as desktop |
| Results (after a search) | One column of rows | Two columns of rows |

---

## 5. Schools & Institutions

### 5.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Persuade a school leader that Rhinox can equip and support their STEM programme, and make an enquiry easy. |
| **Audience** | Heads, proprietors and STEM coordinators. |
| **Today** | A split hero with a stock photograph, five photo cards, a four-step process and a closing band with a second photograph. |

### 5.2 Desktop layout (proposal document)

| Zone | Content |
|---|---|
| **Statement** | Eyebrow, H1 "STEM solutions for schools and institutions", a two-sentence summary and **Request a quote** (primary) and **Talk to us** (secondary). Left-aligned, 720 px wide. No photograph. |
| **Proof row** | Three plain figures or facts that are true and confirmed (for example the number of service areas, the learner age range the programmes cover). **Content to be supplied by management; none is invented here.** |
| **Body with a sticky index** | A 2-column layout: a **sticky left index** (3 cols: "What we offer", "How we work", "Request a quote") and a **long-form body** (9 cols). |
| **What we offer** | Five **rows** (not cards): STEM School Solutions, Laboratory Solutions, Coding & Robotics, STEM Clubs, Teacher Training. Each row: name, one-line outcome, and "Details →". |
| **How we work** | A horizontal four-step line: Consult, Plan, Deliver, Support, with a sentence each. |
| **Request band** | A full-width band with the single primary action and the contact details. |

A **persistent enquiry button** appears after the first screen: a bar anchored at the bottom right on tablet and laptop, and a full-width bottom bar on phone. Its full behaviour, including safe areas and dismissal, is specified in 5.14.

### 5.3 Mobile layout

The sticky index becomes a horizontal chip row that sticks under the header; the proof row stacks; offer rows stay single-line with the arrow; the four steps become a vertical list; the persistent enquiry button becomes a fixed bottom bar (5.14).

### 5.4 Hero composition

`SectionHero` `plain` variant: type only, left-aligned, no image. A statement page for a service sale reads best as one clear argument.

### 5.5 Background treatment

White; the proof row and the request band use the pale tint. No pattern.

### 5.6 Navigation structure

Breadcrumb "Home / Schools". Sticky in-page index with active-section marking (bar and bold, not colour alone). The persistent request bar.

### 5.7 Section sequence

Statement → proof → what we offer → how we work → request.

### 5.8 Image placement

None required. If management supplies real photographs of Rhinox delivering a programme (a school laboratory, a teacher training session), one may be used in "How we work", once, 16:9, with a caption.

### 5.9 Typography hierarchy

H1 40/30; section H2 28/24; offer-row names H3 20; outcomes 15; figures 40 tabular; steps 15.

### 5.10 Interactive elements

| Element | Behaviour |
|---|---|
| Sticky index | Scroll-spy; clicking scrolls to the section and moves focus to its heading |
| Offer rows | Whole row is a link |
| Persistent enquiry button | Keyboard reachable; dismissible; behaviour in 5.14 |

### 5.11 Calls to action

Primary: Request a quote (appears four times: statement, bar, after the offer rows, request band). Secondary: Talk to us.

### 5.12 Reusable components

`SectionHero` (`plain`), `HubSteps` (horizontal), a page-local sticky index and offer row, `Accordion` for service details, `QuoteForm` (unchanged) on its own page.

### 5.13 Preserved

`/schools`, the four service pages, STEM Clubs, Request a Quote (and its form), metadata.

### 5.14 Persistent "Request a quote" button: safe-area and dismissal specification

**Purpose.** Keep the one enquiry action within reach on a long page without covering content or competing with other fixed elements.

**Appearance**

| Property | Phone (under 640 px) | Tablet and laptop (640 px and up) |
|---|---|---|
| Form | Full-width bottom bar | A bar anchored at the bottom right of the container (not full-width), about 220 px wide |
| Height | 56 px **plus** the bottom safe-area inset | 48 px plus the bottom safe-area inset |
| Content | The label "Request a quote" (primary button style, `--rx-action`) and a close control (a 44 × 44 px button with an accessible name "Dismiss") | Same |
| Surface | White with a 1 px top border and the small shadow (`--rx-shadow-sm`), so it reads as part of the page | Same, with `--rx-radius-md` |
| Colour | Button fill `--rx-action`, white text (5.40:1). Brand blue is used only for the top accent line. | Same |

**Safe-area behaviour (phones with a home indicator, notches or rounded corners)**

1. The bar's bottom padding is `env(safe-area-inset-bottom)` so the button and close control sit **above** the home indicator, never under it. Left and right padding use `env(safe-area-inset-left)` and `env(safe-area-inset-right)` in landscape.
2. The page's own bottom padding is increased by the bar's height while the bar is visible, so the last content and the footer are never hidden behind it.
3. For safe-area values to be non-zero on devices that report them, the page must declare `viewport-fit=cover`. The current layout does not declare it. This is an implementation requirement to confirm and test, and it is noted in the risks.
4. In landscape on a phone the bar is 48 px high (not 56 px) so that it leaves enough of the viewport for content.
5. Pinch-zoom and dynamic text size do not clip the label: the bar grows in height rather than truncating the text.

**When it appears**

- After the visitor has scrolled past the statement (the first screen).
- Only on `/schools` and the three Schools service pages. It never appears on any other route.

**When it hides**

| Condition | Behaviour |
|---|---|
| The request band, or any request form, is in view | Hidden, because the action is already on screen |
| The visitor is on `/schools/request-a-quote` | Never shown |
| A form field has focus, or the on-screen keyboard is open | Hidden until focus leaves, so it never sits over the keyboard or the field |
| A menu, dialog or full-screen overlay is open | Hidden behind it (lower layer than the site header and dialogs) |
| The footer enters the viewport | Hidden, so it does not cover footer links or the Back to top button. The Back to top button is an inline button in the footer, not a floating button, so there is no overlap today; if a floating back-to-top is ever added, it sits above the bar by the bar's height |
| The visitor presses the close control | Hidden for the rest of the session (kept in the page's memory; nothing is stored beyond the session) and not shown again until the next visit |
| Print | Hidden |

**Dismissal**

1. The close control is always visible on the bar, at least 44 × 44 px, with a text alternative.
2. Pressing Escape while the bar has focus dismisses it.
3. Dismissal moves focus to the next focusable element after the bar's position in the page, so keyboard users do not lose their place.
4. A dismissed bar is not re-shown by scrolling. The statement, the offer-rows and the request band still carry the action.

**Keyboard and assistive technology**

- The bar is a landmark region with the accessible name "Request a quote" and sits at the end of the tab order, after the footer links, so it does not interrupt the page's reading order.
- It does not move content when it appears or disappears (no layout shift); it overlays within the reserved bottom padding.
- With `prefers-reduced-motion`, it appears without sliding.
- It does not cover focused elements: when keyboard focus moves to an element that would be under the bar, the page scrolls so that the element is clear of it (using a scroll-padding value equal to the bar height).

**Tests (when implemented).** An iPhone-sized viewport with a bottom inset; landscape phone; 200% zoom; keyboard open on the quote form link; Escape dismiss; footer overlap; a tablet at 768 px; reduced motion.

### 5.15 Tablet (768 px) and intermediate widths (1024–1279 px)

| Zone | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| Statement | Left-aligned, full width up to 720 px; buttons side by side | Same as desktop |
| Proof row | Up to three facts in a row, otherwise stacked | Same as desktop |
| Index | A horizontal "On this page" strip that sticks under the header (a chip for each section), not a side column | A **narrow** 200 px sticky side index (not 3 of 12 columns), the body fills the rest |
| What we offer | Rows stay single-line with the arrow | Same as desktop |
| How we work | A 2 × 2 grid of steps, each with a number | A single row of four steps |
| Request band | Full width, contact details below the button | Button and contact details side by side |
| Persistent button | Bottom bar as in 5.14 (not full width: 220 px at the right) | Right-anchored bar as in 5.14 |

---

## 6. Coding & Robotics

### 6.1 Purpose and audience

| | |
|---|---|
| **Purpose** | Let a learner start coding in one click and understand how the studios fit together. |
| **Audience** | Learners (primary), parents and teachers (secondary). |
| **Today** | The same split hero and five-part template as the Schools and Resources pages, with a stock photograph of a learner at a laptop. |

### 6.2 Desktop layout (launcher)

| Zone | Content |
|---|---|
| **Dark band (navy)** | Eyebrow "RhinoCode" (the existing platform label), H1 "Learn to code by building and playing", one line. Beneath, **three studio windows** side by side, each a real screenshot of the studio with its name, a one-line purpose and an **Open** button: **RhinoBot** ("RhinoBot: Robot Programming Lab"), **Game Creator**, **Rhinox Code Studio**. |
| **Practice shelf** | A white band with "Game Challenges" as a horizontal shelf of challenge tiles (three exist today) and "See all". |
| **Resume strip** | "My Projects": a single row showing the learner's most recent saved item with Reopen, or a plain line "Nothing saved yet. Start in a studio." |
| **How it works** | Four steps in one line: Think, Code, Run, Improve (existing copy). |
| **For schools** | A single line and button to the Schools coding page. |

### 6.3 Mobile layout

The dark band keeps the colour; the three windows stack vertically (screenshot above, text and button below); the practice shelf is a horizontal scroller; the resume strip is a single row; the steps become a vertical list.

### 6.4 Hero composition

`SectionHero` `feature` variant on a dark background: text above and the three studio windows below. It is the only dark hub, because this section is a product, not a signpost.

### 6.5 Background treatment

Navy (`--rx-ink`) for the first band; white for the rest. The screenshots sit on the navy with a 1-pixel light border. No gradients.

### 6.6 Navigation structure

Breadcrumb "Home / Coding & Robotics" on the white bands; the studio shell's own navigation is unchanged inside the studios.

### 6.7 Section sequence

Launcher → practice → resume → how it works → for schools.

### 6.8 Image placement

Real studio screenshots (product previews) in the launcher; challenge thumbnails on the shelf. No stock photograph.

### 6.9 Typography hierarchy

H1 40/30 (white on navy); studio names H3 18 (white); descriptions 14 (light text at 4.5:1 or better on navy); buttons 14.

### 6.10 Interactive elements

| Element | Behaviour |
|---|---|
| Studio window | Whole window is a link; the **Open** button is the visible action |
| Practice shelf | Horizontal scroll with arrow buttons |
| Resume strip | Reads the learner's saved projects from the browser; no account needed |

### 6.11 Calls to action

Primary: Open (per studio). Secondary: See all challenges. Tertiary: For schools.

### 6.12 Reusable components

`SectionHero` (`feature`), a page-local studio window (built from existing `Picture` handling), `ContentList` or tiles for challenges, `HubSteps`, `Icon` map. `SectionPage` is no longer used here.

### 6.13 Preserved

`/coding-robotics`, all studio routes, Rhinox Code Studio, RhinoBot, Game Creator and My Projects functions, metadata. The launcher sits *in front of* the studios; it does not modify them (protected area, `phase-0-design-system.md` section 7). The studio screenshots are images and links only.

### 6.14 Tablet (768 px) and intermediate widths (1024–1279 px)

| Zone | Tablet 768 | Intermediate 1024–1279 |
|---|---|---|
| Dark band | Heading above; the three studio windows become **a horizontal scroll-snap row** showing about 1.5 windows, or a vertical stack if scrolling is turned off by the visitor's settings. Open buttons stay visible. | Three windows side by side, each at least 280 px wide, container fluid |
| Practice shelf | Horizontal scroller with arrow buttons | Three tiles visible |
| Resume strip | One row | Same |
| How it works | A 2 × 2 grid | A single row of four |
| For schools | One line and button | Same |

---

## 7. Summary of component changes for these six pages

| Component | Homepage | Explore | Education | Resources | Schools | Coding |
|---|---|---|---|---|---|---|
| `SectionHero` (new component) | statement | — | — | — | plain | feature |
| `PageHeader` (new component) | — | yes | yes | yes (with search) | — | — |
| `Accordion` (revived component) | Play | — | yes | — | yes | — |
| `SearchBar` / `FilterBar` (revived components) | — | yes | — | yes | — | — |
| `HubHero`, `HubShowcase`, `HubClosing` | — | — | not used here | not used here | not used here | not used here |
| `SectionPage` | — | — | — | — | — | not used here |
| Existing engine or sections (kept) | Journey (compacted), Play, Hands-on, RhinoCode band, Explore, Shop, Schools, More | Explore engine | n/a | n/a | n/a | n/a |

The full classification (new, wrapper, revived, retired, page-local) is in `component-architecture.md`; this table only shows where each is used.

---

## 8. Important dependencies and risks

### 8.1 Risk register

| # | Item | Detail | Handling |
|---|---|---|---|
| 1 | **Explore and the menu are one data source** | The homepage Explore "By site menu" view is built from the navigation list; removing a menu entry removes that page's items from the view. | The navigation data contract (8.3). |
| 2 | **Proof content for Schools** | Proof figures and photographs must be true and supplied by management. | The proof row is left as a placeholder in the specification; nothing is invented. |
| 3 | **Studio screenshots** | The Coding & Robotics launcher needs current screenshots. | They can be generated from the running studios; they must be refreshed when a studio changes. |
| 4 | **Navy hub for Coding** | A dark band is a departure from the all-light site. | It is limited to one band on one hub. If management prefers all-light, the band becomes a tinted light band with no other change. |
| 5 | **Play pull request** | The two-column Play (pull request #30) is not yet merged. | The homepage spec assumes it. Hands-on stays separate (1.2a). |
| 6 | **Printed QR links** | `/q/n1-t{T}-w{W}` must never change. | No route in this document touches them. |
| 7 | **Licensing of existing photographs** | File names suggest third-party stock sources; licences are not verified. | The specification removes most stock photographs; confirm licences for any that remain. |
| 8 | **Contrast** | The existing blue and soft text fail on the pale tint; the signature blue fails with white text. | Resolved in the design system section 4.1: brand blue for graphics, action blue `#116eb1` for text and buttons. |
| 9 | **Thin content** | Many libraries hold zero to three items. | Compact headers and honest empty states; no layout depends on volume. |
| 10 | **Auto-advance removal** | The hero carousel and Schools story rotator stop auto-advancing. | Stated as a design rule; management should confirm. |
| 11 | **Protected areas** | Think • Move • Code! reads shared tokens about 139 times; a value change would reach it. | Additive tokens and regression testing (`phase-0-design-system.md` section 7). |
| 12 | **Safe-area insets** | The layout does not declare `viewport-fit=cover`, so inset values would be zero. | Implementation requirement noted in 5.14. |

### 8.2 Protected areas

The six pages in this document sit outside Rhinox Code Studio and Think • Move • Code!. They link to those areas and show screenshots or previews of them. They do not edit them. All shared-token changes follow `phase-0-design-system.md` section 7.

### 8.3 Navigation data contract (protects the Explore engine)

**What depends on what today**

| Piece | File | Role |
|---|---|---|
| Menu structure | `lib/site-navigation.ts` | Defines the site menu and the groups the Explore "By site menu" view displays |
| Item-to-destination map | `lib/menu-destinations.ts` | Lists each content item under exactly one destination page |
| Counts | `lib/menu-counts.ts` | Live counts shown in the menu and in Explore |
| Engine | `app/components/home/ExploreRhinox.tsx` | Reads all of the above; reads the URL parameters `menu`, `dest`, `explore` |

A change to the menu data therefore changes Explore. A menu restructure was attempted and **closed unmerged** for exactly this reason (the branch is kept).

**Contract: what must be true before any menu restructure starts**

1. **A "hidden in header, still in Explore" flag** exists in the navigation data, so an entry can leave the header without leaving Explore.
2. **A reachability snapshot test** records every item and destination Explore reaches today; the test fails if any is lost after a change.
3. **The existing navigation test** (`scripts/test-site-navigation.mjs`) passes and is extended to cover the flag.
4. **URL parameters stay valid.** `menu`, `dest` and `explore` links, including any bookmarked or shared, keep working. Renamed or moved entries get a redirect or an alias; they are not simply dropped.
5. **Counts stay correct.** The menu count and the Explore count for every destination match the content index before and after.
6. **Every destination keeps exactly one listing page**, as `menu-destinations.ts` requires.
7. **Explore is previewed on its own** with the restructure, at desktop and phone width, before approval.
8. **Separate approval.** The restructure is its own pull request with its own approval; it is not bundled with any page redesign.

**What this means for the Phase 1 pages**

- None of the six pages requires a menu change. The Education index, the Resources type grid and the Coding launcher link to existing routes and read counts from the existing count module.
- The Explore page redesign changes layout around the engine only (2.13).
- The recommended order (question 10) is: page redesign first, menu restructure afterwards, and only after the contract above is met.

---

## 9. Questions requiring management decisions

1. ~~**Signature blue.**~~ **Resolved in revision 2.** `#168fe5` stays as the brand colour (graphics, bands, marks, large text). Text, links and primary buttons use the action blue `#116eb1` (5.40:1 with white). No decision needed unless management wants a different action blue.
2. **Navigation call-to-action.** Keep the navy header button (as in the Apple-inspired draft) or use the action blue?
3. **Homepage.** Resolved in principle (1.2a): Journey is folded into the first band as the five-stage line; Play and Hands-on stay separate; no band is added. Management is asked to confirm (a) that the large rotating Journey panel is not carried over, and (b) the destinations of the four hero slides (1.13).
4. **Two-tone headline.** Keep as a brand device on the homepage and hubs only, or retire it everywhere?
5. **Auto-advancing content.** Agree to stop the hero carousel and the Schools rotator from advancing on their own?
6. **Schools proof.** Which two or three facts and which real photographs can Rhinox supply?
7. **Education index.** Agree to show three destinations (STEM & STEAM, Think • Move • Code!, Teacher & Parent Resources) with Books and Coding & Robotics as "also see" links?
8. **Dark Coding band.** Accept one dark band on the Coding & Robotics hub?
9. **Pull requests #23 and #24.** Which is the baseline for the shell (the audit and these documents assume the Apple-inspired one)?
10. **Menu cleanup order.** Confirm that the menu restructure comes after the page redesign and only after the navigation data contract (8.3) is met.
11. **Hero slide destinations.** All four slides currently go to `/explore`. Keep, or send each to its own area (1.13)?
12. **Copy updates for official names.** Approve changing "Open RhinoCode" to "Start coding" and "Make a game" to "Open Game Creator" (same destinations), and the menu label "RhinoCode Game Creator" to "Game Creator".
