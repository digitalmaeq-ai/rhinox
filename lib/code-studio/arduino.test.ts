// Run with:  npx tsx lib/code-studio/arduino.test.ts
// Tests for the Arduino language engine (public/coding-robotics/code-studio/arduino-vm.js).
import assert from "node:assert/strict";

import { ArduinoError, Machine } from "../../public/coding-robotics/code-studio/arduino-vm.js";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

type Inputs = Record<number, number>;
function run(src: string, loops = 1, inputs: Inputs = {}) {
  const out: string[] = [];
  const log: unknown[][] = [];
  let t = 0;
  const m = new Machine({
    pinMode: (p: number, mo: number) => log.push(["mode", p, mo]),
    digitalWrite: (p: number, v: number) => log.push(["w", p, v, t]),
    digitalRead: (p: number) => inputs[p] ?? 0,
    analogRead: (p: number) => inputs[p] ?? 512,
    analogWrite: (p: number, v: number) => log.push(["a", p, v]),
    tone: (p: number, f: number, d: number) => log.push(["tone", p, f, d]),
    noTone: (p: number) => log.push(["noTone", p]),
    serial: (s: string) => out.push(s),
    delay: (ms: number) => {
      t += ms;
    },
    micros: () => t * 1000,
    step: () => {},
  });
  m.load(src);
  m.runSetup();
  for (let i = 0; i < loops; i += 1) m.runLoop();
  return { out: out.join(""), log, t };
}
function serial(body: string) {
  return run(`void setup(){ ${body} } void loop(){}`).out;
}
function failure(src: string): string {
  try {
    run(src);
  } catch (e) {
    assert.ok(e instanceof ArduinoError);
    return (e as Error).message;
  }
  return "";
}

test("blink: pins, delay and a counter", () => {
  const r = run(
    `#define LED 13
int n = 0;
void setup(){ pinMode(LED, OUTPUT); Serial.begin(9600); }
void loop(){ digitalWrite(LED, HIGH); delay(500); digitalWrite(LED, LOW); delay(500); n++; Serial.println(n); }`,
    3,
  );
  assert.equal(r.out, "1\n2\n3\n");
  assert.equal(r.t, 3000);
  assert.deepEqual(r.log[0], ["mode", 13, 1]);
  assert.deepEqual(r.log[1], ["w", 13, 1, 0]);
});

test("int is 16 bits, long is 32 bits, unsigned long is wide", () => {
  assert.equal(serial("int x = 32767; x = x + 1; Serial.println(x);"), "-32768\n");
  assert.equal(serial("long x = 2147483647L; x++; Serial.println(x);"), "-2147483648\n");
  assert.equal(serial("unsigned long b = 4000000000UL; Serial.println(b);"), "4000000000\n");
  assert.equal(serial("byte b = 255; b++; Serial.println(b);"), "0\n");
});

test("integer and float division", () => {
  assert.equal(serial("Serial.println(7/2);"), "3\n");
  assert.equal(serial("float f = 7/2; Serial.println(f);"), "3.00\n");
  assert.equal(serial("float f = 7/2.0; Serial.println(f);"), "3.50\n");
  assert.equal(serial("Serial.println(7 % 3);"), "1\n");
  assert.equal(serial("Serial.println(3.14159, 3);"), "3.142\n");
});

test("arrays, loops, switch, strings", () => {
  assert.equal(serial("int a[3] = {1,2,3}; int s=0; for(int i=0;i<3;i++){ s += a[i]; } Serial.println(s);"), "6\n");
  assert.equal(serial("int i=0; while(true){ i++; if(i==3) break; } Serial.println(i);"), "3\n");
  assert.equal(serial("int i=0; do { i += 2; } while(i < 5); Serial.println(i);"), "6\n");
  assert.equal(serial("int s=0; for(int i=0;i<5;i++){ if(i==2) continue; s += i; } Serial.println(s);"), "8\n");
  assert.equal(serial("switch(2){ case 1: Serial.println(\"one\"); break; case 2: Serial.println(\"two\"); case 3: Serial.println(\"three\"); break; default: Serial.println(\"x\"); }"), "two\nthree\n");
  assert.equal(serial("String s = \"hi\"; s += \" there\"; Serial.println(s); Serial.println(s.length());"), "hi there\n8\n");
  assert.equal(serial("Serial.println(255, HEX); Serial.println(5, BIN); Serial.println((char)65);"), "FF\n101\nA\n");
});

test("own functions, recursion, arguments", () => {
  const r = run(`int fact(int n){ if(n<=1) return 1; return n*fact(n-1); }
int total(int v[], int n){ int s=0; for(int i=0;i<n;i++) s+=v[i]; return s; }
void setup(){ int d[3]={4,5,6}; Serial.println(fact(5)); Serial.println(total(d,3)); }
void loop(){}`);
  assert.equal(r.out, "120\n15\n");
});

test("maths helpers", () => {
  assert.equal(serial("Serial.println(map(512,0,1023,0,255));"), "127\n");
  assert.equal(serial("Serial.println(constrain(300,0,255)); Serial.println(min(3,9)); Serial.println(max(3,9)); Serial.println(abs(-4));"), "255\n3\n9\n4\n");
  assert.equal(serial("Serial.println(sqrt(16)); Serial.println(pow(2,10));"), "4.00\n1024.00\n");
});

test("analog and digital inputs", () => {
  const r = run(
    `void setup(){ pinMode(2, INPUT_PULLUP); } void loop(){ if(digitalRead(2)==HIGH) Serial.println("up"); else Serial.println("down"); Serial.println(analogRead(A0)); }`,
    1,
    { 2: 1, 14: 900 },
  );
  assert.equal(r.out, "up\n900\n");
});

test("tone, noTone, analogWrite, millis", () => {
  const r = run(`void setup(){ tone(8, 440, 200); delay(250); noTone(8); analogWrite(9, 300); Serial.println(millis()); } void loop(){}`);
  assert.deepEqual(r.log.find((l) => l[0] === "tone"), ["tone", 8, 440, 200]);
  assert.deepEqual(r.log.find((l) => l[0] === "a"), ["a", 9, 255]);
  assert.equal(r.out, "250\n");
});

test("random is repeatable and in range", () => {
  const a = serial("randomSeed(5); for(int i=0;i<5;i++){ Serial.println(random(1,7)); }");
  const b = serial("randomSeed(5); for(int i=0;i<5;i++){ Serial.println(random(1,7)); }");
  assert.equal(a, b);
  for (const line of a.trim().split("\n")) assert.ok(Number(line) >= 1 && Number(line) <= 6);
});

test("errors name the line, like a compiler", () => {
  assert.equal(failure("void setup(){ int x = ; } void loop(){}"), "line 1: expected an expression before ';'");
  assert.equal(failure("void setup(){ foo(); } void loop(){}"), "line 1: 'foo' was not declared in this scope");
  assert.equal(failure("void setup(){ Serial.println(1) } void loop(){}"), "line 1: expected ';' before '}'");
  assert.equal(failure("void setup(){}"), "the program needs a loop() function: void loop() { }");
  assert.match(failure("void setup(){\n\n int a[2]; a[5] = 1; }\nvoid loop(){}"), /^line 3: array index 5/);
  assert.match(failure("void setup(){ int x = 1 / 0; } void loop(){}"), /division by zero/);
  assert.match(failure("void setup(){ int x; int x; } void loop(){}"), /redeclaration/);
  assert.match(failure("void setup(){ digitalWrite(99, HIGH); } void loop(){}"), /pin 99/);
  assert.match(failure("void f(){ f(); } void setup(){ f(); } void loop(){}"), /nested function calls/);
  assert.match(failure("void setup(){ int *p; } void loop(){}"), /pointers/);
  assert.match(failure("const int k = 1; void setup(){ k = 2; } void loop(){}"), /read-only/);
  assert.match(failure("#pragma once\nvoid setup(){} void loop(){}"), /does not understand/);
});

test("nothing outside the language is reachable", () => {
  for (const name of ["eval", "Function", "constructor", "__proto__", "process", "globalThis", "self"]) {
    assert.match(failure(`void setup(){ ${name}("1"); } void loop(){}`), /was not declared/);
    assert.match(failure(`void setup(){ int x = ${name}; } void loop(){}`), /was not declared/);
  }
  assert.match(failure("void setup(){ Serial.constructor(); } void loop(){}"), /no member/);
  assert.match(failure('void setup(){ String s = "a"; s.constructor(); } void loop(){}'), /no member/);
});

console.log(`\n${passed} Arduino engine checks passed`);
