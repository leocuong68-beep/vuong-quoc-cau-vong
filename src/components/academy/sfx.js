// Game sounds for Tin Tin's study space: a boy's voice reactions ("Yay!", "Oh no!")
// plus small blocky sound effects made on the fly with Web Audio (no sound files needed).

export const VOICE = {
  right: ['yay', 'hooray', 'bravo', 'awesome', 'gotit', 'nice', 'bravo_el'],
  wrong: ['ohno', 'oops', 'tryagain'],
  combo: ['combo', 'wow'],
  // Mia's voice set has its own words
  right_mia: ['yay', 'hooray', 'bravo', 'goodjob', 'youdidit', 'bravo_el'],
  combo_mia: ['superstar', 'wow'],
  pass: ['levelup'],
  perfect: ['wow'],
  fail: ['almost'],
  unlock: ['unlock'],
};

let last = '';
let current = null;

// Play one voice line from a group; resolves when it ends (or fails), never rejects.
// dir: 'vox' (Tin Tin, a boy) or 'vox_mia' (Mia, a girl)
export const voice = (group, dir = 'vox') =>
  new Promise((resolve) => {
    const mia = dir === 'vox_mia';
    const list = (mia && VOICE[group + '_mia']) || VOICE[group] || [group];
    let name = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1 && name === last) name = list[(list.indexOf(name) + 1) % list.length];
    last = name;
    try {
      if (current) current.pause();
      const a = new Audio('sounds/academy/' + dir + '/' + name + '.mp3');
      current = a;
      a.volume = 0.9;
      a.addEventListener('ended', resolve, { once: true });
      a.addEventListener('error', resolve, { once: true });
      const p = a.play();
      if (p && p.catch) p.catch(resolve);
      setTimeout(resolve, 3500);
    } catch (e) {
      resolve();
    }
  });

let ctx = null;
const ac = () => {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) {
    return null;
  }
};

const tone = (freq, start, dur, type = 'square', vol = 0.12, slide = 0) => {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
};

const noise = (start, dur, vol = 0.25, cutoff = 900) => {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
};

export const sfx = {
  // button press: a short wooden tap
  click() {
    noise(0, 0.05, 0.18, 2200);
    tone(420, 0, 0.05, 'square', 0.05);
  },
  // right answer: block crunch + a bright little "ding" that climbs
  right() {
    noise(0, 0.09, 0.22, 1600);
    const base = 880 + Math.random() * 300;
    tone(base, 0.03, 0.12, 'triangle', 0.18);
    tone(base * 1.5, 0.1, 0.18, 'triangle', 0.16);
  },
  // wrong answer: a soft low bonk
  wrong() {
    tone(180, 0, 0.22, 'square', 0.12, 0.6);
    noise(0, 0.12, 0.15, 400);
  },
  // streak: quick rising chime
  combo() {
    [660, 880, 1100, 1320].forEach((f, i) => tone(f, i * 0.06, 0.14, 'triangle', 0.14));
  },
  // lesson passed: level-up arpeggio
  levelUp() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.22, 'square', 0.09));
    tone(1568, 0.5, 0.5, 'triangle', 0.14);
  },
  // daily goal: chest opening (creak + sparkle)
  chest() {
    tone(140, 0, 0.35, 'sawtooth', 0.06, 1.6);
    noise(0.05, 0.2, 0.12, 700);
    [1320, 1568, 1760, 2093].forEach((f, i) => tone(f, 0.35 + i * 0.07, 0.25, 'triangle', 0.1));
  },
  // the daily reward (crown / cup): a short victory fanfare with fireworks pops
  fanfare() {
    const n = [
      [523, 0, 0.16],
      [523, 0.18, 0.12],
      [523, 0.32, 0.12],
      [698, 0.46, 0.5],
      [784, 1.0, 0.16],
      [698, 1.18, 0.12],
      [784, 1.32, 0.7],
    ];
    n.forEach(([f, t, d]) => {
      tone(f, t, d, 'square', 0.08);
      tone(f * 2, t, d, 'triangle', 0.06);
    });
    [262, 349, 392].forEach((f, i) => tone(f, [0, 0.46, 1.32][i], 0.6, 'triangle', 0.1));
    [2.2, 2.6, 3.1, 3.5].forEach((t) => {
      tone(300, t, 0.25, 'sawtooth', 0.04, 4);
      noise(t + 0.25, 0.35, 0.22, 1500);
    });
  },
  pop() {
    noise(0, 0.3, 0.2, 1400);
  },
  // lesson not passed yet
  fail() {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.14, 0.2, 'square', 0.08));
  },
};
