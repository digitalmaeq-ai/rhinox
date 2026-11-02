"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

import { monaco } from "@/lib/code-studio/monaco-setup";

// Use the Monaco we bundled ourselves instead of the wrapper's default, which
// would fetch the editor from a public CDN.
loader.config({ monaco });

type Props = {
  /** The text the editor starts with. To load different text, give the editor a new `key`. */
  initialValue: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  /** Called when the learner presses Ctrl+Enter (Cmd+Enter on a Mac). */
  onRun?: () => void;
  /** The language for colouring. Python unless told otherwise. */
  language?: "python" | "cpp" | "html" | "css";
};

// The editor owns its text. It is deliberately not "controlled" by a value prop:
// feeding every keystroke back through React state makes the wrapper overwrite
// the editor with a slightly older copy, which drops characters when typing fast.
export default function PythonEditor({ initialValue, onChange, readOnly = false, onRun, language = "python" }: Props) {
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);
  return (
    <Editor
      language={language}
      theme="rhinox"
      defaultValue={initialValue}
      onMount={(editor) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.());
      }}
      onChange={(next) => onChange(next ?? "")}
      loading={<p style={{ color: "#cfe2ff", padding: 16 }}>Loading the editor…</p>}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 15,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: language === "python" ? 4 : 2,
        insertSpaces: true,
        wordWrap: "on",
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "line",
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        ariaLabel: `${language === "cpp" ? "Arduino" : language === "python" ? "Python" : language.toUpperCase()} code editor. Press Escape then Tab to leave the editor.`,
      }}
    />
  );
}
