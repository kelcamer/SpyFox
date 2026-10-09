/* Synthesized music, sound effects and character voices (Web Audio + speechSynthesis). */
window.SF = window.SF || {};
(function (SF) {
  const A = SF.audio = {
    ctx: null, master: null, musicGain: null, sfxGain: null,
    musicOn: true, sfxOn: true, voiceOn: true,
    track: null, step: 0, nextTime: 0, timer: null,
  };

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  // "E2" -> midi number
  const n = (s) => { if (!s) return null; const m = s.match(/^([A-G]#?)(\d)$/); return 12 * (+m[2] + 1) + NOTE[m[1]]; };
  const seq = (str) => str.trim().split(/\s+/).map((t) => (t === '.' ? null : n(t)));

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    A.ctx = new AC();
    A.master = A.ctx.createGain(); A.master.gain.value = 0.8; A.master.connect(A.ctx.destination);
    A.musicGain = A.ctx.createGain(); A.musicGain.gain.value = 0.32; A.musicGain.connect(A.master);
    A.sfxGain = A.ctx.createGain(); A.sfxGain.gain.value = 0.6; A.sfxGain.connect(A.master);
    const len = A.ctx.sampleRate * 0.5;
    A.noise = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const d = A.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (A.pending) { const t = A.pending; A.pending = null; A.music(t); }
  };

  function tone(dest, t, freq, dur, type, vol, opts = {}) {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t + dur);
    if (opts.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = opts.vib; lg.gain.value = freq * 0.02; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const atk = opts.atk || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (opts.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lp; o.connect(f); node = f; }
    node.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dest, t, dur, vol, hp = 6000, bp) {
    const c = A.ctx, s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s.buffer = A.noise; f.type = bp ? 'bandpass' : 'highpass'; f.frequency.value = bp || hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }

  /* ---------- Music: 32-step loops ---------- */
  const TRACKS = {
    // Twangy surf-spy theme in E minor
    spy: {
      bpm: 132,
      bass: seq('E2 . E2 F#2 G2 . F#2 . E2 . E2 F#2 G2 . F#2 . C2 . C2 D2 E2 . D2 . B1 . B1 C#2 D#2 . B1 .'),
      lead: seq('E4 . . G4 . . B4 . A#4 . . . . . . . E4 . . G4 . . B4 . A4 . G4 . F#4 . . . '),
      leadType: 'square', leadVol: 0.06, hat: true, snare: [4, 12, 20, 28],
    },
    // Breezy Mediterranean island
    island: {
      bpm: 118,
      bass: seq('C2 . G2 . C2 . G2 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 . C2 . G2 . E2 . G2 .'),
      lead: seq('E5 . G5 . C6 . G5 . A5 . F5 . . . . . D5 . G5 . B5 . D6 . C6 . . . G5 . . . '),
      leadType: 'triangle', leadVol: 0.1, hat: true, marimba: true,
    },
    // Smoky casino lounge
    casino: {
      bpm: 96,
      bass: seq('A1 . C2 . E2 . G2 . D2 . F2 . A2 . C3 . E2 . G#2 . B2 . D3 . A1 . E2 . A2 . E2 .'),
      lead: seq('. . E4 . . G4 A4 . . . C5 . B4 . A4 . G#4 . . . B4 . . . A4 . . . . . . . '),
      leadType: 'sine', leadVol: 0.12, hat: true, swing: true, snare: [8, 24],
    },
    // Tense villain lair
    lair: {
      bpm: 140,
      bass: seq('D2 D2 . D2 D#2 . D2 . D2 D2 . D2 F2 . D#2 . D2 D2 . D2 D#2 . D2 . G#1 . A1 . A#1 . A1 .'),
      lead: seq('D5 . . . . . . . D#5 . . . . . . . A4 . . . . . . . G#4 . . . A4 . . . '),
      leadType: 'sawtooth', leadVol: 0.035, hat: true, snare: [4, 12, 20, 28],
    },
    // Victory fanfare-ish
    win: {
      bpm: 150,
      bass: seq('C2 . C3 . G2 . C3 . F2 . F3 . C3 . F3 . G2 . G3 . D3 . G3 . C2 . G2 . C3 . . .'),
      lead: seq('C5 . E5 . G5 . C6 . . . A5 . F5 . A5 . B5 . . . G5 . D6 . C6 . . . . . . . '),
      leadType: 'square', leadVol: 0.06, hat: true, snare: [4, 12, 20, 28],
    },
  };

  function scheduleStep(t) {
    const tr = TRACKS[A.track]; if (!tr) return;
    const i = A.step % 32, dst = A.musicGain;
    const b = tr.bass[i]; if (b) tone(dst, t, midi(b), 0.22, 'triangle', 0.5, { lp: 900 });
    if (b && tr === TRACKS.spy) tone(dst, t, midi(b + 12), 0.12, 'square', 0.04, { lp: 1800 });
    const l = tr.lead[i];
    if (l) {
      if (tr.marimba) { tone(dst, t, midi(l), 0.35, 'sine', 0.16); tone(dst, t, midi(l) * 4, 0.08, 'sine', 0.03); }
      else tone(dst, t, midi(l), 0.5, tr.leadType, tr.leadVol, { vib: 5, atk: 0.02 });
    }
    if (tr.hat && i % 2 === 0) noise(dst, t, 0.04, i % 4 === 0 ? 0.08 : 0.05);
    if (tr.snare && tr.snare.includes(i)) noise(dst, t, 0.14, 0.14, 0, 1800);
    if (i % 8 === 0 && tr !== TRACKS.casino) tone(dst, t, 60, 0.15, 'sine', 0.35, { slide: 40 });
  }

  function tick() {
    if (!A.ctx || !A.track) return;
    const tr = TRACKS[A.track];
    const stepDur = 60 / tr.bpm / 4;
    while (A.nextTime < A.ctx.currentTime + 0.15) {
      let t = A.nextTime;
      if (tr.swing && A.step % 2 === 1) t += stepDur * 0.33;
      scheduleStep(t);
      A.nextTime += stepDur; A.step++;
    }
  }

  A.music = function (name) {
    if (!A.ctx) { A.pending = name; return; }
    if (A.track === name && A.timer) return;
    A.stopMusic();
    if (!name || !A.musicOn) { A.track = name; return; }
    A.track = name; A.step = 0; A.nextTime = A.ctx.currentTime + 0.08;
    A.timer = setInterval(tick, 40); tick();
  };
  A.stopMusic = function () { if (A.timer) clearInterval(A.timer); A.timer = null; };
  A.setMusic = function (on) { A.musicOn = on; const t = A.track; A.stopMusic(); A.track = null; if (on && t) A.music(t); else A.track = t; };

  /* ---------- Sound effects ---------- */
  const FX = {
    click: (t, d) => tone(d, t, 900, 0.05, 'square', 0.08),
    beep: (t, d) => { for (let i = 0; i < 3; i++) { tone(d, t + i * 0.18, 1760, 0.09, 'square', 0.12); tone(d, t + i * 0.18 + 0.09, 1320, 0.07, 'square', 0.1); } },
    pickup: (t, d) => [0, 4, 7, 12, 16].forEach((s, i) => tone(d, t + i * 0.06, midi(72 + s), 0.18, 'square', 0.08)),
    zap: (t, d) => { tone(d, t, 1600, 0.35, 'sawtooth', 0.18, { slide: 80 }); noise(d, t, 0.3, 0.2, 2000); },
    door: (t, d) => { tone(d, t, 180, 0.25, 'square', 0.12, { slide: 90, lp: 700 }); noise(d, t, 0.2, 0.08, 0, 500); },
    card: (t, d) => noise(d, t, 0.06, 0.25, 3000),
    win: (t, d) => [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(d, t + i * 0.09, midi(67 + s), 0.25, 'square', 0.09)),
    lose: (t, d) => [0, -1, -2, -3].forEach((s, i) => tone(d, t + i * 0.22, midi(64 + s), 0.3, 'triangle', 0.18, { vib: 7 })),
    buzz: (t, d) => tone(d, t, 110, 0.35, 'sawtooth', 0.15, { lp: 800 }),
    squawk: (t, d) => { tone(d, t, 1400, 0.12, 'sawtooth', 0.12, { slide: 700 }); tone(d, t + 0.14, 1500, 0.16, 'sawtooth', 0.12, { slide: 600 }); },
    splash: (t, d) => noise(d, t, 0.6, 0.3, 0, 900),
    slot: (t, d) => { for (let i = 0; i < 12; i++) tone(d, t + i * 0.06, 600 + (i % 3) * 200, 0.05, 'square', 0.06); [0, 4, 7, 12].forEach((s, i) => tone(d, t + 0.8 + i * 0.07, midi(76 + s), 0.15, 'square', 0.07)); },
    coin: (t, d) => { tone(d, t, midi(83), 0.08, 'square', 0.08); tone(d, t + 0.08, midi(88), 0.25, 'square', 0.08); },
    whoosh: (t, d) => noise(d, t, 0.45, 0.18, 0, 700),
    boing: (t, d) => tone(d, t, 180, 0.4, 'sine', 0.3, { slide: 520 }),
    alarm: (t, d) => { for (let i = 0; i < 4; i++) tone(d, t + i * 0.25, i % 2 ? 660 : 880, 0.22, 'square', 0.09); },
    spray: (t, d) => noise(d, t, 0.7, 0.18, 4000),
    gum: (t, d) => { tone(d, t, 300, 0.25, 'sine', 0.25, { slide: 700 }); tone(d, t + 0.28, 400, 0.08, 'square', 0.1, { slide: 120 }); },
    laser: (t, d) => tone(d, t, 2400, 0.5, 'sawtooth', 0.08, { slide: 600, vib: 30 }),
    honk: (t, d) => { tone(d, t, 330, 0.18, 'square', 0.12, { lp: 1200 }); tone(d, t + 0.22, 330, 0.25, 'square', 0.12, { lp: 1200 }); },
    rumble: (t, d) => { noise(d, t, 1.6, 0.4, 0, 120); tone(d, t, 55, 1.6, 'sawtooth', 0.2, { lp: 200 }); },
    fanfare: (t, d) => [[60, 0], [64, 0.12], [67, 0.24], [72, 0.36], [67, 0.6], [72, 0.72]].forEach(([m, o]) => tone(d, t + o, midi(m), o > 0.5 ? 0.5 : 0.14, 'square', 0.1)),
    pop: (t, d) => tone(d, t, 500, 0.08, 'sine', 0.3, { slide: 1500 }),
    jukebox: (t, d) => [0, 4, 7, 9, 7, 4, 0].forEach((s, i) => tone(d, t + i * 0.13, midi(60 + s), 0.12, 'triangle', 0.15)),
    snore: (t, d) => noise(d, t, 0.9, 0.12, 0, 300),
    moo: (t, d) => tone(d, t, 160, 0.9, 'sawtooth', 0.1, { slide: 120, lp: 600, vib: 4 }),
    bleat: (t, d) => tone(d, t, 420, 0.6, 'sawtooth', 0.08, { vib: 14, lp: 1600 }),
  };
  const BELL_FREQ = [523.25, 659.25, 783.99, 1046.5];
  A.bell = function (i) {
    if (!A.ctx || !A.sfxOn) return;
    const t = A.ctx.currentTime, f = BELL_FREQ[i];
    tone(A.sfxGain, t, f, 0.6, 'square', 0.06, { lp: 2500 });
    tone(A.sfxGain, t, f * 1.5, 0.4, 'sine', 0.12);
    tone(A.sfxGain, t, f * 2.76, 0.25, 'sine', 0.05);
  };
  A.sfx = function (name) {
    if (!A.ctx || !A.sfxOn || !FX[name]) return;
    FX[name](A.ctx.currentTime + 0.01, A.sfxGain);
  };

  /* ---------- Voices ---------- */
  const VOICE = {
    fox: { pitch: 0.85, rate: 1.0 }, penny: { pitch: 1.5, rate: 1.05 }, quack: { pitch: 1.7, rate: 1.2 },
    william: { pitch: 0.55, rate: 0.92 }, leroach: { pitch: 1.9, rate: 1.25 }, udder: { pitch: 0.6, rate: 0.9 },
    walrus: { pitch: 0.4, rate: 0.85 }, sheep: { pitch: 1.6, rate: 1.0 }, pelican: { pitch: 1.1, rate: 0.95 },
    bulldog: { pitch: 0.3, rate: 0.85 }, agent: { pitch: 1.2, rate: 0.95 }, hippo: { pitch: 0.5, rate: 0.9 },
    turtle: { pitch: 0.9, rate: 0.7 }, guard: { pitch: 0.7, rate: 0.9 }, narrator: { pitch: 1.0, rate: 1.0 },
  };
  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)); } catch (e) { voices = []; } }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  A.canSpeak = () => 'speechSynthesis' in window;

  // Speak a line; calls done() when finished (or immediately if voices are off/unavailable).
  A.speak = function (who, text, done) {
    if (!A.voiceOn || !A.canSpeak()) { done && done(false); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_~]/g, ''));
      const v = VOICE[who] || VOICE.narrator;
      u.pitch = v.pitch; u.rate = v.rate; u.volume = 1;
      const pref = voices.find((x) => /en-US/i.test(x.lang) && /Google|Samantha|Daniel|Alex/i.test(x.name)) || voices.find((x) => /en-US/i.test(x.lang)) || voices[0];
      if (pref) u.voice = pref;
      let finished = false;
      const fin = () => { if (!finished) { finished = true; done && done(true); } };
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
    } catch (e) { done && done(false); }
  };
  A.hush = function () { try { if (A.canSpeak()) speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
})(window.SF);
