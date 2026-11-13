import { ArrayUtils } from '../utils/ArrayUtils.js';
import { COLORS, SHAPES, LETTERS, OUTFITS, WORDS, Lines } from './princessLines.js';

// The learning path, easiest first. `buddy` is the family member who plays along
// (Pony when not set; stages whose sentences name Pony keep Pony).
// A stage is either one of the two hand-made games
// (route) or a quiz built by `make()`, which returns one question:
//   { line, okLine, wrongLine(choice), scene, choices: [{ id, kind, ... }], answerId }

const between = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const shuffled = (array) => ArrayUtils.shuffleArray(array.slice());
const sample = (array, n) => shuffled(array).slice(0, n);
const pickOne = (array) => array[Math.floor(Math.random() * array.length)];

const numberChoices = (answer, min, max, count = 3) => {
  const others = [];
  for (let n = min; n <= max; n++) if (n !== answer) others.push(n);
  const near = others.filter((n) => Math.abs(n - answer) <= 3);
  const pool = near.length >= count - 1 ? near : others;
  return shuffled([answer, ...sample(pool, count - 1)]).map((n) => ({
    id: String(n),
    kind: 'text',
    text: String(n),
  }));
};

const flower = (color) => 'img/princess/flower_' + color + '.webp';
const APPLE = 'img/princess/apple.webp';

const shapesQuiz = () => {
  const shapes = sample(SHAPES, 3);
  const colors = sample(COLORS, 3);
  const target = pickOne(shapes);
  return {
    line: Lines.findShape(target.id),
    okLine: Lines.yesShape(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: shapes.map((s, i) => ({ id: s.id, kind: 'shape', shape: s.id, hex: colors[i].hex })),
    answerId: target.id,
  };
};

const numberQuiz = (min, max, count) => () => {
  const target = between(min, max);
  return {
    line: Lines.findNumber(target),
    okLine: Lines.yesNumber(target),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: numberChoices(target, min, max, count),
    answerId: String(target),
  };
};

const flowerQuiz = (count) => () => {
  const colors = sample(COLORS, count);
  const target = pickOne(colors);
  return {
    line: Lines.findFlower(target.id),
    okLine: Lines.yesColor(target.id),
    wrongLine: (choice) => Lines.thatIs(choice.id),
    scene: { kind: 'chars' },
    choices: colors.map((c) => ({ id: c.id, kind: 'img', src: flower(c.id) })),
    answerId: target.id,
  };
};

const countQuiz = (min, max, item) => () => {
  const n = between(min, max);
  const src = item === 'apple' ? APPLE : flower(pickOne(COLORS).id);
  return {
    line: Lines.howMany(item),
    okLine: Lines.yesCount(n),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src, groups: [n] },
    choices: numberChoices(n, Math.max(1, min - 1), Math.min(20, max + 1)),
    answerId: String(n),
  };
};

const compareQuiz = (wantMore) => () => {
  const left = between(1, 6);
  let right = between(1, 6);
  while (right === left) right = between(1, 6);
  const leftWins = wantMore ? left > right : left < right;
  return {
    line: wantMore ? Lines.more() : Lines.fewer(),
    okLine: wantMore ? Lines.yesMore() : Lines.yesFewer(),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'chars' },
    choices: [
      { id: 'left', kind: 'group', src: APPLE, count: left },
      { id: 'right', kind: 'group', src: APPLE, count: right },
    ],
    answerId: leftWins ? 'left' : 'right',
  };
};

const PATTERN_UNITS = [
  [0, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 1, 2],
];

const patternQuiz = () => {
  const unit = pickOne(PATTERN_UNITS);
  const colors = sample(COLORS, 4); // up to 3 used by the pattern, 1 spare as a wrong answer
  const length = unit.length === 2 ? 5 : 6;
  const sequence = [];
  for (let i = 0; i < length; i++) sequence.push(colors[unit[i % unit.length]].id);
  const answer = colors[unit[length % unit.length]].id;
  const used = [...new Set(unit)].map((i) => colors[i].id);
  const options = used.length >= 3 ? used : [...used, colors[3].id];
  return {
    line: Lines.pattern(),
    okLine: Lines.yesPattern(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'pattern', sequence: sequence.map(flower) },
    choices: shuffled(options).map((c) => ({ id: c, kind: 'img', src: flower(c) })),
    answerId: answer,
  };
};

const addQuiz = (maxSum, maxA = 5, maxB = 4) => () => {
  const a = between(1, Math.min(maxA, maxSum - 1));
  const b = between(1, Math.min(maxB, maxSum - a));
  return {
    line: Lines.add(a, b),
    okLine: Lines.addYes(a, b),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src: APPLE, groups: [a, b] },
    choices: numberChoices(a + b, 1, Math.max(maxSum, 5)),
    answerId: String(a + b),
  };
};

const subQuiz = (maxA = 5) => () => {
  const a = between(2, maxA);
  const b = between(1, a - 1);
  return {
    line: Lines.sub(a, b),
    okLine: Lines.subYes(a, b),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src: APPLE, groups: [a], eaten: b },
    choices: numberChoices(a - b, 1, maxA),
    answerId: String(a - b),
  };
};

const letterQuiz = (letters, count) => () => {
  const options = sample(letters, count);
  const target = pickOne(options);
  return {
    line: Lines.findLetter(target),
    okLine: Lines.yesLetter(target),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: options.map((l) => ({ id: l, kind: 'img', src: 'img/characters/' + l + '.svg' })),
    answerId: target,
  };
};

const wordQuiz = (count) => () => {
  const options = sample(WORDS, count);
  const target = pickOne(options);
  return {
    line: Lines.findWord(target.id),
    okLine: Lines.yesWord(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: options.map((w) => ({ id: w.id, kind: 'img', src: w.src })),
    answerId: target.id,
  };
};

const firstLetterQuiz = (count) => () => {
  const target = pickOne(WORDS);
  const letter = target.id.charAt(0).toUpperCase();
  const others = sample(LETTERS.filter((l) => l !== letter), count - 1);
  return {
    line: Lines.firstLetter(target.id),
    okLine: Lines.yesFirst(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: target.src },
    choices: shuffled([letter, ...others]).map((l) => ({ id: l, kind: 'img', src: 'img/characters/' + l + '.svg' })),
    answerId: letter,
  };
};

const outfitSrc = (id) => 'img/princess/mia_outfit_' + id + '.webp';

const outfitQuiz = (count) => () => {
  const options = sample(OUTFITS, count);
  const target = pickOne(options);
  return {
    line: Lines.findOutfit(target.id),
    okLine: Lines.yesOutfit(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    miaAfter: outfitSrc(target.id),
    choices: options.map((o) => ({ id: o.id, kind: 'img', src: outfitSrc(o.id) })),
    answerId: target.id,
  };
};

const missingQuiz = (max) => () => {
  const start = between(1, max - 3);
  const hidden = between(0, 3);
  const sequence = [0, 1, 2, 3].map((i) => (i === hidden ? null : start + i));
  return {
    line: Lines.missing(),
    okLine: Lines.yesNumber(start + hidden),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'numbers', sequence },
    choices: numberChoices(start + hidden, 1, max),
    answerId: String(start + hidden),
  };
};

const compareNumbersQuiz = (max, count, wantBigger) => () => {
  const numbers = [];
  while (numbers.length < count) {
    const n = between(1, max);
    if (!numbers.includes(n)) numbers.push(n);
  }
  const answer = wantBigger ? Math.max(...numbers) : Math.min(...numbers);
  return {
    line: wantBigger ? Lines.bigger() : Lines.smaller(),
    okLine: wantBigger ? Lines.yesBigger() : Lines.yesSmaller(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: numbers.map((n) => ({ id: String(n), kind: 'text', text: String(n) })),
    answerId: String(answer),
  };
};

const icon = (src) => ({ src });
const text = (value) => ({ text: value });

export const STAGES = [
  { id: 'dress1', route: '/princess/dress/1', en: 'Colours', vi: 'Màu sắc', icon: icon('img/princess/mia_pink.webp') },
  { id: 'feed1', route: '/princess/feed/1', en: 'Count to 4', vi: 'Đếm đến 4', icon: icon(APPLE) },
  { id: 'shapes', buddy: 'tintin', make: shapesQuiz, en: 'Shapes', vi: 'Hình khối', icon: { shape: 'star', hex: '#ffd23f' } },
  { id: 'numbers1', buddy: 'mommy', make: numberQuiz(1, 5, 3), en: 'Numbers 1–5', vi: 'Số 1–5', icon: text('3') },
  { id: 'flowers', buddy: 'daddy', make: flowerQuiz(4), en: 'Flower colours', vi: 'Màu hoa', icon: icon(flower('purple')) },
  { id: 'count1', buddy: 'tintin', make: countQuiz(1, 5, 'apple'), en: 'How many?', vi: 'Có mấy?', icon: text('?') },
  { id: 'makeup1', route: '/princess/makeup/1', en: 'Makeup', vi: 'Trang điểm', icon: icon('img/princess/mia_face.webp') },
  { id: 'feed2', route: '/princess/feed/2', en: 'Count to 6', vi: 'Đếm đến 6', icon: icon(APPLE) },
  { id: 'more', buddy: 'mommy', make: compareQuiz(true), en: 'More', vi: 'Nhiều hơn', icon: text('>') },
  { id: 'words1', buddy: 'daddy', make: wordQuiz(3), en: 'Animals & things', vi: 'Con vật, đồ vật', icon: icon('img/cat1.png') },
  { id: 'dress2', route: '/princess/dress/2', en: 'More colours', vi: 'Thêm màu', icon: icon('img/princess/crown_yellow.webp') },
  { id: 'numbers2', buddy: 'daddy', make: numberQuiz(6, 10, 4), en: 'Numbers 6–10', vi: 'Số 6–10', icon: text('8') },
  { id: 'fewer', buddy: 'tintin', make: compareQuiz(false), en: 'Fewer', vi: 'Ít hơn', icon: text('<') },
  { id: 'outfit1', buddy: 'mommy', make: outfitQuiz(3), en: 'What to wear', vi: 'Mặc gì đây', icon: icon('img/princess/mia_outfit_rain.webp') },
  { id: 'pattern', buddy: 'mommy', make: patternQuiz, en: 'Patterns', vi: 'Quy luật', icon: icon(flower('red')) },
  { id: 'count2', buddy: 'daddy', make: countQuiz(5, 10, 'flower'), en: 'Count to 10', vi: 'Đếm đến 10', icon: text('10') },
  { id: 'letters1', buddy: 'tintin', make: letterQuiz(LETTERS.slice(0, 9), 3), en: 'Letters A–I', vi: 'Chữ A–I', icon: icon('img/characters/A.svg') },
  { id: 'add1', make: addQuiz(5), en: 'Add to 5', vi: 'Cộng đến 5', icon: text('+') },
  { id: 'missing1', buddy: 'tintin', make: missingQuiz(10), en: 'Missing number', vi: 'Số còn thiếu', icon: text('1 ? 3') },
  { id: 'feed3', route: '/princess/feed/3', en: 'Count to 10', vi: 'Cho ăn đến 10', icon: icon(APPLE) },
  { id: 'letters2', buddy: 'mommy', make: letterQuiz(LETTERS.slice(9, 18), 4), en: 'Letters J–R', vi: 'Chữ J–R', icon: icon('img/characters/M.svg') },
  { id: 'sub1', make: subQuiz(5), en: 'Take away', vi: 'Phép trừ', icon: text('−') },
  { id: 'makeup2', route: '/princess/makeup/2', en: 'More makeup', vi: 'Trang điểm 2', icon: icon('img/princess/mia_face.webp') },
  { id: 'bigger1', buddy: 'daddy', make: compareNumbersQuiz(10, 2, true), en: 'Bigger number', vi: 'Số lớn hơn', icon: text('5>2') },
  { id: 'words2', buddy: 'tintin', make: wordQuiz(4), en: 'More words', vi: 'Thêm từ mới', icon: icon('img/rabbit1.svg') },
  { id: 'dress3', route: '/princess/dress/3', en: 'Royal party', vi: 'Dạ tiệc', icon: icon('img/princess/bow_red.webp') },
  { id: 'add2', make: addQuiz(9), en: 'Add to 9', vi: 'Cộng đến 9', icon: text('9') },
  { id: 'letters3', buddy: 'daddy', make: letterQuiz(LETTERS.slice(18), 4), en: 'Letters S–Z', vi: 'Chữ S–Z', icon: icon('img/characters/Z.svg') },
  { id: 'first1', buddy: 'mommy', make: firstLetterQuiz(3), en: 'First letter', vi: 'Chữ cái đầu', icon: icon('img/characters/C.svg') },
  { id: 'smaller1', buddy: 'tintin', make: compareNumbersQuiz(10, 3, false), en: 'Smaller number', vi: 'Số nhỏ hơn', icon: text('2<5') },
  { id: 'numbers3', buddy: 'daddy', make: numberQuiz(11, 20, 4), en: 'Numbers 11–20', vi: 'Số 11–20', icon: text('15') },
  { id: 'outfit2', buddy: 'mommy', make: outfitQuiz(5), en: 'Dress for the day', vi: 'Chọn đồ đi chơi', icon: icon('img/princess/mia_outfit_winter.webp') },
  { id: 'count3', buddy: 'tintin', make: countQuiz(11, 20, 'flower'), en: 'Count to 20', vi: 'Đếm đến 20', icon: text('20') },
  { id: 'add3', make: addQuiz(10, 9, 9), en: 'Add to 10', vi: 'Cộng đến 10', icon: text('+10') },
  { id: 'sub2', make: subQuiz(10), en: 'Take away to 10', vi: 'Trừ trong 10', icon: text('−10') },
  { id: 'missing2', buddy: 'daddy', make: missingQuiz(20), en: 'Missing to 20', vi: 'Số thiếu đến 20', icon: text('?') },
  { id: 'bigger2', buddy: 'mommy', make: compareNumbersQuiz(20, 3, true), en: 'Biggest of three', vi: 'Số lớn nhất', icon: text('>') },
  { id: 'first2', buddy: 'tintin', make: firstLetterQuiz(4), en: 'First letter 2', vi: 'Chữ cái đầu 2', icon: icon('img/characters/R.svg') },
  { id: 'makeup3', route: '/princess/makeup/3', en: 'Party makeup', vi: 'Trang điểm dự tiệc', icon: icon('img/princess/mia_face.webp') },
];

export const stageById = (id) => STAGES.find((s) => s.id === id);
export const stageRoute = (stage) => stage.route || '/princess/stage/' + stage.id;

const SHAPE_PATHS = {
  circle: '<circle cx="50" cy="50" r="40"/>',
  square: '<rect x="12" y="12" width="76" height="76" rx="6"/>',
  triangle: '<polygon points="50,10 92,88 8,88"/>',
  star: '<polygon points="50,6 61,38 95,38 67,58 78,91 50,71 22,91 33,58 5,38 39,38"/>',
  heart:
    '<path d="M50 88 C10 58 6 34 22 20 C34 10 46 16 50 28 C54 16 66 10 78 20 C94 34 90 58 50 88Z"/>',
};

export const shapeSvg = (shape, hex) =>
  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="' +
  hex +
  '" stroke="#4a2a57" stroke-width="4" stroke-linejoin="round">' +
  SHAPE_PATHS[shape] +
  '</svg>';
