// Starter programs for the Arduino simulator. Each one runs on the kit described in arduino.ts.
export type ArduinoExample = { id: string; title: string; code: string };

export const ARDUINO_EXAMPLES: ArduinoExample[] = [
  {
    id: "blink",
    title: "Blink",
    code: `// Blink: turn the built-in LED on and off.
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`,
  },
  {
    id: "button",
    title: "Button controls an LED",
    code: `// Hold the button on pin 2 to light the red LED on pin 12.
// The button joins the pin to ground, so with INPUT_PULLUP a held button reads LOW.
void setup() {
  pinMode(12, OUTPUT);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(12, HIGH);
  } else {
    digitalWrite(12, LOW);
  }
}
`,
  },
  {
    id: "dimmer",
    title: "Dial dims an LED",
    code: `// Turn the dial on A0 to change how bright the blue LED (pin 9) is.
void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int reading = analogRead(A0);          // 0 to 1023
  int brightness = map(reading, 0, 1023, 0, 255);
  analogWrite(9, brightness);
  Serial.println(brightness);
  delay(100);
}
`,
  },
  {
    id: "traffic",
    title: "Traffic lights",
    code: `// Red (pin 12), yellow (pin 11) and green (pin 10) take turns.
int red = 12;
int yellow = 11;
int green = 10;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  digitalWrite(red, HIGH);
  delay(2000);
  digitalWrite(red, LOW);
  digitalWrite(green, HIGH);
  delay(2000);
  digitalWrite(green, LOW);
  digitalWrite(yellow, HIGH);
  delay(800);
  digitalWrite(yellow, LOW);
}
`,
  },
  {
    id: "tune",
    title: "Buzzer melody",
    code: `// Play a short tune on the buzzer (pin 8) each time you press the button on pin 2.
int notes[] = {262, 294, 330, 349, 392};

void setup() {
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Press the button to play");
}

void loop() {
  if (digitalRead(2) == LOW) {
    for (int i = 0; i < 5; i++) {
      tone(8, notes[i], 200);
      delay(250);
    }
  }
}
`,
  },
  {
    id: "count",
    title: "Serial counter",
    code: `// Count up and print each number to the Serial Monitor.
int count = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print("Count: ");
  Serial.println(count);
  count = count + 1;
  delay(1000);
}
`,
  },
];
