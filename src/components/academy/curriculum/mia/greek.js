import { el } from '../../academySpeech.js';
import { build, choicesFrom, pick } from '../helpers.js';
import { LETTERS } from '../greek.js';

// Ελληνικά for Mia (pre-school): a few letters at a time, numbers, colours and animals.
// Always 3 answers to pick from, everything read aloud.

const byLower = (list) => LETTERS.filter((l) => list.includes(l.lower));

const hearLetter = (set, pool) => () => {
  const l = pick(set);
  return {
    sig: 'h-' + l.lower,
    ask: { vi: 'Nghe và chạm vào chữ đúng nhé.', el: 'Άκου και άγγιξε το γράμμα.' },
    target: [el(l.name, true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(
      l.lower,
      pool.map((x) => x.lower),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [el(l.name)],
  };
};

const bigSmall = (set, pool) => () => {
  const l = pick(set);
  return {
    sig: 'c-' + l.lower,
    ask: { vi: 'Chữ to này giống chữ nhỏ nào?', el: 'Βρες το μικρό γράμμα.' },
    target: [el(l.name)],
    show: { kind: 'big', value: l.upper },
    choiceStyle: 'big',
    choices: choicesFrom(
      l.lower,
      pool.map((x) => x.lower),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const NUMBERS = ['ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα', 'δέκα'];
const number = (max) => () => {
  const n = 1 + Math.floor(Math.random() * max);
  return {
    sig: 'n-' + n,
    ask: { vi: 'Nghe số tiếng Hy Lạp rồi chọn số đúng.', el: 'Άκου τον αριθμό.' },
    target: [el(NUMBERS[n - 1], true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(
      n,
      Array.from({ length: max }, (_, i) => i + 1),
      3
    ).map((c) => ({ label: String(c.value), correct: c.correct })),
  };
};

const hearPicture = (items, prefix, ask) => () => {
  const [word, emoji] = pick(items);
  return {
    sig: prefix + word,
    ask,
    target: [el(word, true)],
    show: { kind: 'listen' },
    choiceStyle: 'emoji',
    choices: choicesFrom(
      emoji,
      items.map((x) => x[1]),
      3
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [el(word)],
  };
};

const COLOURS = [
  ['κόκκινο', '🔴'],
  ['μπλε', '🔵'],
  ['πράσινο', '🟢'],
  ['κίτρινο', '🟡'],
  ['πορτοκαλί', '🟠'],
  ['μωβ', '🟣'],
  ['μαύρο', '⚫'],
  ['άσπρο', '⚪'],
];
const ANIMALS = [
  ['γάτα', '🐱'],
  ['σκύλος', '🐶'],
  ['ψάρι', '🐟'],
  ['πουλί', '🐦'],
  ['άλογο', '🐴'],
  ['αγελάδα', '🐮'],
  ['κότα', '🐔'],
  ['ποντίκι', '🐭'],
  ['λιοντάρι', '🦁'],
  ['πεταλούδα', '🦋'],
];
const FAMILY = [
  ['μαμά', '👩'],
  ['μπαμπάς', '👨'],
  ['μωρό', '👶'],
  ['γιαγιά', '👵'],
  ['παππούς', '👴'],
];

const L = (id, vi, elTitle, make) => ({ id: 'mgr-' + id, title: { vi, el: elTitle }, make });
const letters = (set, pool) => () => build(10, [hearLetter(set, pool), bigSmall(set, pool)]);
const ae = byLower(['α', 'ε', 'ο']);
const io = byLower(['ι', 'ο', 'υ']);
const mp = byLower(['μ', 'π', 'α']);
const ts = byLower(['τ', 'σ', 'μ', 'π']);
const kl = byLower(['κ', 'λ', 'τ', 'σ']);
const nr = byLower(['ν', 'ρ', 'κ', 'λ']);

export const MIA_GREEK = {
  id: 'greek',
  icon: 'greek',
  title: { vi: 'Tiếng Hy Lạp', el: 'Ελληνικά' },
  short: 'Αα',
  color: '#60a5fa',
  units: [
    {
      title: { vi: 'Chữ cái đầu tiên', el: 'Τα πρώτα γράμματα' },
      lessons: [
        L('ae', 'Chữ α, ε', 'Α α, Ε ε', letters(byLower(['α', 'ε']), ae)),
        L('io', 'Chữ ι, ο', 'Ι ι, Ο ο', letters(byLower(['ι', 'ο']), io)),
        L('mp', 'Chữ μ, π', 'Μ μ, Π π', letters(byLower(['μ', 'π']), mp)),
        L('ts', 'Chữ τ, σ', 'Τ τ, Σ σ', letters(byLower(['τ', 'σ']), ts)),
        L('kl', 'Chữ κ, λ', 'Κ κ, Λ λ', letters(byLower(['κ', 'λ']), kl)),
        L('nr', 'Chữ ν, ρ', 'Ν ν, Ρ ρ', letters(byLower(['ν', 'ρ']), nr)),
      ],
    },
    {
      title: { vi: 'Từ đầu tiên', el: 'Οι πρώτες λέξεις' },
      lessons: [
        L('n5', 'Đếm 1 đến 5', 'Αριθμοί 1–5', () => build(10, [number(5)])),
        L('n10', 'Đếm 1 đến 10', 'Αριθμοί 1–10', () => build(10, [number(10)])),
        L('col', 'Màu sắc', 'Χρώματα', () =>
          build(10, [
            hearPicture(COLOURS, 'col-', {
              vi: 'Nghe màu rồi chạm vào màu đúng.',
              el: 'Ποιο χρώμα είναι;',
            }),
          ])
        ),
        L('ani', 'Con vật', 'Ζώα', () =>
          build(10, [
            hearPicture(ANIMALS, 'ani-', {
              vi: 'Nghe rồi chạm vào con vật đúng.',
              el: 'Ποιο ζώο είναι;',
            }),
          ])
        ),
        L('fam', 'Gia đình', 'Η οικογένεια', () =>
          build(10, [
            hearPicture(FAMILY, 'fam-', {
              vi: 'Nghe rồi chạm vào người đúng.',
              el: 'Ποιος είναι;',
            }),
          ])
        ),
      ],
    },
  ],
};
