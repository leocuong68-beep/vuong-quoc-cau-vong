import { build, choicesFrom, pick, rand, shuffle } from '../helpers.js';

// Toán for Mia (pre-school): counting with pictures, numbers, more/less, adding and taking away
// with pictures, shapes and patterns. 3 answers each.

const THINGS = ['🍎', '🍓', '⭐', '🌸', '🐞', '🦋', '🎈', '🍪', '🐟', '🧁'];
const VI_NUM = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
const EL_NUM = [
  'μηδέν',
  'ένα',
  'δύο',
  'τρία',
  'τέσσερα',
  'πέντε',
  'έξι',
  'επτά',
  'οκτώ',
  'εννέα',
  'δέκα',
];
const nums = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const numChoices = (n, from, to) =>
  choicesFrom(n, nums(from, to), 3).map((c) => ({ label: String(c.value), correct: c.correct }));

const count = (from, to) => () => {
  const n = rand(from, to);
  const e = pick(THINGS);
  return {
    sig: 'cnt-' + n,
    ask: { vi: 'Đếm xem có mấy hình nào?', el: 'Μέτρησε! Πόσα είναι;' },
    target: null,
    show: { kind: 'count', emoji: e, n },
    choiceStyle: 'big',
    choices: numChoices(n, Math.max(1, from - 1), to + 1),
    explain: { vi: 'Có ' + VI_NUM[n] + '.', el: 'Είναι ' + EL_NUM[n] + '.' },
  };
};

const findNumber = (to) => () => {
  const n = rand(1, to);
  return {
    sig: 'num-' + n,
    ask: { vi: 'Số ' + VI_NUM[n] + ' đâu nhỉ?', el: 'Πού είναι το ' + EL_NUM[n] + ';' },
    target: null,
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: numChoices(n, 1, to),
  };
};

const more = (wantMore) => () => {
  let a, b;
  do {
    a = rand(1, 6);
    b = rand(1, 6);
  } while (a === b);
  const e = pick(THINGS);
  const leftWins = wantMore ? a > b : a < b;
  return {
    sig: (wantMore ? 'm-' : 'l-') + a + b,
    ask: wantMore
      ? { vi: 'Bên nào nhiều hơn?', el: 'Πού έχει περισσότερα;' }
      : { vi: 'Bên nào ít hơn?', el: 'Πού έχει λιγότερα;' },
    target: null,
    show: { kind: 'compare', emoji: e, a, b },
    choiceStyle: 'big',
    choices: [
      { label: '⬅️', correct: leftWins },
      { label: '➡️', correct: !leftWins },
    ],
  };
};

const addPics = () => {
  const a = rand(1, 3);
  const b = rand(1, 5 - a);
  const e = pick(THINGS);
  return {
    sig: 'add-' + a + b,
    ask: { vi: 'Gộp lại là mấy?', el: 'Πόσα είναι όλα μαζί;' },
    target: null,
    show: { kind: 'sum', emoji: e, a, b, op: '+' },
    choiceStyle: 'big',
    choices: numChoices(a + b, 1, 6),
    explain: {
      vi: VI_NUM[a] + ' thêm ' + VI_NUM[b] + ' là ' + VI_NUM[a + b] + '.',
      el: EL_NUM[a] + ' και ' + EL_NUM[b] + ' κάνουν ' + EL_NUM[a + b] + '.',
    },
  };
};

const takeAway = () => {
  const a = rand(2, 5);
  const b = rand(1, a - 1);
  const e = pick(THINGS);
  return {
    sig: 'sub-' + a + b,
    ask: {
      vi: 'Có ' + VI_NUM[a] + ', bớt đi ' + VI_NUM[b] + '. Còn lại mấy?',
      el: 'Έχουμε ' + EL_NUM[a] + ', φεύγουν ' + EL_NUM[b] + '. Πόσα μένουν;',
    },
    target: null,
    show: { kind: 'sum', emoji: e, a, b, op: '−' },
    choiceStyle: 'big',
    choices: numChoices(a - b, 0, 5),
    explain: { vi: 'Còn lại ' + VI_NUM[a - b] + '.', el: 'Μένουν ' + EL_NUM[a - b] + '.' },
  };
};

const SHAPES = [
  ['🔴', 'hình tròn', 'κύκλος'],
  ['🟥', 'hình vuông', 'τετράγωνο'],
  ['🔺', 'hình tam giác', 'τρίγωνο'],
  ['⭐', 'ngôi sao', 'αστέρι'],
  ['❤️', 'trái tim', 'καρδιά'],
];
const shape = () => {
  const [e, vi, elName] = pick(SHAPES);
  return {
    sig: 'sh-' + e,
    ask: { vi: 'Chạm vào ' + vi + '.', el: 'Βρες το σχήμα: ' + elName + '.' },
    target: null,
    show: { kind: 'listen' },
    choiceStyle: 'emoji',
    choices: choicesFrom(
      e,
      SHAPES.map((x) => x[0]),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const PAIRS = [
  ['🔴', '🔵'],
  ['🍎', '🍌'],
  ['⭐', '🌙'],
  ['🐱', '🐶'],
  ['🌸', '🍀'],
];
const pattern = () => {
  const [x, y] = pick(PAIRS);
  const seq = [x, y, x, y, x];
  const others = shuffle(PAIRS.flat().filter((e) => e !== x && e !== y));
  return {
    sig: 'pt-' + x,
    ask: { vi: 'Tiếp theo là hình gì?', el: 'Ποιο ακολουθεί;' },
    target: null,
    show: { kind: 'text', value: seq.join(' ') + ' ❓' },
    choiceStyle: 'emoji',
    choices: shuffle([
      { label: y, correct: true },
      { label: x, correct: false },
      { label: others[0], correct: false },
    ]),
  };
};

const SIZES = [
  ['🐘', '🐭'],
  ['🌳', '🌱'],
  ['🐳', '🐟'],
  ['🏠', '📦'],
  ['🦒', '🐇'],
];
const bigger = (wantBig) => () => {
  const [big, small] = pick(SIZES);
  return {
    sig: (wantBig ? 'b-' : 's-') + big,
    ask: wantBig
      ? { vi: 'Cái nào to hơn?', el: 'Ποιο είναι μεγαλύτερο;' }
      : { vi: 'Cái nào nhỏ hơn?', el: 'Ποιο είναι μικρότερο;' },
    target: null,
    show: { kind: 'listen' },
    choiceStyle: 'emoji',
    choices: shuffle([
      { label: big, correct: wantBig },
      { label: small, correct: !wantBig },
    ]),
  };
};

const L = (id, vi, elTitle, make) => ({ id: 'mma-' + id, title: { vi, el: elTitle }, make });
const ten =
  (...gens) =>
  () =>
    build(10, gens);

export const MIA_MATH = {
  id: 'math',
  icon: 'math',
  title: { vi: 'Toán', el: 'Μαθηματικά' },
  short: '123',
  color: '#fb923c',
  units: [
    {
      title: { vi: 'Đếm số', el: 'Μετράμε' },
      lessons: [
        L('c3', 'Đếm đến 3', 'Ως το 3', ten(count(1, 3))),
        L('c5', 'Đếm đến 5', 'Ως το 5', ten(count(1, 5))),
        L('f5', 'Tìm số 1 đến 5', 'Βρες τον αριθμό', ten(findNumber(5))),
        L('c10', 'Đếm đến 10', 'Ως το 10', ten(count(5, 10))),
        L('f10', 'Tìm số 1 đến 10', 'Αριθμοί ως το 10', ten(findNumber(10))),
      ],
    },
    {
      title: { vi: 'So sánh và hình', el: 'Συγκρίνουμε' },
      lessons: [
        L('more', 'Nhiều hơn, ít hơn', 'Περισσότερα, λιγότερα', ten(more(true), more(false))),
        L('size', 'To hơn, nhỏ hơn', 'Μεγάλο, μικρό', ten(bigger(true), bigger(false))),
        L('shape', 'Các hình', 'Σχήματα', ten(shape)),
        L('pat', 'Hình gì tiếp theo?', 'Μοτίβα', ten(pattern)),
      ],
    },
    {
      title: { vi: 'Thêm và bớt', el: 'Πρόσθεση, αφαίρεση' },
      lessons: [
        L('add', 'Gộp lại (đến 5)', 'Βάζουμε μαζί', ten(addPics)),
        L('sub', 'Bớt đi (đến 5)', 'Βγάζουμε', ten(takeAway)),
      ],
    },
  ],
};
