# Think • Move • Code! Learning Path: design for approval

Status: **approved by the owner (2026-11-11); phases 2 to 6 built; Nursery 2 itself is not designed, so it has no path yet.**
Decisions recorded: (1) name "Learning Path"; (2) soft order; (3) progress kept on the adult's device is approved for the pilot, built in phase 4: only step ids in this browser's localStorage, no names, accounts or network calls; (4) the Code Studio lessons for Weeks 1 to 8 are **set aside**: the path does not use them, they stay as they are, and the owner will pick the better of the two designs later.
Level: Nursery 1 first; later levels reuse the same pattern.

## 1. The idea

Visitors choose how to use Think • Move • Code!:

| Option | For | What it is |
| --- | --- | --- |
| **Week by week** (existing, stays the default) | Teachers, parents who want printables and guides | The current week pages. Unchanged. |
| **Learning Path** (new, name to be confirmed) | Families who want a guided, step-by-step route | A trail through the weeks in order, with a clear "next step" and stars. Inspired by Mimo and SoloLearn: short steps, one clear next action, visible progress. |

An adult chooses, not the child. Each option gets one plain line, for example "Week by week: pick any week, print the cards and guides." and "Learning Path: follow one step at a time, with stars to colour."

## 2. One rule: no duplicated content

The registry (`lib/tmc-registry`) already holds every week's game, quiz, printable cards, week page and lesson. **The path holds only the order, the labels and the progress. It never holds a copy of content.**

- Each path step points to a registry resource id. The page shows that resource through its existing route.
- A test fails if a step points to a resource that does not exist, is not `verified`, or is restricted (teacher-only files never appear on the child path).
- The Code Studio lessons built so far stay as they are. In the path they are the "Learn" step where one exists.

## 3. A week on the path

Each week is one stop with up to five steps, each taken from what the registry already has:

1. **Learn**: the week page. (The Code Studio lessons are set aside for now, see the status line.)
2. **Play**: the week's screen game.
3. **Match**: the week's matching game.
4. **Quiz**: the week's quiz.
5. **Offline**: the printable cards (adult prints; the child acts and draws). **Not on the path yet:** the registry classes the cards as licensed and teacher-audience, so the child path leaves them out. They return when the access policy for printables is settled.

Stars follow the books: the same "Step-Star" idea as the Activity Book's My Stars and badge pages, so the app and the book say the same thing.

Adult-only material (lesson plan, Teacher-Parent Guide, review sheet, question bank, project sheet) stays in the Week by week option, so the child path never links to it.

## 4. Order and unlocking

- **Soft order:** every stop shows "Next up" on the following step but nothing is locked. Teachers and parents often jump weeks, and a hard lock would block them.
- A stop is "done" when all its steps are marked done.

## 5. How progress is marked (honest evidence)

The games and quiz are separate pages and do not report back. So:
- A step is marked done by the **adult tapping "Done"**, or by the app itself where it already has a result (a reviewed lesson).
- The path never claims a child passed something it did not measure. Same rule as Code Studio: assistance is never a pass; a postponed teacher check is never a confirmation.
- No streaks or timers. They add pressure and are a poor fit for ages 3 to 4. The cue is "Today's next step".

## 6. Where progress is kept: options

| Option | What is stored, and where | Risk |
| --- | --- | --- |
| A. Nothing | Session only (today) | Progress lost on refresh. Not useful. |
| **B. On the adult's device (recommended for the pilot)** | Ticks and stars in the browser's own storage. No names, no ages, no account, no analytics. A "Reset progress" button. | Lost if the browser data is cleared; not shared across devices. |
| C. Account on our server | Needs sign-in, consent and a data policy | Children's data. Not now. |

Option B is meant to avoid collecting personal data. Before C, or any server storage, take legal advice on Nigerian data-protection rules for children's data. **Nothing is stored until you approve B.**

## 7. Build phases (each its own small PR, none merged without your word)

1. **This design** (you are reading it).
2. **Path data (done):** `types/tmc-learning-path.ts` and `lib/tmc-path/learning-path.ts` build 39 stops of 4 steps (Learn, Play, Match, Quiz) from the registry and validate them; tests in `scripts/test-tmc-learning-path.mjs`.
3. **Picker and read-only path pages (done):** a "How would you like to use Think • Move • Code!?" choice on the home page (Week by week stays first) and the trail at `/think-move-code/nursery-1/path`. Every step link is checked to load. Nothing is saved.
4. **Device-only progress (needs approval of Option B).**
5. **Hints and RhinoBot as guide:** tiered hints, "Today's next step".
6. **Next levels:** Nursery 2 onwards reuse the same path code.

## 8. What is not built, and what stays as is

- Existing week pages, games, quizzes, cards, Code Studio Weeks 1 to 3: unchanged.
- Known access debt (242 restricted files linked from public week pages): unchanged and not made worse.
- PR #77 (lessons for Weeks 4 to 8): held, not merged, until Decision 4 below.

## 9. Decisions for you

1. **Name** of the new option. Suggestions: "Learning Path" (clearest), "Ayo's Trail", "RhinoBot's Path".
2. **Order:** soft order (recommended) or hard lock.
3. **Storage:** approve Option B for the pilot?
4. **Code Studio lessons for Weeks 1 to 8:** (a) keep each lesson's own ordering screen, (b) remove it so the path's Play step uses the existing game (recommended, avoids repeating), or (c) drop Weeks 4 to 8 lessons and keep only Weeks 1 to 3.

## Phase 4 as built: device-only progress

- A grown-up taps "Mark done" on each step, because the games and quizzes do not report back. Nothing is locked.
- Stored under one key (`tmc.learning-path.nursery-1.v1`) as a version number and step ids only. Unknown or damaged values are ignored.
- Shown as stars per week (one per step), "Week complete", a steps and weeks count, and a "Next up" cue. No streaks or timers.
- Reset has a two-step confirm. If the browser blocks storage the page works for the session and says so.
- Still true: get legal advice before any server-side storage of children's data (not built).

## Phase 5 as built: guide and hints

- "Today's next step" card at the top of the path: the first step not done, in book order, with a RhinoBot line and a link. A suggestion only; nothing is locked. No dates, streaks or timers.
- Each step has "Need a hint?", revealing three tiers one at a time: a nudge, a way to try, then a grown-up tip. Hints explain how to use the step; they never give answers or add lesson content.
- Hints are held in memory only and are not saved.
- Limit: the games and quizzes do not report back, so hints cannot react to what a child does inside them.

## Phase 6 as built: ready for more levels

- The path code was already level-neutral. Phase 6 removed the last Nursery 1 fixed points: the page and trail are shared (`app/think-move-code/_path/`), the saved-progress key is made per level (`progressStorageKey`), and levels are listed in `lib/tmc-path/levels.ts`.
- Nursery 1's address, look and saved-progress key are unchanged, so nobody loses progress.
- **Nursery 2 is not listed.** It has not been designed, has no registry data, no page and no picker entry. A level with no weeks in the registry fails the path checks, so it cannot appear by accident.
- To add a level later: put its book content in the registry, add it to `PATH_LEVELS` and the server module's registry list, and add a small page file. A test checks that every listed level has a registry.
- Tested with a stand-in second level (a relabelled copy of Nursery 1 inside the test only, not content).

## Polish pass (after phase 6)

- "Today's next step" and "Your progress" sit side by side on wide screens, so the first week shows on the first screen. Ayo (the real book picture) appears on the next-step card.
- Weeks are collapsible: only the week with the next step is open; a grown-up can open or close any week.
- A finished week shows a short "Well done" banner (a small pop that respects reduced motion; no sound, no timers).
- Each Nursery 1 week page has a "Continue on the Learning Path" link.

## Games and quizzes tick their own step (device only)

- Fixes the earlier limit that the path could not know when a child finished a game or quiz.
- **Ordering game (Play):** ticked when the child gets the first round right. A wrong order ticks nothing.
- **Pairs game (Match):** ticked when all pairs are found and the final question is answered correctly.
- **Quiz:** ticked when the quiz is submitted (finished, not passed). Only Nursery 1 week quizzes do this; other quizzes are untouched.
- **Learn** stays a grown-up tick, because reading cannot be detected.
- Still device only: the same single browser-storage key, step ids only, nothing sent anywhere. If the browser blocks storage, the game says so and still works. A grown-up can untick any step on the path.
- The game files are unchanged. The page that frames them watches the "well done" panel each game already shows.
- Rule kept: assistance and a deferred teacher check are never recorded as a pass; this records "finished once", not a score.

## "Do it together": screen-free lesson on the week page (all 39 weeks)

- Decision: instead of building more RhinoBot screen lessons (which would repeat the games and quiz), the Teacher Guide's own 40-minute lesson is shown on the week page: goal, words, what you need, then Think (8), Move (10), Code (12) and Book & close (10).
- Wording is the Teacher Guide's, extracted from its lesson-plan pages for all 39 weeks (Term 1 Weeks 1 to 3 were first copied by hand; the extraction reproduces them exactly). Nothing is rewritten or invented. Each lesson has four parts adding up to 40 minutes. Part names and minutes follow the guide, so practice, station, assessment and showcase weeks show their own (for example Warm-up, Stations, Showcase, Badges).
- The Learning Path shows a small "Do it together" link on every week, pointing to the week page section.
- Source file: `lib/tmc/lesson-guide.ts` (plain data). Not every lesson is "no kit": some weeks need a torch (teacher only), big blocks or a toy car, so the section says "taught without a screen" and lists what to prepare.

## RhinoBot screen lessons removed (Nursery 1 Weeks 1 to 3)

- Decision (13 Nov 2026): the three RhinoBot screen lessons for Term 1 Weeks 1 to 3 are removed from the site so every Nursery 1 week follows one pattern: "Do it together" (the Teacher Guide lesson), games, quiz and printables. The Weeks 4 to 8 lessons (PR #77) were closed unmerged.
- Removed: the lesson page route, the three lesson specs, the "Lesson with RhinoBot" links and their registry entries. The old addresses (`/think-move-code/nursery-1/term-1/week-1/lesson` and Weeks 2 and 3) now return 404. Printed QR codes point to the week pages, so they are unaffected.
- Kept: the lesson engine in `lib/code-studio-v2` (type, scoring, consistency rules) for other levels. The three removed specs live in `scripts/fixtures/nursery-1-lesson-specs.ts` as test fixtures so the engine stays tested.
- Nursery 1 and 2 curriculum-sheet records are never listed as "lessons in review".
