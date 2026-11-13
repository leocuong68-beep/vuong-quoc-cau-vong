import { ArrayUtils } from '../utils/ArrayUtils.js';
import {
  BODY, BUDDIES, COLORS, DAY_NIGHT, EMOTIONS, LETTERS, MIXES, OPPOSITES, OUTFITS, PETS, PET_NEEDS, RHYMES, SHAPES, TABLE_ITEMS,
  WORDS, Lines,
} from './princessLines.js';

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

const wordQuiz = (count, food = false) => () => {
  const options = sample(WORDS.filter((w) => !!w.food === food), count);
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
  const target = pickOne(WORDS.filter((w) => !w.food));
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

const img = (id, src, extra = {}) => ({ id, kind: 'img', src, ...extra });
const ANIMALS = WORDS.filter((w) => !w.food && !['car', 'tree', 'star', 'rainbow', 'tractor'].includes(w.id));

const shadowQuiz = () => {
  const options = sample(ANIMALS, 3);
  const target = pickOne(options);
  return {
    line: Lines.shadow(),
    okLine: Lines.yesShadow(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: target.src },
    choices: options.map((w) => img(w.id, w.src, { shadow: true })),
    big: true,
    answerId: target.id,
  };
};

const oddQuiz = () => {
  const kind = between(0, 3);
  let same;
  let odd;
  if (kind === 0) {
    same = sample(ANIMALS, 3).map((w) => w.src);
    odd = pickOne(['img/car1.svg', 'img/tractor1.svg', 'img/tree1.svg']);
  } else if (kind === 1) {
    same = sample(WORDS.filter((w) => w.food), 3).map((w) => w.src);
    odd = pickOne(ANIMALS).src;
  } else if (kind === 2) {
    same = sample(LETTERS, 3).map((l) => 'img/characters/' + l + '.svg');
    odd = 'img/characters/' + between(1, 9) + '.svg';
  } else {
    const [a, b] = sample(COLORS, 2);
    same = [flower(a.id), flower(a.id), flower(a.id)];
    odd = flower(b.id);
  }
  const choices = shuffled([img('odd', odd), ...same.map((src, i) => img('same' + i, src))]);
  return {
    line: Lines.odd(),
    okLine: Lines.yesOdd(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices,
    big: true,
    answerId: 'odd',
  };
};

const sizeQuiz = () => {
  const wantBiggest = Math.random() < 0.5;
  const src = pickOne([APPLE, 'img/princess/thing_whale.webp', 'img/princess/food_pear.webp', 'img/star1.svg', flower('pink')]);
  const scales = shuffled([0.4, 0.68, 1]);
  return {
    line: wantBiggest ? Lines.biggest() : Lines.smallest(),
    okLine: wantBiggest ? Lines.yesBiggest() : Lines.yesSmallest(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: scales.map((s) => img(String(s), src, { scale: s })),
    big: true,
    answerId: String(wantBiggest ? 1 : 0.4),
  };
};

const clockQuiz = () => {
  const hour = between(1, 12);
  return {
    line: Lines.whatTime(),
    okLine: Lines.yesTime(hour),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'clock', hour },
    choices: numberChoices(hour, 1, 12),
    answerId: String(hour),
  };
};

const dayNightQuiz = () => {
  const q = pickOne(DAY_NIGHT);
  return {
    line: Lines.when(q.id),
    okLine: q.answer === 'day' ? Lines.yesDay() : Lines.yesNight(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: q.src },
    choices: [img('day', 'img/princess/thing_sun.webp'), img('night', 'img/princess/thing_moon.webp')],
    big: true,
    answerId: q.answer,
  };
};

const emotionQuiz = (count) => () => {
  const options = sample(EMOTIONS, count);
  const target = pickOne(options);
  return {
    line: Lines.findFace(target.id),
    okLine: Lines.yesFace(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'chars' },
    choices: options.map((e) => img(e.id, 'img/princess/face_' + e.id + '.webp')),
    big: true,
    answerId: target.id,
  };
};

// where each part is on img/princess/mia_face.webp, in % of the picture
const BODY_SPOTS = [
  { id: 'hair', x: 50, y: 27, r: 12 },
  { id: 'hair', x: 21, y: 72, r: 7 },
  { id: 'hair', x: 79, y: 72, r: 7 },
  { id: 'eye', x: 37.4, y: 49, r: 6.5 },
  { id: 'eye', x: 63, y: 49, r: 6.5 },
  { id: 'ear', x: 24.5, y: 52, r: 5 },
  { id: 'ear', x: 76, y: 52, r: 5 },
  { id: 'nose', x: 50, y: 54.5, r: 4 },
  { id: 'cheek', x: 33.5, y: 59.5, r: 5 },
  { id: 'cheek', x: 67.5, y: 59.5, r: 5 },
  { id: 'mouth', x: 50, y: 61.5, r: 4.5 },
];

const bodyQuiz = () => {
  const target = pickOne(BODY);
  return {
    line: Lines.touch(target.id),
    okLine: Lines.yesBody(target.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'face' },
    choices: BODY_SPOTS.map((s) => ({ ...s, kind: 'spot' })),
    answerId: target.id,
  };
};

const skipQuiz = () => {
  const step = pickOne([2, 5, 10]);
  const start = step * between(1, step === 2 ? 5 : step === 5 ? 4 : 5);
  const sequence = [0, 1, 2].map((i) => start + i * step);
  const answer = start + 3 * step;
  const options = shuffled([answer, answer + step, answer - 1 > sequence[2] ? answer - 1 : answer + 1]);
  return {
    line: Lines.nextNumber(),
    okLine: Lines.yesPattern(),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'numbers', sequence: [...sequence, null] },
    choices: options.map((n) => ({ id: String(n), kind: 'text', text: String(n) })),
    answerId: String(answer),
  };
};

const bondQuiz = (max) => () => {
  const n = between(3, max);
  const a = between(1, n - 1);
  return {
    line: Lines.bond(n, a),
    okLine: Lines.addYes(a, n - a),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'numbers', sequence: [n, '=', a, '+', null] },
    choices: numberChoices(n - a, 1, max),
    answerId: String(n - a),
  };
};

const doublesQuiz = () => {
  const a = between(1, 5);
  return {
    line: Lines.add(a, a),
    okLine: Lines.addYes(a, a),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src: APPLE, groups: [a, a] },
    choices: numberChoices(a + a, 1, 10),
    answerId: String(a + a),
  };
};

const evenQuiz = () => {
  const n = between(2, 10);
  const even = n % 2 === 0;
  return {
    line: Lines.canShare(n),
    okLine: even ? Lines.yesShare() : Lines.noShare(),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src: APPLE, groups: [n] },
    choices: [
      { id: 'yes', kind: 'text', text: '✓' },
      { id: 'no', kind: 'text', text: '✗' },
    ],
    answerId: even ? 'yes' : 'no',
  };
};

const halfQuiz = () => {
  const n = 2 * between(1, 5);
  return {
    line: Lines.shareHalf(n),
    okLine: Lines.yesHalf(n),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'items', src: APPLE, groups: [n] },
    choices: numberChoices(n / 2, 1, 6),
    answerId: String(n / 2),
  };
};

const lowerQuiz = (count) => () => {
  const options = sample(LETTERS, count);
  const target = pickOne(options);
  return {
    line: Lines.lower(target),
    okLine: Lines.yesLetter(target),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: 'img/characters/' + target + '.svg' },
    choices: options.map((l) => ({ id: l, kind: 'text', text: l.toLowerCase() })),
    answerId: target,
  };
};

const oppositeQuiz = () => {
  const pair = pickOne(OPPOSITES);
  const [a, b] = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
  const others = sample(OPPOSITES.filter((p) => p !== pair && p[0].src !== b.src && p[1].src !== b.src), 2).map((p) => pickOne(p));
  return {
    line: Lines.opposite(a),
    okLine: Lines.yesOpposite(a, b),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: a.src, scale: a.scale },
    choices: shuffled([b, ...others]).map((w) => img(w.id, w.src, { scale: w.scale })),
    big: true,
    answerId: b.id,
  };
};

const rhymeQuiz = () => {
  const pair = pickOne(RHYMES);
  const [a, b] = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
  const others = sample(RHYMES.filter((p) => p !== pair), 2).map((p) => pickOne(p));
  return {
    line: Lines.rhyme(a),
    okLine: Lines.yesRhyme(a, b),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: a.src },
    choices: shuffled([b, ...others]).map((w) => img(w.id, w.src)),
    big: true,
    answerId: b.id,
  };
};

const tableQuiz = () => {
  const people = sample(['tintin', 'mommy', 'daddy'], between(1, 3));
  const item = pickOne(TABLE_ITEMS);
  const n = people.length + 1;
  return {
    line: Lines.howManyNeeded(item.id),
    okLine: Lines.yesCount(n),
    wrongLine: () => Lines.countAgain(),
    scene: {
      kind: 'people',
      people: [{ src: 'img/princess/mia_pink.webp', h: 0.74 }, ...people.map((p) => ({ src: BUDDIES[p].src, h: BUDDIES[p].height / 100 }))],
      src: item.src,
    },
    choices: numberChoices(n, 1, 5),
    answerId: String(n),
  };
};

const flowerShopQuiz = () => {
  const n = between(1, 5);
  const [color, other] = sample(COLORS, 2);
  const wrongCount = n === 1 ? 2 : pickOne([n - 1, n + 1]);
  const bunch = (id, c, count) => ({ id, kind: 'group', src: flower(c.id), count });
  return {
    line: Lines.pickFlowers(n, color.id),
    okLine: Lines.yesCount(n),
    wrongLine: () => Lines.countAgain(),
    scene: { kind: 'chars' },
    choices: shuffled([bunch('right', color, n), bunch('count', color, wrongCount), bunch('color', other, n)]),
    answerId: 'right',
  };
};

const petQuiz = () => {
  const pet = pickOne(PETS);
  const options = sample(PET_NEEDS, 3);
  const need = pickOne(options);
  return {
    line: Lines.petNeeds(pet.id, need.id),
    okLine: Lines.yesPet(need.id),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'picture', src: pet.src },
    choices: options.map((o) => img(o.id, o.src)),
    big: true,
    answerId: need.id,
  };
};

const hexOf = (id) => (id === 'white' ? '#ffffff' : COLORS.find((c) => c.id === id).hex);

const mixQuiz = () => {
  const m = pickOne(MIXES);
  const others = sample(COLORS.filter((c) => ![m.a, m.b, m.result].includes(c.id)), 2);
  const blob = (id) => ({ id, kind: 'shape', shape: 'circle', hex: hexOf(id) });
  return {
    line: Lines.mix(m.a, m.b),
    okLine: Lines.yesMix(m.result),
    wrongLine: () => Lines.tryAgain(),
    scene: { kind: 'mix', a: hexOf(m.a), b: hexOf(m.b), result: hexOf(m.result) },
    choices: shuffled([blob(m.result), ...others.map((c) => blob(c.id))]),
    answerId: m.result,
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
  // --- wave 1 of the 30 new games ---
  { id: 'memory1', area: 'world', route: '/princess/memory/1', en: 'Family pairs', vi: 'Lật thẻ gia đình', icon: icon('img/princess/tintin.webp') },
  { id: 'shadows', area: 'world', buddy: 'tintin', make: shadowQuiz, en: 'Whose shadow?', vi: 'Bóng của ai?', icon: icon('img/rabbit1.svg') },
  { id: 'odd', area: 'world', buddy: 'mommy', make: oddQuiz, en: 'Odd one out', vi: 'Cái nào khác loại?', icon: text('≠') },
  { id: 'size', area: 'world', buddy: 'daddy', make: sizeQuiz, en: 'Big and small', vi: 'To và nhỏ', icon: icon('img/princess/thing_whale.webp') },
  { id: 'emotions', area: 'world', buddy: 'mommy', make: emotionQuiz(3), en: 'Feelings', vi: 'Cảm xúc', icon: icon('img/princess/face_happy.webp') },
  { id: 'body', area: 'world', make: bodyQuiz, en: 'My face', vi: 'Khuôn mặt', icon: icon('img/princess/mia_face.webp') },
  { id: 'daynight', area: 'world', buddy: 'daddy', make: dayNightQuiz, en: 'Day and night', vi: 'Ngày và đêm', icon: icon('img/princess/thing_moon.webp') },
  { id: 'clock', area: 'world', buddy: 'tintin', make: clockQuiz, en: 'What time?', vi: 'Xem giờ', icon: text('3:00') },
  { id: 'table', area: 'world', make: tableQuiz, en: 'Set the table', vi: 'Bày bàn ăn', icon: icon('img/princess/thing_cup.webp') },
  { id: 'memory2', area: 'world', route: '/princess/memory/2', en: 'More pairs', vi: 'Lật thẻ 2', icon: icon('img/princess/daddy.webp') },
  { id: 'foods', area: 'english', buddy: 'mommy', make: wordQuiz(3, true), en: 'Fruit and veg', vi: 'Trái cây và rau', icon: icon('img/princess/food_strawberry.webp') },
  { id: 'lower', area: 'english', buddy: 'tintin', make: lowerQuiz(3), en: 'Small letters', vi: 'Chữ viết thường', icon: text('Aa') },
  { id: 'opposites', area: 'english', buddy: 'daddy', make: oppositeQuiz, en: 'Opposites', vi: 'Trái nghĩa', icon: text('↔') },
  { id: 'rhymes', area: 'english', buddy: 'mommy', make: rhymeQuiz, en: 'Rhymes', vi: 'Vần giống nhau', icon: icon('img/princess/thing_hat.webp') },
  { id: 'bubbles1', area: 'math', route: '/princess/bubbles/1', en: 'Bubbles 1–5', vi: 'Bong bóng 1–5', icon: text('○') },
  { id: 'flowershop', area: 'math', buddy: 'mommy', make: flowerShopQuiz, en: 'Flower shop', vi: 'Tiệm hoa', icon: icon(flower('orange')) },
  { id: 'doubles', area: 'math', make: doublesQuiz, en: 'Doubles', vi: 'Gấp đôi', icon: text('2+2') },
  { id: 'bubbles2', area: 'math', route: '/princess/bubbles/2', en: 'Bubbles 1–10', vi: 'Bong bóng 1–10', icon: text('○○') },
  { id: 'half', area: 'math', buddy: 'tintin', make: halfQuiz, en: 'Share apples', vi: 'Chia táo', icon: icon(APPLE) },
  { id: 'even', area: 'math', buddy: 'tintin', make: evenQuiz, en: 'Can we share?', vi: 'Chia đều được không?', icon: text('✓✗') },
  { id: 'bonds', area: 'math', buddy: 'daddy', make: bondQuiz(10), en: 'Number pairs', vi: 'Tách số', icon: text('5=2+?') },
  { id: 'skip', area: 'math', buddy: 'daddy', make: skipQuiz, en: 'Skip counting', vi: 'Đếm nhảy', icon: text('2 4 6') },
  { id: 'bubbles3', area: 'math', route: '/princess/bubbles/3', en: 'Count down', vi: 'Đếm ngược', icon: text('10→1') },
  // --- wave 2: home, garden, salon and art ---
  { id: 'hair', area: 'beauty', route: '/princess/hair', en: 'Hair salon', vi: 'Tiệm tóc', icon: icon('img/princess/hair_pigtails.webp') },
  { id: 'nails', area: 'beauty', route: '/princess/nails', en: 'Nail salon', vi: 'Sơn móng tay', icon: icon('img/princess/hand.webp') },
  { id: 'room', area: 'home', route: '/princess/room', en: "Mia's room", vi: 'Phòng của Mia', icon: icon('img/princess/thing_bed.webp') },
  { id: 'pets', area: 'home', make: petQuiz, buddy: 'tintin', en: 'Pet care', vi: 'Chăm thú cưng', icon: icon('img/princess/pet_puppy.webp') },
  { id: 'plant', area: 'home', route: '/princess/plant', en: 'Grow flowers', vi: 'Trồng hoa', icon: icon('img/princess/thing_sprout.webp') },
  { id: 'harvest', area: 'home', route: '/princess/collect/harvest', en: 'Veggie garden', vi: 'Vườn rau', icon: icon('img/princess/thing_basket.webp') },
  { id: 'bake', area: 'home', route: '/princess/collect/bake', en: 'Bake a cake', vi: 'Làm bánh với Mẹ', icon: icon('img/princess/thing_cake.webp') },
  { id: 'mix', area: 'art', make: mixQuiz, buddy: 'daddy', en: 'Mix colours', vi: 'Pha màu', icon: text('+ =') },
  { id: 'colornumber1', area: 'art', route: '/princess/colornumber/1', en: 'Colour by number', vi: 'Tô màu theo số', icon: text('1 2 3') },
  { id: 'colornumber2', area: 'art', route: '/princess/colornumber/2', en: 'Colour by number 2', vi: 'Tô màu theo số 2', icon: text('1–5') },
  { id: 'paint', area: 'art', route: '/princess/paint', en: 'Art room', vi: 'Phòng tranh', icon: text('✎') },
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

// The path page shows the stages in these groups.
export const AREAS = [
  { id: 'beauty', en: 'Dress up', vi: 'Làm đẹp', icon: 'img/princess/crown_pink.webp', hex: '#ff7eb6' },
  { id: 'math', en: 'Numbers', vi: 'Học số', icon: 'img/princess/apple.webp', hex: '#ff9f43' },
  { id: 'english', en: 'Words', vi: 'Học chữ', icon: 'img/characters/A.svg', hex: '#ffd23f' },
  { id: 'world', en: 'My world', vi: 'Quanh bé', icon: 'img/princess/thing_sun.webp', hex: '#4aa8ff' },
  { id: 'home', en: 'Home and garden', vi: 'Nhà và vườn', icon: 'img/princess/thing_sprout.webp', hex: '#5fd38d' },
  { id: 'art', en: 'Art', vi: 'Vẽ và tô màu', icon: 'img/princess/flower_purple.webp', hex: '#a77bff' },
];

// The games that came with edukiz, shown as the last group on the home page.
export const MORE_GAMES = [
  { id: 'memory', route: '/memory', en: 'Memory', vi: 'Lật hình', src: 'img/games/MemoryBackface.png' },
  { id: 'dragdrop', route: '/dragdrop', en: 'Drag and drop', vi: 'Kéo thả', src: 'img/games/DD.png' },
  { id: 'misc', route: '/misc', en: 'Number games', vi: 'Trò chơi số', src: 'img/games/Calculate.png' },
];

export const areaOf = (stage) => {
  if (stage.area) return stage.area;
  if (/^(dress|makeup|outfit)/.test(stage.id)) return 'beauty';
  if (/^(letters|words|first)/.test(stage.id)) return 'english';
  if (/^(shapes|flowers|pattern)/.test(stage.id)) return 'world';
  return 'math';
};

export const clockSvg = (hour) => {
  let marks = '';
  for (let h = 1; h <= 12; h++) {
    const a = (h * 30 * Math.PI) / 180;
    marks += '<text x="' + (50 + 37 * Math.sin(a)).toFixed(1) + '" y="' + (53.5 - 37 * Math.cos(a)).toFixed(1) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#4a2a57" stroke="none">' + h + '</text>';
  }
  const a = (hour * 30 * Math.PI) / 180;
  return (
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a57" stroke-linecap="round">' +
    '<circle cx="50" cy="50" r="47" fill="#fffaf2" stroke-width="4"/>' + marks +
    '<line x1="50" y1="50" x2="50" y2="14" stroke-width="3"/>' +
    '<line x1="50" y1="50" x2="' + (50 + 22 * Math.sin(a)).toFixed(1) + '" y2="' + (50 - 22 * Math.cos(a)).toFixed(1) + '" stroke-width="5" stroke="#ff5a5f"/>' +
    '<circle cx="50" cy="50" r="3.5" fill="#4a2a57"/></svg>'
  );
};
