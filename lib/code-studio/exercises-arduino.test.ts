// Run with:  npx tsx lib/code-studio/exercises-arduino.test.ts
// Every Arduino exercise: the starter must fail its checks, the reference solution must pass, and wrong tries must fail.
import assert from "node:assert/strict";

import { simulate as rawSimulate } from "../../public/coding-robotics/code-studio/arduino-vm.js";
import type { SimResult } from "./arduino";
import { ARDUINO_EXERCISES, type ArduinoExercise } from "./exercises-arduino";

const simulate = (code: string, script: object, board?: string) => rawSimulate(code, script, board) as unknown as SimResult;

const SOLUTIONS: Record<string, string> = {
  "ar-blink-fast": `void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); delay(250); digitalWrite(13, LOW); delay(250); }`,
  "ar-button-led": `void setup(){ pinMode(12, OUTPUT); pinMode(2, INPUT_PULLUP); } void loop(){ if (digitalRead(2) == LOW) digitalWrite(12, HIGH); else digitalWrite(12, LOW); }`,
  "ar-traffic": `void setup(){ pinMode(12,OUTPUT); pinMode(10,OUTPUT); pinMode(11,OUTPUT); } void loop(){ digitalWrite(12,HIGH); delay(2000); digitalWrite(12,LOW); digitalWrite(10,HIGH); delay(2000); digitalWrite(10,LOW); digitalWrite(11,HIGH); delay(1000); digitalWrite(11,LOW); }`,
  "ar-dimmer": `void setup(){ pinMode(9, OUTPUT); } void loop(){ analogWrite(9, map(analogRead(A0), 0, 1023, 0, 255)); delay(20); }`,
  "ar-serial-count": `int count = 1; void setup(){ Serial.begin(9600); } void loop(){ if (count <= 5) { Serial.println(count); count++; } delay(1000); }`,
  "ar-toggle": `bool ledOn=false; bool wasDown=false; void setup(){ pinMode(10,OUTPUT); pinMode(3,INPUT_PULLUP); } void loop(){ bool down = (digitalRead(3)==LOW); if (down && !wasDown) { ledOn = !ledOn; digitalWrite(10, ledOn); } wasDown = down; delay(10); }`,
  "ar-alarm": `void setup(){ pinMode(12,OUTPUT); } void loop(){ int level = analogRead(A1); if (level > 600) { digitalWrite(12,HIGH); tone(8,880); } else { digitalWrite(12,LOW); noTone(8); } delay(50); }`,
  "ar-sum": `void setup(){ Serial.begin(9600); int total=0; for(int i=1;i<=10;i++){ total = total + i; } Serial.println(total); } void loop(){}`,
  "es-blink": `void setup(){ Serial.begin(115200); pinMode(2, OUTPUT); } void loop(){ digitalWrite(2, HIGH); Serial.println("LED on"); delay(500); digitalWrite(2, LOW); Serial.println("LED off"); delay(500); }`,
  "es-touch": `void setup(){ pinMode(16, OUTPUT); } void loop(){ if (touchRead(4) < 40) digitalWrite(16, HIGH); else digitalWrite(16, LOW); delay(50); }`,
  "es-percent": `void setup(){ Serial.begin(115200); } void loop(){ Serial.println(map(analogRead(34), 0, 4095, 0, 100)); delay(200); }`,
  "es-fade": `void setup(){ ledcAttach(18, 5000, 8); } void loop(){ for (int duty = 0; duty <= 255; duty++) { ledcWrite(18, duty); delay(8); } }`,
  "es-wifi": `void setup(){ Serial.begin(115200); pinMode(2, OUTPUT); WiFi.begin("RhinoxLab", "stem2026"); while (WiFi.status() != WL_CONNECTED) { delay(250); } Serial.println("Connected"); Serial.println(WiFi.localIP()); digitalWrite(2, HIGH); } void loop(){}`,
  "es-wifi-light": `void setup(){ pinMode(16, OUTPUT); pinMode(17, OUTPUT); WiFi.begin("RhinoxGuest"); } void loop(){ bool ok = (WiFi.status() == WL_CONNECTED); digitalWrite(17, ok); digitalWrite(16, !ok); delay(100); }`,
  "es-bigint": `int factorial(int n){ if (n <= 1) return 1; return n * factorial(n - 1); } void setup(){ Serial.begin(115200); Serial.println(factorial(10)); } void loop(){}`,
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
  "es-blink": [`void setup(){ pinMode(2, OUTPUT); } void loop(){ digitalWrite(2, HIGH); delay(500); digitalWrite(2, LOW); delay(500); }`],
  "es-touch": [`void setup(){ pinMode(16, OUTPUT); } void loop(){ if (touchRead(4) > 40) digitalWrite(16, HIGH); else digitalWrite(16, LOW); delay(50); }`],
  "es-percent": [`void setup(){ Serial.begin(115200); } void loop(){ Serial.println(analogRead(34)); delay(200); }`],
  "es-fade": [`void setup(){ ledcAttach(18, 5000, 8); } void loop(){ ledcWrite(18, 255); delay(100); }`],
  "es-wifi": [`void setup(){ Serial.begin(115200); pinMode(2, OUTPUT); WiFi.begin("RhinoxLab", "wrong"); while (WiFi.status() != WL_CONNECTED && millis() < 5000) { delay(250); } Serial.println("Connected"); Serial.println(WiFi.localIP()); digitalWrite(2, HIGH); } void loop(){}`],
  "es-wifi-light": [`void setup(){ pinMode(16, OUTPUT); pinMode(17, OUTPUT); WiFi.begin("RhinoxGuest"); while (WiFi.status() != WL_CONNECTED) { delay(100); } digitalWrite(17, HIGH); } void loop(){}`],
  "es-bigint": [`int factorial(int n){ if (n <= 1) return 1; return n * factorial(n - 1); } void setup(){ Serial.begin(115200); short r = factorial(10); Serial.println(r); } void loop(){}`],
};

function verdict(ex: ArduinoExercise, code: string): string[] {
  const problems: string[] = [];
  for (const c of ex.cases) {
    const r = simulate(code, c.script, ex.board);
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

// The two boards really differ.
const unoBig = simulate("void setup(){ int x = 32767; x = x + 1; Serial.println(x); } void loop(){}", { duration: 100, events: [] }, "uno");
assert.equal(unoBig.trace.serial.map((e) => e.text).join("").trim(), "-32768");
const espBig = simulate("void setup(){ int x = 32767; x = x + 1; Serial.println(x); } void loop(){}", { duration: 100, events: [] }, "esp32");
assert.equal(espBig.trace.serial.map((e) => e.text).join("").trim(), "32768");
assert.match(simulate("void setup(){ WiFi.begin(\"a\"); } void loop(){}", { duration: 100, events: [] }, "uno").error ?? "", /only available on the ESP32/);
assert.match(simulate("void setup(){ touchRead(4); } void loop(){}", { duration: 100, events: [] }, "uno").error ?? "", /only available on the ESP32/);
assert.match(simulate("void setup(){ digitalWrite(50, HIGH); } void loop(){}", { duration: 100, events: [] }, "esp32").error ?? "", /GPIO pins go from 0 to 39/);
assert.match(simulate("void setup(){ ledcWrite(5, 10); } void loop(){}", { duration: 100, events: [] }, "esp32").error ?? "", /no PWM yet/);
// Wi-Fi: wrong password fails, an unknown network is not found, and the router going away is noticed.
const wifiCode = (begin: string) => `void setup(){ WiFi.begin(${begin}); } void loop(){ Serial.println(WiFi.status()); delay(500); }`;
const lastStatus = (src: string, events = [] as never[]) => {
  const r = simulate(src, { duration: 6000, events }, "esp32");
  return Number(r.trace.serial.map((e) => e.text).join("").trim().split("\n").pop());
};
assert.equal(lastStatus(wifiCode('"RhinoxLab", "stem2026"')), 3);
assert.equal(lastStatus(wifiCode('"RhinoxLab", "nope"')), 4);
assert.equal(lastStatus(wifiCode('"Nowhere", "x"')), 1);
assert.equal(lastStatus(wifiCode('"RhinoxGuest"')), 3);

// The scripted run is bounded.
const spin = simulate("void setup(){ while(true){} } void loop(){}", { duration: 1000, events: [] });
assert.match(spin.error ?? "", /too much work/);
const flood = simulate('void setup(){} void loop(){ Serial.println("x"); }', { duration: 60000, events: [] });
assert.ok(flood.trace.serial.length <= 2000);
console.log(`\n${passed} Arduino exercises verified`);
