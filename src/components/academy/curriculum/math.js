import { build, choicesFrom, pick, rand } from './helpers.js';

// Toán lớp 2 (Μαθηματικά Β΄): cộng trừ đến 100, bảng nhân, phép chia là chia đều.

const near = (ans, spread = 3) => {
  const out = [];
  for (let d = -spread; d <= spread; d++) if (d && ans + d >= 0) out.push(ans + d);
  out.push(ans + 10, Math.max(0, ans - 10));
  return out;
};

const OPS = {
  '+': { vi: 'cộng', el: 'συν', en: 'plus' },
  '-': { vi: 'trừ', el: 'μείον', en: 'minus' },
  '×': { vi: 'nhân', el: 'επί', en: 'times' },
  ':': { vi: 'chia', el: 'διά', en: 'divided by' },
};

const exprQ = (a, op, b, ans, sig) => ({
  sig: sig || a + op + b,
  ask: {
    vi: a + ' ' + OPS[op].vi + ' ' + b + ' bằng mấy?',
    el: 'Πόσο κάνει ' + a + ' ' + OPS[op].el + ' ' + b + ';',
    en: 'What is ' + a + ' ' + OPS[op].en + ' ' + b + '?',
  },
  target: null,
  show: { kind: 'expr', value: a + ' ' + op + ' ' + b + ' = ?' },
  choiceStyle: 'big',
  choices: choicesFrom(ans, near(ans)).map((c) => ({ label: String(c.value), correct: c.correct })),
  explain: {
    vi: a + ' ' + OPS[op].vi + ' ' + b + ' bằng ' + ans + '.',
    el: a + ' ' + OPS[op].el + ' ' + b + ' κάνει ' + ans + '.',
    en: a + ' ' + OPS[op].en + ' ' + b + ' is ' + ans + '.',
  },
});

const add = (max, carry) => () => {
  let a, b;
  do {
    a = rand(1, max - 1);
    b = rand(1, max - a);
  } while (
    carry !== undefined &&
    ((a % 10) + (b % 10) >= 10 !== carry || (max > 20 && (a < 10 || b < 10)))
  );
  return exprQ(a, '+', b, a + b);
};
const sub = (max, borrow) => () => {
  let a, b;
  do {
    a = rand(2, max);
    b = rand(1, a - 1);
  } while (borrow !== undefined && (a % 10 < b % 10 !== borrow || (max > 20 && b < 10)));
  return exprQ(a, '-', b, a - b);
};
const missing = () => {
  const a = rand(1, 15);
  const b = rand(1, 15);
  return {
    sig: 'miss-' + a + '-' + b,
    ask: { vi: 'Số nào điền vào ô trống?', el: 'Ποιος αριθμός λείπει;' },
    target: null,
    show: { kind: 'expr', value: '▢ + ' + b + ' = ' + (a + b) },
    choiceStyle: 'big',
    choices: choicesFrom(a, near(a)).map((c) => ({ label: String(c.value), correct: c.correct })),
    explain: {
      vi: a + b + ' trừ ' + b + ' bằng ' + a + '.',
      el: a + b + ' μείον ' + b + ' κάνει ' + a + '.',
      en: a + b + ' minus ' + b + ' is ' + a + '.',
    },
  };
};

const times =
  (tables, maxB = 10) =>
  () => {
    const a = pick(tables);
    const b = rand(1, maxB);
    // Cyprus books read 3 × 4 as "3 times 4": 3 groups of 4
    return exprQ(b, '×', a, a * b, 'x' + b + '-' + a);
  };

const groupsPicture = () => {
  const groups = rand(2, 5);
  const each = rand(2, 5);
  return {
    sig: 'grp-' + groups + '-' + each,
    ask: {
      vi: 'Có mấy nhóm, mỗi nhóm mấy chấm? Chọn phép nhân đúng.',
      el: 'Ποιος πολλαπλασιασμός ταιριάζει;',
    },
    target: null,
    show: { kind: 'dots', groups, each },
    choiceStyle: 'text',
    choices: choicesFrom(
      groups + ' × ' + each + ' = ' + groups * each,
      [
        groups + ' + ' + each + ' = ' + (groups + each),
        groups + ' × ' + (each + 1) + ' = ' + groups * (each + 1),
        groups + 1 + ' × ' + each + ' = ' + (groups + 1) * each,
      ].filter((x) => x !== groups + ' × ' + each + ' = ' + groups * each),
      4
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explain: {
      vi: groups + ' nhóm, mỗi nhóm ' + each + ': ' + groups + ' nhân ' + each + '.',
      el: groups + ' ομάδες των ' + each + '.',
      en: groups + ' groups of ' + each + ': ' + groups + ' times ' + each + '.',
    },
  };
};

const share = () => {
  const people = rand(2, 5);
  const each = rand(2, 5);
  const total = people * each;
  return {
    sig: 'share-' + total + '-' + people,
    ask: {
      vi: 'Chia đều ' + total + ' tấm thẻ cho ' + people + ' bạn. Mỗi bạn được mấy tấm?',
      el: 'Μοιράζουμε ' + total + ' κάρτες σε ' + people + ' παιδιά. Πόσες παίρνει το καθένα;',
      en: 'Share ' + total + ' cards equally between ' + people + ' children. How many does each child get?',
    },
    target: null,
    show: { kind: 'share', total, people },
    choiceStyle: 'big',
    choices: choicesFrom(each, near(each, 2)).map((c) => ({
      label: String(c.value),
      correct: c.correct,
    })),
    explain: {
      vi: total + ' chia ' + people + ' bằng ' + each + '.',
      el: total + ' διά ' + people + ' κάνει ' + each + '.',
      en: total + ' divided by ' + people + ' is ' + each + '.',
    },
  };
};

const divide = (divisors) => () => {
  const d = pick(divisors);
  const q = rand(1, 10);
  return exprQ(d * q, ':', d, q, 'd' + d * q + '-' + d);
};

const fact = () => {
  const a = rand(2, 9);
  const b = rand(2, 9);
  return {
    sig: 'fact-' + a + '-' + b,
    ask: {
      vi:
        'Biết ' +
        a +
        ' nhân ' +
        b +
        ' bằng ' +
        a * b +
        '. Vậy ' +
        a * b +
        ' chia ' +
        a +
        ' bằng mấy?',
      el:
        'Αφού ' + a + ' επί ' + b + ' κάνει ' + a * b + ', πόσο κάνει ' + a * b + ' διά ' + a + ';',
      en: a + ' times ' + b + ' is ' + a * b + '. So what is ' + a * b + ' divided by ' + a + '?',
    },
    target: null,
    show: {
      kind: 'expr',
      value: a + ' × ' + b + ' = ' + a * b + '\n' + a * b + ' : ' + a + ' = ?',
    },
    choiceStyle: 'big',
    choices: choicesFrom(b, near(b, 2).concat([a])).map((c) => ({
      label: String(c.value),
      correct: c.correct,
    })),
  };
};

// Word problems, read aloud so he does not need to read them yet.
const STORY = [
  (a, b) => ({
    vi:
      'Tin Tin có ' +
      a +
      ' viên bi, được cho thêm ' +
      b +
      ' viên. Tin Tin có tất cả bao nhiêu viên?',
    el: 'Ο Τιν Τιν έχει ' + a + ' βόλους και παίρνει άλλους ' + b + '. Πόσους έχει τώρα;',
    en: 'Tin Tin has ' + a + ' marbles and gets ' + b + ' more. How many marbles does he have now?',
    ans: a + b,
    emoji: '🔵',
  }),
  (a, b) => ({
    vi: 'Trên cây có ' + (a + b) + ' con chim, ' + b + ' con bay đi. Còn lại mấy con?',
    el: 'Στο δέντρο είναι ' + (a + b) + ' πουλιά. Φεύγουν ' + b + '. Πόσα μένουν;',
    en: 'There are ' + (a + b) + ' birds in the tree. ' + b + ' fly away. How many are left?',
    ans: a,
    emoji: '🐦',
  }),
  (a, b) => ({
    vi: 'Có ' + a + ' hộp, mỗi hộp ' + b + ' cái bánh. Có tất cả bao nhiêu cái bánh?',
    el: 'Έχουμε ' + a + ' κουτιά με ' + b + ' μπισκότα το καθένα. Πόσα μπισκότα έχουμε;',
    en: 'There are ' + a + ' boxes with ' + b + ' biscuits in each. How many biscuits are there?',
    ans: a * b,
    emoji: '🍪',
  }),
  (a, b) => ({
    vi: 'Mẹ chia đều ' + a * b + ' quả táo vào ' + a + ' đĩa. Mỗi đĩa mấy quả?',
    el: 'Η μαμά βάζει ' + a * b + ' μήλα σε ' + a + ' πιάτα. Πόσα σε κάθε πιάτο;',
    en: 'Mum shares ' + a * b + ' apples equally on ' + a + ' plates. How many on each plate?',
    ans: b,
    emoji: '🍎',
  }),
];
const story = (kinds) => () => {
  const k = pick(kinds);
  const s = STORY[k](rand(2, 5), rand(2, 5));
  return {
    sig: 'story-' + k + '-' + s.ans,
    ask: { vi: s.vi, el: s.el, en: s.en },
    target: null,
    show: { kind: 'emoji', value: s.emoji },
    choiceStyle: 'big',
    choices: choicesFrom(s.ans, near(s.ans)).map((c) => ({
      label: String(c.value),
      correct: c.correct,
    })),
  };
};

const L = (id, vi2, elTitle, make) => ({ id: 'ma-' + id, title: { vi: vi2, el: elTitle }, make });
const ten =
  (...gens) =>
  () =>
    build(10, gens);

export const MATH = {
  id: 'math',
  title: { vi: 'Toán', el: 'Μαθηματικά' },
  short: '12',
  color: '#f59e0b',
  units: [
    {
      title: { vi: 'Cộng và trừ', el: 'Πρόσθεση και αφαίρεση' },
      lessons: [
        L('a10', 'Cộng, trừ trong 10', 'Ως το 10', ten(add(10), sub(10))),
        L('a20', 'Cộng, trừ trong 20', 'Ως το 20', ten(add(20), sub(20))),
        L('miss', 'Tìm số còn thiếu', 'Ο αριθμός που λείπει', ten(missing)),
        L('a100', 'Cộng, trừ số có 2 chữ số', 'Ως το 100', ten(add(100, false), sub(100, false))),
        L(
          'carry',
          'Cộng có nhớ, trừ có mượn',
          'Με κρατούμενο',
          ten(add(100, true), sub(100, true))
        ),
        L('st1', 'Toán có lời văn', 'Προβλήματα', ten(story([0, 1]))),
      ],
    },
    {
      title: { vi: 'Phép nhân', el: 'Πολλαπλασιασμός' },
      lessons: [
        L('grp', 'Nhân là các nhóm bằng nhau', 'Ομάδες', ten(groupsPicture)),
        L('t2', 'Bảng nhân 2', 'Προπαίδεια του 2', ten(times([2]))),
        L('t5', 'Bảng nhân 5 và 10', 'Του 5 και του 10', ten(times([5, 10]))),
        L('t3', 'Bảng nhân 3', 'Του 3', ten(times([3]))),
        L('t4', 'Bảng nhân 4', 'Του 4', ten(times([4]))),
        L('t25', 'Ôn bảng 2 đến 5', 'Επανάληψη 2–5', ten(times([2, 3, 4, 5]))),
        L('t67', 'Bảng nhân 6 và 7', 'Του 6 και του 7', ten(times([6, 7]))),
        L('t89', 'Bảng nhân 8 và 9', 'Του 8 και του 9', ten(times([8, 9]))),
        L('tall', 'Ôn cả bảng nhân', 'Όλη η προπαίδεια', ten(times([2, 3, 4, 5, 6, 7, 8, 9]))),
      ],
    },
    {
      title: { vi: 'Phép chia', el: 'Διαίρεση' },
      lessons: [
        L('share', 'Chia đều', 'Μοιρασιά', ten(share)),
        L('d25', 'Chia cho 2, 5, 10', 'Διά 2, 5, 10', ten(divide([2, 5, 10]))),
        L('d34', 'Chia cho 3, 4', 'Διά 3, 4', ten(divide([3, 4]))),
        L('fact', 'Nhân và chia là anh em', 'Πολλαπλασιασμός και διαίρεση', ten(fact)),
        L('st2', 'Toán có lời văn: nhân, chia', 'Προβλήματα με × και :', ten(story([2, 3]))),
      ],
    },
  ],
};
