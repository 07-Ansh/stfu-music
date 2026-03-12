# 🎹 stfu.music

> *your desi harmonium — your laptop is now a harmonium. You're welcome.*

Push the lid down to pump air, press keys to play notes. It's exactly as unhinged as it sounds. We essentially turn your MacBook into a desi harmonium, using the laptop's magnetic lid sensor as the bellows.

---

## 🧐 How It Works

Your MacBook's lid angle is read by a Python backend via `pybooklid`. That angle data is streamed over a local WebSocket to a browser-based UI, which generates rich, harmonium-like tones using the Web Audio API (dual sawtooth and sine oscillators). 

- **Close the lid** = pump air into the bellows.
- **Hold keys** = play notes.
- **Open the lid** = listen to the silence as the air runs out.

It's essentially a real harmonium, minus the dignity.

## 🚀 Setup & Installation (Beginner Friendly)

**What you need:**
- Python 3.7+
- A MacBook with a working lid sensor (for the bellows effect)
- A modern web browser

### 1. Clone or Download the Repository:
First, download or clone the project folder to your local machine and navigate into it:
```bash
cd stfu-music
```

### 2. Create a Virtual Environment (Recommended):
This keeps the project's dependencies separate from your main system.
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install the Dependencies:
The project only needs a couple of libraries to run:
```bash
pip install websockets pybooklid
```

---

## 🎵 Usage

Whenever you want to jam, just start up the server:

```bash
# Make sure your virtual environment is still activated
python logic.py
```

**That's it.** The server starts, opens `index.html` in your default browser automatically, begins watching your laptop lid, and waits for you to make questionable musical decisions.

To stop the server, just press `Ctrl + C` in your terminal.

---

## 🎮 Playing

| Action | What Happens |
|--------|-------------|
| **Press A, S, D, F, G, H, J, K** | White keys (C through C) |
| **Press W, E, T, Y, U** | Black keys (sharps) |
| **Push lid down** | Pumps "air" into the bellows |
| **Release lid** | Air slowly leaks out, stopping the sound |
| **Hold multiple keys** | Creates chords (or chaos, your call) |
| **Click/tap keys on screen** | Pushes the keys directly from your mouse or touchscreen |

**Cheater Mode:** Not using a MacBook? Or just don't feel like flapping your laptop lid in public? Click the **"don't want to play with your laptop lid..."** banner on the webpage to enable **Auto Pump** mode and bypass the MacBook sensor completely!

## ⌨️ Key Map

```text
  W   E       T   Y   U
  C#  D#      F#  G#  A#
A   S   D   F   G   H   J   K
C   D   E   F   G   A   B   C
```

---

## ✨ Features

- **Lid-as-bellows** — the harder you close your lid, the more air you pump!
- **Web Audio synthesis** — dual oscillators for that authentic, reedy desi harmonium tone.
- **Cheater Mode (Auto-Pump)** — manually pump the harmonium from the browser.
- **Dark/Light Theme** — toggle in the top right to match your vibe. Persists across sessions.
- **Auto-reconnect** — briefly lose connection to the python server? it'll find its way back.
- **Click-to-play** — works on mobile and touch devices too.
- **Colored terminal output** — because plain text is boring.

---

## 🔧 Troubleshooting

- **No sound?** Browsers sometimes block autoplay audio. Click anywhere on the page once first to grand noise permissions. Also check your computer's volume!
- **WebSocket won't connect?** Is `logic.py` actually running in the terminal? Is port `8765` free? The browser retries every 3 seconds, so just start the server and it'll reconnect automatically.
- **Lid angle stuck or no air pumping?** Make sure `pybooklid` is installed correctly and your MacBook's sensor is functional. You can test it by running:
  ```bash
  python -c "from pybooklid import LidSensor; print('ok')"
  ```
  *(Remember: this feature explicitly relies on Apple hardware sensors. If you aren't on a MacBook, use Cheater Mode!)*

## 📜 License

Do whatever you want with it. MIT or whatever. Just don't blame us when your MacBook starts having an identity crisis.
