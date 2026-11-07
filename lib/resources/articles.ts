// Articles for /resources/articles. The term guides and the teaching tips are assembled from the
// real Nursery 1 week data in lib/tmc, so they can never disagree with the weekly packs.
// The existing STEM article from /content is added to the list by the page.

import { NURSERY_1_TERMS, NURSERY_1_WEEKS, TEACHER_FILES } from "../tmc/nursery-1";
import { TERM_COLOURS } from "./library";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] };

export interface Article {
  slug: string;
  title: string;
  dek: string;
  category: "Term guide" | "For teachers" | "For parents" | "Ideas";
  minutes: number;
  accent: string;
  blocks: Block[];
}

const words = (blocks: Block[]) =>
  blocks.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : b.items.join(" ").split(/\s+/).length), 0);
const minutes = (blocks: Block[]) => Math.max(2, Math.round(words(blocks) / 180));

function termGuide(term: number): Article {
  const info = NURSERY_1_TERMS.find((t) => t.term === term)!;
  const weeks = NURSERY_1_WEEKS.filter((w) => w.term === term);
  const learning = weeks.filter((w) => w.goal);
  const first = weeks[0];
  const blocks: Block[] = [
    { type: "p", text: `Term ${term} of Think • Move • Code! Nursery 1 is called “${info.title}”. It runs for ${weeks.length} weeks: ${learning.length} weeks of learning and practice, then an assessment week and a Showcase week where children share what they can do.` },
    { type: "h2", text: "What your child learns" },
    { type: "p", text: first.learned },
    { type: "h2", text: "Week by week" },
    { type: "list", items: weeks.map((w) => (w.goal ? `Week ${w.week}, ${w.title} — ${w.goal}` : `Week ${w.week}, ${w.title}`)) },
    { type: "h2", text: "Try this at home" },
    { type: "p", text: "Short and playful works best. Here are ideas from the weekly parent notes:" },
    { type: "list", items: weeks.filter((w) => w.tryAtHome.length).slice(0, 4).map((w) => w.tryAtHome[0]) },
  ];
  return {
    slug: `term-${term}-guide`,
    title: `Term ${term}: ${info.title}`,
    dek: `What children learn in Term ${term} of Nursery 1, week by week, and how families can join in.`,
    category: "Term guide",
    minutes: minutes(blocks),
    accent: TERM_COLOURS[term].main,
    blocks,
  };
}

function packGuide(): Article {
  const blocks: Block[] = [
    { type: "p", text: "Every week of Nursery 1 has its own pack. You do not need to read everything. Start with the lesson plan and add the rest as you need it." },
    { type: "steps", items: TEACHER_FILES.map((f) => `${f.title}. ${f.detail}.`) },
    { type: "h2", text: "A simple weekly rhythm" },
    { type: "list", items: [
      "Before the week: read the lesson plan and print the cards.",
      "In the lesson: follow the steps, say the key words aloud and let children move.",
      "After the lesson: send the take-home note and try the review sheet by watching and ticking, not by marking.",
    ] },
    { type: "p", text: "All of these are free on the Free Downloads page." },
  ];
  return { slug: "how-to-use-a-weekly-pack", title: "How to use a weekly pack", dek: "Six files per week. Here is what each one is for and where to start.", category: "For teachers", minutes: minutes(blocks), accent: "#a85f00", blocks };
}

function tipsGuide(): Article {
  const picks = [1, 5, 6, 8].map((n) => NURSERY_1_WEEKS.find((w) => w.term === 1 && w.week === n)).filter((w): w is NonNullable<typeof w> => Boolean(w));
  const blocks: Block[] = [
    { type: "p", text: "Each weekly teacher guide ends with a short tip. These are a few from Term 1 that work well all year." },
    ...picks.flatMap<Block>((w) => [{ type: "h2", text: `Week ${w.week}: ${w.title}` }, { type: "p", text: w.tip }]),
  ];
  return { slug: "teaching-tips-from-term-1", title: "Four teaching tips from Term 1", dek: "Small things to say and do that help young children learn to think in steps.", category: "For teachers", minutes: minutes(blocks), accent: "#4f63d9", blocks };
}

function homeGuide(): Article {
  const w1 = NURSERY_1_WEEKS[0];
  const blocks: Block[] = [
    { type: "p", text: "You do not need a screen, a robot or any coding knowledge. Young children learn the first ideas of coding through everyday life and play." },
    { type: "h2", text: "Three ways to start today" },
    { type: "list", items: w1.tryAtHome },
    { type: "h2", text: "Words to use" },
    { type: "p", text: `Say the key words every time: ${w1.keyWords.join(", ")}. Children learn words by hearing them with an action.` },
    { type: "h2", text: "When your child makes a mistake" },
    { type: "p", text: w1.tip },
  ];
  return { slug: "coding-at-home-without-a-screen", title: "Coding at home without a screen", dek: "Three games and a few words that start your child on the road to coding.", category: "For parents", minutes: minutes(blocks), accent: "#1593b8", blocks };
}

export const guides: Article[] = [homeGuide(), packGuide(), tipsGuide(), termGuide(1), termGuide(2), termGuide(3)];
