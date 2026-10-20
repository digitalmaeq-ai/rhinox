# Rhinox Code Studio: the micro:bit simulator (MicroPython API).
#
# This file is loaded by the Python worker. For every run the worker executes it
# afresh with a "backend" (the live board on the page, or a scripted clock for
# exercise checks) and installs the result as the modules "microbit" and "music".
# It has no way to reach the page by itself: everything goes through the backend,
# and the page checks every message again.
#
# The pictures, the font and the sounds are our own drawings, made for this
# simulator. The names and behaviour follow the micro:bit MicroPython API so what
# learners write here is what they will write on a real board.

LEDS = 25

# ---- Pictures (one row per 5 digits, rows joined by ":") ---------------------
_IMAGES = {
    "HEART": "09090:99999:99999:09990:00900",
    "HEART_SMALL": "00000:09090:09990:00900:00000",
    "HAPPY": "00000:09090:00000:90009:09990",
    "SMILE": "00000:00000:00000:90009:09990",
    "SAD": "00000:09090:00000:09990:90009",
    "CONFUSED": "00000:09090:00000:09090:90909",
    "ANGRY": "90009:09090:00000:99999:90909",
    "ASLEEP": "00000:99099:00000:09990:00000",
    "SURPRISED": "09090:00000:00900:09090:00900",
    "SILLY": "90009:00000:99999:00909:00999",
    "FABULOUS": "99999:99099:00000:09090:09990",
    "MEH": "09090:00000:00090:00900:09000",
    "YES": "00000:00009:00090:90900:09000",
    "NO": "90009:09090:00900:09090:90009",
    "TRIANGLE": "00000:00900:09090:99999:00000",
    "TRIANGLE_LEFT": "90000:99000:90900:90090:99999",
    "CHESSBOARD": "09090:90909:09090:90909:09090",
    "DIAMOND": "00900:09090:90009:09090:00900",
    "DIAMOND_SMALL": "00000:00900:09090:00900:00000",
    "SQUARE": "99999:90009:90009:90009:99999",
    "SQUARE_SMALL": "00000:09990:09090:09990:00000",
    "TARGET": "00900:09990:99099:09990:00900",
    "HOUSE": "00900:09990:99999:09990:09090",
    "DUCK": "09900:99900:09999:09990:00000",
    "GHOST": "99999:90909:99999:99999:90909",
    "SKULL": "09990:90909:99999:09990:09990",
    "UMBRELLA": "09990:99999:00900:90900:09900",
    "ARROW_N": "00900:09990:90909:00900:00900",
    "ARROW_NE": "00999:00099:00909:09000:90000",
    "ARROW_E": "00900:00090:99999:00090:00900",
    "ARROW_SE": "90000:09000:00909:00099:00999",
    "ARROW_S": "00900:00900:90909:09990:00900",
    "ARROW_SW": "00009:00090:90900:99000:99900",
    "ARROW_W": "00900:09000:99999:09000:00900",
    "ARROW_NW": "99900:99000:90900:00090:00009",
    "MUSIC_CROTCHET": "00900:00900:00900:99900:99900",
    "MUSIC_QUAVER": "00900:00990:00909:99900:99900",
    "STICKFIGURE": "00900:99999:00900:09090:90009",
    "BUTTERFLY": "99099:99999:00900:99999:99099",
    "TORTOISE": "00000:09990:99999:09090:00000",
    "RABBIT": "90900:90900:99990:99090:99990",
    "COW": "90009:90009:99999:09990:00900",
    "SWORD": "00900:00900:00900:09990:00900",
    "PITCHFORK": "90909:90909:99999:00900:00900",
    "SNAKE": "99000:99099:09090:09999:00000",
    "GIRAFFE": "99000:09000:09000:09990:09090",
    "ROLLERSKATE": "00099:00099:99999:99999:09090",
    "TSHIRT": "99099:99999:09990:09990:09990",
}
for _n in range(1, 13):
    pass


def _clock_image(hour):
    # A clock face: the hand points at the hour (hour 12 = up). Own drawing.
    spots = {
        1: (3, 1), 2: (3, 2), 3: (4, 2), 4: (3, 3), 5: (3, 3),
        6: (2, 4), 7: (1, 3), 8: (1, 3), 9: (0, 2), 10: (1, 2), 11: (1, 1), 12: (2, 0),
    }
    rows = [[0] * 5 for _ in range(5)]
    rows[2][2] = 9
    x, y = spots[hour]
    rows[y][x] = 9
    mx, my = (2 + x) // 2, (2 + y) // 2
    rows[my][mx] = 9
    return ":".join("".join(str(v) for v in row) for row in rows)


for _hour in range(1, 13):
    _IMAGES["CLOCK%d" % _hour] = _clock_image(_hour)

# ---- The font: our own 5-row letters, columns trimmed to fit -----------------
_FONT_SOURCE = {
    "0": "###/#.#/#.#/#.#/###", "1": ".#./##./.#./.#./###", "2": "##./..#/.#./#../###",
    "3": "##./..#/.#./..#/##.", "4": "#.#/#.#/###/..#/..#", "5": "###/#../##./..#/##.",
    "6": ".##/#../###/#.#/###", "7": "###/..#/.#./.#./.#.", "8": "###/#.#/###/#.#/###",
    "9": "###/#.#/###/..#/##.",
    "A": ".#./#.#/###/#.#/#.#", "B": "##./#.#/##./#.#/##.", "C": ".##/#../#../#../.##",
    "D": "##./#.#/#.#/#.#/##.", "E": "###/#../##./#../###", "F": "###/#../##./#../#..",
    "G": ".##/#../#.#/#.#/.##", "H": "#.#/#.#/###/#.#/#.#", "I": "###/.#./.#./.#./###",
    "J": "..#/..#/..#/#.#/.#.", "K": "#.#/#.#/##./#.#/#.#", "L": "#../#../#../#../###",
    "M": "#...#/##.##/#.#.#/#...#/#...#", "N": "#..#/##.#/#.##/#..#/#..#", "O": ".#./#.#/#.#/#.#/.#.",
    "P": "##./#.#/##./#../#..", "Q": ".#./#.#/#.#/##./.##", "R": "##./#.#/##./#.#/#.#",
    "S": ".##/#../.#./..#/##.", "T": "###/.#./.#./.#./.#.", "U": "#.#/#.#/#.#/#.#/###",
    "V": "#.#/#.#/#.#/#.#/.#.", "W": "#...#/#...#/#.#.#/##.##/#...#", "X": "#.#/#.#/.#./#.#/#.#",
    "Y": "#.#/#.#/.#./.#./.#.", "Z": "###/..#/.#./#../###",
    "a": ".../.##/#.#/#.#/.##", "b": "#../#../##./#.#/##.", "c": ".../.##/#../#../.##",
    "d": "..#/..#/.##/#.#/.##", "e": ".../.#./###/#../.##", "f": ".##/#../##./#../#..",
    "g": ".##/#.#/.##/..#/##.", "h": "#../#../##./#.#/#.#", "i": ".#./.../.#./.#./.#.",
    "j": "..#/.../..#/#.#/.#.", "k": "#../#.#/##./#.#/#.#", "l": "##./.#./.#./.#./.##",
    "m": "...../##.#./#.#.#/#.#.#/#...#", "n": ".../##./#.#/#.#/#.#", "o": ".../.#./#.#/#.#/.#.",
    "p": "##./#.#/##./#../#..", "q": ".##/#.#/.##/..#/..#", "r": ".../##./#../#../#..",
    "s": ".../.##/##./..#/##.", "t": ".#./###/.#./.#./.##", "u": ".../#.#/#.#/#.#/.##",
    "v": ".../#.#/#.#/#.#/.#.", "w": "...../#...#/#.#.#/#.#.#/.#.#.", "x": ".../#.#/.#./#.#/#.#",
    "y": "#.#/#.#/.##/..#/##.", "z": ".../###/..#/.#./###",
    "!": "#/#/#/./#", '"': "#.#/#.#/.../.../...", "#": ".#.#./#####/.#.#./#####/.#.#.",
    "$": ".###./#.#../.###./..#.#/.###.", "%": "#...#/...#./..#../.#.../#...#",
    "&": ".#../#.#./.#../#.#./.#.#", "'": "#/#/././.", "(": ".#/#./#./#./.#", ")": "#./.#/.#/.#/#.",
    "*": ".../#.#/.#./#.#/...", "+": ".../.#./###/.#./...", ",": ".../.../.../.#./#..",
    "-": ".../.../###/.../...", ".": "./././.#", "/": "..#/..#/.#./#../#..", ":": "./#/./#/.",
    ";": ".../.#./.../.#./#..", "<": "..#/.#./#../.#./..#", "=": ".../###/.../###/...",
    ">": "#../.#./..#/.#./#..", "?": "##./..#/.#./.../.#.", "@": ".###./#...#/#.###/#.#.#/.###.",
    "[": "##/#./#./#./##", "\\": "#../#../.#./..#/..#", "]": "##/.#/.#/.#/##", "^": ".#./#.#/.../.../...",
    "_": ".../.../.../.../###", "`": "#./.#/../../..", "{": ".##/.#./##./.#./.##", "|": "#/#/#/#/#",
    "}": "##./.#./.##/.#./##.", "~": "..../.#.#/#.#./..../....",
}


def _glyph(ch):
    # The columns of one letter (each column is a list of 5 rows, 0 or 9).
    if ch == " ":
        return [[0] * 5] * 3
    source = _FONT_SOURCE.get(ch, "###/#.#/#.#/#.#/###")
    rows = source.split("/")
    width = len(rows[0])
    columns = [[9 if rows[r][c] == "#" else 0 for r in range(5)] for c in range(width)]
    while len(columns) > 1 and not any(columns[0]):
        columns.pop(0)
    while len(columns) > 1 and not any(columns[-1]):
        columns.pop()
    return columns


class _Panic(BaseException):
    pass


class _SimulationEnd(BaseException):
    """Raised by the scripted clock when the check's time is up (a forever loop is allowed to run until then)."""


def _check_range(name, value, low, high):
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("%s must be an int" % name)
    if value < low or value > high:
        raise ValueError("%s out of bounds" % name)


class Image:
    """A picture of 5x5 (or other size) lights. Brightness 0 (off) to 9 (brightest)."""

    def __init__(self, *args, _readonly=False):
        self._readonly = _readonly
        if len(args) == 0:
            width, height, cells = 5, 5, None
        elif len(args) == 1 and isinstance(args[0], str):
            rows = args[0].split(":")
            if rows and rows[-1] == "":
                rows.pop()
            height = len(rows)
            width = max([len(r) for r in rows] or [0])
            cells = []
            for row in rows:
                for ch in row.ljust(width, "0"):
                    if ch < "0" or ch > "9":
                        raise ValueError("unexpected character in Image definition")
                    cells.append(int(ch))
        elif len(args) in (2, 3) and all(isinstance(a, int) for a in args[:2]):
            width, height = args[0], args[1]
            cells = list(args[2]) if len(args) == 3 else None
            if width < 0 or height < 0:
                raise ValueError("Image dimensions must not be negative")
            if cells is not None and len(cells) != width * height:
                raise ValueError("image data is incorrect size")
        else:
            raise TypeError("Image(s) takes a string like '09090:99999:...', or Image(width, height)")
        if width * height > 400:
            raise ValueError("Image is too big")
        self._w, self._h = width, height
        self._c = cells if cells is not None else [0] * (width * height)

    def width(self):
        return self._w

    def height(self):
        return self._h

    def get_pixel(self, x, y):
        _check_range("index", x, 0, self._w - 1)
        _check_range("index", y, 0, self._h - 1)
        return self._c[y * self._w + x]

    def set_pixel(self, x, y, value):
        if self._readonly:
            raise TypeError("image cannot be modified (try copying first)")
        _check_range("index", x, 0, self._w - 1)
        _check_range("index", y, 0, self._h - 1)
        _check_range("brightness", value, 0, 9)
        self._c[y * self._w + x] = value

    def copy(self):
        return Image(self._w, self._h, list(self._c))

    def fill(self, value):
        if self._readonly:
            raise TypeError("image cannot be modified (try copying first)")
        _check_range("brightness", value, 0, 9)
        self._c = [value] * (self._w * self._h)

    def invert(self):
        return Image(self._w, self._h, [9 - v for v in self._c])

    def crop(self, x, y, w, h):
        out = Image(w, h)
        for j in range(h):
            for i in range(w):
                if 0 <= x + i < self._w and 0 <= y + j < self._h:
                    out._c[j * w + i] = self._c[(y + j) * self._w + x + i]
        return out

    def _shift(self, dx, dy):
        out = Image(self._w, self._h)
        for j in range(self._h):
            for i in range(self._w):
                sx, sy = i - dx, j - dy
                if 0 <= sx < self._w and 0 <= sy < self._h:
                    out._c[j * self._w + i] = self._c[sy * self._w + sx]
        return out

    def shift_left(self, n):
        return self._shift(-n, 0)

    def shift_right(self, n):
        return self._shift(n, 0)

    def shift_up(self, n):
        return self._shift(0, -n)

    def shift_down(self, n):
        return self._shift(0, n)

    def blit(self, src, x, y, w, h, xdest=0, ydest=0):
        if self._readonly:
            raise TypeError("image cannot be modified (try copying first)")
        for j in range(h):
            for i in range(w):
                if 0 <= x + i < src._w and 0 <= y + j < src._h and 0 <= xdest + i < self._w and 0 <= ydest + j < self._h:
                    self._c[(ydest + j) * self._w + xdest + i] = src._c[(y + j) * src._w + x + i]

    def __add__(self, other):
        if not isinstance(other, Image) or other._w != self._w or other._h != self._h:
            raise TypeError("images must be the same size to add")
        return Image(self._w, self._h, [min(9, a + b) for a, b in zip(self._c, other._c)])

    def __mul__(self, factor):
        return Image(self._w, self._h, [max(0, min(9, int(v * factor))) for v in self._c])

    def __eq__(self, other):
        return isinstance(other, Image) and (self._w, self._h, self._c) == (other._w, other._h, other._c)

    __hash__ = None

    def __repr__(self):
        return "Image('" + ":".join("".join(str(v) for v in self._c[r * self._w:(r + 1) * self._w]) for r in range(self._h)) + ":')"

    def __str__(self):
        return "Image('\n    " + "\n    ".join(":".join([""]) if False else "".join(str(v) for v in self._c[r * self._w:(r + 1) * self._w]) + ":" for r in range(self._h)) + "\n')"

    @staticmethod
    def _builtin(text):
        return Image(text, _readonly=True)


for _name, _text in _IMAGES.items():
    setattr(Image, _name, Image._builtin(_text))
Image.ALL_CLOCKS = [getattr(Image, "CLOCK%d" % h) for h in range(1, 13)]
Image.ALL_ARROWS = [getattr(Image, n) for n in ("ARROW_N", "ARROW_NE", "ARROW_E", "ARROW_SE", "ARROW_S", "ARROW_SW", "ARROW_W", "ARROW_NW")]

_GESTURES = ("up", "down", "left", "right", "face up", "face down", "freefall", "3g", "6g", "8g", "shake")
_EVENT_GESTURES = {1: "shake", 2: "freefall", 3: "3g", 4: "6g", 5: "8g"}


# ---- The scripted clock (used by exercise checks): no waiting, same program ---
class ScriptedBackend:
    """Runs the program against a pretend clock. `script` = {"events": [...], "duration": ms}."""

    MAX_FRAMES = 600
    MAX_SOUNDS = 200

    def __init__(self, script):
        script = script or {}
        self.events = sorted(list(script.get("events", [])), key=lambda e: e.get("at", 0))
        self.duration = int(script.get("duration", 5000))
        self.t = 0
        self._next = 0
        self.state = {
            "a": 0, "b": 0, "a_n": 0, "b_n": 0, "logo": 0, "logo_n": 0,
            "x": 0, "y": 0, "z": -1024, "temp": 21, "light": 128,
            "gest": 0, "gest_n": 0, "pin": [0, 0, 0], "touch": [0, 0, 0],
        }
        self._releases = []
        self.frames = []
        self.sounds = []
        self.pins = []
        self.leds = "0" * LEDS
        self.ended = False

    def _apply_due(self):
        s = self.state
        while self._releases and self._releases[0][0] <= self.t:
            _, key = self._releases.pop(0)
            s[key] = 0
        while self._next < len(self.events) and self.events[self._next].get("at", 0) <= self.t:
            e = self.events[self._next]
            self._next += 1
            kind = e.get("do")
            if kind in ("press_a", "press_b", "touch_logo"):
                key = {"press_a": "a", "press_b": "b", "touch_logo": "logo"}[kind]
                s[key] = 1
                s[key + "_n"] += 1
                self._releases.append((self.t + int(e.get("hold", 120)), key))
                self._releases.sort()
            elif kind in ("hold_a", "hold_b"):
                s[kind[-1]] = 1
                s[kind[-1] + "_n"] += 1
            elif kind in ("release_a", "release_b"):
                s[kind[-1]] = 0
            elif kind == "set":
                for k, v in e.items():
                    if k in ("x", "y", "z", "temp", "light"):
                        s[k] = int(v)
                    elif k.startswith("pin") and k[3:].isdigit() and int(k[3:]) < 3:
                        s["pin"][int(k[3:])] = int(v)
            elif kind == "gesture":
                code = {"shake": 1, "freefall": 2, "3g": 3, "6g": 4, "8g": 5}.get(e.get("name"))
                if code:
                    s["gest"] = code
                    s["gest_n"] += 1

    def now(self):
        return self.t

    def poll(self):
        self._apply_due()
        s = dict(self.state)
        s["t"] = self.t
        return s

    def sleep(self, ms):
        end = self.t + max(0, int(ms))
        if end > self.duration:
            self.t = self.duration
            self._apply_due()
            self.ended = True
            raise _SimulationEnd()
        # Events inside the sleep happen in order, so a short press is not missed.
        while True:
            upcoming = [e["at"] for e in self.events[self._next:self._next + 1] if e.get("at", 0) <= end]
            if self._releases and self._releases[0][0] <= end:
                upcoming.append(self._releases[0][0])
            if not upcoming:
                break
            self.t = max(self.t, min(upcoming))
            self._apply_due()
        self.t = end
        self._apply_due()

    def show(self, leds):
        text = "".join(str(v) for v in leds)
        self.leds = text
        if len(self.frames) < self.MAX_FRAMES:
            self.frames.append([self.t, text])
        else:
            self.frames[-1] = [self.t, text]

    def sound(self, freq, ms):
        if len(self.sounds) < self.MAX_SOUNDS:
            self.sounds.append([self.t, int(freq), int(ms)])

    def pin(self, n, kind, value):
        if len(self.pins) < 200:
            self.pins.append([self.t, n, kind, int(value)])

    def trace(self):
        return {"frames": self.frames, "sounds": self.sounds, "pins": self.pins, "leds": self.leds, "ms": self.t, "ended": self.ended}


# ---- The live board (the page): every call goes to the page through the device file
class LiveBackend:
    def __init__(self, ask):
        self._ask = ask
        self._t0 = None

    def now(self):
        return self._ask({"c": "now"})["t"]

    def poll(self):
        return self._ask({"c": "poll"})

    def sleep(self, ms):
        self._ask({"c": "sleep", "ms": max(0, int(ms))})

    def show(self, leds):
        self._ask({"c": "leds", "d": "".join(str(v) for v in leds)})

    def sound(self, freq, ms):
        self._ask({"c": "sound", "f": int(freq), "ms": int(ms)})

    def pin(self, n, kind, value):
        self._ask({"c": "pin", "n": n, "k": kind, "v": int(value)})

    def trace(self):
        return None


# ---- The micro:bit API --------------------------------------------------------
def build(backend):
    """Makes fresh "microbit" and "music" modules that talk to `backend`."""
    import types

    _pixels = [0] * LEDS
    _display_on = [True]
    _last = {"a_n": 0, "b_n": 0, "gest_n": 0, "t_gest": -10**9}
    _taken = {"a": 0, "b": 0, "logo": 0}
    _seen_gestures = []

    def _push():
        backend.show(_pixels if _display_on[0] else [0] * LEDS)

    class _Display:
        def get_pixel(self, x, y):
            _check_range("index", x, 0, 4)
            _check_range("index", y, 0, 4)
            return _pixels[y * 5 + x]

        def set_pixel(self, x, y, value):
            _check_range("index", x, 0, 4)
            _check_range("index", y, 0, 4)
            _check_range("brightness", value, 0, 9)
            _pixels[y * 5 + x] = value
            _push()

        def clear(self):
            for i in range(LEDS):
                _pixels[i] = 0
            _push()

        def on(self):
            _display_on[0] = True
            _push()

        def off(self):
            _display_on[0] = False
            _push()

        def is_on(self):
            return _display_on[0]

        def read_light_level(self):
            return max(0, min(255, int(backend.poll()["light"])))

        def _draw(self, image):
            for j in range(5):
                for i in range(5):
                    _pixels[j * 5 + i] = image._c[j * image._w + i] if i < image._w and j < image._h else 0
            _push()

        def _frames_for(self, value):
            if isinstance(value, Image):
                return [value]
            if isinstance(value, (str, int, float)) and not isinstance(value, bool):
                text = value if isinstance(value, str) else str(value)
                frames = []
                for ch in text:
                    columns = _glyph(ch)
                    left = (5 - len(columns)) // 2
                    img = Image(5, 5)
                    for ci, col in enumerate(columns):
                        if 0 <= left + ci < 5:
                            for r in range(5):
                                img._c[r * 5 + left + ci] = col[r]
                    frames.append(img)
                return frames
            try:
                items = list(value)
            except TypeError:
                raise TypeError("can't convert %s to Image" % type(value).__name__)
            frames = []
            for item in items:
                frames.extend(self._frames_for(item))
            return frames

        def show(self, value, delay=400, *, wait=True, loop=False, clear=False):
            frames = self._frames_for(value)
            if len(frames) == 1 and not loop:
                self._draw(frames[0])
                if clear:
                    backend.sleep(delay)
                    self.clear()
                return
            while True:
                for frame in frames:
                    self._draw(frame)
                    backend.sleep(delay)
                if not loop:
                    break
            if clear:
                self.clear()

        def scroll(self, text, delay=150, *, wait=True, loop=False, monospace=False):
            if not isinstance(text, (str, int, float)) or isinstance(text, bool):
                raise TypeError("can't convert %s to str" % type(text).__name__)
            text = str(text)
            strip = [[0] * 5 for _ in range(5)]
            for index, ch in enumerate(text):
                columns = _glyph(ch)
                if monospace:
                    pad = 5 - len(columns)
                    columns = [[0] * 5] * (pad // 2) + columns + [[0] * 5] * (pad - pad // 2)
                strip.extend(columns)
                strip.append([0] * 5)
            strip.extend([[0] * 5 for _ in range(4)])
            while True:
                for start in range(0, len(strip) - 4):
                    window = strip[start:start + 5]
                    for j in range(5):
                        for i in range(5):
                            _pixels[j * 5 + i] = window[i][j]
                    _push()
                    backend.sleep(delay)
                if not loop:
                    break

    class _Button:
        def __init__(self, key):
            self._key = key

        def is_pressed(self):
            return bool(backend.poll()[self._key])

        def was_pressed(self):
            return self.get_presses() > 0

        def get_presses(self):
            now = backend.poll()[self._key + "_n"]
            count = now - _taken[self._key]
            _taken[self._key] = now
            return count

    class _Touch(_Button):
        def is_touched(self):
            return self.is_pressed()

    class _Pin:
        def __init__(self, number, analog=False, touch=False):
            self._n = number
            self._analog = analog
            self._touch = touch
            self._value = 0
            self._pull = None

        def _input(self):
            if self._n < 3:
                return backend.poll()["pin"][self._n]
            return self._value

        def read_digital(self):
            return 1 if self._input() >= 512 else 0

        def write_digital(self, value):
            _check_range("value", value, 0, 1)
            self._value = value * 1023
            backend.pin(self._n, "d", value)

        def read_analog(self):
            if not self._analog:
                raise TypeError("this pin does not read analog values")
            return int(self._input())

        def write_analog(self, value):
            if not self._analog:
                raise TypeError("this pin does not write analog values")
            _check_range("value", value, 0, 1023)
            self._value = value
            backend.pin(self._n, "a", value)

        def set_analog_period(self, ms):
            _check_range("period", ms, 1, 60000)

        def set_analog_period_microseconds(self, us):
            _check_range("period", us, 1, 60000000)

        def is_touched(self):
            if self._n < 3:
                return bool(backend.poll()["touch"][self._n])
            return False

        def set_pull(self, value):
            self._pull = value

        def get_pull(self):
            return self._pull

    class _Accelerometer:
        def get_x(self):
            return int(backend.poll()["x"])

        def get_y(self):
            return int(backend.poll()["y"])

        def get_z(self):
            return int(backend.poll()["z"])

        def get_values(self):
            s = backend.poll()
            return (int(s["x"]), int(s["y"]), int(s["z"]))

        def _tilt(self, s):
            x, y, z = s["x"], s["y"], s["z"]
            if z <= -600 and abs(x) < 500 and abs(y) < 500:
                return "face up"
            if z >= 600 and abs(x) < 500 and abs(y) < 500:
                return "face down"
            if x <= -500:
                return "left"
            if x >= 500:
                return "right"
            if y <= -500:
                return "up"
            if y >= 500:
                return "down"
            return ""

        def current_gesture(self):
            s = backend.poll()
            if s["gest_n"] != _last["gest_n"]:
                _last["gest_n"] = s["gest_n"]
                name = _EVENT_GESTURES.get(s["gest"], "")
                _last["t_gest"] = s["t"]
                _last["name"] = name
                _seen_gestures.append(name)
            if s["t"] - _last["t_gest"] < 500 and _last.get("name"):
                return _last["name"]
            tilt = self._tilt(s)
            if tilt and tilt != _last.get("tilt"):
                _seen_gestures.append(tilt)
            _last["tilt"] = tilt
            return tilt

        def is_gesture(self, name):
            if name not in _GESTURES:
                raise ValueError("invalid gesture")
            return self.current_gesture() == name

        def was_gesture(self, name):
            if name not in _GESTURES:
                raise ValueError("invalid gesture")
            self.current_gesture()
            found = name in _seen_gestures
            del _seen_gestures[:]
            return found

        def get_gestures(self):
            self.current_gesture()
            seen = tuple(_seen_gestures)
            del _seen_gestures[:]
            return seen

    def sleep(ms):
        if not isinstance(ms, (int, float)) or isinstance(ms, bool):
            raise TypeError("sleep() argument must be a number")
        backend.sleep(ms)

    def running_time():
        return int(backend.now())

    def temperature():
        return int(backend.poll()["temp"])

    def panic(code=0):
        display.show(Image.SAD)
        raise _Panic("panic(%s)" % code)

    def reset():
        raise SystemExit("reset")

    display = _Display()
    button_a = _Button("a")
    button_b = _Button("b")
    pin_logo = _Touch("logo")
    accelerometer = _Accelerometer()
    pins = {}
    for number in range(21):
        pins["pin%d" % number] = _Pin(number, analog=number in (0, 1, 2, 3, 4, 10), touch=number < 3)

    microbit = types.ModuleType("microbit")
    microbit.__doc__ = "The micro:bit simulator of Rhinox Code Studio."
    api = {
        "display": display, "button_a": button_a, "button_b": button_b, "pin_logo": pin_logo,
        "accelerometer": accelerometer, "sleep": sleep, "running_time": running_time,
        "temperature": temperature, "panic": panic, "reset": reset, "Image": Image,
    }
    api.update(pins)
    for name, value in api.items():
        setattr(microbit, name, value)
    microbit.__all__ = sorted(api)

    # ---- music: notes through the speaker ----
    tempo = [4, 120]  # ticks per beat, beats per minute
    _NOTES = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}

    def _frequency(name):
        text = name.strip().lower()
        if text == "r":
            return 0
        letter = text[0]
        if letter not in _NOTES:
            raise ValueError("invalid note: " + name)
        index = 1
        shift = 0
        if index < len(text) and text[index] in "#b" and not (text[index] == "b" and index + 1 >= len(text)):
            shift = 1 if text[index] == "#" else -1
            index += 1
        octave = 4
        if index < len(text):
            try:
                octave = int(text[index:])
            except ValueError:
                raise ValueError("invalid note: " + name)
        semitones = _NOTES[letter] + shift + (octave - 4) * 12 - 9
        return int(round(440 * 2 ** (semitones / 12)))

    music = types.ModuleType("music")

    def pitch(frequency, duration=-1, pin=None, wait=True):
        _check_range("frequency", int(frequency), 0, 20000)
        length = 60000 if duration < 0 else int(duration)
        backend.sound(frequency, min(length, 60000))
        if wait:
            backend.sleep(min(length, 60000))

    def play(music_notes, pin=None, wait=True, loop=False):
        if isinstance(music_notes, str):
            music_notes = [music_notes]
        octave = 4
        ticks = 4
        beat_ms = 60000 / tempo[1]
        while True:
            for note in list(music_notes):
                if not isinstance(note, str):
                    raise TypeError("notes must be strings like 'c4:4'")
                body, _, length = note.partition(":")
                if length:
                    ticks = int(length)
                if body and body[0].lower() in _NOTES and body[1:].isdigit():
                    octave = int(body[1:])
                elif body and body[0].lower() in _NOTES and len(body) > 1 and body[1] in "#b" and body[2:].isdigit():
                    octave = int(body[2:])
                text = body
                if body and body[0].lower() in _NOTES and not any(ch.isdigit() for ch in body):
                    text = body + str(octave)
                frequency = _frequency(text) if text else 0
                duration = int(beat_ms * ticks / tempo[0])
                if frequency:
                    backend.sound(frequency, duration)
                backend.sleep(duration)
            if not loop:
                break

    def set_tempo(ticks=4, bpm=120):
        _check_range("ticks", ticks, 1, 1000)
        _check_range("bpm", bpm, 1, 1000)
        tempo[0], tempo[1] = ticks, bpm

    def get_tempo():
        return (tempo[0], tempo[1])

    def stop(pin=None):
        backend.sound(0, 0)

    def reset_music():
        tempo[0], tempo[1] = 4, 120

    music.pitch, music.play, music.set_tempo, music.get_tempo, music.stop = pitch, play, set_tempo, get_tempo, stop
    music.reset = reset_music
    return microbit, music
