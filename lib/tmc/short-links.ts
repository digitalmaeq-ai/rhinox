// Short links printed as QR codes in the Think • Move • Code! books.
//
// NEVER change or remove a short link once it is printed: books stay in
// classrooms for years. If a page moves, change only where it forwards to.
// next.config.ts turns this list into temporary (307) redirects, so a new
// destination takes effect on the next deploy.
//
// This file must not import anything: next.config.ts reads it.

export interface ShortLink {
  /** Printed path, e.g. /q/n1-t1-w1 */
  source: string;
  /** Where it forwards to on this site. */
  destination: string;
}

const nursery1: ShortLink[] = [];
for (let term = 1; term <= 3; term += 1) {
  for (let week = 1; week <= 13; week += 1) {
    nursery1.push({
      source: `/q/n1-t${term}-w${week}`,
      destination: `/think-move-code/nursery-1/term-${term}/week-${week}`,
    });
  }
}

export const SHORT_LINKS: ShortLink[] = [
  ...nursery1,
  // Bare /q opens the Nursery 1 page list.
  { source: "/q", destination: "/think-move-code/nursery-1" },
];
