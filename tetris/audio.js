/**
 * Tetris Neo - Web Audio Procedural Synth & Sound Engine
 * No external sound assets required; completely self-contained.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.musicTimer = null;
    this.currentNoteIndex = 0;
    this.tempo = 144; // BPM
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;

    // Theme A (Korobeiniki) Melody & Durations
    // [noteName, quarterNotes]
    this.melody = [
      ['E5', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['C5', 0.5], ['B4', 0.5],
      ['A4', 1], ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
      ['B4', 1.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
      ['C5', 1], ['A4', 1], ['A4', 1], ['rest', 1],

      ['D5', 1.5], ['F5', 0.5], ['A5', 1], ['G5', 0.5], ['F5', 0.5],
      ['E5', 1.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
      ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
      ['C5', 1], ['A4', 1], ['A4', 1], ['rest', 1]
    ];

    // Bass line accompaniment
    this.bass = [
      ['E3', 1], ['B3', 1], ['E3', 1], ['B3', 1],
      ['A3', 1], ['E3', 1], ['A3', 1], ['E3', 1],
      ['G#3', 1], ['E3', 1], ['G#3', 1], ['E3', 1],
      ['A3', 1], ['E3', 1], ['A3', 1], ['E3', 1],

      ['D3', 1], ['A3', 1], ['D3', 1], ['A3', 1],
      ['C3', 1], ['G3', 1], ['C3', 1], ['G3', 1],
      ['B2', 1], ['F#3', 1], ['B2', 1], ['G#3', 1],
      ['A3', 1], ['E3', 1], ['A3', 1], ['E3', 1]
    ];

    this.noteFrequencies = {
      'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50
    };
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, gainNode = this.sfxGain, startVol = 0.3, endVol = 0.001) {
    if (!this.initialized || !freq) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(startVol, now);
    env.gain.exponentialRampToValueAtTime(endVol, now + duration);

    osc.connect(env);
    env.connect(gainNode);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playMove() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    this.playTone(330, 'triangle', 0.04, this.sfxGain, 0.25);
  }

  playRotate() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    env.gain.setValueAtTime(0.18, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playHold() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

    env.gain.setValueAtTime(0.3, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playDrop() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    this.playTone(160, 'triangle', 0.06, this.sfxGain, 0.3);
  }

  playHardDrop() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Bass impact
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

    env.gain.setValueAtTime(0.5, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);

    // Subtle noise slap
    this.playNoise(0.08, 0.35);
  }

  playNoise(duration, volume) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  playLineClear(linesCount) {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    if (linesCount === 4) {
      // Tetris fanfare arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'square', 0.2, this.sfxGain, 0.35);
        }, idx * 70);
      });
    } else {
      // 1-3 lines clear chords
      const baseFreqs = [440, 554.37, 659.25]; // A4, C#5, E5
      for (let i = 0; i < linesCount; i++) {
        setTimeout(() => {
          this.playTone(baseFreqs[i % baseFreqs.length], 'square', 0.15, this.sfxGain, 0.25);
        }, i * 60);
      }
    }
  }

  playLevelUp() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, this.sfxGain, 0.4);
      }, idx * 90);
    });
  }

  playGameOver() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    const notes = [493.88, 466.16, 440, 415.30, 392.00, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.22, this.sfxGain, 0.28);
      }, idx * 110);
    });
  }

  /* Chiptune BGM Routine with synchronized 8th-note step sequencer */
  startMusic() {
    this.musicEnabled = true;
    this.init();
    this.resume();
    if (this.musicTimer) clearInterval(this.musicTimer);

    // 64 eighth-notes per loop (8 bars of 4/4 at ~144 BPM)
    // Melody map: [stepIndex (0..63), noteName, durationIn8thNotes]
    const melodyEvents = [
      // Bar 1
      [0, 'E5', 2], [2, 'B4', 1], [3, 'C5', 1], [4, 'D5', 2], [6, 'C5', 1], [7, 'B4', 1],
      // Bar 2
      [8, 'A4', 2], [10, 'A4', 1], [11, 'C5', 1], [12, 'E5', 2], [14, 'D5', 1], [15, 'C5', 1],
      // Bar 3
      [16, 'B4', 3], [19, 'C5', 1], [20, 'D5', 2], [22, 'E5', 2],
      // Bar 4
      [24, 'C5', 2], [26, 'A4', 2], [28, 'A4', 2],
      // Bar 5
      [32, 'D5', 3], [35, 'F5', 1], [36, 'A5', 2], [38, 'G5', 1], [39, 'F5', 1],
      // Bar 6
      [40, 'E5', 3], [43, 'C5', 1], [44, 'E5', 2], [46, 'D5', 1], [47, 'C5', 1],
      // Bar 7
      [48, 'B4', 2], [50, 'B4', 1], [51, 'C5', 1], [52, 'D5', 2], [54, 'E5', 2],
      // Bar 8
      [56, 'C5', 2], [58, 'A4', 2], [60, 'A4', 2]
    ];

    // Bass notes on quarter notes (steps: 0, 2, 4, 6, ...)
    const bassEvents = [
      // Bar 1 (E)
      [0, 'E3'], [2, 'B3'], [4, 'E3'], [6, 'B3'],
      // Bar 2 (Am)
      [8, 'A3'], [10, 'E3'], [12, 'A3'], [14, 'E3'],
      // Bar 3 (E7)
      [16, 'G#3'], [18, 'E3'], [20, 'G#3'], [22, 'E3'],
      // Bar 4 (Am)
      [24, 'A3'], [26, 'E3'], [28, 'A3'], [30, 'E3'],
      // Bar 5 (Dm)
      [32, 'D3'], [34, 'A3'], [36, 'D3'], [38, 'A3'],
      // Bar 6 (C)
      [40, 'C3'], [42, 'G3'], [44, 'C3'], [46, 'G3'],
      // Bar 7 (B / E)
      [48, 'B2'], [50, 'F#3'], [52, 'B2'], [54, 'G#3'],
      // Bar 8 (Am)
      [56, 'A3'], [58, 'E3'], [60, 'A3'], [62, 'E3']
    ];

    const eighthDurationSec = (60 / this.tempo) / 2;
    let currentStep = 0;

    const tick = () => {
      if (!this.musicEnabled || !this.ctx) return;

      const mel = melodyEvents.find(e => e[0] === currentStep);
      if (mel) {
        const freq = this.noteFrequencies[mel[1]];
        const dur = mel[2] * eighthDurationSec * 0.88;
        this.playMusicNote(freq, dur, 'square', 0.12);
      }

      const bas = bassEvents.find(e => e[0] === currentStep);
      if (bas) {
        const freq = this.noteFrequencies[bas[1]];
        const dur = eighthDurationSec * 1.8;
        this.playMusicNote(freq, dur, 'triangle', 0.22);
      }

      currentStep = (currentStep + 1) % 64;
    };

    tick();
    this.musicTimer = setInterval(tick, eighthDurationSec * 1000);
  }

  playMusicNote(freq, duration, type, volume) {
    if (!this.musicEnabled || !this.ctx || !freq) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(volume, now);
    env.gain.setValueAtTime(volume * 0.8, now + duration * 0.6);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(env);
    env.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  stopMusic() {
    this.musicEnabled = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    if (this.musicEnabled) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  toggleSound() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
}

window.soundEngine = new SoundEngine();
