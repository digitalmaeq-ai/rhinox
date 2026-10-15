<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Rhinox Scientifica Project Instructions

## 1. Project purpose

Rhinox Scientifica is a STEM education, interactive learning and e commerce platform serving Nigeria first, with wider African expansion planned.

The platform includes educational content, interactive science experiences, coding and robotics, projects, quizzes, digital resources, books and online training.

## 2. Technology stack

- Next.js App Router, React and TypeScript.
- CSS Modules for component styling and globals.css for site wide styles.
- Tailwind CSS is available, but follow the existing styling pattern in the file being edited.
- Three.js is available for appropriate interactive 3D experiences.
- WordPress and WooCommerce may support content management and commerce integrations.
- Vercel is the preferred hosting option while keeping costs low.

Do not introduce new frameworks, libraries, databases or paid services without explaining the need and obtaining approval.

## 3. Architecture

- Keep Next.js as the primary application and interactive learning platform.
- Preserve separation between content definitions, registration, rendering and interactive runtime responsibilities.
- Prefer reusable, data driven components.
- Preserve working routes and features unless a task explicitly requires changes.
- Do not introduce WordPress or Elementor dependencies into the core interactive learning engine.
- Inspect existing implementations and the relevant Next.js documentation before changing APIs or architecture.
- For this project's installed Next.js version, consult the applicable documentation under node_modules/next/dist/docs/.

## 4. Content index

- Content source files live in content/.
- The generator is scripts/generate-content-index.mjs.
- Run npm run content:index after adding, removing or renaming content files.
- Review and commit the regenerated lib/content-items.generated.ts when it changes.
- Do not manually edit generated output unless the task specifically concerns the generator itself.
- Check that new content is registered and its routes and rendering work as expected.

## 5. Design and accessibility

- Use a clean, premium, light science and technology education aesthetic.
- Prefer white, pale blue and restrained blue accents.
- Follow existing typography, spacing and component conventions.
- Support responsive desktop, tablet and mobile layouts.
- Provide accessible labels, keyboard interaction and visible focus states where appropriate.
- Support reduced motion where appropriate.
- Do not communicate important information through colour alone.
- Avoid unnecessary cards, visual clutter and oversized interface elements.
- Use clear English suitable for the intended learner age.

## 6. Verification commands

Run relevant checks for each task:

- Lint: npm run lint
- TypeScript: npx tsc --noEmit
- Production build: npm run build
- Content index: npm run content:index

The dev and build scripts already run the content index generator through their lifecycle scripts.

Run the checks relevant to the changes. For substantial changes, run all four checks where appropriate. Report the actual results and do not claim a check passed unless it was run successfully.

## 7. Git workflow

- The stable branch is main.
- Use feature branches for substantial features and refactors.
- Examples: feature/shop-filters, fix/titration-quiz, content/photosynthesis-lesson.
- Small documentation changes may be committed directly to main when the working tree is clean.
- Inspect git status before editing, committing, merging or switching branches.
- Never overwrite or discard user changes.
- Do not use destructive Git commands without explicit approval.
- Commit only task related files.
- Do not merge a feature branch into main without approval.
- Avoid simultaneous edits to the same files by different AI tools.
- Before committing, inspect the diff and run git diff --check.
- Report the branch, commit and push status accurately.

## 8. Security and costs

- Never expose API keys, passwords, tokens or private credentials.
- Never commit real environment files or secrets.
- Preserve .env.example without adding real credentials.
- Prefer free or low cost solutions while the project is being validated.
- Do not activate paid AI APIs, video services or infrastructure without approval.

## 9. Working with the project owner

The project owner is learning the development workflow and needs step by step guidance.

- Explain technical decisions in plain English.
- Provide complete, copyable commands.
- Identify the correct working directory.
- Explain risky operations before asking the owner to run them.
- Prefer small, verifiable changes over large unreviewed rewrites.
- Ask for approval before major architectural changes.

## 10. Completion report

At the end of each task, report:

1. What changed and why.
2. Files changed.
3. Checks run and their results.
4. Outstanding issues or limitations.
5. Current Git branch and commit or push status.
6. Recommended next step.
