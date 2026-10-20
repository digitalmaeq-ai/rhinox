// Rhinox Code Studio: the Arduino simulator's language engine.
//
// This reads a small, honest part of Arduino C++ (the part classroom programs use)
// and runs it step by step. It does NOT compile anything and never uses eval or
// new Function: a program is turned into a tree of plain objects and walked.
// It has no way to reach the page by itself. Everything it can do to the world goes
// through the "host" object given to Machine (pins, time, Serial), and the host
// decides what to allow.
//
// Board model: an Arduino Uno. int is 16 bits (so 32767 + 1 wraps to -32768, like the
// real board), long is 32 bits, float is a number printed with 2 decimals.
//
// What is supported: setup()/loop(), your own functions (with recursion up to a limit),
// global and local variables, arrays, #define, const, if/else, while, do-while, for,
// switch, break/continue/return, the usual operators, casts, String with common
// methods, pinMode/digitalWrite/digitalRead/analogRead/analogWrite/tone/noTone, delay,
// millis, random, map/constrain/min/max/abs/pow/sqrt, and Serial.print/println.
// What is not: pointers, classes, templates, libraries other than the built-ins, interrupts.

import { BOARDS, WL, WifiSim, canPwm, TOUCH_TOUCHED, TOUCH_UNTOUCHED, boardById, dialIndex, PIN_COUNT } from "./arduino-boards.js";

export const LIMITS = {
  MAX_SOURCE_CHARS: 30000,
  MAX_CALL_DEPTH: 64,
  MAX_STRING_CHARS: 2000,
  MAX_ARRAY_ITEMS: 2000,
};

export class ArduinoError extends Error {
  constructor(message, line) {
    super(line ? "line " + line + ": " + message : message);
    this.line = line || 0;
    this.plain = message;
  }
}

// ---- Values ---------------------------------------------------------------------
// An int is a plain JS number. A float is an F. A char is a Ch. A String is a JS string.
class F {
  constructor(v) {
    this.v = v;
  }
}
class Ch {
  constructor(v) {
    this.v = v;
  }
}

const isNum = (x) => typeof x === "number" || x instanceof F || x instanceof Ch;
const num = (x) => (typeof x === "number" ? x : x instanceof F || x instanceof Ch ? x.v : NaN);

const TYPE_NAMES = new Set([
  "void", "int", "long", "short", "byte", "bool", "boolean", "float", "double", "char", "String", "word",
  "size_t", "uint8_t", "uint16_t", "uint32_t", "int8_t", "int16_t", "int32_t", "unsigned", "signed",
]);
const MODIFIERS = new Set(["const", "static", "volatile", "extern", "register"]);

// Which type of whole number a declared type is: [bits, signed]
// How wide an int is depends on the board (16 bits on an Uno, 32 on an ESP32). One engine runs at a time per worker.
let INT_BITS = 16;

function intShape(type) {
  switch (type) {
    case "int": return [INT_BITS, true];
    case "unsigned int": return [INT_BITS, false];
    case "short": case "int16_t": return [16, true];
    case "word": case "uint16_t": case "unsigned short": return [16, false];
    case "long": case "int32_t": return [32, true];
    case "unsigned long": case "uint32_t": case "size_t": return [32, false];
    case "byte": case "uint8_t": case "unsigned char": return [8, false];
    case "int8_t": case "signed char": return [8, true];
    case "bool": case "boolean": return [1, false];
    default: return null;
  }
}

function wrap(value, bits, signed) {
  if (!Number.isFinite(value)) return 0;
  let v = Math.trunc(value);
  const size = 2 ** bits;
  v = ((v % size) + size) % size;
  if (signed && v >= size / 2) v -= size;
  return v;
}

function coerce(type, value, line) {
  if (type === "String") {
    if (typeof value === "string") return value;
    return toText(value);
  }
  if (typeof value === "string" || Array.isArray(value)) {
    throw new ArduinoError("invalid conversion to '" + type + "'", line);
  }
  if (value === undefined) throw new ArduinoError("void value not ignored as it ought to be", line);
  if (type === "float" || type === "double") return new F(num(value));
  if (type === "char" || type === "signed char") return new Ch(wrap(num(value), 8, true));
  if (type === "bool" || type === "boolean") return num(value) !== 0 ? 1 : 0;
  const shape = intShape(type);
  if (shape) return wrap(num(value), shape[0], shape[1]);
  throw new ArduinoError("unknown type '" + type + "'", line);
}

function truthy(value, line) {
  if (typeof value === "string" || Array.isArray(value) || value === undefined) {
    throw new ArduinoError("this value cannot be used as a condition", line);
  }
  return num(value) !== 0;
}

function formatFloat(v, digits) {
  if (Number.isNaN(v)) return "nan";
  if (!Number.isFinite(v)) return v < 0 ? "-inf" : "inf";
  return v.toFixed(digits);
}

function toText(value) {
  if (typeof value === "string") return value;
  if (value instanceof F) return formatFloat(value.v, 2);
  if (value instanceof Ch) return String.fromCharCode(value.v & 255);
  if (typeof value === "number") return String(value);
  return "";
}

// ---- Lexer ----------------------------------------------------------------------
const PUNCT = [
  "<<=", ">>=", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "==", "!=", "<=", ">=", "&&", "||", "<<", ">>",
  "+", "-", "*", "/", "%", "=", "<", ">", "!", "~", "&", "|", "^", "?", ":", ";", ",", "(", ")", "{", "}", "[", "]", ".",
];

export function tokenize(source) {
  if (source.length > LIMITS.MAX_SOURCE_CHARS) throw new ArduinoError("the program is too long");
  const tokens = [];
  const defines = new Map();
  let i = 0;
  let line = 1;
  const n = source.length;
  const push = (t, v) => tokens.push({ t, v, line });
  while (i < n) {
    const c = source[i];
    if (c === "\n") { line += 1; i += 1; continue; }
    if (c === " " || c === "\t" || c === "\r") { i += 1; continue; }
    if (c === "/" && source[i + 1] === "/") {
      while (i < n && source[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      i += 2;
      while (i < n && !(source[i] === "*" && source[i + 1] === "/")) {
        if (source[i] === "\n") line += 1;
        i += 1;
      }
      if (i >= n) throw new ArduinoError("unterminated comment", line);
      i += 2;
      continue;
    }
    if (c === "#") {
      let end = i;
      while (end < n && source[end] !== "\n") end += 1;
      const text = source.slice(i, end).trim();
      const define = /^#\s*define\s+([A-Za-z_]\w*)\s*(.*)$/.exec(text);
      if (define) {
        const body = tokenize(define[2] || "").slice(0, -1);
        defines.set(define[1], body.map((tok) => ({ ...tok, line })));
      } else if (!/^#\s*include\b/.test(text)) {
        throw new ArduinoError("this simulator does not understand '" + text.slice(0, 30) + "'", line);
      }
      i = end;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(source[i + 1] || ""))) {
      let j = i;
      let value;
      let isFloat = false;
      if (c === "0" && /[xX]/.test(source[i + 1] || "")) {
        j = i + 2;
        while (j < n && /[0-9a-fA-F]/.test(source[j])) j += 1;
        value = parseInt(source.slice(i + 2, j), 16);
      } else if (c === "0" && /[bB]/.test(source[i + 1] || "")) {
        j = i + 2;
        while (j < n && /[01]/.test(source[j])) j += 1;
        value = parseInt(source.slice(i + 2, j), 2);
      } else {
        while (j < n && /[0-9]/.test(source[j])) j += 1;
        if (source[j] === "." ) {
          isFloat = true;
          j += 1;
          while (j < n && /[0-9]/.test(source[j])) j += 1;
        }
        if (/[eE]/.test(source[j] || "") && /[-+0-9]/.test(source[j + 1] || "")) {
          isFloat = true;
          j += 2;
          while (j < n && /[0-9]/.test(source[j])) j += 1;
        }
        value = Number(source.slice(i, j));
      }
      let long = false;
      let unsigned = false;
      while (/[lLuUfF]/.test(source[j] || "")) {
        if (/[lL]/.test(source[j])) long = true;
        if (/[uU]/.test(source[j])) unsigned = true;
        if (/[fF]/.test(source[j])) isFloat = true;
        j += 1;
      }
      tokens.push({ t: "num", v: value, float: isFloat, long: long || value > 32767, unsigned, line });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(source[j])) j += 1;
      push("id", source.slice(i, j));
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let text = "";
      while (j < n && source[j] !== '"') {
        if (source[j] === "\n") throw new ArduinoError("missing terminating \" character", line);
        if (source[j] === "\\") {
          j += 1;
          const e = source[j];
          text += e === "n" ? "\n" : e === "t" ? "\t" : e === "r" ? "\r" : e === "0" ? "\0" : e;
        } else {
          text += source[j];
        }
        j += 1;
      }
      if (j >= n) throw new ArduinoError("missing terminating \" character", line);
      push("str", text);
      i = j + 1;
      continue;
    }
    if (c === "'") {
      let j = i + 1;
      let text = "";
      if (source[j] === "\\") {
        j += 1;
        const e = source[j];
        text = e === "n" ? "\n" : e === "t" ? "\t" : e === "r" ? "\r" : e === "0" ? "\0" : e;
        j += 1;
      } else {
        text = source[j] || "";
        j += 1;
      }
      if (source[j] !== "'" || text.length !== 1) throw new ArduinoError("bad character constant", line);
      push("chr", text.charCodeAt(0) & 255);
      i = j + 1;
      continue;
    }
    const punct = PUNCT.find((p) => source.startsWith(p, i));
    if (!punct) throw new ArduinoError("stray '" + c + "' in program", line);
    push("op", punct);
    i += punct.length;
  }
  push("eof", "");
  // Replace #define names by their tokens (simple object-like macros).
  if (defines.size > 0) {
    const out = [];
    for (const tok of tokens) {
      if (tok.t === "id" && defines.has(tok.v)) {
        for (const d of defines.get(tok.v)) out.push({ ...d, line: tok.line });
      } else {
        out.push(tok);
      }
    }
    return out;
  }
  return tokens;
}

// ---- Parser ---------------------------------------------------------------------
const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]);
const BINARY_LEVELS = [
  ["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "!="], ["<", ">", "<=", ">="], ["<<", ">>"], ["+", "-"], ["*", "/", "%"],
];

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.p = 0;
  }

  get tok() {
    return this.tokens[this.p];
  }

  fail(message, tok) {
    throw new ArduinoError(message, (tok || this.tok).line);
  }

  is(value) {
    const t = this.tok;
    return (t.t === "op" || t.t === "id") && t.v === value;
  }

  eat(value) {
    if (this.is(value)) {
      this.p += 1;
      return true;
    }
    return false;
  }

  expect(value, what) {
    if (!this.eat(value)) {
      const t = this.tok;
      this.fail("expected '" + value + "'" + (what ? " " + what : "") + " before '" + (t.t === "eof" ? "end of file" : String(t.v)) + "'", t.line ? { line: this.lastLine() } : t);
    }
  }

  // Missing ';' is reported on the line before the next token, like a compiler does.
  lastLine() {
    return this.p > 0 ? this.tokens[this.p - 1].line : this.tok.line;
  }

  ident() {
    const t = this.tok;
    if (t.t !== "id") this.fail("expected a name before '" + t.v + "'");
    this.p += 1;
    return t.v;
  }

  atType() {
    const t = this.tok;
    return t.t === "id" && (TYPE_NAMES.has(t.v) || MODIFIERS.has(t.v));
  }

  // Reads "const unsigned long" and similar into {type, isConst}.
  typeSpec() {
    let isConst = false;
    const words = [];
    while (this.tok.t === "id" && (TYPE_NAMES.has(this.tok.v) || MODIFIERS.has(this.tok.v))) {
      const w = this.tok.v;
      this.p += 1;
      if (w === "const") isConst = true;
      else if (!MODIFIERS.has(w)) words.push(w);
    }
    if (words.length === 0) this.fail("expected a type");
    let type;
    if (words.includes("unsigned")) {
      const rest = words.filter((w) => w !== "unsigned");
      const base = rest[0] || "int";
      type = "unsigned " + (base === "long" ? "long" : base === "char" ? "char" : base === "short" ? "short" : "int");
    } else if (words.includes("signed")) {
      const rest = words.filter((w) => w !== "signed");
      type = rest[0] === "char" ? "signed char" : rest[0] || "int";
    } else {
      type = words.filter((w) => w !== "long" || words.length === 1)[0];
      if (words.filter((w) => w === "long").length >= 1 && (words[0] === "long" || words[1] === "long")) type = "long";
      if (words.includes("double")) type = "double";
    }
    if (this.is("*") || this.is("&")) this.fail("pointers and references are not supported in this simulator");
    return { type, isConst };
  }

  program() {
    const globals = [];
    const functions = new Map();
    while (this.tok.t !== "eof") {
      if (!this.atType()) {
        this.fail("expected a type (like int or void) before '" + this.tok.v + "'");
      }
      const startLine = this.tok.line;
      const { type, isConst } = this.typeSpec();
      const name = this.ident();
      if (this.is("(")) {
        const fn = this.functionRest(type, name, startLine);
        if (functions.has(name)) this.fail("redefinition of '" + name + "'", { line: startLine });
        functions.set(name, fn);
      } else {
        this.p -= 1;
        globals.push(...this.declarators(type, isConst, startLine));
        this.expect(";");
      }
    }
    return { globals, functions };
  }

  functionRest(type, name, line) {
    this.expect("(");
    const params = [];
    if (this.is("void") && this.tokens[this.p + 1].v === ")") {
      this.p += 1;
    } else if (!this.is(")")) {
      do {
        const spec = this.typeSpec();
        const pname = this.ident();
        let isArray = false;
        if (this.eat("[")) {
          this.expect("]");
          isArray = true;
        }
        params.push({ type: spec.type, name: pname, isArray });
      } while (this.eat(","));
    }
    this.expect(")");
    const body = this.block();
    return { type, name, params, body, line };
  }

  // After a type: "a = 1, b[3] = {1,2,3}, c"
  declarators(type, isConst, line) {
    const out = [];
    do {
      const name = this.ident();
      let size = null;
      let sizeless = false;
      if (this.eat("[")) {
        if (this.is("]")) sizeless = true;
        else size = this.expression();
        this.expect("]");
      }
      let init = null;
      if (this.eat("=")) {
        if (this.is("{")) init = this.arrayLiteral();
        else init = this.assignment();
      }
      out.push({ kind: "decl", type, name, size, sizeless, init, isConst, line });
    } while (this.eat(","));
    return out;
  }

  arrayLiteral() {
    const line = this.tok.line;
    this.expect("{");
    const items = [];
    if (!this.is("}")) {
      do {
        if (this.is("}")) break;
        items.push(this.assignment());
      } while (this.eat(","));
    }
    this.expect("}");
    return { kind: "array", items, line };
  }

  block() {
    const line = this.tok.line;
    this.expect("{");
    const body = [];
    while (!this.is("}")) {
      if (this.tok.t === "eof") this.fail("expected '}' at end of input");
      body.push(this.statement());
    }
    this.expect("}");
    return { kind: "block", body, line };
  }

  statement() {
    const t = this.tok;
    const line = t.line;
    if (t.t === "op" && t.v === "{") return this.block();
    if (t.t === "op" && t.v === ";") {
      this.p += 1;
      return { kind: "empty", line };
    }
    if (t.t === "id") {
      switch (t.v) {
        case "if": {
          this.p += 1;
          this.expect("(");
          const test = this.expression();
          this.expect(")");
          const then = this.statement();
          const other = this.eat("else") ? this.statement() : null;
          return { kind: "if", test, then, other, line };
        }
        case "while": {
          this.p += 1;
          this.expect("(");
          const test = this.expression();
          this.expect(")");
          return { kind: "while", test, body: this.statement(), line };
        }
        case "do": {
          this.p += 1;
          const body = this.statement();
          this.expect("while");
          this.expect("(");
          const test = this.expression();
          this.expect(")");
          this.expect(";");
          return { kind: "dowhile", test, body, line };
        }
        case "for": {
          this.p += 1;
          this.expect("(");
          let init = null;
          if (!this.is(";")) {
            if (this.atType()) {
              const spec = this.typeSpec();
              init = { kind: "block", inline: true, body: this.declarators(spec.type, spec.isConst, line), line };
            } else {
              init = { kind: "expr", expr: this.expression(), line };
            }
          }
          this.expect(";");
          const test = this.is(";") ? null : this.expression();
          this.expect(";");
          const step = this.is(")") ? null : this.expression();
          this.expect(")");
          return { kind: "for", init, test, step, body: this.statement(), line };
        }
        case "switch": {
          this.p += 1;
          this.expect("(");
          const test = this.expression();
          this.expect(")");
          this.expect("{");
          const cases = [];
          while (!this.is("}")) {
            let label;
            if (this.eat("case")) {
              label = this.expression();
              this.expect(":");
            } else if (this.eat("default")) {
              label = null;
              this.expect(":");
            } else {
              this.fail("expected 'case' or 'default'");
            }
            const body = [];
            while (!this.is("case") && !this.is("default") && !this.is("}")) {
              if (this.tok.t === "eof") this.fail("expected '}' at end of input");
              body.push(this.statement());
            }
            cases.push({ label, body });
          }
          this.expect("}");
          return { kind: "switch", test, cases, line };
        }
        case "break":
          this.p += 1;
          this.expect(";");
          return { kind: "break", line };
        case "continue":
          this.p += 1;
          this.expect(";");
          return { kind: "continue", line };
        case "return": {
          this.p += 1;
          const value = this.is(";") ? null : this.expression();
          this.expect(";");
          return { kind: "return", value, line };
        }
        default:
          break;
      }
      if (this.atType()) {
        const spec = this.typeSpec();
        const decls = this.declarators(spec.type, spec.isConst, line);
        this.expect(";");
        return decls.length === 1 ? decls[0] : { kind: "block", inline: true, body: decls, line };
      }
    }
    const expr = this.expression();
    this.expect(";");
    return { kind: "expr", expr, line };
  }

  expression() {
    const first = this.assignment();
    if (this.is(",") && false) return first;
    return first;
  }

  assignment() {
    const left = this.ternary();
    const t = this.tok;
    if (t.t === "op" && ASSIGN_OPS.has(t.v)) {
      this.p += 1;
      if (left.kind !== "var" && left.kind !== "index") this.fail("lvalue required as left operand of assignment", t);
      const value = this.assignment();
      return { kind: "assign", op: t.v, target: left, value, line: t.line };
    }
    return left;
  }

  ternary() {
    const test = this.binary(0);
    if (this.is("?")) {
      const line = this.tok.line;
      this.p += 1;
      const yes = this.assignment();
      this.expect(":");
      const no = this.assignment();
      return { kind: "ternary", test, yes, no, line };
    }
    return test;
  }

  binary(level) {
    if (level >= BINARY_LEVELS.length) return this.unary();
    let left = this.binary(level + 1);
    for (;;) {
      const t = this.tok;
      if (t.t === "op" && BINARY_LEVELS[level].includes(t.v)) {
        this.p += 1;
        const right = this.binary(level + 1);
        left = { kind: "binary", op: t.v, left, right, line: t.line };
      } else {
        return left;
      }
    }
  }

  unary() {
    const t = this.tok;
    if (t.t === "op") {
      if (t.v === "!" || t.v === "-" || t.v === "+" || t.v === "~") {
        this.p += 1;
        return { kind: "unary", op: t.v, operand: this.unary(), line: t.line };
      }
      if (t.v === "++" || t.v === "--") {
        this.p += 1;
        const target = this.unary();
        if (target.kind !== "var" && target.kind !== "index") this.fail("lvalue required as increment operand", t);
        return { kind: "incdec", op: t.v, prefix: true, target, line: t.line };
      }
      if (t.v === "(") {
        // A cast looks like (int) or (unsigned long).
        const save = this.p;
        this.p += 1;
        if (this.atType()) {
          const spec = this.typeSpec();
          if (this.eat(")")) return { kind: "cast", type: spec.type, operand: this.unary(), line: t.line };
        }
        this.p = save;
      }
    }
    return this.postfix();
  }

  postfix() {
    let node = this.primary();
    for (;;) {
      const t = this.tok;
      if (t.t !== "op") return node;
      if (t.v === "[") {
        this.p += 1;
        const index = this.expression();
        this.expect("]");
        node = { kind: "index", target: node, index, line: t.line };
      } else if (t.v === "++" || t.v === "--") {
        if (node.kind !== "var" && node.kind !== "index") this.fail("lvalue required as increment operand", t);
        this.p += 1;
        node = { kind: "incdec", op: t.v, prefix: false, target: node, line: t.line };
      } else if (t.v === ".") {
        this.p += 1;
        const name = this.ident();
        this.expect("(");
        const args = this.args();
        node = { kind: "method", target: node, name, args, line: t.line };
      } else {
        return node;
      }
    }
  }

  args() {
    const args = [];
    if (!this.is(")")) {
      do {
        args.push(this.assignment());
      } while (this.eat(","));
    }
    this.expect(")");
    return args;
  }

  primary() {
    const t = this.tok;
    switch (t.t) {
      case "num":
        this.p += 1;
        return { kind: "num", value: t.float ? new F(t.v) : t.long ? wrap(t.v, 32, !t.unsigned) : t.v, line: t.line };
      case "chr":
        this.p += 1;
        return { kind: "char", value: new Ch(t.v), line: t.line };
      case "str":
        this.p += 1;
        return { kind: "str", value: t.v, line: t.line };
      case "id": {
        this.p += 1;
        if (this.is("(")) {
          this.p += 1;
          const args = this.args();
          return { kind: "call", name: t.v, args, line: t.line };
        }
        return { kind: "var", name: t.v, line: t.line };
      }
      case "op":
        if (t.v === "(") {
          this.p += 1;
          const inner = this.expression();
          this.expect(")");
          return inner;
        }
        break;
      default:
        break;
    }
    this.fail("expected an expression before '" + (t.t === "eof" ? "end of file" : t.v) + "'");
    return null;
  }
}

export function parse(source) {
  const program = new Parser(tokenize(source)).program();
  if (!program.functions.has("setup")) throw new ArduinoError("the program needs a setup() function: void setup() { }");
  if (!program.functions.has("loop")) throw new ArduinoError("the program needs a loop() function: void loop() { }");
  return program;
}

// ---- The machine ----------------------------------------------------------------
class Break {}
class Continue {}
class Return {
  constructor(value) {
    this.value = value;
  }
}

const CONSTANTS = {
  HIGH: 1, LOW: 0, INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2, LED_BUILTIN: 13, true: 1, false: 0,
  A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19, DEC: 10, HEX: 16, BIN: 2, OCT: 8, PI: new F(Math.PI),
  HALF_PI: new F(Math.PI / 2), TWO_PI: new F(Math.PI * 2), NULL: 0,
};

function constantsFor(board) {
  const c = { ...CONSTANTS, LED_BUILTIN: board.ledBuiltin };
  if (board.id === "uno") return c;
  for (const name of ["A0", "A1", "A2", "A3", "A4", "A5"]) delete c[name];
  Object.assign(c, {
    INPUT_PULLDOWN: 3, WIFI_STA: 1, WIFI_AP: 2, WL_NO_SHIELD: WL.NO_SHIELD, WL_IDLE_STATUS: WL.IDLE, WL_NO_SSID_AVAIL: WL.NO_SSID_AVAIL,
    WL_CONNECTED: WL.CONNECTED, WL_CONNECT_FAILED: WL.CONNECT_FAILED, WL_CONNECTION_LOST: WL.CONNECTION_LOST, WL_DISCONNECTED: WL.DISCONNECTED,
    T0: 4, T1: 0, T2: 2, T3: 15, T4: 13, T5: 12, T6: 14, T7: 27, T8: 33, T9: 32,
  });
  return c;
}

export class Machine {
  /**
   * host: {
   *   pinMode(pin, mode), digitalWrite(pin, value), digitalRead(pin) -> 0|1,
   *   analogRead(pin) -> 0..1023, analogWrite(pin, value), tone(pin, hz, ms), noTone(pin),
   *   serial(text), delay(ms), micros() -> number, step()
   * }
   */
  constructor(host, board = BOARDS.uno) {
    this.host = host;
    this.board = board;
    INT_BITS = board.intBits;
    this.constants = constantsFor(board);
    this.ledc = new Map();
    this.program = null;
    this.globals = new Map();
    this.depth = 0;
    this.seed = 12345;
  }

  load(source) {
    this.program = parse(source);
    this.globals = new Map();
    for (const decl of this.program.globals) this.declare(this.globals, decl);
  }

  runSetup() {
    this.callFunction("setup", [], 0);
  }

  runLoop() {
    this.callFunction("loop", [], 0);
  }

  // ---- variables
  lookup(scope, name, line) {
    for (let s = scope; s; s = s.parent) {
      const found = s.vars.get(name);
      if (found) return found;
    }
    const global = this.globals.get(name);
    if (global) return global;
    throw new ArduinoError("'" + name + "' was not declared in this scope", line);
  }

  declare(vars, decl, scope) {
    let value;
    if (decl.size !== null || decl.sizeless || decl.init?.kind === "array") {
      let count;
      if (decl.init?.kind === "array") {
        count = decl.size !== null ? Number(num(this.eval(decl.size, scope))) : decl.init.items.length;
      } else {
        if (decl.size === null) throw new ArduinoError("array size missing in '" + decl.name + "'", decl.line);
        count = Number(num(this.eval(decl.size, scope)));
      }
      if (!Number.isInteger(count) || count < 0 || count > LIMITS.MAX_ARRAY_ITEMS) {
        throw new ArduinoError("array '" + decl.name + "' must have between 0 and " + LIMITS.MAX_ARRAY_ITEMS + " items", decl.line);
      }
      const items = new Array(count).fill(null).map(() => coerce(decl.type, 0, decl.line));
      if (decl.init?.kind === "array") {
        if (decl.init.items.length > count) throw new ArduinoError("too many initializers for '" + decl.name + "'", decl.line);
        decl.init.items.forEach((item, i) => {
          items[i] = coerce(decl.type, this.eval(item, scope), decl.line);
        });
      }
      value = items;
      vars.set(decl.name, { type: decl.type, value, isArray: true, isConst: decl.isConst });
      return;
    }
    if (decl.init) value = coerce(decl.type, this.eval(decl.init, scope), decl.line);
    else value = decl.type === "String" ? "" : coerce(decl.type, 0, decl.line);
    vars.set(decl.name, { type: decl.type, value, isArray: false, isConst: decl.isConst });
  }

  // ---- calling
  callFunction(name, args, line) {
    const fn = this.program.functions.get(name);
    if (!fn) throw new ArduinoError("'" + name + "' was not declared in this scope", line);
    if (args.length !== fn.params.length) {
      throw new ArduinoError("wrong number of arguments to '" + name + "': it needs " + fn.params.length, line);
    }
    if (this.depth >= LIMITS.MAX_CALL_DEPTH) {
      throw new ArduinoError("too many nested function calls (is '" + name + "' calling itself forever?)", line);
    }
    const scope = { vars: new Map(), parent: null };
    fn.params.forEach((param, i) => {
      if (param.isArray) {
        if (!Array.isArray(args[i])) throw new ArduinoError("argument " + (i + 1) + " of '" + name + "' must be an array", line);
        scope.vars.set(param.name, { type: param.type, value: args[i], isArray: true });
      } else {
        scope.vars.set(param.name, { type: param.type, value: coerce(param.type, args[i], line), isArray: false });
      }
    });
    this.depth += 1;
    try {
      this.execBlockBody(fn.body.body, scope);
    } catch (e) {
      if (e instanceof Return) {
        if (fn.type === "void") return undefined;
        return e.value === undefined ? coerce(fn.type, 0, line) : coerce(fn.type, e.value, line);
      }
      if (e instanceof Break || e instanceof Continue) throw new ArduinoError("break or continue outside a loop", line);
      throw e;
    } finally {
      this.depth -= 1;
    }
    return fn.type === "void" ? undefined : coerce(fn.type, 0, line);
  }

  // ---- statements
  execBlockBody(list, scope) {
    for (const s of list) this.exec(s, scope);
  }

  exec(node, scope) {
    this.host.step();
    switch (node.kind) {
      case "block": {
        if (node.inline) {
          for (const d of node.body) this.exec(d, scope);
          return;
        }
        const inner = { vars: new Map(), parent: scope };
        this.execBlockBody(node.body, inner);
        return;
      }
      case "decl":
        if (scope.vars.has(node.name)) throw new ArduinoError("redeclaration of '" + node.name + "'", node.line);
        this.declare(scope.vars, node, scope);
        return;
      case "expr":
        this.eval(node.expr, scope);
        return;
      case "empty":
        return;
      case "if":
        if (truthy(this.eval(node.test, scope), node.line)) this.exec(node.then, scope);
        else if (node.other) this.exec(node.other, scope);
        return;
      case "while":
        while (truthy(this.eval(node.test, scope), node.line)) {
          this.host.step();
          try {
            this.exec(node.body, scope);
          } catch (e) {
            if (e instanceof Break) break;
            if (e instanceof Continue) continue;
            throw e;
          }
        }
        return;
      case "dowhile":
        do {
          this.host.step();
          try {
            this.exec(node.body, scope);
          } catch (e) {
            if (e instanceof Break) break;
            if (e instanceof Continue) continue;
            throw e;
          }
        } while (truthy(this.eval(node.test, scope), node.line));
        return;
      case "for": {
        const inner = { vars: new Map(), parent: scope };
        if (node.init) this.exec(node.init, inner);
        while (node.test === null || truthy(this.eval(node.test, inner), node.line)) {
          this.host.step();
          try {
            this.exec(node.body, inner);
          } catch (e) {
            if (e instanceof Break) break;
            if (!(e instanceof Continue)) throw e;
          }
          if (node.step) this.eval(node.step, inner);
        }
        return;
      }
      case "switch": {
        const value = num(this.eval(node.test, scope));
        let start = -1;
        for (let i = 0; i < node.cases.length; i += 1) {
          const c = node.cases[i];
          if (c.label !== null && num(this.eval(c.label, scope)) === value) {
            start = i;
            break;
          }
        }
        if (start < 0) start = node.cases.findIndex((c) => c.label === null);
        if (start < 0) return;
        const inner = { vars: new Map(), parent: scope };
        try {
          for (let i = start; i < node.cases.length; i += 1) this.execBlockBody(node.cases[i].body, inner);
        } catch (e) {
          if (!(e instanceof Break)) throw e;
        }
        return;
      }
      case "break":
        throw new Break();
      case "continue":
        throw new Continue();
      case "return":
        throw new Return(node.value ? this.eval(node.value, scope) : undefined);
      default:
        throw new ArduinoError("cannot run this statement", node.line);
    }
  }

  // ---- expressions
  eval(node, scope) {
    switch (node.kind) {
      case "num":
      case "char":
        return node.value;
      case "str":
        return node.value;
      case "var": {
        if (Object.prototype.hasOwnProperty.call(this.constants, node.name)) {
          // A program's own variable of the same name wins over the built-in constant.
          for (let s = scope; s; s = s.parent) if (s.vars.has(node.name)) return s.vars.get(node.name).value;
          if (this.globals.has(node.name)) return this.globals.get(node.name).value;
          return this.constants[node.name];
        }
        return this.lookup(scope, node.name, node.line).value;
      }
      case "index": {
        const array = this.eval(node.target, scope);
        const index = num(this.eval(node.index, scope));
        if (typeof array === "string") {
          if (index < 0 || index >= array.length) throw new ArduinoError("index out of range", node.line);
          return new Ch(array.charCodeAt(index));
        }
        if (!Array.isArray(array)) throw new ArduinoError("this is not an array", node.line);
        if (!Number.isInteger(index) || index < 0 || index >= array.length) {
          throw new ArduinoError("array index " + index + " is outside the array (it has " + array.length + " items)", node.line);
        }
        return array[index];
      }
      case "unary": {
        const v = this.eval(node.operand, scope);
        if (node.op === "!") return truthy(v, node.line) ? 0 : 1;
        if (typeof v === "string" || Array.isArray(v)) throw new ArduinoError("invalid operand to unary '" + node.op + "'", node.line);
        if (node.op === "-") return v instanceof F ? new F(-v.v) : wrap(-num(v), 32, true);
        if (node.op === "+") return v;
        return wrap(~num(v), 32, true);
      }
      case "binary":
        return this.binary(node, scope);
      case "ternary":
        return truthy(this.eval(node.test, scope), node.line) ? this.eval(node.yes, scope) : this.eval(node.no, scope);
      case "cast":
        return coerce(node.type, this.eval(node.operand, scope), node.line);
      case "assign":
        return this.assign(node, scope);
      case "incdec": {
        const old = this.eval(node.target, scope);
        const next = this.applyOp(node.op === "++" ? "+" : "-", old, 1, node.line);
        const stored = this.store(node.target, scope, next);
        return node.prefix ? stored : old;
      }
      case "call":
        return this.call(node, scope);
      case "method":
        return this.method(node, scope);
      case "array":
        throw new ArduinoError("an array list can only be used to start an array", node.line);
      default:
        throw new ArduinoError("cannot run this expression", node.line);
    }
  }

  binary(node, scope) {
    const op = node.op;
    if (op === "&&") return truthy(this.eval(node.left, scope), node.line) && truthy(this.eval(node.right, scope), node.line) ? 1 : 0;
    if (op === "||") return truthy(this.eval(node.left, scope), node.line) || truthy(this.eval(node.right, scope), node.line) ? 1 : 0;
    const a = this.eval(node.left, scope);
    const b = this.eval(node.right, scope);
    return this.applyOp(op, a, b, node.line);
  }

  applyOp(op, a, b, line) {
    if (typeof a === "string" || typeof b === "string") {
      if (op === "+") {
        const text = toText(a) + toText(b);
        if (text.length > LIMITS.MAX_STRING_CHARS) throw new ArduinoError("the String is too long", line);
        return text;
      }
      if ((op === "==" || op === "!=") && typeof a === "string" && typeof b === "string") return (a === b) === (op === "==") ? 1 : 0;
      throw new ArduinoError("invalid operands to '" + op + "'", line);
    }
    if (Array.isArray(a) || Array.isArray(b) || a === undefined || b === undefined) throw new ArduinoError("invalid operands to '" + op + "'", line);
    const x = num(a);
    const y = num(b);
    const float = a instanceof F || b instanceof F;
    switch (op) {
      case "==": return x === y ? 1 : 0;
      case "!=": return x !== y ? 1 : 0;
      case "<": return x < y ? 1 : 0;
      case ">": return x > y ? 1 : 0;
      case "<=": return x <= y ? 1 : 0;
      case ">=": return x >= y ? 1 : 0;
      default: break;
    }
    if (float) {
      switch (op) {
        case "+": return new F(x + y);
        case "-": return new F(x - y);
        case "*": return new F(x * y);
        case "/": return new F(x / y);
        default: throw new ArduinoError("invalid operands of types 'float' and 'int' to '" + op + "'", line);
      }
    }
    // Whole numbers: Arduino does the sum in 16 bits unless a number is a long. We keep 32 bits
    // for the working and wrap when the value is stored, except for the usual int overflow demo.
    switch (op) {
      case "+": return wrap(x + y, 32, true);
      case "-": return wrap(x - y, 32, true);
      case "*": return wrap(x * y, 32, true);
      case "/":
        if (y === 0) throw new ArduinoError("division by zero", line);
        return Math.trunc(x / y);
      case "%":
        if (y === 0) throw new ArduinoError("division by zero", line);
        return x % y;
      case "&": return wrap(x & y, 32, true);
      case "|": return wrap(x | y, 32, true);
      case "^": return wrap(x ^ y, 32, true);
      case "<<": return wrap(x << (y & 31), 32, true);
      case ">>": return x >> (y & 31);
      default: throw new ArduinoError("invalid operator '" + op + "'", line);
    }
  }

  store(target, scope, value) {
    if (target.kind === "var") {
      const variable = this.lookup(scope, target.name, target.line);
      if (variable.isConst) throw new ArduinoError("assignment of read-only variable '" + target.name + "'", target.line);
      if (variable.isArray) throw new ArduinoError("invalid assignment to array '" + target.name + "'", target.line);
      variable.value = coerce(variable.type, value, target.line);
      return variable.value;
    }
    const array = this.eval(target.target, scope);
    const index = num(this.eval(target.index, scope));
    if (!Array.isArray(array)) throw new ArduinoError("this is not an array", target.line);
    if (!Number.isInteger(index) || index < 0 || index >= array.length) {
      throw new ArduinoError("array index " + index + " is outside the array (it has " + array.length + " items)", target.line);
    }
    const variable = target.target.kind === "var" ? this.lookup(scope, target.target.name, target.line) : null;
    array[index] = coerce(variable ? variable.type : "int", value, target.line);
    return array[index];
  }

  assign(node, scope) {
    let value = this.eval(node.value, scope);
    if (node.op !== "=") {
      const old = this.eval(node.target, scope);
      value = this.applyOp(node.op.slice(0, -1), old, value, node.line);
    }
    return this.store(node.target, scope, value);
  }

  // ---- built-in functions
  call(node, scope) {
    const name = node.name;
    if (this.program.functions.has(name)) {
      const args = node.args.map((a) => this.eval(a, scope));
      return this.callFunction(name, args, node.line);
    }
    const host = this.host;
    const args = node.args.map((a) => this.eval(a, scope));
    const n = (i) => {
      if (i >= args.length || !isNum(args[i])) throw new ArduinoError("'" + name + "' needs a number as argument " + (i + 1), node.line);
      return num(args[i]);
    };
    const need = (count) => {
      if (args.length < count) throw new ArduinoError("too few arguments to '" + name + "'", node.line);
    };
    switch (name) {
      case "pinMode": need(2); host.pinMode(this.pin(n(0), node.line), n(1)); return undefined;
      case "digitalWrite": need(2); host.digitalWrite(this.pin(n(0), node.line), n(1) !== 0 ? 1 : 0); return undefined;
      case "digitalRead": need(1); return host.digitalRead(this.pin(n(0), node.line)) ? 1 : 0;
      default: break;
    }
    return this.builtin(name, args, node, n, need);
  }

  pin(value, line) {
    const pin = Math.trunc(value);
    if (!Number.isInteger(pin) || pin < 0 || pin > this.board.maxPin) {
      throw new ArduinoError(
        "pin " + value + " does not exist on this board (" + (this.board.id === "uno" ? "use 0 to 13, or A0 to A5" : "GPIO pins go from 0 to 39") + ")",
        line,
      );
    }
    return pin;
  }

  needEsp(what, line) {
    if (this.board.id !== "esp32") throw new ArduinoError("'" + what + "' is only available on the ESP32 board", line);
  }

  builtin(name, args, node, n, need) {
    const host = this.host;
    const line = node.line;
    switch (name) {
      case "analogRead": {
        need(1);
        let pin = Math.trunc(n(0));
        if (this.board.id === "uno" && pin >= 0 && pin <= 5) pin += 14;
        return Math.max(0, Math.min(this.board.adcMax, Math.trunc(host.analogRead(this.pin(pin, line)))));
      }
      case "touchRead": {
        this.needEsp("touchRead", line);
        need(1);
        return Math.trunc(host.touchRead(this.pin(n(0), line)));
      }
      case "ledcAttach": {
        this.needEsp("ledcAttach", line);
        need(3);
        const bits = Math.trunc(n(2));
        if (bits < 1 || bits > 14) throw new ArduinoError("ledcAttach: the resolution must be between 1 and 14 bits", line);
        const pin = this.pin(n(0), line);
        this.ledc.set(pin, bits);
        host.pinMode(pin, 1);
        return 1;
      }
      case "ledcWrite": {
        this.needEsp("ledcWrite", line);
        need(2);
        const pin = this.pin(n(0), line);
        const bits = this.ledc.get(pin);
        if (bits === undefined) throw new ArduinoError("ledcWrite: pin " + pin + " has no PWM yet (call ledcAttach(pin, frequency, resolution) in setup first)", line);
        const top = 2 ** bits - 1;
        const duty = Math.max(0, Math.min(top, Math.trunc(n(1))));
        host.analogWrite(pin, Math.round((duty * 255) / top));
        return undefined;
      }
      case "analogWrite": need(2); host.analogWrite(this.pin(n(0), line), Math.max(0, Math.min(255, Math.trunc(n(1))))); return undefined;
      case "tone": need(2); host.tone(this.pin(n(0), line), Math.max(0, Math.trunc(n(1))), args.length > 2 ? Math.max(0, Math.trunc(n(2))) : 0); return undefined;
      case "noTone": need(1); host.noTone(this.pin(n(0), line)); return undefined;
      case "delay": need(1); host.delay(Math.max(0, n(0))); return undefined;
      case "delayMicroseconds": need(1); host.delay(Math.max(0, n(0)) / 1000); return undefined;
      case "millis": return wrap(Math.floor(host.micros() / 1000), 32, false);
      case "micros": return wrap(Math.floor(host.micros()), 32, false);
      case "random": {
        need(1);
        let low = 0;
        let high = n(0);
        if (args.length > 1) {
          low = n(0);
          high = n(1);
        }
        if (high <= low) return low;
        this.seed = (Math.imul(this.seed, 1103515245) + 12345) >>> 0;
        return low + (this.seed % Math.trunc(high - low));
      }
      case "randomSeed": need(1); this.seed = Math.trunc(n(0)) >>> 0; return undefined;
      case "map": {
        need(5);
        const [x, a, b, c, d] = [n(0), n(1), n(2), n(3), n(4)];
        if (b === a) throw new ArduinoError("map(): the input range is empty", line);
        return wrap(Math.trunc(((x - a) * (d - c)) / (b - a) + c), 32, true);
      }
      case "constrain": {
        need(3);
        const v = Math.min(Math.max(n(0), n(1)), n(2));
        return args.some((a) => a instanceof F) ? new F(v) : v;
      }
      case "min": need(2); return args.some((a) => a instanceof F) ? new F(Math.min(n(0), n(1))) : Math.min(n(0), n(1));
      case "max": need(2); return args.some((a) => a instanceof F) ? new F(Math.max(n(0), n(1))) : Math.max(n(0), n(1));
      case "abs": need(1); return args[0] instanceof F ? new F(Math.abs(n(0))) : Math.abs(n(0));
      case "pow": need(2); return new F(Math.pow(n(0), n(1)));
      case "sqrt": need(1); return new F(Math.sqrt(n(0)));
      case "sin": need(1); return new F(Math.sin(n(0)));
      case "cos": need(1); return new F(Math.cos(n(0)));
      case "tan": need(1); return new F(Math.tan(n(0)));
      case "round": need(1); return Math.round(n(0));
      case "floor": need(1); return new F(Math.floor(n(0)));
      case "ceil": need(1); return new F(Math.ceil(n(0)));
      case "sq": need(1); return args[0] instanceof F ? new F(n(0) * n(0)) : wrap(n(0) * n(0), 32, true);
      case "int": need(1); return coerce("int", args[0], line);
      case "long": need(1); return coerce("long", args[0], line);
      case "byte": need(1); return coerce("byte", args[0], line);
      case "char": need(1); return coerce("char", args[0], line);
      case "float": need(1); return coerce("float", args[0], line);
      case "String": return args.length === 0 ? "" : toText(args[0]);
      case "lowByte": need(1); return Math.trunc(n(0)) & 255;
      case "highByte": need(1); return (Math.trunc(n(0)) >> 8) & 255;
      case "bitRead": need(2); return (Math.trunc(n(0)) >> Math.trunc(n(1))) & 1;
      case "isDigit": need(1); return n(0) >= 48 && n(0) <= 57 ? 1 : 0;
      case "isAlpha": need(1); return /[A-Za-z]/.test(String.fromCharCode(n(0))) ? 1 : 0;
      default:
        throw new ArduinoError("'" + name + "' was not declared in this scope", line);
    }
  }

  // ---- Serial and String methods
  method(node, scope) {
    const line = node.line;
    if (node.target.kind === "var" && node.target.name === "Serial") {
      const args = node.args.map((a) => this.eval(a, scope));
      return this.serial(node.name, args, line);
    }
    if (node.target.kind === "var" && node.target.name === "WiFi" && !this.hasUserVar("WiFi", scope)) {
      const wargs = node.args.map((a) => this.eval(a, scope));
      return this.wifi(node.name, wargs, line);
    }
    const target = this.eval(node.target, scope);
    const args = node.args.map((a) => this.eval(a, scope));
    if (typeof target !== "string") throw new ArduinoError("'" + node.name + "' is not a member of this value", line);
    const a0 = args[0];
    switch (node.name) {
      case "length": return target.length;
      case "charAt": return new Ch(target.charCodeAt(Math.max(0, num(a0))) || 0);
      case "substring": return target.substring(num(a0), args.length > 1 ? num(args[1]) : undefined);
      case "indexOf": return target.indexOf(toText(a0));
      case "toInt": return wrap(parseInt(target, 10) || 0, 16, true);
      case "toFloat": return new F(parseFloat(target) || 0);
      case "toUpperCase": return target.toUpperCase();
      case "toLowerCase": return target.toLowerCase();
      case "equals": return target === toText(a0) ? 1 : 0;
      case "startsWith": return target.startsWith(toText(a0)) ? 1 : 0;
      case "endsWith": return target.endsWith(toText(a0)) ? 1 : 0;
      case "trim": return target.trim();
      case "concat": return target + toText(a0);
      case "isEmpty": return target.length === 0 ? 1 : 0;
      default:
        throw new ArduinoError("'String' has no member named '" + node.name + "'", line);
    }
  }

  hasUserVar(name, scope) {
    for (let s = scope; s; s = s.parent) if (s.vars.has(name)) return true;
    return this.globals.has(name);
  }

  wifi(name, args, line) {
    this.needEsp("WiFi", line);
    const wifi = this.host.wifi;
    const text = (i) => (typeof args[i] === "string" ? args[i] : toText(args[i]));
    switch (name) {
      case "mode": wifi.mode(); return 1;
      case "begin":
        if (args.length < 1) throw new ArduinoError("WiFi.begin needs a network name: WiFi.begin(\"name\", \"password\")", line);
        wifi.begin(text(0), args.length > 1 ? text(1) : "");
        return undefined;
      case "status": return wifi.status();
      case "localIP": return wifi.ip();
      case "SSID": return wifi.ssid();
      case "RSSI": return wifi.rssi();
      case "disconnect": wifi.disconnect(); return 1;
      case "reconnect": wifi.reconnect(); return 1;
      case "setAutoReconnect": return 1;
      default: throw new ArduinoError("'WiFi' has no member named '" + name + "'", line);
    }
  }

  serial(name, args, line) {
    const host = this.host;
    const show = (value, base) => {
      if (value === undefined) throw new ArduinoError("cannot print a void value", line);
      if (Array.isArray(value)) throw new ArduinoError("cannot print an array", line);
      if (base !== undefined && typeof value === "number") {
        const b = num(base);
        if (b === 16) return (value >>> 0).toString(16).toUpperCase();
        if (b === 2) return (value >>> 0).toString(2);
        if (b === 8) return (value >>> 0).toString(8);
        return String(value);
      }
      if (value instanceof F && base !== undefined && isNum(base)) return formatFloat(value.v, Math.max(0, Math.min(10, Math.trunc(num(base)))));
      return toText(value);
    };
    switch (name) {
      case "begin": case "end": case "flush": return undefined;
      case "print": host.serial(show(args[0], args[1])); return undefined;
      case "println": host.serial((args.length ? show(args[0], args[1]) : "") + "\n"); return undefined;
      case "write": host.serial(args.length && isNum(args[0]) ? String.fromCharCode(num(args[0]) & 255) : toText(args[0])); return undefined;
      case "available": return 0;
      case "read": return -1;
      default: throw new ArduinoError("'Serial' has no member named '" + name + "'", line);
    }
  }
}

// ---- Scripted runs (used by exercise checks) -----------------------------------------
// The program runs on a pretend clock, so a check that covers ten seconds of blinking takes
// a few milliseconds. A script says when buttons are pressed and dials turned.
//   script: { duration: ms, events: [{ t, pin, down } | { t, dial, value }] }
// Returns { error, line, trace: { pins: [{t, pin, level, pwm}], serial: [{t, text}], tones: [{t, f, ms}] } }.
export const SIM = { MAX_DURATION_MS: 120000, MAX_EVENTS: 200, MAX_STEPS: 3000000, MAX_TRACE: 2000 };

class SimulationEnd {}

export function simulate(source, script, boardId = "uno") {
  const board = boardById(boardId);
  const duration = Math.max(1, Math.min(SIM.MAX_DURATION_MS, Number(script?.duration) || 1000));
  const events = (Array.isArray(script?.events) ? script.events : [])
    .slice(0, SIM.MAX_EVENTS)
    .filter((e) => e && Number.isFinite(e.t) && e.t >= 0)
    .sort((a, b) => a.t - b.t);
  const level = new Array(PIN_COUNT).fill(0);
  const pwm = new Array(PIN_COUNT).fill(-1);
  const mode = new Array(PIN_COUNT).fill(0);
  const held = new Array(PIN_COUNT).fill(0);
  const dials = [Math.round(board.adcMax / 2), Math.round(board.adcMax / 2)];
  const trace = { pins: [], serial: [], tones: [], wifi: [] };
  let routerUp = true;
  let now = 0;
  let next = 0;
  let steps = 0;
  const apply = () => {
    while (next < events.length && events[next].t <= now) {
      const e = events[next];
      next += 1;
      if (Number.isInteger(e.pin) && e.pin >= 0 && e.pin < PIN_COUNT) held[e.pin] = e.down ? 1 : 0;
      else if (Number.isInteger(e.dial) && e.dial >= 0 && e.dial < 2) dials[e.dial] = Math.max(0, Math.min(board.adcMax, Math.round(Number(e.value) || 0)));
      else if (typeof e.router === "boolean") routerUp = e.router;
    }
  };
  const record = (pin) => {
    if (trace.pins.length < SIM.MAX_TRACE) trace.pins.push({ t: Math.round(now), pin, level: level[pin], pwm: pwm[pin] });
  };
  const wifi = new WifiSim(() => now, () => routerUp);
  let lastWifi = -1;
  const noteWifi = () => {
    const code = wifi.code;
    if (code !== lastWifi) {
      lastWifi = code;
      if (trace.wifi.length < 200) trace.wifi.push({ t: Math.round(now), status: code });
    }
  };
  const host = {
    pinMode(pin, m) {
      if (m === 1 && board.inputOnly.includes(pin)) return;
      mode[pin] = m === 1 ? 1 : m === 2 || m === 3 ? m : 0;
      if (m !== 1 && (level[pin] || pwm[pin] >= 0)) {
        level[pin] = 0;
        pwm[pin] = -1;
        record(pin);
      }
    },
    digitalWrite(pin, value) {
      if (mode[pin] !== 1) return;
      if (level[pin] !== value || pwm[pin] !== -1) {
        level[pin] = value;
        pwm[pin] = -1;
        record(pin);
      }
    },
    digitalRead(pin) {
      apply();
      if (mode[pin] === 1) return level[pin];
      const d = dialIndex(board, pin);
      if (d >= 0) return dials[d] >= (board.adcMax + 1) / 2 ? 1 : 0;
      const pressed = held[pin] === 1;
      // Kit buttons join the pin to ground: with a pull-up, held reads LOW; without, held reads HIGH.
      return mode[pin] === 2 ? (pressed ? 0 : 1) : pressed ? 1 : 0;
    },
    analogRead(pin) {
      apply();
      const d = dialIndex(board, pin);
      return d >= 0 ? dials[d] : 0;
    },
    touchRead(pin) {
      apply();
      return board.touchPins.includes(pin) && held[pin] === 1 ? TOUCH_TOUCHED : TOUCH_UNTOUCHED;
    },
    analogWrite(pin, value) {
      if (mode[pin] !== 1) return;
      const pwmOk = canPwm(board, pin);
      const lvl = pwmOk ? (value > 0 ? 1 : 0) : value >= 128 ? 1 : 0;
      const p = pwmOk ? value : -1;
      if (level[pin] !== lvl || pwm[pin] !== p) {
        level[pin] = lvl;
        pwm[pin] = p;
        record(pin);
      }
    },
    tone(pin, f, ms) {
      if (pin === board.buzzerPin && trace.tones.length < 500) trace.tones.push({ t: Math.round(now), f, ms });
    },
    noTone(pin) {
      if (pin === board.buzzerPin && trace.tones.length < 500) trace.tones.push({ t: Math.round(now), f: 0, ms: 0 });
    },
    serial(text) {
      if (trace.serial.length < SIM.MAX_TRACE) trace.serial.push({ t: Math.round(now), text });
    },
    wifi: {
      mode() {},
      begin(ssid, pass) {
        apply();
        wifi.begin(ssid, pass);
        noteWifi();
      },
      status() {
        apply();
        const code = wifi.status();
        noteWifi();
        return code;
      },
      ip: () => (apply(), wifi.status(), wifi.ip()),
      ssid: () => (apply(), wifi.status(), wifi.ssid()),
      rssi: () => (apply(), wifi.status(), wifi.rssi()),
      disconnect() {
        wifi.disconnect();
        noteWifi();
      },
      reconnect() {
        apply();
        wifi.reconnect();
      },
    },
    delay(ms) {
      now += ms;
      if (now >= duration) throw new SimulationEnd();
      apply();
    },
    micros: () => now * 1000,
    step() {
      steps += 1;
      if (steps > SIM.MAX_STEPS) throw new ArduinoError("the program is doing too much work without waiting (add a delay)");
    },
  };
  let error = null;
  let line = 0;
  try {
    const machine = new Machine(host, board);
    machine.load(source);
    apply();
    machine.runSetup();
    for (;;) {
      const before = now;
      machine.runLoop();
      if (now === before) host.delay(1);
    }
  } catch (e) {
    if (e instanceof ArduinoError) {
      error = e.message;
      line = e.line || 0;
    } else if (!(e instanceof SimulationEnd)) {
      error = "the simulator stopped unexpectedly";
    }
  }
  return { error, line, trace };
}

/** The level (0 to 1, with PWM) of a pin at a time, read back from a trace. */
export function levelAt(trace, pin, t) {
  let value = 0;
  for (const e of trace.pins) {
    if (e.pin === pin && e.t <= t) value = e.pwm >= 0 ? e.pwm / 255 : e.level;
  }
  return value;
}
