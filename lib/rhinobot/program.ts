// Converts between Blockly's saved JSON and RhinoBot's own programme tree, and
// provides small helpers for authoring programmes in code (reference solutions,
// debugging challenges, tests). Pure data: it never imports Blockly.

import type { Cond, Stmt } from "./types";

type BlockJson = {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  fields?: Record<string, unknown>;
  inputs?: Record<string, { block?: BlockJson; shadow?: BlockJson }>;
  next?: { block?: BlockJson };
  deletable?: boolean;
  movable?: boolean;
};

export interface WorkspaceJson {
  blocks?: { languageVersion?: number; blocks?: BlockJson[] };
}

const SIMPLE: Record<string, Stmt["t"]> = {
  rb_forward: "forward",
  rb_turn_left: "left",
  rb_turn_right: "right",
  rb_wait: "wait",
  rb_pickup: "pickup",
  rb_drop: "drop",
  rb_activate: "activate",
};

const SIMPLE_TYPE: Record<string, string> = Object.fromEntries(Object.entries(SIMPLE).map(([type, t]) => [t, type]));

const COND_LEAF: Record<string, Cond["t"]> = {
  rb_obstacle_ahead: "obstacle",
  rb_path_clear: "clear",
  rb_at_goal: "atGoal",
  rb_item_here: "itemHere",
  rb_holding: "holding",
  rb_at_base: "atBase",
};

const COND_LEAF_TYPE: Record<string, string> = Object.fromEntries(Object.entries(COND_LEAF).map(([type, t]) => [t, type]));

function condFromBlock(block: BlockJson | undefined): Cond | undefined {
  if (!block) return undefined;
  if (COND_LEAF[block.type]) return { t: COND_LEAF[block.type] } as Cond;
  const a = condFromBlock(block.inputs?.A?.block);
  const b = condFromBlock(block.inputs?.B?.block);
  if (block.type === "rb_and") return { t: "and", a, b };
  if (block.type === "rb_or") return { t: "or", a, b };
  if (block.type === "rb_not") return { t: "not", a };
  return undefined;
}

function chainFromBlock(first: BlockJson | undefined): Stmt[] {
  const list: Stmt[] = [];
  for (let block = first; block; block = block.next?.block) {
    const id = block.id;
    if (SIMPLE[block.type]) {
      list.push({ id, t: SIMPLE[block.type] } as Stmt);
    } else if (block.type === "rb_repeat") {
      list.push({ id, t: "repeat", n: Number(block.fields?.TIMES ?? 1), body: chainFromBlock(block.inputs?.DO?.block) });
    } else if (block.type === "rb_repeat_until") {
      list.push({ id, t: "until", cond: condFromBlock(block.inputs?.COND?.block), body: chainFromBlock(block.inputs?.DO?.block) });
    } else if (block.type === "rb_if") {
      list.push({ id, t: "if", cond: condFromBlock(block.inputs?.COND?.block), then: chainFromBlock(block.inputs?.DO?.block) });
    } else if (block.type === "rb_if_else") {
      list.push({
        id,
        t: "if",
        cond: condFromBlock(block.inputs?.COND?.block),
        then: chainFromBlock(block.inputs?.DO?.block),
        else: chainFromBlock(block.inputs?.ELSE?.block),
      });
    }
  }
  return list;
}

function countBlockJson(first: BlockJson | undefined): number {
  let total = 0;
  for (let block = first; block; block = block.next?.block) {
    total += 1;
    for (const input of Object.values(block.inputs ?? {})) {
      total += countBlockJson(input.block);
    }
  }
  return total;
}

export interface ReadProgram {
  program: Stmt[];
  /** Blocks connected to "when programme starts" (the start block itself is not counted). */
  blockCount: number;
  /** Blocks that are on the workspace but not connected to the start block. */
  detached: number;
  hasStart: boolean;
}

export function readWorkspace(json: WorkspaceJson | null | undefined): ReadProgram {
  const tops = json?.blocks?.blocks ?? [];
  const start = tops.find((block) => block.type === "rb_start");
  const program = chainFromBlock(start?.next?.block);
  const blockCount = countBlockJson(start?.next?.block);
  const detached = tops.filter((block) => block !== start).reduce((sum, block) => sum + countBlockJson(block), 0);
  return { program, blockCount, detached, hasStart: Boolean(start) };
}

export function countProgramBlocks(program: Stmt[]): number {
  const cond = (c?: Cond): number => (c ? 1 + (("a" in c ? cond(c.a) : 0) + ("b" in c ? cond(c.b) : 0)) : 0);
  let total = 0;
  for (const stmt of program) {
    total += 1;
    if (stmt.t === "repeat") total += countProgramBlocks(stmt.body);
    if (stmt.t === "until") total += cond(stmt.cond) + countProgramBlocks(stmt.body);
    if (stmt.t === "if") total += cond(stmt.cond) + countProgramBlocks(stmt.then) + countProgramBlocks(stmt.else ?? []);
  }
  return total;
}

// ---------- programme tree -> Blockly JSON (for loading challenges) ----------

function condToJson(cond: Cond | undefined): BlockJson | undefined {
  if (!cond) return undefined;
  if (cond.t === "and" || cond.t === "or") {
    const inputs: BlockJson["inputs"] = {};
    const a = condToJson(cond.a);
    const b = condToJson(cond.b);
    if (a) inputs.A = { block: a };
    if (b) inputs.B = { block: b };
    return { type: cond.t === "and" ? "rb_and" : "rb_or", inputs };
  }
  if (cond.t === "not") {
    const a = condToJson(cond.a);
    return { type: "rb_not", inputs: a ? { A: { block: a } } : {} };
  }
  return { type: COND_LEAF_TYPE[cond.t] };
}

function chainToJson(list: Stmt[]): BlockJson | undefined {
  let head: BlockJson | undefined;
  let tail: BlockJson | undefined;
  for (const stmt of list) {
    const block: BlockJson = { type: "" };
    if (stmt.t === "repeat") {
      block.type = "rb_repeat";
      block.fields = { TIMES: stmt.n };
      const body = chainToJson(stmt.body);
      if (body) block.inputs = { DO: { block: body } };
    } else if (stmt.t === "until") {
      block.type = "rb_repeat_until";
      block.inputs = {};
      const cond = condToJson(stmt.cond);
      if (cond) block.inputs.COND = { block: cond };
      const body = chainToJson(stmt.body);
      if (body) block.inputs.DO = { block: body };
    } else if (stmt.t === "if") {
      block.type = stmt.else ? "rb_if_else" : "rb_if";
      block.inputs = {};
      const cond = condToJson(stmt.cond);
      if (cond) block.inputs.COND = { block: cond };
      const then = chainToJson(stmt.then);
      if (then) block.inputs.DO = { block: then };
      const other = stmt.else ? chainToJson(stmt.else) : undefined;
      if (other) block.inputs.ELSE = { block: other };
    } else {
      block.type = SIMPLE_TYPE[stmt.t];
    }
    if (!head) head = block;
    if (tail) tail.next = { block };
    tail = block;
  }
  return head;
}

export function programToWorkspaceJson(program: Stmt[]): WorkspaceJson {
  const start: BlockJson = { type: "rb_start", x: 24, y: 24, deletable: false };
  const first = chainToJson(program);
  if (first) start.next = { block: first };
  return { blocks: { languageVersion: 0, blocks: [start] } };
}

export function emptyWorkspaceJson(): WorkspaceJson {
  return programToWorkspaceJson([]);
}

// ---------- authoring helpers ----------

export const F = (): Stmt => ({ t: "forward" });
export const L = (): Stmt => ({ t: "left" });
export const R = (): Stmt => ({ t: "right" });
export const WAIT = (): Stmt => ({ t: "wait" });
export const PICK = (): Stmt => ({ t: "pickup" });
export const DROP = (): Stmt => ({ t: "drop" });
export const ACTIVATE = (): Stmt => ({ t: "activate" });
export const repeat = (n: number, ...body: Stmt[]): Stmt => ({ t: "repeat", n, body });
export const until = (cond: Cond, ...body: Stmt[]): Stmt => ({ t: "until", cond, body });
export const ifThen = (cond: Cond, ...then: Stmt[]): Stmt => ({ t: "if", cond, then });
export const ifElse = (cond: Cond, then: Stmt[], other: Stmt[]): Stmt => ({ t: "if", cond, then, else: other });
export const c = (t: "obstacle" | "clear" | "atGoal" | "itemHere" | "holding" | "atBase"): Cond => ({ t });
export const not = (a: Cond): Cond => ({ t: "not", a });
export const and = (a: Cond, b: Cond): Cond => ({ t: "and", a, b });
export const or = (a: Cond, b: Cond): Cond => ({ t: "or", a, b });
