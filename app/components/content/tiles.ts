// Colour and glyph for a content row, from its subject and type.

export const SUBJECT_TONE: Record<string, { tint: string; ink: string }> = {
  chemistry: { tint: "#f1eafd", ink: "#6d28d9" },
  physics: { tint: "#fdf0e0", ink: "#c2610c" },
  biology: { tint: "#e6f6ef", ink: "#159570" },
  mathematics: { tint: "#e6f3fd", ink: "#0f6fde" },
  engineering: { tint: "#fbf3de", ink: "#a16207" },
  "earth-and-space": { tint: "#ecebfd", ink: "#4f46e5" },
  "environmental-science": { tint: "#e3f5f2", ink: "#0f8a7a" },
  coding: { tint: "#fdeaea", ink: "#d03a3a" },
  robotics: { tint: "#f1eafd", ink: "#6d28d9" },
};
export const DEFAULT_TONE = { tint: "#e8f4fd", ink: "#0f6fde" };

export function toneFor(subjects: string[]) {
  for (const s of subjects) if (SUBJECT_TONE[s]) return SUBJECT_TONE[s];
  return DEFAULT_TONE;
}

// 24x24 stroke paths.
export const TYPE_PATH: Record<string, string> = {
  lesson: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  activity: "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z",
  experiment: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  worksheet: "M7 3h8l4 4v14H7ZM15 3v4h4M10 12h6M10 16h6",
  assessment: "M9 4h6M10 2h4v4h-4ZM6 5h12v16H6ZM9 11l2 2 4-4M9 17h6",
  project: "M13 2 4 14h7l-1 8 9-12h-7Z",
  game: "M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14 13h-4l-1.8 2A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4ZM8 11v3M6.5 12.5h3",
  quiz: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  challenge: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z",
  experience: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  download: "M12 3v12M7 11l5 5 5-5M5 20h14",
  article: "M5 4h14v16H5ZM8 8h8M8 12h8M8 16h5",
  video: "M3 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3ZM17 10l4-2v8l-4-2",
  "teacher-resource": "M3 9l9-5 9 5-9 5Zm4 3v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5",
  "parent-resource": "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z",
  product: "M5 7h14l-1 13H6ZM9 7a3 3 0 0 1 6 0",
  certificate: "M4 4h16v12H4ZM8 20l4-3 4 3v-4H8ZM8 9h8",
  badge: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Z",
};

// For experiences, the subject says more than the type does.
export const SUBJECT_PATH: Record<string, string> = {
  chemistry: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  physics: "M13 2 4 14h7l-1 8 9-12h-7Z",
  biology: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14ZM5 19c2-4 5-7 9-9",
  mathematics: "M5 7h6M8 4v6M13 8h6M5 17h6M13 14l6 6M19 14l-6 6",
  engineering: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
  "earth-and-space": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  "environmental-science": "M12 21v-7M12 14c-4 0-6-3-6-7 4 0 6 3 6 7ZM12 14c4 0 6-3 6-6-4 0-6 2-6 6Z",
  coding: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  robotics: "M7 8h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM12 4v4M9 13h.01M15 13h.01M9.5 16.5h5",
};

export function pathFor(type: string, subjects: string[]): string {
  if (type === "experience") {
    for (const s of subjects) if (SUBJECT_PATH[s]) return SUBJECT_PATH[s];
  }
  return TYPE_PATH[type] ?? TYPE_PATH.lesson;
}
