// Run with:  npx tsx lib/code-studio/exercises-arduino.test.ts
// Every Arduino exercise: the starter must fail its checks, the reference solution must pass, and wrong tries must fail.
import assert from "node:assert/strict";

import { simulate } from "../../public/coding-robotics/code-studio/arduino-vm.js";
import { ARDUINO_EXERCISES, type ArduinoExercise } from "./exercises-arduino";

const SOLUTIONS: Record<string, string> = {
  "ar-blink-fast": `void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); delay(250); digitalWrite(13, LOW); delay(250); }`,
  "ar-button-led": `void setup(){ pinMode(12, OUTPUT); pinMode(2, INPUT_PULLUP); } void loop(){ if (digitalRead(2) == LOW) digitalWrite(12, HIGH); else digitalWrite(12, LOW); }`,
  "ar-traffic": `void setup(){ pinMode(12,OUTPUT); pinMode(10,OUTPUT); pinMode(11,OUTPUT); } void loop(){ digitalWrite(12,HIGH); delay(2000); digitalWrite(12,LOW); digitalWrite(10,HIGH); delay(2000); digitalWrite(10,LOW); digitalWrite(11,HIGH); delay(1000); digitalWrite(11,LOW); }`,
  "ar-dimmer": `void setup(){ pinMode(9, OUTPUT); } void loop(){ analogWrite(9, map(analogRead(A0), 0, 1023, 0, 255)); delay(20); }`,
  "ar-serial-count": `int count = 1; void setup(){ Serial.begin(9600); } void loop(){ if (count <= 5) { Serial.println(count); count++; } delay(1000); }`,
  "ar-toggle": `bool ledOn=false; bool wasDown=false; void setup(){ pinMode(10,OUTPUT); pinMode(3,INPUT_PULLUP); } void loop(){ bool down = (digitalRead(3)==LOW); if (down && !wasDown) { ledOn = !ledOn; digitalWrite(10, ledOn); } wasDown = down; delay(10); }`,
  "ar-alarm": `void setup(){ pinMode(12,OUTPUT); } void loop(){ int level = analogRead(A1); if (level > 600) { digitalWrite(12,HIGH); tone(8,880); } else { digitalWrite(12,LOW); noTone(8); } delay(50); }`,
  "ar-sum": `void setup(){ Serial.begin(9600); int total=0; for(int i=1;i<=10;i++){ total = total + i; } Serial.println(total); } void loop(){}`,
};

// Plausible wrong programs: each must fail at least one check of its exercise.
const WRONG: Record<string, string[]> = {
  "ar-blink-fast": [`void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }`],
  "ar-button-led": [`void setup(){ pinMode(12, OUTPUT); pinMode(2, INPUT_PULLUP); } void loop(){ if (digitalRead(2) == HIGH) digitalWrite(12, HIGH); else digitalWrite(12, LOW); }`],
  "ar-traffic": [`void setup(){ pinMode(12,OUTPUT); pinMode(10,OUTPUT); pinMode(11,OUTPUT); } void loop(){ digitalWrite(12,HIGH); delay(2000); digitalWrite(10,HIGH); delay(2000); digitalWrite(11,HIGH); delay(1000); }`],
  "ar-dimmer": [`void setup(){ pinMode(9, OUTPUT); } void loop(){ analogWrite(9, analogRead(A0)); delay(20); }`],
  "ar-serial-count": [`void setup(){ Serial.begin(9600); } void loop(){ Serial.println(1); delay(1000); }`],
  "ar-toggle": [`void setup(){ pinMode(10,OUTPUT); pinMode(3,INPUT_PULLUP); } void loop(){ digitalWrite(10, digitalRead(3)==LOW); delay(10); }`],
  "ar-alarm": [`void setup(){ pinMode(12,OUTPUT); } void loop(){ if (analogRead(A1) > 600) digitalWrite(12,HIGH); else digitalWrite(12,LOW); delay(50); }`],
  "ar-sum": [`void setup(){ Serial.begin(9600); int t=0; for(int i=1;i<10;i++){ t=t+i; } Serial.println(t); } void loop(){}`],
};

function verdict(ex: ArduinoExercise, code: string): string[] {
  const problems: string[] = [];
  for (const c of ex.cases) {
    const r = simulate(code, c.script);
    if (r.error) problems.push(`${c.name}: error ${r.error}`);
    else {
      const p = c.expect(r.trace);
      if (p) problems.push(`${c.name}: ${p}`);
    }
  }
  return problems;
}

let passed = 0;
const ids = new Set<string>();
for (const ex of ARDUINO_EXERCISES) {
  assert.ok(!ids.has(ex.id), `duplicate id ${ex.id}`);
  ids.add(ex.id);
  assert.ok(ex.hints.length >= 2 && ex.cases.length >= 1 && ex.task.length > 20, ex.id);
  assert.ok(SOLUTIONS[ex.id], `${ex.id} has no reference solution in the test`);
  assert.deepEqual(verdict(ex, SOLUTIONS[ex.id]), [], `${ex.id}: the reference solution must pass`);
  assert.notDeepEqual(verdict(ex, ex.starter), [], `${ex.id}: the untouched starter must NOT pass`);
  for (const wrong of WRONG[ex.id] ?? []) assert.notDeepEqual(verdict(ex, wrong), [], `${ex.id}: a wrong program passed`);
  assert.ok((WRONG[ex.id] ?? []).length > 0, `${ex.id} needs a wrong example`);
  passed += 1;
  console.log("ok  ", ex.id);
}
assert.equal(ids.size, Object.keys(SOLUTIONS).length);

// The scripted run is bounded.
const spin = simulate("void setup(){ while(true){} } void loop(){}", { duration: 1000, events: [] });
assert.match(spin.error ?? "", /too much work/);
const flood = simulate('void setup(){} void loop(){ Serial.println("x"); }', { duration: 60000, events: [] });
assert.ok(flood.trace.serial.length <= 2000);
console.log(`\n${passed} Arduino exercises verified`);
