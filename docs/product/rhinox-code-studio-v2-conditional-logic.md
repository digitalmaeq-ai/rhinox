# Rhinox Code Studio V2 — Conditional Programming

## Purpose

The beginner text workspace supports a deliberately small, safe conditional language backed by the existing conditional interpreter. Source is parsed into a typed instruction tree; it is never evaluated as JavaScript.

## Supported syntax

```js
if (robot.atGoal()) {
  robot.beep()
} else {
  robot.turnRight()
}
```

Supported conditions are `robot.atGoal()`, `robot.facingNorth()`, `robot.facingEast()`, `robot.facingSouth()` and `robot.facingWest()`. Supported commands remain `robot.moveForward()`, `robot.turnLeft()`, `robot.turnRight()` and `robot.beep()`. A semicolon is optional on command lines. Both a separate closing brace and `} else {` on the same line are supported.

## Safety limits

- Source length: 20,000 characters.
- Source lines: 500.
- Conditional nesting: 10 levels.
- Parsed instructions and conditional nodes: at most 500.
- Runtime: at most 100 executed commands and 500 evaluated instructions, with a nesting limit.
- Unknown conditions, commands and arbitrary JavaScript are rejected with a source-line error.

## Current scope

- This is a learning interpreter for the 5×5 RhinoBot simulator, not general-purpose JavaScript.
- Conditional programs use the safe conditional parser/runtime. Existing straight-line commands and bounded `repeat(n) { ... }` programs continue through the existing parser. Combining repeat blocks inside conditional programs is not supported yet and should be rejected rather than guessed.
- The workspace displays branch explanations alongside the command trace.
- Conditional syntax is not yet available in the blocks editor, and this feature must pass CI and browser checks before it is considered complete.
