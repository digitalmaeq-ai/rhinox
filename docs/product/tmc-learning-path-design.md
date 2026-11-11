# Think • Move • Code! Learning Path: design for approval

Status: **proposal, nothing built.** Owner approval needed before any code (see "Decisions").
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

1. **Learn**: the reviewed interactive lesson if the week has one, otherwise the week page.
2. **Play**: the week's screen game.
3. **Match**: the week's matching game.
4. **Quiz**: the week's quiz.
5. **Offline**: the printable cards (adult prints; the child acts and draws).

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
2. **Path data:** a typed list of weeks and steps that reads registry ids, plus tests (ids real, verified, not restricted).
3. **Picker and read-only path pages:** the choice screen and the trail, no saving.
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
