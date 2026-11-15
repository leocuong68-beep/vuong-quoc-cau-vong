import { build, choicesFrom, rand, shuffle } from '../helpers.js';

// Khám phá & Robot for Mia (pre-school): day/night, hot/cold, float/sink, magnets, plants,
// weather, senses, and a first robot that moves one or two squares.

const plain = (t) => t.replace(/^[^\p{L}]+/u, '');

// Sort a picture into one of two groups: [emoji, name vi, name el, answer index]
const sorter = (prefix, askVi, askEl, answers, rows) => () => {
  const i = rand(0, rows.length - 1);
  const [emoji, vi, el, ok] = rows[i];
  return {
    sig: prefix + i,
    ask: { vi: askVi.replace('{x}', vi), el: askEl.replace('{x}', el) },
    target: null,
    show: { kind: 'emoji', value: emoji, sub: { vi, el } },
    choiceStyle: 'text',
    choices: answers.map((a, k) => ({ label: a, correct: k === ok })),
    // read aloud without the emoji in front of the answer
    explain: {
      vi: vi + ': ' + plain(answers[ok].vi) + '.',
      el: el + ': ' + plain(answers[ok].el) + '.',
    },
  };
};

// Pick the right picture: [question vi, question el, right emoji, ...wrong emoji]
const picker = (prefix, rows) => () => {
  const i = rand(0, rows.length - 1);
  const [vi, el, right, ...wrong] = rows[i];
  return {
    sig: prefix + i,
    ask: { vi, el },
    target: null,
    show: { kind: 'listen' },
    choiceStyle: 'emoji',
    choices: shuffle([
      { label: right, correct: true },
      ...wrong.map((w) => ({ label: w, correct: false })),
    ]),
  };
};

const DAY = { vi: '☀️ Ban ngày', el: '☀️ Μέρα' };
const NIGHT = { vi: '🌙 Ban đêm', el: '🌙 Νύχτα' };
const dayNight = sorter(
  'dn',
  '{x}: ban ngày hay ban đêm?',
  '{x}: μέρα ή νύχτα;',
  [DAY, NIGHT],
  [
    ['☀️', 'Mặt Trời chiếu sáng', 'Ο ήλιος λάμπει', 0],
    ['🌙', 'Mặt Trăng và sao', 'Το φεγγάρι και τα αστέρια', 1],
    ['🛏️', 'Đi ngủ', 'Πάμε για ύπνο', 1],
    ['🏫', 'Đi học', 'Πάμε σχολείο', 0],
    ['🦉', 'Cú mèo thức', 'Η κουκουβάγια ξυπνάει', 1],
    ['🌻', 'Hoa hướng dương nở', 'Ο ηλιόσπορος ανθίζει', 0],
  ]
);

const HOT = { vi: '🔥 Nóng', el: '🔥 Ζεστό' };
const COLD = { vi: '❄️ Lạnh', el: '❄️ Κρύο' };
const hotCold = sorter(
  'hc',
  '{x}: nóng hay lạnh?',
  '{x}: ζεστό ή κρύο;',
  [HOT, COLD],
  [
    ['🔥', 'Ngọn lửa', 'Η φωτιά', 0],
    ['🧊', 'Viên đá lạnh', 'Το παγάκι', 1],
    ['🍦', 'Kem', 'Το παγωτό', 1],
    ['☕', 'Cốc trà nóng', 'Το τσάι', 0],
    ['⛄', 'Người tuyết', 'Ο χιονάνθρωπος', 1],
    ['☀️', 'Trời nắng hè', 'Ο ήλιος το καλοκαίρι', 0],
    ['🍲', 'Bát súp vừa nấu', 'Η σούπα', 0],
  ]
);

const FLOAT = { vi: '🛟 Nổi', el: '🛟 Επιπλέει' };
const SINK = { vi: '⬇️ Chìm', el: '⬇️ Βουλιάζει' };
const floatSink = sorter(
  'fs',
  'Thả {x} vào nước: nổi hay chìm?',
  '{x} στο νερό: επιπλέει ή βουλιάζει;',
  [FLOAT, SINK],
  [
    ['🦆', 'vịt cao su', 'το παπάκι', 0],
    ['🪨', 'hòn đá', 'η πέτρα', 1],
    ['🍃', 'chiếc lá', 'το φύλλο', 0],
    ['🔑', 'chìa khóa', 'το κλειδί', 1],
    ['⛵', 'chiếc thuyền', 'η βάρκα', 0],
    ['🪙', 'đồng xu', 'το κέρμα', 1],
    ['🧽', 'miếng bọt biển', 'το σφουγγάρι', 0],
  ]
);

const YES = { vi: '🧲 Có', el: '🧲 Ναι' };
const NO = { vi: '✖️ Không', el: '✖️ Όχι' };
const magnet = sorter(
  'mg',
  'Nam châm có hút {x} không?',
  'Ο μαγνήτης τραβάει: {x};',
  [YES, NO],
  [
    ['📎', 'kẹp giấy', 'τον συνδετήρα', 0],
    ['🔩', 'con ốc sắt', 'τη βίδα', 0],
    ['🥫', 'lon sắt', 'την κονσέρβα', 0],
    ['🧸', 'gấu bông', 'το αρκουδάκι', 1],
    ['🍌', 'quả chuối', 'την μπανάνα', 1],
    ['📄', 'tờ giấy', 'το χαρτί', 1],
  ]
);

const NATURE = [
  ['Cây cần gì để lớn?', 'Τι χρειάζεται το φυτό;', '💧', '🍭', '📺'],
  ['Trời mưa, mình mang gì?', 'Βρέχει! Τι παίρνουμε;', '☂️', '🕶️', '🩴'],
  ['Trời lạnh, mình mặc gì?', 'Κάνει κρύο! Τι φοράμε;', '🧥', '🩳', '👙'],
  ['Con gì đẻ trứng?', 'Ποιο ζώο κάνει αυγά;', '🐔', '🐶', '🐱'],
  ['Cá sống ở đâu?', 'Πού ζει το ψάρι;', '🌊', '🌳', '🏜️'],
  ['Con ong làm ra gì?', 'Τι φτιάχνει η μέλισσα;', '🍯', '🥛', '🍞'],
];

const SENSES = [
  ['Mình nghe bằng gì?', 'Με τι ακούμε;', '👂', '👃', '✋'],
  ['Mình ngửi bằng gì?', 'Με τι μυρίζουμε;', '👃', '👂', '🦶'],
  ['Mình nhìn bằng gì?', 'Με τι βλέπουμε;', '👁️', '👄', '👂'],
  ['Mình nếm bằng gì?', 'Με τι γευόμαστε;', '👅', '👁️', '✋'],
  ['Cái gì phát ra ánh sáng?', 'Τι δίνει φως;', '💡', '🧸', '🪨'],
  ['Cái gì kêu to nhất?', 'Τι κάνει τον πιο δυνατό θόρυβο;', '🥁', '🪶', '🧦'],
];

// Robot: one or two steps on a small board
const DIRS = { '➡️': [1, 0], '⬅️': [-1, 0], '⬆️': [0, -1], '⬇️': [0, 1] };
const robot = (maxSteps) => () => {
  const size = 3;
  let from, to, steps;
  do {
    from = [rand(0, 2), rand(0, 2)];
    to = [rand(0, 2), rand(0, 2)];
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    steps = [];
    for (let i = 0; i < Math.abs(dx); i++) steps.push(dx > 0 ? '➡️' : '⬅️');
    for (let i = 0; i < Math.abs(dy); i++) steps.push(dy > 0 ? '⬇️' : '⬆️');
  } while (steps.length < 1 || steps.length > maxSteps);
  const right = steps.join(' ');
  const wrong = Object.keys(DIRS)
    .flatMap((a) =>
      maxSteps > 1 && steps.length > 1 ? Object.keys(DIRS).map((b) => a + ' ' + b) : [a]
    )
    .filter((w) => {
      // a wrong answer must not also reach the star
      const end = w.split(' ').reduce((p, d) => [p[0] + DIRS[d][0], p[1] + DIRS[d][1]], from);
      return w !== right && !(end[0] === to[0] && end[1] === to[1]);
    });
  return {
    sig: 'rb' + from + to,
    ask: { vi: 'Robot đi đường nào để tới ngôi sao?', el: 'Πώς πάει το ρομπότ στο αστέρι;' },
    target: null,
    show: { kind: 'grid', size, from, to },
    choiceStyle: 'code',
    choices: choicesFrom(right, wrong, 3).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const L = (id, vi, elTitle, make) => ({ id: 'msc-' + id, title: { vi, el: elTitle }, make });
const ten =
  (...gens) =>
  () =>
    build(10, gens);

export const MIA_SCIENCE = {
  id: 'science',
  icon: 'science',
  title: { vi: 'Khám phá & Robot', el: 'Ανακαλύπτω & Ρομπότ' },
  short: '🔍',
  color: '#a78bfa',
  units: [
    {
      title: { vi: 'Thế giới quanh em', el: 'Ο κόσμος γύρω μου' },
      lessons: [
        L('dn', 'Ngày và đêm', 'Μέρα και νύχτα', ten(dayNight)),
        L('hc', 'Nóng và lạnh', 'Ζεστό και κρύο', ten(hotCold)),
        L('sense', 'Năm giác quan', 'Οι αισθήσεις', ten(picker('se', SENSES))),
        L('nature', 'Cây, con vật, thời tiết', 'Φύση και καιρός', ten(picker('na', NATURE))),
      ],
    },
    {
      title: { vi: 'Thí nghiệm nhỏ', el: 'Μικρά πειράματα' },
      lessons: [
        L('fs', 'Nổi hay chìm?', 'Επιπλέει ή βουλιάζει;', ten(floatSink)),
        L('mag', 'Nam châm', 'Ο μαγνήτης', ten(magnet)),
      ],
    },
    {
      title: { vi: 'Robot của Mia', el: 'Το ρομπότ της Μία' },
      lessons: [
        L('rb1', 'Robot đi 1 bước', 'Ένα βήμα', ten(robot(1))),
        L('rb2', 'Robot đi 2 bước', 'Δύο βήματα', ten(robot(2))),
      ],
    },
  ],
};
