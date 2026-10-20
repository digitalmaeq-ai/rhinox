// What a saved web page looks like inside My Projects.
import { getWebExercise } from "./exercises-web";
import { WEB_MAX_CSS_CHARS, WEB_MAX_HTML_CHARS } from "./web";

export interface WebProjectData {
  version: 1;
  exerciseId: string | null;
  html: string;
  css: string;
}

export function toWebProjectData(exerciseId: string | null, html: string, css: string): WebProjectData {
  return { version: 1, exerciseId, html, css };
}

export function parseWebProjectData(data: unknown): WebProjectData | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.version !== 1 || typeof d.html !== "string" || typeof d.css !== "string") return null;
  if (d.html.length > WEB_MAX_HTML_CHARS || d.css.length > WEB_MAX_CSS_CHARS) return null;
  const exerciseId = typeof d.exerciseId === "string" && getWebExercise(d.exerciseId) ? d.exerciseId : null;
  return { version: 1, exerciseId, html: d.html, css: d.css };
}
