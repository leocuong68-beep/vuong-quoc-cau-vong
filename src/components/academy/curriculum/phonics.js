import { en, vi } from '../academySpeech.js';
import { build, choicesFrom, pick, shuffle } from './helpers.js';

// Phonics: đọc – viết tiếng Anh cho Tin Tin và Mia, chung một giáo trình (23/11/2026).
// Thứ tự âm theo Letters and Sounds (DfE, Phase 2 → Phase 4). Mỗi bài 10 câu, đúng 8/10 mới qua.
// Tin Tin: 4 đáp án, đủ từ và đủ từ khó. Mia: 3 đáp án, chỉ các từ `mia` và một nửa từ khó.
// Giáo trình đầy đủ (bài tập giấy, phiếu tập viết): doc "Giáo trình Đọc – Viết tiếng Anh cho Tin Tin & Mia".

// Hình cho từ (từ nào không có hình thì chỉ dùng trong câu nghe – chọn chữ).
const PIC = {
  tap: '🚰', pin: '📌', man: '👨', map: '🗺️', dad: '👨‍👧', dog: '🐶', cat: '🐱', pig: '🐷', kid: '🧒',
  sun: '☀️', pen: '🖊️', red: '🟥', duck: '🦆', run: '🏃', kick: '🦵', hat: '🎩', bed: '🛏️', bug: '🐛',
  hen: '🐔', bun: '🍞', hug: '🤗', fan: '🪭', leg: '🦿', bell: '🔔', doll: '🪆', kiss: '💋',
  jam: '🍓', van: '🚐', box: '📦', fox: '🦊', web: '🕸️', six: '6️⃣', zip: '🤐', buzz: '🐝',
  quack: '🦢', yum: '😋', chip: '🍟', fish: '🐟', ship: '🚢', shop: '🏪', dish: '🍽️', ring: '💍',
  king: '🤴', bath: '🛁', sing: '🎤', rain: '🌧️', tree: '🌳', feet: '🦶', sheep: '🐑', see: '👀',
  night: '🌃', boat: '⛵', light: '💡', coat: '🧥', goat: '🐐', moon: '🌕', zoo: '🦒', book: '📖',
  food: '🍲', cool: '😎', car: '🚗', star: '⭐', fork: '🍴', park: '🏞️', corn: '🌽', sport: '⚽',
  cow: '🐄', coin: '🪙', down: '⬇️', town: '🏘️', ear: '👂', hair: '💇', letter: '✉️', hammer: '🔨',
  fair: '🎡', tent: '⛺', hand: '✋', milk: '🥛', jump: '🦘', lamp: '🪔', chimp: '🐒', frog: '🐸',
  stop: '🛑', crab: '🦀', flag: '🚩', swim: '🏊', green: '🟩', sunset: '🌅', lunchbox: '🍱',
  twist: '🌀', desk: '🖥️',
};

// Từ có hình cho từng chữ cái (câu "từ này bắt đầu bằng chữ nào?").
const KEY = {
  s: 'sun', a: 'apple', t: 'tiger', p: 'pig', i: 'insect', n: 'nose', m: 'moon', d: 'dog', g: 'goat',
  o: 'octopus', c: 'cat', k: 'kite', e: 'egg', u: 'umbrella', r: 'rabbit', h: 'hat', b: 'ball',
  f: 'fish', l: 'lion', j: 'juice', v: 'van', w: 'whale', x: 'fox', y: 'yo-yo', z: 'zebra', q: 'queen',
};
const KEY_PIC = {
  apple: '🍎', tiger: '🐯', insect: '🐜', nose: '👃', octopus: '🐙', kite: '🪁', egg: '🥚',
  umbrella: '☂️', rabbit: '🐰', ball: '⚽', juice: '🧃', whale: '🐳', lion: '🦁', 'yo-yo': '🪀', zebra: '🦓', queen: '👑',
};
const picOf = (w) => PIC[w] || KEY_PIC[w];

// Bài học: âm mới, từ đọc (mia = phần của Mia), từ khó mới, câu ngắn (kèm hình).
const LESSONS = [
  { n: '1', sounds: ['s', 'a', 't', 'p'], words: 'at sat pat tap sap pats', mia: 'at sat pat tap' },
  { n: '2', sounds: ['i', 'n', 'm', 'd'], words: 'in it pin man tin sit map dad nap mat', mia: 'in it pin man map' },
  { n: '3', sounds: ['g', 'o', 'c', 'k'], words: 'dog cat pot got kit pig kid cot', mia: 'dog cat pot pig', tricky: 'I' },
  { n: '4', sounds: ['ck', 'e', 'u', 'r'], words: 'sun pen red duck kick rug run neck', mia: 'sun pen red duck', tricky: 'the to' },
  { n: '5', sounds: ['h', 'b'], words: 'hat bed bug hop hen bun hug', mia: 'hat bed bug hen' },
  { n: '6', sounds: ['f', 'ff', 'l', 'll', 'ss'], words: 'fan leg bell off doll kiss fit lot', mia: 'fan leg bell doll', tricky: 'no go' },
  {
    n: '7', review: [0, 5], tricky: 'into', title: 'Ôn 23 âm + cụm từ', en: 'Review: 23 sounds and phrases',
    sentences: [['a cat on a mat', '🐱'], ['a big red bus', '🚌'], ['a pig in a pen', '🐷'], ['a hen and a bug', '🐔']],
  },
  { n: '8', review: [0, 6], test: true, title: 'Ôn tập giai đoạn 1', en: 'Stage 1 check' },
  { n: '9', sounds: ['j', 'v', 'w', 'x'], words: 'jam van box wet fox web six', mia: 'jam van box fox', tricky: 'he she' },
  { n: '10', sounds: ['y', 'z', 'zz', 'qu'], words: 'yes zip buzz quiz quack yum', mia: 'yes zip buzz', tricky: 'we me be' },
  { n: '11', sounds: ['ch', 'sh'], words: 'chip fish ship chop shop rich dish', mia: 'chip fish ship', tricky: 'was' },
  { n: '12', sounds: ['th', 'ng'], words: 'this ring king that thin bath sing long', mia: 'this ring king', tricky: 'you' },
  {
    n: '13', review: [8, 11], tricky: 'they all are', title: 'Ôn âm ghép + cụm từ', en: 'Review: sound pairs and phrases',
    sentences: [['a fish in a dish', '🐟'], ['a king with a ring', '🤴'], ['a fox in a box', '🦊'], ['a ship on the sea', '🚢']],
  },
  { n: '14', review: [8, 12], test: true, tricky: 'my her', title: 'Ôn tập giai đoạn 2', en: 'Stage 2 check' },
  { n: '15', sounds: ['ai', 'ee'], words: 'rain see tree tail feet sheep', mia: 'rain see tree sheep' },
  { n: '16', sounds: ['igh', 'oa'], words: 'night boat light high coat goat', mia: 'night boat goat' },
  { n: '17', sounds: ['oo'], words: 'moon zoo book look food cool', mia: 'moon zoo book' },
  { n: '18', sounds: ['ar', 'or'], words: 'car star fork park corn sport', mia: 'car star fork' },
  { n: '19', sounds: ['ur', 'ow', 'oi'], words: 'cow coin turn down town boil', mia: 'cow coin down' },
  { n: '20', sounds: ['ear', 'air', 'ure', 'er'], words: 'ear hair near fair sure letter hammer', mia: 'ear hair letter' },
  {
    n: '21', review: [14, 19], title: 'Đọc câu ngắn', en: 'Reading short sentences',
    sentences: [['I see a big ship.', '🚢'], ['The goat is in the boat.', '⛵'], ['The sheep is in the rain.', '🐑'], ['A king has a ring.', '💍'], ['The moon is high.', '🌕'], ['A cow is in the park.', '🐄']],
  },
  { n: '22', review: [14, 20], test: true, title: 'Ôn tập giai đoạn 3', en: 'Stage 3 check' },
  { n: '23–24', sounds: [], words: 'tent hand milk jump lamp belt chimp', mia: 'tent hand milk', tricky: 'said have like so', title: 'Cụm phụ âm cuối: tent, jump', en: 'End blends: tent, jump' },
  { n: '25–26', sounds: [], words: 'frog stop crab trip flag swim green', mia: 'frog stop crab', tricky: 'do some come were', title: 'Cụm phụ âm đầu: frog, stop', en: 'Start blends: frog, stop' },
  { n: '27–28', sounds: [], words: 'sunset desk twist lunchbox milk tent', mia: 'sunset desk', tricky: 'there little one', title: 'Từ dài: sunset, lunchbox', en: 'Longer words: sunset, lunchbox' },
  {
    n: '29–31', review: [22, 24], tricky: 'when out what', title: 'Đọc câu và truyện ngắn', en: 'Reading sentences and stories',
    sentences: [['The frog can jump.', '🐸'], ['A crab is in the sand.', '🦀'], ['Mia has a pink pony.', '🦄'], ['Dad can swim.', '🏊'], ['The chimp has a lunchbox.', '🐒'], ['I like the green flag.', '🚩']],
  },
  { n: '32', review: [0, 25], test: true, title: 'Kiểm tra cuối khóa', en: 'Final check' },
];

const words = (s) => (s ? s.split(' ').filter(Boolean) : []);
const STAGE = (n) => {
  const k = parseInt(n, 10);
  return k <= 8 ? 1 : k <= 14 ? 2 : k <= 22 ? 3 : 4;
};

// Cộng dồn: âm, từ, từ khó đã học đến hết bài i.
const cumulative = (i, key, level) => {
  const out = [];
  for (let j = 0; j <= i; j++) {
    const l = LESSONS[j];
    if (key === 'sounds') out.push(...(l.sounds || []));
    if (key === 'words') out.push(...words(level === 'mia' ? l.mia : l.words));
    if (key === 'tricky') out.push(...words(l.tricky));
    if (key === 'sentences') out.push(...(l.sentences || []));
  }
  return [...new Set(out)];
};
// Mia học một nửa danh sách từ khó (từ thứ 1, 3, 5…).
const ALL_TRICKY = cumulative(LESSONS.length - 1, 'tricky');
const MIA_TRICKY = ALL_TRICKY.filter((_, i) => i % 2 === 0);

// ---------- dạng câu hỏi ----------

// Mia đã có giọng bé (Lovely_Girl) cho câu này; dùng lại thay cho câu chưa thu.
const MIA_TAP = { vi: 'Nghe và chạm vào chữ đúng nhé.', el: 'Άκου και άγγιξε το γράμμα.' };
const askFor = (mia, ask) => (mia ? MIA_TAP : ask);

// Nghe từ có hình → chọn chữ cái đầu (âm đơn) hoặc cặp chữ có trong từ (âm ghép).
const soundQ = (lessonSounds, pool, n, lessonWords, mia) => () => {
  const singles = lessonSounds.filter((s) => s.length === 1 && s !== 'x' && KEY[s]); // fox không bắt đầu bằng x
  const hasPairs = lessonSounds.some((s) => s.length > 1);
  if (singles.length && (!hasPairs || Math.random() < 0.6)) {
    const l = pick(singles);
    const word = KEY[l];
    const letters = pool.filter((s) => s.length === 1);
    return {
      sig: 'ph-start-' + l,
      ask: { vi: 'Từ này bắt đầu bằng chữ nào?', el: 'Με ποιο γράμμα αρχίζει;' },
      target: [en(word, true)],
      show: { kind: 'emoji', value: picOf(word), sub: word },
      choiceStyle: 'big',
      choices: choicesFrom(l, letters, n).map((c) => ({ label: c.value, correct: c.correct })),
      // Mia: nghe lại từ thay vì câu giải thích (chưa thu giọng bé cho các câu này)
      ...(mia
        ? { explainSay: [en(word)] }
        : { explain: { vi: word + ' bắt đầu bằng chữ ' + l + '.', el: word + ': ' + l, en: word + ' starts with ' + l + '.' } }),
    };
  }
  // âm ghép: chọn từ trong bài có đúng một cặp chữ của bài
  const multi = lessonSounds.filter((s) => s.length > 1);
  const options = lessonWords.filter((w) => picOf(w) && multi.filter((s) => w.includes(s)).length >= 1);
  const w = pick(options.length ? options : lessonWords.filter((x) => multi.some((s) => x.includes(s))));
  const right = multi.find((s) => w.includes(s));
  const wrongPool = pool.filter((s) => s.length > 1 && !w.includes(s));
  return {
    sig: 'ph-pair-' + w,
    ask: askFor(mia, { vi: 'Nghe và chọn vần đúng.', el: 'Άκου και διάλεξε τη συλλαβή.' }),
    target: [en(w, true)],
    show: picOf(w) ? { kind: 'emoji', value: picOf(w), sub: w } : { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(right, wrongPool.length ? wrongPool : ['sh', 'ch', 'th', 'ng', 'ee', 'oa'], n).map((c) => ({
      label: c.value,
      correct: c.correct,
    })),
    explainSay: [en(w)],
  };
};

// Nghe một từ → chọn từ viết đúng (luyện ghép âm khi đọc).
const hearWord = (lessonWords, pool, n, mia) => () => {
  const w = pick(lessonWords);
  // từ nhiễu giống từ đúng nhất: cùng độ dài, cùng chữ đầu hoặc cuối
  const close = pool.filter((x) => x !== w && (x[0] === w[0] || x.slice(-1) === w.slice(-1)));
  const wrong = shuffle(close).concat(shuffle(pool.filter((x) => x !== w)));
  return {
    sig: 'ph-hear-' + w,
    ask: askFor(mia, { vi: 'Nghe và chọn từ đúng.', el: 'Άκου και διάλεξε τη λέξη.' }),
    target: [en(w, true)],
    show: { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(w, wrong, n).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

// Tự đọc từ → chọn hình (kiểm tra hiểu, không nghe trước).
const readPic = (lessonWords, pool, n) => () => {
  const w = pick(lessonWords.filter((x) => picOf(x)));
  let pics = pool.filter((x) => picOf(x) && x !== w).map(picOf);
  // đầu khóa còn ít từ có hình: lấy thêm hình bất kỳ làm đáp án nhiễu
  if (pics.length < n - 1) pics = pics.concat(Object.values(PIC).filter((p) => p !== picOf(w)));
  return {
    sig: 'ph-read-' + w,
    ask: { vi: 'Tự đọc từ này, rồi chọn hình đúng.', el: 'Διάβασε και διάλεξε την εικόνα.' },
    target: null,
    show: { kind: 'text', value: w },
    choiceStyle: 'emoji',
    choices: choicesFrom(picOf(w), pics, n).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [en(w)],
  };
};

// Nghe từ → chọn cách viết đúng giữa các từ sai một chữ (luyện chính tả).
const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const SPELL_EL = 'Ποια γράφεται σωστά;';
const misspell = (w) => {
  const out = new Set();
  [...w].forEach((ch, i) => {
    const swaps = VOWELS.includes(ch) ? VOWELS : ['b', 'd', 'p', 'm', 'n', 't', 'g', 'k', 's'];
    swaps.forEach((x) => x !== ch && out.add(w.slice(0, i) + x + w.slice(i + 1)));
  });
  out.delete(w);
  return [...out];
};
const missing = (lessonWords, sounds, n) => () => {
  const w = pick(lessonWords.filter((x) => x.length >= 3 && /^[a-z]+$/.test(x)));
  return {
    sig: 'ph-spell-' + w,
    ask: { vi: 'Nghe và chọn cách viết đúng.', el: SPELL_EL },
    target: [en(w, true)],
    show: { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(w, misspell(w), n).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

// Từ khó (không ghép âm được): nghe → chọn từ.
const trickyQ = (list, pool, n, mia) => () => {
  const w = pick(list);
  return {
    sig: 'ph-tricky-' + w,
    ask: askFor(mia, { vi: 'Nghe và chọn từ đúng.', el: 'Άκου και διάλεξε τη λέξη.' }),
    target: [en(w, true)],
    show: { kind: 'listen' },
    choiceStyle: 'text',
    choices: choicesFrom(w, pool.length > 1 ? pool : ALL_TRICKY, n).map((c) => ({ label: c.value, correct: c.correct })),
  };
};

// Đọc câu / cụm từ → chọn hình đúng.
const sentenceQ = (list, n) => () => {
  const [text, emoji] = pick(list);
  const others = list.filter((s) => s[1] !== emoji).map((s) => s[1]).concat(['🐶', '🚗', '🌳', '🍎', '🐟']);
  return {
    sig: 'ph-sent-' + text,
    ask: { vi: 'Tự đọc từ này, rồi chọn hình đúng.', el: 'Διάβασε και διάλεξε την εικόνα.' },
    target: null,
    show: { kind: 'text', value: text },
    choiceStyle: 'emoji',
    choices: choicesFrom(emoji, others, n).map((c) => ({ label: c.value, correct: c.correct })),
    explainSay: [en(text)],
  };
};

// ---------- dựng bài ----------

const makeLesson = (i, level) => {
  const l = LESSONS[i];
  const mia = level === 'mia';
  const n = mia ? 3 : 4;
  const range = l.review || [i, i];
  const lessonWords = l.review
    ? cumulative(range[1], 'words', level).filter((w) => !cumulative(range[0] - 1, 'words', level).includes(w))
    : words(mia ? l.mia : l.words);
  const reviewWords = lessonWords.length ? lessonWords : cumulative(range[1], 'words', level);
  const pool = cumulative(Math.max(i, range[1]), 'words', level);
  const soundsSoFar = cumulative(Math.max(i, range[1]), 'sounds');
  const lessonSounds = l.review ? cumulative(range[1], 'sounds').filter((s) => !cumulative(range[0] - 1, 'sounds').includes(s)) : l.sounds;
  const trickySoFar = cumulative(i, 'tricky').filter((w) => !mia || MIA_TRICKY.includes(w));
  const newTricky = words(l.tricky).filter((w) => !mia || MIA_TRICKY.includes(w));
  const sentences = l.sentences || (l.test && STAGE(l.n) >= 3 ? cumulative(i, 'sentences') : null);

  const gens = [];
  if (lessonSounds.length) gens.push(soundQ(lessonSounds, soundsSoFar, n, reviewWords, mia));
  gens.push(hearWord(reviewWords, pool, n, mia));
  // Mia: chưa có giọng bé cho câu "tự đọc rồi chọn hình" → phần này làm trên phiếu giấy
  if (!mia && reviewWords.some((w) => picOf(w))) gens.push(readPic(reviewWords, pool, n));
  if (!mia) gens.push(missing(reviewWords, soundsSoFar, n));
  if (trickySoFar.length >= 2) gens.push(trickyQ(newTricky.length ? newTricky : trickySoFar, trickySoFar, n, mia));
  if (!mia && sentences && sentences.length >= 3) gens.push(sentenceQ(sentences, n));
  if (mia) gens.push(hearWord(reviewWords, pool, n, mia));
  return () => build(10, gens);
};

const lessonTitle = (l) => {
  if (l.title) return { vi: 'Bài ' + l.n + ': ' + l.title, el: 'Μάθημα ' + l.n, en: 'Lesson ' + l.n + ': ' + l.en };
  return {
    vi: 'Bài ' + l.n + ': âm ' + l.sounds.join(' '),
    el: 'Μάθημα ' + l.n + ': ' + l.sounds.join(' '),
    en: 'Lesson ' + l.n + ': sounds ' + l.sounds.join(' '),
  };
};

const UNITS = [
  { title: { vi: 'Giai đoạn 1 · Âm đơn', el: 'Στάδιο 1 · Ήχοι', en: 'Stage 1 · Single sounds' }, from: 0, to: 7 },
  { title: { vi: 'Giai đoạn 2 · Âm ghép', el: 'Στάδιο 2 · Ζευγάρια', en: 'Stage 2 · Sound pairs' }, from: 8, to: 13 },
  { title: { vi: 'Giai đoạn 3 · Nguyên âm dài', el: 'Στάδιο 3 · Μακριά φωνήεντα', en: 'Stage 3 · Long vowels' }, from: 14, to: 21 },
  { title: { vi: 'Giai đoạn 4 · Cụm phụ âm, đọc truyện', el: 'Στάδιο 4 · Ανάγνωση', en: 'Stage 4 · Blends and stories' }, from: 22, to: 26 },
];

// prefix: 'en-ph' cho Tin Tin và bản công khai, 'men-ph' cho Mia (tiến độ riêng).
export const phonicsUnits = (level, prefix) =>
  UNITS.map((u) => ({
    title: u.title,
    lessons: LESSONS.slice(u.from, u.to + 1).map((l, k) => ({
      id: prefix + '-' + l.n.replace('–', '-'),
      title: lessonTitle(l),
      make: makeLesson(u.from + k, level),
      teach: () => lessonSlides(u.from + k, level),
    })),
  }));

export const PHONICS_LESSON_COUNT = LESSONS.length;

// ---------- Bảng chữ cái (học trước phần ghép âm, 23/11/2026) ----------
const AZ = 'abcdefghijklmnopqrstuvwxyz'.split('');
const ABC_GROUPS = [AZ.slice(0, 7), AZ.slice(7, 14), AZ.slice(14, 21), AZ.slice(21)];

// Tin Tin: nghe tên chữ → chọn chữ; chữ hoa ↔ chữ thường (câu đã thu giọng sẵn)
const hearLetter = (set, pool, n, mia) => () => {
  const l = pick(set);
  const shown = mia ? l.toUpperCase() : l;
  return {
    sig: 'abc-hear-' + l,
    ask: mia
      ? { vi: 'Nghe tên chữ cái tiếng Anh rồi chạm vào chữ đúng.', el: 'Άκου το γράμμα.' }
      : { vi: 'Nghe tên chữ cái rồi chọn chữ đúng.', el: 'Άκου και διάλεξε το γράμμα.' },
    target: [en(l.toUpperCase(), true)],
    show: { kind: 'listen' },
    choiceStyle: 'big',
    choices: choicesFrom(shown, pool.map((x) => (mia ? x.toUpperCase() : x)), n).map((c) => ({
      label: c.value,
      correct: c.correct,
    })),
  };
};
const upToLow = (set, pool, n, mia) => () => {
  const l = pick(set);
  return {
    sig: 'abc-case-' + l,
    ask: mia
      ? { vi: 'Chữ to này giống chữ nhỏ nào?', el: 'Βρες το μικρό γράμμα.' }
      : { vi: 'Chữ in hoa này, viết thường là chữ nào?', el: 'Ποιο είναι το μικρό γράμμα;' },
    target: [en(l.toUpperCase())],
    show: { kind: 'big', value: l.toUpperCase() },
    choiceStyle: 'big',
    choices: choicesFrom(l, pool, n).map((c) => ({ label: c.value, correct: c.correct })),
  };
};
const lowToUp = (set, pool, n) => () => {
  const l = pick(set);
  return {
    sig: 'abc-up-' + l,
    ask: { vi: 'Chữ thường này, viết in hoa là chữ nào?', el: 'Ποιο είναι το κεφαλαίο γράμμα;' },
    target: [en(l.toUpperCase())],
    show: { kind: 'big', value: l },
    choiceStyle: 'big',
    choices: choicesFrom(l.toUpperCase(), pool.map((x) => x.toUpperCase()), n).map((c) => ({
      label: c.value,
      correct: c.correct,
    })),
  };
};

export const alphabetUnit = (level, prefix) => {
  const mia = level === 'mia';
  const n = mia ? 3 : 4;
  const gens = (set, pool) =>
    mia ? [hearLetter(set, pool, n, true), upToLow(set, pool, n, true)] : [hearLetter(set, pool, n), upToLow(set, pool, n), lowToUp(set, pool, n)];
  const title = (g) => g[0].toUpperCase() + ' – ' + g[g.length - 1].toUpperCase();
  return {
    title: { vi: 'Bảng chữ cái', el: 'Αλφάβητο', en: 'The alphabet' },
    lessons: [
      ...ABC_GROUPS.map((g, i) => ({
        id: prefix + '-abc' + (i + 1),
        title: { vi: 'Chữ ' + title(g), el: title(g), en: 'Letters ' + title(g) },
        make: () => build(10, gens(g, g)),
        teach: () => alphabetSlides(g),
      })),
      {
        id: prefix + '-abc-all',
        title: { vi: 'Ôn cả bảng chữ cái', el: 'Όλο το αλφάβητο', en: 'The whole alphabet' },
        make: () => build(10, gens(AZ, AZ)),
      },
    ],
  };
};

// ---------- Bài giảng trước phần chơi (23/11/2026) ----------
// Ba hoặc mẹ đứng cạnh bảng, đọc chữ, âm, từ mẫu có hình và nghĩa tiếng Việt; bé bấm Tiếp.

const VI_MEAN = {
  sun: 'mặt trời', apple: 'quả táo', tiger: 'con hổ', pig: 'con heo', insect: 'côn trùng', nose: 'cái mũi',
  moon: 'mặt trăng', dog: 'con chó', goat: 'con dê', octopus: 'bạch tuộc', cat: 'con mèo', kite: 'con diều',
  egg: 'quả trứng', umbrella: 'cái ô', rabbit: 'con thỏ', hat: 'cái mũ', ball: 'quả bóng', fish: 'con cá',
  lion: 'sư tử', juice: 'nước ép', van: 'xe tải nhỏ', whale: 'cá voi', fox: 'con cáo', 'yo-yo': 'cái yo-yo',
  zebra: 'ngựa vằn', queen: 'nữ hoàng', tap: 'vòi nước', pin: 'đinh ghim', man: 'người đàn ông', map: 'bản đồ',
  dad: 'ba', kid: 'em bé', pen: 'cây bút', red: 'màu đỏ', duck: 'con vịt', run: 'chạy', kick: 'đá',
  bed: 'cái giường', bug: 'con bọ', hen: 'con gà mái', bun: 'bánh mì tròn', hug: 'ôm', fan: 'cái quạt',
  leg: 'cái chân', bell: 'cái chuông', doll: 'búp bê', kiss: 'hôn', jam: 'mứt', box: 'cái hộp', web: 'mạng nhện',
  six: 'số sáu', zip: 'khóa kéo', buzz: 'tiếng vo ve', quack: 'tiếng vịt kêu', yum: 'ngon quá', chip: 'khoai tây chiên',
  ship: 'con tàu', shop: 'cửa hàng', dish: 'cái đĩa', ring: 'chiếc nhẫn', king: 'nhà vua', bath: 'bồn tắm',
  sing: 'hát', rain: 'mưa', tree: 'cái cây', feet: 'bàn chân', sheep: 'con cừu', see: 'nhìn thấy', night: 'ban đêm',
  boat: 'con thuyền', light: 'bóng đèn', coat: 'áo khoác', zoo: 'sở thú', book: 'quyển sách', food: 'đồ ăn',
  cool: 'ngầu', car: 'xe hơi', star: 'ngôi sao', fork: 'cái nĩa', park: 'công viên', corn: 'bắp ngô', sport: 'thể thao',
  cow: 'con bò', coin: 'đồng xu', down: 'xuống', town: 'thị trấn', ear: 'cái tai', hair: 'mái tóc', letter: 'lá thư',
  hammer: 'cái búa', fair: 'hội chợ', tent: 'cái lều', hand: 'bàn tay', milk: 'sữa', jump: 'nhảy', lamp: 'cái đèn',
  chimp: 'con tinh tinh', frog: 'con ếch', stop: 'dừng lại', crab: 'con cua', flag: 'lá cờ', swim: 'bơi',
  green: 'màu xanh lá', sunset: 'hoàng hôn', lunchbox: 'hộp cơm', twist: 'xoắn', desk: 'cái bàn', sat: 'đã ngồi',
  at: 'ở', in: 'trong', it: 'nó', pot: 'cái nồi', this: 'cái này', yes: 'vâng', chop: 'chặt', rich: 'giàu',
  that: 'cái kia', thin: 'gầy', long: 'dài', tail: 'cái đuôi', high: 'cao', look: 'nhìn', turn: 'quay',
  boil: 'đun sôi', near: 'gần', sure: 'chắc chắn', belt: 'thắt lưng', trip: 'chuyến đi', wet: 'ướt',
  quiz: 'câu đố', got: 'đã có', kit: 'bộ đồ nghề', cot: 'giường cũi', rug: 'tấm thảm', neck: 'cái cổ',
  hop: 'nhảy lò cò', off: 'tắt', fit: 'vừa vặn', lot: 'nhiều', mat: 'tấm thảm', tin: 'cái lon', sit: 'ngồi',
  nap: 'ngủ trưa', pat: 'vỗ nhẹ', sap: 'nhựa cây', pats: 'vỗ nhẹ',
};

// Âm của chữ (giọng Anh–Anh) — hiện trên bảng.
const IPA = {
  a: 'æ', b: 'b', c: 'k', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'ɪ', j: 'dʒ', k: 'k', l: 'l', m: 'm',
  n: 'n', o: 'ɒ', p: 'p', q: 'kw', r: 'r', s: 's', t: 't', u: 'ʌ', v: 'v', w: 'w', x: 'ks', y: 'j', z: 'z',
  ck: 'k', ff: 'f', ll: 'l', ss: 's', zz: 'z', qu: 'kw', ch: 'tʃ', sh: 'ʃ', th: 'θ / ð', ng: 'ŋ', ai: 'eɪ',
  ee: 'iː', igh: 'aɪ', oa: 'əʊ', oo: 'uː / ʊ', ar: 'ɑː', or: 'ɔː', ur: 'ɜː', ow: 'aʊ', oi: 'ɔɪ', ear: 'ɪə',
  air: 'eə', ure: 'ʊə', er: 'ə',
};

const slide = (o) => {
  const parts = [];
  if (o.letterName) parts.push(en(o.letterName, true));
  (o.words || []).forEach((w) => {
    parts.push(en(w, true));
    if (VI_MEAN[w]) parts.push(vi(VI_MEAN[w]));
  });
  if (o.sentence) parts.push(en(o.sentence, true));
  return {
    big: o.big,
    ipa: o.ipa ? '/' + o.ipa + '/' : '',
    words: (o.words || []).map((w) => ({ word: w, pic: picOf(w) || '', vi: VI_MEAN[w] || '' })),
    sentence: o.sentence || '',
    pic: o.pic || '',
    note: o.note || null,
    say: parts,
  };
};

// Bảng chữ cái: mỗi chữ một trang — chữ thường + chữ hoa, âm, một từ có hình.
const alphabetSlides = (set) =>
  set.map((l) => slide({ big: l + '  ' + l.toUpperCase(), ipa: IPA[l], letterName: l.toUpperCase(), words: [KEY[l]] }));

// Bài ghép âm: mỗi âm mới một trang (2 từ mẫu), rồi từ khó, rồi câu.
const lessonSlides = (i, level) => {
  const l = LESSONS[i];
  const mia = level === 'mia';
  const ws = words(mia ? l.mia : l.words);
  const out = [];
  (l.sounds || []).forEach((snd) => {
    const pickEx = (list) => list.filter((w) => w.includes(snd)).sort((a, b) => !!picOf(b) - !!picOf(a)).slice(0, 2);
    let ex = pickEx(ws);
    if (!ex.length) ex = pickEx(words(l.words)); // Mia's short list may not have this sound
    if (!ex.length && KEY[snd]) ex = [KEY[snd]];
    out.push(slide({ big: snd, ipa: IPA[snd], words: ex }));
  });
  if (!(l.sounds || []).length && ws.length) {
    // cụm phụ âm, từ dài: từng cặp từ mẫu
    for (let k = 0; k < Math.min(ws.length, 6); k += 2) out.push(slide({ big: ws[k], words: ws.slice(k, k + 2) }));
  }
  const tricky = words(l.tricky).filter((w) => !mia || MIA_TRICKY.includes(w));
  if (tricky.length)
    out.push({
      big: tricky.join('  '),
      ipa: '',
      words: [],
      sentence: '',
      pic: '⭐',
      note: { vi: 'Từ khó: không ghép âm được, nhìn và nhớ cả từ.', en: 'Tricky words: look and remember the whole word.' },
      say: tricky.map((w) => en(w, true)),
    });
  (mia ? [] : l.sentences || []).slice(0, 4).forEach(([text, emoji]) => out.push(slide({ big: '', sentence: text, pic: emoji })));
  return out;
};

export const alphabetTeach = (g) => () => alphabetSlides(g);
export const phonicsTeach = (i, level) => () => lessonSlides(i, level);
