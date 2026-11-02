// Runs a Web Studio exercise's checks. The learner's page is shown in a hidden iframe that may not run
// scripts (the sandbox has no allow-scripts). `allow-same-origin` is added only so this code can look at the
// finished layout; with scripts off, nothing in the page can use it.
import { buildPreview } from "./web";
import type { WebExercise } from "./exercises-web";

export type WebReport = { passed: boolean; lines: { name: string; ok: boolean; detail: string }[] };

function loadHidden(doc: string, width: number): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-same-origin");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:600px;border:0;visibility:hidden`;
    const timer = setTimeout(() => {
      frame.remove();
      reject(new Error("The preview took too long to load."));
    }, 5000);
    frame.onload = () => {
      clearTimeout(timer);
      resolve(frame);
    };
    frame.srcdoc = doc;
    document.body.appendChild(frame);
  });
}

export async function runWebChecks(exercise: WebExercise, html: string, css: string): Promise<WebReport> {
  const { doc } = buildPreview(html, css);
  const lines: WebReport["lines"] = [];
  for (const check of exercise.checks) {
    let frame: HTMLIFrameElement | null = null;
    try {
      frame = await loadHidden(doc, check.width ?? 800);
      const win = frame.contentWindow;
      const inner = frame.contentDocument;
      if (!win || !inner) throw new Error("The preview could not be read.");
      const problem = check.test(inner, win as unknown as Window);
      lines.push({ name: check.name, ok: problem === null, detail: problem ?? "" });
    } catch (error) {
      lines.push({ name: check.name, ok: false, detail: error instanceof Error ? error.message : "The check could not run." });
    } finally {
      frame?.remove();
    }
  }
  return { passed: lines.every((l) => l.ok), lines };
}
