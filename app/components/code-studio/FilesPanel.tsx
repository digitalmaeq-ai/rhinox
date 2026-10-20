"use client";

import { useRef, useState } from "react";

import {
  FILE_NAME_RULE,
  cleanUploadName,
  describeSize,
  downloadInfo,
  putFile,
  removeFile,
  totalChars,
  type ProgramFile,
} from "@/lib/code-studio/files";
import { FILE_EXTENSIONS, MAX_FILES, MAX_FILE_CHARS, MAX_TOTAL_FILE_CHARS } from "@/lib/code-studio/limits";

import styles from "./CodeStudio.module.css";

type Props = {
  files: ProgramFile[];
  /** Called with the new list whenever the learner adds or deletes a file. Returns false if it could not be kept. */
  onChange: (files: ProgramFile[]) => boolean;
  /** Files cannot be changed while a program is running, because the run already has its copy. */
  busy: boolean;
};

const PREVIEW_CHARS = 6000;

// "My files": the files a program can open() in Code Studio. They stay in this
// browser only. The learner can look at them, download them, add a CSV of their
// own, and delete them.
export default function FilesPanel({ files, onChange, busy }: Props) {
  const [viewing, setViewing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null); // a file name, or "*" for all
  const [message, setMessage] = useState("");
  const picker = useRef<HTMLInputElement | null>(null);

  const viewed = files.find((f) => f.name === viewing) ?? null;

  function keep(next: ProgramFile[], success: string) {
    setMessage(onChange(next) ? success : "Could not keep the files. Your browser may be blocking storage.");
  }

  function remove(name: string) {
    setConfirming(null);
    keep(removeFile(files, name), `Deleted ${name}.`);
  }

  function removeAll() {
    setConfirming(null);
    setViewing(null);
    keep([], "All files deleted.");
  }

  function download(file: ProgramFile) {
    const info = downloadInfo(file);
    const url = URL.createObjectURL(new Blob([info.content], { type: info.type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = info.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function upload(list: FileList | null) {
    if (!list || list.length === 0) return;
    let next = files;
    const notes: string[] = [];
    let added = 0;
    for (const file of Array.from(list)) {
      const name = cleanUploadName(file.name);
      if (!name) {
        notes.push(`${file.name.slice(0, 40)}: cannot be used. ${FILE_NAME_RULE}`);
        continue;
      }
      // Check the size before reading, so a huge file is never loaded into memory.
      if (file.size > MAX_FILE_CHARS * 4) {
        notes.push(`${name}: too big. A file can hold at most ${MAX_FILE_CHARS.toLocaleString("en")} characters.`);
        continue;
      }
      let text: string;
      try {
        text = (await file.text()).replace(/^﻿/, "");
      } catch {
        notes.push(`${name}: could not be read.`);
        continue;
      }
      if (text.includes("\u0000")) {
        notes.push(`${name}: is not a text file.`);
        continue;
      }
      const result = putFile(next, { name, text });
      if ("error" in result) notes.push(result.error);
      else {
        next = result.files;
        added += 1;
      }
    }
    if (picker.current) picker.current.value = "";
    if (added > 0) {
      if (!onChange(next)) {
        setMessage("Could not keep the files. Your browser may be blocking storage.");
        return;
      }
    }
    setMessage([added > 0 ? `Added ${added} file${added === 1 ? "" : "s"}.` : "", ...notes].filter(Boolean).join(" "));
  }

  return (
    <details className={styles.files}>
      <summary>
        My files <span className={styles.filesCount}>({files.length})</span>
      </summary>
      <div className={styles.filesBody}>
        <p className={styles.filesIntro}>
          Programs can read and write these with <code>open()</code>, for example <code>open(&quot;results.csv&quot;, &quot;a&quot;)</code>. They stay in this
          browser only. You can keep {MAX_FILES} files ({MAX_TOTAL_FILE_CHARS.toLocaleString("en")} characters in all).
        </p>

        {files.length === 0 ? (
          <p className={styles.filesEmpty}>No files yet. Run a program that writes one, or add a CSV below.</p>
        ) : (
          <ul className={styles.fileList}>
            {files.map((file) => (
              <li key={file.name}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{describeSize(file)}</span>
                <span className={styles.fileActions}>
                  <button type="button" onClick={() => setViewing(viewing === file.name ? null : file.name)} aria-pressed={viewing === file.name}>
                    {viewing === file.name ? "Hide" : "View"}
                  </button>
                  <button type="button" onClick={() => download(file)}>
                    Download
                  </button>
                  {confirming === file.name ? (
                    <>
                      <button type="button" className={styles.danger} onClick={() => remove(file.name)} disabled={busy}>
                        Yes, delete
                      </button>
                      <button type="button" onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirming(file.name)} disabled={busy} aria-label={`Delete ${file.name}`}>
                      Delete
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}

        {viewed && (
          <div className={styles.fileView}>
            <h3>{viewed.name}</h3>
            <pre tabIndex={0} aria-label={`Contents of ${viewed.name}`}>
              {viewed.text === "" ? "(empty)" : viewed.text.slice(0, PREVIEW_CHARS)}
            </pre>
            {viewed.text.length > PREVIEW_CHARS && (
              <p className={styles.filesEmpty}>
                Showing the first {PREVIEW_CHARS.toLocaleString("en")} of {viewed.text.length.toLocaleString("en")} characters. Download the file to see all of it.
              </p>
            )}
          </div>
        )}

        <div className={styles.fileTools}>
          <label className={styles.upload}>
            <span>Add a file from your computer ({FILE_EXTENSIONS.join(", ")})</span>
            <input
              ref={picker}
              type="file"
              multiple
              accept={FILE_EXTENSIONS.join(",")}
              disabled={busy}
              onChange={(event) => void upload(event.target.files)}
            />
          </label>
          {files.length > 0 &&
            (confirming === "*" ? (
              <span className={styles.fileActions}>
                <button type="button" className={styles.danger} onClick={removeAll} disabled={busy}>
                  Yes, delete all {files.length}
                </button>
                <button type="button" onClick={() => setConfirming(null)}>
                  Keep them
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming("*")} disabled={busy}>
                Delete all files
              </button>
            ))}
        </div>
        {totalChars(files) > 0 && (
          <p className={styles.filesEmpty}>
            Using {totalChars(files).toLocaleString("en")} of {MAX_TOTAL_FILE_CHARS.toLocaleString("en")} characters.
          </p>
        )}
        <p className={styles.filesMessage} role="status">
          {message}
        </p>
      </div>
    </details>
  );
}
