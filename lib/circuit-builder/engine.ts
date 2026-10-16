// Circuit Builder engine: a tiny, honest circuit model.
//
// The board is one loop with five slots. Three slots (s1, s3, s5) are in
// series. The other two (s2, s4) are two branches in PARALLEL with each
// other, sitting between the same two junctions. An empty branch slot simply
// means "no branch there"; an empty series slot is a gap in the loop.

export type PartKind = "cell" | "bulb" | "switch" | "buzzer" | "resistor" | "wire";

export interface Part {
  kind: PartKind;
  /** Switches only: true when closed (current can pass). */
  closed?: boolean;
}

export type SlotId = "s1" | "s2" | "s3" | "s4" | "s5";

export type Board = Record<SlotId, Part | null>;

export const SERIES_SLOTS: SlotId[] = ["s1", "s3", "s5"];
export const BRANCH_SLOTS: SlotId[] = ["s2", "s4"];
export const ALL_SLOTS: SlotId[] = ["s1", "s2", "s3", "s4", "s5"];

export const CELL_VOLTS = 1.5;
/** A bulb with more than this across it burns out. */
export const BLOW_VOLTS = 3.5;
/** Volts across a bulb for full brightness. */
const FULL_BRIGHT_VOLTS = 2.4;
/** Volts across a buzzer for it to sound. */
export const BUZZ_VOLTS = 1;

const RESISTANCE: Record<PartKind, number> = {
  cell: 0.1, // internal resistance
  bulb: 2,
  switch: 0.01,
  buzzer: 3,
  resistor: 4,
  wire: 0.01,
};

export const PART_LABEL: Record<PartKind, string> = {
  cell: "Cell",
  bulb: "Bulb",
  switch: "Switch",
  buzzer: "Buzzer",
  resistor: "Resistor",
  wire: "Wire",
};

export const emptyBoard = (): Board => ({ s1: null, s2: null, s3: null, s4: null, s5: null });

export interface SlotReading {
  /** Current through this part, in amps. */
  current: number;
  /** Voltage across this part, in volts. */
  volts: number;
  /** Bulbs: 0 (off) to 1 (full). */
  brightness: number;
  blown: boolean;
  buzzing: boolean;
}

export type Status =
  | "no-power"
  | "gap"
  | "switch-open"
  | "short"
  | "blown"
  | "working";

export interface Analysis {
  status: Status;
  message: string;
  /** Slot to highlight when something is wrong (a gap or an open switch). */
  problemSlot: SlotId | null;
  cells: number;
  volts: number;
  /** Total current leaving the cells, in amps. */
  current: number;
  slots: Record<SlotId, SlotReading>;
  /** Number of bulbs glowing. */
  bulbsLit: number;
  /** True when electric current is flowing round the loop. */
  flowing: boolean;
}

const blankReading = (): SlotReading => ({ current: 0, volts: 0, brightness: 0, blown: false, buzzing: false });

const blankSlots = (): Record<SlotId, SlotReading> => ({
  s1: blankReading(),
  s2: blankReading(),
  s3: blankReading(),
  s4: blankReading(),
  s5: blankReading(),
});

const partOpen = (part: Part | null, blown: boolean) =>
  part === null || (part.kind === "switch" && !part.closed) || blown;

function solve(board: Board, blownSlots: Set<SlotId>) {
  // Gap in the series loop?
  for (const slot of SERIES_SLOTS) {
    if (partOpen(board[slot], blownSlots.has(slot))) return { open: slot } as const;
  }

  // Parallel group: which branches can carry current?
  const live = BRANCH_SLOTS.filter((slot) => board[slot] && !partOpen(board[slot], blownSlots.has(slot)));
  if (live.length === 0) {
    const firstFilled = BRANCH_SLOTS.find((slot) => board[slot]) ?? "s2";
    return { open: firstFilled } as const;
  }

  const seriesR = SERIES_SLOTS.reduce((sum, slot) => sum + RESISTANCE[board[slot]!.kind], 0);
  const conductance = live.reduce((sum, slot) => sum + 1 / RESISTANCE[board[slot]!.kind], 0);
  const parallelR = 1 / conductance;
  const cells = SERIES_SLOTS.filter((slot) => board[slot]!.kind === "cell").length;
  const volts = cells * CELL_VOLTS;
  const totalR = seriesR + parallelR;
  const current = volts / totalR;
  const groupVolts = current * parallelR;

  return { open: null, live, cells, volts, totalR, current, groupVolts, seriesR } as const;
}

export function analyse(board: Board): Analysis {
  const slots = blankSlots();
  const base = { cells: 0, volts: 0, current: 0, slots, bulbsLit: 0, flowing: false };

  // Cells only work in the series slots; one in a branch is just a dead part.
  const cellsOnBoard = SERIES_SLOTS.filter((slot) => board[slot]?.kind === "cell").length;

  let blown = new Set<SlotId>();
  let result = solve(board, blown);

  // A bulb with too much voltage across it blows (and breaks the circuit).
  // Work out who would blow, then solve again without them.
  if (!result.open) {
    const first = result;
    const nowBlown = new Set<SlotId>();
    for (const slot of ALL_SLOTS) {
      const part = board[slot];
      if (part?.kind !== "bulb") continue;
      const across = SERIES_SLOTS.includes(slot)
        ? first.current * RESISTANCE.bulb
        : first.groupVolts;
      if (across > BLOW_VOLTS) nowBlown.add(slot);
    }
    if (nowBlown.size > 0) {
      blown = nowBlown;
      result = solve(board, blown);
      for (const slot of nowBlown) slots[slot].blown = true;
      if (result.open) {
        return {
          ...base,
          cells: cellsOnBoard,
          volts: cellsOnBoard * CELL_VOLTS,
          status: "blown",
          message: "Too much voltage: a bulb has blown and broken the circuit. Take a cell out.",
          problemSlot: [...nowBlown][0],
        };
      }
    }
  }

  if (result.open) {
    const slot = result.open;
    const part = board[slot];
    const isSwitch = part?.kind === "switch";
    return {
      ...base,
      cells: cellsOnBoard,
      volts: cellsOnBoard * CELL_VOLTS,
      status: isSwitch ? "switch-open" : "gap",
      message: isSwitch
        ? "The switch is open, so the loop is broken. Click the switch to close it."
        : "There is a gap in the loop. Current can only flow round a complete circuit.",
      problemSlot: slot,
    };
  }

  const { cells, volts, current, groupVolts, live, seriesR } = result;

  if (cells === 0) {
    return {
      ...base,
      status: "no-power",
      message: "The loop is complete, but nothing pushes the current. Add a cell.",
      problemSlot: null,
    };
  }

  // Fill in readings.
  for (const slot of SERIES_SLOTS) {
    const part = board[slot]!;
    slots[slot].current = current;
    slots[slot].volts = part.kind === "cell" ? 0 : current * RESISTANCE[part.kind];
  }
  for (const slot of live) {
    const part = board[slot]!;
    slots[slot].current = groupVolts / RESISTANCE[part.kind];
    slots[slot].volts = groupVolts;
  }
  let bulbsLit = 0;
  for (const slot of ALL_SLOTS) {
    const part = board[slot];
    const reading = slots[slot];
    if (part?.kind === "bulb" && !reading.blown) {
      reading.brightness = Math.max(0, Math.min(1, (reading.volts - 0.3) / (FULL_BRIGHT_VOLTS - 0.3)));
      if (reading.brightness > 0.05) bulbsLit += 1;
    }
    if (part?.kind === "buzzer") reading.buzzing = reading.volts >= BUZZ_VOLTS;
  }

  // Short circuit: almost nothing but wire and cells in the path.
  const loadR = seriesR - SERIES_SLOTS.filter((s) => board[s]!.kind === "cell").length * RESISTANCE.cell
    + 1 / live.reduce((sum, slot) => sum + 1 / RESISTANCE[board[slot]!.kind], 0);
  if (loadR < 0.2) {
    return {
      ...base,
      cells,
      volts,
      current,
      slots,
      bulbsLit,
      flowing: true,
      status: "short",
      message: "Short circuit! The current takes an easy path with no bulb or resistor in the way. It is huge, so the wire would overheat. Take the shortcut out.",
      problemSlot: live.find((s) => board[s]!.kind === "wire") ?? null,
    };
  }

  const bulbCount = ALL_SLOTS.filter((s) => board[s]?.kind === "bulb").length;
  const message =
    bulbCount > 0
      ? bulbsLit === bulbCount
        ? "The circuit is complete and current is flowing."
        : "Current is flowing, but a bulb is too dim to glow."
      : "The circuit is complete and current is flowing.";

  return {
    status: "working",
    message,
    problemSlot: null,
    cells,
    volts,
    current,
    slots,
    bulbsLit,
    flowing: true,
  };
}

// ---------------------------------------------------------------------------
// Challenges. Each one is a required task whose id matches the task id in
// content/experiences/circuit-builder.ts.
// ---------------------------------------------------------------------------

export interface ChallengeContext {
  board: Board;
  analysis: Analysis;
  /** True once the learner has clicked a switch to change it. */
  switchToggled: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  goal: string;
  hint: string;
  met: (ctx: ChallengeContext) => boolean;
}

const parts = (board: Board, kind: PartKind) => ALL_SLOTS.filter((slot) => board[slot]?.kind === kind);

export const challenges: Challenge[] = [
  {
    id: "light-bulb",
    title: "Light the bulb",
    goal: "Light a bulb. Build a complete loop with a cell, a bulb and wire.",
    hint: "Put the bulb in the top slot, a cell in a side slot, and wire pieces in the other slots. The loop must have no gaps.",
    met: ({ board, analysis }) => analysis.flowing && parts(board, "bulb").some((s) => analysis.slots[s].brightness > 0.05),
  },
  {
    id: "switch",
    title: "Add a switch",
    goal: "Put a switch in the loop, then close it to turn the bulb on.",
    hint: "Swap a wire piece for a switch. It starts open. Click it to close it, and click again to see the bulb go out.",
    met: ({ board, analysis, switchToggled }) =>
      switchToggled &&
      analysis.flowing &&
      parts(board, "switch").length > 0 &&
      parts(board, "bulb").some((s) => analysis.slots[s].brightness > 0.05),
  },
  {
    id: "brighter",
    title: "Make it brighter",
    goal: "Get a bulb to full brightness without blowing it.",
    hint: "More cells means more voltage. Try two cells, but not three: that is too much for one bulb.",
    met: ({ board, analysis }) => parts(board, "bulb").some((s) => analysis.slots[s].brightness >= 0.9 && !analysis.slots[s].blown),
  },
  {
    id: "buzzer-bulb",
    title: "Bulb and buzzer",
    goal: "Make a bulb glow and a buzzer sound in the same loop.",
    hint: "Both must be in the loop together, so the same current passes through each. Two cells helps.",
    met: ({ board, analysis }) =>
      parts(board, "buzzer").some((s) => analysis.slots[s].buzzing) &&
      parts(board, "bulb").some((s) => analysis.slots[s].brightness > 0.05),
  },
  {
    id: "series-dim",
    title: "Two bulbs in series",
    goal: "Light two bulbs in the same line. Watch how bright each one is.",
    hint: "Use one cell. Put one bulb in the top slot and another in a side or bottom slot. They share the voltage, so each is dimmer.",
    met: ({ board, analysis }) => {
      const lit = parts(board, "bulb").filter((s) => analysis.slots[s].brightness > 0.05);
      const sideBySide = board.s2?.kind === "bulb" && board.s4?.kind === "bulb";
      return lit.length >= 2 && !sideBySide && lit.every((s) => analysis.slots[s].brightness < 0.7);
    },
  },
  {
    id: "parallel",
    title: "Bulbs in parallel",
    goal: "Light two bulbs side by side, one in each top slot, both at full brightness.",
    hint: "Use both top slots for bulbs. Each branch gets the full voltage. Two cells make both bright.",
    met: ({ board, analysis }) =>
      board.s2?.kind === "bulb" &&
      board.s4?.kind === "bulb" &&
      analysis.slots.s2.brightness >= 0.9 &&
      analysis.slots.s4.brightness >= 0.9,
  },
  {
    id: "short-circuit",
    title: "Cause a short circuit",
    goal: "Put a wire across a bulb and watch the bulb go out. This is a short circuit.",
    hint: "Bulb in one top slot, a wire in the other. Current takes the easy way through the wire, so the bulb gets nothing.",
    met: ({ board, analysis }) =>
      analysis.status === "short" &&
      ((board.s2?.kind === "bulb" && board.s4?.kind === "wire") || (board.s4?.kind === "bulb" && board.s2?.kind === "wire")),
  },
];
