// Think • Move • Code! week pages (the pages the book QR codes open).

export interface TmcTerm {
  term: number;
  title: string;
}

export interface TmcSign {
  word: string;
  say: string;
  sign: string;
}

export interface TmcWeek {
  term: number;
  week: number;
  title: string;
  /** Week type from the curriculum, e.g. "Themed learning" or "Revision". */
  kind: string;
  /** The child's "I can" goal; empty for assessment and showcase weeks. */
  goal: string;
  /** Parent note: what the child learned this week. */
  learned: string;
  tryHeading: string;
  tryAtHome: string[];
  keyWords: string[];
  signs: TmcSign[];
  tip: string;
  /** Showcase weeks only: the family invitation text. */
  invite: string | null;
  rhinobot: string;
  /** Title of the week's screen exercise. */
  screenGame: string;
  cardsFile: string;
  pages: number;
  cardsKB: number;
  /** Activity Book page with the QR code; null for weeks without one (Weeks 12 and 13). */
  activityBookPage: number | null;
  teacherGuidePage: number;
}
