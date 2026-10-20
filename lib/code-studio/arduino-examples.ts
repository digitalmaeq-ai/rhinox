// Starter programs for the Arduino simulator. Each one runs on the kit described in arduino.ts.
import type { BoardId } from "./arduino";

export type ArduinoExample = { id: string; title: string; board: BoardId; code: string };

export const ARDUINO_EXAMPLES: ArduinoExample[] = [
  {
    id: "blink",
    board: "uno",
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
    board: "uno",
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
    board: "uno",
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
    board: "uno",
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
    board: "uno",
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
    board: "uno",
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
  {
    id: "esp-blink",
    board: "esp32",
    title: "ESP32: Blink",
    code: `// Blink the ESP32's built-in LED (GPIO 2).
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  Serial.println("LED on");
  delay(500);
  digitalWrite(2, LOW);
  Serial.println("LED off");
  delay(500);
}
`,
  },
  {
    id: "esp-touch",
    board: "esp32",
    title: "ESP32: Touch pad",
    code: `// Touch the pad on GPIO 4: the yellow LED (GPIO 16) lights up.
// touchRead gives a big number (about 70) normally and a small one (about 8) when touched.
void setup() {
  Serial.begin(115200);
  pinMode(16, OUTPUT);
}

void loop() {
  int touch = touchRead(4);
  Serial.println(touch);
  digitalWrite(16, touch < 40 ? HIGH : LOW);
  delay(100);
}
`,
  },
  {
    id: "esp-wifi",
    board: "esp32",
    title: "ESP32: Connect to Wi-Fi",
    code: `// Join the pretend network "RhinoxLab" (password: stem2026).
// No real network is used. The built-in LED lights when you are connected.
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  WiFi.begin("RhinoxLab", "stem2026");
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  digitalWrite(2, HIGH);
}

void loop() {
}
`,
  },
  {
    id: "esp-fade",
    board: "esp32",
    title: "ESP32: Fade an LED",
    code: `// Fade the blue LED (GPIO 18) up and down with PWM.
void setup() {
  ledcAttach(18, 5000, 8);   // pin, frequency, resolution in bits (8 bits: 0 to 255)
}

void loop() {
  for (int duty = 0; duty <= 255; duty++) {
    ledcWrite(18, duty);
    delay(8);
  }
  for (int duty = 255; duty >= 0; duty--) {
    ledcWrite(18, duty);
    delay(8);
  }
}
`,
  },
  {
    id: "esp-dial",
    board: "esp32",
    title: "ESP32: Read a dial",
    code: `// The ESP32 reads dials with 12 bits: 0 to 4095. Turn the dial on GPIO 34.
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(34);
  int percent = map(raw, 0, 4095, 0, 100);
  Serial.print(raw);
  Serial.print(" = ");
  Serial.print(percent);
  Serial.println("%");
  delay(300);
}
`,
  },
];
