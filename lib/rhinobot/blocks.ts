// Block definitions and toolbox layout for RhinoBot (data only, no Blockly import).
// The Blockly workspace registers `BLOCK_DEFINITIONS` and builds its toolbox
// from `toolboxFor`, so each mission can offer only the blocks it needs.

import type { BlockType } from "./missions";

export const CATEGORY_COLOURS = {
  events: "#f2b01e",
  movement: "#2f6fde",
  control: "#f08a24",
  logic: "#8e5bd6",
  sensors: "#16a3c4",
  actions: "#1f9d55",
} as const;

export const BLOCK_DEFINITIONS = [
  { type: "rb_start", message0: "when programme starts", nextStatement: null, style: "events_blocks", tooltip: "Everything snapped under this block runs when you press Run." },
  { type: "rb_forward", message0: "move forward", previousStatement: null, nextStatement: null, style: "movement_blocks", tooltip: "Move one square in the direction RhinoBot is facing." },
  { type: "rb_turn_left", message0: "turn left ↺", previousStatement: null, nextStatement: null, style: "movement_blocks", tooltip: "Turn a quarter turn to the left without moving." },
  { type: "rb_turn_right", message0: "turn right ↻", previousStatement: null, nextStatement: null, style: "movement_blocks", tooltip: "Turn a quarter turn to the right without moving." },
  {
    type: "rb_repeat",
    message0: "repeat %1 times",
    args0: [{ type: "field_number", name: "TIMES", value: 3, min: 1, max: 20, precision: 1 }],
    message1: "%1",
    args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null,
    nextStatement: null,
    style: "control_blocks",
    tooltip: "Run the blocks inside again and again.",
  },
  { type: "rb_wait", message0: "wait one beat", previousStatement: null, nextStatement: null, style: "control_blocks", tooltip: "Pause for a moment." },
  {
    type: "rb_repeat_until",
    message0: "repeat until %1",
    args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1",
    args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null,
    nextStatement: null,
    style: "control_blocks",
    tooltip: "Keep running the blocks inside until the condition is true.",
  },
  {
    type: "rb_if",
    message0: "if %1 then",
    args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1",
    args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null,
    nextStatement: null,
    style: "logic_blocks",
    tooltip: "Only run the blocks inside when the condition is true.",
  },
  {
    type: "rb_if_else",
    message0: "if %1 then",
    args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1",
    args1: [{ type: "input_statement", name: "DO" }],
    message2: "else",
    message3: "%1",
    args3: [{ type: "input_statement", name: "ELSE" }],
    previousStatement: null,
    nextStatement: null,
    style: "logic_blocks",
    tooltip: "Run the first group when true, otherwise run the second group.",
  },
  {
    type: "rb_and", message0: "%1 and %2",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }, { type: "input_value", name: "B", check: "Boolean" }],
    inputsInline: true, output: "Boolean", style: "logic_blocks", tooltip: "True only when both sides are true.",
  },
  {
    type: "rb_or", message0: "%1 or %2",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }, { type: "input_value", name: "B", check: "Boolean" }],
    inputsInline: true, output: "Boolean", style: "logic_blocks", tooltip: "True when at least one side is true.",
  },
  {
    type: "rb_not", message0: "not %1",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }],
    inputsInline: true, output: "Boolean", style: "logic_blocks", tooltip: "Flips true to false and false to true.",
  },
  { type: "rb_obstacle_ahead", message0: "obstacle ahead?", output: "Boolean", style: "sensors_blocks", tooltip: "True when a rock or the edge of the grid is directly ahead." },
  { type: "rb_path_clear", message0: "path clear?", output: "Boolean", style: "sensors_blocks", tooltip: "True when the square ahead is free." },
  { type: "rb_at_goal", message0: "at the goal?", output: "Boolean", style: "sensors_blocks", tooltip: "True when RhinoBot is on the goal flag or charging station." },
  { type: "rb_item_here", message0: "item here?", output: "Boolean", style: "sensors_blocks", tooltip: "True when there is an item on RhinoBot's square." },
  { type: "rb_holding", message0: "carrying an item?", output: "Boolean", style: "sensors_blocks", tooltip: "True when RhinoBot is holding an item." },
  { type: "rb_at_base", message0: "at base?", output: "Boolean", style: "sensors_blocks", tooltip: "True when RhinoBot is on its base square." },
  { type: "rb_pickup", message0: "pick up", previousStatement: null, nextStatement: null, style: "actions_blocks", tooltip: "Pick up the item on this square." },
  { type: "rb_drop", message0: "drop", previousStatement: null, nextStatement: null, style: "actions_blocks", tooltip: "Drop the item. On the base square it counts as delivered." },
  { type: "rb_activate", message0: "activate", previousStatement: null, nextStatement: null, style: "actions_blocks", tooltip: "Switch on the charging station RhinoBot is standing on." },
] as const;

export interface ToolboxCategory {
  id: keyof typeof CATEGORY_COLOURS;
  name: string;
  blocks: BlockType[];
}

export const CATEGORIES: ToolboxCategory[] = [
  { id: "movement", name: "Movement", blocks: ["rb_forward", "rb_turn_left", "rb_turn_right"] },
  { id: "control", name: "Control", blocks: ["rb_repeat", "rb_repeat_until", "rb_wait"] },
  { id: "logic", name: "Logic", blocks: ["rb_if", "rb_if_else", "rb_and", "rb_or", "rb_not"] },
  { id: "sensors", name: "Sensors", blocks: ["rb_obstacle_ahead", "rb_path_clear", "rb_at_goal", "rb_item_here", "rb_holding", "rb_at_base"] },
  { id: "actions", name: "Actions", blocks: ["rb_pickup", "rb_drop", "rb_activate"] },
];

type ToolboxJson = { kind: "categoryToolbox"; contents: unknown[] };

// "Events" lives in its own category so the start block is easy to find.
export function toolboxFor(allowed: BlockType[]): ToolboxJson {
  const contents: unknown[] = [
    { kind: "category", name: "Events", categorystyle: "events_category", contents: [{ kind: "block", type: "rb_start" }] },
  ];
  for (const category of CATEGORIES) {
    const blocks = category.blocks.filter((type) => allowed.includes(type));
    if (blocks.length === 0) continue;
    contents.push({
      kind: "category",
      name: category.name,
      categorystyle: `${category.id}_category`,
      contents: blocks.map((type) => ({ kind: "block", type })),
    });
  }
  return { kind: "categoryToolbox", contents };
}
