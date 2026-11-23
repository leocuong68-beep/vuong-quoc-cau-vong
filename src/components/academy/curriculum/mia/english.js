import { en } from '../../academySpeech.js';
import { build, choicesFrom, pick } from '../helpers.js';
import { alphabetUnit, phonicsUnits } from '../phonics.js';

// English for Mia (pre-school): colours, numbers, animals, fruit, letters, body. 3 answers, read aloud.

const hearPicture = (items, prefix, ask) => () => {
  const [word, emoji] = pick(items);
  return {
    sig: prefix + word,
    ask,
    target: [en(word, true)],
    show: { kind: 'listen' },
    choiceStyle: 'emoji',
    choices: choicesFrom(
      emoji,
      items.map((x) => x[1]),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [en(word)],
  };
};

const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const number = (from, to) => () => {
  const n = from + Math.floor(Math.random() * (to - from + 1));
  const pool = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return {
    sig: 'n-' + n,
    ask: { vi: 'Nghe số tiếng Anh rồi chọn số đúng.', el: 'Άκου τον αριθμό στα αγγλικά.' },
    target: [en(NUMBERS[n - 1], true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(n, pool, 3).map((c) => ({ label: String(c.value), correct: c.correct })),
  };
};

const letterName = (set) => () => {
  const l = pick(set);
  return {
    sig: 'l-' + l,
    ask: { vi: 'Nghe tên chữ cái tiếng Anh rồi chạm vào chữ đúng.', el: 'Άκου το γράμμα.' },
    target: [en(l, true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(l, set, 3).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const START = [
  ['A', 'apple', '🍎'],
  ['B', 'ball', '⚽'],
  ['C', 'cat', '🐱'],
  ['D', 'dog', '🐶'],
  ['E', 'egg', '🥚'],
  ['F', 'fish', '🐟'],
  ['G', 'goat', '🐐'],
  ['H', 'hat', '🎩'],
  ['I', 'ice cream', '🍦'],
  ['J', 'juice', '🧃'],
];
const firstLetter = () => {
  const [letter, word, emoji] = pick(START);
  return {
    sig: 'f-' + letter,
    ask: { vi: 'Từ này bắt đầu bằng chữ nào?', el: 'Με ποιο γράμμα αρχίζει;' },
    target: [en(word, true)],
    show: { kind: 'emoji', value: emoji, sub: word },
    choiceStyle: 'big',
    choices: choicesFrom(
      letter,
      START.map((x) => x[0]),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const COLOURS = [
  ['red', '🔴'],
  ['blue', '🔵'],
  ['green', '🟢'],
  ['yellow', '🟡'],
  ['orange', '🟠'],
  ['purple', '🟣'],
  ['pink', '🩷'],
  ['black', '⚫'],
  ['white', '⚪'],
];
const ANIMALS = [
  ['cat', '🐱'],
  ['dog', '🐶'],
  ['fish', '🐟'],
  ['bird', '🐦'],
  ['horse', '🐴'],
  ['cow', '🐮'],
  ['duck', '🦆'],
  ['rabbit', '🐰'],
  ['lion', '🦁'],
  ['elephant', '🐘'],
];
const FRUIT = [
  ['apple', '🍎'],
  ['banana', '🍌'],
  ['orange', '🍊'],
  ['grapes', '🍇'],
  ['strawberry', '🍓'],
  ['watermelon', '🍉'],
  ['pear', '🍐'],
  ['cherry', '🍒'],
];
const BODY = [
  ['eye', '👁️'],
  ['nose', '👃'],
  ['ear', '👂'],
  ['mouth', '👄'],
  ['hand', '✋'],
  ['foot', '🦶'],
];

const L = (id, vi, elTitle, make) => ({ id: 'men-' + id, title: { vi, el: elTitle }, make });
const pic = (items, prefix, vi) => () =>
  build(10, [hearPicture(items, prefix, { vi, el: 'Άκου και διάλεξε.' })]);

export const MIA_ENGLISH = {
  id: 'english',
  icon: 'english',
  title: { vi: 'Tiếng Anh', el: 'Αγγλικά' },
  short: 'ABC',
  color: '#f472b6',
  units: [
    // 23/11/2026: bảng chữ cái trước, rồi ghép âm, cuối cùng là từ vựng theo chủ đề
    alphabetUnit('mia', 'men-ph'),
    ...phonicsUnits('mia', 'men-ph'),
    {
      title: { vi: 'Từ đầu tiên', el: 'Οι πρώτες λέξεις' },
      lessons: [
        L(
          'col',
          'Màu sắc',
          'Χρώματα',
          pic(COLOURS, 'col-', 'Nghe màu tiếng Anh rồi chạm vào màu đúng.')
        ),
        L('n5', 'Số 1 đến 5', 'Αριθμοί 1–5', () => build(10, [number(1, 5)])),
        L('n10', 'Số 6 đến 10', 'Αριθμοί 6–10', () => build(10, [number(6, 10)])),
        L('ani', 'Con vật', 'Ζώα', pic(ANIMALS, 'ani-', 'Nghe rồi chạm vào con vật đúng.')),
        L('fruit', 'Trái cây', 'Φρούτα', pic(FRUIT, 'fr-', 'Nghe rồi chạm vào quả đúng.')),
        L('body', 'Cơ thể', 'Το σώμα', pic(BODY, 'bd-', 'Nghe rồi chạm vào hình đúng.')),
      ],
    },
  ],
};
