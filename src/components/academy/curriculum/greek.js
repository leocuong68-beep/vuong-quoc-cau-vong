import { el } from '../academySpeech.js';
import { build, choicesFrom, pick, accentVariants, stripAccents } from './helpers.js';

// Ελληνικά — from the alphabet up to the Β' Δημοτικού units (δίψηφα, τόνος, σ/ς).

export const LETTERS = [
  ['α', 'Α', 'άλφα'],
  ['β', 'Β', 'βήτα'],
  ['γ', 'Γ', 'γάμα'],
  ['δ', 'Δ', 'δέλτα'],
  ['ε', 'Ε', 'έψιλον'],
  ['ζ', 'Ζ', 'ζήτα'],
  ['η', 'Η', 'ήτα'],
  ['θ', 'Θ', 'θήτα'],
  ['ι', 'Ι', 'γιώτα'],
  ['κ', 'Κ', 'κάπα'],
  ['λ', 'Λ', 'λάμδα'],
  ['μ', 'Μ', 'μι'],
  ['ν', 'Ν', 'νι'],
  ['ξ', 'Ξ', 'ξι'],
  ['ο', 'Ο', 'όμικρον'],
  ['π', 'Π', 'πι'],
  ['ρ', 'Ρ', 'ρο'],
  ['σ', 'Σ', 'σίγμα'],
  ['τ', 'Τ', 'ταυ'],
  ['υ', 'Υ', 'ύψιλον'],
  ['φ', 'Φ', 'φι'],
  ['χ', 'Χ', 'χι'],
  ['ψ', 'Ψ', 'ψι'],
  ['ω', 'Ω', 'ωμέγα'],
].map(([lower, upper, name]) => ({ lower, upper, name }));

const byLower = (list) => LETTERS.filter((l) => list.includes(l.lower));

// Words with a picture, no two-letter sounds yet.
const WORDS = [
  ['μήλο', '🍎'],
  ['νερό', '💧'],
  ['σπίτι', '🏠'],
  ['γάτα', '🐱'],
  ['σκύλος', '🐶'],
  ['ήλιος', '☀️'],
  ['μάτι', '👁️'],
  ['πόδι', '🦶'],
  ['χέρι', '✋'],
  ['τυρί', '🧀'],
  ['ψάρι', '🐟'],
  ['βάρκα', '⛵'],
  ['λύκος', '🐺'],
  ['κότα', '🐔'],
  ['πάπια', '🦆'],
  ['δέντρο', '🌳'],
  ['θάλασσα', '🌊'],
  ['φεγγάρι', '🌙'],
  ['αστέρι', '⭐'],
  ['λεμόνι', '🍋'],
  ['καρότο', '🥕'],
  ['βιβλίο', '📖'],
  ['ρολόι', '⏰'],
  ['ζέβρα', '🦓'],
].map(([word, emoji]) => ({ word, emoji }));

// ---- question makers ----

const hearLetter = (set, pool) => () => {
  const l = pick(set);
  return {
    sig: 'hear-' + l.lower,
    ask: { vi: 'Nghe tên chữ cái rồi chọn chữ đúng.', el: 'Άκου και διάλεξε το γράμμα.' },
    target: [el(l.name, true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(
      l.lower,
      pool.map((x) => x.lower)
    ).map((c) => ({ label: c.value, correct: c.correct })),
    explain: {
      vi: 'Chữ ' + l.name + ' viết là ' + l.lower + '.',
      el: 'Το ' + l.name + ' γράφεται ' + l.lower + '.',
    },
    explainSay: [el(l.name)],
  };
};

const capToLower = (set, pool) => () => {
  const l = pick(set);
  return {
    sig: 'cap-' + l.lower,
    ask: { vi: 'Chữ in hoa này, viết thường là chữ nào?', el: 'Ποιο είναι το μικρό γράμμα;' },
    target: [el(l.name)],
    show: { kind: 'big', value: l.upper },
    choiceStyle: 'big',
    choices: choicesFrom(
      l.lower,
      pool.map((x) => x.lower)
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const lowerToCap = (set, pool) => () => {
  const l = pick(set);
  return {
    sig: 'low-' + l.lower,
    ask: { vi: 'Chữ thường này, viết in hoa là chữ nào?', el: 'Ποιο είναι το κεφαλαίο γράμμα;' },
    target: [el(l.name)],
    show: { kind: 'big', value: l.lower },
    choiceStyle: 'big',
    choices: choicesFrom(
      l.upper,
      pool.map((x) => x.upper)
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

// Letters that children mix up most, asked side by side.
const LOOKALIKES = [
  ['γ', 'ν', 'υ', 'ψ'],
  ['α', 'ο', 'σ', 'δ'],
  ['η', 'ν', 'μ', 'ρ'],
  ['ζ', 'ξ', 'ς', 'ε'],
  ['ι', 'τ', 'λ', 'κ'],
  ['φ', 'ψ', 'θ', 'ρ'],
];
const lookalike = () => {
  const group = pick(LOOKALIKES);
  const target = pick(group.filter((x) => x !== 'ς'));
  const l = LETTERS.find((x) => x.lower === target);
  return {
    sig: 'look-' + target,
    ask: {
      vi: 'Nghe kỹ, các chữ này trông giống nhau. Chọn đúng chữ.',
      el: 'Προσοχή! Διάλεξε το σωστό γράμμα.',
    },
    target: [el(l.name, true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: group.map((x) => ({ label: x, correct: x === target })),
  };
};

const SIMPLE_VOWELS = ['α', 'ε', 'ι', 'ο'];
const syllable = (consonants) => () => {
  const c = pick(consonants);
  const v = pick(SIMPLE_VOWELS);
  const s = c + v;
  const wrong = [
    ...SIMPLE_VOWELS.filter((x) => x !== v).map((x) => c + x),
    ...consonants.filter((x) => x !== c).map((x) => x + v),
  ];
  return {
    sig: 'syl-' + s,
    ask: { vi: 'Nghe và chọn vần đúng.', el: 'Άκου και διάλεξε τη συλλαβή.' },
    target: [el(s, true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(s, wrong).map((c2) => ({ label: c2.value, correct: c2.correct })),
  };
};

const hearWord = (words) => () => {
  const w = pick(words);
  return {
    sig: 'word-' + w.word,
    ask: { vi: 'Nghe và chọn từ đúng.', el: 'Άκου και διάλεξε τη λέξη.' },
    target: [el(w.word, true)],
    show: { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(
      w.word,
      words
        .map((x) => x.word)
        .filter((x) => x[0] === w.word[0] || x.length === w.word.length)
        .concat(words.map((x) => x.word))
    ).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

const readWord = (words) => () => {
  const w = pick(words);
  return {
    sig: 'read-' + w.word,
    ask: { vi: 'Hình này là từ nào? Tự đọc nhé.', el: 'Τι είναι; Διάβασε μόνος σου.' },
    target: null,
    show: { kind: 'emoji', value: w.emoji },
    choiceStyle: 'text',
    choices: choicesFrom(
      w.word,
      words.map((x) => x.word)
    ).map((c) => ({ label: c.value, correct: c.correct, say: [el(c.value)] })),
    explainSay: [el(w.word)],
  };
};

// Spelling: hear a word, pick the right way to write it among close misspellings.
const spell = (items, sigPrefix, ask) => () => {
  const it = pick(items);
  return {
    sig: sigPrefix + it.word,
    ask,
    target: [el(it.word, true)],
    show: it.emoji ? { kind: 'emoji', value: it.emoji } : { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(it.word, it.wrong, 3).map((c) => ({ label: c.value, correct: c.correct })),
    explain: { vi: 'Viết đúng là: ' + it.word, el: 'Σωστά γράφεται: ' + it.word },
  };
};

const DIGRAPH_CONS = [
  { word: 'μπάλα', emoji: '⚽', wrong: ['πάλα', 'ντάλα', 'μπάλλα'] },
  { word: 'μπανάνα', emoji: '🍌', wrong: ['πανάνα', 'μπανάννα', 'μπανανα'] },
  { word: 'ντομάτα', emoji: '🍅', wrong: ['τομάτα', 'νπομάτα', 'ντομμάτα'] },
  { word: 'ντουλάπα', emoji: '🚪', wrong: ['τουλάπα', 'ντουλάμπα', 'ντουλαπα'] },
  { word: 'γκαράζ', emoji: '🚗', wrong: ['καράζ', 'γγαράζ', 'γκαράτζ'] },
  { word: 'τσάντα', emoji: '👜', wrong: ['τζάντα', 'σάντα', 'τσάνδα'] },
  { word: 'τσάι', emoji: '🍵', wrong: ['τζάι', 'τσαί', 'σάι'] },
  { word: 'τζάμι', emoji: '🪟', wrong: ['τσάμι', 'ζάμι', 'τζαμί'] },
  { word: 'άγγελος', emoji: '👼', wrong: ['άγκελος', 'άγελος', 'άνγελος'] },
  { word: 'φεγγάρι', emoji: '🌙', wrong: ['φεγκάρι', 'φενγάρι', 'φεγάρι'] },
  { word: 'μπαμπάς', emoji: '👨', wrong: ['παπάς', 'μπαμπάσ', 'μπαπάς'] },
  { word: 'τσέπη', emoji: '👖', wrong: ['τζέπη', 'σέπη', 'τσέπι'] },
];

const DIGRAPH_VOW = [
  { word: 'παιδί', emoji: '🧒', wrong: ['πεδί', 'παιδή', 'πειδί'] },
  { word: 'κουτί', emoji: '📦', wrong: ['κοτί', 'κουτή', 'κυτί'] },
  { word: 'ουρανός', emoji: '🌌', wrong: ['ορανός', 'ουρανώς', 'υρανός'] },
  { word: 'είμαι', emoji: '🙋', wrong: ['ίμε', 'είμε', 'ήμαι'] },
  { word: 'σκουλήκι', emoji: '🪱', wrong: ['σκουλίκι', 'σκολήκι', 'σκουλύκι'] },
  { word: 'μαχαίρι', emoji: '🔪', wrong: ['μαχέρι', 'μαχαίρη', 'μαχείρι'] },
  { word: 'κουκούλα', emoji: '🧥', wrong: ['κοκούλα', 'κουκόλα', 'κουκουλα'] },
  { word: 'ποιος', emoji: '❓', wrong: ['πιος', 'πειος', 'ποιοσ'] },
  { word: 'λουλούδι', emoji: '🌸', wrong: ['λουλούδη', 'λολούδι', 'λουλουδι'] },
  { word: 'κουλούρι', emoji: '🥯', wrong: ['κουλούρη', 'κολούρι', 'κουλουρί'] },
];

const SIGMA_WORDS = [
  ['σκύλος', '🐶'],
  ['ήλιος', '☀️'],
  ['λύκος', '🐺'],
  ['σπίτι', '🏠'],
  ['ουρανός', '🌌'],
  ['θάλασσα', '🌊'],
  ['σαλιγκάρι', '🐌'],
  ['κήπος', '🌷'],
  ['φίλος', '🤝'],
  ['σαπούνι', '🧼'],
].map(([word, emoji]) => {
  const wrong = new Set();
  // σ at the end, ς at the start or inside
  wrong.add(word.replace(/ς$/, 'σ'));
  wrong.add(word.replace(/^σ/, 'ς'));
  wrong.add(word.replace(/σ(?!$)/, 'ς'));
  wrong.delete(word);
  if (wrong.size < 2) wrong.add(word.replace(/ς$/, 'ζ'));
  return { word, emoji, wrong: [...wrong].filter((w) => w !== word) };
});

const TONOS_WORDS = [
  'μήλο',
  'νερό',
  'σπίτι',
  'γάτα',
  'ψάρι',
  'παιδί',
  'κουτί',
  'ουρανός',
  'θάλασσα',
  'καρότο',
  'λεμόνι',
  'βιβλίο',
  'αστέρι',
  'σκύλος',
];
const tonos = () => {
  const word = pick(TONOS_WORDS);
  const w = WORDS.find((x) => x.word === word);
  return {
    sig: 'tonos-' + word,
    ask: { vi: 'Nghe kỹ âm nhấn rồi chọn chỗ đặt dấu thanh đúng.', el: 'Πού μπαίνει ο τόνος;' },
    target: [el(word, true)],
    show: w ? { kind: 'emoji', value: w.emoji } : { kind: 'text', value: stripAccents(word) },
    choiceStyle: 'text',
    choices: choicesFrom(word, accentVariants(word), 3).map((c) => ({
      label: c.value,
      correct: c.correct,
    })),
    explain: { vi: 'Đúng là: ' + word, el: 'Σωστά: ' + word },
  };
};

// ---- lessons ----
const L = (id, vi, elTitle, make) => ({ id: 'gr-' + id, title: { vi, el: elTitle }, make });

const vowels1 = byLower(['α', 'ε', 'ι', 'ο']);
const vowels2 = byLower(['η', 'υ', 'ω']);
const vowelsAll = byLower(['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']);
const cons1 = byLower(['μ', 'π', 'τ', 'σ']);
const cons2 = byLower(['ν', 'κ', 'λ', 'ρ']);
const cons3 = byLower(['δ', 'γ', 'β', 'φ']);
const cons4 = byLower(['θ', 'χ', 'ξ', 'ψ', 'ζ']);
const upTo = (...sets) => sets.flat();

const lettersLesson = (set, pool) => () =>
  build(10, [
    hearLetter(set, pool),
    capToLower(set, pool),
    hearLetter(set, pool),
    lowerToCap(set, pool),
  ]);

export const GREEK = {
  id: 'greek',
  title: { vi: 'Tiếng Hy Lạp', el: 'Ελληνικά' },
  short: 'Αα',
  color: '#3b82f6',
  units: [
    {
      title: { vi: 'Chữ cái', el: 'Τα γράμματα' },
      lessons: [
        L(
          'v1',
          'Nguyên âm α ε ι ο',
          'Φωνήεντα α ε ι ο',
          lettersLesson(vowels1, vowels1.concat(cons1))
        ),
        L('v2', 'Nguyên âm η υ ω', 'Φωνήεντα η υ ω', lettersLesson(vowels2, vowelsAll)),
        L('c1', 'Phụ âm μ π τ σ', 'Σύμφωνα μ π τ σ', lettersLesson(cons1, upTo(cons1, vowelsAll))),
        L('c2', 'Phụ âm ν κ λ ρ', 'Σύμφωνα ν κ λ ρ', lettersLesson(cons2, upTo(cons1, cons2))),
        L(
          'c3',
          'Phụ âm δ γ β φ',
          'Σύμφωνα δ γ β φ',
          lettersLesson(cons3, upTo(cons2, cons3, vowels1))
        ),
        L('c4', 'Phụ âm θ χ ξ ψ ζ', 'Σύμφωνα θ χ ξ ψ ζ', lettersLesson(cons4, upTo(cons3, cons4))),
        L('look', 'Chữ dễ nhầm: γ, α, ν, υ…', 'Γράμματα που μοιάζουν', () =>
          build(10, [lookalike])
        ),
        L('abc', 'Ôn cả 24 chữ cái', 'Όλη η αλφαβήτα', lettersLesson(LETTERS, LETTERS)),
      ],
    },
    {
      title: { vi: 'Ghép vần và đọc từ', el: 'Συλλαβές και λέξεις' },
      lessons: [
        L('s1', 'Ghép vần: μα, πε, το…', 'Συλλαβές 1', () =>
          build(10, [syllable(['μ', 'π', 'τ', 'σ', 'ν'])])
        ),
        L('s2', 'Ghép vần: κα, λε, ρο…', 'Συλλαβές 2', () =>
          build(10, [syllable(['κ', 'λ', 'ρ', 'δ', 'γ'])])
        ),
        L('s3', 'Ghép vần: βα, φε, χο…', 'Συλλαβές 3', () =>
          build(10, [syllable(['β', 'φ', 'χ', 'θ', 'ζ'])])
        ),
        L('w1', 'Nghe và chọn từ', 'Άκου τη λέξη', () => build(10, [hearWord(WORDS.slice(0, 12))])),
        L('w2', 'Nhìn hình, tự đọc từ', 'Διάβασε τη λέξη', () =>
          build(10, [readWord(WORDS.slice(0, 12)), readWord(WORDS.slice(12))])
        ),
      ],
    },
    {
      title: { vi: 'Chương trình lớp 2', el: 'Β΄ Δημοτικού' },
      lessons: [
        L('d1', 'Phụ âm đôi μπ ντ γκ τσ τζ', 'Δίψηφα σύμφωνα', () =>
          build(10, [
            spell(DIGRAPH_CONS, 'dc-', {
              vi: 'Nghe và chọn cách viết đúng.',
              el: 'Ποια γράφεται σωστά;',
            }),
          ])
        ),
        L('d2', 'Nguyên âm đôi αι ει οι ου', 'Δίψηφα φωνήεντα', () =>
          build(10, [
            spell(DIGRAPH_VOW, 'dv-', {
              vi: 'Nghe và chọn cách viết đúng.',
              el: 'Ποια γράφεται σωστά;',
            }),
          ])
        ),
        L('t1', 'Dấu thanh (τόνος)', 'Ο τόνος', () => build(10, [tonos])),
        L('sg', 'σ hay ς?', 'Σ, σ ή ς;', () =>
          build(10, [
            spell(SIGMA_WORDS, 'sg-', {
              vi: 'Chọn từ viết đúng chữ σ và ς.',
              el: 'Πού μπαίνει σ και πού ς;',
            }),
          ])
        ),
        L('mix', 'Ôn tập lớp 2', 'Επανάληψη', () =>
          build(10, [
            spell(DIGRAPH_CONS, 'dc-', { vi: 'Chọn cách viết đúng.', el: 'Ποια γράφεται σωστά;' }),
            tonos,
            spell(DIGRAPH_VOW, 'dv-', { vi: 'Chọn cách viết đúng.', el: 'Ποια γράφεται σωστά;' }),
            spell(SIGMA_WORDS, 'sg-', { vi: 'Chọn cách viết đúng.', el: 'Ποια γράφεται σωστά;' }),
          ])
        ),
      ],
    },
  ],
};
