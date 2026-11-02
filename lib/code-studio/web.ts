// Web Studio: turning a learner's HTML and CSS into a safe preview.
//
// The page is never run as a web page of this site. It is read with DOMParser (which runs nothing),
// cleaned, given a strict Content-Security-Policy as its very first element, and shown in an iframe
// with the `sandbox` attribute and no permission to run scripts. JavaScript does not run in Web Studio.
// This file only runs in the browser, because DOMParser is a browser feature.

export const WEB_MAX_HTML_CHARS = 40_000;
export const WEB_MAX_CSS_CHARS = 40_000;

/** What the preview page may load: its own inline styles and pictures that are part of the page (data: addresses). */
export const PREVIEW_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'";

const REMOVE = "script, link, base, meta[http-equiv], iframe, frame, frameset, object, embed, applet, form, noscript, template";

/** Takes out the parts of a stylesheet that would fetch something from outside the page. The policy blocks them too; this is the second layer. */
export function cleanCss(css: string): string {
  return css
    .slice(0, WEB_MAX_CSS_CHARS)
    .replace(/@import[^;{}]*;?/gi, "")
    .replace(/url\(\s*(?!['"]?\s*data:)[^)]*\)/gi, "none")
    .replace(/<\/style/gi, "<\\/style");
}

export type Preview = { doc: string; removed: string[] };

/** Builds the document shown in the preview iframe. Anything that could run code or reach out is removed and reported. */
export function buildPreview(html: string, css: string): Preview {
  const parsed = new DOMParser().parseFromString(html.slice(0, WEB_MAX_HTML_CHARS), "text/html");
  const removed: string[] = [];
  for (const node of Array.from(parsed.querySelectorAll(REMOVE))) {
    removed.push(node.tagName.toLowerCase());
    node.remove();
  }
  for (const element of Array.from(parsed.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || ((name === "href" || name === "src" || name === "action" || name === "formaction" || name === "xlink:href") && /^(javascript|vbscript):/.test(value))) {
        element.removeAttribute(attribute.name);
        removed.push(`${name} on ${element.tagName.toLowerCase()}`);
      }
      // A picture or font may only be one that is inside the page itself.
      if ((name === "src" || name === "srcset" || name === "poster") && !/^data:/.test(value)) {
        element.removeAttribute(attribute.name);
        removed.push(`${name} on ${element.tagName.toLowerCase()}`);
      }
    }
  }
  for (const own of Array.from(parsed.querySelectorAll("style"))) own.textContent = cleanCss(own.textContent ?? "");
  for (const element of Array.from(parsed.querySelectorAll("[style]"))) element.setAttribute("style", cleanCss(element.getAttribute("style") ?? ""));
  const style = parsed.createElement("style");
  style.textContent = cleanCss(css);
  parsed.head.appendChild(style);
  const meta = parsed.createElement("meta");
  meta.setAttribute("http-equiv", "Content-Security-Policy");
  meta.setAttribute("content", PREVIEW_CSP);
  parsed.head.insertBefore(meta, parsed.head.firstChild);
  const charset = parsed.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  parsed.head.insertBefore(charset, meta);
  return { doc: "<!doctype html>\n" + parsed.documentElement.outerHTML, removed: Array.from(new Set(removed)) };
}
