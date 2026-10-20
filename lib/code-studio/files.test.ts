// Run with:  npx tsx lib/code-studio/files.test.ts
import assert from "node:assert/strict";

import {
  FILES_KEY, cleanFiles, cleanUploadName, downloadInfo, filesFromSnapshot, filesSnapshot, isValidFileName,
  parseFiles, putFile, removeFile, saveFiles, totalChars, type KeyValue, type ProgramFile,
} from "./files";
import { MAX_FILE_CHARS, MAX_FILES, MAX_TOTAL_FILE_CHARS } from "./limits";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

function memory(): KeyValue & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

test("good names are accepted", () => {
  for (const name of ["results.csv", "test_log.txt", "a-b.c.json", "Data1.TSV", "x.md", "run.log"]) assert.ok(isValidFileName(name), name);
});

test("bad names are refused: folders, traversal, hidden, odd types, odd characters, long", () => {
  const bad = [
    "", ".csv", "../x.csv", "a/b.csv", "a\\b.csv", "/etc/passwd.txt", ".hidden.csv", "-x.csv", "x.py", "x.exe", "x",
    "my file.csv", "naïve.csv", "x.csv ", "a".repeat(41) + ".csv", "x.csv\u0000", "con<>.csv",
  ];
  for (const name of bad) assert.ok(!isValidFileName(name), JSON.stringify(name));
  assert.ok(!isValidFileName(42));
  assert.ok(!isValidFileName(null));
});

test("uploaded names are cleaned: folders cut off, spaces and symbols fixed, long names shortened", () => {
  assert.equal(cleanUploadName("C:\\Users\\Ada\\My Results (1).csv"), "My_Results_1.csv");
  assert.equal(cleanUploadName("/home/ada/data.CSV"), "data.CSV");
  assert.equal(cleanUploadName("../../x.txt"), "x.txt");
  assert.equal(cleanUploadName("..hidden.csv"), "hidden.csv");
  assert.equal(cleanUploadName("photo.png"), null);
  assert.equal(cleanUploadName(""), null);
  const long = cleanUploadName("a".repeat(100) + ".csv");
  assert.ok(long && long.length === 40 && long.endsWith(".csv"));
});

test("cleanFiles keeps good files and says why it dropped the rest", () => {
  const { files, notes } = cleanFiles([
    { name: "a.csv", text: "1,2\n" },
    { name: "a.csv", text: "again" },
    { name: "../b.csv", text: "x" },
    { name: "c.exe", text: "x" },
    { name: "d.txt", text: 5 },
    { name: "e.txt", text: "x".repeat(MAX_FILE_CHARS + 1) },
    null,
    "text",
  ]);
  assert.deepEqual(files, [{ name: "a.csv", text: "1,2\n" }]);
  assert.equal(notes.length, 4);
  assert.deepEqual(cleanFiles("nope"), { files: [], notes: [] });
});

test("the number of files and the total size are limited", () => {
  const many = Array.from({ length: MAX_FILES + 5 }, (_, i) => ({ name: `f${i}.txt`, text: "x" }));
  assert.equal(cleanFiles(many).files.length, MAX_FILES);
  const big = Array.from({ length: 8 }, (_, i) => ({ name: `big${i}.txt`, text: "x".repeat(MAX_FILE_CHARS) }));
  const cleaned = cleanFiles(big);
  assert.ok(totalChars(cleaned.files) <= MAX_TOTAL_FILE_CHARS);
  assert.equal(cleaned.files.length, 5);
});

test("putFile adds, replaces, sorts and refuses too much", () => {
  let files: ProgramFile[] = [];
  const add = (name: string, text: string) => {
    const result = putFile(files, { name, text });
    assert.ok("files" in result, JSON.stringify(result));
    files = result.files;
  };
  add("b.csv", "1");
  add("a.csv", "2");
  add("b.csv", "3");
  assert.deepEqual(files.map((f) => `${f.name}=${f.text}`), ["a.csv=2", "b.csv=3"]);
  assert.ok("error" in putFile(files, { name: "bad name.csv", text: "" }));
  assert.ok("error" in putFile(files, { name: "x.csv", text: "x".repeat(MAX_FILE_CHARS + 1) }));
  const full = Array.from({ length: MAX_FILES }, (_, i) => ({ name: `f${i}.txt`, text: "" }));
  assert.ok("error" in putFile(full, { name: "extra.txt", text: "" }));
  assert.ok("files" in putFile(full, { name: "f0.txt", text: "replaced" }), "replacing a file when full is fine");
  assert.deepEqual(removeFile(files, "a.csv").map((f) => f.name), ["b.csv"]);
});

test("files are stored, read back and cleaned when storage holds junk", () => {
  const kv = memory();
  assert.equal(saveFiles([{ name: "a.csv", text: "1,2\n" }], kv), true);
  assert.deepEqual(filesFromSnapshot(filesSnapshot(kv)), [{ name: "a.csv", text: "1,2\n" }]);
  kv.data[FILES_KEY] = "{not json";
  assert.deepEqual(parseFiles(kv.data[FILES_KEY]), []);
  kv.data[FILES_KEY] = JSON.stringify([{ name: "../evil.csv", text: "x" }, { name: "ok.txt", text: "y" }]);
  assert.deepEqual(parseFiles(kv.data[FILES_KEY]), [{ name: "ok.txt", text: "y" }]);
  assert.equal(filesSnapshot(null), "");
  assert.equal(saveFiles([], null), false);
  const full: KeyValue = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  assert.equal(saveFiles([{ name: "a.csv", text: "x" }], full), false);
});

test("download info: CSV gets a byte-order mark and a CSV type", () => {
  const csv = downloadInfo({ name: "results.csv", text: "a,b\n" });
  assert.equal(csv.filename, "results.csv");
  assert.ok(csv.type.startsWith("text/csv"));
  assert.equal(csv.content, "\ufeffa,b\n");
  assert.ok(downloadInfo({ name: "n.txt", text: "x" }).type.startsWith("text/plain"));
  assert.ok(downloadInfo({ name: "n.json", text: "{}" }).type.startsWith("application/json"));
});

console.log(`\n${passed} tests passed`);
