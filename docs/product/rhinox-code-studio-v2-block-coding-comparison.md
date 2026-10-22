# Years 1–4 block coding: evidence-based comparison (draft for decision)

**Date:** 22 October 2026. **Status:** recommendation only; nothing built. Marked V = verified in this session, U = unverified (from general knowledge; confirm before relying on it).

## What the curriculum actually needs
Keyword read of the Code field for all 156 weeks of Years 1–4 (a person should confirm per week):
- Year 1: if/else 8 weeks, repeat 7, sequence 6, move/turn 6, sensing 4.
- Year 2: repeat 28, move/turn 7, sequence 4, pen 4, sensing 4.
- Year 3: repeat 22, sequence 21, events ("when…") 18, move/turn 15, if/else 7, sensing 7, variables 5.
- Year 4: repeat 21, move/turn 18, events 17, pen 14, sensing 13, sequence 12, if/else 9, sprites 7, variables 5.

So the need is a small, steady set: sequence, repeat, events, if/else, move/turn, pen, sensing, a few variables and sprites. It is not the whole of Scratch.

## Options

| | A. Use Scratch itself | B. Narrow custom editor on Blockly | C. Another existing visual tool |
|---|---|---|---|
| Curriculum fit | Best match to the books if they show Scratch screens | Good for the small block set above; looks different from Scratch (U for how the books show it) | Depends on the tool |
| Control of the lesson sequence and completion evidence | Weak. Hard to limit blocks per week or read the result out | Strong. We choose the blocks per week and read the program | Weak to medium |
| Offline and low-bandwidth | Official site needs internet; a self-hosted copy is large (U) | Small, runs offline like our other studios (U, to prototype) | Varies |
| Phone and tablet use | Scratch is built for larger screens (U) | We design for touch from the start | Varies |
| Accessibility | Limited keyboard/screen-reader support (U) | Blockly has a keyboard-navigation plugin (Apache 2.0); no screen-reader claim found (V for plugin; screen reader U) | Varies |
| Licence and branding | Scratch code and the name come with Foundation terms; could not be fetched here, must be read first (U) | Blockly is Apache 2.0 (V). Maintenance moved from Google to the Raspberry Pi Foundation announced 10 Nov 2025 (V) | Check per tool |
| Maintenance cost | Low if linked out; high if self-hosted and modified | Medium: we own the block set, tests and UI | Medium |
| Independence | Depends on an outside organisation | Ours | Depends |

## Recommendation (for the Product Director to approve)
1. **Do not embed or fork Scratch** until its licence and branding terms have been read in full and shown to allow our use. The page could not be fetched here.
2. **Prototype option B**, time-boxed, built on Blockly: about 12 blocks (move, turn, repeat, when clicked, when key pressed, if/else, wait, say, pen up/down, set variable, play sound). Reuse our existing safe interpreter approach; never run learner code with `eval`.
3. **Name it honestly.** It is a "Rhinox block coding" tool, not Scratch, and the guide must say that the book's Scratch screens and ours look different.
4. **Exit gates:** one Year 2 week (a repeat/draw lesson) runs end to end; tested on a phone; works offline; keyboard use works; a teacher says it matches the book's activity. If it fails, link out to Scratch with a clear guide instead.

## Decisions needed
- Does the book teach from Scratch screenshots? If yes, how much does a different look matter?
- Approve a 2-week prototype of option B?
- Who reads and approves the Scratch licence and branding terms?
