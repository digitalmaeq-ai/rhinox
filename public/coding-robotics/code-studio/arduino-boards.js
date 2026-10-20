// Rhinox Code Studio: the boards Arduino Studio can pretend to be, and the pretend Wi-Fi.
// Plain data and one small class. It is read by the page (only for the numbers), by the worker and
// by the language engine, so they always agree. Nothing here touches a real network: Wi-Fi is a
// short list of made-up networks and a clock.

export const PIN_COUNT = 40;
/** Shared input buffer (Int32Array): slot p (0 to 39) is 1 while the button or touch pad on pin p is held. */
export const ANALOG_BASE = 40; // slots 40 to 45: dial 0 to 5, in the board's own ADC units
export const ROUTER_SLOT = 63; // 1 while the pretend Wi-Fi router is switched on
export const INPUT_SLOTS = 64;

export const BOARDS = {
  uno: {
    id: "uno",
    name: "Arduino Uno",
    maxPin: 19,
    intBits: 16,
    adcMax: 1023,
    ledPins: [13, 12, 11, 10, 9],
    pwmPins: [3, 5, 6, 9, 10, 11],
    inputOnly: [],
    buttonPins: [2, 3],
    dialPins: [14, 15],
    dialNames: ["A0", "A1"],
    touchPins: [],
    buzzerPin: 8,
    ledBuiltin: 13,
    wifi: false,
    baud: 9600,
  },
  esp32: {
    id: "esp32",
    name: "ESP32 DevKit",
    maxPin: 39,
    intBits: 32,
    adcMax: 4095,
    ledPins: [2, 16, 17, 18, 19],
    pwmPins: null, // every output pin can do PWM
    inputOnly: [34, 35, 36, 37, 38, 39],
    buttonPins: [25, 26],
    dialPins: [34, 35],
    dialNames: ["GPIO34", "GPIO35"],
    touchPins: [4, 15],
    buzzerPin: 27,
    ledBuiltin: 2,
    wifi: true,
    baud: 115200,
  },
};

export function boardById(id) {
  return id === "esp32" ? BOARDS.esp32 : BOARDS.uno;
}

export function canPwm(board, pin) {
  return board.pwmPins === null ? !board.inputOnly.includes(pin) : board.pwmPins.includes(pin);
}

/** Which dial (0 or 1) an analogRead pin reads, or -1. */
export function dialIndex(board, pin) {
  return board.dialPins.indexOf(pin);
}

/** What touchRead gives for a pad: small when touched, like the real chip. */
export const TOUCH_UNTOUCHED = 70;
export const TOUCH_TOUCHED = 8;

// The pretend networks. A classroom password is fine here: it is not a secret, it is a lesson.
export const NETWORKS = [
  { ssid: "RhinoxLab", password: "stem2026", rssi: -48 },
  { ssid: "RhinoxGuest", password: "", rssi: -67 },
];
export const FAKE_IP = "192.168.1.42";

// Wi-Fi status numbers, as the real WiFi.status() gives them.
export const WL = { NO_SHIELD: 255, IDLE: 0, NO_SSID_AVAIL: 1, CONNECTED: 3, CONNECT_FAILED: 4, CONNECTION_LOST: 5, DISCONNECTED: 6 };

const CONNECT_MS = 1800;
const NO_SSID_MS = 1500;
const WRONG_PASSWORD_MS = 2500;
const GIVE_UP_MS = 15000;

/** The pretend Wi-Fi chip. now() gives milliseconds; routerUp() says whether the pretend router is on. */
export class WifiSim {
  constructor(now, routerUp) {
    this.now = now;
    this.routerUp = routerUp;
    this.target = null;
    this.state = "off"; // off | connecting | connected | down | failed
    this.code = WL.NO_SHIELD;
    this.since = 0;
  }

  begin(ssid, password) {
    this.target = { ssid: String(ssid).slice(0, 32), password: String(password ?? "").slice(0, 64) };
    this.state = "connecting";
    this.since = this.now();
    this.code = WL.DISCONNECTED;
  }

  disconnect() {
    this.target = null;
    this.state = "off";
    this.code = WL.DISCONNECTED;
  }

  reconnect() {
    if (this.target) {
      this.state = "connecting";
      this.since = this.now();
      this.code = WL.DISCONNECTED;
    }
  }

  tick() {
    if (!this.target || this.state === "off") return;
    const up = this.routerUp();
    const now = this.now();
    if (this.state === "connected" && !up) {
      this.state = "down";
      this.code = WL.DISCONNECTED;
    }
    if (this.state === "down" && up) {
      // The chip reconnects by itself when the router comes back.
      this.state = "connecting";
      this.since = now;
    }
    if (this.state !== "connecting") return;
    const net = NETWORKS.find((n) => n.ssid === this.target.ssid);
    const waited = now - this.since;
    if (!net) {
      this.code = waited >= NO_SSID_MS ? WL.NO_SSID_AVAIL : WL.DISCONNECTED;
      return;
    }
    if (!up) {
      this.code = waited >= GIVE_UP_MS ? WL.NO_SSID_AVAIL : WL.DISCONNECTED;
      return;
    }
    if (net.password !== "" && net.password !== this.target.password) {
      if (waited >= WRONG_PASSWORD_MS) {
        this.state = "failed";
        this.code = WL.CONNECT_FAILED;
      } else this.code = WL.DISCONNECTED;
      return;
    }
    if (waited >= CONNECT_MS) {
      this.state = "connected";
      this.code = WL.CONNECTED;
    } else this.code = WL.DISCONNECTED;
  }

  status() {
    this.tick();
    return this.code;
  }

  ssid() {
    return this.state === "connected" ? this.target.ssid : "";
  }

  ip() {
    return this.state === "connected" ? FAKE_IP : "0.0.0.0";
  }

  rssi() {
    if (this.state !== "connected") return 0;
    return NETWORKS.find((n) => n.ssid === this.target.ssid)?.rssi ?? -70;
  }
}
