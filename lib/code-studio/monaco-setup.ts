// A lean, self-hosted Monaco for Rhinox Code Studio.
//
// Monaco ships a "full" bundle with language servers for TypeScript, CSS, HTML
// and JSON (several megabytes of workers we do not need). Here we load only the
// editor core, Python colouring and the handful of editing features a learner
// uses. Next.js bundles it into our own build output: no CDN, no copied files.
import * as monaco from "monaco-editor/editor/editor.api.js";

import "monaco-editor/editor/browser/coreCommands.js";
import "monaco-editor/editor/browser/widget/codeEditor/codeEditorWidget.js";
import "monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/editor/contrib/clipboard/browser/clipboard.js";
import "monaco-editor/editor/contrib/comment/browser/comment.js";
import "monaco-editor/editor/contrib/contextmenu/browser/contextmenu.js";
import "monaco-editor/editor/contrib/cursorUndo/browser/cursorUndo.js";
import "monaco-editor/editor/contrib/find/browser/findController.js";
import "monaco-editor/editor/contrib/folding/browser/folding.js";
import "monaco-editor/editor/contrib/indentation/browser/indentation.js";
import "monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js";
import "monaco-editor/editor/contrib/wordHighlighter/browser/wordHighlighter.js";
import "monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js";
import "monaco-editor/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
import "monaco-editor/languages/definitions/python/register.js";

// Monaco asks for a worker for text diffing and word lookups. This one is our
// own file, bundled by Next.js, and it has no network access of its own beyond
// the same origin.
(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker: () => new Worker(new URL("./editor.worker.ts", import.meta.url), { type: "module" }),
};

monaco.editor.defineTheme("rhinox", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "7f93b2", fontStyle: "italic" },
    { token: "keyword", foreground: "6fb4ff" },
    { token: "string", foreground: "ffd27a" },
    { token: "number", foreground: "8fe3c2" },
  ],
  colors: {
    "editor.background": "#0b1d3a",
    "editor.lineHighlightBackground": "#12315f",
    "editorLineNumber.foreground": "#6f87ab",
    "editorLineNumber.activeForeground": "#cfe2ff",
    "editorCursor.foreground": "#ffb020",
    "editor.selectionBackground": "#245aa8aa",
  },
});

export { monaco };
