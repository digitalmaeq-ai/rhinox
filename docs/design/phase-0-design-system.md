# Rhinox Scientifica: Phase 0 Design System

| | |
|---|---|
| **Status** | Design planning only. Revision 2, after management review (direction accepted). Nothing here has been implemented. |
| **Date** | 3 November 2026 |
| **Builds on** | `docs/design/full-site-design-audit.md` (approved as the foundation) |
| **Companion documents** | `component-architecture.md`, `phase-1-core-pages.md`, `phase-1-wireframes.md` |
| **Scope** | Visual identity, design tokens, the nine page families. Rhinox Code Studio and Think • Move • Code! are not redesigned in this phase and are protected (section 7). |

### Revision history

| Revision | Date | Change |
|---|---|---|
| 1 | 3 November 2026 | First issue. |
| 2 | 3 November 2026 | Targeted revision after management accepted the direction. No new visual direction. (1) Signature blue `#168fe5` kept as the brand accent; a separate accessible action blue is used for text and primary buttons (4.1, 4.7). (3) Official product names standardised (section 9). (4) Protected-area preservation and regression-testing rules strengthened (section 7). (7) Page family, page purpose and component defined (5.0). (8) Tablet and intermediate-width rules added (4.11). (9) Navigation data contract added (section 10). Items 2, 5, 6 and 10 are specified in `phase-1-core-pages.md` and `component-architecture.md`. |

---

## 1. Summary of the proposed direction

Keep the approved **Apple-inspired, compact, premium** direction and make it enforceable. The audit found the site's repetition comes from template reuse, not from a missing style. So this design system gives **rules, not adjectives**: a small number of fixed choices for colour, radius, shadow, spacing and type, and a different composition for each kind of page.

The five rules that matter most:

1. **Flat and precise.** White and one pale tint as surfaces. Edges are 1-pixel borders. Shadow is used only for things that float (menus, popovers, dialogs).
2. **Few radii.** Three corner sizes plus a pill. The site has **662** corner-radius declarations today, 53 of them 20 pixels or larger, and at least ten distinct values. This is the main source of the "over-rounded cards" look.
3. **No decorative gradients or patterns.** The stylesheets contain **205** gradient declarations (157 linear, 48 radial). Gradients stay only where they do a job (a scrim behind text on a photograph).
4. **One hero rule.** The large two-column hero with a photo on the right belongs to at most one page type. Every other page uses a header that fits its job.
5. **Content before decoration.** A page shows the real thing (a lesson preview, a product cover, a badge, a programme outline) rather than a stock photograph. A stock photograph appears at most once on a page.

---

## 2. What exists today (evidence)

The design is not undefined; it is over-defined and layered.

| Finding | Evidence |
|---|---|
| **Two token layers.** `app/globals.css` defines the tokens; `app/redesign.css` (173 lines, imported after it) overrides some of them. Components read whichever applies. | `:root` in both files |
| **Three blues in play.** `#0f6fde` (globals), `#1476db` (redesign override), and the owner's stated signature blue `#168fe5` (the "Get Started" button). Many component files also hard-code their own blues (`#0f6fde`, `#3b9bff`, `#0b3a73`). | Token files and module CSS |
| **Scattered breakpoints.** The most common is 640 pixels (47 uses), then 900 (21), 1100, 1024, 1050, 980, 860 and 520. | `@media (max-width: …)` counts |
| **Small type.** Body text is 14 pixels in the redesign layer; the navigation is 10 pixels; hero eyebrows are 9 pixels. | `redesign.css` |
| **Contrast gaps.** See section 4.1. | Computed ratios |
| **Section spacing varies.** Hero and section padding use many different `clamp()` values. | CSS survey |
| **Fonts are sound.** Manrope (headings) and Inter (body), self-hosted variable fonts, Latin subset. | `app/layout.tsx` |

The proposal therefore **consolidates** rather than replaces. Names of existing tokens (`--rx-blue`, `--rx-heading`, `--rx-space-*`, and so on) are kept so that adoption is a gradual change of values and rules, not a rewrite.

---

## 3. Visual identity

### 3.1 What the design must communicate, and how

| Quality | How the interface expresses it | What it rules out |
|---|---|---|
| **Scientific innovation** | Precise lines, measured spacing, real diagrams and data, monospace or tabular figures for numbers and codes | Generic decorative "tech" patterns, glows, particle backgrounds |
| **Modern educational technology** | Real product previews (a lesson, a lab, an editor), compact layouts, clear progress | Stock photos of students used as filler |
| **Professional credibility** | Restraint, consistent alignment, clear pricing and contact paths, honest empty states | Oversized hero text, vague promises |
| **Accessibility and simplicity** | AA contrast, 44-pixel touch targets, one primary action per section, plain language | Colour-only meaning, tiny text, hidden headings |
| **Creativity and discovery** | The learner's own work and the experiences themselves as the visuals; small moments of colour from the amber accent | Heavy animation, mascot clutter on informational pages |

### 3.2 Avoid list, turned into rules

| Avoid | Rule |
|---|---|
| Excessive rounded cards | Cards are used only when an item is a distinct object (product, experience, resource). Lists, rows and plain sections are unboxed. Corner radius follows section 4.5. A page may not nest a card inside a card. |
| Unnecessary gradients | No gradient as decoration. A text-over-photo scrim is allowed. The existing solid-blue stage in the Play section is replaced by a flat tint or a single solid colour. |
| Excessive decorative backgrounds | No grid, dot or ring patterns. Two page backgrounds only: white and the pale tint. |
| Repetitive two-column hero layouts | Section 5 and the wireframes assign a different composition to each page type. The split hero is restricted to one family. |
| Oversized empty space | Section padding follows the compact scale in section 4.4. A section that has fewer than three items uses a compact header, not a hero. |
| Excessive animation | Section 4.12. No auto-advancing content anywhere, including the homepage hero strip; no looping decoration. |
| Generic AI-generated aesthetic | Avoid: two-tone headline on every page, gradient blue panels, floating glass cards, identical icon-title-text triplets on every page, and stock-photo heroes. Prefer: real content previews, specific headings that say something true, and varied composition. |

### 3.3 Identity decisions that need confirmation

These are collected in the management questions in `phase-1-core-pages.md` and flagged where relevant below.

- ~~The signature blue~~ Resolved in revision 2: `#168fe5` stays as the brand accent and an accessible action blue handles text and buttons (section 4.1).
- Whether the navigation call-to-action stays navy.
- Whether the two-tone headline remains a brand device and on which pages.

---

## 4. Design tokens

Values below are the **effective values today** (after `redesign.css`) and the **proposed value** where the audit found a problem. Where nothing is proposed, the existing value is kept.

### 4.1 Colour

#### Brand and interface

Revision 2 separates **brand colour** from **action colour**. The signature blue `#168fe5` is kept and remains the visible face of the brand. It is not used for text or as the background of white text, because white on `#168fe5` is only 3.45:1. A darker blue of the same hue does that work.

| Token | Today | Proposed | Notes |
|---|---|---|---|
| `--rx-brand-blue` (new) | `#168fe5` (the "Get Started" button) | **`#168fe5`, unchanged** | The Rhinox signature blue. Use for: logo and brand marks, large shapes and bands, progress bars, selected-state indicators, icons 24 px and larger, focus-ring accents on dark surfaces, illustration fills. Contrast against white is 3.45:1 and against the page tint 3.20:1, which meets the 3:1 requirement for graphics and interface components. **Not** for body text, small text, or as the fill behind white text. Large text (24 px, or 18.66 px bold) may use it on white only. |
| `--rx-action` (new) | none (`--rx-blue` `#1476db` / `#0f6fde`) | **`#116eb1`** | Text links, primary-button fill, ghost-button text, focus outline. White on it is 5.40:1; on white 5.40:1; on the page tint `#f3f7fb` 5.02:1; on `#eaf3ff` 4.82:1. Same hue family as the brand blue, so the two read as one palette. |
| `--rx-action-hover` (new) | none | **`#0f639e`** | Hover and pressed state of `--rx-action`. 6.37:1 on white. |
| `--rx-blue` (existing) | `#1476db` (redesign) / `#0f6fde` (base) | **Keep its value for now** | Many files, including Think • Move • Code!, read this token. It is not changed in place (see section 7). Pages migrate to `--rx-action` one at a time; the old token is retired only after nothing reads it. |
| `--rx-blue-bright` | `#42a0ff` / `#3b9bff` | `#3b9bff` | Highlights and dark-surface accents only. Not for text on white. 5.03:1 against navy, so it may carry text on navy. |
| `--rx-blue-pale` | `#dbeaff` | keep | Tinted fills, selected rows. |
| `--rx-accent` | `#ffb020` | keep | The amber accent: small signals (a dot, a progress mark). Never body text or a large fill. |
| `--rx-navy` (heading) | `#102b46` (`--rx-heading`) | keep | Headings, the strongest text, dark surfaces. 14.4:1 on white. |

How the two blues divide the work:

| Element | Colour |
|---|---|
| Primary button fill | `--rx-action` (white text, 5.40:1) |
| Text link, ghost button | `--rx-action` on white or the pale tint |
| Logo, brand mark, favicon | `--rx-brand-blue` |
| Section rule, progress bar, tab underline, active indicator | `--rx-brand-blue` (graphic, 3:1) |
| Icon 24 px and larger, illustration fill | `--rx-brand-blue` |
| Icon 16–20 px that must be seen against white | `--rx-action` |
| Focus outline | `--rx-action` on light surfaces; `--rx-blue-bright` or white on dark surfaces |
| Large headline word picked out in colour (two-tone headline, where kept) | `--rx-brand-blue` allowed only at 24 px or larger, on white |

#### Backgrounds and surfaces

| Token | Today | Proposed |
|---|---|---|
| `--rx-bg` (page tint) | `#f3f7fb` (redesign) | keep |
| `--rx-white` / `--rx-surface` | `#ffffff` | keep |
| `--rx-surface-blue` | `#eaf3ff` | keep, used for selected and hover states only |
| Dark surface | none defined | Add `--rx-ink: #102b46` for dark bands (footer, code and workspace headers). Not a new brand colour. |

#### Text

| Token | Today | Contrast on white | Proposed |
|---|---|---|---|
| `--rx-heading` | `#102b46` | 14.4:1 | keep |
| `--rx-text` | `#34495e` | 9.3:1 | keep |
| `--rx-text-soft` | `#65788c` | 4.55:1 | keep; **do not use on the pale tint** (4.22:1, below AA) |
| `--rx-text-muted` | `#94a3b8` | **2.56:1** | Restrict to disabled and decorative text. Replace with `--rx-text-soft` wherever the text carries meaning. |

#### Borders and status

| Token | Today | Proposed |
|---|---|---|
| `--rx-border` | `#dce6f0` | keep |
| `--rx-border-strong` | `#c8d8e8` | keep (used for inputs and secondary buttons) |
| `--rx-success` | `#159570` | keep; always paired with an icon or word |
| `--rx-warning` | `#d98b18` | keep; check text contrast before using as text colour |
| `--rx-danger` | `#d9534f` | keep; always paired with an icon or word |

Computed contrast for the most used pairs:

| Pair | Ratio | AA normal text (4.5) |
|---|---|---|
| Navy `#102b46` on white | 14.42 | Pass |
| Body `#34495e` on white | 9.29 | Pass |
| White on navy | 14.42 | Pass |
| Amber `#ffb020` on navy | 7.89 | Pass |
| Action blue `#116eb1` on white | 5.40 | Pass |
| White on action blue `#116eb1` (primary button) | 5.40 | Pass |
| Action blue `#116eb1` on the page tint `#f3f7fb` | 5.02 | Pass |
| Action blue `#116eb1` on `#eaf3ff` | 4.82 | Pass |
| White on hover blue `#0f639e` | 6.37 | Pass |
| Existing `--rx-blue` `#1476db` on white | 4.52 | Pass |
| Soft text `#65788c` on white | 4.55 | Pass |
| Existing `--rx-blue` `#1476db` on the page tint `#f3f7fb` | 4.20 | **Fail** |
| Soft text on the page tint | 4.22 | **Fail** |
| Existing `--rx-blue` on `#eaf3ff` | 4.04 | **Fail** |
| White on brand blue `#168fe5` | 3.45 | **Fail** for text; fine for graphics (3:1) |
| Brand blue `#168fe5` on white (graphic) | 3.45 | Pass for graphics (3:1) |
| Brand blue `#168fe5` on the page tint (graphic) | 3.20 | Pass for graphics (3:1) |
| Navy text on brand blue | 4.19 | **Fail** for normal text. Do not put text on a brand-blue fill. |
| Muted `#94a3b8` on white | 2.56 | **Fail** |

**Rule:** soft-grey text sits on white, not on the pale tint. Action-blue text passes on white, the pale tint and `#eaf3ff`, but not on `#dbeaff` (4.43:1), so use navy there. Brand blue is never used for text smaller than 24 px, and no text sits on a brand-blue fill. The pairs above are computed values; re-check them with a contrast tool when the tokens are implemented.

### 4.2 Typography

Fonts are kept: **Manrope** for headings and **Inter** for text (self-hosted, no external request).

| Role | Font | Size (desktop / mobile) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Display (homepage and hub hero only) | Manrope | 56 / 36 | 800 | 1.05 | -0.04em |
| H1 (page title) | Manrope | 40 / 30 | 800 | 1.1 | -0.035em |
| H2 (section) | Manrope | 28 / 24 | 700 | 1.15 | -0.03em |
| H3 (item or card title) | Manrope | 18 / 17 | 700 | 1.25 | -0.015em |
| H4 (small group title) | Inter | 15 / 15 | 650 | 1.3 | 0 |
| Lead paragraph | Inter | 17 / 16 | 400 | 1.55 | 0 |
| Body | Inter | 15 / 15 | 400 | 1.6 | 0 |
| Reading column (articles, guides) | Inter | 16 / 16 | 400 | 1.7 | 0 |
| UI text (buttons, nav, tabs) | Inter | 13–14 | 600 | 1.2 | 0.005em |
| Caption and label | Inter | 12 | 500 | 1.4 | 0 |
| Eyebrow (uppercase label) | Inter | 11 | 700 | 1.2 | 0.12em, uppercase |

Changes from today, with reasons:

| Today | Proposed | Reason |
|---|---|---|
| Body 14 pixels | 15 pixels, 16 in reading columns | Readability for learners, parents and teachers; compactness comes from layout, not smaller type |
| Navigation 10 pixels | 13 pixels | Ten pixels is below a comfortable minimum |
| Hero eyebrow 9 pixels | 11 pixels | Same |
| Hero H1 up to 66 pixels, tracking -0.055em | 56 pixels maximum, -0.04em | Less oversized; tighter tracking at this size harms legibility |
| Two-tone headline on every page | One colour by default; blue accent on one phrase only on the homepage and hubs | Avoids the template look |

**Minimum sizes:** 12 pixels for any text that carries meaning, 11 pixels only for uppercase eyebrows. Nothing smaller.

**Heading hierarchy:** one H1 per page, visible. H2 for sections, H3 for items. No level is skipped. The H1 is never visually hidden (the Explore page currently hides it).

**Two-line headings:** put a real space or a line break between lines, not two adjacent `span` elements, so that text extraction and assistive technology read the heading correctly.

### 4.3 Spacing scale

The existing scale is kept (`--rx-space-1` to `--rx-space-10`):

| Token | Value |
|---|---|
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 24 |
| 6 | 32 |
| 7 | 48 |
| 8 | 64 |
| 9 | 80 |
| 10 | 112 |

**Rules.** All spacing uses these steps. Steps 9 and 10 are for the homepage and hub heroes only. Within components use steps 1–6.

### 4.4 Layout, content widths and rhythm

| Item | Value | Notes |
|---|---|---|
| Page container | 1240 px maximum, 24 px side gutter (16 px under 640 px) | Matches the redesign layer. Replaces the 1280 and 1400 variants in the base file. |
| Reading column | 680 px | Articles, guides, long descriptions |
| Form column | 560 px | Contact, quote, club forms |
| Narrow section | 880 px | Statements and short editorial blocks |
| Section vertical rhythm | 40 px tablet and phone, 56 px desktop between sections | Replaces the current 72–112 px section padding (`.rx-section` uses `clamp(72px, 8vw, 112px)`) |
| Hero or hub top padding | 48 px desktop, 32 px mobile | |
| Header height | 66 px | From the redesign layer; sticky |
| Grid | 12 columns on desktop, 8 on tablet, 4 on phone; 24 px gutters | Used for composition, not for every page |

**Rule against empty space.** A section is no taller than its content plus the rhythm above. A section holding fewer than three items does not receive its own full-width band.

### 4.5 Border radius

The site has about 662 radius declarations with at least ten distinct values (129 use 999 px; 106 use 10 px; 88 use 12 px; 68 use 14 px; 54 use 8 px; and others). The proposal is four values.

| Token | Value | Use |
|---|---|---|
| `--rx-radius-sm` | 6 px | Buttons, inputs, tags, small controls |
| `--rx-radius-md` | 10 px | Cards, panels, images, popovers |
| `--rx-radius-lg` | 14 px | Large media, dialogs, the one feature panel on a page |
| `--rx-radius-pill` | 999 px | Chips, filters and badges only |

Retired: 5, 8, 9, 12, 16, 18, 22, 24 and 28 px. A card on a card, or a photograph inside a bordered card, uses one radius step and never two stacked large radii.

### 4.6 Shadows

| Token | Value | Use |
|---|---|---|
| none | | Default for cards, rows and panels (they use a 1-pixel border) |
| `--rx-shadow-sm` | `0 2px 8px rgba(16,43,70,.06)` | Hover on interactive cards; sticky header |
| `--rx-shadow-md` | `0 12px 32px rgba(16,43,70,.12)` | Menus, popovers, dropdowns |
| `--rx-shadow-lg` | `0 24px 60px rgba(16,43,70,.16)` | Dialogs and full-screen overlays only |

Coloured glows and large blue-tinted shadows (for example under the Play stage) are retired.

### 4.7 Buttons

| Variant | Appearance | Use |
|---|---|---|
| **Primary** | Solid `--rx-action` (hover `--rx-action-hover`), white text, 6 px radius. A 3 px `--rx-brand-blue` underline or accent is not added; the brand colour appears around the button, not behind its text. | One per section at most |
| **Secondary** | White, 1-pixel `--rx-border-strong`, navy text | Alternative action |
| **Ghost / link** | Text with an arrow, `--rx-action` | Tertiary and "see all" |
| **Dark** | Solid navy, white text | Only if management keeps the navy navigation call-to-action |
| **Small** | 36 px height | Inside dense lists and tables |

| Property | Value |
|---|---|
| Minimum height | 44 px (36 px for small, with 44 px touch area via padding) |
| Padding | 0 18 px |
| Type | Inter 14 px, 600 |
| Focus | 2 px outline in `--rx-action`, 3 px offset (the existing global rule, with the colour changed) |
| Disabled | 50% opacity and a not-allowed cursor, with text still readable |
| Loading | Text changes to a verb ("Sending…"); no spinner-only state |
| Icon | 16 px, `currentColor`, 8 px gap |

Primary and secondary are used with a clear difference. A section does not show two primaries.

### 4.8 Form elements

| Element | Specification |
|---|---|
| Label | Above the field, Inter 13 px 600, navy. Never a placeholder-only label. |
| Input, select, textarea | 44 px height (textarea 120 px minimum), 1 px `--rx-border-strong`, 6 px radius, white background, 15 px text |
| Focus | 2 px `--rx-action` outline, 2 px offset, plus a border change to `--rx-action` |
| Helper text | 12 px, soft text colour, under the field |
| Error | Red message with an icon and the words "Error:" or an equivalent, linked with `aria-describedby`; border turns red. Colour is never the only signal. |
| Required | "(required)" in the label; `required` attribute |
| Checkbox and radio | 20 px control, 44 px hit area, label to the right |
| Layout | One column on phone; two columns on desktop only for short related fields (first and last name). Maximum form width 560 px. |
| Success | A confirmation message in the page, with focus moved to it |

### 4.9 Iconography

| Rule | Detail |
|---|---|
| Source | Inline SVG, 24 × 24 grid, no icon library (none is installed; adding one needs approval) |
| Style | 1.7 px stroke, round caps and joins, `currentColor`, no fill |
| Sizes | 16 px inline, 20 px in lists, 24 px for feature icons |
| Meaning | An icon never carries meaning alone; it has a text label or an accessible name |
| Consolidation | The same SVG path strings are copied across at least seven files (for example the flask icon). Move them to one shared icon map (see `component-architecture.md`). |
| Decorative icons | `aria-hidden="true"` |

### 4.10 Image treatments

| Treatment | Use | Specification |
|---|---|---|
| **Product preview** | Lessons, experiences, studios, product covers | Real screenshot or cover, 1-pixel border, `--rx-radius-md`, no shadow, no overlay chips |
| **Editorial photograph** | About, a hub, one institutional page | At most one per page; 16:9 or 4:3; `--rx-radius-md`; a visible caption or meaningful alt text; no chips laid over it |
| **Diagram or illustration** | Process explanations (how it works), institutional pages | Flat, two or three colours from the palette, drawn as SVG |
| **Thumbnail** | Lists and rails | 4:3, 64–96 px, `--rx-radius-sm`, optional |
| **Avatar / badge art** | Achievements | Square or circle; always with a text label |

Rules:

- A stock photograph may not be used as the same page's hero and closing image.
- A photograph is never the only carrier of a page's meaning.
- Every image has appropriate alt text. Purely decorative images use an empty alt.
- Images use the existing `next/image` component with explicit sizes.
- Photograph licences must be confirmed before reuse (see risks in `phase-1-core-pages.md`).

### 4.11 Responsive breakpoints

Replace the eight scattered widths with four.

| Name | Width | Layout |
|---|---|---|
| **Phone** | up to 639 px | One column; 16 px gutters; menus become full-screen; tables turn into stacked lists |
| **Tablet** | 640–1023 px | Two columns where useful; navigation as a button menu |
| **Laptop** | 1024–1439 px | Full layout; 1240 px container |
| **Wide** | 1440 px and above | Container stays at 1240 px; extra space is margin |

Mobile-first: base rules are for phone, with `min-width` queries for the rest. Existing `max-width` rules are converted gradually, only as each page is touched.

#### Intermediate widths

The four named breakpoints stay. Between them, pages follow these rules so that nothing breaks at widths such as 600, 820 or 1180 px (a large phone in landscape, a portrait tablet, a small laptop or a landscape tablet).

| Range | Rule |
|---|---|
| 480–639 px (large phone, small landscape) | Phone layout. Containers keep 16 px gutters and may use two columns only for short items (chips, small tiles). Forms stay one column. |
| 640–767 px (small tablet) | Tablet layout begins. Two-column grids of tiles; split compositions still stack. Sticky side indexes stay hidden. |
| 768–1023 px (tablet) | Eight-column grid. Split compositions may sit side by side only if each side is at least 320 px; otherwise they stack. Sticky side indexes become a horizontal "On this page" strip under the header. Tables become two-line rows. |
| 1024–1279 px (small laptop, landscape tablet) | Container is fluid with 24 px gutters (it does not reach 1240 px). Four-up grids drop to three. Side rails narrow to 220 px. The sticky index sits at the side but never wider than 220 px. Display type steps down one size. |
| 1280–1439 px | Container reaches 1240 px with margins. Full desktop layout. |
| 1440 px and above | Container stays at 1240 px. |

Rules that apply at every width: no horizontal scroll; no text clipped at 200% zoom; touch targets stay 44 px; a component never relies on a fixed pixel width wider than its container; a three- or four-column grid uses `auto-fit` with a minimum column width, not a fixed column count.

**Testing widths** for every redesigned page: 390, 600, 768, 820, 1024, 1180, 1366 and 1440 px, plus 200% zoom, in portrait and landscape for tablet sizes. Per-page tablet and intermediate layouts for the six Phase 1 pages are in `phase-1-core-pages.md` and `phase-1-wireframes.md`.

### 4.12 Motion

| Rule | Detail |
|---|---|
| Duration | 150–200 ms for hover and focus; 250 ms for reveal (accordion, menu) |
| Properties | Opacity and transform only (no animated layout) |
| Easing | The existing `--rx-ease` |
| Auto-advancing content | None. The homepage hero slides become a paused, manually selectable strip, and every other rotating or stepping section (Play stage, Schools story rotator) is manual by default. Any content the visitor starts themselves (a live preview, a video) may play, with a visible pause control. |
| Reduced motion | `prefers-reduced-motion: reduce` removes all non-essential motion |
| No decorative loops | No pulsing, floating, particle or continuous background animation |

### 4.13 Accessibility floor

| Requirement | Standard |
|---|---|
| Contrast | WCAG 2.2 AA for text and interface components |
| Touch targets | 44 × 44 px minimum |
| Focus | Visible 2 px outline on every interactive element |
| Skip link | "Skip to main content" as the first focusable element (missing today) |
| Headings | One visible H1; no skipped levels |
| Keyboard | Every interaction works by keyboard; accordions and tabs follow standard patterns |
| Language | Plain English suited to the learner age; average sentence under 20 words on learner pages |

---

## 5. Page-family architecture

### 5.0 Page family, page purpose, component and page-local composition: four different things

These terms are used in all four documents. They are not interchangeable.

| Term | What it is | Who decides it | Example |
|---|---|---|---|
| **Page family** | A set of pages that share a *composition rule*: how the header, the main structure, the navigation and the responsive behaviour are arranged. There are nine (F1–F9). A page belongs to one family. | The design system | F4 Resource libraries: compact header, then filters, then results |
| **Page purpose** | What this particular page is for, and the one thing the visitor should be able to do on it. Two pages in the same family have different purposes. | The page specification | Articles (read something) and Free Downloads (get a file) are both F4 but have different purposes, different filters and different row content |
| **Reusable component** | A built piece of interface that appears in more than one place. It has props and is documented in `component-architecture.md`. | The component inventory | `PageHeader`, `SectionHero`, `Accordion` |
| **Page-local composition** | A layout assembled from components for one page only, not reused. Not added to the shared inventory. | The page specification | The Schools proposal index, the Explore workbench shell |

Rules that follow:

1. A family fixes structure; it does not fix content. The same family may produce pages that look different because their purposes differ.
2. A purpose is never solved by adding a new family. If a page does not fit, it uses the nearest family and a page-local composition.
3. A component is added to the shared inventory only when two or more pages need it. A one-page need stays page-local.
4. The six Phase 1 pages are *purposes*; each is built from the family rule plus its own page-local composition. For example the Schools page is F7 (family) with the purpose "help a school leader request a quote" and a page-local proposal-document composition.

The nine families from the audit. Each section gives the layout structure, visual hierarchy, navigation, content organisation and responsive behaviour. The families share the tokens above and differ in composition.

### F1. Editorial and immersive

**Pages:** homepage, About, Our Mission.

| | |
|---|---|
| **Job** | Tell the Rhinox story and orient a new visitor. |
| **Layout structure** | A sequence of distinct bands, each with its own composition. No band repeats the previous band's arrangement. Alternation of full-width statements, asymmetric splits, and wide media. |
| **Visual hierarchy** | The largest type and the largest media on the site live here. One idea per band. The display size is allowed here and on hubs only. |
| **Navigation** | Global header. In-page anchor links only if the page is long. Calls to action appear in the first band and the last band. |
| **Content organisation** | Story order: what Rhinox is, who it is for, proof (real products and work), how to start. |
| **Responsive behaviour** | Bands stack; side-by-side compositions become stacked with media first or second as the content dictates; display type reduces to 36 px. |
| **Do not** | Repeat the same split in consecutive bands; use the two-tone headline in more than the first band. |

### F2. Education and learning

**Pages:** Think • Move • Code! home and week pages, STEM & STEAM listing. Not redesigned in this phase (the Think • Move • Code! pages are preserved as they are).

| | |
|---|---|
| **Job** | Let a teacher or parent find the right lesson in the right order. |
| **Layout structure** | The structure of the programme is the layout: programme, then term, then week. Accordions and a compact rail, not cards. |
| **Visual hierarchy** | Where am I (breadcrumb and term), what is next (the open item), what do I need (the resource chips). |
| **Navigation** | Breadcrumb; in-page jump links; previous and next. |
| **Content organisation** | Chronological and curriculum-aligned; labels use Year groups as the primary category. |
| **Responsive behaviour** | Accordions work at any width; the side column moves below the main column. |
| **Do not** | Place a hero over a learning structure; fix the order of sections regardless of content. |

### F3. Application workspaces

**Pages:** Rhinox Code Studio and its workspaces, RhinoBot, Game Creator, the experience player, Think • Move • Code! lessons and games. **Not redesigned in this phase. Protected: see section 7.**

| | |
|---|---|
| **Job** | Let the learner do the activity. |
| **Layout structure** | Left rail (navigation) and a work area that fills the available height, with the page scrolling normally under the site header. |
| **Visual hierarchy** | The task first; tools second; chrome last. |
| **Navigation** | The studio rail. A clear route back to the website. |
| **Responsive behaviour** | The rail becomes a menu under 820 px; the work area scrolls. |
| **Design system role** | Receives no change by default. It adopts new tokens only through the opt-in migration in section 7, after regression tests pass. Behaviour and layout stay as built. |

### F4. Resource libraries

**Pages:** Articles, Videos, Free Downloads, Project Lab, STEM Challenges, STEM Quizzes, Experiments, Game Challenges, Education lesson listings, Experiences, Virtual Labs, STEM Games.

| | |
|---|---|
| **Job** | Find a thing and open it. |
| **Layout structure** | **Compact page header** (title, one line, item count), then search and filters, then results. No photograph. No hero. |
| **Visual hierarchy** | The results are the page. Filters sit beside or above them and are collapsible on phone. |
| **Navigation** | Filters (subject, age, type), search, sort; breadcrumb back to the section hub. |
| **Content organisation** | Rows for text-led items (articles, downloads), tiles for visual items (videos, experiences), each with a content-type label. Few-item pages show a short "start here" line and a clear empty state, not a hero. |
| **Responsive behaviour** | Filters move into a "Filters" sheet on phone; rows stay single-column; tiles drop to two then one per row. |
| **Do not** | Use a photograph or chips in the header; show a full-height empty state. |

### F5. Achievement dashboards

**Pages:** My Projects, Badges, Certificates, My Rhinox Library.

| | |
|---|---|
| **Job** | Show a learner what they have done and kept. |
| **Layout structure** | A summary row (counts, progress), then the items as a list or grid. Tabs when more than one kind of item exists. |
| **Visual hierarchy** | The learner's own items and progress come first; guidance is secondary. |
| **Navigation** | Tabs between kinds; filters by date or subject. |
| **Content organisation** | Newest first; each item shows what it is, when it was earned or saved, and an action. |
| **Responsive behaviour** | Summary row wraps; grid becomes a single column list. |
| **Dependency** | Built only when real badge, certificate or library content exists. Until then these pages say honestly that the feature is not yet available and point to what is. |

### F6. E-commerce catalogues

**Pages:** `/shop`, the five category pages and product detail pages. Existing design retained.

| | |
|---|---|
| **Job** | Find and choose a product. |
| **Layout structure** | Headline and search, category tabs with counts, filters, product grid. Product detail: gallery or cover, title, price, action, details. |
| **Visual hierarchy** | Product, price and the action. |
| **Navigation** | Category tabs, filters, breadcrumbs, sort. |
| **Content organisation** | By category; products show an age band and subject where known. |
| **Responsive behaviour** | Grid changes from four to two to one column; the action stays visible on a product page. |
| **Change proposed** | Align the product detail page header to the catalogue (same type, same radius). No change to the catalogue itself. |

### F7. Institutional and service pages

**Pages:** the four Schools pages, STEM Clubs, Request a Quote, Contact.

| | |
|---|---|
| **Job** | Convince a school leader and make enquiry easy. |
| **Layout structure** | Outcome first, then proof, then process, then the enquiry. A short, plain header (not the large split hero). |
| **Visual hierarchy** | The outcome statement, then the evidence, then the single action (request a quote). |
| **Navigation** | In-page jump links for long pages; a persistent "Request a quote" button with the safe-area and dismissal behaviour in `phase-1-core-pages.md` section 5. |
| **Content organisation** | What you get, how it works (four steps), what is included, enquiry. Forms last. |
| **Responsive behaviour** | The enquiry form stays one column; the primary action stays reachable. |
| **Do not** | Use a stock photograph in place of proof; repeat a closing band with another photograph. |

### F8. Content detail pages

**Pages:** article, video, download, lesson, activity, project and experiment detail pages; Support; stubs; not-found.

| | |
|---|---|
| **Job** | Let the visitor read, watch or use one thing. |
| **Layout structure** | Title block (type label, title, summary, key facts), then a reading column (680 px) with an "at a glance" list beside it on desktop. |
| **Visual hierarchy** | Title, then the primary action (open, download, play), then the body. |
| **Navigation** | Breadcrumb; related items at the end; previous and next where there is an order. |
| **Content organisation** | Body, then details, then related content. |
| **Responsive behaviour** | The "at a glance" list moves above the body on phone. |
| **Stub pages** | Show the real item title (or redirect) and a short honest "not available yet" note; never only the URL slug. |

### F9. Section hubs

**Pages:** Education, Explore, Coding & Robotics, Schools, Resources. (The Shop landing page belongs to F6.)

| | |
|---|---|
| **Job** | Help a visitor choose where to go within a section. |
| **Layout structure** | A short header, then **a way of choosing** that suits the section: large tiles, a studio selector, a topic map or an engine. Each hub's choosing device is different (see `phase-1-wireframes.md`). |
| **Visual hierarchy** | The choices are the page. Copy is minimal. |
| **Navigation** | The hub is the section's overview; breadcrumb is not needed; a persistent link back to the section menu. |
| **Content organisation** | Only real destinations, each with a short plain label and a live count where the content exists. |
| **Responsive behaviour** | Tiles and selectors stack to one column; the primary choice stays first. |
| **Do not** | Use the same hero or the same showcase grid on two hubs. |

---

## 6. Important design decisions and the reasons for them

| # | Decision | Reason |
|---|---|---|
| 1 | Keep Manrope and Inter | They are self-hosted, fast and already the brand voice; changing fonts adds risk and no benefit. |
| 2 | Keep the signature blue `#168fe5` as brand colour and add one accessible action blue `#116eb1` | Three blues cause inconsistent buttons and links. Brand blue passes for graphics (3.45:1) but fails for text and for white text on it. A darker blue of the same hue (5.40:1) does the text and button work, so the brand colour is preserved and accessibility is met. |
| 3 | Reduce radii to four | Removes the over-rounded look and cuts 10+ values to 4. |
| 4 | Retire decorative gradients and background patterns | Targets the "generic AI aesthetic" and the repeated pale-blue grid. |
| 5 | Replace one hero with nine families | The repetition is a composition problem; a new colour would not fix it. |
| 6 | Make library pages compact | Most sections hold zero to three items; a hero there dominates the page. |
| 7 | Raise minimum text size | Ten-pixel navigation and nine-pixel eyebrows are below a comfortable minimum, especially for younger learners and teachers on mobile. |
| 8 | Restrict auto-advancing content | Moving content is hard for some users and is distracting on a learning site. |
| 9 | Keep workspaces and Think • Move • Code! out of the redesign | They work, are tested and carry printed QR links. They receive no token changes unless they opt in through the migration in section 7. |
| 10 | Use real content as imagery | The site has real lessons, studios and products to show; stock photographs make every page look alike. |

---

## 7. Preservation checklist and protected areas

This design system changes appearance only. It does not alter:

- existing routes and URLs, including the printed QR short links `/q/n1-t{T}-w{W}`;
- Rhinox Code Studio, RhinoBot, Game Creator, the experience player or Think • Move • Code! behaviour;
- existing educational content and its data;
- authentication or database integrations (none are changed);
- valid SEO metadata (titles and descriptions stay unless a page's purpose changes);
- responsive behaviour (the proposal improves it).

### 7.1 Protected areas

| Protected area | Where it lives | Why it is protected | How it is coupled to shared styles |
|---|---|---|---|
| **Rhinox Code Studio** (and its workspaces, including Game Creator and RhinoBot) | `app/components/code-studio`, `code-studio-v2`, `studio-shell`, `rhinocode` | Working application with its own layout, editor, block canvas and saved projects | Its CSS uses almost no shared tokens (colours are hard-coded), so global token changes will mostly not reach it. It can still be affected by global element rules, `.rx-*` utility classes, container widths, the header and the skip link. |
| **Think • Move • Code!** (home, week pages, lessons, games and the `/q/…` QR short links) | `app/think-move-code`, `public/tmc` | Used in classrooms; printed QR codes point to it | Its CSS reads shared tokens about 139 times (`var(--rx-*)`). A change to the *value* of an existing shared token **will** change this area. |

### 7.2 Rules for any shared token change

1. **Additive, not in-place.** New values arrive under new names (`--rx-brand-blue`, `--rx-action`, `--rx-action-hover`, and for radii, shadows and spacing the new tokens). The value of an existing token (`--rx-blue`, `--rx-radius-*` as used today, `--rx-space-*`, `--rx-text-muted` and the others read by protected areas) is **not edited** until a regression pass shows the protected areas are unaffected.
2. **Scoped adoption.** New pages and reworked pages read the new tokens. Protected areas keep reading the old ones. The old and new tokens coexist during the transition.
3. **Explicit opt-in.** A protected area changes only when management approves a specific migration, done as its own pull request, with before-and-after screenshots, and reversible by reverting that one pull request.
4. **No global element rules.** No change to bare element selectors (`a`, `button`, `h1`…), global focus rules or `body` typography without running the regression suite below, because those reach every area.
5. **No layout changes.** Container widths, grid structures, the studio rail and the lesson structure are not altered by a token change.
6. **Header, footer and skip link changes** are tested inside the protected areas too, because they wrap them.

### 7.3 Required regression testing

Before any shared stylesheet or token change merges, and again before release:

| Check | What is checked |
|---|---|
| Existing automated suites | `npm run lint`, `npx tsc --noEmit`, `npm run build`, plus the project's existing test scripts for navigation and for Think • Move • Code! and the studios (the full list is recorded in the implementation pull request, not guessed here) |
| Route check | Every protected route returns 200 with no console errors, including the Think • Move • Code! home, one page from every term and week, one lesson, one game, the studio entry, Game Creator and RhinoBot |
| QR short links | A sample of `/q/n1-t{T}-w{W}` links still redirect to the correct destination |
| Visual comparison | Before-and-after screenshots at 390, 768, 1024 and 1440 px for the pages above; any difference is either explained and approved or fixed |
| Functional pass | In Rhinox Code Studio: open, add and run blocks, save and reopen a project. In Think • Move • Code!: open a lesson, use the resource chips, play one game. In the experience player: start and complete one experience |
| Accessibility spot-check | Keyboard path, visible focus and contrast on the same pages |
| Rollback | The change is a single revertable pull request with no data migration |

A failure in any protected area blocks the merge.

---

## 8. How the system is adopted

Adoption is a sequence, not a switch (see the roadmap in the audit and `phase-1-core-pages.md`):

1. Add the new tokens (brand blue, action blue, new radius, shadow and type tokens) alongside the old ones, without changing existing values.
2. Introduce the compact page header and the single hero primitive.
3. Convert library pages, then hubs, then institutional pages, each reading the new tokens.
4. Run the section 7.3 regression pass after each step.
5. Retire the old hero copies and the unused components (deletion only on approval).
6. Only after the above, and on approval, consider migrating a protected area.

Each step is previewable on its own, reversible, and leaves the workspaces untouched.

---

## 9. Official product names

Use these names in all interface text, headings, menus, metadata and documents. The names below were checked against the code; where the code uses a different label today, it is listed so that it can be corrected when the page is next touched.

| Official name | Use for | Not |
|---|---|---|
| **RhinoBot** | The robot-programming experience, with the longer title "RhinoBot: Robot Programming Lab" where a full title is needed | "Rhino Bot", "RhinoBOT", "Rhinobot" |
| **Game Creator** | The game-building studio | "RhinoCode Game Creator" (the current menu label) |
| **Rhinox Code Studio** | The coding workspace as a product | "Code Studio" alone in headings, "RhinoCode Studio" |
| **Think • Move • Code!** | The classroom programme, always with the bullets and exclamation mark | "Think Move Code" in visible text (the route `/think-move-code` stays) |

Notes:

- "RhinoCode" is the platform label used inside the code area. It is not a product name in new copy; write "Rhinox Code Studio".
- "RhinoBot STEM Adventure" is a **separate game** and is not the RhinoBot experience. Do not merge the two names.
- Routes and file names do not change. This is a naming rule for visible text and documentation only.
- Where two label variants exist in menus, the correction is made when that page or menu is next edited, and it is made as a content change, not combined with a design change.

---

## 10. Navigation data contract (summary)

The homepage Explore section is built from the same navigation data as the site menu. Any future change to the menu structure must first protect Explore. The full contract is in `phase-1-core-pages.md` section 8.3. In short:

- the six Phase 1 pages need **no** menu change and are designed so that they can proceed without one;
- a menu restructure is a separate piece of work with its own approval, and it does not start until the preconditions in `phase-1-core-pages.md` section 8.3 are met.
