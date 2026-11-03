# Rhinox Scientifica: Phase 1 Low-Fidelity Wireframes

| | |
|---|---|
| **Status** | Design planning only. Revision 2, after management review. These are layout diagrams, not final designs. |
| **Date** | 3 November 2026 |
| **Pages** | Homepage, Explore, Education, Resources, Schools, Coding & Robotics |
| **Companion** | `phase-1-core-pages.md` (full specifications) and `phase-0-design-system.md` (tokens) |

### Revision history

| Revision | Date | Change |
|---|---|---|
| 1 | 3 November 2026 | First issue: desktop (1440) and mobile (390) for six pages. |
| 2 | 3 November 2026 | Targeted revision. Homepage band 1 now shows the existing five-stage Rhinox Journey in place of the withdrawn five-door strip; Hands-on is a separate band (no longer "if kept"). Official product names (RhinoBot, Game Creator, Rhinox Code Studio). Schools persistent button shown with safe-area and dismissal notes. **Tablet (768) and intermediate (1100) wireframes added for all six pages (section 7).** Colour annotations use brand blue and action blue. |

## How to read these diagrams

- Each page has a **desktop view at 1440 px** (container 1240 px) and a short **mobile view at 390 px**. Section 7 adds a **tablet view at 768 px** and an **intermediate view at 1100 px** for every page.
- Colour notes: the brand blue (`#168fe5`) is used for graphics and bands, never for small text or behind white text; links and primary buttons use the action blue (`#116eb1`).
- Boxes are labelled blocks. `[ ]` marks something interactive. `{ }` marks live content that comes from the site's content (nothing is typed by hand).
- Heights are indicative, not exact.
- Every page includes the same **Header** and **Footer** (shown in short form). Everything between them is page-specific.
- Labels in capitals: **HEADER**, **NAV**, **HERO**, **MAIN**, **SUPPORT**, **CTA**, **FOOTER**.
- The six diagrams are deliberately different shapes. Section 8 compares them.
- Page family (composition rule), page purpose (what the page is for) and component (reusable piece) are defined in `phase-0-design-system.md` section 5.0. A wireframe shows a *page-local composition* built from components.

---

## 1. Homepage: "Editorial bands"

A centred statement with the five-stage Rhinox Journey line beneath it, then bands that each have a different shape. Eight bands, one dark band. No band is added to the current homepage; the Journey moves into band 1.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v  Resources v  About|
|                                                                      [ Get Started ]            |
+==================================================================================================+
|                                                                                                  |
| HERO (statement, centred, pale tint)                                                             |
|                                       SCIENCE . TECHNOLOGY . EDUCATION                           |
|                          Everything you need                                                     |
|                          to learn, build and create.                                             |
|                      One sentence of lead text, centred, 17px.                                   |
|                         [ Explore Rhinox ]   [ Shop & Discover ]                                 |
|                                                                                                  |
| NAV (existing Rhinox Journey, one line, five stages, each a link)                                |
| +-------------+-------------+-------------+-------------+-------------+                          |
| | DISCOVER    | LEARN       | PRACTISE    | BUILD       | CREATE      |                          |
| | idea line   | idea line   | idea line   | idea line   | idea line   |                          |
| | /resources  | /education  | /explore    | /explore/   | /explore/   |                          |
| |             |             |             |  project-lab|  stem-chall.|                          |
| +-------------+-------------+-------------+-------------+-------------+                          |
|  (hero slides: four quiet labelled links, paused, below the line)                                |
+--------------------------------------------------------------------------------------------------+
| MAIN 1: PLAY (two columns)                                                                       |
| +------------------------------------------+  +----------------------------------------------+   |
| | {Open experience, large preview}         |  | Play                                         |   |
| |  badge: Interactive lesson               |  | Learn by doing, starting right now           |   |
| |  +------------------------------------+  |  | [Featured][Games][Coding][Robotics] ...      |   |
| |  |       screenshot (product preview) |  |  | v {Row 1 - open}  description, pills        |   |
| |  +------------------------------------+  |  | > {Row 2}                                    |   |
| |  Title                    [ Start now ]  |  | > {Row 3}   > {Row 4}   > {Row 5}            |   |
| +------------------------------------------+  | See all experiences ->                       |   |
|                                               +----------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
| MAIN 2: HANDS-ON (separate from Play; full width, two live previews with captions)               |
| +-----------------------------------------+   +-----------------------------------------+        |
| | {Live: Solar System Explorer}           |   | {Live: Robot Maze Coder}                |        |
| | caption                    [ Open ]     |   | caption                    [ Open ]     |        |
| +-----------------------------------------+   +-----------------------------------------+        |
+--------------------------------------------------------------------------------------------------+
| MAIN 3: CODE (the only dark band, navy)                                                          |
| #################################################################################################|
| # RhinoCode                                              +------------------------------------+ #|
| # Code a robot. Build a game.                            |  {Live maze preview}               | #|
| # [ Start coding ]  [ Open Game Creator ]                +------------------------------------+ #|
| #################################################################################################|
+--------------------------------------------------------------------------------------------------+
| MAIN 4: EXPLORE (header + topic tabs + three result columns)                                     |
| Explore Rhinox                                          [ Search ........................ ]      |
| [By topic] [By site menu]                                                                        |
| {Result}   {Result}   {Result}      {Result}   {Result}   {Result}                               |
+--------------------------------------------------------------------------------------------------+
| SUPPORT 1: SHOP (horizontal rail, the six existing showcase items)                               |
| Shop                                                                              See the shop ->|
| [{Featured book}][Coding & Robotics Kits][Glassware & Plasticware][Teacher's Training][Digital..]|
+--------------------------------------------------------------------------------------------------+
| SUPPORT 2: SCHOOLS (proof row, no photograph)                                                    |
|   {Figure 1}          {Figure 2}          {Figure 3}   <- supplied by management; omit if none   |
|   One statement line about schools.                                [ Request a quote ]           |
+--------------------------------------------------------------------------------------------------+
| SUPPORT 3: MORE FROM RHINOX (list left, plain rows right)                                        |
| Articles / Videos / Downloads  ->           My Rhinox: Library, Badges, Certificates   About     |
+--------------------------------------------------------------------------------------------------+
| FOOTER   sitemap columns  |  contact  |  legal                                                   |
+==================================================================================================+
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
+------------------------+
| HERO  eyebrow          |
| Everything you need    |
| to learn, build ...    |
| lead                   |
| [ Explore Rhinox ]     |
| [ Shop & Discover ]    |
+------------------------+
| JOURNEY (vertical list)|
| Discover  idea      >  |
| Learn     idea      >  |
| Practise  idea      >  |
| Build     idea      >  |
| Create    idea      >  |
+------------------------+
| PLAY heading + chips   |
| accordion rows         |
| large card (below)     |
+------------------------+
| HANDS-ON two previews  |
| (stacked)              |
+------------------------+
| CODE (navy) text,      |
| maze below             |
+------------------------+
| EXPLORE (filters btn,  |
| one column)            |
+------------------------+
| SHOP rail (scroller)   |
+------------------------+
| SCHOOLS figures stack  |
| [ Request a quote ]    |
+------------------------+
| MORE rows stack        |
+------------------------+
| FOOTER                 |
+------------------------+
```

---

## 2. Explore: "Workbench"

A tool, not a hero. Search on top, a topic rail on the left, results on the right.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v ...  [Get Started] |
+==================================================================================================+
| HERO (compact header, 120px, white)                                                              |
| EXPLORE                                                                                          |
| Explore Rhinox                                                         {n}               |
| One line: find any experience, lab, game, project or resource.                                   |
+--------------------------------------------------------------------------------------------------+
| NAV (search row)                                                                                 |
| [ Search ........................................................ ]   Sort: [ Easiest first v ] |
+--------------------------------------------------------------------------------------------------+
| MAIN                                                                                             |
| +-------------------------+  +------------------------------------------------------------------+|
| | NAV (left rail, sticky) |  | RESULTS                                          Showing {n}    ||
| | [By topic] [Site menu]  |  | +--------------------------------------------------------------+ ||
| |                         |  | | (thumb) {Title}                         Interactive . 10 min | ||
| | v Learning        {n}  |  | |         {one line}                          Beginner   ->     | ||
| |     STEM & STEAM  {n}  |  | +--------------------------------------------------------------+ ||
| |     Teacher Res.  {n}   |  | | (thumb) {Title}                         Virtual lab . 15 min | ||
| | > Technology      {n}   |  | |         {one line}                          Beginner   ->     | ||
| | v Experiences     {n}  |  | +--------------------------------------------------------------+ ||
| |     Games         {n}   |  | | (thumb) {Title}                                              | ||
| | > Virtual Labs    {n}  |  | +--------------------------------------------------------------+ ||
| | > Projects        {n}   |  |   ... (list continues)                                          ||
| |                         |  |                                                                  ||
| | Filters                 |  |  [ Load more ]                                                   ||
| |  Age  [ v ]  Level [ v ]|  |                                                                  ||
| |  [ Reset ]              |  |                                                                  ||
| +-------------------------+  +------------------------------------------------------------------+|
+--------------------------------------------------------------------------------------------------+
| SUPPORT (one row)   Can't find it?  Ask the team ->                                              |
+--------------------------------------------------------------------------------------------------+
| FOOTER                                                                                           |
+==================================================================================================+
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
+------------------------+
| EXPLORE                |
| Explore Rhinox  {n}  |
+------------------------+
| [ Search .......... ]  |  (sticky)
| [ Topics v ] [ Sort v ]|
| chip: Technology  (x)  |
+------------------------+
| RESULTS (one column)   |
| (64px) {Title}         |
|        Interactive 10m |
| (64px) {Title}         |
| ...                    |
| [ Load more ]          |
+------------------------+
| Ask the team ->        |
+------------------------+
| FOOTER                 |
+------------------------+

[Topics v] opens a full-height sheet containing the topic tree and filters.
```

---

## 3. Education: "Table of contents"

No hero and no photograph. A large typographic index. A narrow band for adults.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v ...  [Get Started] |
+==================================================================================================+
| NAV   Home / Education                                                                           |
+--------------------------------------------------------------------------------------------------+
| HERO (compact header, 140px, white)                                                              |
| RHINOX EDUCATION                                                                                 |
| Learning that starts with doing.                                                                 |
| One line.                                                                                        |
+--------------------------------------------------------------------------------------------------+
| MAIN (the index: full-width rows, hairlines between)                                             |
|                                                                                                  |
|  01   STEM & STEAM Education                                                   {n}   ->   |
|       Practical lessons and activities in science, technology, engineering, arts and maths.      |
| ------------------------------------------------------------------------------------------------ |
|  02   Think • Move • Code!                                                  {Nursery 1}     ->   |
|       The book series and its weekly lessons, games and printables.                              |
| ------------------------------------------------------------------------------------------------ |
|  03   Teacher & Parent Resources                                               {n items}    ->   |
|       Resources to support learning at school and at home.                                       |
| ------------------------------------------------------------------------------------------------ |
|  Also see:  Books (in the Shop) ->      Coding & Robotics ->                         |
+--------------------------------------------------------------------------------------------------+
| SUPPORT (pale tint band: for adults, accordion)                                                  |
| For teachers and parents                                                                         |
| v Teacher resources        {n}   (open)  short description, [ Open ]                             |
| > Parent resources         {n}                                                                   |
| > Worksheets and assessments {n}                                                                 |
+--------------------------------------------------------------------------------------------------+
| CTA   Teaching a class? Talk to us about training.                    [ Teacher training ]       |
+--------------------------------------------------------------------------------------------------+
| FOOTER                                                                                           |
+==================================================================================================+
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
| Home / Education       |
+------------------------+
| RHINOX EDUCATION       |
| Learning that starts   |
| with doing.            |
+------------------------+
| 01  STEM & STEAM       |
|     description        |
|     {n}     ->  |
| ---------------------- |
| 02  Think • Move •Code!|
|     description        |
|     {Nursery 1}    ->  |
| ---------------------- |
| 03  Teacher & Parent   |
|     description        |
|     {n items}      ->  |
| ---------------------- |
| Also see: Books, Code  |
+------------------------+
| For adults (accordion) |
| v Teacher resources    |
| > Parent resources     |
| > Worksheets           |
+------------------------+
| Teaching a class?      |
| [ Teacher training ]   |
+------------------------+
| FOOTER                 |
+------------------------+
```

---

## 4. Resources: "Library index"

Search first, then three typed columns that show the newest item of each type.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v ...  [Get Started] |
+==================================================================================================+
| HERO (search band, pale tint, 200px)                                                             |
| RHINOX RESOURCES                                                                                 |
| Keep learning beyond the classroom.                                                              |
|   +--------------------------------------------------------------------+                         |
|   | [ Search articles, videos and downloads ........................ ] |   (60px field)          |
|   +--------------------------------------------------------------------+                         |
|   (All) (Articles) (Videos) (Downloads)                                                          |
+--------------------------------------------------------------------------------------------------+
| MAIN (three columns, hairlines between, no boxes)                                                |
|                                                                                                  |
|  ARTICLES  {n}                  | VIDEOS  {n}                   | FREE DOWNLOADS  {n}            |
|  ----------------------------   | ----------------------------- | ------------------------------ |
|  Newest                         | Newest                        | Newest                         |
|  {Article title}                | (thumb) {Video title}         | [PDF] {Download title}         |
|  {one line}                     | {one line}                    | {one line . size}              |
|                                 |                               |                                |
|  See all articles ->            | See all videos ->             | See all downloads ->           |
+--------------------------------------------------------------------------------------------------+
| SUPPORT (My Rhinox strip, one row, plain links)                                                  |
| MY RHINOX    Library (Coming soon)      Badges (Coming soon)      Certificates (Coming soon)     |
+--------------------------------------------------------------------------------------------------+
| CTA   Want a topic covered? Tell us.                                         [ Suggest a topic ] |
+--------------------------------------------------------------------------------------------------+
| FOOTER                                                                                           |
+==================================================================================================+
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
+------------------------+
| RHINOX RESOURCES       |
| Keep learning beyond   |
| the classroom.         |
| [ Search ........... ] |
| (All)(Articles)(Vid.)> |  (scrolls sideways)
+------------------------+
| ARTICLES  {n}          |
| {Newest article}       |
| See all ->             |
| ---------------------- |
| VIDEOS  {n}            |
| (thumb) {Newest video} |
| See all ->             |
| ---------------------- |
| FREE DOWNLOADS  {n}    |
| [PDF] {Newest}         |
| See all ->             |
+------------------------+
| MY RHINOX (3 rows)     |
+------------------------+
| [ Suggest a topic ]    |
+------------------------+
| FOOTER                 |
+------------------------+
```

---

## 5. Schools & Institutions: "Proposal document"

One long argument. A sticky section index on the left, a persistent "Request a quote" button with safe-area and dismissal behaviour, no photographs.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v ...  [Get Started] |
+==================================================================================================+
| NAV   Home / Schools & Institutions                                                              |
+--------------------------------------------------------------------------------------------------+
| HERO (plain, left-aligned, white, 720px text column)                                             |
| SCHOOLS & INSTITUTIONS                                                                           |
| STEM solutions for schools and institutions.                                                     |
| Two sentences on what Rhinox does for a school.                                                  |
| [ Request a quote ]   [ Talk to us ]                                                             |
+--------------------------------------------------------------------------------------------------+
| SUPPORT (proof row, pale tint)        <- content supplied by management                          |
|    {Figure}            {Figure}             {Figure}                                             |
|    short caption       short caption        short caption                                        |
+--------------------------------------------------------------------------------------------------+
| MAIN (two columns: sticky index + long body)                                                     |
| +--------------------+   +-----------------------------------------------------------------+     |
| | NAV (sticky)       |   | WHAT WE OFFER                                                    |     |
| |                    |   |  STEM School Solutions   One-line outcome              Details ->|     |
| | | What we offer    |   |  --------------------------------------------------------------- |     |
| |   How we work      |   |  Laboratory Solutions    One-line outcome              Details ->|     |
| |   Request a quote  |   |  --------------------------------------------------------------- |     |
| |                    |   |  Coding & Robotics       One-line outcome              Details ->|     |
| |                    |   |  --------------------------------------------------------------- |     |
| |                    |   |  STEM Clubs  (pilot)     One-line outcome              Details ->|     |
| |                    |   |  --------------------------------------------------------------- |     |
| |                    |   |  Teacher Training        One-line outcome              Details ->|     |
| |                    |   |                                                                  |     |
| |                    |   | HOW WE WORK  (one horizontal line)                               |     |
| |                    |   |  (1) Consult --- (2) Plan --- (3) Deliver --- (4) Support        |     |
| |                    |   |   sentence        sentence      sentence        sentence         |     |
| +--------------------+   +-----------------------------------------------------------------+     |
+--------------------------------------------------------------------------------------------------+
| CTA (pale tint, full width)                                                                      |
| REQUEST A QUOTE   Tell us what your institution needs.    [ Request a quote ]   phone . email   |
+--------------------------------------------------------------------------------------------------+
| FOOTER                                                                                           |
+==================================================================================================+
   Persistent enquiry button (appears after the first screen, bottom right): [ Request a quote ] [x]
   Hides when the request band is in view, when a form field has focus, near the footer, or after [x].
   Full rules: phase-1-core-pages.md section 5.14.
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
| Home / Schools         |
+------------------------+
| SCHOOLS & INSTITUTIONS |
| STEM solutions for     |
| schools and institut.. |
| [ Request a quote ]    |
| [ Talk to us ]         |
+------------------------+
| (What we offer)(How)(Req)>  <- sticky chips
+------------------------+
| proof (stacked)        |
+------------------------+
| WHAT WE OFFER (rows)   |
| STEM School Solutions ->|
| Laboratory Solutions  ->|
| Coding & Robotics     ->|
| STEM Clubs            ->|
| Teacher Training      ->|
+------------------------+
| HOW WE WORK (vertical) |
| 1 Consult              |
| 2 Plan                 |
| 3 Deliver              |
| 4 Support              |
+------------------------+
| REQUEST (tint band)    |
+------------------------+
| FOOTER                 |
+------------------------+
| [ Request a quote ]  [x] |  fixed bar: 56px + safe-area inset
+------------------------+
| (home indicator area)  |  <- bar sits above this inset, never under it
+------------------------+
```

---

## 6. Coding & Robotics: "Launcher"

A dark product band with three studio windows, then a practice shelf and a resume strip.

```
+==================================================================================================+
| HEADER  [logo]   Education v  Explore v  Coding & Robotics v  Shop  Schools v ...  [Get Started] |
+==================================================================================================+
| HERO (navy band, full width)                                                                     |
| ################################################################################################ |
| # RHINOCODE                                                                                    # |
| # Learn to code by building and playing.                                                       # |
| # One line.                                                                                    # |
| #                                                                                              # |
| # +-----------------------+   +-----------------------+   +-----------------------+          # |
| # | (screenshot)          |   | (screenshot)          |   | (screenshot)          |          # |
| # | RhinoBot              |   | Game Creator          |   | Rhinox Code Studio    |          # |
| # | Robot Programming Lab |   |                       |   |                       |          # |
| # | one-line purpose      |   | one-line purpose      |   | one-line purpose      |          # |
| # | [ Open ]              |   | [ Open ]              |   | [ Open ]              |          # |
| # +-----------------------+   +-----------------------+   +-----------------------+          # |
| ################################################################################################ |
+--------------------------------------------------------------------------------------------------+
| NAV   Home / Coding & Robotics                                                                   |
+--------------------------------------------------------------------------------------------------+
| MAIN (practice shelf, horizontal)                                                                |
| GAME CHALLENGES                                                          See all challenges ->   |
| [ {Challenge tile} ] [ {Challenge tile} ] [ {Challenge tile} ]   <  >                           |
+--------------------------------------------------------------------------------------------------+
| SUPPORT 1 (resume strip, one row)                                                                |
| MY PROJECTS   {Last saved: "Maze 2", yesterday}                                  [ Reopen ]      |
|               or: Nothing saved yet. Start in a studio.                                          |
+--------------------------------------------------------------------------------------------------+
| SUPPORT 2 (how it works, one line)                                                               |
| Think  ->  Code  ->  Run  ->  Improve        (one sentence each, below the arrows)               |
+--------------------------------------------------------------------------------------------------+
| CTA   Teaching coding at school?                                       [ For schools ]           |
+--------------------------------------------------------------------------------------------------+
| FOOTER                                                                                           |
+==================================================================================================+
```

**Mobile (390 px)**

```
+------------------------+
| HEADER  [logo]   [=]   |
+------------------------+
| ###################### |
| # RHINOCODE          # |
| # Learn to code by   # |
| # building and       # |
| # playing.           # |
| # +----------------+ # |
| # | (screenshot)   | # |
| # | RhinoBot  [Open]|# |
| # +----------------+ # |
| # | (screenshot)   | # |
| # | Game Creator   | # |
| # |           [Open]|# |
| # +----------------+ # |
| # | Rhinox Code     | # |
| # |           [Open]|# |
| # +----------------+ # |
| ###################### |
+------------------------+
| Home / Coding & Robot. |
| GAME CHALLENGES  (->)  |
| [tile][tile][tile] >   |
+------------------------+
| MY PROJECTS  [Reopen]  |
+------------------------+
| Think > Code > Run >   |
| Improve (vertical)     |
+------------------------+
| [ For schools ]        |
+------------------------+
| FOOTER                 |
+------------------------+
```

---

## 7. Tablet (768 px) and intermediate (1100 px) wireframes

Tablet is shown at 768 px (portrait tablet, container fluid with 24 px gutters). Intermediate is shown at 1100 px (small laptop or landscape tablet, container fluid, not yet 1240 px). Desktop and phone views above still apply at their widths. Written specifications are in each page's "Tablet and intermediate widths" subsection of `phase-1-core-pages.md`.

### 7.1 Homepage

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| HEADER [logo]                  [=]   |        | HEADER [logo]  Education v Explore v ... [Get Started]   |
+--------------------------------------+        +----------------------------------------------------------+
| STATEMENT (centred, 40px display)    |        | STATEMENT (centred, display one step down)               |
| lead   [Explore Rhinox] [Shop&Disc.] |        | lead        [Explore Rhinox] [Shop & Discover]           |
| JOURNEY (two rows)                   |        | JOURNEY (one row, min 180px each, idea in 2 lines)       |
| [Discover][Learn][Practise]          |        | [Discover][Learn][Practise][Build][Create]               |
| [Build   ][Create          ]         |        +----------------------------------------------------------+
+--------------------------------------+        | PLAY (two columns, large 55% / accordion 45%)            |
| PLAY (stacked)                       |        | [ large experience ]   | Play, chips, accordion          |
| [ large experience ]                 |        +----------------------------------------------------------+
| Play, chips, accordion               |        | HANDS-ON (two previews side by side)                     |
+--------------------------------------+        +----------------------------------------------------------+
| HANDS-ON (previews stacked)          |        | CODE (navy): text left | maze right                      |
+--------------------------------------+        +----------------------------------------------------------+
| CODE (navy) text, maze below         |        | EXPLORE: rail 220px | results in 2 columns               |
+--------------------------------------+        +----------------------------------------------------------+
| EXPLORE: [Topics] button, 2 columns  |        | SHOP rail (3.5 items visible)                            |
+--------------------------------------+        +----------------------------------------------------------+
| SHOP rail (2.5 items visible)        |        | SCHOOLS proof row + statement + [Request a quote]        |
+--------------------------------------+        +----------------------------------------------------------+
| SCHOOLS  | MORE (stacked)            |        | MORE (two parts side by side)                            |
+--------------------------------------+        +----------------------------------------------------------+
```

### 7.2 Explore

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| EXPLORE   Explore Rhinox   {n}       |        | EXPLORE   Explore Rhinox                       {n}       |
| [ Search ................ ] (sticky) |        | [ Search ................................ ] Sort [v]   |
| [ Topics ]  chip: Technology (x)     |        +-------------------+--------------------------------------+
+--------------------------------------+        | rail 220px sticky | RESULTS (2 columns of rows)          |
| RESULTS (1 column of rows,           |        | [By topic][Menu]  | (thumb) {Title}   (thumb) {Title}    |
|  64px thumbnails)                    |        | v Learning   {n}  | (thumb) {Title}   (thumb) {Title}    |
| (thumb) {Title}  Interactive 10 min  |        | > Technology {n}  | [ Load more ]                        |
| (thumb) {Title}                      |        | Filters           |                                      |
| [ Load more ]                        |        +-------------------+--------------------------------------+
+--------------------------------------+
[Topics] opens a left sheet, 360px, with the topic tree, the By-site-menu tab and filters.
```

### 7.3 Education

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| Home / Education                     |        | Home / Education                                         |
| RHINOX EDUCATION                     |        | RHINOX EDUCATION  Learning that starts with doing.       |
| Learning that starts with doing.     |        +----------------------------------------------------------+
+--------------------------------------+        | 01  STEM & STEAM Education        description    {n}  -> |
| 01  STEM & STEAM Education  {n}  ->  |        | -------------------------------------------------------- |
|     description (below title)        |        | 02  Think • Move • Code!          description {Nursery 1}->|
| ------------------------------------ |        | -------------------------------------------------------- |
| 02  Think • Move • Code!            ->|       | 03  Teacher & Parent Resources    description  {n items} -> |
| ------------------------------------ |        | Also see: Books -> | Coding & Robotics ->                |
| 03  Teacher & Parent Resources      ->|       +----------------------------------------------------------+
| Also see (two links in a row)        |        | FOR ADULTS (tint) accordion in an 880px column           |
+--------------------------------------+        +----------------------------------------------------------+
| FOR ADULTS accordion, full width     |        | Teaching a class?                  [ Teacher training ]  |
| Teaching a class? [Teacher training] |        +----------------------------------------------------------+
+--------------------------------------+
```

### 7.4 Resources

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| RHINOX RESOURCES                     |        | RHINOX RESOURCES  Keep learning beyond the classroom.    |
| Keep learning beyond the classroom.  |        | [ Search articles, videos and downloads ........ ]       |
| [ Search ................ ]          |        | (All)(Articles)(Videos)(Downloads)                       |
| (All)(Articles)(Videos)(Downloads)   |        +----------------------------------------------------------+
+--------------------------------------+        | ARTICLES {n}   | VIDEOS {n}      | FREE DOWNLOADS {n}    |
| ARTICLES {n}                         |        | newest item    | newest item     | newest item           |
|  {Newest}              See all ->    |        | See all ->     | See all ->      | See all ->            |
| ------------------------------------ |        | (three columns, each at least 280px)                     |
| VIDEOS {n}                           |        +----------------------------------------------------------+
|  (thumb) {Newest}      See all ->    |        | MY RHINOX  Library | Badges | Certificates              |
| ------------------------------------ |        | Want a topic covered?          [ Suggest a topic ]       |
| FREE DOWNLOADS {n}                   |        +----------------------------------------------------------+
|  [PDF] {Newest}        See all ->    |
| MY RHINOX (three in a row)           |
| [ Suggest a topic ]                  |
+--------------------------------------+
```

### 7.5 Schools & Institutions

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| Home / Schools                       |        | Home / Schools & Institutions                            |
| SCHOOLS & INSTITUTIONS               |        | STEM solutions for schools and institutions.             |
| STEM solutions for schools ...       |        | [ Request a quote ] [ Talk to us ]                       |
| [ Request a quote ] [ Talk to us ]   |        +----------------------------------------------------------+
+--------------------------------------+        | proof row (three, supplied by management)                |
| ON THIS PAGE (sticky strip, chips)   |        +--------------+-------------------------------------------+
| (What we offer)(How we work)(Request)|        | index 200px  | WHAT WE OFFER (rows)                      |
+--------------------------------------+        | sticky       | HOW WE WORK (four in one row)             |
| proof (up to three in a row)         |        +--------------+-------------------------------------------+
| WHAT WE OFFER (rows with arrow)      |        | REQUEST band: button | contact details side by side      |
| HOW WE WORK (2 x 2 grid)             |        +----------------------------------------------------------+
| REQUEST band                         |                                         [ Request a quote ] [x]
+--------------------------------------+                                         (right-anchored button)
|                [Request a quote] [x] |
|  (220px wide, bottom right, above    |
|   the home-indicator inset)          |
+--------------------------------------+
```

### 7.6 Coding & Robotics

```
TABLET 768                                      INTERMEDIATE 1100
+--------------------------------------+        +----------------------------------------------------------+
| ################################## # |        | ######################################################## |
| # RHINOCODE                        # |        | # RHINOCODE  Learn to code by building and playing.    # |
| # Learn to code by building and    # |        | # +-----------+ +-----------+ +-----------+            # |
| # playing.                         # |        | # |(screenshot)| |(screenshot)| |(screenshot)|           # |
| # [ RhinoBot ][ Game Creator ][...]# |        | # | RhinoBot   | | Game       | | Rhinox Code|           # |
| #  scroll-snap row, ~1.5 windows   # |        | # | [Open]     | | Creator    | | Studio     |           # |
| ################################## # |        | # |            | | [Open]     | | [Open]     |           # |
+--------------------------------------+        | # +-----------+ +-----------+ +-----------+            # |
| Home / Coding & Robotics             |        | ######################################################## |
| GAME CHALLENGES  scroller < >        |        +----------------------------------------------------------+
| MY PROJECTS  [Reopen]                |        | GAME CHALLENGES (three tiles visible)    See all ->      |
| Think > Code (2 x 2 grid)            |        | MY PROJECTS  [Reopen]                                    |
| Run   > Improve                      |        | Think -> Code -> Run -> Improve (one row)                |
| [ For schools ]                      |        | Teaching coding at school?         [ For schools ]       |
+--------------------------------------+        +----------------------------------------------------------+
```

---

## 8. Six-page comparison

| | Homepage | Explore | Education | Resources | Schools | Coding & Robotics |
|---|---|---|---|---|---|---|
| **Shape** | Stacked bands of different forms | Sidebar plus results | Full-width index | Search band plus three columns | Sticky index plus long body | Dark launcher plus shelves |
| **First screen** | Centred statement and Journey line | Compact title, search and results | Compact title and numbered rows | Large search field | Left-aligned statement and two buttons | Navy band with three studio windows |
| **Hero** | `statement` | none (`PageHeader`) | none (`PageHeader`) | `PageHeader` with search | `plain` | `feature` (dark) |
| **Photograph** | none | thumbnails only | none | thumbnails only | none (optional real photo once) | none (real screenshots) |
| **Dark band** | one (Code) | none | none | none | none | one (hero) |
| **Columns** | varies by band | 3 + 9 grid | 1 (full width rows) | 3 equal | 3 + 9 grid, sticky | 3 equal windows |
| **Choosing device** | Five Journey stages | Search and topic tree | Numbered rows | Search and typed columns | Scroll and sticky index | Open a studio |
| **Persistent element** | none | sticky rail and search | none | none | "Request a quote" button (safe-area aware, dismissible) | none |
| **Primary action** | Explore Rhinox | Open an item | First row | Search | Request a quote | Open (per studio) |
| **Mobile first element** | Statement | Search (sticky) | Numbered rows | Search | Statement and chips | Studio windows |

What the six share is deliberate: the same header and footer, the same tokens (colour, type, radius, spacing), the same focus and motion rules, and the same breadcrumb pattern where one is shown. What differs is composition.

## 9. Notes

- **Nothing in these diagrams invents content.** Counts shown as `{n}` come from the content system. The proof figures on the Schools page and any real photograph must be supplied by management.
- **Live elements** (the maze, the solar system, the explore engine) stay as built; the diagrams show only where they sit.
- **Think • Move • Code! and Rhinox Code Studio** are protected areas. They are not shown or changed here. The Coding & Robotics launcher links to Rhinox Code Studio, and the Education page links to the Think • Move • Code! home, as they already exist (`phase-0-design-system.md` section 7).
- **Navigation data.** None of these pages needs a menu change. The Explore page keeps the engine and its navigation data dependencies (`phase-1-core-pages.md` section 8.3).
