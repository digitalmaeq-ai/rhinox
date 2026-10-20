// Guided exercises for Web Studio (HTML and CSS). Each check looks at the learner's page after it has been
// laid out in a hidden, script-free iframe, and returns null when it is right or a short sentence when it is not.
export type WebCheck = {
  name: string;
  /** Width of the page in pixels while checking (default 800). */
  width?: number;
  test: (doc: Document, win: Window) => string | null;
};

export type WebExercise = {
  id: string;
  title: string;
  task: string;
  starterHtml: string;
  starterCss: string;
  hints: string[];
  checks: WebCheck[];
};

const text = (el: Element | null) => (el?.textContent ?? "").trim();
const colour = (win: Window, el: Element, property: string): [number, number, number] => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(win.getComputedStyle(el).getPropertyValue(property));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
};
const px = (win: Window, el: Element, property: string) => parseFloat(win.getComputedStyle(el).getPropertyValue(property)) || 0;

const SHELL = (body: string) => `<!DOCTYPE html>
<html>
  <head>
    <title>My page</title>
  </head>
  <body>
${body}
  </body>
</html>
`;

export const WEB_EXERCISES: WebExercise[] = [
  {
    id: "web-heading",
    title: "A heading and a paragraph",
    task: "Add a main heading (h1) with the words of your choice, and below it a paragraph (p) about yourself.",
    starterHtml: SHELL("    <!-- write your heading and paragraph here -->"),
    starterCss: "",
    hints: ["<h1>My page</h1>", "<p>Hello! My name is ...</p>"],
    checks: [
      {
        name: "There is an h1 with words in it, then a paragraph",
        test: (doc) => {
          const h1 = doc.querySelector("h1");
          if (!h1 || !text(h1)) return "Add an <h1> with some text between the tags.";
          const p = doc.querySelector("p");
          if (!p || text(p).length < 5) return "Add a <p> with a sentence in it.";
          return h1.compareDocumentPosition(p) & 4 ? null : "The paragraph should come after the heading.";
        },
      },
    ],
  },
  {
    id: "web-list",
    title: "My favourite things",
    task: "Add a heading (h2) and a bulleted list (ul) of at least three things you like, each one in its own list item (li).",
    starterHtml: SHELL("    <!-- an h2 and a list -->"),
    starterCss: "",
    hints: ["<ul> holds the list, and each item is <li>...</li>.", "Close every tag: </li> and </ul>."],
    checks: [
      {
        name: "An h2 and a ul with three or more items",
        test: (doc) => {
          if (!text(doc.querySelector("h2"))) return "Add an <h2> with some text.";
          const items = doc.querySelectorAll("ul > li");
          if (items.length < 3) return `The list has ${items.length} item${items.length === 1 ? "" : "s"}. It needs at least 3 <li> inside a <ul>.`;
          return Array.from(items).every((li) => text(li)) ? null : "Every list item needs some text.";
        },
      },
    ],
  },
  {
    id: "web-link",
    title: "A link",
    task: "Add a link (a) with the words Rhinox Scientifica that goes to https://rhinoxscientifica.com. (Links do not open inside the preview; the check reads your HTML.)",
    starterHtml: SHELL("    <!-- the link goes here -->"),
    starterCss: "",
    hints: ["<a href=\"https://...\">words people click</a>", "The address goes in href, in quotes."],
    checks: [
      {
        name: "A link with the right words and address",
        test: (doc) => {
          const a = doc.querySelector("a[href]");
          if (!a) return "Add an <a> tag with an href.";
          if (!/rhinox\s+scientifica/i.test(text(a))) return "The words of the link should be Rhinox Scientifica.";
          return /^https:\/\/rhinoxscientifica\.com\/?$/i.test(a.getAttribute("href") ?? "") ? null : "The href should be https://rhinoxscientifica.com";
        },
      },
    ],
  },
  {
    id: "web-colour",
    title: "Colour the heading",
    task: "In the CSS, make every h1 red text and every paragraph dark grey (any dark grey), on a very light background for the whole page.",
    starterHtml: SHELL("    <h1>Colour me in</h1>\n    <p>This paragraph should be dark grey.</p>"),
    starterCss: "/* write your CSS here */\n",
    hints: ["h1 { color: red; }", "p { color: #333; }", "body { background-color: #f5f5f5; }"],
    checks: [
      {
        name: "Red heading, dark grey paragraph, light page",
        test: (doc, win) => {
          const h1 = doc.querySelector("h1");
          const p = doc.querySelector("p");
          const body = doc.body;
          if (!h1 || !p) return "Keep the h1 and the paragraph in the HTML.";
          const [r, g, b] = colour(win, h1, "color");
          if (!(r > 190 && g < 90 && b < 90)) return "The heading should be red.";
          const [pr, pg, pb] = colour(win, p, "color");
          if (!(pr < 90 && pg < 90 && pb < 90 && Math.abs(pr - pg) < 25 && Math.abs(pg - pb) < 25)) return "The paragraph should be dark grey.";
          const [br, bg, bb] = colour(win, body, "background-color");
          const transparent = win.getComputedStyle(body).getPropertyValue("background-color") === "rgba(0, 0, 0, 0)";
          return !transparent && br > 225 && bg > 225 && bb > 225 ? null : "The page background should be a very light colour.";
        },
      },
    ],
  },
  {
    id: "web-card",
    title: "A card",
    task: "Style the box with class card: a coloured background, at least 16px of padding, rounded corners (at least 8px), and a content width of no more than 400px (use width or max-width).",
    starterHtml: SHELL("    <div class=\"card\">\n      <h2>Rhino fact</h2>\n      <p>A rhino's horn is made of keratin, like your hair.</p>\n    </div>"),
    starterCss: ".card {\n  /* style the card */\n}\n",
    hints: [".card { background-color: #e5eefb; }", "padding: 20px; border-radius: 12px; max-width: 400px;"],
    checks: [
      {
        name: "The card has a background, padding, rounded corners and a limited width",
        test: (doc, win) => {
          const card = doc.querySelector(".card");
          if (!card) return "Keep the element with class card.";
          const bg = win.getComputedStyle(card).getPropertyValue("background-color");
          if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return "Give the card a background-color.";
          if (px(win, card, "padding-top") < 16 || px(win, card, "padding-left") < 16) return "The card needs at least 16px of padding on every side.";
          if (px(win, card, "border-top-left-radius") < 8) return "Round the corners: border-radius of at least 8px.";
          const content = card.getBoundingClientRect().width - px(win, card, "padding-left") - px(win, card, "padding-right") - px(win, card, "border-left-width") - px(win, card, "border-right-width");
          return content <= 400.5 ? null : "The card's width should be no more than 400px (try max-width: 400px).";
        },
      },
    ],
  },
  {
    id: "web-center",
    title: "Centre it",
    task: "Centre the heading text, and centre the box with class box in the middle of the page. The box is 300px wide, so use a margin on the left and right of auto.",
    starterHtml: SHELL("    <h1>Centred</h1>\n    <div class=\"box\">I live in the middle.</div>"),
    starterCss: ".box {\n  width: 300px;\n  background-color: #cfe2ff;\n  padding: 12px;\n}\n",
    hints: ["h1 { text-align: center; }", ".box { margin: 0 auto; }"],
    checks: [
      {
        name: "Heading text and box are centred",
        test: (doc, win) => {
          const h1 = doc.querySelector("h1");
          const box = doc.querySelector(".box");
          if (!h1 || !box) return "Keep the h1 and the box.";
          if (win.getComputedStyle(h1).textAlign !== "center") return "Centre the heading text with text-align.";
          const rect = box.getBoundingClientRect();
          const middle = rect.left + rect.width / 2;
          const page = doc.documentElement.clientWidth / 2;
          return Math.abs(middle - page) <= 2 ? null : "The box is not in the middle of the page yet.";
        },
      },
    ],
  },
  {
    id: "web-flex",
    title: "Three boxes in a row",
    task: "Put the three boxes with class item side by side in a row using flexbox on the container with class row, with at least 10px of gap between them.",
    starterHtml: SHELL("    <div class=\"row\">\n      <div class=\"item\">One</div>\n      <div class=\"item\">Two</div>\n      <div class=\"item\">Three</div>\n    </div>"),
    starterCss: ".row {\n}\n\n.item {\n  background-color: #cfe2ff;\n  padding: 16px;\n}\n",
    hints: [".row { display: flex; }", "gap: 12px;"],
    checks: [
      {
        name: "The boxes are in one row with a gap",
        test: (doc, win) => {
          const row = doc.querySelector(".row");
          const items = Array.from(doc.querySelectorAll(".item"));
          if (!row || items.length !== 3) return "Keep the row and its three items.";
          if (!/flex/.test(win.getComputedStyle(row).display)) return "Make the row a flex container: display: flex.";
          const tops = items.map((i) => Math.round(i.getBoundingClientRect().top));
          if (new Set(tops).size !== 1) return "The three boxes should be on one line.";
          const a = items[0].getBoundingClientRect();
          const b = items[1].getBoundingClientRect();
          return b.left - a.right >= 9.5 ? null : "Leave at least 10px between the boxes (gap).";
        },
      },
    ],
  },
  {
    id: "web-responsive",
    title: "Stack on a phone",
    task: "The three boxes sit in a row on a wide screen. Add a media query so that on screens 500px wide or narrower they stack in a column instead.",
    starterHtml: SHELL("    <div class=\"row\">\n      <div class=\"item\">One</div>\n      <div class=\"item\">Two</div>\n      <div class=\"item\">Three</div>\n    </div>"),
    starterCss: ".row {\n  display: flex;\n  gap: 12px;\n}\n\n.item {\n  flex: 1;\n  background-color: #cfe2ff;\n  padding: 16px;\n}\n\n/* add your media query below */\n",
    hints: ["@media (max-width: 500px) { ... }", "Inside it: .row { flex-direction: column; }"],
    checks: [
      {
        name: "In a row on a wide screen",
        width: 800,
        test: (doc) => {
          const tops = Array.from(doc.querySelectorAll(".item")).map((i) => Math.round(i.getBoundingClientRect().top));
          return tops.length === 3 && new Set(tops).size === 1 ? null : "On a wide screen the three boxes should stay in a row.";
        },
      },
      {
        name: "In a column on a narrow screen",
        width: 400,
        test: (doc) => {
          const tops = Array.from(doc.querySelectorAll(".item")).map((i) => Math.round(i.getBoundingClientRect().top));
          return tops.length === 3 && new Set(tops).size === 3 ? null : "On a screen 400px wide the boxes should be stacked, one above the other.";
        },
      },
    ],
  },
];

export function getWebExercise(id: string | null | undefined): WebExercise | undefined {
  return WEB_EXERCISES.find((e) => e.id === id);
}
