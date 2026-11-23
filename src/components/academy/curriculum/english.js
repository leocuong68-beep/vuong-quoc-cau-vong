import { en } from '../academySpeech.js';
import { build, choicesFrom, pick } from './helpers.js';
import { phonicsUnits } from './phonics.js';

// English — phonics first (letter groups as in Jolly Phonics), then short words and sight words.

const KEY_WORDS = {
  s: ['sun', '☀️'],
  a: ['apple', '🍎'],
  t: ['tiger', '🐯'],
  p: ['pig', '🐷'],
  i: ['insect', '🐜'],
  n: ['nose', '👃'],
  c: ['cat', '🐱'],
  k: ['kite', '🪁'],
  e: ['egg', '🥚'],
  h: ['hat', '🎩'],
  r: ['rabbit', '🐰'],
  m: ['moon', '🌙'],
  d: ['dog', '🐶'],
  g: ['goat', '🐐'],
  o: ['octopus', '🐙'],
  u: ['umbrella', '☂️'],
  l: ['lion', '🦁'],
  f: ['fish', '🐟'],
  b: ['ball', '⚽'],
  j: ['juice', '🧃'],
  z: ['zebra', '🦓'],
  w: ['whale', '🐳'],
  v: ['van', '🚐'],
  y: ['yo-yo', '🪀'],
  q: ['queen', '👑'],
  x: ['fox', '🦊'],
};

const GROUPS = [
  ['s', 'a', 't', 'p', 'i', 'n'],
  ['c', 'k', 'e', 'h', 'r', 'm', 'd'],
  ['g', 'o', 'u', 'l', 'f', 'b'],
  ['j', 'z', 'w', 'v', 'y', 'q'],
];

const startsWith = (letters, pool) => () => {
  const l = pick(letters.filter((x) => x !== 'x'));
  const [word, emoji] = KEY_WORDS[l];
  return {
    sig: 'start-' + l,
    ask: { vi: 'Từ này bắt đầu bằng chữ nào?', el: 'Με ποιο γράμμα αρχίζει;' },
    target: [en(word, true)],
    show: { kind: 'emoji', value: emoji, sub: word },
    choiceStyle: 'big',
    choices: choicesFrom(l, pool).map((c) => ({ label: c.value, correct: c.correct })),
    explain: { vi: word + ' bắt đầu bằng chữ ' + l + '.', el: word + ': ' + l, en: word + ' starts with ' + l + '.' },
  };
};

const upperLower = (letters, pool) => () => {
  const l = pick(letters);
  return {
    sig: 'case-' + l,
    ask: { vi: 'Chữ in hoa này, viết thường là chữ nào?', el: 'Ποιο είναι το μικρό γράμμα;' },
    target: [en(l.toUpperCase())],
    show: { kind: 'big', value: l.toUpperCase() },
    choiceStyle: 'big',
    choices: choicesFrom(l, pool).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const pictureWord = (letters) => () => {
  const l = pick(letters.filter((x) => x !== 'x'));
  const [word, emoji] = KEY_WORDS[l];
  const others = letters.filter((x) => x !== l).map((x) => KEY_WORDS[x][0]);
  return {
    sig: 'pic-' + word,
    ask: { vi: 'Hình này tiếng Anh là gì?', el: 'Πώς το λέμε στα αγγλικά;' },
    target: null,
    show: { kind: 'emoji', value: emoji },
    choiceStyle: 'text',
    choices: choicesFrom(word, others).map((c) => ({
      label: c.value,
      correct: c.correct,
      say: [en(c.value)],
    })),
    explainSay: [en(word)],
  };
};

// Three-letter words: hear one, pick it among words one sound away.
const CVC = [
  ['cat', '🐱'],
  ['dog', '🐶'],
  ['sun', '☀️'],
  ['pig', '🐷'],
  ['hat', '🎩'],
  ['bed', '🛏️'],
  ['cup', '🥤'],
  ['fox', '🦊'],
  ['bus', '🚌'],
  ['box', '📦'],
  ['map', '🗺️'],
  ['pen', '🖊️'],
  ['red', '🟥'],
  ['ten', '🔟'],
  ['bat', '🦇'],
  ['hen', '🐔'],
  ['net', '🥅'],
  ['jam', '🍓'],
  ['bug', '🐛'],
  ['six', '6️⃣'],
];
const VOW = ['a', 'e', 'i', 'o', 'u'];
const neighbours = (word) => {
  const out = [];
  VOW.forEach((v) => out.push(word[0] + v + word[2]));
  'bcdfhmnprst'.split('').forEach((c) => out.push(c + word.slice(1)));
  'gtnpdx'.split('').forEach((c) => out.push(word.slice(0, 2) + c));
  return out.filter((w) => w !== word);
};
const hearCvc = () => {
  const [word, emoji] = pick(CVC);
  return {
    sig: 'cvc-' + word,
    ask: { vi: 'Nghe và chọn từ đúng.', el: 'Άκου και διάλεξε τη λέξη.' },
    target: [en(word, true)],
    show: { kind: 'emoji', value: emoji },
    choiceStyle: 'text',
    choices: choicesFrom(word, neighbours(word)).map((c) => ({
      label: c.value,
      correct: c.correct,
    })),
  };
};
const readCvc = () => {
  const [word, emoji] = pick(CVC);
  return {
    sig: 'rcvc-' + word,
    ask: { vi: 'Tự đọc từ này, rồi chọn hình đúng.', el: 'Διάβασε και διάλεξε την εικόνα.' },
    target: null,
    show: { kind: 'text', value: word },
    choiceStyle: 'emoji',
    choices: choicesFrom(
      emoji,
      CVC.map((x) => x[1])
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [en(word)],
  };
};

const SIGHT = [
  'the',
  'a',
  'I',
  'is',
  'it',
  'in',
  'and',
  'to',
  'you',
  'he',
  'she',
  'we',
  'my',
  'go',
  'no',
  'see',
  'like',
  'can',
  'are',
  'was',
];
const sight = () => {
  const w = pick(SIGHT);
  return {
    sig: 'sight-' + w,
    ask: { vi: 'Nghe và chọn từ đúng.', el: 'Άκου και διάλεξε τη λέξη.' },
    target: [en(w, true)],
    show: { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(w, SIGHT).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const COLORS = [
  ['red', '🔴'],
  ['blue', '🔵'],
  ['green', '🟢'],
  ['yellow', '🟡'],
  ['orange', '🟠'],
  ['purple', '🟣'],
  ['black', '⚫'],
  ['white', '⚪'],
  ['brown', '🟤'],
];
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const colour = () => {
  const [word, emoji] = pick(COLORS);
  return {
    sig: 'col-' + word,
    ask: { vi: 'Màu này tiếng Anh là gì?', el: 'Τι χρώμα είναι στα αγγλικά;' },
    target: null,
    show: { kind: 'emoji', value: emoji },
    choiceStyle: 'text',
    choices: choicesFrom(
      word,
      COLORS.map((c) => c[0])
    ).map((c) => ({ label: c.value, correct: c.correct, say: [en(c.value)] })),
    explainSay: [en(word)],
  };
};
const number = () => {
  const n = Math.floor(Math.random() * 10) + 1;
  const word = NUMBERS[n - 1];
  return {
    sig: 'num-' + n,
    ask: { vi: 'Số này tiếng Anh viết thế nào?', el: 'Πώς γράφεται στα αγγλικά;' },
    target: null,
    show: { kind: 'big', value: String(n) },
    choiceStyle: 'text',
    choices: choicesFrom(word, NUMBERS).map((c) => ({
      label: c.value,
      correct: c.correct,
      say: [en(c.value)],
    })),
    explainSay: [en(word)],
  };
};

const L = (id, vi, elTitle, make) => ({ id: 'en-' + id, title: { vi, el: elTitle }, make });
const all = GROUPS.flat();
const lettersLesson = (group, pool) => () =>
  build(10, [startsWith(group, pool), upperLower(group, pool), pictureWord(group)]);

export const ENGLISH = {
  id: 'english',
  title: { vi: 'Tiếng Anh', el: 'Αγγλικά' },
  short: 'Aa',
  color: '#ef4444',
  // 23/11/2026: giáo trình phonics 4 giai đoạn (chung với Mia), rồi từ vựng màu và số.
  units: [
    ...phonicsUnits('tin', 'en-ph'),
    {
      title: { vi: 'Từ vựng', el: 'Λεξιλόγιο', en: 'Words' },
      lessons: [L('col', 'Màu sắc và con số', 'Χρώματα και αριθμοί', () => build(10, [colour, number]))],
    },
  ],
};
