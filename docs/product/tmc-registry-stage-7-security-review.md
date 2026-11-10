# TMC Registry: Stage 7 Security and Compatibility Review

**Scope:** the book-first content registry (Stages 2 to 6, plus the page index), the Nursery 1 pack under `public/tmc/n1/`, the Code Studio V2 lesson for Term 1 Week 1, and how they meet the public site.
**Date:** 10 November 2026. **Status:** review done, tests added. No access rule has been changed. Decisions below are for the project owner.

## 1. Result in one paragraph

The registry itself is safe: it runs on the server only, denies by default, reads no secrets or network, holds no book wording, and nothing on the public site imports it. The main risk is not in the registry. It is the existing Nursery 1 downloads: 242 teacher-only or licensed files are still served from `public/` and linked from public pages, so anyone with the link can download them. The registry already records this as "access debt". This review counts it exactly and adds a test so it cannot grow unnoticed.

## 2. Findings

| # | Finding | Level | Status |
|---|---|---|---|
| F1 | 242 restricted files are publicly downloadable and linked from public week pages: 39 lesson plans, 39 project sheets, 39 review sheets, 80 question banks (with answers), 45 printable card files and sticker sheets. `robots.ts` allows crawling. The sitemap does not list the files. | High | Open. Owner decision needed (section 3). |
| F2 | Quiz pages ship each quiz's correct answers to the browser (`correctAnswer` in the quiz content). The same questions with answers are in the teacher-only question banks. | Low | Accepted for learner quizzes. Note only. |
| F3 | The Code Studio V2 page still has Term 1 Week 1 wording written into the page code (the picture strips, and a RhinoBot line that is not from the book). It is correct for this one lesson. A second lesson would show the wrong strips. | Medium | Open. Make the page read everything from the lesson spec before a second lesson is added. |
| F4 | Learner progress is kept in the browser for the session only, and the page says so. There is no stored data about children. | Info | Good. Any stored progress for children aged 3 to 4 needs a privacy and consent design first (Nigeria's data protection law treats children's data with extra care; have it reviewed by someone qualified). |
| F5 | The registry and its server loader fail closed: no lesson reaches a learner while no book is approved and no trusted learner identity exists. | Info | Good. Covered by tests. |
| F6 | The registry code never reads `process.env`, secrets or the network. The page index stores page numbers and roles only. | Info | Good. Now covered by a test. |
| F7 | Curriculum workbooks are ignored by git (`.gitignore`) and none has ever been committed (checked the whole history). None is in `public/`. | Info | Good. Now covered by a test. |
| F8 | `npm audit --omit=dev --audit-level=high` reports 0 vulnerabilities. | Info | Good. |

## 3. Decision needed on F1

The books themselves (Activity Book, Teacher Guide) are not in the repository or on the site. Only the support files are public.

| Option | What it does | Cost and risk |
|---|---|---|
| A. Teacher sign-in, then move restricted files behind it | Real protection. Files stop being downloadable by link. | Needs a sign-in service or a paid or hosted option, so it needs your approval. Teachers' current downloads would change. |
| B. Interim: stop listing restricted files on public pages and send a "do not index" header for `/tmc/n1/` | Search engines stop surfacing them and visitors stop seeing the links. Does not stop someone who has the address. | Small code change. Teachers lose the easy links until A exists. |
| C. Accept for now | Nothing changes. | The question banks with answers stay open to anyone with the link. |

Recommendation: C or B now, A when a teacher sign-in exists. This review did not change any access rule.

## 4. Compatibility checked

- All 39 week pages, the game pages and every file under `public/tmc/n1/` keep their addresses (tests check each file exists and is registered).
- The lesson page still exists only for weeks with a reviewed lesson. Other weeks are a 404 (checked on a built site).
- The Term 1 Week 1 lesson keeps its old activity id (`tmc-v3-15-nursery-1-t1-w1`), so addresses and the legacy mapping still work. Its wording was rebuilt from the books and it now names its book pages.
- Registries written before the page index existed still validate (the index is optional).
- Every file linked from the public pages is a registered resource.

## 5. New tests (all in `scripts/test-tmc-book-registry.mjs`)

1. The registry code never reads secrets, the environment or the network.
2. Curriculum workbooks stay ignored by git and out of `public/`.
3. Every file the public pages link to is registered.
4. The access debt inventory is exact (242 files by type), so a new restricted file or type cannot be served unnoticed.
5. Old addresses, the legacy lesson id and the legacy mappings are preserved.

## 6. Not covered

- Real access control (needs F1 decision A).
- Hosting and header settings on Vercel or Netlify.
- A review of third-party scripts on the site pages.
- Storing learner progress (needs its own design and review).
