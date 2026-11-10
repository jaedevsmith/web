# Tetris Neo - Cyber Arcade Edition

A web-based Tetris game built with modern HTML5 Canvas, CSS3, and procedural Web Audio API.

## Features

- **Modern Tetris Guideline Mechanics**:
  - **7-Bag Randomizer**: Fair piece distribution with zero droughts.
  - **SRS (Super Rotation System)**: Full wall kick tables for J, L, S, T, Z, and I tetrominoes.
  - **Ghost Piece**: Real-time landing projection guide.
  - **Hold Piece**: Swap and hold strategic pieces with standard 1-swap limit per drop.
  - **Next Queue**: Previews the upcoming 4 tetrominoes.
  - **Lock Delay & DAS/ARR**: Responsive keyboard controls with standard lock delay and smooth Delayed Auto Shift (DAS) / Auto Repeat Rate (ARR).
- **Scoring & Progression**:
  - Classic scoring: Single, Double, Triple, and Tetris.
  - Back-to-Back Tetris bonus (1.5x multiplier).
  - Combo system with combo multipliers.
  - Soft drop (+1 pt/cell) and Hard drop (+2 pt/cell).
  - Progressive speed increase every 10 cleared lines.
  - Persistent High Score saved to browser `localStorage`.
- **Cyberpunk / Retro Arcade Visuals**:
  - Neon aesthetic with glow shaders, glassmorphism panels, and starfield backdrop.
  - Particle explosion bursts on line clears.
  - Screen shake on Hard Drop and 4-line Tetris clears.
  - Animated floating score banners (+800, TETRIS!, COMBO x2, LEVEL UP!).
- **Procedural Web Audio Engine (`audio.js`)**:
  - 100% self-contained synthesized 8-bit sound effects (Move, Rotate, Drop, Hard Drop slam, Line Clear, Tetris fanfare, Level Up, Game Over).
  - Procedural chiptune 8-bit Tetris Theme A (*Korobeiniki*) background music with synced melody and basslines.
  - Independent SFX and BGM toggles.
- **Mobile & Touch Friendly**:
  - Virtual gamepad controls (D-Pad, CW/CCW rotate, Hold, Hard Drop).
  - Responsive layout scaling cleanly across desktops, tablets, and phones.

---

## Controls

### Keyboard
| Action | Key(s) |
|---|---|
| **Move Left / Right** | `←` / `→` or `A` / `D` |
| **Soft Drop** | `↓` or `S` |
| **Hard Drop** | `Space` |
| **Rotate Clockwise** | `↑` or `W` or `X` |
| **Rotate Counter-Clockwise** | `Z` or `Ctrl` |
| **Hold Piece** | `C` or `Shift` |
| **Pause / Resume** | `P` or `Esc` |
| **Restart Game** | `R` |

### Touch / Mobile
- On-screen directional buttons (`◀`, `▶`, `▼`)
- Rotate CW (`↻ CW` or `▲`), Rotate CCW (`↺ CCW`)
- Dedicated `HOLD` and large glowing `⚡ HARD DROP` pad

---

## How to Run

Simply open `index.html` in any modern web browser:

```bash
# Optional: serve with python locally
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.
